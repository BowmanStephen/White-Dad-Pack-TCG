import type {
  Season,
  SeasonId,
  SeasonStatus,
  SeasonPackDesign,
  SeasonLaunchEvent,
} from '../types';

/**
 * Season 1: Base Set
 * The original DadDeck collection - 50 cards featuring all dad archetypes
 */
export const SEASON_1: Season = {
  id: 1,
  name: 'Base Set',
  subtitle: 'The Original Collection',
  description: 'Where it all began. 50 cards featuring every dad archetype from BBQ Dads to Fix-It Dads. The foundation of DadDeck™.',
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
 * 30 new cards focused on summer cooking and outdoor activities
 */
export const SEASON_2: Season = {
  id: 2,
  name: 'Summer BBQ Dads',
  subtitle: 'Grill Season is Here',
  description: 'The temperature is rising and so is the grill mastery. 30 new cards dedicated to the art of outdoor cooking, summer parties, and dad fashion in 90-degree heat.',
  status: 'active',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2099-12-31'),
  totalCards: 30,
  cardIds: Array.from({ length: 30 }, (_, i) => String(i + 53).padStart(3, '0')),
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
 * Season 3: Fall Foliage
 */
export const SEASON_3: Season = {
  id: 3,
  name: 'Fall Foliage',
  subtitle: 'Leaf Pile Champions',
  description: 'Rake. Bag. Repeat. The cycle continues. Fall-themed cards featuring lawn care mastery and cozy sweater energy.',
  status: 'active',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2099-12-31'),
  totalCards: 23,
  cardIds: Array.from({ length: 23 }, (_, i) => String(i + 83).padStart(3, '0')),
  packDesign: 'fall_foliage',
  theme: {
    name: 'Autumn Colors',
    primaryColor: '#d97706',
    secondaryColor: '#92400e',
    accentColor: '#fbbf24',
    backgroundColor: 'linear-gradient(135deg, #d97706 0%, #92400e 100%)',
    textColor: '#ffffff',
    icon: '🍂',
  },
};

/**
 * All seasons data
 */
export const SEASONS: Season[] = [
  SEASON_1,
  SEASON_2,
  SEASON_3,
];

/**
 * Get season by ID
 */
export function getSeasonById(id: SeasonId): Season | undefined {
  return SEASONS.find((season) => season.id === id);
}

/**
 * Get active seasons
 */
export function getActiveSeasons(): Season[] {
  const now = new Date();
  return SEASONS.filter((season) => {
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
  const now = new Date();
  return SEASONS.filter((season) => {
    if (season.status !== 'archived') return false;
    return true;
  });
}

/**
 * Get upcoming seasons
 */
export function getUpcomingSeasons(): Season[] {
  const now = new Date();
  return SEASONS.filter((season) => now < season.startDate);
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
  return SEASON_LAUNCH_EVENTS.filter(
    (event) => now >= event.startDate && now <= event.endDate
  );
}

/**
 * Get launch events for a specific season
 */
export function getLaunchEventsForSeason(seasonId: SeasonId): SeasonLaunchEvent[] {
  return SEASON_LAUNCH_EVENTS.filter((event) => event.seasonId === seasonId);
}
