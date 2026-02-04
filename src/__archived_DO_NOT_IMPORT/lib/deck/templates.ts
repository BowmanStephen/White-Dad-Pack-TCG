/**
 * Community deck templates
 *
 * Pre-built deck lists that players can import and use as starting points.
 */

import type { Deck } from '@/types';
import { getAllCards } from '@/lib/cards/database';
import { calculateDeckStats } from './utils';

/**
 * Community deck template
 */
export interface DeckTemplate {
  id: string;
  name: string;
  description: string;
  strategy: string;
  cards: Array<{
    cardId: string;
    count: number;
  }>;
}

/**
 * All community deck templates
 */
export const COMMUNITY_DECKS: DeckTemplate[] = [
  {
    id: 'starter-bbq',
    name: 'BBQ Bonanza',
    description: 'A deck focused on grill skill and flame mechanics',
    strategy:
      'Maximize grill skill stats and use BBQ_DAD type synergies. Great for beginners!',
    cards: [],
  },
  {
    id: 'starter-fixit',
    name: 'Fix-It Federation',
    description: 'A defensive deck with high fix-it stats and repair abilities',
    strategy:
      'Focus on survivability with high fix-it and nap power stats. Outlast your opponents.',
    cards: [],
  },
  {
    id: 'starter-golf',
    name: 'Golf Guru Gang',
    description: 'A balanced deck with golf-themed cards and precision stats',
    strategy:
      'Balanced offense and defense with golf type advantages. Control the pace of battle.',
    cards: [],
  },
  {
    id: 'aggro-couch',
    name: 'Couch Potato Rush',
    description: 'An aggressive deck focused on quick battles and high damage',
    strategy:
      'High dad joke and remote control stats for quick victories. overwhelm opponents fast.',
    cards: [],
  },
  {
    id: 'control-thermostat',
    name: 'Thermostat Tyrants',
    description: 'A control deck that manipulates the battlefield',
    strategy:
      'Use thermostat and sock sandal stats to control battle conditions. Win through attrition.',
    cards: [],
  },
];

/**
 * Auto-populate deck templates with actual cards from the database
 * This runs on first load to fill in the card arrays
 */
export function initializeDeckTemplates(): void {
  const allCards = getAllCards();

  // Helper to find cards by type and rarity
  const findCards = (type: string, rarity: string, maxCount: number = 3) => {
    return allCards
      .filter(c => c.type === type && c.rarity === rarity)
      .slice(0, maxCount)
      .map(c => ({ cardId: c.id, count: 1 }));
  };

  // Helper to find cards by name
  const findCard = (name: string) => {
    const card = allCards.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
    return card ? { cardId: card.id, count: 1 } : null;
  };

  // Populate BBQ Bonanza
  COMMUNITY_DECKS[0].cards = [
    ...findCards('BBQ_DAD', 'rare', 3),
    ...findCards('BBQ_DAD', 'uncommon', 4),
    ...findCards('BBQ_DAD', 'common', 5),
    findCard('Grill') || { cardId: allCards[0]?.id, count: 1 },
    findCard('Flame') || { cardId: allCards[1]?.id, count: 1 },
  ].filter(c => c.cardId);

  // Populate Fix-It Federation
  COMMUNITY_DECKS[1].cards = [
    ...findCards('FIX_IT_DAD', 'rare', 3),
    ...findCards('FIX_IT_DAD', 'uncommon', 4),
    ...findCards('FIX_IT_DAD', 'common', 5),
    findCard('Tool') || { cardId: allCards[2]?.id, count: 1 },
    findCard('Repair') || { cardId: allCards[3]?.id, count: 1 },
  ].filter(c => c.cardId);

  // Populate Golf Guru Gang
  COMMUNITY_DECKS[2].cards = [
    ...findCards('GOLF_DAD', 'rare', 3),
    ...findCards('GOLF_DAD', 'uncommon', 4),
    ...findCards('GOLF_DAD', 'common', 5),
    findCard('Putter') || { cardId: allCards[4]?.id, count: 1 },
    findCard('Fairway') || { cardId: allCards[5]?.id, count: 1 },
  ].filter(c => c.cardId);

  // Populate Couch Potato Rush
  COMMUNITY_DECKS[3].cards = [
    ...findCards('COUCH_DAD', 'rare', 3),
    ...findCards('COUCH_DAD', 'uncommon', 4),
    ...findCards('COUCH_DAD', 'common', 5),
    findCard('Remote') || { cardId: allCards[6]?.id, count: 1 },
    findCard('Snack') || { cardId: allCards[7]?.id, count: 1 },
  ].filter(c => c.cardId);

  // Populate Thermostat Tyrants
  COMMUNITY_DECKS[4].cards = [
    ...findCards('OFFICE_DAD', 'rare', 3),
    ...findCards('OFFICE_DAD', 'uncommon', 4),
    ...findCards('OFFICE_DAD', 'common', 5),
    findCard('Thermostat') || { cardId: allCards[8]?.id, count: 1 },
    findCard('HVAC') || { cardId: allCards[9]?.id, count: 1 },
  ].filter(c => c.cardId);
}

/**
 * Convert a deck template to a full deck
 *
 * @param template - The deck template to convert
 * @returns A complete deck object
 */
export function templateToDeck(template: DeckTemplate): Deck {
  const allCards = getAllCards();
  const cardMap = new Map(allCards.map(c => [c.id, c]));

  const deckCards = template.cards
    .map(tc => {
      const card = cardMap.get(tc.cardId);
      if (!card) {
        console.warn(`Template card ${tc.cardId} not found`);
        return null;
      }
      return {
        cardId: card.id,
        card,
        count: tc.count,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  const now = new Date();
  return {
    id: crypto.randomUUID(),
    name: template.name,
    description: template.description,
    cards: deckCards,
    createdAt: now,
    updatedAt: now,
    stats: calculateDeckStats(deckCards),
  };
}

/**
 * Get all community decks as full deck objects
 *
 * @returns Array of deck objects ready to use
 */
export function getAllCommunityDecks(): Deck[] {
  // Initialize templates with actual cards
  initializeDeckTemplates();

  return COMMUNITY_DECKS.map(template => templateToDeck(template));
}

/**
 * Get a community deck by ID
 *
 * @param id - The template ID
 * @returns The deck or null if not found
 */
export function getCommunityDeck(id: string): Deck | null {
  // Initialize templates with actual cards
  initializeDeckTemplates();

  const template = COMMUNITY_DECKS.find(t => t.id === id);
  if (!template) return null;

  return templateToDeck(template);
}
