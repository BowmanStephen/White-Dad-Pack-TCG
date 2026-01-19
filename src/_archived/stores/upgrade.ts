// ============================================================================
// CARD UPGRADE STORE (US085 - Card Evolution - Upgrade System)
// ============================================================================

/**
 * Upgrade State Management
 *
 * Nanostores for managing card upgrades across the application.
 * Integrates with collection store for seamless upgrade workflow.
 */

import { atom, computed } from 'nanostores';
import type {
  CardInCollection,
  CardUpgradeData,
  UpgradeEntry,
} from '@/types/upgrade';
import {
  canUpgradeCard,
  executeCardUpgrade,
  getUpgradeStats,
  getUpgradeableCards,
  getUpgradeCost,
} from '@/lib/upgrade';
import { collection } from './collection';

// ============================================================================
// Core State
// ============================================================================

/**
 * Card upgrade data stored by card instance ID
 * Maps card ID → upgrade data (level, history)
 */
export const cardUpgrades = atom<Record<string, CardUpgradeData>>({});

/**
 * Currently selected card for upgrade
 */
export const selectedCardId = atom<string | null>(null);

/**
 * Upgrade UI state
 */
export const upgradeUiState = atom<'idle' | 'confirming' | 'processing'>('idle');

// ============================================================================
// Computed State
// ============================================================================

/**
 * Total number of upgrades performed
 */
export const totalUpgrades = computed(cardUpgrades, (upgrades) => {
  return Object.values(upgrades).reduce((sum, data) => sum + data.level, 0);
});

/**
 * All upgradeable cards in collection
 */
export const upgradeableCards = computed(
  [collection, cardUpgrades],
  (coll, upgrades) => {
    if (!coll) return [];
    return getUpgradeableCards(coll.cards, upgrades);
  }
);

/**
 * Selected card's upgrade data
 */
export const selectedCardUpgrade = computed(
  [collection, cardUpgrades, selectedCardId],
  (coll, upgrades, cardId) => {
    if (!coll || !cardId) return null;

    const card = coll.cards.find((c) => c.id === cardId);
    if (!card) return null;

    const upgrade = upgrades[cardId];
    const stats = getUpgradeStats(cardId, upgrades);

    // Count duplicates
    const duplicates = coll.cards.filter(
      (c) => c.cardId === card.cardId && c.id !== cardId
    );

    return {
      card,
      upgrade,
      level: stats.level,
      totalBonus: stats.totalBonus,
      history: stats.history,
      canUpgradeFurther: stats.canUpgradeFurther,
      upgradesUntilMax: stats.upgradesUntilMax,
      duplicateCount: duplicates.length,
      cost: getUpgradeCost(cardId, upgrades),
    };
  }
);

// ============================================================================
// Actions
// ============================================================================

/**
 * Select a card for upgrade
 */
export function selectCardForUpgrade(cardId: string | null) {
  selectedCardId.set(cardId);
  upgradeUiState.set('idle');
}

/**
 * Execute upgrade on selected card
 */
export async function performUpgrade(cardId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const coll = collection.get();
  if (!coll) {
    return { success: false, error: 'Collection not loaded' };
  }

  const upgrades = cardUpgrades.get();
  upgradeUiState.set('processing');

  try {
    const result = executeCardUpgrade(cardId, coll.cards, upgrades);

    if (!result.success) {
      upgradeUiState.set('idle');
      return { success: false, error: result.error };
    }

    // Update upgrade data
    const newUpgrades = {
      ...upgrades,
      [cardId]: result.newUpgradeData!,
    };
    cardUpgrades.set(newUpgrades);

    // Update collection (remove consumed cards, update upgraded card)
    const updatedCards = coll.cards.filter(
      (c) => !result.cardsToRemove!.includes(c.id)
    );

    const updatedCollection = {
      ...coll,
      cards: updatedCards.map((c) =>
        c.id === cardId ? result.upgradedCard! : c
      ),
    };
    collection.set(updatedCollection);

    // Persist to storage
    await persistUpgradeData(newUpgrades);

    upgradeUiState.set('idle');
    selectCardForUpgrade(null); // Deselect after successful upgrade

    return { success: true };
  } catch (error) {
    upgradeUiState.set('idle');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upgrade failed',
    };
  }
}

/**
 * Cancel upgrade operation
 */
export function cancelUpgrade() {
  selectCardForUpgrade(null);
  upgradeUiState.set('idle');
}

/**
 * Reset all upgrade data (for testing/debugging)
 */
export function resetUpgradeData() {
  cardUpgrades.set({});
  selectedCardId.set(null);
  upgradeUiState.set('idle');
}

// ============================================================================
// Persistence
// ============================================================================

const UPGRADE_STORAGE_KEY = 'daddeck-upgrades';

/**
 * Load upgrade data from localStorage
 */
export function loadUpgradeData(): Record<string, CardUpgradeData> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(UPGRADE_STORAGE_KEY);
    if (!stored) return {};

    const data = JSON.parse(stored);

    // Convert timestamp strings back to Date objects
    for (const cardId in data) {
      if (data[cardId].history) {
        data[cardId].history = data[cardId].history.map((entry: UpgradeEntry) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
      }
    }

    return data;
  } catch (error) {
    console.error('Failed to load upgrade data:', error);
    return {};
  }
}

/**
 * Persist upgrade data to localStorage
 */
async function persistUpgradeData(
  upgrades: Record<string, CardUpgradeData>
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(UPGRADE_STORAGE_KEY, JSON.stringify(upgrades));
  } catch (error) {
    console.error('Failed to save upgrade data:', error);
  }
}

/**
 * Initialize upgrade store on app load
 */
export function initializeUpgradeStore() {
  const stored = loadUpgradeData();
  if (Object.keys(stored).length > 0) {
    cardUpgrades.set(stored);
  }
}
