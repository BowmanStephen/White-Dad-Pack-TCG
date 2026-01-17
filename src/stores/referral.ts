/**
 * Referral Store
 *
 * Manages referral system including referral codes, tracking referrals,
 * reward distribution, and leaderboard. Uses persistent storage for
 * referral data and integrates with the profile and pack systems.
 */

import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type {
  ReferralCode,
  ReferralRelationship,
  ReferralReward,
  ReferralStats,
  ReferralLink,
  ReferralLeaderboardEntry,
  ReferralState,
  ReferralStatus,
  AvatarId,
  PlayerStats,
} from '@/types';
import { DEFAULT_REFERRAL_CONFIG } from '@/types';
import { profile } from '@/stores/profile';

/**
 * Custom encoder to handle Date serialization in persistent storage
 */
const referralEncoder = {
  decode(value: any): any {
    if (!value) return value;

    // Decode dates in referrals
    if (value.referrals) {
      value.referrals = value.referrals.map((ref: any) => ({
        ...ref,
        createdAt: new Date(ref.createdAt),
        completedAt: ref.completedAt ? new Date(ref.completedAt) : undefined,
        rewardedAt: ref.rewardedAt ? new Date(ref.rewardedAt) : undefined,
      }));
    }

    // Decode dates in referredBy
    if (value.referredBy) {
      value.referredBy = {
        ...value.referredBy,
        createdAt: new Date(value.referredBy.createdAt),
        completedAt: value.referredBy.completedAt ? new Date(value.referredBy.completedAt) : undefined,
        rewardedAt: value.referredBy.rewardedAt ? new Date(value.referredBy.rewardedAt) : undefined,
      };
    }

    // Decode dates in rewards
    if (value.rewards) {
      value.rewards = value.rewards.map((reward: any) => ({
        ...reward,
        claimedAt: reward.claimedAt ? new Date(reward.claimedAt) : undefined,
        expiresAt: new Date(reward.expiresAt),
      }));
    }

    return value;
  },
  encode(value: any): any {
    return value;
  },
};

/**
 * Referral state (persistent)
 */
export const referralState = persistentAtom<ReferralState>('daddeck-referrals', {
  myReferralCode: '',
  myReferralLink: {
    code: '',
    url: '',
    shareText: '',
  },
  referredBy: null,
  referrals: [],
  rewards: [],
  stats: {
    totalReferrals: 0,
    activeReferrals: 0,
    pendingReferrals: 0,
    totalRewardsEarned: 0,
    totalRewardsClaimed: 0,
  },
  leaderboard: [],
  hasClaimedNewUserBonus: false,
  newUserRewardClaimed: false,
}, {
  encode: referralEncoder.encode,
  decode: referralEncoder.decode,
});

/**
 * Loading state for referral operations
 */
export const isLoading = atom<boolean>(false);

/**
 * Error state for referral operations
 */
export const referralError = atom<string | null>(null);

/**
 * Generate a unique referral code
 * Format: REF-XXXX (6 characters, similar to friend codes)
 */
export function generateReferralCode(): ReferralCode {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion
  let code = 'REF-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code as ReferralCode;
}

/**
 * Get or create user's referral code
 */
export function getMyReferralCode(): ReferralCode {
  const current = referralState.get();
  const currentProfile = profile.get();

  if (current.myReferralCode) {
    return current.myReferralCode;
  }

  // Generate from player ID (consistent)
  if (currentProfile) {
    const hash = currentProfile.playerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'REF-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt((hash + i * 23) % chars.length);
    }
    const referralCode = code as ReferralCode;

    // Update state
    referralState.set({
      ...current,
      myReferralCode: referralCode,
      myReferralLink: generateReferralLink(referralCode),
    });

    return referralCode;
  }

  return generateReferralCode();
}

/**
 * Generate referral link from code
 */
export function generateReferralLink(code: ReferralCode): ReferralLink {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://daddieck.com';
  return {
    code,
    url: `${baseUrl}?ref=${code}`,
    shareText: `Join me in DadDeck™ - the ultimate white dad trading card game! Use my referral code: ${code}`,
  };
}

/**
 * Initialize referral system for new user
 * Called when user first visits with a referral code
 */
export function initializeReferralSystem(referralCodeFromUrl?: string): void {
  const current = referralState.get();
  const currentProfile = profile.get();

  if (!currentProfile) {
    return;
  }

  // Set up referral code
  if (!current.myReferralCode) {
    const myCode = getMyReferralCode();
    current.myReferralCode = myCode;
    current.myReferralLink = generateReferralLink(myCode);
  }

  // Check if user was referred
  if (referralCodeFromUrl && !current.referredBy) {
    // Create referral relationship
    const relationship: ReferralRelationship = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      referrerId: referralCodeFromUrl, // Using code as referrer ID (in production, would look up actual ID)
      referredId: currentProfile.playerId,
      referralCode: referralCodeFromUrl as ReferralCode,
      status: 'pending',
      createdAt: new Date(),
      packsOpened: 0,
    };

    current.referredBy = relationship;

    // Award new user bonus (2 free packs)
    const newUserReward: ReferralReward = {
      id: `reward_newuser_${Date.now()}`,
      relationshipId: relationship.id,
      recipientId: currentProfile.playerId,
      rewardType: 'referred',
      packCount: DEFAULT_REFERRAL_CONFIG.referredReward, // 2 packs
      claimed: false,
      expiresAt: new Date(Date.now() + DEFAULT_REFERRAL_CONFIG.rewardExpirationDays * 24 * 60 * 60 * 1000),
    };

    current.rewards = [newUserReward];
    current.stats.totalRewardsEarned = DEFAULT_REFERRAL_CONFIG.referredReward;
  }

  referralState.set(current);
}

/**
 * Track pack opening for referral progress
 * Call this when a user opens a pack to update referral status
 */
export function trackPackOpenForReferral(): void {
  const current = referralState.get();
  const currentProfile = profile.get();

  if (!currentProfile) {
    return;
  }

  // Check if user was referred and hasn't completed yet
  if (current.referredBy && current.referredBy.status !== 'completed' && current.referredBy.status !== 'rewarded') {
    const updatedReferral: ReferralRelationship = {
      ...current.referredBy,
      packsOpened: current.referredBy.packsOpened + 1,
    };

    // Check if milestone reached (10 packs)
    if (updatedReferral.packsOpened >= DEFAULT_REFERRAL_CONFIG.packsRequired) {
      updatedReferral.status = 'completed';
      updatedReferral.completedAt = new Date();

      // Award referrer their reward
      // In production, this would update the referrer's data via API
      // For now, we just mark it as completed
    }

    referralState.set({
      ...current,
      referredBy: updatedReferral,
    });
  }

  // Update referrals (users this player has referred)
  const updatedReferrals = current.referrals.map(ref => {
    if (ref.status === 'pending' || ref.status === 'active') {
      const updatedPacks = ref.packsOpened + 1;

      // Check if milestone reached
      if (updatedPacks >= DEFAULT_REFERRAL_CONFIG.packsRequired && ref.status !== 'completed' && ref.status !== 'rewarded') {
        const completedRef: ReferralRelationship = {
          ...ref,
          packsOpened: updatedPacks,
          status: 'completed',
          completedAt: new Date(),
        };

        // Create reward for referrer (current user)
        const referrerReward: ReferralReward = {
          id: `reward_referrer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          relationshipId: ref.id,
          recipientId: currentProfile.playerId,
          rewardType: 'referrer',
          packCount: DEFAULT_REFERRAL_CONFIG.referrerReward, // 5 packs
          claimed: false,
          expiresAt: new Date(Date.now() + DEFAULT_REFERRAL_CONFIG.rewardExpirationDays * 24 * 60 * 60 * 1000),
        };

        referralState.set({
          ...current,
          referrals: current.referrals.map(r => r.id === ref.id ? completedRef : r),
          rewards: [...current.rewards, referrerReward],
          stats: {
            ...current.stats,
            activeReferrals: current.stats.activeReferrals + 1,
            pendingReferrals: Math.max(0, current.stats.pendingReferrals - 1),
            totalRewardsEarned: current.stats.totalRewardsEarned + DEFAULT_REFERRAL_CONFIG.referrerReward,
          },
        });

        return completedRef;
      }

      return {
        ...ref,
        packsOpened: updatedPacks,
      };
    }
    return ref;
  });

  if (updatedReferrals !== current.referrals) {
    referralState.set({
      ...current,
      referrals: updatedReferrals,
    });
  }
}

/**
 * Claim a referral reward
 */
export function claimReferralReward(rewardId: string): boolean {
  const current = referralState.get();

  const rewardIndex = current.rewards.findIndex(r => r.id === rewardId);
  if (rewardIndex === -1) {
    referralError.set('Reward not found');
    return false;
  }

  const reward = current.rewards[rewardIndex];

  if (reward.claimed) {
    referralError.set('Reward already claimed');
    return false;
  }

  if (new Date() > reward.expiresAt) {
    referralError.set('Reward has expired');
    return false;
  }

  // Mark reward as claimed
  const updatedReward: ReferralReward = {
    ...reward,
    claimed: true,
    claimedAt: new Date(),
  };

  const updatedRewards = [...current.rewards];
  updatedRewards[rewardIndex] = updatedReward;

  referralState.set({
    ...current,
    rewards: updatedRewards,
    stats: {
      ...current.stats,
      totalRewardsClaimed: current.stats.totalRewardsClaimed + reward.packCount,
    },
  });

  referralError.set(null);
  return true;
}

/**
 * Claim new user bonus (for referred players)
 */
export function claimNewUserBonus(): boolean {
  const current = referralState.get();

  if (!current.referredBy) {
    referralError.set('No referral to claim');
    return false;
  }

  if (current.hasClaimedNewUserBonus) {
    referralError.set('Bonus already claimed');
    return false;
  }

  // Find the new user reward
  const newUserReward = current.rewards.find(r => r.rewardType === 'referred' && !r.claimed);
  if (!newUserReward) {
    referralError.set('Bonus not available');
    return false;
  }

  const success = claimReferralReward(newUserReward.id);
  if (success) {
    referralState.set({
      ...referralState.get(),
      hasClaimedNewUserBonus: true,
      newUserRewardClaimed: true,
    });
  }

  return success;
}

/**
 * Get claimable rewards
 */
export function getClaimableRewards(): ReferralReward[] {
  const current = referralState.get();
  const now = new Date();

  return current.rewards.filter(
    reward => !reward.claimed && new Date(reward.expiresAt) > now
  );
}

/**
 * Get total unclaimed packs
 */
export function getUnclaimedPackCount(): number {
  const claimable = getClaimableRewards();
  return claimable.reduce((sum, reward) => sum + reward.packCount, 0);
}

/**
 * Update referral leaderboard
 * In production, this would fetch from an API
 * For now, generate mock leaderboard data
 */
export function updateLeaderboard(): void {
  const current = referralState.get();
  const currentProfile = profile.get();

  if (!currentProfile) {
    return;
  }

  // Add current user to leaderboard
  const myEntry: ReferralLeaderboardEntry = {
    playerId: currentProfile.playerId,
    username: currentProfile.username || 'Anonymous',
    pseudonym: currentProfile.pseudonym,
    avatarId: currentProfile.avatarId,
    totalReferrals: current.stats.totalReferrals,
    activeReferrals: current.stats.activeReferrals,
    rank: 0, // Will be calculated
  };

  // In production, fetch actual leaderboard from API
  // For now, use mock data + current user
  const mockLeaderboard: ReferralLeaderboardEntry[] = [
    {
      playerId: 'player_001',
      username: 'GrillMaster',
      pseudonym: 'Gary the Grill 🔥',
      avatarId: 'grill_master',
      totalReferrals: 45,
      activeReferrals: 38,
      rank: 1,
    },
    {
      playerId: 'player_002',
      username: 'DadJokeKing',
      pseudonym: 'Pun Master 😄',
      avatarId: 'cool_dad',
      totalReferrals: 32,
      activeReferrals: 28,
      rank: 2,
    },
    {
      playerId: 'player_003',
      username: 'LawnCarePro',
      pseudonym: 'Grass Guardian 🌱',
      avatarId: 'lawn_care',
      totalReferrals: 28,
      activeReferrals: 24,
      rank: 3,
    },
    {
      playerId: 'player_004',
      username: 'FixItDad',
      pseudonym: 'Repair Rex 🔧',
      avatarId: 'fix_it',
      totalReferrals: 21,
      activeReferrals: 18,
      rank: 4,
    },
    {
      playerId: 'player_005',
      username: 'CouchCoach',
      pseudonym: 'Spectator Sam 🛋️',
      avatarId: 'couch_potato',
      totalReferrals: 18,
      activeReferrals: 15,
      rank: 5,
    },
    myEntry,
  ];

  // Sort by total referrals
  mockLeaderboard.sort((a, b) => b.totalReferrals - a.totalReferrals);

  // Update ranks
  mockLeaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  // Limit to configured limit
  const limitedLeaderboard = mockLeaderboard.slice(0, DEFAULT_REFERRAL_CONFIG.leaderboardLimit);

  referralState.set({
    ...current,
    leaderboard: limitedLeaderboard,
  });
}

/**
 * Get user's rank on leaderboard
 */
export function getMyRank(): number | null {
  const current = referralState.get();
  const currentProfile = profile.get();

  if (!currentProfile) {
    return null;
  }

  const myEntry = current.leaderboard.find(
    entry => entry.playerId === currentProfile.playerId
  );

  return myEntry?.rank ?? null;
}

/**
 * Get referral stats summary
 */
export function getReferralStatsSummary(): {
  totalReferrals: number;
  activeReferrals: number;
  pendingReferrals: number;
  totalRewards: number;
  claimableRewards: number;
} {
  const current = referralState.get();
  const claimable = getClaimableRewards();

  return {
    totalReferrals: current.stats.totalReferrals,
    activeReferrals: current.stats.activeReferrals,
    pendingReferrals: current.stats.pendingReferrals,
    totalRewards: current.stats.totalRewardsEarned,
    claimableRewards: claimable.reduce((sum, r) => sum + r.packCount, 0),
  };
}

/**
 * Reset referral state (for testing/logout)
 */
export function resetReferralState(): void {
  referralState.set({
    myReferralCode: '',
    myReferralLink: {
      code: '',
      url: '',
      shareText: '',
    },
    referredBy: null,
    referrals: [],
    rewards: [],
    stats: {
      totalReferrals: 0,
      activeReferrals: 0,
      pendingReferrals: 0,
      totalRewardsEarned: 0,
      totalRewardsClaimed: 0,
    },
    leaderboard: [],
    hasClaimedNewUserBonus: false,
    newUserRewardClaimed: false,
  });
  referralError.set(null);
}

/**
 * Export referral data (for sharing/debugging)
 */
export function exportReferralData(): string {
  const current = referralState.get();

  return JSON.stringify(
    {
      referralCode: current.myReferralCode,
      totalReferrals: current.stats.totalReferrals,
      activeReferrals: current.stats.activeReferrals,
      totalRewards: current.stats.totalRewardsEarned,
      claimableRewards: getClaimableRewards().length,
      myRank: getMyRank(),
    },
    null,
    2
  );
}
