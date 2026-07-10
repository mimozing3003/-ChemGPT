/**
 * Grok AI Service
 * Handles communication with xAI's Grok API using OpenAI-compatible SDK
 */
import OpenAI from "openai";
import { GROK_BASE_URL, GROK_MODEL, GROK_MAX_TOKENS, GROK_TEMPERATURE } from "../lib/constants";

const CHEMISTRY_SYSTEM_PROMPT = `You are ChemGPT, a world-class AI chemistry assistant. You are knowledgeable across all branches of chemistry: general, organic, inorganic, physical, analytical, biochemistry, medicinal, environmental, polymer, quantum, and computational chemistry.

RESPONSE GUIDELINES:
1. Always provide scientifically accurate information. If uncertain, explicitly state your uncertainty.
2. When discussing a compound, include: chemical formula, IUPAC name, molecular weight, structure info, and key properties when relevant.
3. Use proper chemical notation: subscripts for formulas (H₂O, CO₂), superscripts for charges (Na⁺, Cl⁻).
4. For mathematical expressions, use LaTeX notation: $inline$ or $$block$$ equations.
5. Structure your responses clearly with headers, bullet points, and organized sections.
6. Adapt your explanation level to the question complexity.
7. When a question involves a specific compound, mention its CID for PubChem reference.
8. Include safety information for hazardous substances.
9. Provide balanced chemical equations when discussing reactions.
10. Explain hybridization, geometry, and bonding when relevant to molecular structure questions.

FORMAT:
- Use **bold** for key terms and compound names.
- Use \`code\` for SMILES, InChI, and other notation strings.
- Use tables for comparing properties.
- Use numbered lists for step-by-step procedures.
- Use LaTeX for mathematical equations and chemical equations.

IMPORTANT: You are an educational assistant. Always prefer authoritative chemistry sources. Never fabricate data.`;

/**
 * Create a client instance (auto-detects Groq vs xAI API key)
 */
function getAIClientConfig(): { client: OpenAI; model: string } {
  const apiKey = process.env.XAI_API_KEY || process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("XAI_API_KEY environment variable is not set");
  }

  const isGroq = apiKey.startsWith("gsk_");
  const baseURL = isGroq ? "https://api.groq.com/openai/v1" : GROK_BASE_URL;
  const model = isGroq ? "llama-3.3-70b-versatile" : GROK_MODEL;

  const client = new OpenAI({
    apiKey,
    baseURL,
    timeout: 60000,
    maxRetries: 3,
  });

  return { client, model };
}

/**
 * Generate a streaming chat completion
 */
export async function streamChatCompletion(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    onChunk?: (chunk: string) => void;
  }
): Promise<ReadableStream<Uint8Array>> {
  const { client, model } = getAIClientConfig();

  const fullMessages = [
    { role: "system" as const, content: CHEMISTRY_SYSTEM_PROMPT },
    ...messages,
  ];

  const stream = await client.chat.completions.create({
    model,
    messages: fullMessages,
    temperature: options?.temperature ?? GROK_TEMPERATURE,
    max_tokens: options?.maxTokens ?? GROK_MAX_TOKENS,
    stream: true,
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            // SSE format
            const data = JSON.stringify({ type: "text", content });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));

            if (options?.onChunk) {
              options.onChunk(content);
            }
          }
        }
        // Signal completion
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done", content: "" })}\n\n`)
        );
        controller.close();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", content: errorMessage })}\n\n`
          )
        );
        controller.close();
      }
    },
  });
}

/**
 * Non-streaming completion (for internal use)
 */
export async function getChatCompletion(
  messages: { role: "user" | "assistant" | "system"; content: string }[]
): Promise<string> {
  const { client, model } = getAIClientConfig();

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: CHEMISTRY_SYSTEM_PROMPT },
      ...messages,
    ],
    temperature: GROK_TEMPERATURE,
    max_tokens: GROK_MAX_TOKENS,
  });

  return response.choices[0]?.message?.content ?? "";
}
