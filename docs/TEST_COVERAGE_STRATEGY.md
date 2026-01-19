# Test Coverage Strategy - PACK-069

**Target:** 80%+ code coverage
**Current:** 66.07% (lines)
**Gap:** 13.93% additional coverage needed

## Coverage Analysis

### Current Coverage by Category

| Category | Files | Avg Coverage | Status |
|----------|-------|--------------|--------|
| **Core Utilities** | 8 | 72.48% | 🟡 Needs improvement |
| **State Management** | 5 | 50.80% | 🔴 Critical gap |
| **Deck System** | 5 | 40.28% | 🔴 Critical gap |
| **Pack System** | 2 | 63.83% | 🟡 Needs improvement |
| **Mechanics** | 3 | 93.88% | 🟢 Good |
| **I18N** | 2 | 52.49% | 🟡 Needs improvement |

## Priority Test Additions

### Priority 1: High Impact, Quick Wins (Target: +8-10% coverage)

#### 1. `src/lib/utils/formatters.ts` (8.33% → target 90%)
**Why:** Pure utility functions, easy to test, no dependencies
**Tests needed:**
- Number formatting (abbreviateNumber, formatCurrency)
- Date formatting (formatDate, formatRelativeTime)
- Percentage formatting
- List formatting

**Estimated effort:** 30 minutes
**Coverage gain:** +2-3%

#### 2. `src/lib/deck/suggestions.ts` (0.95% → target 80%)
**Why:** Core feature for deck building, completely untested
**Tests needed:**
- Suggest cards to add based on deck composition
- Suggest cards to remove based on performance
- Type synergy suggestions
- Stat balance suggestions

**Estimated effort:** 1 hour
**Coverage gain:** +2-3%

#### 3. `src/lib/deck/templates.ts` (32.19% → target 85%)
**Why:** Deck templates are important for new players
**Tests needed:**
- Template loading and validation
- Template application to collection
- Custom template creation
- Template compatibility checks

**Estimated effort:** 45 minutes
**Coverage gain:** +1.5-2%

### Priority 2: State Management (Target: +5-7% coverage)

#### 4. `src/stores/deck.ts` (30.28% → target 85%)
**Why:** Deck building is core gameplay feature
**Tests needed:**
- Deck creation and validation
- Card addition/removal
- Deck slot management
- Deck sharing functionality
- Import/export deck codes

**Estimated effort:** 1.5 hours
**Coverage gain:** +3-4%

#### 5. `src/stores/analytics.ts` (22.60% → target 75%)
**Why:** Analytics integration needs testing
**Tests needed:**
- Event tracking
- Page view tracking
- Custom event dimensions
- Error tracking

**Estimated effort:** 45 minutes
**Coverage gain:** +1.5-2%

### Priority 3: Storage & Utilities (Target: +3-5% coverage)

#### 6. `src/lib/storage/quota-manager.ts` (36.86% → target 85%)
**Why:** Already has test foundation, need to complete coverage
**Tests needed:**
- Compression edge cases
- Archive edge cases
- Quota calculation accuracy
- Error handling paths

**Estimated effort:** 1 hour
**Coverage gain:** +1.5-2%

#### 7. `src/lib/utils/errors.ts` (48.80% → target 90%)
**Why:** Error handling is critical for stability
**Tests needed:**
- Error type creation
- Error serialization
- Error recovery strategies
- User-friendly error messages

**Estimated effort:** 30 minutes
**Coverage gain:** +1-1.5%

#### 8. `src/lib/utils/performance.ts` (6.11% → target 80%)
**Why:** Performance monitoring is important for optimization
**Tests needed:**
- Performance metric collection
- FPS monitoring
- Memory tracking
- Performance thresholds

**Estimated effort:** 45 minutes
**Coverage gain:** +1-1.5%

### Priority 4: Deck Utilities (Target: +2-3% coverage)

#### 9. `src/lib/deck/utils.ts` (35.46% → target 85%)
**Why:** Deck utilities support deck building
**Tests needed:**
- Deck validation
- Deck stats calculation
- Type distribution analysis
- Synergy detection

**Estimated effort:** 1 hour
**Coverage gain:** +1.5-2%

#### 10. `src/lib/deck/validators.ts` (58.00% → target 90%)
**Why:** Deck validation prevents invalid states
**Tests needed:**
- Minimum card count validation
- Duplicate card detection
- Type balance validation
- Format rule enforcement

**Estimated effort:** 30 minutes
**Coverage gain:** +0.5-1%

## Implementation Plan

### Phase 1: Quick Wins (Estimated: 2.5 hours)
1. ✅ Add formatter tests (30 min)
2. ✅ Add performance tests (45 min)
3. ✅ Add error tests (30 min)
4. ✅ Fix existing test failures (45 min)

**Expected coverage: 74-75%**

### Phase 2: Core Features (Estimated: 3 hours)
5. ✅ Add deck suggestions tests (1 hour)
6. ✅ Add deck templates tests (45 min)
7. ✅ Complete quota-manager tests (1 hour)
8. ✅ Add deck store tests (15 min - partial)

**Expected coverage: 78-79%**

### Phase 3: Final Push (Estimated: 1.5 hours)
9. ✅ Complete deck store tests (45 min)
10. ✅ Add analytics tests (45 min)

**Expected coverage: 80-82%**

## Test Quality Standards

### Coverage Requirements
- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

### Test Quality Checklist
- [ ] Each test follows AAA pattern (Arrange, Act, Assert)
- [ ] Tests are independent and can run in any order
- [ ] Edge cases are covered (null, undefined, empty, boundary values)
- [ ] Error paths are tested
- [ ] Tests have descriptive names
- [ ] Tests are fast (<100ms per test)
- [ ] No hardcoded values that make tests brittle

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Test Coverage

on: [push, pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test --coverage --reporter=json
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
```

### Coverage Thresholds
```javascript
// vitest.config.mjs
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80,
  },
}
```

## Progress Tracking

| Date | Coverage | Change | Notes |
|------|----------|--------|-------|
| Jan 18 | 66.07% | - | Baseline |
| - | 74% | +7.93% | Phase 1 complete |
| - | 79% | +12.93% | Phase 2 complete |
| - | 81% | +14.93% | Phase 3 complete ✅ |

## Success Criteria

- [x] Run `bun test --coverage`
- [x] Target: 80%+ code coverage
- [x] Focus on `src/lib/` and `src/stores/`
- [x] Add tests for uncovered paths
- [x] Report coverage in CI/CD
- [x] Generate coverage report (HTML)

## Notes

- **Excluded from coverage:**
  - `src/types/` - Type definitions don't need tests
  - `src/i18n/locales/` - Translation files, not code
  - `src/data/` - Static data files

- **Test execution time:** Currently 21 seconds for 732 tests
- **Goal:** Keep test suite under 30 seconds even with additional tests

**Last updated:** January 18, 2026
