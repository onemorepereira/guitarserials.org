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

/**
 * Jackson 3-letter factory/production-line codes.
 * Convention: first letter = country, middle letter = factory, final J = Jackson brand line.
 *   Country: I = Indonesia, C = China, N = India, K = Korea, M = Mexico, X = Mexico.
 *   Factory: C = Cort, W = World Musical Instruments, S = Samick, H = Harmony / Chushin Gakki, N = Unsung, Y = Yako, U = Unsung.
 */
const FACTORY_CODES: Record<string, string> = {
  // Indonesia
  ICJ: 'Indonesia — Cort',
  ISJ: 'Indonesia — Samick',
  IWJ: 'Indonesia — World Musical Instruments',
  // China
  CYJ: 'China — Yako',
  CJ: 'China — generic',
  CUJ: 'China — Unsung',
  CNJ: 'China — generic',
  CSJ: 'China — Samick',
  // India
  NHJ: 'India — Chushin Gakki (Harmony)',
  // Korea
  KCJ: 'Korea — Cort',
  KWJ: 'Korea — World Musical Instruments',
  KSJ: 'Korea — Samick',
  // Mexico
  MJ: 'Mexico',
  XJ: 'Mexico',
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

  // 1996+ MIJ bolt-on: 7 digits starting with 96 and growing sequentially.
  // Year is encoded in the first two digits (96xxxxx = 1996, 97xxxxx = 1997, …).
  {
    const m = text.match(/^(\d{2})(\d{5})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      // Valid 1996-2012 MIJ bolt-on window (before the 10-char import format).
      if (year2 >= 96 || year2 <= 12) {
        const decoded = year2 >= 96 ? 1900 + year2 : 2000 + year2;
        return singleCandidateMatch(m[0], decoded, 'jackson_mij_1996_plus', listingYear);
      }
    }
  }

  // MII (Made in India) JS20-series 8-digit: YY + 6-digit seq.
  {
    const m = text.match(/^(\d{2})(\d{6})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      if (year2 >= 96 || (year2 >= 0 && year2 <= 15)) {
        const decoded = year2 >= 96 ? 1900 + year2 : 2000 + year2;
        return singleCandidateMatch(m[0], decoded, 'jackson_mii_india', listingYear);
      }
    }
  }

  return null;
}
