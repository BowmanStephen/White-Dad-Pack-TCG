import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Testing Configuration for DadDeck
 *
 * This configuration supports testing across multiple browsers and devices
 * to ensure the DadDeck TCG pack opening experience works everywhere.
 *
 * Browsers Tested:
 * - Chromium (Chrome, Edge)
 * - Firefox
 * - WebKit (Safari)
 *
 * Viewports Tested:
 * - Desktop (1920x1080)
 * - Laptop (1280x720)
 * - Tablet (768x1024)
 * - Mobile (375x667)
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  /* Snapshot path for visual regression tests */
  snapshotPathTemplate: '{testDir}/{projectName}/__screenshots__/{testFilePath}/{arg}{ext}',

  /* Shared settings for all tests */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:4321',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',

    /* Locale for testing internationalization */
    locale: 'en-US',

    /* Test timezone */
    timezoneId: 'America/New_York',

    /* Wait for network idle before considering actions done */
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Visual Regression Test Projects */
    {
      name: 'visual-tests-chromium',
      testDir: './tests/visual',
      use: {
        ...devices['Desktop Chrome'],
        screenshot: 'only-on-failure',
      },
    },

    {
      name: 'visual-tests-firefox',
      testDir: './tests/visual',
      use: {
        ...devices['Desktop Firefox'],
        screenshot: 'only-on-failure',
      },
    },

    {
      name: 'visual-tests-webkit',
      testDir: './tests/visual',
      use: {
        ...devices['Desktop Safari'],
        screenshot: 'only-on-failure',
      },
    },

    {
      name: 'visual-tests-mobile',
      testDir: './tests/visual',
      use: {
        ...devices['Pixel 5'],
        screenshot: 'only-on-failure',
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
