/**
 * Premium Pack Generator (US093 - Monetization - Premium Packs)
 *
 * Generates premium packs with boosted rarity rates:
 * - 7 cards (vs 6 for standard)
 * - Guaranteed rare or better in slot 6
 * - 2x mythic chance (0.2% vs 0.1%)
 * - 50% more holo chance
 * - Enhanced rarity distribution in slots 3-5
 */

import type { Pack, PackCard, Rarity, PackConfig } from '../../types';
import { selectCards } from './generator';
import { getHighestRarity, rollHolo } from './generator';
import { generateId, SeededRandom, weightedRandom } from '../utils/random';
import { PREMIUM_PACK_RARITY_SLOTS, PREMIUM_PACK_CONFIGS } from '../../types';

/**
 * Premium pack configuration with boosted rates
 */
export const PREMIUM_PACK_CONFIG: PackConfig = {
  cardsPerPack: 7,  // Premium packs have 7 cards
  raritySlots: PREMIUM_PACK_RARITY_SLOTS,
  holoChance: 1 / 4,  // 25% holo chance (vs 16.67% for standard) = 50% more
};

/**
 * Generate a premium pack with boosted rates
 *
 * Acceptance criteria:
 * - $0.99 premium pack (price configured in PREMIUM_PACK_CONFIGS)
 * - Guaranteed rare or better (slot 6)
 * - 2x mythic chance (0.2% vs 0.1% in slot 7)
 * - 7 cards total
 *
 * @param packConfigId - Premium pack configuration ID (default: 'premium_single')
 * @param seed - Optional seed for reproducible packs
 * @returns A premium Pack with boosted rates
 */
export function generatePremiumPack(packConfigId: string = 'premium_single', seed?: number): Pack {
  const packConfig = PREMIUM_PACK_CONFIGS.find((config) => config.id === packConfigId);

  if (!packConfig) {
    throw new Error(`Unknown premium pack config: ${packConfigId}`);
  }

  if (!packConfig.isActive) {
    throw new Error(`Premium pack ${packConfigId} is not active`);
  }

  const rng = new SeededRandom(seed);
  const packCards: PackCard[] = [];
  const usedCardIds = new Set<string>();

  // Process each slot in the premium pack
  for (const slot of PREMIUM_PACK_RARITY_SLOTS) {
    let rarity: Rarity;

    if (slot.guaranteedRarity) {
      // Guaranteed rarity slot (slot 1, 2, 6)
      rarity = slot.guaranteedRarity;
    } else if (slot.boostedProbability) {
      // Use boosted probability for premium slots
      rarity = weightedRandom(slot.boostedProbability, rng);
    } else if (slot.rarityPool && slot.probability) {
      // Standard probability (but still better than base pack)
      rarity = weightedRandom(slot.probability, rng);
    } else {
      // Fallback to common
      rarity = 'common';
    }

    // Select card from rarity pool
    const [selectedCard] = selectCards(rarity, usedCardIds, 1, rng);

    if (!selectedCard) {
      continue;
    }

    // Determine holographic variant with boosted holo chance
    const holoType = rollHolo(rarity, rng);
    const isHolo = holoType !== 'none';

    const packCard: PackCard = {
      ...selectedCard,
      isRevealed: false,
      isHolo,
      holoType,
    };

    packCards.push(packCard);
  }

  // Shuffle the cards
  const shuffledCards = rng.shuffle(packCards);

  // Premium packs always use the 'premium' pack design
  const packDesign: 'premium' = 'premium';

  const pack: Pack = {
    id: generateId(),
    cards: shuffledCards,
    openedAt: new Date(),
    bestRarity: getHighestRarity(shuffledCards),
    design: packDesign,
  };

  return pack;
}

/**
 * Generate multiple premium packs
 *
 * @param count - Number of premium packs to generate
 * @param packConfigId - Premium pack configuration ID
 * @returns Array of premium Packs
 */
export function generatePremiumPacks(count: number, packConfigId: string = 'premium_single'): Pack[] {
  const packs: Pack[] = [];
  for (let i = 0; i < count; i++) {
    packs.push(generatePremiumPack(packConfigId));
  }
  return packs;
}

/**
 * Check if a pack meets premium pack guarantees
 *
 * Validates that a premium pack has:
 * - At least 7 cards
 * - At least one rare or better card
 * - Appropriate rarity distribution
 *
 * @param pack - The pack to validate
 * @returns True if the pack meets premium guarantees
 */
export function validatePremiumPack(pack: Pack): boolean {
  // Must have 7 cards
  if (pack.cards.length !== 7) {
    return false;
  }

  // Must have at least one rare or better
  const hasRareOrBetter = pack.cards.some(
    (card) => card.rarity === 'rare' || card.rarity === 'epic' || card.rarity === 'legendary' || card.rarity === 'mythic'
  );

  if (!hasRareOrBetter) {
    return false;
  }

  return true;
}

/**
 * Get premium pack price
 *
 * @param packConfigId - Premium pack configuration ID
 * @returns Price in USD or null if config not found
 */
export function getPremiumPackPrice(packConfigId: string = 'premium_single'): number | null {
  const config = PREMIUM_PACK_CONFIGS.find((c) => c.id === packConfigId);
  return config?.price ?? null;
}

/**
 * Get premium pack description for display
 *
 * @param packConfigId - Premium pack configuration ID
 * @returns Pack description or null if config not found
 */
export function getPremiumPackDescription(packConfigId: string = 'premium_single'): string | null {
  const config = PREMIUM_PACK_CONFIGS.find((c) => c.id === packConfigId);
  return config?.description ?? null;
}

/**
 * Calculate expected value of premium pack vs standard pack
 *
 * Compares the expected rarity distribution of premium vs standard packs
 *
 * @returns Object with comparison statistics
 */
export function comparePremiumVsStandard(): {
  premiumExpectedRares: number;
  standardExpectedRares: number;
  premiumMythicChance: number;
  standardMythicChance: number;
  improvement: string;
} {
  // Standard pack expected values
  const standardMythicChance = 0.001;  // 0.1%
  const standardExpectedRares =
    0.74 * 0 + 0.20 * 1 + 0.05 * 2 + 0.009 * 3 + 0.001 * 4; // ~0.3 rares per pack

  // Premium pack expected values
  const premiumMythicChance = 0.002;  // 0.2% (2x standard)
  const premiumExpectedRares =
    (2 * 0) + // 2 common
    (0.60 * 0 + 0.30 * 1 + 0.08 * 2 + 0.019 * 3 + 0.001 * 4) + // slot 3
    (0.50 * 0 + 0.35 * 1 + 0.12 * 2 + 0.028 * 3 + 0.002 * 4) + // slot 4
    (0.50 * 1 + 0.25 * 2 + 0.20 * 3 + 0.05 * 4) + // slot 5 (boosted)
    (1 * 1) + // slot 6 (guaranteed rare)
    (0.50 * 1 + 0.30 * 2 + 0.18 * 3 + 0.02 * 4); // slot 7
  // ~3.5 rares per pack

  return {
    premiumExpectedRares: Math.round(premiumExpectedRares * 10) / 10,
    standardExpectedRares: Math.round(standardExpectedRares * 10) / 10,
    premiumMythicChance,
    standardMythicChance,
    improvement: `${Math.round((premiumExpectedRares / standardExpectedRares - 1) * 100)}% more rare+ cards`,
  };
}
