import { expect, test } from '@playwright/test';

async function waitForHydration(page: import('@playwright/test').Page) {
  await expect(page.locator('form[data-hydrated="true"]')).toBeVisible();
}

test.describe('Home page decoder', () => {
  test('decodes a Gibson 8-digit serial to 1985 / high', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Hero copy present
    await expect(
      page.getByRole('heading', { level: 1, name: /paste a serial.*read it back/i }),
    ).toBeVisible();

    // Fill in a known Gibson serial
    await page.getByTestId('serial-input').fill('82765501');
    await page.getByTestId('brand-select').selectOption('gibson');
    await page.getByTestId('decode-submit').click();

    // Result panel shows decoded year 1985 and tier "high"
    const resultMatch = page.getByTestId('result-match');
    await expect(resultMatch).toBeVisible();
    await expect(page.getByTestId('result-year')).toHaveText('1985');
    await expect(page.getByTestId('result-tier')).toHaveText('high');

    // Permalink writes query-string to URL
    await expect(page).toHaveURL(/s=82765501/);
    await expect(page).toHaveURL(/b=gibson/);
  });

  test('renders multi-brand results for "unsure" when ambiguous', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    // 20123456: matches Gibson (gibson_yddd_yrrr) AND Sire (sire_gen1) under "Unsure"
    await page.getByTestId('serial-input').fill('20123456');
    await page.getByTestId('brand-select').selectOption(''); // Unsure
    await page.getByTestId('decode-submit').click();

    await expect(page.getByTestId('result-multi')).toBeVisible();
    await expect(page.getByTestId('result-multi')).toContainText('Gibson');
    await expect(page.getByTestId('result-multi')).toContainText('Sire');
  });

  test('CS-prefix in "Unsure" mode does not dupe Gibson + Gibson Custom Shop', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    // CS61117 is a Gibson Custom Shop serial. Our Gibson matcher also claims
    // it (sellers often list CS guitars as just "Gibson"), but in "Unsure"
    // mode the result should be deduped in favor of Gibson Custom Shop.
    await page.getByTestId('serial-input').fill('CS61117');
    await page.getByTestId('brand-select').selectOption('');
    await page.getByTestId('decode-submit').click();

    const multi = page.getByTestId('result-multi');
    await expect(multi).toBeVisible();
    await expect(multi).toContainText('Gibson Custom Shop');
    // Plain "Gibson" (without Custom Shop suffix) should be suppressed.
    const gibsonOnly = multi.locator('text=/^Gibson$/');
    await expect(gibsonOnly).toHaveCount(0);
  });

  test('shows no-match panel for unsupported serial', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    await page.getByTestId('serial-input').fill('ZZZ000');
    await page.getByTestId('brand-select').selectOption('gibson');
    await page.getByTestId('decode-submit').click();

    await expect(page.getByTestId('result-none')).toBeVisible();
    await expect(page.getByTestId('result-none')).toContainText(/no match/i);
  });

  test('reads serial and brand from the URL on page load', async ({ page }) => {
    await page.goto('/?s=CS500123&b=gibson%20custom%20shop&y=2015');
    await waitForHydration(page);

    // Form values are prefilled
    await expect(page.getByTestId('serial-input')).toHaveValue('CS500123');
    await expect(page.getByTestId('brand-select')).toHaveValue('gibson custom shop');
    await expect(page.getByTestId('year-input')).toHaveValue('2015');

    // And the result renders without clicking submit (autofilled match)
    await expect(page.getByTestId('result-match')).toBeVisible();
  });
});
