/**
 * Leaderboard Store
 *
 * Manages leaderboard state, user profile, and rankings.
 * Uses persistent storage for user profile and mock data generation.
 */

import { map, task } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type {
  Leaderboard,
  LeaderboardCategory,
  LeaderboardScope,
  LeaderboardEntry,
  UserProfile,
  PlayerStats,
} from '@/types/leaderboard';
import { generateMockLeaderboard, generateUserProfile } from '@/lib/leaderboard/generator';

/**
 * Custom encoder to handle Date serialization in persistent storage
 */
const dateEncoder = {
  decode(value: any): any {
    if (value?.lastActive) value.lastActive = new Date(value.lastActive);
    if (value?.joinedAt) value.joinedAt = new Date(value.joinedAt);
    return value;
  },
  encode(value: any): any {
    return value;
  },
};

/**
 * Current user profile (persistent)
 */
export const userProfile = persistentAtom<UserProfile | null>('daddeck-user-profile', null, {
  encode: dateEncoder.encode,
  decode: dateEncoder.decode,
});

/**
 * Current leaderboard category
 */
export const currentCategory = map<LeaderboardCategory>('packsOpened');

/**
 * Current leaderboard scope (global/friends)
 */
export const currentScope = map<LeaderboardScope>('global');

/**
 * Current leaderboard data
 */
export const currentLeaderboard = map<Leaderboard | null>(null);

/**
 * Loading state for leaderboard
 */
export const isLoading = map<boolean>(false);

/**
 * Error state for leaderboard
 */
export const leaderboardError = map<string | null>(null);

/**
 * Initialize user profile if not exists
 */
export function initializeProfile(stats: PlayerStats): UserProfile {
  const existing = userProfile.get();
  if (existing) {
    // Update stats but keep pseudonym and ID
    const updated: UserProfile = {
      ...existing,
      stats: {
        ...existing.stats,
        ...stats,
        lastActive: new Date(),
      },
    };
    userProfile.set(updated);
    return updated;
  }

  // Generate new profile
  const profile = generateUserProfile(stats);
  userProfile.set(profile);
  return profile;
}

/**
 * Update user statistics
 */
export function updateUserStats(stats: Partial<PlayerStats>): void {
  const profile = userProfile.get();
  if (!profile) return;

  const updated: UserProfile = {
    ...profile,
    stats: {
      ...profile.stats,
      ...stats,
      lastActive: new Date(),
    },
  };
  userProfile.set(updated);
}

/**
 * Load leaderboard data for current category and scope
 */
export async function loadLeaderboard(): Promise<void> {
  // Guard for SSR - skip loading if not in browser
  if (typeof window === 'undefined') {
    return;
  }

  const category = currentCategory.get();
  const scope = currentScope.get();

  isLoading.set(true);
  leaderboardError.set(null);

  try {
    const profile = userProfile.get();
    if (!profile) {
      // Silently return if profile not initialized (common during SSR)
      return;
    }

    // Generate mock leaderboard data
    const leaderboard = generateMockLeaderboard(category, scope, profile);
    currentLeaderboard.set(leaderboard);
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
    leaderboardError.set(
      error instanceof Error ? error.message : 'Failed to load leaderboard'
    );
  } finally {
    isLoading.set(false);
  }
}

/**
 * Change leaderboard category and reload
 */
export async function changeCategory(category: LeaderboardCategory): Promise<void> {
  currentCategory.set(category);
  await loadLeaderboard();
}

/**
 * Change leaderboard scope and reload
 */
export async function changeScope(scope: LeaderboardScope): Promise<void> {
  currentScope.set(scope);
  await loadLeaderboard();
}

/**
 * Add a friend by player ID
 */
export function addFriend(playerId: string): void {
  const profile = userProfile.get();
  if (!profile) return;

  if (!profile.friends.includes(playerId)) {
    userProfile.set({
      ...profile,
      friends: [...profile.friends, playerId],
    });
  }
}

/**
 * Remove a friend by player ID
 */
export function removeFriend(playerId: string): void {
  const profile = userProfile.get();
  if (!profile) return;

  userProfile.set({
    ...profile,
    friends: profile.friends.filter((id) => id !== playerId),
  });
}

/**
 * Get user's ranking for a category (async wrapper for stores)
 */
export async function getUserRanking(
  category: LeaderboardCategory,
  scope: LeaderboardScope
): Promise<number | null> {
  const profile = userProfile.get();
  if (!profile) return null;

  const leaderboard = generateMockLeaderboard(category, scope, profile);
  const userEntry = leaderboard.entries.find((e) => e.isCurrentUser);
  return userEntry?.rank ?? leaderboard.userEntry?.rank ?? null;
}

// Export task for reactive leaderboard loading
export const loadLeaderboardTask = task(async () => {
  await loadLeaderboard();
});
