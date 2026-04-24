import { extractSerialFromNoise } from './extractSerial.js';
import { normalizeText } from './normalize.js';
import { matchCharvel } from './patterns/charvel.js';
import { matchEpiphone } from './patterns/epiphone.js';
import { matchEsp } from './patterns/esp.js';
import { matchFender } from './patterns/fender.js';
import { matchGAndL } from './patterns/gandl.js';
import { matchGibson } from './patterns/gibson.js';
import { matchGibsonCustomShop } from './patterns/gibsonCustomShop.js';
import { matchGretsch } from './patterns/gretsch.js';
import { matchHeritage } from './patterns/heritage.js';
import { matchIbanez } from './patterns/ibanez.js';
import { matchJackson } from './patterns/jackson.js';
import { matchMartin } from './patterns/martin.js';
import { matchMusicMan } from './patterns/musicman.js';
import { matchPrs } from './patterns/prs.js';
import { matchRickenbacker } from './patterns/rickenbacker.js';
import { matchSchecter } from './patterns/schecter.js';
import { matchSire } from './patterns/sire.js';
import { matchSquier } from './patterns/squier.js';
import type { MatchOptions, SerialMatch } from './types.js';

export const SUPPORTED_BRANDS = new Set([
  'gibson',
  'gibson custom shop',
  'prs',
  'fender',
  'heritage',
  'sire',
  'ibanez',
  'gretsch',
  'rickenbacker',
  'jackson',
  'charvel',
  'epiphone',
  'squier',
  'g&l',
  'schecter',
  'martin',
  'esp',
  'ltd',
  'music man',
]);

type BrandMatcher = (
  text: string,
  listingYear: number | null,
  modelHint: string | null,
  isCsBrand: boolean,
) => SerialMatch | null;

const BRAND_MATCHERS: Record<string, BrandMatcher> = {
  gibson: (t, y, h, _c) => matchGibson(t, y, h),
  'gibson custom shop': (t, y, h, _c) => matchGibsonCustomShop(t, y, h, true),
  fender: (t, y, h, _c) => matchFender(t, y, h),
  prs: (t, y, h, _c) => matchPrs(t, y, h),
  heritage: (t, y, _h, _c) => matchHeritage(t, y),
  sire: (t, y, _h, _c) => matchSire(t, y),
  ibanez: (t, y, _h, _c) => matchIbanez(t, y),
  gretsch: (t, y, _h, _c) => matchGretsch(t, y),
  rickenbacker: (t, y, _h, _c) => matchRickenbacker(t, y),
  jackson: (t, y, _h, _c) => matchJackson(t, y),
  charvel: (t, y, _h, _c) => matchCharvel(t, y),
  epiphone: (t, y, _h, _c) => matchEpiphone(t, y),
  squier: (t, y, _h, _c) => matchSquier(t, y),
  'g&l': (t, y, _h, _c) => matchGAndL(t, y),
  schecter: (t, y, _h, _c) => matchSchecter(t, y),
  martin: (t, y, _h, _c) => matchMartin(t, y),
  esp: (t, y, _h, _c) => matchEsp(t, y),
  ltd: (t, y, _h, _c) => matchEsp(t, y),
  'music man': (t, y, _h, _c) => matchMusicMan(t, y),
};

/**
 * Match raw text against known serial-number patterns for a brand.
 *
 * @param text     Raw text (may have whitespace, mixed case).
 * @param brand    Known brand (e.g. "Gibson", "Fender").
 * @param opts     Optional listing year and model hint for cross-validation
 *                 and model-dependent decoders.
 * @returns SerialMatch if the text matches a known pattern, null otherwise.
 */
export function matchSerial(text: string, brand: string, opts?: MatchOptions): SerialMatch | null {
  if (!text || !brand) return null;

  const listingYear = opts?.listingYear ?? null;
  const modelHint = opts?.modelHint ?? null;

  const normalizedBrand = brand.trim().toLowerCase();
  const matcher = BRAND_MATCHERS[normalizedBrand];
  if (!matcher) return null;

  const normalizedText = normalizeText(text);
  if (!normalizedText) return null;

  // Pass 1: full-text match.
  const exact = matcher(normalizedText, listingYear, modelHint, false);
  if (exact) return exact;

  // Pass 2: extract a known prefix from OCR noise.
  const extracted = extractSerialFromNoise(normalizedText);
  if (extracted && extracted !== normalizedText) {
    return matcher(extracted, listingYear, modelHint, false);
  }

  return null;
}
