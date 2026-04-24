import { expect, test } from '@playwright/test';

test.describe('Brand sources', () => {
  test('Gibson page lists both manufacturer and reference sources with URLs', async ({ page }) => {
    await page.goto('/brands/gibson/');

    await expect(page.getByRole('link', { name: /Gibson Serial Number Search/i })).toHaveAttribute(
      'href',
      'https://www.gibson.com/pages/serial-number-search',
    );
    await expect(page.getByRole('link', { name: /Vintage Guitar Info Guy/i })).toHaveAttribute(
      'href',
      'https://guitarhq.com/gibson.html',
    );
  });

  test('Ibanez page surfaces the "no official decoder" note', async ({ page }) => {
    await page.goto('/brands/ibanez/');
    await expect(page.getByText(/Ibanez does not publish an official/i)).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Ibanez Rules — Date Your Ibanez/i }),
    ).toHaveAttribute('href', 'https://www.ibanezrules.com/catalogs/reference/dating.htm');
  });

  test('Fender page lists the three official support articles', async ({ page }) => {
    await page.goto('/brands/fender/');
    await expect(page.getByRole('link', { name: /American-made instrument/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Mexican-made instrument/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Japanese-made instrument/i })).toBeVisible();
  });
});
