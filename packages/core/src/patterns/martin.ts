import { singleCandidateMatch } from '../buildMatch.js';
import type { SerialMatch } from '../types.js';

/**
 * Martin guitar serial number matcher.
 *
 * Martin has used a purely sequential numbering system since 1898, starting
 * at serial number 8348 (the estimate of guitars built prior to formal
 * numbering). Serials are stamped on the neck block inside the body. Dating
 * uses a cumulative-production year-end table (official Martin chart).
 *
 * Known exceptions:
 *   - 900001–902908 were used on Sigma-Martins (1981-1982), not Martin-branded.
 *   - Mandolins pre-1991 used a different sequence.
 *   - Martin's rare electrics (E18 et al.) don't conform.
 *   - Backpacker and Little Martin (LX) have their own sequences.
 *
 * Source: Martin's official Serial Number Chart, cross-verified with
 * Tone Wolf, Kansas City Vintage Guitars, Carter Vintage, Lovies Guitars.
 */

/**
 * Year-end serial numbers from Martin's official chart.
 * Format: [year, lastSerialIssuedInThatYear].
 * Sorted ascending by year.
 */
const YEAR_END_SERIALS: Array<[number, number]> = [
  [1898, 8348],
  [1920, 15848],
  [1921, 16758],
  [1922, 17839],
  [1923, 19891],
  [1924, 22008],
  [1925, 24116],
  [1926, 28689],
  [1927, 34435],
  [1928, 37568],
  [1929, 40843],
  [1930, 45317],
  [1931, 49589],
  [1932, 52590],
  [1933, 55084],
  [1934, 58679],
  [1935, 61947],
  [1936, 65176],
  [1937, 68865],
  [1938, 71866],
  [1939, 74061],
  [1940, 76734],
  [1950, 117961],
  [1951, 122799],
  [1952, 128436],
  [1953, 134501],
  [1954, 141345],
  [1955, 147328],
  [1956, 153225],
  [1957, 159061],
  [1958, 165576],
  [1959, 171047],
  [1960, 175689],
  [1961, 181297],
  [1962, 187384],
  [1963, 193327],
  [1964, 199626],
  [1965, 207030],
  [1966, 217215],
  [1967, 230095],
  [1968, 241925],
  [1969, 256003],
  [1970, 271633],
  [1971, 294270],
  [1972, 313302],
  [1973, 333873],
  [1974, 353387],
  [1975, 371828],
  [1976, 388800],
  [1977, 399625],
  [1978, 407800],
  [1979, 419900],
  [1980, 430300],
  [1981, 436474],
  [1982, 439627],
  [1983, 446101],
  [1984, 453300],
  [1985, 460575],
  [1986, 468175],
  [1987, 476216],
  [1988, 483952],
  [1989, 493279],
  [1990, 503309],
  [1991, 512487],
  [1992, 522655],
  [1993, 535223],
  [1994, 551696],
  [1995, 570434],
  [1996, 592930],
  [1997, 624799],
  [1998, 668796],
  [1999, 724077],
  [2000, 780500],
  [2001, 845644],
  [2002, 916759],
  [2003, 978706],
  [2004, 1042558],
  [2005, 1115862],
  [2006, 1197799],
  [2007, 1268091],
  [2008, 1337042],
  [2009, 1406715],
  [2010, 1473461],
  [2011, 1555767],
  [2012, 1656742],
  [2013, 1755536],
  [2014, 1857399],
  [2015, 1972129],
  [2016, 2076795],
  [2017, 2161732],
  [2018, 2258889],
  [2020, 2454224],
  [2025, 3043480],
];

/** Sigma-Martin serials (1981-1982) — not Martin-branded; reject. */
function isSigmaMartinRange(serial: number): boolean {
  return serial >= 900001 && serial <= 902908;
}

/**
 * Binary-search the first year whose last-serial-of-year is >= input.
 * If the input is above every documented endpoint, returns null (unknown
 * future year beyond our chart). If the input is below the earliest
 * documented endpoint, returns null (pre-1898 or pre-numbering).
 */
function findYear(serial: number): number | null {
  if (serial < (YEAR_END_SERIALS[0] as [number, number])[1]) return null;
  const last = YEAR_END_SERIALS[YEAR_END_SERIALS.length - 1] as [number, number];
  if (serial > last[1]) return null;
  for (const [year, endSerial] of YEAR_END_SERIALS) {
    if (serial <= endSerial) return year;
  }
  return null;
}

export function matchMartin(text: string, listingYear: number | null): SerialMatch | null {
  // Martin serials are purely numeric, typically 4–7 digits.
  const m = text.match(/^(\d{4,7})$/);
  if (!m) return null;

  const serial = parseInt(m[1] as string, 10);
  if (isSigmaMartinRange(serial)) {
    // Explicit rejection — these are Sigma-Martin, not Martin.
    return null;
  }

  const year = findYear(serial);
  return singleCandidateMatch(m[0], year, 'martin_sequential', listingYear);
}
