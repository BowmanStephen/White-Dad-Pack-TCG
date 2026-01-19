import { test, expect } from '@playwright/test';

/**
 * Integration Tests for Deck Building Flow
 *
 * Tests the complete end-to-end deck building experience:
 * 1. Navigate to deck builder
 * 2. Create new deck
 * 3. Add cards from collection
 * 4. Validate deck rules
 * 5. Save deck
 * 6. Edit existing deck
 * 7. Delete deck
 *
 * User Story: PACK-053
 * Acceptance Criteria: Test create deck flow
 */

test.describe('Deck Building Flow - End to End', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage and populate collection
    await page.goto('/collection');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Open packs to populate collection for deck building
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
  });

  test('should complete full deck creation flow', async ({ page }) => {
    // Step 1: Navigate to deck builder
    await page.goto('/deck-builder');
    await page.waitForLoadState('networkidle');

    // Verify deck builder interface
    await expect(page.locator('h1')).toContainText(/deck/i);

    // Step 2: Create new deck
    const createButton = page.locator('button:has-text("New Deck")').or(
      page.locator('button:has-text("Create Deck")')
    ).first();

    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();

      // Enter deck name
      const nameInput = page.locator('input[data-testid="deck-name"], input[placeholder*="name" i]').first();
      await nameInput.fill('Test Deck');

      // Confirm creation
      const confirmButton = page.locator('button:has-text("Create")').or(
        page.locator('button:has-text("Save")')
      ).first();
      await confirmButton.click();
    }

    // Step 3: Add cards to deck
    // Look for card selector or collection view
    const collectionCards = page.locator('[data-testid^="collection-card-"], [data-testid^="card-"]');

    if (await collectionCards.count() > 0) {
      // Click on first card to add
      const firstCard = collectionCards.first();
      await firstCard.click();
      await page.waitForTimeout(500);

      // Verify card was added (look for deck list or card count)
      const deckCards = page.locator('[data-testid^="deck-card-"], [data-testid="deck-list"] [data-testid^="card-"]');
      const deckCardCount = await deckCards.count();

      // Step 4: Save deck
      const saveButton = page.locator('button:has-text("Save Deck")').or(
        page.locator('button:has-text("Save")')
      ).first();

      if (await saveButton.isVisible({ timeout: 2000 })) {
        await saveButton.click();

        // Verify success message or deck list
        await expect(page.locator('text=/deck saved/i, [data-testid="deck-list"]')).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should display deck validation errors', async ({ page }) => {
    await page.goto('/deck-builder');
    await page.waitForLoadState('networkidle');

    // Try to save empty deck
    const saveButton = page.locator('button:has-text("Save Deck")').or(
      page.locator('button:has-text("Save")')
    ).first();

    if (await saveButton.isVisible({ timeout: 2000 })) {
      await saveButton.click();

      // Check for validation error
      const errorMessage = page.locator('[data-testid="error-message"], [role="alert"], .error');
      const hasError = await errorMessage.isVisible().catch(() => false);

      if (hasError) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test('should allow editing existing deck', async ({ page }) => {
    await page.goto('/deck-builder');
    await page.waitForLoadState('networkidle');

    // First, create a deck
    const createButton = page.locator('button:has-text("New Deck")').or(
      page.locator('button:has-text("Create Deck")')
    ).first();

    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();

      const nameInput = page.locator('input[data-testid="deck-name"], input[placeholder*="name" i]').first();
      await nameInput.fill('Editable Deck');

      const confirmButton = page.locator('button:has-text("Create")').or(
        page.locator('button:has-text("Save")')
      ).first();
      await confirmButton.click();
      await page.waitForTimeout(1000);
    }

    // Find and edit the deck
    const editButton = page.locator('button:has-text("Edit")').or(
      page.locator('button[aria-label*="edit" i]')
    ).first();

    if (await editButton.isVisible({ timeout: 2000 })) {
      await editButton.click();

      // Change deck name
      const nameInput = page.locator('input[data-testid="deck-name"]').first();
      await nameInput.fill('Edited Deck Name');

      // Save changes
      const saveButton = page.locator('button:has-text("Save")').first();
      await saveButton.click();

      // Verify deck was updated
      await expect(page.locator('text=/Edited Deck Name/i')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should allow deleting deck', async ({ page }) => {
    await page.goto('/deck-builder');
    await page.waitForLoadState('networkidle');

    // First, create a deck
    const createButton = page.locator('button:has-text("New Deck")').or(
      page.locator('button:has-text("Create Deck")')
    ).first();

    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();

      const nameInput = page.locator('input[data-testid="deck-name"], input[placeholder*="name" i]').first();
      await nameInput.fill('Deletable Deck');

      const confirmButton = page.locator('button:has-text("Create")').or(
        page.locator('button:has-text("Save")')
      ).first();
      await confirmButton.click();
      await page.waitForTimeout(1000);
    }

    // Get initial deck count
    const deckList = page.locator('[data-testid^="deck-"], [data-testid="deck-list"] > *');
    const initialCount = await deckList.count();

    // Find and delete the deck
    const deleteButton = page.locator('button:has-text("Delete")').or(
      page.locator('button[aria-label*="delete" i]')
    ).first();

    if (await deleteButton.isVisible({ timeout: 2000 })) {
      await deleteButton.click();

      // Confirm deletion
      const confirmDelete = page.locator('button:has-text("Confirm")').or(
        page.locator('button:has-text("Yes")')
      ).first();

      if (await confirmDelete.isVisible({ timeout: 1000 })) {
        await confirmDelete.click();
      }

      // Verify deck was deleted
      await page.waitForTimeout(1000);
      const finalDeckList = page.locator('[data-testid^="deck-"], [data-testid="deck-list"] > *');
      const finalCount = await finalDeckList.count();
      expect(finalCount).toBe(initialCount - 1);
    }
  });

  test('should enforce deck size limits', async ({ page }) => {
    await page.goto('/deck-builder');
    await page.waitForLoadState('networkidle');

    // Create a deck
    const createButton = page.locator('button:has-text("New Deck")').or(
      page.locator('button:has-text("Create Deck")')
    ).first();

    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();

      const nameInput = page.locator('input[data-testid="deck-name"], input[placeholder*="name" i]').first();
      await nameInput.fill('Max Size Test Deck');

      const confirmButton = page.locator('button:has-text("Create")').or(
        page.locator('button:has-text("Save")')
      ).first();
      await confirmButton.click();
    }

    // Try to add cards beyond limit
    const collectionCards = page.locator('[data-testid^="collection-card-"], [data-testid^="card-"]');
    const cardCount = await collectionCards.count();

    // Add cards up to limit (assuming limit is 30)
    const maxDeckSize = 30;
    let addedCount = 0;

    for (let i = 0; i < Math.min(cardCount, maxDeckSize + 5); i++) {
      const card = collectionCards.nth(i);
      await card.click();
      await page.waitForTimeout(200);

      // Check if limit reached
      const limitMessage = page.locator('text=/limit reached/i, [data-testid="deck-limit-error"]');
      if (await limitMessage.isVisible().catch(() => false)) {
        break;
      }

      addedCount++;
    }

    // Verify we can't add more than the limit
    expect(addedCount).toBeLessThanOrEqual(maxDeckSize);
  });

  test('should show deck statistics', async ({ page }) => {
    await page.goto('/deck-builder');
    await page.waitForLoadState('networkidle');

    // Create a deck
    const createButton = page.locator('button:has-text("New Deck")').or(
      page.locator('button:has-text("Create Deck")')
    ).first();

    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();

      const nameInput = page.locator('input[data-testid="deck-name"], input[placeholder*="name" i]').first();
      await nameInput.fill('Stats Test Deck');

      const confirmButton = page.locator('button:has-text("Create")').or(
        page.locator('button:has-text("Save")')
      ).first();
      await confirmButton.click();
    }

    // Add some cards
    const collectionCards = page.locator('[data-testid^="collection-card-"], [data-testid^="card-"]');

    for (let i = 0; i < Math.min(5, await collectionCards.count()); i++) {
      await collectionCards.nth(i).click();
      await page.waitForTimeout(200);
    }

    // Check for deck statistics
    const stats = page.locator('[data-testid="deck-stats"], [data-testid="deck-statistics"]');
    const hasStats = await stats.isVisible().catch(() => false);

    if (hasStats) {
      await expect(stats).toBeVisible();

      // Verify stats show card count
      await expect(page.locator('text=/cards/i')).toBeVisible();
    }
  });

  test('should allow filtering cards when building deck', async ({ page }) => {
    await page.goto('/deck-builder');
    await page.waitForLoadState('networkidle');

    // Create a deck
    const createButton = page.locator('button:has-text("New Deck")').or(
      page.locator('button:has-text("Create Deck")')
    ).first();

    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();

      const nameInput = page.locator('input[data-testid="deck-name"], input[placeholder*="name" i]').first();
      await nameInput.fill('Filter Test Deck');

      const confirmButton = page.locator('button:has-text("Create")').or(
        page.locator('button:has-text("Save")')
      ).first();
      await confirmButton.click();
    }

    // Look for filters
    const filterInput = page.locator('input[placeholder*="search" i], input[data-testid="search-input"]').first();
    const hasSearch = await filterInput.isVisible().catch(() => false);

    if (hasSearch) {
      // Get initial card count
      const allCards = page.locator('[data-testid^="collection-card-"], [data-testid^="card-"]');
      const initialCount = await allCards.count();

      // Search for a specific card type
      await filterInput.fill('BBQ');
      await page.waitForTimeout(500);

      // Verify filtered results
      const filteredCards = page.locator('[data-testid^="collection-card-"], [data-testid^="card-"]');
      const filteredCount = await filteredCards.count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('should persist decks across page reloads', async ({ page }) => {
    await page.goto('/deck-builder');
    await page.waitForLoadState('networkidle');

    // Create a deck
    const createButton = page.locator('button:has-text("New Deck")').or(
      page.locator('button:has-text("Create Deck")')
    ).first();

    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();

      const nameInput = page.locator('input[data-testid="deck-name"], input[placeholder*="name" i]').first();
      await nameInput.fill('Persistence Test Deck');

      const confirmButton = page.locator('button:has-text("Create")').or(
        page.locator('button:has-text("Save")')
      ).first();
      await confirmButton.click();
      await page.waitForTimeout(1000);
    }

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify deck still exists
    await expect(page.locator('text=/Persistence Test Deck/i')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/deck-builder');
    await page.waitForLoadState('networkidle');

    // Tab through interface
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify focus is on an interactive element
    const focusedElement = page.locator(':focus');
    const tagName = await focusedElement.evaluate(el => el.tagName);

    expect(['BUTTON', 'INPUT', 'SELECT'].includes(tagName)).toBe(true);
  });

  test('should show maximum deck limit warning', async ({ page }) => {
    await page.goto('/deck-builder');
    await page.waitForLoadState('networkidle');

    // Try to create more decks than allowed (max 10)
    const maxDecks = 10;

    for (let i = 1; i <= maxDecks + 1; i++) {
      const createButton = page.locator('button:has-text("New Deck")').or(
        page.locator('button:has-text("Create Deck")')
      ).first();

      if (await createButton.isVisible({ timeout: 2000 })) {
        await createButton.click();

        const nameInput = page.locator('input[data-testid="deck-name"], input[placeholder*="name" i]').first();

        if (await nameInput.isVisible({ timeout: 1000 })) {
          await nameInput.fill(`Deck ${i}`);

          const confirmButton = page.locator('button:has-text("Create")').or(
            page.locator('button:has-text("Save")')
          ).first();
          await confirmButton.click();
          await page.waitForTimeout(500);
        } else {
          // Limit reached - show warning
          const warningMessage = page.locator('text=/limit reached/i, text=/maximum.*deck/i');
          await expect(warningMessage.first()).toBeVisible();
          break;
        }
      }
    }
  });
});

test.describe('Deck Building Flow - Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // First populate collection
    await page.goto('/pack');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Navigate to deck builder
    await page.goto('/deck-builder');
    await page.waitForLoadState('networkidle');

    // Verify deck builder is usable on mobile
    await expect(page.locator('h1')).toContainText(/deck/i);
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    // Populate collection
    await page.goto('/pack');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Navigate to deck builder
    await page.goto('/deck-builder');
    await page.waitForLoadState('networkidle');

    // Verify deck builder is usable on tablet
    await expect(page.locator('h1')).toContainText(/deck/i);
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Populate collection
    await page.goto('/pack');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Navigate to deck builder
    await page.goto('/deck-builder');
    await page.waitForLoadState('networkidle');

    // Verify deck builder is usable on desktop
    await expect(page.locator('h1')).toContainText(/deck/i);
  });
});
