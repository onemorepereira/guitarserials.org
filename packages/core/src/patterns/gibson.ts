import { buildMatch, dayOfYearToMonthDay, singleCandidateMatch } from '../buildMatch.js';
import { isGibsonStudentLine, isLesPaulClassic } from '../helpers.js';
import type { SerialMatch, SerialMatchCandidate } from '../types.js';
import { matchGibsonCustomShop } from './gibsonCustomShop.js';

/**
 * Match Gibson 8-digit and 9-digit serial numbers.
 *
 * Eras:
 *  - 1977-2005: 8-digit YDDDYRRR (pos 1+5 = year, 2-4 = day of year)
 *  - 2005-2014: 9-digit YDDDYBRRR
 *  - 2014-mid 2019: 9-digit YYNNNNNNN
 *  - mid 2019+: 9-digit YDDDYBRRR
 *
 * Plus earlier eras handled below: pre-1961 4-digit Junior/Special,
 * 1947-1961 A-series hollowbody (A-prefix labels), 1952-1961 FON
 * letter-prefix (Q-Z, interior-stamped), 1961-1975 die-stamped
 * peghead serials, 1975-1977 decal.
 */

/**
 * Gibson Factory Order Number (FON) letter-prefix chart, 1952-1961.
 * Letters run backwards through the alphabet as Gibson added prefixes each year.
 * FONs are ink-stamped INSIDE the instrument (not on the headstock).
 */
const GIBSON_FON_LETTER_YEAR: Record<string, number> = {
  Z: 1952,
  Y: 1953,
  X: 1954,
  W: 1955,
  V: 1956,
  U: 1957,
  T: 1958,
  S: 1959,
  R: 1960,
  Q: 1961,
};

/**
 * Gibson A-series hollowbody labels, 1947-1961.
 * Label colors: white A-100 through A-18750 (Jan 12, 1955), orange
 * A-20001 onward (Jan 13, 1955), through A-36147 (final A-prefix, 1961).
 * Year boundaries from Gibson's official acoustic serialization chart.
 */
const GIBSON_A_SERIES_RANGES: Array<[number, number, number]> = [
  // [yearStart, serialStart, serialEnd]
  [1947, 100, 1304],
  [1948, 1305, 2665],
  [1949, 2666, 4413],
  [1950, 4414, 6597],
  [1951, 6598, 9419],
  [1952, 9420, 12462],
  [1953, 12463, 16101],
  [1954, 16102, 18667],
  // Jan 1955 switched white to orange label; 18668-18750 white, 20001+ orange.
  // 18751-20000 reserved / not used — matcher tolerates by skipping the gap.
  [1955, 18668, 21909],
  [1956, 21910, 25502],
  [1957, 25503, 27913],
  [1958, 27914, 30474],
  [1959, 30475, 32700],
  [1960, 32701, 35640],
  [1961, 35641, 36147],
];

function aSeriesYear(num: number): number | null {
  for (const [year, start, end] of GIBSON_A_SERIES_RANGES) {
    if (num >= start && num <= end) return year;
  }
  return null;
}

export function matchGibson(
  text: string,
  listingYear: number | null,
  modelHint: string | null = null,
): SerialMatch | null {
  // Les Paul Classic reissue-style ink-stamped serials (evaluated before CS historic).
  if (isLesPaulClassic(modelHint)) {
    if (listingYear !== null && listingYear >= 1989 && listingYear <= 1999) {
      const m = text.match(/^\d{4,6}$/);
      if (m) {
        return singleCandidateMatch(m[0], null, 'gibson_lp_classic_1989_1999', listingYear);
      }
    }
    if (listingYear !== null && listingYear >= 2000 && listingYear <= 2014) {
      const m = text.match(/^(\d{2})(\d{4})$/);
      if (m) {
        const decoded = 2000 + parseInt(m[1] as string, 10);
        return singleCandidateMatch(m[0], decoded, 'gibson_lp_classic_2000_2014', listingYear);
      }
    }
  }

  // Try CS / artist prefixes — sellers often list CS guitars as just "Gibson".
  // isCsBrand stays false: plain Gibson has no implicit CS authority; the 5-6
  // digit historic fallback is gated on the model hint.
  const csMatch = matchGibsonCustomShop(text, listingYear, modelHint, false);
  if (csMatch) return csMatch;

  // 1975-1977 Gibson USA 8-digit decals.
  {
    const yearMap: Record<string, number> = { '99': 1975, '00': 1976, '06': 1977 };
    const m = text.match(/^(99|00|06)(\d{6})$/);
    if (m && listingYear !== null && listingYear >= 1973 && listingYear <= 1979) {
      return singleCandidateMatch(
        m[0],
        yearMap[m[1] as string] as number,
        'gibson_1975_1977',
        listingYear,
      );
    }
  }

  // Removed: the 1994 Centennial "94 + 6 digits" rule previously lived here.
  // Per guitarhq.com, the real Centennial was a ~14-unit run using a distinct
  // YYYY-MM serial format (e.g. 1994-01), which this pattern did not match
  // anyway. See doc/audits/2026-04-23-source-audit.md §2.

  // A-series hollowbody label, 1947-1961. Matched before the 8-9 digit
  // numeric path so A + 3-5 digits isn't misinterpreted.
  {
    const m = text.match(/^A(\d{3,5})$/);
    if (m) {
      const num = parseInt(m[1] as string, 10);
      const year = aSeriesYear(num);
      return singleCandidateMatch(m[0], year, 'gibson_a_series', listingYear);
    }
  }

  // FON letter-prefix, 1952-1961. Interior-stamped factory order number.
  // Format: letter Q-Z + batch (3-5 digits) + optional rank (1-2 digits).
  // The letter alone pins the year; batch/rank together are 4-7 digits.
  {
    const m = text.match(/^([QRSTUVWXYZ])(\d{4,7})$/);
    if (m) {
      const letter = m[1] as string;
      const year = GIBSON_FON_LETTER_YEAR[letter] ?? null;
      return singleCandidateMatch(m[0], year, 'gibson_fon_letter', listingYear);
    }
  }

  // 8-9 digit numeric paths.
  const digitMatch = text.match(/^\d{8,9}$/);
  if (!digitMatch) {
    // Pre-1961 Junior/Special 4-digit FON (model-gated).
    if (isGibsonStudentLine(modelHint)) {
      const m = text.match(/^\d{4}$/);
      if (m) {
        const cand: SerialMatchCandidate = {
          serial: m[0],
          decodedYear: null,
          brandFormat: 'gibson_pre1961',
          sourceTag: 'stamped',
          confidenceCap: 'medium',
        };
        return buildMatch(m[0], [cand], cand, listingYear);
      }
    }
    // Pre-1977 Gibson 4-7 digit.
    const m = text.match(/^\d{4,7}$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'gibson_pre1977', listingYear);
    }
    return null;
  }

  const serial = digitMatch[0];

  if (serial.length === 9) {
    const candidates: SerialMatchCandidate[] = [];

    const ddd = parseInt(serial.slice(1, 4), 10);
    if (ddd >= 1 && ddd <= 366) {
      const year2 = parseInt((serial[0] as string) + (serial[4] as string), 10);
      const decodedYddd = year2 < 40 ? 2000 + year2 : 1900 + year2;
      const md = dayOfYearToMonthDay(decodedYddd, ddd);
      candidates.push({
        serial,
        decodedYear: decodedYddd,
        decodedMonth: md?.month ?? null,
        decodedDay: md?.day ?? null,
        brandFormat: 'gibson_yddd_ybrrr',
      });
    }

    const yy = parseInt(serial.slice(0, 2), 10);
    if (yy >= 14 && yy <= 19) {
      candidates.push({
        serial,
        decodedYear: 2000 + yy,
        brandFormat: 'gibson_yy_sequential',
      });
    }

    if (candidates.length === 0) return null;

    let best: SerialMatchCandidate;
    if (candidates.length === 1) {
      best = candidates[0] as SerialMatchCandidate;
    } else if (listingYear === null) {
      best = candidates[0] as SerialMatchCandidate;
    } else {
      best = candidates.reduce((acc, c) => {
        const accYear = acc.decodedYear ?? 9999;
        const cYear = c.decodedYear ?? 9999;
        return Math.abs(cYear - listingYear) < Math.abs(accYear - listingYear) ? c : acc;
      });
    }
    return buildMatch(serial, candidates, best, listingYear);
  }

  // 8-digit YDDDYRRR
  const year2 = parseInt((serial[0] as string) + (serial[4] as string), 10);
  const dayOfYear = parseInt(serial.slice(1, 4), 10);
  if (dayOfYear < 1 || dayOfYear > 366) return null;
  const decodedYear = year2 < 40 ? 2000 + year2 : 1900 + year2;
  const md = dayOfYearToMonthDay(decodedYear, dayOfYear);
  return singleCandidateMatch(
    serial,
    decodedYear,
    'gibson_yddd_yrrr',
    listingYear,
    null,
    md ? { month: md.month, day: md.day } : null,
  );
}
