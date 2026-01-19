# Visual Regression Testing Guide

## Overview

DadDeck uses Playwright's built-in screenshot comparison for visual regression testing. This ensures UI components render correctly across browsers, viewports, and updates.

## What is Visual Regression Testing?

Visual regression testing automatically captures screenshots of UI components and compares them against baseline images. If the differences exceed configured thresholds, the test fails.

This catches:
- Unintended CSS changes
- Layout breaks
- Cross-browser rendering issues
- Responsive design failures
- Theme/light mode inconsistencies

## Test Structure

```
tests/visual/
├── card-visual.test.ts           # Card component tests
├── pack-opening-visual.test.ts   # Pack opening flow tests
└── ui-components-visual.test.ts  # UI component tests
```

## Running Visual Tests

### Local Development

```bash
# Run visual tests on Chromium (Chrome)
bun run test:visual

# Run on all desktop browsers (Chrome, Firefox, Safari)
bun run test:visual:all

# Run mobile viewport tests
bun run test:visual:mobile

# Run with interactive UI (recommended for debugging)
bun run test:e2e:ui --project=visual-tests-chromium
```

### Creating/Updating Baselines

First time running tests? Or made intentional UI changes?

```bash
# Update baseline screenshots
bun run test:visual:update

# Update for all browsers
bun run test:visual:all --update-snapshots
```

**Important**: Commit updated screenshots to git!

## Writing Visual Tests

### Basic Test Pattern

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Component Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/page-with-component');
    await page.waitForLoadState('networkidle');
  });

  test('should render correctly', async ({ page }) => {
    const component = page.locator('.my-component');

    await expect(component).toHaveScreenshot('my-component.png', {
      maxDiffPixels: 100,    // Max pixel differences allowed
      threshold: 0.2,        // Max 20% pixel difference
    });
  });
});
```

### Testing Different States

```typescript
test('should render hover state', async ({ page }) => {
  const button = page.locator('.btn-primary');

  await button.hover();
  await expect(button).toHaveScreenshot('btn-primary-hover.png');
});

test('should render active state', async ({ page }) => {
  const button = page.locator('.btn-primary');

  await button.click();
  await expect(button).toHaveScreenshot('btn-primary-active.png');
});
```

### Testing Responsive Design

```typescript
test.describe('Mobile Viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should render on mobile', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toHaveScreenshot('nav-mobile.png');
  });
});
```

### Testing Across Browsers

Tests run automatically on all configured browsers (Chrome, Firefox, Safari). Each browser gets its own baseline images:

```
tests/visual/
├── chromium/
│   └── __screenshots__/
│       └── card-visual.test.ts/
│           └── common-card.png
├── firefox/
│   └── __screenshots__/
│       └── card-visual.test.ts/
│           └── common-card.png
└── webkit/
    └── __screenshots__/
        └── card-visual.test.ts/
            └── common-card.png
```

### Testing Animated Components

Animations can cause flaky tests. Use `animations: 'allow'`:

```typescript
test('should render animation', async ({ page }) => {
  const animation = page.locator('.pack-animation');

  await expect(animation).toHaveScreenshot('animation.png', {
    animations: 'allow',  // Don't wait for animations to complete
    maxDiffPixels: 200,    // Allow more variance for animation frames
    threshold: 0.3,
  });
});
```

## Screenshot Comparison Options

### Threshold

Percentage of pixels allowed to differ (0-1):

```typescript
await expect(component).toHaveScreenshot('file.png', {
  threshold: 0.2,  // Allow 20% pixel difference
});
```

**Recommendations:**
- Static components: `0.1 - 0.15` (10-15%)
- Dynamic content: `0.2 - 0.25` (20-25%)
- Animations: `0.3 - 0.4` (30-40%)

### Max Diff Pixels

Absolute number of pixels allowed to differ:

```typescript
await expect(component).toHaveScreenshot('file.png', {
  maxDiffPixels: 100,  // Allow 100 pixels to differ
});
```

**Recommendations:**
- Small components (buttons, inputs): `20 - 50`
- Medium components (cards, panels): `50 - 100`
- Large components (screens, modals): `100 - 200`
- Full pages: `200 - 500`

### Full Page Screenshots

Capture entire scrollable page:

```typescript
await expect(page).toHaveScreenshot('full-page.png', {
  fullPage: true,
});
```

### Masking Elements

Hide dynamic content (dates, counters, etc.):

```typescript
await expect(page).toHaveScreenshot('page.png', {
  mask: [
    page.locator('.timestamp'),
    page.locator('.user-count'),
  ],
});
```

## CI Integration

### GitHub Actions

```yaml
name: Visual Tests

on:
  pull_request:
    paths:
      - 'src/**'
      - 'tests/visual/**'

jobs:
  visual-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Install Playwright browsers
        run: bunx playwright install --with-deps

      - name: Run visual tests
        run: bun run test:visual:all

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: screenshots
          path: tests/visual/*/screenshots/
```

### Handling Failures in CI

When visual tests fail in CI:

1. **Download screenshot artifacts** from the failed run
2. **Compare baseline vs actual** locally
3. **Determine if change is intentional**:
   - ✅ Intentional: Update baselines and commit
   - ❌ Unintentional: Fix the UI issue

### Best Practices for CI

- **Run on every PR** targeting main branch
- **Only test changed paths** to speed up CI
- **Upload screenshots on failure** for review
- **Allow manual baseline updates** via `--update-snapshots`

## Debugging Failed Tests

### View Diff Report

```bash
# Run with HTML reporter
bun run test:visual --reporter=html

# Open report
bunx playwright show-report
```

The HTML report shows:
- Baseline image
- Actual image
- Diff image (highlights differences)
- Comparison metrics

### Inspect Screenshots Manually

```bash
# Find screenshots
ls tests/visual/visual-tests-chromium/__screenshots__/

# Compare baseline vs actual
open tests/visual/visual-tests-chromium/__screenshots__/baseline.png
open tests/visual/visual-tests-chromium/__screenshots__/actual.png
open tests/visual/visual-tests-chromium/__screenshots__/diff.png
```

### Common Failure Causes

**1. Timing Issues**
- **Problem**: Component still loading when screenshot captured
- **Solution**: Add `waitForLoadState('networkidle')` or `waitForSelector()`

```typescript
await page.goto('/collection');
await page.waitForLoadState('networkidle'); // Wait for all resources
await page.waitForSelector('.card'); // Wait for specific element
```

**2. Animated Content**
- **Problem**: Different animation frames captured each run
- **Solution**: Use `animations: 'allow'` or disable animations

```typescript
await expect(component).toHaveScreenshot('file.png', {
  animations: 'allow',
});
```

**3. Dynamic Content**
- **Problem**: Timestamps, random IDs, counters differ each run
- **Solution**: Mask dynamic elements

```typescript
await expect(page).toHaveScreenshot('file.png', {
  mask: [page.locator('.timestamp'), page.locator('.random-id')],
});
```

**4. Cross-Browser Differences**
- **Problem**: Same CSS renders differently in Chrome vs Firefox
- **Solution**: Increase threshold for that browser/test

```typescript
await expect(component).toHaveScreenshot('file.png', {
  threshold: 0.3, // Allow more variance for cross-browser
});
```

**5. Font Rendering**
- **Problem**: Slight font differences between OS/browsers
- **Solution**: Increase `maxDiffPixels` slightly

```typescript
await expect(component).toHaveScreenshot('file.png', {
  maxDiffPixels: 150, // Allow small font rendering differences
});
```

## Test Coverage Strategy

### Priority Components

**Must Test (P0):**
- ✅ Card components (all rarities)
- ✅ Pack opening flow (all stages)
- ✅ Navigation (desktop + mobile)
- ✅ Theme toggle (light + dark)

**Should Test (P1):**
- Buttons (primary, secondary, icon)
- Modals
- Forms (inputs, selects)
- Collection grid
- Filters and search

**Nice to Test (P2):**
- Footer
- Loading states
- Error messages
- Tooltips

### Browser Coverage

- **Chromium (Chrome)**: Primary development browser
- **Firefox**: Second most common
- **WebKit (Safari)**: Apple ecosystem
- **Mobile**: Test responsive design

### Viewport Coverage

- **Desktop**: 1920x1080 (most common)
- **Laptop**: 1280x720
- **Tablet**: 768x1024
- **Mobile**: 375x667 (Pixel 5, iPhone 12)

## Workflow Example

### Adding a New Component Test

1. **Create test file**:
```bash
touch tests/visual/my-component-visual.test.ts
```

2. **Write test**:
```typescript
import { test, expect } from '@playwright/test';

test.describe('MyComponent Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/my-page');
    await page.waitForLoadState('networkidle');
  });

  test('should render correctly', async ({ page }) => {
    const component = page.locator('.my-component');
    await expect(component).toHaveScreenshot('my-component.png');
  });
});
```

3. **Generate baseline**:
```bash
bun run test:visual:update
```

4. **Commit baseline**:
```bash
git add tests/visual/visual-tests-chromium/__screenshots__/
git commit -m "test: add visual test baseline for MyComponent"
```

5. **Verify test passes**:
```bash
bun run test:visual
```

## Troubleshooting

### Tests Pass Locally, Fail in CI

**Cause**: Environment differences (fonts, rendering, OS)

**Solutions**:
1. Increase threshold slightly: `threshold: 0.25`
2. Allow more pixel diff: `maxDiffPixels: 150`
3. Use Docker in CI to match local environment

### Screenshots Not Found

**Cause**: Baseline screenshots not committed to git

**Solution**:
```bash
# Generate baselines
bun run test:visual:update

# Commit them
git add tests/visual/
git commit -m "test: add visual test baselines"
```

### Tests Too Slow

**Cause**: Too many screenshots, waiting for network idle

**Solutions**:
1. Test only critical components
2. Use `waitForSelector()` instead of `waitForLoadState()`
3. Reduce browser projects in CI
4. Run tests in parallel (default Playwright behavior)

## Best Practices

### DO ✅

- ✅ Test all card rarities
- ✅ Test both light and dark themes
- ✅ Test responsive breakpoints
- ✅ Test hover, active, focus states
- ✅ Commit baseline screenshots to git
- ✅ Use descriptive screenshot names
- ✅ Increase thresholds for cross-browser tests
- ✅ Mask dynamic content (timestamps, counters)
- ✅ Run visual tests on every PR

### DON'T ❌

- ❌ Test every single component (be strategic)
- ❌ Use `threshold: 1` (defeats the purpose)
- ❌ Ignore persistent failures (investigate them)
- ❌ Commit baselines without reviewing them
- ❌ Test content that changes frequently (use E2E tests instead)
- ❌ Use screenshots to test functionality (use E2E for behavior)

## Additional Resources

- [Playwright Screenshots Documentation](https://playwright.dev/docs/screenshots)
- [Playwright Visual Comparison](https://playwright.dev/docs/test-snapshots)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

## Questions?

If you're unsure about:
- Threshold values for a specific component
- Whether to test something visually vs functionally
- How to handle a specific test failure

Ask in the team chat or create an issue with:
- Screenshot of the diff
- Component name
- Browser/viewport being tested
