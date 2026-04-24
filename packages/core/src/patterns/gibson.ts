import { buildMatch, singleCandidateMatch } from '../buildMatch.js';
import { isGibsonStudentLine, isLesPaulClassic } from '../helpers.js';
import type { SerialMatch, SerialMatchCandidate } from '../types.js';
import { matchGibsonCustomShop } from './gibsonCustomShop.js';

/**
 * Match Gibson 8-digit and 9-digit serial numbers.
 *
 * Eras:
 *  - 1977-2005: 8-digit YDDDYRRR (pos 1+5 = year, 2-4 = day of year)
 *  - 2005-2014: 9-digit YDDDYBRRR
 *  - 2014-mid 2019: 9-digit YYNNNNNNN
 *  - mid 2019+: 9-digit YDDDYBRRR
 */
export function matchGibson(
  text: string,
  listingYear: number | null,
  modelHint: string | null = null,
): SerialMatch | null {
  // Les Paul Classic reissue-style ink-stamped serials (evaluated before CS historic).
  if (isLesPaulClassic(modelHint)) {
    if (listingYear !== null && listingYear >= 1989 && listingYear <= 1999) {
      const m = text.match(/^\d{4,6}$/);
      if (m) {
        return singleCandidateMatch(m[0], null, 'gibson_lp_classic_1989_1999', listingYear);
      }
    }
    if (listingYear !== null && listingYear >= 2000 && listingYear <= 2014) {
      const m = text.match(/^(\d{2})(\d{4})$/);
      if (m) {
        const decoded = 2000 + parseInt(m[1] as string, 10);
        return singleCandidateMatch(m[0], decoded, 'gibson_lp_classic_2000_2014', listingYear);
      }
    }
  }

  // Try CS / artist prefixes — sellers often list CS guitars as just "Gibson".
  // isCsBrand stays false: plain Gibson has no implicit CS authority; the 5-6
  // digit historic fallback is gated on the model hint.
  const csMatch = matchGibsonCustomShop(text, listingYear, modelHint, false);
  if (csMatch) return csMatch;

  // 1975-1977 Gibson USA 8-digit decals.
  {
    const yearMap: Record<string, number> = { '99': 1975, '00': 1976, '06': 1977 };
    const m = text.match(/^(99|00|06)(\d{6})$/);
    if (m && listingYear !== null && listingYear >= 1973 && listingYear <= 1979) {
      return singleCandidateMatch(
        m[0],
        yearMap[m[1] as string] as number,
        'gibson_1975_1977',
        listingYear,
      );
    }
  }

  // Removed: the 1994 Centennial "94 + 6 digits" rule previously lived here.
  // Per guitarhq.com, the real Centennial was a ~14-unit run using a distinct
  // YYYY-MM serial format (e.g. 1994-01), which this pattern did not match
  // anyway. Matching every 8-digit number starting with 94 risked false
  // positives on 1994-era Gibson stock-photo contamination. See
  // doc/audits/2026-04-23-source-audit.md §2.

  // 8-9 digit numeric paths.
  const digitMatch = text.match(/^\d{8,9}$/);
  if (!digitMatch) {
    // Pre-1961 Junior/Special 4-digit FON (model-gated).
    if (isGibsonStudentLine(modelHint)) {
      const m = text.match(/^\d{4}$/);
      if (m) {
        const cand: SerialMatchCandidate = {
          serial: m[0],
          decodedYear: null,
          brandFormat: 'gibson_pre1961',
          sourceTag: 'stamped',
          confidenceCap: 'medium',
        };
        return buildMatch(m[0], [cand], cand, listingYear);
      }
    }
    // Pre-1977 Gibson 4-7 digit.
    const m = text.match(/^\d{4,7}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'gibson_pre1977', listingYear);
    }
    return null;
  }

  const serial = digitMatch[0];

  if (serial.length === 9) {
    const candidates: SerialMatchCandidate[] = [];

    const ddd = parseInt(serial.slice(1, 4), 10);
    if (ddd >= 1 && ddd <= 366) {
      const year2 = parseInt((serial[0] as string) + (serial[4] as string), 10);
      const decodedYddd = year2 < 40 ? 2000 + year2 : 1900 + year2;
      candidates.push({
        serial,
        decodedYear: decodedYddd,
        brandFormat: 'gibson_yddd_ybrrr',
      });
    }

    const yy = parseInt(serial.slice(0, 2), 10);
    if (yy >= 14 && yy <= 19) {
      candidates.push({
        serial,
        decodedYear: 2000 + yy,
        brandFormat: 'gibson_yy_sequential',
      });
    }

    if (candidates.length === 0) return null;

    let best: SerialMatchCandidate;
    if (candidates.length === 1) {
      best = candidates[0] as SerialMatchCandidate;
    } else if (listingYear === null) {
      best = candidates[0] as SerialMatchCandidate;
    } else {
      best = candidates.reduce((acc, c) => {
        const accYear = acc.decodedYear ?? 9999;
        const cYear = c.decodedYear ?? 9999;
        return Math.abs(cYear - listingYear) < Math.abs(accYear - listingYear) ? c : acc;
      });
    }
    return buildMatch(serial, candidates, best, listingYear);
  }

  // 8-digit YDDDYRRR
  const year2 = parseInt((serial[0] as string) + (serial[4] as string), 10);
  const dayOfYear = parseInt(serial.slice(1, 4), 10);
  if (dayOfYear < 1 || dayOfYear > 366) return null;
  const decodedYear = year2 < 40 ? 2000 + year2 : 1900 + year2;
  return singleCandidateMatch(serial, decodedYear, 'gibson_yddd_yrrr', listingYear);
}
