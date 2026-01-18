import type { Rarity, PackCard } from './card';

// Pity counter state (PACK-003)
export interface PityCounter {
  rare: number;      // Packs since last rare
  epic: number;      // Packs since last epic
  legendary: number; // Packs since last legendary
  mythic: number;    // Packs since last mythic
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

// Pack State type
export type PackState =
  | 'idle'
  | 'generating'
  | 'pack_animate'
  | 'cards_ready'
  | 'revealing'
  | 'results';

// Pack interface
export interface Pack {
  id: string;
  cards: PackCard[];
  openedAt: Date;
  bestRarity: Rarity;
  design: PackDesign;
}

// Pack Design type
export type PackDesign = 'standard' | 'holiday' | 'premium' | SeasonPackDesign;

// Season pack design
export type SeasonPackDesign =
  | 'base_set'
  | 'summer_bbq'
  | 'fall_foliage'
  | 'winter_wonderland'
  | 'spring_bloom';
