import type { Rarity } from './core';
import type { PackCard } from './card';
import type { AvatarId, Badge } from './profile';

// ============================================================================
// FRIEND SYSTEM TYPES (US089 - Friend System - Social Connections)
// ============================================================================

// Friend request status
export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

// Friend activity types for activity feed
export type FriendActivityType =
  | 'opened_pack'
  | 'rare_pull'
  | 'epic_pull'
  | 'legendary_pull'
  | 'mythic_pull'
  | 'achievement_unlocked'
  | 'badge_unlocked'
  | 'trade_completed'
  | 'crafting_completed'
  | 'level_up';

// Friend request interface
export interface FriendRequest {
  id: string;                      // Unique request ID
  fromPlayerId: string;            // Player ID of sender
  toPlayerId: string;              // Player ID of recipient
  fromUsername: string;            // Username of sender
  fromAvatarId: AvatarId;          // Avatar ID of sender
  status: FriendRequestStatus;     // Current status
  createdAt: Date;                 // When request was sent
  respondedAt?: Date;              // When request was accepted/rejected
  message?: string;                // Optional message from sender
}

// Friend profile (public viewable data)
export interface FriendProfile {
  playerId: string;                // Player ID
  username: string;                // Custom username
  pseudonym: string;               // Dad-themed pseudonym
  avatarId: AvatarId;              // Avatar ID
  bio: string;                     // Bio text
  // REMOVED: stats field (PlayerStats from leaderboard system)
  badges: Badge[];                 // Unlocked badges (display only)
  isOnline: boolean;               // Online status
  lastActive: Date;                // Last activity timestamp
  friendCount: number;             // Number of friends
}

// Friend activity entry for activity feed
export interface FriendActivity {
  id: string;                      // Unique activity ID
  playerId: string;                // Player ID who performed activity
  username: string;                // Username of player
  avatarId: AvatarId;              // Avatar ID of player
  type: FriendActivityType;        // Type of activity
  details: FriendActivityDetails;  // Activity-specific details
  timestamp: Date;                 // When activity occurred
}

// Activity details based on type
export interface FriendActivityDetails {
  // For opened_pack
  packId?: string;
  cardCount?: number;

  // For rare_pull, epic_pull, legendary_pull, mythic_pull, level_up
  cardName?: string;
  cardRarity?: Rarity;
  isHolo?: boolean;

  // For achievement_unlocked, badge_unlocked
  achievementName?: string;
  badgeName?: string;

  // For trade_completed
  tradePartnerName?: string;
  cardsTraded?: number;

  // For crafting_completed
  recipeName?: string;
  success?: boolean;

  // For level_up specific
  newLevel?: number;
}

// Friend collection view (read-only access to friend's collection)
export interface FriendCollectionView {
  playerId: string;
  username: string;
  pseudonym: string;
  totalPacks: number;
  totalCards: number;
  uniqueCards: number;
  rarityBreakdown: Record<Rarity, number>;
  favoriteCards: PackCard[];       // Up to 3 favorite cards
  lastUpdated: Date;
}

// REMOVED: FriendStatsComparison and StatsComparison (depended on PlayerStats from leaderboard system)

// Friend state for UI
export interface FriendState {
  friends: FriendProfile[];        // All friends
  pendingRequests: FriendRequest[]; // Incoming friend requests
  sentRequests: FriendRequest[];   // Outgoing friend requests
  activities: FriendActivity[];    // Recent friend activities
  isFinderOpen: boolean;           // Friend finder modal state
  searchResults: FriendProfile[];  // Search results for adding friends
}

// Friend code format for sharing (e.g., "DAD-ABC123")
export type FriendCode = string;

// Friend configuration
export interface FriendConfig {
  maxFriends: number;              // Maximum friends allowed
  maxPendingRequests: number;      // Max pending requests
  activityFeedLimit: number;       // Max activities to show
  requestExpirationDays: number;   // Days before request expires
  allowStrangerRequests: boolean;  // Allow requests from non-friends
}

// Default friend configuration
export const DEFAULT_FRIEND_CONFIG: FriendConfig = {
  maxFriends: 100,
  maxPendingRequests: 20,
  activityFeedLimit: 50,
  requestExpirationDays: 7,
  allowStrangerRequests: true,
};

// Friend activity display configuration
export const FRIEND_ACTIVITY_CONFIG: Record<FriendActivityType, { icon: string; title: string; color: string }> = {
  opened_pack: { icon: '📦', title: 'opened a pack', color: '#3b82f6' },
  rare_pull: { icon: '⭐', title: 'pulled a Rare card', color: '#fbbf24' },
  epic_pull: { icon: '💜', title: 'pulled an Epic card', color: '#a855f7' },
  legendary_pull: { icon: '🔥', title: 'pulled a Legendary card', color: '#f97316' },
  mythic_pull: { icon: '💎', title: 'pulled a Mythic card', color: '#ec4899' },
  achievement_unlocked: { icon: '🏆', title: 'unlocked an achievement', color: '#22c55e' },
  badge_unlocked: { icon: '🎖️', title: 'earned a badge', color: '#fbbf24' },
  trade_completed: { icon: '🤝', title: 'completed a trade', color: '#06b6d4' },
  crafting_completed: { icon: '⚗️', title: 'crafted a card', color: '#8b5cf6' },
  level_up: { icon: '⬆️', title: 'upgraded a card', color: '#10b981' },
};
