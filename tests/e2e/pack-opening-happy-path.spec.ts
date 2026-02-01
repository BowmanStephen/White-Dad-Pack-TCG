import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Pack Opening Happy Path E2E Tests
 * 
 * Tests the complete user journey:
 * 1. Landing page -> Click "Open Your First Pack"
 * 2. Pack page idle state -> Click "Open Pack"
 * 3. Pack animation plays
 * 4. Results screen shows pack summary
 * 5. Cards are saved to collection
 */

/**
 * Helper: Click the "Open Pack" button with proper hydration wait
 * Svelte components need time to hydrate before they're interactive.
 * Wait for button to be enabled AND wait additional time for event handlers.
 */
async function clickOpenPackButton(page: Page) {
  const openPackButton = page.locator('button.btn-primary').filter({ hasText: 'Open Pack' });
  await openPackButton.waitFor({ state: 'visible', timeout: 10000 });

  // Wait for Svelte hydration to complete - button needs event handlers attached
  // This extra wait ensures onMount() has fired and subscriptions are established
  await page.waitForTimeout(1000);

  await openPackButton.click();
}

/**
 * Helper: Open a pack and skip to results
 * Combines clicking Open Pack, waiting for animation, and skipping
 */
async function openPackAndSkipToResults(page: Page) {
  await clickOpenPackButton(page);
  await page.waitForTimeout(500); // Brief wait for animation to start
  await page.keyboard.press('Space'); // Skip animation
  await expect(page.locator('text=Collection Updated')).toBeVisible({ timeout: 10000 });
}

test.describe('Pack Opening Happy Path', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear IndexedDB before each test to start fresh
    await page.goto('/');
    await page.evaluate(() => {
      // Dismiss cookie consent to prevent dialog blocking interactions
      localStorage.setItem('daddeck-cookie-preferences', JSON.stringify({
        consent: 'accepted',
        categories: { necessary: true, analytics: false, marketing: false },
        timestamp: Date.now()
      }));

      return new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase('daddeck-collection');
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
        request.onblocked = () => resolve();
      });
    });
  });

  test('should navigate from landing page to pack page', async ({ page }) => {
    await page.goto('/');
    
    // Verify landing page loaded - use main content area to avoid audit panel h1s
    const mainHeading = page.locator('main h1, .hero h1, [class*="hero"] h1').first();
    await expect(mainHeading).toContainText('Collect Every Dad');
    
    // Find and click the "Open Your First Pack" button
    const openPackButton = page.locator('a[href="/pack"]').filter({ hasText: /Open.*Pack/i }).first();
    await expect(openPackButton).toBeVisible();
    await openPackButton.click();
    
    // Verify we're on the pack page
    await expect(page).toHaveURL('/pack');
  });

  test('should show idle state on pack page', async ({ page }) => {
    await page.goto('/pack');
    
    // Wait for the page to load and hydrate
    await page.waitForLoadState('networkidle');
    
    // Verify idle state elements - use getByRole for specificity
    await expect(page.getByRole('heading', { name: 'Open a Pack' })).toBeVisible();
    await expect(page.locator('text=One tear. One reveal.')).toBeVisible();
    
    // Verify "Open Pack" button is visible (wait for hydration)
    const openPackButton = page.locator('button.btn-primary').filter({ hasText: 'Open Pack' });
    await openPackButton.waitFor({ state: 'visible', timeout: 10000 });
    await expect(openPackButton).toBeEnabled();
  });

  test('should open pack and show results', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Click "Open Pack" button (wait for hydration)
    const openPackButton = page.locator('button.btn-primary').filter({ hasText: 'Open Pack' });
    await openPackButton.waitFor({ state: 'visible', timeout: 10000 });

    // Wait for Svelte hydration - onMount needs to fire before click handlers work
    await page.waitForTimeout(1000);

    await openPackButton.click();
    
    // Wait for pack animation to complete (or skip it)
    // The animation can be skipped by pressing Space/Enter or clicking
    await page.waitForTimeout(500); // Brief wait for animation to start
    
    // Skip the animation by pressing Space
    await page.keyboard.press('Space');
    
    // Wait for results to appear
    await expect(page.locator('text=Collection Updated')).toBeVisible({ timeout: 10000 });
    
    // Verify results screen elements
    // Should show either "Pack Complete!" or "[RARITY] PULL!"
    const header = page.locator('h2').first();
    await expect(header).toBeVisible();
    const headerText = await header.textContent();
    expect(headerText).toMatch(/Pack Complete|PULL/i);
  });

  test('should display pack quality grade', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open pack and skip to results
    await openPackAndSkipToResults(page);

    // Wait for grade button to be visible (may take time to render)
    // The button text is "Pack Grade: [label]" plus score info
    const gradeButton = page.locator('button[aria-expanded]').filter({ hasText: /Pack Grade/i });
    await gradeButton.waitFor({ state: 'visible', timeout: 10000 });

    // Click to expand details
    await gradeButton.click();

    // Verify expanded details show score breakdown
    await expect(page.locator('text=Base Score')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Holo Bonus')).toBeVisible({ timeout: 5000 });
  });

  test('should display best card highlight', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');
    
    // Open pack (wait for hydration)
    const openPackButton = page.locator('button.btn-primary').filter({ hasText: 'Open Pack' });
    await openPackButton.waitFor({ state: 'visible', timeout: 10000 });
    await openPackButton.click();
    await page.waitForTimeout(500);
    await page.keyboard.press('Space');
    
    // Wait for results
    await expect(page.locator('text=Collection Updated')).toBeVisible({ timeout: 10000 });
    
    // Verify best card section
    await expect(page.locator('text=Signature Best Pull')).toBeVisible();
    
    // Verify share buttons are present
    await expect(page.locator('button').filter({ hasText: /Share on X/i })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /Copy Link/i })).toBeVisible();
  });

  test('should display all cards in pack', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');
    
    // Open pack and skip to results
    await openPackAndSkipToResults(page);
    
    // Verify "Full Pack Contents" section
    await expect(page.locator('text=Full Pack Contents')).toBeVisible();
    
    // Verify card grid has 6 cards (standard pack size per generator.ts)
    const cardGrid = page.locator('[role="button"][aria-label^="Inspect"]');
    await expect(cardGrid).toHaveCount(6);
  });

  test('should display rarity distribution', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');
    
    // Open pack and skip to results
    await openPackAndSkipToResults(page);
    
    // Verify distribution section
    await expect(page.locator('text=Distribution')).toBeVisible();
    
    // Should show at least one rarity count (e.g., "3x Common")
    const rarityCount = page.locator('text=/\\d+x (Common|Uncommon|Rare|Epic|Legendary|Mythic)/i');
    await expect(rarityCount.first()).toBeVisible();
  });

  test('should allow opening another pack', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');
    
    // Open first pack and skip to results
    await openPackAndSkipToResults(page);
    
    // Click "Open Another Pack"
    const openAnotherButton = page.locator('button').filter({ hasText: /Open Another Pack/i });
    await expect(openAnotherButton).toBeVisible();
    await openAnotherButton.click();
    
    // Should return to idle state - wait for hydration again
    await expect(page.getByRole('heading', { name: 'Open a Pack' })).toBeVisible();
    const openPackButton = page.locator('button.btn-primary').filter({ hasText: 'Open Pack' });
    await openPackButton.waitFor({ state: 'visible', timeout: 10000 });
  });

  test('should allow going back to home', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open pack and skip to results
    await openPackAndSkipToResults(page);

    // Click "Back to Street" and wait for navigation
    const backButton = page.locator('button').filter({ hasText: /Back to Street/i });
    await backButton.waitFor({ state: 'visible', timeout: 10000 });

    // Click triggers window.location.href navigation
    await Promise.all([
      page.waitForURL('/'),
      backButton.click(),
    ]);

    // Verify we're on the home page
    await expect(page).toHaveURL('/');
  });

  test('should open card inspection modal', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open pack and skip to results
    await openPackAndSkipToResults(page);

    // Wait for the card grid to be visible
    const cardGrid = page.locator('[role="button"][aria-label^="Inspect"]');
    await expect(cardGrid.first()).toBeVisible({ timeout: 10000 });

    // Click on a card in the grid (use force to bypass toast overlay)
    const firstCard = cardGrid.first();
    await firstCard.click({ force: true });

    // Verify card detail modal opened
    const cardModal = page.locator('[role="dialog"][aria-label^="Card details"]');
    await expect(cardModal).toBeVisible({ timeout: 5000 });

    // Verify modal has card details - look for rarity badge or card name
    await expect(cardModal.locator('text=/Common|Uncommon|Rare|Epic|Legendary|Mythic/i').first()).toBeVisible();

    // Try to close modal to clean up (click outside or press Escape)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });

  test('should save cards to collection', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open pack and skip to results
    await openPackAndSkipToResults(page);

    // Navigate to collection page (use domcontentloaded, not networkidle)
    await page.goto('/collection');
    await page.waitForLoadState('domcontentloaded');

    // Wait for collection content to load
    const collectionContent = page.locator('main');
    await expect(collectionContent).toBeVisible({ timeout: 10000 });

    // Verify we have content (cards displayed or pack count)
    const hasCards = await page.locator('text=/\\d+ (cards?|unique)/i').first().isVisible({ timeout: 5000 }).catch(() => false);
    const hasPackCount = await page.locator('text=/\\d+ packs?/i').first().isVisible({ timeout: 5000 }).catch(() => false);

    expect(hasCards || hasPackCount).toBeTruthy();
  });

  test('complete happy path: landing -> pack -> results -> collection', async ({ page }) => {
    // Step 1: Start at landing page
    await page.goto('/');
    const mainHeading = page.locator('main h1, .hero h1, [class*="hero"] h1').first();
    await expect(mainHeading).toContainText('Collect Every Dad');
    
    // Step 2: Navigate to pack page
    const ctaButton = page.locator('a[href="/pack"]').filter({ hasText: /Open.*Pack/i }).first();
    await ctaButton.click();
    await expect(page).toHaveURL('/pack');
    
    // Step 3: Wait for Svelte component to hydrate and open a pack
    await page.waitForLoadState('networkidle');
    // Wait for the button to be interactive (hydrated)
    const openPackButton = page.locator('button.btn-primary').filter({ hasText: 'Open Pack' });
    await openPackButton.waitFor({ state: 'visible', timeout: 15000 });
    await openPackButton.click();
    
    // Step 4: Skip animation
    await page.waitForTimeout(500);
    await page.keyboard.press('Space');
    
    // Step 5: Verify results
    await expect(page.locator('text=Collection Updated')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Signature Best Pull')).toBeVisible();
    await expect(page.locator('text=Full Pack Contents')).toBeVisible();
    
    // Step 6: Verify 6 cards in pack (standard pack size per generator.ts)
    const cards = page.locator('[role="button"][aria-label^="Inspect"]');
    await cards.first().waitFor({ state: 'visible', timeout: 10000 });
    await expect(cards).toHaveCount(6);
    
    // Step 7: Navigate to collection (use domcontentloaded, not networkidle)
    await page.goto('/collection');
    await page.waitForLoadState('domcontentloaded');

    // Step 8: Verify collection page loaded
    await expect(page).toHaveURL('/collection');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Pack Opening Edge Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear IndexedDB before each test to start fresh
    await page.goto('/');
    await page.evaluate(() => {
      // Dismiss cookie consent to prevent dialog blocking interactions
      localStorage.setItem('daddeck-cookie-preferences', JSON.stringify({
        consent: 'accepted',
        categories: { necessary: true, analytics: false, marketing: false },
        timestamp: Date.now()
      }));

      return new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase('daddeck-collection');
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
        request.onblocked = () => resolve();
      });
    });
  });

  test('should handle rapid pack opening', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');

    // Open first pack and skip to results
    await openPackAndSkipToResults(page);

    // Click "Open Another Pack"
    const openAnotherButton = page.locator('button').filter({ hasText: /Open Another Pack/i });
    await openAnotherButton.click();

    // Wait for idle state to be restored
    await expect(page.getByRole('heading', { name: 'Open a Pack' })).toBeVisible({ timeout: 10000 });

    // Open second pack
    await openPackAndSkipToResults(page);

    // Should show results for second pack
    await expect(page.locator('text=Signature Best Pull')).toBeVisible({ timeout: 5000 });
  });

  test('should skip animation with click', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');
    
    await clickOpenPackButton(page);
    await page.waitForTimeout(500);
    
    // Click to skip instead of keyboard
    await page.click('body');
    
    // Should show results
    await expect(page.locator('text=Collection Updated')).toBeVisible({ timeout: 10000 });
  });

  test('should skip animation with Enter key', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');
    
    await clickOpenPackButton(page);
    await page.waitForTimeout(500);
    
    // Press Enter to skip
    await page.keyboard.press('Enter');
    
    // Should show results
    await expect(page.locator('text=Collection Updated')).toBeVisible({ timeout: 10000 });
  });

  test('should skip animation with Escape key', async ({ page }) => {
    await page.goto('/pack');
    await page.waitForLoadState('networkidle');
    
    await clickOpenPackButton(page);
    await page.waitForTimeout(500);
    
    // Press Escape to skip
    await page.keyboard.press('Escape');
    
    // Should show results
    await expect(page.locator('text=Collection Updated')).toBeVisible({ timeout: 10000 });
  });
});
