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

/**
 * Number of entries to show per page
 */
const ENTRIES_PER_PAGE = 50;

/**
 * Total simulated players in the system
 */
const TOTAL_PLAYERS = 10000;

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
  return {
    totalPacksOpened: Math.floor(Math.random() * 5000) + 100,
    uniqueCards: Math.floor(Math.random() * 200) + 50,
    mythicCards: Math.floor(Math.random() * 20),
    totalCards: Math.floor(Math.random() * 3000) + 200,
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
  let cutoffDate = new Date(0);

  switch (timePeriod) {
    case 'daily':
      cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'weekly':
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'allTime':
    default:
      // No filtering for all time
      return stats;
  }

  // If player's last activity is before cutoff, return zeroed stats
  if (stats.lastActive < cutoffDate) {
    return {
      ...stats,
      totalPacksOpened: 0,
      uniqueCards: 0,
      mythicCards: 0,
      totalCards: 0,
    };
  }

  // For active players, reduce stats proportionally based on activity
  const daysSinceJoin = Math.max(
    1,
    Math.floor((now.getTime() - stats.joinedAt.getTime()) / (24 * 60 * 60 * 1000))
  );
  const daysInPeriod = Math.max(
    1,
    Math.floor((now.getTime() - Math.max(stats.joinedAt.getTime(), cutoffDate.getTime())) / (24 * 60 * 60 * 1000))
  );

  const activityRatio = daysInPeriod / daysSinceJoin;

  return {
    ...stats,
    totalPacksOpened: Math.floor(stats.totalPacksOpened * activityRatio),
    uniqueCards: Math.floor(stats.uniqueCards * activityRatio),
    mythicCards: Math.floor(stats.mythicCards * activityRatio * 0.5), // Mythics are rarer
    totalCards: Math.floor(stats.totalCards * activityRatio),
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

  // Generate simulated player data
  const entries: LeaderboardEntry[] = [];

  // Add current user if provided
  let userStats = userProfile?.stats || generatePlayerStats();
  const filteredUserStats = filterStatsByTimePeriod(userStats, timePeriod);

  // Generate entries
  for (let i = 0; i < ENTRIES_PER_PAGE; i++) {
    const playerId = generatePlayerId();
    const pseudonym = generatePseudonym();
    const rawStats = generatePlayerStats();
    const filteredStats = filterStatsByTimePeriod(rawStats, timePeriod);

    entries.push(
      generateLeaderboardEntry(
        playerId,
        pseudonym,
        filteredStats,
        i + 1,
        false
      )
    );
  }

  // Sort entries by category stat value
  entries.sort((a, b) => {
    const aValue = getStatValue(a.stats, category);
    const bValue = getStatValue(b.stats, category);
    return bValue - aValue; // Descending order
  });

  // Re-rank after sorting
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  // Check if user qualifies for top entries
  let userEntry: LeaderboardEntry | undefined;

  if (userProfile) {
    const userValue = getStatValue(filteredUserStats, category);
    const lastEntryValue = getStatValue(entries[entries.length - 1].stats, category);

    if (userValue > lastEntryValue) {
      // User is in top entries, find their rank
      let userRank = 1;
      for (const entry of entries) {
        const entryValue = getStatValue(entry.stats, category);
        if (userValue >= entryValue) {
          break;
        }
        userRank++;
      }

      // Create user entry
      userEntry = generateLeaderboardEntry(
        userProfile.playerId,
        userProfile.pseudonym,
        filteredUserStats,
        userRank,
        true
      );

      // Insert user entry at correct position
      entries.splice(userRank - 1, 0, userEntry);

      // Re-rank entries below user
      for (let i = userRank; i < entries.length; i++) {
        entries[i].rank = i + 1;
      }
    } else {
      // User is not in top entries, calculate their overall rank
      let userRank = entries.length + 1;
      userEntry = generateLeaderboardEntry(
        userProfile.playerId,
        userProfile.pseudonym,
        filteredUserStats,
        userRank,
        true
      );
    }
  }

  return {
    category,
    scope,
    timePeriod,
    region,
    totalPlayers: TOTAL_PLAYERS,
    entries: entries.slice(0, ENTRIES_PER_PAGE),
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
