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
    decodedMonth: best.decodedMonth ?? null,
    decodedDay: best.decodedDay ?? null,
    brandFormat: best.brandFormat,
    confidenceTierRank: tierRank(tier),
  };
}

/**
 * Shortcut: build a SerialMatch with a single candidate (the common case).
 *
 * `decodedDate` is optional; pass `{ month }` or `{ month, day }` when the
 * format encodes precision beyond the year. Omit entirely (or pass null) for
 * year-only formats.
 */
export function singleCandidateMatch(
  serial: string,
  decodedYear: number | null,
  brandFormat: string,
  listingYear: number | null,
  confidenceOverride: ConfidenceTier | null = null,
  decodedDate: { month?: number | null; day?: number | null } | null = null,
): SerialMatch {
  const cand: SerialMatchCandidate = {
    serial,
    decodedYear,
    decodedMonth: decodedDate?.month ?? null,
    decodedDay: decodedDate?.day ?? null,
    brandFormat,
    sourceTag: null,
    confidenceCap: null,
    confidenceOverride,
  };
  return buildMatch(serial, [cand], cand, listingYear);
}

/**
 * Convert a day-of-year (1–366) to month + day-of-month for a given year.
 * Returns `null` if the DOY is out of range for that year (e.g. 366 in a
 * non-leap year).
 *
 * Gibson's YDDDY(B)RRR formats encode DOY directly — this is the shared
 * converter.
 */
export function dayOfYearToMonthDay(
  year: number,
  doy: number,
): { month: number; day: number } | null {
  if (!Number.isInteger(doy) || doy < 1 || doy > 366) return null;
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const months = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let remaining = doy;
  for (let i = 0; i < months.length; i++) {
    const m = months[i] as number;
    if (remaining <= m) return { month: i + 1, day: remaining };
    remaining -= m;
  }
  return null;
}
