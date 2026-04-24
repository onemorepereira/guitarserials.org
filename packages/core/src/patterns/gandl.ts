import { singleCandidateMatch } from '../buildMatch.js';
import type { SerialMatch } from '../types.js';

/**
 * G&L serial number matcher.
 *
 * 1998+: CLFYYMMnnn — CLF ("Clarence Leo Fender") + YY + MM + 3-digit rank.
 * This is the era with year encoded directly in the serial.
 *
 * 2011+: CLFXXXXXX — the YY/MM encoding was dropped; serial is just a
 * 6-digit cumulative sequence after the CLF prefix. Year requires G&L
 * registry lookup.
 *
 * Late 1997–1998 transitional: CLXXXXX (CL "Clarence Leo" — no F).
 *
 * 1980–1997: GXXXXXX (guitars) / BXXXXXX (basses). No year encoded.
 *
 * Placentia Series (China): YYYY + XXXX (8 digits) where YYYY is a full
 * 4-digit year.
 */

export function matchGAndL(text: string, listingYear: number | null): SerialMatch | null {
  // 1998+ CLFYYMMnnn (year+month encoded). Gated on valid month.
  {
    const m = text.match(/^CLF(\d{2})(\d{2})(\d{3})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      const month = parseInt(m[2] as string, 10);
      if (month >= 1 && month <= 12) {
        const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
        return singleCandidateMatch(m[0], decoded, 'gandl_clf_dated', listingYear, 'high');
      }
    }
  }

  // 2011+ CLFXXXXXX (6-digit cumulative). Year requires G&L registry lookup.
  {
    const m = text.match(/^CLF(\d{6})$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'gandl_clf_cumulative', listingYear, 'high');
    }
  }

  // Late 1997–1998 transitional CLXXXXX (5 digits).
  {
    const m = text.match(/^CL(\d{5})$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'gandl_cl_transitional', listingYear, 'high');
    }
  }

  // 1980–1997 G-prefix (guitars) — GXXXXXX or G0XXXXX.
  {
    const m = text.match(/^G\d{5,6}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'gandl_g_prefix', listingYear, 'high');
    }
  }

  // 1980–1997 B-prefix (basses) — BXXXXXX.
  {
    const m = text.match(/^B\d{5,6}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'gandl_b_prefix', listingYear, 'high');
    }
  }

  // Placentia Series (China): YYYY + XXXX, 8 digits with a plausible year.
  {
    const m = text.match(/^(\d{4})(\d{4})$/);
    if (m) {
      const year = parseInt(m[1] as string, 10);
      if (year >= 2019 && year <= 2035) {
        return singleCandidateMatch(m[0], year, 'gandl_placentia', listingYear);
      }
    }
  }

  // Tribute Series (import). Year + month encoded in the serial; format
  // varies by factory location.
  //   China: L + YY + MM + 4-5 digit seq (total 8-9 chars).
  //   Indonesia: YY + MM + 5 digit seq (9 digits).
  //   Korea: YY + MM + 4 digit seq (8 digits).
  //
  // Chinese L-prefix first.
  {
    const m = text.match(/^L(\d{2})(\d{2})(\d{4,5})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      const month = parseInt(m[2] as string, 10);
      if (month >= 1 && month <= 12) {
        const decoded = year2 < 50 ? 2000 + year2 : 1900 + year2;
        return singleCandidateMatch(m[0], decoded, 'gandl_tribute_china', listingYear);
      }
    }
  }

  // Indonesia Tribute: 9 digits = YY + MM + 5-digit seq.
  {
    const m = text.match(/^(\d{2})(\d{2})(\d{5})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      const month = parseInt(m[2] as string, 10);
      // Tribute Series ran from the early 2000s; gate to YY 03-29 as a
      // plausibility check.
      if (year2 >= 3 && year2 <= 29 && month >= 1 && month <= 12) {
        return singleCandidateMatch(m[0], 2000 + year2, 'gandl_tribute_indonesia', listingYear);
      }
    }
  }

  // Korean Tribute: 8 digits = YY + MM + 4-digit seq.
  {
    const m = text.match(/^(\d{2})(\d{2})(\d{4})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      const month = parseInt(m[2] as string, 10);
      if (year2 >= 3 && year2 <= 29 && month >= 1 && month <= 12) {
        return singleCandidateMatch(m[0], 2000 + year2, 'gandl_tribute_korea', listingYear);
      }
    }
  }

  return null;
}
