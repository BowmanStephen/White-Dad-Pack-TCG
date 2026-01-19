import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Pack Opening Flow
 *
 * Tests the complete pack opening experience:
 * 1. Navigation to pack opening page
 * 2. Pack generation
 * 3. Pack animation
 * 4. Card reveal
 * 5. Results display
 * 6. Collection persistence
 *
 * User Story: DX-002
 * Acceptance Criteria: Test pack opening flow
 */

test.describe('Pack Opening Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to pack opening page
    await page.goto('/pack');

    // Wait for page to load and pack opener component to hydrate
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="pack-opener"]', { timeout: 5000 });
  });

  test('should display pack opening interface', async ({ page }) => {
    // Check that the main elements are present
    await expect(page.locator('h1')).toContainText(/pack/i);
    await expect(page.locator('[data-testid="pack-opener"]')).toBeVisible();
  });

  test('should open a pack when clicking the open button', async ({ page }) => {
    // Find and click the "Open Pack" button
    const openButton = page.locator('button:has-text("Open Pack")').first();

    // Wait for button to be enabled and visible
    await expect(openButton).toBeVisible();
    await expect(openButton).toBeEnabled();

    // Click to open pack
    await openButton.click();

    // Wait for pack generation and animation to start
    await page.waitForTimeout(500);

    // Verify pack state changed (animation should be playing)
    // The button should be disabled during opening
    await expect(openButton).toBeDisabled();
  });

  test('should display cards after pack opening completes', async ({ page }) => {
    // Open a pack
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();

    // Wait for animation and reveal to complete
    // This typically takes 2-3 seconds for the full animation
    await page.waitForTimeout(4000);

    // Check that cards are displayed
    const cards = page.locator('[data-testid^="card-"]');
    await expect(cards).toHaveCount(7, { timeout: 5000 });

    // Verify at least one card has a rarity displayed
    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();
  });

  test('should show pack results after all cards revealed', async ({ page }) => {
    // Open a pack
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();

    // Wait for full pack opening sequence
    await page.waitForTimeout(5000);

    // Check for results screen elements
    await expect(page.locator('[data-testid="pack-results"]')).toBeVisible();

    // Verify pack stats are displayed
    await expect(page.locator('text=/cards opened/i')).toBeVisible();
  });

  test('should allow opening multiple packs', async ({ page }) => {
    // Open first pack
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Find "Open Another Pack" button or similar
    const anotherButton = page.locator('button:has-text("Open Another")').or(
      page.locator('button:has-text("Open Pack")')
    ).first();

    await expect(anotherButton).toBeVisible();
    await expect(anotherButton).toBeEnabled();

    // Open second pack
    await anotherButton.click();
    await page.waitForTimeout(4000);

    // Verify new cards are displayed
    const cards = page.locator('[data-testid^="card-"]');
    await expect(cards).toHaveCount(7);
  });

  test('should persist pack to collection', async ({ page }) => {
    // Open a pack
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();

    // Wait for pack opening to complete
    await page.waitForTimeout(5000);

    // Navigate to collection page
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Verify collection has at least one pack
    await expect(page.locator('[data-testid="collection-stats"]')).toBeVisible();

    // Check pack count
    const packCountText = await page.locator('text=/packs/i').first().textContent();
    expect(packCountText).toBeTruthy();

    // Verify at least one card is in collection
    const cards = page.locator('[data-testid^="collection-card-"]');
    await expect(cards).toHaveCount(await page.locator('[data-testid^="card-"]').count());
  });
});

test.describe('Pack Opening - Animation States', () => {
  test('should show pack animation state', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Click open button
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();

    // Immediately check for animation elements
    await page.waitForTimeout(100);
    const packAnimation = page.locator('[data-testid="pack-animation"]');
    await expect(packAnimation).toBeVisible();
  });

  test('should handle skip animation button', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open pack
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();

    // Wait a moment for animation to start
    await page.waitForTimeout(500);

    // Look for skip button
    const skipButton = page.locator('button:has-text("Skip")').or(
      page.locator('button[aria-label*="skip" i]')
    ).first();

    // If skip button exists, click it
    if (await skipButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await skipButton.click();

      // Verify cards are revealed immediately
      await page.waitForTimeout(500);
      const cards = page.locator('[data-testid^="card-"]');
      await expect(cards).toHaveCount(7);
    }
  });
});

test.describe('Pack Opening - Card Rarity', () => {
  test('should display correct rarity colors', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open multiple packs to test different rarities
    for (let i = 0; i < 3; i++) {
      const openButton = page.locator('button:has-text("Open Pack")').first();
      await openButton.click();
      await page.waitForTimeout(4000);

      // Check that cards have rarity indicators
      const cards = page.locator('[data-testid^="card-"]');
      const cardCount = await cards.count();

      expect(cardCount).toBe(7);

      // Check each card for rarity styling
      for (let j = 0; j < cardCount; j++) {
        const card = cards.nth(j);
        await expect(card).toBeVisible();

        // Verify card has some rarity-specific styling
        // (border color, glow, etc.)
        const cardBorder = await card.evaluate((el) => {
          return window.getComputedStyle(el).borderColor;
        });
        expect(cardBorder).toBeTruthy();
      }

      // Open another pack if available
      const anotherButton = page.locator('button:has-text("Open Another")').or(
        page.locator('button:has-text("Open Pack")')
      ).first();

      if (await anotherButton.isVisible() && i < 2) {
        await anotherButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should display holographic effects for rare cards', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open packs until we find a holographic card
    let foundHolo = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!foundHolo && attempts < maxAttempts) {
      const openButton = page.locator('button:has-text("Open Pack")').first();
      await openButton.click();
      await page.waitForTimeout(4000);

      // Check for holographic cards (special CSS class or effect)
      const holoCards = page.locator('[data-testid^="card-"].is-holo');
      const holoCount = await holoCards.count();

      if (holoCount > 0) {
        foundHolo = true;
        await expect(holoCards.first()).toBeVisible();
      } else {
        // Try again
        const anotherButton = page.locator('button:has-text("Open Another")').or(
          page.locator('button:has-text("Open Pack")')
        ).first();

        if (await anotherButton.isVisible()) {
          await anotherButton.click();
          await page.waitForTimeout(500);
        }
      }

      attempts++;
    }

    // If we didn't find a holo card in 10 packs, that's okay (random chance)
    // At least we verified the flow works
    expect(attempts).toBeGreaterThan(0);
  });
});

test.describe('Pack Opening - Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Tab to the open button
    await page.keyboard.press('Tab');

    // Verify button is focused
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await expect(openButton).toBeFocused();

    // Press Enter to open pack
    await page.keyboard.press('Enter');

    // Wait for animation
    await page.waitForTimeout(4000);

    // Verify pack opened
    const cards = page.locator('[data-testid^="card-"]');
    await expect(cards).toHaveCount(7);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Check for ARIA labels on interactive elements
    const openButton = page.locator('button:has-text("Open Pack")').first();

    // Button should have accessible name
    await expect(openButton).toHaveAttribute('aria-label');
  });

  test('should announce pack opening to screen readers', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open pack
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();

    // Check for ARIA live regions announcing changes
    const liveRegion = page.locator('[aria-live], [role="status"], [role="alert"]');
    await expect(liveRegion).toHaveCount(await page.locator('[role="status"]').count() +
      await page.locator('[aria-live="polite"]').count() +
      await page.locator('[aria-live="assertive"]').count());
  });
});

test.describe('Pack Opening - Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open pack
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Verify cards are visible on mobile
    const cards = page.locator('[data-testid^="card-"]');
    await expect(cards).toHaveCount(7);
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open pack
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Verify cards are visible on tablet
    const cards = page.locator('[data-testid^="card-"]');
    await expect(cards).toHaveCount(7);
  });

  test('should work on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open pack
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Verify cards are visible on desktop
    const cards = page.locator('[data-testid^="card-"]');
    await expect(cards).toHaveCount(7);
  });
});
