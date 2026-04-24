/**
 * Heritage single-letter year mapping: B=1985, C=1986, ..., Y=2008.
 *
 * Stops at Y per the Heritage Owners Club decoding chart (documented
 * range B=1985 through Y=2008) and Heritage's official "Date Your
 * Heritage" dropdown (which skips Z entirely and jumps from Y to AA=2010).
 * 2009 instruments carry the 1YYXXXX standard-collection format instead.
 */
export const HERITAGE_SINGLE_LETTER_BASE: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  for (let c = 'B'.charCodeAt(0); c <= 'Y'.charCodeAt(0); c++) {
    map[String.fromCharCode(c)] = 1985 + (c - 'B'.charCodeAt(0));
  }
  return map;
})();

/**
 * Heritage double-letter year mapping: AA=2010, AB=2011, ..., AP=2025.
 *
 * Capped at AP per Heritage Guitars' official "Date Your Heritage" dropdown
 * (https://heritageguitars.com/pages/date-your-heritage), which enumerates
 * letters only through AP. Values beyond AP are deliberately unmapped until
 * Heritage publishes confirmation of AQ/AR/etc. See
 * doc/audits/2026-04-23-source-audit.md §5.
 */
export const HERITAGE_DOUBLE_LETTER_BASE: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  for (let c = 'A'.charCodeAt(0); c <= 'P'.charCodeAt(0); c++) {
    map[`A${String.fromCharCode(c)}`] = 2010 + (c - 'A'.charCodeAt(0));
  }
  return map;
})();

/** PRS CTI letter-to-year base: A=2018. */
export const PRS_CTI_YEAR_BASE = 2018;

/**
 * True when modelHint clearly denotes a Les Paul Classic.
 * Requires both "les paul" and the whole word "classic".
 */
export function isLesPaulClassic(modelHint: string | null | undefined): boolean {
  if (!modelHint) return false;
  const m = modelHint.toLowerCase();
  return m.includes('les paul') && /\bclassic\b/.test(m);
}

/**
 * True when modelHint indicates a Gibson Custom Shop Historic Reissue.
 * Accepts "Reissue", R0/R4/R7/R8/R9, "Historic", "Murphy Lab", "Custom Shop".
 */
export function isGibsonHistoricReissue(modelHint: string | null | undefined): boolean {
  if (!modelHint) return false;
  const m = modelHint.toLowerCase();
  return (
    /\breissue\b/.test(m) ||
    /\br[04789]\b/.test(m) ||
    /\bhistoric\b/.test(m) ||
    /\bmurphy\s*lab\b/.test(m) ||
    /\bcustom\s*shop\b/.test(m)
  );
}

/**
 * Snap a single-digit Y (0-9) to the closest valid CS production year (1993+).
 * Returns null when listingYear is absent.
 */
export function csSnapYearSingle(y: number, listingYear: number | null): number | null {
  if (listingYear === null) return null;
  const options = [1990 + y, 2000 + y, 2010 + y, 2020 + y].filter((o) => o >= 1993 && o <= 2030);
  if (options.length === 0) return null;
  return options.reduce((best, o) =>
    Math.abs(o - listingYear) < Math.abs(best - listingYear) ? o : best,
  );
}

/**
 * Decode a two-digit YY from a CSYYRRRR serial.
 * 93-99 → 1993-1999; 00-29 → 2000-2029; else null.
 */
export function csYearFromYy(yy: number): number | null {
  if (yy >= 93 && yy <= 99) return 1900 + yy;
  if (yy >= 0 && yy <= 29) return 2000 + yy;
  return null;
}

/**
 * True when modelHint denotes a Gibson Junior/Special student-line model.
 * Requires BOTH a body token (les paul / sg / melody maker) AND a variant
 * keyword (junior / special) — while rejecting "Special Edition", "Special Run",
 * and "Junior Brown".
 */
export function isGibsonStudentLine(modelHint: string | null | undefined): boolean {
  if (!modelHint) return false;
  const m = modelHint.toLowerCase();
  const hasModel = m.includes('les paul') || /\bsg\b/.test(m) || m.includes('melody maker');
  if (!hasModel) return false;

  const re = /\b(junior|special)\b/g;
  let match: RegExpExecArray | null = re.exec(m);
  while (match !== null) {
    const after = m.slice(match.index + match[0].length, match.index + match[0].length + 20);
    if (!/^\s+(edition|run|brown)\b/.test(after)) {
      return true;
    }
    match = re.exec(m);
  }
  return false;
}

const AVRI_MODEL_TOKENS =
  /\b(stratocaster|telecaster|strat|tele|jazzmaster|jaguar|precision|jazz|bass)\b/;

/**
 * True when modelHint is a Fender AVRI / American Vintage reissue.
 * Requires either ("vintage" + a recognized body token) OR a quoted-year token
 * like '52 / '60s.
 */
export function isFenderAvri(modelHint: string | null | undefined): boolean {
  if (!modelHint) return false;
  const m = modelHint.toLowerCase();
  if (/\bvintage\b/.test(m) && AVRI_MODEL_TOKENS.test(m)) return true;
  if (/'\d{2}s?\b/.test(m)) return true;
  return false;
}
