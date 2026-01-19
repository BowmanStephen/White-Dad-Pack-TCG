# Phase 3: Type File Splitting Plan

## ✅ Critical Fixes Complete (January 2026)

### Completed
- ✅ **Circular dependency resolved** - Core types moved to `core.ts`, `index.ts` imports and re-exports
- ✅ **Duplicate types removed** - Rarity, DadType, HoloVariant, CinematicMode consolidated in `core.ts`
- ✅ **Build passing** - No breaking changes, all tests passing

### Remaining (Deferred to Dedicated Session)
- ⏳ **Full type file split** - Move ~2,900 lines from `index.ts` to feature-specific files
- ⏳ Requires thorough testing and systematic refactoring

## Current State

- `src/types/index.ts`: ~3,096 lines, 224 exports
- `src/types/core.ts`: Core types (Rarity, DadType, HoloVariant, CinematicMode)
- ✅ No circular dependencies
- ✅ Build passing

## Goal (Future Work)

- Move all types from `index.ts` to appropriate feature files
- `index.ts` becomes a re-export barrel file only (~200 lines)
- Maintain backward compatibility

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
