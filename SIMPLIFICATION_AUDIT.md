# Code Simplification Audit - DadDeck™ TCG

## Analysis Date
January 18, 2026

## Priority Issues Found

### 🔴 CRITICAL - Over-Engineered Areas

#### 1. **Types File (3,080 lines)**
- **File:** `src/types/index.ts`
- **Issue:** Monolithic mega-file combining all types in one place
- **Already Fixed:** Split into feature files (card.ts, pack.ts, etc.) but NOT implemented
- **Action:** Complete the type file splitting - implement feature-specific type files
- **Impact:** Faster TypeScript compilation, easier maintenance
- **Effort:** High impact, Medium effort

#### 2. **Collection Store (589 lines)**
- **File:** `src/stores/collection.ts`
- **Issues:**
  - Mixing storage abstraction (IndexedDB) with state management
  - Duplicate utility wrapper functions (`getStorageUsageInfo()`, `getQuotaInfo()`, `getQuotaStatus()`)
  - Over-engineered error handling with `showStorageError()` and `showStorageWarning()` utility calls
  - Helper functions for storage that just pass through to lib modules
- **Action:** Remove pass-through utilities, clean up storage layer separation
- **Impact:** Reduces cognitive load, clearer separation of concerns
- **Effort:** Medium impact, Low effort

#### 3. **Gallery Component (2,079 lines)**
- **File:** `src/components/collection/Gallery.svelte`
- **Issues:**
  - Multiple filter implementations (advanced search, stat ranges, holo variants, abilities)
  - Over-engineered virtual scroll with manual state management
  - URL query params scattered throughout component logic
  - Too many helper functions for simple filter operations
  - Mixing search presets with main filter logic
- **Action:** Split into sub-components, consolidate filter logic
- **Impact:** Component reusability, easier testing
- **Effort:** High impact, High effort

#### 4. **Combat Mechanics (1,144 lines)**
- **File:** `src/lib/mechanics/combat.ts`
- **Issues:**
  - Over-documented with extensive ASCII diagrams and explanations
  - Redundant comments explaining obvious code
  - Legacy status effect cases that do nothing
  - Heavy emphasis on documentation over actual complexity
- **Action:** Trim excessive documentation, consolidate legacy code
- **Impact:** Easier to scan actual logic
- **Effort:** Low impact, Low effort (documentation cleanup)

#### 5. **Settings Manager (1,328 lines)**
- **File:** `src/components/settings/SettingsManager.svelte`
- **Issues:**
  - Single monolithic component handling multiple setting categories
  - Likely needs splitting into sub-components
- **Action:** Review and split by setting category (audio, theme, gameplay, etc.)
- **Impact:** Maintainability
- **Effort:** Medium

### 🟡 HIGH - Over-Complex Patterns

#### 6. **URL Query Param Helpers**
- **Location:** Gallery.svelte (lines 92-125)
- **Issue:** Duplicate helper functions for getting/setting URL params
  - `getQueryParam()`, `getQueryParamArray()`, `setQueryParam()`, `setQueryParamArray()`
  - Each is ~5 lines, very simple
- **Action:** Create a simple URL utility or use URL API directly
- **Impact:** Reduces component bloat
- **Effort:** Low

#### 7. **Filter Application Logic**
- **Location:** Gallery.svelte lines 158-198
- **Issues:**
  - Each filter type duplicates the pattern: `if (condition) { filtered = filterBy...() }`
  - Mix of `Set<T>` and boolean flags for filter state
  - Mixing legacy holoOnly with new selectedHoloVariants logic
- **Action:** Consolidate to single filter pipeline, unify filter state pattern
- **Effort:** Low-Medium

#### 8. **Store Subscription Pattern**
- **Locations:** Multiple stores
- **Issue:** Boilerplate initialization in `if (typeof window !== 'undefined')`
- **Action:** Extract to utility function `onBrowser()` or similar
- **Effort:** Low

### 🟢 MEDIUM - Opportunities

#### 9. **Battle Arena (1,564 lines)**
- May contain complex business logic that could be split
- **Action:** Audit after critical items

#### 10. **DeckBuilder (1,296 lines)**
- Likely needs component split
- **Action:** Audit after critical items

---

## Recommended Fix Order

### Phase 1: Quick Wins (30 min)
1. **Combat.ts** - Remove redundant documentation
2. **Collection Store** - Remove pass-through utilities
3. **Gallery.svelte** - Extract URL params to utility

### Phase 2: Medium Effort (1-2 hours)
4. **Gallery.svelte** - Consolidate filter logic
5. **Identify** other monolithic components

### Phase 3: High Impact (3+ hours)
6. **Complete type file split** - Full implementation
7. **Gallery.svelte** - Component refactoring if needed

---

## Starting Point

**Next:** Begin with **Phase 1** items for immediate impact.
