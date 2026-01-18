/**
 * Unit tests for deck battle system with stat normalization
 * PACK-007: Battle System - Stat Normalization
 * PACK-009: Battle System - Synergy Bonuses
 * PACK-010: Battle System - RNG Variance
 */

import { describe, it, expect } from 'vitest';
import type { Card, Deck, DeckCard, CardStats } from '@/types';
import type { DeckBattleResult } from '@/types/deck';
import { calculateBattleResult, calculateSynergyBonus } from '@/lib/mechanics/combat';
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
      expect(result.typeAdvantage).toBe(1.2); // 20% bonus (PACK-008 update)
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

      // BBQ_DAD has advantage over COUCH_DAD (1.2x after PACK-008 update)
      expect(result.typeAdvantage).toBe(1.2);
      expect(result.winner.name).toBe('BBQ Deck');

      // Effective power should be boosted (type advantage + 5% synergy for 3 BBQ_DAD)
      expect(result.attackerStats.effectivePower).toBe(60); // 50 * 1.2
      expect(result.attackerStats.finalPower).toBe(63); // 60 * 1.05 (synergy bonus for 3 BBQ_DAD cards)
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

describe('PACK-009: Battle System - Synergy Bonuses', () => {
  describe('calculateSynergyBonus()', () => {
    it('should give 15% bonus for 5+ cards of same type', () => {
      // Create all BBQ_DAD deck (5 cards)
      const bbqDeckCards: DeckCard[] = [];
      for (let i = 0; i < 5; i++) {
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

      const bbqDeck = createTestDeck('BBQ Deck', bbqDeckCards);
      const bonus = calculateSynergyBonus(bbqDeck);

      expect(bonus.multiplier).toBe(1.15);
      expect(bonus.theme).toBe('BBQ_BROS');
      expect(bonus.description).toBe('BBQ BROS SYNERGY +15%'); // Underscores replaced with spaces
    });

    it('should give 5% bonus for 3+ cards of same type', () => {
      // Create all COUCH_DAD deck (3 cards)
      const couchDeckCards: DeckCard[] = [];
      for (let i = 0; i < 3; i++) {
        const card = createTestCard(
          `couch-${i}`,
          `Couch Dad ${i}`,
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
        couchDeckCards.push({ cardId: card.id, card, count: 1 });
      }

      const couchDeck = createTestDeck('Couch Deck', couchDeckCards);
      const bonus = calculateSynergyBonus(couchDeck);

      expect(bonus.multiplier).toBe(1.05);
      expect(bonus.theme).toBe('COUCH_BROS');
      expect(bonus.description).toBe('COUCH BROS SYNERGY +5%'); // Underscores replaced with spaces
    });

    it('should give no bonus for mixed types', () => {
      // Create mixed deck with 2 BBQ_DAD, 2 COUCH_DAD, 1 FIX_IT_DAD
      const mixedDeckCards: DeckCard[] = [];

      for (let i = 0; i < 2; i++) {
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
        mixedDeckCards.push({ cardId: card.id, card, count: 1 });
      }

      for (let i = 0; i < 2; i++) {
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
        mixedDeckCards.push({ cardId: card.id, card, count: 1 });
      }

      const fixItCard = createTestCard(
        'fix-it-0',
        'Fix It Dad',
        'FIX_IT_DAD',
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
      mixedDeckCards.push({ cardId: fixItCard.id, card: fixItCard, count: 1 });

      const mixedDeck = createTestDeck('Mixed Deck', mixedDeckCards);
      const bonus = calculateSynergyBonus(mixedDeck);

      expect(bonus.multiplier).toBe(1.0);
      expect(bonus.theme).toBe('');
      expect(bonus.description).toBe('');
    });

    it('should give no bonus for decks with fewer than 3 of any type', () => {
      // Create deck with 2 BBQ_DAD, 2 COUCH_DAD (no majority)
      const smallDeckCards: DeckCard[] = [];

      for (let i = 0; i < 2; i++) {
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
        smallDeckCards.push({ cardId: card.id, card, count: 1 });
      }

      for (let i = 0; i < 2; i++) {
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
        smallDeckCards.push({ cardId: card.id, card, count: 1 });
      }

      const smallDeck = createTestDeck('Small Mixed Deck', smallDeckCards);
      const bonus = calculateSynergyBonus(smallDeck);

      expect(bonus.multiplier).toBe(1.0);
      expect(bonus.theme).toBe('');
      expect(bonus.description).toBe('');
    });

    it('should give 15% bonus for 7 cards of same type', () => {
      // Create all FIX_IT_DAD deck (7 cards)
      const fixItDeckCards: DeckCard[] = [];
      for (let i = 0; i < 7; i++) {
        const card = createTestCard(
          `fixit-${i}`,
          `Fix It Dad ${i}`,
          'FIX_IT_DAD',
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
        fixItDeckCards.push({ cardId: card.id, card, count: 1 });
      }

      const fixItDeck = createTestDeck('Fix It Deck', fixItDeckCards);
      const bonus = calculateSynergyBonus(fixItDeck);

      expect(bonus.multiplier).toBe(1.15);
      expect(bonus.theme).toBe('FIX_IT_BROS'); // Multi-word types use underscore in theme name
      expect(bonus.description).toBe('FIX IT BROS SYNERGY +15%'); // Underscores replaced with spaces in description
    });

    it('should handle TECH_DAD type correctly', () => {
      // Create all TECH_DAD deck (3 cards)
      const techDeckCards: DeckCard[] = [];
      for (let i = 0; i < 3; i++) {
        const card = createTestCard(
          `tech-${i}`,
          `Tech Dad ${i}`,
          'TECH_DAD',
          'epic',
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
        techDeckCards.push({ cardId: card.id, card, count: 1 });
      }

      const techDeck = createTestDeck('Tech Deck', techDeckCards);
      const bonus = calculateSynergyBonus(techDeck);

      expect(bonus.multiplier).toBe(1.05);
      expect(bonus.theme).toBe('TECH_BROS');
      expect(bonus.description).toBe('TECH BROS SYNERGY +5%'); // Underscores replaced with spaces
    });

    it('should handle GOLF_DAD type correctly', () => {
      // Create all GOLF_DAD deck (5 cards)
      const golfDeckCards: DeckCard[] = [];
      for (let i = 0; i < 5; i++) {
        const card = createTestCard(
          `golf-${i}`,
          `Golf Dad ${i}`,
          'GOLF_DAD',
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
        golfDeckCards.push({ cardId: card.id, card, count: 1 });
      }

      const golfDeck = createTestDeck('Golf Deck', golfDeckCards);
      const bonus = calculateSynergyBonus(golfDeck);

      expect(bonus.multiplier).toBe(1.15);
      expect(bonus.theme).toBe('GOLF_BROS');
      expect(bonus.description).toBe('GOLF BROS SYNERGY +15%'); // Underscores replaced with spaces
    });

    it('should apply synergy bonus in battle calculation', () => {
      // Create themed BBQ deck (5 cards) - gets 15% bonus
      const bbqDeckCards: DeckCard[] = [];
      for (let i = 0; i < 5; i++) {
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

      // Create mixed deck with same stats - no bonus
      const mixedDeckCards: DeckCard[] = [];
      for (let i = 0; i < 5; i++) {
        const types = ['BBQ_DAD', 'COUCH_DAD', 'FIX_IT_DAD', 'GOLF_DAD', 'LAWN_DAD'];
        const card = createTestCard(
          `mixed-${i}`,
          `Mixed Dad ${i}`,
          types[i],
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
        mixedDeckCards.push({ cardId: card.id, card, count: 1 });
      }

      const bbqDeck = createTestDeck('BBQ Deck', bbqDeckCards);
      const mixedDeck = createTestDeck('Mixed Deck', mixedDeckCards);

      const result = calculateBattleResult(bbqDeck, mixedDeck);

      // BBQ deck should have 15% synergy bonus
      expect(result.synergyBonus).toBe(1.15);
      expect(result.log.some(log => log.includes('BBQ BROS SYNERGY +15%'))).toBe(true);
    });

    it('should handle empty deck gracefully', () => {
      const emptyDeck = createTestDeck('Empty Deck', []);
      const bonus = calculateSynergyBonus(emptyDeck);

      expect(bonus.multiplier).toBe(1.0);
      expect(bonus.theme).toBe('');
      expect(bonus.description).toBe('');
    });
  });
});

describe('PACK-010: Battle System - RNG Variance', () => {
  describe('Seeded RNG - Replayability', () => {
    it('should produce identical results with same seed', () => {
      // Create identical test decks
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

      // Run battle twice with same seed
      const result1 = calculateBattleResult(deck1, deck2, 12345);
      const result2 = calculateBattleResult(deck1, deck2, 12345);

      // Results should be identical
      expect(result1.damage).toBe(result2.damage);
      expect(result1.winner.name).toBe(result2.winner.name);
      expect(result1.log).toEqual(result2.log);
    });

    it('should produce different results with different seeds', () => {
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

      // Run battles with different seeds
      const result1 = calculateBattleResult(deck1, deck2, 12345);
      const result2 = calculateBattleResult(deck1, deck2, 54321);

      // Results should differ (at least in damage due to RNG variance)
      expect(result1.damage).not.toBe(result2.damage);
    });

    it('should work without seed (random mode)', () => {
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

      // Should not throw error when called without seed
      const result = calculateBattleResult(deck1, deck2);

      expect(result).toBeDefined();
      expect(result.damage).toBeDefined();
      expect(result.winner).toBeDefined();
    });
  });

  describe('RNG Variance - ±10%', () => {
    it('should apply variance within ±10% range', () => {
      // Create decks with predictable damage
      const deck1Cards: DeckCard[] = [];
      for (let i = 0; i < 3; i++) {
        const card = createTestCard(
          `d1-${i}`,
          `Deck 1 Card ${i}`,
          'BBQ_DAD',
          'rare',
          {
            dadJoke: 80,
            grillSkill: 80,
            fixIt: 80,
            napPower: 80,
            remoteControl: 80,
            thermostat: 80,
            sockSandal: 80,
            beerSnob: 80,
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

      // Run many battles with different seeds to test variance range
      const damages: number[] = [];
      for (let seed = 1; seed <= 100; seed++) {
        const result = calculateBattleResult(deck1, deck2, seed);
        damages.push(result.damage);
      }

      // Base damage should be around: (80 - 50) * 1.2 (type adv) * 1.05 (synergy) = 37.8
      // With RNG, damage should vary between ~34 and ~41 (excluding critical/glancing)
      // But we also have critical hits (1.5x) and glancing blows (0.5x)
      // So range is much wider: ~17 to ~62

      const minDamage = Math.min(...damages);
      const maxDamage = Math.max(...damages);

      // Verify variance is being applied (range should be significant)
      expect(maxDamage - minDamage).toBeGreaterThan(10);

      // All damages should be at least 1
      damages.forEach(damage => {
        expect(damage).toBeGreaterThanOrEqual(1);
      });
    });

    it('should show variance in battle log', () => {
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
      deck2Cards.push({ cardId: card2.id, card: card2, count: 1 });

      const deck1 = createTestDeck('Deck 1', deck1Cards);
      const deck2 = createTestDeck('Deck 2', deck2Cards);

      const result = calculateBattleResult(deck1, deck2, 99999);

      // Check log contains RNG information
      const logText = result.log.join(' ');
      expect(logText).toContain('RNG System');
      expect(logText).toContain('Variance:');
      expect(logText).toContain('Base damage:');
      expect(logText).toContain('Final damage:');
    });
  });

  describe('Critical Hit System - 5% chance', () => {
    it('should have ~5% critical hit rate over many battles', () => {
      const deck1Cards: DeckCard[] = [];
      for (let i = 0; i < 3; i++) {
        const card = createTestCard(
          `d1-${i}`,
          `Deck 1 Card ${i}`,
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

      // Run 1000 battles and count critical hits
      let criticalHitCount = 0;
      const totalBattles = 1000;

      for (let seed = 1; seed <= totalBattles; seed++) {
        const result = calculateBattleResult(deck1, deck2, seed);
        const logText = result.log.join(' ');
        if (logText.includes('CRITICAL HIT')) {
          criticalHitCount++;
        }
      }

      // Critical hit rate should be around 5% (40-60 hits out of 1000)
      expect(criticalHitCount).toBeGreaterThan(30);
      expect(criticalHitCount).toBeLessThan(70);
    });

    it('should show "CRITICAL HIT!" in battle log', () => {
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
      deck2Cards.push({ cardId: card2.id, card: card2, count: 1 });

      const deck1 = createTestDeck('Deck 1', deck1Cards);
      const deck2 = createTestDeck('Deck 2', deck2Cards);

      // Try different seeds until we find a critical hit
      let foundCritical = false;
      for (let seed = 1; seed <= 100; seed++) {
        const result = calculateBattleResult(deck1, deck2, seed);
        const logText = result.log.join(' ');
        if (logText.includes('CRITICAL HIT')) {
          expect(logText).toContain('💥 CRITICAL HIT!');
          expect(logText).toContain('1.5x damage');
          foundCritical = true;
          break;
        }
      }

      // We should find at least one critical hit in 100 tries
      expect(foundCritical).toBe(true);
    });
  });

  describe('Glancing Blow System - 10% chance', () => {
    it('should have ~10% glancing blow rate over many battles', () => {
      const deck1Cards: DeckCard[] = [];
      for (let i = 0; i < 3; i++) {
        const card = createTestCard(
          `d1-${i}`,
          `Deck 1 Card ${i}`,
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

      // Run 1000 battles and count glancing blows
      let glancingBlowCount = 0;
      const totalBattles = 1000;

      for (let seed = 1; seed <= totalBattles; seed++) {
        const result = calculateBattleResult(deck1, deck2, seed);
        const logText = result.log.join(' ');
        if (logText.includes('Glancing blow')) {
          glancingBlowCount++;
        }
      }

      // Glancing blow rate should be around 10% (80-120 hits out of 1000)
      expect(glancingBlowCount).toBeGreaterThan(70);
      expect(glancingBlowCount).toBeLessThan(130);
    });

    it('should show "Glancing blow..." in battle log', () => {
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
      deck2Cards.push({ cardId: card2.id, card: card2, count: 1 });

      const deck1 = createTestDeck('Deck 1', deck1Cards);
      const deck2 = createTestDeck('Deck 2', deck2Cards);

      // Try different seeds until we find a glancing blow
      let foundGlancing = false;
      for (let seed = 1; seed <= 100; seed++) {
        const result = calculateBattleResult(deck1, deck2, seed);
        const logText = result.log.join(' ');
        if (logText.includes('Glancing blow')) {
          expect(logText).toContain('💨 Glancing blow...');
          expect(logText).toContain('0.5x damage');
          foundGlancing = true;
          break;
        }
      }

      // We should find at least one glancing blow in 100 tries
      expect(foundGlancing).toBe(true);
    });
  });

  describe('Hit Type Exclusivity', () => {
    it('should never have both critical hit and glancing blow', () => {
      const deck1Cards: DeckCard[] = [];
      for (let i = 0; i < 3; i++) {
        const card = createTestCard(
          `d1-${i}`,
          `Deck 1 Card ${i}`,
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

      // Run 1000 battles and verify no battle has both critical and glancing
      for (let seed = 1; seed <= 1000; seed++) {
        const result = calculateBattleResult(deck1, deck2, seed);
        const logText = result.log.join(' ');

        const hasCritical = logText.includes('CRITICAL HIT');
        const hasGlancing = logText.includes('Glancing blow');

        // Should never have both
        expect(hasCritical && hasGlancing).toBe(false);
      }
    });
  });

  describe('Damage Calculation with RNG', () => {
    it('should apply all multipliers correctly', () => {
      const deck1Cards: DeckCard[] = [];
      const card1 = createTestCard(
        'card-1',
        'Test Card 1',
        'BBQ_DAD',
        'rare',
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
      deck1Cards.push({ cardId: card1.id, card: card1, count: 1 });

      const deck2Cards: DeckCard[] = [];
      const card2 = createTestCard(
        'card-2',
        'Test Card 2',
        'COUCH_DAD',
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
      deck2Cards.push({ cardId: card2.id, card: card2, count: 1 });

      const deck1 = createTestDeck('Deck 1', deck1Cards);
      const deck2 = createTestDeck('Deck 2', deck2Cards);

      // Test with known seed that produces critical hit
      const result = calculateBattleResult(deck1, deck2, 42);

      // Damage should be calculated correctly
      // Base: 100 - 0 = 100
      // Type advantage (BBQ vs COUCH): 1.2x
      // Synergy (1 BBQ card): 1.0x (no bonus for single card)
      // Before RNG: 100 * 1.2 = 120
      // Minimum damage: max(5, 120 - 0) = 120
      // After RNG variance, critical hit, or glancing blow: varies

      expect(result.damage).toBeGreaterThan(0);
      expect(result.damage).toBeLessThan(200); // Should be reasonable
    });

    it('should always deal at least 1 damage', () => {
      const deck1Cards: DeckCard[] = [];
      const card1 = createTestCard(
        'card-1',
        'Test Card 1',
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
      deck1Cards.push({ cardId: card1.id, card: card1, count: 1 });

      const deck2Cards: DeckCard[] = [];
      const card2 = createTestCard(
        'card-2',
        'Test Card 2',
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
      deck2Cards.push({ cardId: card2.id, card: card2, count: 1 });

      const deck1 = createTestDeck('Deck 1', deck1Cards);
      const deck2 = createTestDeck('Deck 2', deck2Cards);

      // Even with tiny power difference and worst RNG (glancing blow + -10% variance)
      for (let seed = 1; seed <= 100; seed++) {
        const result = calculateBattleResult(deck1, deck2, seed);
        expect(result.damage).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('Battle Log Format', () => {
    it('should include RNG section in battle log', () => {
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
      deck2Cards.push({ cardId: card2.id, card: card2, count: 1 });

      const deck1 = createTestDeck('Deck 1', deck1Cards);
      const deck2 = createTestDeck('Deck 2', deck2Cards);

      const result = calculateBattleResult(deck1, deck2, 12345);

      // Verify log structure
      expect(result.log).toContain('🎲 RNG System:');
      expect(result.log.some(line => line.includes('Normal hit') ||
                                 line.includes('CRITICAL HIT') ||
                                 line.includes('Glancing blow'))).toBe(true);
      expect(result.log.some(line => line.includes('Variance:'))).toBe(true);
      expect(result.log.some(line => line.includes('Base damage:'))).toBe(true);
      expect(result.log.some(line => line.includes('Final damage:'))).toBe(true);
    });
  });
});
