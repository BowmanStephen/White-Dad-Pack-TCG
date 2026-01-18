import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for DadDeck Cards
 *
 * These tests ensure card components render correctly across different:
 * - Browsers (Chrome, Firefox, Safari)
 * - Viewports (Desktop, Tablet, Mobile)
 * - Rarities (Common through Mythic)
 * - Holographic variants
 * - Dad types
 *
 * Test Strategy:
 * 1. Initial baseline screenshots are created on first run
 * 2. Subsequent runs compare against baseline
 * 3. Differences beyond threshold trigger failure
 * 4. Update baseline with: npx playwright test --update-snapshots
 */

test.describe('Card Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to collection page where all cards are visible
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');
  });

  test('should render common card correctly', async ({ page }) => {
    // Find a common card in the collection
    const commonCard = page.locator('[data-rarity="common"]').first();

    await expect(commonCard).toHaveScreenshot('common-card.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test('should render uncommon card correctly', async ({ page }) => {
    const uncommonCard = page.locator('[data-rarity="uncommon"]').first();

    await expect(uncommonCard).toHaveScreenshot('uncommon-card.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test('should render rare card correctly', async ({ page }) => {
    const rareCard = page.locator('[data-rarity="rare"]').first();

    await expect(rareCard).toHaveScreenshot('rare-card.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test('should render epic card correctly', async ({ page }) => {
    const epicCard = page.locator('[data-rarity="epic"]').first();

    await expect(epicCard).toHaveScreenshot('epic-card.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test('should render legendary card correctly', async ({ page }) => {
    const legendaryCard = page.locator('[data-rarity="legendary"]').first();

    await expect(legendaryCard).toHaveScreenshot('legendary-card.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test('should render mythic card correctly', async ({ page }) => {
    const mythicCard = page.locator('[data-rarity="mythic"]').first();

    await expect(mythicCard).toHaveScreenshot('mythic-card.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test('should render holographic card correctly', async ({ page }) => {
    const holoCard = page.locator('[data-holo="true"]').first();

    await expect(holoCard).toHaveScreenshot('holo-card.png', {
      maxDiffPixels: 150, // Allow more pixel diff for holographic shimmer
      threshold: 0.25,
    });
  });

  test('should render card stats correctly', async ({ page }) => {
    const card = page.locator('.card').first();
    const statsSection = card.locator('.card-stats');

    await expect(statsSection).toHaveScreenshot('card-stats.png', {
      maxDiffPixels: 50,
      threshold: 0.15,
    });
  });
});

test.describe('Card Dad Type Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');
  });

  test('should render BBQ_DAD card correctly', async ({ page }) => {
    const bbqDad = page.locator('[data-type="BBQ_DAD"]').first();

    await expect(bbqDad).toHaveScreenshot('bbq-dad-card.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test('should render FIX_IT_DAD card correctly', async ({ page }) => {
    const fixItDad = page.locator('[data-type="FIX_IT_DAD"]').first();

    await expect(fixItDad).toHaveScreenshot('fix-it-dad-card.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test('should render GOLF_DAD card correctly', async ({ page }) => {
    const golfDad = page.locator('[data-type="GOLF_DAD"]').first();

    await expect(golfDad).toHaveScreenshot('golf-dad-card.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });
});
