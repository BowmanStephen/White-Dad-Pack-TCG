---
name: Type File Split Migration
overview: Systematically migrate ~2,900 lines from src/types/index.ts to feature-specific files, making index.ts a barrel file with re-exports only. This will improve TypeScript compilation speed and maintainability.
todos:
  - id: phase1-constants
    content: Move all constants (RARITY_CONFIG, DAD_TYPE_NAMES, STAT_NAMES, etc.) from index.ts to constants.ts
    status: completed
  - id: phase2-card-duplicates
    content: Remove duplicate card types (CardStats, Card, PackCard) from index.ts - already in card.ts
    status: completed
  - id: phase3-pack-duplicates
    content: Move batch types to pack.ts and remove all pack type duplicates from index.ts
    status: completed
  - id: phase4-collection-duplicates
    content: Consolidate collection filter types in collection.ts and remove duplicates from index.ts
    status: completed
  - id: phase5-analytics
    content: Move all analytics types (AnalyticsEvent, event interfaces, configs) to analytics.ts
    status: completed
  - id: phase6a-achievements
    content: Create achievements.ts and move achievement types from index.ts
    status: completed
  - id: phase6b-daily-rewards
    content: Create daily-rewards.ts and move daily reward types from index.ts
    status: completed
  - id: phase6c-trading
    content: Create trading.ts and move trade types from index.ts
    status: completed
  - id: phase6d-crafting
    content: Create crafting.ts and move crafting types from index.ts
    status: completed
  - id: phase6e-notifications
    content: Consolidate notification types in notifications.ts
    status: completed
  - id: phase6f-upgrade
    content: Create upgrade.ts and move upgrade types from index.ts
    status: completed
  - id: phase6g-deck
    content: Create deck.ts and move deck types from index.ts
    status: completed
  - id: phase6h-season
    content: Create season.ts and move season types from index.ts
    status: completed
  - id: phase6i-profile
    content: Create profile.ts and move profile/badge types from index.ts
    status: completed
  - id: phase6j-voting
    content: Create voting.ts and move voting types from index.ts
    status: completed
  - id: phase6k-pity
    content: Consolidate pity types in pity.ts
    status: completed
  - id: phase6l-completion
    content: Create completion.ts and move collection completion types from index.ts
    status: completed
  - id: phase6m-pack-design
    content: Move PACK_DESIGN_CONFIG to pack.ts
    status: completed
  - id: phase6n-tear-animation
    content: Move tear animation config to pack.ts
    status: completed
  - id: phase6o-battle
    content: Create battle.ts and move battle/ranked types from index.ts
    status: completed
  - id: phase6p-social
    content: Create social.ts and move friend system types from index.ts
    status: completed
  - id: phase6q-monetization
    content: Create monetization.ts and move premium pack types from index.ts
    status: completed
  - id: phase6r-events
    content: Create events.ts and move live event types from index.ts
    status: completed
  - id: phase6s-pwa
    content: Create pwa.ts and move PWA install types from index.ts
    status: completed
  - id: phase6t-wishlist
    content: Create wishlist.ts and move wishlist types from index.ts
    status: completed
  - id: phase6u-data-management
    content: Create data-management.ts and move data clearing types from index.ts
    status: completed
  - id: phase7-barrel-file
    content: Transform index.ts into barrel file with re-exports only (~100-150 lines)
    status: completed
  - id: phase8-update-imports
    content: Update all files importing from @/types (verify no breaking changes)
    status: completed
  - id: phase9-circular-deps
    content: Fix circular dependencies (core.ts importing from index.ts)
    status: completed
  - id: phase10-testing
    content: Run full test suite and verify build succeeds - all 562 tests passing
    status: completed
---

# Type File Split Migration Plan

## Current State

- `src/types/index.ts`: ~3,096 lines, 226 exports
- Feature files exist but contain duplicates from `index.ts`
- Goal: Reduce `index.ts` to ~200 lines (re-exports only)

## Migration Strategy

### Phase 1: Move Constants to `constants.ts`

**Target:** Lines 238-571 in `index.ts`

**Move to `src/types/constants.ts`:**

- `RARITY_ORDER` (lines 238-245)
- `RARITY_CONFIG` (lines 271-320)
- `RARITY_DROP_RATES` (lines 328-370)
- `HOLO_VARIANT_DESCRIPTIONS` (lines 374-436)
- `HOLO_DROP_RATE` (lines 439-443)
- `DAD_TYPE_NAMES` (lines 447-489)
- `DAD_TYPE_ICONS` (lines 493-535)
- `STAT_NAMES` (lines 538-547)
- `STAT_ICONS` (lines 550-559)
- `STAT_DESCRIPTIONS` (lines 562-571)
- `SORT_OPTION_CONFIG` (lines 259-268)
- `HOLO_VARIANT_NAMES` (lines 983-989)
- `HOLO_VARIANT_ICONS` (lines 992-998)

**Dependencies:** Import `Rarity`, `DadType`, `HoloVariant`, `CardStats` from feature files

**Testing:** Verify constants are accessible via `@/types` imports

---

### Phase 2: Move Card Types to `card.ts`

**Target:** Lines 7-80 in `index.ts` (duplicates)

**Already in `card.ts` but need to remove from `index.ts`:**

- `CinematicConfig` (move to `core.ts` instead)
- `CardStats` (already in `card.ts`)
- `CardAbility` (already in `card.ts`)
- `CardEffect` (already in `card.ts`)
- `CardAttribute` (already in `card.ts`)
- `Card` (already in `card.ts`)
- `PackCard` (already in `card.ts`)
- `CollectionDisplayCard` (already in `card.ts`)

**Action:** Remove duplicates from `index.ts`, add re-exports

---

### Phase 3: Move Pack Types to `pack.ts`

**Target:** Lines 82-177 in `index.ts` (duplicates)

**Already in `pack.ts` but need to remove from `index.ts`:**

- `PackConfig` (already in `pack.ts`)
- `RaritySlot` (already in `pack.ts`)
- `Pack` (already in `pack.ts`)
- `PackState` (already in `pack.ts`)
- `PackDesign` (already in `pack.ts`)
- `TearAnimation` (already in `pack.ts`)
- `BatchState`, `BatchConfig`, `BatchProgress`, `BatchSummary` (lines 129-162)
- `PackDesignConfig` (lines 165-177)

**Action:** Move batch types to `pack.ts`, remove all duplicates from `index.ts`

---

### Phase 4: Move Collection Types to `collection.ts`

**Target:** Lines 179-225, 947-980 in `index.ts`

**Already in `collection.ts`:**

- `CollectionMetadata` (already in `collection.ts`)
- `Collection` (already in `collection.ts`)
- `CollectionState` (already in `collection.ts`)
- `CollectionStats` (already in `collection.ts`)
- `UIState` (already in `collection.ts`)

**Move to `collection.ts`:**

- `StatRangeFilter` (lines 947-950) - already exists, remove duplicate
- `StatRanges` (lines 953-962)
- `AdvancedSearchFilters` (lines 965-971)
- `SavedSearchPreset` (lines 974-980)

**Action:** Remove duplicates, consolidate in `collection.ts`

---

### Phase 5: Move Analytics Types to `analytics.ts`

**Target:** Lines 574-797 in `index.ts`

**Move to `src/types/analytics.ts`:**

- `AnalyticsEventType` (lines 578-595)
- `SharePlatform` (line 598)
- `AnalyticsEvent` (lines 601-606)
- All event interfaces (PackOpenEvent, CardRevealEvent, etc.) (lines 609-755)
- `AnyAnalyticsEvent` (lines 742-755)
- `AnalyticsConfig` (lines 758-773)
- `AnalyticsProvider` (lines 776-782)
- `EventQueue` (lines 785-788)
- `AnalyticsSession` (lines 791-796)

**Dependencies:** Import `Rarity`, `HoloVariant`, `SortOption` from feature files

---

### Phase 6: Move Feature Types to New Files

#### 6a. Create `src/types/achievements.ts`

**Target:** Lines 799-895 in `index.ts`

**Move:**

- `AchievementRarity` (line 803)
- `AchievementCategory` (line 806)
- `Achievement` (lines 809-819)
- `AchievementState` (lines 822-825)
- `AchievementContext` (lines 828-832)
- `AchievementConfig` (lines 835-844)
- `AchievementRarityConfig` (lines 847-853)
- `ACHIEVEMENT_RARITY_CONFIG` (lines 856-885)
- `ACHIEVEMENT_CATEGORY_NAMES` (lines 888-895)

**Dependencies:** Import `Pack`, `Collection`, `CollectionStats` from feature files

#### 6b. Create `src/types/daily-rewards.ts`

**Target:** Lines 898-940 in `index.ts`

**Move:**

- `DailyRewardType` (line 902)
- `DailyReward` (lines 905-912)
- `DailyRewardsState` (lines 915-924)
- `DailyRewardTier` (lines 927-933)
- `StreakBonus` (lines 936-940)

#### 6c. Move Trading Types to `src/types/trading.ts` (new file)

**Target:** Lines 1001-1060 in `index.ts`

**Move:**

- `TradeStatus` (line 1005)
- `TradeOffer` (lines 1008-1017)
- `TradeCard` (lines 1020-1027)
- `TradeHistoryEntry` (lines 1030-1037)
- `TradeState` (lines 1040-1045)
- `TradeConfig` (lines 1048-1052)
- `DEFAULT_TRADE_CONFIG` (lines 1055-1059)

#### 6d. Move Crafting Types to `src/types/crafting.ts` (new file)

**Target:** Lines 1062-1192 in `index.ts`

**Move:**

- `CraftingState` (lines 1066-1072)
- `CraftingRecipe` (lines 1075-1085)
- `CraftingSession` (lines 1088-1096)
- `CraftingHistoryEntry` (lines 1099-1107)
- `CraftingHistory` (lines 1110-1116)
- `CraftingConfig` (lines 1119-1123)
- `DEFAULT_CRAFTING_CONFIG` (lines 1126-1130)
- `CRAFTING_RECIPES` (lines 1138-1192)

**Dependencies:** Import `Rarity`, `PackCard` from feature files

#### 6e. Move Notification Types to `notifications.ts`

**Target:** Lines 1214-1296 in `index.ts`

**Already exists:** `src/types/notifications.ts` - check for duplicates

**Move/Consolidate:**

- `NotificationType` (line 1215)
- `NotificationCategory` (line 1218)
- `Notification` (lines 1221-1234)
- `NotificationAction` (lines 1237-1242)
- `NotificationPreferences` (lines 1245-1262)
- `NotificationState` (lines 1265-1269)
- `PushNotificationPayload` (lines 1272-1286)
- `PushSubscription` (lines 1290-1296)

#### 6f. Create `src/types/upgrade.ts`

**Target:** Lines 1299-1351 in `index.ts`

**Move:**

- `UpgradedCard` (lines 1303-1306)
- `UpgradeEntry` (lines 1309-1316)
- `UpgradeState` (lines 1319-1331)
- `CardUpgradeData` (lines 1334-1337)
- `UpgradeConfig` (lines 1340-1344)
- `DEFAULT_UPGRADE_CONFIG` (lines 1347-1351)

**Dependencies:** Import `PackCard`, `CardStats` from feature files

#### 6g. Create `src/types/deck.ts`

**Target:** Lines 1354-1409 in `index.ts`

**Move:**

- `DeckCard` (lines 1358-1362)
- `DeckStats` (lines 1365-1372)
- `Deck` (lines 1375-1383)
- `DeckState` (lines 1386-1390)
- `DeckValidation` (lines 1393-1397)
- `DeckExport` (lines 1400-1409)

**Dependencies:** Import `Card`, `Rarity`, `DadType`, `CardStats` from feature files

#### 6h. Create `src/types/season.ts`

**Target:** Lines 1412-1542 in `index.ts`

**Move:**

- `SeasonId` (line 1416) - already in `card.ts`, move to `season.ts`
- `SeasonStatus` (line 1419)
- `Season` (lines 1422-1434)
- `SeasonPackDesign` (lines 1437-1442)
- `SeasonTheme` (lines 1445-1453)
- `SeasonLaunchEvent` (lines 1456-1463)
- `SeasonBonus` (lines 1466-1470)
- `SeasonState` (lines 1473-1479)
- `SeasonConfig` (lines 1482-1486)
- `DEFAULT_SEASON_CONFIG` (lines 1489-1493)
- `SEASON_PACK_CONFIG` (lines 1496-1542)

**Dependencies:** Import `PackDesign` from `pack.ts`

#### 6i. Create `src/types/profile.ts`

**Target:** Lines 1545-1837 in `index.ts`

**Move:**

- `AvatarId` (lines 1549-1559)
- `Avatar` (lines 1562-1567)
- `BadgeRarity` (line 1570)
- `BadgeCategory` (line 1573)
- `Badge` (lines 1576-1586)
- `PlayerProfile` (lines 1589-1601)
- `ProfileSettings` (lines 1604-1609)
- `ProfileViewMode` (line 1612)
- `ProfileState` (lines 1615-1620)
- `AVATARS` (lines 1623-1684)
- `BadgeRarityConfig` (lines 1687-1693)
- `BADGE_RARITY_CONFIG` (lines 1696-1725)
- `BADGE_CATEGORY_NAMES` (lines 1728-1734)
- `PROFILE_BADGES` (lines 1737-1837)

#### 6j. Create `src/types/voting.ts`

**Target:** Lines 1840-1920 in `index.ts`

**Move:**

- `VotingStatus` (line 1844)
- `CardConcept` (lines 1847-1858)
- `VotingEvent` (lines 1861-1871)
- `Vote` (lines 1874-1879)
- `VotingHistoryEntry` (lines 1882-1891)
- `VotingState` (lines 1894-1902)
- `VotingConfig` (lines 1905-1911)
- `DEFAULT_VOTING_CONFIG` (lines 1914-1920)

**Dependencies:** Import `DadType`, `Rarity`, `CardStats`, `CardAbility`, `SeasonId` from feature files

#### 6k. Move Pity Types to `pity.ts`

**Target:** Lines 1923-2015 in `index.ts`

**Already exists:** `src/types/pity.ts` - check for duplicates

**Move/Consolidate:**

- `PityCounter` (lines 1940-1946)
- `PityThresholds` (lines 1949-1970)
- `DEFAULT_PITY_THRESHOLDS` (lines 1973-1994)
- `PityState` (lines 1997-2015)

#### 6l. Create `src/types/completion.ts`

**Target:** Lines 2018-2181 in `index.ts`

**Move:**

- `CompletionMilestone` (lines 2029-2034)
- `CompletionReward` (lines 2037-2042)
- `RarityCompletion` (lines 2045-2052)
- `TypeCompletion` (lines 2055-2061)
- `CollectionCompletion` (lines 2064-2085)
- `CompletionConfig` (lines 2088-2093)
- `DEFAULT_COMPLETION_CONFIG` (lines 2096-2101)
- `COMPLETION_MILESTONES` (lines 2104-2129)
- `RARITY_COMPLETION_MILESTONES` (lines 2132-2181)

**Dependencies:** Import `Rarity`, `DadType` from feature files

#### 6m. Move Pack Design Config to `pack.ts`

**Target:** Lines 2184-2295 in `index.ts`

**Move:**

- `PACK_DESIGN_CONFIG` (lines 2189-2295)

**Already in `pack.ts`:** `PackDesignConfig` interface

#### 6n. Move Tear Animation Config to `pack.ts`

**Target:** Lines 2298-2372 in `index.ts`

**Move:**

- `TearAnimationConfig` (lines 2302-2314)
- `TEAR_ANIMATION_CONFIG` (lines 2318-2358)
- `selectRandomTearAnimation` function (lines 2361-2372)

**Already in `pack.ts`:** `TearAnimation` type

#### 6o. Create `src/types/battle.ts`

**Target:** Lines 2375-2558 in `index.ts`

**Move:**

- `BattleState` (lines 2379-2383)
- `BattleMode` (line 2386)
- `BattleFormat` (line 2389)
- `BattleSlot` (line 2392)
- `BattleCard` (lines 2395-2401)
- `BattleTeam` (lines 2404-2408)
- `BattleResult` (lines 2411-2420)
- `BattleLogEntry` (lines 2423-2429)
- `BattleAction` (lines 2432-2437)
- `BattleRewards` (lines 2440-2444)
- `BattleHistoryEntry` (lines 2447-2453)
- `RankedSeason` (lines 2456-2460)
- `PlayerRankedData` (lines 2463-2471)
- `RankedTier` (lines 2474-2480)
- `RankedTierConfig` (lines 2483-2490)
- `BattleConfig` (lines 2493-2498)
- `DEFAULT_BATTLE_CONFIG` (lines 2501-2506)
- `RANKED_TIERS` (lines 2509-2558)

**Dependencies:** Import `PackCard`, `SeasonId` from feature files

#### 6p. Create `src/types/social.ts`

**Target:** Lines 2561-2703 in `index.ts`

**Move:**

- `FriendRequestStatus` (line 2565)
- `FriendActivityType` (lines 2568-2578)
- `FriendRequest` (lines 2581-2591)
- `FriendProfile` (lines 2594-2605)
- `FriendActivity` (lines 2608-2616)
- `FriendActivityDetails` (lines 2619-2643)
- `FriendCollectionView` (lines 2646-2656)
- `FriendState` (lines 2661-2668)
- `FriendCode` (line 2671)
- `FriendConfig` (lines 2674-2680)
- `DEFAULT_FRIEND_CONFIG` (lines 2683-2689)
- `FRIEND_ACTIVITY_CONFIG` (lines 2692-2703)

**Dependencies:** Import `AvatarId`, `Rarity`, `PackCard`, `Badge` from feature files

#### 6q. Create `src/types/monetization.ts`

**Target:** Lines 2706-2805 in `index.ts`

**Move:**

- `PackType` (line 2710) - already in `pack.ts`, remove duplicate
- `PremiumPackConfig` (lines 2713-2724)
- `PremiumRaritySlot` (lines 2727-2729)
- `PurchaseSession` (lines 2732-2742)
- `PremiumPackInventory` (lines 2745-2750)
- `PREMIUM_PACK_CONFIGS` (lines 2753-2766)
- `PREMIUM_PACK_RARITY_SLOTS` (lines 2769-2795)
- `PREMIUM_PACK_VISUAL_CONFIG` (lines 2798-2805)

**Dependencies:** Import `PackType`, `RaritySlot`, `Rarity` from feature files

#### 6r. Create `src/types/events.ts`

**Target:** Lines 2825-3012 in `index.ts`

**Move:**

- `EventStatus` (line 2829)
- `EventType` (lines 2832-2837)
- `EventCurrencyType` (line 2840)
- `LiveEvent` (lines 2843-2876)
- `EventBonus` (lines 2879-2884)
- `EventTheme` (lines 2887-2897)
- `EventShopItem` (lines 2900-2925)
- `EventCurrencyBalance` (lines 2928-2934)
- `EventProgress` (lines 2937-2946)
- `EventState` (lines 2949-2956)
- `EventConfig` (lines 2959-2967)
- `DEFAULT_EVENT_CONFIG` (lines 2970-2978)
- `EVENT_THEMES` (lines 2981-3012)

**Dependencies:** Import `Rarity`, `PackDesign` from feature files

#### 6s. Create `src/types/pwa.ts`

**Target:** Lines 3015-3043 in `index.ts`

**Move:**

- `BeforeInstallPromptEvent` (lines 3019-3027)
- `PWAInstallState` (lines 3030-3035)
- `PWAInstallTracking` (lines 3038-3043)

#### 6t. Create `src/types/wishlist.ts`

**Target:** Lines 3046-3081 in `index.ts`

**Move:**

- `WishlistPriority` (line 3050)
- `WishlistEntry` (lines 3053-3061)
- `Wishlist` (lines 3064-3067)
- `DEFAULT_WISHLIST` (lines 3070-3073)
- `WISHLIST_PRIORITY_ORDER` (lines 3076-3081)

**Dependencies:** Import `Rarity`, `DadType` from feature files

#### 6u. Create `src/types/data-management.ts`

**Target:** Lines 3087-3096 in `index.ts`

**Move:**

- `ClearDataResult` (lines 3091-3096)

---

### Phase 7: Update `index.ts` to Barrel File

**Target:** Transform `index.ts` to re-exports only

**Structure:**

```typescript
// Core types
export type { Rarity, DadType, HoloVariant, CinematicMode } from './core';
export type { CinematicConfig } from './core';

// Card types
export type { Card, PackCard, CollectionDisplayCard, CardStats, CardAbility, CardEffect, CardAttribute } from './card';
export type { SeasonId } from './season';

// Pack types
export type { Pack, PackConfig, PackState, PackDesign, PackType, TearAnimation, RaritySlot } from './pack';
export type { BatchState, BatchConfig, BatchProgress, BatchSummary, PackDesignConfig } from './pack';
export { PACK_DESIGN_CONFIG, TEAR_ANIMATION_CONFIG, selectRandomTearAnimation } from './pack';

// Collection types
export type { Collection, CollectionMetadata, CollectionState, CollectionStats, UIState } from './collection';
export type { StatRangeFilter, StatRanges, AdvancedSearchFilters, SearchPreset } from './collection';

// Constants
export * from './constants';

// Feature types (re-export all)
export * from './analytics';
export * from './achievements';
export * from './daily-rewards';
export * from './trading';
export * from './crafting';
export * from './notifications';
export * from './upgrade';
export * from './deck';
export * from './season';
export * from './profile';
export * from './voting';
export * from './pity';
export * from './completion';
export * from './battle';
export * from './social';
export * from './monetization';
export * from './events';
export * from './pwa';
export * from './wishlist';
export * from './data-management';
export * from './security';
```

**Estimated size:** ~100-150 lines

---

### Phase 8: Update All Imports

**Target:** Update ~22 files that import from `@/types`

**Files to update:**

- `src/lib/storage/quota-manager.ts`
- `src/lib/storage/indexeddb.ts`
- `src/lib/storage/data-manager.ts`
- `src/stores/analytics/providers/ga.ts`
- `src/stores/analytics/providers/plausible.ts`
- `src/stores/notifications.ts`
- `src/lib/jokes/index.ts`
- `src/lib/utils/migrations.ts`
- `src/lib/utils/haptics.ts`
- `src/lib/validation/data-validator.ts`
- `src/components/card/Card3DFlip.stories.ts`
- Plus any archived files in `src/_archived/`

**Strategy:**

1. Keep `import { Type } from '@/types'` - barrel file handles routing
2. Only update if specific imports needed (e.g., `import { Card } from '@/types/card'`)

**Testing:** Verify no import errors after updates

---

### Phase 9: Fix Circular Dependencies

**Potential issues:**

- `core.ts` imports from `index.ts` (line 281) - needs to import from `pack.ts` instead
- Feature files importing from `index.ts` - update to direct imports

**Check:**

- `src/types/core.ts` line 281: `import { TEAR_ANIMATION_CONFIG, selectRandomTearAnimation, type TearAnimation } from './index';`
  - **Fix:** Import from `./pack` instead

---

### Phase 10: Testing & Verification

**After each phase:**

1. Run `bun run build` - verify no TypeScript errors
2. Run `bun test` - verify all tests pass
3. Check for circular dependency warnings
4. Verify imports work correctly

**Final verification:**

1. TypeScript compilation succeeds
2. All 562 tests pass
3. No circular dependencies
4. `index.ts` is ~100-150 lines (barrel file only)
5. All types accessible via `@/types` imports

---

## Execution Order

1. **Phase 1** - Constants (foundation)
2. **Phase 2-4** - Remove duplicates (card, pack, collection)
3. **Phase 5** - Analytics (self-contained)
4. **Phase 6** - Feature types (can be parallel)
5. **Phase 7** - Create barrel file
6. **Phase 8** - Update imports
7. **Phase 9** - Fix circular dependencies
8. **Phase 10** - Final testing

---

## Risk Mitigation

- **Backward compatibility:** Keep `@/types` imports working via barrel file
- **Incremental testing:** Test after each phase
- **Git commits:** Commit after each successful phase
- **Rollback plan:** Each phase is reversible via git

---

## Estimated Time

- **Phase 1-4:** 1 hour (constants + duplicate removal)
- **Phase 5:** 30 minutes (analytics)
- **Phase 6:** 2-3 hours (feature types - 20+ files)
- **Phase 7:** 15 minutes (barrel file)
- **Phase 8:** 30 minutes (import updates)
- **Phase 9:** 15 minutes (circular deps)
- **Phase 10:** 30 minutes (testing)

**Total:** ~4-5 hours for complete migration