import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type {
  DailyReward,
  DailyRewardsState,
  DailyRewardTier,
  StreakBonus
} from '@/types/daily-rewards';

// ============================================================================
// DEFAULT STATE
// ============================================================================

const DEFAULT_REWARDS: DailyReward[] = Array.from({ length: 7 }, (_, i) => ({
  day: i + 1,
  claimed: false,
  claimedAt: undefined,
  rewardType: i === 6 ? 'boosted_pack' : i === 4 ? 'cards' : 'pack',
  rewardValue: i === 6 ? 1 : i === 4 ? 1 : i === 3 ? 3 : i === 2 ? 2 : 1
}));

const DEFAULT_STATE: DailyRewardsState = {
  currentStreak: 0,
  longestStreak: 0,
  lastLoginDate: null,
  nextClaimTime: new Date(),
  totalClaimed: 0,
  rewards: DEFAULT_REWARDS,
  consecutiveDays: 0,
  missedDay: false
};

// ============================================================================
// CORE STORES
// ============================================================================

// Persistent daily rewards state
export const dailyRewardsState = persistentAtom<DailyRewardsState>(
  'daddeck-daily-rewards',
  DEFAULT_STATE,
  {
    encode: (value) => {
      return JSON.stringify(value, (_, v) =>
        v instanceof Date ? v.toISOString() : v
      );
    },
    decode: (str) => {
      try {
        const parsed = JSON.parse(str);
        // Convert ISO strings back to Date objects
        return {
          ...parsed,
          lastLoginDate: parsed.lastLoginDate ? new Date(parsed.lastLoginDate) : null,
          nextClaimTime: new Date(parsed.nextClaimTime),
          rewards: parsed.rewards.map((r: DailyReward) => ({
            ...r,
            claimedAt: r.claimedAt ? new Date(r.claimedAt) : undefined
          }))
        };
      } catch {
        return DEFAULT_STATE;
      }
    }
  }
);

// Computed stores for derived state
export const currentStreak = computed(
  dailyRewardsState,
  (state) => state.currentStreak
);

export const longestStreak = computed(
  dailyRewardsState,
  (state) => state.longestStreak
);

export const totalClaimed = computed(
  dailyRewardsState,
  (state) => state.totalClaimed
);

export const canClaimToday = computed(
  dailyRewardsState,
  (state) => {
    const today = new Date();
    const lastLogin = state.lastLoginDate;

    if (!lastLogin) return true;

    // Check if last login was from a different day
    return (
      today.getDate() !== lastLogin.getDate() ||
      today.getMonth() !== lastLogin.getMonth() ||
      today.getFullYear() !== lastLogin.getFullYear()
    );
  }
);

export const nextClaimAvailable = computed(
  dailyRewardsState,
  (state) => state.nextClaimTime
);

// Get current day (next unclaimed reward)
export const currentDay = computed(dailyRewardsState, (state) => {
  const unclaimedIndex = state.rewards.findIndex((r) => !r.claimed);
  return unclaimedIndex === -1 ? 7 : unclaimedIndex + 1;
});

// ============================================================================
// REWARD TIER CONFIGURATION
// ============================================================================

export const DAILY_REWARD_TIERS: DailyRewardTier[] = [
  {
    day: 1,
    rewardType: 'pack',
    baseValue: 1,
    description: 'Standard Pack',
    icon: '📦'
  },
  {
    day: 2,
    rewardType: 'pack',
    baseValue: 1,
    description: 'Standard Pack',
    icon: '📦'
  },
  {
    day: 3,
    rewardType: 'cards',
    baseValue: 3,
    description: '3 Common Cards',
    icon: '🃏'
  },
  {
    day: 4,
    rewardType: 'pack',
    baseValue: 2,
    description: '2 Standard Packs',
    icon: '📦'
  },
  {
    day: 5,
    rewardType: 'cards',
    baseValue: 1,
    description: '1 Rare Card',
    icon: '⭐'
  },
  {
    day: 6,
    rewardType: 'pack',
    baseValue: 1,
    description: '1 Premium Pack',
    icon: '🎁'
  },
  {
    day: 7,
    rewardType: 'boosted_pack',
    baseValue: 1,
    description: 'Mega Pack',
    icon: '🔥'
  }
];

// ============================================================================
// STREAK BONUS CONFIGURATION
// ============================================================================

export const STREAK_BONUSES: StreakBonus[] = [
  {
    threshold: 3,
    multiplier: 1.25,
    description: '3 Day Streak: 1.25x bonus'
  },
  {
    threshold: 5,
    multiplier: 1.5,
    description: '5 Day Streak: 1.5x bonus'
  },
  {
    threshold: 7,
    multiplier: 2.0,
    description: '7 Day Streak: 2x bonus'
  }
];

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Check daily login and update streak
 */
export function checkDailyLogin(): boolean {
  const state = dailyRewardsState.get();
  const now = new Date();
  const lastLogin = state.lastLoginDate;

  if (!lastLogin) {
    // First login ever
    dailyRewardsState.set({
      ...state,
      lastLoginDate: now,
      currentStreak: 1,
      consecutiveDays: 1,
      missedDay: false
    });
    return true;
  }

  // Check if logged in today already
  const isSameDay =
    now.getDate() === lastLogin.getDate() &&
    now.getMonth() === lastLogin.getMonth() &&
    now.getFullYear() === lastLogin.getFullYear();

  if (isSameDay) {
    return false; // Already checked in today
  }

  // Check if missed a day (more than 24 hours but less than 48)
  const hoursDiff = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
  const missedDay = hoursDiff > 48;

  // Update streak
  const newStreak = missedDay ? 1 : state.currentStreak + 1;
  const newLongestStreak = Math.max(state.longestStreak, newStreak);

  dailyRewardsState.set({
    ...state,
    lastLoginDate: now,
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    consecutiveDays: missedDay ? 1 : state.consecutiveDays + 1,
    missedDay
  });

  return true;
}

/**
 * Claim daily reward for the current day
 */
export function claimDailyReward(): DailyReward | null {
  const canClaim = canClaimToday.get();

  if (!canClaim) {
    return null; // Already claimed today
  }

  const state = dailyRewardsState.get();
  const day = currentDay.get();

  if (day > 7) {
    return null; // All rewards claimed
  }

  const rewardIndex = day - 1;
  const reward = state.rewards[rewardIndex];

  if (reward.claimed) {
    return null; // Already claimed
  }

  // Get streak bonus
  const streakBonus = getStreakBonus(state.currentStreak);

  // Update reward as claimed
  const updatedRewards = [...state.rewards];
  updatedRewards[rewardIndex] = {
    ...reward,
    claimed: true,
    claimedAt: new Date(),
    bonusMultiplier: streakBonus
  };

  // Calculate next claim time (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  dailyRewardsState.set({
    ...state,
    rewards: updatedRewards,
    totalClaimed: state.totalClaimed + 1,
    nextClaimTime: tomorrow
  });

  return updatedRewards[rewardIndex];
}

/**
 * Get streak bonus multiplier
 */
export function getStreakBonus(streak: number): number {
  for (const bonus of STREAK_BONUSES.sort((a, b) => b.threshold - a.threshold)) {
    if (streak >= bonus.threshold) {
      return bonus.multiplier;
    }
  }
  return 1.0;
}

/**
 * Reset daily rewards (for testing or new season)
 */
export function resetDailyRewards(): void {
  dailyRewardsState.set(DEFAULT_STATE);
}

/**
 * Get reward for a specific day
 */
export function getRewardForDay(day: number): DailyReward | null {
  const state = dailyRewardsState.get();
  return state.rewards[day - 1] || null;
}

/**
 * Check if all 7-day rewards are claimed
 */
export function isWeeklyCycleComplete(): boolean {
  const state = dailyRewardsState.get();
  return state.rewards.every((r) => r.claimed);
}

/**
 * Start new weekly cycle (resets rewards, keeps streak)
 */
export function startNewWeeklyCycle(): void {
  const state = dailyRewardsState.get();

  dailyRewardsState.set({
    ...state,
    rewards: DEFAULT_REWARDS,
    currentStreak: state.rewards.every((r) => r.claimed) ? state.currentStreak : 0
  });
}
