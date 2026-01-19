import type { Rarity } from './core';
import type { PackType, RaritySlot } from './pack';

// ============================================================================
// MONETIZATION TYPES (US093 - Monetization - Premium Packs)
// ============================================================================

// Premium pack purchase configuration
export interface PremiumPackConfig {
  id: string;                      // Unique pack ID (e.g., 'premium_single')
  name: string;                    // Display name
  description: string;             // Marketing description
  price: number;                   // Price in USD (e.g., 0.99)
  currency: string;                // Currency code (default: 'USD')
  cardsPerPack: number;            // Number of cards (usually 7 vs 6 for standard)
  rarityGuarantee: Rarity;         // Minimum guaranteed rarity
  mythicChanceMultiplier: number;  // Mythic chance multiplier (e.g., 2.0 = 2x)
  holoChanceMultiplier: number;    // Holo chance multiplier (e.g., 1.5 = 50% more)
  isActive: boolean;               // Whether this pack is available for purchase
}

// Premium pack rarity slot configuration (boosted rates)
export interface PremiumRaritySlot extends RaritySlot {
  boostedProbability?: Partial<Record<Rarity, number>>;  // Enhanced odds for premium
}

// Purchase session for tracking pack purchases
export interface PurchaseSession {
  sessionId: string;              // Unique session ID
  packType: PackType;             // 'standard' or 'premium'
  packConfigId: string;           // Which premium pack config
  status: 'pending' | 'processing' | 'completed' | 'failed';
  receiptValidated: boolean;      // Whether receipt was validated
  packId?: string;                // Generated pack ID (if completed)
  timestamp: Date;                // When purchase was initiated
  completedAt?: Date;             // When purchase completed
  error?: string;                 // Error message if failed
}

// Premium pack inventory (user's purchased premium packs)
export interface PremiumPackInventory {
  availablePacks: string[];       // Pack config IDs user can open
  purchaseHistory: PurchaseSession[];
  totalPacksPurchased: number;
  totalSpent: number;             // Total USD spent
}

// Premium pack configurations (acceptance criteria)
export const PREMIUM_PACK_CONFIGS: PremiumPackConfig[] = [
  {
    id: 'premium_single',
    name: 'Premium Pack',
    description: 'Boosted rates with guaranteed Rare or better!',
    price: 0.99,
    currency: 'USD',
    cardsPerPack: 7,              // 7 cards vs 6 for standard
    rarityGuarantee: 'rare',       // Guaranteed rare or better
    mythicChanceMultiplier: 2.0,  // 2x mythic chance
    holoChanceMultiplier: 1.5,    // 50% more holo
    isActive: true,
  },
];

// Premium pack rarity slots (boosted rates vs standard)
// Standard: 3 common, 2 uncommon+ (74% uncommon), 1 rare+ (87.9% rare, 0.1% mythic)
// Premium: 2 common, 3 uncommon+, 2 rare+ (50% rare), guaranteed rare in slot 6
export const PREMIUM_PACK_RARITY_SLOTS: PremiumRaritySlot[] = [
  { slot: 1, guaranteedRarity: 'common' },
  { slot: 2, guaranteedRarity: 'common' },
  {
    slot: 3,
    rarityPool: true,
    probability: { uncommon: 0.60, rare: 0.30, epic: 0.08, legendary: 0.019, mythic: 0.001 },
  },
  {
    slot: 4,
    rarityPool: true,
    probability: { uncommon: 0.50, rare: 0.35, epic: 0.12, legendary: 0.028, mythic: 0.002 },
  },
  {
    slot: 5,
    rarityPool: true,
    boostedProbability: { rare: 0.50, epic: 0.25, legendary: 0.20, mythic: 0.05 }, // Slot 5 boosted
  },
  { slot: 6, guaranteedRarity: 'rare' }, // GUARANTEED RARE OR BETTER
  {
    slot: 7,
    rarityPool: true,
    probability: { rare: 0.50, epic: 0.30, legendary: 0.18, mythic: 0.02 }, // Slot 7: 2x mythic (0.02 vs 0.001)
  },
];

// Premium pack visual configuration (distinct from standard premium design)
export const PREMIUM_PACK_VISUAL_CONFIG = {
  borderColor: '#ffd700',         // Gold border
  glowIntensity: 2.5,             // 2.5x glow effect
  particleMultiplier: 3.0,        // 3x particles
  animationVariant: 'premium_gold',
  shimmerEffect: true,            // Premium shimmer animation
  rainbowHoloChance: 0.10,        // 10% chance for rainbow holo border
};
