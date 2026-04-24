import { expect, test } from '@playwright/test';

test.describe('SEO / social metadata', () => {
  test('home page has canonical + OG + JSON-LD', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://guitarserials.org/',
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );

    // Home ships two JSON-LD blocks: WebSite (with SearchAction) and Organization.
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks.length).toBeGreaterThanOrEqual(2);
    const parsed = blocks.map((b) => JSON.parse(b));
    const types = parsed.map((p) => p['@type']);
    expect(types).toContain('WebSite');
    expect(types).toContain('Organization');
    const website = parsed.find((p) => p['@type'] === 'WebSite');
    expect(website.potentialAction['@type']).toBe('SearchAction');
    const org = parsed.find((p) => p['@type'] === 'Organization');
    expect(org.logo).toBeTruthy();
    expect(org.sameAs.some((s: string) => s.includes('github.com'))).toBe(true);
  });

  test('brand page has BreadcrumbList JSON-LD', async ({ page }) => {
    await page.goto('/brands/fender/');

    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    const parsed = JSON.parse(ld ?? '{}');
    expect(parsed['@type']).toBe('BreadcrumbList');
    expect(parsed.itemListElement).toHaveLength(2);
    expect(parsed.itemListElement[1].name).toBe('Fender');
  });

  test('methodology + about pages carry BreadcrumbList JSON-LD', async ({ page }) => {
    for (const path of ['/methodology/', '/about/']) {
      await page.goto(path);
      const ld = await page.locator('script[type="application/ld+json"]').textContent();
      const parsed = JSON.parse(ld ?? '{}');
      expect(parsed['@type']).toBe('BreadcrumbList');
      expect(parsed.itemListElement).toHaveLength(2);
      expect(parsed.itemListElement[0].name).toBe('Home');
    }
  });
});
