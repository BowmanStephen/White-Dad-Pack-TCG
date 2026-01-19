import { atom, computed } from 'nanostores';
import type {
  CraftingRecipe,
  CraftingSession,
  CraftingHistory,
  CraftingHistoryEntry,
  CraftingConfig,
  CraftingState,
} from '@/types/crafting';
import type { PackCard, Rarity } from '@/types';
import { showToast } from './ui';
import { getRandomCardByRarity } from '@/lib/cards/database';

// ============================================================================
// CRAFTING CONFIG
// ============================================================================

export const DEFAULT_CRAFTING_CONFIG: CraftingConfig = {
  maxHistoryEntries: 100,
  enableSoundEffects: true,
  animationDuration: 2000,
};

// ============================================================================
// CRAFTING RECIPES
// ============================================================================

/**
 * All crafting recipes in the game.
 * Recipes start locked and are discovered through gameplay.
 */
export const CRAFTING_RECIPES: Record<string, CraftingRecipe> = {
  common_to_uncommon: {
    id: 'common_to_uncommon',
    name: 'Basic Refinement',
    description: 'Combine 5 Common cards to create 1 Uncommon card. A simple yet reliable recipe.',
    inputRarity: 'common',
    inputCount: 5,
    outputRarity: 'uncommon',
    outputCount: 1,
    successRate: 1.0,
  },
  uncommon_to_rare: {
    id: 'uncommon_to_rare',
    name: 'Rare Enhancement',
    description: 'Combine 5 Uncommon cards for a 50% chance to create 1 Rare card. On failure, 60% of materials are returned.',
    inputRarity: 'uncommon',
    inputCount: 5,
    outputRarity: 'rare',
    outputCount: 1,
    successRate: 0.5,
    failReturnRate: 0.6,
  },
  rare_to_epic: {
    id: 'rare_to_epic',
    name: 'Epic Fusion',
    description: 'Combine 5 Rare cards for a 30% chance to create 1 Epic card. On failure, 60% of materials are returned.',
    inputRarity: 'rare',
    inputCount: 5,
    outputRarity: 'epic',
    outputCount: 1,
    successRate: 0.3,
    failReturnRate: 0.6,
  },
  epic_to_legendary: {
    id: 'epic_to_legendary',
    name: 'Legendary Forging',
    description: 'Combine 5 Epic cards for a 10% chance to create 1 Legendary card. On failure, 60% of materials are returned.',
    inputRarity: 'epic',
    inputCount: 5,
    outputRarity: 'legendary',
    outputCount: 1,
    successRate: 0.1,
    failReturnRate: 0.6,
  },
  legendary_to_mythic: {
    id: 'legendary_to_mythic',
    name: 'Mythic Transmutation',
    description: 'Combine 5 Legendary cards for a 15% chance to create 1 Mythic card. On failure, 20% of materials are returned.',
    inputRarity: 'legendary',
    inputCount: 5,
    outputRarity: 'mythic',
    outputCount: 1,
    successRate: 0.15,
    failReturnRate: 0.2,
  },
  // Advanced recipes
  common_to_rare_direct: {
    id: 'common_to_rare_direct',
    name: 'Quick Ascension',
    description: 'Combine 10 Common cards to create 1 Rare card directly. 80% success rate.',
    inputRarity: 'common',
    inputCount: 10,
    outputRarity: 'rare',
    outputCount: 1,
    successRate: 0.8,
    failReturnRate: 0.5,
  },
  mixed_rare_batch: {
    id: 'mixed_rare_batch',
    name: 'Mixed Rare Batch',
    description: 'Combine 3 Uncommon and 2 Rare cards for a 70% chance to create 1 Epic card.',
    inputRarity: 'uncommon',
    inputCount: 5,
    outputRarity: 'epic',
    outputCount: 1,
    successRate: 0.7,
    failReturnRate: 0.5,
  },
  holo_boost: {
    id: 'holo_boost',
    name: 'Holo Infusion',
    description: 'Combine 5 Rare cards (at least 2 Holo) for a 40% chance to create a guaranteed Holo Rare card.',
    inputRarity: 'rare',
    inputCount: 5,
    outputRarity: 'rare',
    outputCount: 1,
    successRate: 0.4,
    failReturnRate: 0.6,
  },
};

/**
 * Recipe discovery hints.
 * Each recipe has a hint that helps players discover it.
 */
export const RECIPE_HINTS: Record<string, string> = {
  common_to_uncommon: 'Sometimes combining the basics leads to something better...',
  uncommon_to_rare: 'Quality begets quality. Five of the same tier might refine into something greater.',
  rare_to_epic: 'Great risk, great reward. Half the materials lost on failure, but the prize is sweet.',
  epic_to_legendary: 'Only the finest materials can forge legends. The path is treacherous.',
  legendary_to_mythic: 'Transcendence itself. The ultimate fusion, with the greatest risk.',
  common_to_rare_direct: 'Quantity can sometimes substitute for quality. A direct, albeit risky, path.',
  mixed_rare_batch: 'Different rarities can harmonize. Uncommon and Rare together might create Epic results.',
  holo_boost: 'The shine of holo cards carries power. Infuse your crafting with holographic essence.',
};

/**
 * Starter recipes - automatically discovered when crafting is first unlocked.
 */
export const STARTER_RECIPES = ['common_to_uncommon', 'uncommon_to_rare'];

// ============================================================================
// STORAGE HELPERS (SSR-safe)
// ============================================================================

/**
 * SSR-safe localStorage helper
 */
function getStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageValue<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
}

// ============================================================================
// CRAFTING STATE
// ============================================================================

/**
 * Discovered recipes - stores which recipes the player has discovered.
 * Uses SSR-safe localStorage access.
 */
const discoveredRecipesStorage = atom<Set<string>>(
  new Set(getStorageValue<string[]>('daddeck-discovered-recipes', STARTER_RECIPES))
);

// Subscribe to save changes to localStorage
if (typeof window !== 'undefined') {
  discoveredRecipesStorage.subscribe((recipes) => {
    setStorageValue('daddeck-discovered-recipes', [...recipes]);
  });
}

export const discoveredRecipes = discoveredRecipesStorage;

/**
 * Favorite recipes - stores which recipes the player has favorited.
 * Uses SSR-safe localStorage access.
 */
const favoriteRecipesStorage = atom<Set<string>>(
  new Set(getStorageValue<string[]>('daddeck-favorite-recipes', []))
);

// Subscribe to save changes to localStorage (only on client)
let favoriteRecipesUnsub: (() => void) | null = null;
if (typeof window !== 'undefined') {
  favoriteRecipesUnsub = favoriteRecipesStorage.subscribe((recipes) => {
    setStorageValue('daddeck-favorite-recipes', [...recipes]);
  });
}

export const favoriteRecipes = favoriteRecipesStorage;

/**
 * Crafting session - current active crafting operation.
 */
export const craftingSession = atom<CraftingSession | null>(null);

/**
 * Crafting history - all past crafting attempts.
 */
const craftingHistoryStorage = atom<CraftingHistory>(
  getStorageValue<CraftingHistory>('daddeck-crafting-history', {
    entries: [],
    totalAttempts: 0,
    successfulCrafts: 0,
    failedCrafts: 0,
    bestCraft: null,
  })
);

// Subscribe to save changes to localStorage
if (typeof window !== 'undefined') {
  craftingHistoryStorage.subscribe((history) => {
    setStorageValue('daddeck-crafting-history', history);
  });
}

export const craftingHistory = craftingHistoryStorage;

/**
 * Crafting state - current state machine state.
 */
export const craftingState = atom<CraftingState>('idle');

/**
 * Discovered recipes list (computed from discoveredRecipes Set).
 */
export const discoveredRecipesList = computed(discoveredRecipes, (set) => [...set]);

/**
 * Undiscovered recipes list (computed).
 */
export const undiscoveredRecipesList = computed(
  discoveredRecipesList,
  (discovered) =>
    Object.values(CRAFTING_RECIPES).filter((recipe) => !discovered.includes(recipe.id))
);

/**
 * All recipes with discovery status (computed).
 */
export const allRecipesWithStatus = computed(discoveredRecipesList, (discovered) =>
  Object.values(CRAFTING_RECIPES).map((recipe) => ({
    ...recipe,
    isDiscovered: discovered.includes(recipe.id),
    hint: RECIPE_HINTS[recipe.id] || '',
  }))
);

/**
 * Favorite recipes list (computed from favoriteRecipes Set).
 */
export const favoriteRecipesList = computed(favoriteRecipes, (set) => [...set]);

/**
 * Discovered recipes with favorite status (computed).
 */
export const discoveredRecipesWithFavoriteStatus = computed(
  [discoveredRecipesList, favoriteRecipesList],
  (discovered, favorites) =>
    Object.values(CRAFTING_RECIPES)
      .filter((recipe) => discovered.includes(recipe.id))
      .map((recipe) => ({
        ...recipe,
        isFavorite: favorites.includes(recipe.id),
      }))
);

/**
 * Favorite recipes only (computed).
 */
export const favoriteRecipesOnly = computed(
  [discoveredRecipesList, favoriteRecipesList],
  (discovered, favorites) =>
    Object.values(CRAFTING_RECIPES).filter(
      (recipe) => discovered.includes(recipe.id) && favorites.includes(recipe.id)
    )
);

// ============================================================================
// CRAFTING ACTIONS
// ============================================================================

/**
 * Start a new crafting session.
 */
export function startCraftingSession(recipeId: string): void {
  const recipe = CRAFTING_RECIPES[recipeId];
  if (!recipe) {
    console.error(`Recipe ${recipeId} not found`);
    return;
  }

  craftingSession.set({
    id: crypto.randomUUID(),
    recipe,
    selectedCards: [],
    status: 'selecting',
    timestamp: new Date(),
  });
  craftingState.set('selecting');
}

/**
 * Add a card to the current crafting session.
 */
export function selectCard(cardId: string): void {
  const session = craftingSession.get();
  if (!session) return;

  const { recipe, selectedCards } = session;

  // Check if card is already selected
  if (selectedCards.includes(cardId)) return;

  // Check if session is full
  if (selectedCards.length >= recipe.inputCount) return;

  craftingSession.set({
    ...session,
    selectedCards: [...selectedCards, cardId],
  });
}

/**
 * Remove a card from the current crafting session.
 */
export function deselectCard(cardId: string): void {
  const session = craftingSession.get();
  if (!session) return;

  craftingSession.set({
    ...session,
    selectedCards: session.selectedCards.filter((id) => id !== cardId),
  });
}

/**
 * Execute the crafting operation.
 */
export async function executeCraft(inputCards: PackCard[]): Promise<PackCard | null> {
  const session = craftingSession.get();
  if (!session) return null;

  const { recipe } = session;

  // Update state to crafting
  craftingSession.set({
    ...session,
    status: 'crafting',
  });
  craftingState.set('crafting');

  // Simulate crafting delay
  await new Promise((resolve) => setTimeout(resolve, DEFAULT_CRAFTING_CONFIG.animationDuration));

  // Roll for success
  const successRoll = Math.random();
  const success = successRoll < recipe.successRate;

  let resultCard: PackCard | null = null;

  if (success) {
    // Generate result card from database with proper rarity
    const baseCard = getRandomCardByRarity(recipe.outputRarity);

    // Defensive handling: if no cards of target rarity exist, fail gracefully
    if (!baseCard) {
      console.error(`No cards found in database with rarity: ${recipe.outputRarity}`);
      craftingState.set('failed');
      showToast(`Error: No ${recipe.outputRarity} cards available in database`, 'error');
      return null;
    }

    // Create PackCard from database Card with holo chance
    const holoRoll = Math.random();
    const isHolo = holoRoll < 0.167; // 1 in 6 chance for holo

    resultCard = {
      ...baseCard,
      id: crypto.randomUUID(), // Unique ID for crafted card
      isHolo,
      isRevealed: true,
      holoType: isHolo ? 'standard' : 'none',
    };

    // Discover recipe if not already discovered
    const discovered = discoveredRecipes.get();
    if (!discovered.has(recipe.id)) {
      discovered.add(recipe.id);
      discoveredRecipes.set(new Set(discovered));

      // Trigger celebration event
      dispatchRecipeDiscoveryEvent(recipe.id);
    }
  }

  // Create history entry
  const historyEntry: CraftingHistoryEntry = {
    id: crypto.randomUUID(),
    sessionId: session.id,
    recipe,
    inputCards: inputCards.map((card) => card.id),
    result: resultCard || undefined,
    success,
    timestamp: new Date(),
  };

  // Update history
  const history = craftingHistory.get();
  const newHistory: CraftingHistory = {
    entries: [historyEntry, ...history.entries].slice(0, DEFAULT_CRAFTING_CONFIG.maxHistoryEntries),
    totalAttempts: history.totalAttempts + 1,
    successfulCrafts: history.successfulCrafts + (success ? 1 : 0),
    failedCrafts: history.failedCrafts + (success ? 0 : 1),
    bestCraft: resultCard && (!history.bestCraft || isHigherRarity(resultCard.rarity, history.bestCraft.rarity))
      ? resultCard
      : history.bestCraft,
  };
  craftingHistory.set(newHistory);

  // Update session state
  craftingSession.set({
    ...session,
    status: success ? 'success' : 'failed',
    result: resultCard || undefined,
    completedAt: new Date(),
  });
  craftingState.set(success ? 'success' : 'failed');

  // Show toast notification for crafting result (PACK-080)
  if (success) {
    const rarityLabel = recipe.outputRarity.charAt(0).toUpperCase() + recipe.outputRarity.slice(1);
    const holoText = resultCard?.isHolo ? ' Holo!' : '';
    showToast(`Card crafted: ${rarityLabel}${holoText}`, 'success');
  } else {
    showToast(`Crafting failed. Try again!`, 'error');
  }

  return resultCard;
}

/**
 * Cancel the current crafting session.
 */
export function cancelCraftingSession(): void {
  craftingSession.set(null);
  craftingState.set('idle');
}

/**
 * Clear crafting history.
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

/**
 * Reset discovered recipes (debug/testing only).
 */
export function resetDiscoveredRecipes(): void {
  discoveredRecipes.set(new Set(STARTER_RECIPES));
}

/**
 * Check if a recipe is discovered.
 */
export function isRecipeDiscovered(recipeId: string): boolean {
  return discoveredRecipes.get().has(recipeId);
}

/**
 * Get hint for an undiscovered recipe.
 */
export function getRecipeHint(recipeId: string): string | null {
  if (isRecipeDiscovered(recipeId)) {
    return null; // No hint for discovered recipes
  }
  return RECIPE_HINTS[recipeId] || null;
}

/**
 * Get all discovered recipes.
 */
export function getDiscoveredRecipes(): CraftingRecipe[] {
  const discovered = discoveredRecipes.get();
  return [...discovered].map((id) => CRAFTING_RECIPES[id]).filter(Boolean);
}

/**
 * Get all undiscovered recipes with hints.
 */
export function getUndiscoveredRecipesWithHints(): Array<{ recipe: CraftingRecipe; hint: string }> {
  const discovered = discoveredRecipes.get();
  return Object.values(CRAFTING_RECIPES)
    .filter((recipe) => !discovered.has(recipe.id))
    .map((recipe) => ({
      recipe,
      hint: RECIPE_HINTS[recipe.id] || '',
    }));
}

/**
 * Toggle recipe favorite status.
 */
export function toggleRecipeFavorite(recipeId: string): void {
  const favorites = favoriteRecipes.get();
  const newFavorites = new Set(favorites);

  if (newFavorites.has(recipeId)) {
    newFavorites.delete(recipeId);
  } else {
    newFavorites.add(recipeId);
  }

  favoriteRecipes.set(newFavorites);
}

/**
 * Check if a recipe is favorited.
 */
export function isRecipeFavorite(recipeId: string): boolean {
  return favoriteRecipes.get().has(recipeId);
}

/**
 * Add recipe to favorites.
 */
export function addRecipeToFavorites(recipeId: string): void {
  const favorites = favoriteRecipes.get();
  if (!favorites.has(recipeId)) {
    favoriteRecipes.set(new Set(favorites).add(recipeId));
  }
}

/**
 * Remove recipe from favorites.
 */
export function removeRecipeFromFavorites(recipeId: string): void {
  const favorites = favoriteRecipes.get();
  if (favorites.has(recipeId)) {
    const newFavorites = new Set(favorites);
    newFavorites.delete(recipeId);
    favoriteRecipes.set(newFavorites);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if rarity1 is higher than rarity2.
 */
function isHigherRarity(rarity1: Rarity, rarity2: Rarity): boolean {
  const rarityOrder: Record<Rarity, number> = {
    common: 0,
    uncommon: 1,
    rare: 2,
    epic: 3,
    legendary: 4,
    mythic: 5,
  };
  return rarityOrder[rarity1] > rarityOrder[rarity2];
}

/**
 * Dispatch custom event for recipe discovery (for celebration UI).
 */
function dispatchRecipeDiscoveryEvent(recipeId: string): void {
  if (typeof window === 'undefined') return;
  const event = new CustomEvent('recipe-discovered', {
    detail: { recipeId, recipe: CRAFTING_RECIPES[recipeId] },
  });
  window.dispatchEvent(event);
}
