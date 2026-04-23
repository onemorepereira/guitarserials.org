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
  brandFormat: string;
  confidenceTierRank: number;
}
