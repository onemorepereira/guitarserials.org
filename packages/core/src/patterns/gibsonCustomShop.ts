import { buildMatch, singleCandidateMatch } from '../buildMatch.js';
import { csSnapYearSingle, csYearFromYy, isGibsonHistoricReissue } from '../helpers.js';
import type { SerialMatch, SerialMatchCandidate } from '../types.js';

/**
 * Match Gibson Custom Shop serial patterns.
 *
 * @param isCsBrand true when caller dispatched on "Gibson Custom Shop" brand;
 * controls whether the 5-6 digit historic-reissue fallback fires without
 * needing a model-hint indicator.
 */
export function matchGibsonCustomShop(
  text: string,
  listingYear: number | null,
  modelHint: string | null = null,
  isCsBrand = false,
): SerialMatch | null {
  // CS prefix: Gibson Custom Shop, launched 1993.
  //   3-5 digits: CSYRRR(R) — single-digit year, snap to closest decade.
  //   6 digits: ambiguous CSYRRRRR (single Y + 5-rank) vs CSYYRRRR (YY + 4-rank);
  //            emit both candidates and let the year-gap tier rule pick.
  {
    const m = text.match(/^CS(\d{3,6})$/);
    if (m) {
      const digits = m[1] as string;
      const serial = m[0];
      const candidates: SerialMatchCandidate[] = [];

      const ySingle = parseInt(digits[0] as string, 10);
      const yearSingle = csSnapYearSingle(ySingle, listingYear);
      if (yearSingle !== null) {
        candidates.push({ serial, decodedYear: yearSingle, brandFormat: 'gibson_cs' });
      } else if (listingYear === null) {
        candidates.push({ serial, decodedYear: null, brandFormat: 'gibson_cs' });
      }

      if (digits.length >= 6) {
        const yy = parseInt(digits.slice(0, 2), 10);
        const yearDouble = csYearFromYy(yy);
        if (yearDouble !== null) {
          candidates.push({
            serial,
            decodedYear: yearDouble,
            brandFormat: 'gibson_cs_yyrrrr',
          });
        }
      }

      if (candidates.length === 0) return null;

      let best: SerialMatchCandidate;
      if (listingYear !== null && candidates.length > 1) {
        best = candidates.reduce((acc, c) => {
          const accYear = acc.decodedYear ?? 9999;
          const cYear = c.decodedYear ?? 9999;
          return Math.abs(cYear - listingYear) < Math.abs(accYear - listingYear) ? c : acc;
        });
      } else {
        best = candidates[0] as SerialMatchCandidate;
      }
      return buildMatch(serial, candidates, best, listingYear);
    }
  }

  // Collector's Choice: CC<series>A<rank>, e.g. CC34A103.
  {
    const m = text.match(/^CC\d{1,3}A\d{1,4}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'gibson_cs_collectors_choice', listingYear, 'high');
    }
  }

  // Artist / limited-edition prefixes.
  {
    const m = text.match(
      /^(JP|JPP|AFD|VHS|JB|BG|PF|PETE|ACE|AF|ANACONDA|BGGT|BR|CR|CWE|DS|GC|JCW|JDG|JOEB|R40|RG|ROY|SL|SLASH58V|SVOS|AL)\d{2,5}$/,
    );
    if (m) {
      return singleCandidateMatch(m[0], null, 'gibson_cs_artist', listingYear, 'high');
    }
  }

  // Pete Townshend: PT + 3 digits.
  {
    const m = text.match(/^PT\d{3}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'gibson_cs_artist', listingYear, 'high');
    }
  }

  // ES reissue F-hole labels: A8YRRRR / A9YRRRR.
  {
    const m = text.match(/^A[89]\d{4,5}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'gibson_cs_es_reissue', listingYear, 'high');
    }
  }

  // Historic Reissue: 5-6 digit pure numeric. Gated on CS-brand or model hint.
  {
    const m = text.match(/^\d{5,6}$/);
    const isCs = isCsBrand || isGibsonHistoricReissue(modelHint);
    if (m && listingYear !== null && isCs) {
      return singleCandidateMatch(m[0], null, 'gibson_cs_historic', listingYear);
    }
  }

  return null;
}
