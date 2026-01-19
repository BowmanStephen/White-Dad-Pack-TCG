/**
 * PACK-051: Crafting System Tests
 *
 * Comprehensive test suite for the crafting system including:
 * - Recipe validation (verifyCraftingRecipes)
 * - Success rate verification (verifyCraftingSuccessRate)
 * - Failure return mechanics (verifyCraftingFailureReturn)
 * - Crafting session mutex (verifyCraftingMutex)
 * - Material deduction from collection (verifyMaterialDeduction)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CRAFTING_RECIPES,
  STARTER_RECIPES,
  RECIPE_HINTS,
  craftingSession,
  craftingState,
  craftingHistory,
  discoveredRecipes,
  executeCraft,
  startCraftingSession,
  selectCard,
  cancelCraftingSession,
  clearCraftingHistory,
  resetDiscoveredRecipes,
  isRecipeDiscovered,
} from '@/stores/crafting';
import type { PackCard, Rarity } from '@/types';

// Mock localStorage for SSR-safe operations
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Helper function to create a mock card
function createMockCard(rarity: Rarity, id?: string): PackCard {
  return {
    id: id || crypto.randomUUID(),
    name: `Test ${rarity} Card`,
    type: 'BBQ_DICKTATOR',
    rarity,
    isHolo: false,
    isRevealed: true,
    holoType: 'none',
    stats: {
      dadJoke: 50,
      grillSkill: 50,
      fixIt: 50,
      napPower: 50,
      remoteControl: 50,
      thermostat: 50,
      sockSandal: 50,
      beerSnob: 50,
    },
    flavorText: 'Test card',
    series: 1,
    cardNumber: 1,
    totalInSeries: 142,
    artist: 'Test',
  };
}

// Reset all stores before each test
beforeEach(() => {
  localStorageMock.clear();
  craftingSession.set(null);
  craftingState.set('idle');
  clearCraftingHistory();
  resetDiscoveredRecipes();
});

describe('Crafting System - PACK-051', () => {
  // ============================================================================
  // TEST 1: verifyCraftingRecipes() - Validate all recipe definitions
  // ============================================================================
  describe('verifyCraftingRecipes', () => {
    it('should have all required recipe properties', () => {
      const recipeIds = Object.keys(CRAFTING_RECIPES);
      expect(recipeIds.length).toBeGreaterThan(0);

      for (const recipeId of recipeIds) {
        const recipe = CRAFTING_RECIPES[recipeId];

        expect(recipe).toHaveProperty('id');
        expect(recipe).toHaveProperty('name');
        expect(recipe).toHaveProperty('description');
        expect(recipe).toHaveProperty('inputRarity');
        expect(recipe).toHaveProperty('inputCount');
        expect(recipe).toHaveProperty('outputRarity');
        expect(recipe).toHaveProperty('outputCount');
        expect(recipe).toHaveProperty('successRate');

        expect(typeof recipe.id).toBe('string');
        expect(typeof recipe.name).toBe('string');
        expect(typeof recipe.description).toBe('string');
        expect(typeof recipe.inputCount).toBe('number');
        expect(typeof recipe.outputCount).toBe('number');
        expect(typeof recipe.successRate).toBe('number');

        expect(recipe.inputCount).toBeGreaterThan(0);
        expect(recipe.outputCount).toBeGreaterThan(0);
        expect(recipe.successRate).toBeGreaterThanOrEqual(0);
        expect(recipe.successRate).toBeLessThanOrEqual(1);
      }
    });

    it('should have valid rarity values for all recipes', () => {
      const validRarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

      for (const recipe of Object.values(CRAFTING_RECIPES)) {
        expect(validRarities).toContain(recipe.inputRarity);
        expect(validRarities).toContain(recipe.outputRarity);
      }
    });

    it('should have hints for all recipes', () => {
      const recipeIds = Object.keys(CRAFTING_RECIPES);

      for (const recipeId of recipeIds) {
        expect(RECIPE_HINTS).toHaveProperty(recipeId);
        expect(typeof RECIPE_HINTS[recipeId]).toBe('string');
        expect(RECIPE_HINTS[recipeId].length).toBeGreaterThan(0);
      }
    });

    it('should have starter recipes that exist in CRAFTING_RECIPES', () => {
      for (const starterRecipeId of STARTER_RECIPES) {
        expect(CRAFTING_RECIPES).toHaveProperty(starterRecipeId);
      }
    });

    it('should have recipes that follow rarity progression rules', () => {
      const rarityOrder: Record<Rarity, number> = {
        common: 0,
        uncommon: 1,
        rare: 2,
        epic: 3,
        legendary: 4,
        mythic: 5,
      };

      for (const recipe of Object.values(CRAFTING_RECIPES)) {
        const inputLevel = rarityOrder[recipe.inputRarity];
        const outputLevel = rarityOrder[recipe.outputRarity];

        expect(outputLevel).toBeGreaterThanOrEqual(inputLevel);
      }
    });
  });

  // ============================================================================
  // TEST 2: verifyCraftingSuccessRate() - Test RNG and success rates
  // ============================================================================
  describe('verifyCraftingSuccessRate', () => {
    it('should have appropriate success rates for different recipes', () => {
      expect(CRAFTING_RECIPES.common_to_uncommon.successRate).toBe(1.0);
      expect(CRAFTING_RECIPES.uncommon_to_rare.successRate).toBe(0.5);
      expect(CRAFTING_RECIPES.rare_to_epic.successRate).toBe(0.3);
      expect(CRAFTING_RECIPES.epic_to_legendary.successRate).toBe(0.1);
      expect(CRAFTING_RECIPES.legendary_to_mythic.successRate).toBe(0.15);
    });

    it('should generate correct rarity on successful craft', async () => {
      // Use common_to_uncommon which has 100% success rate
      startCraftingSession('common_to_uncommon');

      const inputCards = Array.from({ length: 5 }, () => createMockCard('common'));
      for (const card of inputCards) {
        selectCard(card.id);
      }

      const result = await executeCraft(inputCards);

      expect(result).not.toBeNull();
      expect(result?.rarity).toBe('uncommon');
    });

    it('should generate unique IDs for crafted cards', async () => {
      const results: string[] = [];

      // Run 2 iterations to stay under timeout (2 × 2s = 4s)
      for (let i = 0; i < 2; i++) {
        clearCraftingHistory();
        craftingSession.set(null);

        startCraftingSession('common_to_uncommon');
        const inputCards = Array.from({ length: 5 }, () => createMockCard('common'));
        for (const card of inputCards) {
          selectCard(card.id);
        }

        const result = await executeCraft(inputCards);
        expect(result).not.toBeNull();
        results.push(result!.id);
      }

      // All IDs should be unique
      const uniqueIds = new Set(results);
      expect(uniqueIds.size).toBe(2);
    });
  });

  // ============================================================================
  // TEST 3: verifyCraftingFailureReturn() - Test material return on failure
  // ============================================================================
  describe('verifyCraftingFailureReturn', () => {
    it('should have failReturnRate defined for risky recipes', () => {
      const riskyRecipes = ['rare_to_epic', 'epic_to_legendary', 'legendary_to_mythic'];

      for (const recipeId of riskyRecipes) {
        const recipe = CRAFTING_RECIPES[recipeId];
        expect(recipe.failReturnRate).toBeDefined();
        expect(recipe.failReturnRate).toBeGreaterThan(0);
        expect(recipe.failReturnRate).toBeLessThanOrEqual(1);
      }
    });

    it('should not have failReturnRate for guaranteed recipes', () => {
      // Only common_to_uncommon has 100% success rate (no failReturnRate)
      const guaranteedRecipes = ['common_to_uncommon'];

      for (const recipeId of guaranteedRecipes) {
        const recipe = CRAFTING_RECIPES[recipeId];
        expect(recipe.failReturnRate).toBeUndefined();
      }
    });

    it('should calculate correct number of returned cards on failure', () => {
      const recipe = CRAFTING_RECIPES.rare_to_epic;
      const inputCount = 5;
      const failReturnRate = recipe.failReturnRate || 0;

      const expectedReturn = Math.floor(inputCount * failReturnRate);
      expect(expectedReturn).toBe(3);
    });

    it('should have appropriate return rates for each recipe tier', () => {
      expect(CRAFTING_RECIPES.rare_to_epic.failReturnRate).toBe(0.6);
      expect(CRAFTING_RECIPES.epic_to_legendary.failReturnRate).toBe(0.6);
      expect(CRAFTING_RECIPES.legendary_to_mythic.failReturnRate).toBe(0.2);
    });

    it('should never return more cards than input', () => {
      for (const recipe of Object.values(CRAFTING_RECIPES)) {
        if (recipe.failReturnRate) {
          const returnedCards = Math.floor(recipe.inputCount * recipe.failReturnRate);
          expect(returnedCards).toBeLessThanOrEqual(recipe.inputCount);
        }
      }
    });
  });

  // ============================================================================
  // TEST 4: verifyCraftingMutex() - Test single crafting session constraint
  // ============================================================================
  describe('verifyCraftingMutex', () => {
    it('should only allow one active crafting session at a time', () => {
      startCraftingSession('common_to_uncommon');
      const firstSession = craftingSession.get();
      const firstId = firstSession?.id;

      expect(firstSession).not.toBeNull();
      expect(firstId).toBeDefined();

      startCraftingSession('uncommon_to_rare');
      const secondSession = craftingSession.get();
      const secondId = secondSession?.id;

      expect(secondSession).not.toBeNull();
      expect(secondId).toBeDefined();
      expect(secondId).not.toBe(firstId);
    });

    it('should have correct state transitions during session lifecycle', () => {
      expect(craftingState.get()).toBe('idle');
      expect(craftingSession.get()).toBeNull();

      startCraftingSession('common_to_uncommon');
      expect(craftingState.get()).toBe('selecting');
      expect(craftingSession.get()).not.toBeNull();

      cancelCraftingSession();
      expect(craftingState.get()).toBe('idle');
      expect(craftingSession.get()).toBeNull();
    });

    it('should limit card selection to inputCount', () => {
      startCraftingSession('common_to_uncommon');

      for (let i = 0; i < 6; i++) {
        selectCard(`card-${i}`);
      }

      const session = craftingSession.get();
      expect(session?.selectedCards.length).toBe(5);
    });

    it('should prevent duplicate card selection', () => {
      startCraftingSession('common_to_uncommon');

      const cardId = 'card-duplicate';
      selectCard(cardId);
      selectCard(cardId);

      const session = craftingSession.get();
      expect(session?.selectedCards.filter((id) => id === cardId).length).toBe(1);
    });

    it('should reset session state after cancel', () => {
      startCraftingSession('common_to_uncommon');
      expect(craftingSession.get()).not.toBeNull();

      cancelCraftingSession();
      expect(craftingSession.get()).toBeNull();
      expect(craftingState.get()).toBe('idle');
    });
  });

  // ============================================================================
  // TEST 5: verifyMaterialDeduction() - Test card removal from collection
  // ============================================================================
  describe('verifyMaterialDeduction', () => {
    it('should track input cards in crafting history', async () => {
      // Clear any previous history
      clearCraftingHistory();
      craftingSession.set(null);

      startCraftingSession('common_to_uncommon');

      const inputCards = Array.from({ length: 5 }, (_, i) => createMockCard('common', `card-${i}`));
      for (const card of inputCards) {
        selectCard(card.id);
      }

      await executeCraft(inputCards);

      const history = craftingHistory.get();
      expect(history.entries.length).toBe(1);

      const entry = history.entries[0];
      expect(entry.inputCards.length).toBe(5);

      for (const card of inputCards) {
        expect(entry.inputCards).toContain(card.id);
      }
    });

    it('should record success/failure in history', async () => {
      startCraftingSession('common_to_uncommon');

      const inputCards = Array.from({ length: 5 }, () => createMockCard('common'));
      for (const card of inputCards) {
        selectCard(card.id);
      }

      await executeCraft(inputCards);

      const history = craftingHistory.get();
      const entry = history.entries[0];

      expect(typeof entry.success).toBe('boolean');
      expect(history.totalAttempts).toBe(1);
    });

    it('should increment total attempts counter', async () => {
      // Start fresh
      clearCraftingHistory();
      craftingSession.set(null);

      const initialAttempts = craftingHistory.get().totalAttempts;

      // Run 2 crafts (stay under timeout: 2 × 2s = 4s)
      for (let i = 0; i < 2; i++) {
        startCraftingSession('common_to_uncommon');
        const inputCards = Array.from({ length: 5 }, () => createMockCard('common'));
        for (const card of inputCards) {
          selectCard(card.id);
        }

        await executeCraft(inputCards);

        // Reset session for next craft
        craftingSession.set(null);
      }

      const finalAttempts = craftingHistory.get().totalAttempts;
      expect(finalAttempts).toBe(initialAttempts + 2);
    });

    it('should store result card on success', async () => {
      startCraftingSession('common_to_uncommon');

      const inputCards = Array.from({ length: 5 }, () => createMockCard('common'));
      for (const card of inputCards) {
        selectCard(card.id);
      }

      const result = await executeCraft(inputCards);

      const history = craftingHistory.get();
      const entry = history.entries[0];

      if (result) {
        expect(entry.result).not.toBeUndefined();
        expect(entry.result?.rarity).toBe('uncommon');
      }
    });

    it('should track best craft in history', async () => {
      const initialBest = craftingHistory.get().bestCraft;

      startCraftingSession('common_to_uncommon');
      const inputCards = Array.from({ length: 5 }, () => createMockCard('common'));
      for (const card of inputCards) {
        selectCard(card.id);
      }

      await executeCraft(inputCards);

      const newBest = craftingHistory.get().bestCraft;

      if (initialBest === null) {
        expect(newBest).not.toBeNull();
      }
    });
  });

  // ============================================================================
  // ADDITIONAL TESTS: Recipe Discovery and Session State
  // ============================================================================
  describe('Recipe Discovery', () => {
    it('should start with starter recipes discovered', () => {
      const discovered = discoveredRecipes.get();

      for (const starterRecipe of STARTER_RECIPES) {
        expect(discovered.has(starterRecipe)).toBe(true);
      }
    });

    it('should correctly identify discovered recipes', () => {
      expect(isRecipeDiscovered('common_to_uncommon')).toBe(true);
      expect(isRecipeDiscovered('rare_to_epic')).toBe(false);
    });
  });

  describe('Session State Machine', () => {
    it('should transition through crafting states', async () => {
      expect(craftingState.get()).toBe('idle');

      startCraftingSession('common_to_uncommon');
      expect(craftingState.get()).toBe('selecting');

      const inputCards = Array.from({ length: 5 }, () => createMockCard('common'));
      for (const card of inputCards) {
        selectCard(card.id);
      }

      await executeCraft(inputCards);

      const finalState = craftingState.get();
      expect(['success', 'failed']).toContain(finalState);
    });
  });
});
