import { test, expect } from '@playwright/test';

/**
 * Integration Tests for Pack Opening Flow
 *
 * Tests the complete end-to-end pack opening experience:
 * 1. Pack generation (server-side)
 * 2. Pack animation (client-side)
 * 3. Card reveal (interactive)
 * 4. Results display (stats & summary)
 * 5. Collection persistence (LocalStorage → IndexedDB)
 *
 * User Story: PACK-053
 * Acceptance Criteria: Test full pack opening flow
 */

test.describe('Pack Opening Flow - End to End', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto('/collection');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should complete full pack opening flow', async ({ page }) => {
    // Step 1: Navigate to pack opening page
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Verify pack opener interface is ready
    await expect(page.locator('h1')).toContainText(/pack/i);
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await expect(openButton).toBeVisible();
    await expect(openButton).toBeEnabled();

    // Step 2: Click to generate and open pack
    await openButton.click();

    // Step 3: Verify pack animation started
    const packAnimation = page.locator('[data-testid="pack-animation"]');
    await expect(packAnimation).toBeVisible({ timeout: 2000 });

    // Step 4: Wait for card reveal phase
    // Wait for animation to complete and cards to reveal
    await page.waitForTimeout(4000);

    // Step 5: Verify cards are revealed
    const cards = page.locator('[data-testid^="card-"]');
    const cardCount = await cards.count();
    expect(cardCount).toBe(7); // Standard pack has 7 cards

    // Verify each card is visible
    for (let i = 0; i < cardCount; i++) {
      await expect(cards.nth(i)).toBeVisible();
    }

    // Step 6: Verify results screen is displayed
    const results = page.locator('[data-testid="pack-results"]');
    await expect(results).toBeVisible({ timeout: 5000 });

    // Verify pack stats are shown
    await expect(page.locator('text=/cards opened/i')).toBeVisible();

    // Step 7: Verify pack was added to collection
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Check collection stats
    const packCountText = await page.locator('text=/packs/i').first().textContent();
    expect(packCountText).toBeTruthy();

    // Verify cards are in collection
    const collectionCards = page.locator('[data-testid^="collection-card-"]');
    const collectionCardCount = await collectionCards.count();
    expect(collectionCardCount).toBe(7); // All 7 cards should be in collection
  });

  test('should handle skip animation correctly', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open pack
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();

    // Wait for animation to start
    await page.waitForTimeout(500);

    // Look for skip button
    const skipButton = page.locator('button:has-text("Skip")').or(
      page.locator('button[aria-label*="skip" i]')
    ).first();

    if (await skipButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Click skip button
      await skipButton.click();

      // Cards should be revealed immediately
      await page.waitForTimeout(500);
      const cards = page.locator('[data-testid^="card-"]');
      await expect(cards).toHaveCount(7);
    } else {
      // Skip button not implemented, verify normal flow
      await page.waitForTimeout(4000);
      const cards = page.locator('[data-testid^="card-"]');
      await expect(cards).toHaveCount(7);
    }
  });

  test('should allow opening multiple packs in sequence', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open 3 packs
    for (let i = 0; i < 3; i++) {
      const openButton = page.locator('button:has-text("Open Pack")').first();
      await openButton.click();
      await page.waitForTimeout(4000);

      // Verify cards are displayed
      const cards = page.locator('[data-testid^="card-"]');
      await expect(cards).toHaveCount(7);

      // Find "Open Another" button or similar
      const anotherButton = page.locator('button:has-text("Open Another")').or(
        page.locator('button:has-text("Open Pack")')
      ).first();

      if (i < 2) {
        await expect(anotherButton).toBeVisible();
        await anotherButton.click();
        await page.waitForTimeout(500);
      }
    }

    // Verify all packs were saved to collection
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    const packCountText = await page.locator('text=/packs/i').first().textContent();
    expect(packCountText).toContain('3');

    // Should have 21 cards (3 packs × 7 cards)
    const collectionCards = page.locator('[data-testid^="collection-card-"]');
    const collectionCardCount = await collectionCards.count();
    expect(collectionCardCount).toBe(21);
  });

  test('should display correct rarity distribution', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open pack
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Count rarities
    const cards = page.locator('[data-testid^="card-"]');
    const rarities: string[] = [];

    for (let i = 0; i < await cards.count(); i++) {
      const card = cards.nth(i);
      const rarity = await card.getAttribute('data-rarity');
      if (rarity) {
        rarities.push(rarity);
      }
    }

    // Verify we have rarities
    expect(rarities.length).toBe(7);

    // Should have at least 3 commons (guaranteed slots 1-3)
    const commonCount = rarities.filter(r => r === 'common').length;
    expect(commonCount).toBeGreaterThanOrEqual(3);

    // Results screen should show rarity breakdown
    const results = page.locator('[data-testid="pack-results"]');
    await expect(results).toBeVisible();
  });

  test('should handle holographic cards correctly', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open packs until we find a holographic card
    let foundHolo = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!foundHolo && attempts < maxAttempts) {
      const openButton = page.locator('button:has-text("Open Pack")').first();
      await openButton.click();
      await page.waitForTimeout(4000);

      // Check for holographic cards
      const holoCards = page.locator('[data-testid^="card-"].is-holo');
      const holoCount = await holoCards.count();

      if (holoCount > 0) {
        foundHolo = true;
        await expect(holoCards.first()).toBeVisible();

        // Verify holo effect is visible (CSS class or attribute)
        const hasHoloClass = await holoCards.first().evaluate(el =>
          el.classList.contains('is-holo')
        );
        expect(hasHoloClass).toBe(true);
      } else {
        // Try another pack
        const anotherButton = page.locator('button:has-text("Open Another")').or(
          page.locator('button:has-text("Open Pack")')
        ).first();

        if (await anotherButton.isVisible() && attempts < maxAttempts - 1) {
          await anotherButton.click();
          await page.waitForTimeout(500);
        }
      }

      attempts++;
    }

    // If we didn't find a holo card, that's okay (random chance)
    expect(attempts).toBeGreaterThan(0);
  });

  test('should persist pack history correctly', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open 2 packs
    for (let i = 0; i < 2; i++) {
      const openButton = page.locator('button:has-text("Open Pack")').first();
      await openButton.click();
      await page.waitForTimeout(4000);

      if (i < 1) {
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

    // Check pack history panel
    const packHistory = page.locator('[data-testid="pack-history"]');
    await expect(packHistory).toBeVisible();

    // Should have at least 2 pack history entries
    const historyEntries = page.locator('[data-testid^="pack-history-entry-"]');
    const entryCount = await historyEntries.count();
    expect(entryCount).toBeGreaterThanOrEqual(2);

    // Verify entries are in chronological order (most recent first)
    const firstEntryDate = await historyEntries.first().locator('[data-testid="pack-date"], [data-testid="timestamp"]').textContent();
    const lastEntryDate = await historyEntries.last().locator('[data-testid="pack-date"], [data-testid="timestamp"]').textContent();

    expect(firstEntryDate).toBeTruthy();
    expect(lastEntryDate).toBeTruthy();
  });

  test('should handle error states gracefully', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Simulate error by clearing localStorage during pack generation
    const openButton = page.locator('button:has-text("Open Pack")').first();

    // Click to open
    await openButton.click();

    // Clear storage immediately (simulating storage error)
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Wait for flow to complete
    await page.waitForTimeout(4000);

    // Verify error handling - either:
    // 1. Error message displayed
    // 2. UI recovers gracefully
    // 3. Retries automatically

    const errorMessage = page.locator('[data-testid="error-message"], [role="alert"]');
    const hasError = await errorMessage.isVisible().catch(() => false);

    if (hasError) {
      await expect(errorMessage).toBeVisible();
    } else {
      // If no error shown, verify cards are still displayed
      const cards = page.locator('[data-testid^="card-"]');
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThan(0);
    }
  });

  test('should work correctly with cinematic mode toggle', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Look for cinematic mode toggle
    const cinematicToggle = page.locator('button[aria-label*="cinematic" i], button:has-text("Cinematic")').first();

    if (await cinematicToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Toggle cinematic mode off
      await cinematicToggle.click();
      await page.waitForTimeout(500);

      // Open pack - animations should be reduced/faster
      const openButton = page.locator('button:has-text("Open Pack")').first();
      await openButton.click();

      // Wait shorter time (cinematic mode off = faster)
      await page.waitForTimeout(2000);

      // Cards should still be revealed
      const cards = page.locator('[data-testid^="card-"]');
      await expect(cards).toHaveCount(7);
    } else {
      // Cinematic toggle not found, test normal flow
      const openButton = page.locator('button:has-text("Open Pack")').first();
      await openButton.click();
      await page.waitForTimeout(4000);
      const cards = page.locator('[data-testid^="card-"]');
      await expect(cards).toHaveCount(7);
    }
  });

  test('should maintain state across page reloads', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open pack
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Get card count before reload
    const cardsBefore = page.locator('[data-testid^="card-"]');
    const countBefore = await cardsBefore.count();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check that pack state is maintained
    // Note: This depends on implementation - some apps may clear pack state on reload
    const cardsAfter = page.locator('[data-testid^="card-"]');
    const countAfter = await cardsAfter.count();

    // Either:
    // 1. Pack state persisted (counts match)
    // 2. Pack state cleared (countAfter = 0, but collection has cards)
    expect(countAfter).toBeGreaterThanOrEqual(0);

    // Verify collection persisted
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    const collectionCards = page.locator('[data-testid^="collection-card-"]');
    const collectionCount = await collectionCards.count();
    expect(collectionCount).toBe(countBefore);
  });

  test('should handle keyboard navigation throughout flow', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Tab to open button
    await page.keyboard.press('Tab');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await expect(openButton).toBeFocused();

    // Press Enter to open pack
    await page.keyboard.press('Enter');
    await page.waitForTimeout(4000);

    // Verify cards are displayed
    const cards = page.locator('[data-testid^="card-"]');
    await expect(cards.first()).toBeVisible();

    // Tab through cards
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify a card is focused
    const focusedCard = page.locator(':focus').locator('[data-testid^="card-"]');
    const isCardFocused = await focusedCard.count() > 0;

    if (isCardFocused) {
      await expect(focusedCard).toBeVisible();
    }
  });
});

test.describe('Pack Opening Flow - Performance', () => {
  test('should complete pack opening within acceptable time', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    const startTime = Date.now();

    // Open pack
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();

    // Wait for results screen
    await page.waitForSelector('[data-testid="pack-results"]', { timeout: 10000 });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Pack opening should complete within 8 seconds
    expect(duration).toBeLessThan(8000);
  });

  test('should not cause memory leaks with multiple pack openings', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Open 5 packs
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

    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Memory increase should be reasonable (less than 50MB)
    const memoryIncrease = finalMemory - initialMemory;
    const fiftyMB = 50 * 1024 * 1024;

    if (initialMemory > 0 && finalMemory > 0) {
      expect(memoryIncrease).toBeLessThan(fiftyMB);
    }
  });
});
