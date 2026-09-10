// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Responsive Layout Tests', () => {
  test('homepage renders correctly on desktop and mobile viewports', async ({ page }) => {
    // Desktop Viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('#work')).toBeVisible();

    // Mobile Viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('#work')).toBeVisible();

    // Ensure document width does not cause horizontal scroll overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});
