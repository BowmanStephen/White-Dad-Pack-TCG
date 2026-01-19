/**
 * Leaderboard Generator
 *
 * Generates leaderboard data with support for time-based filters
 * (all time, weekly, daily) and categories.
 */

import type {
  Leaderboard,
  LeaderboardEntry,
  LeaderboardCategory,
  LeaderboardScope,
  LeaderboardTimePeriod,
  LeaderboardRegion,
  PlayerStats,
  UserProfile,
} from '@/types/leaderboard';
import { DAD_TYPES, DAD_NAMES } from '@/types/leaderboard';

const ENTRIES_PER_PAGE = 50;
const TOTAL_PLAYERS = 10000;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const MILLISECONDS_PER_WEEK = 7 * MILLISECONDS_PER_DAY;

/**
 * Generate a random player ID
 */
function generatePlayerId(): string {
  return `player_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Generate a random pseudonym from dad types and names
 */
function generatePseudonym(): string {
  const type = DAD_TYPES[Math.floor(Math.random() * DAD_TYPES.length)];
  const name = DAD_NAMES[Math.floor(Math.random() * DAD_NAMES.length)];
  return `${name} the ${type.name}`;
}

/**
 * Generate random player stats
 */
function generatePlayerStats(): PlayerStats {
  const totalPacksOpened = Math.floor(Math.random() * 5000) + 100;
  const uniqueCards = Math.floor(Math.random() * 200) + 50;
  const mythicCards = Math.floor(Math.random() * 20);
  const totalCards = Math.floor(Math.random() * 3000) + 200;

  // Calculate collection value based on stats (PACK-023).
  const collectionValue = Math.floor(
    totalCards * 2 +
    uniqueCards * 10 +
    mythicCards * 5000
  );

  const battleWins = Math.floor(Math.random() * 500);
  const battleLosses = Math.floor(Math.random() * 300);

  return {
    totalPacksOpened,
    uniqueCards,
    mythicCards,
    totalCards,
    collectionValue,
    battleWins,
    battleLosses,
    lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
  };
}

/**
 * Filter stats by time period
 */
function filterStatsByTimePeriod(
  stats: PlayerStats,
  timePeriod: LeaderboardTimePeriod
): PlayerStats {
  const now = new Date();
  const cutoffDate = getCutoffDate(timePeriod, now);

  if (!cutoffDate) {
    return stats;
  }

  if (stats.lastActive < cutoffDate) {
    return zeroedStats(stats);
  }

  const daysSinceJoin = getDaysBetween(stats.joinedAt, now);
  const daysInPeriod = getDaysBetween(
    new Date(Math.max(stats.joinedAt.getTime(), cutoffDate.getTime())),
    now
  );
  const activityRatio = daysInPeriod / daysSinceJoin;

  return {
    ...stats,
    totalPacksOpened: Math.floor(stats.totalPacksOpened * activityRatio),
    uniqueCards: Math.floor(stats.uniqueCards * activityRatio),
    mythicCards: Math.floor(stats.mythicCards * activityRatio * 0.5),
    totalCards: Math.floor(stats.totalCards * activityRatio),
    battleWins: Math.floor((stats.battleWins ?? 0) * activityRatio),
    battleLosses: Math.floor((stats.battleLosses ?? 0) * activityRatio),
  };
}

/**
 * Get the stat value for a category
 */
function getStatValue(stats: PlayerStats, category: LeaderboardCategory): number {
  switch (category) {
    case 'packsOpened':
      return stats.totalPacksOpened;
    case 'uniqueCards':
      return stats.uniqueCards;
    case 'mythicCards':
      return stats.mythicCards;
    case 'totalCards':
      return stats.totalCards;
    case 'collectionValue':
      return stats.collectionValue ?? 0;
    case 'battleRecord':
      return getBattleRecordValue(stats);
  }
}

/**
 * Generate a single leaderboard entry
 */
function generateLeaderboardEntry(
  playerId: string,
  pseudonym: string,
  stats: PlayerStats,
  rank: number,
  isCurrentUser: boolean = false
): LeaderboardEntry {
  const dadType = DAD_TYPES[Math.floor(Math.random() * DAD_TYPES.length)];

  return {
    playerId,
    pseudonym,
    avatar: dadType.emoji,
    stats,
    rank,
    isCurrentUser,
  };
}

/**
 * Generate leaderboard data
 */
export function generateLeaderboard(config: {
  category: LeaderboardCategory;
  scope: LeaderboardScope;
  timePeriod: LeaderboardTimePeriod;
  region?: LeaderboardRegion;
  userProfile?: UserProfile;
}): Leaderboard {
  const { category, scope, timePeriod, region, userProfile } = config;

  const userStats = userProfile?.stats || generatePlayerStats();
  const filteredUserStats = filterStatsByTimePeriod(userStats, timePeriod);
  const entries = buildLeaderboardEntries(scope, timePeriod, userProfile);
  const rankedEntries = sortAndRankEntries(entries, category);
  const userEntry = userProfile
    ? getUserEntry(rankedEntries, category, filteredUserStats, userProfile)
    : undefined;

  return {
    category,
    scope,
    timePeriod,
    region,
    totalPlayers: TOTAL_PLAYERS,
    entries: rankedEntries.slice(0, ENTRIES_PER_PAGE),
    userEntry,
  };
}

/**
 * Generate a random user profile
 */
export function generateUserProfile(): UserProfile {
  const playerId = generatePlayerId();
  const pseudonym = generatePseudonym();
  const dadType = DAD_TYPES[Math.floor(Math.random() * DAD_TYPES.length)];

  return {
    playerId,
    pseudonym,
    avatar: dadType.emoji,
    stats: generatePlayerStats(),
    friends: [],
  };
}

function getBattleRecordValue(stats: PlayerStats): number {
  const wins = stats.battleWins ?? 0;
  const losses = stats.battleLosses ?? 0;
  const totalBattles = wins + losses;

  if (totalBattles === 0) {
    return 0;
  }

  // Calculate win rate: (wins / (wins + losses)) * 1000 for precision
  return Math.round((wins / totalBattles) * 1000);
}

function getCutoffDate(
  timePeriod: LeaderboardTimePeriod,
  now: Date
): Date | null {
  switch (timePeriod) {
    case 'daily':
      return new Date(now.getTime() - MILLISECONDS_PER_DAY);
    case 'weekly':
      return new Date(now.getTime() - MILLISECONDS_PER_WEEK);
    case 'allTime':
      return null;
  }
}

function zeroedStats(stats: PlayerStats): PlayerStats {
  return {
    ...stats,
    totalPacksOpened: 0,
    uniqueCards: 0,
    mythicCards: 0,
    totalCards: 0,
    collectionValue: 0,
    battleWins: 0,
    battleLosses: 0,
  };
}

function getDaysBetween(start: Date, end: Date): number {
  return Math.max(
    1,
    Math.floor((end.getTime() - start.getTime()) / MILLISECONDS_PER_DAY)
  );
}

function buildLeaderboardEntries(
  scope: LeaderboardScope,
  timePeriod: LeaderboardTimePeriod,
  userProfile?: UserProfile
): LeaderboardEntry[] {
  if (scope === 'friends' && userProfile && userProfile.friends.length > 0) {
    return userProfile.friends.map((playerId, index) => {
      const pseudonym = generatePseudonym();
      const rawStats = generatePlayerStats();
      const filteredStats = filterStatsByTimePeriod(rawStats, timePeriod);
      return generateLeaderboardEntry(playerId, pseudonym, filteredStats, index + 1, false);
    });
  }

  const totalEntries = ENTRIES_PER_PAGE;
  return Array.from({ length: totalEntries }, (_, index) => {
    const playerId = generatePlayerId();
    const pseudonym = generatePseudonym();
    const rawStats = generatePlayerStats();
    const filteredStats = filterStatsByTimePeriod(rawStats, timePeriod);
    return generateLeaderboardEntry(playerId, pseudonym, filteredStats, index + 1, false);
  });
}

function sortAndRankEntries(
  entries: LeaderboardEntry[],
  category: LeaderboardCategory
): LeaderboardEntry[] {
  const sorted = [...entries].sort((a, b) => {
    const aValue = getStatValue(a.stats, category);
    const bValue = getStatValue(b.stats, category);
    return bValue - aValue;
  });

  for (let index = 0; index < sorted.length; index++) {
    sorted[index].rank = index + 1;
  }

  return sorted;
}

function getUserEntry(
  entries: LeaderboardEntry[],
  category: LeaderboardCategory,
  userStats: PlayerStats,
  userProfile: UserProfile
): LeaderboardEntry {
  const userValue = getStatValue(userStats, category);
  const lastEntryValue = getStatValue(entries[entries.length - 1].stats, category);

  if (userValue > lastEntryValue) {
    const userRank = getRankForValue(entries, category, userValue);
    const userEntry = generateLeaderboardEntry(
      userProfile.playerId,
      userProfile.pseudonym,
      userStats,
      userRank,
      true
    );
    entries.splice(userRank - 1, 0, userEntry);

    for (let index = userRank; index < entries.length; index++) {
      entries[index].rank = index + 1;
    }

    return userEntry;
  }

  return generateLeaderboardEntry(
    userProfile.playerId,
    userProfile.pseudonym,
    userStats,
    entries.length + 1,
    true
  );
}

function getRankForValue(
  entries: LeaderboardEntry[],
  category: LeaderboardCategory,
  value: number
): number {
  let rank = 1;
  for (const entry of entries) {
    if (value >= getStatValue(entry.stats, category)) {
      break;
    }
    rank += 1;
  }
  return rank;
}
