/**
 * Crafting Executor Tests - US080: Card Crafting
 */

import { describe, it, expect, vi } from 'vitest';
import { calculateCraftingCost, canAffordCraft, executeCraft } from '@/lib/crafting/executor';
import { CRAFTING_RECIPES } from '@/types';
import { getAllCards } from '@/lib/cards/database';

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

describe('canAffordCraft', () => {
  it('should return true when player can afford', () => {
    // Test common to uncommon recipe (costs 75)
    const commonToUncommon = CRAFTING_RECIPES.find(r => r.id === 'common_to_uncommon');
    expect(commonToUncommon).toBeDefined();

    // Player with 100 currency can afford 75 cost recipe
    const canAfford = canAffordCraft(commonToUncommon!, 100);
    expect(canAfford).toBe(true);
  });

  it('should return false when player cannot afford', () => {
    // Test common to uncommon recipe (costs 75)
    const commonToUncommon = CRAFTING_RECIPES.find(r => r.id === 'common_to_uncommon');
    expect(commonToUncommon).toBeDefined();

    // Player with 50 currency cannot afford 75 cost recipe
    const canAfford = canAffordCraft(commonToUncommon!, 50);
    expect(canAfford).toBe(false);
  });

  it('should return true when player has exact cost', () => {
    // Test uncommon to rare recipe (costs 150)
    const uncommonToRare = CRAFTING_RECIPES.find(r => r.id === 'uncommon_to_rare');
    expect(uncommonToRare).toBeDefined();

    const cost = calculateCraftingCost(uncommonToRare!);

    // Player with exactly the cost amount can afford
    const canAfford = canAffordCraft(uncommonToRare!, cost);
    expect(canAfford).toBe(true);
  });

  it('should return false when player has one less than cost', () => {
    // Test rare to epic recipe (costs 300)
    const rareToEpic = CRAFTING_RECIPES.find(r => r.id === 'rare_to_epic');
    expect(rareToEpic).toBeDefined();

    const cost = calculateCraftingCost(rareToEpic!);

    // Player with cost - 1 cannot afford
    const canAfford = canAffordCraft(rareToEpic!, cost - 1);
    expect(canAfford).toBe(false);
  });

  it('should handle expensive recipes correctly', () => {
    // Test legendary to mythic recipe (costs 2500)
    const legendaryToMythic = CRAFTING_RECIPES.find(r => r.id === 'legendary_to_mythic');
    expect(legendaryToMythic).toBeDefined();

    const cost = calculateCraftingCost(legendaryToMythic!);

    // Player with 3000 can afford 2500 cost
    expect(canAffordCraft(legendaryToMythic!, 3000)).toBe(true);

    // Player with 2000 cannot afford 2500 cost
    expect(canAffordCraft(legendaryToMythic!, 2000)).toBe(false);
  });

  it('should return true for zero-cost recipes with zero currency', () => {
    // Test with a hypothetical zero-input recipe
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

    // Player with 0 currency can afford zero-cost recipe
    const canAfford = canAffordCraft(zeroInputRecipe, 0);
    expect(canAfford).toBe(true);
  });
});

describe('executeCraft', () => {
  describe('defensive handling - CP-004', () => {
    it('should throw error when no cards exist for output rarity', () => {
      // Create test recipe with non-existent rarity
      const recipe = {
        id: 'test_empty_pool',
        name: 'Test Empty Pool',
        description: 'Test recipe with empty card pool',
        inputRarity: 'common' as const,
        inputCount: 5,
        outputRarity: 'mythic' as const,
        outputCount: 1,
        successRate: 1.0, // 100% success rate
      };

      // Create test input cards
      const inputCards: Array<{ id: string; rarity: 'common'; }> = [
        { id: 'card1', rarity: 'common' },
        { id: 'card2', rarity: 'common' },
        { id: 'card3', rarity: 'common' },
        { id: 'card4', rarity: 'common' },
        { id: 'card5', rarity: 'common' },
      ];

      // Empty card database (no mythic cards)
      const emptyCardPool: any[] = [];

      // Should throw error when no cards found
      expect(() => {
        executeCraft(recipe, inputCards as any, emptyCardPool);
      }).toThrow('No cards found with rarity mythic');
    });

    it('should handle all rarities that exist in database', () => {
      const allCards = getAllCards();

      // Verify each rarity has at least one card
      const rarities: Array<'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'> =
        ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

      rarities.forEach(rarity => {
        const cardsOfRarity = allCards.filter(card => card.rarity === rarity);
        expect(cardsOfRarity.length).toBeGreaterThan(0);
      });
    });
  });

  describe('failure path with failReturnRate', () => {
    it('should execute failed craft with zero fail return rate', () => {
      // Create test recipe with 0% return rate on failure
      const recipe = {
        id: 'test_zero_return',
        name: 'Test Zero Return',
        description: 'Test recipe with 0% return rate',
        inputRarity: 'common' as const,
        inputCount: 5,
        outputRarity: 'uncommon' as const,
        outputCount: 1,
        successRate: 0.5,
        failReturnRate: 0, // CP-003: Return 0% on failure
      };

      // Create test input cards
      const inputCards: Array<{ id: string; rarity: 'common'; }> = [
        { id: 'card1', rarity: 'common' },
        { id: 'card2', rarity: 'common' },
        { id: 'card3', rarity: 'common' },
        { id: 'card4', rarity: 'common' },
        { id: 'card5', rarity: 'common' },
      ];

      // Mock Math.random to force failure
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.9); // 90% > 50% success rate = failure

      const result = executeCraft(recipe, inputCards as any, getAllCards());

      // Verify failure
      expect(result.success).toBe(false);

      // CP-003: When failReturnRate = 0%, consumed cards should be empty array
      expect(result.consumedCards).toEqual([]);
      expect(result.consumedCards).toHaveLength(0);

      // All input cards should be returned
      expect(result.returnedCards).toBeDefined();
      expect(result.returnedCards).toHaveLength(5);
      expect(result.returnedCards?.map(c => c.id)).toEqual(['card1', 'card2', 'card3', 'card4', 'card5']);

      mockRandom.mockRestore();
    });

    it('should execute failed craft with partial fail return rate', () => {
      // Test with 60% return rate (rare to epic recipe)
      const rareToEpic = CRAFTING_RECIPES.find(r => r.id === 'rare_to_epic');
      expect(rareToEpic).toBeDefined();
      expect(rareToEpic!.failReturnRate).toBe(0.6);

      // Create test input cards
      const inputCards: Array<{ id: string; rarity: 'rare'; }> = [
        { id: 'card1', rarity: 'rare' },
        { id: 'card2', rarity: 'rare' },
        { id: 'card3', rarity: 'rare' },
        { id: 'card4', rarity: 'rare' },
        { id: 'card5', rarity: 'rare' },
      ];

      // Mock Math.random to force failure
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.9);

      const result = executeCraft(rareToEpic!, inputCards as any, getAllCards());

      // Verify failure
      expect(result.success).toBe(false);

      // With 60% return rate: ceil(5 * 0.6) = 3 cards returned
      expect(result.returnedCards).toBeDefined();
      expect(result.returnedCards).toHaveLength(3);
      expect(result.returnedCards?.map(c => c.id)).toEqual(['card1', 'card2', 'card3']);

      // Remaining 2 cards should be consumed
      expect(result.consumedCards).toHaveLength(2);
      expect(result.consumedCards.map(c => c.id)).toEqual(['card4', 'card5']);

      mockRandom.mockRestore();
    });

    it('should execute successful craft and consume all input cards', () => {
      // Test common to uncommon recipe
      const commonToUncommon = CRAFTING_RECIPES.find(r => r.id === 'common_to_uncommon');
      expect(commonToUncommon).toBeDefined();

      // Create test input cards
      const inputCards: Array<{ id: string; rarity: 'common'; }> = [
        { id: 'card1', rarity: 'common' },
        { id: 'card2', rarity: 'common' },
        { id: 'card3', rarity: 'common' },
        { id: 'card4', rarity: 'common' },
        { id: 'card5', rarity: 'common' },
      ];

      // Mock Math.random to force success
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.1); // 10% < success rate

      const result = executeCraft(commonToUncommon!, inputCards as any, getAllCards());

      // Verify success
      expect(result.success).toBe(true);
      expect(result.resultCard).toBeDefined();

      // All input cards should be consumed on success
      expect(result.consumedCards).toHaveLength(5);
      expect(result.consumedCards.map(c => c.id)).toEqual(['card1', 'card2', 'card3', 'card4', 'card5']);

      // No cards returned on success
      expect(result.returnedCards).toBeUndefined();

      mockRandom.mockRestore();
    });
  });
});

