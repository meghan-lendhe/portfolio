// @ts-check
import { test, expect } from '@playwright/test';

const routes = [
  { path: '/', expected: /Meghan Lendhe/ },
  { path: '/alirtify', expected: /Alirtify/ },
  { path: '/bulkmagic', expected: /BulkMagic/ },
  { path: '/cool-school', expected: /Cool School/ },
  { path: '/omara', expected: /Omara/ },
  { path: '/vitals', expected: /Vitals/ },
];

for (const route of routes) {
  test(`route ${route.path} loads successfully with correct title`, async ({ page }) => {
    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(route.expected);
  });
}

