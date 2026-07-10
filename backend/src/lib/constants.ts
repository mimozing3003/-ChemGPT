/**
 * Backend constants
 */

export const PUBCHEM_BASE_URL = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
export const PUBCHEM_VIEW_URL = "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view";
export const PUBCHEM_COMPOUND_URL = "https://pubchem.ncbi.nlm.nih.gov/compound";

export const PUBCHEM_PROPERTIES = [
  "MolecularFormula",
  "MolecularWeight",
  "CanonicalSMILES",
  "IsomericSMILES",
  "InChI",
  "InChIKey",
  "IUPACName",
  "XLogP",
  "ExactMass",
  "MonoisotopicMass",
  "TPSA",
  "Complexity",
  "HBondDonorCount",
  "HBondAcceptorCount",
  "RotatableBondCount",
  "HeavyAtomCount",
  "AtomStereoCount",
  "BondStereoCount",
  "CovalentUnitCount",
  "Volume3D",
] as const;

export const GROK_MODEL = "grok-3-mini";
export const GROK_BASE_URL = "https://api.x.ai/v1";
export const GROK_MAX_TOKENS = 4096;
export const GROK_TEMPERATURE = 0.7;
