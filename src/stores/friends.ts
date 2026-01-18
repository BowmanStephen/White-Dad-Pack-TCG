/**
 * Friends Store
 *
 * Manages friend system including friend requests, friend list,
 * activity feed, and friend discovery. Uses persistent storage for
 * friend data and integrates with the profile system.
 */

import { atom, map } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type {
  FriendProfile,
  FriendRequest,
  FriendActivity,
  FriendActivityType,
  FriendActivityDetails,
  FriendStatsComparison,
  FriendCollectionView,
  FriendState,
  FriendCode,
  AvatarId,
  PlayerStats,
  PackCard,
  Rarity,
} from '@/types';
import { DEFAULT_FRIEND_CONFIG, FRIEND_ACTIVITY_CONFIG } from '@/types';
import { profile } from '@/stores/profile';
import { addFriend as addFriendToProfile, removeFriend as removeFriendFromProfile } from '@/stores/profile';

/**
 * Custom encoder to handle Date serialization in persistent storage
 */
const friendsEncoder = {
  decode(value: any): any {
    if (!value) return value;

    // Decode dates in friend requests
    if (value.pendingRequests) {
      value.pendingRequests = value.pendingRequests.map((req: any) => ({
        ...req,
        createdAt: new Date(req.createdAt),
        respondedAt: req.respondedAt ? new Date(req.respondedAt) : undefined,
      }));
    }

    // Decode dates in sent requests
    if (value.sentRequests) {
      value.sentRequests = value.sentRequests.map((req: any) => ({
        ...req,
        createdAt: new Date(req.createdAt),
        respondedAt: req.respondedAt ? new Date(req.respondedAt) : undefined,
      }));
    }

    // Decode dates in activities
    if (value.activities) {
      value.activities = value.activities.map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp),
      }));
    }

    // Decode dates in friends
    if (value.friends) {
      value.friends = value.friends.map((friend: any) => ({
        ...friend,
        lastActive: new Date(friend.lastActive),
      }));
    }

    return value;
  },
  encode(value: any): any {
    return value;
  },
};

/**
 * Friend state (persistent)
 */
export const friendState = persistentAtom<FriendState>('daddeck-friends', {
  friends: [],
  pendingRequests: [],
  sentRequests: [],
  activities: [],
  isFinderOpen: false,
  searchResults: [],
}, {
  encode: friendsEncoder.encode,
  decode: friendsEncoder.decode,
});

/**
 * Loading state for friend operations
 */
export const isLoading = atom<boolean>(false);

/**
 * Error state for friend operations
 */
export const friendsError = atom<string | null>(null);

/**
 * Generate a unique friend code
 * Format: DAD-XXXX (6 characters)
 */
export function generateFriendCode(): FriendCode {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion
  let code = 'DAD-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code as FriendCode;
}

/**
 * Get current user's friend code (derived from player ID)
 */
export function getMyFriendCode(): FriendCode {
  const currentProfile = profile.get();
  if (!currentProfile) {
    return generateFriendCode();
  }

  // Derive friend code from player ID (consistent)
  const hash = currentProfile.playerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'DAD-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt((hash + i * 17) % chars.length);
  }
  return code as FriendCode;
}

/**
 * Search for players by username or friend code
 * Note: This is a mock implementation since we don't have a backend
 * In production, this would query an API
 */
export async function searchPlayers(query: string): Promise<FriendProfile[]> {
  isLoading.set(true);
  friendsError.set(null);

  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock search results - in production this would call an API
    // For now, return empty array since we can't search localStorage
    const results: FriendProfile[] = [];

    const current = friendState.get();
    friendState.set({
      ...current,
      searchResults: results,
    });

    return results;
  } catch (error) {
    friendsError.set('Failed to search for players');
    return [];
  } finally {
    isLoading.set(false);
  }
}

/**
 * Send a friend request
 */
export async function sendFriendRequest(playerId: string, message?: string): Promise<boolean> {
  isLoading.set(true);
  friendsError.set(null);

  try {
    const currentProfile = profile.get();
    if (!currentProfile) {
      friendsError.set('Profile not initialized');
      return false;
    }

    // Check if already friends
    if (currentProfile.friends.includes(playerId)) {
      friendsError.set('Already friends with this player');
      return false;
    }

    const current = friendState.get();

    // Check if request already sent
    const existingRequest = current.sentRequests.find(
      req => req.toPlayerId === playerId && req.status === 'pending'
    );
    if (existingRequest) {
      friendsError.set('Friend request already sent');
      return false;
    }

    // Create friend request
    const request: FriendRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      fromPlayerId: currentProfile.playerId,
      toPlayerId: playerId,
      fromUsername: currentProfile.username || currentProfile.pseudonym,
      fromAvatarId: currentProfile.avatarId,
      status: 'pending',
      createdAt: new Date(),
      message,
    };

    friendState.set({
      ...current,
      sentRequests: [...current.sentRequests, request],
    });

    return true;
  } catch (error) {
    friendsError.set('Failed to send friend request');
    return false;
  } finally {
    isLoading.set(false);
  }
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(requestId: string): Promise<boolean> {
  isLoading.set(true);
  friendsError.set(null);

  try {
    const current = friendState.get();
    const request = current.pendingRequests.find(req => req.id === requestId);

    if (!request) {
      friendsError.set('Friend request not found');
      return false;
    }

    // Add friend to profile
    addFriendToProfile(request.fromPlayerId);

    // Update request status
    const updatedRequest: FriendRequest = {
      ...request,
      status: 'accepted',
      respondedAt: new Date(),
    };

    // Add friend to friend list
    const friendProfile: FriendProfile = {
      playerId: request.fromPlayerId,
      username: request.fromUsername,
      pseudonym: request.fromUsername, // Using username as pseudonym for now
      avatarId: request.fromAvatarId,
      bio: '',
      stats: {
        totalPacksOpened: 0,
        totalCards: 0,
        uniqueCards: 0,
        rarePulls: 0,
        epicPulls: 0,
        legendaryPulls: 0,
        mythicPulls: 0,
        holoPulls: 0,
        lastActive: new Date(),
        joinedAt: new Date(),
      },
      badges: [],
      isOnline: false,
      lastActive: new Date(),
      friendCount: 0,
    };

    friendState.set({
      ...current,
      friends: [...current.friends, friendProfile],
      pendingRequests: current.pendingRequests.filter(req => req.id !== requestId),
    });

    return true;
  } catch (error) {
    friendsError.set('Failed to accept friend request');
    return false;
  } finally {
    isLoading.set(false);
  }
}

/**
 * Reject a friend request
 */
export async function rejectFriendRequest(requestId: string): Promise<boolean> {
  isLoading.set(true);
  friendsError.set(null);

  try {
    const current = friendState.get();
    const request = current.pendingRequests.find(req => req.id === requestId);

    if (!request) {
      friendsError.set('Friend request not found');
      return false;
    }

    // Update request status
    const updatedRequest: FriendRequest = {
      ...request,
      status: 'rejected',
      respondedAt: new Date(),
    };

    friendState.set({
      ...current,
      pendingRequests: current.pendingRequests.filter(req => req.id !== requestId),
    });

    return true;
  } catch (error) {
    friendsError.set('Failed to reject friend request');
    return false;
  } finally {
    isLoading.set(false);
  }
}

/**
 * Cancel a sent friend request
 */
export async function cancelFriendRequest(requestId: string): Promise<boolean> {
  isLoading.set(true);
  friendsError.set(null);

  try {
    const current = friendState.get();
    const request = current.sentRequests.find(req => req.id === requestId);

    if (!request) {
      friendsError.set('Friend request not found');
      return false;
    }

    // Update request status
    const updatedRequest: FriendRequest = {
      ...request,
      status: 'cancelled',
    };

    friendState.set({
      ...current,
      sentRequests: current.sentRequests.filter(req => req.id !== requestId),
    });

    return true;
  } catch (error) {
    friendsError.set('Failed to cancel friend request');
    return false;
  } finally {
    isLoading.set(false);
  }
}

/**
 * Remove a friend
 */
export async function removeFriend(playerId: string): Promise<boolean> {
  isLoading.set(true);
  friendsError.set(null);

  try {
    const current = friendState.get();

    // Remove from friend list
    friendState.set({
      ...current,
      friends: current.friends.filter(f => f.playerId !== playerId),
    });

    // Remove from profile
    removeFriendFromProfile(playerId);

    return true;
  } catch (error) {
    friendsError.set('Failed to remove friend');
    return false;
  } finally {
    isLoading.set(false);
  }
}

/**
 * Add a friend activity to the feed
 */
export function addFriendActivity(
  playerId: string,
  username: string,
  avatarId: AvatarId,
  type: FriendActivityType,
  details: FriendActivityDetails
): void {
  const current = friendState.get();

  const activity: FriendActivity = {
    id: `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    playerId,
    username,
    avatarId,
    type,
    details,
    timestamp: new Date(),
  };

  // Add to beginning of activities and limit to config max
  const updatedActivities = [activity, ...current.activities].slice(
    0,
    DEFAULT_FRIEND_CONFIG.activityFeedLimit
  );

  friendState.set({
    ...current,
    activities: updatedActivities,
  });
}

/**
 * Tracks and records friend activities for the activity feed.
 *
 * This function is called by other systems when a friend performs a notable
 * action (opening a pack, crafting a card, winning a battle, etc.). Activities
 * are only recorded if the player is actually in the user's friend list.
 *
 * The activity feed is automatically limited to `DEFAULT_FRIEND_CONFIG.activityFeedLimit`
 * entries, with oldest activities being removed when the limit is exceeded.
 *
 * @example
 * ```ts
 * // Track when a friend opens a pack with a legendary pull
 * trackFriendActivity(
 *   friendPlayerId,
 *   "GrillmasterGary",
 *   "avatar_01",
 *   "pack_open",
 *   {
 *     packId: "pack_123",
 *     bestRarity: "legendary",
 *     holoCount: 2,
 *     timestamp: new Date()
 *   }
 * );
 * ```
 *
 * @param playerId - The friend's player ID
 * @param username - The friend's username for display
 * @param avatarId - The friend's avatar ID for display
 * @param type - The type of activity (pack_open, craft, battle, etc.)
 * @param details - Activity-specific details (varies by type)
 *
 * @see {@link addFriendActivity} for the underlying add function
 * @see {@link getFriendActivities} for retrieving activities
 * @see {@link FriendActivityType} for all activity types
 * @see {@link FriendActivityDetails} for detail structures by type
 */
export function trackFriendActivity(
  playerId: string,
  username: string,
  avatarId: AvatarId,
  type: FriendActivityType,
  details: FriendActivityDetails
): void {
  // Only track activities for actual friends
  const current = friendState.get();
  const isFriend = current.friends.some(f => f.playerId === playerId);

  if (isFriend) {
    addFriendActivity(playerId, username, avatarId, type, details);
  }
}

/**
 * Get friend activities for display
 */
export function getFriendActivities(limit?: number): FriendActivity[] {
  const current = friendState.get();
  if (limit) {
    return current.activities.slice(0, limit);
  }
  return current.activities;
}

/**
 * Clear old activities (older than specified days)
 */
export function clearOldActivities(daysToKeep: number = 7): void {
  const current = friendState.get();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const filteredActivities = current.activities.filter(
    activity => activity.timestamp > cutoffDate
  );

  friendState.set({
    ...current,
    activities: filteredActivities,
  });
}

/**
 * Compares player stats with a friend's stats for stat-to-stat comparison.
 *
 * Calculates side-by-side comparison of all tracked stats (packs opened,
 * cards collected, rarity pulls, etc.) and determines the winner for each
 * stat category. Includes absolute differences for each stat.
 *
 * @example
 * ```ts
 * const comparison = compareStats(friendPlayerId);
 * if (comparison) {
 *   for (const comp of comparison.comparisons) {
 *     console.log(`${comp.stat}: You ${comp.yourValue} vs Friend ${comp.friendValue}`);
 *     console.log(`Winner: ${comp.winner}, Difference: ${comp.difference}`);
 *   }
 * }
 * ```
 *
 * @param friendPlayerId - The friend's player ID to compare against
 * @returns Comparison object with both players' stats and per-stat comparisons,
 *          or null if friend not found or profile not available
 *
 * @see {@link FriendStatsComparison} for the comparison structure
 * @see {@link PlayerStats} for all compared stats
 */
export function compareStats(friendPlayerId: string): FriendStatsComparison | null {
  const current = friendState.get();
  const friend = current.friends.find(f => f.playerId === friendPlayerId);
  const myProfile = profile.get();

  if (!friend || !myProfile) {
    return null;
  }

  const comparisons: FriendStatsComparison['comparisons'] = [];

  // Compare all stats
  const statKeys: (keyof PlayerStats)[] = [
    'totalPacksOpened',
    'totalCards',
    'uniqueCards',
    'rarePulls',
    'epicPulls',
    'legendaryPulls',
    'mythicPulls',
    'holoPulls',
  ];

  for (const stat of statKeys) {
    const yourValue = myProfile.stats[stat] as number;
    const friendValue = friend.stats[stat] as number;
    const difference = Math.abs(yourValue - friendValue);

    let winner: 'you' | 'friend' | 'tie' = 'tie';
    if (yourValue > friendValue) winner = 'you';
    if (friendValue > yourValue) winner = 'friend';

    comparisons.push({
      stat,
      yourValue,
      friendValue,
      winner,
      difference,
    });
  }

  return {
    yourStats: myProfile.stats,
    friendStats: friend.stats,
    comparisons,
  };
}

/**
 * Get friend's collection view (mock - would use API in production)
 */
export function getFriendCollection(friendPlayerId: string): FriendCollectionView | null {
  const current = friendState.get();
  const friend = current.friends.find(f => f.playerId === friendPlayerId);

  if (!friend) {
    return null;
  }

  // Mock collection view - in production this would fetch from API
  return {
    playerId: friend.playerId,
    username: friend.username,
    pseudonym: friend.pseudonym,
    totalPacks: friend.stats.totalPacksOpened,
    totalCards: friend.stats.totalCards,
    uniqueCards: friend.stats.uniqueCards,
    rarityBreakdown: {
      common: 0,
      uncommon: 0,
      rare: friend.stats.rarePulls,
      epic: friend.stats.epicPulls,
      legendary: friend.stats.legendaryPulls,
      mythic: friend.stats.mythicPulls,
    },
    favoriteCards: [],
    lastUpdated: new Date(),
  };
}

/**
 * Open/close friend finder
 */
export function toggleFriendFinder(): void {
  const current = friendState.get();
  friendState.set({
    ...current,
    isFinderOpen: !current.isFinderOpen,
  });
}

/**
 * Set friend finder open state
 */
export function setFriendFinderOpen(open: boolean): void {
  const current = friendState.get();
  friendState.set({
    ...current,
    isFinderOpen: open,
  });
}

/**
 * Get friend count
 */
export function getFriendCount(): number {
  const currentProfile = profile.get();
  return currentProfile?.friends.length || 0;
}

/**
 * Get pending request count
 */
export function getPendingRequestCount(): number {
  const current = friendState.get();
  return current.pendingRequests.filter(req => req.status === 'pending').length;
}

/**
 * Check if a player is a friend
 */
export function isFriend(playerId: string): boolean {
  const currentProfile = profile.get();
  return currentProfile?.friends.includes(playerId) || false;
}

/**
 * Simulate receiving a friend request (for testing)
 * In production, this would come from a WebSocket or polling
 */
export function simulateIncomingFriendRequest(
  fromPlayerId: string,
  fromUsername: string,
  fromAvatarId: AvatarId,
  message?: string
): void {
  const current = friendState.get();

  const request: FriendRequest = {
    id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    fromPlayerId,
    toPlayerId: profile.get()?.playerId || '',
    fromUsername,
    fromAvatarId,
    status: 'pending',
    createdAt: new Date(),
    message,
  };

  friendState.set({
    ...current,
    pendingRequests: [...current.pendingRequests, request],
  });
}

/**
 * Clean up expired friend requests
 */
export function cleanupExpiredRequests(): void {
  const current = friendState.get();
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() - DEFAULT_FRIEND_CONFIG.requestExpirationDays);

  const validSentRequests = current.sentRequests.filter(
    req => req.createdAt > expirationDate || req.status !== 'pending'
  );

  friendState.set({
    ...current,
    sentRequests: validSentRequests,
  });
}

/**
 * Reset friends state (for testing/logout)
 */
export function resetFriendsState(): void {
  friendState.set({
    friends: [],
    pendingRequests: [],
    sentRequests: [],
    activities: [],
    isFinderOpen: false,
    searchResults: [],
  });
  friendsError.set(null);
}
