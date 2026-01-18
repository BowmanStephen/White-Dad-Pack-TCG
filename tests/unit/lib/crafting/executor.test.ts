/**
 * Crafting Executor Tests - US080: Card Crafting
 */

import { describe, it, expect, vi } from 'vitest';
import {
  calculateCraftingCost,
  canAffordCraft,
  executeCraft,
  validateCraftingAttempt,
  validateRecipeId,
  validateCardRarities,
  validatePlayerCurrency,
  validateCardCount,
  validateRecipeSelection,
  calculateInventoryChanges,
  hasCardsForRecipe,
  getCardsByRarity,
  sortCardsByRarity,
  getSuccessRateText,
  getFailureReturnText,
  rollCraftingSuccess,
} from '@/lib/crafting/executor';
import { CRAFTING_RECIPES } from '@/types';
import { getAllCards } from '@/lib/cards/database';
import type { PackCard } from '@/types';

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

describe('validateRecipeId - HP-004', () => {
  it('should reject undefined recipe ID', () => {
    const result = validateRecipeId(undefined, CRAFTING_RECIPES);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('No recipe selected. Please select a recipe to craft.');
    expect(result.errorType).toBe('INVALID_RECIPE_ID');
  });

  it('should reject null recipe ID', () => {
    const result = validateRecipeId(null, CRAFTING_RECIPES);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('No recipe selected. Please select a recipe to craft.');
    expect(result.errorType).toBe('INVALID_RECIPE_ID');
  });

  it('should reject non-existent recipe ID', () => {
    const result = validateRecipeId('fake_recipe_id', CRAFTING_RECIPES);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid recipe ID: fake_recipe_id');
    expect(result.errorType).toBe('INVALID_RECIPE_ID');
  });

  it('should accept valid recipe ID', () => {
    const result = validateRecipeId('common_to_uncommon', CRAFTING_RECIPES);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

describe('validateCardRarities - HP-004', () => {
  const commonToUncommon = CRAFTING_RECIPES.find(r => r.id === 'common_to_uncommon')!;

  it('should reject empty selection', () => {
    const result = validateCardRarities(commonToUncommon, []);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('No cards selected. Please select cards to craft with.');
    expect(result.errorType).toBe('EMPTY_SELECTION');
  });

  it('should reject cards with wrong rarity', () => {
    const mixedCards = [
      { id: 'card1', rarity: 'common' as const },
      { id: 'card2', rarity: 'common' as const },
      { id: 'card3', rarity: 'uncommon' as const }, // Wrong rarity
      { id: 'card4', rarity: 'common' as const },
      { id: 'card5', rarity: 'common' as const },
    ];

    const result = validateCardRarities(commonToUncommon, mixedCards);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('1 card(s) do not match required rarity');
    expect(result.error).toContain('Common');
    expect(result.errorType).toBe('INVALID_RARITY');
  });

  it('should accept all cards with correct rarity', () => {
    const validCards = [
      { id: 'card1', rarity: 'common' as const },
      { id: 'card2', rarity: 'common' as const },
      { id: 'card3', rarity: 'common' as const },
      { id: 'card4', rarity: 'common' as const },
      { id: 'card5', rarity: 'common' as const },
    ];

    const result = validateCardRarities(commonToUncommon, validCards);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

describe('validatePlayerCurrency - HP-004', () => {
  const commonToUncommon = CRAFTING_RECIPES.find(r => r.id === 'common_to_uncommon')!;

  it('should reject insufficient currency', () => {
    const result = validatePlayerCurrency(commonToUncommon, 50);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Insufficient crafting currency');
    expect(result.error).toContain('Need 75.00');
    expect(result.error).toContain('only have 50.00');
    expect(result.errorType).toBe('INSUFFICIENT_CURRENCY');
  });

  it('should accept sufficient currency', () => {
    const result = validatePlayerCurrency(commonToUncommon, 100);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept exact currency amount', () => {
    const result = validatePlayerCurrency(commonToUncommon, 75);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

describe('validateCardCount - HP-004', () => {
  const commonToUncommon = CRAFTING_RECIPES.find(r => r.id === 'common_to_uncommon')!;

  it('should reject insufficient cards', () => {
    const cards = [
      { id: 'card1', rarity: 'common' as const },
      { id: 'card2', rarity: 'common' as const },
      { id: 'card3', rarity: 'common' as const },
    ];

    const result = validateCardCount(commonToUncommon, cards);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Need 5 cards for this recipe, but only 3 selected.');
    expect(result.errorType).toBe('CARD_COUNT_MISMATCH');
  });

  it('should reject too many cards', () => {
    const cards = [
      { id: 'card1', rarity: 'common' as const },
      { id: 'card2', rarity: 'common' as const },
      { id: 'card3', rarity: 'common' as const },
      { id: 'card4', rarity: 'common' as const },
      { id: 'card5', rarity: 'common' as const },
      { id: 'card6', rarity: 'common' as const },
    ];

    const result = validateCardCount(commonToUncommon, cards);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Need 5 cards for this recipe, but only 6 selected.');
    expect(result.errorType).toBe('CARD_COUNT_MISMATCH');
  });

  it('should accept exact card count', () => {
    const cards = [
      { id: 'card1', rarity: 'common' as const },
      { id: 'card2', rarity: 'common' as const },
      { id: 'card3', rarity: 'common' as const },
      { id: 'card4', rarity: 'common' as const },
      { id: 'card5', rarity: 'common' as const },
    ];

    const result = validateCardCount(commonToUncommon, cards);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

describe('validateCraftingAttempt - HP-004 (Comprehensive Validation)', () => {
  it('should fail with no recipe selected', () => {
    const result = validateCraftingAttempt(
      undefined,
      null,
      [],
      100,
      CRAFTING_RECIPES
    );

    expect(result.valid).toBe(false);
    expect(result.errorType).toBe('INVALID_RECIPE_ID');
  });

  it('should fail with invalid recipe ID', () => {
    const result = validateCraftingAttempt(
      'fake_recipe',
      null,
      [],
      100,
      CRAFTING_RECIPES
    );

    expect(result.valid).toBe(false);
    expect(result.errorType).toBe('INVALID_RECIPE_ID');
  });

  it('should fail when recipe data is missing', () => {
    const result = validateCraftingAttempt(
      'common_to_uncommon',
      null,
      [],
      100,
      CRAFTING_RECIPES
    );

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Recipe data not loaded');
    expect(result.errorType).toBe('INVALID_RECIPE_ID');
  });

  it('should fail with insufficient cards', () => {
    const recipe = CRAFTING_RECIPES.find(r => r.id === 'common_to_uncommon')!;
    const cards = [
      { id: 'card1', rarity: 'common' as const },
      { id: 'card2', rarity: 'common' as const },
    ];

    const result = validateCraftingAttempt(
      'common_to_uncommon',
      recipe,
      cards,
      100,
      CRAFTING_RECIPES
    );

    expect(result.valid).toBe(false);
    expect(result.errorType).toBe('CARD_COUNT_MISMATCH');
  });

  it('should fail with wrong rarity cards', () => {
    const recipe = CRAFTING_RECIPES.find(r => r.id === 'common_to_uncommon')!;
    const cards = [
      { id: 'card1', rarity: 'common' as const },
      { id: 'card2', rarity: 'common' as const },
      { id: 'card3', rarity: 'common' as const },
      { id: 'card4', rarity: 'common' as const },
      { id: 'card5', rarity: 'uncommon' as const }, // Wrong rarity
    ];

    const result = validateCraftingAttempt(
      'common_to_uncommon',
      recipe,
      cards,
      100,
      CRAFTING_RECIPES
    );

    expect(result.valid).toBe(false);
    expect(result.errorType).toBe('INVALID_RARITY');
  });

  it('should fail with insufficient currency', () => {
    const recipe = CRAFTING_RECIPES.find(r => r.id === 'common_to_uncommon')!;
    const cards = [
      { id: 'card1', rarity: 'common' as const },
      { id: 'card2', rarity: 'common' as const },
      { id: 'card3', rarity: 'common' as const },
      { id: 'card4', rarity: 'common' as const },
      { id: 'card5', rarity: 'common' as const },
    ];

    const result = validateCraftingAttempt(
      'common_to_uncommon',
      recipe,
      cards,
      50, // Not enough currency (need 75)
      CRAFTING_RECIPES
    );

    expect(result.valid).toBe(false);
    expect(result.errorType).toBe('INSUFFICIENT_CURRENCY');
  });

  it('should pass with valid inputs', () => {
    const recipe = CRAFTING_RECIPES.find(r => r.id === 'common_to_uncommon')!;
    const cards = [
      { id: 'card1', rarity: 'common' as const },
      { id: 'card2', rarity: 'common' as const },
      { id: 'card3', rarity: 'common' as const },
      { id: 'card4', rarity: 'common' as const },
      { id: 'card5', rarity: 'common' as const },
    ];

    const result = validateCraftingAttempt(
      'common_to_uncommon',
      recipe,
      cards,
      100, // Enough currency
      CRAFTING_RECIPES
    );

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

describe('validateRecipeSelection - Legacy Validation', () => {
  const commonToUncommon = CRAFTING_RECIPES.find(r => r.id === 'common_to_uncommon')!;

  it('should validate card count and rarities for valid selection', () => {
    const cards = [
      { id: 'card1', rarity: 'common' as const },
      { id: 'card2', rarity: 'common' as const },
      { id: 'card3', rarity: 'common' as const },
      { id: 'card4', rarity: 'common' as const },
      { id: 'card5', rarity: 'common' as const },
    ];

    const result = validateRecipeSelection(commonToUncommon, cards);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should fail when card count is incorrect', () => {
    const cards = [
      { id: 'card1', rarity: 'common' as const },
      { id: 'card2', rarity: 'common' as const },
    ];

    const result = validateRecipeSelection(commonToUncommon, cards);
    expect(result.valid).toBe(false);
    expect(result.errorType).toBe('CARD_COUNT_MISMATCH');
  });

  it('should fail when rarities do not match', () => {
    const cards = [
      { id: 'card1', rarity: 'common' as const },
      { id: 'card2', rarity: 'common' as const },
      { id: 'card3', rarity: 'common' as const },
      { id: 'card4', rarity: 'common' as const },
      { id: 'card5', rarity: 'uncommon' as const }, // Wrong rarity
    ];

    const result = validateRecipeSelection(commonToUncommon, cards);
    expect(result.valid).toBe(false);
    expect(result.errorType).toBe('INVALID_RARITY');
  });
});

describe('calculateInventoryChanges', () => {
  it('should calculate changes for successful craft', () => {
    const inputCards: PackCard[] = [
      { id: 'card1', rarity: 'common', isRevealed: false, isHolo: false, holoType: 'none' } as PackCard,
      { id: 'card2', rarity: 'common', isRevealed: false, isHolo: false, holoType: 'none' } as PackCard,
    ];

    const resultCard: PackCard = {
      id: 'result1',
      rarity: 'uncommon',
      isRevealed: false,
      isHolo: true,
      holoType: 'standard'
    } as PackCard;

    const changes = calculateInventoryChanges(true, inputCards, resultCard, undefined);

    expect(changes.removed).toEqual(['card1', 'card2']);
    expect(changes.added).toHaveLength(1);
    expect(changes.added[0].id).toBe('result1');
  });

  it('should calculate changes for failed craft with returned cards', () => {
    const inputCards: PackCard[] = [
      { id: 'card1', rarity: 'rare', isRevealed: false, isHolo: false, holoType: 'none' } as PackCard,
      { id: 'card2', rarity: 'rare', isRevealed: false, isHolo: false, holoType: 'none' } as PackCard,
      { id: 'card3', rarity: 'rare', isRevealed: false, isHolo: false, holoType: 'none' } as PackCard,
    ];

    const returnedCards: PackCard[] = [inputCards[0], inputCards[1]];

    const changes = calculateInventoryChanges(false, inputCards, undefined, returnedCards);

    expect(changes.removed).toEqual(['card1', 'card2', 'card3']);
    expect(changes.added).toHaveLength(2);
    expect(changes.added[0].id).toBe('card1');
    expect(changes.added[1].id).toBe('card2');
  });

  it('should handle empty inventory edge case', () => {
    const changes = calculateInventoryChanges(true, [], undefined, undefined);

    expect(changes.removed).toEqual([]);
    expect(changes.added).toEqual([]);
  });
});

describe('hasCardsForRecipe', () => {
  it('should return true when inventory has sufficient cards', () => {
    const recipe = CRAFTING_RECIPES.find(r => r.id === 'common_to_uncommon')!;
    const inventory = new Map([
      ['card1', 3],
      ['card2', 2],
    ]);

    const result = hasCardsForRecipe(recipe, inventory);
    expect(result).toBe(true);
  });

  it('should return false when inventory has insufficient cards', () => {
    const recipe = CRAFTING_RECIPES.find(r => r.id === 'common_to_uncommon')!;
    const inventory = new Map([
      ['card1', 2],
    ]);

    const result = hasCardsForRecipe(recipe, inventory);
    expect(result).toBe(false);
  });

  it('should handle empty inventory edge case', () => {
    const recipe = CRAFTING_RECIPES.find(r => r.id === 'common_to_uncommon')!;
    const inventory = new Map();

    const result = hasCardsForRecipe(recipe, inventory);
    expect(result).toBe(false);
  });

  it('should return true when inventory has exact required count', () => {
    const recipe = CRAFTING_RECIPES.find(r => r.id === 'common_to_uncommon')!;
    const inventory = new Map([
      ['card1', 5],
    ]);

    const result = hasCardsForRecipe(recipe, inventory);
    expect(result).toBe(true);
  });
});

describe('getCardsByRarity', () => {
  it('should filter cards by rarity correctly', () => {
    const allCards = getAllCards();
    const commonCards = getCardsByRarity(allCards, 'common');

    expect(commonCards.length).toBeGreaterThan(0);
    expect(commonCards.every(card => card.rarity === 'common')).toBe(true);
  });

  it('should return empty array when no cards of rarity exist', () => {
    const cards: PackCard[] = [
      { id: 'card1', rarity: 'common', isRevealed: false, isHolo: false, holoType: 'none' } as PackCard,
      { id: 'card2', rarity: 'uncommon', isRevealed: false, isHolo: false, holoType: 'none' } as PackCard,
    ];

    const rareCards = getCardsByRarity(cards, 'rare');
    expect(rareCards).toEqual([]);
  });

  it('should handle empty input array', () => {
    const result = getCardsByRarity([], 'common');
    expect(result).toEqual([]);
  });

  it('should find all rarities in database', () => {
    const allCards = getAllCards();
    const rarities: Array<'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'> =
      ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

    rarities.forEach(rarity => {
      const cards = getCardsByRarity(allCards, rarity);
      expect(cards.length).toBeGreaterThan(0);
      expect(cards.every(card => card.rarity === rarity)).toBe(true);
    });
  });
});

describe('sortCardsByRarity', () => {
  it('should sort cards by rarity in descending order', () => {
    const cards: PackCard[] = [
      { id: 'card1', rarity: 'common', isRevealed: false, isHolo: false, holoType: 'none' } as PackCard,
      { id: 'card2', rarity: 'mythic', isRevealed: false, isHolo: false, holoType: 'none' } as PackCard,
      { id: 'card3', rarity: 'rare', isRevealed: false, isHolo: false, holoType: 'none' } as PackCard,
    ];

    const sorted = sortCardsByRarity(cards);

    expect(sorted[0].rarity).toBe('mythic');
    expect(sorted[1].rarity).toBe('rare');
    expect(sorted[2].rarity).toBe('common');
  });

  it('should not mutate original array', () => {
    const cards: PackCard[] = [
      { id: 'card1', rarity: 'common', isRevealed: false, isHolo: false, holoType: 'none' } as PackCard,
      { id: 'card2', rarity: 'rare', isRevealed: false, isHolo: false, holoType: 'none' } as PackCard,
    ];

    const originalOrder = [cards[0].rarity, cards[1].rarity];
    sortCardsByRarity(cards);

    expect(cards[0].rarity).toBe(originalOrder[0]);
    expect(cards[1].rarity).toBe(originalOrder[1]);
  });

  it('should handle empty array', () => {
    const sorted = sortCardsByRarity([]);
    expect(sorted).toEqual([]);
  });

  it('should handle single element array', () => {
    const cards: PackCard[] = [
      { id: 'card1', rarity: 'common', isRevealed: false, isHolo: false, holoType: 'none' } as PackCard,
    ];

    const sorted = sortCardsByRarity(cards);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].id).toBe('card1');
  });
});

describe('getSuccessRateText', () => {
  it('should return correct text for 100% success rate', () => {
    const recipe = CRAFTING_RECIPES.find(r => r.id === 'common_to_uncommon')!;
    expect(recipe.successRate).toBe(1.0);

    const text = getSuccessRateText(recipe);
    expect(text).toBe('100% success rate');
  });

  it('should return correct text for 50% success rate', () => {
    const recipe = CRAFTING_RECIPES.find(r => r.id === 'rare_to_epic')!;
    expect(recipe.successRate).toBe(0.5);

    const text = getSuccessRateText(recipe);
    expect(text).toBe('50% success rate');
  });

  it('should round decimal success rates correctly', () => {
    const recipe = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      inputRarity: 'common' as const,
      inputCount: 5,
      outputRarity: 'uncommon' as const,
      outputCount: 1,
      successRate: 0.666, // 66.6%
    };

    const text = getSuccessRateText(recipe);
    expect(text).toBe('67% success rate');
  });
});

describe('getFailureReturnText', () => {
  it('should return text for recipes with fail return rate', () => {
    const recipe = CRAFTING_RECIPES.find(r => r.id === 'rare_to_epic')!;
    expect(recipe.failReturnRate).toBe(0.6);

    const text = getFailureReturnText(recipe);
    expect(text).toBe('On failure: 3 of 5 cards returned (60%)');
  });

  it('should return default text for recipes without fail return rate', () => {
    const recipe = CRAFTING_RECIPES.find(r => r.id === 'common_to_uncommon')!;
    expect(recipe.failReturnRate).toBeUndefined();

    const text = getFailureReturnText(recipe);
    expect(text).toBe('All cards consumed on failure');
  });

  it('should handle zero return rate correctly', () => {
    const recipe = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      inputRarity: 'common' as const,
      inputCount: 5,
      outputRarity: 'uncommon' as const,
      outputCount: 1,
      successRate: 0.5,
      failReturnRate: 0,
    };

    const text = getFailureReturnText(recipe);
    // Zero return rate is treated as "all cards consumed" (falsy check)
    expect(text).toBe('All cards consumed on failure');
  });
});

describe('rollCraftingSuccess', () => {
  it('should return true when roll is below success rate', () => {
    const recipe = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      inputRarity: 'common' as const,
      inputCount: 5,
      outputRarity: 'uncommon' as const,
      outputCount: 1,
      successRate: 0.5, // 50% success rate
    };

    // Mock Math.random to return 0.3 (30% < 50% = success)
    const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.3);

    const result = rollCraftingSuccess(recipe);
    expect(result).toBe(true);

    mockRandom.mockRestore();
  });

  it('should return false when roll is above success rate', () => {
    const recipe = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      inputRarity: 'common' as const,
      inputCount: 5,
      outputRarity: 'uncommon' as const,
      outputCount: 1,
      successRate: 0.5, // 50% success rate
    };

    // Mock Math.random to return 0.7 (70% > 50% = failure)
    const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.7);

    const result = rollCraftingSuccess(recipe);
    expect(result).toBe(false);

    mockRandom.mockRestore();
  });

  it('should handle zero success rate edge case', () => {
    const recipe = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      inputRarity: 'common' as const,
      inputCount: 5,
      outputRarity: 'uncommon' as const,
      outputCount: 1,
      successRate: 0, // 0% success rate
    };

    // Mock Math.random to return 0 (minimum possible value)
    const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = rollCraftingSuccess(recipe);
    expect(result).toBe(false); // 0 is not < 0

    mockRandom.mockRestore();
  });

  it('should handle 100% success rate edge case', () => {
    const recipe = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      inputRarity: 'common' as const,
      inputCount: 5,
      outputRarity: 'uncommon' as const,
      outputCount: 1,
      successRate: 1.0, // 100% success rate
    };

    // Mock Math.random to return 0.99 (maximum value is < 1.0)
    const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const result = rollCraftingSuccess(recipe);
    expect(result).toBe(true); // 0.99 < 1.0

    mockRandom.mockRestore();
  });
});

describe('Edge Cases - Empty Inventory, Max Cost, Zero Success Rate', () => {
  it('should handle empty inventory edge case', () => {
    const inventory = new Map();
    const recipe = CRAFTING_RECIPES.find(r => r.id === 'common_to_uncommon')!;

    const result = hasCardsForRecipe(recipe, inventory);
    expect(result).toBe(false);
  });

  it('should handle max cost recipe (legendary to mythic)', () => {
    const legendaryToMythic = CRAFTING_RECIPES.find(r => r.id === 'legendary_to_mythic')!;
    const cost = calculateCraftingCost(legendaryToMythic);

    // Legendary to mythic should be the most expensive recipe
    expect(cost).toBe(2500);

    // Player with slightly less cannot afford
    expect(canAffordCraft(legendaryToMythic, 2499)).toBe(false);

    // Player with exact amount can afford
    expect(canAffordCraft(legendaryToMythic, 2500)).toBe(true);
  });

  it('should handle zero success rate edge case', () => {
    const recipe = {
      id: 'test_zero_success',
      name: 'Zero Success Test',
      description: 'Test zero success rate',
      inputRarity: 'common' as const,
      inputCount: 5,
      outputRarity: 'uncommon' as const,
      outputCount: 1,
      successRate: 0, // 0% success rate - guaranteed failure
    };

    // Mock Math.random to return 0 (minimum possible value)
    const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = rollCraftingSuccess(recipe);
    expect(result).toBe(false); // Even with 0 roll, 0 is not < 0

    mockRandom.mockRestore();
  });

  it('should handle empty card selection edge case', () => {
    const recipe = CRAFTING_RECIPES.find(r => r.id === 'common_to_uncommon')!;

    const result = validateCardRarities(recipe, []);
    expect(result.valid).toBe(false);
    expect(result.errorType).toBe('EMPTY_SELECTION');
  });

  it('should handle zero cost edge case', () => {
    const zeroCostRecipe = {
      id: 'zero_cost',
      name: 'Zero Cost',
      description: 'Zero cost recipe',
      inputRarity: 'common' as const,
      inputCount: 0,
      outputRarity: 'common' as const,
      outputCount: 1,
      successRate: 1.0,
    };

    const cost = calculateCraftingCost(zeroCostRecipe);
    expect(cost).toBe(0);
  });
});
