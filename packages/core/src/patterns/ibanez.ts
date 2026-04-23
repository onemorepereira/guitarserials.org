import { singleCandidateMatch } from '../buildMatch.js';
import type { SerialMatch } from '../types.js';

export function matchIbanez(text: string, listingYear: number | null): SerialMatch | null {
  // Pre-F Japan letter-month prefix (1975-1988).
  // Letter encodes month A=Jan..L=Dec, YY is year suffix 75-88.
  // Must match before F-prefix so "F" letter-month doesn't also match F-prefix.
  {
    const m = text.match(/^([A-L])(\d{2})(\d{4})$/);
    if (m) {
      const yy = parseInt(m[2] as string, 10);
      if (yy >= 75 && yy <= 88) {
        return singleCandidateMatch(m[0], 1900 + yy, 'ibanez_japan_letter_month', listingYear);
      }
    }
  }

  // Japan F prefix (Fujigen).
  // F + 7-8 digits: YY + seq (1997+).
  {
    const m = text.match(/^F(\d{7,8})$/);
    if (m) {
      const digits = m[1] as string;
      const year2 = parseInt(digits.slice(0, 2), 10);
      const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
      return singleCandidateMatch(m[0], decoded, 'ibanez_japan_f', listingYear);
    }
  }
  // F + 6 digits: single-digit year (1987-1996).
  {
    const m = text.match(/^F(\d{6})$/);
    if (m) {
      const digits = m[1] as string;
      const yd = parseInt(digits[0] as string, 10);
      const decoded = yd >= 7 ? 1980 + yd : 1990 + yd;
      return singleCandidateMatch(m[0], decoded, 'ibanez_japan_f', listingYear);
    }
  }

  // Indonesia I + 7-9 digits.
  {
    const m = text.match(/^I\d{7,9}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'ibanez_indonesia', listingYear);
    }
  }

  // Korea C + 6-8 digits.
  {
    const m = text.match(/^C\d{6,8}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'ibanez_korea', listingYear);
    }
  }

  return null;
}
