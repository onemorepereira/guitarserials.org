import { expect, test } from '@playwright/test';

test.describe('Brand pages', () => {
  test('Gibson page lists format cards and links to find-serial', async ({ page }) => {
    await page.goto('/brands/gibson');
    await expect(page.getByRole('heading', { level: 1, name: 'Gibson' })).toBeVisible();

    // At least 5 format cards (Gibson has 9)
    const cards = page.locator('section h3');
    await expect(cards.first()).toBeVisible();
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(5);

    // "Try it" link for a format carries the correct permalink query
    const tryLinks = page.getByRole('link', { name: /try it/i });
    await expect(tryLinks.first()).toBeVisible();
  });

  test('Gibson Custom Shop page uses the hyphenated slug', async ({ page }) => {
    await page.goto('/brands/gibson-custom-shop');
    await expect(page.getByRole('heading', { level: 1, name: 'Gibson Custom Shop' })).toBeVisible();
  });

  test('find-serial page renders locations', async ({ page }) => {
    await page.goto('/brands/fender/find-serial');
    await expect(
      page.getByRole('heading', { level: 1, name: /where to find your fender serial/i }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: /neck plate/i }).first()).toBeVisible();
  });

  test('home page brand card links to the guide', async ({ page }) => {
    await page.goto('/');
    // Get the Gibson card — pick the first matching link with "Gibson" text
    const gibsonCard = page.getByRole('link', { name: /^Gibson →/i });
    await expect(gibsonCard).toBeVisible();
    await gibsonCard.click();
    await expect(page).toHaveURL(/\/brands\/gibson$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Gibson' })).toBeVisible();
  });
});
