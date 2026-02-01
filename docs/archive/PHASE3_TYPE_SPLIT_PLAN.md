# Phase 3: Type File Splitting Plan

## ✅ ALL WORK COMPLETE (January 2026)

### Completed
- ✅ **Circular dependency resolved** - Core types moved to `core.ts`, `index.ts` imports and re-exports
- ✅ **Duplicate types removed** - Rarity, DadType, HoloVariant, CinematicMode consolidated in `core.ts`
- ✅ **Full type file split complete** - Reduced `index.ts` from 3,096 → 105 lines (97% reduction!)
- ✅ All types organized into 27 feature-specific files
- ✅ Barrel file pattern implemented (clean re-exports only)
- ✅ No circular dependencies
- ✅ Build passing (6 pages, ~10.87s)
- ✅ All 562 tests passing
- ✅ Fixed SSR issue in CollectionStats (DAD_TYPE_COLORS fallback)

## Final State

- `src/types/index.ts`: **105 lines** (barrel file with re-exports only)
- `src/types/core.ts`: Core types (Rarity, DadType, HoloVariant, CinematicMode)
- **27 feature-specific type files** organized by domain:
  - Core: `core.ts`, `card.ts`, `pack.ts`, `collection.ts`, `constants.ts`
  - Features: `analytics.ts`, `achievements.ts`, `daily-rewards.ts`, `trading.ts`, `crafting.ts`, `notifications.ts`, `upgrade.ts`, `deck.ts`, `season.ts`, `profile.ts`, `voting.ts`, `pity.ts`, `completion.ts`, `battle.ts`, `social.ts`, `monetization.ts`, `events.ts`, `pwa.ts`, `wishlist.ts`, `data-management.ts`, `security.ts`
- ✅ No circular dependencies
- ✅ Build passing
- ✅ All tests passing

## Achievement Summary

**Impact:**
- **Lines reduced:** 3,096 → 105 lines (97% reduction)
- **File organization:** Single monolithic file → 27 organized feature files
- **TypeScript compilation:** Faster (smaller files to parse)
- **Maintainability:** Much better (types organized by feature)
- **No breaking changes:** All existing imports via `@/types` still work

## File Organization

### Core Types (`core.ts`)
- Rarity, DadType, HoloVariant, CinematicMode (already there)
- CinematicConfig

### Card Types (`card.ts`)
- Card, PackCard, CollectionDisplayCard
- CardStats, CardAbility, CardEffect, CardAttribute
- SeasonId (or move to season.ts if exists)

### Pack Types (`pack.ts`)
- Pack, PackConfig, PackState, PackDesign
- RaritySlot, BatchState, BatchConfig, BatchProgress, BatchSummary
- PackDesignConfig, TearAnimation, PackType

### Collection Types (`collection.ts`)
- Collection, CollectionMetadata, CollectionState, CollectionStats
- UIState, StatRangeFilter, AdvancedCollectionFilters, SearchPreset

### Constants (`constants.ts`)
- RARITY_CONFIG, RARITY_ORDER, SORT_OPTION_CONFIG
- DAD_TYPE_NAMES, DAD_TYPE_ICONS
- STAT_NAMES, STAT_ICONS, STAT_DESCRIPTIONS
- HOLO_VARIANT_NAMES, HOLO_VARIANT_ICONS, HOLO_VARIANT_DESCRIPTIONS
- RARITY_DROP_RATES, HOLO_DROP_RATE
- MIN_DECK_SIZE, MAX_DECK_SIZE, etc.

### Analytics Types (`analytics.ts`)
- AnalyticsEventType, AnalyticsEvent
- PackOpenEvent, CardRevealEvent, etc.
- SharePlatform

### Other Feature Files
- `notifications.ts` - Notification types
- `security.ts` - Security types
- `pity.ts` - Pity counter types (already exists)

## Execution Steps

1. Fix circular dependencies first
2. Move types to feature files
3. Update index.ts to re-export only
4. Update all imports across codebase
5. Verify build and tests

## Estimated Impact

- **Lines reduced in index.ts:** ~2,900 lines → ~200 lines (re-exports only)
- **TypeScript compilation:** Faster (smaller files to parse)
- **Maintainability:** Much better (types organized by feature)
