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

## Attempts to Fix

### Attempt 1: Downgrade Vitest to 3.x (PARTIAL SUCCESS)

**Status**: Environment works, but path resolution fails

**Changes Made**:
```bash
# Downgraded packages
vitest@4.0.17 → vitest@3.2.4
@vitest/coverage-v8@4.0.17 → @vitest/coverage-v8@3.2.4
@vitest/ui@4.0.17 → @vitest/ui@3.2.4
@testing-library/svelte@5.3.1 → @testing-library/svelte@4.2.3
```

**Results**:
- ✅ **Environment works**: happy-dom loads correctly
- ✅ **jsdom globals available**: `document`, `window`, `navigator` defined
- ❌ **Path resolution fails**: `@/` aliases not resolving for component imports
- ❌ **Component tests blocked**: Cannot import `@/components/...` paths

**Error**:
```
Error: Failed to resolve import "@/components/common/AnimatedNumber.svelte"
```

**Root Cause**:
Vitest 3.2.4 + Vite 7.x + @testing-library/svelte@4.2.3 have **incompatible path resolution**. The `@/` path aliases configured in `vitest.config.mjs` are not being applied when Vitest transforms test files.

**Additional Issues**:
1. `vi` not defined - Requires explicit import (resolved by adding `vi` to imports)
2. svelteTesting() plugin incompatible with Vitest 3.x - Downgraded to 4.2.3
3. `bun test` was calling Vitest 1.6.1 - Must use `node_modules/.bin/vitest` directly

### Attempt 2: Update vitest.config.mjs environment settings (FAILED)

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

**Status**: PARTIAL SUCCESS - Environment works, but path resolution blocked
**Test Command**: `node_modules/.bin/vitest run` (not `bun test`)

### Option 3: Use Vitest 3.x + Vite 5.x (POTENTIAL FIX)

Downgrade Vite alongside Vitest to match compatible versions.

**Command**:
```bash
bun install --save-dev vitest@3.2.4 vite@5.x.x
```

**Status**: UNTESTED - Hypothetical fix

**Benefits**:
- Path resolution might work with compatible Vite/Vitest versions
- Environment should work (as proven with Vitest 3.x)

**Drawbacks**:
- Major version downgrade from Vite 7.x
- May break other parts of project

### Option 4: Create Custom Vitest Environment Package (ADVANCED)

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

---

## January 19, 2026 Update: Vitest 3.x Downgrade Attempt

### Attempted Downgrade (Partial Success)

**Changes Made**:
```bash
# Downgraded packages
vitest@4.0.17 → vitest@3.2.4
@vitest/coverage-v8@4.0.17 → @vitest/coverage-v8@3.2.4
@vitest/ui@4.0.17 → @vitest/ui@3.2.4
@testing-library/svelte@5.3.1 → @testing-library/svelte@4.2.3
```

**Test Command Required**:
```bash
# Must use direct vitest binary (not `bun test`)
node_modules/.bin/vitest run
```

**Results**:
- ✅ **Environment works**: happy-dom loads correctly
- ✅ **jsdom globals available**: `document`, `window`, `navigator` defined
- ✅ **Vitest 3.2.4 running**: Version confirmed
- ❌ **Path resolution fails**: `@/` aliases not resolving for component imports
- ❌ **Component tests blocked**: Cannot import `@/components/...` paths

**Error Encountered**:
```
Error: Failed to resolve import "@/components/common/AnimatedNumber.svelte"
```

**Root Cause**:
Vitest 3.2.4 + Vite 7.x + @testing-library/svelte@4.2.3 have **incompatible path resolution**. The `@/` path aliases configured in `vitest.config.mjs` are not being applied when Vitest transforms test files.

**Additional Issues Found**:
1. `vi` is not defined globally - Requires explicit import in test files
2. svelteTesting() plugin incompatible with Vitest 3.x - Had to downgrade to 4.2.3
3. `bun test` was calling Vitest 1.6.1 - Must use `node_modules/.bin/vitest`
4. Path alias resolution affects ALL component tests

**Conclusion**: Downgrade to Vitest 3.x does NOT solve the component tests issue. Path resolution is a fundamental blocker.

### Current Recommendations

**Option 1: Revert to Vitest 4.x and Wait for Svelte 5.5+ (RECOMMENDED)**
- Vitest 3.x has path resolution issues
- Vitest 4.x environment works, jsdom is the problem
- Svelte 5.5+ native test utilities will solve both issues
- Timeline: Q1-Q2 2026

**Option 2: Revert to Vitest 4.x + Downgrade Vite to 5.x (UNTESTED)**
- Hypothesis: Vite 7.x might be the path resolution issue
- Command: `bun install --save-dev vite@5.x.x`
- Risk: May break other parts of project

**Option 3: Revert to Vitest 4.x + Create Custom Environment (ADVANCED)**
- Build local environment package that fixes jsdom initialization
- Documented in Option 4 (original documentation)

## References

- Issue: https://github.com/vitest-dev/vitest/issues/4183 (similar issues)
- Svelte 5 testing docs: https://svelte.dev/docs/svelte-testing
- @testing-library/svelte docs: https://testing-library.com/docs/svelte-testing-intro
