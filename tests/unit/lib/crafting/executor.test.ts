/**
 * Crafting Executor Tests - US080: Card Crafting
 */

import { describe, it, expect } from 'vitest';
import { calculateCraftingCost } from '@/lib/crafting/executor';
import { CRAFTING_RECIPES } from '@/types';

describe('calculateCraftingCost', () => {
  it('should calculate base cost correctly', () => {
    // Test common to uncommon recipe (5 common → 1 uncommon)
    const commonToUncommon = CRAFTING_RECIPES.find(r => r.id === 'common_to_uncommon');
    expect(commonToUncommon).toBeDefined();

    const cost = calculateCraftingCost(commonToUncommon!);

    // Expected: 5 cards × 10 base × 1.0 (common input) × 1.5 (uncommon output) = 75
    expect(cost).toBe(75);
  });

  it('should handle higher rarity recipes with increased cost', () => {
    // Test uncommon to rare recipe
    const uncommonToRare = CRAFTING_RECIPES.find(r => r.id === 'uncommon_to_rare');
    expect(uncommonToRare).toBeDefined();

    const cost = calculateCraftingCost(uncommonToRare!);

    // Expected: 5 cards × 10 base × 1.5 (uncommon input) × 2.0 (rare output) = 150
    expect(cost).toBe(150);
  });

  it('should scale cost exponentially for mythic recipes', () => {
    // Test legendary to mythic recipe (highest cost)
    const legendaryToMythic = CRAFTING_RECIPES.find(r => r.id === 'legendary_to_mythic');
    expect(legendaryToMythic).toBeDefined();

    const cost = calculateCraftingCost(legendaryToMythic!);

    // Expected: 5 cards × 10 base × 5.0 (legendary input) × 10.0 (mythic output) = 2500
    expect(cost).toBe(2500);
  });

  it('should handle rare to epic recipe correctly', () => {
    const rareToEpic = CRAFTING_RECIPES.find(r => r.id === 'rare_to_epic');
    expect(rareToEpic).toBeDefined();

    const cost = calculateCraftingCost(rareToEpic!);

    // Expected: 5 cards × 10 base × 2.0 (rare input) × 3.0 (epic output) = 300
    expect(cost).toBe(300);
  });

  it('should handle epic to legendary recipe correctly', () => {
    const epicToLegendary = CRAFTING_RECIPES.find(r => r.id === 'epic_to_legendary');
    expect(epicToLegendary).toBeDefined();

    const cost = calculateCraftingCost(epicToLegendary!);

    // Expected: 5 cards × 10 base × 3.0 (epic input) × 5.0 (legendary output) = 750
    expect(cost).toBe(750);
  });

  it('should return zero for zero-cost edge cases', () => {
    // Test with a hypothetical zero-input recipe (shouldn't happen in practice but tests edge case)
    const zeroInputRecipe = {
      id: 'zero_cost_test',
      name: 'Zero Cost Test',
      description: 'Test zero cost',
      inputRarity: 'common' as const,
      inputCount: 0,
      outputRarity: 'common' as const,
      outputCount: 1,
      successRate: 1.0,
    };

    const cost = calculateCraftingCost(zeroInputRecipe);
    expect(cost).toBe(0);
  });
});
