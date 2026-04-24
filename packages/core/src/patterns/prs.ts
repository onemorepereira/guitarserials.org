import { singleCandidateMatch } from '../buildMatch.js';
import { PRS_CTI_YEAR_BASE } from '../helpers.js';
import type { SerialMatch } from '../types.js';

/**
 * PRS serial-number ranges — every table below is sourced from PRS's own
 * support article:
 *   https://support.prsguitars.com/hc/en-us/articles/4408314427547-Year-Identification
 * (last consulted 2026-04-24).
 *
 * Each table is [year, sequentialStart, sequentialEnd] inclusive. The sequence
 * is cumulative within each model line, so the first year whose `end` ≥ input
 * wins.
 *
 * PRS publishes these as "approximate" — we lose no information by matching
 * them verbatim, including a small number of known typos in the published
 * table (see comments at each).
 */

/** Set-neck (Core) models, 1985–2024. */
const PRS_SET_NECK_RANGES: Array<[number, number, number]> = [
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
  [2006, 103104, 114940],
  [2007, 114941, 132401],
  [2008, 132402, 146419],
  [2009, 146420, 159132],
  [2010, 159133, 170591],
  [2011, 170592, 183862],
  [2012, 183863, 196410],
  [2013, 196411, 206059],
  [2014, 206060, 215491],
  [2015, 215492, 224954],
  [2016, 224955, 236147],
  [2017, 236148, 248633],
  [2018, 248634, 271078],
  [2019, 271079, 298384],
  [2020, 298385, 315748],
  [2021, 315749, 340165],
  [2022, 340166, 354905],
  // 2023 — PRS's published table reads "035906 - 363798" which is a
  // transcription typo; the continuation from 2022's end (354905) gives
  // 354906 as the correct start.
  [2023, 354906, 363798],
  // 2024 — there's a gap 363799-375042 in PRS's published data; values in
  // that gap don't match any year range and will fall through to year=null.
  [2024, 375043, 397950],
];

/** S2 Series, 2013–2024. Sequence is the digits AFTER the literal "S2". */
const PRS_S2_RANGES: Array<[number, number, number]> = [
  [2013, 1, 3820],
  [2014, 3821, 10529],
  [2015, 10530, 17390],
  [2016, 17391, 23214],
  [2017, 23215, 27902],
  [2018, 27903, 36779],
  [2019, 36780, 43719],
  // 2019/2020 overlap at 43719 in the PRS source. First-match-wins returns
  // 2019 for that exact boundary value.
  [2020, 43720, 49421],
  [2021, 49422, 59387],
  [2022, 59388, 65338],
  [2023, 65339, 67488],
  // Gap from 67489 to 71819 in PRS's published data.
  [2024, 71820, 78569],
];

/** CE models 1988–2008. Prefix is "7" pre-1998, "7 or CE" in 1998, "CE" after. */
const PRS_CE_RANGES: Array<[number, number, number]> = [
  [1988, 1, 270],
  [1989, 271, 1830],
  [1990, 1831, 3200],
  [1991, 3201, 4540],
  [1992, 4541, 7090],
  [1993, 7091, 8820],
  [1994, 8821, 10700],
  [1995, 10701, 13000],
  [1996, 13001, 14680],
  [1997, 14681, 17130],
  [1998, 17131, 19580],
  [1999, 19581, 20749],
  [2000, 20750, 21599],
  [2001, 21600, 23199],
  [2002, 23200, 25389],
  [2003, 25390, 26399],
  [2004, 26400, 27900],
  [2005, 27901, 29377],
  [2006, 29378, 31800],
  [2007, 31801, 32783],
  [2008, 32784, 33881],
];

/** EG models (electric, maple top + fender-style body), 1990–1995. Prefix "5". */
const PRS_EG_RANGES: Array<[number, number, number]> = [
  [1990, 1, 920],
  [1991, 921, 1290],
  [1992, 1291, 2070],
  [1993, 2071, 2870],
  [1994, 2871, 3190],
  [1995, 3191, 3300],
];

/** Swamp Ash Special, 1997–2009. Prefix "8" pre-1998, "8 or SA" in 1998, "SA" after. */
const PRS_SWAMP_ASH_RANGES: Array<[number, number, number]> = [
  [1997, 1, 410],
  [1998, 411, 760],
  [1999, 761, 969],
  [2000, 970, 1179],
  [2001, 1180, 1399],
  [2002, 1400, 1899],
  [2003, 1900, 2099],
  [2004, 2100, 2287],
  [2005, 2288, 2700],
  [2006, 2701, 2800],
  [2007, 2801, 3055],
  [2008, 3056, 3256],
  [2009, 3257, 3312],
];

/** Bolt-on bass, 1989–1991. Prefix "4". */
const PRS_BASS_BOLT_ON_RANGES: Array<[number, number, number]> = [
  [1989, 1, 30],
  [1990, 31, 140],
  [1991, 141, 200],
];

/** Set-neck bass, 1986–1991. Prefix "9". (PRS lists 1986/87 as one row.) */
const PRS_BASS_SET_NECK_RANGES: Array<[number, number, number]> = [
  [1987, 1, 230],
  [1988, 231, 350],
  [1989, 351, 680],
  [1990, 681, 730],
  [1991, 731, 800],
];

/** Electric Bass, 2000–2004. Literal "EB" prefix. */
const PRS_BASS_ELECTRIC_RANGES: Array<[number, number, number]> = [
  [2000, 7, 72],
  [2001, 73, 199],
  [2002, 200, 422],
  [2003, 423, 501],
  [2004, 502, 650],
];

/** Look up a sequential in a range table. First matching row wins. */
function findYearInRanges(
  sequential: number,
  ranges: Array<[number, number, number]>,
): number | null {
  for (const [year, start, end] of ranges) {
    if (sequential >= start && sequential <= end) return year;
  }
  return null;
}

/**
 * Pre-2008 Core/CE year cross-check: the single-digit year prefix must match
 * the last digit of the year the sequential decodes to, otherwise the decode
 * isn't a valid Core serial. Callers that want to try CE / Swamp Ash / EG /
 * bass tables can do so when this returns null.
 */
function prePRS2008Year(sequential: number, yearDigit: number): number | null {
  for (const [year, start, end] of PRS_SET_NECK_RANGES) {
    if (sequential >= start && sequential <= end && year % 10 === yearDigit) return year;
  }
  return null;
}

/**
 * Heuristic: return true if the model hint sounds like a CE, Swamp Ash, EG,
 * or bass instrument. Used to disambiguate single-digit-prefix serials where
 * the same digit (e.g. "7") has different meaning in different model lines.
 */
function matchesHint(hint: string | null, needles: string[]): boolean {
  if (!hint) return false;
  const h = hint.toLowerCase();
  return needles.some((n) => h.includes(n.toLowerCase()));
}

export function matchPrs(
  text: string,
  listingYear: number | null,
  modelHint: string | null = null,
): SerialMatch | null {
  // -------- S2 Series --------
  // S2 + 6 or 7 digits. Decode via the official S2 sequential range table;
  // fall back to null-year for sequentials outside the documented ranges.
  {
    const m = text.match(/^S2(\d{6,7})$/);
    if (m) {
      const sequential = parseInt(m[1] as string, 10);
      const decoded = findYearInRanges(sequential, PRS_S2_RANGES);
      return singleCandidateMatch(m[0], decoded, 'prs_s2', listingYear, 'high');
    }
  }

  // -------- Electric Bass (EB prefix, literal) --------
  // EB + 5 digits. No collision with other PRS formats.
  {
    const m = text.match(/^EB(\d{1,5})$/);
    if (m) {
      const sequential = parseInt(m[1] as string, 10);
      const decoded = findYearInRanges(sequential, PRS_BASS_ELECTRIC_RANGES);
      return singleCandidateMatch(m[0], decoded, 'prs_bass_electric', listingYear, 'high');
    }
  }

  // -------- CE-prefix (literal "CE" — 1998+) --------
  // CE + 4-6 digits. Decode via CE table; falls back to null if sequential is
  // outside documented ranges.
  {
    const m = text.match(/^CE(\d{1,6})$/);
    if (m) {
      const sequential = parseInt(m[1] as string, 10);
      const decoded = findYearInRanges(sequential, PRS_CE_RANGES);
      return singleCandidateMatch(m[0], decoded, 'prs_ce', listingYear, 'high');
    }
  }

  // -------- Swamp Ash Special (literal "SA" prefix, 1998+) --------
  {
    const m = text.match(/^SA(\d{1,6})$/);
    if (m) {
      const sequential = parseInt(m[1] as string, 10);
      const decoded = findYearInRanges(sequential, PRS_SWAMP_ASH_RANGES);
      return singleCandidateMatch(m[0], decoded, 'prs_swamp_ash', listingYear, 'high');
    }
  }

  // -------- CTI (Indonesia, 2018+) --------
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

  // -------- SE Indonesia IA–IE (2014–2018) --------
  {
    const m = text.match(/^I([A-E])(\d{4,6})$/);
    if (m) {
      const yearOffset = (m[1] as string).charCodeAt(0) - 'A'.charCodeAt(0);
      return singleCandidateMatch(m[0], 2014 + yearOffset, 'prs_ia', listingYear, 'high');
    }
  }

  // -------- Acoustic A + YY (2009+) --------
  {
    const m = text.match(/^A(\d{2})(\d{4,6})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      if (year2 >= 9 && year2 <= 29) {
        return singleCandidateMatch(m[0], 2000 + year2, 'prs_acoustic', listingYear, 'high');
      }
    }
  }

  // -------- SE Korea single-letter year (2000–2022) --------
  {
    const m = text.match(/^([A-W])(\d{3,6})$/);
    if (m) {
      const year = 2000 + ((m[1] as string).charCodeAt(0) - 'A'.charCodeAt(0));
      return singleCandidateMatch(m[0], year, 'prs_se_korea', listingYear, 'high');
    }
  }

  // -------- Core / CE 2008+ two-digit year prefix --------
  {
    const m = text.match(/^(0[89]|[12]\d)(\d{4,6})$/);
    if (m) {
      const year2 = parseInt(m[1] as string, 10);
      return singleCandidateMatch(m[0], 2000 + year2, 'prs_core', listingYear);
    }
  }

  // -------- Pre-2008 Core / CE single-digit year (1985–2007) --------
  // Prefix is last digit of the year; cross-check against the set-neck table.
  // If the Y-check fails we fall through to the model-line specific tables
  // below (CE pre-1998 with "7" prefix, Swamp Ash with "8", EG with "5",
  // bass with "4"/"9"). Gated on model hint so we don't silently promote a
  // genuinely-Core-null-year match to a wrong CE decode.
  {
    const m = text.match(/^(\d)(\d{4,6})$/);
    if (m) {
      const yearDigit = parseInt(m[1] as string, 10);
      const sequential = parseInt(m[2] as string, 10);

      // First try: is this a valid set-neck Core serial?
      const coreYear = prePRS2008Year(sequential, yearDigit);
      if (coreYear !== null) {
        return singleCandidateMatch(m[0], coreYear, 'prs_core_pre2008', listingYear);
      }

      // Y-cross-check failed. Try model-line tables when the hint supports.
      if (yearDigit === 7 && matchesHint(modelHint, ['ce'])) {
        const ceYear = findYearInRanges(sequential, PRS_CE_RANGES);
        if (ceYear !== null) {
          return singleCandidateMatch(m[0], ceYear, 'prs_ce', listingYear, 'high');
        }
      }
      if (yearDigit === 8 && matchesHint(modelHint, ['swamp ash', 'swamp-ash', 'swampash'])) {
        const saYear = findYearInRanges(sequential, PRS_SWAMP_ASH_RANGES);
        if (saYear !== null) {
          return singleCandidateMatch(m[0], saYear, 'prs_swamp_ash', listingYear, 'high');
        }
      }
      if (yearDigit === 5 && matchesHint(modelHint, ['eg'])) {
        const egYear = findYearInRanges(sequential, PRS_EG_RANGES);
        if (egYear !== null) {
          return singleCandidateMatch(m[0], egYear, 'prs_eg', listingYear, 'high');
        }
      }
      if (yearDigit === 4 && matchesHint(modelHint, ['bass'])) {
        const boltYear = findYearInRanges(sequential, PRS_BASS_BOLT_ON_RANGES);
        if (boltYear !== null) {
          return singleCandidateMatch(m[0], boltYear, 'prs_bass_bolt_on', listingYear, 'high');
        }
      }
      if (yearDigit === 9 && matchesHint(modelHint, ['bass'])) {
        const setNeckYear = findYearInRanges(sequential, PRS_BASS_SET_NECK_RANGES);
        if (setNeckYear !== null) {
          return singleCandidateMatch(m[0], setNeckYear, 'prs_bass_set_neck', listingYear, 'high');
        }
      }

      // No table matched. Return the core format with year=null (the seq
      // didn't fall in any year that would explain the Y-digit).
      return singleCandidateMatch(m[0], null, 'prs_core_pre2008', listingYear);
    }
  }

  return null;
}
