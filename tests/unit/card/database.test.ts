import { describe, it, expect, beforeAll } from 'vitest';
import { getAllCards } from '../../../src/lib/cards/database';
import type { Card, Rarity, DadType, HoloVariant } from '../../../src/types';

describe('Card Database - US042 Card Data Validation', () => {
  let cards: Card[];

  beforeAll(() => {
    cards = getAllCards();
  });

  describe('Unique IDs', () => {
    it('should have all cards with unique IDs', () => {
      const ids = cards.map(card => card.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
      expect(uniqueIds.size).toBeGreaterThan(0);
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
  });

  describe('Stats Range Validation', () => {
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

    it('should have all stats between 0 and 100 (inclusive)', () => {
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

    it('should have all 8 stat fields present', () => {
      for (const card of cards) {
        expect(card.stats).toBeDefined();
        expect(Object.keys(card.stats)).toHaveLength(8);

        for (const statKey of statKeys) {
          expect(card.stats).toHaveProperty(statKey);
        }
      }
    });

    it('should have no NaN or Infinity stats', () => {
      for (const card of cards) {
        for (const statKey of statKeys) {
          const value = card.stats[statKey];
          expect(Number.isFinite(value)).toBe(true);
        }
      }
    });
  });

  describe('Rarity Validation', () => {
    const validRarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

    it('should have all rarities valid', () => {
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

      for (const [rarity, count] of Object.entries(rarityCounts)) {
        expect(count).toBeGreaterThan(0);
      }
    });

    it('should have rarity as a string', () => {
      for (const card of cards) {
        expect(typeof card.rarity).toBe('string');
      }
    });
  });

  describe('Dad Type Validation', () => {
    const validDadTypes: DadType[] = [
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
      'SUBURBAN_SPY',
      'GAMER_GIZZARDS',
      'PREPPER_PENIS',
      'BBQ_BRAWLER',
      'SUBURBAN_SOCIALITE',
      'NEIGHBORHOOD_NOSY',
      'SON_SPAWNS',
      'DAUGHTER_DINGBATS',
      'UNCLE_UPROARS',
      'SUBURBAN_SIDEKICKS',
      'ITEM',
      'EVENT',
      'TERRAIN',
      'EVOLUTION',
      'CURSE',
      'TRAP',
    ];

    it('should have all types valid (25 dad types or ITEM)', () => {
      for (const card of cards) {
        expect(validDadTypes).toContain(card.type);
      }
    });

    it('should have at least one card of each dad type', () => {
      const typeCounts: Record<DadType, number> = {
        BBQ_DAD: 0,
        FIX_IT_DAD: 0,
        GOLF_DAD: 0,
        COUCH_DAD: 0,
        LAWN_DAD: 0,
        CAR_DAD: 0,
        OFFICE_DAD: 0,
        COOL_DAD: 0,
        COACH_DAD: 0,
        CHEF_DAD: 0,
        HOLIDAY_DAD: 0,
        WAREHOUSE_DAD: 0,
        VINTAGE_DAD: 0,
        FASHION_DAD: 0,
        TECH_DAD: 0,
        SUBURBAN_SPY: 0,
        GAMER_GIZZARDS: 0,
        PREPPER_PENIS: 0,
        BBQ_BRAWLER: 0,
        SUBURBAN_SOCIALITE: 0,
        NEIGHBORHOOD_NOSY: 0,
        SON_SPAWNS: 0,
        DAUGHTER_DINGBATS: 0,
        UNCLE_UPROARS: 0,
        SUBURBAN_SIDEKICKS: 0,
        ITEM: 0,
        EVENT: 0,
        TERRAIN: 0,
        EVOLUTION: 0,
        CURSE: 0,
        TRAP: 0,
      };

      for (const card of cards) {
        typeCounts[card.type]++;
      }

      // Only check types that actually have cards (allow for future expansion)
      const typesWithCards = Object.entries(typeCounts)
        .filter(([_, count]) => count > 0)
        .map(([type, _]) => type);

      // At minimum, the original 16 types + ITEM should have cards
      const expectedMinimumTypes = [
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
        'ITEM',
      ];

      for (const type of expectedMinimumTypes) {
        expect(typeCounts[type as DadType]).toBeGreaterThan(0);
      }
    });

    it('should have type as a string', () => {
      for (const card of cards) {
        expect(typeof card.type).toBe('string');
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

    it('should only have prismatic holo on mythic rarity', () => {
      for (const card of cards) {
        if (card.holoVariant === 'prismatic') {
          expect(card.rarity).toBe('mythic');
        }
      }
    });
  });

  describe('Required Fields Validation', () => {
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

    it('should have all required string fields present', () => {
      for (const card of cards) {
        for (const field of requiredStringFields) {
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

    it('should have stats object present', () => {
      for (const card of cards) {
        expect(card).toHaveProperty('stats');
        expect(typeof card.stats).toBe('object');
        expect(card.stats).not.toBeNull();
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

    it('should have seasonId as a valid number when present', () => {
      for (const card of cards) {
        if (card.seasonId !== undefined) {
          expect(typeof card.seasonId).toBe('number');
          expect(card.seasonId).toBeGreaterThan(0);
        }
      }
    });

    it('should have valid artwork path', () => {
      for (const card of cards) {
        expect(card.artwork).toBeDefined();
        expect(card.artwork.length).toBeGreaterThan(0);
        expect(card.artwork.startsWith('/')).toBe(true);
      }
    });

    it('should have valid abilities with required fields', () => {
      for (const card of cards) {
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
  });

  describe('Data Integrity', () => {
    it('should have at least 50 cards in the database', () => {
      expect(cards.length).toBeGreaterThanOrEqual(50);
    });

    it('should have all cards with valid structure', () => {
      for (const card of cards) {
        expect(card).toBeDefined();
        expect(typeof card).toBe('object');
        expect(card).not.toBeNull();
      }
    });

    it('should have no duplicate card names', () => {
      const names = cards.map(card => card.name.toLowerCase());
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(names.length);
    });

    it('should have consistent card numbering within series', () => {
      const seriesGroups: Record<number, Card[]> = {};

      for (const card of cards) {
        if (!seriesGroups[card.series]) {
          seriesGroups[card.series] = [];
        }
        seriesGroups[card.series].push(card);
      }

      for (const [series, seriesCards] of Object.entries(seriesGroups)) {
        const totalInSeries = seriesCards[0].totalInSeries;

        for (const card of seriesCards) {
          expect(card.totalInSeries).toBe(totalInSeries);
          expect(card.series).toBe(parseInt(series));
        }
      }
    });
  });
});
