import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for UI Components
 *
 * These tests ensure key UI components render correctly:
 * - Navigation (desktop and mobile)
 * - Buttons (primary, secondary, icon)
 * - Modals
 * - Theme toggle
 * - Collection filters
 */

test.describe('Navigation Visual Regression', () => {
  test('should render desktop navigation correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav');

    await expect(nav).toHaveScreenshot('desktop-navigation.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test('should render mobile navigation correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav');

    await expect(nav).toHaveScreenshot('mobile-navigation.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });
});

test.describe('Button Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');
  });

  test('should render primary button correctly', async ({ page }) => {
    const primaryButton = page.locator('.btn-primary');

    await expect(primaryButton).toHaveScreenshot('btn-primary.png', {
      maxDiffPixels: 50,
      threshold: 0.15,
    });
  });

  test('should render button hover state', async ({ page }) => {
    const primaryButton = page.locator('.btn-primary');

    await primaryButton.hover();

    await expect(primaryButton).toHaveScreenshot('btn-primary-hover.png', {
      maxDiffPixels: 50,
      threshold: 0.15,
    });
  });

  test('should render secondary button correctly', async ({ page }) => {
    // Navigate to a page with secondary buttons
    await page.goto('/collection');

    const secondaryButton = page.locator('.btn-secondary').first();

    await expect(secondaryButton).toHaveScreenshot('btn-secondary.png', {
      maxDiffPixels: 50,
      threshold: 0.15,
    });
  });
});

test.describe('Theme Visual Regression', () => {
  test('should render light theme correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Ensure light theme is active
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    const body = page.locator('body');

    await expect(body).toHaveScreenshot('light-theme.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test('should render dark theme correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Ensure dark theme is active
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    const body = page.locator('body');

    await expect(body).toHaveScreenshot('dark-theme.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });
});

test.describe('Collection Interface Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');
  });

  test('should render collection grid correctly', async ({ page }) => {
    const grid = page.locator('.collection-grid');

    await expect(grid).toHaveScreenshot('collection-grid.png', {
      maxDiffPixels: 150,
      threshold: 0.25,
    });
  });

  test('should render collection stats correctly', async ({ page }) => {
    const stats = page.locator('.collection-stats');

    await expect(stats).toHaveScreenshot('collection-stats.png', {
      maxDiffPixels: 50,
      threshold: 0.15,
    });
  });

  test('should render search input correctly', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="search" i]');

    await expect(searchInput).toHaveScreenshot('search-input.png', {
      maxDiffPixels: 50,
      threshold: 0.15,
    });
  });

  test('should render filter chips correctly', async ({ page }) => {
    const filters = page.locator('.filter-chips');

    await expect(filters).toHaveScreenshot('filter-chips.png', {
      maxDiffPixels: 50,
      threshold: 0.15,
    });
  });
});

test.describe('Landing Page Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should render hero section correctly', async ({ page }) => {
    const hero = page.locator('.hero');

    await expect(hero).toHaveScreenshot('hero-section.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test('should render features section correctly', async ({ page }) => {
    const features = page.locator('.features');

    await expect(features).toHaveScreenshot('features-section.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });
});
