import { singleCandidateMatch } from '../buildMatch.js';
import type { SerialMatch } from '../types.js';

export function matchSire(text: string, listingYear: number | null): SerialMatch | null {
  // Gen 2: 2N + 8 digits, digits 3-4 = year.
  {
    const m = text.match(/^2N(\d{8})$/);
    if (m) {
      const year2 = parseInt((m[1] as string).slice(0, 2), 10);
      const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
      return singleCandidateMatch(m[0], decoded, 'sire_gen2', listingYear);
    }
  }

  // Gen 1: 8 digits, digits 1-2 = year.
  {
    const m = text.match(/^\d{8}$/);
    if (m) {
      const year2 = parseInt(m[0].slice(0, 2), 10);
      const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
      return singleCandidateMatch(m[0], decoded, 'sire_gen1', listingYear);
    }
  }

  return null;
}
