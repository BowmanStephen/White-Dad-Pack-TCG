/**
 * Crafting Executor Tests
 *
 * Tests for the crafting execution system including:
 * - canAffordCraft() - Affordability checks
 * - executeCraft() - Recipe execution (future)
 */

import { describe, it, expect } from 'vitest';
import { canAffordCraft } from '@/lib/crafting/executor';
import { CRAFTING_RECIPES } from '@/stores/crafting';

describe('canAffordCraft', () => {
  it('should return true when player can afford', () => {
    const recipe = CRAFTING_RECIPES.common_to_uncommon;
    const playerCurrency = 100;

    const result = canAffordCraft(recipe, playerCurrency);

    expect(result).toBe(true);
  });

  it('should return false when player cannot afford', () => {
    const recipe = CRAFTING_RECIPES.legendary_to_mythic;
    const playerCurrency = 10;

    const result = canAffordCraft(recipe, playerCurrency);

    expect(result).toBe(false);
  });

  it('should return true when player has exactly the required amount', () => {
    const recipe = CRAFTING_RECIPES.common_to_uncommon;
    const cost = 5; // 5 common cards × 1.0 multiplier
    const playerCurrency = cost;

    const result = canAffordCraft(recipe, playerCurrency);

    expect(result).toBe(true);
  });

  it('should return false when player has zero currency', () => {
    const recipe = CRAFTING_RECIPES.common_to_uncommon;
    const playerCurrency = 0;

    const result = canAffordCraft(recipe, playerCurrency);

    expect(result).toBe(false);
  });

  it('should handle expensive recipes correctly', () => {
    const recipe = CRAFTING_RECIPES.legendary_to_mythic;
    // Cost calculation: 5 legendary × 25 multiplier = 125 base
    // With difficulty discount: 125 × (1 - 0.425) = ~72
    const playerCurrency = 50; // Not enough

    const result = canAffordCraft(recipe, playerCurrency);

    expect(result).toBe(false);
  });
});
