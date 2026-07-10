import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { streamChatCompletion } from "./services/grok";
import { classifyIntent, enrichWithPubChem } from "./services/intent-router";
import {
  searchCompound,
  getCompoundSynonyms,
  get3DSDF,
  getAutocompleteSuggestions,
  searchCompounds,
  getCompoundTitle,
} from "./services/pubchem";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ─── Chat API Route (SSE Streaming) ──────────────────────────
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { messages } = req.body as {
      messages: { role: "user" | "assistant"; content: string }[];
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Messages array is required" });
      return;
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      res.status(400).json({ error: "Last message must be from user" });
      return;
    }

    const sanitizedContent = lastMessage.content.trim().slice(0, 10000);

    // 1. Classify Intent
    const intent = classifyIntent(sanitizedContent);

    // 2. PubChem Enrichment
    let pubchemContext = "";
    let compoundData: Record<string, unknown> | null = null;

    if (intent.toolsRequired.includes("pubchem") && intent.entities.compound) {
      try {
        const enrichment = await enrichWithPubChem(intent.entities.compound);
        if (enrichment.compound) {
          pubchemContext = enrichment.context;
          compoundData = enrichment.compound as unknown as Record<string, unknown>;
        }
      } catch (err) {
        // Best-effort
      }
    }

    // 3. Build Enriched Message List
    const enrichedMessages = messages.map((msg, idx) => {
      if (idx === messages.length - 1 && pubchemContext) {
        return {
          role: msg.role as "user" | "assistant" | "system",
          content: `${msg.content}\n\n${pubchemContext}`,
        };
      }
      return { role: msg.role as "user" | "assistant" | "system", content: msg.content };
    });

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Intent", intent.intent);

    // Send compound metadata if available
    if (compoundData) {
      const metaEvent = JSON.stringify({
        type: "molecule",
        content: "",
        metadata: compoundData,
      });
      res.write(`data: ${metaEvent}\n\n`);
    }

    // 4. Call Grok Stream
    const stream = await streamChatCompletion(enrichedMessages);
    const reader = stream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    } finally {
      reader.releaseLock();
      res.end();
    }
  } catch (error) {
    console.error("Chat route error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";

    if (!res.headersSent) {
      if (message.includes("API key") || message.includes("XAI_API_KEY")) {
        res.status(503).json({ error: "AI service not configured. Please set XAI_API_KEY." });
      } else {
        res.status(500).json({ error: message });
      }
    } else {
      // If headers are already sent, send the error as an SSE event and close
      res.write(`data: ${JSON.stringify({ type: "error", content: message })}\n\n`);
      res.end();
    }
  }
});

// ─── PubChem API Proxy Route ──────────────────────────────────
app.get("/api/pubchem", async (req: Request, res: Response) => {
  const action = req.query.action as string;
  const query = req.query.q as string;
  const searchType = (req.query.type as string) ?? "name";
  const cid = req.query.cid as string;

  try {
    switch (action) {
      case "search": {
        if (!query) {
          res.status(400).json({ error: "Query parameter 'q' is required" });
          return;
        }
        const compound = await searchCompound(
          query,
          searchType as "name" | "formula" | "smiles" | "inchi" | "cid"
        );
        res.json({ success: true, data: compound });
        break;
      }

      case "search-multiple": {
        if (!query) {
          res.status(400).json({ error: "Query parameter 'q' is required" });
          return;
        }
        const compounds = await searchCompounds(query);
        res.json({ success: true, data: compounds });
        break;
      }

      case "synonyms": {
        if (!cid) {
          res.status(400).json({ error: "Parameter 'cid' is required" });
          return;
        }
        const synonyms = await getCompoundSynonyms(parseInt(cid));
        res.json({ success: true, data: synonyms });
        break;
      }

      case "sdf3d": {
        if (!cid) {
          res.status(400).json({ error: "Parameter 'cid' is required" });
          return;
        }
        const sdf = await get3DSDF(parseInt(cid));
        if (!sdf) {
          res.status(404).json({ error: "3D structure not available" });
          return;
        }
        res.setHeader("Content-Type", "chemical/x-mdl-sdfile");
        res.send(sdf);
        break;
      }

      case "autocomplete": {
        if (!query) {
          res.json({ data: [] });
          return;
        }
        const suggestions = await getAutocompleteSuggestions(query);
        res.json({ success: true, data: suggestions });
        break;
      }

      case "title": {
        if (!cid) {
          res.status(400).json({ error: "Parameter 'cid' is required" });
          return;
        }
        const title = await getCompoundTitle(parseInt(cid));
        res.json({ success: true, data: title });
        break;
      }

      default:
        res.status(400).json({
          error: "Invalid action. Use: search, search-multiple, synonyms, sdf3d, autocomplete, title",
        });
    }
  } catch (error) {
    console.error("PubChem route error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`[ChemGPT Backend] Running on http://localhost:${PORT}`);
});
