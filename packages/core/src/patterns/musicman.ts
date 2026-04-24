import { singleCandidateMatch } from '../buildMatch.js';
import type { SerialMatch } from '../types.js';

/**
 * Ernie Ball Music Man serial number matcher.
 *
 * Music Man serials don't cleanly encode the year — the authoritative way
 * to date an EB Music Man instrument is the official Serial Number Database
 * at music-man.com. The most accurate build date comes from the handwritten
 * date in the neck pocket or on the neck heel.
 *
 * Recognized format families:
 *   - B + 6 digits     — early EB (mid-1980s)
 *   - Plain 5 digits   — 1985-present (8xxxx = EVH/Axis line, 9xxxx = Morse/Luke/Silhouette)
 *   - F + 5 digits     — some EB production
 *
 * The decoder recognizes these formats as Music Man but leaves year
 * undecoded; for dating we point users to the manufacturer's database.
 */

export function matchMusicMan(text: string, listingYear: number | null): SerialMatch | null {
  // B-prefix (1986+): B + 6 digits
  {
    const m = text.match(/^B(\d{6})$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'musicman_b_prefix', listingYear);
    }
  }

  // F-prefix: F + 5 digits
  {
    const m = text.match(/^F(\d{5})$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'musicman_f_prefix', listingYear);
    }
  }

  // Plain 5-digit 8xxxx or 9xxxx (1985+)
  {
    const m = text.match(/^([89])(\d{4})$/);
    if (m) {
      return singleCandidateMatch(m[0], null, 'musicman_5digit', listingYear);
    }
  }

  return null;
}
