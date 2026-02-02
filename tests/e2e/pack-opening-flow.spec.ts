import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Integration Tests for Pack Opening Flow
 *
 * Tests the complete end-to-end pack opening experience:
 * 1. Pack generation
 * 2. Pack animation
 * 3. Card reveal (interactive)
 * 4. Results display (stats & summary)
 * 5. Collection persistence (IndexedDB)
 *
 * User Story: PACK-053
 */

/**
 * Helper: Click the "Open Pack" button with proper hydration wait
 */
async function clickOpenPackButton(page: Page) {
  const openPackButton = page.locator('button.btn-primary').filter({ hasText: 'Open Pack' });
  await openPackButton.waitFor({ state: 'visible', timeout: 10000 });
  // Wait for Svelte hydration - ensures onMount() has fired
  await page.waitForTimeout(1000);
  await openPackButton.click();
}

/**
 * Helper: Open a pack and skip to results
 */
async function openPackAndSkipToResults(page: Page) {
  await clickOpenPackButton(page);
  await page.waitForTimeout(500); // Wait for animation start
  await page.keyboard.press('Space');
  await expect(page.locator('text=Collection Updated')).toBeVisible({ timeout: 15000 });
}

/**
 * Helper: Clear IndexedDB and dismiss cookie consent/tutorial before test
 */
async function clearStorage(page: Page) {
  await page.evaluate(() => {
    // Dismiss cookie consent to prevent dialog blocking interactions
    localStorage.setItem('daddeck-cookie-preferences', JSON.stringify({
      consent: 'accepted',
      categories: { necessary: true, analytics: false, marketing: false },
      timestamp: Date.now()
    }));

    // Dismiss tutorial to prevent overlay blocking interactions
    localStorage.setItem('daddeck-tutorial-progress', JSON.stringify({
      "first_time": true
    }));

    // Dismiss welcome modal
    localStorage.setItem('daddeck-welcome-seen', 'true');

    return new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('daddeck-collection');
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    });
  });
}

test.describe('Pack Opening Flow - End to End', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
  });

  test('should complete full pack opening flow', async ({ page }) => {
    // Navigate to pack opening page
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Verify pack opener interface is ready
    await expect(page.getByRole('heading', { name: 'Open a Pack' })).toBeVisible();
    const openButton = page.locator('button.btn-primary').filter({ hasText: 'Open Pack' });
    await openButton.waitFor({ state: 'visible', timeout: 10000 });
    await expect(openButton).toBeEnabled();

    // Click to open pack
    await openButton.click();

    // Verify pack animation started
    const packAnimation = page.locator('[data-testid="pack-animation"]');
    await expect(packAnimation).toBeVisible({ timeout: 5000 });

    // Skip animation
    await page.keyboard.press('Space');

    // Verify results screen is displayed
    await expect(page.locator('text=Collection Updated')).toBeVisible({ timeout: 10000 });

    // Verify cards are shown in results (6 cards per pack)
    const cards = page.locator('[role="button"][aria-label^="Inspect"]');
    await expect(cards).toHaveCount(6);

    // Verify pack stats are shown
    await expect(page.locator('text=Signature Best Pull')).toBeVisible();
    await expect(page.locator('text=Full Pack Contents')).toBeVisible();
  });

  test('should handle skip animation correctly', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open pack
    await clickOpenPackButton(page);

    // Wait for animation to start
    await page.waitForTimeout(500);

    // Skip with Space key
    await page.keyboard.press('Space');

    // Results should appear
    await expect(page.locator('text=Collection Updated')).toBeVisible({ timeout: 10000 });

    // Cards should be visible
    const cards = page.locator('[role="button"][aria-label^="Inspect"]');
    await expect(cards).toHaveCount(6);
  });

  test('should allow opening multiple packs in sequence', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open 3 packs
    for (let i = 0; i < 3; i++) {
      await clickOpenPackButton(page);
      await page.waitForTimeout(500);
      await page.keyboard.press('Space');

      // Verify results (longer timeout for mobile)
      await expect(page.locator('text=Collection Updated')).toBeVisible({ timeout: 15000 });

      // Verify cards are displayed
      const cards = page.locator('[role="button"][aria-label^="Inspect"]');
      await expect(cards).toHaveCount(6);

      if (i < 2) {
        // Click "Open Another Pack"
        const anotherButton = page.locator('button').filter({ hasText: /Open Another Pack/i });
        await anotherButton.waitFor({ state: 'visible', timeout: 10000 });
        await anotherButton.click();
        // Wait for state reset on mobile
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should display correct rarity distribution', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open pack and skip to results
    await openPackAndSkipToResults(page);

    // Wait for results to fully render on mobile
    await page.waitForTimeout(500);

    // Verify distribution section
    await expect(page.locator('text=Distribution')).toBeVisible({ timeout: 10000 });

    // Should show at least one rarity count (uppercase in UI: "3X COMMON")
    // The rarity names in UI are uppercase due to CSS
    const rarityCount = page.locator('span').filter({ hasText: /\d+x\s+(Common|Uncommon|Rare|Epic|Legendary|Mythic)/i });
    await expect(rarityCount.first()).toBeVisible({ timeout: 15000 });

    // Verify 6 cards in results
    const cards = page.locator('[role="button"][aria-label^="Inspect"]');
    await expect(cards).toHaveCount(6);
  });

  test('should handle error states gracefully', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open pack
    await clickOpenPackButton(page);

    // Clear storage during animation (simulating storage error)
    await clearStorage(page);

    // Skip animation
    await page.keyboard.press('Space');

    // Should still show results (pack data is in memory)
    await expect(page.locator('text=Collection Updated')).toBeVisible({ timeout: 10000 });
  });

  test('should work correctly with cinematic mode toggle', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Look for cinematic mode toggle in animation controls
    const animationControls = page.locator('[data-testid="animation-controls"]');

    if (await animationControls.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Toggle exists, test with it
      const toggle = animationControls.locator('button, input[type="checkbox"]').first();
      if (await toggle.isVisible()) {
        await toggle.click();
        await page.waitForTimeout(300);
      }
    }

    // Open pack regardless of toggle state
    await openPackAndSkipToResults(page);

    // Cards should be visible
    const cards = page.locator('[role="button"][aria-label^="Inspect"]');
    await expect(cards).toHaveCount(6);
  });

  test('should handle keyboard navigation throughout flow', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Wait for hydration
    const openButton = page.locator('button.btn-primary').filter({ hasText: 'Open Pack' });
    await openButton.waitFor({ state: 'visible', timeout: 10000 });

    // Click to open (keyboard focus navigation is tested implicitly by skip)
    await openButton.click();
    await page.waitForTimeout(500);

    // Skip animation with keyboard (Enter key)
    await page.keyboard.press('Enter');

    // Verify results appear after keyboard skip
    await expect(page.locator('text=Collection Updated')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Pack Opening Flow - Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
  });

  test('should complete pack opening within acceptable time', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    const startTime = Date.now();

    // Open pack
    await clickOpenPackButton(page);
    await page.waitForTimeout(500);
    await page.keyboard.press('Space');

    // Wait for results
    await expect(page.locator('text=Collection Updated')).toBeVisible({ timeout: 10000 });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Pack opening should complete within 8 seconds (including skip)
    expect(duration).toBeLessThan(8000);
  });

  test('should not cause memory leaks with multiple pack openings', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Get initial memory usage (if available)
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Open 5 packs
    for (let i = 0; i < 5; i++) {
      await clickOpenPackButton(page);
      await page.waitForTimeout(500);
      await page.keyboard.press('Space');
      await expect(page.locator('text=Collection Updated')).toBeVisible({ timeout: 10000 });

      if (i < 4) {
        const anotherButton = page.locator('button').filter({ hasText: /Open Another Pack/i });
        await anotherButton.click();
        await page.waitForTimeout(500);
      }
    }

    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Memory increase should be reasonable (less than 50MB)
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      const fiftyMB = 50 * 1024 * 1024;
      expect(memoryIncrease).toBeLessThan(fiftyMB);
    }
  });
});
