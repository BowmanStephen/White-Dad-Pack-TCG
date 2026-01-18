import type { Rarity, HoloVariant, DadType } from './card';
import type { SortOption } from './constants';

// Daily reward types
export type DailyRewardType = 'pack' | 'boosted_pack' | 'cards' | 'currency';

// Daily reward interface
export interface DailyReward {
  day: number;
  claimed: boolean;
  claimedAt?: Date;
  rewardType: DailyRewardType;
  rewardValue: number;
  bonusMultiplier?: number;
}

// Daily rewards state
export interface DailyRewardsState {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: Date | null;
  nextClaimTime: Date;
  totalClaimed: number;
  rewards: DailyReward[];
  consecutiveDays: number;
  missedDay: boolean;
}

// Daily reward tier configuration
export interface DailyRewardTier {
  day: number;
  rewardType: DailyRewardType;
  baseValue: number;
  description: string;
  icon: string;
}

// Streak bonus configuration
export interface StreakBonus {
  threshold: number;
  multiplier: number;
  description: string;
}

// ============================================================================
// ADVANCED SEARCH TYPES (US077 - Card Search - Advanced Filters)
// ============================================================================

// Stat range filter interface (min-max for each stat)
export interface StatRangeFilter {
  min: number;
  max: number;
}

// All stat ranges for filtering
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

// Advanced search filters interface
export interface AdvancedSearchFilters {
  searchTerm: string;
  rarity: Rarity | null;
  holoVariants: Set<HoloVariant>;
  selectedTypes: Set<DadType>;
  statRanges: StatRanges;
}

// Saved search preset interface
export interface SavedSearchPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  filters: AdvancedSearchFilters;
}
