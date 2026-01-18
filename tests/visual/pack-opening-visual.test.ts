import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for Pack Opening Flow
 *
 * These tests ensure the pack opening experience renders correctly at each stage:
 * - Idle state (pack closed)
 * - Pack animation (tear effect)
 * - Card reveal (individual cards)
 * - Results screen (all cards displayed)
 *
 * Important: These tests capture the emotional journey of pack opening
 */

test.describe('Pack Opening Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');
  });

  test('should render pack in idle state', async ({ page }) => {
    const packContainer = page.locator('[data-state="idle"]');

    await expect(packContainer).toHaveScreenshot('pack-idle.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test('should render opening button correctly', async ({ page }) => {
    const openButton = page.locator('button:has-text("Open Pack")');

    await expect(openButton).toHaveScreenshot('open-pack-button.png', {
      maxDiffPixels: 50,
      threshold: 0.15,
    });
  });

  test('should render pack tear animation start', async ({ page }) => {
    // Click open pack
    await page.click('button:has-text("Open Pack")');

    // Capture the animation start state
    const packAnimation = page.locator('.pack-animation');

    // Wait for animation to start
    await page.waitForTimeout(100);

    await expect(packAnimation).toHaveScreenshot('pack-tear-start.png', {
      maxDiffPixels: 200, // Allow more diff for animation frames
      threshold: 0.3,
      animations: 'allow', // Allow animations to play
    });
  });

  test('should render card reveal state', async ({ page }) => {
    // Open pack and skip to reveal
    await page.click('button:has-text("Open Pack")');
    await page.waitForTimeout(1500); // Wait for animation

    const cardReveal = page.locator('.card-reveal');

    await expect(cardReveal).toHaveScreenshot('card-reveal.png', {
      maxDiffPixels: 150,
      threshold: 0.25,
    });
  });

  test('should render results screen with all cards', async ({ page }) => {
    // Open pack and wait for results
    await page.click('button:has-text("Open Pack")');
    await page.waitForSelector('[data-state="results"]', { timeout: 5000 });

    const resultsScreen = page.locator('.pack-results');

    await expect(resultsScreen).toHaveScreenshot('pack-results.png', {
      maxDiffPixels: 200,
      threshold: 0.25,
      fullPage: true, // Capture entire results screen
    });
  });

  test('should render share button correctly', async ({ page }) => {
    await page.click('button:has-text("Open Pack")');
    await page.waitForSelector('[data-state="results"]', { timeout: 5000 });

    const shareButton = page.locator('button:has-text("Share")');

    await expect(shareButton).toHaveScreenshot('share-button.png', {
      maxDiffPixels: 50,
      threshold: 0.15,
    });
  });
});
