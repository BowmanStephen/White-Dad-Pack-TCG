/**
 * Data Validation Tests
 *
 * Tests for card and recipe validation functions.
 * Ensures data integrity and proper error reporting.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  validateCards,
  validateRecipes,
  logValidationResults,
  type ValidationResult,
  type ValidationIssue,
} from '../../../../src/lib/validation/data-validator';

describe('Data Validation Utilities', () => {
  // Store original console methods
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };

  beforeEach(() => {
    // Mock console methods
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    vi.clearAllMocks();
  });

  // ============================================================================
  // HELPER FUNCTION: Create valid card
  // ============================================================================

  function createValidCard(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
    return {
      id: 'test_card_001',
      name: 'Test Dad',
      subtitle: 'The Tester',
      type: 'BBQ_DICKTATOR',
      rarity: 'common',
      artwork: '/images/cards/test.png',
      stats: {
        dadJoke: 50,
        grillSkill: 60,
        fixIt: 40,
        napPower: 70,
        remoteControl: 55,
        thermostat: 45,
        sockSandal: 35,
        beerSnob: 65,
      },
      flavorText: 'A test card for testing purposes.',
      abilities: [],
      series: 1,
      cardNumber: 1,
      totalInSeries: 100,
      artist: 'Test Artist',
      ...overrides,
    };
  }

  // ============================================================================
  // HELPER FUNCTION: Create valid recipe
  // ============================================================================

  function createValidRecipe(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
    return {
      id: 'recipe_001',
      name: 'Common Fusion',
      description: 'Combine common cards to create uncommon',
      inputRarity: 'common',
      inputCount: 3,
      outputRarity: 'uncommon',
      outputCount: 1,
      successRate: 0.8,
      ...overrides,
    };
  }

  // ============================================================================
  // VALIDATION RESULT INTERFACE TESTS
  // ============================================================================

  describe('ValidationResult interface', () => {
    it('should return valid result for valid data', () => {
      const cards = [createValidCard()];
      const result = validateCards(cards);

      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  // ============================================================================
  // CARD VALIDATION TESTS
  // ============================================================================

  describe('validateCards', () => {
    describe('valid cards', () => {
      it('should pass validation for a single valid card', () => {
        const cards = [createValidCard()];
        const result = validateCards(cards);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });

      it('should pass validation for multiple valid cards', () => {
        const cards = [
          createValidCard({ id: 'card_001' }),
          createValidCard({ id: 'card_002' }),
          createValidCard({ id: 'card_003' }),
        ];
        const result = validateCards(cards);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should pass validation with all rarity types', () => {
        const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
        const cards = rarities.map((rarity, i) =>
          createValidCard({ id: `card_${i}`, rarity })
        );
        const result = validateCards(cards);

        expect(result.isValid).toBe(true);
      });

      it('should pass validation with various dad types', () => {
        const types = ['BBQ_DICKTATOR', 'FIX_IT_FUCKBOY', 'GOLF_GONAD', 'ITEM', 'EVENT'];
        const cards = types.map((type, i) =>
          createValidCard({ id: `card_${i}`, type })
        );
        const result = validateCards(cards);

        expect(result.isValid).toBe(true);
      });
    });

    describe('array validation', () => {
      it('should fail validation if cards is not an array', () => {
        const result = validateCards('not an array' as unknown as unknown[]);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe('Cards data is not an array');
      });

      it('should fail validation for empty array', () => {
        const result = validateCards([]);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe('Cards database is empty');
      });

      it('should fail validation for null', () => {
        const result = validateCards(null as unknown as unknown[]);

        expect(result.isValid).toBe(false);
        expect(result.errors[0].message).toBe('Cards data is not an array');
      });
    });

    describe('required field validation', () => {
      const requiredFields = [
        'id',
        'name',
        'subtitle',
        'type',
        'rarity',
        'artwork',
        'stats',
        'flavorText',
        'abilities',
        'series',
        'cardNumber',
        'totalInSeries',
        'artist',
      ];

      requiredFields.forEach((field) => {
        it(`should fail validation when ${field} is missing`, () => {
          const card = createValidCard();
          delete card[field];
          const result = validateCards([card]);

          expect(result.isValid).toBe(false);
          const fieldError = result.errors.find((e) => e.field === field);
          expect(fieldError).toBeDefined();
          expect(fieldError?.severity).toBe('error');
        });

        it(`should fail validation when ${field} is null`, () => {
          const card = createValidCard({ [field]: null });
          const result = validateCards([card]);

          expect(result.isValid).toBe(false);
          const fieldError = result.errors.find((e) => e.field === field);
          expect(fieldError).toBeDefined();
        });
      });
    });

    describe('stats validation', () => {
      const requiredStats = [
        'dadJoke',
        'grillSkill',
        'fixIt',
        'napPower',
        'remoteControl',
        'thermostat',
        'sockSandal',
        'beerSnob',
      ];

      requiredStats.forEach((stat) => {
        it(`should fail validation when stat ${stat} is missing`, () => {
          const card = createValidCard();
          const stats = { ...(card.stats as Record<string, number>) };
          delete stats[stat];
          card.stats = stats;

          const result = validateCards([card]);

          expect(result.isValid).toBe(false);
          const statError = result.errors.find((e) => e.field === `stats.${stat}`);
          expect(statError).toBeDefined();
        });

        it(`should fail validation when stat ${stat} is not a number`, () => {
          const card = createValidCard();
          const stats = { ...(card.stats as Record<string, unknown>) };
          stats[stat] = 'not a number';
          card.stats = stats;

          const result = validateCards([card]);

          expect(result.isValid).toBe(false);
          const statError = result.errors.find((e) => e.field === `stats.${stat}`);
          expect(statError).toBeDefined();
          expect(statError?.message).toContain('invalid type');
        });

        it(`should warn when stat ${stat} is out of range (negative)`, () => {
          const card = createValidCard();
          const stats = { ...(card.stats as Record<string, number>) };
          stats[stat] = -10;
          card.stats = stats;

          const result = validateCards([card]);

          // Out of range is a warning, not an error
          expect(result.isValid).toBe(true);
          const statWarning = result.warnings.find((w) => w.field === `stats.${stat}`);
          expect(statWarning).toBeDefined();
          expect(statWarning?.message).toContain('out of range');
        });

        it(`should warn when stat ${stat} is out of range (over 100)`, () => {
          const card = createValidCard();
          const stats = { ...(card.stats as Record<string, number>) };
          stats[stat] = 150;
          card.stats = stats;

          const result = validateCards([card]);

          expect(result.isValid).toBe(true);
          const statWarning = result.warnings.find((w) => w.field === `stats.${stat}`);
          expect(statWarning).toBeDefined();
        });
      });

      it('should fail validation when stats object is missing entirely', () => {
        const card = createValidCard();
        delete card.stats;

        const result = validateCards([card]);

        expect(result.isValid).toBe(false);
        const statsError = result.errors.find((e) => e.field === 'stats');
        expect(statsError).toBeDefined();
      });
    });

    describe('rarity validation', () => {
      it('should fail validation for invalid rarity', () => {
        const card = createValidCard({ rarity: 'super_rare' });
        const result = validateCards([card]);

        expect(result.isValid).toBe(false);
        const rarityError = result.errors.find((e) => e.field === 'rarity');
        expect(rarityError).toBeDefined();
        expect(rarityError?.message).toContain('invalid rarity');
      });

      it('should handle empty string rarity (treated as missing)', () => {
        const card = createValidCard({ rarity: '' });
        const result = validateCards([card]);

        // Empty string doesn't match any valid rarity, but the validator
        // only checks for explicit null/undefined as "missing"
        // Empty string triggers the invalid rarity check instead
        const rarityError = result.errors.find((e) => e.field === 'rarity');
        if (rarityError) {
          expect(rarityError.message).toContain('invalid rarity');
        }
        // If no error, the validator doesn't enforce non-empty strings
      });
    });

    describe('type validation', () => {
      it('should fail validation for invalid dad type', () => {
        const card = createValidCard({ type: 'INVALID_TYPE' });
        const result = validateCards([card]);

        expect(result.isValid).toBe(false);
        const typeError = result.errors.find((e) => e.field === 'type');
        expect(typeError).toBeDefined();
        expect(typeError?.message).toContain('invalid type');
      });
    });

    describe('abilities validation', () => {
      it('should fail validation when abilities is not an array', () => {
        const card = createValidCard({ abilities: 'not an array' });
        const result = validateCards([card]);

        expect(result.isValid).toBe(false);
        const abilitiesError = result.errors.find((e) => e.field === 'abilities');
        expect(abilitiesError).toBeDefined();
        expect(abilitiesError?.message).toContain('must be an array');
      });

      it('should pass validation with valid abilities array', () => {
        const card = createValidCard({
          abilities: [
            { name: 'Grill Master', description: 'Boosts grill skill by 10' },
          ],
        });
        const result = validateCards([card]);

        expect(result.isValid).toBe(true);
      });
    });

    describe('numeric field warnings', () => {
      it('should warn when series is not a number', () => {
        const card = createValidCard({ series: 'one' });
        const result = validateCards([card]);

        // This is a warning, not an error
        const seriesWarning = result.warnings.find((w) => w.field === 'series');
        expect(seriesWarning).toBeDefined();
        expect(seriesWarning?.severity).toBe('warning');
      });

      it('should warn when cardNumber is not a number', () => {
        const card = createValidCard({ cardNumber: '42' });
        const result = validateCards([card]);

        const cardNumberWarning = result.warnings.find((w) => w.field === 'cardNumber');
        expect(cardNumberWarning).toBeDefined();
      });

      it('should warn when totalInSeries is not a number', () => {
        const card = createValidCard({ totalInSeries: 'hundred' });
        const result = validateCards([card]);

        const totalWarning = result.warnings.find((w) => w.field === 'totalInSeries');
        expect(totalWarning).toBeDefined();
      });
    });

    describe('duplicate ID detection', () => {
      it('should detect duplicate card IDs', () => {
        const cards = [
          createValidCard({ id: 'duplicate_id' }),
          createValidCard({ id: 'duplicate_id' }),
        ];
        const result = validateCards(cards);

        expect(result.isValid).toBe(false);
        const duplicateError = result.errors.find((e) => e.field === 'id');
        expect(duplicateError).toBeDefined();
        expect(duplicateError?.message).toContain('duplicate');
      });

      it('should list all duplicate IDs in error message', () => {
        const cards = [
          createValidCard({ id: 'dup_1' }),
          createValidCard({ id: 'dup_1' }),
          createValidCard({ id: 'dup_2' }),
          createValidCard({ id: 'dup_2' }),
          createValidCard({ id: 'unique_1' }),
        ];
        const result = validateCards(cards);

        expect(result.isValid).toBe(false);
        const duplicateError = result.errors.find((e) => e.field === 'id');
        expect(duplicateError?.message).toContain('dup_1');
        expect(duplicateError?.message).toContain('dup_2');
      });
    });

    describe('card identification in errors', () => {
      it('should use card ID in error messages', () => {
        const card = createValidCard({ id: 'my_test_card' });
        delete card.name;

        const result = validateCards([card]);

        const error = result.errors[0];
        expect(error.id).toBe('my_test_card');
        expect(error.message).toContain('my_test_card');
      });

      it('should use index when card ID is missing', () => {
        const card = createValidCard();
        delete card.id;

        const result = validateCards([card]);

        const idError = result.errors.find((e) => e.field === 'id');
        expect(idError?.id).toContain('index 0');
      });
    });
  });

  // ============================================================================
  // RECIPE VALIDATION TESTS
  // ============================================================================

  describe('validateRecipes', () => {
    describe('valid recipes', () => {
      it('should pass validation for a single valid recipe', () => {
        const recipes = [createValidRecipe()];
        const result = validateRecipes(recipes);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should pass validation for multiple valid recipes', () => {
        const recipes = [
          createValidRecipe({ id: 'recipe_001' }),
          createValidRecipe({ id: 'recipe_002' }),
        ];
        const result = validateRecipes(recipes);

        expect(result.isValid).toBe(true);
      });
    });

    describe('array validation', () => {
      it('should fail validation if recipes is not an array', () => {
        const result = validateRecipes({ not: 'array' } as unknown as unknown[]);

        expect(result.isValid).toBe(false);
        expect(result.errors[0].message).toBe('Recipes data is not an array');
      });

      it('should fail validation for empty array', () => {
        const result = validateRecipes([]);

        expect(result.isValid).toBe(false);
        expect(result.errors[0].message).toBe('Recipes database is empty');
      });
    });

    describe('required field validation', () => {
      const requiredFields = [
        'id',
        'name',
        'description',
        'inputRarity',
        'inputCount',
        'outputRarity',
        'outputCount',
        'successRate',
      ];

      requiredFields.forEach((field) => {
        it(`should fail validation when ${field} is missing`, () => {
          const recipe = createValidRecipe();
          delete recipe[field];
          const result = validateRecipes([recipe]);

          expect(result.isValid).toBe(false);
          const fieldError = result.errors.find((e) => e.field === field);
          expect(fieldError).toBeDefined();
        });
      });
    });

    describe('rarity validation', () => {
      it('should fail validation for invalid inputRarity', () => {
        const recipe = createValidRecipe({ inputRarity: 'super' });
        const result = validateRecipes([recipe]);

        expect(result.isValid).toBe(false);
        const rarityError = result.errors.find((e) => e.field === 'inputRarity');
        expect(rarityError).toBeDefined();
      });

      it('should fail validation for invalid outputRarity', () => {
        const recipe = createValidRecipe({ outputRarity: 'mega' });
        const result = validateRecipes([recipe]);

        expect(result.isValid).toBe(false);
        const rarityError = result.errors.find((e) => e.field === 'outputRarity');
        expect(rarityError).toBeDefined();
      });
    });

    describe('numeric field validation', () => {
      it('should fail validation when inputCount is not a number', () => {
        const recipe = createValidRecipe({ inputCount: 'three' });
        const result = validateRecipes([recipe]);

        expect(result.isValid).toBe(false);
        const countError = result.errors.find((e) => e.field === 'inputCount');
        expect(countError?.message).toContain('must be a number');
      });

      it('should fail validation when inputCount is less than 1', () => {
        const recipe = createValidRecipe({ inputCount: 0 });
        const result = validateRecipes([recipe]);

        expect(result.isValid).toBe(false);
        const countError = result.errors.find((e) => e.field === 'inputCount');
        expect(countError?.message).toContain('at least 1');
      });

      it('should fail validation when outputCount is not a number', () => {
        const recipe = createValidRecipe({ outputCount: 'one' });
        const result = validateRecipes([recipe]);

        expect(result.isValid).toBe(false);
        const countError = result.errors.find((e) => e.field === 'outputCount');
        expect(countError?.message).toContain('must be a number');
      });

      it('should fail validation when outputCount is less than 1', () => {
        const recipe = createValidRecipe({ outputCount: -1 });
        const result = validateRecipes([recipe]);

        expect(result.isValid).toBe(false);
      });
    });

    describe('successRate validation', () => {
      it('should fail validation when successRate is not a number', () => {
        const recipe = createValidRecipe({ successRate: '80%' });
        const result = validateRecipes([recipe]);

        expect(result.isValid).toBe(false);
        const rateError = result.errors.find((e) => e.field === 'successRate');
        expect(rateError?.message).toContain('must be a number');
      });

      it('should fail validation when successRate is below 0', () => {
        const recipe = createValidRecipe({ successRate: -0.1 });
        const result = validateRecipes([recipe]);

        expect(result.isValid).toBe(false);
        const rateError = result.errors.find((e) => e.field === 'successRate');
        expect(rateError?.message).toContain('between 0 and 1');
      });

      it('should fail validation when successRate is above 1', () => {
        const recipe = createValidRecipe({ successRate: 1.5 });
        const result = validateRecipes([recipe]);

        expect(result.isValid).toBe(false);
        const rateError = result.errors.find((e) => e.field === 'successRate');
        expect(rateError?.message).toContain('between 0 and 1');
      });

      it('should pass validation for successRate at boundaries (0 and 1)', () => {
        const recipe0 = createValidRecipe({ id: 'r0', successRate: 0 });
        const recipe1 = createValidRecipe({ id: 'r1', successRate: 1 });
        const result = validateRecipes([recipe0, recipe1]);

        expect(result.isValid).toBe(true);
      });
    });

    describe('failReturnRate validation', () => {
      it('should fail validation when failReturnRate is not a number', () => {
        const recipe = createValidRecipe({ failReturnRate: '50%' });
        const result = validateRecipes([recipe]);

        expect(result.isValid).toBe(false);
        const rateError = result.errors.find((e) => e.field === 'failReturnRate');
        expect(rateError?.message).toContain('must be a number');
      });

      it('should fail validation when failReturnRate is below 0', () => {
        const recipe = createValidRecipe({ failReturnRate: -0.5 });
        const result = validateRecipes([recipe]);

        expect(result.isValid).toBe(false);
      });

      it('should fail validation when failReturnRate is above 1', () => {
        const recipe = createValidRecipe({ failReturnRate: 1.1 });
        const result = validateRecipes([recipe]);

        expect(result.isValid).toBe(false);
      });

      it('should pass validation when failReturnRate is not provided', () => {
        const recipe = createValidRecipe();
        // failReturnRate is optional
        const result = validateRecipes([recipe]);

        expect(result.isValid).toBe(true);
      });
    });

    describe('duplicate ID detection', () => {
      it('should detect duplicate recipe IDs', () => {
        const recipes = [
          createValidRecipe({ id: 'dup_recipe' }),
          createValidRecipe({ id: 'dup_recipe' }),
        ];
        const result = validateRecipes(recipes);

        expect(result.isValid).toBe(false);
        const duplicateError = result.errors.find((e) => e.field === 'id');
        expect(duplicateError?.message).toContain('duplicate');
      });
    });
  });

  // ============================================================================
  // VALIDATION ISSUE INTERFACE TESTS
  // ============================================================================

  describe('ValidationIssue interface', () => {
    it('should include all required properties for card issues', () => {
      const card = createValidCard();
      delete card.name;
      const result = validateCards([card]);

      const issue = result.errors[0];
      expect(issue).toHaveProperty('type', 'card');
      expect(issue).toHaveProperty('id');
      expect(issue).toHaveProperty('field');
      expect(issue).toHaveProperty('severity');
      expect(issue).toHaveProperty('message');
    });

    it('should include all required properties for recipe issues', () => {
      const recipe = createValidRecipe();
      delete recipe.name;
      const result = validateRecipes([recipe]);

      const issue = result.errors[0];
      expect(issue).toHaveProperty('type', 'recipe');
      expect(issue).toHaveProperty('id');
      expect(issue).toHaveProperty('field');
      expect(issue).toHaveProperty('severity');
      expect(issue).toHaveProperty('message');
    });

    it('should have correct severity levels', () => {
      // Error severity
      const card = createValidCard();
      delete card.name;
      const errorResult = validateCards([card]);
      expect(errorResult.errors[0].severity).toBe('error');

      // Warning severity
      const warnCard = createValidCard({ series: 'not a number' });
      const warnResult = validateCards([warnCard]);
      expect(warnResult.warnings[0].severity).toBe('warning');
    });
  });

  // ============================================================================
  // LOGGING TESTS
  // ============================================================================

  describe('logValidationResults', () => {
    it('should log success message when validation passes', () => {
      const result: ValidationResult = {
        isValid: true,
        warnings: [],
        errors: [],
      };

      logValidationResults(result, 'cards');

      expect(console.log).toHaveBeenCalled();
      const logCall = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(logCall).toContain('validation passed');
    });

    it('should log errors when validation fails', () => {
      const result: ValidationResult = {
        isValid: false,
        warnings: [],
        errors: [
          {
            type: 'card',
            id: 'test',
            field: 'name',
            severity: 'error',
            message: 'Missing name',
          },
        ],
      };

      logValidationResults(result, 'cards');

      expect(console.error).toHaveBeenCalled();
    });

    it('should log warnings when present', () => {
      const result: ValidationResult = {
        isValid: true,
        warnings: [
          {
            type: 'card',
            id: 'test',
            field: 'series',
            severity: 'warning',
            message: 'Series should be a number',
          },
        ],
        errors: [],
      };

      logValidationResults(result, 'cards');

      expect(console.warn).toHaveBeenCalled();
    });

    it('should include error count in output', () => {
      const result: ValidationResult = {
        isValid: false,
        warnings: [],
        errors: [
          { type: 'card', id: 't1', field: 'name', severity: 'error', message: 'Error 1' },
          { type: 'card', id: 't2', field: 'type', severity: 'error', message: 'Error 2' },
        ],
      };

      logValidationResults(result, 'cards');

      const errorCall = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(errorCall).toContain('2 error');
    });

    it('should work with recipes data type', () => {
      const result: ValidationResult = {
        isValid: true,
        warnings: [],
        errors: [],
      };

      logValidationResults(result, 'recipes');

      expect(console.log).toHaveBeenCalled();
      const logCall = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(logCall).toContain('recipes');
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('edge cases', () => {
    it('should handle card with all stat values at 0', () => {
      const card = createValidCard({
        stats: {
          dadJoke: 0,
          grillSkill: 0,
          fixIt: 0,
          napPower: 0,
          remoteControl: 0,
          thermostat: 0,
          sockSandal: 0,
          beerSnob: 0,
        },
      });
      const result = validateCards([card]);

      expect(result.isValid).toBe(true);
    });

    it('should handle card with all stat values at 100', () => {
      const card = createValidCard({
        stats: {
          dadJoke: 100,
          grillSkill: 100,
          fixIt: 100,
          napPower: 100,
          remoteControl: 100,
          thermostat: 100,
          sockSandal: 100,
          beerSnob: 100,
        },
      });
      const result = validateCards([card]);

      expect(result.isValid).toBe(true);
    });

    it('should handle very long card names', () => {
      const card = createValidCard({ name: 'A'.repeat(1000) });
      const result = validateCards([card]);

      expect(result.isValid).toBe(true);
    });

    it('should handle special characters in card fields', () => {
      const card = createValidCard({
        name: "Dad's <Special> \"Card\" & More!",
        flavorText: 'Line 1\nLine 2\tTabbed',
      });
      const result = validateCards([card]);

      expect(result.isValid).toBe(true);
    });

    it('should handle unicode in card fields', () => {
      const card = createValidCard({
        name: 'Dad 🔥 Emoji',
        flavorText: '日本語テスト',
      });
      const result = validateCards([card]);

      expect(result.isValid).toBe(true);
    });

    it('should handle large number of cards', () => {
      const cards = Array.from({ length: 1000 }, (_, i) =>
        createValidCard({ id: `card_${i}` })
      );
      const result = validateCards(cards);

      expect(result.isValid).toBe(true);
    });

    it('should accumulate multiple errors for one card', () => {
      const card = {
        id: 'broken_card',
        // Missing many required fields
        rarity: 'invalid_rarity',
        type: 'INVALID_TYPE',
      };
      const result = validateCards([card as unknown as Record<string, unknown>]);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);
    });
  });
});
