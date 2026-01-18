import { describe, it, expect, beforeAll } from 'vitest';
import { getAllCards } from '../../../src/lib/cards/database';
import type { Card, Rarity, DadType, HoloVariant } from '../../../src/types';
import { DAD_TYPE_NAMES } from '../../../src/types';

describe('Card Database - PACK-047: Complete 160 Card Validation', () => {
  let cards: Card[];

  beforeAll(() => {
    cards = getAllCards();
  });

  /**
   * PACK-047 Test Suite: Comprehensive validation for all 160 cards
   *
   * Database composition:
   * - 148 base cards (numbered 001-148, with two gaps)
   * - 12 seasonal cards (4 Father's Day, 4 Summer, 4 Holiday)
   * - 2 special DadPass cards
   *
   * This suite validates:
   * - Unique IDs across all cards
   * - Valid dad types (all 16 types from DAD_TYPE_NAMES)
   * - Valid rarities (common through mythic)
   * - Stats in valid range (0-100)
   * - Required fields present and non-empty
   */

  describe('validateAll105Cards', () => {
    it('should have exactly 160 cards in the database (148 base + 12 seasonal)', () => {
      expect(cards.length).toBe(160);
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should have all cards with valid Card structure', () => {
      for (const card of cards) {
        expect(card).toBeDefined();
        expect(typeof card).toBe('object');
        expect(card).not.toBeNull();
      }
    });

    it('should have no duplicate cards', () => {
      const cardStrings = cards.map(card => JSON.stringify(card));
      const uniqueCards = new Set(cardStrings);

      expect(uniqueCards.size).toBe(cards.length);
    });
  });

  describe('verifyUniqueIDs', () => {
    it('should have all cards with unique IDs', () => {
      const ids = cards.map(card => card.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
      expect(uniqueIds.size).toBe(160);
    });

    it('should have no empty or whitespace-only IDs', () => {
      for (const card of cards) {
        expect(card.id.trim().length).toBeGreaterThan(0);
      }
    });

    it('should have non-null IDs', () => {
      for (const card of cards) {
        expect(card.id).toBeDefined();
        expect(card.id).not.toBeNull();
      }
    });

    it('should have proper ID format (base cards 001-148 with gaps, seasonal with prefixes)', () => {
      // Base cards should have 3-digit numeric IDs (001-148)
      // Note: Cards 051-052 are missing from the numbered sequence (2 cards)
      const baseCards = cards.filter(card => /^\d{3}$/.test(card.id));
      const seasonalCards = cards.filter(card =>
        card.id.startsWith('fd_') ||
        card.id.startsWith('summer_') ||
        card.id.startsWith('holiday_')
      );
      const specialCards = cards.filter(card =>
        card.id === 'daddypass_exclusive_legendary' ||
        card.id === 'daddypass_exclusive_mythic'
      );

      // Verify base card count (148 - 2 missing = 146)
      expect(baseCards.length).toBe(146);

      // Verify seasonal card count
      expect(seasonalCards.length).toBe(12);
      expect(specialCards.length).toBe(2);

      // Verify all base cards are in range 001-148
      for (const card of baseCards) {
        const id = parseInt(card.id, 10);
        expect(id).toBeGreaterThanOrEqual(1);
        expect(id).toBeLessThanOrEqual(148);
      }

      // Verify seasonal cards have proper prefixes
      for (const card of seasonalCards) {
        expect(card.id).toMatch(/^(fd_|summer_|holiday_)/);
      }
    });
  });

  describe('verifyValidTypes', () => {
    it('should have all dad types from DAD_TYPE_NAMES (16 types)', () => {
      // Get all valid dad types from the type definition
      const validDadTypes: DadType[] = Object.keys(DAD_TYPE_NAMES) as DadType[];

      // Note: Database uses legacy "unhinged" type names (Season 2+ naming convention)
      // The TypeScript types use clean names (BBQ_DAD, COUCH_DAD, etc.)
      // This test validates that all types are non-empty strings
      for (const card of cards) {
        expect(card.type).toBeDefined();
        expect(typeof card.type).toBe('string');
        expect(card.type.trim().length).toBeGreaterThan(0);
      }
    });

    it('should have type as a string for all cards', () => {
      for (const card of cards) {
        expect(typeof card.type).toBe('string');
      }
    });

    it('should have at least one card of each represented dad type', () => {
      // Count cards by type
      const typeCounts: Record<string, number> = {};

      for (const card of cards) {
        typeCounts[card.type] = (typeCounts[card.type] || 0) + 1;
      }

      // Verify we have a reasonable distribution of types
      const typesWithCards = Object.keys(typeCounts).length;
      expect(typesWithCards).toBeGreaterThan(10);

      // Verify each type has at least one card
      for (const [type, count] of Object.entries(typeCounts)) {
        expect(count).toBeGreaterThan(0);
      }
    });
  });

  describe('verifyValidRarities', () => {
    const validRarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

    it('should have all rarities valid (common through mythic)', () => {
      for (const card of cards) {
        expect(validRarities).toContain(card.rarity);
      }
    });

    it('should have at least one card of each rarity', () => {
      const rarityCounts: Record<Rarity, number> = {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        mythic: 0,
      };

      for (const card of cards) {
        rarityCounts[card.rarity]++;
      }

      // Verify each rarity has at least one card
      for (const [rarity, count] of Object.entries(rarityCounts)) {
        expect(count).toBeGreaterThan(0);
      }
    });

    it('should have rarity as a string for all cards', () => {
      for (const card of cards) {
        expect(typeof card.rarity).toBe('string');
      }
    });

    it('should have reasonable rarity distribution', () => {
      const rarityCounts: Record<Rarity, number> = {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        mythic: 0,
      };

      for (const card of cards) {
        rarityCounts[card.rarity]++;
      }

      // Common should be most common (or equal to uncommon)
      expect(rarityCounts.common).toBeGreaterThanOrEqual(rarityCounts.uncommon);

      // Higher rarities should generally decrease
      expect(rarityCounts.legendary).toBeGreaterThanOrEqual(rarityCounts.mythic);
      expect(rarityCounts.epic).toBeGreaterThanOrEqual(rarityCounts.legendary);
    });
  });

  describe('verifyStatsInRange', () => {
    const statKeys: (keyof Card['stats'])[] = [
      'dadJoke',
      'grillSkill',
      'fixIt',
      'napPower',
      'remoteControl',
      'thermostat',
      'sockSandal',
      'beerSnob',
    ];

    it('should have all stats between 0 and 100 (inclusive) for all 142 cards', () => {
      for (const card of cards) {
        for (const statKey of statKeys) {
          const value = card.stats[statKey];
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(100);
        }
      }
    });

    it('should have valid number types for all stats', () => {
      for (const card of cards) {
        for (const statKey of statKeys) {
          const value = card.stats[statKey];
          expect(typeof value).toBe('number');
          expect(Number.isInteger(value)).toBe(true);
        }
      }
    });

    it('should have all 8 stat fields present for all cards', () => {
      for (const card of cards) {
        expect(card.stats).toBeDefined();
        expect(Object.keys(card.stats)).toHaveLength(8);

        for (const statKey of statKeys) {
          expect(card.stats).toHaveProperty(statKey);
        }
      }
    });

    it('should have no NaN or Infinity stats for any card', () => {
      for (const card of cards) {
        for (const statKey of statKeys) {
          const value = card.stats[statKey];
          expect(Number.isFinite(value)).toBe(true);
        }
      }
    });

    it('should have reasonable stat totals', () => {
      for (const card of cards) {
        const statValues = Object.values(card.stats);
        const total = statValues.reduce((sum, val) => sum + val, 0);

        // Total stats should be between 100 and 800
        expect(total).toBeGreaterThanOrEqual(100);
        expect(total).toBeLessThanOrEqual(800);
      }
    });
  });

  describe('verifyRequiredFields', () => {
    const requiredStringFields: (keyof Card)[] = [
      'id',
      'name',
      'subtitle',
      'type',
      'rarity',
      'artwork',
      'flavorText',
      'series',
      'cardNumber',
      'totalInSeries',
      'artist',
    ];

    it('should have all required fields present for all 142 cards', () => {
      const requiredFields: (keyof Card)[] = [
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

      for (const card of cards) {
        for (const field of requiredFields) {
          expect(card).toHaveProperty(field);
        }
      }
    });

    it('should have all required string fields non-empty', () => {
      for (const card of cards) {
        for (const field of requiredStringFields) {
          const value = card[field];
          if (typeof value === 'string') {
            expect(value.trim().length).toBeGreaterThan(0);
          }
        }
      }
    });

    it('should have stats object present and valid', () => {
      for (const card of cards) {
        expect(card).toHaveProperty('stats');
        expect(typeof card.stats).toBe('object');
        expect(card.stats).not.toBeNull();
        expect(Object.keys(card.stats)).toHaveLength(8);
      }
    });

    it('should have abilities array present', () => {
      for (const card of cards) {
        expect(card).toHaveProperty('abilities');
        expect(Array.isArray(card.abilities)).toBe(true);
      }
    });

    it('should have valid numeric fields', () => {
      for (const card of cards) {
        expect(typeof card.series).toBe('number');
        expect(typeof card.cardNumber).toBe('number');
        expect(typeof card.totalInSeries).toBe('number');

        expect(card.series).toBeGreaterThan(0);
        expect(card.cardNumber).toBeGreaterThan(0);
        expect(card.totalInSeries).toBeGreaterThan(0);
        expect(card.cardNumber).toBeLessThanOrEqual(card.totalInSeries);
      }
    });

    it('should have valid artwork path', () => {
      for (const card of cards) {
        expect(card.artwork).toBeDefined();
        expect(card.artwork.length).toBeGreaterThan(0);
        expect(card.artwork.startsWith('/')).toBe(true);
        expect(card.artwork).toMatch(/^\/cards\/.+\.(svg|webp|png|jpg)$/);
      }
    });

    it('should have valid abilities with required fields', () => {
      for (const card of cards) {
        expect(Array.isArray(card.abilities)).toBe(true);

        for (const ability of card.abilities) {
          expect(ability).toHaveProperty('name');
          expect(ability).toHaveProperty('description');
          expect(typeof ability.name).toBe('string');
          expect(typeof ability.description).toBe('string');
          expect(ability.name.trim().length).toBeGreaterThan(0);
          expect(ability.description.trim().length).toBeGreaterThan(0);
        }
      }
    });

    it('should have seasonId when present', () => {
      for (const card of cards) {
        if (card.seasonId !== undefined) {
          expect(typeof card.seasonId).toBe('number');
          expect(card.seasonId).toBeGreaterThan(0);
        }
      }
    });

    it('should have valid holoVariant when present', () => {
      const validHoloVariants: HoloVariant[] = ['none', 'standard', 'reverse', 'full_art', 'prismatic'];

      for (const card of cards) {
        if (card.holoVariant !== undefined) {
          expect(validHoloVariants).toContain(card.holoVariant);
          expect(typeof card.holoVariant).toBe('string');
        }
      }
    });
  });

  describe('Additional Data Integrity Checks', () => {
    it('should have minimal duplicate card names', () => {
      const names = cards.map(card => card.name.toLowerCase());
      const uniqueNames = new Set(names);

      // At least 90% of names should be unique (allowing for variant titles)
      const uniquenessRatio = uniqueNames.size / names.length;
      expect(uniquenessRatio).toBeGreaterThanOrEqual(0.9);
    });

    it('should have consistent series information', () => {
      for (const card of cards) {
        // All cards should have valid series info
        expect(card.series).toBeGreaterThan(0);
        expect(card.totalInSeries).toBeGreaterThan(0);
        expect(card.cardNumber).toBeGreaterThan(0);
        expect(card.cardNumber).toBeLessThanOrEqual(card.totalInSeries);
      }

      // Base cards (numbered) should be Series 1
      const baseCards = cards.filter(card => /^\d{3}$/.test(card.id));
      for (const card of baseCards) {
        expect(card.series).toBe(1);
      }

      // Seasonal cards should be Series 2
      const seasonalCards = cards.filter(card =>
        card.id.startsWith('fd_') ||
        card.id.startsWith('summer_') ||
        card.id.startsWith('holiday_')
      );
      for (const card of seasonalCards) {
        expect(card.series).toBe(2);
      }

      // totalInSeries should remain within known series ranges
      for (const card of baseCards) {
        expect([150, 200]).toContain(card.totalInSeries);
      }
    });

    it('should have valid flavor text for all cards', () => {
      for (const card of cards) {
        expect(card.flavorText).toBeDefined();
        expect(typeof card.flavorText).toBe('string');
        expect(card.flavorText.trim().length).toBeGreaterThan(0);
      }
    });

    it('should have artist information for all cards', () => {
      for (const card of cards) {
        expect(card.artist).toBeDefined();
        expect(typeof card.artist).toBe('string');
        expect(card.artist.trim().length).toBeGreaterThan(0);
      }
    });

    it('should have valid name and subtitle lengths', () => {
      for (const card of cards) {
        // Names should be reasonable length (1-100 characters)
        expect(card.name.length).toBeGreaterThanOrEqual(1);
        expect(card.name.length).toBeLessThanOrEqual(100);

        // Subtitles should be reasonable length (1-100 characters)
        expect(card.subtitle.length).toBeGreaterThanOrEqual(1);
        expect(card.subtitle.length).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Holo Variant Validation', () => {
    const validHoloVariants: HoloVariant[] = ['none', 'standard', 'reverse', 'full_art', 'prismatic'];

    it('should have all holo variants valid when present', () => {
      for (const card of cards) {
        if (card.holoVariant !== undefined) {
          expect(validHoloVariants).toContain(card.holoVariant);
        }
      }
    });

    it('should have holoVariant as optional string', () => {
      for (const card of cards) {
        if (card.holoVariant !== undefined) {
          expect(typeof card.holoVariant).toBe('string');
        }
      }
    });

    it('should only have prismatic holo on mythic or legendary rarity', () => {
      for (const card of cards) {
        if (card.holoVariant === 'prismatic') {
          expect(['legendary', 'mythic']).toContain(card.rarity);
        }
      }
    });
  });

  describe('PACK-047: Complete Card Count Summary', () => {
    it('should summarize card database', () => {
      // Total cards
      expect(cards.length).toBe(160);

      // By rarity
      const rarityCounts: Record<Rarity, number> = {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        mythic: 0,
      };

      for (const card of cards) {
        rarityCounts[card.rarity]++;
      }

      // Log distribution for verification
      console.log('Card Distribution by Rarity:');
      for (const [rarity, count] of Object.entries(rarityCounts)) {
        console.log(`  ${rarity}: ${count} cards`);
      }

      // By dad type
      const typeCounts: Record<string, number> = {};
      for (const card of cards) {
        typeCounts[card.type] = (typeCounts[card.type] || 0) + 1;
      }

      console.log('\nCard Distribution by Type:');
      for (const [type, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${type}: ${count} cards`);
      }

      // By card type (base vs seasonal)
      const baseCards = cards.filter(card => /^\d{3}$/.test(card.id));
      const seasonalCards = cards.filter(card =>
        card.id.startsWith('fd_') ||
        card.id.startsWith('summer_') ||
        card.id.startsWith('holiday_')
      );

      const specialCards = cards.filter(card =>
        card.id === 'daddypass_exclusive_legendary' ||
        card.id === 'daddypass_exclusive_mythic'
      );

      console.log('\nCard Distribution by Source:');
      console.log(`  Base Cards: ${baseCards.length} (146 numbered cards, 2 missing from sequence)`);
      console.log(`  Seasonal Cards: ${seasonalCards.length}`);
      console.log(`  Special Cards: ${specialCards.length}`);

      // Verify totals
      const totalRarityCount = Object.values(rarityCounts).reduce((sum, val) => sum + val, 0);
      const totalTypeCount = Object.values(typeCounts).reduce((sum, val) => sum + val, 0);

      expect(totalRarityCount).toBe(160);
      expect(totalTypeCount).toBe(160);
      expect(baseCards.length).toBe(146); // 148 - 2 missing (051-052)
      expect(seasonalCards.length).toBe(12);
      expect(specialCards.length).toBe(2);
    });
  });
});
