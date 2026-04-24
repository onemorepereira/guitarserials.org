import { singleCandidateMatch } from '../buildMatch.js';
import { PRS_CTI_YEAR_BASE } from '../helpers.js';
import type { SerialMatch } from '../types.js';

/**
 * PRS set-neck cumulative-production ranges, 1985–2007.
 * Each tuple is [year, sequentialStart, sequentialEnd] (inclusive).
 * Source: hendrixguitars.com PRS Set-Neck Sequential Serial Numbers.
 * 2007 end is extrapolated from 2008 being the transition to YY-prefix.
 */
const PRS_PRE2008_RANGES: Array<[number, number, number]> = [
  [1985, 1, 400],
  [1986, 401, 1700],
  [1987, 1701, 3500],
  [1988, 3501, 5400],
  [1989, 5401, 7600],
  [1990, 7601, 10100],
  [1991, 10101, 12600],
  [1992, 12601, 15000],
  [1993, 15001, 17900],
  [1994, 17901, 20900],
  [1995, 20901, 24600],
  [1996, 24601, 29500],
  [1997, 29501, 34600],
  [1998, 34601, 39100],
  [1999, 39101, 44499],
  [2000, 44500, 52199],
  [2001, 52200, 62199],
  [2002, 62200, 72353],
  [2003, 72354, 82254],
  [2004, 82255, 92555],
  [2005, 92556, 103103],
  // 2006+ boundaries not publicly documented. 103104+ lands in 2006-2007.
];

/**
 * Decode a pre-2008 PRS Core/CE serial via the cumulative range table.
 * Returns the year whose range contains the sequential number, or null
 * if the serial falls outside documented ranges.
 */
function prePRS2008Year(sequential: number, yearDigit: number): number | null {
  for (const [year, start, end] of PRS_PRE2008_RANGES) {
    if (sequential >= start && sequential <= end) {
      // Confirm the year's last digit matches the prefix digit to rule
      // out collisions (same sequential could theoretically span decades).
      if (year % 10 === yearDigit) return year;
    }
  }
  // Above documented range (103104+) and yearDigit in {6, 7} → 2006 or 2007.
  if (sequential > 103103) {
    if (yearDigit === 6) return 2006;
    if (yearDigit === 7) return 2007;
  }
  return null;
}

export function matchPrs(text: string, listingYear: number | null): SerialMatch | null {
  // S2 prefix: S2 + 6-7 digits. Sequential only — year inferrable from
  // cumulative production ranges (2013: S2000001-S2003820; 2014: S2003821+;
  // later years per year), but we don't bake the production table into the
  // matcher. See doc/audits/2026-04-23-source-audit.md §P-4.
  {
    const m = text.match(/^S2\d{6,7}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'prs_s2', listingYear, 'high');
    }
  }

  // CE prefix: CE + 4-6 digits. Uncommon — standard CE serials on the
  // neck plate follow the year-prefix convention handled below. Kept
  // pending photographic confirmation of live CE-prefixed stamps.
  // See doc/audits/2026-04-23-source-audit.md §P-5.
  {
    const m = text.match(/^CE\d{4,6}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'prs_ce', listingYear, 'high');
    }
  }

  // CTI prefix: CTI + letter + 4-6 digits (Indonesia, 2018+). Letter
  // encodes year: A=2018, B=2019, ...
  {
    const m = text.match(/^CTI([A-Z])(\d{4,6})$/);
    if (m) {
      const yearOffset = (m[1] as string).charCodeAt(0) - 'A'.charCodeAt(0);
      return singleCandidateMatch(
        m[0],
        PRS_CTI_YEAR_BASE + yearOffset,
        'prs_cti',
        listingYear,
        'high',
      );
    }
  }

  // SE Indonesia IA–IE (2014–2018): I + letter A–E + 4-6 digits.
  // IA=2014, IB=2015, IC=2016, ID=2017, IE=2018.
  {
    const m = text.match(/^I([A-E])(\d{4,6})$/);
    if (m) {
      const yearOffset = (m[1] as string).charCodeAt(0) - 'A'.charCodeAt(0);
      return singleCandidateMatch(m[0], 2014 + yearOffset, 'prs_ia', listingYear, 'high');
    }
  }

  // Acoustic A-prefix (PRS acoustics launched 2009): A + YY + 4–6 sequential.
  // YY is gated to 09–29 (plausible years) to avoid shadowing SE Korea A-letter.
  // See doc/audits/2026-04-23-source-audit.md §P-3.
  {
    const m = text.match(/^A(\d{2})(\d{4,6})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      if (year2 >= 9 && year2 <= 29) {
        return singleCandidateMatch(m[0], 2000 + year2, 'prs_acoustic', listingYear, 'high');
      }
    }
  }

  // SE Korea single-letter year prefix (2000–2022): letter A–W + 3–6 digits.
  // A=2000, B=2001, ..., U=2020, V=2021, W=2022. Produced primarily by
  // World Musical Instruments. Extended to V/W per community references;
  // letters beyond W not yet confirmed publicly.
  // See doc/audits/2026-04-23-source-audit.md §P-2.
  {
    const m = text.match(/^([A-W])(\d{3,6})$/);
    if (m) {
      const year = 2000 + ((m[1] as string).charCodeAt(0) - 'A'.charCodeAt(0));
      return singleCandidateMatch(m[0], year, 'prs_se_korea', listingYear, 'high');
    }
  }

  // Core / CE 2008+: first 2 digits are last two digits of year (08–29).
  {
    const m = text.match(/^(0[89]|[12]\d)(\d{4,6})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      return singleCandidateMatch(m[0], 2000 + year2, 'prs_core', listingYear);
    }
  }

  // Pre-2008 Core / CE single-digit year (1985–2007): Y + 4–6 sequential.
  // Single-digit year is ambiguous across decades (e.g. Y=5 could be 1985,
  // 1995, or 2005). We disambiguate via the cumulative-production-range
  // table from hendrixguitars.com — the sequential number narrows to a
  // single year when it falls in a documented range.
  // See doc/audits/2026-04-23-source-audit.md §P-1.
  {
    const m = text.match(/^(\d)(\d{4,6})$/);
    if (m) {
      const yearDigit = parseInt(m[1] as string, 10);
      const sequential = parseInt(m[2] as string, 10);
      const decoded = prePRS2008Year(sequential, yearDigit);
      return singleCandidateMatch(m[0], decoded, 'prs_core_pre2008', listingYear);
    }
  }

  return null;
}
