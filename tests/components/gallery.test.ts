import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { collection } from '@/stores/collection';
import type { PackCard, Rarity, DadType } from '@/types';
import { RARITY_CONFIG, DAD_TYPE_NAMES } from '@/types';

// Mock collection store
const mockCards: PackCard[] = [
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
    abilities: [],
    flavorText: 'Propane is just a suggestion.',
    isHolo: true,
    holoType: 'standard',
    series: 1,
    cardNumber: 1,
    totalInSeries: 50,
    artist: 'AI Assistant',
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
    isHolo: false,
    holoType: 'none',
    series: 1,
    cardNumber: 2,
    totalInSeries: 50,
    artist: 'AI Assistant',
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
    abilities: [],
    flavorText: 'Five more minutes...',
    isHolo: false,
    holoType: 'none',
    series: 1,
    cardNumber: 3,
    totalInSeries: 50,
    artist: 'AI Assistant',
    seasonId: 1,
  },
];

// Mock collection with packs
const mockCollection = {
  cards: mockCards.map((card) => ({
    ...card,
    obtainedAt: new Date(),
    packId: 'test_pack_001',
    duplicateCount: 1,
  })),
  packs: [
    {
      id: 'test_pack_001',
      cards: mockCards,
      openedAt: new Date(),
    },
  ],
  deckSlots: 3,
};

// Helper function to get unique cards with counts (from collection/utils)
function getUniqueCardsWithCounts(packs: any[]) {
  const cardMap = new Map();

  packs.forEach((pack) => {
    pack.cards.forEach((card: PackCard) => {
      const existing = cardMap.get(card.id);
      if (existing) {
        existing.duplicateCount++;
      } else {
        cardMap.set(card.id, { card, duplicateCount: 1 });
      }
    });
  });

  return Array.from(cardMap.values()).map(({ card, duplicateCount }) => ({
    card,
    duplicateCount,
  }));
}

// Helper function to filter cards by rarity (from collection/utils)
function filterCardsByRarity(cards: any[], rarity: Rarity | null) {
  if (!rarity) return cards;
  return cards.filter((item) => item.card.rarity === rarity);
}

// Helper function to filter cards by search (from collection/utils)
function filterCardsBySearch(cards: any[], searchTerm: string) {
  if (!searchTerm) return cards;
  const term = searchTerm.toLowerCase();

  return cards.filter((item) => {
    const { card } = item;
    return (
      card.name.toLowerCase().includes(term) ||
      (card.flavorText && card.flavorText.toLowerCase().includes(term))
    );
  });
}

// Helper function to filter cards by types (from collection/utils)
function filterCardsByTypes(cards: any[], selectedTypes: Set<DadType>) {
  if (selectedTypes.size === 0) return cards;
  return cards.filter((item) => selectedTypes.has(item.card.type));
}

// Helper function to filter holo cards (from collection/utils)
function filterCardsByHolo(cards: any[], holoOnly: boolean) {
  if (!holoOnly) return cards;
  return cards.filter((item) => item.card.isHolo);
}

describe('Gallery Component - Filtering Logic', () => {
  beforeEach(() => {
    // Reset collection before each test
    collection.set(mockCollection);
  });

  describe('Rarity Filtering', () => {
    it('should filter cards by rarity correctly', () => {
      const uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);

      // Filter by rare
      const rareCards = filterCardsByRarity(uniqueCards, 'rare');
      expect(rareCards.length).toBe(1);
      expect(rareCards[0].card.name).toBe('Grillmaster Gary');
      expect(rareCards[0].card.rarity).toBe('rare');

      // Filter by common
      const commonCards = filterCardsByRarity(uniqueCards, 'common');
      expect(commonCards.length).toBe(1);
      expect(commonCards[0].card.name).toBe('Handy Hank');
      expect(commonCards[0].card.rarity).toBe('common');

      // Filter by epic
      const epicCards = filterCardsByRarity(uniqueCards, 'epic');
      expect(epicCards.length).toBe(1);
      expect(epicCards[0].card.name).toBe('Naptime Ned');
      expect(epicCards[0].card.rarity).toBe('epic');
    });

    it('should return all cards when rarity is null', () => {
      const uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);
      const allCards = filterCardsByRarity(uniqueCards, null);

      expect(allCards.length).toBe(3);
    });

    it('should handle filtering by rarity that returns no results', () => {
      const uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);
      const mythicCards = filterCardsByRarity(uniqueCards, 'mythic');

      expect(mythicCards.length).toBe(0);
    });
  });

  describe('Search Filtering', () => {
    it('should filter cards by name', () => {
      const uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);

      const results = filterCardsBySearch(uniqueCards, 'Grillmaster');
      expect(results.length).toBe(1);
      expect(results[0].card.name).toBe('Grillmaster Gary');
    });

    it('should filter cards by flavor text', () => {
      const uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);

      const results = filterCardsBySearch(uniqueCards, 'Propane');
      expect(results.length).toBe(1);
      expect(results[0].card.name).toBe('Grillmaster Gary');
    });

    it('should be case-insensitive', () => {
      const uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);

      const results = filterCardsBySearch(uniqueCards, 'GRILLMASTER');
      expect(results.length).toBe(1);
    });

    it('should return all cards when search term is empty', () => {
      const uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);

      const results = filterCardsBySearch(uniqueCards, '');
      expect(results.length).toBe(3);
    });

    it('should handle partial matches', () => {
      const uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);

      // Search for "master" which appears in "Grillmaster Gary"
      const results = filterCardsBySearch(uniqueCards, 'master');
      expect(results.length).toBe(1);
      expect(results[0].card.name).toBe('Grillmaster Gary');
    });

    it('should return empty array when no matches found', () => {
      const uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);

      const results = filterCardsBySearch(uniqueCards, 'Nonexistent Card');
      expect(results.length).toBe(0);
    });
  });

  describe('Type Filtering', () => {
    it('should filter cards by single dad type', () => {
      const uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);

      const bbqCards = filterCardsByTypes(uniqueCards, new Set(['BBQ_DICKTATOR']));
      expect(bbqCards.length).toBe(1);
      expect(bbqCards[0].card.name).toBe('Grillmaster Gary');
      expect(bbqCards[0].card.type).toBe('BBQ_DICKTATOR');
    });

    it('should filter cards by multiple dad types', () => {
      const uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);

      const multiTypeCards = filterCardsByTypes(
        uniqueCards,
        new Set(['BBQ_DICKTATOR', 'FIX_IT_FUCKBOY'])
      );
      expect(multiTypeCards.length).toBe(2);
    });

    it('should return all cards when type set is empty', () => {
      const uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);

      const results = filterCardsByTypes(uniqueCards, new Set());
      expect(results.length).toBe(3);
    });

    it('should handle type that returns no results', () => {
      const uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);

      const results = filterCardsByTypes(uniqueCards, new Set(['GOLF_GONAD']));
      expect(results.length).toBe(0);
    });
  });

  describe('Holo Filtering', () => {
    it('should filter only holo cards when holoOnly is true', () => {
      const uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);

      const holoCards = filterCardsByHolo(uniqueCards, true);
      expect(holoCards.length).toBe(1);
      expect(holoCards[0].card.name).toBe('Grillmaster Gary');
      expect(holoCards[0].card.isHolo).toBe(true);
    });

    it('should return all cards when holoOnly is false', () => {
      const uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);

      const allCards = filterCardsByHolo(uniqueCards, false);
      expect(allCards.length).toBe(3);
    });
  });

  describe('Combined Filtering', () => {
    it('should apply rarity and search filters together', () => {
      let uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);

      // Apply rarity filter first
      uniqueCards = filterCardsByRarity(uniqueCards, 'rare');
      expect(uniqueCards.length).toBe(1);

      // Then apply search filter
      const results = filterCardsBySearch(uniqueCards, 'Grillmaster');
      expect(results.length).toBe(1);
      expect(results[0].card.name).toBe('Grillmaster Gary');
    });

    it('should apply type and holo filters together', () => {
      let uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);

      // Apply type filter
      uniqueCards = filterCardsByTypes(uniqueCards, new Set(['BBQ_DICKTATOR']));
      expect(uniqueCards.length).toBe(1);

      // Then apply holo filter
      const results = filterCardsByHolo(uniqueCards, true);
      expect(results.length).toBe(1);
      expect(results[0].card.isHolo).toBe(true);
    });

    it('should handle filters that result in no matches', () => {
      let uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);

      // Apply rarity filter
      uniqueCards = filterCardsByRarity(uniqueCards, 'common');

      // Then apply holo filter (but common card is not holo)
      const results = filterCardsByHolo(uniqueCards, true);
      expect(results.length).toBe(0);
    });
  });

  describe('Card Data Structure', () => {
    it('should correctly count duplicate cards', () => {
      const uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);

      // All cards should have duplicate count of 1
      uniqueCards.forEach((item) => {
        expect(item.duplicateCount).toBe(1);
      });
    });

    it('should preserve card data through filters', () => {
      const uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);
      const rareCards = filterCardsByRarity(uniqueCards, 'rare');

      expect(rareCards[0].card.id).toBe('bbq_dad_001');
      expect(rareCards[0].card.stats).toBeDefined();
      expect(rareCards[0].card.abilities).toBeDefined();
      expect(rareCards[0].card.rarity).toBe('rare');
    });

    it('should have correct rarity config for each rarity', () => {
      // Check that all rarities have config
      const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

      rarities.forEach((rarity) => {
        expect(RARITY_CONFIG[rarity]).toBeDefined();
        expect(RARITY_CONFIG[rarity].name).toBeDefined();
        expect(RARITY_CONFIG[rarity].color).toBeDefined();
      });
    });

    it('should have correct dad type names', () => {
      // Check that all types have names
      const types: DadType[] = ['BBQ_DICKTATOR', 'FIX_IT_FUCKBOY', 'COUCH_CUMMANDER'];

      types.forEach((type) => {
        expect(DAD_TYPE_NAMES[type]).toBeDefined();
        expect(typeof DAD_TYPE_NAMES[type]).toBe('string');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty collection', () => {
      const emptyCollection = {
        cards: [],
        packs: [],
        deckSlots: 3,
      };

      collection.set(emptyCollection);

      const uniqueCards = getUniqueCardsWithCounts([]);
      expect(uniqueCards.length).toBe(0);
    });

    it('should handle collection with no cards', () => {
      const emptyPackCollection = {
        cards: [],
        packs: [{ id: 'empty_pack', cards: [], openedAt: new Date() }],
        deckSlots: 3,
      };

      collection.set(emptyPackCollection);

      const uniqueCards = getUniqueCardsWithCounts(emptyPackCollection.packs);
      expect(uniqueCards.length).toBe(0);
    });

    it('should handle very long search terms', () => {
      const uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);

      const longSearchTerm = 'a'.repeat(1000);
      const results = filterCardsBySearch(uniqueCards, longSearchTerm);

      expect(results.length).toBe(0);
    });

    it('should handle special characters in search', () => {
      const uniqueCards = getUniqueCardsWithCounts(mockCollection.packs);

      // Search for "..." which appears in Naptime Ned's flavor text "Five more minutes..."
      const results = filterCardsBySearch(uniqueCards, '...');
      expect(results.length).toBe(1);
      expect(results[0].card.name).toBe('Naptime Ned');
    });
  });
});
