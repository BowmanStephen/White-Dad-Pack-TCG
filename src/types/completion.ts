import type { Rarity, DadType } from './core';

// ============================================================================
// COLLECTION COMPLETION TYPES (Set Completion & Milestones)
// ============================================================================

/**
 * Collection completion tracks progress toward collecting all cards.
 * Awards badges and bonus packs at milestones (25%, 50%, 75%, 100%).
 *
 * Completion is tracked per rarity tier and overall.
 */

// Completion milestone configuration
export interface CompletionMilestone {
  percentage: number;            // Completion percentage (25, 50, 75, 100)
  reward: CompletionReward;      // Reward for reaching milestone
  achieved: boolean;             // Whether milestone is achieved
  achievedAt?: Date;             // When milestone was achieved
}

// Completion reward types
export interface CompletionReward {
  type: 'badge' | 'packs' | 'title' | 'card_back';
  value: number | string;        // Pack count, badge ID, title ID, etc.
  description: string;           // Reward description
  icon: string;                  // Reward icon
}

// Rarity completion tracking
export interface RarityCompletion {
  rarity: Rarity;
  totalCards: number;            // Total cards of this rarity in database
  ownedCards: number;            // Number owned by player
  percentage: number;            // Completion percentage (0-100)
  missingCardIds: string[];      // IDs of missing cards
  milestones: CompletionMilestone[];
}

// Type completion tracking (by dad type)
export interface TypeCompletion {
  type: DadType;
  totalCards: number;            // Total cards of this type
  ownedCards: number;            // Number owned by player
  percentage: number;            // Completion percentage (0-100)
  missingCardIds: string[];      // IDs of missing cards
}

// Overall collection completion
export interface CollectionCompletion {
  // Overall stats
  totalCardsInGame: number;      // Total unique cards in database
  totalCardsOwned: number;       // Total unique cards owned
  overallPercentage: number;     // Overall completion percentage (0-100)
  overallMilestones: CompletionMilestone[];

  // Per-rarity completion
  rarityCompletion: Record<Rarity, RarityCompletion>;

  // Per-type completion
  typeCompletion: Record<DadType, TypeCompletion>;

  // Completion achievements unlocked
  achievementsUnlocked: string[];

  // Badges awarded
  badgesAwarded: string[];

  // Last updated
  lastUpdated: Date;
}

// Completion configuration
export interface CompletionConfig {
  milestonePercentages: number[];  // [25, 50, 75, 100]
  enableRarityMilestones: boolean;
  enableTypeMilestones: boolean;
  autoClaimRewards: boolean;
}

// Default completion configuration
export const DEFAULT_COMPLETION_CONFIG: CompletionConfig = {
  milestonePercentages: [25, 50, 75, 100],
  enableRarityMilestones: true,
  enableTypeMilestones: true,
  autoClaimRewards: true,
};

// Predefined completion milestones with rewards
export const COMPLETION_MILESTONES: Record<number, CompletionReward> = {
  25: {
    type: 'badge',
    value: 'collector_quarter',
    description: 'Quarter Complete Badge + 3 Bonus Packs',
    icon: '🎖️',
  },
  50: {
    type: 'badge',
    value: 'collector_half',
    description: 'Halfway There Badge + 5 Bonus Packs',
    icon: '🏅',
  },
  75: {
    type: 'badge',
    value: 'collector_three_quarters',
    description: 'Almost There Badge + 10 Bonus Packs',
    icon: '🥇',
  },
  100: {
    type: 'badge',
    value: 'collector_complete',
    description: 'Master Collector Badge + 20 Bonus Packs + Exclusive Title',
    icon: '👑',
  },
};

// Rarity-specific completion milestones
export const RARITY_COMPLETION_MILESTONES: Record<Rarity, Record<number, CompletionReward>> = {
  common: {
    100: {
      type: 'badge',
      value: 'common_master',
      description: 'Common Master Badge',
      icon: '⚪',
    },
  },
  uncommon: {
    100: {
      type: 'badge',
      value: 'uncommon_master',
      description: 'Uncommon Master Badge',
      icon: '🔵',
    },
  },
  rare: {
    100: {
      type: 'badge',
      value: 'rare_master',
      description: 'Rare Master Badge + 3 Bonus Packs',
      icon: '🟡',
    },
  },
  epic: {
    100: {
      type: 'badge',
      value: 'epic_master',
      description: 'Epic Master Badge + 5 Bonus Packs',
      icon: '🟣',
    },
  },
  legendary: {
    100: {
      type: 'badge',
      value: 'legendary_master',
      description: 'Legendary Master Badge + 10 Bonus Packs',
      icon: '🟠',
    },
  },
  mythic: {
    100: {
      type: 'badge',
      value: 'mythic_master',
      description: 'Mythic Master Badge + Exclusive Title + 20 Bonus Packs',
      icon: '💎',
    },
  },
};
