import { singleCandidateMatch } from '../buildMatch.js';
import type { SerialMatch } from '../types.js';

/**
 * Rickenbacker serial number matcher.
 *
 * 1987–1996 format: two-character prefix where the first character is the
 * month letter (A=Jan, B=Feb, ..., L=Dec) and the second character is the
 * year digit (0=1987, 1=1988, ..., 9=1996). Followed by a 3-to-5-digit
 * production number.
 *
 * 1996+ format: first character is month (M=Jan, N=Feb, O skipped,
 * P=Mar, Q=Apr, R=May, S=Jun, T=Jul, U=Aug, V=Sep, W=Oct, X=Nov, Y=Dec),
 * second character is year digit (0=1997, 1=1998, …). Production number
 * follows. Year digit cycle makes decoding past 2006 ambiguous without
 * listing context; we decode the first decade cleanly and leave later
 * years null until they can be disambiguated.
 *
 * Earlier eras (pre-1987) use model-coded formats that vary too much to
 * generalize safely — intentionally unsupported for now.
 */

const MONTH_1987_1996: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  I: 9,
  J: 10,
  K: 11,
  L: 12,
};

const MONTH_1996_PLUS: Record<string, number> = {
  M: 1,
  N: 2,
  // O intentionally skipped (visual overlap with 0).
  P: 3,
  Q: 4,
  R: 5,
  S: 6,
  T: 7,
  U: 8,
  V: 9,
  W: 10,
  X: 11,
  Y: 12,
};

export function matchRickenbacker(text: string, listingYear: number | null): SerialMatch | null {
  // 1961–1986: two letters + 3-5 digit production number.
  // First letter = year (A=1961, B=1962, …, Z=1986). Second letter = month
  // (A=Jan, B=Feb, …, L=Dec). Distinct from the 1987-1996 format (which has
  // month LETTER + year DIGIT) because the second character is a LETTER.
  // Checked first so the two-letter form wins over the letter+digit form.
  {
    const m = text.match(/^([A-Z])([A-L])(\d{3,5})$/);
    if (m) {
      const yearLetter = m[1] as string;
      const yearOffset = yearLetter.charCodeAt(0) - 'A'.charCodeAt(0);
      const decoded = 1961 + yearOffset;
      return singleCandidateMatch(m[0], decoded, 'rickenbacker_1961_1986', listingYear, 'high');
    }
  }

  // 1987–1996: <month A-L><year digit 0-9><3-5 digit seq>
  {
    const m = text.match(/^([A-L])(\d)(\d{3,5})$/);
    if (m) {
      const letter = m[1] as string;
      if (MONTH_1987_1996[letter] !== undefined) {
        const yearDigit = parseInt(m[2] as string, 10);
        const decoded = 1987 + yearDigit;
        return singleCandidateMatch(m[0], decoded, 'rickenbacker_1987_1996', listingYear, 'high');
      }
    }
  }

  // 1996+: <month M-Y excluding O><year digit 0-9><3-5 digit seq>
  // Year digit: 0=1997, 1=1998, …, 9=2006. Past 2006 the digit cycles.
  {
    const m = text.match(/^([MNPQRSTUVWXY])(\d)(\d{3,5})$/);
    if (m) {
      const letter = m[1] as string;
      if (MONTH_1996_PLUS[letter] !== undefined) {
        const yearDigit = parseInt(m[2] as string, 10);
        const firstCycle = 1997 + yearDigit; // 1997..2006
        const secondCycle = firstCycle + 10; // 2007..2016
        const thirdCycle = firstCycle + 20; // 2017..2026
        if (listingYear !== null) {
          // Snap to the cycle nearest listingYear.
          const options = [firstCycle, secondCycle, thirdCycle];
          const best = options.reduce((acc, y) =>
            Math.abs(y - listingYear) < Math.abs(acc - listingYear) ? y : acc,
          );
          return singleCandidateMatch(m[0], best, 'rickenbacker_1996_plus', listingYear, 'high');
        }
        // No listing year — honest ambiguity, return format match with
        // year undecoded.
        return singleCandidateMatch(m[0], null, 'rickenbacker_1996_plus', listingYear, 'high');
      }
    }
  }

  return null;
}
