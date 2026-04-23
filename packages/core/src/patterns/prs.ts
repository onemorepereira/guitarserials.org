import { singleCandidateMatch } from '../buildMatch.js';
import { PRS_CTI_YEAR_BASE } from '../helpers.js';
import type { SerialMatch } from '../types.js';

export function matchPrs(text: string, listingYear: number | null): SerialMatch | null {
  // S2 prefix: S2 + 6-7 digits (sequential, no year encoded).
  {
    const m = text.match(/^S2\d{6,7}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'prs_s2', listingYear, 'high');
    }
  }

  // CE prefix: CE + 4-6 digits.
  {
    const m = text.match(/^CE\d{4,6}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'prs_ce', listingYear, 'high');
    }
  }

  // CTI prefix: CTI + letter + 4-6 digits (Indonesia 2018+).
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

  // SE Indonesia IA-IE prefix (2014-2018).
  {
    const m = text.match(/^I([A-E])(\d{4,6})$/);
    if (m) {
      const yearOffset = (m[1] as string).charCodeAt(0) - 'A'.charCodeAt(0);
      return singleCandidateMatch(m[0], 2014 + yearOffset, 'prs_ia', listingYear, 'high');
    }
  }

  // Core 2008+: first 2 digits = year (08, 09, 10-29).
  {
    const m = text.match(/^(0[89]|[12]\d)(\d{4,6})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      return singleCandidateMatch(m[0], 2000 + year2, 'prs_core', listingYear);
    }
  }

  return null;
}
