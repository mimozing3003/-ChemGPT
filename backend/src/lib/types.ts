/**
 * Core TypeScript types for ChemGPT Backend
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  moleculeData?: PubChemCompound;
  sources?: string[];
  intent?: UserIntent;
  isStreaming?: boolean;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  bookmarked?: boolean;
}

export type UserIntent =
  | "compound_search"
  | "equation_balance"
  | "concept_explanation"
  | "reaction_prediction"
  | "calculation"
  | "quiz_generation"
  | "general_chemistry"
  | "organic_chemistry"
  | "inorganic_chemistry"
  | "physical_chemistry"
  | "biochemistry"
  | "safety_info"
  | "homework_help"
  | "unknown";

export interface IntentResult {
  intent: UserIntent;
  confidence: number;
  entities: Record<string, string>;
  toolsRequired: string[];
}

export interface PubChemCompound {
  CID: number;
  MolecularFormula?: string;
  MolecularWeight?: number;
  CanonicalSMILES?: string;
  IsomericSMILES?: string;
  InChI?: string;
  InChIKey?: string;
  IUPACName?: string;
  Title?: string;
  XLogP?: number;
  ExactMass?: number;
  MonoisotopicMass?: number;
  TPSA?: number;
  Complexity?: number;
  HBondDonorCount?: number;
  HBondAcceptorCount?: number;
  RotatableBondCount?: number;
  HeavyAtomCount?: number;
  AtomStereoCount?: number;
  BondStereoCount?: number;
  CovalentUnitCount?: number;
  Volume3D?: number;
}

export interface PubChemSearchResult {
  compounds: PubChemCompound[];
  totalCount: number;
}

export interface PubChemSynonyms {
  CID: number;
  synonyms: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface StreamChunk {
  type: "text" | "molecule" | "error" | "done";
  content: string;
  metadata?: Record<string, unknown>;
}
