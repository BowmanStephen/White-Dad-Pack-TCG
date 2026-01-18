// ============================================================================
// CARD UPGRADE TYPES (US085 - Card Evolution - Upgrade System)
// ============================================================================

import type { PackCard, CardStats } from './card';

// Card upgrade interface (extends PackCard with upgrade tracking)
export interface UpgradedCard extends PackCard {
  upgradeLevel: number;
  upgradeHistory: UpgradeEntry[];
}

// Upgrade entry for history tracking
export interface UpgradeEntry {
  timestamp: Date;
  fromLevel: number;
  toLevel: number;
  cardsConsumed: string[];
  statsBefore: CardStats;
  statsAfter: CardStats;
}

// Upgrade state for UI
export interface UpgradeState {
  availableUpgrades: string[];
  cardUpgrades: Record<string, CardUpgradeData>;
  totalUpgrades: number;
  lastUpgradeAt: Date | null;
}

// Card upgrade data (stored per card ID)
export interface CardUpgradeData {
  level: number;
  history: UpgradeEntry[];
}

// Upgrade configuration
export interface UpgradeConfig {
  maxLevel: number;
  costPerLevel: number;
  statIncreasePerLevel: number;
}

// Default upgrade configuration
export const DEFAULT_UPGRADE_CONFIG: UpgradeConfig = {
  maxLevel: 3,
  costPerLevel: 5,
  statIncreasePerLevel: 5,
};
