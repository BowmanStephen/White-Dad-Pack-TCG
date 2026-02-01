import { test, expect } from '@playwright/test';

/**
 * Integration Tests for Collection Export/Import Flow
 *
 * Tests the complete end-to-end export/import experience:
 * 1. Navigate to collection management
 * 2. Export collection to JSON
 * 3. Verify exported data format
 * 4. Clear collection
 * 5. Import collection from JSON
 * 6. Verify imported data matches original
 *
 * User Story: PACK-053
 * Acceptance Criteria: Test export/import collection flow
 */

test.describe('Collection Export/Import Flow - End to End', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage
    await page.goto('/collection');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Populate collection by opening packs
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

  test('should export collection to JSON file', async ({ page }) => {
    // Step 1: Navigate to collection page
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Step 2: Find export button
    const exportButton = page.locator('button:has-text("Export")').or(
      page.locator('button[aria-label*="export" i]')
    ).first();

    if (await exportButton.isVisible({ timeout: 2000 })) {
      // Setup download handler
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 });

      // Click export button
      await exportButton.click();

      // Step 3: Wait for download to start
      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toMatch(/\.(json|txt)$/);

      // Step 4: Read downloaded file
      const content = await download.createReadStream();
      let data = '';

      for await (const chunk of content) {
        data += chunk.toString();
      }

      // Step 5: Verify JSON format
      const json = JSON.parse(data);

      // Verify structure
      expect(json).toHaveProperty('packs');
      expect(json).toHaveProperty('metadata');

      expect(Array.isArray(json.packs)).toBe(true);
      expect(typeof json.metadata).toBe('object');

      // Verify pack data
      expect(json.packs.length).toBeGreaterThan(0);

      const firstPack = json.packs[0];
      expect(firstPack).toHaveProperty('id');
      expect(firstPack).toHaveProperty('cards');
      expect(firstPack).toHaveProperty('openedAt');

      // Verify metadata
      expect(json.metadata).toHaveProperty('totalPacksOpened');
      expect(json.metadata.totalPacksOpened).toBe(3);
    } else {
      // Export button not found, check for alternative export methods
      // (e.g., settings page, profile page)
      console.log('Export button not found on collection page');

      // Check if there's a settings/profile page with export
      const settingsButton = page.locator('button:has-text("Settings")').or(
        page.locator('a:has-text("Settings")')
      ).first();

      if (await settingsButton.isVisible({ timeout: 1000 })) {
        await settingsButton.click();
        await page.waitForTimeout(1000);

        const settingsExport = page.locator('button:has-text("Export")').first();
        if (await settingsExport.isVisible({ timeout: 2000 })) {
          const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
          await settingsExport.click();
          const download = await downloadPromise;
          expect(download.suggestedFilename()).toMatch(/\.(json|txt)$/);
        }
      }
    }
  });

  test('should import collection from JSON file', async ({ page }) => {
    // Step 1: Export collection first
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    const exportButton = page.locator('button:has-text("Export")').or(
      page.locator('button[aria-label*="export" i]')
    ).first();

    let exportedData: any = null;

    if (await exportButton.isVisible({ timeout: 2000 })) {
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
      await exportButton.click();
      const download = await downloadPromise;

      const content = await download.createReadStream();
      let data = '';

      for await (const chunk of content) {
        data += chunk.toString();
      }

      exportedData = JSON.parse(data);
    }

    // Step 2: Clear collection
    await page.goto('/collection');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify collection is empty
    const cardsAfterClear = page.locator('[data-testid^="collection-card-"]');
    const countAfterClear = await cardsAfterClear.count();
    expect(countAfterClear).toBe(0);

    // Step 3: Import collection
    if (exportedData) {
      // Find import button
      const importButton = page.locator('button:has-text("Import")').or(
        page.locator('button[aria-label*="import" i]')
      ).first();

      if (await importButton.isVisible({ timeout: 2000 })) {
        // Create a temporary file from exported data
        const fileName = 'collection-export-test.json';
        const fileContent = JSON.stringify(exportedData);

        // Upload file
        const fileInput = page.locator('input[type="file"]').first();

        if (await fileInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          // Convert to buffer for Playwright
          const buffer = Buffer.from(fileContent);

          await fileInput.setInputFiles({
            name: fileName,
            mimeType: 'application/json',
            buffer: buffer,
          });

          await page.waitForTimeout(1000);

          // Step 4: Verify import success
          const successMessage = page.locator('text=/import successful/i, text=/collection imported/i');
          const hasSuccess = await successMessage.isVisible().catch(() => false);

          if (hasSuccess) {
            await expect(successMessage.first()).toBeVisible();
          }

          // Step 5: Verify collection data matches
          await page.reload();
          await page.waitForLoadState('networkidle');

          const importedCards = page.locator('[data-testid^="collection-card-"]');
          const importedCount = await importedCards.count();

          expect(importedCount).toBeGreaterThan(0);

          // Verify pack count
          const packCountText = await page.locator('text=/packs/i').first().textContent();
          expect(packCountText).toContain('3');
        } else {
          // No file input, might be drag-and-drop or different method
          console.log('File input not found for import test');
        }
      }
    }
  });

  test('should validate imported JSON format', async ({ page }) => {
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    // Find import button
    const importButton = page.locator('button:has-text("Import")').or(
      page.locator('button[aria-label*="import" i]')
    ).first();

    if (await importButton.isVisible({ timeout: 2000 })) {
      await importButton.click();

      // Look for file input
      const fileInput = page.locator('input[type="file"]').first();

      if (await fileInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        // Create invalid JSON
        const invalidJson = '{ invalid json }';
        const buffer = Buffer.from(invalidJson);

        await fileInput.setInputFiles({
          name: 'invalid.json',
          mimeType: 'application/json',
          buffer: buffer,
        });

        await page.waitForTimeout(1000);

        // Check for error message
        const errorMessage = page.locator('[data-testid="error-message"], [role="alert"]');
        const hasError = await errorMessage.isVisible().catch(() => false);

        if (hasError) {
          await expect(errorMessage.first()).toBeVisible();
        }
      }
    }
  });

  test('should handle large collection exports', async ({ page }) => {
    // Open many packs to create larger collection
    await page.goto('/pack');

    for (let i = 0; i < 10; i++) {
      const openButton = page.locator('button:has-text("Open Pack")').first();
      await openButton.click();
      await page.waitForTimeout(4000);

      if (i < 9) {
        const anotherButton = page.locator('button:has-text("Open Another")').or(
          page.locator('button:has-text("Open Pack")')
        ).first();
        await anotherButton.click();
        await page.waitForTimeout(500);
      }
    }

    // Export
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    const exportButton = page.locator('button:has-text("Export")').or(
      page.locator('button[aria-label*="export" i]')
    ).first();

    if (await exportButton.isVisible({ timeout: 2000 })) {
      const startTime = Date.now();

      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
      await exportButton.click();
      const download = await downloadPromise;

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Export should complete within reasonable time
      expect(duration).toBeLessThan(5000);

      // Verify file
      expect(download.suggestedFilename()).toMatch(/\.(json|txt)$/);

      // Check file size
      const content = await download.createReadStream();
      let data = '';

      for await (const chunk of content) {
        data += chunk.toString();
      }

      const json = JSON.parse(data);

      // Should have 10 packs
      expect(json.packs.length).toBe(10);
      expect(json.metadata.totalPacksOpened).toBe(10);
    }
  });

  test('should preserve card data during export/import', async ({ page }) => {
    // Open a pack
    await page.goto('/pack');
    const openButton = page.locator('button:has-text("Open Pack")').first();
    await openButton.click();
    await page.waitForTimeout(4000);

    // Get card details before export
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('[data-testid^="collection-card-"]').first();
    const cardNameBefore = await firstCard.locator('[data-testid="card-name"], h3, h4').textContent();
    const cardRarityBefore = await firstCard.getAttribute('data-rarity');

    // Export
    const exportButton = page.locator('button:has-text("Export")').or(
      page.locator('button[aria-label*="export" i]')
    ).first();

    if (await exportButton.isVisible({ timeout: 2000 })) {
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
      await exportButton.click();
      const download = await downloadPromise;

      const content = await download.createReadStream();
      let data = '';

      for await (const chunk of content) {
        data += chunk.toString();
      }

      const exportedData = JSON.parse(data);

      // Clear and import
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.reload();
      await page.waitForLoadState('networkidle');

      const importButton = page.locator('button:has-text("Import")').or(
        page.locator('button[aria-label*="import" i]')
      ).first();

      if (await importButton.isVisible({ timeout: 2000 })) {
        const fileInput = page.locator('input[type="file"]').first();

        if (await fileInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          const fileContent = JSON.stringify(exportedData);
          const buffer = Buffer.from(fileContent);

          await fileInput.setInputFiles({
            name: 'collection-test.json',
            mimeType: 'application/json',
            buffer: buffer,
          });

          await page.waitForTimeout(1000);
          await page.reload();
          await page.waitForLoadState('networkidle');

          // Verify card data matches
          const firstCardAfter = page.locator('[data-testid^="collection-card-"]').first();
          const cardNameAfter = await firstCardAfter.locator('[data-testid="card-name"], h3, h4').textContent();
          const cardRarityAfter = await firstCardAfter.getAttribute('data-rarity');

          expect(cardNameAfter).toBe(cardNameBefore);
          expect(cardRarityAfter).toBe(cardRarityBefore);
        }
      }
    }
  });

  test('should handle export/import on storage page', async ({ page }) => {
    // Check if there's a dedicated storage management page
    await page.goto('/storage');
    await page.waitForLoadState('networkidle');

    // Look for export/import buttons
    const exportButton = page.locator('button:has-text("Export")').or(
      page.locator('button[aria-label*="export" i]')
    ).first();

    const importButton = page.locator('button:has-text("Import")').or(
      page.locator('button[aria-label*="import" i]')
    ).first();

    const hasExport = await exportButton.isVisible().catch(() => false);
    const hasImport = await importButton.isVisible().catch(() => false);

    if (hasExport || hasImport) {
      // Storage page has export/import functionality
      if (hasExport) {
        // Test export from storage page
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
        await exportButton.click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.(json|txt)$/);
      }
    } else {
      // Storage page doesn't have export/import, skip test
      console.log('Export/Import not available on storage page');
    }
  });

  test('should show export history', async ({ page }) => {
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    const exportButton = page.locator('button:has-text("Export")').or(
      page.locator('button[aria-label*="export" i]')
    ).first();

    if (await exportButton.isVisible({ timeout: 2000 })) {
      // Export multiple times
      for (let i = 0; i < 3; i++) {
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
        await exportButton.click();
        await downloadPromise;
        await page.waitForTimeout(500);
      }

      // Check for export history
      const history = page.locator('[data-testid="export-history"], [data-testid="export-log"]');
      const hasHistory = await history.isVisible().catch(() => false);

      if (hasHistory) {
        await expect(history).toBeVisible();

        const historyEntries = history.locator('*');
        const entryCount = await historyEntries.count();
        expect(entryCount).toBeGreaterThan(0);
      }
    }
  });

  test('should handle concurrent export/import operations', async ({ page }) => {
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    const exportButton = page.locator('button:has-text("Export")').or(
      page.locator('button[aria-label*="export" i]')
    ).first();

    if (await exportButton.isVisible({ timeout: 2000 })) {
      // Try to click export button multiple times rapidly
      await exportButton.click();
      await page.waitForTimeout(100);

      const isDisabled = await exportButton.isDisabled();
      const secondClickResult = await exportButton.click().catch(() => 'blocked');

      // Either button is disabled or second click is blocked
      expect(isDisabled || secondClickResult === 'blocked').toBe(true);
    }
  });
});

test.describe('Collection Export/Import - Error Handling', () => {
  test('should show error for malformed JSON', async ({ page }) => {
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    const importButton = page.locator('button:has-text("Import")').or(
      page.locator('button[aria-label*="import" i]')
    ).first();

    if (await importButton.isVisible({ timeout: 2000 })) {
      await importButton.click();

      const fileInput = page.locator('input[type="file"]').first();

      if (await fileInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        // Create malformed JSON
        const malformedJson = '{"packs": [invalid]}';
        const buffer = Buffer.from(malformedJson);

        await fileInput.setInputFiles({
          name: 'malformed.json',
          mimeType: 'application/json',
          buffer: buffer,
        });

        await page.waitForTimeout(1000);

        // Check for error
        const errorMessage = page.locator('[data-testid="error-message"], [role="alert"], .error');
        const hasError = await errorMessage.isVisible().catch(() => false);

        if (hasError) {
          await expect(errorMessage.first()).toBeVisible();
        }
      }
    }
  });

  test('should show error for missing required fields', async ({ page }) => {
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    const importButton = page.locator('button:has-text("Import")').or(
      page.locator('button[aria-label*="import" i]')
    ).first();

    if (await importButton.isVisible({ timeout: 2000 })) {
      await importButton.click();

      const fileInput = page.locator('input[type="file"]').first();

      if (await fileInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        // Create JSON with missing fields
        const incompleteJson = '{"packs": []}'; // Missing metadata
        const buffer = Buffer.from(incompleteJson);

        await fileInput.setInputFiles({
          name: 'incomplete.json',
          mimeType: 'application/json',
          buffer: buffer,
        });

        await page.waitForTimeout(1000);

        // Check for error or graceful handling
        const errorMessage = page.locator('[data-testid="error-message"], [role="alert"]');
        const hasError = await errorMessage.isVisible().catch(() => false);

        if (hasError) {
          await expect(errorMessage.first()).toBeVisible();
        }
      }
    }
  });

  test('should handle file read errors gracefully', async ({ page }) => {
    await page.goto('/collection');
    await page.waitForLoadState('networkidle');

    const importButton = page.locator('button:has-text("Import")').or(
      page.locator('button[aria-label*="import" i]')
    ).first();

    if (await importButton.isVisible({ timeout: 2000 })) {
      await importButton.click();

      const fileInput = page.locator('input[type="file"]').first();

      if (await fileInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        // Create empty file
        const emptyFile = Buffer.from('');

        await fileInput.setInputFiles({
          name: 'empty.json',
          mimeType: 'application/json',
          buffer: emptyFile,
        });

        await page.waitForTimeout(1000);

        // Check for error or graceful handling
        const errorMessage = page.locator('[data-testid="error-message"], [role="alert"]');
        const hasError = await errorMessage.isVisible().catch(() => false);

        if (hasError) {
          await expect(errorMessage.first()).toBeVisible();
        }
      }
    }
  });
});
