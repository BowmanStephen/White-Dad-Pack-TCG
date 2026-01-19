// ============================================================================
// PROFILE SYSTEM TYPES (US088 - Profile System - Customization)
// ============================================================================

// Avatar options for player profiles (10 options as per acceptance criteria)
export type AvatarId =
  | 'grill_master'
  | 'fix_it'
  | 'golf_pro'
  | 'couch_potato'
  | 'lawn_care'
  | 'car_guy'
  | 'office_worker'
  | 'cool_dad'
  | 'coach'
  | 'chef_dad';

// Avatar configuration
export interface Avatar {
  id: AvatarId;
  emoji: string;
  name: string;
  description: string;
}

// Badge rarity levels
export type BadgeRarity = 'bronze' | 'silver' | 'gold' | 'diamond';

// Badge categories
export type BadgeCategory = 'collection' | 'trading' | 'social' | 'achievement' | 'seasonal';

// Badge interface (achievement badges for profile)
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  category: BadgeCategory;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

// Player profile (extends leaderboard UserProfile with customization)
export interface PlayerProfile {
  playerId: string;           // Unique player identifier (anonymous)
  pseudonym: string;          // Dad-themed pseudonym (e.g., "Gary 🍖")
  username: string;           // User-set custom username
  avatarId: AvatarId;         // Selected avatar ID
  bio: string;                // 140 character max bio text
  favoriteCardId: string | null; // ID of favorite card (for display)
  badges: Badge[];            // Unlocked badges
  // REMOVED: stats field (PlayerStats from leaderboard system)
  friends: string[];          // Friend player IDs
  createdAt: Date;            // When profile was created
  updatedAt: Date;            // Last profile update
}

// Profile settings (editable fields)
export interface ProfileSettings {
  username: string;
  avatarId: AvatarId;
  bio: string;
  favoriteCardId: string | null;
}

// Profile view mode (edit vs view)
export type ProfileViewMode = 'edit' | 'view';

// Profile state for UI
export interface ProfileState {
  profile: PlayerProfile | null;
  viewMode: ProfileViewMode;
  isSaving: boolean;
  error: string | null;
}

// Avatar configurations (10 options as per acceptance criteria)
export const AVATARS: Record<AvatarId, Avatar> = {
  grill_master: {
    id: 'grill_master',
    emoji: '🍖',
    name: 'Grill Master',
    description: 'King of the BBQ',
  },
  fix_it: {
    id: 'fix_it',
    emoji: '🔧',
    name: 'Fix-It Dad',
    description: 'Can repair anything',
  },
  golf_pro: {
    id: 'golf_pro',
    emoji: '⛳',
    name: 'Golf Pro',
    description: 'Always on the green',
  },
  couch_potato: {
    id: 'couch_potato',
    emoji: '🛋️',
    name: 'Couch Potato',
    description: 'Professional napper',
  },
  lawn_care: {
    id: 'lawn_care',
    emoji: '🌱',
    name: 'Lawn Care Dad',
    description: 'Grass doesn\'t mow itself',
  },
  car_guy: {
    id: 'car_guy',
    emoji: '🚗',
    name: 'Car Guy',
    description: 'Weekend warrior',
  },
  office_worker: {
    id: 'office_worker',
    emoji: '💼',
    name: 'Office Dad',
    description: 'Meetings in progress',
  },
  cool_dad: {
    id: 'cool_dad',
    emoji: '😎',
    name: 'Cool Dad',
    description: 'Still got it',
  },
  coach: {
    id: 'coach',
    emoji: '🏆',
    name: 'Coach Dad',
    description: 'Winning is everything',
  },
  chef_dad: {
    id: 'chef_dad',
    emoji: '👨‍🍳',
    name: 'Chef Dad',
    description: 'Master of the kitchen',
  },
};

// Badge rarity configuration (for visual effects)
export interface BadgeRarityConfig {
  name: string;
  color: string;
  borderColor: string;
  glowColor: string;
  bgColor: string;
}

// Badge rarity configurations map
export const BADGE_RARITY_CONFIG: Record<BadgeRarity, BadgeRarityConfig> = {
  bronze: {
    name: 'Bronze',
    color: '#cd7f32',
    borderColor: '#e5a85c',
    glowColor: 'rgba(205, 127, 50, 0.4)',
    bgColor: 'rgba(205, 127, 50, 0.1)',
  },
  silver: {
    name: 'Silver',
    color: '#c0c0c0',
    borderColor: '#e0e0e0',
    glowColor: 'rgba(192, 192, 192, 0.5)',
    bgColor: 'rgba(192, 192, 192, 0.1)',
  },
  gold: {
    name: 'Gold',
    color: '#ffd700',
    borderColor: '#ffe55c',
    glowColor: 'rgba(255, 215, 0, 0.6)',
    bgColor: 'rgba(255, 215, 0, 0.1)',
  },
  diamond: {
    name: 'Diamond',
    color: '#b9f2ff',
    borderColor: '#e0f7ff',
    glowColor: 'rgba(185, 242, 255, 0.7)',
    bgColor: 'rgba(185, 242, 255, 0.15)',
  },
};

// Badge category display names
export const BADGE_CATEGORY_NAMES: Record<BadgeCategory, string> = {
  collection: 'Collection Builder',
  trading: 'Master Trader',
  social: 'Social Butterfly',
  achievement: 'Achievement Hunter',
  seasonal: 'Seasonal Veteran',
};

// Predefined badges (achievements that can be unlocked)
export const PROFILE_BADGES: Badge[] = [
  // Collection badges
  {
    id: 'collector_starter',
    name: 'Pack Opener',
    description: 'Open your first pack',
    icon: '📦',
    rarity: 'bronze',
    category: 'collection',
  },
  {
    id: 'collector_10',
    name: 'Dedicated Collector',
    description: 'Open 10 packs',
    icon: '📚',
    rarity: 'bronze',
    category: 'collection',
    maxProgress: 10,
  },
  {
    id: 'collector_50',
    name: 'Pack Addict',
    description: 'Open 50 packs',
    icon: '🎁',
    rarity: 'silver',
    category: 'collection',
    maxProgress: 50,
  },
  {
    id: 'collector_100',
    name: 'Collection Master',
    description: 'Open 100 packs',
    icon: '👑',
    rarity: 'gold',
    category: 'collection',
    maxProgress: 100,
  },
  // Trading badges
  {
    id: 'trader_first',
    name: 'First Trade',
    description: 'Complete your first trade',
    icon: '🤝',
    rarity: 'bronze',
    category: 'trading',
  },
  {
    id: 'trader_10',
    name: 'Active Trader',
    description: 'Complete 10 trades',
    icon: '💱',
    rarity: 'silver',
    category: 'trading',
    maxProgress: 10,
  },
  // Social badges
  {
    id: 'social_friend',
    name: 'Making Friends',
    description: 'Add your first friend',
    icon: '👋',
    rarity: 'bronze',
    category: 'social',
  },
  {
    id: 'social_5_friends',
    name: 'Popular Dad',
    description: 'Add 5 friends',
    icon: '👨‍👩‍👧‍👦',
    rarity: 'silver',
    category: 'social',
    maxProgress: 5,
  },
  // Achievement badges
  {
    id: 'achievement_first',
    name: 'Achievement Unlocked',
    description: 'Unlock your first achievement',
    icon: '🏅',
    rarity: 'bronze',
    category: 'achievement',
  },
  {
    id: 'achievement_10',
    name: 'Achievement Hunter',
    description: 'Unlock 10 achievements',
    icon: '🎖️',
    rarity: 'gold',
    category: 'achievement',
    maxProgress: 10,
  },
  // Seasonal badges
  {
    id: 'season_1_veteran',
    name: 'Base Set Veteran',
    description: 'Participated in Season 1',
    icon: '📦',
    rarity: 'bronze',
    category: 'seasonal',
  },
];
