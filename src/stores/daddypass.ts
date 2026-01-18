/**
 * DadPass Store - REMOVED (FR-001)
 *
 * This premium feature has been removed as it conflicts with the
 * free-to-play vision of DadDeck™ (see PRD line 34).
 *
 * DADPASS is a subscription system that doesn't align with MVP goals:
 * "No microtransactions in MVP (pure entertainment)"
 *
 * @deprecated This entire store is removed. DadPass will be
 * reconsidered for post-MVP monetization strategies.
 */

import { atom, computed } from 'nanostores';
import type {
  DadPassSubscription,
  DadPassTier,
  DadPassReward,
  DadPassSummary,
} from '../types';

// ============================================================================
// STUB STORES (for backwards compatibility)
// ============================================================================

/**
 * Stub: DadPass subscription store (always null in MVP)
 */
export const dadPassSubscription = atom<DadPassSubscription | null>(null);

/**
 * Stub: Claimed rewards (always empty in MVP)
 */
export const claimedRewards = atom<string[]>([]);

/**
 * Stub: Available tiers (always empty in MVP)
 */
export const dadPassTiers = atom<DadPassTier[]>([]);

/**
 * Stub: Purchase modal state
 */
export const isPurchaseModalOpen = atom<boolean>(false);

/**
 * Stub: Processing state
 */
export const isProcessing = atom<boolean>(false);

/**
 * Stub: Error state
 */
export const dadPassError = atom<string | null>(null);

// ============================================================================
// COMPUTED STORES (for backwards compatibility)
// ============================================================================

/**
 * Stub: Current tier data (always null in MVP)
 */
export const currentTierData = computed(dadPassTiers, () => null);

/**
 * Stub: Next tier data (always null in MVP)
 */
export const nextTierData = computed(dadPassTiers, () => null);

/**
 * Stub: Tier progress (always 0 in MVP)
 */
export const tierProgress = computed(dadPassSubscription, () => 0);

/**
 * Stub: Claimable rewards (always empty in MVP)
 */
export const claimableRewards = computed(dadPassTiers, () => [] as DadPassReward[]);

/**
 * Stub: Claimable count (always 0 in MVP)
 */
export const claimableCount = computed(claimableRewards, () => 0);

// ============================================================================
// STUB FUNCTIONS (for backwards compatibility)
// ============================================================================

/**
 * Stub: DadPass not available in MVP
 */
export function isDadPassActive(): boolean {
  return false;
}

/**
 * Stub: DadPass not available in MVP
 */
export function daysRemaining(): number {
  return 0;
}

/**
 * Stub: DadPass XP system not available in MVP
 */
export function addDadPassXP(): boolean {
  return false;
}

/**
 * Stub: Get DadPass summary (returns inactive summary)
 */
export function getDadPassSummary(): DadPassSummary {
  return {
    isActive: false,
    status: 'inactive',
    currentTier: 0,
    maxTier: 30,
    totalXP: 0,
    daysRemaining: 0,
    progressPercent: 0,
    claimableRewards: 0,
  };
}

/**
 * Stub: Process daily login (no-op in MVP)
 */
export function processDailyLogin(): void {
  // No-op
}

/**
 * Stub: Claim all rewards (no-op in MVP)
 */
export function claimAllRewards(): void {
  // No-op
}

/**
 * Stub: Claim tier reward (no-op in MVP)
 */
export function claimTierReward(_rewardId: string): void {
  // No-op
}

/**
 * Stub: Set auto-renew (no-op in MVP)
 */
export function setAutoRenew(_enabled: boolean): void {
  // No-op
}

/**
 * Stub: Open purchase modal (no-op in MVP)
 */
export function openPurchaseModal(): void {
  // No-op - premium not available
}

/**
 * Stub: Close purchase modal
 */
export function closePurchaseModal(): void {
  isPurchaseModalOpen.set(false);
}

/**
 * Stub: Open reward modal (no-op in MVP)
 */
export function openRewardModal(_reward: DadPassReward): void {
  // No-op
}

/**
 * Stub: Set processing state
 */
export function setProcessing(processing: boolean): void {
  isProcessing.set(processing);
}

/**
 * Stub: Set error state
 */
export function setError(error: string | null): void {
  dadPassError.set(error);
}

/**
 * Stub: Simulate DadPass purchase (not available)
 */
export function simulateDadPassPurchase(): void {
  throw new Error(
    '🎫 DadPass subscriptions are not available in the MVP. ' +
    'DadDeck™ is currently 100% free with unlimited pack opening. ' +
    'Premium features may be added in the future to support development.'
  );
}

/**
 * Stub: DadPass purchase not available
 *
 * @throws Error with clear message that DadPass is coming later
 */
export function purchaseDadPass() {
  throw new Error(
    '🎫 DadPass subscriptions are not available in the MVP. ' +
    'DadDeck™ is currently 100% free with unlimited pack opening. ' +
    'Premium features may be added in the future to support development.'
  );
}
