/**
 * DadDeck™ Collection Migration System Tests
 */

import { describe, it, expect } from 'vitest';
import {
  migrateCollection,
  versionCollection,
  unversionCollection,
  createMigrationEncoder,
  validateCollection,
  exportCollection as migrateExportCollection,
  importCollection as migrateImportCollection,
  CURRENT_SCHEMA_VERSION,
  getMigrationHistory,
  type VersionedCollection,
} from '@/lib/utils/migrations';
import type { Collection, Rarity } from '@/types';

describe('Collection Migration System', () => {
  describe('Version Management', () => {
    it('should have a current schema version', () => {
      expect(CURRENT_SCHEMA_VERSION).toBeGreaterThan(0);
    });

    it('should return migration history', () => {
      const history = getMigrationHistory();

      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);

      history.forEach((entry) => {
        expect(entry).toHaveProperty('version');
        expect(entry).toHaveProperty('description');
        expect(typeof entry.version).toBe('number');
        expect(typeof entry.description).toBe('string');
      });
    });
  });

  describe('Version Envelopes', () => {
    it('should wrap collection in version envelope', () => {
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

      const versioned = versionCollection(collection);

      expect(versioned).toHaveProperty('version');
      expect(versioned).toHaveProperty('data');
      expect(versioned.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(versioned.data).toEqual(collection);
    });

    it('should unwrap versioned collection', () => {
      const collection: Collection = {
        packs: [],
        metadata: {
          totalPacksOpened: 0,
          lastOpenedAt: null,
          uniqueCards: [],
          rarePulls: 0,
          holoPulls: 0,
          created: new Date(),
        },
      };

      const versioned: VersionedCollection = {
        version: CURRENT_SCHEMA_VERSION,
        data: collection,
      };

      const unversioned = unversionCollection(versioned);

      expect(unversioned).toEqual(collection);
    });
  });

  describe('Migration Engine', () => {
    it('should migrate unversioned data (v0)', () => {
      const oldData = JSON.stringify({
        packs: [],
        metadata: {
          totalPacksOpened: 0,
          lastOpenedAt: null,
          uniqueCards: [],
          rarePulls: 0,
          holoPulls: 0,
        },
      });

      const result = migrateCollection(oldData);

      expect(result.success).toBe(true);
      expect(result.collection).toBeDefined();
      expect(result.collection?.metadata.rarityCounts).toBeDefined();
      expect(result.collection?.metadata.created).toBeDefined();
    });

    it('should skip migration for current version', () => {
      const currentData = JSON.stringify({
        version: CURRENT_SCHEMA_VERSION,
        data: {
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
        },
      });

      const result = migrateCollection(currentData);

      expect(result.success).toBe(true);
      expect(result.collection).toBeDefined();
    });

    it('should handle corrupted data gracefully', () => {
      const corruptedData = 'invalid json {{{';

      const result = migrateCollection(corruptedData);

      expect(result.success).toBe(true);
      expect(result.collection).toBeDefined();
      expect(result.collection?.packs).toEqual([]);
    });

    it('should handle missing packs array', () => {
      const invalidData = JSON.stringify({
        metadata: {
          totalPacksOpened: 0,
        },
      });

      const result = migrateCollection(invalidData);

      expect(result.success).toBe(true);
      expect(result.collection).toBeDefined();
      expect(result.collection?.packs).toEqual([]);
    });
  });

  describe('Migration 1: Add rarityCounts', () => {
    it('should add rarityCounts to metadata', () => {
      const oldCollection = {
        packs: [
          {
            id: 'pack-1',
            cards: [
              { id: 'card-1', rarity: 'common' as Rarity },
              { id: 'card-2', rarity: 'rare' as Rarity },
            ],
            openedAt: new Date(),
            bestRarity: 'rare' as Rarity,
            design: 'standard' as const,
          },
        ],
        metadata: {
          totalPacksOpened: 1,
          lastOpenedAt: null,
          uniqueCards: ['card-1', 'card-2'],
          rarePulls: 1,
          holoPulls: 0,
        },
      };

      const result = migrateCollection(JSON.stringify(oldCollection));

      expect(result.success).toBe(true);
      expect(result.collection?.metadata.rarityCounts).toBeDefined();
      expect(result.collection?.metadata.rarityCounts?.common).toBe(1);
      expect(result.collection?.metadata.rarityCounts?.rare).toBe(1);
    });

    it('should compute rarity counts correctly', () => {
      const collectionWithPacks = {
        packs: [
          {
            id: 'pack-1',
            cards: [
              { id: 'card-1', rarity: 'common' as Rarity },
              { id: 'card-2', rarity: 'common' as Rarity },
              { id: 'card-3', rarity: 'rare' as Rarity },
            ],
            openedAt: new Date(),
            bestRarity: 'rare' as Rarity,
            design: 'standard' as const,
          },
          {
            id: 'pack-2',
            cards: [
              { id: 'card-4', rarity: 'epic' as Rarity },
            ],
            openedAt: new Date(),
            bestRarity: 'epic' as Rarity,
            design: 'standard' as const,
          },
        ],
        metadata: {
          totalPacksOpened: 2,
          lastOpenedAt: null,
          uniqueCards: ['card-1', 'card-2', 'card-3', 'card-4'],
          rarePulls: 2,
          holoPulls: 0,
        },
      };

      const result = migrateCollection(JSON.stringify(collectionWithPacks));

      expect(result.success).toBe(true);
      expect(result.collection?.metadata.rarityCounts?.common).toBe(2);
      expect(result.collection?.metadata.rarityCounts?.rare).toBe(1);
      expect(result.collection?.metadata.rarityCounts?.epic).toBe(1);
    });
  });

  describe('Migration 2: Add seasonId support', () => {
    it('should add seasonId to cards', () => {
      const oldCollection = {
        version: 1,
        data: {
          packs: [
            {
              id: 'pack-1',
              cards: [
                {
                  id: 'card-1',
                  name: 'Test Card',
                  subtitle: 'Test',
                  type: 'BBQ_DAD',
                  rarity: 'common' as Rarity,
                  artwork: '/test.png',
                  stats: {
                    dadJoke: 50,
                    grillSkill: 75,
                    fixIt: 30,
                    napPower: 40,
                    remoteControl: 60,
                    thermostat: 55,
                    sockSandal: 45,
                    beerSnob: 65,
                  },
                  flavorText: 'Test',
                  abilities: [],
                  series: 1,
                  cardNumber: 1,
                  totalInSeries: 50,
                  artist: 'Test',
                  isRevealed: false,
                  isHolo: false,
                  holoType: 'none',
                },
              ],
              openedAt: new Date(),
              bestRarity: 'common' as Rarity,
              design: 'standard' as const,
            },
          ],
          metadata: {
            totalPacksOpened: 1,
            lastOpenedAt: null,
            uniqueCards: ['card-1'],
            rarePulls: 0,
            holoPulls: 0,
            created: new Date(),
            rarityCounts: {
              common: 1,
              uncommon: 0,
              rare: 0,
              epic: 0,
              legendary: 0,
              mythic: 0,
            },
          },
        },
      };

      const result = migrateCollection(JSON.stringify(oldCollection));

      expect(result.success).toBe(true);
      expect(result.collection?.packs[0].cards[0].seasonId).toBe(1);
    });
  });

  describe('Migration Encoder', () => {
    it('should encode collection with version', () => {
      const encoder = createMigrationEncoder();

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

      const encoded = encoder.encode(collection);
      const parsed = JSON.parse(encoded);

      expect(parsed).toHaveProperty('version');
      expect(parsed.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(parsed).toHaveProperty('data');
    });

    it('should decode and migrate old data', () => {
      const encoder = createMigrationEncoder();

      const oldData = JSON.stringify({
        packs: [],
        metadata: {
          totalPacksOpened: 0,
          lastOpenedAt: null,
          uniqueCards: [],
          rarePulls: 0,
          holoPulls: 0,
        },
      });

      const decoded = encoder.decode(oldData);

      expect(decoded).toBeDefined();
      expect(decoded.packs).toBeDefined();
      expect(decoded.metadata).toBeDefined();
      expect(decoded.metadata.rarityCounts).toBeDefined();
      expect(decoded.metadata.created).toBeDefined();
    });

    it('should handle Date serialization', () => {
      const encoder = createMigrationEncoder();

      const testDate = new Date('2024-01-15T12:00:00Z');

      const collection: Collection = {
        packs: [
          {
            id: 'pack-1',
            cards: [],
            openedAt: testDate,
            bestRarity: 'common',
            design: 'standard',
          },
        ],
        metadata: {
          totalPacksOpened: 1,
          lastOpenedAt: testDate,
          uniqueCards: [],
          rarePulls: 0,
          holoPulls: 0,
          created: testDate,
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

      const encoded = encoder.encode(collection);
      const decoded = encoder.decode(encoded);

      expect(decoded.packs[0].openedAt).toEqual(testDate);
      expect(decoded.metadata.lastOpenedAt).toEqual(testDate);
      expect(decoded.metadata.created).toEqual(testDate);
    });

    it('should return default collection for corrupted data', () => {
      const encoder = createMigrationEncoder();

      const corrupted = 'not valid json';

      const decoded = encoder.decode(corrupted);

      expect(decoded).toBeDefined();
      expect(decoded.packs).toEqual([]);
      expect(decoded.metadata.totalPacksOpened).toBe(0);
    });
  });

  describe('Collection Validation', () => {
    it('should validate correct collection structure', () => {
      const validCollection: Collection = {
        packs: [
          {
            id: 'pack-1',
            cards: [
              {
                id: 'card-1',
                name: 'Test Card',
                subtitle: 'Test Subtitle',
                type: 'BBQ_DAD',
                rarity: 'common',
                artwork: '/test.png',
                stats: {
                  dadJoke: 50,
                  grillSkill: 75,
                  fixIt: 30,
                  napPower: 40,
                  remoteControl: 60,
                  thermostat: 55,
                  sockSandal: 45,
                  beerSnob: 65,
                },
                flavorText: 'Test flavor',
                abilities: [],
                series: 1,
                cardNumber: 1,
                totalInSeries: 50,
                artist: 'Test Artist',
                isRevealed: false,
                isHolo: false,
                holoType: 'none',
              },
            ],
            openedAt: new Date(),
            bestRarity: 'common',
            design: 'standard',
          },
        ],
        metadata: {
          totalPacksOpened: 1,
          lastOpenedAt: new Date(),
          uniqueCards: ['card-1'],
          rarePulls: 0,
          holoPulls: 0,
          created: new Date(),
          rarityCounts: {
            common: 1,
            uncommon: 0,
            rare: 0,
            epic: 0,
            legendary: 0,
            mythic: 0,
          },
        },
      };

      expect(validateCollection(validCollection)).toBe(true);
    });

    it('should reject invalid collection structure', () => {
      const invalidCollection = {
        metadata: {
          totalPacksOpened: 0,
        },
      };

      expect(validateCollection(invalidCollection)).toBe(false);
    });

    it('should reject collection with invalid packs', () => {
      const invalidPacks: Collection = {
        packs: [
          {
            id: 'pack-1',
            openedAt: new Date(),
            bestRarity: 'common',
            design: 'standard',
          } as any,
        ],
        metadata: {
          totalPacksOpened: 1,
          lastOpenedAt: null,
          uniqueCards: [],
          rarePulls: 0,
          holoPulls: 0,
        },
      };

      expect(validateCollection(invalidPacks)).toBe(false);
    });
  });

  describe('Import/Export', () => {
    it('should export collection without version envelope', () => {
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

      const exported = migrateExportCollection(collection);
      const parsed = JSON.parse(exported);

      expect(parsed).not.toHaveProperty('version');
      expect(parsed).toHaveProperty('packs');
      expect(parsed).toHaveProperty('metadata');
    });

    it('should import and migrate old collection', () => {
      const oldCollection = JSON.stringify({
        packs: [],
        metadata: {
          totalPacksOpened: 0,
          lastOpenedAt: null,
          uniqueCards: [],
          rarePulls: 0,
          holoPulls: 0,
        },
      });

      const result = migrateImportCollection(oldCollection);

      expect(result.success).toBe(true);
      expect(result.collection).toBeDefined();
      expect(result.collection?.metadata.rarityCounts).toBeDefined();
      expect(result.collection?.metadata.created).toBeDefined();
    });

    it('should import versioned collection', () => {
      const versionedCollection = JSON.stringify({
        version: 1,
        data: {
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
        },
      });

      const result = migrateImportCollection(versionedCollection);

      expect(result.success).toBe(true);
      expect(result.collection).toBeDefined();
    });

    it('should reject invalid import data', () => {
      const invalidJson = 'not valid json';

      const result = migrateImportCollection(invalidJson);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Idempotency', () => {
    it('should be safe to run migrations multiple times', () => {
      const oldData = JSON.stringify({
        packs: [],
        metadata: {
          totalPacksOpened: 0,
          lastOpenedAt: null,
          uniqueCards: [],
          rarePulls: 0,
          holoPulls: 0,
        },
      });

      // First migration
      const result1 = migrateCollection(oldData);
      expect(result1.success).toBe(true);
      expect(result1.collection).toBeDefined();

      // Second migration (should be idempotent)
      const result2 = migrateCollection(oldData);
      expect(result2.success).toBe(true);
      expect(result2.collection).toBeDefined();
    });
  });
});
