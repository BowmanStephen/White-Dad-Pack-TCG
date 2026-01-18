import type { Card, Rarity } from '../../types';
import cardsData from '../../data/cards.json';
import { validateCards, logValidationResults } from '../validation';

// Type assertion for imported JSON
const cards: Card[] = cardsData.cards as Card[];

// ============================================================================
// DATA VALIDATION (MP-006: Database validation checks)
// ============================================================================

/**
 * Validate card database on load
 * Logs warnings for missing required fields
 */
const cardValidation = validateCards(cardsData.cards);
logValidationResults(cardValidation, 'cards');

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
