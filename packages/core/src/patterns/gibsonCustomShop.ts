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
  // Format MYRRR or MYRRRR where:
  //   M = model-year digit (0=R0/1960, 4=R4/1954, 7=R7/1957, 8=R8/1958, 9=R9/1959)
  //   Y = last digit of build year
  //   RRR or RRRR = production rank
  // When M is an R-series model digit AND a listing year is provided, we snap
  // Y to the closest valid CS production decade (CS launched 1993). Without a
  // listing year, or when M is not an R-series digit, we still claim the
  // format but leave decoded year null — the listing year can be added later
  // to pin the build year.
  {
    const m = text.match(/^(\d)(\d)(\d{3,4})$/);
    const isCs = isCsBrand || isGibsonHistoricReissue(modelHint);
    if (m && isCs) {
      const modelDigit = parseInt(m[1] as string, 10);
      const yearDigit = parseInt(m[2] as string, 10);
      const isRSeriesModel =
        modelDigit === 0 ||
        modelDigit === 4 ||
        modelDigit === 7 ||
        modelDigit === 8 ||
        modelDigit === 9;
      if (isRSeriesModel && listingYear !== null) {
        const options = [
          1990 + yearDigit,
          2000 + yearDigit,
          2010 + yearDigit,
          2020 + yearDigit,
        ].filter((y) => y >= 1993 && y <= 2030);
        if (options.length > 0) {
          const best = options.reduce((acc, y) =>
            Math.abs(y - listingYear) < Math.abs(acc - listingYear) ? y : acc,
          );
          return singleCandidateMatch(m[0], best, 'gibson_cs_historic', listingYear);
        }
      }
      return singleCandidateMatch(m[0], null, 'gibson_cs_historic', listingYear);
    }
  }

  return null;
}
