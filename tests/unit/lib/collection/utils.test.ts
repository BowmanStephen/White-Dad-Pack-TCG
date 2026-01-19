import { describe, it, expect, vi } from 'vitest';
import {
  countCardDuplicates,
  getUniqueCardsWithCounts,
  sortCardsByRarityAndName,
  filterCardsByRarity,
  filterCardsBySearch,
  filterCardsByHolo,
  filterCardsByTypes,
  getPaginatedCards,
  calculateCollectionProgress,
  formatCardCount,
  getCardsByRarity,
  sortCardsByName,
  getCardObtainedDates,
  sortCardsByDateObtained,
  sortCardsByType,
  sortCardsByOption,
  filterCardsByStatRanges,
  filterCardsByHoloVariants,
  filterCardsByAdvancedSearch,
  getDefaultStatRanges,
  areStatRangesDefault,
  findPulledWishlistedCards,
  formatWishlistPriority,
  getPriorityColor,
  calculateCardValue,
  calculateCollectionValue,
  formatCollectionValue,
  getValueBreakdownByRarity,
} from '@/lib/collection/utils';
import type { Pack, CollectionDisplayCard, Rarity, DadType, HoloVariant, StatRanges, AdvancedSearchFilters } from '@/types';

// Mock the sanitizer
vi.mock('@/lib/security/sanitizer', () => ({
  sanitizeSearchQuery: vi.fn((query: string) => query), // Pass through for testing
}));

// Helper to create a valid CollectionDisplayCard
function createMockCard(overrides: Partial<CollectionDisplayCard> & { id: string; name: string; rarity: Rarity; type: DadType }): CollectionDisplayCard {
  return {
    id: overrides.id,
    name: overrides.name,
    subtitle: overrides.subtitle || 'Test Subtitle',
    type: overrides.type,
    rarity: overrides.rarity,
    artwork: overrides.artwork || '',
    stats: overrides.stats || { dadJoke: 50, grillSkill: 50, fixIt: 50, napPower: 50, remoteControl: 50, thermostat: 50, sockSandal: 50, beerSnob: 50 },
    flavorText: overrides.flavorText || 'Test flavor text',
    abilities: overrides.abilities || [],
    series: overrides.series || 1,
    cardNumber: overrides.cardNumber || 1,
    totalInSeries: overrides.totalInSeries || 100,
    artist: overrides.artist || 'Test Artist',
    isRevealed: overrides.isRevealed ?? true,
    isHolo: overrides.isHolo ?? false,
    holoType: overrides.holoType || 'none',
    duplicateCount: overrides.duplicateCount || 1,
  };
}

// Helper to create a valid Pack
function createMockPack(id: string, cards: CollectionDisplayCard[], openedAt: Date): Pack {
  const bestRarity = cards.length > 0 ? cards.reduce((best, card) => {
    const order = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 };
    return order[card.rarity] > order[best.rarity] ? card : best;
  }, cards[0]).rarity : 'common';

  return {
    id,
    cards,
    openedAt,
    bestRarity,
    design: 'standard',
  };
}

// Sample cards for testing
const sampleCards: CollectionDisplayCard[] = [
  createMockCard({ id: 'card_1', name: 'Alpha Dad', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType }),
  createMockCard({ id: 'card_2', name: 'Beta Dad', rarity: 'rare', type: 'FIX_IT_FUCKBOY' as DadType, isHolo: true, holoType: 'standard' }),
  createMockCard({ id: 'card_3', name: 'Charlie Dad', rarity: 'epic', type: 'COUCH_CUMMANDER' as DadType }),
  createMockCard({ id: 'card_4', name: 'Delta Dad', rarity: 'uncommon', type: 'BBQ_DICKTATOR' as DadType }),
  createMockCard({ id: 'card_5', name: 'Echo Dad', rarity: 'legendary', type: 'TECH_TWATS' as DadType, isHolo: true, holoType: 'full_art' }),
];

describe('Collection Utils', () => {
  describe('countCardDuplicates', () => {
    it('should count single occurrences', () => {
      const packs: Pack[] = [createMockPack('pack1', sampleCards, new Date())];
      const counts = countCardDuplicates(packs);

      expect(counts.get('card_1')).toBe(1);
      expect(counts.get('card_2')).toBe(1);
    });

    it('should count multiple occurrences across packs', () => {
      const card1 = createMockCard({ id: 'card_1', name: 'Alpha Dad', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType });
      const card2 = createMockCard({ id: 'card_2', name: 'Beta Dad', rarity: 'rare', type: 'FIX_IT_FUCKBOY' as DadType });

      const packs: Pack[] = [
        createMockPack('pack1', [card1, card2], new Date()),
        createMockPack('pack2', [card1], new Date()), // card_1 appears again
        createMockPack('pack3', [card1, card2], new Date()), // both appear again
      ];

      const counts = countCardDuplicates(packs);

      expect(counts.get('card_1')).toBe(3);
      expect(counts.get('card_2')).toBe(2);
    });

    it('should return empty map for empty packs', () => {
      const counts = countCardDuplicates([]);
      expect(counts.size).toBe(0);
    });
  });

  describe('getUniqueCardsWithCounts', () => {
    it('should return unique cards with duplicate counts', () => {
      const card1 = createMockCard({ id: 'card_1', name: 'Alpha Dad', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType });

      const packs: Pack[] = [
        createMockPack('pack1', [card1], new Date()),
        createMockPack('pack2', [card1], new Date()),
      ];

      const uniqueCards = getUniqueCardsWithCounts(packs);

      expect(uniqueCards).toHaveLength(1);
      expect(uniqueCards[0].duplicateCount).toBe(2);
    });

    it('should not include duplicate entries', () => {
      const card1 = createMockCard({ id: 'card_1', name: 'Alpha Dad', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType });
      const card2 = createMockCard({ id: 'card_2', name: 'Beta Dad', rarity: 'rare', type: 'FIX_IT_FUCKBOY' as DadType });

      const packs: Pack[] = [
        createMockPack('pack1', [card1, card2, card1], new Date()),
      ];

      const uniqueCards = getUniqueCardsWithCounts(packs);

      expect(uniqueCards).toHaveLength(2);
    });
  });

  describe('sortCardsByRarityAndName', () => {
    it('should sort by rarity (mythic first)', () => {
      const cards = [
        createMockCard({ id: '1', name: 'A', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType }),
        createMockCard({ id: '2', name: 'B', rarity: 'mythic', type: 'BBQ_DICKTATOR' as DadType }),
        createMockCard({ id: '3', name: 'C', rarity: 'rare', type: 'BBQ_DICKTATOR' as DadType }),
      ];

      const sorted = sortCardsByRarityAndName(cards);

      expect(sorted[0].rarity).toBe('mythic');
      expect(sorted[1].rarity).toBe('rare');
      expect(sorted[2].rarity).toBe('common');
    });

    it('should sort by name when rarity is equal', () => {
      const cards = [
        createMockCard({ id: '1', name: 'Zulu Dad', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType }),
        createMockCard({ id: '2', name: 'Alpha Dad', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType }),
      ];

      const sorted = sortCardsByRarityAndName(cards);

      expect(sorted[0].name).toBe('Alpha Dad');
      expect(sorted[1].name).toBe('Zulu Dad');
    });

    it('should reverse sort when reverse=true', () => {
      const cards = [
        createMockCard({ id: '1', name: 'A', rarity: 'mythic', type: 'BBQ_DICKTATOR' as DadType }),
        createMockCard({ id: '2', name: 'B', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType }),
      ];

      const sorted = sortCardsByRarityAndName(cards, true);

      expect(sorted[0].rarity).toBe('common');
      expect(sorted[1].rarity).toBe('mythic');
    });
  });

  describe('filterCardsByRarity', () => {
    it('should filter cards by specified rarity', () => {
      const filtered = filterCardsByRarity(sampleCards, 'rare');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].rarity).toBe('rare');
    });

    it('should return all cards when rarity is null', () => {
      const filtered = filterCardsByRarity(sampleCards, null);
      expect(filtered).toHaveLength(5);
    });

    it('should return empty array when no cards match', () => {
      const filtered = filterCardsByRarity(sampleCards, 'mythic');
      expect(filtered).toHaveLength(0);
    });
  });

  describe('filterCardsBySearch', () => {
    it('should filter by name', () => {
      const filtered = filterCardsBySearch(sampleCards, 'Alpha');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Alpha Dad');
    });

    it('should filter by name case-insensitively', () => {
      const filtered = filterCardsBySearch(sampleCards, 'ALPHA');
      expect(filtered).toHaveLength(1);
    });

    it('should filter by flavor text', () => {
      const cards = [
        createMockCard({ id: '1', name: 'Test', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType, flavorText: 'Grilling master' }),
      ];

      const filtered = filterCardsBySearch(cards, 'grilling');
      expect(filtered).toHaveLength(1);
    });

    it('should filter by type', () => {
      const filtered = filterCardsBySearch(sampleCards, 'BBQ');
      expect(filtered).toHaveLength(2);
    });

    it('should return all cards for empty search', () => {
      const filtered = filterCardsBySearch(sampleCards, '');
      expect(filtered).toHaveLength(5);
    });

    it('should return all cards for whitespace-only search', () => {
      const filtered = filterCardsBySearch(sampleCards, '   ');
      expect(filtered).toHaveLength(5);
    });
  });

  describe('filterCardsByHolo', () => {
    it('should filter to holo cards only when holoOnly=true', () => {
      const filtered = filterCardsByHolo(sampleCards, true);

      expect(filtered).toHaveLength(2);
      expect(filtered.every(c => c.isHolo)).toBe(true);
    });

    it('should return all cards when holoOnly=false', () => {
      const filtered = filterCardsByHolo(sampleCards, false);
      expect(filtered).toHaveLength(5);
    });
  });

  describe('filterCardsByTypes', () => {
    it('should filter by selected types', () => {
      const selectedTypes = new Set(['BBQ_DICKTATOR' as DadType]);
      const filtered = filterCardsByTypes(sampleCards, selectedTypes);

      expect(filtered).toHaveLength(2);
      expect(filtered.every(c => c.type === 'BBQ_DICKTATOR')).toBe(true);
    });

    it('should filter by multiple types', () => {
      const selectedTypes = new Set(['BBQ_DICKTATOR' as DadType, 'TECH_TWATS' as DadType]);
      const filtered = filterCardsByTypes(sampleCards, selectedTypes);

      expect(filtered).toHaveLength(3);
    });

    it('should return all cards when no types selected', () => {
      const selectedTypes = new Set<DadType>();
      const filtered = filterCardsByTypes(sampleCards, selectedTypes);
      expect(filtered).toHaveLength(5);
    });
  });

  describe('getPaginatedCards', () => {
    it('should return first page of cards', () => {
      const result = getPaginatedCards(sampleCards, 0, 2);

      expect(result.cards).toHaveLength(2);
      expect(result.hasMore).toBe(true);
      expect(result.nextPage).toBe(1);
    });

    it('should return all cards on last page', () => {
      const result = getPaginatedCards(sampleCards, 2, 2);

      expect(result.cards).toHaveLength(5); // All cards up to page 2 (6 max, but only 5 exist)
      expect(result.hasMore).toBe(false);
      expect(result.nextPage).toBeNull();
    });

    it('should handle empty array', () => {
      const result = getPaginatedCards([], 0, 10);

      expect(result.cards).toHaveLength(0);
      expect(result.hasMore).toBe(false);
      expect(result.nextPage).toBeNull();
    });
  });

  describe('calculateCollectionProgress', () => {
    it('should calculate correct percentage', () => {
      expect(calculateCollectionProgress(25, 100)).toBe(25);
      expect(calculateCollectionProgress(50, 100)).toBe(50);
      expect(calculateCollectionProgress(173, 173)).toBe(100);
    });

    it('should return 0 when total is 0', () => {
      expect(calculateCollectionProgress(0, 0)).toBe(0);
    });

    it('should round percentage', () => {
      expect(calculateCollectionProgress(1, 3)).toBe(33);
    });
  });

  describe('formatCardCount', () => {
    it('should return empty string for count of 1', () => {
      expect(formatCardCount(1)).toBe('');
    });

    it('should format count > 1 with x prefix', () => {
      expect(formatCardCount(2)).toBe('x2');
      expect(formatCardCount(5)).toBe('x5');
      expect(formatCardCount(99)).toBe('x99');
    });
  });

  describe('getCardsByRarity', () => {
    it('should count cards by rarity', () => {
      const counts = getCardsByRarity(sampleCards);

      expect(counts.common).toBe(1);
      expect(counts.uncommon).toBe(1);
      expect(counts.rare).toBe(1);
      expect(counts.epic).toBe(1);
      expect(counts.legendary).toBe(1);
      expect(counts.mythic).toBe(0);
    });
  });

  describe('sortCardsByName', () => {
    it('should sort alphabetically ascending', () => {
      const sorted = sortCardsByName(sampleCards);

      expect(sorted[0].name).toBe('Alpha Dad');
      expect(sorted[sorted.length - 1].name).toBe('Echo Dad');
    });

    it('should sort alphabetically descending when reverse=true', () => {
      const sorted = sortCardsByName(sampleCards, true);

      expect(sorted[0].name).toBe('Echo Dad');
      expect(sorted[sorted.length - 1].name).toBe('Alpha Dad');
    });
  });

  describe('getCardObtainedDates', () => {
    it('should map cards to their first obtained date', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');

      const card1 = createMockCard({ id: 'card_1', name: 'A', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType });

      const packs: Pack[] = [
        createMockPack('pack1', [card1], date1),
        createMockPack('pack2', [card1], date2), // Same card, later date
      ];

      const dates = getCardObtainedDates(packs);

      expect(dates.get('card_1')?.getTime()).toBe(date1.getTime()); // Should be first date
    });
  });

  describe('sortCardsByDateObtained', () => {
    it('should sort by date descending (newest first)', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-15');

      const card1 = createMockCard({ id: 'card_1', name: 'Old', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType });
      const card2 = createMockCard({ id: 'card_2', name: 'New', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType });

      const dates = new Map<string, Date>([
        ['card_1', date1],
        ['card_2', date2],
      ]);

      const sorted = sortCardsByDateObtained([card1, card2], dates);

      expect(sorted[0].id).toBe('card_2'); // Newest first
      expect(sorted[1].id).toBe('card_1');
    });

    it('should sort by date ascending when reverse=true', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-15');

      const card1 = createMockCard({ id: 'card_1', name: 'Old', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType });
      const card2 = createMockCard({ id: 'card_2', name: 'New', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType });

      const dates = new Map<string, Date>([
        ['card_1', date1],
        ['card_2', date2],
      ]);

      const sorted = sortCardsByDateObtained([card1, card2], dates, true);

      expect(sorted[0].id).toBe('card_1'); // Oldest first
      expect(sorted[1].id).toBe('card_2');
    });

    it('should put cards without dates last', () => {
      const card1 = createMockCard({ id: 'card_1', name: 'A', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType });
      const card2 = createMockCard({ id: 'card_2', name: 'B', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType });

      const dates = new Map<string, Date>([
        ['card_1', new Date()],
        // card_2 has no date
      ]);

      const sorted = sortCardsByDateObtained([card1, card2], dates);

      expect(sorted[0].id).toBe('card_1');
      expect(sorted[1].id).toBe('card_2');
    });
  });

  describe('sortCardsByType', () => {
    it('should sort alphabetically by type name', () => {
      const sorted = sortCardsByType(sampleCards);

      // BBQ_DICKTATOR comes before COUCH_CUMMANDER alphabetically
      expect(sorted[0].type).toBe('BBQ_DICKTATOR');
    });

    it('should sort by name as secondary sort', () => {
      const cards = [
        createMockCard({ id: '1', name: 'Zulu', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType }),
        createMockCard({ id: '2', name: 'Alpha', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType }),
      ];

      const sorted = sortCardsByType(cards);

      expect(sorted[0].name).toBe('Alpha');
      expect(sorted[1].name).toBe('Zulu');
    });
  });

  describe('sortCardsByOption', () => {
    it('should sort by rarity_desc', () => {
      const sorted = sortCardsByOption(sampleCards, 'rarity_desc');
      expect(sorted[0].rarity).toBe('legendary');
    });

    it('should sort by rarity_asc', () => {
      const sorted = sortCardsByOption(sampleCards, 'rarity_asc');
      expect(sorted[0].rarity).toBe('common');
    });

    it('should sort by name_asc', () => {
      const sorted = sortCardsByOption(sampleCards, 'name_asc');
      expect(sorted[0].name).toBe('Alpha Dad');
    });

    it('should sort by name_desc', () => {
      const sorted = sortCardsByOption(sampleCards, 'name_desc');
      expect(sorted[0].name).toBe('Echo Dad');
    });

    it('should fallback to rarity sort when date_obtained used without dates', () => {
      const sorted = sortCardsByOption(sampleCards, 'date_obtained_desc');
      expect(sorted[0].rarity).toBe('legendary'); // Falls back to rarity sort
    });

    it('should sort by type_asc', () => {
      const sorted = sortCardsByOption(sampleCards, 'type_asc');
      expect(sorted[0].type).toBe('BBQ_DICKTATOR');
    });
  });

  describe('filterCardsByStatRanges', () => {
    it('should filter cards within stat ranges', () => {
      const cards = [
        createMockCard({ id: '1', name: 'Low', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType, stats: { dadJoke: 20, grillSkill: 20, fixIt: 20, napPower: 20, remoteControl: 20, thermostat: 20, sockSandal: 20, beerSnob: 20 } }),
        createMockCard({ id: '2', name: 'High', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType, stats: { dadJoke: 80, grillSkill: 80, fixIt: 80, napPower: 80, remoteControl: 80, thermostat: 80, sockSandal: 80, beerSnob: 80 } }),
      ];

      const statRanges: StatRanges = {
        dadJoke: { min: 70, max: 100 },
      };

      const filtered = filterCardsByStatRanges(cards, statRanges);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('High');
    });

    it('should return all cards when no stat ranges specified', () => {
      const filtered = filterCardsByStatRanges(sampleCards, {});
      expect(filtered).toHaveLength(5);
    });

    it('should apply AND logic across multiple stat filters', () => {
      const cards = [
        createMockCard({ id: '1', name: 'Mixed', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType, stats: { dadJoke: 80, grillSkill: 20, fixIt: 50, napPower: 50, remoteControl: 50, thermostat: 50, sockSandal: 50, beerSnob: 50 } }),
        createMockCard({ id: '2', name: 'Both High', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType, stats: { dadJoke: 80, grillSkill: 80, fixIt: 50, napPower: 50, remoteControl: 50, thermostat: 50, sockSandal: 50, beerSnob: 50 } }),
      ];

      const statRanges: StatRanges = {
        dadJoke: { min: 70, max: 100 },
        grillSkill: { min: 70, max: 100 },
      };

      const filtered = filterCardsByStatRanges(cards, statRanges);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Both High');
    });
  });

  describe('filterCardsByHoloVariants', () => {
    it('should filter by holo variants', () => {
      const holoVariants = new Set(['standard' as HoloVariant]);
      const filtered = filterCardsByHoloVariants(sampleCards, holoVariants);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].holoType).toBe('standard');
    });

    it('should filter by multiple variants', () => {
      const holoVariants = new Set(['standard' as HoloVariant, 'full_art' as HoloVariant]);
      const filtered = filterCardsByHoloVariants(sampleCards, holoVariants);

      expect(filtered).toHaveLength(2);
    });

    it('should return all cards when no variants selected', () => {
      const holoVariants = new Set<HoloVariant>();
      const filtered = filterCardsByHoloVariants(sampleCards, holoVariants);
      expect(filtered).toHaveLength(5);
    });
  });

  describe('filterCardsByAdvancedSearch', () => {
    it('should apply all filters with AND logic', () => {
      const filters: AdvancedSearchFilters = {
        searchTerm: 'Dad',
        rarity: 'rare',
        holoVariants: new Set(['standard' as HoloVariant]),
        selectedTypes: new Set(['FIX_IT_FUCKBOY' as DadType]),
        statRanges: {},
      };

      const filtered = filterCardsByAdvancedSearch(sampleCards, filters);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('card_2');
    });
  });

  describe('getDefaultStatRanges', () => {
    it('should return all stats with 0-100 ranges', () => {
      const defaults = getDefaultStatRanges();

      expect(defaults.dadJoke).toEqual({ min: 0, max: 100 });
      expect(defaults.grillSkill).toEqual({ min: 0, max: 100 });
      expect(defaults.fixIt).toEqual({ min: 0, max: 100 });
    });
  });

  describe('areStatRangesDefault', () => {
    it('should return true for default ranges', () => {
      const defaults = getDefaultStatRanges();
      expect(areStatRangesDefault(defaults)).toBe(true);
    });

    it('should return false for modified ranges', () => {
      const modified: StatRanges = {
        dadJoke: { min: 50, max: 100 },
        grillSkill: { min: 0, max: 100 },
        fixIt: { min: 0, max: 100 },
        napPower: { min: 0, max: 100 },
        remoteControl: { min: 0, max: 100 },
        thermostat: { min: 0, max: 100 },
        sockSandal: { min: 0, max: 100 },
        beerSnob: { min: 0, max: 100 },
      };
      expect(areStatRangesDefault(modified)).toBe(false);
    });
  });

  describe('Wishlist Utilities', () => {
    describe('findPulledWishlistedCards', () => {
      it('should find wishlisted cards in pulled cards', () => {
        const pulledCards = ['card_1', 'card_2', 'card_3'];
        const wishlistEntries = [
          { cardId: 'card_2', priority: 'high' },
          { cardId: 'card_5', priority: 'low' },
        ];

        const found = findPulledWishlistedCards(pulledCards, wishlistEntries);

        expect(found).toHaveLength(1);
        expect(found[0]).toBe('card_2');
      });

      it('should return empty array when no matches', () => {
        const pulledCards = ['card_1', 'card_2'];
        const wishlistEntries = [{ cardId: 'card_99', priority: 'high' }];

        const found = findPulledWishlistedCards(pulledCards, wishlistEntries);
        expect(found).toHaveLength(0);
      });
    });

    describe('formatWishlistPriority', () => {
      it('should format urgent priority', () => {
        expect(formatWishlistPriority('urgent')).toBe('🔥 Urgent');
      });

      it('should format high priority', () => {
        expect(formatWishlistPriority('high')).toBe('⭐ High');
      });

      it('should format medium priority', () => {
        expect(formatWishlistPriority('medium')).toBe('📍 Medium');
      });

      it('should format low priority', () => {
        expect(formatWishlistPriority('low')).toBe('💤 Low');
      });

      it('should return raw value for unknown priority', () => {
        expect(formatWishlistPriority('unknown')).toBe('unknown');
      });
    });

    describe('getPriorityColor', () => {
      it('should return red for urgent', () => {
        expect(getPriorityColor('urgent')).toBe('#ef4444');
      });

      it('should return orange for high', () => {
        expect(getPriorityColor('high')).toBe('#f59e0b');
      });

      it('should return default gray for unknown', () => {
        expect(getPriorityColor('unknown')).toBe('#9ca3af');
      });
    });
  });

  describe('Collection Value Calculator', () => {
    describe('calculateCardValue', () => {
      it('should calculate base value for common', () => {
        const card = createMockCard({ id: '1', name: 'Test', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType });
        expect(calculateCardValue(card)).toBe(1);
      });

      it('should calculate base value for uncommon', () => {
        const card = createMockCard({ id: '1', name: 'Test', rarity: 'uncommon', type: 'BBQ_DICKTATOR' as DadType });
        expect(calculateCardValue(card)).toBe(5);
      });

      it('should calculate base value for rare', () => {
        const card = createMockCard({ id: '1', name: 'Test', rarity: 'rare', type: 'BBQ_DICKTATOR' as DadType });
        expect(calculateCardValue(card)).toBe(25);
      });

      it('should calculate base value for epic', () => {
        const card = createMockCard({ id: '1', name: 'Test', rarity: 'epic', type: 'BBQ_DICKTATOR' as DadType });
        expect(calculateCardValue(card)).toBe(100);
      });

      it('should calculate base value for legendary', () => {
        const card = createMockCard({ id: '1', name: 'Test', rarity: 'legendary', type: 'BBQ_DICKTATOR' as DadType });
        expect(calculateCardValue(card)).toBe(500);
      });

      it('should calculate base value for mythic', () => {
        const card = createMockCard({ id: '1', name: 'Test', rarity: 'mythic', type: 'BBQ_DICKTATOR' as DadType });
        expect(calculateCardValue(card)).toBe(5000);
      });

      it('should apply holo bonus (50% increase)', () => {
        const card = createMockCard({ id: '1', name: 'Test', rarity: 'rare', type: 'BBQ_DICKTATOR' as DadType, isHolo: true });
        expect(calculateCardValue(card)).toBe(38); // 25 * 1.5 = 37.5, rounded to 38
      });

      it('should apply upgrade bonus (10% per level)', () => {
        const card = createMockCard({ id: '1', name: 'Test', rarity: 'rare', type: 'BBQ_DICKTATOR' as DadType });
        expect(calculateCardValue(card, 2)).toBe(30); // 25 * 1.2 = 30
      });
    });

    describe('calculateCollectionValue', () => {
      it('should sum values of all cards', () => {
        const cards = [
          createMockCard({ id: '1', name: 'Test', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType, duplicateCount: 3 }),
          createMockCard({ id: '2', name: 'Test', rarity: 'rare', type: 'BBQ_DICKTATOR' as DadType, duplicateCount: 1 }),
        ];

        const value = calculateCollectionValue(cards);
        expect(value).toBe(3 + 25); // 3 commons + 1 rare
      });

      it('should multiply by duplicate count', () => {
        const cards = [
          createMockCard({ id: '1', name: 'Test', rarity: 'rare', type: 'BBQ_DICKTATOR' as DadType, duplicateCount: 4 }),
        ];

        const value = calculateCollectionValue(cards);
        expect(value).toBe(100); // 25 * 4
      });
    });

    describe('formatCollectionValue', () => {
      it('should format with thousands separator', () => {
        expect(formatCollectionValue(12450)).toBe('12,450 points');
        expect(formatCollectionValue(1000000)).toBe('1,000,000 points');
      });

      it('should handle small values', () => {
        expect(formatCollectionValue(50)).toBe('50 points');
      });
    });

    describe('getValueBreakdownByRarity', () => {
      it('should break down value by rarity', () => {
        const cards = [
          createMockCard({ id: '1', name: 'Test', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType, duplicateCount: 5 }),
          createMockCard({ id: '2', name: 'Test', rarity: 'rare', type: 'BBQ_DICKTATOR' as DadType, duplicateCount: 2 }),
        ];

        const breakdown = getValueBreakdownByRarity(cards);

        expect(breakdown.common).toBe(5); // 5 * 1
        expect(breakdown.rare).toBe(50); // 2 * 25
        expect(breakdown.uncommon).toBe(0);
      });
    });
  });
});
