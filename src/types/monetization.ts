import type { Rarity, RaritySlot, DadType } from './core';

// ============================================================================
// MONETIZATION TYPES (US093 - Monetization - Premium Packs)
// ============================================================================

export type PackType = 'standard' | 'premium';

export interface PremiumPackConfig {
  id: string;
  name: string;
  description: string;
  price: number;              // Price in cents (USD)
  currency: string;
  cardsPerPack: number;
  raritySlots: PremiumRaritySlot[];
  visualConfig: {
    packDesign: string;
    animation: 'standard' | 'premium' | 'legendary';
    particleCount: number;
  };
}

export interface PremiumRaritySlot extends RaritySlot {
  slot: number;
  guaranteedRarity?: Rarity;
  rarityPool?: boolean;
  probability?: Partial<Record<Rarity, number>>;
  boosted?: boolean;          // True for premium slots
}

export interface PurchaseSession {
  sessionId: string;
  packType: PremiumPackConfig;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
}

export interface StripeCheckoutSession {
  sessionId: string;
  packId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface ReceiptValidation {
  valid: boolean;
  packId: string;
  purchaseDate: Date;
}

export interface PremiumPackInventory {
  availablePacks: PremiumPackConfig[];
  purchasedPacks: string[];
}

export const PREMIUM_PACK_CONFIGS: PremiumPackConfig[] = [
  {
    id: 'premium_basic',
    name: 'Premium Pack',
    description: 'Guaranteed Rare or better',
    price: 199,               // $1.99 USD
    currency: 'USD',
    cardsPerPack: 6,
    raritySlots: [
      { slot: 1, guaranteedRarity: 'common' },
      { slot: 2, guaranteedRarity: 'common' },
      { slot: 3, guaranteedRarity: 'uncommon', boosted: true },
      { slot: 4, guaranteedRarity: 'uncommon', boosted: true },
      { slot: 5, guaranteedRarity: 'rare', boosted: true },
      { slot: 6, guaranteedRarity: 'rare', boosted: true },
    ],
    visualConfig: {
      packDesign: 'premium',
      animation: 'premium',
      particleCount: 20,
    },
  },
  {
    id: 'premium_epic',
    name: 'Epic Pack',
    description: 'Guaranteed Epic or better',
    price: 499,               // $4.99 USD
    currency: 'USD',
    cardsPerPack: 6,
    raritySlots: [
      { slot: 1, guaranteedRarity: 'uncommon' },
      { slot: 2, guaranteedRarity: 'uncommon' },
      { slot: 3, guaranteedRarity: 'rare', boosted: true },
      { slot: 4, guaranteedRarity: 'rare', boosted: true },
      { slot: 5, guaranteedRarity: 'epic', boosted: true },
      { slot: 6, guaranteedRarity: 'epic', boosted: true },
    ],
    visualConfig: {
      packDesign: 'premium',
      animation: 'premium',
      particleCount: 30,
    },
  },
  {
    id: 'premium_legendary',
    name: 'Legendary Pack',
    description: 'Guaranteed Legendary or better',
    price: 999,               // $9.99 USD
    currency: 'USD',
    cardsPerPack: 6,
    raritySlots: [
      { slot: 1, guaranteedRarity: 'rare' },
      { slot: 2, guaranteedRarity: 'rare' },
      { slot: 3, guaranteedRarity: 'epic', boosted: true },
      { slot: 4, guaranteedRarity: 'epic', boosted: true },
      { slot: 5, guaranteedRarity: 'legendary', boosted: true },
      { slot: 6, guaranteedRarity: 'legendary', boosted: true },
    ],
    visualConfig: {
      packDesign: 'premium',
      animation: 'legendary',
      particleCount: 50,
    },
  },
];

export const PREMIUM_PACK_RARITY_SLOTS: PremiumRaritySlot[] = [
  { slot: 1, guaranteedRarity: 'common' },
  { slot: 2, guaranteedRarity: 'common' },
  { slot: 3, guaranteedRarity: 'uncommon', boosted: true },
  { slot: 4, guaranteedRarity: 'uncommon', boosted: true },
  { slot: 5, guaranteedRarity: 'rare', boosted: true },
  { slot: 6, guaranteedRarity: 'rare', boosted: true },
];

export const PREMIUM_PACK_VISUAL_CONFIG = {
  particleCount: 20,
  animationDuration: 2000,
  glowIntensity: 1.5,
};

// ============================================================================
// DADPASS TYPES (US094 - Monetization - Pass System)
// ============================================================================

export type DadPassStatus = 'inactive' | 'active' | 'expired' | 'pending';

export type DadPassRewardType =
  | 'pack'
  | 'premium_pack'
  | 'cards'
  | 'currency'
  | 'exclusive_card'
  | 'avatar'
  | 'title'
  | 'badge';

export interface DadPassReward {
  level: number;
  type: DadPassRewardType;
  value: number | string;
  isPremium: boolean;        // True for premium pass rewards
  claimed: boolean;
}

export interface DadPassSubscription {
  status: DadPassStatus;
  startDate?: Date;
  endDate?: Date;
  autoRenew: boolean;
  tier: 'free' | 'premium';
}

export interface DadPassTier {
  id: string;
  name: string;
  price: number;              // Price in cents
  currency: string;
  duration: number;           // Days
  benefits: string[];
}

export interface DadPassConfig {
  currentSeason: number;
  seasonDuration: number;     // Days
  freeRewards: number;
  premiumRewards: number;
  premiumPrice: number;       // Price in cents
}

export interface DadPassState {
  subscription: DadPassSubscription;
  currentLevel: number;
  experience: number;
  rewards: DadPassReward[];
  claimedRewards: string[];   // Reward IDs
}

export interface DadPassSummary {
  totalLevels: number;
  currentLevel: number;
  rewardsClaimed: number;
  totalRewards: number;
  premiumUnlocked: boolean;
  expiresAt: Date | null;
}

export interface DadPassPurchaseSession {
  sessionId: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
}

export const DEFAULT_DADPASS_CONFIG: DadPassConfig = {
  currentSeason: 1,
  seasonDuration: 90,
  freeRewards: 30,
  premiumRewards: 60,
  premiumPrice: 999,          // $9.99 USD
};

export const DADPASS_TIERS: DadPassTier[] = [
  {
    id: 'dadpass_monthly',
    name: 'Monthly DadPass',
    price: 999,
    currency: 'USD',
    duration: 30,
    benefits: [
      'Premium rewards',
      'Exclusive cards',
      '10% XP boost',
      'Custom avatar borders',
    ],
  },
  {
    id: 'dadpass_seasonly',
    name: 'Seasonal DadPass',
    price: 2499,
    currency: 'USD',
    duration: 90,
    benefits: [
      'All Premium rewards',
      'Exclusive Season 1 cards',
      '20% XP boost',
      'Custom avatar & title',
      'Early access to new features',
    ],
  },
];

// ============================================================================
// REFERRAL SYSTEM TYPES (US098 - Referral System - Growth Loop)
// ============================================================================

export type ReferralCode = string;

export type ReferralStatus = 'pending' | 'active' | 'completed' | 'rewarded';

export interface ReferralRelationship {
  referrerId: string;
  referrerUsername: string;
  referredId: string;
  referredUsername: string;
  referralCode: ReferralCode;
  status: ReferralStatus;
  createdAt: Date;
  completedAt?: Date;
}

export interface ReferralReward {
  type: 'pack' | 'premium_pack' | 'cards' | 'currency';
  value: number;
  description: string;
}

export interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalRewardsEarned: number;
}

export interface ReferralLink {
  code: ReferralCode;
  url: string;
  createdAt: Date;
  expiresAt: Date;
  clickCount: number;
  conversionCount: number;
}

export interface ReferralLeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  referralCount: number;
  rewardsEarned: number;
}

export interface ReferralState {
  referralCode: ReferralCode;
  referrals: ReferralRelationship[];
  stats: ReferralStats;
  rewards: ReferralReward[];
  leaderboard: ReferralLeaderboardEntry[];
}

export interface ReferralConfig {
  codeLength: number;
  codeExpiration: number;      // Days
  maxReferralsPerPlayer: number;
  rewards: {
    referrer: ReferralReward[];
    referred: ReferralReward[];
  };
}

export const DEFAULT_REFERRAL_CONFIG: ReferralConfig = {
  codeLength: 8,
  codeExpiration: 30,
  maxReferralsPerPlayer: 100,
  rewards: {
    referrer: [
      { type: 'pack', value: 1, description: '1 Free Pack' },
      { type: 'currency', value: 100, description: '100 Coins' },
    ],
    referred: [
      { type: 'premium_pack', value: 1, description: '1 Premium Pack' },
      { type: 'pack', value: 2, description: '2 Free Packs' },
    ],
  },
};
