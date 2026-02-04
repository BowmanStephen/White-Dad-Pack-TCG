/**
 * Crafting System Utilities
 *
 * Provides utility functions for the crafting system including:
 * - Cost calculation based on rarity and recipe
 * - Affordability checks
 * - Material requirements
 * - Success determination
 */

import type { CraftingRecipe } from '@/types/crafting';
import type { Rarity } from '@/types';

// Re-export crafting execution utilities
export { canAffordCraft, rollCraftingSuccess } from './executor';

/**
 * Rarity cost multipliers for crafting.
 * Higher rarity inputs have higher "costs" even though recipes use the same number of cards.
 */
const RARITY_COST_MULTIPLIERS: Record<Rarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 5,
  epic: 10,
  legendary: 25,
  mythic: 50,
};

/**
 * Calculate the crafting cost for a recipe.
 *
 * The cost is determined by:
 * 1. Base cost: inputCount (number of cards required)
 * 2. Rarity multiplier: higher rarity inputs have higher costs
 * 3. Recipe difficulty: risky recipes (low success rate) have lower costs
 *
 * @param recipe - The crafting recipe to calculate cost for
 * @returns The calculated crafting cost (as a number)
 *
 * @example
 * ```ts
 * const recipe = CRAFTING_RECIPES.common_to_uncommon;
 * const cost = calculateCraftingCost(recipe);
 * console.log(cost); // 5 (5 common cards × 1.0 multiplier)
 * ```
 *
 * @example
 * ```ts
 * const recipe = CRAFTING_RECIPES.legendary_to_mythic;
 * const cost = calculateCraftingCost(recipe);
 * console.log(cost); // 125 (5 legendary cards × 25 multiplier, discounted for difficulty)
 * ```
 */
export function calculateCraftingCost(recipe: CraftingRecipe): number {
  // Handle zero-cost recipes (if any exist in the future)
  if (recipe.inputCount === 0) {
    return 0;
  }

  // Get the rarity multiplier for the input rarity
  const rarityMultiplier = RARITY_COST_MULTIPLIERS[recipe.inputRarity] || 1;

  // Calculate base cost
  const baseCost = recipe.inputCount * rarityMultiplier;

  // Apply difficulty discount for risky recipes
  // Recipes with lower success rates have lower costs to compensate for risk
  let difficultyDiscount = 0;
  if (recipe.successRate < 1.0) {
    // Discount increases as success rate decreases
    // 50% success = 10% discount
    // 25% success = 25% discount
    // 10% success = 40% discount
    difficultyDiscount = (1 - recipe.successRate) * 0.5;
  }

  // Apply discount and round to nearest integer
  const finalCost = Math.round(baseCost * (1 - difficultyDiscount));

  // Ensure cost is never negative or zero (unless it's a zero-cost recipe)
  return Math.max(0, finalCost);
}

/**
 * Check if a recipe is a "zero-cost" recipe.
 * Zero-cost recipes don't require any materials to craft.
 *
 * @param recipe - The crafting recipe to check
 * @returns true if the recipe is zero-cost, false otherwise
 */
export function isZeroCostRecipe(recipe: CraftingRecipe): boolean {
  return recipe.inputCount === 0;
}

/**
 * Get the base cost for a recipe before any discounts or modifiers.
 *
 * @param recipe - The crafting recipe
 * @returns The base cost (input count × rarity multiplier)
 */
export function getBaseRecipeCost(recipe: CraftingRecipe): number {
  const rarityMultiplier = RARITY_COST_MULTIPLIERS[recipe.inputRarity] || 1;
  return recipe.inputCount * rarityMultiplier;
}

/**
 * Get the difficulty discount for a recipe.
 *
 * @param recipe - The crafting recipe
 * @returns The discount amount (0-1, where 0.5 = 50% off)
 */
export function getDifficultyDiscount(recipe: CraftingRecipe): number {
  if (recipe.successRate >= 1.0) {
    return 0;
  }

  // Discount increases as success rate decreases
  return (1 - recipe.successRate) * 0.5;
}
