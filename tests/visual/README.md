# Visual Regression Tests

This directory contains Playwright visual regression tests for DadDeck TCG.

## Test Files

### `card-visual.test.ts`
Tests card component rendering across:
- All rarity tiers (common → mythic)
- Holographic variants
- Dad types (BBQ_DAD, FIX_IT_DAD, GOLF_DAD)
- Card stats display

### `pack-opening-visual.test.ts`
Tests the pack opening flow stages:
- Idle state (pack closed)
- Pack tear animation
- Card reveal
- Results screen
- Share functionality

### `ui-components-visual.test.ts`
Tests UI components:
- Navigation (desktop + mobile)
- Buttons (primary, secondary, hover states)
- Theme toggle (light + dark)
- Collection interface
- Landing page sections

## Quick Start

```bash
# Run visual tests on Chromium
bun run test:visual

# Run on all browsers
bun run test:visual:all

# Run mobile viewport tests
bun run test:visual:mobile

# Update baseline screenshots
bun run test:visual:update
```

## First Time Setup

1. Install dependencies:
```bash
bun install
```

2. Install Playwright browsers:
```bash
bunx playwright install --with-deps
```

3. Generate baseline screenshots:
```bash
bun run test:visual:update
```

4. Verify tests pass:
```bash
bun run test:visual
```

## Test Strategy

### What Gets Tested

**Priority 0 (Critical):**
- ✅ All card rarities (6 tiers)
- ✅ Holographic cards
- ✅ Pack opening flow
- ✅ Navigation (desktop + mobile)
- ✅ Theme toggle

**Priority 1 (Important):**
- ✅ Buttons and interactive states
- ✅ Collection grid and filters
- ✅ Theme variations

**Priority 2 (Nice to have):**
- Future: Modals, tooltips, loading states

### Browser Coverage

- **Chromium**: Primary development browser
- **Firefox**: Secondary browser
- **WebKit (Safari)**: Apple ecosystem
- **Mobile**: Responsive design testing

### Thresholds

We use permissive thresholds to account for:
- Cross-browser rendering differences
- Font rendering variations
- Anti-aliasing differences
- Animated content

```
Static components:   threshold: 0.15, maxDiffPixels: 50-100
Dynamic content:     threshold: 0.20, maxDiffPixels: 100-150
Animations:          threshold: 0.30, maxDiffPixels: 150-200
```

## File Structure

```
tests/visual/
├── card-visual.test.ts           # Card component tests
├── pack-opening-visual.test.ts   # Pack opening flow tests
├── ui-components-visual.test.ts  # UI component tests
└── README.md                     # This file

tests/visual/visual-tests-chromium/
└── __screenshots__/
    └── card-visual.test.ts/
        ├── common-card.png        # Baseline screenshot
        ├── uncommon-card.png
        ├── rare-card.png
        └── ...
```

## Adding New Tests

1. Create test file in `tests/visual/`
2. Follow existing patterns
3. Use descriptive screenshot names
4. Set appropriate thresholds
5. Generate baselines with `--update-snapshots`
6. Commit baselines to git

Example:
```typescript
import { test, expect } from '@playwright/test';

test.describe('MyComponent', () => {
  test('should render correctly', async ({ page }) => {
    await page.goto('/my-page');
    await page.waitForLoadState('networkidle');

    const component = page.locator('.my-component');
    await expect(component).toHaveScreenshot('my-component.png', {
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });
});
```

## Troubleshooting

### Tests Fail Locally

1. Check if change is intentional:
   - Yes → Run `bun run test:visual:update` and commit
   - No → Fix the UI issue

2. View the diff:
```bash
bun run test:visual --reporter=html
bunx playwright show-report
```

### Tests Pass Locally, Fail in CI

This is usually due to:
- OS differences (Linux vs macOS/Windows)
- Font rendering variations
- Slight browser version differences

**Solution**: Increase threshold slightly for that test.

### Need to Update All Baselines

```bash
# Update all baselines across browsers
bun run test:visual:all --update-snapshots

# Commit the changes
git add tests/visual/
git commit -m "test: update visual test baselines"
```

## CI Integration

Visual tests run automatically on:
- Pull requests (when visual files change)
- Pushes to main branch

When tests fail in CI:
1. Download screenshot artifacts from workflow run
2. Review baseline vs actual screenshots
3. Update baselines if intentional, fix UI if not

See `.github/workflows/visual-tests.yml` for CI configuration.

## Documentation

For detailed information, see:
- [VISUAL_TESTING_GUIDE.md](../../docs/VISUAL_TESTING_GUIDE.md) - Complete guide
- [Playwright Screenshots](https://playwright.dev/docs/screenshots) - Official docs

## Questions?

Check the main guide or ask in team chat!
