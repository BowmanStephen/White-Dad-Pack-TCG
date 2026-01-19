// ============================================================================
// TYPE BARREL FILE - Re-exports all types from feature-specific files
// ============================================================================
// This file serves as a single entry point for importing types via @/types
// All types are organized in feature-specific files for better maintainability
// ============================================================================

// Core types (Rarity, DadType, HoloVariant, CinematicMode, CinematicConfig)
export type { Rarity, DadType, HoloVariant, CinematicMode, CinematicConfig } from './core';

// Card types
export type {
  Card,
  PackCard,
  CollectionDisplayCard,
  CardStats,
  CardAbility,
  CardEffect,
  CardAttribute,
} from './card';

// Pack types
export type {
  Pack,
  PackConfig,
  PackState,
  PackDesign,
  PackType,
  TearAnimation,
  RaritySlot,
  BatchState,
  BatchConfig,
  BatchProgress,
  BatchSummary,
  PackDesignConfig,
  TearAnimationConfig,
} from './pack';
export {
  PACK_DESIGN_CONFIG,
  TEAR_ANIMATION_CONFIG,
  selectRandomTearAnimation,
} from './pack';

// Collection types
export type {
  Collection,
  CollectionMetadata,
  CollectionState,
  CollectionStats,
  UIState,
  StatRangeFilter,
  StatRangeFilterSimple,
  StatRanges,
  AdvancedSearchFilters,
  SavedSearchPreset,
  SearchPreset,
  AdvancedCollectionFilters,
  AbilitiesFilterMode,
  HoloFilterMode,
  PityCounter,
  StreakCounter,
} from './collection';

// Season types
export type {
  SeasonId,
  Season,
  SeasonStatus,
  SeasonPackDesign,
  SeasonTheme,
  SeasonLaunchEvent,
  SeasonBonus,
  SeasonState,
  SeasonConfig,
} from './season';
export { DEFAULT_SEASON_CONFIG, SEASON_PACK_CONFIG } from './season';

// Constants
export * from './constants';

// Analytics types
export * from './analytics';

// Feature types
export * from './achievements';
export * from './daily-rewards';
export * from './trading';
export * from './crafting';
export * from './notifications';
export * from './upgrade';
export * from './deck';
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

// Security types
export * from './security';
