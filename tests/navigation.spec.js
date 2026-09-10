// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Navigation Tests', () => {
  test('homepage case study cards navigate to respective case study pages', async ({ page }) => {
    await page.goto('/');

    const caseStudies = [
      { selector: 'a[href="vitals.html"]', expectedUrl: /\/vitals(\.html)?$/ },
      { selector: 'a[href="bulkmagic.html"]', expectedUrl: /\/bulkmagic(\.html)?$/ },
      { selector: 'a[href="alirtify.html"]', expectedUrl: /\/alirtify(\.html)?$/ },
    ];

    for (const item of caseStudies) {
      await page.goto('/');
      const card = page.locator(item.selector);
      await expect(card).toBeVisible();
      await card.click();
      await expect(page).toHaveURL(item.expectedUrl);
    }
  });

  test('case study header link navigates back to index.html', async ({ page }) => {
    await page.goto('/vitals.html');
    const homeLink = page.locator('header a[href="index.html"]');
    await expect(homeLink).toBeVisible();
    await homeLink.click();
    await expect(page).toHaveURL(/index\.html|\/$/);
  });

  test('contact mailto links point to meghanlendhe@gmail.com', async ({ page }) => {
    await page.goto('/');
    const mailLinks = page.locator('a[href^="mailto:"]');
    const count = await mailLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const href = await mailLinks.nth(i).getAttribute('href');
      expect(href).toBe('mailto:meghanlendhe@gmail.com');
    }
  });
});
