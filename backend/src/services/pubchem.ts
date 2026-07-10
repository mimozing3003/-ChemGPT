/**
 * PubChem PUG REST API Service
 * Provides verified molecular data from NCBI's PubChem database
 */
import { PUBCHEM_BASE_URL, PUBCHEM_PROPERTIES } from "../lib/constants";
import type { PubChemCompound } from "../lib/types";

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Rate-limited fetch wrapper for PubChem (max 5 req/sec)
 */
let lastRequestTime = 0;
async function pubchemFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < 200) {
    // enforce 200ms between requests (5/sec)
    await new Promise((resolve) => setTimeout(resolve, 200 - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new PubChemError("Compound not found", 404);
    }
    throw new PubChemError(
      `PubChem API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  return response;
}

export class PubChemError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "PubChemError";
  }
}

// ─── Compound Search ───────────────────────────────────────

/**
 * Search for a compound by name, formula, SMILES, InChI, or CID
 */
export async function searchCompound(
  query: string,
  searchType: "name" | "formula" | "smiles" | "inchi" | "cid" = "name"
): Promise<PubChemCompound | null> {
  const cacheKey = `compound:${searchType}:${query}`;
  const cached = getCached<PubChemCompound>(cacheKey);
  if (cached) return cached;

  try {
    const properties = PUBCHEM_PROPERTIES.join(",");
    let url: string;

    switch (searchType) {
      case "cid":
        url = `${PUBCHEM_BASE_URL}/compound/cid/${encodeURIComponent(query)}/property/${properties}/JSON`;
        break;
      case "smiles":
        url = `${PUBCHEM_BASE_URL}/compound/smiles/${encodeURIComponent(query)}/property/${properties}/JSON`;
        break;
      case "inchi":
        url = `${PUBCHEM_BASE_URL}/compound/inchi/${encodeURIComponent(query)}/property/${properties}/JSON`;
        break;
      case "formula":
        url = `${PUBCHEM_BASE_URL}/compound/fastformula/${encodeURIComponent(query)}/property/${properties}/JSON`;
        break;
      default:
        url = `${PUBCHEM_BASE_URL}/compound/name/${encodeURIComponent(query)}/property/${properties}/JSON`;
    }

    const response = await pubchemFetch(url);
    const data = await response.json();

    if (!data.PropertyTable?.Properties?.[0]) {
      return null;
    }

    const compound = data.PropertyTable.Properties[0] as PubChemCompound;
    setCache(cacheKey, compound);
    return compound;
  } catch (error) {
    if (error instanceof PubChemError && error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

// ─── Compound Title / Name ─────────────────────────────────

/**
 * Get compound title/common name
 */
export async function getCompoundTitle(cid: number): Promise<string> {
  const cacheKey = `title:${cid}`;
  const cached = getCached<string>(cacheKey);
  if (cached) return cached;

  try {
    const url = `${PUBCHEM_BASE_URL}/compound/cid/${cid}/description/JSON`;
    const response = await pubchemFetch(url);
    const data = await response.json();
    const title =
      data.InformationList?.Information?.[0]?.Title ?? `CID ${cid}`;
    setCache(cacheKey, title);
    return title;
  } catch {
    return `CID ${cid}`;
  }
}

// ─── Synonyms ──────────────────────────────────────────────

/**
 * Get compound synonyms
 */
export async function getCompoundSynonyms(cid: number): Promise<string[]> {
  const cacheKey = `synonyms:${cid}`;
  const cached = getCached<string[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = `${PUBCHEM_BASE_URL}/compound/cid/${cid}/synonyms/JSON`;
    const response = await pubchemFetch(url);
    const data = await response.json();
    const synonyms =
      data.InformationList?.Information?.[0]?.Synonym?.slice(0, 20) ?? [];
    setCache(cacheKey, synonyms);
    return synonyms;
  } catch {
    return [];
  }
}

// ─── 3D SDF ────────────────────────────────────────────────

/**
 * Get 3D SDF data for molecular visualization
 */
export async function get3DSDF(cid: number): Promise<string | null> {
  const cacheKey = `sdf3d:${cid}`;
  const cached = getCached<string>(cacheKey);
  if (cached) return cached;

  try {
    const url = `${PUBCHEM_BASE_URL}/compound/cid/${cid}/SDF?record_type=3d`;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) return null;
    const sdf = await response.text();
    setCache(cacheKey, sdf);
    return sdf;
  } catch {
    return null;
  }
}

// ─── 2D Image URL ──────────────────────────────────────────

/**
 * Get 2D structure image URL
 */
export function get2DImageUrl(cid: number, size: number = 300): string {
  return `${PUBCHEM_BASE_URL}/compound/cid/${cid}/PNG?record_type=2d&image_size=${size}x${size}`;
}

// ─── Autocomplete / Suggestions ────────────────────────────

/**
 * Get compound name suggestions for autocomplete
 */
export async function getAutocompleteSuggestions(
  query: string
): Promise<string[]> {
  if (query.length < 2) return [];

  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(query)}/json?limit=8`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await response.json();
    return data.dictionary_terms?.compound ?? [];
  } catch {
    return [];
  }
}

// ─── GHS Safety Data ───────────────────────────────────────

export interface GHSSafetyData {
  pictograms: string[];
  signalWord: string;
  hazardStatements: string[];
}

/**
 * Get GHS safety information for a compound
 */
export async function getGHSSafety(cid: number): Promise<GHSSafetyData | null> {
  const cacheKey = `ghs:${cid}`;
  const cached = getCached<GHSSafetyData>(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=GHS+Classification`;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) return null;

    await response.json();
    const safety: GHSSafetyData = {
      pictograms: [],
      signalWord: "",
      hazardStatements: [],
    };

    setCache(cacheKey, safety);
    return safety;
  } catch {
    return null;
  }
}

// ─── Multiple Compound Search ──────────────────────────────

/**
 * Search for compounds matching a query (returns multiple results)
 */
export async function searchCompounds(
  query: string,
  maxResults: number = 10
): Promise<PubChemCompound[]> {
  try {
    // First get CIDs
    const url = `${PUBCHEM_BASE_URL}/compound/name/${encodeURIComponent(query)}/cids/JSON`;
    const response = await pubchemFetch(url);
    const data = await response.json();

    const cids = data.IdentifierList?.CID?.slice(0, maxResults) ?? [];
    if (cids.length === 0) return [];

    // Then get properties for all CIDs
    const propsUrl = `${PUBCHEM_BASE_URL}/compound/cid/${cids.join(",")}/property/${PUBCHEM_PROPERTIES.join(",")}/JSON`;
    const propsResponse = await pubchemFetch(propsUrl);
    const propsData = await propsResponse.json();

    return propsData.PropertyTable?.Properties ?? [];
  } catch {
    return [];
  }
}
