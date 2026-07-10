/**
 * Intent Router
 * Classifies user intent and determines which tools to call before sending to LLM
 */
import type { IntentResult, PubChemCompound } from "../lib/types";
import { searchCompound } from "./pubchem";

// Common compound names and chemical terms for intent detection
const COMPOUND_PATTERNS = [
  /\b(what|tell|show|find|search|look\s*up|info|about|describe|properties|structure)\b.*\b(of|for|about)\b/i,
  /\b(molecule|compound|chemical|substance|drug|element)\b/i,
  /\b(smiles|inchi|iupac|cas|cid|formula)\b.*\b(of|for)\b/i,
  /\bCID\s*\d+/i,
];

const REACTION_PATTERNS = [
  /\b(react|reaction|mechanism|product|yield|synthesis|equation|balance)\b/i,
  /\b(oxidation|reduction|redox|combustion|neutralization|acid.base|substitution|elimination|addition)\b/i,
  /→|->|⟶|produces|forms/i,
];

const EQUATION_PATTERNS = [
  /\bbalance\b/i,
  /\b(equation|stoichiometry|coefficient)\b/i,
];

const CALCULATION_PATTERNS = [
  /\b(calculate|compute|find|determine|solve)\b.*\b(molar|mass|concentration|molarity|pH|pOH|density|volume|pressure)\b/i,
  /\b(how\s+(much|many)|what\s+is\s+the\s+(mass|weight|volume|concentration))\b/i,
];

const SAFETY_PATTERNS = [
  /\b(safety|hazard|danger|toxic|flammable|corrosive|ghs|msds|sds|precaution|storage)\b/i,
];

const QUIZ_PATTERNS = [
  /\b(quiz|test|question|practice|exercise|exam)\b/i,
];

const CONCEPT_KEYWORDS = [
  "explain", "what is", "what are", "how does", "why does", "define",
  "difference between", "compare", "describe", "concept", "theory",
  "principle", "law", "rule", "hybridization", "geometry", "bonding",
  "orbital", "electron", "valence", "lewis", "vsepr",
];

/**
 * Classify user intent from message text
 */
export function classifyIntent(message: string): IntentResult {
  const lowerMsg = message.toLowerCase().trim();
  const result: IntentResult = {
    intent: "general_chemistry",
    confidence: 0.5,
    entities: {},
    toolsRequired: [],
  };

  // Check for compound search patterns
  const isCompoundSearch = COMPOUND_PATTERNS.some((p) => p.test(message));
  const hasChemicalName = extractCompoundName(message);

  if (isCompoundSearch || (hasChemicalName && lowerMsg.length < 100)) {
    result.intent = "compound_search";
    result.confidence = isCompoundSearch ? 0.9 : 0.7;
    result.toolsRequired = ["pubchem"];
    if (hasChemicalName) {
      result.entities.compound = hasChemicalName;
    }
    return result;
  }

  // Equation balancing
  if (EQUATION_PATTERNS.some((p) => p.test(message))) {
    result.intent = "equation_balance";
    result.confidence = 0.85;
    result.toolsRequired = ["grok"];
    return result;
  }

  // Reactions
  if (REACTION_PATTERNS.some((p) => p.test(message))) {
    result.intent = "reaction_prediction";
    result.confidence = 0.8;
    result.toolsRequired = ["grok"];
    return result;
  }

  // Calculations
  if (CALCULATION_PATTERNS.some((p) => p.test(message))) {
    result.intent = "calculation";
    result.confidence = 0.85;
    result.toolsRequired = ["grok"];
    return result;
  }

  // Safety
  if (SAFETY_PATTERNS.some((p) => p.test(message))) {
    result.intent = "safety_info";
    result.confidence = 0.85;
    result.toolsRequired = ["pubchem", "grok"];
    if (hasChemicalName) {
      result.entities.compound = hasChemicalName;
    }
    return result;
  }

  // Quiz
  if (QUIZ_PATTERNS.some((p) => p.test(message))) {
    result.intent = "quiz_generation";
    result.confidence = 0.8;
    result.toolsRequired = ["grok"];
    return result;
  }

  // Concept explanation
  if (CONCEPT_KEYWORDS.some((kw) => lowerMsg.includes(kw))) {
    result.intent = "concept_explanation";
    result.confidence = 0.75;
    result.toolsRequired = ["grok"];

    // Check if compound data would help
    if (hasChemicalName) {
      result.toolsRequired.push("pubchem");
      result.entities.compound = hasChemicalName;
    }
    return result;
  }

  // Organic chemistry detection
  if (/\b(organic|alkane|alkene|alkyne|benzene|aromatic|functional\s+group|isomer|stereochemistry|chirality|enantiomer)\b/i.test(message)) {
    result.intent = "organic_chemistry";
    result.confidence = 0.7;
    result.toolsRequired = ["grok"];
    return result;
  }

  // Default: general chemistry question
  result.intent = "general_chemistry";
  result.confidence = 0.5;
  result.toolsRequired = ["grok"];

  // Always try to enrich with PubChem data if compound detected
  if (hasChemicalName) {
    result.toolsRequired.push("pubchem");
    result.entities.compound = hasChemicalName;
  }

  return result;
}

/**
 * Extract a potential compound name from user message
 */
function extractCompoundName(message: string): string | null {
  // Common well-known compounds
  const knownCompounds = [
    "water", "ethanol", "methanol", "acetone", "benzene", "toluene",
    "aspirin", "caffeine", "glucose", "sucrose", "ammonia", "methane",
    "ethane", "propane", "butane", "pentane", "hexane", "acetic acid",
    "sulfuric acid", "hydrochloric acid", "nitric acid", "phosphoric acid",
    "sodium hydroxide", "potassium hydroxide", "sodium chloride",
    "carbon dioxide", "carbon monoxide", "hydrogen peroxide", "oxygen",
    "nitrogen", "chlorine", "fluorine", "ibuprofen", "paracetamol",
    "acetaminophen", "penicillin", "insulin", "cholesterol", "dopamine",
    "serotonin", "adrenaline", "ATP", "DNA", "RNA", "nicotine", "morphine",
    "codeine", "fentanyl", "lysergic acid", "glycine", "alanine",
  ];

  const lowerMsg = message.toLowerCase();

  for (const compound of knownCompounds) {
    if (lowerMsg.includes(compound)) {
      return compound;
    }
  }

  // Check for chemical formulas like H2O, NaCl, C6H12O6
  const formulaMatch = message.match(/\b([A-Z][a-z]?(?:\d+)?(?:[A-Z][a-z]?(?:\d+)?)*)\b/);
  if (formulaMatch && /[A-Z].*\d/.test(formulaMatch[1]) && formulaMatch[1].length >= 3) {
    return formulaMatch[1];
  }

  // CID pattern
  const cidMatch = message.match(/\bCID\s*(\d+)/i);
  if (cidMatch) {
    return cidMatch[1]; // return just the number
  }

  return null;
}

/**
 * Enrich the user message with PubChem data before sending to LLM
 */
export async function enrichWithPubChem(
  compoundName: string
): Promise<{ compound: PubChemCompound | null; context: string }> {
  try {
    // Detect if it's a CID
    const isCid = /^\d+$/.test(compoundName);
    const compound = await searchCompound(
      compoundName,
      isCid ? "cid" : "name"
    );

    if (!compound) {
      return { compound: null, context: "" };
    }

    const context = `
[VERIFIED PUBCHEM DATA for CID ${compound.CID}]
- Molecular Formula: ${compound.MolecularFormula ?? "N/A"}
- Molecular Weight: ${compound.MolecularWeight ?? "N/A"} g/mol
- IUPAC Name: ${compound.IUPACName ?? "N/A"}
- Canonical SMILES: ${compound.CanonicalSMILES ?? "N/A"}
- InChI: ${compound.InChI ?? "N/A"}
- XLogP: ${compound.XLogP ?? "N/A"}
- Exact Mass: ${compound.ExactMass ?? "N/A"}
- TPSA: ${compound.TPSA ?? "N/A"} Å²
- H-Bond Donors: ${compound.HBondDonorCount ?? "N/A"}
- H-Bond Acceptors: ${compound.HBondAcceptorCount ?? "N/A"}
- Rotatable Bonds: ${compound.RotatableBondCount ?? "N/A"}
- Heavy Atom Count: ${compound.HeavyAtomCount ?? "N/A"}
- Complexity: ${compound.Complexity ?? "N/A"}
[Use this verified data in your response. Reference PubChem CID ${compound.CID}.]`;

    return { compound, context };
  } catch {
    return { compound: null, context: "" };
  }
}
