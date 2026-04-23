import { tierRank } from './tierRank.js';
import type { ConfidenceTier, SerialMatch, SerialMatchCandidate } from './types.js';

/**
 * Apply the three-tier year-mismatch rule from the design doc.
 *
 * Precedence order:
 *  1. confidenceOverride set → return it verbatim
 *  2. decodedYear or listingYear missing → trust decode, return cap or 'high'
 *  3. gap ≤ 1 → cap or 'high'
 *  4. gap ≤ 5 → 'review'
 *  5. gap > 5 → 'rejected'
 */
export function computeTier(
  best: SerialMatchCandidate,
  listingYear: number | null,
): ConfidenceTier {
  if (best.confidenceOverride) {
    return best.confidenceOverride;
  }
  if (best.decodedYear === null || listingYear === null) {
    return best.confidenceCap ?? 'high';
  }
  const gap = Math.abs(best.decodedYear - listingYear);
  if (gap <= 1) {
    return best.confidenceCap ?? 'high';
  }
  if (gap <= 5) {
    return 'review';
  }
  return 'rejected';
}

export function buildMatch(
  serial: string,
  candidates: SerialMatchCandidate[],
  best: SerialMatchCandidate,
  listingYear: number | null,
): SerialMatch {
  const tier = computeTier(best, listingYear);
  return {
    serial,
    candidates,
    best,
    confidenceTier: tier,
    decodedYear: best.decodedYear,
    brandFormat: best.brandFormat,
    confidenceTierRank: tierRank(tier),
  };
}

/** Shortcut: build a SerialMatch with a single candidate (the common case). */
export function singleCandidateMatch(
  serial: string,
  decodedYear: number | null,
  brandFormat: string,
  listingYear: number | null,
  confidenceOverride: ConfidenceTier | null = null,
): SerialMatch {
  const cand: SerialMatchCandidate = {
    serial,
    decodedYear,
    brandFormat,
    sourceTag: null,
    confidenceCap: null,
    confidenceOverride,
  };
  return buildMatch(serial, [cand], cand, listingYear);
}
