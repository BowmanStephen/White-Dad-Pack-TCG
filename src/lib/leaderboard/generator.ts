/**
 * Leaderboard Generator
 *
 * Generates mock leaderboard data and user profiles for the MVP.
 * In production, this would be replaced with actual backend API calls.
 */

import type {
  Leaderboard,
  LeaderboardCategory,
  LeaderboardScope,
  LeaderboardEntry,
  UserProfile,
  PlayerStats,
} from '@/types/leaderboard';
import { DAD_TYPES, DAD_NAMES } from '@/types/leaderboard';

/**
 * Generate a random dad-themed pseudonym
 * Format: {DadType}_{Name}_{Number}
 * Example: "BBQ_Gary_47", "FixIt_Kevin_92"
 */
export function generatePseudonym(): string {
  const dadType = DAD_TYPES[Math.floor(Math.random() * DAD_TYPES.length)];
  const name = DAD_NAMES[Math.floor(Math.random() * DAD_NAMES.length)];
  const number = Math.floor(Math.random() * 99) + 1;
  return `${dadType.name}_${name}_${number}`;
}

/**
 * Generate a consistent pseudonym from a seed
 */
export function generatePseudonymFromSeed(seed: string): string {
  // Simple hash function to get consistent results
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const dadTypeIndex = Math.abs(hash) % DAD_TYPES.length;
  const nameIndex = Math.abs(hash >> 8) % DAD_NAMES.length;
  const number = (Math.abs(hash >> 16) % 99) + 1;

  const dadType = DAD_TYPES[dadTypeIndex];
  const name = DAD_NAMES[nameIndex];

  return `${dadType.name}_${name}_${number}`;
}

/**
 * Generate avatar emoji from pseudonym
 */
export function generateAvatar(pseudonym: string): string {
  const dadTypeName = pseudonym.split('_')[0];
  const dadType = DAD_TYPES.find((dt) => dt.name === dadTypeName);
  return dadType?.emoji || '👨';
}

/**
 * Generate a unique player ID
 */
export function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate random player stats within reasonable ranges
 */
export function generateRandomStats(minPacks: number = 0, maxPacks: number = 500): PlayerStats {
  const totalPacksOpened = Math.floor(Math.random() * (maxPacks - minPacks)) + minPacks;
  const uniqueCards = Math.floor(totalPacksOpened * 4.5 * (0.3 + Math.random() * 0.4));
  const mythicCards = Math.floor(totalPacksOpened * 0.02 * Math.random());
  const totalCards = totalPacksOpened * 6 + Math.floor(Math.random() * 20);

  const now = new Date();
  const joinedAt = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Joined within last 90 days
  const lastActive = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Active within last 7 days

  return {
    totalPacksOpened,
    uniqueCards,
    mythicCards,
    totalCards,
    lastActive,
    joinedAt,
  };
}

/**
 * Generate user profile from provided stats
 */
export function generateUserProfile(stats: PlayerStats): UserProfile {
  const playerId = generatePlayerId();
  const pseudonym = generatePseudonymFromSeed(playerId);
  const avatar = generateAvatar(pseudonym);

  return {
    playerId,
    pseudonym,
    avatar,
    stats,
    friends: [],
  };
}

/**
 * Generate a mock leaderboard entry
 */
export function generateMockEntry(
  rank: number,
  stats: PlayerStats,
  isCurrentUser: boolean = false
): LeaderboardEntry {
  const pseudonym = isCurrentUser
    ? generatePseudonymFromSeed('current_user')
    : generatePseudonym();

  return {
    playerId: isCurrentUser ? 'current_user' : generatePlayerId(),
    pseudonym,
    avatar: generateAvatar(pseudonym),
    stats,
    rank,
    isCurrentUser,
  };
}

/**
 * Generate mock leaderboard data for a category and scope
 */
export function generateMockLeaderboard(
  category: LeaderboardCategory,
  scope: LeaderboardScope,
  currentUser: UserProfile
): Leaderboard {
  // Determine number of players based on scope
  const totalPlayers = scope === 'global' ? 10000 : 150;

  // Generate mock players
  const players: LeaderboardEntry[] = [];

  // Add current user first
  players.push({
    playerId: currentUser.playerId,
    pseudonym: currentUser.pseudonym,
    avatar: currentUser.avatar,
    stats: currentUser.stats,
    rank: 0, // Will be calculated
    isCurrentUser: true,
  });

  // Generate other players
  for (let i = 0; i < totalPlayers - 1; i++) {
    const stats = generateRandomStats(1, 500);
    players.push(generateMockEntry(i + 1, stats, false));
  }

  // Sort by category
  players.sort((a, b) => {
    const aValue = getStatValue(a.stats, category);
    const bValue = getStatValue(b.stats, category);
    return bValue - aValue; // Descending order
  });

  // Assign ranks
  players.forEach((player, index) => {
    player.rank = index + 1;
  });

  // Find current user position
  const userEntry = players.find((p) => p.isCurrentUser);

  // Get top 100 entries
  const topEntries = players.slice(0, 100);

  // If user not in top 100, add as separate entry
  let userEntryToShow: LeaderboardEntry | undefined;
  if (userEntry && userEntry.rank > 100) {
    userEntryToShow = userEntry;
  }

  return {
    category,
    scope,
    totalPlayers,
    entries: topEntries,
    userEntry: userEntryToShow,
  };
}

/**
 * Get stat value for sorting based on category
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
    default:
      return 0;
  }
}

/**
 * Generate mock friend suggestions
 */
export function generateFriendSuggestions(count: number = 10): LeaderboardEntry[] {
  const suggestions: LeaderboardEntry[] = [];

  for (let i = 0; i < count; i++) {
    const stats = generateRandomStats(10, 200);
    const pseudonym = generatePseudonym();
    suggestions.push({
      playerId: generatePlayerId(),
      pseudonym,
      avatar: generateAvatar(pseudonym),
      stats,
      rank: Math.floor(Math.random() * 1000) + 1,
      isCurrentUser: false,
    });
  }

  return suggestions;
}

/**
 * Format stat value for display
 */
export function formatStatValue(category: LeaderboardCategory, value: number): string {
  switch (category) {
    case 'packsOpened':
      return `${value.toLocaleString()} packs`;
    case 'uniqueCards':
    case 'mythicCards':
    case 'totalCards':
      return `${value.toLocaleString()} cards`;
    default:
      return value.toLocaleString();
  }
}

/**
 * Format rank with suffix (1st, 2nd, 3rd, etc.)
 */
export function formatRank(rank: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = rank % 100;
  const suffix = suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  return `${rank}${suffix}`;
}
