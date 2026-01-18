import type { Card, Rarity } from '../../types';
import cardsData from '../../data/cards.json';
import seasonalCardsData from '../../data/seasonal-cards.json';

// Type assertion for imported JSON
const baseCards: Card[] = cardsData.cards as Card[];
const seasonalCards: Card[] = seasonalCardsData.cards as Card[];

// Merge base cards and seasonal cards
const cards: Card[] = [...baseCards, ...seasonalCards];


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
