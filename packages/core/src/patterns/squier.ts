import { singleCandidateMatch } from '../buildMatch.js';
import type { SerialMatch } from '../types.js';

/**
 * Squier serial number matcher.
 *
 * Squier shares several Fender prefixes (MN, MZ, E, N) for their Mexican
 * and earlier USA production; those follow the single-digit-year convention
 * from the Fender matcher. This matcher covers Squier-specific factory
 * prefixes and the all-Indonesian / Chinese production.
 */

export function matchSquier(text: string, listingYear: number | null): SerialMatch | null {
  // ICS (Indonesia Cort): ICS + YY + 4-6 digits.
  {
    const m = text.match(/^ICS(\d{2})(\d{4,6})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
      return singleCandidateMatch(m[0], decoded, 'squier_ics', listingYear, 'high');
    }
  }

  // ISS (Indonesia Samick): ISS + YY + 4-6 digits.
  {
    const m = text.match(/^ISS(\d{2})(\d{4,6})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
      return singleCandidateMatch(m[0], decoded, 'squier_iss', listingYear, 'high');
    }
  }

  // CGS (China Guangzhou Squier Classic Vibe): CGS + YY + digits.
  {
    const m = text.match(/^CGS(\d{2})(\d{4,6})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
      return singleCandidateMatch(m[0], decoded, 'squier_cgs', listingYear, 'high');
    }
  }

  // CN (China Cor-Tek): CN + YY + digits for 2000s+; historically CN was
  // also used with a single-digit year in the 1990s. Distinguish by length.
  {
    const m = text.match(/^CN(\d{2})(\d{4,6})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      // Prefer 2-digit YY when the leading pair is plausible (95-29).
      if ((year2 >= 95 && year2 <= 99) || (year2 >= 0 && year2 <= 29)) {
        const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
        return singleCandidateMatch(m[0], decoded, 'squier_cn', listingYear, 'high');
      }
    }
  }

  // CY (China CW): CY + YY + digits.
  {
    const m = text.match(/^CY(\d{2})(\d{4,6})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
      return singleCandidateMatch(m[0], decoded, 'squier_cy', listingYear, 'high');
    }
  }

  // IC (Indonesia Cort, shorter prefix): IC + YY + digits.
  {
    const m = text.match(/^IC(\d{2})(\d{4,6})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
      return singleCandidateMatch(m[0], decoded, 'squier_ic', listingYear, 'high');
    }
  }

  // SI (Samick Indonesia): SI + YY + 4-6 digits.
  {
    const m = text.match(/^SI(\d{2})(\d{4,6})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
      return singleCandidateMatch(m[0], decoded, 'squier_si', listingYear, 'high');
    }
  }

  // KC (Korea Cor-Tek, 1997+): KC + YY + 4-6 digits.
  {
    const m = text.match(/^KC(\d{2})(\d{4,6})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
      return singleCandidateMatch(m[0], decoded, 'squier_kc', listingYear, 'high');
    }
  }

  // KV (Korea Saehan/Sunghan, 1997+): KV + YY + 4-6 digits.
  {
    const m = text.match(/^KV(\d{2})(\d{4,6})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
      return singleCandidateMatch(m[0], decoded, 'squier_kv', listingYear, 'high');
    }
  }

  // VN (Vietnam, 2000s+): VN + YY + 4-6 digits.
  {
    const m = text.match(/^VN(\d{2})(\d{4,6})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
      return singleCandidateMatch(m[0], decoded, 'squier_vn', listingYear, 'high');
    }
  }

  // Shared Fender-style prefixes for Squier Mexico / USA production.
  // These overlap the Fender matcher's rules; include here so "Squier"
  // brand dispatch also resolves them.
  {
    const m = text.match(/^MN(\d)(\d{4,6})$/);
    if (m) {
      const yearDigit = parseInt(m[1] as string, 10);
      return singleCandidateMatch(m[0], 1990 + yearDigit, 'squier_mn', listingYear, 'high');
    }
  }
  {
    const m = text.match(/^MZ(\d)(\d{4,6})$/);
    if (m) {
      const yearDigit = parseInt(m[1] as string, 10);
      return singleCandidateMatch(m[0], 2000 + yearDigit, 'squier_mz', listingYear, 'high');
    }
  }
  {
    const m = text.match(/^E(\d)(\d{4,5})$/);
    if (m) {
      const yearDigit = parseInt(m[1] as string, 10);
      return singleCandidateMatch(m[0], 1980 + yearDigit, 'squier_usa_e', listingYear);
    }
  }
  {
    const m = text.match(/^N(\d)(\d{4,5})$/);
    if (m) {
      const yearDigit = parseInt(m[1] as string, 10);
      return singleCandidateMatch(m[0], 1990 + yearDigit, 'squier_usa_n', listingYear);
    }
  }

  return null;
}
