import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * FIXES VERIFICATION E2E TESTS
 *
 * This test suite verifies that recent fixes work correctly:
 * 1. Settings Dropdown Menus - Verify dropdowns can be clicked and opened
 * 2. Age Gate Modal - Verify modal appears on first visit with correct elements
 *
 * Storage Keys Used:
 * - dadddeck_age_verified: Age gate verification status
 * - dadddeck_age_verification_date: Timestamp of age verification
 */

/**
 * Helper: Clear all localStorage to simulate first visit
 * This ensures the age gate modal will appear
 */
async function clearAllStorage(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    // Also clear IndexedDB for complete reset
    return new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('daddeck-collection');
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    });
  });
}

/**
 * Helper: Wait for Svelte component hydration
 * Svelte islands need time to become interactive
 */
async function waitForHydration(page: Page, timeout = 5000) {
  // Wait for the page to be loaded and Svelte components hydrated
  await page.waitForLoadState('networkidle');
  // Additional wait for Svelte hydration
  await page.waitForTimeout(500);
}

test.describe('Settings Dropdown Menus Fix Verification', () => {
  // Navigate to settings before each test
  test.beforeEach(async ({ page }) => {
    // Clear age verification so we can control the test flow
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('dadddeck_age_verified', 'true');
    });

    await page.goto('/settings');
    await waitForHydration(page);

    // Verify age gate is not showing (we already verified)
    const ageGateModal = page.locator('.age-gate-overlay');
    const isVisible = await ageGateModal.isVisible().catch(() => false);
    if (isVisible) {
      // Dismiss age gate if it appeared
      await page.locator('.age-gate-button.confirm').click();
      await page.waitForTimeout(500);
    }
  });

  test('should navigate to settings page successfully', async ({ page }) => {
    // Verify we're on the settings page
    await expect(page).toHaveURL(/\/settings/);

    // Take screenshot of initial settings page
    await page.screenshot({
      path: 'playwright-report/settings-page-initial.png',
      fullPage: true
    });

    // Verify page title is visible
    const heading = page.getByRole('heading', { name: 'Settings' });
    await expect(heading).toBeVisible();
  });

  test('should open Sound Theme dropdown and show options', async ({ page }) => {
    // Locate the Sound Theme select
    const soundThemeSelect = page.locator('#sound-theme');

    // Verify the select is visible
    await expect(soundThemeSelect).toBeVisible();

    // Screenshot before clicking
    await page.screenshot({
      path: 'playwright-report/sound-theme-dropdown-before.png',
      fullPage: true
    });

    // Click to open dropdown
    await soundThemeSelect.click();

    // Wait a moment for the dropdown to render
    await page.waitForTimeout(300);

    // Screenshot after clicking
    await page.screenshot({
      path: 'playwright-report/sound-theme-dropdown-open.png',
      fullPage: true
    });

    // Verify all expected options are present
    await expect(soundThemeSelect.locator('option')).toHaveCount(3);

    // Verify option values
    await expect(soundThemeSelect.locator('option[value="default"]')).toHaveText('Default');
    await expect(soundThemeSelect.locator('option[value="japanese"]')).toHaveText('Japanese');
    await expect(soundThemeSelect.locator('option[value="retro"]')).toHaveText('Retro');
  });

  test('should open Motion Mode dropdown and show options', async ({ page }) => {
    const motionModeSelect = page.locator('#motion-mode');

    await expect(motionModeSelect).toBeVisible();

    await page.screenshot({
      path: 'playwright-report/motion-mode-dropdown-before.png',
      fullPage: true
    });

    await motionModeSelect.click();
    await page.waitForTimeout(300);

    await page.screenshot({
      path: 'playwright-report/motion-mode-dropdown-open.png',
      fullPage: true
    });

    // Should have 3 options: Auto, Reduced, Full
    await expect(motionModeSelect.locator('option')).toHaveCount(3);
    await expect(motionModeSelect.locator('option[value="auto"]')).toHaveText('Auto');
    await expect(motionModeSelect.locator('option[value="reduced"]')).toHaveText('Reduced');
    await expect(motionModeSelect.locator('option[value="full"]')).toHaveText('Full');
  });

  test('should open Animation Quality dropdown and show options', async ({ page }) => {
    const animationQualitySelect = page.locator('#animation-quality');

    await expect(animationQualitySelect).toBeVisible();

    await page.screenshot({
      path: 'playwright-report/animation-quality-dropdown-before.png',
      fullPage: true
    });

    await animationQualitySelect.click();
    await page.waitForTimeout(300);

    await page.screenshot({
      path: 'playwright-report/animation-quality-dropdown-open.png',
      fullPage: true
    });

    // Should have 4 options: Auto, High, Medium, Low
    await expect(animationQualitySelect.locator('option')).toHaveCount(4);
    await expect(animationQualitySelect.locator('option[value="auto"]')).toHaveText('Auto');
    await expect(animationQualitySelect.locator('option[value="high"]')).toHaveText('High');
    await expect(animationQualitySelect.locator('option[value="medium"]')).toHaveText('Medium');
    await expect(animationQualitySelect.locator('option[value="low"]')).toHaveText('Low');
  });

  test('should open Particle Quality Preset dropdown and show options', async ({ page }) => {
    const particlePresetSelect = page.locator('#particle-preset');

    await expect(particlePresetSelect).toBeVisible();

    await page.screenshot({
      path: 'playwright-report/particle-preset-dropdown-before.png',
      fullPage: true
    });

    await particlePresetSelect.click();
    await page.waitForTimeout(300);

    await page.screenshot({
      path: 'playwright-report/particle-preset-dropdown-open.png',
      fullPage: true
    });

    // Should have 4 options: Low, Medium, High, Ultra
    await expect(particlePresetSelect.locator('option')).toHaveCount(4);
    await expect(particlePresetSelect.locator('option[value="low"]')).toHaveText('Low');
    await expect(particlePresetSelect.locator('option[value="medium"]')).toHaveText('Medium');
    await expect(particlePresetSelect.locator('option[value="high"]')).toHaveText('High');
    await expect(particlePresetSelect.locator('option[value="ultra"]')).toHaveText('Ultra');
  });

  test('should open Pack Opening Mode dropdown and show options', async ({ page }) => {
    const cinematicModeSelect = page.locator('#cinematic-mode');

    await expect(cinematicModeSelect).toBeVisible();

    await page.screenshot({
      path: 'playwright-report/cinematic-mode-dropdown-before.png',
      fullPage: true
    });

    await cinematicModeSelect.click();
    await page.waitForTimeout(300);

    await page.screenshot({
      path: 'playwright-report/cinematic-mode-dropdown-open.png',
      fullPage: true
    });

    // Should have 2 options: Normal, Cinematic
    await expect(cinematicModeSelect.locator('option')).toHaveCount(2);
    await expect(cinematicModeSelect.locator('option[value="normal"]')).toHaveText('Normal');
    await expect(cinematicModeSelect.locator('option[value="cinematic"]')).toHaveText('Cinematic');
  });

  test('should open Theme Mode dropdown and show options', async ({ page }) => {
    const themeModeSelect = page.locator('#theme-mode');

    await expect(themeModeSelect).toBeVisible();

    await page.screenshot({
      path: 'playwright-report/theme-mode-dropdown-before.png',
      fullPage: true
    });

    await themeModeSelect.click();
    await page.waitForTimeout(300);

    await page.screenshot({
      path: 'playwright-report/theme-mode-dropdown-open.png',
      fullPage: true
    });

    // Should have 3 options: Auto, Light, Dark
    await expect(themeModeSelect.locator('option')).toHaveCount(3);
    await expect(themeModeSelect.locator('option[value="auto"]')).toHaveText('Auto');
    await expect(themeModeSelect.locator('option[value="light"]')).toHaveText('Light');
    await expect(themeModeSelect.locator('option[value="dark"]')).toHaveText('Dark');
  });

  test('should be able to change dropdown values', async ({ page }) => {
    // Test changing Sound Theme value
    const soundThemeSelect = page.locator('#sound-theme');
    await soundThemeSelect.selectOption('japanese');

    // Verify value changed
    await expect(soundThemeSelect).toHaveValue('japanese');

    // Test changing Motion Mode value
    const motionModeSelect = page.locator('#motion-mode');
    await motionModeSelect.selectOption('reduced');

    // Verify value changed
    await expect(motionModeSelect).toHaveValue('reduced');

    // Screenshot after changes
    await page.screenshot({
      path: 'playwright-report/settings-dropdowns-changed.png',
      fullPage: true
    });
  });

  test('should verify all dropdowns are interactive using keyboard', async ({ page }) => {
    // Test keyboard navigation for all dropdowns
    const dropdowns = [
      '#sound-theme',
      '#motion-mode',
      '#animation-quality',
      '#particle-preset',
      '#cinematic-mode',
      '#theme-mode'
    ];

    for (const dropdownId of dropdowns) {
      const dropdown = page.locator(dropdownId);
      await expect(dropdown).toBeVisible();

      // Focus the dropdown
      await dropdown.focus();
      await expect(dropdown).toBeFocused();

      // Press Space to open (works on some browsers)
      await page.keyboard.press('Space');
      await page.waitForTimeout(200);

      // Press Escape to close
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }

    console.log('All dropdowns are keyboard accessible');
  });
});

test.describe('Age Gate Modal Fix Verification', () => {
  test('should show age gate modal on first visit', async ({ page }) => {
    // Clear all storage to simulate first-time visit
    await clearAllStorage(page);

    // Reload the page to trigger age gate check
    await page.reload();
    await waitForHydration(page);

    // Wait for the modal to appear (has a 500ms delay in the component)
    await page.waitForTimeout(700);

    // Screenshot of age gate modal
    await page.screenshot({
      path: 'playwright-report/age-gate-modal-initial.png',
      fullPage: true
    });

    // Verify the modal is visible using the specific age-gate-overlay class
    const modal = page.locator('.age-gate-overlay');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Also verify by checking for the unique title element
    await expect(page.locator('#age-gate-title')).toBeVisible();
  });

  test('should verify age gate modal has all required elements', async ({ page }) => {
    await clearAllStorage(page);
    await page.reload();
    await waitForHydration(page);
    await page.waitForTimeout(700);

    // Verify title is present
    const title = page.locator('#age-gate-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText('Age Verification Required');

    // Verify description is present
    const description = page.locator('#age-gate-description');
    await expect(description).toBeVisible();
    await expect(description).toContainText('adult humor');
    await expect(description).toContainText('mature themes');

    // Verify the icon (emoji)
    await expect(page.locator('.age-gate-icon')).toContainText('');

    // Verify info items
    const infoItems = page.locator('.info-item');
    await expect(infoItems).toHaveCount(3);

    // Verify the confirm button exists and has correct text
    const confirmButton = page.locator('button.age-gate-button.confirm');
    await expect(confirmButton).toBeVisible();
    await expect(confirmButton).toContainText('18 or older');

    // Verify the decline button exists and has correct text
    const declineButton = page.locator('button.age-gate-button.decline');
    await expect(declineButton).toBeVisible();
    await expect(declineButton).toContainText('under 18');

    // Verify disclaimer text
    await expect(page.locator('.age-gate-disclaimer')).toContainText('confirm that you are 18');

    // Screenshot showing all elements
    await page.screenshot({
      path: 'playwright-report/age-gate-all-elements.png',
      fullPage: true
    });
  });

  test('should dismiss age gate when clicking "I am 18 or older"', async ({ page }) => {
    await clearAllStorage(page);
    await page.reload();
    await waitForHydration(page);
    await page.waitForTimeout(700);

    // Verify modal is initially visible using specific selector
    const modal = page.locator('.age-gate-overlay');
    await expect(modal).toBeVisible();

    // Screenshot before clicking
    await page.screenshot({
      path: 'playwright-report/age-gate-before-confirm.png',
      fullPage: true
    });

    // Click the confirm button
    const confirmButton = page.locator('button.age-gate-button.confirm');
    await confirmButton.click();

    // Wait for modal to disappear
    await page.waitForTimeout(300);

    // Screenshot after clicking
    await page.screenshot({
      path: 'playwright-report/age-gate-after-confirm.png',
      fullPage: true
    });

    // Verify modal is no longer visible
    await expect(modal).not.toBeVisible();

    // Verify localStorage was set
    const ageVerified = await page.evaluate(() => {
      return localStorage.getItem('dadddeck_age_verified');
    });
    expect(ageVerified).toBe('true');

    // Verify timestamp was set
    const timestamp = await page.evaluate(() => {
      return localStorage.getItem('dadddeck_age_verification_date');
    });
    expect(timestamp).toBeTruthy();

    console.log('Age verification stored in localStorage:', timestamp);
  });

  test('should show under 18 message when declining age gate', async ({ page }) => {
    await clearAllStorage(page);
    await page.reload();
    await waitForHydration(page);
    await page.waitForTimeout(700);

    // Verify initial modal is visible
    const modal = page.locator('.age-gate-overlay');
    await expect(modal).toBeVisible();

    // Screenshot before clicking decline
    await page.screenshot({
      path: 'playwright-report/age-gate-before-decline.png',
      fullPage: true
    });

    // Click the decline button
    const declineButton = page.locator('button.age-gate-button.decline');
    await declineButton.click();

    // Wait for content to change
    await page.waitForTimeout(300);

    // Screenshot after clicking decline
    await page.screenshot({
      path: 'playwright-report/age-gate-after-decline.png',
      fullPage: true
    });

    // Verify the "Sorry, Young Padawan" message appears
    await expect(page.locator('.age-gate-title')).toContainText('Sorry, Young Padawan');

    // Verify the "Go Back" button appears
    const backButton = page.locator('button.age-gate-button.back');
    await expect(backButton).toBeVisible();
    await expect(backButton).toContainText('Go Back');

    // Verify the info text about coming back later
    await expect(page.locator('.age-gate-alternative')).toContainText('Come back when you\'re older');
  });

  test('should not show age gate on subsequent visits after verification', async ({ page }) => {
    // First visit - verify age gate appears
    await clearAllStorage(page);
    await page.reload();
    await waitForHydration(page);
    await page.waitForTimeout(700);

    const modal = page.locator('.age-gate-overlay');
    await expect(modal).toBeVisible();

    // Confirm age
    const confirmButton = page.locator('button.age-gate-button.confirm');
    await confirmButton.click();
    await page.waitForTimeout(300);

    // Verify modal is gone
    await expect(modal).not.toBeVisible();

    // Screenshot of page without modal
    await page.screenshot({
      path: 'playwright-report/after-age-verification.png',
      fullPage: true
    });

    // Reload the page (simulating return visit)
    await page.reload();
    await waitForHydration(page);

    // Wait past the 500ms delay
    await page.waitForTimeout(700);

    // Screenshot of reload
    await page.screenshot({
      path: 'playwright-report/return-visit-no-modal.png',
      fullPage: true
    });

    // Verify modal does NOT appear on second visit
    await expect(modal).not.toBeVisible();

    console.log('Age gate correctly skipped on return visit');
  });

  test('should persist age verification across different pages', async ({ page }) => {
    // Start at home page, verify age gate, then navigate
    await clearAllStorage(page);
    await page.goto('/');
    await waitForHydration(page);
    await page.waitForTimeout(700);

    // Verify and dismiss age gate
    const modal = page.locator('.age-gate-overlay');
    await expect(modal).toBeVisible();

    const confirmButton = page.locator('button.age-gate-button.confirm');
    await confirmButton.click();
    await page.waitForTimeout(500);

    // Navigate to pack page
    await page.goto('/pack');
    await waitForHydration(page);

    // Age gate should not appear again
    await expect(modal).not.toBeVisible();

    // Navigate to settings page
    await page.goto('/settings');
    await waitForHydration(page);

    // Age gate should not appear
    await expect(modal).not.toBeVisible();

    console.log('Age verification persists across page navigation');
  });
});

test.describe('Combined Fix Verification', () => {
  test('should verify both fixes work together', async ({ page }) => {
    // Start fresh
    await clearAllStorage(page);
    await page.goto('/');
    await waitForHydration(page);
    await page.waitForTimeout(700);

    // Verify age gate appears
    const modal = page.locator('.age-gate-overlay');
    await expect(modal).toBeVisible();

    // Dismiss age gate
    const confirmButton = page.locator('button.age-gate-button.confirm');
    await confirmButton.click();
    await page.waitForTimeout(500);

    // Navigate to settings
    await page.goto('/settings');
    await waitForHydration(page);

    // Verify settings page loaded
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    // Verify at least one dropdown works
    const soundThemeSelect = page.locator('#sound-theme');
    await expect(soundThemeSelect).toBeVisible();
    await soundThemeSelect.click();
    await page.waitForTimeout(300);

    // Verify options are visible
    await expect(soundThemeSelect.locator('option')).toHaveCount(3);

    // Final screenshot showing both fixes work
    await page.screenshot({
      path: 'playwright-report/combined-fixes-verification.png',
      fullPage: true
    });

    console.log('Both age gate and settings dropdowns are working correctly!');
  });
});
