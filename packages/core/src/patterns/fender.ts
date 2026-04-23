import { buildMatch, singleCandidateMatch } from '../buildMatch.js';
import { isFenderAvri } from '../helpers.js';
import type { SerialMatch, SerialMatchCandidate } from '../types.js';

export function matchFender(
  text: string,
  listingYear: number | null,
  modelHint: string | null = null,
): SerialMatch | null {
  // US prefix: US + 6-9 digits + optional letter (YY + seq).
  {
    const m = text.match(/^US(\d{6,9})[A-Z]?$/);
    if (m) {
      const year2 = parseInt((m[1] as string).slice(0, 2), 10);
      const decodedYear = year2 < 50 ? 2000 + year2 : 1900 + year2;
      return singleCandidateMatch(m[0], decodedYear, 'fender_us_prefix', listingYear, 'high');
    }
  }

  // MX prefix: MX + 8 digits + optional letter.
  {
    const m = text.match(/^MX(\d{8})[A-Z]?$/);
    if (m) {
      const year2 = parseInt((m[1] as string).slice(0, 2), 10);
      const decodedYear = year2 < 50 ? 2000 + year2 : 1900 + year2;
      return singleCandidateMatch(m[0], decodedYear, 'fender_mx', listingYear, 'high');
    }
  }

  // MN prefix: MN + 5-7 digits (Mexico 1990s, Y + 4-6 seq).
  {
    const m = text.match(/^MN(\d)(\d{4,6})$/);
    if (m) {
      const yearDigit = parseInt(m[1] as string, 10);
      return singleCandidateMatch(m[0], 1990 + yearDigit, 'fender_mn', listingYear, 'high');
    }
  }

  // MZ prefix: MZ + 5-7 digits (Mexico 2000s).
  {
    const m = text.match(/^MZ(\d)(\d{4,6})$/);
    if (m) {
      const yearDigit = parseInt(m[1] as string, 10);
      return singleCandidateMatch(m[0], 2000 + yearDigit, 'fender_mz', listingYear, 'high');
    }
  }

  // DN prefix: DN + 5-6 digits (USA Deluxe, 1998-1999).
  {
    const m = text.match(/^DN(\d)(\d{4,5})$/);
    if (m) {
      const yearDigit = parseInt(m[1] as string, 10);
      return singleCandidateMatch(m[0], 1990 + yearDigit, 'fender_dn', listingYear, 'high');
    }
  }

  // Decade-prefix headstock serials (post-1976 USA).
  // DZ listed before Z so the specific two-letter prefix wins.
  const decadePrefixes: Array<[string, number, string]> = [
    ['DZ', 2000, 'fender_dz_prefix'],
    ['S', 1970, 'fender_s_prefix'],
    ['E', 1980, 'fender_e_prefix'],
    ['N', 1990, 'fender_n_prefix'],
    ['Z', 2000, 'fender_z_prefix'],
  ];
  for (const [prefix, baseYear, fmt] of decadePrefixes) {
    const m = text.match(new RegExp(`^${prefix}(\\d)(\\d{4,6})$`));
    if (m) {
      const yearDigit = parseInt(m[1] as string, 10);
      return singleCandidateMatch(m[0], baseYear + yearDigit, fmt, listingYear);
    }
  }

  // V prefix: AVRI, definitive — no year encoded.
  {
    const m = text.match(/^V(\d{4,7})$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'fender_avri_v_prefix', listingYear, 'high');
    }
  }

  // CS prefix: Fender Custom Shop.
  {
    const m = text.match(/^CS(\d{5,6})$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'fender_cs', listingYear, 'high');
    }
  }

  // VS prefix: Vintera/Vintera Special (Mexico 2020s+, YY + seq).
  {
    const m = text.match(/^VS(\d{6})$/);
    if (m) {
      const year2 = parseInt((m[1] as string).slice(0, 2), 10);
      const decodedYear = year2 < 50 ? 2000 + year2 : 1900 + year2;
      return singleCandidateMatch(m[0], decodedYear, 'fender_vs', listingYear, 'high');
    }
  }

  // HR prefix: Custom Shop masterbuilt.
  {
    const m = text.match(/^HR\d{5,6}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'fender_cs_masterbuilt', listingYear, 'high');
    }
  }

  // JD prefix: Japan 2011+, YY + 6-digit seq.
  {
    const m = text.match(/^JD(\d{8})$/);
    if (m) {
      const year2 = parseInt((m[1] as string).slice(0, 2), 10);
      const decodedYear = year2 < 50 ? 2000 + year2 : 1900 + year2;
      return singleCandidateMatch(m[0], decodedYear, 'fender_jd', listingYear, 'high');
    }
  }

  // CZ prefix: Custom Shop 2000s+.
  {
    const m = text.match(/^CZ\d{5,6}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'fender_cz', listingYear, 'high');
    }
  }

  // MS prefix: Mod Shop (2021+) — MS + YY + 4-digit seq.
  {
    const m = text.match(/^MS(\d{2})(\d{4})$/);
    if (m) {
      const decodedYear = 2000 + parseInt(m[1] as string, 10);
      return singleCandidateMatch(m[0], decodedYear, 'fender_mod_shop', listingYear, 'high');
    }
  }

  // R prefix: Custom Shop Time Machine.
  {
    const m = text.match(/^R\d{5,6}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'fender_cs_time_machine', listingYear, 'high');
    }
  }

  // XN prefix: American Custom series.
  {
    const m = text.match(/^XN\d{5}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'fender_cs_american_custom', listingYear, 'high');
    }
  }

  // Fender 8-digit neck plate (1965-1976, no prefix).
  {
    const m = text.match(/^[1-9]\d{7}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'fender_neckplate', listingYear);
    }
  }

  // AVRI bridge-plate short numeric (4-5 digits), model-gated.
  if (isFenderAvri(modelHint)) {
    const m = text.match(/^\d{4,5}$/);
    if (m) {
      const cand: SerialMatchCandidate = {
        serial: m[0],
        decodedYear: null,
        brandFormat: 'fender_avri_bridge',
        sourceTag: 'bridge',
        confidenceCap: 'medium',
      };
      return buildMatch(m[0], [cand], cand, listingYear);
    }
  }

  return null;
}
