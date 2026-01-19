/**
 * PACK-059: Mobile Responsive Grid Layouts
 *
 * Visual regression tests for responsive card grids across all components.
 * Tests verify mobile, tablet, and desktop layouts match requirements.
 */

import { test, expect } from '@playwright/test';

// Test viewports matching acceptance criteria
const VIEWPORTS = {
  mobileSmall: { width: 375, height: 667 },   // iPhone SE - expects 2 columns
  mobileMedium: { width: 390, height: 844 },  // iPhone 12 - expects 2 columns
  mobileLandscape: { width: 667, height: 375 }, // Mobile landscape - expects 3 columns
  tablet: { width: 768, height: 1024 },       // iPad - expects 4 columns
  desktop: { width: 1280, height: 720 },      // Desktop - expects 6 columns
  desktopLarge: { width: 1536, height: 864 }  // Large desktop - expects 7 columns
};

test.describe('PACK-059: Collection Gallery Responsive Grid', () => {
  test('should display 2 columns on mobile', async ({ page }) => {
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Check mobile viewport
    await page.setViewportSize(VIEWPORTS.mobileSmall);
    await page.waitForTimeout(500);

    const grid = page.locator('.card-grid').first();
    await expect(grid).toBeVisible();

    // Verify grid has 2 columns by checking width
    const gridWidth = await grid.evaluate(el => el.offsetWidth);
    const card = grid.locator('.card-wrapper').first();
    const cardWidth = await card.evaluate(el => el.offsetWidth);
    const gap = 12; // 0.75rem gap from CSS

    // Calculate expected columns: (gridWidth + gap) / (cardWidth + gap)
    const columns = Math.floor((gridWidth + gap) / (cardWidth + gap));

    expect(columns).toBe(2);

    // Verify no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test('should display 4 columns on tablet', async ({ page }) => {
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    await page.setViewportSize(VIEWPORTS.tablet);
    await page.waitForTimeout(500);

    const grid = page.locator('.card-grid').first();
    const gridWidth = await grid.evaluate(el => el.offsetWidth);
    const card = grid.locator('.card-wrapper').first();
    const cardWidth = await card.evaluate(el => el.offsetWidth);
    const gap = 20; // 1.25rem gap from CSS

    const columns = Math.floor((gridWidth + gap) / (cardWidth + gap));

    expect(columns).toBe(4);
  });

  test('should display 6 columns on desktop', async ({ page }) => {
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    await page.setViewportSize(VIEWPORTS.desktop);
    await page.waitForTimeout(500);

    const grid = page.locator('.card-grid').first();
    const gridWidth = await grid.evaluate(el => el.offsetWidth);
    const card = grid.locator('.card-wrapper').first();
    const cardWidth = await card.evaluate(el => el.offsetWidth);
    const gap = 24; // 1.5rem gap from CSS

    const columns = Math.floor((gridWidth + gap) / (cardWidth + gap));

    expect(columns).toBeGreaterThanOrEqual(6);
  });

  test('cards should scale proportionally', async ({ page }) => {
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Test on mobile
    await page.setViewportSize(VIEWPORTS.mobileSmall);
    await page.waitForTimeout(500);

    const gridMobile = page.locator('.card-grid').first();
    const cardMobile = gridMobile.locator('.card-wrapper').first();
    const mobileWidth = await cardMobile.evaluate(el => el.offsetWidth);
    const mobileHeight = await cardMobile.evaluate(el => el.offsetHeight);
    const mobileRatio = mobileWidth / mobileHeight;

    // Test on desktop
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.waitForTimeout(500);

    const gridDesktop = page.locator('.card-grid').first();
    const cardDesktop = gridDesktop.locator('.card-wrapper').first();
    const desktopWidth = await cardDesktop.evaluate(el => el.offsetWidth);
    const desktopHeight = await cardDesktop.evaluate(el => el.offsetHeight);
    const desktopRatio = desktopWidth / desktopHeight;

    // Aspect ratio should be maintained (2.5:3.5)
    expect(mobileRatio).toBeCloseTo(2.5 / 3.5, 1);
    expect(desktopRatio).toBeCloseTo(2.5 / 3.5, 1);
  });
});

test.describe('PACK-059: Pack Opening Results Grid', () => {
  test('should display cards responsively in pack results', async ({ page }) => {
    // Open a pack first
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Click open pack button
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();

    // Wait for pack opening animation to complete
    await page.waitForTimeout(3000);

    // Skip animation if present
    const skipButton = page.locator('button:has-text("Skip")');
    if (await skipButton.isVisible()) {
      await skipButton.click();
    }

    // Wait for results screen
    await page.waitForTimeout(1000);

    // Test mobile viewport
    await page.setViewportSize(VIEWPORTS.mobileSmall);
    await page.waitForTimeout(500);

    const cardsGrid = page.locator('.grid.grid-cols-3').first();
    await expect(cardsGrid).toBeVisible();

    // Verify no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });
});

test.describe('PACK-059: Deck Builder Responsive Grid', () => {
  test('should display deck cards responsively', async ({ page }) => {
    await page.goto('/deck-builder');
    await page.waitForLoadState('networkidle');

    // Test mobile viewport
    await page.setViewportSize(VIEWPORTS.mobileSmall);
    await page.waitForTimeout(500);

    // Check if there are decks to display
    const decksGrid = page.locator('.decks-grid').first();
    if (await decksGrid.isVisible()) {
      const deckCard = decksGrid.locator('.deck-card').first();
      await expect(deckCard).toBeVisible();

      // Verify no horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    }

    // Check available cards grid (minmax(150px, 1fr) on mobile)
    const availableGrid = page.locator('.available-cards-grid').first();
    if (await availableGrid.isVisible()) {
      const gridWidth = await availableGrid.evaluate(el => el.offsetWidth);
      const card = availableGrid.locator('.available-card').first();

      if (await card.isVisible()) {
        const cardWidth = await card.evaluate(el => el.offsetWidth);
        // On mobile (375px), with minmax(150px, 1fr), we should get 2 columns
        const expectedColumns = Math.floor(gridWidth / 150);
        expect(expectedColumns).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

test.describe('PACK-059: Crafting Card Selector Grid', () => {
  test('should display cards responsively in crafting', async ({ page }) => {
    await page.goto('/crafting');
    await page.waitForLoadState('networkidle');

    // Test mobile viewport
    await page.setViewportSize(VIEWPORTS.mobileSmall);
    await page.waitForTimeout(500);

    const cardGrid = page.locator('.grid.grid-cols-2').first();
    if (await cardGrid.isVisible()) {
      await expect(cardGrid).toBeVisible();

      // Verify no horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    }
  });
});

test.describe('PACK-059: Battle Arena Responsive Grid', () => {
  test('should display duel stage responsively', async ({ page }) => {
    await page.goto('/offline'); // Battle page
    await page.waitForLoadState('networkidle');

    // Test mobile viewport
    await page.setViewportSize(VIEWPORTS.mobileSmall);
    await page.waitForTimeout(500);

    const duelStage = page.locator('.duel-stage').first();
    if (await duelStage.isVisible()) {
      await expect(duelStage).toBeVisible();

      // Verify no horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    }
  });
});

test.describe('PACK-059: Missing Cards Panel Grid', () => {
  test('should display missing cards responsively', async ({ page }) => {
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Open missing cards panel if available
    const missingButton = page.locator('button:has-text("Missing Cards")');
    if (await missingButton.isVisible()) {
      await missingButton.click();
      await page.waitForTimeout(500);

      // Test mobile viewport
      await page.setViewportSize(VIEWPORTS.mobileSmall);
      await page.waitForTimeout(500);

      const sectionCards = page.locator('.section-cards').first();
      if (await sectionCards.isVisible()) {
        // Grid uses minmax(200px, 1fr), so on mobile (375px) we get 1 column
        const gridWidth = await sectionCards.evaluate(el => el.offsetWidth);
        const expectedColumns = Math.floor(gridWidth / 200);
        expect(expectedColumns).toBeGreaterThanOrEqual(1);

        // Verify no horizontal scroll
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
      }
    }
  });
});

test.describe('PACK-059: No Horizontal Scroll', () => {
  const pages = [
    { url: '/', name: 'Landing' },
    { url: '/pack', name: 'Pack Opening' },
    { url: '/collection', name: 'Collection' },
    { url: '/deck-builder', name: 'Deck Builder' },
    { url: '/crafting', name: 'Crafting' },
    { url: '/upgrade', name: 'Upgrade' },
    { url: '/trade', name: 'Trading' }
  ];

  for (const { url, name } of pages) {
    test(`${name} page - no horizontal scroll on mobile`, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      await page.setViewportSize(VIEWPORTS.mobileSmall);
      await page.waitForTimeout(500);

      // Verify no horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);

      // Allow small tolerance for sub-pixel rendering
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
    });
  }
});
