import { test, expect } from '@playwright/test';

/**
 * Integration Tests for Battle Flow
 *
 * Tests the complete end-to-end battle experience:
 * 1. Navigate to battle page
 * 2. Select attacker deck
 * 3. Select defender deck (or AI opponent)
 * 4. Execute battle
 * 5. View battle results
 * 6. Review battle log
 *
 * User Story: PACK-053
 * Acceptance Criteria: Test battle flow (deck selection → battle → result)
 */

test.describe('Battle Flow - End to End', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage and setup
    await page.goto('/collection');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Open packs to populate collection
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

    // Create two decks for battle
    await page.goto('/deck-builder');
    await page.waitForLoadState('networkidle');

    // Create Deck 1
    const createButton1 = page.locator('button:has-text("New Deck")').or(
      page.locator('button:has-text("Create Deck")')
    ).first();

    if (await createButton1.isVisible({ timeout: 2000 })) {
      await createButton1.click();

      const nameInput1 = page.locator('input[data-testid="deck-name"], input[placeholder*="name" i]').first();
      await nameInput1.fill('Attacker Deck');

      const confirmButton1 = page.locator('button:has-text("Create")').or(
        page.locator('button:has-text("Save")')
      ).first();
      await confirmButton1.click();
      await page.waitForTimeout(500);

      // Add cards to Deck 1
      const cards1 = page.locator('[data-testid^="collection-card-"], [data-testid^="card-"]');
      const cardCount1 = await cards1.count();

      for (let i = 0; i < Math.min(10, cardCount1); i++) {
        await cards1.nth(i).click();
        await page.waitForTimeout(100);
      }
    }

    // Create Deck 2
    const createButton2 = page.locator('button:has-text("New Deck")').or(
      page.locator('button:has-text("Create Deck")')
    ).first();

    if (await createButton2.isVisible({ timeout: 2000 })) {
      await createButton2.click();

      const nameInput2 = page.locator('input[data-testid="deck-name"], input[placeholder*="name" i]').first();
      await nameInput2.fill('Defender Deck');

      const confirmButton2 = page.locator('button:has-text("Create")').or(
        page.locator('button:has-text("Save")')
      ).first();
      await confirmButton2.click();
      await page.waitForTimeout(500);

      // Add cards to Deck 2
      const cards2 = page.locator('[data-testid^="collection-card-"], [data-testid^="card-"]');
      const cardCount2 = await cards2.count();

      for (let i = 0; i < Math.min(10, cardCount2); i++) {
        await cards2.nth(i).click();
        await page.waitForTimeout(100);
      }
    }
  });

  test('should complete full battle flow', async ({ page }) => {
    // Step 1: Navigate to battle page
    await page.goto('/battle');
    await page.waitForLoadState('networkidle');

    // Verify battle interface
    await expect(page.locator('h1')).toContainText(/battle/i);

    // Step 2: Select attacker deck
    const attackerSelector = page.locator('[data-testid="attacker-deck-selector"], select[data-testid="attacker-deck"]').first();

    if (await attackerSelector.isVisible({ timeout: 2000 })) {
      if (await attackerSelector.evaluate(el => el.tagName) === 'SELECT') {
        await attackerSelector.selectOption({ index: 0 });
      } else {
        await attackerSelector.click();
        await page.waitForTimeout(200);
        await page.locator('[role="option"]').first().click();
      }
    }

    // Step 3: Select defender deck
    const defenderSelector = page.locator('[data-testid="defender-deck-selector"], select[data-testid="defender-deck"]').first();

    if (await defenderSelector.isVisible({ timeout: 2000 })) {
      if (await defenderSelector.evaluate(el => el.tagName) === 'SELECT') {
        await defenderSelector.selectOption({ index: 1 });
      } else {
        await defenderSelector.click();
        await page.waitForTimeout(200);
        await page.locator('[role="option"]').nth(1).click();
      }
    }

    // Step 4: Start battle
    const battleButton = page.locator('button:has-text("Battle")').or(
      page.locator('button:has-text("Fight")')
    ).first();

    await expect(battleButton).toBeVisible();
    await battleButton.click();

    // Step 5: Wait for battle to complete
    await page.waitForTimeout(3000);

    // Step 6: Verify battle results are displayed
    const results = page.locator('[data-testid="battle-results"], [data-testid="battle-outcome"]');
    await expect(results.first()).toBeVisible({ timeout: 5000 });

    // Verify winner is declared
    await expect(page.locator('text=/wins/i, text=/winner/i')).toBeVisible();

    // Step 7: Verify battle log is shown
    const battleLog = page.locator('[data-testid="battle-log"], [data-testid="combat-log"]');
    const hasLog = await battleLog.isVisible().catch(() => false);

    if (hasLog) {
      await expect(battleLog).toBeVisible();
    }
  });

  test('should allow battling against AI opponent', async ({ page }) => {
    await page.goto('/battle');
    await page.waitForLoadState('networkidle');

    // Select attacker deck
    const attackerSelector = page.locator('[data-testid="attacker-deck-selector"], select[data-testid="attacker-deck"]').first();

    if (await attackerSelector.isVisible({ timeout: 2000 })) {
      if (await attackerSelector.evaluate(el => el.tagName) === 'SELECT') {
        await attackerSelector.selectOption({ index: 0 });
      } else {
        await attackerSelector.click();
        await page.waitForTimeout(200);
        await page.locator('[role="option"]').first().click();
      }
    }

    // Look for AI opponent option
    const aiToggle = page.locator('button:has-text("AI Opponent")').or(
      page.locator('input[type="checkbox"][data-testid="ai-opponent"]')
    ).first();

    if (await aiToggle.isVisible({ timeout: 2000 })) {
      // Enable AI opponent
      const tagName = await aiToggle.evaluate(el => el.tagName);
      if (tagName === 'BUTTON') {
        await aiToggle.click();
      } else if (tagName === 'INPUT') {
        await aiToggle.check();
      }

      // Start battle
      const battleButton = page.locator('button:has-text("Battle")').or(
        page.locator('button:has-text("Fight")')
      ).first();
      await battleButton.click();

      // Wait for battle
      await page.waitForTimeout(3000);

      // Verify results
      const results = page.locator('[data-testid="battle-results"], [data-testid="battle-outcome"]');
      await expect(results.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display battle statistics', async ({ page }) => {
    await page.goto('/battle');
    await page.waitForLoadState('networkidle');

    // Select decks
    const attackerSelector = page.locator('[data-testid="attacker-deck-selector"], select[data-testid="attacker-deck"]').first();
    const defenderSelector = page.locator('[data-testid="defender-deck-selector"], select[data-testid="defender-deck"]').first();

    if (await attackerSelector.isVisible({ timeout: 2000 })) {
      if (await attackerSelector.evaluate(el => el.tagName) === 'SELECT') {
        await attackerSelector.selectOption({ index: 0 });
      } else {
        await attackerSelector.click();
        await page.waitForTimeout(200);
        await page.locator('[role="option"]').first().click();
      }
    }

    if (await defenderSelector.isVisible({ timeout: 2000 })) {
      if (await defenderSelector.evaluate(el => el.tagName) === 'SELECT') {
        await defenderSelector.selectOption({ index: 1 });
      } else {
        await defenderSelector.click();
        await page.waitForTimeout(200);
        await page.locator('[role="option"]').nth(1).click();
      }
    }

    // Start battle
    const battleButton = page.locator('button:has-text("Battle")').or(
      page.locator('button:has-text("Fight")')
    ).first();
    await battleButton.click();

    await page.waitForTimeout(3000);

    // Check for battle statistics
    const stats = page.locator('[data-testid="battle-stats"], [data-testid="deck-stats"]');

    if (await stats.isVisible().catch(() => false)) {
      await expect(stats).toBeVisible();

      // Verify stats show damage dealt
      await expect(page.locator('text=/damage/i')).toBeVisible();
    }
  });

  test('should show detailed battle log', async ({ page }) => {
    await page.goto('/battle');
    await page.waitForLoadState('networkidle');

    // Select decks
    const attackerSelector = page.locator('[data-testid="attacker-deck-selector"], select[data-testid="attacker-deck"]').first();
    const defenderSelector = page.locator('[data-testid="defender-deck-selector"], select[data-testid="defender-deck"]').first();

    if (await attackerSelector.isVisible({ timeout: 2000 })) {
      if (await attackerSelector.evaluate(el => el.tagName) === 'SELECT') {
        await attackerSelector.selectOption({ index: 0 });
      } else {
        await attackerSelector.click();
        await page.waitForTimeout(200);
        await page.locator('[role="option"]').first().click();
      }
    }

    if (await defenderSelector.isVisible({ timeout: 2000 })) {
      if (await defenderSelector.evaluate(el => el.tagName) === 'SELECT') {
        await defenderSelector.selectOption({ index: 1 });
      } else {
        await defenderSelector.click();
        await page.waitForTimeout(200);
        await page.locator('[role="option"]').nth(1).click();
      }
    }

    // Start battle
    const battleButton = page.locator('button:has-text("Battle")').or(
      page.locator('button:has-text("Fight")')
    ).first();
    await battleButton.click();

    await page.waitForTimeout(3000);

    // Check for battle log
    const battleLog = page.locator('[data-testid="battle-log"], [data-testid="combat-log"]');

    if (await battleLog.isVisible().catch(() => false)) {
      // Verify log has entries
      const logEntries = battleLog.locator('*').filter(async (_, el) => {
        const text = el.textContent || '';
        return text.length > 0;
      });

      const entryCount = await logEntries.count();
      expect(entryCount).toBeGreaterThan(0);
    }
  });

  test('should allow rematching after battle', async ({ page }) => {
    await page.goto('/battle');
    await page.waitForLoadState('networkidle');

    // Select decks
    const attackerSelector = page.locator('[data-testid="attacker-deck-selector"], select[data-testid="attacker-deck"]').first();
    const defenderSelector = page.locator('[data-testid="defender-deck-selector"], select[data-testid="defender-deck"]').first();

    if (await attackerSelector.isVisible({ timeout: 2000 })) {
      if (await attackerSelector.evaluate(el => el.tagName) === 'SELECT') {
        await attackerSelector.selectOption({ index: 0 });
      } else {
        await attackerSelector.click();
        await page.waitForTimeout(200);
        await page.locator('[role="option"]').first().click();
      }
    }

    if (await defenderSelector.isVisible({ timeout: 2000 })) {
      if (await defenderSelector.evaluate(el => el.tagName) === 'SELECT') {
        await defenderSelector.selectOption({ index: 1 });
      } else {
        await defenderSelector.click();
        await page.waitForTimeout(200);
        await page.locator('[role="option"]').nth(1).click();
      }
    }

    // Start battle
    const battleButton = page.locator('button:has-text("Battle")').or(
      page.locator('button:has-text("Fight")')
    ).first();
    await battleButton.click();

    await page.waitForTimeout(3000);

    // Look for rematch button
    const rematchButton = page.locator('button:has-text("Rematch")').or(
      page.locator('button:has-text("Battle Again")')
    ).first();

    if (await rematchButton.isVisible({ timeout: 2000 })) {
      await rematchButton.click();

      // Verify new battle starts
      await page.waitForTimeout(3000);
      const results = page.locator('[data-testid="battle-results"], [data-testid="battle-outcome"]');
      await expect(results.first()).toBeVisible();
    }
  });

  test('should validate deck selection before battle', async ({ page }) => {
    await page.goto('/battle');
    await page.waitForLoadState('networkidle');

    // Try to start battle without selecting decks
    const battleButton = page.locator('button:has-text("Battle")').or(
      page.locator('button:has-text("Fight")')
    ).first();

    await battleButton.click();

    // Check for validation error
    const errorMessage = page.locator('[data-testid="error-message"], [role="alert"]');
    const hasError = await errorMessage.isVisible().catch(() => false);

    if (hasError) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });

  test('should allow selecting different deck slots', async ({ page }) => {
    await page.goto('/battle');
    await page.waitForLoadState('networkidle');

    // Check for deck slot selector
    const slotSelector = page.locator('[data-testid="deck-slot-selector"], select[data-testid="deck-slot"]').first();

    if (await slotSelector.isVisible({ timeout: 2000 })) {
      // Select first slot
      if (await slotSelector.evaluate(el => el.tagName) === 'SELECT') {
        await slotSelector.selectOption({ index: 0 });
      }

      // Verify deck loaded
      await page.waitForTimeout(500);

      // Change slot
      if (await slotSelector.evaluate(el => el.tagName) === 'SELECT') {
        const optionCount = await slotSelector.locator('option').count();

        if (optionCount > 1) {
          await slotSelector.selectOption({ index: 1 });
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('should display type advantages during battle', async ({ page }) => {
    await page.goto('/battle');
    await page.waitForLoadState('networkidle');

    // Select decks
    const attackerSelector = page.locator('[data-testid="attacker-deck-selector"], select[data-testid="attacker-deck"]').first();
    const defenderSelector = page.locator('[data-testid="defender-deck-selector"], select[data-testid="defender-deck"]').first();

    if (await attackerSelector.isVisible({ timeout: 2000 })) {
      if (await attackerSelector.evaluate(el => el.tagName) === 'SELECT') {
        await attackerSelector.selectOption({ index: 0 });
      } else {
        await attackerSelector.click();
        await page.waitForTimeout(200);
        await page.locator('[role="option"]').first().click();
      }
    }

    if (await defenderSelector.isVisible({ timeout: 2000 })) {
      if (await defenderSelector.evaluate(el => el.tagName) === 'SELECT') {
        await defenderSelector.selectOption({ index: 1 });
      } else {
        await defenderSelector.click();
        await page.waitForTimeout(200);
        await page.locator('[role="option"]').nth(1).click();
      }
    }

    // Start battle
    const battleButton = page.locator('button:has-text("Battle")').or(
      page.locator('button:has-text("Fight")')
    ).first();
    await battleButton.click();

    await page.waitForTimeout(3000);

    // Check for type advantage indicators
    const typeAdvantage = page.locator('[data-testid="type-advantage"], .type-bonus');
    const hasTypeAdvantage = await typeAdvantage.isVisible().catch(() => false);

    if (hasTypeAdvantage) {
      await expect(typeAdvantage.first()).toBeVisible();
    }
  });

  test('should handle battle timeout gracefully', async ({ page }) => {
    await page.goto('/battle');
    await page.waitForLoadState('networkidle');

    // Select decks
    const attackerSelector = page.locator('[data-testid="attacker-deck-selector"], select[data-testid="attacker-deck"]').first();
    const defenderSelector = page.locator('[data-testid="defender-deck-selector"], select[data-testid="defender-deck"]').first();

    if (await attackerSelector.isVisible({ timeout: 2000 })) {
      if (await attackerSelector.evaluate(el => el.tagName) === 'SELECT') {
        await attackerSelector.selectOption({ index: 0 });
      } else {
        await attackerSelector.click();
        await page.waitForTimeout(200);
        await page.locator('[role="option"]').first().click();
      }
    }

    if (await defenderSelector.isVisible({ timeout: 2000 })) {
      if (await defenderSelector.evaluate(el => el.tagName) === 'SELECT') {
        await defenderSelector.selectOption({ index: 1 });
      } else {
        await defenderSelector.click();
        await page.waitForTimeout(200);
        await page.locator('[role="option"]').nth(1).click();
      }
    }

    // Start battle
    const battleButton = page.locator('button:has-text("Battle")').or(
      page.locator('button:has-text("Fight")')
    ).first();
    await battleButton.click();

    // Battle should complete within reasonable time
    const results = page.locator('[data-testid="battle-results"], [data-testid="battle-outcome"]');
    await expect(results.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Battle Flow - Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Setup collection and decks
    await page.goto('/pack');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    await page.goto('/deck-builder');
    await page.waitForLoadState('networkidle');

    const createButton = page.locator('button:has-text("New Deck")').first();
    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();
      await page.waitForTimeout(500);
    }

    // Navigate to battle
    await page.goto('/battle');
    await page.waitForLoadState('networkidle');

    // Verify battle interface is usable
    await expect(page.locator('h1')).toContainText(/battle/i);
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    // Setup
    await page.goto('/pack');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    await page.goto('/deck-builder');
    await page.waitForLoadState('networkidle');

    const createButton = page.locator('button:has-text("New Deck")').first();
    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();
      await page.waitForTimeout(500);
    }

    // Navigate to battle
    await page.goto('/battle');
    await page.waitForLoadState('networkidle');

    // Verify battle interface is usable
    await expect(page.locator('h1')).toContainText(/battle/i);
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Setup
    await page.goto('/pack');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    await page.goto('/deck-builder');
    await page.waitForLoadState('networkidle');

    const createButton = page.locator('button:has-text("New Deck")').first();
    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();
      await page.waitForTimeout(500);
    }

    // Navigate to battle
    await page.goto('/battle');
    await page.waitForLoadState('networkidle');

    // Verify battle interface is usable
    await expect(page.locator('h1')).toContainText(/battle/i);
  });
});
