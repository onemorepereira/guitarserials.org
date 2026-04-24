import { singleCandidateMatch } from '../buildMatch.js';
import type { SerialMatch } from '../types.js';

/**
 * Gretsch serial number matcher.
 *
 * Modern format (2003+): 2-letter factory code + YY + MM + 4-digit seq.
 * Baldwin era (1972-1981): uses a hyphen (e.g. "2-365") — intentionally
 * unsupported here; historical collector lookup is better than automated
 * decoding for this era.
 * Date-coded era (1966-1972): M(M)Y + 3-5 digit seq where M is 1 or 2
 * digits of month and Y is the last digit of year (7-9 or 0-2 for
 * 1967-1972). Ambiguity: we decode year only when the listing year is
 * provided in-range.
 */

const FACTORY_CODES: Record<string, string> = {
  JT: 'Japan — Terada',
  JD: 'Japan — Dyna Gakki',
  JF: 'Japan — Fuji-Gen Gakki',
  KP: 'Korea — Peerless',
  KS: 'Korea — Samick / SPG',
  CY: 'China — Yako',
  CS: 'USA — Custom Shop',
};

export function matchGretsch(text: string, listingYear: number | null): SerialMatch | null {
  // Modern 2003+: <factory 2 letters> + YY + MM + 4 digits
  {
    const m = text.match(/^(JT|JD|JF|KP|KS|CY|CS)(\d{2})(\d{2})(\d{4})$/);
    if (m) {
      const factory = m[1] as string;
      if (FACTORY_CODES[factory] !== undefined) {
        const year2 = parseInt(m[2] as string, 10);
        const month = parseInt(m[3] as string, 10);
        if (month >= 1 && month <= 12) {
          const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
          return singleCandidateMatch(m[0], decoded, 'gretsch_modern', listingYear, 'high');
        }
      }
    }
  }

  // 1966–1972 date-coded: MYRRR or MMYRRR where M(M) is month (1-12),
  // Y is last digit of year (6-9 → 1966-1969, 0-2 → 1970-1972).
  // Example: 118145 = Nov (11) 1968 (8), #145.
  {
    const m = text.match(/^(\d{1,2})(\d)(\d{3,5})$/);
    if (m && text.length >= 5 && text.length <= 8) {
      // Only try the date-coded interpretation when it's plausible: month
      // is 1-12 and year digit maps to 6-9 or 0-2 (1966-1972).
      // We check both MYRRR and MMYRRR readings.
      // 1-digit month reading: first char is month, second is year digit.
      if (text.length >= 5) {
        const m1 = text.match(/^(\d)(\d)(\d{3,6})$/);
        if (m1) {
          const month1 = parseInt(m1[1] as string, 10);
          const yearDigit1 = parseInt(m1[2] as string, 10);
          if (
            month1 >= 1 &&
            month1 <= 9 &&
            ((yearDigit1 >= 6 && yearDigit1 <= 9) || (yearDigit1 >= 0 && yearDigit1 <= 2))
          ) {
            const decoded1 = yearDigit1 >= 6 ? 1960 + yearDigit1 : 1970 + yearDigit1;
            if (
              listingYear === null ||
              (decoded1 - 2 <= listingYear && listingYear <= decoded1 + 2)
            ) {
              return singleCandidateMatch(
                m1[0],
                decoded1,
                'gretsch_date_coded_1966_1972',
                listingYear,
              );
            }
          }
        }
      }
      // 2-digit month reading: first two chars are month (10-12), third is year digit.
      const m2 = text.match(/^(1[0-2])(\d)(\d{3,5})$/);
      if (m2) {
        const month2 = parseInt(m2[1] as string, 10);
        const yearDigit2 = parseInt(m2[2] as string, 10);
        if (
          month2 >= 10 &&
          month2 <= 12 &&
          ((yearDigit2 >= 6 && yearDigit2 <= 9) || (yearDigit2 >= 0 && yearDigit2 <= 2))
        ) {
          const decoded2 = yearDigit2 >= 6 ? 1960 + yearDigit2 : 1970 + yearDigit2;
          if (
            listingYear === null ||
            (decoded2 - 2 <= listingYear && listingYear <= decoded2 + 2)
          ) {
            return singleCandidateMatch(
              m2[0],
              decoded2,
              'gretsch_date_coded_1966_1972',
              listingYear,
            );
          }
        }
      }
    }
  }

  // Pre-1966 sequential (1939–1965) fallback. Rising sequence starting at
  // 001 in 1939. Per the official GretschTech "Serial Numbers 1930s-1966"
  // article:
  //   1939-1945: handwritten 3-4 digits (001-999) on inside of body.
  //   1945-1954: 4-digit, pencil or label.
  //   1954-1965: 5-digit, label or headstock, ~13000-84000.
  // Ranges overlap heavily across years — we match the format and leave
  // year null. Placed AFTER the date-coded rule so 5-digit MYRRR strings
  // from 1966-1972 still decode correctly.
  {
    const m = text.match(/^(\d{3,5})$/);
    if (m) {
      const n = parseInt(m[1] as string, 10);
      if (n >= 1 && n <= 99999) {
        return singleCandidateMatch(m[0], null, 'gretsch_pre1966_sequential', listingYear);
      }
    }
  }

  return null;
}
