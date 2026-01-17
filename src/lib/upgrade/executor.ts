/**
 * Upgrade System Executor
 *
 * Handles card upgrade operations including validation,
 * duplicate consumption, and history tracking.
 */

import type {
  Card,
  CardStats,
  Pack,
  PackCard,
  UpgradeConfig,
  UpgradeEntry,
} from '../../types';
import { DEFAULT_UPGRADE_CONFIG } from '../../types';

/**
 * Count duplicates of a specific card in collection
 */
export function countCardDuplicates(packs: Pack[], cardId: string): number {
  let count = 0;
  for (const pack of packs) {
    for (const card of pack.cards) {
      if (card.id === cardId) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Get all instances of a specific card from collection
 */
export function getCardInstances(packs: Pack[], cardId: string): PackCard[] {
  const instances: PackCard[] = [];
  for (const pack of packs) {
    for (const card of pack.cards) {
      if (card.id === cardId) {
        instances.push(card);
      }
    }
  }
  return instances;
}

/**
 * Calculate upgraded stats (+5 per level to all stats, capped at 100)
 */
export function calculateUpgradedStats(
  baseStats: CardStats,
  level: number,
  config: UpgradeConfig = DEFAULT_UPGRADE_CONFIG
): CardStats {
  const statIncrease = level * config.statIncreasePerLevel;

  return {
    dadJoke: Math.min(100, baseStats.dadJoke + statIncrease),
    grillSkill: Math.min(100, baseStats.grillSkill + statIncrease),
    fixIt: Math.min(100, baseStats.fixIt + statIncrease),
    napPower: Math.min(100, baseStats.napPower + statIncrease),
    remoteControl: Math.min(100, baseStats.remoteControl + statIncrease),
    thermostat: Math.min(100, baseStats.thermostat + statIncrease),
    sockSandal: Math.min(100, baseStats.sockSandal + statIncrease),
    beerSnob: Math.min(100, baseStats.beerSnob + statIncrease),
  };
}

/**
 * Validate if a card can be upgraded
 */
export function validateUpgrade(
  packs: Pack[],
  cardId: string,
  currentLevel: number,
  config: UpgradeConfig = DEFAULT_UPGRADE_CONFIG
): { valid: boolean; reason?: string } {
  // Check max level
  if (currentLevel >= config.maxLevel) {
    return {
      valid: false,
      reason: `Card is already at maximum level (${config.maxLevel})`,
    };
  }

  // Check duplicate count
  const duplicateCount = countCardDuplicates(packs, cardId);
  if (duplicateCount < config.costPerLevel) {
    return {
      valid: false,
      reason: `Need ${config.costPerLevel} duplicates to upgrade, only have ${duplicateCount}`,
    };
  }

  return { valid: true };
}

/**
 * Calculate the difference between two stat sets
 */
export function calculateStatDifference(before: CardStats, after: CardStats): CardStats {
  return {
    dadJoke: after.dadJoke - before.dadJoke,
    grillSkill: after.grillSkill - before.grillSkill,
    fixIt: after.fixIt - before.fixIt,
    napPower: after.napPower - before.napPower,
    remoteControl: after.remoteControl - before.remoteControl,
    thermostat: after.thermostat - before.thermostat,
    sockSandal: after.sockSandal - before.sockSandal,
    beerSnob: after.beerSnob - before.beerSnob,
  };
}

/**
 * Create an upgrade history entry
 */
export function createUpgradeEntry(
  cardId: string,
  fromLevel: number,
  toLevel: number,
  statsBefore: CardStats,
  statsAfter: CardStats,
  consumedCardIds: string[] = []
): UpgradeEntry {
  return {
    timestamp: new Date(),
    fromLevel,
    toLevel,
    cardsConsumed: consumedCardIds,
    statsBefore,
    statsAfter,
  };
}

/**
 * Format upgrade history entry for display
 */
export function formatUpgradeEntry(entry: UpgradeEntry): string {
  const date = entry.timestamp.toLocaleDateString();
  const statDiff = calculateStatDifference(entry.statsBefore, entry.statsAfter);
  const increaseAmount = statDiff.dadJoke; // All stats increase by same amount

  return `Level ${entry.fromLevel} → ${entry.toLevel} (+${increaseAmount} all stats) - ${date}`;
}

/**
 * Get total stats boost from all upgrades
 */
export function getTotalStatsBoost(upgradeHistory: UpgradeEntry[]): CardStats {
  const total: CardStats = {
    dadJoke: 0,
    grillSkill: 0,
    fixIt: 0,
    napPower: 0,
    remoteControl: 0,
    thermostat: 0,
    sockSandal: 0,
    beerSnob: 0,
  };

  for (const entry of upgradeHistory) {
    const diff = calculateStatDifference(entry.statsBefore, entry.statsAfter);
    total.dadJoke += diff.dadJoke;
    total.grillSkill += diff.grillSkill;
    total.fixIt += diff.fixIt;
    total.napPower += diff.napPower;
    total.remoteControl += diff.remoteControl;
    total.thermostat += diff.thermostat;
    total.sockSandal += diff.sockSandal;
    total.beerSnob += diff.beerSnob;
  }

  return total;
}

/**
 * Check if card is maxed out
 */
export function isCardMaxed(
  level: number,
  config: UpgradeConfig = DEFAULT_UPGRADE_CONFIG
): boolean {
  return level >= config.maxLevel;
}

/**
 * Get progress towards next upgrade
 */
export function getUpgradeProgress(
  duplicateCount: number,
  config: UpgradeConfig = DEFAULT_UPGRADE_CONFIG
): { current: number; required: number; percentage: number } {
  const required = config.costPerLevel;
  const current = Math.min(duplicateCount, required);
  const percentage = Math.round((current / required) * 100);

  return { current, required, percentage };
}

/**
 * Export upgrade data for sharing
 */
export function exportUpgradeData(cardId: string, level: number, history: UpgradeEntry[]): string {
  return JSON.stringify(
    {
      cardId,
      level,
      history,
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
}
