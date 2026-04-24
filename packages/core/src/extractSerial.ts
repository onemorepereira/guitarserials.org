/**
 * Known prefixes that definitively identify a serial embedded in noisy OCR text.
 * Mirrors the Python `_SERIAL_PREFIX_PATTERNS` regex used by the two-pass
 * matcher: pass 1 matches the full input, pass 2 extracts a known-prefix
 * substring when the full input was OCR-smashed with surrounding noise.
 */
const SERIAL_PREFIX_PATTERNS =
  /(US\d{6,9}[A-Z]?|MX\d{8}[A-Z]?|MN\d{5,7}|MZ\d{5,7}|JD\d{8}|CZ\d{5,6}|DN\d{5,6}|D?Z\d{6,7}|VS\d{6}|HR\d{5,6}|CS\d{3,6}|S2\d{6,7}|CE\d{4,6}|CTI[A-Z]\d{4,6}|I[A-E]\d{4,6}|V\d{4,7}|HC1\d{6})/;

export function extractSerialFromNoise(text: string): string | null {
  const m = text.match(SERIAL_PREFIX_PATTERNS);
  return m ? (m[0] as string) : null;
}
