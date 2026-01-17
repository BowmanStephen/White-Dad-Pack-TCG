/**
 * Crafting Store - US080: Card Crafting - Combine Cards
 *
 * Manages the card crafting system state including:
 * - Current crafting session
 * - Card selection for crafting
 * - Crafting history
 * - Success/failure tracking
 */

import { atom, map } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type {
  CraftingState,
  CraftingRecipe,
  CraftingSession,
  CraftingHistory,
  CraftingHistoryEntry,
  CraftingConfig,
  PackCard,
  Rarity,
} from '@/types';
import { CRAFTING_RECIPES, DEFAULT_CRAFTING_CONFIG, RARITY_ORDER } from '@/types';

// ============================================================================
// CRAFTING CONFIGURATION
// ============================================================================

/**
 * Crafting configuration settings
 */
export const craftingConfig = atom<CraftingConfig>(DEFAULT_CRAFTING_CONFIG);

// ============================================================================
// CRAFTING SESSION
// ============================================================================

/**
 * Current crafting session state
 * null = no active crafting session
 */
export const craftingSession = atom<CraftingSession | null>(null);

/**
 * Current crafting state (derived from session)
 */
export const craftingState = atom<CraftingState>('idle');

/**
 * Selected cards for crafting (IDs)
 */
export const selectedCards = atom<string[]>([]);

/**
 * Currently selected recipe
 */
export const selectedRecipe = atom<CraftingRecipe | null>(null);

// ============================================================================
// CRAFTING HISTORY
// ============================================================================

/**
 * Custom encoder for crafting history (converts dates to/from ISO strings)
 */
const craftingHistoryEncoder = {
  decode(value: unknown): CraftingHistory {
    if (!value || typeof value !== 'object') {
      return {
        entries: [],
        totalAttempts: 0,
        successfulCrafts: 0,
        failedCrafts: 0,
        bestCraft: null,
      };
    }

    const data = value as Record<string, unknown>;

    // Ensure we have valid CraftingHistory structure
    return {
      entries: Array.isArray(data.entries)
        ? (data.entries as CraftingHistoryEntry[]).map((entry: unknown) => ({
            ...entry,
            timestamp: new Date((entry as CraftingHistoryEntry).timestamp),
            result: (entry as CraftingHistoryEntry).result
              ? {
                  ...(entry as CraftingHistoryEntry).result!,
                  isRevealed: true,
                  isHolo: (entry as CraftingHistoryEntry).result!.isHolo || false,
                  holoType: (entry as CraftingHistoryEntry).result!.holoType || 'none',
                }
              : undefined,
          }))
        : [],
      totalAttempts: typeof data.totalAttempts === 'number' ? data.totalAttempts : 0,
      successfulCrafts: typeof data.successfulCrafts === 'number' ? data.successfulCrafts : 0,
      failedCrafts: typeof data.failedCrafts === 'number' ? data.failedCrafts : 0,
      bestCraft: data.bestCraft
        ? {
            ...(data.bestCraft as PackCard),
            isRevealed: true,
            isHolo: (data.bestCraft as PackCard).isHolo || false,
            holoType: (data.bestCraft as PackCard).holoType || 'none',
          }
        : null,
    };
  },

  encode(value: CraftingHistory): unknown {
    return JSON.stringify(value);
  },
};

/**
 * Persistent crafting history
 */
export const craftingHistory = persistentAtom<CraftingHistory>(
  'crafting-history',
  {
    entries: [],
    totalAttempts: 0,
    successfulCrafts: 0,
    failedCrafts: 0,
    bestCraft: null,
  },
  {
    encode: craftingHistoryEncoder.encode,
    decode: craftingHistoryEncoder.decode,
  }
);

// ============================================================================
// UI STATE
// ============================================================================

/**
 * UI state for crafting interface
 */
export const craftingUI = map({
  showHistory: false,
  showRecipeSelector: false,
  isAnimating: false,
  showResult: false,
});

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Start a new crafting session
 */
export function startCraftingSession(recipe: CraftingRecipe, cardIds: string[]): void {
  const sessionId = `craft_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  craftingSession.set({
    id: sessionId,
    recipe,
    selectedCards: cardIds,
    status: 'selecting',
    timestamp: new Date(),
  });

  selectedCards.set(cardIds);
  selectedRecipe.set(recipe);
  craftingState.set('selecting');
}

/**
 * Set the crafting state (for state machine transitions)
 */
export function setCraftingState(state: CraftingState): void {
  craftingState.set(state);

  // Update session if exists
  const session = craftingSession.get();
  if (session) {
    craftingSession.set({
      ...session,
      status: state,
      ...(state === 'success' || state === 'failed' ? { completedAt: new Date() } : {}),
    });
  }
}

/**
 * Toggle a card selection
 */
export function toggleCardSelection(cardId: string): void {
  const current = selectedCards.get();
  const recipe = selectedRecipe.get();

  if (!recipe) return;

  const isSelected = current.includes(cardId);

  if (isSelected) {
    // Deselect card
    selectedCards.set(current.filter((id) => id !== cardId));
  } else {
    // Select card (max inputCount)
    if (current.length < recipe.inputCount) {
      selectedCards.set([...current, cardId]);
    }
  }
}

/**
 * Clear card selection
 */
export function clearCardSelection(): void {
  selectedCards.set([]);
}

/**
 * Execute crafting (determine success/failure)
 */
export function executeCrafting(resultCard: PackCard | null, success: boolean): void {
  const session = craftingSession.get();
  const history = craftingHistory.get();
  const recipe = selectedRecipe.get();
  const cards = selectedCards.get();

  if (!session || !recipe) return;

  // Create history entry
  const historyEntry: CraftingHistoryEntry = {
    id: `history_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    sessionId: session.id,
    recipe,
    inputCards: cards,
    result: resultCard ?? undefined,
    success,
    timestamp: new Date(),
  };

  // Update history
  const newEntries = [historyEntry, ...history.entries].slice(
    0,
    craftingConfig.get().maxHistoryEntries
  );

  craftingHistory.set({
    entries: newEntries,
    totalAttempts: history.totalAttempts + 1,
    successfulCrafts: success ? history.successfulCrafts + 1 : history.successfulCrafts,
    failedCrafts: success ? history.failedCrafts : history.failedCrafts + 1,
    bestCraft: resultCard && (!history.bestCraft || isBetterRarity(resultCard.rarity, history.bestCraft.rarity))
      ? resultCard
      : history.bestCraft,
  });

  // Update session with result
  craftingSession.set({
    ...session,
    result: resultCard ?? undefined,
    status: success ? 'success' : 'failed',
    completedAt: new Date(),
  });

  craftingState.set(success ? 'success' : 'failed');
  craftingUI.setKey('showResult', true);
}

/**
 * Reset crafting session
 */
export function resetCraftingSession(): void {
  craftingSession.set(null);
  craftingState.set('idle');
  selectedCards.set([]);
  selectedRecipe.set(null);
  craftingUI.set({
    showHistory: false,
    showRecipeSelector: false,
    isAnimating: false,
    showResult: false,
  });
}

/**
 * Toggle crafting history view
 */
export function toggleCraftingHistory(): void {
  const current = craftingUI.get();
  craftingUI.setKey('showHistory', !current.showHistory);
}

/**
 * Toggle recipe selector
 */
export function toggleRecipeSelector(): void {
  const current = craftingUI.get();
  craftingUI.setKey('showRecipeSelector', !current.showRecipeSelector);
}

/**
 * Get available recipes (filtered by user's card inventory)
 */
export function getAvailableRecipes(userCardInventory: Map<Rarity, number>): CraftingRecipe[] {
  return CRAFTING_RECIPES.filter((recipe) => {
    const availableCount = userCardInventory.get(recipe.inputRarity) || 0;
    return availableCount >= recipe.inputCount;
  });
}

/**
 * Check if user has enough cards for a recipe
 */
export function hasEnoughCardsForRecipe(
  recipe: CraftingRecipe,
  userCardInventory: Map<Rarity, number>
): boolean {
  const availableCount = userCardInventory.get(recipe.inputRarity) || 0;
  return availableCount >= recipe.inputCount;
}

/**
 * Clear crafting history
 */
export function clearCraftingHistory(): void {
  craftingHistory.set({
    entries: [],
    totalAttempts: 0,
    successfulCrafts: 0,
    failedCrafts: 0,
    bestCraft: null,
  });
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Compare rarities to determine which is better
 */
function isBetterRarity(rarity1: Rarity, rarity2: Rarity): boolean {
  return RARITY_ORDER[rarity1] > RARITY_ORDER[rarity2];
}

/**
 * Get crafting statistics from history
 */
export function getCraftingStats() {
  const history = craftingHistory.get();

  // Calculate success rate by recipe
  const statsByRecipe: Record<string, { attempts: number; successes: number }> = {};

  history.entries.forEach((entry) => {
    if (!statsByRecipe[entry.recipe.id]) {
      statsByRecipe[entry.recipe.id] = { attempts: 0, successes: 0 };
    }
    statsByRecipe[entry.recipe.id].attempts++;
    if (entry.success) {
      statsByRecipe[entry.recipe.id].successes++;
    }
  });

  return {
    totalAttempts: history.totalAttempts,
    successfulCrafts: history.successfulCrafts,
    failedCrafts: history.failedCrafts,
    successRate: history.totalAttempts > 0
      ? history.successfulCrafts / history.totalAttempts
      : 0,
    bestCraft: history.bestCraft,
    statsByRecipe,
  };
}

/**
 * Roll for crafting success based on recipe success rate
 */
export function rollCraftingSuccess(recipe: CraftingRecipe): boolean {
  return Math.random() < recipe.successRate;
}

/**
 * Calculate how many cards to return on failure
 */
export function calculateReturnOnFailure(recipe: CraftingRecipe): number {
  if (!recipe.failReturnRate) return 0;

  const inputCount = recipe.inputCount;
  const returnRate = recipe.failReturnRate;

  // Round up to return at least 1 card if rate > 0
  return Math.ceil(inputCount * returnRate);
}
