import { singleCandidateMatch } from '../buildMatch.js';
import type { SerialMatch } from '../types.js';

/**
 * Schecter serial number matcher.
 *
 * Modern Schecter (2000+): optional factory-letter prefix + YY (2-digit year
 * immediately after the prefix, or as the first two digits if no prefix) +
 * production sequence.
 *
 * Factory prefixes:
 *   W      = World Musical Instruments (Korea) — most common
 *   IW     = Indonesia, World/PT Wildwood
 *   IC     = Cort Indonesia
 *   C      = Cort (Korea or Indonesia)
 *   S      = Schecter
 *   (none) = older Schecter USA or imports
 *
 * Example: W10052743 = 2010 World Musical Instruments.
 * Example: 0236758   = 2002 (no factory prefix).
 */

const FACTORY_PREFIXES_2 = new Set(['IW', 'IC']);
const FACTORY_PREFIXES_1 = new Set(['W', 'C', 'S']);

export function matchSchecter(text: string, listingYear: number | null): SerialMatch | null {
  // 2-letter prefix: <IW|IC> + YY + digits
  {
    const m = text.match(/^([A-Z]{2})(\d{2})(\d{3,7})$/);
    if (m) {
      const prefix = m[1] as string;
      if (FACTORY_PREFIXES_2.has(prefix)) {
        const year2 = parseInt(m[2] as string, 10);
        if (year2 >= 0 && year2 <= 29) {
          return singleCandidateMatch(m[0], 2000 + year2, 'schecter_factory', listingYear, 'high');
        }
      }
    }
  }

  // 1-letter prefix: <W|C|S> + YY + digits
  {
    const m = text.match(/^([A-Z])(\d{2})(\d{3,7})$/);
    if (m) {
      const prefix = m[1] as string;
      if (FACTORY_PREFIXES_1.has(prefix)) {
        const year2 = parseInt(m[2] as string, 10);
        if (year2 >= 0 && year2 <= 29) {
          return singleCandidateMatch(m[0], 2000 + year2, 'schecter_factory', listingYear, 'high');
        }
      }
    }
  }

  // No-prefix: YY + production sequence (2000+).
  {
    const m = text.match(/^(\d{2})(\d{4,6})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      if (year2 >= 0 && year2 <= 29) {
        return singleCandidateMatch(m[0], 2000 + year2, 'schecter_numeric', listingYear);
      }
    }
  }

  return null;
}
