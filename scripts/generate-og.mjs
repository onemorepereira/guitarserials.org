#!/usr/bin/env node
/**
 * Regenerate apps/web/public/og-default.png from scripts/og-card.html.
 *
 * Loads the HTML at exactly 1200×630 via Playwright's Chromium build and
 * screenshots it as PNG. Fonts come from Google Fonts, so run this with
 * a network connection and wait for fonts to load before screenshotting.
 *
 * Usage:
 *   pnpm og:generate
 *
 * Or directly:
 *   node scripts/generate-og.mjs
 */
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');
const template = resolve(repoRoot, 'scripts', 'og-card.html');
const outputDir = resolve(repoRoot, 'apps', 'web', 'public');
const output = resolve(outputDir, 'og-default.png');

if (!existsSync(template)) {
  console.error(`Template not found: ${template}`);
  process.exit(1);
}
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

// The `playwright` package is a transitive of `@playwright/test` (installed
// in apps/web); in a pnpm workspace it lives under the root node_modules/.pnpm
// store. Resolve it from the repo root so this script works regardless of
// which workspace Node was launched from.
const playwrightEntry = resolve(repoRoot, 'node_modules/playwright/index.mjs');
const fallbackEntry = resolve(
  repoRoot,
  'node_modules/.pnpm/playwright@1.59.1/node_modules/playwright/index.mjs',
);
const playwrightPath = existsSync(playwrightEntry) ? playwrightEntry : fallbackEntry;
const { chromium } = await import(pathToFileURL(playwrightPath).toString());

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();
await page.goto(pathToFileURL(template).toString(), { waitUntil: 'networkidle' });
// Small extra wait for custom fonts to paint.
await page.waitForTimeout(500);
await page.screenshot({ path: output, type: 'png', omitBackground: false });
await browser.close();

console.log(`Wrote ${output}`);
