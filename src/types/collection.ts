import type { Rarity } from './core';
import type { PackCard, CardStats } from './card';
import type { Pack, PackState, PackDesign } from './pack';

// Pity counter state (PACK-003)
export interface PityCounter {
  rare: number;      // Packs since last rare
  epic: number;      // Packs since last epic
  legendary: number; // Packs since last legendary
  mythic: number;    // Packs since last mythic
}

// PACK-030: Streak counter state
export interface StreakCounter {
  current: number;  // Current consecutive rare+ streak
  best: number;     // Best streak ever achieved
}

// Collection Metadata - Statistics about user's collection
export interface CollectionMetadata {
  totalPacksOpened: number;
  lastOpenedAt: Date | null;
  uniqueCards: string[];
  rarePulls: number;
  holoPulls: number;
  created?: Date;
  rarityCounts?: Record<Rarity, number>;
  pityCounter?: PityCounter; // PACK-003: Pity system state
  streakCounter?: StreakCounter; // PACK-030: Streak tracking
}

// Collection - All packs owned by user
export interface Collection {
  packs: Pack[];
  metadata: CollectionMetadata;
}

// Collection State - Reactive state for collection UI
export interface CollectionState {
  openedPacks: Pack[];
  uniqueCards: string[];
  totalCards: number;
  rarityCounts: Record<Rarity, number>;
}

// Collection Stats - Computed statistics
export interface CollectionStats {
  totalPacks: number;
  totalCards: number;
  uniqueCards: number;
  rarePulls: number;
  epicPulls: number;
  legendaryPulls: number;
  mythicPulls: number;
  holoPulls: number;
  lastOpenedAt: Date | null;
}

// UI State
export interface UIState {
  currentCardIndex: number;
  packState: PackState;
  isSkipping: boolean;
  showResults: boolean;
}

// Advanced collection filters (PACK-021)
export interface StatRangeFilter {
  stat: keyof CardStats;
  min: number;
  max: number;
}

export type AbilitiesFilterMode = 'any' | 'all' | 'none';

export type HoloFilterMode = 'all' | 'holoOnly' | 'nonHoloOnly';

export interface AdvancedCollectionFilters {
  statRanges: StatRangeFilter[];
  abilitiesMode: AbilitiesFilterMode;
  holoMode: HoloFilterMode;
}

// Search preset (PACK-021)
export interface SearchPreset {
  id: string;
  name: string;
  filters: AdvancedCollectionFilters;
  createdAt: Date;
}
