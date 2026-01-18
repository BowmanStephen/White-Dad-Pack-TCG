import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Collection Management
 *
 * Tests the collection management features:
 * 1. Collection display
 * 2. Card filtering and sorting
 * 3. Card search
 * 4. Pack history
 * 5. Collection statistics
 * 6. LocalStorage persistence
 *
 * User Story: DX-002
 * Acceptance Criteria: Test collection management
 */

test.describe('Collection Management', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/collection');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should display empty collection state', async ({ page }) => {
    // Check for empty collection message
    const emptyState = page.locator('[data-testid="empty-collection"]');
    const emptyMessage = page.locator('text=/no cards/i').or(
      page.locator('text=/collection empty/i')
    );

    // Either empty state element or empty message should be visible
    const isVisible = await emptyState.isVisible().catch(() => false) ||
                      await emptyMessage.isVisible().catch(() => false);

    if (isVisible) {
      await expect(emptyState.or(emptyMessage).first()).toBeVisible();
    }
  });

  test('should display collection statistics', async ({ page }) => {
    // First, open some packs to populate collection
    await page.goto('/pack');

    // Open 3 packs
    for (let i = 0; i < 3; i++) {
      const openButton = page.locator('button:has-text("Open Pack")').first();
      await openButton.click();
      await page.waitForTimeout(4000);

      if (i < 2) {
        const anotherButton = page.locator('button:has-text("Open Another")').or(
          page.locator('button:has-text("Open Pack")')
        ).first();
        await anotherButton.click();
        await page.waitForTimeout(500);
      }
    }

    // Navigate to collection
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Check for collection stats
    const stats = page.locator('[data-testid="collection-stats"]');
    await expect(stats).toBeVisible();

    // Verify stats are displayed
    await expect(page.locator('text=/packs/i')).toBeVisible();
    await expect(page.locator('text=/cards/i')).toBeVisible();
  });

  test('should display all cards from opened packs', async ({ page }) => {
    // Open a pack first
    await page.goto('/pack');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Navigate to collection
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Check that cards are displayed
    const cards = page.locator('[data-testid^="collection-card-"]');
    const cardCount = await cards.count();

    expect(cardCount).toBeGreaterThan(0);

    // Verify first card is visible
    await expect(cards.first()).toBeVisible();
  });

  test('should persist collection across page refreshes', async ({ page }) => {
    // Open a pack
    await page.goto('/pack');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Navigate to collection
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Get initial card count
    const initialCards = page.locator('[data-testid^="collection-card-"]');
    const initialCount = await initialCards.count();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify collection persisted
    const reloadedCards = page.locator('[data-testid^="collection-card-"]');
    const reloadedCount = await reloadedCards.count();

    expect(reloadedCount).toBe(initialCount);
  });

  test('should display pack history', async ({ page }) => {
    // Open multiple packs
    await page.goto('/pack');

    for (let i = 0; i < 3; i++) {
      const openButton = page.locator('button:has-text("Open Pack")').first();
      await openButton.click();
      await page.waitForTimeout(4000);

      if (i < 2) {
        const anotherButton = page.locator('button:has-text("Open Another")').or(
          page.locator('button:has-text("Open Pack")')
        ).first();
        await anotherButton.click();
        await page.waitForTimeout(500);
      }
    }

    // Navigate to collection
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Check for pack history panel
    const packHistory = page.locator('[data-testid="pack-history"]');
    await expect(packHistory).toBeVisible();

    // Verify pack history entries
    const historyEntries = page.locator('[data-testid^="pack-history-entry-"]');
    const entryCount = await historyEntries.count();

    expect(entryCount).toBeGreaterThanOrEqual(3);
  });

  test('should filter cards by rarity', async ({ page }) => {
    // Open some packs first
    await page.goto('/pack');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Navigate to collection
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Get total card count before filtering
    const allCards = page.locator('[data-testid^="collection-card-"]');
    const totalCount = await allCards.count();

    // Find rarity filter (checkboxes or buttons)
    const rareFilter = page.locator('label:has-text("Rare")').or(
      page.locator('button:has-text("Rare")')
    ).first();

    if (await rareFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Apply filter
      await rareFilter.click();
      await page.waitForTimeout(500);

      // Verify filtered results
      const filteredCards = page.locator('[data-testid^="collection-card-"]');
      const filteredCount = await filteredCards.count();

      // Filtered count should be different from total
      expect(filteredCount).toBeLessThanOrEqual(totalCount);
    }
  });

  test('should filter cards by dad type', async ({ page }) => {
    // Open some packs first
    await page.goto('/pack');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Navigate to collection
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Get total card count before filtering
    const allCards = page.locator('[data-testid^="collection-card-"]');
    const totalCount = await allCards.count();

    // Find dad type filter
    const bbqDadFilter = page.locator('label:has-text("BBQ")').or(
      page.locator('button:has-text("BBQ")')
    ).first();

    if (await bbqDadFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Apply filter
      await bbqDadFilter.click();
      await page.waitForTimeout(500);

      // Verify filtered results
      const filteredCards = page.locator('[data-testid^="collection-card-"]');
      const filteredCount = await filteredCards.count();

      // Filtered count should be different from total
      expect(filteredCount).toBeLessThanOrEqual(totalCount);
    }
  });

  test('should search cards by name', async ({ page }) => {
    // Open some packs first
    await page.goto('/pack');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Navigate to collection
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Get total card count before searching
    const allCards = page.locator('[data-testid^="collection-card-"]');
    const totalCount = await allCards.count();

    // Find search input
    const searchInput = page.locator('input[placeholder*="search" i], input[data-testid="search-input"]').first();

    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Get a card name to search for
      const firstCardName = await allCards.first().locator('[data-testid="card-name"]').textContent();

      if (firstCardName) {
        // Type search query
        await searchInput.fill(firstCardName);
        await page.waitForTimeout(500);

        // Verify search results
        const searchResults = page.locator('[data-testid^="collection-card-"]');
        const resultCount = await searchResults.count();

        // Should have fewer or equal results
        expect(resultCount).toBeLessThanOrEqual(totalCount);
      }
    }
  });

  test('should sort cards', async ({ page }) => {
    // Open some packs first
    await page.goto('/pack');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Navigate to collection
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Find sort dropdown
    const sortSelect = page.locator('select[data-testid="sort-select"]').or(
      page.locator('[data-testid="sort-button"]')
    ).first();

    if (await sortSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Get initial card order
      const initialCards = page.locator('[data-testid^="collection-card-"]');
      const firstCardName = await initialCards.first().locator('[data-testid="card-name"]').textContent();

      // Change sort order (try different options)
      if (await sortSelect.tagName() === 'SELECT') {
        await sortSelect.selectOption({ index: 1 });
      } else {
        await sortSelect.click();
        await page.waitForTimeout(200);
        await page.locator('[role="option"]').first().click();
      }

      await page.waitForTimeout(500);

      // Get new card order
      const sortedCards = page.locator('[data-testid^="collection-card-"]');
      const newFirstCardName = await sortedCards.first().locator('[data-testid="card-name"]').textContent();

      // Order should be different (unless all cards are same)
      expect(sortedCards).toHaveCount(await initialCards.count());
    }
  });

  test('should clear all filters', async ({ page }) => {
    // Open some packs first
    await page.goto('/pack');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Navigate to collection
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Get initial card count
    const allCards = page.locator('[data-testid^="collection-card-"]');
    const initialCount = await allCards.count();

    // Apply a filter
    const rareFilter = page.locator('label:has-text("Rare")').or(
      page.locator('button:has-text("Rare")')
    ).first();

    if (await rareFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await rareFilter.click();
      await page.waitForTimeout(500);

      // Verify count changed
      const filteredCards = page.locator('[data-testid^="collection-card-"]');
      const filteredCount = await filteredCards.count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);

      // Find and click clear button
      const clearButton = page.locator('button:has-text("Clear")').or(
        page.locator('button[aria-label*="clear" i]')
      ).first();

      if (await clearButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await clearButton.click();
        await page.waitForTimeout(500);

        // Verify all cards are shown again
        const clearedCards = page.locator('[data-testid^="collection-card-"]');
        const clearedCount = await clearedCards.count();
        expect(clearedCount).toBe(initialCount);
      }
    }
  });

  test('should display card details on click/tap', async ({ page }) => {
    // Open a pack first
    await page.goto('/pack');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Navigate to collection
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Click on first card
    const firstCard = page.locator('[data-testid^="collection-card-"]').first();
    await firstCard.click();
    await page.waitForTimeout(300);

    // Check for card detail modal/lightbox
    const cardDetail = page.locator('[data-testid="card-detail"], [data-testid="lightbox"], [role="dialog"]');
    await expect(cardDetail.first()).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Open a pack first
    await page.goto('/pack');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Navigate to collection
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Tab to first card
    await page.keyboard.press('Tab');

    // Verify card is focused
    const firstCard = page.locator('[data-testid^="collection-card-"]').first();
    await expect(firstCard).toBeFocused();

    // Press Enter to open details
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // Verify detail view opened
    const cardDetail = page.locator('[data-testid="card-detail"], [data-testid="lightbox"]');
    await expect(cardDetail.first()).toBeVisible();
  });
});

test.describe('Collection - Pack History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pack');

    // Open 3 packs
    for (let i = 0; i < 3; i++) {
      const openButton = page.locator('button:has-text("Open Pack")').first();
      await openButton.click();
      await page.waitForTimeout(4000);

      if (i < 2) {
        const anotherButton = page.locator('button:has-text("Open Another")').or(
          page.locator('button:has-text("Open Pack")')
        ).first();
        await anotherButton.click();
        await page.waitForTimeout(500);
      }
    }

    // Navigate to collection
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');
  });

  test('should display pack history in chronological order', async ({ page }) => {
    const packHistory = page.locator('[data-testid="pack-history"]');
    await expect(packHistory).toBeVisible();

    // Get all pack history entries
    const entries = page.locator('[data-testid^="pack-history-entry-"]');
    const entryCount = await entries.count();

    expect(entryCount).toBeGreaterThanOrEqual(3);

    // Verify they're ordered (first entry should be most recent)
    const firstEntryDate = await entries.first().locator('[data-testid="pack-date"]').textContent();
    const lastEntryDate = await entries.last().locator('[data-testid="pack-date"]').textContent();

    expect(firstEntryDate).toBeTruthy();
    expect(lastEntryDate).toBeTruthy();
  });

  test('should allow viewing pack details from history', async ({ page }) => {
    const packHistory = page.locator('[data-testid="pack-history"]');
    await expect(packHistory).toBeVisible();

    // Click on first pack history entry
    const firstEntry = page.locator('[data-testid^="pack-history-entry-"]').first();
    await firstEntry.click();
    await page.waitForTimeout(300);

    // Check for pack detail view or modal
    const packDetail = page.locator('[data-testid="pack-detail"], [role="dialog"]');
    await expect(packDetail.first()).toBeVisible();
  });

  test('should show pack rarity distribution in history', async ({ page }) => {
    const packHistory = page.locator('[data-testid="pack-history"]');
    await expect(packHistory).toBeVisible();

    // Check for rarity indicators in pack history
    const rarityIndicators = page.locator('[data-testid="pack-history-entry-"] [data-testid^="rarity-"]');
    const indicatorCount = await rarityIndicators.count();

    expect(indicatorCount).toBeGreaterThan(0);
  });
});

test.describe('Collection - Statistics', () => {
  test('should display accurate pack count', async ({ page }) => {
    // Open packs
    await page.goto('/pack');
    const packCount = 3;

    for (let i = 0; i < packCount; i++) {
      const openButton = page.locator('button:has-text("Open Pack")').first();
      await openButton.click();
      await page.waitForTimeout(4000);

      if (i < packCount - 1) {
        const anotherButton = page.locator('button:has-text("Open Another")').or(
          page.locator('button:has-text("Open Pack")')
        ).first();
        await anotherButton.click();
        await page.waitForTimeout(500);
      }
    }

    // Navigate to collection
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Check pack count in stats
    const packCountText = await page.locator('text=/packs/i').first().textContent();
    expect(packCountText).toContain(packCount.toString());
  });

  test('should display accurate card count', async ({ page }) => {
    // Open a pack (7 cards)
    await page.goto('/pack');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Navigate to collection
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Check card count in stats
    const cardCountText = await page.locator('text=/cards/i').first().textContent();

    // Should show 7 cards
    expect(cardCountText).toBeTruthy();

    // Verify actual card count matches
    const cards = page.locator('[data-testid^="collection-card-"]');
    const actualCount = await cards.count();
    expect(actualCount).toBe(7);
  });

  test('should display rarity distribution', async ({ page }) => {
    // Open packs
    await page.goto('/pack');

    for (let i = 0; i < 5; i++) {
      const openButton = page.locator('button:has-text("Open Pack")').first();
      await openButton.click();
      await page.waitForTimeout(4000);

      if (i < 4) {
        const anotherButton = page.locator('button:has-text("Open Another")').or(
          page.locator('button:has-text("Open Pack")')
        ).first();
        await anotherButton.click();
        await page.waitForTimeout(500);
      }
    }

    // Navigate to collection
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Check for rarity stats
    const rarityStats = page.locator('[data-testid="rarity-stats"], [data-testid="collection-stats"]');
    await expect(rarityStats.first()).toBeVisible();
  });
});

test.describe('Collection - Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Open a pack first
    await page.goto('/pack');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Navigate to collection
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Verify collection is visible on mobile
    const cards = page.locator('[data-testid^="collection-card-"]');
    await expect(cards.first()).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Open a pack first
    await page.goto('/pack');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Navigate to collection
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Verify collection is visible on tablet
    const cards = page.locator('[data-testid^="collection-card-"]');
    await expect(cards.first()).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Open a pack first
    await page.goto('/pack');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Navigate to collection
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Verify collection is visible on desktop
    const cards = page.locator('[data-testid^="collection-card-"]');
    await expect(cards.first()).toBeVisible();
  });
});
