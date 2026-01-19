/**
 * Type-Safe Utility Functions Tests
 *
 * Tests for type-safe Record access and initialization utilities.
 * Ensures proper key validation and default value creation.
 */

import { describe, it, expect } from 'vitest';
import {
  getRarityRecordValue,
  getDadTypeRecordValue,
  createRarityRecord,
  createDadTypeRecord,
} from '../../../../src/lib/utils/type-guards';

describe('Type-Safe Utility Functions', () => {
  // ============================================================================
  // getRarityRecordValue TESTS
  // ============================================================================

  describe('getRarityRecordValue', () => {
    const testRecord: Record<string, number> = {
      common: 0,
      uncommon: 1,
      rare: 2,
      epic: 3,
      legendary: 4,
      mythic: 5,
    };

    describe('valid keys', () => {
      it('should return correct value for common', () => {
        expect(getRarityRecordValue(testRecord, 'common')).toBe(0);
      });

      it('should return correct value for uncommon', () => {
        expect(getRarityRecordValue(testRecord, 'uncommon')).toBe(1);
      });

      it('should return correct value for rare', () => {
        expect(getRarityRecordValue(testRecord, 'rare')).toBe(2);
      });

      it('should return correct value for epic', () => {
        expect(getRarityRecordValue(testRecord, 'epic')).toBe(3);
      });

      it('should return correct value for legendary', () => {
        expect(getRarityRecordValue(testRecord, 'legendary')).toBe(4);
      });

      it('should return correct value for mythic', () => {
        expect(getRarityRecordValue(testRecord, 'mythic')).toBe(5);
      });
    });

    describe('invalid keys', () => {
      it('should throw error for invalid rarity key', () => {
        expect(() => getRarityRecordValue(testRecord, 'super_rare')).toThrow(
          'Invalid rarity key: super_rare'
        );
      });

      it('should throw error for empty string key', () => {
        expect(() => getRarityRecordValue(testRecord, '')).toThrow(
          'Invalid rarity key: '
        );
      });

      it('should throw error for misspelled key', () => {
        expect(() => getRarityRecordValue(testRecord, 'commmon')).toThrow(
          'Invalid rarity key: commmon'
        );
      });

      it('should throw error for case-sensitive mismatch', () => {
        expect(() => getRarityRecordValue(testRecord, 'Common')).toThrow(
          'Invalid rarity key: Common'
        );
      });

      it('should throw error for numeric key as string', () => {
        expect(() => getRarityRecordValue(testRecord, '0')).toThrow(
          'Invalid rarity key: 0'
        );
      });
    });

    describe('different value types', () => {
      it('should work with string values', () => {
        const stringRecord: Record<string, string> = {
          common: 'gray',
          uncommon: 'blue',
          rare: 'gold',
        };
        expect(getRarityRecordValue(stringRecord, 'common')).toBe('gray');
        expect(getRarityRecordValue(stringRecord, 'rare')).toBe('gold');
      });

      it('should work with object values', () => {
        const objectRecord: Record<string, { color: string; level: number }> = {
          common: { color: 'gray', level: 1 },
          rare: { color: 'gold', level: 3 },
        };
        expect(getRarityRecordValue(objectRecord, 'common')).toEqual({
          color: 'gray',
          level: 1,
        });
      });

      it('should work with array values', () => {
        const arrayRecord: Record<string, number[]> = {
          common: [1, 2, 3],
          rare: [4, 5, 6],
        };
        expect(getRarityRecordValue(arrayRecord, 'common')).toEqual([1, 2, 3]);
      });

      it('should work with boolean values', () => {
        const boolRecord: Record<string, boolean> = {
          common: false,
          rare: true,
        };
        expect(getRarityRecordValue(boolRecord, 'common')).toBe(false);
        expect(getRarityRecordValue(boolRecord, 'rare')).toBe(true);
      });

      it('should work with undefined as a value (but key exists)', () => {
        const undefinedRecord: Record<string, undefined> = {
          common: undefined,
        };
        expect(getRarityRecordValue(undefinedRecord, 'common')).toBeUndefined();
      });

      it('should work with null as a value', () => {
        const nullRecord: Record<string, null> = {
          common: null,
        };
        expect(getRarityRecordValue(nullRecord, 'common')).toBeNull();
      });
    });

    describe('edge cases', () => {
      it('should work with empty record', () => {
        const emptyRecord: Record<string, number> = {};
        expect(() => getRarityRecordValue(emptyRecord, 'common')).toThrow(
          'Invalid rarity key: common'
        );
      });

      it('should work with partial record', () => {
        const partialRecord: Record<string, number> = {
          common: 1,
          rare: 3,
        };
        expect(getRarityRecordValue(partialRecord, 'common')).toBe(1);
        expect(() => getRarityRecordValue(partialRecord, 'uncommon')).toThrow(
          'Invalid rarity key: uncommon'
        );
      });

      it('should work with keys containing special characters', () => {
        const specialRecord: Record<string, number> = {
          'special-key': 1,
        };
        expect(getRarityRecordValue(specialRecord, 'special-key')).toBe(1);
      });
    });
  });

  // ============================================================================
  // getDadTypeRecordValue TESTS
  // ============================================================================

  describe('getDadTypeRecordValue', () => {
    const testRecord: Record<string, string> = {
      BBQ_DICKTATOR: 'BBQ Dicktator',
      FIX_IT_FUCKBOY: 'Fix-It Fuckboy',
      GOLF_GONAD: 'Golf Gonad',
      COUCH_CUMMANDER: 'Couch Cummander',
      LAWN_LUNATIC: 'Lawn Lunatic',
      ITEM: 'Item',
      EVENT: 'Event',
    };

    describe('valid keys', () => {
      it('should return correct value for BBQ_DICKTATOR', () => {
        expect(getDadTypeRecordValue(testRecord, 'BBQ_DICKTATOR')).toBe('BBQ Dicktator');
      });

      it('should return correct value for FIX_IT_FUCKBOY', () => {
        expect(getDadTypeRecordValue(testRecord, 'FIX_IT_FUCKBOY')).toBe('Fix-It Fuckboy');
      });

      it('should return correct value for special types', () => {
        expect(getDadTypeRecordValue(testRecord, 'ITEM')).toBe('Item');
        expect(getDadTypeRecordValue(testRecord, 'EVENT')).toBe('Event');
      });
    });

    describe('invalid keys', () => {
      it('should throw error for invalid dad type key', () => {
        expect(() => getDadTypeRecordValue(testRecord, 'INVALID_DAD')).toThrow(
          'Invalid dad type key: INVALID_DAD'
        );
      });

      it('should throw error for lowercase version', () => {
        expect(() => getDadTypeRecordValue(testRecord, 'bbq_dicktator')).toThrow(
          'Invalid dad type key: bbq_dicktator'
        );
      });

      it('should throw error for partial key', () => {
        expect(() => getDadTypeRecordValue(testRecord, 'BBQ')).toThrow(
          'Invalid dad type key: BBQ'
        );
      });

      it('should throw error for empty string', () => {
        expect(() => getDadTypeRecordValue(testRecord, '')).toThrow(
          'Invalid dad type key: '
        );
      });
    });

    describe('different value types', () => {
      it('should work with number values', () => {
        const numberRecord: Record<string, number> = {
          BBQ_DICKTATOR: 100,
          FIX_IT_FUCKBOY: 200,
        };
        expect(getDadTypeRecordValue(numberRecord, 'BBQ_DICKTATOR')).toBe(100);
      });

      it('should work with object values', () => {
        const configRecord: Record<string, { icon: string; color: string }> = {
          BBQ_DICKTATOR: { icon: '🔥', color: 'red' },
        };
        expect(getDadTypeRecordValue(configRecord, 'BBQ_DICKTATOR')).toEqual({
          icon: '🔥',
          color: 'red',
        });
      });
    });
  });

  // ============================================================================
  // createRarityRecord TESTS
  // ============================================================================

  describe('createRarityRecord', () => {
    describe('number values', () => {
      it('should create record with all rarity keys initialized to 0', () => {
        const record = createRarityRecord(0);

        expect(record.common).toBe(0);
        expect(record.uncommon).toBe(0);
        expect(record.rare).toBe(0);
        expect(record.epic).toBe(0);
        expect(record.legendary).toBe(0);
        expect(record.mythic).toBe(0);
      });

      it('should create record with all rarity keys initialized to custom number', () => {
        const record = createRarityRecord(100);

        expect(record.common).toBe(100);
        expect(record.mythic).toBe(100);
      });

      it('should have exactly 6 keys', () => {
        const record = createRarityRecord(0);
        expect(Object.keys(record)).toHaveLength(6);
      });
    });

    describe('string values', () => {
      it('should create record with all rarity keys initialized to string', () => {
        const record = createRarityRecord('default');

        expect(record.common).toBe('default');
        expect(record.uncommon).toBe('default');
        expect(record.rare).toBe('default');
        expect(record.epic).toBe('default');
        expect(record.legendary).toBe('default');
        expect(record.mythic).toBe('default');
      });

      it('should work with empty string', () => {
        const record = createRarityRecord('');
        expect(record.common).toBe('');
      });
    });

    describe('boolean values', () => {
      it('should create record with false values', () => {
        const record = createRarityRecord(false);

        expect(record.common).toBe(false);
        expect(record.mythic).toBe(false);
      });

      it('should create record with true values', () => {
        const record = createRarityRecord(true);

        expect(record.common).toBe(true);
        expect(record.mythic).toBe(true);
      });
    });

    describe('object values', () => {
      it('should create record with object values', () => {
        const defaultConfig = { enabled: false, count: 0 };
        const record = createRarityRecord(defaultConfig);

        expect(record.common).toEqual(defaultConfig);
        expect(record.rare).toEqual(defaultConfig);
      });

      it('should share same object reference (not deep clone)', () => {
        const obj = { value: 1 };
        const record = createRarityRecord(obj);

        // All keys point to same object
        expect(record.common).toBe(obj);
        expect(record.rare).toBe(obj);

        // Mutation affects all
        obj.value = 2;
        expect(record.common.value).toBe(2);
        expect(record.rare.value).toBe(2);
      });
    });

    describe('array values', () => {
      it('should create record with array values', () => {
        const defaultArray = [1, 2, 3];
        const record = createRarityRecord(defaultArray);

        expect(record.common).toEqual([1, 2, 3]);
        expect(record.mythic).toEqual([1, 2, 3]);
      });

      it('should share same array reference', () => {
        const arr: number[] = [];
        const record = createRarityRecord(arr);

        record.common.push(1);
        expect(record.rare).toEqual([1]); // Same array
      });
    });

    describe('null and undefined values', () => {
      it('should create record with null values', () => {
        const record = createRarityRecord(null);

        expect(record.common).toBeNull();
        expect(record.mythic).toBeNull();
      });

      it('should create record with undefined values', () => {
        const record = createRarityRecord(undefined);

        expect(record.common).toBeUndefined();
        expect(record.mythic).toBeUndefined();
      });
    });

    describe('function values', () => {
      it('should create record with function values', () => {
        const fn = () => 'hello';
        const record = createRarityRecord(fn);

        expect(typeof record.common).toBe('function');
        expect(record.common()).toBe('hello');
      });
    });

    describe('key correctness', () => {
      it('should have exact rarity keys', () => {
        const record = createRarityRecord(0);
        const expectedKeys = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

        expect(Object.keys(record).sort()).toEqual(expectedKeys.sort());
      });

      it('should be usable with getRarityRecordValue', () => {
        const record = createRarityRecord(42);

        expect(getRarityRecordValue(record, 'common')).toBe(42);
        expect(getRarityRecordValue(record, 'mythic')).toBe(42);
      });
    });
  });

  // ============================================================================
  // createDadTypeRecord TESTS
  // ============================================================================

  describe('createDadTypeRecord', () => {
    describe('initialization', () => {
      it('should create record with all dad type keys initialized', () => {
        const record = createDadTypeRecord(0);

        // Core dad types
        expect(record.BBQ_DAD).toBe(0);
        expect(record.FIX_IT_DAD).toBe(0);
        expect(record.GOLF_DAD).toBe(0);
        expect(record.COUCH_DAD).toBe(0);
        expect(record.LAWN_DAD).toBe(0);
        expect(record.CAR_DAD).toBe(0);
        expect(record.OFFICE_DAD).toBe(0);
        expect(record.COOL_DAD).toBe(0);
        expect(record.COACH_DAD).toBe(0);
        expect(record.CHEF_DAD).toBe(0);
        expect(record.HOLIDAY_DAD).toBe(0);
        expect(record.WAREHOUSE_DAD).toBe(0);
        expect(record.VINTAGE_DAD).toBe(0);
        expect(record.FASHION_DAD).toBe(0);
        expect(record.TECH_DAD).toBe(0);

        // Extended types
        expect(record.SUBURBAN_SPY).toBe(0);
        expect(record.GAMER_GIZZARDS).toBe(0);
        expect(record.PREPPER_PENIS).toBe(0);
        expect(record.BBQ_BRAWLER).toBe(0);
        expect(record.SUBURBAN_SOCIALITE).toBe(0);
        expect(record.NEIGHBORHOOD_NOSY).toBe(0);

        // Family variants
        expect(record.SON_SPAWNS).toBe(0);
        expect(record.DAUGHTER_DINGBATS).toBe(0);
        expect(record.UNCLE_UPROARS).toBe(0);
        expect(record.SUBURBAN_SIDEKICKS).toBe(0);

        // Special card types
        expect(record.ITEM).toBe(0);
        expect(record.EVENT).toBe(0);
        expect(record.TERRAIN).toBe(0);
        expect(record.EVOLUTION).toBe(0);
        expect(record.CURSE).toBe(0);
        expect(record.TRAP).toBe(0);
      });

      it('should have correct number of keys', () => {
        const record = createDadTypeRecord(0);
        // Should have 31 keys based on the implementation
        expect(Object.keys(record).length).toBe(31);
      });
    });

    describe('different value types', () => {
      it('should work with string values', () => {
        const record = createDadTypeRecord('inactive');

        expect(record.BBQ_DAD).toBe('inactive');
        expect(record.ITEM).toBe('inactive');
      });

      it('should work with boolean values', () => {
        const record = createDadTypeRecord(false);

        expect(record.BBQ_DAD).toBe(false);
        expect(record.TRAP).toBe(false);
      });

      it('should work with object values', () => {
        const config = { enabled: true, bonus: 1.5 };
        const record = createDadTypeRecord(config);

        expect(record.BBQ_DAD).toEqual(config);
        expect(record.EVENT).toEqual(config);
      });

      it('should work with null', () => {
        const record = createDadTypeRecord(null);

        expect(record.BBQ_DAD).toBeNull();
        expect(record.CURSE).toBeNull();
      });
    });

    describe('usage with getDadTypeRecordValue', () => {
      it('should be usable with getDadTypeRecordValue for core types', () => {
        const record = createDadTypeRecord(100);

        expect(getDadTypeRecordValue(record, 'BBQ_DAD')).toBe(100);
        expect(getDadTypeRecordValue(record, 'COOL_DAD')).toBe(100);
      });

      it('should be usable with getDadTypeRecordValue for special types', () => {
        const record = createDadTypeRecord('default');

        expect(getDadTypeRecordValue(record, 'ITEM')).toBe('default');
        expect(getDadTypeRecordValue(record, 'EVENT')).toBe('default');
        expect(getDadTypeRecordValue(record, 'TRAP')).toBe('default');
      });
    });

    describe('key correctness', () => {
      it('should contain all expected core dad types', () => {
        const record = createDadTypeRecord(0);
        const coreDadTypes = [
          'BBQ_DAD',
          'FIX_IT_DAD',
          'GOLF_DAD',
          'COUCH_DAD',
          'LAWN_DAD',
          'CAR_DAD',
          'OFFICE_DAD',
          'COOL_DAD',
          'COACH_DAD',
          'CHEF_DAD',
          'HOLIDAY_DAD',
          'WAREHOUSE_DAD',
          'VINTAGE_DAD',
          'FASHION_DAD',
          'TECH_DAD',
        ];

        coreDadTypes.forEach((type) => {
          expect(record).toHaveProperty(type);
        });
      });

      it('should contain all expected special card types', () => {
        const record = createDadTypeRecord(0);
        const specialTypes = ['ITEM', 'EVENT', 'TERRAIN', 'EVOLUTION', 'CURSE', 'TRAP'];

        specialTypes.forEach((type) => {
          expect(record).toHaveProperty(type);
        });
      });

      it('should contain all expected family variants', () => {
        const record = createDadTypeRecord(0);
        const familyTypes = ['SON_SPAWNS', 'DAUGHTER_DINGBATS', 'UNCLE_UPROARS', 'SUBURBAN_SIDEKICKS'];

        familyTypes.forEach((type) => {
          expect(record).toHaveProperty(type);
        });
      });
    });

    describe('mutation behavior', () => {
      it('should allow independent modification after creation', () => {
        const record = createDadTypeRecord(0);

        record.BBQ_DAD = 100;
        record.ITEM = 50;

        expect(record.BBQ_DAD).toBe(100);
        expect(record.ITEM).toBe(50);
        expect(record.GOLF_DAD).toBe(0); // Unchanged
      });

      it('should share object reference for object values', () => {
        const obj = { count: 0 };
        const record = createDadTypeRecord(obj);

        obj.count = 5;
        expect(record.BBQ_DAD.count).toBe(5);
        expect(record.ITEM.count).toBe(5);
      });
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('integration tests', () => {
    it('should work together for type-safe record operations', () => {
      // Create a record
      const rarityMultipliers = createRarityRecord(1);

      // Modify specific values
      rarityMultipliers.rare = 1.5;
      rarityMultipliers.epic = 2.0;
      rarityMultipliers.legendary = 3.0;
      rarityMultipliers.mythic = 5.0;

      // Access values safely
      expect(getRarityRecordValue(rarityMultipliers, 'common')).toBe(1);
      expect(getRarityRecordValue(rarityMultipliers, 'rare')).toBe(1.5);
      expect(getRarityRecordValue(rarityMultipliers, 'mythic')).toBe(5.0);
    });

    it('should support common use case: tracking counts', () => {
      // Track card counts by rarity
      const rarityCounts = createRarityRecord(0);

      // Simulate adding cards
      rarityCounts.common += 10;
      rarityCounts.uncommon += 5;
      rarityCounts.rare += 2;
      rarityCounts.legendary += 1;

      // Check totals
      const total = Object.values(rarityCounts).reduce((a, b) => a + b, 0);
      expect(total).toBe(18);

      // Safely access
      expect(getRarityRecordValue(rarityCounts, 'common')).toBe(10);
    });

    it('should support common use case: tracking dad type progress', () => {
      // Track collection progress by dad type
      const collectionProgress = createDadTypeRecord(false);

      // Mark some as collected
      collectionProgress.BBQ_DAD = true;
      collectionProgress.GOLF_DAD = true;
      collectionProgress.ITEM = true;

      // Check progress
      const collected = Object.values(collectionProgress).filter(Boolean).length;
      expect(collected).toBe(3);

      // Safely access
      expect(getDadTypeRecordValue(collectionProgress, 'BBQ_DAD')).toBe(true);
      expect(getDadTypeRecordValue(collectionProgress, 'COUCH_DAD')).toBe(false);
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('edge cases', () => {
    it('should handle 0 as a valid value', () => {
      const record: Record<string, number> = { common: 0 };
      expect(getRarityRecordValue(record, 'common')).toBe(0);
    });

    it('should handle empty string as a valid value', () => {
      const record: Record<string, string> = { common: '' };
      expect(getRarityRecordValue(record, 'common')).toBe('');
    });

    it('should handle false as a valid value', () => {
      const record: Record<string, boolean> = { common: false };
      expect(getRarityRecordValue(record, 'common')).toBe(false);
    });

    it('should handle NaN as a value', () => {
      const record: Record<string, number> = { common: NaN };
      expect(getRarityRecordValue(record, 'common')).toBeNaN();
    });

    it('should handle Infinity as a value', () => {
      const record: Record<string, number> = { common: Infinity };
      expect(getRarityRecordValue(record, 'common')).toBe(Infinity);
    });

    it('should handle Symbol as a value', () => {
      const sym = Symbol('test');
      const record: Record<string, symbol> = { common: sym };
      expect(getRarityRecordValue(record, 'common')).toBe(sym);
    });

    it('should handle BigInt as a value', () => {
      const bigNum = BigInt(9007199254740991);
      const record: Record<string, bigint> = { common: bigNum };
      expect(getRarityRecordValue(record, 'common')).toBe(bigNum);
    });

    it('should handle Date as a value', () => {
      const date = new Date('2026-01-19');
      const record: Record<string, Date> = { common: date };
      expect(getRarityRecordValue(record, 'common')).toBe(date);
    });
  });
});
