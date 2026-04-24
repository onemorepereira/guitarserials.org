import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Format-ID parity check.
 *
 * Each brand format shows up in three places:
 *   1. Pattern files (packages/core/src/patterns/*.ts) — the matcher emits
 *      a `brandFormat: '<id>'` value when a serial matches.
 *   2. Brand-guide cards (apps/web/src/lib/brandGuides.ts) — the user-facing
 *      prose that describes the format, with examples and gotchas.
 *   3. Format descriptions (apps/web/src/lib/formatDescriptions.ts) — the
 *      short sentence shown on the decoder result card.
 *
 * Adding a format means touching all three. Forgetting one leads to the
 * decoder returning a format ID the UI can't explain (missing description),
 * or a brand-guide card that points at a rule that doesn't exist
 * (stale card). Both bugs have shipped during earlier passes and both are
 * silent — no test fails, no lint catches it, users just see gibberish.
 *
 * This test asserts set-equality across the three sources. When it fails,
 * it prints exactly which IDs are in which set so the fix is obvious.
 *
 * Scanning is via regex on the source files rather than importing the
 * apps/web modules, so this test doesn't create a cross-workspace import
 * in a package that ships to npm.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..', '..', '..');

/** Valid format-ID shape: lowercase + underscores, must contain at least one
 * underscore (brand IDs like "gibson" or "prs" don't have underscores and
 * must be excluded from the brand-guide scan). */
const FORMAT_ID = /[a-z][a-z0-9_]*_[a-z0-9_]+/;

function scanPatternFiles(): Set<string> {
  const dir = resolve(REPO_ROOT, 'packages/core/src/patterns');
  const files = readdirSync(dir).filter((f) => f.endsWith('.ts'));
  const ids = new Set<string>();
  // Format IDs appear inside pattern files in several shapes:
  //   1. `brandFormat: 'xxx'` (object-literal key)
  //   2. `singleCandidateMatch(s, y, 'xxx', …)` (third positional arg)
  //   3. `[['PREFIX', 1980, 'xxx'], …]` (array-literal tables, as in
  //       fender.ts's decadePrefixes which emits via loop)
  // Rather than try to enumerate every shape, match any string literal
  // whose contents have the format-ID shape (two+ segments separated by
  // underscore, all lowercase). Pattern files don't contain
  // format-ID-shaped strings used for any other purpose, so false positives
  // would be obvious and actionable.
  const re = new RegExp(`['"](${FORMAT_ID.source})['"]`, 'g');
  for (const f of files) {
    const src = readFileSync(join(dir, f), 'utf8');
    for (const m of src.matchAll(re)) ids.add(m[1] as string);
  }
  return ids;
}

function scanBrandGuides(): Set<string> {
  const src = readFileSync(resolve(REPO_ROOT, 'apps/web/src/lib/brandGuides.ts'), 'utf8');
  // Match `id: '<id>'` but only when the id contains an underscore — that
  // filters out brand-level IDs like `id: 'gibson'`, `id: 'prs'`, etc.,
  // and keeps only format-level IDs like `id: 'gibson_yddd_yrrr'`.
  const re = new RegExp(`id:\\s*['"](${FORMAT_ID.source})['"]`, 'g');
  return new Set<string>([...src.matchAll(re)].map((m) => m[1] as string));
}

function scanFormatDescriptions(): Set<string> {
  const src = readFileSync(resolve(REPO_ROOT, 'apps/web/src/lib/formatDescriptions.ts'), 'utf8');
  // Record entries look like `  gibson_yddd_yrrr: '...',` — match the
  // property name at line start.
  const re = new RegExp(`^\\s+(${FORMAT_ID.source}):`, 'gm');
  return new Set<string>([...src.matchAll(re)].map((m) => m[1] as string));
}

function setDiff(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter((x) => !b.has(x)).sort();
}

describe('format-ID parity across code, brand guides, and descriptions', () => {
  const code = scanPatternFiles();
  const guides = scanBrandGuides();
  const descriptions = scanFormatDescriptions();

  it('scans picked up a plausible number of IDs from each source', () => {
    // Sanity bound — if any scan collapses to a handful of hits the regex
    // is probably broken. Current count across all three is 115.
    expect(code.size).toBeGreaterThan(50);
    expect(guides.size).toBeGreaterThan(50);
    expect(descriptions.size).toBeGreaterThan(50);
  });

  it('every pattern-emitted format ID has a brand-guide card', () => {
    const missing = setDiff(code, guides);
    expect(
      missing,
      `Emitted by a matcher but no brand-guide card exists:\n  ${missing.join('\n  ')}\nFix: add a card under the matching brand in apps/web/src/lib/brandGuides.ts.`,
    ).toEqual([]);
  });

  it('every pattern-emitted format ID has a description', () => {
    const missing = setDiff(code, descriptions);
    expect(
      missing,
      `Emitted by a matcher but no FORMAT_DESCRIPTIONS entry exists:\n  ${missing.join('\n  ')}\nFix: add a one-sentence description in apps/web/src/lib/formatDescriptions.ts.`,
    ).toEqual([]);
  });

  it('every brand-guide card corresponds to an emitted format', () => {
    const extra = setDiff(guides, code);
    expect(
      extra,
      `Brand-guide card exists but no matcher emits the ID:\n  ${extra.join('\n  ')}\nFix: rename the card in brandGuides.ts to match the emitted ID, or delete it if the format was removed.`,
    ).toEqual([]);
  });

  it('every description key corresponds to an emitted format', () => {
    const extra = setDiff(descriptions, code);
    expect(
      extra,
      `FORMAT_DESCRIPTIONS entry exists but no matcher emits the ID:\n  ${extra.join('\n  ')}\nFix: rename or remove the entry in formatDescriptions.ts.`,
    ).toEqual([]);
  });
});
