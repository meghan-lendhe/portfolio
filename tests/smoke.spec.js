// @ts-check
const { test, expect } = require('@playwright/test');

const pages = [
  { path: '/', title: /Meghan Lendhe/i, heading: 'I design systems that help people make better decisions.' },
  { path: '/vitals.html', title: /Vitals/i, heading: 'Reducing Friction, Boosting Vitals Subscriptions' },
  { path: '/bulkmagic.html', title: /BulkMagic/i, heading: 'Streamlining Seller Onboarding for an E-Commerce Marketplace' },
  { path: '/alirtify.html', title: /Alirtify/i, heading: 'Designing a Data-Driven UX for News Validation' },
];

test.describe('Smoke Tests - Core Pages', () => {
  for (const pageInfo of pages) {
    test(`page ${pageInfo.path} loads cleanly without errors`, async ({ page }) => {
      const consoleErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      page.on('pageerror', (err) => {
        consoleErrors.push(err.message);
      });

      const response = await page.goto(pageInfo.path);
      expect(response?.status()).toBe(200);

      // Verify title and primary heading
      await expect(page).toHaveTitle(pageInfo.title);
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
      await expect(h1).toContainText(pageInfo.heading);

      // Verify no critical uncaught page errors
      // Note: filter out any external 3rd-party analytics failures if offline
      const localErrors = consoleErrors.filter(
        (err) =>
          !err.includes('clarity.ms') &&
          !err.includes('fonts.googleapis') &&
          !err.includes('net::ERR_')
      );
      expect(localErrors).toEqual([]);
    });
  }
});
