import type { PackCard, Rarity, DadType, CardStats } from './core';

// ============================================================================
// CARD BATTLE TYPES (US090 - Card Battles - Minigame)
// ============================================================================

// Re-export from core
export type {
  BattleState,
  BattleMode,
  BattleFormat,
  BattleSlot,
  BattleCard,
  BattleTeam,
  BattleResult,
  BattleLogEntry,
  BattleAction,
  BattleRewards,
  BattleHistoryEntry,
  RankedSeason,
  PlayerRankedData,
  RankedTier,
  RankedTierConfig,
  BattleConfig,
} from './core';

export const DEFAULT_BATTLE_CONFIG: BattleConfig = {
  maxHealth: 100,
  turnDuration: 30,
  surrenderAfter: 3,
  rankedSeasonLength: 30,
} as const;

export const RANKED_TIERS: Record<RankedTier, RankedTierConfig> = {
  bronze: {
    name: 'Bronze',
    icon: '🥉',
    color: '#cd7f32',
    minPoints: 0,
    maxPoints: 999,
    rewards: {
      currency: 10,
      experience: 20,
    },
  },
  silver: {
    name: 'Silver',
    icon: '🥈',
    color: '#c0c0c0',
    minPoints: 1000,
    maxPoints: 1999,
    rewards: {
      currency: 20,
      experience: 40,
    },
  },
  gold: {
    name: 'Gold',
    icon: '🥇',
    color: '#ffd700',
    minPoints: 2000,
    maxPoints: 2999,
    rewards: {
      currency: 30,
      experience: 60,
    },
  },
  platinum: {
    name: 'Platinum',
    icon: '💎',
    color: '#e5e4e2',
    minPoints: 3000,
    maxPoints: 3999,
    rewards: {
      currency: 40,
      experience: 80,
    },
  },
  diamond: {
    name: 'Diamond',
    icon: '💠',
    color: '#b9f2ff',
    minPoints: 4000,
    maxPoints: 4999,
    rewards: {
      currency: 50,
      experience: 100,
    },
  },
  champion: {
    name: 'Champion',
    icon: '🏆',
    color: '#ff6b6b',
    minPoints: 5000,
    maxPoints: 7499,
    rewards: {
      currency: 75,
      experience: 150,
    },
  },
  legend: {
    name: 'Legend',
    icon: '👑',
    color: '#ffd700',
    minPoints: 7500,
    maxPoints: 99999,
    rewards: {
      currency: 100,
      experience: 200,
      cards: [],
    },
  },
};

// ============================================================================
// DECK BUILDER TYPES (US084 - Collection - Decks Builder)
// ============================================================================

export interface DeckCard {
  cardId: string;
  name: string;
  rarity: Rarity;
  dadType: DadType;
  level: number;
  experience: number;
}

export interface DeckStats {
  totalPower: number;
  averageLevel: number;
  typeDistribution: Record<DadType, number>;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  cards: DeckCard[];
  createdAt: Date;
  lastModified: Date;
  wins: number;
  losses: number;
}

export interface DeckState {
  decks: Deck[];
  activeDeck: string | null;
}

export interface DeckValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DeckExport {
  deck: Deck;
  format: 'json' | 'code';
  data: string;
}

// ============================================================================
// CARD UPGRADE TYPES (US085 - Card Evolution - Upgrade System)
// ============================================================================

export interface UpgradedCard extends PackCard {
  level: number;
  experience: number;
  bonusStats: Partial<CardStats>;
}

export interface UpgradeEntry {
  cardId: string;
  level: number;
  experience: number;
  upgradedAt: Date;
}

export interface UpgradeState {
  cards: UpgradedCard[];
  history: UpgradeEntry[];
  totalUpgradeCost: number;
}

export interface CardUpgradeData {
  cardId: string;
  currentLevel: number;
  experienceToNext: number;
  maxLevel: number;
  statBonusPerLevel: Partial<CardStats>;
}

export interface UpgradeConfig {
  maxLevel: number;
  baseExperienceRequired: number;
  experienceMultiplier: number;
  costPerLevel: number;
  currencyType: 'coins' | 'gems';
}

export const DEFAULT_UPGRADE_CONFIG: UpgradeConfig = {
  maxLevel: 10,
  baseExperienceRequired: 100,
  experienceMultiplier: 1.5,
  costPerLevel: 50,
  currencyType: 'coins',
};
