import type { Rarity, PackCard, DadType, AvatarId, Badge, BadgeCategory, BadgeRarity, PlayerProfile } from './core';

// ============================================================================
// TRADE OFFER TYPES (US078 - Card Trading - Trade Offer System)
// ============================================================================

export type TradeStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface TradeOffer {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  offeredCards: TradeCard[];
  requestedCards: TradeCard[];
  status: TradeStatus;
  createdAt: Date;
  expiresAt: Date;
  message?: string;
}

export interface TradeCard {
  cardId: string;
  name: string;
  rarity: Rarity;
  isHolo: boolean;
  holoVariant: string;
}

export interface TradeHistoryEntry {
  id: string;
  tradeId: string;
  partnerName: string;
  cardsGiven: TradeCard[];
  cardsReceived: TradeCard[];
  timestamp: Date;
  status: TradeStatus;
}

export interface TradeState {
  incomingOffers: TradeOffer[];
  outgoingOffers: TradeOffer[];
  history: TradeHistoryEntry[];
  canTrade: boolean;
}

export interface TradeConfig {
  maxOffersPerPlayer: number;
  offerExpirationHours: number;
  requireMutualAgreement: boolean;
}

export const DEFAULT_TRADE_CONFIG: TradeConfig = {
  maxOffersPerPlayer: 10,
  offerExpirationHours: 48,
  requireMutualAgreement: true,
};

// ============================================================================
// FRIEND SYSTEM TYPES (US089 - Friend System - Social Connections)
// ============================================================================

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export type FriendActivityType =
  | 'pack_opened'
  | 'achievement_unlocked'
  | 'rare_pull'
  | 'trade_completed'
  | 'level_up';

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  status: FriendRequestStatus;
  createdAt: Date;
  respondedAt?: Date;
  message?: string;
}

export interface FriendProfile {
  id: string;
  username: string;
  avatar: AvatarId;
  badges: Badge[];
  bio?: string;
  isOnline: boolean;
  lastSeen: Date;
  stats: {
    totalPacksOpened: number;
    totalCardsCollected: number;
  };
}

export interface FriendActivity {
  id: string;
  playerId: string;
  playerName: string;
  activityType: FriendActivityType;
  timestamp: Date;
  details: FriendActivityDetails;
}

export interface FriendActivityDetails {
  cardName?: string;
  cardRarity?: Rarity;
  achievementName?: string;
  achievementCategory?: BadgeCategory;
  achievementRarity?: BadgeRarity;
  tradePartner?: string;
  newLevel?: number;
}

export interface FriendCollectionView {
  playerId: string;
  playerName: string;
  cards: PackCard[];
  totalCards: number;
  uniqueCards: number;
  lastUpdated: Date;
}

export interface FriendStatsComparison {
  yourStats: PlayerProfile['stats'];
  friendStats: PlayerProfile['stats'];
  comparison: StatsComparison;
}

export interface StatsComparison {
  packsOpenedDifference: number;
  cardsCollectedDifference: number;
  rarePullsDifference: number;
}

export interface FriendState {
  friends: FriendProfile[];
  pendingRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  recentActivity: FriendActivity[];
}

export type FriendCode = string;

export interface FriendConfig {
  maxFriends: number;
  friendCodeLength: number;
  activityFeedSize: number;
  enableOnlineStatus: boolean;
}

export const DEFAULT_FRIEND_CONFIG: FriendConfig = {
  maxFriends: 100,
  friendCodeLength: 8,
  activityFeedSize: 50,
  enableOnlineStatus: true,
};

export const FRIEND_ACTIVITY_CONFIG: Record<FriendActivityType, { icon: string; title: string; color: string }> = {
  pack_opened: { icon: '📦', title: 'opened a pack', color: '#3b82f6' },
  achievement_unlocked: { icon: '🏆', title: 'unlocked an achievement', color: '#fbbf24' },
  rare_pull: { icon: '✨', title: 'pulled a rare card', color: '#a855f7' },
  trade_completed: { icon: '🤝', title: 'completed a trade', color: '#10b981' },
  level_up: { icon: '⬆️', title: 'leveled up', color: '#f97316' },
};

// ============================================================================
// PROFILE SYSTEM TYPES (US088 - Profile System - Customization)
// ============================================================================

// These are already in core.ts, but we'll add profile-specific configs

export interface BadgeRarityConfig {
  name: string;
  color: string;
  icon: string;
}

export const BADGE_RARITY_CONFIG: Record<BadgeRarity, BadgeRarityConfig> = {
  bronze: {
    name: 'Bronze',
    color: '#cd7f32',
    icon: '🥉',
  },
  silver: {
    name: 'Silver',
    color: '#c0c0c0',
    icon: '🥈',
  },
  gold: {
    name: 'Gold',
    color: '#ffd700',
    icon: '🥇',
  },
  diamond: {
    name: 'Diamond',
    color: '#b9f2ff',
    icon: '💎',
  },
};

export const BADGE_CATEGORY_NAMES: Record<BadgeCategory, string> = {
  collection: 'Collection',
  trading: 'Trading',
  social: 'Social',
  achievement: 'Achievement',
  seasonal: 'Seasonal',
};

export const PROFILE_BADGES: Badge[] = [
  // Collection Badges
  {
    id: 'first_pack',
    name: 'Pack Opener',
    description: 'Open your first pack',
    rarity: 'bronze',
    category: 'collection',
    icon: '📦',
    requirement: 'Open 1 pack',
  },
  {
    id: 'collector_100',
    name: 'Collector',
    description: 'Collect 100 unique cards',
    rarity: 'silver',
    category: 'collection',
    icon: '🃏',
    requirement: 'Collect 100 unique cards',
  },
  // Trading Badges
  {
    id: 'first_trade',
    name: 'Trader',
    description: 'Complete your first trade',
    rarity: 'bronze',
    category: 'trading',
    icon: '🤝',
    requirement: 'Complete 1 trade',
  },
  // Social Badges
  {
    id: 'friend_10',
    name: 'Friendly',
    description: 'Add 10 friends',
    rarity: 'bronze',
    category: 'social',
    icon: '👥',
    requirement: 'Add 10 friends',
  },
  // Achievement Badges
  {
    id: 'achievement_10',
    name: 'Achiever',
    description: 'Unlock 10 achievements',
    rarity: 'silver',
    category: 'achievement',
    icon: '🏆',
    requirement: 'Unlock 10 achievements',
  },
];

// ============================================================================
// COMMUNITY VOTING TYPES (US087 - Community - Card Voting)
// ============================================================================

export type VotingStatus = 'active' | 'completed' | 'upcoming';

export interface CardConcept {
  id: string;
  name: string;
  dadType: DadType;
  rarity: Rarity;
  description: string;
  stats: Partial<Record<keyof import('./core').CardStats, number>>;
  submittedBy: string;
  upvotes: number;
  downvotes: number;
}

export interface VotingEvent {
  id: string;
  name: string;
  description: string;
  status: VotingStatus;
  startDate: Date;
  endDate: Date;
  concepts: CardConcept[];
  winners: CardConcept[];
}

export interface Vote {
  conceptId: string;
  playerId: string;
  vote: 'upvote' | 'downvote';
  timestamp: Date;
}

export interface VotingHistoryEntry {
  eventId: string;
  eventName: string;
  participated: boolean;
  votedConcepts: string[];
  timestamp: Date;
}

export interface VotingState {
  activeEvents: VotingEvent[];
  completedEvents: VotingEvent[];
  upcomingEvents: VotingEvent[];
  userVotes: Vote[];
  history: VotingHistoryEntry[];
}

export interface VotingConfig {
  maxConceptsPerEvent: number;
  votingDuration: number;    // Days
  conceptsPerPlayer: number;
  allowSelfVote: boolean;
}

export const DEFAULT_VOTING_CONFIG: VotingConfig = {
  maxConceptsPerEvent: 10,
  votingDuration: 7,
  conceptsPerPlayer: 3,
  allowSelfVote: false,
};
