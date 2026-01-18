import type { PackCard, Rarity, DadType, CardStats } from './core';

// ============================================================================
// CARD BATTLE TYPES (US090 - Card Battles - Minigame)
// ============================================================================
// Battle types moved to roadmap. MVP uses combat simulator only.

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
