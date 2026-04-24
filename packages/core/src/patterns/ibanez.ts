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
  // F + 7 digits: YY + 5-digit seq (1997+). Tightened from F + 7-8 digits
  // to 7 only, per ibanezrules.com which documents Fujigen's switch to an
  // 8-character (F + 7 digits) format in 1997. No source supports F + 8.
  // See doc/audits/2026-04-23-source-audit.md §9.
  {
    const m = text.match(/^F(\d{7})$/);
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

  // Indonesia I + 9 digits: YY + MM + 5-digit sequence (per Ibanez Wiki
  // + ibanezrules.com). YY=16 → 2016. Valid month 01-12.
  {
    const m = text.match(/^I(\d{2})(\d{2})(\d{5})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      const month = parseInt(m[2] as string, 10);
      if (month >= 1 && month <= 12) {
        const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
        return singleCandidateMatch(m[0], decoded, 'ibanez_indonesia', listingYear);
      }
    }
  }

  // Indonesia I + 7–9 digits: fall-back for lengths or month values that
  // don't match the 9-digit YYMMPPPPP layout. Matches the brand-format but
  // leaves year unknown.
  {
    const m = text.match(/^I\d{7,9}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'ibanez_indonesia', listingYear);
    }
  }

  // Samick Korea S-prefix (1990–1995): S + Y + MM + PPPP (7 digits after S).
  // Y = last digit of year (0=1990, 1=1991, …, 5=1995). MM = 01-12.
  // Gated tightly on the Samick window because S-prefix alone is too
  // generic; outside 1990-1995 Samick stopped making Ibanez.
  {
    const m = text.match(/^S(\d)(\d{2})(\d{4})$/);
    if (m) {
      const yearDigit = parseInt(m[1] as string, 10);
      const month = parseInt(m[2] as string, 10);
      if (yearDigit <= 5 && month >= 1 && month <= 12) {
        return singleCandidateMatch(m[0], 1990 + yearDigit, 'ibanez_korea_samick', listingYear);
      }
    }
  }

  // World Korea W-prefix: W + YY + M + RRRR (8 digits after W).
  // YY = 2-digit year. M encodes month: 1-9 = Jan-Sep, X = Oct, Y = Nov, Z = Dec.
  {
    const m = text.match(/^W(\d{2})([1-9XYZ])(\d{4,5})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
      return singleCandidateMatch(m[0], decoded, 'ibanez_korea_world', listingYear);
    }
  }

  // Korea C + 6-8 digits (Cort Korea). Year encoding varies by length and
  // era; without a fully-documented authoritative chart we match the format
  // but leave decoded_year=null.
  {
    const m = text.match(/^C\d{6,8}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'ibanez_korea', listingYear);
    }
  }

  return null;
}
