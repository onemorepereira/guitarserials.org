export type ConfidenceTier = 'review' | 'low' | 'medium' | 'high' | 'hybrid' | 'verified';

export interface MatchOptions {
  listingYear?: number;
  modelHint?: string;
}

export interface SerialMatchCandidate {
  year: number;
  tier: ConfidenceTier;
  formatName: string;
  notes?: string;
}

export interface SerialMatch {
  brand: string;
  serial: string;
  year: number;
  tier: ConfidenceTier;
  formatName: string;
  candidates?: SerialMatchCandidate[];
  notes?: string;
}
