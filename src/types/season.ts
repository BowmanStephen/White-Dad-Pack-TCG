// Season identifier
export type SeasonId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// Season status
export type SeasonStatus = 'active' | 'archived' | 'upcoming';

// Season interface
export interface Season {
  id: SeasonId;
  name: string;
  subtitle: string;
  description: string;
  status: SeasonStatus;
  startDate: Date;
  endDate?: Date;
  totalCards: number;
  cardIds: string[];
  packDesign: SeasonPackDesign;
  theme: SeasonTheme;
}

// Season pack design (extends base PackDesign)
export type SeasonPackDesign =
  | 'base_set'
  | 'summer_bbq'
  | 'fall_foliage'
  | 'winter_wonderland'
  | 'spring_bloom';

// Season theme configuration
export interface SeasonTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  icon: string;
}

// Season launch event interface
export interface SeasonLaunchEvent {
  seasonId: SeasonId;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  bonuses: SeasonBonus[];
}

// Season bonuses during launch events
export interface SeasonBonus {
  type: 'boosted_drops' | 'exclusive_cards' | 'special_packs' | 'xp_multiplier';
  description: string;
  value: number | string;
}

// Season state for UI
export interface SeasonState {
  currentSeason: SeasonId;
  activeSeasons: Season[];
  archivedSeasons: Season[];
  upcomingSeasons: Season[];
  launchEvents: SeasonLaunchEvent[];
}

// Season configuration
export interface SeasonConfig {
  currentSeason: SeasonId;
  autoArchive: boolean;
  launchEventDuration: number;
}

// Default season configuration
export const DEFAULT_SEASON_CONFIG: SeasonConfig = {
  currentSeason: 2,
  autoArchive: true,
  launchEventDuration: 7,
};

// Season pack design configurations
export const SEASON_PACK_CONFIG: Record<SeasonPackDesign, SeasonTheme> = {
  base_set: {
    name: 'Base Set',
    primaryColor: '#1e40af',
    secondaryColor: '#1e3a8a',
    accentColor: '#fbbf24',
    backgroundColor: '#1e3a8a',
    textColor: '#ffffff',
    icon: '📦',
  },
  summer_bbq: {
    name: 'Summer BBQ',
    primaryColor: '#dc2626',
    secondaryColor: '#991b1b',
    accentColor: '#fbbf24',
    backgroundColor: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    textColor: '#ffffff',
    icon: '🔥',
  },
  fall_foliage: {
    name: 'Fall Foliage',
    primaryColor: '#d97706',
    secondaryColor: '#92400e',
    accentColor: '#fbbf24',
    backgroundColor: 'linear-gradient(135deg, #d97706 0%, #92400e 100%)',
    textColor: '#ffffff',
    icon: '🍂',
  },
  winter_wonderland: {
    name: 'Winter Wonderland',
    primaryColor: '#0284c7',
    secondaryColor: '#0c4a6e',
    accentColor: '#e0f2fe',
    backgroundColor: 'linear-gradient(135deg, #0284c7 0%, #0c4a6e 100%)',
    textColor: '#ffffff',
    icon: '❄️',
  },
  spring_bloom: {
    name: 'Spring Bloom',
    primaryColor: '#16a34a',
    secondaryColor: '#14532d',
    accentColor: '#86efac',
    backgroundColor: 'linear-gradient(135deg, #16a34a 0%, #14532d 100%)',
    textColor: '#ffffff',
    icon: '🌸',
  },
};
