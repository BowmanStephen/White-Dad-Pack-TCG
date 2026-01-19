/**
 * E2E Test Helpers
 *
 * Common utilities and selectors for E2E tests
 */

/**
 * Wait for pack opening to complete
 * @param page Playwright page
 * @param timeout Maximum time to wait in ms (default: 6000)
 */
export async function waitForPackOpen(page: any, timeout = 6000) {
  await page.waitForTimeout(timeout);
}

/**
 * Open a pack and wait for it to complete
 * @param page Playwright page
 */
export async function openPack(page: any) {
  const openButton = page.locator('button:has-text("Open Pack")').or(
    page.locator('button:has-text("Open Another")')
  ).first();

  await openButton.click();
  await waitForPackOpen(page);
}

/**
 * Navigate to a page and wait for it to load
 * @param page Playwright page
 * @param path Path to navigate to
 */
export async function navigateTo(page: any, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

/**
 * Clear all local storage
 * @param page Playwright page
 */
export async function clearStorage(page: any) {
  await page.evaluate(() => localStorage.clear());
}

/**
 * Get card count in collection
 * @param page Playwright page
 * @returns Number of cards
 */
export async function getCardCount(page: any): Promise<number> {
  const cards = page.locator('[data-testid^="card-"], [data-testid^="collection-card-"]');
  return await cards.count();
}

/**
 * Get pack count from stats
 * @param page Playwright page
 * @returns Number of packs opened
 */
export async function getPackCount(page: any): Promise<number> {
  const packStats = page.locator('[data-testid="collection-stats"], [data-testid="pack-count"]');
  const text = await packStats.textContent() || '0';
  const match = text.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}
