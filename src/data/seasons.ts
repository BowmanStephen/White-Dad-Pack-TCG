import type { Season, SeasonId, SeasonLaunchEvent } from '../types';

/**
 * Season 1: Base Set
 * The original DadDeck collection - 50 cards featuring all dad archetypes
 */
export const SEASON_1: Season = {
  id: 1,
  name: 'Base Set',
  subtitle: 'The Original Collection',
  description:
    'Where it all began. 50 cards featuring every dad archetype from BBQ Dads to Fix-It Dads. The foundation of DadDeck™.',
  status: 'active',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2099-12-31'),
  totalCards: 52,
  cardIds: [
    ...Array.from({ length: 50 }, (_, i) => String(i + 1).padStart(3, '0')),
    'daddypass_exclusive_legendary',
    'daddypass_exclusive_mythic',
  ],
  packDesign: 'base_set',
  theme: {
    name: 'Classic Blue',
    primaryColor: '#1e40af',
    secondaryColor: '#1e3a8a',
    accentColor: '#fbbf24',
    backgroundColor: '#1e3a8a',
    textColor: '#ffffff',
    icon: '📦',
  },
};

/**
 * Season 2: Summer BBQ Dads
 * 38 cards focused on summer cooking, outdoor activities, and family variants
 */
export const SEASON_2: Season = {
  id: 2,
  name: 'Summer BBQ Dads',
  subtitle: 'Grill Season is Here',
  description:
    'The temperature is rising and so is the grill mastery. 38 cards dedicated to the art of outdoor cooking, summer parties, dad fashion in 90-degree heat, and family variants.',
  status: 'active',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2099-12-31'),
  totalCards: 38,
  cardIds: [
    // Core Summer BBQ cards (053-082)
    ...Array.from({ length: 30 }, (_, i) => String(i + 53).padStart(3, '0')),
    // Additional cards
    '091',
    '099',
    '100',
    '101',
    '102',
    '103',
    '104',
    '105',
  ],
  packDesign: 'summer_bbq',
  theme: {
    name: 'Summer Heat',
    primaryColor: '#dc2626',
    secondaryColor: '#991b1b',
    accentColor: '#fbbf24',
    backgroundColor: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    textColor: '#ffffff',
    icon: '🔥',
  },
};

/**
 * Season 3: Crossover Chaos
 * 15 cards featuring pop culture crossovers (Marvel, Star Wars, Dune, etc.)
 */
export const SEASON_3: Season = {
  id: 3,
  name: 'Crossover Chaos',
  subtitle: 'When Worlds Collide',
  description:
    'Dad energy meets pop culture! 15 crossover cards featuring Marvel heroes, Star Wars legends, Dune warriors, and more - all with maximum dad energy.',
  status: 'active',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2099-12-31'),
  totalCards: 15,
  cardIds: [
    '083',
    '084',
    '085',
    '086',
    '087',
    '088',
    '089',
    '090',
    '092',
    '093',
    '094',
    '095',
    '096',
    '097',
    '098',
  ],
  packDesign: 'fall_foliage',
  theme: {
    name: 'Crossover Colors',
    primaryColor: '#7c3aed',
    secondaryColor: '#5b21b6',
    accentColor: '#fbbf24',
    backgroundColor: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
    textColor: '#ffffff',
    icon: '🦸',
  },
};

/**
 * All seasons data
 */
export const SEASONS: Season[] = [SEASON_1, SEASON_2, SEASON_3];

/**
 * Get season by ID
 */
export function getSeasonById(id: SeasonId): Season | undefined {
  return SEASONS.find(season => season.id === id);
}

/**
 * Get active seasons
 */
export function getActiveSeasons(): Season[] {
  const now = new Date();
  return SEASONS.filter(season => {
    if (season.status !== 'active') return false;
    if (season.endDate && now > season.endDate) return false;
    if (now < season.startDate) return false;
    return true;
  });
}

/**
 * Get archived seasons
 */
export function getArchivedSeasons(): Season[] {
  return SEASONS.filter(season => {
    if (season.status !== 'archived') return false;
    return true;
  });
}

/**
 * Get upcoming seasons
 */
export function getUpcomingSeasons(): Season[] {
  const now = new Date();
  return SEASONS.filter(season => now < season.startDate);
}

/**
 * Season launch events
 */
export const SEASON_LAUNCH_EVENTS: SeasonLaunchEvent[] = [
  {
    seasonId: 1,
    name: 'DadDeck™ Launch Week',
    description: 'The grand opening! Open packs, collect cards, and start your journey.',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-07'),
    bonuses: [
      {
        type: 'boosted_drops',
        description: '2x Rare+ drop rate',
        value: 2,
      },
      {
        type: 'special_packs',
        description: 'Free daily bonus pack',
        value: 1,
      },
    ],
  },
  {
    seasonId: 2,
    name: 'Summer BBQ Kickoff',
    description: 'Grill season is HERE! Celebrate with exclusive Summer BBQ packs.',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-06-07'),
    bonuses: [
      {
        type: 'exclusive_cards',
        description: 'Early access to Season 2 cards',
        value: 'season_2_early_access',
      },
      {
        type: 'boosted_drops',
        description: '3x Legendary drop rate during launch week',
        value: 3,
      },
      {
        type: 'special_packs',
        description: 'Summer BBQ themed packs',
        value: 'summer_bbq_pack',
      },
    ],
  },
];

/**
 * Get active launch events
 */
export function getActiveLaunchEvents(): SeasonLaunchEvent[] {
  const now = new Date();
  return SEASON_LAUNCH_EVENTS.filter(event => now >= event.startDate && now <= event.endDate);
}

/**
 * Get launch events for a specific season
 */
export function getLaunchEventsForSeason(seasonId: SeasonId): SeasonLaunchEvent[] {
  return SEASON_LAUNCH_EVENTS.filter(event => event.seasonId === seasonId);
}
