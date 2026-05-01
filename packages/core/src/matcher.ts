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
  todayYear: number | null,
) => SerialMatch | null;

const BRAND_MATCHERS: Record<string, BrandMatcher> = {
  gibson: (t, y, h, _c, ty) => matchGibson(t, y, h, ty),
  'gibson custom shop': (t, y, h, _c, ty) => matchGibsonCustomShop(t, y, h, true, ty),
  fender: (t, y, h, _c, _ty) => matchFender(t, y, h),
  prs: (t, y, h, _c, _ty) => matchPrs(t, y, h),
  heritage: (t, y, _h, _c, _ty) => matchHeritage(t, y),
  sire: (t, y, _h, _c, _ty) => matchSire(t, y),
  ibanez: (t, y, _h, _c, _ty) => matchIbanez(t, y),
  gretsch: (t, y, _h, _c, _ty) => matchGretsch(t, y),
  rickenbacker: (t, y, _h, _c, _ty) => matchRickenbacker(t, y),
  jackson: (t, y, _h, _c, _ty) => matchJackson(t, y),
  charvel: (t, y, _h, _c, _ty) => matchCharvel(t, y),
  epiphone: (t, y, _h, _c, _ty) => matchEpiphone(t, y),
  squier: (t, y, _h, _c, _ty) => matchSquier(t, y),
  'g&l': (t, y, _h, _c, _ty) => matchGAndL(t, y),
  schecter: (t, y, _h, _c, _ty) => matchSchecter(t, y),
  martin: (t, y, _h, _c, _ty) => matchMartin(t, y),
  esp: (t, y, _h, _c, _ty) => matchEsp(t, y),
  ltd: (t, y, _h, _c, _ty) => matchEsp(t, y),
  'music man': (t, y, _h, _c, _ty) => matchMusicMan(t, y),
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
  // Default todayYear to the current calendar year so callers don't
  // have to pass it explicitly. Tests pass an explicit value for
  // determinism. Used by Gibson CS-prefix decade disambiguation when
  // listingYear is absent.
  const todayYear = opts?.todayYear ?? new Date().getFullYear();

  const normalizedBrand = brand.trim().toLowerCase();
  const matcher = BRAND_MATCHERS[normalizedBrand];
  if (!matcher) return null;

  const normalizedText = normalizeText(text);
  if (!normalizedText) return null;

  // Pass 1: full-text match.
  const exact = matcher(normalizedText, listingYear, modelHint, false, todayYear);
  if (exact) return exact;

  // Pass 2: extract a known prefix from OCR noise.
  const extracted = extractSerialFromNoise(normalizedText);
  if (extracted && extracted !== normalizedText) {
    return matcher(extracted, listingYear, modelHint, false, todayYear);
  }

  return null;
}
