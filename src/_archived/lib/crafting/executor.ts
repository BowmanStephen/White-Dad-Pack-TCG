/**
 * Crafting Execution System
 *
 * Handles execution of crafting operations including:
 * - Affordability checks
 * - Recipe execution
 * - Success/failure logic
 * - Material consumption
 */

import type { CraftingRecipe } from '@/types/crafting';
import { calculateCraftingCost } from './index';
import { randomBoolean } from '@/lib/utils/random';

/**
 * Check if a player can afford to craft with a specific recipe.
 *
 * Uses the calculateCraftingCost() function to determine the cost,
 * then compares it against the player's available currency.
 *
 * @param recipe - The crafting recipe to check affordability for
 * @param playerCurrency - The player's current currency amount
 * @returns true if the player can afford the recipe, false otherwise
 *
 * @example
 * ```ts
 * const recipe = CRAFTING_RECIPES.common_to_uncommon;
 * const playerCurrency = 100;
 *
 * if (canAffordCraft(recipe, playerCurrency)) {
 *   // Player can afford to craft
 *   executeCraft(recipe, selectedCards);
 * } else {
 *   // Show "not enough currency" message
 * }
 * ```
 */
export function canAffordCraft(
  recipe: CraftingRecipe,
  playerCurrency: number
): boolean {
  // Calculate the cost of crafting this recipe
  const cost = calculateCraftingCost(recipe);

  // Check if player has enough currency
  return playerCurrency >= cost;
}

/**
 * Roll for crafting success based on the recipe's success rate.
 *
 * This function determines whether a crafting operation succeeds or fails
 * by comparing a random roll against the recipe's success rate.
 *
 * @param recipe - The crafting recipe to roll success for
 * @returns true if the craft succeeds, false otherwise
 *
 * @example
 * ```ts
 * const recipe = CRAFTING_RECIPES.rare_to_epic;
 * // recipe.successRate = 0.5 (50% chance)
 *
 * const success = rollCraftingSuccess(recipe);
 * // Returns true 50% of the time, false 50% of the time
 *
 * if (success) {
 *   console.log('Crafting successful!');
 * } else {
 *   console.log('Crafting failed - lost some materials');
 * }
 * ```
 *
 * @example
 * ```ts
 * // Guaranteed success recipe
 * const recipe = CRAFTING_RECIPES.common_to_uncommon;
 * // recipe.successRate = 1.0 (100% chance)
 *
 * const success = rollCraftingSuccess(recipe);
 * // Always returns true
 * ```
 */
export function rollCraftingSuccess(recipe: CraftingRecipe): boolean {
  // Recipes with 100% success rate always succeed
  if (recipe.successRate >= 1.0) {
    return true;
  }

  // Roll for success based on the recipe's success rate
  // randomBoolean() returns true with the specified probability
  return randomBoolean(recipe.successRate);
}

/**
 * Execute a crafting recipe.
 *
 * This is a placeholder for future implementation.
 * The full execution logic will include:
 * - Success/failure determination
 * - Material consumption
 * - Result generation
 * - History tracking
 *
 * @param recipe - The crafting recipe to execute
 * @param selectedCards - Array of card IDs to use as materials
 * @returns A promise resolving to the crafting result
 *
 * @example
 * ```ts
 * const result = await executeCraft(
 *   recipe,
 *   ['card1', 'card2', 'card3', 'card4', 'card5']
 * );
 *
 * if (result.success) {
 *   console.log('Crafted:', result.card);
 * } else {
 *   console.log('Failed to craft');
 * }
 * ```
 */
export async function executeCraft(
  recipe: CraftingRecipe,
  selectedCards: string[]
): Promise<{
  success: boolean;
  card?: import('@/types').PackCard;
  returnedCards?: string[];
}> {
  // TODO: Implement full crafting execution logic
  // This will include:
  // 1. Validate selected cards match recipe requirements
  // 2. Determine success/failure based on recipe.successRate
  // 3. On success: generate output card
  // 4. On failure: return percentage of cards based on failReturnRate
  // 5. Update crafting history
  // 6. Update player currency

  throw new Error('executeCraft() not yet implemented');
}
