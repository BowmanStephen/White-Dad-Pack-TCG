import type { Pack, Collection, CollectionStats } from './collection';

// Achievement rarity levels
export type AchievementRarity = 'bronze' | 'silver' | 'gold' | 'platinum';

// Achievement categories
export type AchievementCategory = 'collection' | 'battle' | 'social' | 'special';

// Achievement interface
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  category: AchievementCategory;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  hidden?: boolean; // If true, achievement details are hidden until unlocked
  hint?: string; // Hint shown on hover for hidden achievements
}

// Achievement state for tracking
export interface AchievementState {
  achievements: Achievement[];
  recentlyUnlocked: string[];
}

// Achievement context for checking conditions
export interface AchievementContext {
  pack: Pack | null;
  collection: Collection;
  stats: CollectionStats;
}

// Achievement configuration
export interface AchievementConfig {
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  category: AchievementCategory;
  maxProgress?: number;
  checkCondition: (context: AchievementContext) => boolean;
  getProgress?: (context: AchievementContext) => number;
  hidden?: boolean; // If true, achievement details are hidden until unlocked
  hint?: string; // Hint shown on hover for hidden achievements
}

// Achievement rarity configuration (for visual effects)
export interface AchievementRarityConfig {
  name: string;
  color: string;
  borderColor: string;
  glowColor: string;
  bgColor: string;
}

// Achievement rarity configurations map
export const ACHIEVEMENT_RARITY_CONFIG: Record<AchievementRarity, AchievementRarityConfig> = {
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
  platinum: {
    name: 'Platinum',
    color: '#e5e4e2',
    borderColor: '#f0eff0',
    glowColor: 'rgba(229, 228, 226, 0.7)',
    bgColor: 'rgba(229, 228, 226, 0.15)',
  },
};

// Achievement category display names
export const ACHIEVEMENT_CATEGORY_NAMES: Record<AchievementCategory, string> = {
  collection: 'Collection',
  battle: 'Battle',
  social: 'Social',
  special: 'Special',
};
