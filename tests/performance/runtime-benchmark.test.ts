/**
 * PACK-101: Runtime Performance Benchmark Tests
 *
 * Measures critical operations to ensure they meet performance targets:
 * - Pack generation: <500ms
 * - Card search: <100ms for 105 cards
 * - Collection filter: <50ms
 * - Deck validation: <100ms
 * - Battle calculation: <200ms
 */

import { describe, it, expect } from 'vitest';
import { generatePack, DEFAULT_PACK_CONFIG } from '../../src/lib/pack/generator';
import { getAllCards } from '../../src/lib/cards/database';
import { validateDeck } from '../../src/lib/deck/validators';
import { calculateBattleResult } from '../../src/lib/mechanics/combat';
import type { Card, Pack, Deck, Rarity, DadType } from '../../src/types';

// Helper: Create a test deck
function createTestDeck(cardCount: number = 5): Deck {
  const cards = getAllCards().slice(0, cardCount);

  return {
    id: 'test-deck',
    name: 'Test Deck',
    cards: cards.map(card => ({
      cardId: card.id,
      card,
      count: 1
    })),
    stats: {
      totalCards: cardCount,
      totalPower: 500,
      averageStats: {
        dadJoke: 50,
        grillSkill: 50,
        fixIt: 50,
        napPower: 50,
        remoteControl: 50,
        thermostat: 50,
        sockSandal: 50,
        beerSnob: 50
      },
      typeBreakdown: {
        'BBQ_DICKTATOR': cardCount
      },
      rarityBreakdown: {
        common: cardCount,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        mythic: 0
      }
    }
  };
}

// Helper: Measure execution time
function measureTime<T>(operation: () => T): { result: T; durationMs: number } {
  const start = performance.now();
  const result = operation();
  const end = performance.now();
  return { result, durationMs: end - start };
}

describe('PACK-101: Runtime Performance Benchmarks', () => {
  describe('Pack Generation', () => {
    it('should generate a pack in <500ms', () => {
      const { result, durationMs } = measureTime(() => generatePack(DEFAULT_PACK_CONFIG));

      expect(result).toBeDefined();
      expect(result.cards).toHaveLength(6);
      expect(durationMs).toBeLessThan(500);

      console.log(`✓ Pack generation: ${durationMs.toFixed(2)}ms (target: <500ms)`);
    });

    it('should generate 100 packs with average <500ms', () => {
      const packCount = 100;
      const start = performance.now();

      for (let i = 0; i < packCount; i++) {
        generatePack(DEFAULT_PACK_CONFIG);
      }

      const end = performance.now();
      const avgDurationMs = (end - start) / packCount;

      expect(avgDurationMs).toBeLessThan(500);

      console.log(`✓ Average pack generation (100 packs): ${avgDurationMs.toFixed(2)}ms (target: <500ms)`);
    });
  });

  describe('Card Search', () => {
    it('should search 105 cards in <100ms', () => {
      const cards = getAllCards();
      const searchTerm = 'dad';

      const { result, durationMs } = measureTime(() => {
        return cards.filter(card =>
          card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (card.flavorText && card.flavorText.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });

      expect(result).toBeInstanceOf(Array);
      expect(durationMs).toBeLessThan(100);

      console.log(`✓ Card search (${cards.length} cards): ${durationMs.toFixed(2)}ms (target: <100ms)`);
    });

    it('should handle empty search term efficiently', () => {
      const cards = getAllCards();
      const searchTerm = '';

      const { result, durationMs } = measureTime(() => {
        return cards.filter(card =>
          card.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });

      expect(result).toHaveLength(cards.length);
      expect(durationMs).toBeLessThan(50); // Empty search should be even faster

      console.log(`✓ Empty search (${cards.length} cards): ${durationMs.toFixed(2)}ms (target: <50ms)`);
    });
  });

  describe('Collection Filter', () => {
    it('should filter collection by rarity in <50ms', () => {
      // Create a collection with 100 packs (600 cards)
      const packs: Pack[] = [];
      for (let i = 0; i < 100; i++) {
        packs.push(generatePack(DEFAULT_PACK_CONFIG));
      }

      const allCards = packs.flatMap(pack => pack.cards);
      const selectedRarities: Rarity[] = ['rare', 'epic'];

      const { result, durationMs } = measureTime(() => {
        return allCards.filter(card => selectedRarities.includes(card.rarity));
      });

      expect(result).toBeInstanceOf(Array);
      expect(durationMs).toBeLessThan(50);

      console.log(`✓ Collection filter by rarity (600 cards): ${durationMs.toFixed(2)}ms (target: <50ms)`);
    });

    it('should filter collection by type in <50ms', () => {
      const packs: Pack[] = [];
      for (let i = 0; i < 100; i++) {
        packs.push(generatePack(DEFAULT_PACK_CONFIG));
      }

      const allCards = packs.flatMap(pack => pack.cards);
      const selectedTypes: DadType[] = ['BBQ_DICKTATOR'];

      const { result, durationMs } = measureTime(() => {
        return allCards.filter(card => selectedTypes.includes(card.type));
      });

      expect(result).toBeInstanceOf(Array);
      expect(durationMs).toBeLessThan(50);

      console.log(`✓ Collection filter by type (600 cards): ${durationMs.toFixed(2)}ms (target: <50ms)`);
    });

    it('should filter by multiple criteria in <50ms', () => {
      const packs: Pack[] = [];
      for (let i = 0; i < 100; i++) {
        packs.push(generatePack(DEFAULT_PACK_CONFIG));
      }

      const allCards = packs.flatMap(pack => pack.cards);
      const selectedRarities: Rarity[] = ['rare', 'epic'];
      const selectedTypes: DadType[] = ['BBQ_DICKTATOR'];

      const { result, durationMs } = measureTime(() => {
        return allCards.filter(card =>
          selectedRarities.includes(card.rarity) && selectedTypes.includes(card.type)
        );
      });

      expect(result).toBeInstanceOf(Array);
      expect(durationMs).toBeLessThan(50);

      console.log(`✓ Collection filter by rarity + type (600 cards): ${durationMs.toFixed(2)}ms (target: <50ms)`);
    });
  });

  describe('Deck Validation', () => {
    it('should validate a 5-card deck in <100ms', () => {
      const deck = createTestDeck(5);
      const existingDecks: Deck[] = [];

      const { result, durationMs } = measureTime(() => {
        return validateDeck(deck, existingDecks);
      });

      expect(result.isValid).toBe(true);
      expect(durationMs).toBeLessThan(100);

      console.log(`✓ Deck validation (5 cards): ${durationMs.toFixed(2)}ms (target: <100ms)`);
    });

    it('should validate a 10-card deck in <100ms', () => {
      const deck = createTestDeck(10);
      const existingDecks: Deck[] = [];

      const { result, durationMs } = measureTime(() => {
        return validateDeck(deck, existingDecks);
      });

      expect(result.isValid).toBe(true);
      expect(durationMs).toBeLessThan(100);

      console.log(`✓ Deck validation (10 cards): ${durationMs.toFixed(2)}ms (target: <100ms)`);
    });

    it('should detect duplicate cards efficiently', () => {
      const cards = getAllCards();
      const deck: Deck = {
        id: 'test-deck-dupes',
        name: 'Test Deck with Duplicates',
        cards: [
          { cardId: cards[0].id, card: cards[0], count: 5 }, // Exceeds limit
          { cardId: cards[1].id, card: cards[1], count: 1 }
        ],
        stats: {
          totalCards: 6,
          totalPower: 600,
          averageStats: {
            dadJoke: 50,
            grillSkill: 50,
            fixIt: 50,
            napPower: 50,
            remoteControl: 50,
            thermostat: 50,
            sockSandal: 50,
            beerSnob: 50
          },
          typeBreakdown: {
            'BBQ_DICKTATOR': 6
          },
          rarityBreakdown: {
            common: 6,
            uncommon: 0,
            rare: 0,
            epic: 0,
            legendary: 0,
            mythic: 0
          }
        }
      };

      const existingDecks: Deck[] = [];

      const { result, durationMs } = measureTime(() => {
        return validateDeck(deck, existingDecks);
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('exceeds maximum of 4 copies'))).toBe(true);
      expect(durationMs).toBeLessThan(100);

      console.log(`✓ Duplicate detection (6 cards): ${durationMs.toFixed(2)}ms (target: <100ms)`);
    });
  });

  describe('Battle Calculation', () => {
    it('should calculate battle result in <200ms', () => {
      const attackerDeck = createTestDeck(5);
      const defenderDeck = createTestDeck(5);

      const { result, durationMs } = measureTime(() => {
        return calculateBattleResult(attackerDeck, defenderDeck);
      });

      expect(result.winner).toBeDefined();
      expect(result.damage).toBeGreaterThanOrEqual(1);
      expect(durationMs).toBeLessThan(200);

      console.log(`✓ Battle calculation (5 vs 5 cards): ${durationMs.toFixed(2)}ms (target: <200ms)`);
    });

    it('should calculate seeded battle consistently in <200ms', () => {
      const attackerDeck = createTestDeck(5);
      const defenderDeck = createTestDeck(5);
      const seed = 12345;

      const { result: result1, durationMs: durationMs1 } = measureTime(() => {
        return calculateBattleResult(attackerDeck, defenderDeck, seed);
      });

      const { result: result2, durationMs: durationMs2 } = measureTime(() => {
        return calculateBattleResult(attackerDeck, defenderDeck, seed);
      });

      // Same seed should produce identical results
      expect(result1.damage).toBe(result2.damage);
      expect(result1.winner.id).toBe(result2.winner.id);

      expect(durationMs1).toBeLessThan(200);
      expect(durationMs2).toBeLessThan(200);

      console.log(`✓ Seeded battle (5 vs 5): ${durationMs1.toFixed(2)}ms (target: <200ms)`);
    });
  });

  describe('Stress Tests', () => {
    it('should handle bulk pack generation efficiently', () => {
      const packCount = 1000;
      const start = performance.now();

      const packs = [];
      for (let i = 0; i < packCount; i++) {
        packs.push(generatePack(DEFAULT_PACK_CONFIG));
      }

      const end = performance.now();
      const avgDurationMs = (end - start) / packCount;

      expect(packs).toHaveLength(packCount);
      expect(avgDurationMs).toBeLessThan(500);

      console.log(`✓ Bulk pack generation (${packCount} packs): avg ${avgDurationMs.toFixed(2)}ms (target: <500ms)`);
    });

    it('should filter large collection efficiently', () => {
      // Create a large collection (500 packs = 3000 cards)
      const packs: Pack[] = [];
      for (let i = 0; i < 500; i++) {
        packs.push(generatePack(DEFAULT_PACK_CONFIG));
      }

      const allCards = packs.flatMap(pack => pack.cards);
      const selectedRarities: Rarity[] = ['rare', 'epic', 'legendary'];

      const { result, durationMs } = measureTime(() => {
        return allCards.filter(card => selectedRarities.includes(card.rarity));
      });

      expect(result).toBeInstanceOf(Array);
      expect(durationMs).toBeLessThan(100); // Should still be fast even with 3000 cards

      console.log(`✓ Large collection filter (3000 cards): ${durationMs.toFixed(2)}ms (target: <100ms)`);
    });
  });
});
