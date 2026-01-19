import type { Card, Rarity } from '../../types';
import cardsData from '../../data/cards.json';
import seasonalCardsData from '../../data/seasonal-cards.json';
import newCardsData from '../../data/cards-new.json';

// Type assertion for imported JSON
const baseCards: Card[] = cardsData.cards as Card[];
const seasonalCards: Card[] = seasonalCardsData.cards as Card[];
const newCards: Card[] = newCardsData.cards as Card[];

// Merge base cards, seasonal cards, and new cards
const cards: Card[] = [...baseCards, ...seasonalCards, ...newCards];


/**
 * Get all cards from the database
 */
export function getAllCards(): Card[] {
  return cards;
}

/**
 * Get a card by its ID
 */
export function getCardById(id: string): Card | undefined {
  return cards.find((card) => card.id === id);
}

/**
 * Get all cards of a specific rarity
 */
export function getCardsByRarity(rarity: Rarity): Card[] {
  return cards.filter((card) => card.rarity === rarity);
}

/**
 * Get a random card of a specific rarity
 */
export function getRandomCardByRarity(rarity: Rarity): Card | undefined {
  const rarityCards = getCardsByRarity(rarity);
  if (rarityCards.length === 0) return undefined;
  
  const randomIndex = Math.floor(Math.random() * rarityCards.length);
  return rarityCards[randomIndex];
}

/**
 * Get cards by type
 */
export function getCardsByType(type: string): Card[] {
  return cards.filter((card) => card.type === type);
}

/**
 * Get cards by both rarity and type (for theme packs - PACK-001)
 */
export function getCardsByRarityAndType(rarity: Rarity, type: string): Card[] {
  return cards.filter((card) => card.rarity === rarity && card.type === type);
}

/**
 * Get total card count
 */
export function getCardCount(): number {
  return cards.length;
}

/**
 * Get card count by rarity
 */
export function getCardCountByRarity(): Record<Rarity, number> {
  const counts: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };
  
  for (const card of cards) {
    counts[card.rarity]++;
  }
  
  return counts;
}

/**
 * Search cards by name (case-insensitive)
 */
export function searchCardsByName(query: string): Card[] {
  const lowerQuery = query.toLowerCase();
  return cards.filter((card) =>
    card.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get only seasonal cards (seasonId > 1)
 */
export function getSeasonalCards(): Card[] {
  return cards.filter((card) => card.seasonId && card.seasonId > 1);
}

/**
 * Get only base cards (seasonId = 1 or undefined)
 */
export function getBaseCards(): Card[] {
  return cards.filter((card) => !card.seasonId || card.seasonId === 1);
}

/**
 * Get cards by season
 */
export function getCardsBySeason(seasonId: number): Card[] {
  return cards.filter((card) => card.seasonId === seasonId);
}

/**
 * Get Father's Day seasonal cards
 */
export function getFathersDayCards(): Card[] {
  return seasonalCards.filter((card) => card.id.startsWith('fd_'));
}

/**
 * Get Summer seasonal cards
 */
export function getSummerCards(): Card[] {
  return seasonalCards.filter((card) => card.id.startsWith('summer_'));
}

/**
 * Get Holiday seasonal cards
 */
export function getHolidayCards(): Card[] {
  return seasonalCards.filter((card) => card.id.startsWith('holiday_'));
}

/**
 * PACK-005: Get card distribution by dad type
 * Returns a map of dad type -> card count
 */
export function getTypeDistribution(): Record<string, number> {
  const distribution: Record<string, number> = {};

  for (const card of cards) {
    distribution[card.type] = (distribution[card.type] || 0) + 1;
  }

  return distribution;
}

/**
 * PACK-005: Verify type distribution meets acceptance criteria
 * Returns detailed report of type distribution analysis
 */
export function verifyTypeDistribution(): {
  valid: boolean;
  report: TypeDistributionReport;
} {
  const distribution = getTypeDistribution();
  const entries = Object.entries(distribution).sort((a, b) => b[1] - a[1]);

  const totalCards = cards.length;
  const uniqueTypes = entries.length;
  const averageCardsPerType = totalCards / uniqueTypes;

  const minCards = 5;
  const targetAverage = 6.5;

  // Find types below minimum
  const belowMinimum = entries.filter(([_, count]) => count < minCards);

  // Find outliers (more than ±2 from target average)
  const aboveTarget = entries.filter(([_, count]) => count > targetAverage + 2);
  const belowTarget = entries.filter(([_, count]) => count < targetAverage - 2);

  // Check for core dad types (using internal X-rated names from core.ts)
  const coreDadTypes: string[] = [
    'BBQ_DICKTATOR', 'FIX_IT_FUCKBOY', 'GOLF_GONAD', 'COUCH_CUMMANDER', 'LAWN_LUNATIC',
    'CAR_COCK', 'OFFICE_ORGASMS', 'COOL_CUCKS', 'COACH_CUMSTERS', 'CHEF_CUMSTERS',
    'HOLIDAY_HORNDOGS', 'WAREHOUSE_WANKERS', 'VINTAGE_VAGABONDS', 'FASHION_FUCK',
    'TECH_TWATS'
  ];
  const missingCoreTypes = coreDadTypes.filter(type => !distribution[type]);

  // All checks must pass
  const allChecksPass =
    belowMinimum.length === 0 &&
    (aboveTarget.length + belowTarget.length) < uniqueTypes / 2 &&
    missingCoreTypes.length === 0;

  return {
    valid: allChecksPass,
    report: {
      totalCards,
      uniqueTypes,
      averageCardsPerType: Math.round(averageCardsPerType * 10) / 10,
      distribution,
      sortedEntries: entries,
      belowMinimum,
      aboveTarget,
      belowTarget,
      missingCoreTypes,
      checks: {
        minimumCardsPerType: belowMinimum.length === 0,
        balancedDistribution: (aboveTarget.length + belowTarget.length) < uniqueTypes / 2,
        allCoreTypesPresent: missingCoreTypes.length === 0,
      },
    },
  };
}

/**
 * PACK-005: Type distribution report interface
 */
export interface TypeDistributionReport {
  totalCards: number;
  uniqueTypes: number;
  averageCardsPerType: number;
  distribution: Record<string, number>;
  sortedEntries: [string, number][];
  belowMinimum: [string, number][];
  aboveTarget: [string, number][];
  belowTarget: [string, number][];
  missingCoreTypes: string[];
  checks: {
    minimumCardsPerType: boolean;
    balancedDistribution: boolean;
    allCoreTypesPresent: boolean;
  };
}
