/** Strip whitespace, remove internal spaces, convert to uppercase. */
export function normalizeText(text: string): string {
  return text.replace(/\s+/g, '').toUpperCase();
}
