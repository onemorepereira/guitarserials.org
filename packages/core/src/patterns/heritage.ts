import { singleCandidateMatch } from '../buildMatch.js';
import { HERITAGE_DOUBLE_LETTER_BASE, HERITAGE_SINGLE_LETTER_BASE } from '../helpers.js';
import type { SerialMatch } from '../types.js';

export function matchHeritage(text: string, listingYear: number | null): SerialMatch | null {
  // Double letter (post-2009): A + second letter + 5 digits.
  // Must precede the single-letter match so AA/AB/... win.
  {
    const m = text.match(/^(A[A-Z])(\d{5})$/);
    if (m) {
      const decoded = HERITAGE_DOUBLE_LETTER_BASE[m[1] as string] ?? null;
      return singleCandidateMatch(m[0], decoded, 'heritage_double', listingYear);
    }
  }

  // Single letter: B-Z + 5 digits.
  {
    const m = text.match(/^([B-Z])(\d{5})$/);
    if (m) {
      const decoded = HERITAGE_SINGLE_LETTER_BASE[m[1] as string] ?? null;
      return singleCandidateMatch(m[0], decoded, 'heritage_single', listingYear);
    }
  }

  // HC prefix Custom Shop: HC1YYXXXX.
  {
    const m = text.match(/^HC1(\d{2})(\d{4})$/);
    if (m) {
      const decoded = 2000 + parseInt(m[1] as string, 10);
      return singleCandidateMatch(m[0], decoded, 'heritage_cs', listingYear, 'high');
    }
  }
  {
    const m = text.match(/^HC(\d{4,7})$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'heritage_cs', listingYear, 'high');
    }
  }

  // Numeric: 1 + 6 digits, digits 2-3 = year (2020+).
  {
    const m = text.match(/^1(\d{6})$/);
    if (m) {
      const year2 = parseInt((m[1] as string).slice(0, 2), 10);
      return singleCandidateMatch(m[0], 2000 + year2, 'heritage_standard', listingYear);
    }
  }

  // Bare 6-digit Kalamazoo stamp — match but no year decode.
  {
    const m = text.match(/^\d{6}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'heritage_numeric_6', listingYear);
    }
  }

  return null;
}
