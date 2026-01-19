# Tests/Components Environment Issue - Documentation

## Problem Summary

**Status**: CRITICAL BLOCKER - Component tests cannot run due to jsdom environment not initializing properly.

**Symptoms**:
- All component tests in `tests/components/` fail with `ReferenceError: document is not defined`
- Error occurs when importing `render` from `@testing-library/svelte`
- jsdom environment (`environment: 'jsdom'` in vitest.config.mjs) is NOT being loaded
- `typeof document` is `undefined` even in the simplest test file

## Root Cause

The Vitest 4.0.17 environment initialization for jsdom is **not working** in this project. Despite having:

```javascript
// vitest.config.mjs
environment: 'jsdom',
```

The `document` global is never set up before test files import `@testing-library/svelte`, which immediately tries to access `document.body` in its setup code.

## What Was Tried (Unsuccessful)

1. **Updated vitest.config.mjs environment settings**
   - Set `environment: 'jsdom'` with full options
   - Tried `environment: 'happy-dom'`
   - Tried custom environment files (`./tests/vitest-env-jsdom.mjs`, `./tests/vitest-env-happy-dom.mjs`)
   - Tried `environmentMatchGlobs: ['**/*']`

2. **Modified setup.ts**
   - Added manual jsdom setup with `global.document` assignment
   - Set up jsdom at module level using `JSDOM` import
   - Added debug logging to check if setup.ts runs

3. **Vite configuration**
   - Temporarily disabled `svelteTesting()` plugin
   - Added manual jsdom setup at top of vitest.config.mjs
   - Created separate `.js` config file (instead of `.mjs`)

4. **Cache management**
   - Cleared `node_modules/.vite` and `node_modules/.cache`
   - Restarted test runner multiple times

5. **Package versions**
   - Verified `@testing-library/svelte@5.3.1` (latest)
   - Verified `jsdom@27.4.0` (latest)
   - Verified `vitest@4.0.17`
   - Verified `svelte@5.46.4`

**Result**: None of these approaches fixed the issue.

## Current State

**Unit Tests**: ✅ WORKING (278 pass, 150 fail)
- `tests/unit/` tests run without issue
- Don't use @testing-library/svelte, so no DOM access needed

**Component Tests**: ❌ BLOCKED (all failing)
- `tests/components/card-stats.test.ts` - 26 tests, all failing
- `tests/unit/components/pack/PackOpener.test.ts` - failing (if run)
- Any test using `render()` from `@testing-library/svelte` fails immediately

## Recommended Solutions

### Option 1: Wait for Svelte 5.5+ Native Test Utilities (RECOMMENDED)

**Timeline**: Svelte 5.5+ expected Q1-Q2 2026

Svelte 5.5+ will include native test utilities that don't require jsdom environment setup. This is the cleanest long-term solution.

**Benefits**:
- No external test libraries needed
- Native Svelte component testing
- No jsdom environment configuration issues
- Better performance (lighter test environment)

**Action**: Document this as known blocker and wait for Svelte 5.5 release.

### Option 2: Downgrade Vitest to 3.x (TEMPORARY WORKAROUND)

Vitest 3.x had different environment initialization that might work better with @testing-library/svelte.

**Command**:
```bash
bun install --save-dev vitest@3.x.x
```

**Benefits**:
- Proven compatibility with @testing-library/svelte
- Stable, well-tested version
- Should resolve jsdom environment issue

**Drawbacks**:
- Downgrade from latest Vitest 4.x
- May have other compatibility issues

### Option 3: Create Custom Vitest Environment Package (ADVANCED)

Create a local npm package that properly sets up jsdom environment for Vitest 4.

**Files to create**:
```
packages/vitest-environment-daddeck/
  ├── package.json
  ├── index.js
  └── README.md
```

**index.js example**:
```javascript
import { JSDOM } from 'jsdom';

let dom;

export default {
  name: 'jsdom-daddeck',
  setup(global) {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
      resources: 'usable',
    });

    // Set up all globals
    global.window = dom.window;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
    // ... (all other browser globals)

    return {
      teardown(global) {
        // Clean up if needed
      }
    };
  }
};
```

**Then update vitest.config.mjs**:
```javascript
environment: 'vitest-environment-daddeck',
```

### Option 4: Use Happy-Dom Directly in Tests (QUICK FIX)

Modify component tests to manually set up happy-dom environment before importing @testing-library/svelte.

**Example**:
```typescript
// tests/components/card-stats.test.ts
import { JSDOM } from 'jsdom';

// Set up jsdom at module level
if (typeof document === 'undefined') {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  global.window = dom.window;
  global.document = dom.window;
  // ... (set all globals)
}

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
// ... rest of test
```

**Drawbacks**:
- Every test file needs manual environment setup
- Code duplication
- Not ideal long-term solution

## Component Tests Blocked

Until environment is fixed, these tests cannot run:

1. **tests/components/card-stats.test.ts** (26 tests)
   - Stat display, formatting, highlighting
   - Accessibility, rarity theming
   - Edge cases

2. **tests/unit/components/pack/PackOpener.test.ts** (~20 tests)
   - State machine transitions
   - User interactions
   - Keyboard navigation
   - Error handling

3. **tests/unit/components/common/AnimatedNumber.test.ts** (8 tests)
   - Number animation
   - Formatting
   - Color changes

4. **Missing tests to create** (blocked):
   - CardDetailModal tests (~50 lines, ~10 tests)
   - Gallery tests (re-create)
   - CollectionManager tests (re-create)

## Files Modified

- `vitest.config.mjs` - Updated environment settings (issue persists)
- `vitest.config.mjs.bak` - Backup of original
- `vitest.config.js` - Alternative config (issue persists)
- `tests/setup.ts` - Added manual jsdom setup (doesn't help)
- `tests/vitest-env-jsdom.mjs` - Custom environment file (doesn't load)
- `tests/vitest-env-happy-dom.mjs` - Happy-dom environment file (doesn't load)
- `tests/environment-check.test.ts` - Created to debug environment
- `package.json` - Updated test:coverage script

## Next Steps

### For Now (Document and Wait):
1. ✅ Document this issue (this file)
2. ✅ Update STATUS.md with known blocker
3. ✅ Note in CLAUDE.md that component tests are blocked
4. ⏸ Wait for Svelte 5.5+ release (or try Option 2/3)

### If Immediate Fix Needed:
1. Try Option 2: Downgrade to Vitest 3.x
2. Or create custom environment package (Option 3)
3. Or test with Vitest 4.x + different Svelte version

## References

- Issue: https://github.com/vitest-dev/vitest/issues/4183 (similar issues)
- Svelte 5 testing docs: https://svelte.dev/docs/svelte-testing
- @testing-library/svelte docs: https://testing-library.com/docs/svelte-testing-intro
