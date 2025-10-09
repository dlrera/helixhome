import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Helix Home Prototype/);
  await expect(page.getByRole('heading', { name: 'Helix Home Prototype' })).toBeVisible();
});