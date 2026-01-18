/**
 * Leaderboard Types
 *
 * Types for the leaderboard system including player rankings,
 * categories, and filters.
 */

/**
 * Leaderboard categories for different rankings
 */
export type LeaderboardCategory =
  | 'packsOpened'
  | 'uniqueCards'
  | 'mythicCards'
  | 'totalCards';

/**
 * Leaderboard scope - global or friends-only
 */
export type LeaderboardScope = 'global' | 'friends';

/**
 * Time period filters for leaderboards
 */
export type LeaderboardTimePeriod = 'allTime' | 'weekly' | 'daily';

/**
 * Region filters for leaderboards (future feature)
 */
export type LeaderboardRegion = 'global' | 'na' | 'eu' | 'asia' | 'sa';

/**
 * Player statistics for leaderboard rankings
 */
export interface PlayerStats {
  /** Total number of packs opened */
  totalPacksOpened: number;
  /** Number of unique cards in collection */
  uniqueCards: number;
  /** Number of mythic rarity cards */
  mythicCards: number;
  /** Total cards in collection (including duplicates) */
  totalCards: number;
  /** Last active timestamp */
  lastActive: Date;
  /** When the player joined */
  joinedAt: Date;
}

/**
 * Leaderboard entry representing a single player ranking
 */
export interface LeaderboardEntry {
  /** Unique player identifier (anonymous) */
  playerId: string;
  /** Player's pseudonym (dad-themed name) */
  pseudonym: string;
  /** Dad type emoji for avatar */
  avatar: string;
  /** Player statistics */
  stats: PlayerStats;
  /** Current rank on this leaderboard */
  rank: number;
  /** Whether this is the current user */
  isCurrentUser: boolean;
}

/**
 * Leaderboard data structure
 */
export interface Leaderboard {
  /** Category being ranked */
  category: LeaderboardCategory;
  /** Scope (global or friends) */
  scope: LeaderboardScope;
  /** Time period filter */
  timePeriod: LeaderboardTimePeriod;
  /** Region filter (future feature) */
  region?: LeaderboardRegion;
  /** Total number of players */
  totalPlayers: number;
  /** Rankings (paginated) */
  entries: LeaderboardEntry[];
  /** User's ranking if not in top entries */
  userEntry?: LeaderboardEntry;
}

/**
 * Anonymous user profile for leaderboard participation
 */
export interface UserProfile {
  /** Unique player identifier */
  playerId: string;
  /** Dad-themed pseudonym */
  pseudonym: string;
  /** Avatar emoji */
  avatar: string;
  /** Player statistics */
  stats: PlayerStats;
  /** List of friend player IDs */
  friends: string[];
}

/**
 * Dad types for pseudonym generation
 */
export const DAD_TYPES = [
  { type: 'BBQ_DAD', emoji: '🍖', name: 'BBQ' },
  { type: 'FIX_IT_DAD', emoji: '🔧', name: 'FixIt' },
  { type: 'GOLF_DAD', emoji: '⛳', name: 'Golf' },
  { type: 'COUCH_DAD', emoji: '🛋️', name: 'Couch' },
  { type: 'LAWN_DAD', emoji: '🌱', name: 'Lawn' },
  { type: 'CAR_DAD', emoji: '🚗', name: 'Car' },
  { type: 'OFFICE_DAD', emoji: '💼', name: 'Office' },
  { type: 'COOL_DAD', emoji: '😎', name: 'Cool' },
  { type: 'COACH_DAD', emoji: '🏆', name: 'Coach' },
  { type: 'CHEF_DAD', emoji: '👨‍🍳', name: 'Chef' },
  { type: 'HOLIDAY_DAD', emoji: '🎄', name: 'Holiday' },
  { type: 'WAREHOUSE_DAD', emoji: '📦', name: 'Warehouse' },
  { type: 'VINTAGE_DAD', emoji: '📻', name: 'Vintage' },
  { type: 'FASHION_DAD', emoji: '👔', name: 'Fashion' },
  { type: 'TECH_DAD', emoji: '💻', name: 'Tech' },
] as const;

/**
 * Common names for pseudonym generation
 */
export const DAD_NAMES = [
  'Gary', 'Kevin', 'Dave', 'Steve', 'Mike', 'John', 'Brian', 'Chris',
  'Rick', 'Chuck', 'Pat', 'Tom', 'Jeff', 'Scott', 'Mark', 'Paul',
  'Jim', 'Bill', 'Bob', 'Dan', 'Greg', 'Tim', 'Rob', 'Matt',
];

/**
 * Category display configuration
 */
export const LEADERBOARD_CATEGORIES: Record<
  LeaderboardCategory,
  { label: string; description: string; icon: string }
> = {
  packsOpened: {
    label: 'Most Packs Opened',
    description: 'Players who have opened the most booster packs',
    icon: '📦',
  },
  uniqueCards: {
    label: 'Most Unique Cards',
    description: 'Players with the largest unique card collections',
    icon: '🃏',
  },
  mythicCards: {
    label: 'Most Mythic Cards',
    description: 'Players who have collected the most mythic rarity cards',
    icon: '✨',
  },
  totalCards: {
    label: 'Largest Collection',
    description: 'Players with the most cards overall',
    icon: '📚',
  },
};

/**
 * Time period display configuration
 */
export const TIME_PERIODS: Record<
  LeaderboardTimePeriod,
  { label: string; description: string }
> = {
  allTime: {
    label: 'All Time',
    description: 'All-time rankings since the beginning',
  },
  weekly: {
    label: 'This Week',
    description: 'Rankings from the last 7 days',
  },
  daily: {
    label: 'Today',
    description: 'Rankings from the last 24 hours',
  },
};

/**
 * Region display configuration (future feature)
 */
export const REGIONS: Record<
  LeaderboardRegion,
  { label: string; description: string }
> = {
  global: {
    label: 'Global',
    description: 'Worldwide rankings',
  },
  na: {
    label: 'North America',
    description: 'North America rankings',
  },
  eu: {
    label: 'Europe',
    description: 'Europe rankings',
  },
  asia: {
    label: 'Asia',
    description: 'Asia rankings',
  },
  sa: {
    label: 'South America',
    description: 'South America rankings',
  },
};
