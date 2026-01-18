import { describe, it, expect } from 'vitest';
import type { Collection } from '@/types';
import {
  createMigrationEncoder,
  validateCollection,
  createDefaultCollection,
  exportCollection,
  importCollection,
} from '@/lib/utils/migrations';

describe('Collection Storage', () => {
  describe('createDefaultCollection', () => {
    it('should create a default collection with empty packs', () => {
      const collection = createDefaultCollection();

      expect(collection.packs).toEqual([]);
      expect(collection.metadata.totalPacksOpened).toBe(0);
      expect(collection.metadata.uniqueCards).toEqual([]);
      expect(collection.metadata.rarePulls).toBe(0);
      expect(collection.metadata.holoPulls).toBe(0);
      expect(collection.metadata.created).toBeInstanceOf(Date);
    });

    it('should initialize rarity counts to zero', () => {
      const collection = createDefaultCollection();

      expect(collection.metadata.rarityCounts).toEqual({
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        mythic: 0,
      });
    });
  });

  describe('validateCollection', () => {
    it('should validate correct collection structure', () => {
      const collection: Collection = {
        packs: [],
        metadata: {
          totalPacksOpened: 0,
          lastOpenedAt: null,
          uniqueCards: [],
          rarePulls: 0,
          holoPulls: 0,
          created: new Date(),
          rarityCounts: {
            common: 0,
            uncommon: 0,
            rare: 0,
            epic: 0,
            legendary: 0,
            mythic: 0,
          },
        },
      };

      expect(validateCollection(collection)).toBe(true);
    });

    it('should reject null/undefined', () => {
      expect(validateCollection(null)).toBe(false);
      expect(validateCollection(undefined)).toBe(false);
    });

    it('should reject empty object', () => {
      expect(validateCollection({})).toBe(false);
    });

    it('should reject non-array packs', () => {
      expect(validateCollection({ packs: 'not-array' })).toBe(false);
    });

    it('should reject missing metadata', () => {
      expect(validateCollection({ packs: [] })).toBe(false);
    });

    it('should reject invalid metadata', () => {
      expect(validateCollection({ packs: [], metadata: 'not-object' })).toBe(false);
      expect(validateCollection({ packs: [], metadata: {} })).toBe(false);
    });

    it('should reject missing uniqueCards array', () => {
      expect(
        validateCollection({
          packs: [],
          metadata: { totalPacksOpened: 0 },
        })
      ).toBe(false);
    });

    it('should reject invalid pack structure', () => {
      expect(
        validateCollection({
          packs: [{ id: 'test' }], // Missing cards array
          metadata: { totalPacksOpened: 0, uniqueCards: [] },
        })
      ).toBe(false);
    });
  });

  describe('createMigrationEncoder', () => {
    it('should create encoder with encode and decode methods', () => {
      const encoder = createMigrationEncoder();

      expect(encoder).toBeDefined();
      expect(typeof encoder.encode).toBe('function');
      expect(typeof encoder.decode).toBe('function');
    });

    it('should encode and decode collection preserving structure', () => {
      const collection: Collection = {
        packs: [],
        metadata: {
          totalPacksOpened: 5,
          lastOpenedAt: new Date('2026-01-01'),
          uniqueCards: ['card-1', 'card-2'],
          rarePulls: 2,
          holoPulls: 1,
          created: new Date('2025-12-01'),
          rarityCounts: {
            common: 10,
            uncommon: 5,
            rare: 2,
            epic: 1,
            legendary: 0,
            mythic: 0,
          },
        },
      };

      const encoder = createMigrationEncoder();
      const encoded = encoder.encode(collection);
      const decoded = encoder.decode(encoded);

      expect(decoded.metadata.totalPacksOpened).toBe(5);
      expect(decoded.metadata.uniqueCards).toEqual(['card-1', 'card-2']);
      expect(decoded.metadata.rarePulls).toBe(2);
      expect(decoded.metadata.holoPulls).toBe(1);
    });

    it('should handle Date serialization correctly', () => {
      const created = new Date('2025-12-01T10:00:00Z');
      const lastOpened = new Date('2026-01-15T15:30:00Z');

      const collection: Collection = {
        packs: [],
        metadata: {
          totalPacksOpened: 0,
          lastOpenedAt: lastOpened,
          uniqueCards: [],
          rarePulls: 0,
          holoPulls: 0,
          created: created,
          rarityCounts: {
            common: 0,
            uncommon: 0,
            rare: 0,
            epic: 0,
            legendary: 0,
            mythic: 0,
          },
        },
      };

      const encoder = createMigrationEncoder();
      const encoded = encoder.encode(collection);
      const decoded = encoder.decode(encoded);

      expect(decoded.metadata.created).toBeInstanceOf(Date);
      expect(decoded.metadata.lastOpenedAt).toBeInstanceOf(Date);
      expect(decoded.metadata.created.toISOString()).toBe(created.toISOString());
      expect(decoded.metadata.lastOpenedAt!.toISOString()).toBe(lastOpened.toISOString());
    });

    it('should handle null lastOpenedAt', () => {
      const collection: Collection = {
        packs: [],
        metadata: {
          totalPacksOpened: 0,
          lastOpenedAt: null,
          uniqueCards: [],
          rarePulls: 0,
          holoPulls: 0,
          created: new Date(),
          rarityCounts: {
            common: 0,
            uncommon: 0,
            rare: 0,
            epic: 0,
            legendary: 0,
            mythic: 0,
          },
        },
      };

      const encoder = createMigrationEncoder();
      const encoded = encoder.encode(collection);
      const decoded = encoder.decode(encoded);

      expect(decoded.metadata.lastOpenedAt).toBeNull();
    });

    it('should return default collection for invalid JSON', () => {
      const encoder = createMigrationEncoder();
      const decoded = encoder.decode('invalid json');

      expect(decoded.packs).toEqual([]);
      expect(decoded.metadata.totalPacksOpened).toBe(0);
    });

    it('should return default collection for invalid structure', () => {
      const encoder = createMigrationEncoder();
      const decoded = encoder.decode(JSON.stringify({ invalid: 'data' }));

      expect(decoded.packs).toEqual([]);
      expect(decoded.metadata.totalPacksOpened).toBe(0);
    });
  });

  describe('exportCollection', () => {
    it('should export collection as formatted JSON', () => {
      const collection: Collection = {
        packs: [],
        metadata: {
          totalPacksOpened: 0,
          lastOpenedAt: null,
          uniqueCards: [],
          rarePulls: 0,
          holoPulls: 0,
          created: new Date('2025-01-01'),
          rarityCounts: {
            common: 0,
            uncommon: 0,
            rare: 0,
            epic: 0,
            legendary: 0,
            mythic: 0,
          },
        },
      };

      const exported = exportCollection(collection);
      const parsed = JSON.parse(exported);

      expect(parsed.packs).toEqual([]);
      expect(parsed.metadata.totalPacksOpened).toBe(0);
    });
  });

  describe('importCollection', () => {
    it('should import valid collection JSON', () => {
      const collection: Collection = {
        packs: [],
        metadata: {
          totalPacksOpened: 3,
          lastOpenedAt: null,
          uniqueCards: ['a', 'b'],
          rarePulls: 1,
          holoPulls: 0,
          created: new Date(),
          rarityCounts: {
            common: 5,
            uncommon: 3,
            rare: 1,
            epic: 0,
            legendary: 0,
            mythic: 0,
          },
        },
      };

      const jsonData = JSON.stringify(collection);
      const result = importCollection(jsonData);

      expect(result.success).toBe(true);
      expect(result.collection).toBeDefined();
      expect(result.collection!.metadata.totalPacksOpened).toBe(3);
    });

    it('should reject invalid JSON', () => {
      const result = importCollection('not valid json');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject invalid collection structure', () => {
      const result = importCollection(JSON.stringify({ invalid: 'data' }));

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid collection data structure');
    });
  });
});
