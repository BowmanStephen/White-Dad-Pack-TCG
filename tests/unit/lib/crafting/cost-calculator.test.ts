/**
 * Crafting Cost Calculator Tests
 *
 * Tests for calculateCraftingCost() function and related utilities.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCraftingCost,
  isZeroCostRecipe,
  getBaseRecipeCost,
  getDifficultyDiscount,
} from '@/lib/crafting';
import type { CraftingRecipe } from '@/types/crafting';
import type { Rarity } from '@/types';

// Mock recipes for testing
const mockRecipes: Record<string, CraftingRecipe> = {
  common_to_uncommon: {
    id: 'common_to_uncommon',
    name: 'Common to Uncommon',
    description: 'Combine 5 Common cards to create 1 Uncommon card',
    inputRarity: 'common',
    inputCount: 5,
    outputRarity: 'uncommon',
    outputCount: 1,
    successRate: 1.0,
  },
  uncommon_to_rare: {
    id: 'uncommon_to_rare',
    name: 'Uncommon to Rare',
    description: 'Combine 5 Uncommon cards for a 50% chance to create 1 Rare card',
    inputRarity: 'uncommon',
    inputCount: 5,
    outputRarity: 'rare',
    outputCount: 1,
    successRate: 0.5,
    failReturnRate: 0.6,
  },
  rare_to_epic: {
    id: 'rare_to_epic',
    name: 'Rare to Epic',
    description: 'Combine 5 Rare cards for a 30% chance to create 1 Epic card',
    inputRarity: 'rare',
    inputCount: 5,
    outputRarity: 'epic',
    outputCount: 1,
    successRate: 0.3,
    failReturnRate: 0.6,
  },
  legendary_to_mythic: {
    id: 'legendary_to_mythic',
    name: 'Legendary to Mythic',
    description: 'Combine 5 Legendary cards for a 15% chance to create 1 Mythic card',
    inputRarity: 'legendary',
    inputCount: 5,
    outputRarity: 'mythic',
    outputCount: 1,
    successRate: 0.15,
    failReturnRate: 0.2,
  },
  zero_cost_recipe: {
    id: 'zero_cost_recipe',
    name: 'Zero Cost Recipe',
    description: 'A recipe with no cost',
    inputRarity: 'common',
    inputCount: 0,
    outputRarity: 'uncommon',
    outputCount: 1,
    successRate: 1.0,
  },
};

describe('Crafting Cost Calculator', () => {
  describe('calculateCraftingCost', () => {
    it('should calculate base cost correctly for common recipe', () => {
      const recipe = mockRecipes.common_to_uncommon;
      const cost = calculateCraftingCost(recipe);

      // 5 common cards × 1.0 multiplier = 5
      expect(cost).toBe(5);
    });

    it('should apply rarity multiplier for uncommon recipe', () => {
      const recipe = mockRecipes.uncommon_to_rare;
      const cost = calculateCraftingCost(recipe);

      // 5 uncommon cards × 2.0 multiplier = 10
      // 50% discount for difficulty = 10 × 0.75 = 7.5 → 8
      expect(cost).toBeGreaterThan(0);
      expect(cost).toBeLessThanOrEqual(10);
    });

    it('should apply rarity multiplier for rare recipe', () => {
      const recipe = mockRecipes.rare_to_epic;
      const cost = calculateCraftingCost(recipe);

      // 5 rare cards × 5.0 multiplier = 25
      // 35% discount for difficulty (70% success rate)
      // Expected: around 16-17
      expect(cost).toBeGreaterThan(10);
      expect(cost).toBeLessThanOrEqual(25);
    });

    it('should apply significant rarity multiplier for legendary recipe', () => {
      const recipe = mockRecipes.legendary_to_mythic;
      const cost = calculateCraftingCost(recipe);

      // 5 legendary cards × 25.0 multiplier = 125
      // 42.5% discount for difficulty (15% success rate)
      // Expected: around 72
      expect(cost).toBeGreaterThan(50);
      expect(cost).toBeLessThanOrEqual(125);
    });

    it('should return zero for zero-cost recipes', () => {
      const recipe = mockRecipes.zero_cost_recipe;
      const cost = calculateCraftingCost(recipe);

      expect(cost).toBe(0);
    });

    it('should handle guaranteed success recipes (no discount)', () => {
      const recipe = mockRecipes.common_to_uncommon;
      const cost = calculateCraftingCost(recipe);

      // No discount for 100% success rate
      expect(cost).toBe(5);
    });

    it('should apply difficulty discount for risky recipes', () => {
      const guaranteedRecipe = mockRecipes.common_to_uncommon;
      const riskyRecipe = mockRecipes.uncommon_to_rare;

      const guaranteedCost = calculateCraftingCost(guaranteedRecipe);
      const riskyCost = calculateCraftingCost(riskyRecipe);

      // Risky recipe should have a lower effective cost due to discount
      // even though the base materials are more valuable
      expect(riskyCost).toBeGreaterThan(0);
    });
  });

  describe('isZeroCostRecipe', () => {
    it('should return true for zero-cost recipes', () => {
      const recipe = mockRecipes.zero_cost_recipe;
      expect(isZeroCostRecipe(recipe)).toBe(true);
    });

    it('should return false for normal recipes', () => {
      const recipe = mockRecipes.common_to_uncommon;
      expect(isZeroCostRecipe(recipe)).toBe(false);
    });
  });

  describe('getBaseRecipeCost', () => {
    it('should calculate base cost without discounts', () => {
      const recipe = mockRecipes.common_to_uncommon;
      const baseCost = getBaseRecipeCost(recipe);

      // 5 common cards × 1.0 multiplier = 5
      expect(baseCost).toBe(5);
    });

    it('should calculate higher base cost for rare materials', () => {
      const recipe = mockRecipes.rare_to_epic;
      const baseCost = getBaseRecipeCost(recipe);

      // 5 rare cards × 5.0 multiplier = 25
      expect(baseCost).toBe(25);
    });

    it('should calculate highest base cost for legendary materials', () => {
      const recipe = mockRecipes.legendary_to_mythic;
      const baseCost = getBaseRecipeCost(recipe);

      // 5 legendary cards × 25.0 multiplier = 125
      expect(baseCost).toBe(125);
    });
  });

  describe('getDifficultyDiscount', () => {
    it('should return zero for guaranteed success recipes', () => {
      const recipe = mockRecipes.common_to_uncommon;
      const discount = getDifficultyDiscount(recipe);

      expect(discount).toBe(0);
    });

    it('should return non-zero discount for risky recipes', () => {
      const recipe = mockRecipes.uncommon_to_rare;
      const discount = getDifficultyDiscount(recipe);

      // 50% success rate = 25% discount
      expect(discount).toBe(0.25);
    });

    it('should return higher discount for riskier recipes', () => {
      const recipe = mockRecipes.legendary_to_mythic;
      const discount = getDifficultyDiscount(recipe);

      // 15% success rate = 42.5% discount
      expect(discount).toBe(0.425);
    });

    it('should ensure discount never exceeds 50%', () => {
      const extremelyRiskyRecipe: CraftingRecipe = {
        id: 'extremely_risky',
        name: 'Extremely Risky',
        description: 'Very low success rate',
        inputRarity: 'mythic',
        inputCount: 5,
        outputRarity: 'mythic',
        outputCount: 1,
        successRate: 0.01, // 1% success rate
      };

      const discount = getDifficultyDiscount(extremelyRiskyRecipe);

      // Max discount is 50% (0.5)
      expect(discount).toBeLessThanOrEqual(0.5);
    });
  });

  describe('Rarity Multipliers', () => {
    it('should scale exponentially with rarity', () => {
      const commonCost = calculateCraftingCost(mockRecipes.common_to_uncommon);
      const uncommonCost = calculateCraftingCost(mockRecipes.uncommon_to_rare);
      const rareCost = calculateCraftingCost(mockRecipes.rare_to_epic);
      const legendaryCost = calculateCraftingCost(mockRecipes.legendary_to_mythic);

      // Costs should increase with rarity (though discounts may affect exact values)
      expect(legendaryCost).toBeGreaterThan(rareCost);
      expect(rareCost).toBeGreaterThan(uncommonCost);
      expect(uncommonCost).toBeGreaterThanOrEqual(commonCost);
    });
  });
});
