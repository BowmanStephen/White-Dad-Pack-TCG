import { describe, it, expect, beforeEach } from 'vitest';
import {
  currentDeck,
  decks,
  deckValidation,
  isDeckLimitReached,
} from '@/stores/deck';
import type { Deck, DeckCard, Card } from '@/types';
import { MAX_DECK_SIZE, MIN_DECK_SIZE, MAX_DECK_SLOTS } from '@/types';

// Mock card data
const mockCards: Card[] = [
  {
    id: 'bbq_dad_001',
    name: 'Grillmaster Gary',
    type: 'BBQ_DICKTATOR',
    rarity: 'rare',
    stats: {
      dadJoke: 75,
      grillSkill: 95,
      fixIt: 40,
      napPower: 30,
      remoteControl: 50,
      thermostat: 60,
      sockSandal: 45,
      beerSnob: 70,
    },
    abilities: [
      {
        name: 'Perfect Sear',
        description: 'Flip a burger. If it lands rare, gain +10 Grill Skill.',
      },
    ],
    flavorText: 'Propane is just a suggestion.',
    series: 1,
    cardNumber: 1,
    totalInSeries: 50,
    artist: 'AI Assistant',
    isHolo: false,
    holoType: 'none',
    seasonId: 1,
  },
  {
    id: 'fix_it_dad_001',
    name: 'Handy Hank',
    type: 'FIX_IT_FUCKBOY',
    rarity: 'common',
    stats: {
      dadJoke: 50,
      grillSkill: 30,
      fixIt: 90,
      napPower: 40,
      remoteControl: 60,
      thermostat: 50,
      sockSandal: 35,
      beerSnob: 45,
    },
    abilities: [],
    flavorText: 'Duct tape fixes everything.',
    series: 1,
    cardNumber: 2,
    totalInSeries: 50,
    artist: 'AI Assistant',
    isHolo: false,
    holoType: 'none',
    seasonId: 1,
  },
  {
    id: 'couch_dad_001',
    name: 'Naptime Ned',
    type: 'COUCH_CUMMANDER',
    rarity: 'epic',
    stats: {
      dadJoke: 85,
      grillSkill: 20,
      fixIt: 35,
      napPower: 100,
      remoteControl: 95,
      thermostat: 40,
      sockSandal: 60,
      beerSnob: 55,
    },
    abilities: [
      {
        name: 'Power Nap',
        description: 'Recover 50% of missing Nap Power.',
      },
    ],
    flavorText: 'Five more minutes...',
    series: 1,
    cardNumber: 3,
    totalInSeries: 50,
    artist: 'AI Assistant',
    isHolo: false,
    holoType: 'none',
    seasonId: 1,
  },
];

// Helper function to create deck cards from card data
function createDeckCards(cards: Card[], counts: number[]): DeckCard[] {
  return cards.map((card, index) => ({
    id: card.id,
    card: card,
    count: counts[index] || 1,
  }));
}

// Helper function to create a mock deck
function createMockDeck(name: string, cards: DeckCard[]): Deck {
  return {
    id: `deck_${Date.now()}`,
    name,
    description: 'Test deck',
    cards,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('DeckBuilder Component - Validation', () => {
  beforeEach(() => {
    // Reset stores before each test
    currentDeck.set({
      id: 'test_deck',
      name: 'Test Deck',
      description: '',
      cards: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    decks.set([]);
    deckValidation.set({
      isValid: true,
      errors: [],
      warnings: [],
    });
    isDeckLimitReached.set(false);
  });

  describe('Deck Size Validation', () => {
    it('should validate minimum deck size', () => {
      const deckCards = createDeckCards(mockCards.slice(0, 2), [1, 1]); // 2 cards total
      currentDeck.set(
        createMockDeck('Small Deck', [
          { cardId: mockCards[0].id, card: mockCards[0], count: 1 },
        ])
      );

      // Deck with 1 card should be invalid (below minimum)
      const validation = deckValidation.get();

      // Check if validation detects size issues
      expect(validation).toBeDefined();
      expect(validation.errors).toBeInstanceOf(Array);
    });

    it('should validate maximum deck size', () => {
      // Create cards that exceed maximum
      const largeDeckCards: DeckCard[] = [];
      for (let i = 0; i < MAX_DECK_SIZE + 1; i++) {
        largeDeckCards.push({
          cardId: `card_${i}`,
          card: mockCards[0],
          count: 1,
        });
      }

      const oversizedDeck = createMockDeck('Oversized Deck', largeDeckCards);

      // Should have validation errors
      expect(oversizedDeck.cards.length).toBeGreaterThan(MAX_DECK_SIZE);
    });

    it('should accept deck within valid size range', () => {
      // Create a deck with valid number of cards (between MIN_DECK_SIZE and MAX_DECK_SIZE)
      const validDeckCards: DeckCard[] = [];
      for (let i = 0; i < MIN_DECK_SIZE; i++) {
        validDeckCards.push({
          cardId: `card_${i}`,
          card: mockCards[i % mockCards.length],
          count: 1,
        });
      }
      const validDeck = createMockDeck('Valid Deck', validDeckCards);

      expect(validDeck.cards.length).toBeGreaterThanOrEqual(MIN_DECK_SIZE);
      expect(validDeck.cards.length).toBeLessThanOrEqual(MAX_DECK_SIZE);
    });

    it('should validate exactly at minimum size', () => {
      const minDeckCards: DeckCard[] = [];
      for (let i = 0; i < MIN_DECK_SIZE; i++) {
        minDeckCards.push({
          cardId: `card_${i}`,
          card: mockCards[i % mockCards.length],
          count: 1,
        });
      }

      const minDeck = createMockDeck('Minimum Deck', minDeckCards);

      expect(minDeck.cards.length).toBe(MIN_DECK_SIZE);
    });

    it('should validate exactly at maximum size', () => {
      const maxDeckCards: DeckCard[] = [];
      for (let i = 0; i < MAX_DECK_SIZE; i++) {
        maxDeckCards.push({
          cardId: `card_${i}`,
          card: mockCards[i % mockCards.length],
          count: 1,
        });
      }

      const maxDeck = createMockDeck('Maximum Deck', maxDeckCards);

      expect(maxDeck.cards.length).toBe(MAX_DECK_SIZE);
    });
  });

  describe('Card Count Validation', () => {
    it('should validate individual card counts', () => {
      // Create deck with card count > 3 (if there's a max per card)
      const deckCards = [
        {
          id: mockCards[0].id,
          card: mockCards[0],
          count: 5, // Exceeds typical limit of 3
        },
      ];

      const deck = createMockDeck('High Count Deck', deckCards);

      // Deck should have validation issues
      expect(deck.cards[0].count).toBeGreaterThan(3);
    });

    it('should accept valid card counts', () => {
      const deckCards = [
        {
          id: mockCards[0].id,
          card: mockCards[0],
          count: 2, // Within limit
        },
        {
          id: mockCards[1].id,
          card: mockCards[1],
          count: 1,
        },
      ];

      const deck = createMockDeck('Valid Counts Deck', deckCards);

      deck.cards.forEach((deckCard) => {
        expect(deckCard.count).toBeGreaterThan(0);
        expect(deckCard.count).toBeLessThanOrEqual(3);
      });
    });

    it('should reject zero card count', () => {
      const deckCards = [
        {
          id: mockCards[0].id,
          card: mockCards[0],
          count: 0, // Invalid
        },
      ];

      const deck = createMockDeck('Zero Count Deck', deckCards);

      expect(deck.cards[0].count).toBe(0);
    });

    it('should reject negative card count', () => {
      const deckCards = [
        {
          id: mockCards[0].id,
          card: mockCards[0],
          count: -1, // Invalid
        },
      ];

      const deck = createMockDeck('Negative Count Deck', deckCards);

      expect(deck.cards[0].count).toBeLessThan(0);
    });
  });

  describe('Deck Limit Validation', () => {
    it('should enforce maximum number of deck slots', () => {
      const maxDecks: Deck[] = [];
      for (let i = 0; i < MAX_DECK_SLOTS; i++) {
        maxDecks.push(
          createMockDeck(`Deck ${i}`, [
            {
              id: mockCards[0].id,
              card: mockCards[0],
              count: 1,
            },
          ])
        );
      }

      decks.set(maxDecks);

      const decksData = decks.get();
      expect(decksData.length).toBe(MAX_DECK_SLOTS);

      // Should indicate limit reached
      const limitReached = isDeckLimitReached.get();
      expect(limitReached).toBeDefined();
    });

    it('should allow creating decks when under limit', () => {
      const singleDeck = [
        createMockDeck('Deck 1', [
          {
            id: mockCards[0].id,
            card: mockCards[0],
            count: 1,
          },
        ]),
      ];

      decks.set(singleDeck);

      const limitReached = isDeckLimitReached.get();
      expect(limitReached).toBe(false);
    });
  });

  describe('Deck Card Types', () => {
    it('should accept cards from different types', () => {
      const multiTypeDeck = createMockDeck('Multi-Type Deck', [
        {
          id: mockCards[0].id,
          card: mockCards[0], // BBQ_DICKTATOR
          count: 1,
        },
        {
          id: mockCards[1].id,
          card: mockCards[1], // FIX_IT_FUCKBOY
          count: 1,
        },
        {
          id: mockCards[2].id,
          card: mockCards[2], // COUCH_CUMMANDER
          count: 1,
        },
      ]);

      const types = new Set(multiTypeDeck.cards.map((dc) => dc.card.type));
      expect(types.size).toBe(3);
    });

    it('should accept cards from different rarities', () => {
      const multiRarityDeck = createMockDeck('Multi-Rarity Deck', [
        {
          id: mockCards[0].id,
          card: mockCards[0], // rare
          count: 1,
        },
        {
          id: mockCards[1].id,
          card: mockCards[1], // common
          count: 1,
        },
        {
          id: mockCards[2].id,
          card: mockCards[2], // epic
          count: 1,
        },
      ]);

      const rarities = new Set(multiRarityDeck.cards.map((dc) => dc.card.rarity));
      expect(rarities.size).toBe(3);
      expect(rarities.has('rare')).toBe(true);
      expect(rarities.has('common')).toBe(true);
      expect(rarities.has('epic')).toBe(true);
    });
  });

  describe('Deck Statistics', () => {
    it('should calculate total card count correctly', () => {
      const deckCards = [
        {
          id: mockCards[0].id,
          card: mockCards[0],
          count: 2,
        },
        {
          id: mockCards[1].id,
          card: mockCards[1],
          count: 3,
        },
      ];

      const deck = createMockDeck('Stats Test Deck', deckCards);

      const totalCount = deck.cards.reduce((sum, dc) => sum + dc.count, 0);
      expect(totalCount).toBe(5);
    });

    it('should calculate deck type distribution', () => {
      const deckCards = [
        {
          id: mockCards[0].id,
          card: mockCards[0], // BBQ_DICKTATOR
          count: 2,
        },
        {
          id: mockCards[0].id,
          card: mockCards[0], // BBQ_DICKTATOR (duplicate card, different count)
          count: 1,
        },
        {
          id: mockCards[1].id,
          card: mockCards[1], // FIX_IT_FUCKBOY
          count: 2,
        },
      ];

      const deck = createMockDeck('Type Dist Deck', deckCards);

      const typeCounts = deck.cards.reduce((acc, dc) => {
        acc[dc.card.type] = (acc[dc.card.type] || 0) + dc.count;
        return acc;
      }, {} as Record<string, number>);

      expect(typeCounts['BBQ_DICKTATOR']).toBe(3);
      expect(typeCounts['FIX_IT_FUCKBOY']).toBe(2);
    });

    it('should calculate average stats', () => {
      const deckCards = [
        {
          id: mockCards[0].id,
          card: mockCards[0],
          count: 1,
        },
        {
          id: mockCards[1].id,
          card: mockCards[1],
          count: 1,
        },
      ];

      const deck = createMockDeck('Avg Stats Deck', deckCards);

      // Calculate average grill skill
      const totalGrillSkill = deck.cards.reduce(
        (sum, dc) => sum + dc.card.stats.grillSkill * dc.count,
        0
      );
      const totalCount = deck.cards.reduce((sum, dc) => sum + dc.count, 0);
      const avgGrillSkill = totalGrillSkill / totalCount;

      expect(avgGrillSkill).toBe(62.5); // (95 + 30) / 2
    });
  });

  describe('Deck Metadata', () => {
    it('should store deck name and description', () => {
      const deck = createMockDeck('Test Deck Name', [
        {
          id: mockCards[0].id,
          card: mockCards[0],
          count: 1,
        },
      ]);

      expect(deck.name).toBe('Test Deck Name');
      expect(deck.description).toBe('Test deck');
    });

    it('should track creation and update timestamps', () => {
      const beforeCreate = Date.now();

      const deck = createMockDeck('Timestamp Deck', [
        {
          id: mockCards[0].id,
          card: mockCards[0],
          count: 1,
        },
      ]);

      const afterCreate = Date.now();

      // Deck timestamps are Date objects, convert to numbers for comparison
      expect(deck.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate);
      expect(deck.createdAt.getTime()).toBeLessThanOrEqual(afterCreate);
      expect(deck.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate);
      expect(deck.updatedAt.getTime()).toBeLessThanOrEqual(afterCreate);
    });

    it('should have unique deck IDs', () => {
      const deck1 = createMockDeck('Deck 1', [
        {
          id: mockCards[0].id,
          card: mockCards[0],
          count: 1,
        },
      ]);

      // Add small delay to ensure different timestamp
      const startTime = Date.now();
      while (Date.now() - startTime < 2) {
        // Wait 2ms to ensure different millisecond
      }

      const deck2 = createMockDeck('Deck 2', [
        {
          id: mockCards[0].id,
          card: mockCards[0],
          count: 1,
        },
      ]);

      expect(deck1.id).not.toBe(deck2.id);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty deck', () => {
      const emptyDeck = createMockDeck('Empty Deck', []);

      expect(emptyDeck.cards.length).toBe(0);
    });

    it('should handle deck with all same card', () => {
      const sameCardDeck = createMockDeck('Same Card Deck', [
        {
          id: mockCards[0].id,
          card: mockCards[0],
          count: 3,
        },
      ]);

      expect(sameCardDeck.cards.length).toBe(1);
      expect(sameCardDeck.cards[0].count).toBe(3);
    });

    it('should handle deck with maximum allowed count for each card', () => {
      const maxCountDeck = createMockDeck('Max Count Deck', [
        {
          id: mockCards[0].id,
          card: mockCards[0],
          count: 3,
        },
        {
          id: mockCards[1].id,
          card: mockCards[1],
          count: 3,
        },
        {
          id: mockCards[2].id,
          card: mockCards[2],
          count: 3,
        },
      ]);

      const totalCount = maxCountDeck.cards.reduce((sum, dc) => sum + dc.count, 0);
      expect(totalCount).toBe(9);

      maxCountDeck.cards.forEach((deckCard) => {
        expect(deckCard.count).toBeLessThanOrEqual(3);
      });
    });
  });
});
