/**
 * Referral Store - REMOVED (FR-001)
 *
 * This premium feature has been removed as it conflicts with the
 * free-to-play vision of DadDeck™ (see PRD line 34).
 *
 * REFERRAL SYSTEM was designed for user acquisition with monetary
 * rewards, which doesn't align with the current MVP goal of pure
 * entertainment without microtransactions.
 *
 * @deprecated This entire store is removed. Referral system will be
 * reconsidered for post-MVP growth strategies.
 */

/**
 * Stub: Referral system not available in MVP
 *
 * Returns empty string since referral codes are not part of MVP.
 */
export function getMyReferralCode(): string {
  return '';
}

/**
 * Stub: Referral rewards not available in MVP
 *
 * Always returns 0 since referral rewards are not part of MVP.
 */
export function getUnclaimedPackCount(): number {
  return 0;
}

/**
 * Stub: Referral stats not available in MVP
 *
 * Returns empty stats object since referral system is not part of MVP.
 */
export function getReferralStatsSummary() {
  return {
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    totalRewardsEarned: 0,
  };
}

/**
 * Stub: Referral system not available in MVP
 *
 * @throws Error with clear message that referrals are coming later
 */
export function createReferralLink() {
  throw new Error(
    '🔗 Referral system is not available in the MVP. ' +
    'DadDeck™ is currently 100% free - just share the link with friends! ' +
    'Referral rewards may be added in the future.'
  );
}

/**
 * Stub: Track pack open for referral not available in MVP
 *
 * No-op function since referral system is not part of MVP.
 */
export function trackPackOpenForReferral(): void {
  // No-op - referral tracking disabled in MVP
}
