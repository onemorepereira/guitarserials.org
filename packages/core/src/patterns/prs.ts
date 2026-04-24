import { singleCandidateMatch } from '../buildMatch.js';
import { PRS_CTI_YEAR_BASE } from '../helpers.js';
import type { SerialMatch } from '../types.js';

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
  // 1995, or 2005). Disambiguation requires a cumulative-production-range
  // table (see hendrixguitars.com PRS reference); we recognize the format
  // and leave decoded_year=null. With a listing year, the three-tier rule
  // provides correct behavior via the confidence cap.
  // See doc/audits/2026-04-23-source-audit.md §P-1.
  {
    const m = text.match(/^(\d)(\d{4,6})$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'prs_core_pre2008', listingYear);
    }
  }

  return null;
}
