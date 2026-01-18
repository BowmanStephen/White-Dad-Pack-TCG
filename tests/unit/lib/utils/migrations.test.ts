import { describe, it, expect, beforeEach } from 'vitest';
import type { Collection, PackCard } from '@/types';
import {
  CURRENT_SCHEMA_VERSION,
  migrateCollection,
  versionCollection,
  unversionCollection,
  createMigrationEncoder,
  validateCollection,
  getMigrationHistory,
} from '@/lib/utils/migrations';

describe('Migration System', () => {
  describe('Schema Version', () => {
    it('should have correct current schema version', () => {
      expect(CURRENT_SCHEMA_VERSION).toBe(3);
    });

    it('should provide migration history', () => {
      const history = getMigrationHistory();
      expect(history).toHaveLength(3);
      expect(history[0].version).toBe(1);
      expect(history[1].version).toBe(2);
      expect(history[2].version).toBe(3);
    });
  });

  describe('Migration 3: DICKTATOR DAD Naming', () => {
    it('should convert old BBQ_DAD to BBQ_DICKTATOR', () => {
      const oldCollection = JSON.stringify({
        version: 2,
        data: {
          packs: [
            {
              id: 'pack-1',
              cards: [
                {
                  id: 'card-1',
                  type: 'BBQ_DAD',
                  rarity: 'rare',
                  name: 'Test Card',
                  subtitle: 'Test',
                  artwork: '/test.png',
                  stats: {
                    dadJoke: 50,
                    grillSkill: 50,
                    fixIt: 50,
                    napPower: 50,
                    remoteControl: 50,
                    thermostat: 50,
                    sockSandal: 50,
                    beerSnob: 50,
                  },
                  flavorText: 'Test',
                  abilities: [],
                  series: 1,
                  cardNumber: 1,
                  totalInSeries: 100,
                  artist: 'Test',
                } as PackCard,
              ],
              openedAt: new Date(),
              bestRarity: 'rare',
              design: 'standard' as const,
            },
          ],
          metadata: {
            totalPacksOpened: 1,
            lastOpenedAt: new Date(),
            uniqueCards: [],
            rarePulls: 0,
            holoPulls: 0,
            created: new Date(),
            rarityCounts: {
              common: 0,
              uncommon: 0,
              rare: 1,
              epic: 0,
              legendary: 0,
              mythic: 0,
            },
          },
        },
      });

      const result = migrateCollection(oldCollection);

      expect(result.success).toBe(true);
      expect(result.collection).toBeDefined();

      if (result.collection) {
        const pack = result.collection.packs[0];
        const card = pack.cards[0];

        expect(card.type).toBe('BBQ_DICKTATOR');
        expect(card.effects).toBeDefined();
        expect(Array.isArray(card.effects)).toBe(true);
      }
    });

    it('should convert all DICKTATOR DAD types correctly', () => {
      const typeMapping = {
        'FIX_IT_DAD': 'FIX_IT_FUCKBOY',
        'GOLF_DAD': 'GOLF_GONAD',
        'COUCH_DAD': 'COUCH_CUMMANDER',
        'LAWN_DAD': 'LAWN_LUNATIC',
        'CAR_DAD': 'CAR_COCK',
        'OFFICE_DAD': 'OFFICE_ORGASMS',
        'COOL_DAD': 'COOL_CUCKS',
        'COACH_DAD': 'COACH_CUMSTERS',
        'CHEF_DAD': 'CHEF_CUMSTERS',
        'HOLIDAY_DAD': 'HOLIDAY_HORNDOGS',
        'WAREHOUSE_DAD': 'WAREHOUSE_WANKERS',
        'VINTAGE_DAD': 'VINTAGE_VAGABONDS',
        'FASHION_DAD': 'FASHION_FUCK',
        'TECH_DAD': 'TECH_TWATS',
      };

      for (const [oldType, newType] of Object.entries(typeMapping)) {
        const oldCollection = JSON.stringify({
          version: 2,
          data: {
            packs: [
              {
                id: 'pack-1',
                cards: [
                  {
                    id: 'card-1',
                    type: oldType,
                    rarity: 'common',
                    name: 'Test',
                    subtitle: 'Test',
                    artwork: '/test.png',
                    stats: {
                      dadJoke: 50,
                      grillSkill: 50,
                      fixIt: 50,
                      napPower: 50,
                      remoteControl: 50,
                      thermostat: 50,
                      sockSandal: 50,
                      beerSnob: 50,
                    },
                    flavorText: 'Test',
                    abilities: [],
                    series: 1,
                    cardNumber: 1,
                    totalInSeries: 100,
                    artist: 'Test',
                  } as PackCard,
                ],
                openedAt: new Date(),
                bestRarity: 'common',
                design: 'standard' as const,
              },
            ],
            metadata: {
              totalPacksOpened: 1,
              lastOpenedAt: new Date(),
              uniqueCards: [],
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
        });

        const result = migrateCollection(oldCollection);
        expect(result.success).toBe(true);

        if (result.collection) {
          const card = result.collection.packs[0].cards[0];
          expect(card.type).toBe(newType);
        }
      }
    });

    it('should add effects array to migrated cards', () => {
      const oldCollection = JSON.stringify({
        version: 2,
        data: {
          packs: [
            {
              id: 'pack-1',
              cards: [
                {
                  id: 'card-1',
                  type: 'BBQ_DAD',
                  rarity: 'rare',
                  name: 'Test',
                  subtitle: 'Test',
                  artwork: '/test.png',
                  stats: {
                    dadJoke: 50,
                    grillSkill: 50,
                    fixIt: 50,
                    napPower: 50,
                    remoteControl: 50,
                    thermostat: 50,
                    sockSandal: 50,
                    beerSnob: 50,
                  },
                  flavorText: 'Test',
                  abilities: [],
                  series: 1,
                  cardNumber: 1,
                  totalInSeries: 100,
                  artist: 'Test',
                } as PackCard,
              ],
              openedAt: new Date(),
              bestRarity: 'rare',
              design: 'standard' as const,
            },
          ],
          metadata: {
            totalPacksOpened: 1,
            lastOpenedAt: new Date(),
            uniqueCards: [],
            rarePulls: 0,
            holoPulls: 0,
            created: new Date(),
            rarityCounts: {
              common: 0,
              uncommon: 0,
              rare: 1,
              epic: 0,
              legendary: 0,
              mythic: 0,
            },
          },
        },
      });

      const result = migrateCollection(oldCollection);
      expect(result.success).toBe(true);

      if (result.collection) {
        const card = result.collection.packs[0].cards[0];
        expect(card.effects).toBeDefined();
        expect(Array.isArray(card.effects)).toBe(true);
      }
    });

    it('should preserve special card types (EVENT, TERRAIN, etc)', () => {
      const specialTypes = ['EVENT', 'TERRAIN', 'EVOLUTION', 'CURSE', 'TRAP', 'ITEM'];

      for (const specialType of specialTypes) {
        const oldCollection = JSON.stringify({
          version: 2,
          data: {
            packs: [
              {
                id: 'pack-1',
                cards: [
                  {
                    id: 'card-1',
                    type: specialType,
                    rarity: 'rare',
                    name: 'Test',
                    subtitle: 'Test',
                    artwork: '/test.png',
                    stats: {
                      dadJoke: 50,
                      grillSkill: 50,
                      fixIt: 50,
                      napPower: 50,
                      remoteControl: 50,
                      thermostat: 50,
                      sockSandal: 50,
                      beerSnob: 50,
                    },
                    flavorText: 'Test',
                    abilities: [],
                    series: 1,
                    cardNumber: 1,
                    totalInSeries: 100,
                    artist: 'Test',
                  } as PackCard,
                ],
                openedAt: new Date(),
                bestRarity: 'rare',
                design: 'standard' as const,
              },
            ],
            metadata: {
              totalPacksOpened: 1,
              lastOpenedAt: new Date(),
              uniqueCards: [],
              rarePulls: 0,
              holoPulls: 0,
              created: new Date(),
              rarityCounts: {
                common: 0,
                uncommon: 0,
                rare: 1,
                epic: 0,
                legendary: 0,
                mythic: 0,
              },
            },
          },
        });

        const result = migrateCollection(oldCollection);
        expect(result.success).toBe(true);

        if (result.collection) {
          const card = result.collection.packs[0].cards[0];
          expect(card.type).toBe(specialType);
        }
      }
    });
  });

  describe('Collection Versioning', () => {
    it('should version collection with current schema version', () => {
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
      expect(versioned.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(versioned.data).toBe(collection);
    });

    it('should unversion collection correctly', () => {
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
      const unversioned = unversionCollection(versioned);

      expect(unversioned).toBe(collection);
    });
  });

  describe('Collection Validation', () => {
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

    it('should reject invalid collection structure', () => {
      expect(validateCollection(null)).toBe(false);
      expect(validateCollection(undefined)).toBe(false);
      expect(validateCollection({})).toBe(false);
      expect(validateCollection({ packs: 'not-array' })).toBe(false);
      expect(validateCollection({ packs: [] })).toBe(false); // Missing metadata
    });
  });

  describe('Migration Encoder', () => {
    it('should create migration encoder', () => {
      const encoder = createMigrationEncoder();

      expect(encoder).toBeDefined();
      expect(typeof encoder.encode).toBe('function');
      expect(typeof encoder.decode).toBe('function');
    });

    it('should encode and decode collection with dates', () => {
      const now = new Date();
      const collection: Collection = {
        packs: [],
        metadata: {
          totalPacksOpened: 0,
          lastOpenedAt: now,
          uniqueCards: [],
          rarePulls: 0,
          holoPulls: 0,
          created: now,
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
    });
  });
});
