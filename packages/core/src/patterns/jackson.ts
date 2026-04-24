import { singleCandidateMatch } from '../buildMatch.js';
import type { SerialMatch } from '../types.js';

/**
 * Jackson serial number matcher.
 *
 * Modern import (2013+): 3-letter factory code + YY + 5-digit seq.
 *   ICJ = Indonesia Cort, CYJ = China Yako, and other factory triples.
 *
 * 1990–1995 MIJ Professional: 6 digits total where the first digit is the
 * year offset from 1990 (0=1990, 1=1991, …, 5=1995).
 *
 * 1983–early 1990s USA: J0001+ for most production, RR0001+ for Randy
 * Rhoads neck-throughs (custom era), U0xxxx for production Rhoads after
 * 1990. Year cannot be cleanly decoded from the serial; the format is
 * recognized and year is left to listing context.
 */

const FACTORY_CODES: Record<string, string> = {
  ICJ: 'Indonesia — Cort',
  CYJ: 'China — Yako',
  CJ: 'China — generic',
  MJ: 'Mexico',
  XJ: 'Mexico',
  CUJ: 'China — Unsung',
  ISJ: 'Indonesia — Samick',
};

export function matchJackson(text: string, listingYear: number | null): SerialMatch | null {
  // Modern import 2013+: <3-letter factory><YY><5-digit seq>
  {
    const m = text.match(/^([A-Z]{3})(\d{2})(\d{5})$/);
    if (m) {
      const factory = m[1] as string;
      if (FACTORY_CODES[factory] !== undefined) {
        const year2 = parseInt(m[2] as string, 10);
        const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
        return singleCandidateMatch(m[0], decoded, 'jackson_modern_import', listingYear, 'high');
      }
    }
  }

  // Randy Rhoads signature: RR + 4 digits
  {
    const m = text.match(/^RR(\d{4})$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'jackson_rr_signature', listingYear, 'high');
    }
  }

  // 1983+ USA J-prefix: J + 4 digits
  {
    const m = text.match(/^J(\d{4})$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'jackson_usa', listingYear, 'high');
    }
  }

  // 1990–1995 MIJ Professional: 6 plain digits, first digit = year offset
  // (0=1990 … 5=1995). Gated tightly to avoid collision with generic numerics.
  {
    const m = text.match(/^([0-5])(\d{5})$/);
    if (m) {
      const yearDigit = parseInt(m[1] as string, 10);
      const decoded = 1990 + yearDigit;
      return singleCandidateMatch(m[0], decoded, 'jackson_mij_professional', listingYear);
    }
  }

  return null;
}
