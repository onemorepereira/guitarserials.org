export type ConfidenceTier =
  | 'review'
  | 'low'
  | 'medium'
  | 'high'
  | 'hybrid'
  | 'verified'
  | 'rejected';

export interface MatchOptions {
  listingYear?: number;
  modelHint?: string;
  /**
   * Optional upper-bound year used by decoders when listingYear is
   * absent (currently: Gibson CS-prefix decade disambiguation —
   * single-digit Y collides every 10 years across the 1990s/2000s/
   * 2010s/2020s). When supplied, the decoder biases to the most-
   * recent valid year ≤ todayYear. Public callers should pass
   * `new Date().getFullYear()`; tests pass a fixed value.
   */
  todayYear?: number;
}

export interface SerialMatchCandidate {
  serial: string;
  decodedYear: number | null;
  /** Month of production (1–12), when the format encodes it. */
  decodedMonth?: number | null;
  /** Day of month (1–31), when the format encodes a full date. */
  decodedDay?: number | null;
  brandFormat: string;
  sourceTag?: string | null;
  confidenceCap?: ConfidenceTier | null;
  confidenceOverride?: ConfidenceTier | null;
}

export interface SerialMatch {
  serial: string;
  candidates: SerialMatchCandidate[];
  best: SerialMatchCandidate;
  confidenceTier: ConfidenceTier;
  decodedYear: number | null;
  /** Month (1–12) if the format carries it; undefined or null otherwise. */
  decodedMonth?: number | null;
  /** Day (1–31) if the format carries a full date; undefined or null otherwise. */
  decodedDay?: number | null;
  brandFormat: string;
  confidenceTierRank: number;
}
