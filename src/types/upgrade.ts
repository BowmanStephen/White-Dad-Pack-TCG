import type { PackCard, CardStats } from './card';

// ============================================================================
// CARD UPGRADE TYPES (US085 - Card Evolution - Upgrade System)
// ============================================================================

// Card upgrade interface (extends PackCard with upgrade tracking)
export interface UpgradedCard extends PackCard {
  upgradeLevel: number;        // Current upgrade level (0-3)
  upgradeHistory: UpgradeEntry[]; // History of all upgrades
}

// Upgrade entry for history tracking
export interface UpgradeEntry {
  timestamp: Date;             // When upgrade occurred
  fromLevel: number;           // Level before upgrade
  toLevel: number;             // Level after upgrade
  cardsConsumed: string[];     // IDs of cards consumed as duplicates
  statsBefore: CardStats;      // Stats before upgrade
  statsAfter: CardStats;       // Stats after upgrade
}

// Upgrade state for UI
export interface UpgradeState {
  // Track available upgradeable cards (cards with 5+ duplicates)
  availableUpgrades: string[]; // Card IDs that can be upgraded

  // Track all cards and their upgrade levels
  // Key: card ID (e.g., "bbq_dad_001")
  // Value: { level: number, history: UpgradeEntry[] }
  cardUpgrades: Record<string, CardUpgradeData>;

  // Upgrade history across all cards
  totalUpgrades: number;
  lastUpgradeAt: Date | null;
}

// Card upgrade data (stored per card ID)
export interface CardUpgradeData {
  level: number;               // Current upgrade level (0-3)
  history: UpgradeEntry[];     // Upgrade history for this card
}

// Upgrade configuration
export interface UpgradeConfig {
  maxLevel: number;            // Maximum upgrade level (3)
  costPerLevel: number;        // Duplicates required per upgrade (5)
  statIncreasePerLevel: number; // Stat increase per level (+5)
}

// Default upgrade configuration
export const DEFAULT_UPGRADE_CONFIG: UpgradeConfig = {
  maxLevel: 3,
  costPerLevel: 5,
  statIncreasePerLevel: 5,
};
