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
