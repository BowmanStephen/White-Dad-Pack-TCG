import type { Rarity, PackCard, CardStats, DadType, HoloVariant } from './core';

// ============================================================================
// ACHIEVEMENT TYPES (US073 - Achievement System - Milestones)
// ============================================================================

// Achievement rarity levels
export type AchievementRarity = 'bronze' | 'silver' | 'gold' | 'platinum';

// Achievement categories
export type AchievementCategory = 'opening' | 'collection' | 'rare' | 'holo' | 'variety' | 'daily';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  rarity: AchievementRarity;
  category: AchievementCategory;
  requirement: {
    type: 'packs_opened' | 'cards_collected' | 'rarity_pulled' | 'holo_pulled' | 'unique_dad_types' | 'daily_streak';
    value: number;
    rarity?: Rarity;
  };
  reward: {
    type: 'pack' | 'cards' | 'title' | 'avatar';
    value: number | string;
  };
  unlocked: boolean;
  progress?: number;
  total?: number;
}

export interface AchievementState {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
  lastUnlockedAt?: Date;
}

export interface AchievementContext {
  packsOpened: number;
  cardsCollected: number;
  rarityPulls: Record<Rarity, number>;
  holoPulls: number;
  uniqueDadTypes: DadType[];
  dailyStreak: number;
}

export interface AchievementConfig {
  enableNotifications: boolean;
  autoClaimRewards: boolean;
  showProgress: boolean;
}

export interface AchievementRarityConfig {
  name: string;
  color: string;
  icon: string;
  points: number;
}

export const ACHIEVEMENT_RARITY_CONFIG: Record<AchievementRarity, AchievementRarityConfig> = {
  bronze: {
    name: 'Bronze',
    color: '#cd7f32',
    icon: '🥉',
    points: 10,
  },
  silver: {
    name: 'Silver',
    color: '#c0c0c0',
    icon: '🥈',
    points: 25,
  },
  gold: {
    name: 'Gold',
    color: '#ffd700',
    icon: '🥇',
    points: 50,
  },
  platinum: {
    name: 'Platinum',
    color: '#e5e4e2',
    icon: '💎',
    points: 100,
  },
};

export const ACHIEVEMENT_CATEGORY_NAMES: Record<AchievementCategory, string> = {
  opening: 'Opening',
  collection: 'Collection',
  rare: 'Rare Pulls',
  holo: 'Holo Pulls',
  variety: 'Variety',
  daily: 'Daily',
};

// ============================================================================
// DAILY REWARDS TYPES (US074 - Daily Rewards - Pack Incentive)
// ============================================================================

export type DailyRewardType = 'pack' | 'boosted_pack' | 'cards' | 'currency';

export interface DailyReward {
  day: number;
  type: DailyRewardType;
  value: number;
  description: string;
}

export interface DailyRewardsState {
  currentStreak: number;
  longestStreak: number;
  lastClaimedAt: Date | null;
  nextRewardAvailableAt: Date;
  totalClaimed: number;
}

export interface DailyRewardTier {
  streak: number;
  rewardMultiplier: number;
  bonusReward?: DailyReward;
}

export interface StreakBonus {
  threshold: number;      // Streak threshold
  multiplier: number;      // Reward multiplier
  description: string;
}

// ============================================================================
// ADVANCED SEARCH TYPES (US077 - Card Search - Advanced Filters)
// ============================================================================

export interface StatRangeFilter {
  min: number;
  max: number;
}

export interface StatRanges {
  dadJoke?: StatRangeFilter;
  grillSkill?: StatRangeFilter;
  fixIt?: StatRangeFilter;
  napPower?: StatRangeFilter;
  remoteControl?: StatRangeFilter;
  thermostat?: StatRangeFilter;
  sockSandal?: StatRangeFilter;
  beerSnob?: StatRangeFilter;
}

export interface AdvancedSearchFilters {
  rarities: Rarity[];
  dadTypes: DadType[];
  holoVariants: HoloVariant[];
  statRanges: StatRanges;
  searchText: string;
  includeUnowned: boolean;
}

export interface SavedSearchPreset {
  id: string;
  name: string;
  filters: AdvancedSearchFilters;
  createdAt: Date;
}

// ============================================================================
// NOTIFICATION TYPES (US081 - Notification System - Browser Push)
// ============================================================================

export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'achievement';

export type NotificationCategory = 'daily_reward' | 'trade' | 'achievement' | 'general';

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: NotificationAction;
  duration?: number;
}

export interface NotificationAction {
  label: string;
  action: () => void;
}

export interface NotificationPreferences {
  enableBrowser: boolean;
  enableInApp: boolean;
  categories: {
    daily_reward: boolean;
    trade: boolean;
    achievement: boolean;
    general: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
}

export interface NotificationState {
  notifications: Notification[];
  preferences: NotificationPreferences;
  unreadCount: number;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: number;
  data?: Record<string, unknown>;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
