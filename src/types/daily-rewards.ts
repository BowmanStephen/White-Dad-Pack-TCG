// ============================================================================
// DAILY REWARDS TYPES (US074 - Daily Rewards - Pack Incentive)
// ============================================================================

// Daily reward types
export type DailyRewardType = 'pack' | 'boosted_pack' | 'cards' | 'currency';

// Daily reward interface
export interface DailyReward {
  day: number;                  // Day number in current streak (1-based)
  claimed: boolean;             // Whether reward has been claimed
  claimedAt?: Date;             // When reward was claimed
  rewardType: DailyRewardType;  // Type of reward
  rewardValue: number;          // Value (e.g., pack count, card count)
  bonusMultiplier?: number;     // Streak bonus multiplier (1.0 = normal)
}

// Daily rewards state
export interface DailyRewardsState {
  currentStreak: number;        // Current login streak (days)
  longestStreak: number;        // Longest streak achieved
  lastLoginDate: Date | null;   // Last login date (for streak calculation)
  nextClaimTime: Date;          // When next reward can be claimed
  totalClaimed: number;         // Total rewards claimed all-time
  rewards: DailyReward[];       // Current streak rewards
  consecutiveDays: number;      // Days in current streak
  missedDay: boolean;           // Whether user missed a day (resets streak)
}

// Daily reward tier configuration
export interface DailyRewardTier {
  day: number;                  // Day in streak
  rewardType: DailyRewardType;  // Type of reward
  baseValue: number;            // Base reward value
  description: string;          // Reward description
  icon: string;                 // Icon/emoji
}

// Streak bonus configuration
export interface StreakBonus {
  threshold: number;            // Streak length required
  multiplier: number;           // Bonus multiplier
  description: string;          // Bonus description
}
