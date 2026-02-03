import type { Rarity, DadType } from './core';
import type { PackCard } from './card';
import type { SeasonPackDesign } from './season';

// Pack Configuration
export interface PackConfig {
  cardsPerPack: number;
  raritySlots: RaritySlot[];
  holoChance: number;
  packType?: PackType;
  themeType?: DadType; // For theme packs - specific dad type to filter by (PACK-001)
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
  tearAnimation?: TearAnimation;
}

// Animation State
// MVP flow: idle → generating → pack_animate → results
export type PackState =
  | 'idle'
  | 'generating'
  | 'pack_animate'
  | 'results';

// Pack Design Types (US068 - Pack Designs - Visual Variety)
export type PackDesign = 'standard' | 'holiday' | 'premium' | SeasonPackDesign;

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

// Pack Type
export type PackType = 'standard' | 'premium' | 'theme';

// Tear Animation Types (PACK-027 - Pack Tear Variations)
export type TearAnimation = 'standard' | 'slow' | 'explosive';

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

// Pack Design Configurations
// Distribution: 80% standard, 15% holiday, 5% premium
export const PACK_DESIGN_CONFIG: Record<PackDesign, PackDesignConfig> = {
  standard: {
    name: 'Standard Pack',
    description: 'The classic blue booster pack',
    primaryColor: '#1e40af', // blue-700
    secondaryColor: '#1e3a8a', // blue-900
    accentColor: '#fbbf24', // amber-400
    borderColor: 'rgba(30, 64, 175, 0.5)',
    gradientStart: '#1e40af',
    gradientEnd: '#1e3a8a',
    pattern: 'standard',
    probability: 0.80,
    animationVariant: 'standard',
  },
  holiday: {
    name: 'Holiday Pack',
    description: 'Festive seasonal edition',
    primaryColor: '#dc2626', // red-600
    secondaryColor: '#991b1b', // red-900
    accentColor: '#22c55e', // green-500
    borderColor: 'rgba(220, 38, 38, 0.5)',
    gradientStart: '#dc2626',
    gradientEnd: '#991b1b',
    pattern: 'holiday',
    probability: 0.15,
    animationVariant: 'festive',
  },
  premium: {
    name: 'Premium Pack',
    description: 'Gold foil rare edition',
    primaryColor: '#ca8a04', // yellow-600
    secondaryColor: '#854d0e', // yellow-900
    accentColor: '#fef08a', // yellow-200
    borderColor: 'rgba(202, 138, 4, 0.5)',
    gradientStart: '#ca8a04',
    gradientEnd: '#854d0e',
    pattern: 'premium',
    probability: 0.05,
    animationVariant: 'golden',
  },
  // Season pack designs (US086)
  base_set: {
    name: 'Base Set Pack',
    description: 'Original dad collection',
    primaryColor: '#1e40af',
    secondaryColor: '#1e3a8a',
    accentColor: '#fbbf24',
    borderColor: 'rgba(30, 64, 175, 0.5)',
    gradientStart: '#1e40af',
    gradientEnd: '#1e3a8a',
    pattern: 'base_set',
    probability: 0,
    animationVariant: 'standard',
  },
  summer_bbq: {
    name: 'Summer BBQ Pack',
    description: 'Grill master dad collection',
    primaryColor: '#dc2626',
    secondaryColor: '#991b1b',
    accentColor: '#fbbf24',
    borderColor: 'rgba(220, 38, 38, 0.5)',
    gradientStart: '#dc2626',
    gradientEnd: '#991b1b',
    pattern: 'summer_bbq',
    probability: 0,
    animationVariant: 'festive',
  },
  fall_foliage: {
    name: 'Fall Foliage Pack',
    description: 'Autumn dad collection',
    primaryColor: '#d97706',
    secondaryColor: '#92400e',
    accentColor: '#fbbf24',
    borderColor: 'rgba(217, 119, 6, 0.5)',
    gradientStart: '#d97706',
    gradientEnd: '#92400e',
    pattern: 'fall_foliage',
    probability: 0,
    animationVariant: 'standard',
  },
  winter_wonderland: {
    name: 'Winter Wonderland Pack',
    description: 'Cold weather dad collection',
    primaryColor: '#0284c7',
    secondaryColor: '#0c4a6e',
    accentColor: '#e0f2fe',
    borderColor: 'rgba(2, 132, 199, 0.5)',
    gradientStart: '#0284c7',
    gradientEnd: '#0c4a6e',
    pattern: 'winter_wonderland',
    probability: 0,
    animationVariant: 'festive',
  },
  spring_bloom: {
    name: 'Spring Bloom Pack',
    description: 'Spring dad collection',
    primaryColor: '#16a34a',
    secondaryColor: '#14532d',
    accentColor: '#86efac',
    borderColor: 'rgba(22, 163, 74, 0.5)',
    gradientStart: '#16a34a',
    gradientEnd: '#14532d',
    pattern: 'spring_bloom',
    probability: 0,
    animationVariant: 'standard',
  },
};

// ============================================================================
// PACK-027: TEAR ANIMATION TYPES - Pack Opening Variations
// ============================================================================

// Tear Animation Configuration
export interface TearAnimationConfig {
  name: string;
  description: string;
  duration: number; // Total animation duration in milliseconds
  phaseMultipliers: {
    appear: number; // Multiplier for base phase duration
    glow: number;
    tear: number;
    burst: number;
  };
  shakeIntensity: 'subtle' | 'normal' | 'intense';
  particleCount: number; // Multiplier for base particle count
}

// Tear Animation Configurations (PACK-027)
// Distribution: 85% standard, 10% slow, 5% explosive (PACK-VFX-010: 10% slow tear)
export const TEAR_ANIMATION_CONFIG: Record<TearAnimation, TearAnimationConfig> = {
  standard: {
    name: 'Standard Tear',
    description: 'Normal pack opening animation',
    duration: 1500, // 1.5s total
    phaseMultipliers: {
      appear: 1.0,
      glow: 1.0,
      tear: 1.0,
      burst: 1.0,
    },
    shakeIntensity: 'normal',
    particleCount: 1.0,
  },
  slow: {
    name: 'Slow-Mo Tear',
    description: 'Dramatic slow-motion tear',
    duration: 2000, // 2.0s total (PACK-VFX-010)
    phaseMultipliers: {
      appear: 1.5,
      glow: 2.0, // Longer glow for anticipation
      tear: 2.0, // Slow motion tear
      burst: 1.5,
    },
    shakeIntensity: 'subtle',
    particleCount: 1.5, // More particles for dramatic effect
  },
  explosive: {
    name: 'Explosive Tear',
    description: 'Quick burst open with particles',
    duration: 600, // 0.6s total (PACK-VFX-011)
    phaseMultipliers: {
      appear: 0.8,
      glow: 0.5, // Short anticipation
      tear: 0.3, // Very fast tear
      burst: 1.2, // Longer burst for impact
    },
    shakeIntensity: 'intense',
    particleCount: 2.0, // Double particles
  },
};

// Randomly select a tear animation based on probability weights
export function selectRandomTearAnimation(): TearAnimation {
  const random = Math.random();

  // 85% standard, 10% slow, 5% explosive (PACK-VFX-010: 10% slow tear)
  if (random < 0.85) {
    return 'standard';
  } else if (random < 0.95) {
    return 'slow';
  } else {
    return 'explosive';
  }
}
