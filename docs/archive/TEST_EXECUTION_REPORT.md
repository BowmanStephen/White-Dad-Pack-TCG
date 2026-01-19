# Test Execution Report (Baseline)

Date: 2026-01-19

This report captures the **current baseline** of automated suites and code
quality checks per `comprehensive_feature_testing_plan_5dceb05a.plan.md`.

## Environment

- **Repo**: DadDeck™ - White Dad Pack TCG
- **Package manager**: Bun
- **Runtime**: Node.js v22.16.0 (from test output)

## Phase 1.1: Existing Test Suites

### Unit tests (`bun run test:run`)

- **Result**: ❌ failed (exit 1)
- **Test files**: 33 total
  - 25 passed
  - 8 failed
- **Tests**: 867 total
  - 814 passed
  - 53 failed
- **Duration**: ~36s

#### Top failing clusters (high-signal)

- **Security sanitization**: `tests/unit/lib/security/sanitizer.test.ts`
  - 7 failures (expected SSR/test fallback to escape HTML, but output is
    returning stripped/allowed HTML in several cases)
- **Performance harness**: `tests/performance/animation-performance.test.ts`
  - 4 failures (debounce/throttle + FPS assertions)
- **Deck import/export validation**: `tests/unit/lib/deck/import-export.test.ts`
  - 2 failures (rejecting malformed JSON edge cases)
- **Storage quota manager**: `tests/unit/lib/storage/quota-manager.test.ts`
  - multiple failures due to **test timeouts** (5s / 10s)
- **Keywords / stat scaling**: `tests/unit/lib/mechanics/keywords.test.ts`
  - at least 1 failure (damage scaling expectations)

#### Notable warnings observed during unit tests

- `binding_property_non_reactive` warnings from `src/components/card/Card.svelte`
  during component tests (non-fatal but useful signal).

### Coverage (`bun run test:coverage`)

- **Result**: ❌ failed (exit 1)
- **Test files**: 31 total
  - 23 passed
  - 8 failed
- **Tests**: 842 total
  - 792 passed
  - 50 failed

#### Coverage artifacts

- No `coverage/` folder was found in the workspace after the run.
  - Coverage may not be writing due to failing tests or config output path.
  - Action item: confirm vitest coverage output settings in `vitest.config.mjs`.

#### Additional notable failure (coverage run)

- `tests/audio/audio.test.ts` fails with:
  - `TypeError: Cannot assign to read only property 'localStorage'`

### E2E (`bun run test:e2e`)

- **Initial result**: ❌ failed immediately
  - Reason: `http://localhost:4321` already in use.
- **Re-run attempt**: started `astro dev` via Playwright `webServer`
  - **Did not complete within 10 minutes** (tool timeout)
  - Early signal: many failures in `tests/e2e/collection.test.ts`
  - **Critical server error while starting**:
    - `Cannot find module 'vite-imagetools' imported from 'astro.config.mjs'`
    - Follow-on error: `imagetools is not defined`

**Blocker**: E2E suite reliability depends on fixing `astro.config.mjs`
(`vite-imagetools` import) and potentially setting
`reuseExistingServer: true` in `playwright.config.ts` (or ensuring the dev
server is not already running).

### Visual (`bun run test:visual`)

- **Result**: ❌ failed (exit 1)
- **Duration**: ~10 minutes
- **Failures**: 30 failed (Chromium visual project)

#### High-signal visual failure modes

- Multiple tests timing out waiting for key page sections/selectors (example:
  waiting for `.features` timed out at 5000ms in
  `tests/visual/ui-components-visual.test.ts`).
- Widespread failures across:
  - card visuals
  - pack opening visuals
  - navigation/buttons/theme visuals
  - landing page visuals

## Code Quality

### Lint (`bun run lint`)

- **Result**: ❌ failed (exit 1)

#### High-signal lint errors

- `src/components/card/AbilityTooltip.svelte`
  - `svelte/no-at-html-tags` error (`{@html}` flagged as XSS risk)
- `src/pages/error-test.astro`
  - parsing error: `Declaration or statement expected` (line reported by ESLint)
- `src/lib/security/sanitizer.ts`
  - `no-useless-escape`
  - `no-control-regex`
- Multiple `@typescript-eslint/no-unused-vars` errors across `src/lib/` and
  `src/lib/storage/indexeddb.ts` (unused imports/exports/params).

## Immediate Next Steps (from this baseline)

1. Fix the `astro.config.mjs` `vite-imagetools` dependency/config so
   Playwright suites can run reliably.
2. Address lint-stopping errors (especially `{@html}` usage and `.astro`
   parse error).
3. Stabilize unit test failures by cluster:
   - sanitizer behavior mismatch in tests vs implementation
   - quota manager tests timing out (mocking / async / testTimeout)
   - performance test assertions
   - deck import/export validation edge cases

## Addendum: Extended E2E run attempt

An extended E2E run was attempted (45 minute budget) and still did not finish.
The run progressed deep into the suite, but was dominated by repeated retries
and timeouts.

Additional high-signal server/runtime errors observed during this run:

- WebServer (Astro) errors while tests were running:
  - `Cannot find module '@/stores/wishlist' imported from 'src/components/card/Card.svelte'`

This strongly suggests the E2E suite is currently not a reliable signal until
the underlying dev-server/module resolution issues are fixed.

