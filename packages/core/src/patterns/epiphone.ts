import { singleCandidateMatch } from '../buildMatch.js';
import type { SerialMatch } from '../types.js';

/**
 * Epiphone serial number matcher.
 *
 * 1993–2008 format: <factory code, 1-2 letters> + YY + MM + 4-digit rank.
 * 2008+ format: purely numeric YY + MM + 6-digit rank (10 digits total).
 *
 * Factory codes (documented set):
 *   S  = Samick (Korea)                  U  = Unsung (Korea)
 *   P  = Peerless (Korea)                R  = Peerless (Korea)
 *   I  = Saein (Korea)                   SI = Samick Indonesia (Bogor)
 *   CI = Cort Indonesia                  SJ = SaeJun (China)
 *   EE = Qingdao Electric (China)        EA = Qingdao Acoustic (China)
 *   DW = DaeWon (China)                  MC = Muse (China)
 *   F  = Fujigen (Japan) or Qingdao      T  = Terada (Japan)
 *   Z  = Zaozhuang Saehan (China)        UC = Unsung China (China)
 *   K  = Korea Ins. (Korea)              O  = Choice (Korea)
 *   J  = Jakarta (Indonesia)             FN = Fine Guitars (Korea)
 *   SM = Samil (Korea)
 *
 * Note: some 1-letter factory codes overlap with modern all-numeric serials
 * if the factory letter is elided; we match strictly on the documented codes.
 */

const FACTORY_CODES_2 = new Set(['SI', 'CI', 'EE', 'EA', 'DW', 'MC', 'SJ', 'UC', 'FN', 'SM']);
const FACTORY_CODES_1 = new Set(['S', 'U', 'P', 'R', 'I', 'F', 'T', 'Z', 'K', 'O', 'J']);

export function matchEpiphone(text: string, listingYear: number | null): SerialMatch | null {
  // 1993–2008: 2-letter factory + YY + MM + 4-digit rank.
  {
    const m = text.match(/^([A-Z]{2})(\d{2})(\d{2})(\d{4})$/);
    if (m) {
      const factory = m[1] as string;
      if (FACTORY_CODES_2.has(factory)) {
        const year2 = parseInt(m[2] as string, 10);
        const month = parseInt(m[3] as string, 10);
        if (month >= 1 && month <= 12) {
          const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
          return singleCandidateMatch(m[0], decoded, 'epiphone_factory', listingYear, 'high');
        }
      }
    }
  }

  // 1993–2008: 1-letter factory + YY + MM + 4-digit rank.
  {
    const m = text.match(/^([A-Z])(\d{2})(\d{2})(\d{4})$/);
    if (m) {
      const factory = m[1] as string;
      if (FACTORY_CODES_1.has(factory)) {
        const year2 = parseInt(m[2] as string, 10);
        const month = parseInt(m[3] as string, 10);
        if (month >= 1 && month <= 12) {
          const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
          return singleCandidateMatch(m[0], decoded, 'epiphone_factory', listingYear, 'high');
        }
      }
    }
  }

  // 2008+: YY + MM + 6-digit rank (10 digits total, all numeric).
  {
    const m = text.match(/^(\d{2})(\d{2})(\d{6})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      const month = parseInt(m[2] as string, 10);
      // Year plausibility: 08-29 (2008-2029) covers the numeric-era window.
      if (year2 >= 8 && year2 <= 29 && month >= 1 && month <= 12) {
        return singleCandidateMatch(m[0], 2000 + year2, 'epiphone_numeric', listingYear, 'high');
      }
    }
  }

  return null;
}
