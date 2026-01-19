import { describe, it, expect } from 'vitest';
import { canAffordCraft, rollCraftingSuccess } from '../../../src/lib/crafting/executor';
import { calculateCraftingCost } from '../../../src/lib/crafting/index';
import type { CraftingRecipe } from '@/types/crafting';
import type { Rarity } from '@/types';

/**
 * TEST-002: Crafting System Unit Tests
 *
 * Comprehensive test suite for crafting execution functions including:
 * - Affordability checks with various currency amounts
 * - Success rate rolling across different probability tiers
 * - Edge cases: empty inventory, max cost, zero success rate
 * - Cost calculation verification
 *
 * Coverage Targets:
 * - canAffordCraft(): 100%
 * - rollCraftingSuccess(): 100%
 * - Edge cases and error conditions
 */

describe('TEST-002: Crafting System', () => {
  // Helper function to create test recipes
  function createRecipe(
    inputRarity: Rarity,
    outputRarity: Rarity,
    successRate: number,
    inputCount: number = 5
  ): CraftingRecipe {
    return {
      id: `test_${inputRarity}_to_${outputRarity}`,
      name: `Test ${inputRarity} to ${outputRarity}`,
      description: `Convert ${inputCount} ${inputRarity} cards to ${outputRarity}`,
      inputRarity,
      inputCount,
      outputRarity,
      outputCount: 1,
      successRate,
      failReturnRate: 0.6,
    };
  }

  describe('canAffordCraft()', () => {
    describe('Basic affordability checks', () => {
      it('should return true when player has exactly the required currency', () => {
        const recipe = createRecipe('common', 'uncommon', 1.0);
        const cost = calculateCraftingCost(recipe);
        const playerCurrency = cost;

        expect(canAffordCraft(recipe, playerCurrency)).toBe(true);
      });

      it('should return true when player has more than required currency', () => {
        const recipe = createRecipe('common', 'uncommon', 1.0);
        const cost = calculateCraftingCost(recipe);
        const playerCurrency = cost + 100;

        expect(canAffordCraft(recipe, playerCurrency)).toBe(true);
      });

      it('should return false when player has less than required currency', () => {
        const recipe = createRecipe('common', 'uncommon', 1.0);
        const cost = calculateCraftingCost(recipe);
        const playerCurrency = cost - 1;

        expect(canAffordCraft(recipe, playerCurrency)).toBe(false);
      });

      it('should return false when player has no currency', () => {
        const recipe = createRecipe('common', 'uncommon', 1.0);
        const playerCurrency = 0;

        expect(canAffordCraft(recipe, playerCurrency)).toBe(false);
      });
    });

    describe('Affordability across different rarities', () => {
      it('should correctly check affordability for common recipe', () => {
        const recipe = createRecipe('common', 'uncommon', 1.0);
        const cost = calculateCraftingCost(recipe);

        expect(canAffordCraft(recipe, cost)).toBe(true);
        expect(canAffordCraft(recipe, cost - 1)).toBe(false);
      });

      it('should correctly check affordability for rare recipe', () => {
        const recipe = createRecipe('rare', 'epic', 0.5);
        const cost = calculateCraftingCost(recipe);

        expect(canAffordCraft(recipe, cost)).toBe(true);
        expect(canAffordCraft(recipe, cost - 1)).toBe(false);
      });

      it('should correctly check affordability for legendary recipe', () => {
        const recipe = createRecipe('legendary', 'mythic', 0.1);
        const cost = calculateCraftingCost(recipe);

        expect(canAffordCraft(recipe, cost)).toBe(true);
        expect(canAffordCraft(recipe, cost - 1)).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('should handle zero cost recipe (edge case)', () => {
        const recipe: CraftingRecipe = {
          id: 'free_craft',
          name: 'Free Craft',
          description: 'Craft without cost',
          inputRarity: 'common',
          inputCount: 0,
          outputRarity: 'uncommon',
          outputCount: 1,
          successRate: 1.0,
        };

        // Even with 0 currency, should be affordable
        expect(canAffordCraft(recipe, 0)).toBe(true);
        expect(canAffordCraft(recipe, 100)).toBe(true);
      });

      it('should handle very large currency amounts', () => {
        const recipe = createRecipe('mythic', 'mythic', 0.01);
        const maxCurrency = Number.MAX_SAFE_INTEGER;

        expect(canAffordCraft(recipe, maxCurrency)).toBe(true);
      });

      it('should handle negative currency (edge case)', () => {
        const recipe = createRecipe('common', 'uncommon', 1.0);
        const negativeCurrency = -100;

        // Negative currency should not afford anything
        expect(canAffordCraft(recipe, negativeCurrency)).toBe(false);
      });
    });
  });

  describe('rollCraftingSuccess()', () => {
    describe('Guaranteed success recipes', () => {
      it('should always return true for 100% success rate', () => {
        const recipe = createRecipe('common', 'uncommon', 1.0);

        // Test multiple times
        for (let i = 0; i < 100; i++) {
          expect(rollCraftingSuccess(recipe)).toBe(true);
        }
      });

      it('should always return true for >100% success rate (edge case)', () => {
        const recipe = createRecipe('common', 'uncommon', 1.5);

        for (let i = 0; i < 100; i++) {
          expect(rollCraftingSuccess(recipe)).toBe(true);
        }
      });
    });

    describe('Probabilistic recipes', () => {
      it('should return true ~50% of the time for 50% success rate', () => {
        const recipe = createRecipe('rare', 'epic', 0.5);
        const ROLLS = 10000;
        let successCount = 0;

        for (let i = 0; i < ROLLS; i++) {
          if (rollCraftingSuccess(recipe)) {
            successCount++;
          }
        }

        const successRate = successCount / ROLLS;
        const tolerance = 0.02; // ±2%

        expect(
          Math.abs(successRate - 0.5),
          `Expected ~50% success rate, got ${(successRate * 100).toFixed(2)}%`
        ).toBeLessThan(tolerance);
      });

      it('should return true ~25% of the time for 25% success rate', () => {
        const recipe = createRecipe('epic', 'legendary', 0.25);
        const ROLLS = 10000;
        let successCount = 0;

        for (let i = 0; i < ROLLS; i++) {
          if (rollCraftingSuccess(recipe)) {
            successCount++;
          }
        }

        const successRate = successCount / ROLLS;
        const tolerance = 0.02; // ±2%

        expect(
          Math.abs(successRate - 0.25),
          `Expected ~25% success rate, got ${(successRate * 100).toFixed(2)}%`
        ).toBeLessThan(tolerance);
      });

      it('should return true ~10% of the time for 10% success rate', () => {
        const recipe = createRecipe('legendary', 'mythic', 0.1);
        const ROLLS = 10000;
        let successCount = 0;

        for (let i = 0; i < ROLLS; i++) {
          if (rollCraftingSuccess(recipe)) {
            successCount++;
          }
        }

        const successRate = successCount / ROLLS;
        const tolerance = 0.015; // ±1.5%

        expect(
          Math.abs(successRate - 0.1),
          `Expected ~10% success rate, got ${(successRate * 100).toFixed(2)}%`
        ).toBeLessThan(tolerance);
      });
    });

    describe('Edge cases', () => {
      it('should always return false for 0% success rate', () => {
        const recipe = createRecipe('mythic', 'mythic', 0.0);

        for (let i = 0; i < 100; i++) {
          expect(rollCraftingSuccess(recipe)).toBe(false);
        }
      });

      it('should always return false for negative success rate (edge case)', () => {
        const recipe = createRecipe('mythic', 'mythic', -0.1);

        for (let i = 0; i < 100; i++) {
          expect(rollCraftingSuccess(recipe)).toBe(false);
        }
      });

      it('should handle very small success rates (1%)', () => {
        const recipe = createRecipe('legendary', 'mythic', 0.01);
        const ROLLS = 50000;
        let successCount = 0;

        for (let i = 0; i < ROLLS; i++) {
          if (rollCraftingSuccess(recipe)) {
            successCount++;
          }
        }

        const successRate = successCount / ROLLS;

        // Should be approximately 1%, allow ±0.3% tolerance
        expect(
          Math.abs(successRate - 0.01),
          `Expected ~1% success rate, got ${(successRate * 100).toFixed(2)}%`
        ).toBeLessThan(0.003);

        // Verify we got at least some successes
        expect(successCount).toBeGreaterThan(0);
      });
    });
  });

  describe('Integration tests', () => {
    describe('Affordability + Success scenarios', () => {
      it('should handle affordable crafting with success', () => {
        const recipe = createRecipe('common', 'uncommon', 1.0);
        const cost = calculateCraftingCost(recipe);
        const playerCurrency = cost;

        // Can afford
        expect(canAffordCraft(recipe, playerCurrency)).toBe(true);

        // Will succeed (100% success rate)
        expect(rollCraftingSuccess(recipe)).toBe(true);
      });

      it('should handle affordable crafting with possible failure', () => {
        const recipe = createRecipe('rare', 'epic', 0.5);
        const cost = calculateCraftingCost(recipe);
        const playerCurrency = cost;

        // Can afford
        expect(canAffordCraft(recipe, playerCurrency)).toBe(true);

        // Might succeed or fail (both outcomes are valid)
        const result = rollCraftingSuccess(recipe);
        expect(typeof result).toBe('boolean');
      });

      it('should prevent unaffordable crafting attempts', () => {
        const recipe = createRecipe('legendary', 'mythic', 0.1);
        const cost = calculateCraftingCost(recipe);
        const playerCurrency = cost - 1;

        // Cannot afford
        expect(canAffordCraft(recipe, playerCurrency)).toBe(false);
      });
    });

    describe('Max cost scenarios', () => {
      it('should handle most expensive recipe (mythic inputs)', () => {
        const recipe = createRecipe('mythic', 'mythic', 0.01, 5);
        const cost = calculateCraftingCost(recipe);

        // Mythic cards have 50x multiplier, so 5 mythics = 250 base cost
        // With difficulty discount (99% failure = 49.5% discount), final cost ~126
        expect(cost).toBeGreaterThan(100);

        // Should be affordable with sufficient currency
        expect(canAffordCraft(recipe, cost)).toBe(true);
        expect(canAffordCraft(recipe, cost - 1)).toBe(false);
      });
    });

    describe('Empty inventory scenarios', () => {
      it('should prevent crafting when player has no currency', () => {
        const recipe = createRecipe('common', 'uncommon', 1.0);
        const playerCurrency = 0;

        expect(canAffordCraft(recipe, playerCurrency)).toBe(false);
      });

      it('should handle recipe with zero input count (free craft)', () => {
        const recipe: CraftingRecipe = {
          id: 'free_craft',
          name: 'Free Craft',
          description: 'Craft without materials',
          inputRarity: 'common',
          inputCount: 0,
          outputRarity: 'uncommon',
          outputCount: 1,
          successRate: 1.0,
        };

        // Should be affordable even with 0 currency
        expect(canAffordCraft(recipe, 0)).toBe(true);

        // Should always succeed
        expect(rollCraftingSuccess(recipe)).toBe(true);
      });
    });
  });

  describe('Cost calculation verification', () => {
    it('should calculate cost correctly for common recipe', () => {
      const recipe = createRecipe('common', 'uncommon', 1.0);
      const cost = calculateCraftingCost(recipe);

      // Common = 1x multiplier, 5 cards = 5 cost
      expect(cost).toBe(5);
    });

    it('should calculate cost correctly for rare recipe', () => {
      const recipe = createRecipe('rare', 'epic', 0.5);
      const cost = calculateCraftingCost(recipe);

      // Rare = 5x multiplier, 5 cards = 25 base cost
      // 50% success = 25% discount, final cost = 19
      expect(cost).toBeGreaterThan(18);
      expect(cost).toBeLessThan(26);
    });

    it('should calculate cost correctly for legendary recipe', () => {
      const recipe = createRecipe('legendary', 'mythic', 0.1);
      const cost = calculateCraftingCost(recipe);

      // Legendary = 25x multiplier, 5 cards = 125 base cost
      // 90% failure = 45% discount, final cost = 69
      expect(cost).toBeGreaterThan(60);
      expect(cost).toBeLessThan(125);
    });

    it('should apply difficulty discount correctly', () => {
      const guaranteedRecipe = createRecipe('common', 'uncommon', 1.0);
      const riskyRecipe = createRecipe('common', 'uncommon', 0.5);

      const guaranteedCost = calculateCraftingCost(guaranteedRecipe);
      const riskyCost = calculateCraftingCost(riskyRecipe);

      // Risky recipe should be cheaper due to difficulty discount
      expect(riskyCost).toBeLessThan(guaranteedCost);
    });
  });

  describe('Statistical verification', () => {
    it('should maintain success rate within statistical tolerance over many rolls', () => {
      const recipe = createRecipe('rare', 'epic', 0.5);
      const ROLLS = 50000;
      let successCount = 0;

      for (let i = 0; i < ROLLS; i++) {
        if (rollCraftingSuccess(recipe)) {
          successCount++;
        }
      }

      const actualRate = successCount / ROLLS;
      const expectedRate = 0.5;
      const tolerance = 0.01; // ±1% with 50k rolls

      expect(
        Math.abs(actualRate - expectedRate),
        `Expected ${expectedRate * 100}% success rate, got ${(actualRate * 100).toFixed(2)}%`
      ).toBeLessThan(tolerance);
    });

    it('should handle distribution across multiple success rates', () => {
      const recipes = [
        createRecipe('common', 'uncommon', 1.0),
        createRecipe('rare', 'epic', 0.5),
        createRecipe('epic', 'legendary', 0.25),
        createRecipe('legendary', 'mythic', 0.1),
      ];

      const ROLLS = 10000;
      const results = recipes.map((recipe) => {
        let successCount = 0;
        for (let i = 0; i < ROLLS; i++) {
          if (rollCraftingSuccess(recipe)) {
            successCount++;
          }
        }
        return {
          expectedRate: recipe.successRate,
          actualRate: successCount / ROLLS,
        };
      });

      // Verify each recipe is within tolerance
      const tolerance = 0.02; // ±2%
      for (const result of results) {
        expect(
          Math.abs(result.actualRate - result.expectedRate),
          `Recipe: Expected ${(result.expectedRate * 100).toFixed(0)}%, got ${(result.actualRate * 100).toFixed(2)}%`
        ).toBeLessThan(tolerance);
      }
    });
  });
});
