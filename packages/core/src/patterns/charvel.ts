import { singleCandidateMatch } from '../buildMatch.js';
import type { SerialMatch } from '../types.js';

/**
 * Charvel serial number matcher.
 *
 * Japan Charvel modern: JC + YY + 5-digit seq (e.g. JC18000123 = 2018).
 *
 * USA San Dimas 1981–1986: purely sequential 4-digit numbers. Cumulative
 * boundaries (per USA Charvels reference):
 *   1981 = 1001+   1982 = 1096+   1983 = 1725+
 *   1984 = 2939+   1985 = 4262+   1986 = 5304+
 * We match the format and leave year undecoded without range disambiguation.
 */

export function matchCharvel(text: string, listingYear: number | null): SerialMatch | null {
  // Modern Japan: JC + YY + 5-digit seq (8 digits total after JC)
  {
    const m = text.match(/^JC(\d{2})(\d{5,6})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
      return singleCandidateMatch(m[0], decoded, 'charvel_japan', listingYear, 'high');
    }
  }

  // USA San Dimas 1981–1986: plain 4-digit sequential starting at 1001.
  {
    const m = text.match(/^(\d{4})$/);
    if (m) {
      const n = parseInt(m[1] as string, 10);
      if (n >= 1001 && n <= 9999) {
        return singleCandidateMatch(m[0], null, 'charvel_san_dimas', listingYear);
      }
    }
  }

  return null;
}
