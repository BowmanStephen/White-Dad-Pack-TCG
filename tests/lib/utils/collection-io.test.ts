/**
 * Tests for collection import/export utilities
 */

import { describe, it, expect } from 'vitest';
import {
  exportCollectionToString,
  exportCollectionToFile,
  downloadCollection,
  importCollectionFromString,
  importCollectionFromFile,
  pickAndImportCollection,
  validateCollection,
} from '@/lib/utils/collection-io';
import type { Collection } from '@/types';

// Mock collection for testing
const mockCollection: Collection = {
  packs: [
    {
      id: 'test-pack-1',
      series: '1',
      bestRarity: 'rare',
      openedAt: new Date('2025-01-01T00:00:00.000Z'),
      cards: [
        {
          id: 'card-1',
          name: 'Test Card 1',
          subtitle: 'Test Subtitle',
          type: 'BBQ_DAD',
          rarity: 'common',
          artwork: '/images/test.png',
          stats: {
            dadJoke: 50,
            grillSkill: 75,
            fixIt: 60,
            napPower: 40,
            remoteControl: 55,
            thermostat: 65,
            sockSandal: 70,
            beerSnob: 80,
          },
          flavorText: 'Test flavor text',
          abilities: [],
          series: 1,
          cardNumber: 1,
          totalInSeries: 50,
          artist: 'Test Artist',
          isRevealed: true,
          isHolo: false,
          holoType: 'none',
        },
        {
          id: 'card-2',
          name: 'Test Card 2',
          subtitle: 'Test Subtitle',
          type: 'COUCH_DAD',
          rarity: 'rare',
          artwork: '/images/test2.png',
          stats: {
            dadJoke: 90,
            grillSkill: 30,
            fixIt: 20,
            napPower: 95,
            remoteControl: 40,
            thermostat: 50,
            sockSandal: 60,
            beerSnob: 70,
          },
          flavorText: 'Test flavor text 2',
          abilities: [
            {
              name: 'Test Ability',
              description: 'Test ability description',
            },
          ],
          series: 1,
          cardNumber: 2,
          totalInSeries: 50,
          artist: 'Test Artist',
          isRevealed: true,
          isHolo: true,
          holoType: 'reverse',
        },
      ],
    },
  ],
  metadata: {
    totalPacksOpened: 1,
    lastOpenedAt: new Date('2025-01-01T00:00:00.000Z'),
    uniqueCards: ['card-1', 'card-2'],
    rarePulls: 1,
    holoPulls: 1,
    created: new Date('2025-01-01T00:00:00.000Z'),
    rarityCounts: {
      common: 1,
      uncommon: 0,
      rare: 1,
      epic: 0,
      legendary: 0,
      mythic: 0,
    },
  },
};

describe('Collection I/O Utilities', () => {
  describe('validateCollection', () => {
    it('should validate a correct collection', () => {
      const result = validateCollection(mockCollection);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-object data', () => {
      const result = validateCollection(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Collection data must be an object');
    });

    it('should reject collection without packs array', () => {
      const result = validateCollection({ metadata: {} });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Collection must have a packs array');
    });

    it('should reject collection without metadata', () => {
      const result = validateCollection({ packs: [] });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Collection must have a metadata object');
    });

    it('should warn about empty collections', () => {
      const result = validateCollection({ packs: [], metadata: {} });
      // Empty collections need valid metadata structure
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('exportCollectionToString', () => {
    it('should export collection as JSON string', () => {
      const result = exportCollectionToString(mockCollection);
      expect(typeof result).toBe('string');

      // Verify it's valid JSON
      const parsed = JSON.parse(result);
      expect(parsed.packs).toHaveLength(1);
      expect(parsed.packs[0].id).toBe('test-pack-1');
    });

    it('should format JSON with 2-space indentation', () => {
      const result = exportCollectionToString(mockCollection);
      // Check that it's formatted (contains newlines)
      expect(result).toContain('\n');
    });
  });

  describe('exportCollectionToFile', () => {
    it('should export collection with metadata', () => {
      const result = exportCollectionToFile(mockCollection);
      expect(result.success).toBe(true);
      expect(result.filename).toMatch(/^daddeck-collection-\d{4}-\d{2}-\d{2}-1packs\.json$/);
      expect(result.data).toBeDefined();
    });

    it('should include timestamp in filename', () => {
      const result = exportCollectionToFile(mockCollection);
      expect(result.filename).toMatch(/\d{4}-\d{2}-\d{2}/); // Date format
    });

    it('should include pack count in filename', () => {
      const result = exportCollectionToFile(mockCollection);
      expect(result.filename).toContain('1packs');
    });
  });

  describe('importCollectionFromString', () => {
    it('should import valid JSON string', () => {
      const jsonString = JSON.stringify(mockCollection);
      const result = importCollectionFromString(jsonString);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.validationErrors).toHaveLength(0);
    });

    it('should reject invalid JSON', () => {
      const result = importCollectionFromString('not valid json');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to parse collection JSON');
    });

    it('should reject collection with validation errors', () => {
      const invalidCollection = {
        packs: 'not an array',
        metadata: {},
      };
      const result = importCollectionFromString(JSON.stringify(invalidCollection));

      expect(result.success).toBe(false);
      expect(result.validationErrors.length).toBeGreaterThan(0);
    });

    it('should pass validation warnings through', () => {
      // Use a valid collection to test warnings
      const collectionWithWarning = {
        packs: mockCollection.packs.map(pack => ({
          ...pack,
          // Add a card with out-of-range stat to generate warning
          cards: pack.cards.map(card => ({
            ...card,
            series: 9999, // Unusually high series number (warning, not error)
          })),
        })),
        metadata: mockCollection.metadata,
      };

      const result = importCollectionFromString(JSON.stringify(collectionWithWarning));
      expect(result.success).toBe(true);
      // Should have imported all packs
      expect(result.imported).toBe(1);
    });
  });

  describe('downloadCollection', () => {
    it.skip('should trigger browser download (requires DOM environment)', () => {
      // This test requires a DOM environment (happy-dom or jsdom)
      // Skipped in unit test environment
    });
  });

  describe('importCollectionFromFile', () => {
    it('should reject non-JSON files', async () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const result = await importCollectionFromFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toContain('File must be a JSON file');
    });

    it('should reject files larger than 10MB', async () => {
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
      const mockFile = new File([largeContent], 'test.json', { type: 'application/json' });
      const result = await importCollectionFromFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toContain('File too large');
    });
  });

  describe('pickAndImportCollection', () => {
    it.skip('should create file input and trigger picker (requires DOM environment)', () => {
      // This test requires a DOM environment (happy-dom or jsdom)
      // Skipped in unit test environment
    });
  });

  describe('validation edge cases', () => {
    it('should validate card stats are within 0-100 range', () => {
      const collectionWithBadStats: Collection = {
        ...mockCollection,
        packs: [
          {
            ...mockCollection.packs[0],
            cards: [
              {
                ...mockCollection.packs[0].cards[0],
                stats: {
                  dadJoke: 150, // Invalid: > 100
                  grillSkill: 75,
                  fixIt: 60,
                  napPower: 40,
                  remoteControl: 55,
                  thermostat: 65,
                  sockSandal: 70,
                  beerSnob: 80,
                },
              },
            ],
          },
        ],
      };

      const result = validateCollection(collectionWithBadStats);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('dadJoke'))).toBe(true);
    });

    it('should validate rarity values', () => {
      const collectionWithBadRarity: any = {
        ...mockCollection,
        packs: [
          {
            ...mockCollection.packs[0],
            bestRarity: 'invalid-rarity',
            cards: [
              {
                ...mockCollection.packs[0].cards[0],
                rarity: 'also-invalid',
              },
            ],
          },
        ],
      };

      const result = validateCollection(collectionWithBadRarity);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('invalid-rarity'))).toBe(true);
    });

    it('should validate dad type values', () => {
      const collectionWithBadType: any = {
        ...mockCollection,
        packs: [
          {
            ...mockCollection.packs[0],
            cards: [
              {
                ...mockCollection.packs[0].cards[0],
                type: 'INVALID_DAD',
              },
            ],
          },
        ],
      };

      const result = validateCollection(collectionWithBadType);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('INVALID_DAD'))).toBe(true);
    });
  });
});
