import { computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type {
  DailyReward,
  DailyRewardsState,
  DailyRewardTier,
  DailyRewardType,
  StreakBonus,
} from '../types';
import { trackEvent } from './analytics';

// ============================================================================
// DAILY REWARDS CONFIGURATION
// ============================================================================

// Daily reward tier configuration (7-day cycle with escalating rewards)
export const DAILY_REWARD_TIERS: DailyRewardTier[] = [
  {
    day: 1,
    rewardType: 'pack',
    baseValue: 1,
    description: '1 Standard Pack',
    icon: '🎁',
  },
  {
    day: 2,
    rewardType: 'pack',
    baseValue: 1,
    description: '1 Standard Pack',
    icon: '📦',
  },
  {
    day: 3,
    rewardType: 'cards',
    baseValue: 3,
    description: '3 Bonus Cards',
    icon: '🃏',
  },
  {
    day: 4,
    rewardType: 'pack',
    baseValue: 1,
    description: '1 Standard Pack',
    icon: '🎁',
  },
  {
    day: 5,
    rewardType: 'boosted_pack',
    baseValue: 1,
    description: '1 Boosted Pack (better odds)',
    icon: '✨',
  },
  {
    day: 6,
    rewardType: 'pack',
    baseValue: 2,
    description: '2 Standard Packs',
    icon: '📦',
  },
  {
    day: 7,
    rewardType: 'boosted_pack',
    baseValue: 1,
    description: '1 Premium Pack (rare+ guaranteed)',
    icon: '🏆',
  },
];

// Streak bonus multipliers for consecutive days
export const STREAK_BONUSES: StreakBonus[] = [
  {
    threshold: 7,
    multiplier: 1.0,
    description: 'Weekly streak complete!',
  },
  {
    threshold: 14,
    multiplier: 1.2,
    description: '2-week streak: 20% bonus!',
  },
  {
    threshold: 30,
    multiplier: 1.5,
    description: '30-day streak: 50% bonus!',
  },
  {
    threshold: 100,
    multiplier: 2.0,
    description: '100-day legend: 2x rewards!',
  },
];

// Custom encoder for DailyRewardsState (handles Date serialization)
const dailyRewardsEncoder = {
  encode(data: DailyRewardsState): string {
    return JSON.stringify(data, (_key, value) => {
      // Convert Date objects to ISO strings
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
  },
  decode(str: string): DailyRewardsState {
    const data = JSON.parse(str);
    // Convert ISO strings back to Date objects
    return {
      ...data,
      lastLoginDate: data.lastLoginDate ? new Date(data.lastLoginDate) : null,
      nextClaimTime: new Date(data.nextClaimTime),
      rewards: data.rewards.map((reward: DailyReward) => ({
        ...reward,
        claimedAt: reward.claimedAt ? new Date(reward.claimedAt) : undefined,
      })),
    };
  },
};

// ============================================================================
// DAILY REWARDS STATE
// ============================================================================

// Default daily rewards state
const DEFAULT_DAILY_REWARDS_STATE: DailyRewardsState = {
  currentStreak: 0,
  longestStreak: 0,
  lastLoginDate: null,
  nextClaimTime: getNextClaimTime(),
  totalClaimed: 0,
  rewards: generateRewardsForStreak(0),
  consecutiveDays: 0,
  missedDay: false,
};

// Daily rewards state with LocalStorage persistence
export const dailyRewards = persistentAtom<DailyRewardsState>(
  'daddeck-daily-rewards',
  DEFAULT_DAILY_REWARDS_STATE,
  dailyRewardsEncoder
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the next claim time (midnight tomorrow)
 */
function getNextClaimTime(): Date {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

/**
 * Get the start of today (midnight)
 */
function getStartOfToday(): Date {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Check if two dates are on the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get days between two dates
 */
function getDaysBetween(date1: Date, date2: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = date2.getTime() - date1.getTime();
  return Math.floor(diff / msPerDay);
}

/**
 * Generate rewards array for a given streak
 */
function generateRewardsForStreak(streak: number): DailyReward[] {
  const rewards: DailyReward[] = [];
  const currentDay = (streak % 7) + 1; // 1-7 cycle

  // Generate rewards for current 7-day cycle
  for (let i = 1; i <= 7; i++) {
    const tier = DAILY_REWARD_TIERS[i - 1];
    const isPastDay = i < currentDay;

    rewards.push({
      day: i,
      claimed: isPastDay,
      claimedAt: isPastDay ? new Date() : undefined,
      rewardType: tier.rewardType,
      rewardValue: tier.baseValue,
      bonusMultiplier: getStreakBonus(streak),
    });
  }

  return rewards;
}

/**
 * Get streak bonus multiplier for current streak
 */
export function getStreakBonus(streak: number): number {
  let bonus = 1.0;

  for (const bonusTier of STREAK_BONUSES) {
    if (streak >= bonusTier.threshold) {
      bonus = Math.max(bonus, bonusTier.multiplier);
    }
  }

  return bonus;
}

/**
 * Get current reward tier based on streak
 */
export function getCurrentRewardTier(streak: number): DailyRewardTier {
  const dayInCycle = (streak % 7);
  return DAILY_REWARD_TIERS[dayInCycle];
}

/**
 * Get next reward tier
 */
export function getNextRewardTier(streak: number): DailyRewardTier {
  const nextStreak = streak + 1;
  const dayInCycle = (nextStreak % 7);
  return DAILY_REWARD_TIERS[dayInCycle];
}

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

// Computed: Can user claim reward today?
export const canClaimToday = computed(dailyRewards, (state) => {
  const now = new Date();
  return now >= state.nextClaimTime;
});

// Computed: Time until next claim (in milliseconds)
export const timeUntilNextClaim = computed(dailyRewards, (state) => {
  const now = new Date();
  return Math.max(0, state.nextClaimTime.getTime() - now.getTime());
});

// Computed: Current streak progress (0-7, resets weekly)
export const streakProgress = computed(dailyRewards, (state) => {
  return state.currentStreak % 7;
});

// Computed: Days until next streak bonus
export const daysUntilNextBonus = computed(dailyRewards, (state) => {
  const currentStreak = state.currentStreak;

  for (const bonus of STREAK_BONUSES) {
    if (currentStreak < bonus.threshold) {
      return bonus.threshold - currentStreak;
    }
  }

  return 0; // Max bonus achieved
});

// Computed: Current streak bonus multiplier
export const currentStreakBonus = computed(dailyRewards, (state) => {
  return getStreakBonus(state.currentStreak);
});

// Computed: Today's reward
export const todaysReward = computed(dailyRewards, (state) => {
  const dayInCycle = state.currentStreak % 7;
  return state.rewards[dayInCycle];
});

// ============================================================================
// DAILY REWARDS ACTIONS
// ============================================================================

/**
 * Initialize daily rewards on app load
 * Checks for missed days and updates streak accordingly
 */
export function initializeDailyRewards(): void {
  const state = dailyRewards.get();
  const now = new Date();
  const today = getStartOfToday();

  // Check if user has ever logged in
  if (!state.lastLoginDate) {
    // First time user - initialize
    dailyRewards.set({
      ...state,
      lastLoginDate: today,
      nextClaimTime: getNextClaimTime(),
      currentStreak: 1,
      consecutiveDays: 1,
      rewards: generateRewardsForStreak(1),
    });

    // Check for achievements after initialization
    checkDailyAchievements();
    return;
  }

  // Check if last login was today
  if (isSameDay(state.lastLoginDate, today)) {
    // Already logged in today - nothing to do
    return;
  }

  // Calculate days since last login
  const daysSinceLastLogin = getDaysBetween(state.lastLoginDate, today);

  if (daysSinceLastLogin === 1) {
    // Consecutive day - increment streak
    const newStreak = state.currentStreak + 1;
    dailyRewards.set({
      ...state,
      lastLoginDate: today,
      nextClaimTime: getNextClaimTime(),
      currentStreak: newStreak,
      consecutiveDays: state.consecutiveDays + 1,
      longestStreak: Math.max(state.longestStreak, newStreak),
      rewards: generateRewardsForStreak(newStreak),
      missedDay: false,
    });

    // Check for achievements on streak increase
    checkDailyAchievements();
  } else if (daysSinceLastLogin > 1) {
    // Missed a day - reset streak
    dailyRewards.set({
      ...state,
      lastLoginDate: today,
      nextClaimTime: getNextClaimTime(),
      currentStreak: 1,
      consecutiveDays: 0,
      rewards: generateRewardsForStreak(1),
      missedDay: true,
    });
  }
}

/**
 * Check daily reward achievements
 * Called when streak changes or reward is claimed
 */
function checkDailyAchievements(): void {
  if (typeof window === 'undefined') return;

  // Import dynamically to avoid circular dependency
  import('./achievements.js').then(({ checkAndUnlockAchievements, getAchievementContext }) => {
    const context = getAchievementContext();
    checkAndUnlockAchievements(context);
  });
}

/**
 * Claim daily reward
 * Returns the claimed reward or null if unable to claim
 */
export function claimDailyReward(): DailyReward | null {
  const state = dailyRewards.get();
  const now = new Date();

  // Check if can claim today
  if (now < state.nextClaimTime) {
    return null; // Not ready to claim yet
  }

  // Get current reward
  const dayInCycle = state.currentStreak % 7;
  const reward = state.rewards[dayInCycle];

  if (reward.claimed) {
    return null; // Already claimed
  }

  // Mark as claimed
  const updatedRewards = [...state.rewards];
  updatedRewards[dayInCycle] = {
    ...reward,
    claimed: true,
    claimedAt: now,
  };

  // Update state
  const newState: DailyRewardsState = {
    ...state,
    rewards: updatedRewards,
    totalClaimed: state.totalClaimed + 1,
    nextClaimTime: getNextClaimTime(),
  };

  dailyRewards.set(newState);

  // Track daily reward claim event
  trackEvent({
    type: 'daily_reward_claim',
    data: {
      rewardType: reward.rewardType,
      rewardValue: reward.rewardValue,
      streak: state.currentStreak,
      bonusMultiplier: reward.bonusMultiplier || 1.0,
    },
  } as any);

  // Check for daily reward achievements
  // Import dynamically to avoid circular dependency
  if (typeof window !== 'undefined') {
    import('./achievements.js').then(({ checkAndUnlockAchievements, getAchievementContext }) => {
      const context = getAchievementContext();
      checkAndUnlockAchievements(context);
    });
  }

  return { ...reward, claimedAt: now };
}

/**
 * Get formatted countdown string
 * Returns "HH:MM:SS" format
 */
export function getCountdownString(): string {
  const ms = timeUntilNextClaim.get();
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get next streak bonus
 * Returns the bonus tier or null if max bonus achieved
 */
export function getNextStreakBonus(): StreakBonus | null {
  const state = dailyRewards.get();
  const currentStreak = state.currentStreak;

  for (const bonus of STREAK_BONUSES) {
    if (currentStreak < bonus.threshold) {
      return bonus;
    }
  }

  return null; // Max bonus achieved
}

/**
 * Get current streak bonus tier
 * Returns the current bonus tier or null if no bonus yet
 */
export function getCurrentStreakBonusTier(): StreakBonus | null {
  const state = dailyRewards.get();
  const currentStreak = state.currentStreak;

  let currentBonus: StreakBonus | null = null;

  for (const bonus of STREAK_BONUSES) {
    if (currentStreak >= bonus.threshold) {
      currentBonus = bonus;
    }
  }

  return currentBonus;
}

/**
 * Reset daily rewards (for testing/debugging)
 */
export function resetDailyRewards(): void {
  dailyRewards.set(DEFAULT_DAILY_REWARDS_STATE);
  initializeDailyRewards();
}

/**
 * Get daily rewards summary for display
 */
export function getDailyRewardsSummary(): {
  currentStreak: number;
  longestStreak: number;
  totalClaimed: number;
  canClaim: boolean;
  nextReward: DailyRewardTier;
  currentBonus: StreakBonus | null;
  nextBonus: StreakBonus | null;
  countdown: string;
} {
  const state = dailyRewards.get();

  return {
    currentStreak: state.currentStreak,
    longestStreak: state.longestStreak,
    totalClaimed: state.totalClaimed,
    canClaim: canClaimToday.get(),
    nextReward: getNextRewardTier(state.currentStreak),
    currentBonus: getCurrentStreakBonusTier(),
    nextBonus: getNextStreakBonus(),
    countdown: getCountdownString(),
  };
}

// Initialize daily rewards on module load
if (typeof window !== 'undefined') {
  initializeDailyRewards();

  // Expose state to window for achievement checking
  // @ts-ignore - exposing for cross-module access
  window.__dailyRewardsState = dailyRewards.get();

  // Subscribe to changes and update window object
  dailyRewards.subscribe((state) => {
    // @ts-ignore - exposing for cross-module access
    window.__dailyRewardsState = state;
  });

  // Update countdown every second
  setInterval(() => {
    // Trigger reactivity by accessing computed property
    timeUntilNextClaim.get();
  }, 1000);
}
