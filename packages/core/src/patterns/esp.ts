import { singleCandidateMatch } from '../buildMatch.js';
import type { SerialMatch } from '../types.js';

/**
 * ESP / LTD serial number matcher.
 *
 * ESP's own records pre-2000 are incomplete (per ESP itself and multiple
 * community references) — many were lost in a factory fire in the late
 * 1990s. What remains well-documented is the post-2000 import format
 * where a letter prefix encodes the factory and the following digits
 * encode date and production rank.
 *
 * Modern formats:
 *   E + 7 digits  = Korea (ESP contract factory)
 *   U + 7 digits  = Korea (different ESP contract factory)
 *   L + 7 digits  = China
 *   I + 7 digits  = Vietnam
 *   W + 8 digits  = World Musical Instrument Co. (Incheon, Korea)
 *   IS + 7 digits = Indonesia
 *   IR + 7 digits = Indonesia
 *   IW + 8 digits = Indonesia (World factory)
 *   IX + 8 digits = Indonesia
 *
 * Year encoding in the digits varies by factory and isn't uniformly
 * documented for all eras — we match the format and leave year null
 * except where a known convention applies.
 */

const SINGLE_LETTER_FACTORIES = new Set(['E', 'U', 'L', 'I']);
const TWO_LETTER_FACTORIES_7 = new Set(['IS', 'IR']);
const TWO_LETTER_FACTORIES_8 = new Set(['IW', 'IX']);

export function matchEsp(text: string, listingYear: number | null): SerialMatch | null {
  // 2-letter + 8 digits: Indonesia World / Indonesia X
  {
    const m = text.match(/^([A-Z]{2})(\d{8})$/);
    if (m) {
      const prefix = m[1] as string;
      if (TWO_LETTER_FACTORIES_8.has(prefix) || prefix === 'IS') {
        return singleCandidateMatch(m[0], null, 'esp_import', listingYear, 'high');
      }
    }
  }

  // 2-letter + 7 digits: Indonesia IS/IR
  {
    const m = text.match(/^([A-Z]{2})(\d{7})$/);
    if (m) {
      const prefix = m[1] as string;
      if (TWO_LETTER_FACTORIES_7.has(prefix)) {
        return singleCandidateMatch(m[0], null, 'esp_import', listingYear, 'high');
      }
    }
  }

  // 1-letter + 8 digits: W = World Korea.
  {
    const m = text.match(/^W(\d{8})$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'esp_world_korea', listingYear, 'high');
    }
  }

  // 1-letter + 7 digits: E/U (Korea), L (China), I (Vietnam).
  {
    const m = text.match(/^([A-Z])(\d{7})$/);
    if (m) {
      const prefix = m[1] as string;
      if (SINGLE_LETTER_FACTORIES.has(prefix)) {
        return singleCandidateMatch(m[0], null, 'esp_import', listingYear, 'high');
      }
    }
  }

  // Pre-2000 Japan 8-digit DDMMYNNN: day + month + year-digit + 3-digit rank.
  // Example: 25055012 = 25 May 1995, #12. Year digit alone is ambiguous
  // across decades (5 → 1985 or 1995); we snap via listingYear when
  // provided. ESP pre-2000 production was Japan-only, so candidates are
  // 1975-1999.
  {
    const m = text.match(/^(\d{2})(\d{2})(\d)(\d{3})$/);
    if (m) {
      const day = parseInt(m[1] as string, 10);
      const month = parseInt(m[2] as string, 10);
      const yearDigit = parseInt(m[3] as string, 10);
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        let decodedYear: number | null = null;
        if (listingYear !== null) {
          const options = [1970 + yearDigit, 1980 + yearDigit, 1990 + yearDigit].filter(
            (y) => y >= 1975 && y <= 1999,
          );
          if (options.length > 0) {
            decodedYear = options.reduce((acc, y) =>
              Math.abs(y - listingYear) < Math.abs(acc - listingYear) ? y : acc,
            );
          }
        }
        return singleCandidateMatch(m[0], decodedYear, 'esp_pre2000_japan', listingYear);
      }
    }
  }

  return null;
}
