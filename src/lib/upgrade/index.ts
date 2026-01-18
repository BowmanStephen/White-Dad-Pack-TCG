// ============================================================================
// CARD UPGRADE SYSTEM (US085 - Card Evolution - Upgrade System)
// ============================================================================

/**
 * Card Upgrade Business Logic
 *
 * This module handles the core upgrade mechanics for cards:
 * - Consuming duplicate cards to upgrade favorites
 * - Applying stat bonuses (+5 to all stats per level)
 * - Tracking upgrade history
 * - Validating upgrade requirements
 */

import type {
  CardInCollection,
  CardStats,
  CardUpgradeData,
  UpgradeConfig,
  UpgradeEntry,
} from '@/types/upgrade';
import { DEFAULT_UPGRADE_CONFIG } from '@/types/upgrade';

/**
 * Check if a card can be upgraded
 *
 * Requirements:
 * - Card must be in collection
 * - Must have enough duplicate cards (5 per upgrade)
 * - Must not be at max level (3)
 */
export function canUpgradeCard(
  cardId: string,
  collectionCards: CardInCollection[],
  upgradeData: Record<string, CardUpgradeData>,
  config: UpgradeConfig = DEFAULT_UPGRADE_CONFIG
): { canUpgrade: boolean; reason?: string } {
  // Find the card to upgrade
  const cardToUpgrade = collectionCards.find((c) => c.id === cardId);
  if (!cardToUpgrade) {
    return { canUpgrade: false, reason: 'Card not found in collection' };
  }

  // Check current upgrade level
  const currentUpgrade = upgradeData[cardId];
  const currentLevel = currentUpgrade?.level || 0;

  if (currentLevel >= config.maxLevel) {
    return { canUpgrade: false, reason: 'Card is at maximum level' };
  }

  // Count duplicates (excluding the card being upgraded)
  const duplicates = collectionCards.filter(
    (c) => c.cardId === cardToUpgrade.cardId && c.id !== cardId
  );

  if (duplicates.length < config.costPerLevel) {
    return {
      canUpgrade: false,
      reason: `Need ${config.costPerLevel} duplicates, have ${duplicates.length}`,
    };
  }

  return { canUpgrade: true };
}

/**
 * Execute card upgrade
 *
 * Returns:
 * - Updated card with upgraded stats
 * - Cards to remove from collection (consumed duplicates)
 * - Upgrade history entry
 */
export function executeCardUpgrade(
  cardId: string,
  collectionCards: CardInCollection[],
  upgradeData: Record<string, CardUpgradeData>,
  config: UpgradeConfig = DEFAULT_UPGRADE_CONFIG
): {
  success: boolean;
  error?: string;
  upgradedCard?: CardInCollection;
  cardsToRemove?: string[];
  upgradeEntry?: UpgradeEntry;
  newUpgradeData?: CardUpgradeData;
} {
  // Validate upgrade is possible
  const validation = canUpgradeCard(cardId, collectionCards, upgradeData, config);
  if (!validation.canUpgrade) {
    return { success: false, error: validation.reason };
  }

  // Find the card to upgrade
  const cardToUpgrade = collectionCards.find((c) => c.id === cardId);
  if (!cardToUpgrade) {
    return { success: false, error: 'Card not found in collection' };
  }

  // Get current upgrade level
  const currentUpgrade = upgradeData[cardId];
  const currentLevel = currentUpgrade?.level || 0;
  const newLevel = currentLevel + 1;

  // Collect duplicate cards to consume
  const duplicates = collectionCards.filter(
    (c) => c.cardId === cardToUpgrade.cardId && c.id !== cardId
  );
  const cardsToConsume = duplicates.slice(0, config.costPerLevel);
  const consumedCardIds = cardsToConsume.map((c) => c.id);

  // Store stats before upgrade
  const statsBefore = { ...cardToUpgrade.stats };

  // Apply stat bonus (+5 to all stats)
  const statsAfter: CardStats = {
    dadJoke: Math.min(100, statsBefore.dadJoke + config.statIncreasePerLevel),
    grillSkill: Math.min(100, statsBefore.grillSkill + config.statIncreasePerLevel),
    fixIt: Math.min(100, statsBefore.fixIt + config.statIncreasePerLevel),
    napPower: Math.min(100, statsBefore.napPower + config.statIncreasePerLevel),
    remoteControl: Math.min(100,
      statsBefore.remoteControl + config.statIncreasePerLevel),
    thermostat: Math.min(100,
      statsBefore.thermostat + config.statIncreasePerLevel),
    sockSandal: Math.min(100,
      statsBefore.sockSandal + config.statIncreasePerLevel),
    beerSnob: Math.min(100, statsBefore.beerSnob + config.statIncreasePerLevel),
  };

  // Create upgraded card
  const upgradedCard: CardInCollection = {
    ...cardToUpgrade,
    stats: statsAfter,
  };

  // Create upgrade history entry
  const upgradeEntry: UpgradeEntry = {
    timestamp: new Date(),
    fromLevel: currentLevel,
    toLevel: newLevel,
    cardsConsumed: consumedCardIds,
    statsBefore,
    statsAfter,
  };

  // Create new upgrade data
  const newUpgradeData: CardUpgradeData = {
    level: newLevel,
    history: [...(currentUpgrade?.history || []), upgradeEntry],
  };

  return {
    success: true,
    upgradedCard,
    cardsToRemove: consumedCardIds,
    upgradeEntry,
    newUpgradeData,
  };
}

/**
 * Calculate upgrade stats for a card
 */
export function getUpgradeStats(
  cardId: string,
  upgradeData: Record<string, CardUpgradeData>
): {
  level: number;
  totalBonus: number;
  history: UpgradeEntry[];
  canUpgradeFurther: boolean;
  upgradesUntilMax: number;
} {
  const upgrade = upgradeData[cardId];
  const level = upgrade?.level || 0;
  const totalBonus = level * DEFAULT_UPGRADE_CONFIG.statIncreasePerLevel;
  const history = upgrade?.history || [];
  const canUpgradeFurther = level < DEFAULT_UPGRADE_CONFIG.maxLevel;
  const upgradesUntilMax = DEFAULT_UPGRADE_CONFIG.maxLevel - level;

  return {
    level,
    totalBonus,
    history,
    canUpgradeFurther,
    upgradesUntilMax,
  };
}

/**
 * Get all cards available for upgrade
 */
export function getUpgradeableCards(
  collectionCards: CardInCollection[],
  upgradeData: Record<string, CardUpgradeData>
): {
  cardId: string;
  cardName: string;
  duplicateCount: number;
  currentLevel: number;
  canUpgrade: boolean;
}[] {
  // Group cards by cardId (base card definition)
  const cardGroups = new Map<string, CardInCollection[]>();

  for (const card of collectionCards) {
    const group = cardGroups.get(card.cardId) || [];
    group.push(card);
    cardGroups.set(card.cardId, group);
  }

  // Find cards with duplicates
  const upgradeable: {
    cardId: string;
    cardName: string;
    duplicateCount: number;
    currentLevel: number;
    canUpgrade: boolean;
  }[] = [];

  for (const [cardId, cards] of cardGroups.entries()) {
    if (cards.length < DEFAULT_UPGRADE_CONFIG.costPerLevel) {
      continue; // Not enough duplicates
    }

    const firstCard = cards[0];
    const upgrade = upgradeData[firstCard.id];
    const currentLevel = upgrade?.level || 0;

    if (currentLevel >= DEFAULT_UPGRADE_CONFIG.maxLevel) {
      continue; // Already max level
    }

    upgradeable.push({
      cardId: firstCard.id,
      cardName: firstCard.name,
      duplicateCount: cards.length - 1, // Exclude the card being upgraded
      currentLevel,
      canUpgrade: true,
    });
  }

  return upgradeable;
}

/**
 * Get upgrade cost for next level
 */
export function getUpgradeCost(
  cardId: string,
  upgradeData: Record<string, CardUpgradeData>,
  config: UpgradeConfig = DEFAULT_UPGRADE_CONFIG
): {
  cardsNeeded: number;
  haveDuplicates: number;
  needMore: number;
} {
  const upgrade = upgradeData[cardId];
  const currentLevel = upgrade?.level || 0;

  if (currentLevel >= config.maxLevel) {
    return {
      cardsNeeded: 0,
      haveDuplicates: 0,
      needMore: 0,
    };
  }

  return {
    cardsNeeded: config.costPerLevel,
    haveDuplicates: 0, // Will be calculated by caller
    needMore: config.costPerLevel,
  };
}
