/**
 * Unit tests for deck import/export functionality
 *
 * Tests for import-export.ts and sharing.ts modules
 */

import { describe, it, expect, vi } from 'vitest';
import {
  exportDeckToJSON,
  exportDeckToText,
  importDeckFromJSON,
  importDeckFromText,
  encodeDeckForURL,
  decodeDeckFromURL,
  isValidDeckJSON,
} from '@/lib/deck/import-export';
import {
  exportDeckToCode,
  importDeckFromCode,
  validateDeckCardsInCollection,
  generateDeckShareUrl,
} from '@/lib/deck/sharing';
import type { Deck, Card } from '@/types';

// Mock card database
const mockCards: Card[] = [
  {
    id: 'bbq_dad_001',
    name: 'Grillmaster Gary',
    subtitle: 'The Flame Keeper',
    type: 'BBQ_DICKTATOR',
    rarity: 'rare',
    artwork: '/images/cards/bbq-dad-001.png',
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
    flavorText: 'Propane is just a suggestion.',
    abilities: [],
    series: 1,
    cardNumber: 1,
    totalInSeries: 50,
    artist: 'AI Assistant',
    holoVariant: 'none',
  },
  {
    id: 'fixit_dad_001',
    name: 'Handy Hank',
    subtitle: 'Can Fix Anything',
    type: 'FIX_IT_FUCKBOY',
    rarity: 'uncommon',
    artwork: '/images/cards/fixit-dad-001.png',
    stats: {
      dadJoke: 60,
      grillSkill: 45,
      fixIt: 90,
      napPower: 50,
      remoteControl: 55,
      thermostat: 65,
      sockSandal: 40,
      beerSnob: 55,
    },
    flavorText: 'Duct tape solves everything.',
    abilities: [],
    series: 1,
    cardNumber: 2,
    totalInSeries: 50,
    artist: 'AI Assistant',
    holoVariant: 'none',
  },
  {
    id: 'golf_dad_001',
    name: 'Fairway Phil',
    subtitle: 'Par Excellence',
    type: 'GOLF_GONAD',
    rarity: 'common',
    artwork: '/images/cards/golf-dad-001.png',
    stats: {
      dadJoke: 70,
      grillSkill: 40,
      fixIt: 35,
      napPower: 60,
      remoteControl: 45,
      thermostat: 50,
      sockSandal: 70,
      beerSnob: 65,
    },
    flavorText: 'Fore!',
    abilities: [],
    series: 1,
    cardNumber: 3,
    totalInSeries: 50,
    artist: 'AI Assistant',
    holoVariant: 'none',
  },
];

// Mock deck
const createMockDeck = (): Deck => ({
  id: 'deck-001',
  name: 'Test Deck',
  description: 'A test deck for unit tests',
  cards: [
    {
      cardId: 'bbq_dad_001',
      card: mockCards[0],
      count: 2,
    },
    {
      cardId: 'fixit_dad_001',
      card: mockCards[1],
      count: 3,
    },
    {
      cardId: 'golf_dad_001',
      card: mockCards[2],
      count: 1,
    },
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  stats: {
    totalCards: 6,
    uniqueCards: 3,
    rarityBreakdown: {
      common: 1,
      uncommon: 3,
      rare: 2,
      epic: 0,
      legendary: 0,
      mythic: 0,
    },
    statTotal: {
      dadJoke: 400,
      grillSkill: 335,
      fixIt: 380,
      napPower: 310,
      remoteControl: 345,
      thermostat: 385,
      sockSandal: 325,
      beerSnob: 395,
    },
    typeBreakdown: {
      BBQ_DICKTATOR: 2,
      FIX_IT_FUCKBOY: 3,
      GOLF_GONAD: 1,
      COUCH_CUMMANDER: 0,
      LAWN_LUNATIC: 0,
      CAR_COCK: 0,
      OFFICE_ORGASMS: 0,
      COOL_CUCKS: 0,
      COACH_CUMSTERS: 0,
      CHEF_CUMSTERS: 0,
      HOLIDAY_HORNDOGS: 0,
      WAREHOUSE_WANKERS: 0,
      VINTAGE_VAGABONDS: 0,
      FASHION_FUCK: 0,
      TECH_TWATS: 0,
    },
    averageStats: {
      dadJoke: 67,
      grillSkill: 56,
      fixIt: 63,
      napPower: 52,
      remoteControl: 58,
      thermostat: 64,
      sockSandal: 54,
      beerSnob: 66,
    },
  },
});

// Mock getAllCards
vi.mock('@/lib/cards/database', () => ({
  getAllCards: () => mockCards,
}));

describe('Deck Export - JSON Format', () => {
  it('should export deck to valid JSON', () => {
    const deck = createMockDeck();
    const json = exportDeckToJSON(deck);

    expect(json).toBeTruthy();
    expect(typeof json).toBe('string');

    const parsed = JSON.parse(json);
    expect(parsed.name).toBe('Test Deck');
    expect(parsed.description).toBe('A test deck for unit tests');
    expect(parsed.cards).toHaveLength(3);
  });

  it('should include all card data in export', () => {
    const deck = createMockDeck();
    const json = exportDeckToJSON(deck);
    const parsed = JSON.parse(json);

    expect(parsed.cards[0]).toEqual({
      cardId: 'bbq_dad_001',
      cardName: 'Grillmaster Gary',
      count: 2,
    });
  });

  it('should handle deck without description', () => {
    const deck = createMockDeck();
    deck.description = undefined;

    const json = exportDeckToJSON(deck);
    const parsed = JSON.parse(json);

    expect(parsed.description).toBeUndefined();
  });
});

describe('Deck Export - Text Format', () => {
  it('should export deck to human-readable text', () => {
    const deck = createMockDeck();
    const text = exportDeckToText(deck);

    expect(text).toBeTruthy();
    expect(typeof text).toBe('string');
    expect(text).toContain('Test Deck');
    expect(text).toContain('Total Cards: 6');
  });

  it('should format cards with count and rarity', () => {
    const deck = createMockDeck();
    const text = exportDeckToText(deck);

    expect(text).toContain('2x Grillmaster Gary (rare)');
    expect(text).toContain('3x Handy Hank (uncommon)');
    expect(text).toContain('1x Fairway Phil (common)');
  });

  it('should sort cards by rarity', () => {
    const deck = createMockDeck();
    const text = exportDeckToText(deck);

    const rareIndex = text.indexOf('Grillmaster Gary');
    const uncommonIndex = text.indexOf('Handy Hank');
    const commonIndex = text.indexOf('Fairway Phil');

    // Rare should come before uncommon, which comes before common
    expect(rareIndex).toBeLessThan(uncommonIndex);
    expect(uncommonIndex).toBeLessThan(commonIndex);
  });
});

describe('Deck Import - JSON Format', () => {
  it('should import deck from valid JSON', () => {
    const deck = createMockDeck();
    const json = exportDeckToJSON(deck);

    const imported = importDeckFromJSON(json);

    expect(imported).toBeTruthy();
    expect(imported.name).toBe('Test Deck');
    expect(imported.cards).toHaveLength(3);
  });

  it('should reject invalid JSON', () => {
    expect(() => importDeckFromJSON('invalid json')).toThrow('Invalid JSON format');
  });

  it('should reject JSON without name', () => {
    const invalidJson = JSON.stringify({
      description: 'No name',
      cards: [],
    });

    expect(() => importDeckFromJSON(invalidJson)).toThrow('Deck name is required');
  });

  it('should reject JSON without cards array', () => {
    const invalidJson = JSON.stringify({
      name: 'Test',
      cards: 'not an array',
    });

    expect(() => importDeckFromJSON(invalidJson)).toThrow('Deck must contain a cards array');
  });

  it('should reject unknown cards', () => {
    const jsonWithUnknownCard = JSON.stringify({
      name: 'Test Deck',
      cards: [
        {
          cardId: 'unknown_card',
          cardName: 'Unknown Card',
          count: 1,
        },
      ],
    });

    expect(() => importDeckFromJSON(jsonWithUnknownCard)).toThrow('not available');
  });

  it('should validate ownership when userCards provided', () => {
    const deck = createMockDeck();
    const json = exportDeckToJSON(deck);

    // User only owns some cards
    const userCards = ['bbq_dad_001'];

    const imported = importDeckFromJSON(json, userCards);

    // Should import only owned cards
    expect(imported.cards).toHaveLength(1);
    expect(imported.cards[0].cardId).toBe('bbq_dad_001');
  });
});

describe('Deck Import - Text Format', () => {
  it('should import deck from text format', () => {
    const text = `=== Test Deck ===
Total Cards: 3
Created: 1/1/2024
--- Cards ---
2x Grillmaster Gary (rare)
1x Handy Hank (uncommon)`;

    const imported = importDeckFromText(text);

    expect(imported).toBeTruthy();
    expect(imported.name).toBe('Imported Deck');
    expect(imported.cards).toHaveLength(2);
  });

  it('should parse card count correctly', () => {
    const text = '3x Grillmaster Gary (rare)';

    const imported = importDeckFromText(text);

    expect(imported.cards[0].count).toBe(3);
  });

  it('should handle cards without rarity', () => {
    const text = '2x Grillmaster Gary';

    const imported = importDeckFromText(text);

    expect(imported.cards).toHaveLength(1);
    expect(imported.cards[0].card.name).toBe('Grillmaster Gary');
  });

  it('should skip comments and empty lines', () => {
    const text = `# This is a comment

3x Grillmaster Gary (rare)

# Another comment
2x Handy Hank (uncommon)`;

    const imported = importDeckFromText(text);

    expect(imported.cards).toHaveLength(2);
  });

  it('should reject text with no valid cards', () => {
    const text = '=== Some Header ===\nNo cards here';

    expect(() => importDeckFromText(text)).toThrow('No valid cards found');
  });

  it('should validate ownership when userCards provided', () => {
    const text = '2x Grillmaster Gary (rare)\n1x Handy Hank (uncommon)';
    const userCards = ['bbq_dad_001'];

    const imported = importDeckFromText(text, userCards);

    expect(imported.cards).toHaveLength(1);
    expect(imported.cards[0].cardId).toBe('bbq_dad_001');
  });
});

describe('Deck URL Encoding/Decoding', () => {
  it('should encode deck for URL', () => {
    const deck = createMockDeck();
    const encoded = encodeDeckForURL(deck);

    expect(encoded).toBeTruthy();
    expect(typeof encoded).toBe('string');
    // Should be base64-like (only URL-safe characters)
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('should decode deck from URL', () => {
    const deck = createMockDeck();
    const encoded = encodeDeckForURL(deck);

    const decoded = decodeDeckFromURL(encoded);

    expect(decoded).toBeTruthy();
    expect(decoded.name).toBe(deck.name);
    expect(decoded.cards).toHaveLength(deck.cards.length);
  });

  it('should handle truncated names in URL encoding', () => {
    const deck = createMockDeck();
    deck.name = 'A'.repeat(100); // Very long name

    const encoded = encodeDeckForURL(deck);
    const decoded = decodeDeckFromURL(encoded);

    expect(decoded.name.length).toBeLessThanOrEqual(50);
  });

  it('should reject invalid URL encoding', () => {
    expect(() => decodeDeckFromURL('invalid!@#$%')).toThrow('Invalid deck URL format');
  });

  it('should validate ownership when decoding', () => {
    const deck = createMockDeck();
    const encoded = encodeDeckForURL(deck);
    const userCards = ['bbq_dad_001'];

    const decoded = decodeDeckFromURL(encoded, userCards);

    expect(decoded.cards).toHaveLength(1);
    expect(decoded.cards[0].cardId).toBe('bbq_dad_001');
  });
});

describe('JSON Validation', () => {
  it('should validate correct JSON', () => {
    const validJson = JSON.stringify({
      name: 'Test',
      cards: [],
    });

    expect(isValidDeckJSON(validJson)).toBe(true);
  });

  it('should reject invalid JSON', () => {
    expect(isValidDeckJSON('not json')).toBe(false);
  });

  it('should reject JSON without name', () => {
    const invalidJson = JSON.stringify({
      description: 'Test',
      cards: [],
    });

    expect(isValidDeckJSON(invalidJson)).toBe(false);
  });

  it('should reject JSON without cards array', () => {
    const invalidJson = JSON.stringify({
      name: 'Test',
      cards: 'not an array',
    });

    expect(isValidDeckJSON(invalidJson)).toBe(false);
  });
});

describe('Deck Sharing - Code Format', () => {
  it('should export deck to code format', () => {
    const deck = createMockDeck();
    const code = exportDeckToCode(deck);

    expect(code).toBeTruthy();
    expect(code.startsWith('DadDeckv1|')).toBe(true);
  });

  it('should import deck from code format', () => {
    const deck = createMockDeck();
    const code = exportDeckToCode(deck);

    const result = importDeckFromCode(code);

    expect(result.success).toBe(true);
    expect(result.deck).toBeTruthy();
    expect(result.deck?.name).toBe('Test Deck');
  });

  it('should reject invalid code format', () => {
    const result = importDeckFromCode('invalid_code');

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should reject code without version prefix', () => {
    const result = importDeckFromCode('NoVersion|some_data');

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Invalid deck code format. Must start with "DadDeck"');
  });
});

describe('Deck Sharing - URL Generation', () => {
  it('should generate shareable URL', () => {
    const deck = createMockDeck();
    const url = generateDeckShareUrl(deck);

    expect(url).toBeTruthy();
    expect(url).toContain('DadDeckv1|');
  });

  it('should use custom base URL', () => {
    const deck = createMockDeck();
    const url = generateDeckShareUrl(deck, 'https://custom.com');

    expect(url.startsWith('https://custom.com')).toBe(true);
  });
});

describe('Deck Sharing - Collection Validation', () => {
  it('should validate all cards in collection', () => {
    const deck = createMockDeck();
    const code = exportDeckToCode(deck);
    const userCollection = new Set(['bbq_dad_001', 'fixit_dad_001', 'golf_dad_001']);

    const validation = validateDeckCardsInCollection(code, userCollection);

    expect(validation.canBuild).toBe(true);
    expect(validation.missingCards).toHaveLength(0);
  });

  it('should detect missing cards', () => {
    const deck = createMockDeck();
    const code = exportDeckToCode(deck);
    const userCollection = new Set(['bbq_dad_001']); // Missing other cards

    const validation = validateDeckCardsInCollection(code, userCollection);

    expect(validation.canBuild).toBe(false);
    expect(validation.missingCards.length).toBeGreaterThan(0);
  });

  it('should report total and owned card counts', () => {
    const deck = createMockDeck();
    const code = exportDeckToCode(deck);
    const userCollection = new Set(['bbq_dad_001', 'fixit_dad_001']);

    const validation = validateDeckCardsInCollection(code, userCollection);

    expect(validation.totalCards).toBe(6);
    expect(validation.ownedCards).toBe(5);
  });
});

describe('Deck Sharing - Import with Missing Cards', () => {
  it('should import deck with unknown cards as warnings', () => {
    // Create export with an unknown card
    const exportData = {
      name: 'Test Deck',
      description: 'Test',
      cards: [
        { cardId: 'bbq_dad_001', count: 2 },
        { cardId: 'unknown_card_xyz', count: 1 }, // Unknown card
      ],
    };

    const json = JSON.stringify(exportData);
    const base64 = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const code = `DadDeckv1|${base64}`;

    const result = importDeckFromCode(code);

    // Should still succeed but with warnings about unknown card
    expect(result.success).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.includes('not found in database'))).toBe(true);
  });
});
