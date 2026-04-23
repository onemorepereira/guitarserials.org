export type {
  ConfidenceTier,
  MatchOptions,
  SerialMatch,
  SerialMatchCandidate,
} from './types.js';

import type { MatchOptions, SerialMatch } from './types.js';

/**
 * Decode a guitar serial number.
 *
 * Stub — the real implementation is ported brand-by-brand from
 * reverb_scraper/serial_matcher.py in milestone M1.
 */
export function matchSerial(
  _serial: string,
  _brand: string,
  _opts?: MatchOptions,
): SerialMatch | null {
  return null;
}
