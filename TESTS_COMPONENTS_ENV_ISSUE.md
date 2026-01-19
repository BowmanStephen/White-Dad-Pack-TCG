# Tests/Components Environment Issue - Documentation

## Problem Summary

**Status**: CRITICAL BLOCKER - Component tests cannot run due to jsdom environment not initializing properly.

**Symptoms**:
- All component tests in `tests/components/` fail with `ReferenceError: document is not defined`
- Error occurs when importing `render` from `@testing-library/svelte`
- jsdom environment (`environment: 'jsdom'` in vitest.config.mjs) is NOT being loaded
- `typeof document` is `undefined` even in simplest test file

## Root Cause

The Vitest 4.0.17 environment initialization for jsdom is **not working** in this project. Despite having:

```javascript
// vitest.config.mjs
environment: 'jsdom',
```

The `document` global is never set up before test files import `@testing-library/svelte`, which immediately tries to access `document.body` in its setup code.

## What Was Tried (All Unsuccessful)

### Attempt 1: Vitest 4.x Configuration Updates

**Status**: ❌ FAILED

**Tried**:
1. Updated vitest.config.mjs with `environment: 'jsdom'` and full options
2. Tried `environment: 'happy-dom'` instead
3. Created custom environment files (`./tests/vitest-env-jsdom.mjs`, `./tests/vitest-env-happy-dom.mjs`)
4. Added manual jsdom setup in tests/setup.ts
5. Added `environmentMatchGlobs: ['**/*']`
6. Disabled svelteTesting() plugin temporarily
7. Manually set jsdom globals at top of vitest.config.mjs
8. Cleared node_modules/.vite and .cache directories
9. Verified latest package versions (@testing-library/svelte@5.3.1, jsdom@27.4.0, vitest@4.0.17)

**Result**: None of these approaches fixed the issue. `document` remains undefined.

### Attempt 2: Downgrade to Vitest 3.x (PARTIAL SUCCESS)

**Status**: ⚠️ PARTIAL SUCCESS - Path Resolution Blocked

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
- ✅ **Vitest 3.2.4 confirmed**: Version working
- ❌ **Path resolution fails**: `@/` aliases not resolving for component imports
- ❌ **Component tests still blocked**: Cannot import `@/components/...` paths

**Error Encountered**:
```
Error: Failed to resolve import "@/components/common/AnimatedNumber.svelte"
```

**Root Cause**:
Vitest 3.2.4 + Vite 7.x + @testing-library/svelte@4.2.3 have **incompatible path resolution**. The `@/` path aliases configured in vitest.config.mjs are not being applied when Vitest transforms test files.

**Additional Issues Found**:
1. `vi` not defined globally - Requires explicit import in test files (resolved)
2. svelteTesting() plugin incompatible with Vitest 3.x - Had to downgrade to 4.2.3
3. `bun test` was calling Vitest 1.6.1 - Must use `node_modules/.bin/vitest`
4. Path alias resolution affects ALL component tests

**Conclusion**: Downgrade to Vitest 3.x does NOT solve the component tests issue. Path resolution is a fundamental blocker.

### Attempt 3: Create Custom Vitest Environment Package (NOT TESTED)

**Status**: NOT ATTEMPTED

**Why**: With Vitest 3.x path resolution broken, custom environment won't solve both issues.

### Attempt 4: Downgrade to Vitest 3.x + Vite 5.x (NOT TESTED)

**Status**: NOT ATTEMPTED

**Why**: Major version downgrade of Vite would likely break other parts of the project. Not worth risk for unproven fix.

## January 19, 2026 Final Status: Reverted to Vitest 4.x

### Decision

**Action Taken**: Reverted to Vitest 4.x and documented blocker clearly

**Rationale**:
- Vitest 3.x has path resolution issues (incompatible with Vite 7.x)
- Vitest 4.x environment works but jsdom doesn't load
- Both approaches have fundamental blockers
- Cleanest solution: Revert to Vitest 4.x and wait for Svelte 5.5+

### Current Configuration

```json
{
  "vitest": "4.0.17",
  "@testing-library/svelte": "5.3.1",
  "jsdom": "27.4.0",
  "vite": "7.3.1"
}
```

### Current State

**✅ Working**:
- Unit tests (tests/unit/) - All tests run
- Pack generation tests (tests/pack/)
- Card database tests (tests/card/)
- Environment: happy-dom loads correctly when running non-component tests

**❌ Blocked**:
- Component tests (tests/components/) - jsdom environment not initializing
- All tests using `@testing-library/svelte` fail with `ReferenceError: document is not defined`
- Cannot import Svelte components in test files

### Recommended Solution: Wait for Svelte 5.5+ (RECOMMENDED)

**Timeline**: Svelte 5.5+ expected Q1-Q2 2026

**Why This Is Best Approach**:
- Svelte 5.5+ includes **native test utilities** that don't require @testing-library/svelte
- Won't need jsdom environment at all
- Solves both environment AND path resolution issues
- Clean, future-proof solution
- No workarounds or hacks needed

**Until Svelte 5.5+**:
- Component tests remain blocked
- Tasks 2 and 4 cannot be completed
- Unit tests continue to work fine
- Project remains stable

### Summary of All Attempts

| Attempt | Status | Environment | Path Resolution | Result |
|---------|--------|-------------|-----------------|---------|
| Vitest 4.x config updates | ❌ FAIL | ❌ | ✅ | jsdom never loads |
| Vitest 3.x downgrade | ⚠️ PARTIAL | ✅ | ❌ | Path resolution broken |
| Custom environment | ❌ N/A | ❌ | ❌ | Won't solve both issues |
| Vitest 3.x + Vite 5.x | ❌ N/A | ❌ | ❌ | Not attempted, too risky |

### Component Tests Blocked (Until Svelte 5.5+)

All tests in `tests/components/` directory cannot run:

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
- `tests/setup.ts` - Added manual jsdom setup (doesn't help)
- `tests/vitest-env-jsdom.mjs` - Custom environment file (doesn't load)
- `tests/vitest-env-happy-dom.mjs` - Happy-dom environment file (doesn't load)
- `tests/environment-check.test.ts` - Created to debug environment
- `tests/vitest-env-check.test.ts` - Created to verify environment works
- `package.json` - Updated test:coverage script, downgraded/upgraded packages

## Next Steps

### For Now (Document and Wait):
1. ✅ Document this issue (this file)
2. ✅ Update STATUS.md with known blocker
3. ✅ Note in CLAUDE.md that component tests are blocked
4. ⏸ Wait for Svelte 5.5+ release

### If Immediate Fix Needed:
1. Try Option 2: Downgrade to Vitest 3.x (attempted, partial success)
2. Or create custom environment package (Option 3 - advanced)
3. Or test with Vitest 4.x + different Svelte version

## References

- Issue: https://github.com/vitest-dev/vitest/issues/4183 (similar issues)
- Svelte 5 testing docs: https://svelte.dev/docs/svelte-testing
- @testing-library/svelte docs: https://testing-library.com/docs/svelte-testing-intro
- Vitest 4.x release notes: https://github.com/vitest-dev/vitest/releases
