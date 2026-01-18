import type { Rarity, DadType, PackCard } from './card';

// Pack Configuration
export interface PackConfig {
  cardsPerPack: number;
  raritySlots: RaritySlot[];
  holoChance: number;
}

// Rarity Slot Configuration
export interface RaritySlot {
  slot: number;
  guaranteedRarity?: Rarity;
  rarityPool?: boolean;
  probability?: Partial<Record<Rarity, number>>;
}

// Pack State
export interface Pack {
  id: string;
  cards: PackCard[];
  openedAt: Date;
  bestRarity: Rarity;
  design: PackDesign;
}

// Animation State
export type PackState =
  | 'idle'
  | 'generating'
  | 'pack_animate'
  | 'cards_ready'
  | 'revealing'
  | 'results';

// Pack Design Types (US068 - Pack Designs - Visual Variety)
export type PackDesign = 'standard' | 'holiday' | 'premium' | SeasonPackDesign;

// Season pack design (extends base PackDesign)
export type SeasonPackDesign =
  | 'base_set'
  | 'summer_bbq'
  | 'fall_foliage'
  | 'winter_wonderland'
  | 'spring_bloom';

// ============================================================================
// BATCH PACK OPENING TYPES (US076 - Batch Actions - Open Multiple Packs)
// ============================================================================

// Batch state machine
export type BatchState =
  | 'idle'
  | 'preparing'
  | 'opening'
  | 'paused'
  | 'complete'
  | 'reviewing';

// Batch configuration
export interface BatchConfig {
  totalPacks: number;
  fastForward: boolean;
  autoSave: boolean;
}

// Batch progress tracking
export interface BatchProgress {
  currentPack: number;
  totalPacks: number;
  cardsOpened: number;
  totalCards: number;
  percentage: number;
}

// Batch result summary
export interface BatchSummary {
  packsOpened: number;
  totalCards: number;
  rarityBreakdown: Record<Rarity, number>;
  holoCount: number;
  bestPulls: PackCard[];
  duration: number;
  timestamp: Date;
}

// Pack Design Configuration
export interface PackDesignConfig {
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  borderColor: string;
  gradientStart: string;
  gradientEnd: string;
  pattern: string;
  probability: number;
  animationVariant: 'standard' | 'festive' | 'golden';
}
