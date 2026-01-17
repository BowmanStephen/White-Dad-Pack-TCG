/**
 * Event-Specific Cards Data (US099 - Live Events)
 *
 * Contains cards that are exclusive to specific events.
 * These cards have increased drop rates during their event.
 */

import type { Card } from '../types';

// Event card IDs - cards that can only be pulled during specific events
export const EVENT_CARD_IDS: Record<string, string[]> = {
  // Mythic Weekend event cards
  weekend_mythic_jan_2026: [
    'event_weekend_mythic_dad_001',
    'event_weekend_mythic_dad_002',
    'event_weekend_rare_dad_001',
  ],
  // Holiday event cards
  holiday_christmas_2025: [
    'event_holiday_santa_dad',
    'event_holiday_reindeer_dad',
  ],
  // Summer BBQ event cards
  summer_bbq_2025: [
    'event_bbq_grillmaster_dad',
    'event_bbq_flame_keeper',
  ],
};

// Event card definitions
export const EVENT_CARDS: Card[] = [
  // Mythic Weekend Event Cards
  {
    id: 'event_weekend_mythic_dad_001',
    name: 'Mythic Dad',
    subtitle: 'The Weekend Warrior',
    type: 'COUCH_DAD',
    rarity: 'mythic',
    artwork: '/images/cards/event-mythic-dad.png',
    stats: {
      dadJoke: 100,
      grillSkill: 95,
      fixIt: 85,
      napPower: 100,
      remoteControl: 90,
      thermostat: 88,
      sockSandal: 92,
      beerSnob: 96,
    },
    flavorText: '"Weekend? Every day is a weekend when you\'re this legendary."',
    abilities: [
      {
        name: 'Double Mythic Drop',
        description: 'Doubles the chance of pulling mythic cards for the next 3 packs.',
      },
      {
        name: 'Weekend Warrior',
        description: 'All stats +20% during weekend events.',
      },
    ],
    series: 1,
    cardNumber: 1,
    totalInSeries: 10,
    artist: 'Event AI',
    holoVariant: 'prismatic',
    eventId: 'weekend_mythic_jan_2026',
  },
  {
    id: 'event_weekend_mythic_dad_002',
    name: 'Golden Hour Dad',
    subtitle: 'Sunset Specialist',
    type: 'GOLF_DAD',
    rarity: 'mythic',
    artwork: '/images/cards/event-golden-hour-dad.png',
    stats: {
      dadJoke: 90,
      grillSkill: 88,
      fixIt: 75,
      napPower: 85,
      remoteControl: 80,
      thermostat: 82,
      sockSandal: 95,
      beerSnob: 93,
    },
    flavorText: '"The sun sets at 5 PM? Perfect time for the back nine."',
    abilities: [
      {
        name: 'Golden Hour Bonus',
        description: 'During weekend events, gain 50% more event currency.',
      },
    ],
    series: 1,
    cardNumber: 2,
    totalInSeries: 10,
    artist: 'Event AI',
    holoVariant: 'prismatic',
    eventId: 'weekend_mythic_jan_2026',
  },
  {
    id: 'event_weekend_rare_dad_001',
    name: 'Weekend Grillmaster',
    subtitle: 'Saturday BBQ King',
    type: 'BBQ_DAD',
    rarity: 'rare',
    artwork: '/images/cards/event-weekend-grillmaster.png',
    stats: {
      dadJoke: 75,
      grillSkill: 92,
      fixIt: 65,
      napPower: 70,
      remoteControl: 68,
      thermostat: 72,
      sockSandal: 80,
      beerSnob: 85,
    },
    flavorText: '"Saturday is for grilling. Sunday is for leftovers."',
    abilities: [
      {
        name: 'Weekend Warrior',
        description: '+15% Grill Skill during weekend events.',
      },
    ],
    series: 1,
    cardNumber: 3,
    totalInSeries: 10,
    artist: 'Event AI',
    holoVariant: 'full_art',
    eventId: 'weekend_mythic_jan_2026',
  },

  // Holiday Event Cards
  {
    id: 'event_holiday_santa_dad',
    name: 'Santa Dad',
    subtitle: 'The Present Distributor',
    type: 'HOLIDAY_DAD',
    rarity: 'legendary',
    artwork: '/images/cards/event-santa-dad.png',
    stats: {
      dadJoke: 95,
      grillSkill: 85,
      fixIt: 80,
      napPower: 90,
      remoteControl: 88,
      thermostat: 92,
      sockSandal: 85,
      beerSnob: 90,
    },
    flavorText: '"Ho ho ho! I hope you\'ve been good this year... or not!"',
    abilities: [
      {
        name: 'Gift Giving',
        description: 'Has a 25% chance to duplicate a pack pull during holiday events.',
      },
    ],
    series: 1,
    cardNumber: 4,
    totalInSeries: 10,
    artist: 'Event AI',
    holoVariant: 'full_art',
    eventId: 'holiday_christmas_2025',
  },
  {
    id: 'event_holiday_reindeer_dad',
    name: 'Reindeer Dad',
    subtitle: 'Sleigh Pull Specialist',
    type: 'HOLIDAY_DAD',
    rarity: 'epic',
    artwork: '/images/cards/event-reindeer-dad.png',
    stats: {
      dadJoke: 82,
      grillSkill: 78,
      fixIt: 70,
      napPower: 85,
      remoteControl: 75,
      thermostat: 80,
      sockSandal: 88,
      beerSnob: 83,
    },
    flavorText: '"The nose glow? That\'s just my headlamp."',
    abilities: [
      {
        name: 'Sleigh Boost',
        description: '+20% movement speed during holiday events.',
      },
    ],
    series: 1,
    cardNumber: 5,
    totalInSeries: 10,
    artist: 'Event AI',
    holoVariant: 'reverse',
    eventId: 'holiday_christmas_2025',
  },

  // Summer BBQ Event Cards
  {
    id: 'event_bbq_grillmaster_dad',
    name: 'BBQ Champion Dad',
    subtitle: 'Flame Tamer',
    type: 'BBQ_DAD',
    rarity: 'legendary',
    artwork: '/images/cards/event-bbq-champion.png',
    stats: {
      dadJoke: 85,
      grillSkill: 100,
      fixIt: 75,
      napPower: 70,
      remoteControl: 72,
      thermostat: 78,
      sockSandal: 82,
      beerSnob: 90,
    },
    flavorText: '"Gas? Charcoal? Wood? I\'ve mastered them all."',
    abilities: [
      {
        name: 'Perfect Sear',
        description: 'Guaranteed rare or better pull during summer events.',
      },
    ],
    series: 1,
    cardNumber: 6,
    totalInSeries: 10,
    artist: 'Event AI',
    holoVariant: 'full_art',
    eventId: 'summer_bbq_2025',
  },
  {
    id: 'event_bbq_flame_keeper',
    name: 'Flame Keeper Dad',
    subtitle: 'Eternal Fire Watcher',
    type: 'BBQ_DAD',
    rarity: 'epic',
    artwork: '/images/cards/event-flame-keeper.png',
    stats: {
      dadJoke: 78,
      grillSkill: 92,
      fixIt: 68,
      napPower: 65,
      remoteControl: 70,
      thermostat: 75,
      sockSandal: 85,
      beerSnob: 88,
    },
    flavorText: '"The fire never dies. Neither does my passion for BBQ."',
    abilities: [
      {
        name: 'Heat Wave',
        description: '+15% Grill Skill for each hour the grill is running.',
      },
    ],
    series: 1,
    cardNumber: 7,
    totalInSeries: 10,
    artist: 'Event AI',
    holoVariant: 'reverse',
    eventId: 'summer_bbq_2025',
  },
];

/**
 * Get event cards for a specific event
 */
export function getEventCards(eventId: string): Card[] {
  return EVENT_CARDS.filter((card) => card.eventId === eventId);
}

/**
 * Get all event card IDs for a specific event
 */
export function getEventCardIds(eventId: string): string[] {
  return EVENT_CARD_IDS[eventId] || [];
}

/**
 * Check if a card is an event card
 */
export function isEventCard(cardId: string): boolean {
  return EVENT_CARDS.some((card) => card.id === cardId);
}

/**
 * Get the event ID for a specific card
 */
export function getCardEventId(cardId: string): string | undefined {
  const card = EVENT_CARDS.find((c) => c.id === cardId);
  return card?.eventId;
}
