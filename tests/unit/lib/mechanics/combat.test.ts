/**
 * Unit tests for deck battle system with stat normalization
 * PACK-007: Battle System - Stat Normalization
 */

import { describe, it, expect } from 'vitest';
import type { Card, Deck, DeckCard, CardStats } from '@/types';
import type { DeckBattleResult } from '@/types/deck';
import { calculateBattleResult } from '@/lib/mechanics/combat';
import { calculateDeckStats } from '@/lib/deck/utils';

/**
 * Helper: Create a test card with specific stats
 */
function createTestCard(
  id: string,
  name: string,
  type: string,
  rarity: string,
  stats: CardStats
): Card {
  return {
    id,
    name,
    subtitle: `${name} Subtitle`,
    type: type as any,
    rarity: rarity as any,
    artwork: `/images/cards/${id}.png`,
    stats,
    flavorText: `${name} flavor text`,
    abilities: [
      {
        name: 'Test Ability',
        description: 'Test ability description',
      },
    ],
    series: 1,
    cardNumber: 1,
    totalInSeries: 50,
    artist: 'Test Artist',
    holoVariant: 'none',
  };
}

/**
 * Helper: Create a test deck from cards
 */
function createTestDeck(name: string, cards: DeckCard[]): Deck {
  const stats = calculateDeckStats(cards);
  return {
    id: `deck-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    description: `Test deck: ${name}`,
    cards,
    createdAt: new Date(),
    updatedAt: new Date(),
    stats,
  };
}

describe('PACK-007: Battle System - Stat Normalization', () => {
  describe('calculateBattleResult()', () => {
    it('should normalize stats by card count', () => {
      // Create a 3-card deck with high stats per card (average 70)
      const card1 = createTestCard('card-001', 'High Stat Dad 1', 'BBQ_DAD', 'rare', {
        dadJoke: 70,
        grillSkill: 70,
        fixIt: 70,
        napPower: 70,
        remoteControl: 70,
        thermostat: 70,
        sockSandal: 70,
        beerSnob: 70,
      });

      const card2 = createTestCard('card-002', 'High Stat Dad 2', 'BBQ_DAD', 'rare', {
        dadJoke: 70,
        grillSkill: 70,
        fixIt: 70,
        napPower: 70,
        remoteControl: 70,
        thermostat: 70,
        sockSandal: 70,
        beerSnob: 70,
      });

      const card3 = createTestCard('card-003', 'High Stat Dad 3', 'BBQ_DAD', 'rare', {
        dadJoke: 70,
        grillSkill: 70,
        fixIt: 70,
        napPower: 70,
        remoteControl: 70,
        thermostat: 70,
        sockSandal: 70,
        beerSnob: 70,
      });

      // Create a 5-card deck with lower stats per card (average 50)
      // But higher TOTAL stats (5 * 50 = 250 vs 3 * 70 = 210)
      const lowStatCards: DeckCard[] = [];
      for (let i = 0; i < 5; i++) {
        const card = createTestCard(
          `card-low-${i}`,
          `Low Stat Dad ${i}`,
          'COUCH_DAD',
          'common',
          {
            dadJoke: 50,
            grillSkill: 50,
            fixIt: 50,
            napPower: 50,
            remoteControl: 50,
            thermostat: 50,
            sockSandal: 50,
            beerSnob: 50,
          }
        );
        lowStatCards.push({ cardId: card.id, card, count: 1 });
      }

      const threeCardDeck = createTestDeck('3-Card High Stats', [
        { cardId: card1.id, card: card1, count: 1 },
        { cardId: card2.id, card: card2, count: 1 },
        { cardId: card3.id, card: card3, count: 1 },
      ]);

      const fiveCardDeck = createTestDeck('5-Card Low Stats', lowStatCards);

      const result = calculateBattleResult(threeCardDeck, fiveCardDeck);

      // 3-card deck should win because it has higher NORMALIZED stats (70 vs 50)
      // Even though 5-card deck has higher TOTAL stats
      expect(result.winner.name).toBe('3-Card High Stats');
      expect(result.loser.name).toBe('5-Card Low Stats');

      // Verify normalized power calculation
      expect(result.attackerStats.totalPower).toBe(70); // Average of 3 cards at 70
      expect(result.defenderStats.totalPower).toBe(50); // Average of 5 cards at 50
    });

    it('should prevent 5-card deck from always beating 3-card deck', () => {
      // Create identical stat distributions
      // 3-card deck: each card has 50 average stats
      const threeCardDeckCards: DeckCard[] = [];
      for (let i = 0; i < 3; i++) {
        const card = createTestCard(
          `card-3-${i}`,
          `Medium Dad ${i}`,
          'BBQ_DAD',
          'rare',
          {
            dadJoke: 50,
            grillSkill: 50,
            fixIt: 50,
            napPower: 50,
            remoteControl: 50,
            thermostat: 50,
            sockSandal: 50,
            beerSnob: 50,
          }
        );
        threeCardDeckCards.push({ cardId: card.id, card, count: 1 });
      }

      // 5-card deck: each card has 50 average stats
      const fiveCardDeckCards: DeckCard[] = [];
      for (let i = 0; i < 5; i++) {
        const card = createTestCard(
          `card-5-${i}`,
          `Medium Dad ${i}`,
          'COUCH_DAD',
          'rare',
          {
            dadJoke: 50,
            grillSkill: 50,
            fixIt: 50,
            napPower: 50,
            remoteControl: 50,
            thermostat: 50,
            sockSandal: 50,
            beerSnob: 50,
          }
        );
        fiveCardDeckCards.push({ cardId: card.id, card, count: 1 });
      }

      const threeCardDeck = createTestDeck('3-Card Deck', threeCardDeckCards);
      const fiveCardDeck = createTestDeck('5-Card Deck', fiveCardDeckCards);

      const result = calculateBattleResult(threeCardDeck, fiveCardDeck);

      // Both decks should have the SAME normalized power (50)
      expect(result.attackerStats.totalPower).toBe(50);
      expect(result.defenderStats.totalPower).toBe(50);

      // Battle should be very close (no automatic win for larger deck)
      // With BBQ_DAD vs COUCH_DAD, BBQ has type advantage
      expect(result.winner.name).toBe('3-Card Deck'); // BBQ beats COUCH
      expect(result.typeAdvantage).toBe(1.5); // 50% bonus
    });

    it('should apply type advantages to normalized stats', () => {
      // Create two decks with identical normalized stats (50)
      const bbqDeckCards: DeckCard[] = [];
      for (let i = 0; i < 3; i++) {
        const card = createTestCard(
          `bbq-${i}`,
          `BBQ Dad ${i}`,
          'BBQ_DAD',
          'rare',
          {
            dadJoke: 50,
            grillSkill: 50,
            fixIt: 50,
            napPower: 50,
            remoteControl: 50,
            thermostat: 50,
            sockSandal: 50,
            beerSnob: 50,
          }
        );
        bbqDeckCards.push({ cardId: card.id, card, count: 1 });
      }

      const couchDeckCards: DeckCard[] = [];
      for (let i = 0; i < 3; i++) {
        const card = createTestCard(
          `couch-${i}`,
          `Couch Dad ${i}`,
          'COUCH_DAD',
          'rare',
          {
            dadJoke: 50,
            grillSkill: 50,
            fixIt: 50,
            napPower: 50,
            remoteControl: 50,
            thermostat: 50,
            sockSandal: 50,
            beerSnob: 50,
          }
        );
        couchDeckCards.push({ cardId: card.id, card, count: 1 });
      }

      const bbqDeck = createTestDeck('BBQ Deck', bbqDeckCards);
      const couchDeck = createTestDeck('Couch Deck', couchDeckCards);

      const result = calculateBattleResult(bbqDeck, couchDeck);

      // BBQ_DAD has advantage over COUCH_DAD (1.5x)
      expect(result.typeAdvantage).toBe(1.5);
      expect(result.winner.name).toBe('BBQ Deck');

      // Effective power should be boosted
      expect(result.attackerStats.effectivePower).toBe(75); // 50 * 1.5
      expect(result.attackerStats.finalPower).toBe(75); // No synergy in this case
    });

    it('should handle decks with different sizes correctly', () => {
      // 2-card deck with very high stats (90 average)
      const twoCardDeckCards: DeckCard[] = [];
      for (let i = 0; i < 2; i++) {
        const card = createTestCard(
          `high-${i}`,
          `Super Dad ${i}`,
          'FIX_IT_DAD',
          'legendary',
          {
            dadJoke: 90,
            grillSkill: 90,
            fixIt: 90,
            napPower: 90,
            remoteControl: 90,
            thermostat: 90,
            sockSandal: 90,
            beerSnob: 90,
          }
        );
        twoCardDeckCards.push({ cardId: card.id, card, count: 1 });
      }

      // 10-card deck with low stats (30 average)
      const tenCardDeckCards: DeckCard[] = [];
      for (let i = 0; i < 10; i++) {
        const card = createTestCard(
          `low-${i}`,
          `Weak Dad ${i}`,
          'GOLF_DAD',
          'common',
          {
            dadJoke: 30,
            grillSkill: 30,
            fixIt: 30,
            napPower: 30,
            remoteControl: 30,
            thermostat: 30,
            sockSandal: 30,
            beerSnob: 30,
          }
        );
        tenCardDeckCards.push({ cardId: card.id, card, count: 1 });
      }

      const twoCardDeck = createTestDeck('2-Card Super Deck', twoCardDeckCards);
      const tenCardDeck = createTestDeck('10-Card Weak Deck', tenCardDeckCards);

      const result = calculateBattleResult(twoCardDeck, tenCardDeck);

      // 2-card deck wins despite having fewer cards
      expect(result.winner.name).toBe('2-Card Super Deck');
      expect(result.attackerStats.totalPower).toBe(90);
      expect(result.defenderStats.totalPower).toBe(30);
    });

    it('should include detailed battle log', () => {
      const deck1Cards: DeckCard[] = [];
      for (let i = 0; i < 3; i++) {
        const card = createTestCard(
          `d1-${i}`,
          `Deck 1 Card ${i}`,
          'BBQ_DAD',
          'rare',
          {
            dadJoke: 60,
            grillSkill: 60,
            fixIt: 60,
            napPower: 60,
            remoteControl: 60,
            thermostat: 60,
            sockSandal: 60,
            beerSnob: 60,
          }
        );
        deck1Cards.push({ cardId: card.id, card, count: 1 });
      }

      const deck2Cards: DeckCard[] = [];
      for (let i = 0; i < 3; i++) {
        const card = createTestCard(
          `d2-${i}`,
          `Deck 2 Card ${i}`,
          'COUCH_DAD',
          'rare',
          {
            dadJoke: 50,
            grillSkill: 50,
            fixIt: 50,
            napPower: 50,
            remoteControl: 50,
            thermostat: 50,
            sockSandal: 50,
            beerSnob: 50,
          }
        );
        deck2Cards.push({ cardId: card.id, card, count: 1 });
      }

      const deck1 = createTestDeck('Deck 1', deck1Cards);
      const deck2 = createTestDeck('Deck 2', deck2Cards);

      const result = calculateBattleResult(deck1, deck2);

      // Verify log structure
      expect(result.log).toBeDefined();
      expect(result.log.length).toBeGreaterThan(0);
      expect(result.log[0]).toContain('⚔️ BATTLE');
      expect(result.log.some(entry => entry.includes('Winner'))).toBe(true);

      // Verify log contains key information
      const logText = result.log.join(' ');
      expect(logText).toContain('Deck 1');
      expect(logText).toContain('Deck 2');
      expect(logText).toContain('normalized power');
    });

    it('should calculate minimum damage of 5', () => {
      // Create decks with very similar stats
      const deck1Cards: DeckCard[] = [];
      for (let i = 0; i < 3; i++) {
        const card = createTestCard(
          `d1-${i}`,
          `Deck 1 Card ${i}`,
          'BBQ_DAD',
          'rare',
          {
            dadJoke: 51,
            grillSkill: 51,
            fixIt: 51,
            napPower: 51,
            remoteControl: 51,
            thermostat: 51,
            sockSandal: 51,
            beerSnob: 51,
          }
        );
        deck1Cards.push({ cardId: card.id, card, count: 1 });
      }

      const deck2Cards: DeckCard[] = [];
      for (let i = 0; i < 3; i++) {
        const card = createTestCard(
          `d2-${i}`,
          `Deck 2 Card ${i}`,
          'COUCH_DAD',
          'rare',
          {
            dadJoke: 50,
            grillSkill: 50,
            fixIt: 50,
            napPower: 50,
            remoteControl: 50,
            thermostat: 50,
            sockSandal: 50,
            beerSnob: 50,
          }
        );
        deck2Cards.push({ cardId: card.id, card, count: 1 });
      }

      const deck1 = createTestDeck('Deck 1', deck1Cards);
      const deck2 = createTestDeck('Deck 2', deck2Cards);

      const result = calculateBattleResult(deck1, deck2);

      // Even with tiny power difference, minimum damage is 5
      expect(result.damage).toBeGreaterThanOrEqual(5);
    });

    it('should return proper battle result structure', () => {
      const deck1Cards: DeckCard[] = [];
      const card1 = createTestCard(
        'card-1',
        'Test Card 1',
        'BBQ_DAD',
        'rare',
        {
          dadJoke: 70,
          grillSkill: 70,
          fixIt: 70,
          napPower: 70,
          remoteControl: 70,
          thermostat: 70,
          sockSandal: 70,
          beerSnob: 70,
        }
      );
      deck1Cards.push({ cardId: card1.id, card: card1, count: 1 });

      const deck2Cards: DeckCard[] = [];
      const card2 = createTestCard(
        'card-2',
        'Test Card 2',
        'COUCH_DAD',
        'common',
        {
          dadJoke: 40,
          grillSkill: 40,
          fixIt: 40,
          napPower: 40,
          remoteControl: 40,
          thermostat: 40,
          sockSandal: 40,
          beerSnob: 40,
        }
      );
      deck2Cards.push({ cardId: card2.id, card: card2, count: 1 });

      const deck1 = createTestDeck('Deck 1', deck1Cards);
      const deck2 = createTestDeck('Deck 2', deck2Cards);

      const result = calculateBattleResult(deck1, deck2);

      // Verify result structure
      expect(result.winner).toBeDefined();
      expect(result.loser).toBeDefined();
      expect(result.damage).toBeDefined();
      expect(result.attackerStats).toBeDefined();
      expect(result.defenderStats).toBeDefined();
      expect(result.typeAdvantage).toBeDefined();
      expect(result.synergyBonus).toBeDefined();
      expect(result.turns).toBeDefined();
      expect(result.log).toBeDefined();

      // Verify stats structure
      expect(result.attackerStats.totalPower).toBeDefined();
      expect(result.attackerStats.effectivePower).toBeDefined();
      expect(result.attackerStats.finalPower).toBeDefined();
      expect(result.attackerStats.normalizedStats).toBeDefined();
      expect(result.attackerStats.mainType).toBeDefined();

      // Verify types
      expect(typeof result.damage).toBe('number');
      expect(typeof result.typeAdvantage).toBe('number');
      expect(typeof result.synergyBonus).toBe('number');
      expect(typeof result.turns).toBe('number');
      expect(Array.isArray(result.log)).toBe(true);
    });
  });

  describe('Stat Normalization Edge Cases', () => {
    it('should handle empty stats gracefully', () => {
      // Create deck with all zero stats
      const deckCards: DeckCard[] = [];
      const card = createTestCard(
        'zero-card',
        'Zero Card',
        'BBQ_DAD',
        'common',
        {
          dadJoke: 0,
          grillSkill: 0,
          fixIt: 0,
          napPower: 0,
          remoteControl: 0,
          thermostat: 0,
          sockSandal: 0,
          beerSnob: 0,
        }
      );
      deckCards.push({ cardId: card.id, card, count: 1 });

      const deck1 = createTestDeck('Zero Deck', deckCards);

      // Create normal deck
      const normalCards: DeckCard[] = [];
      const normalCard = createTestCard(
        'normal-card',
        'Normal Card',
        'COUCH_DAD',
        'rare',
        {
          dadJoke: 50,
          grillSkill: 50,
          fixIt: 50,
          napPower: 50,
          remoteControl: 50,
          thermostat: 50,
          sockSandal: 50,
          beerSnob: 50,
        }
      );
      normalCards.push({ cardId: normalCard.id, card: normalCard, count: 1 });

      const deck2 = createTestDeck('Normal Deck', normalCards);

      const result = calculateBattleResult(deck1, deck2);

      // Should still calculate correctly
      expect(result.attackerStats.totalPower).toBe(0);
      expect(result.defenderStats.totalPower).toBe(50);
      expect(result.winner.name).toBe('Normal Deck');
    });

    it('should handle max stats (100 each)', () => {
      // Create deck with all max stats
      const deckCards: DeckCard[] = [];
      for (let i = 0; i < 3; i++) {
        const card = createTestCard(
          `max-${i}`,
          `Max Card ${i}`,
          'BBQ_DAD',
          'mythic',
          {
            dadJoke: 100,
            grillSkill: 100,
            fixIt: 100,
            napPower: 100,
            remoteControl: 100,
            thermostat: 100,
            sockSandal: 100,
            beerSnob: 100,
          }
        );
        deckCards.push({ cardId: card.id, card, count: 1 });
      }

      const deck1 = createTestDeck('Max Deck', deckCards);

      // Create normal deck
      const normalCards: DeckCard[] = [];
      const normalCard = createTestCard(
        'normal-card',
        'Normal Card',
        'COUCH_DAD',
        'rare',
        {
          dadJoke: 50,
          grillSkill: 50,
          fixIt: 50,
          napPower: 50,
          remoteControl: 50,
          thermostat: 50,
          sockSandal: 50,
          beerSnob: 50,
        }
      );
      normalCards.push({ cardId: normalCard.id, card: normalCard, count: 1 });

      const deck2 = createTestDeck('Normal Deck', normalCards);

      const result = calculateBattleResult(deck1, deck2);

      // Max deck should dominate
      expect(result.attackerStats.totalPower).toBe(100);
      expect(result.defenderStats.totalPower).toBe(50);
      expect(result.winner.name).toBe('Max Deck');
    });
  });
});
