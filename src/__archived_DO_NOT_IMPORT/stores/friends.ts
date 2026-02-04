/**
 * Friends Store - Social Connections & Activity Tracking
 *
 * Manages friend relationships, activity feeds, and social features for the game.
 * Implements US089 (Friend System) with real-time activity tracking and stats comparison.
 *
 * @module stores/friends
 */
import { atom, computed } from 'nanostores';
import type {
  FriendProfile,
  FriendActivity,
  FriendActivityType,
  FriendActivityDetails,
  FriendStatsComparison,
  StatsComparison,
  PlayerProfile,
  FriendRequest,
  FriendRequestStatus,
  FriendState,
  FriendCode,
  FriendConfig,
  DEFAULT_FRIEND_CONFIG,
  FRIEND_ACTIVITY_CONFIG,
} from '@/types/social';

// ============================================================================
// STATE
// ============================================================================

/**
 * Current friends state
 *
 * Stores the user's friend list, pending requests, and recent activity feed.
 * Initialized from LocalStorage on app load.
 *
 * @internal
 */
export const friendsState = atom<FriendState>({
  friends: [],
  pendingRequests: [],
  sentRequests: [],
  recentActivity: [],
});

/**
 * Friend system configuration
 *
 * Stores limits and settings for the friend system (max friends, activity feed size, etc.).
 *
 * @internal
 */
export const friendConfig = atom<FriendConfig>(DEFAULT_FRIEND_CONFIG);

// ============================================================================
// COMPUTED STATE
// ============================================================================

/**
 * Derived state: Computed friend count
 *
 * Returns the current number of accepted friends.
 * Used for UI display and validation against maxFriends limit.
 *
 * @returns Current friend count
 *
 * @example
 * ```ts
 * import { friendCount } from '@/stores/friends';
 *
 * console.log(`You have ${friendCount.get()} friends`);
 * ```
 */
export const friendCount = computed(friendsState, (state) => state.friends.length);

/**
 * Derived state: Pending friend requests count
 *
 * Returns the number of friend requests awaiting the user's response.
 * Used for notification badges and UI indicators.
 *
 * @returns Number of pending requests
 *
 * @example
 * ```ts
 * import { pendingRequestCount } from '@/stores/friends';
 *
 * if (pendingRequestCount.get() > 0) {
 *   console.log('You have pending friend requests');
 * }
 * ```
 */
export const pendingRequestCount = computed(
  friendsState,
  (state) => state.pendingRequests.length
);

/**
 * Derived state: Recent activity feed (limited by config)
 *
 * Returns the most recent friend activities, limited to the configured feed size.
 * Activities are sorted by timestamp (newest first).
 *
 * @returns Recent friend activities
 *
 * @example
 * ```ts
 * import { recentActivityFeed } from '@/stores/friends';
 *
 * const activities = recentActivityFeed.get();
 * activities.forEach(activity => {
 *   console.log(`${activity.playerName} ${activity.activityType}`);
 * });
 * ```
 */
export const recentActivityFeed = computed(friendsState, (state) => {
  const maxSize = friendConfig.get().activityFeedSize;
  return state.recentActivity.slice(0, maxSize);
});

/**
 * Derived state: Online friends count
 *
 * Returns the number of friends currently online (based on their last activity).
 * A friend is considered online if they were active within the last 5 minutes.
 *
 * @returns Number of online friends
 *
 * @example
 * ```ts
 * import { onlineFriendCount } from '@/stores/friends';
 *
 * console.log(`${onlineFriendCount.get()} friends online`);
 * ```
 */
export const onlineFriendCount = computed(friendsState, (state) => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return state.friends.filter(
    (friend) => friend.lastOnline && friend.lastOnline > fiveMinutesAgo
  ).length;
});

// ============================================================================
// ACTIONS: Friend Management
// ============================================================================

/**
 * Add a friend to the friends list
 *
 * Adds a new friend to the user's friends list. Validates against the maxFriends limit.
 *
 * @param friend - The friend profile to add
 * @throws Error if maxFriends limit reached
 *
 * @example
 * ```ts
 * import { addFriend } from '@/stores/friends';
 *
 * const newFriend: FriendProfile = {
 *   id: 'player_123',
 *   username: 'BBQ_King',
 *   avatar: 'avatar_bbq',
 *   stats: { totalCards: 100, packsOpened: 20, rarePulls: 5, level: 10 },
 *   lastOnline: new Date(),
 *   isOnline: true,
 * };
 *
 * addFriend(newFriend);
 * ```
 */
export function addFriend(friend: FriendProfile): void {
  const state = friendsState.get();
  const config = friendConfig.get();

  if (state.friends.length >= config.maxFriends) {
    throw new Error(`Maximum friend limit (${config.maxFriends}) reached`);
  }

  friendsState.set({
    ...state,
    friends: [...state.friends, friend],
  });
}

/**
 * Remove a friend from the friends list
 *
 * Removes a friend by their player ID.
 *
 * @param playerId - The player ID of the friend to remove
 *
 * @example
 * ```ts
 * import { removeFriend } from '@/stores/friends';
 *
 * removeFriend('player_123');
 * ```
 */
export function removeFriend(playerId: string): void {
  const state = friendsState.get();
  friendsState.set({
    ...state,
    friends: state.friends.filter((f) => f.id !== playerId),
  });
}

/**
 * Update friend's online status
 *
 * Updates a friend's online status and last online timestamp.
 * Automatically called when activity is tracked.
 *
 * @param playerId - The player ID to update
 * @param isOnline - New online status
 *
 * @example
 * ```ts
 * import { updateFriendOnlineStatus } from '@/stores/friends';
 *
 * updateFriendOnlineStatus('player_123', true);
 * ```
 */
export function updateFriendOnlineStatus(
  playerId: string,
  isOnline: boolean
): void {
  const state = friendsState.get();
  const updatedFriends = state.friends.map((friend) =>
    friend.id === playerId
      ? { ...friend, isOnline, lastOnline: new Date() }
      : friend
  );

  friendsState.set({
    ...state,
    friends: updatedFriends,
  });
}

// ============================================================================
// ACTIONS: Activity Tracking
// ============================================================================

/**
 * Track friend activity and add to activity feed
 *
 * Records a friend's activity (pack opened, achievement unlocked, etc.) and adds it
 * to the recent activity feed. Activities are sorted by timestamp (newest first).
 * Older activities beyond the feed size limit are automatically removed.
 *
 * This function is called whenever a friend performs a trackable action.
 * It validates the activity type and details before adding to the feed.
 *
 * @param playerId - The player ID who performed the activity
 * @param playerName - The player's display name
 * @param activityType - The type of activity (pack_opened, achievement_unlocked, etc.)
 * @param details - Optional activity-specific details (card name, achievement, etc.)
 *
 * @returns The created activity object
 *
 * @example
 * ```ts
 * import { trackFriendActivity } from '@/stores/friends';
 *
 * // Track when a friend opens a pack
 * const activity = trackFriendActivity(
 *   'player_123',
 *   'BBQ_King',
 *   'pack_opened',
 *   {
 *     cardName: 'Grillmaster Gary',
 *     cardRarity: 'legendary',
 *   }
 * );
 *
 * console.log(`Activity tracked: ${activity.id}`);
 * ```
 *
 * @example
 * ```ts
 * // Track when a friend unlocks an achievement
 * trackFriendActivity(
 *   'player_456',
 *   'Fix_It_Frank',
 *   'achievement_unlocked',
 *   {
 *     achievementName: 'Master Grill',
 *     achievementRarity: 'epic',
 *   }
 * );
 * ```
 *
 * @see {@link FRIEND_ACTIVITY_CONFIG} for valid activity types and their configurations
 */
export function trackFriendActivity(
  playerId: string,
  playerName: string,
  activityType: FriendActivityType,
  details?: FriendActivityDetails
): FriendActivity {
  const state = friendsState.get();

  // Validate activity type
  const validTypes: FriendActivityType[] = [
    'pack_opened',
    'achievement_unlocked',
    'rare_pull',
    'trade_completed',
    'level_up',
  ];

  if (!validTypes.includes(activityType)) {
    throw new Error(`Invalid activity type: ${activityType}`);
  }

  // Create new activity
  const newActivity: FriendActivity = {
    id: `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    playerId,
    playerName,
    activityType,
    timestamp: new Date(),
    details: details || {},
  };

  // Add to feed (newest first)
  const updatedActivity = [newActivity, ...state.recentActivity];

  // Limit to feed size
  const maxSize = friendConfig.get().activityFeedSize;
  const limitedActivity = updatedActivity.slice(0, maxSize);

  friendsState.set({
    ...state,
    recentActivity: limitedActivity,
  });

  // Update friend's online status
  updateFriendOnlineStatus(playerId, true);

  return newActivity;
}

/**
 * Clear old activities from the feed
 *
 * Removes activities older than the specified number of days.
 * Useful for periodic cleanup to keep the feed fresh.
 *
 * @param daysOld - Remove activities older than this many days (default: 7)
 *
 * @example
 * ```ts
 * import { clearOldActivities } from '@/stores/friends';
 *
 * // Remove activities older than 7 days
 * clearOldActivities(7);
 * ```
 */
export function clearOldActivities(daysOld: number = 7): void {
  const state = friendsState.get();
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

  const filteredActivity = state.recentActivity.filter(
    (activity) => activity.timestamp > cutoffDate
  );

  friendsState.set({
    ...state,
    recentActivity: filteredActivity,
  });
}

// ============================================================================
// ACTIONS: Stats Comparison
// ============================================================================

/**
 * Compare player stats with a friend's stats
 *
 * Calculates the difference between the player's stats and a friend's stats.
 * Returns a detailed comparison showing who leads in each category and by how much.
 *
 * This function is useful for social features where players can compare their
 * progress with friends. It calculates differences for:
 * - Total cards owned
 * - Total packs opened
 * - Rare pulls (epic+ cards)
 * - Level/experience
 *
 * @param yourStats - The player's current stats
 * @param friendStats - The friend's stats to compare against
 * @param friendName - Optional friend's display name (for display purposes)
 *
 * @returns Stats comparison object with differences calculated
 *
 * @example
 * ```ts
 * import { compareStats } from '@/stores/friends';
 *
 * const myStats: PlayerProfile['stats'] = {
 *   totalCards: 450,
 *   packsOpened: 125,
 *   rarePulls: 15,
 *   level: 25,
 * };
 *
 * const friendStats: PlayerProfile['stats'] = {
 *   totalCards: 380,
 *   packsOpened: 140,
 *   rarePulls: 22,
 *   level: 28,
 * };
 *
 * const comparison = compareStats(myStats, friendStats, 'BBQ_King');
 *
 * console.log(`You have ${comparison.comparison.totalCardsDifference} more cards`);
 * console.log(`They have opened ${Math.abs(comparison.comparison.packsOpenedDifference)} more packs`);
 * ```
 *
 * @example
 * ```ts
 * // Display comparison in UI
 * const comparison = compareStats(playerStats, friend.stats, friend.username);
 *
 * if (comparison.comparison.totalCardsDifference > 0) {
 *   console.log(`You have ${comparison.comparison.totalCardsDifference} more cards!`);
 * } else if (comparison.comparison.totalCardsDifference < 0) {
 *   console.log(`${friendName} has ${Math.abs(comparison.comparison.totalCardsDifference)} more cards!`);
 * } else {
 *   console.log('You both have the same number of cards!');
 * }
 * ```
 *
 * @returns A FriendStatsComparison object containing:
 * - `yourStats`: Your stats (input parameter)
 * - `friendStats`: Friend's stats (input parameter)
 * - `comparison`: Calculated differences (positive = you lead, negative = friend leads)
 */
export function compareStats(
  yourStats: PlayerProfile['stats'],
  friendStats: PlayerProfile['stats'],
  friendName?: string
): FriendStatsComparison {
  const comparison: StatsComparison = {
    totalCardsDifference: yourStats.totalCards - friendStats.totalCards,
    packsOpenedDifference: yourStats.packsOpened - friendStats.packsOpened,
    rarePullsDifference: yourStats.rarePulls - friendStats.rarePulls,
    levelDifference: yourStats.level - friendStats.level,
  };

  return {
    yourStats,
    friendStats,
    comparison,
  };
}

/**
 * Get a leaderboard-style ranking of friends by a specific stat
 *
 * Sorts the player and their friends by a specific stat category.
 * Useful for displaying "Who has the most cards?" or "Who has opened the most packs?"
 *
 * @param yourStats - The player's stats to include in ranking
 * @param statKey - The stat to rank by ('totalCards', 'packsOpened', 'rarePulls', 'level')
 * @returns Array of players sorted by the specified stat (highest first)
 *
 * @example
 * ```ts
 * import { getFriendLeaderboard } from '@/stores/friends';
 *
 * const leaderboard = getFriendLeaderboard(myStats, 'totalCards');
 * // Returns: [
 * //   { name: 'You', value: 450 },
 * //   { name: 'BBQ_King', value: 380 },
 * //   { name: 'Fix_It_Frank', value: 295 }
 * // ]
 * ```
 */
export function getFriendLeaderboard(
  yourStats: PlayerProfile['stats'],
  statKey: keyof PlayerProfile['stats']
): Array<{ name: string; value: number; isYou: boolean }> {
  const state = friendsState.get();

  const rankings = [
    { name: 'You', value: yourStats[statKey], isYou: true },
    ...state.friends.map((friend) => ({
      name: friend.username,
      value: friend.stats[statKey],
      isYou: false,
    })),
  ];

  // Sort by value (highest first)
  rankings.sort((a, b) => b.value - a.value);

  return rankings;
}

// ============================================================================
// ACTIONS: Friend Requests
// ============================================================================

/**
 * Send a friend request
 *
 * Creates a new friend request and adds it to the sent requests list.
 *
 * @param receiverId - The player ID to send the request to
 * @param receiverName - The receiver's display name
 * @param message - Optional message to include with the request
 *
 * @returns The created friend request object
 *
 * @example
 * ```ts
 * import { sendFriendRequest } from '@/stores/friends';
 *
 * const request = sendFriendRequest(
 *   'player_123',
 *   'BBQ_King',
 *   'Let\'s be friends!'
 * );
 *
 * console.log(`Request sent: ${request.id}`);
 * ```
 */
export function sendFriendRequest(
  receiverId: string,
  receiverName: string,
  message?: string
): FriendRequest {
  const state = friendsState.get();

  const newRequest: FriendRequest = {
    id: `request_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    senderId: 'you', // In a real app, this would be the actual player ID
    senderName: 'You',
    receiverId,
    receiverName,
    status: 'pending',
    createdAt: new Date(),
    message,
  };

  friendsState.set({
    ...state,
    sentRequests: [...state.sentRequests, newRequest],
  });

  return newRequest;
}

/**
 * Accept a friend request
 *
 * Accepts a pending friend request and adds the sender to the friends list.
 *
 * @param requestId - The request ID to accept
 *
 * @example
 * ```ts
 * import { acceptFriendRequest } from '@/stores/friends';
 *
 * acceptFriendRequest('request_1234567890_abc');
 * ```
 */
export function acceptFriendRequest(requestId: string): void {
  const state = friendsState.get();
  const request = state.pendingRequests.find((r) => r.id === requestId);

  if (!request) {
    throw new Error('Friend request not found');
  }

  // Add to friends list
  const newFriend: FriendProfile = {
    id: request.senderId,
    username: request.senderName,
    avatar: 'avatar_default', // Would be fetched from profile
    stats: {
      totalCards: 0,
      packsOpened: 0,
      rarePulls: 0,
      level: 0,
    },
    lastOnline: new Date(),
    isOnline: false,
  };

  addFriend(newFriend);

  // Remove from pending and update request status
  friendsState.set({
    ...state,
    pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId),
    sentRequests: state.sentRequests.map((r) =>
      r.id === requestId
        ? { ...r, status: 'accepted' as FriendRequestStatus, respondedAt: new Date() }
        : r
    ),
  });
}

/**
 * Reject a friend request
 *
 * Rejects a pending friend request and removes it from the pending list.
 *
 * @param requestId - The request ID to reject
 *
 * @example
 * ```ts
 * import { rejectFriendRequest } from '@/stores/friends';
 *
 * rejectFriendRequest('request_1234567890_abc');
 * ```
 */
export function rejectFriendRequest(requestId: string): void {
  const state = friendsState.get();

  friendsState.set({
    ...state,
    pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId),
    sentRequests: state.sentRequests.map((r) =>
      r.id === requestId
        ? { ...r, status: 'rejected' as FriendRequestStatus, respondedAt: new Date() }
        : r
    ),
  });
}

// ============================================================================
// ACTIONS: Friend Codes
// ============================================================================

/**
 * Generate a unique friend code
 *
 * Generates a random alphanumeric code for sharing with potential friends.
 * Friend codes are easier to share than player IDs.
 *
 * @returns A unique friend code
 *
 * @example
 * ```ts
 * import { generateFriendCode } from '@/stores/friends';
 *
 * const code = generateFriendCode();
 * console.log(`Your friend code: ${code}`);
 * // Output: "ABC12345"
 * ```
 */
export function generateFriendCode(): FriendCode {
  const config = friendConfig.get();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < config.friendCodeLength; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

// ============================================================================
// PERSISTENCE
// ============================================================================

/**
 * Save friends state to LocalStorage
 *
 * Persists the current friends state to browser storage.
 * Automatically called after state mutations.
 *
 * @internal
 */
export function saveToStorage(): void {
  if (typeof window === 'undefined') return;

  const state = friendsState.get();
  localStorage.setItem('daddeck-friends', JSON.stringify(state));
}

/**
 * Load friends state from LocalStorage
 *
 * Restores friends state from browser storage on app initialization.
 *
 * @internal
 */
export function loadFromStorage(): void {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem('daddeck-friends');
  if (stored) {
    try {
      const state = JSON.parse(stored);
      friendsState.set(state);
    } catch (error) {
      console.error('Failed to load friends state:', error);
    }
  }
}

// Auto-save on state changes
friendsState.subscribe(() => {
  saveToStorage();
});

// Auto-load on initialization
if (typeof window !== 'undefined') {
  loadFromStorage();
}
