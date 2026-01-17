/**
 * DadPass Store (US094 - Monetization - Pass System)
 *
 * Manages DadPass subscription, tier progression, daily rewards, and premium pack distribution
 */

import { atom, map, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type {
  DadPassSubscription,
  DadPassTier,
  DadPassReward,
  DadPassPurchaseSession,
  DadPassSummary,
} from '../types';
import { DADPASS_TIERS, DEFAULT_DADPASS_CONFIG } from '../types';
import { addPremiumPackToInventory } from './premium';
import { trackEvent } from './analytics';

// ============================================================================
// STATE
// ============================================================================

// Active DadPass subscription (persisted to localStorage)
const defaultSubscription: DadPassSubscription = {
  status: 'inactive',
  startDate: new Date(),
  endDate: new Date(),
  autoRenew: false,
  currentTier: 0,
  totalXP: 0,
  xpToNextTier: 100,
  premiumPacksAwarded: 0,
};

// Custom encoder for DadPassSubscription (handles Date serialization)
const dadPassEncoder = {
  encode(data: DadPassSubscription): string {
    return JSON.stringify(data, (_key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
  },
  decode(str: string): DadPassSubscription {
    const data = JSON.parse(str);
    return {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      lastClaimDate: data.lastClaimDate ? new Date(data.lastClaimDate) : undefined,
      lastPremiumPackDate: data.lastPremiumPackDate ? new Date(data.lastPremiumPackDate) : undefined,
    };
  },
};

export const dadPassSubscription = persistentAtom<DadPassSubscription>(
  'daddypass-subscription',
  defaultSubscription,
  dadPassEncoder
);

// Available tiers (read-only from config)
export const dadPassTiers = atom<DadPassTier[]>(DADPASS_TIERS);

// Claimed reward IDs (persisted)
// Simple encoder for string array
const stringArrayEncoder = {
  encode(data: string[]): string {
    return JSON.stringify(data);
  },
  decode(str: string): string[] {
    return JSON.parse(str);
  },
};

export const claimedRewards = persistentAtom<string[]>('daddypass-claimed-rewards', [], stringArrayEncoder);

// Purchase session state
export const purchaseSession = map<{ data: DadPassPurchaseSession | null }>({ data: null });

// UI state
export const dadPassUI = map({
  isPurchaseModalOpen: false,
  isRewardModalOpen: false,
  selectedTier: null as number | null,
  processing: false,
  error: null as string | null,
});

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

// Is DadPass active?
export const isDadPassActive = computed(dadPassSubscription, (sub) => {
  const now = new Date();
  return sub.status === 'active' && sub.endDate > now;
});

// Days remaining in pass
export const daysRemaining = computed(dadPassSubscription, (sub) => {
  if (sub.status !== 'active') return 0;
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysLeft = Math.ceil((sub.endDate.getTime() - now.getTime()) / msPerDay);
  return Math.max(0, daysLeft);
});

// Current tier with rewards
export const currentTierData = computed(
  [dadPassSubscription, dadPassTiers],
  (sub, tiers) => {
    return tiers.find((t) => t.tier === sub.currentTier) || null;
  }
);

// Next tier
export const nextTierData = computed(
  [dadPassSubscription, dadPassTiers],
  (sub, tiers) => {
    return tiers.find((t) => t.tier === sub.currentTier + 1) || null;
  }
);

// Progress percentage to next tier
export const tierProgress = computed(dadPassSubscription, (sub) => {
  if (sub.currentTier >= DEFAULT_DADPASS_CONFIG.maxTier) return 100;
  const currentTier = DADPASS_TIERS.find((t) => t.tier === sub.currentTier);
  const nextTier = DADPASS_TIERS.find((t) => t.tier === sub.currentTier + 1);
  if (!currentTier || !nextTier) return 0;
  const xpRange = nextTier.xpRequired - currentTier.xpRequired;
  const xpProgress = sub.totalXP - currentTier.xpRequired;
  return Math.min(100, Math.max(0, (xpProgress / xpRange) * 100));
});

// Claimable rewards (unlocked but not claimed)
export const claimableRewards = computed(
  [dadPassSubscription, dadPassTiers, claimedRewards],
  (sub, tiers, claimed) => {
    const unlockedRewards: DadPassReward[] = [];
    for (const tier of tiers) {
      if (tier.tier <= sub.currentTier) {
        for (const reward of tier.rewards) {
          const rewardId = `${tier.tier}-${reward.rewardType}`;
          if (!claimed.includes(rewardId)) {
            unlockedRewards.push(reward);
          }
        }
      }
    }
    return unlockedRewards;
  }
);

// Total claimable reward count
export const claimableCount = computed(claimableRewards, (rewards) => rewards.length);

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Purchase DadPass (30-day subscription)
 * Creates new subscription and awards initial rewards
 */
export function purchaseDadPass(autoRenew: boolean = false): DadPassPurchaseSession {
  const sessionId = crypto.randomUUID();
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + DEFAULT_DADPASS_CONFIG.duration);

  const subscription: DadPassSubscription = {
    status: 'active',
    startDate: now,
    endDate,
    autoRenew,
    currentTier: 1, // Start at tier 1
    totalXP: 0,
    xpToNextTier: 100,
    premiumPacksAwarded: 0,
  };

  dadPassSubscription.set(subscription);

  const session: DadPassPurchaseSession = {
    sessionId,
    status: 'completed',
    timestamp: now,
    completedAt: now,
  };

  purchaseSession.set({ data: session });

  // Track purchase event
  trackEvent({
    type: 'daily_reward_claim', // Reusing existing event type for now
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    sessionId: crypto.randomUUID(),
  } as any);

  return session;
}

/**
 * Simulate DadPass purchase (for testing without Stripe)
 */
export function simulateDadPassPurchase(autoRenew: boolean = false): DadPassPurchaseSession {
  return purchaseDadPass(autoRenew);
}

/**
 * Add XP to DadPass
 * Returns true if tier increased
 */
export function addDadPassXP(xp: number): boolean {
  const sub = dadPassSubscription.get();
  if (sub.status !== 'active') return false;

  const oldTier = sub.currentTier;
  sub.totalXP += xp;

  // Calculate new tier
  let newTier = oldTier;
  for (const tier of DADPASS_TIERS) {
    if (sub.totalXP >= tier.xpRequired && tier.tier > newTier) {
      newTier = tier.tier;
    }
  }

  // Update next tier XP requirement
  const nextTier = DADPASS_TIERS.find((t) => t.tier === newTier + 1);
  sub.xpToNextTier = nextTier ? nextTier.xpRequired - sub.totalXP : 0;

  sub.currentTier = newTier;

  dadPassSubscription.set({ ...sub });

  return newTier > oldTier;
}

/**
 * Claim tier reward
 * Returns claimed reward or null if unable to claim
 */
export function claimTierReward(tier: number, rewardType: string): DadPassReward | null {
  const sub = dadPassSubscription.get();
  if (sub.status !== 'active' || tier > sub.currentTier) {
    return null;
  }

  const tierData = DADPASS_TIERS.find((t) => t.tier === tier);
  if (!tierData) return null;

  const reward = tierData.rewards.find((r) => r.rewardType === rewardType);
  if (!reward) return null;

  const rewardId = `${tier}-${rewardType}`;
  const claimed = claimedRewards.get();
  if (claimed.includes(rewardId)) {
    return null; // Already claimed
  }

  // Mark as claimed
  claimed.push(rewardId);
  claimedRewards.set(claimed);

  // Grant reward
  grantReward(reward);

  return { ...reward, claimed: true, claimedAt: new Date() };
}

/**
 * Grant a reward to the user
 */
function grantReward(reward: DadPassReward): void {
  switch (reward.rewardType) {
    case 'premium_pack':
      if (reward.metadata?.packCount) {
        for (let i = 0; i < reward.metadata.packCount; i++) {
          addPremiumPackToInventory('premium_single');
        }
      }
      break;

    case 'exclusive_card':
      // TODO: Add exclusive card to collection
      // This would integrate with the collection system
      break;

    case 'daily_reward_unlock':
      // This is a passive unlock - daily rewards system handles it
      break;

    default:
      // Other rewards (titles, card backs, avatar borders) would be handled
      // by their respective systems when implemented
      break;
  }

  // Track reward claim
  trackEvent({
    type: 'daily_reward_claim', // Reusing existing type
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    sessionId: crypto.randomUUID(),
  } as any);
}

/**
 * Claim all available rewards
 * Returns array of claimed rewards
 */
export function claimAllRewards(): DadPassReward[] {
  const claimable = claimableRewards.get();
  const claimed: DadPassReward[] = [];

  for (const reward of claimable) {
    const result = claimTierReward(reward.tier, reward.rewardType);
    if (result) {
      claimed.push(result);
    }
  }

  return claimed;
}

/**
 * Process daily login
 * Awards XP and checks for premium pack eligibility
 */
export function processDailyLogin(): {
  xpGained: number;
  tierIncreased: boolean;
  premiumPackAwarded?: number;
} {
  const sub = dadPassSubscription.get();
  if (sub.status !== 'active') {
    return { xpGained: 0, tierIncreased: false };
  }

  // Award daily XP
  const xpGained = DEFAULT_DADPASS_CONFIG.xpPerDailyLogin;
  const tierIncreased = addDadPassXP(xpGained);

  // Update last claim date
  sub.lastClaimDate = new Date();

  // Check for premium pack (every 3 days of active subscription)
  const now = new Date();
  const daysActive = Math.floor(
    (now.getTime() - sub.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const expectedPacks = Math.floor(daysActive / DEFAULT_DADPASS_CONFIG.premiumPackInterval);

  let premiumPackAwarded: number | undefined;
  if (expectedPacks > sub.premiumPacksAwarded) {
    // Award premium pack
    const packsToAward = expectedPacks - sub.premiumPacksAwarded;
    for (let i = 0; i < packsToAward; i++) {
      addPremiumPackToInventory('premium_single');
    }
    sub.premiumPacksAwarded = expectedPacks;
    sub.lastPremiumPackDate = now;
    premiumPackAwarded = packsToAward;
  }

  dadPassSubscription.set({ ...sub });

  return { xpGained, tierIncreased, premiumPackAwarded };
}

/**
 * Award XP for opening packs
 * Called when user opens a pack
 */
export function awardPackXP(): void {
  const xp = DEFAULT_DADPASS_CONFIG.xpPerPackOpened;
  addDadPassXP(xp);
}

/**
 * Set auto-renew preference
 */
export function setAutoRenew(enabled: boolean): void {
  const sub = dadPassSubscription.get();
  sub.autoRenew = enabled;
  dadPassSubscription.set({ ...sub });
}

/**
 * Check if pass is expired and update status
 */
export function checkExpiration(): void {
  const sub = dadPassSubscription.get();
  if (sub.status === 'active') {
    const now = new Date();
    if (now > sub.endDate) {
      sub.status = 'expired';
      dadPassSubscription.set({ ...sub });
    }
  }
}

/**
 * Renew expired pass
 */
export function renewPass(): boolean {
  const sub = dadPassSubscription.get();
  if (sub.status !== 'expired') return false;

  const now = new Date();
  const newEndDate = new Date(now);
  newEndDate.setDate(newEndDate.getDate() + DEFAULT_DADPASS_CONFIG.duration);

  sub.status = 'active';
  sub.startDate = now;
  sub.endDate = newEndDate;
  sub.currentTier = 1;
  sub.totalXP = 0;
  sub.xpToNextTier = 100;
  sub.premiumPacksAwarded = 0;

  dadPassSubscription.set({ ...sub });
  return true;
}

/**
 * Get DadPass summary for display
 */
export function getDadPassSummary(): DadPassSummary {
  const sub = dadPassSubscription.get();
  return {
    isActive: isDadPassActive.get(),
    status: sub.status,
    currentTier: sub.currentTier,
    maxTier: DEFAULT_DADPASS_CONFIG.maxTier,
    totalXP: sub.totalXP,
    daysRemaining: daysRemaining.get(),
    progressPercent: tierProgress.get(),
    claimableRewards: claimableCount.get(),
    autoRenew: sub.autoRenew,
    premiumPacksAwarded: sub.premiumPacksAwarded,
  };
}

/**
 * Reset DadPass (for testing)
 */
export function resetDadPass(): void {
  dadPassSubscription.set(defaultSubscription);
  claimedRewards.set([]);
  purchaseSession.set({ data: null });
}

// ============================================================================
// UI HELPERS
// ============================================================================

/**
 * Open purchase modal
 */
export function openPurchaseModal() {
  dadPassUI.set({
    ...dadPassUI.get(),
    isPurchaseModalOpen: true,
  });
}

/**
 * Close purchase modal
 */
export function closePurchaseModal() {
  dadPassUI.set({
    ...dadPassUI.get(),
    isPurchaseModalOpen: false,
  });
}

/**
 * Open reward modal for specific tier
 */
export function openRewardModal(tier: number) {
  dadPassUI.set({
    ...dadPassUI.get(),
    isRewardModalOpen: true,
    selectedTier: tier,
  });
}

/**
 * Close reward modal
 */
export function closeRewardModal() {
  dadPassUI.set({
    ...dadPassUI.get(),
    isRewardModalOpen: false,
    selectedTier: null,
  });
}

/**
 * Set processing state
 */
export function setProcessing(isProcessing: boolean) {
  dadPassUI.set({
    ...dadPassUI.get(),
    processing: isProcessing,
  });
}

/**
 * Set error state
 */
export function setError(error: string | null) {
  dadPassUI.set({
    ...dadPassUI.get(),
    error,
    processing: false,
  });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Check expiration on load
if (typeof window !== 'undefined') {
  checkExpiration();

  // Check expiration every minute
  setInterval(checkExpiration, 60000);
}
