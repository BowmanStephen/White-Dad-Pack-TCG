import { persistentAtom } from '@nanostores/persistent';
import type {
  CardStats,
  Pack,
  PackCard,
  UpgradeConfig,
  UpgradeEntry,
  UpgradeState,
  CardUpgradeData,
} from '../types';
import { DEFAULT_UPGRADE_CONFIG } from '../types';
import { collection } from './collection';
import { trackEvent } from './analytics';

// Custom encoder for UpgradeState (handles Date serialization)
const upgradeEncoder = {
  encode(data: UpgradeState): string {
    return JSON.stringify(data, (_key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
  },
  decode(str: string): UpgradeState {
    const data = JSON.parse(str);
    // Convert ISO strings back to Date objects in upgrade history
    for (const cardId in data.cardUpgrades) {
      data.cardUpgrades[cardId].history = data.cardUpgrades[cardId].history.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }));
    }
    if (data.lastUpgradeAt) {
      data.lastUpgradeAt = new Date(data.lastUpgradeAt);
    }
    return data;
  },
};

// Upgrade state store with LocalStorage persistence
export const upgradeState = persistentAtom<UpgradeState>(
  'daddeck-upgrades',
  {
    availableUpgrades: [],
    cardUpgrades: {},
    totalUpgrades: 0,
    lastUpgradeAt: null,
  },
  upgradeEncoder
);

// Get current upgrade state
export function getUpgradeState(): UpgradeState {
  return upgradeState.get();
}

// Get duplicate count for a specific card ID from collection
function getCardDuplicateCount(cardId: string): number {
  const current = collection.get();
  let count = 0;

  for (const pack of current.packs) {
    for (const card of pack.cards) {
      if (card.id === cardId) {
        count++;
      }
    }
  }

  return count;
}

// Get all cards from collection grouped by ID
function getCardsById(): Record<string, PackCard[]> {
  const current = collection.get();
  const cardsById: Record<string, PackCard[]> = {};

  for (const pack of current.packs) {
    for (const card of pack.cards) {
      if (!cardsById[card.id]) {
        cardsById[card.id] = [];
      }
      cardsById[card.id].push(card);
    }
  }

  return cardsById;
}

// Get upgrade level for a card
export function getCardUpgradeLevel(cardId: string): number {
  const state = upgradeState.get();
  return state.cardUpgrades[cardId]?.level || 0;
}

// Get upgrade history for a card
export function getCardUpgradeHistory(cardId: string): UpgradeEntry[] {
  const state = upgradeState.get();
  return state.cardUpgrades[cardId]?.history || [];
}

// Calculate stats after upgrade (+5 per level to all stats)
export function calculateUpgradedStats(baseStats: CardStats, level: number): CardStats {
  const statIncrease = level * DEFAULT_UPGRADE_CONFIG.statIncreasePerLevel;

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

// Check if a card can be upgraded
export function canUpgradeCard(cardId: string): boolean {
  const level = getCardUpgradeLevel(cardId);
  const duplicateCount = getCardDuplicateCount(cardId);

  // Must have enough duplicates and not be at max level
  return (
    level < DEFAULT_UPGRADE_CONFIG.maxLevel &&
    duplicateCount >= DEFAULT_UPGRADE_CONFIG.costPerLevel
  );
}

// Get available upgrades (cards with 5+ duplicates and not at max level)
export function getAvailableUpgrades(): string[] {
  const cardsById = getCardsById();
  const state = upgradeState.get();
  const available: string[] = [];

  for (const [cardId, cards] of Object.entries(cardsById)) {
    const level = state.cardUpgrades[cardId]?.level || 0;

    if (
      level < DEFAULT_UPGRADE_CONFIG.maxLevel &&
      cards.length >= DEFAULT_UPGRADE_CONFIG.costPerLevel
    ) {
      available.push(cardId);
    }
  }

  return available;
}

// Refresh available upgrades list
export function refreshAvailableUpgrades(): void {
  const state = upgradeState.get();
  state.availableUpgrades = getAvailableUpgrades();
  upgradeState.set(state);
}

// Upgrade a card
export function upgradeCard(
  cardId: string
): { success: boolean; error?: string; newLevel?: number; statsBefore?: CardStats; statsAfter?: CardStats } {
  try {
    const state = upgradeState.get();
    const currentLevel = state.cardUpgrades[cardId]?.level || 0;
    const duplicateCount = getCardDuplicateCount(cardId);

    // Validate upgrade is possible
    if (currentLevel >= DEFAULT_UPGRADE_CONFIG.maxLevel) {
      return {
        success: false,
        error: 'Card is already at maximum upgrade level',
      };
    }

    if (duplicateCount < DEFAULT_UPGRADE_CONFIG.costPerLevel) {
      return {
        success: false,
        error: `Need ${DEFAULT_UPGRADE_CONFIG.costPerLevel} duplicates to upgrade, only have ${duplicateCount}`,
      };
    }

    // Get base card (first occurrence) for stats
    const cardsById = getCardsById();
    const baseCard = cardsById[cardId]?.[0];
    if (!baseCard) {
      return { success: false, error: 'Card not found in collection' };
    }

    const newLevel = currentLevel + 1;
    const statsBefore = baseCard.stats;
    const statsAfter = calculateUpgradedStats(baseCard.stats, newLevel);

    // Create upgrade entry
    const upgradeEntry: UpgradeEntry = {
      timestamp: new Date(),
      fromLevel: currentLevel,
      toLevel: newLevel,
      cardsConsumed: [], // Will be populated when cards are consumed
      statsBefore,
      statsAfter,
    };

    // Update card upgrade data
    if (!state.cardUpgrades[cardId]) {
      state.cardUpgrades[cardId] = {
        level: 0,
        history: [],
      };
    }

    state.cardUpgrades[cardId].level = newLevel;
    state.cardUpgrades[cardId].history.push(upgradeEntry);
    state.totalUpgrades++;
    state.lastUpgradeAt = new Date();

    // Update available upgrades list
    state.availableUpgrades = getAvailableUpgrades();

    // Save state
    upgradeState.set(state);

    // Track analytics
    trackEvent({
      type: 'card_upgrade',
      data: {
        cardId,
        fromLevel: currentLevel,
        toLevel: newLevel,
      },
    } as any);

    return {
      success: true,
      newLevel,
      statsBefore,
      statsAfter,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upgrade card',
    };
  }
}

// Get upgraded card with applied stats
export function getUpgradedCard(card: PackCard): PackCard {
  const level = getCardUpgradeLevel(card.id);
  if (level === 0) return card;

  return {
    ...card,
    stats: calculateUpgradedStats(card.stats, level),
  };
}

// Clear all upgrade data
export function clearUpgrades(): { success: boolean; error?: string } {
  try {
    upgradeState.set({
      availableUpgrades: [],
      cardUpgrades: {},
      totalUpgrades: 0,
      lastUpgradeAt: null,
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear upgrades',
    };
  }
}

// Initialize: refresh available upgrades on load
if (typeof window !== 'undefined') {
  refreshAvailableUpgrades();
}
