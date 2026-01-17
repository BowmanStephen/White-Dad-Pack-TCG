import type { Card, Pack, PackCard, PackConfig, Rarity, HoloVariant, PackDesign } from '../../types';
import { getCardsByRarity, getAllCards } from '../cards/database';
import { generateId, weightedRandom, SeededRandom } from '../utils/random';
import { PACK_DESIGN_CONFIG } from '../../types';

/**
 * Select cards from the rarity pool, excluding already used cards.
 *
 * This function implements the card selection logic for pack generation:
 * - Filters the card database by rarity
 * - Prevents duplicate cards within the same pack
 * - Falls back to adjacent rarities if the pool is exhausted
 * - As a last resort, allows duplicates if all pools are exhausted
 *
 * Note: This function mutates the excludedIds Set to include newly selected cards.
 *
 * @param rarity - The rarity tier to select from
 * @param excludedIds - Set of card IDs already used in this pack (will be mutated)
 * @param count - Number of cards to select (default: 1)
 * @param rng - Optional seeded random number generator
 * @returns Array of selected cards (may be empty if no cards available)
 */
export function selectCards(
  rarity: Rarity,
  excludedIds: Set<string>,
  count: number = 1,
  rng?: SeededRandom
): Card[] {
  const selected: Card[] = [];

  for (let i = 0; i < count; i++) {
    // Get available cards of the requested rarity
    let available = getCardsByRarity(rarity).filter((card) => !excludedIds.has(card.id));

    // Fallback 1: Try adjacent rarities if pool is exhausted
    if (available.length === 0) {
      const rarityIndex = RARITY_ORDER.indexOf(rarity);

      // Search outward from the requested rarity (lower first, then higher)
      for (let offset = 1; offset < RARITY_ORDER.length; offset++) {
        // Try lower rarity
        if (rarityIndex - offset >= 0) {
          const lowerRarity = RARITY_ORDER[rarityIndex - offset];
          available = getCardsByRarity(lowerRarity).filter((card) => !excludedIds.has(card.id));
          if (available.length > 0) break;
        }

        // Try higher rarity
        if (rarityIndex + offset < RARITY_ORDER.length) {
          const higherRarity = RARITY_ORDER[rarityIndex + offset];
          available = getCardsByRarity(higherRarity).filter((card) => !excludedIds.has(card.id));
          if (available.length > 0) break;
        }
      }
    }

    // Fallback 2: Allow duplicates if all pools are exhausted
    if (available.length === 0) {
      available = getCardsByRarity(rarity);
      // If still no cards, try all rarities
      if (available.length === 0) {
        available = getAllCards();
      }
    }

    // If we still have no cards, skip this selection
    if (available.length === 0) {
      continue;
    }

    // Select a random card
    const card = rng ? rng.pick(available) : available[Math.floor(Math.random() * available.length)];
    selected.push(card);
    excludedIds.add(card.id);
  }

  return selected;
}

/**
 * Default pack configuration based on US036 rarity distribution rules
 *
 * Slot breakdown:
 * - Slot 1-3: Common (100%)
 * - Slot 4-5: Uncommon or better (74% uncommon, 20% rare, 5% epic, 1% legendary+)
 * - Slot 6: Rare or better (50% rare, 10% epic, 2% legendary+, 0.1% mythic)
 * - Holo chance: 1 in 6 cards (~16.67%)
 */
export const DEFAULT_PACK_CONFIG: PackConfig = {
  cardsPerPack: 6,
  raritySlots: [
    { slot: 1, guaranteedRarity: 'common' },
    { slot: 2, guaranteedRarity: 'common' },
    { slot: 3, guaranteedRarity: 'common' },
    {
      slot: 4,
      rarityPool: true,
      probability: { uncommon: 0.74, rare: 0.20, epic: 0.05, legendary: 0.009, mythic: 0.001 }
    },
    {
      slot: 5,
      rarityPool: true,
      probability: { uncommon: 0.74, rare: 0.20, epic: 0.05, legendary: 0.009, mythic: 0.001 }
    },
    {
      slot: 6,
      rarityPool: true,
      probability: { rare: 0.879, epic: 0.10, legendary: 0.0199, mythic: 0.001 }
    },
  ],
  holoChance: 1 / 6, // ~16.67% chance for any card to be holographic
};

/**
 * Rarity order for comparison (higher index = rarer)
 */
const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

/**
 * Compare two rarities
 * @returns positive if a > b, negative if a < b, 0 if equal
 */
export function compareRarity(a: Rarity, b: Rarity): number {
  return RARITY_ORDER.indexOf(a) - RARITY_ORDER.indexOf(b);
}

/**
 * Get the highest rarity from an array of cards
 */
export function getHighestRarity(cards: Card[]): Rarity {
  let highest: Rarity = 'common';
  for (const card of cards) {
    if (compareRarity(card.rarity, highest) > 0) {
      highest = card.rarity;
    }
  }
  return highest;
}

/**
 * Roll for holographic variant based on US038 distribution.
 *
 * Distribution:
 * - 80% none (no holo)
 * - 15% standard (basic holo shine)
 * - 3% reverse (reverse holo - background only)
 * - 1.5% full_art (full art holo - legendary+ only)
 * - 0.5% prismatic (prismatic rainbow holo - mythic only)
 *
 * Rarity restrictions:
 * - Prismatic only available for mythic rarity
 * - Full art only available for legendary or mythic rarity
 * - Standard and reverse available for any rarity
 *
 * When a rarity-locked holo variant is rolled (e.g., prismatic on a legendary card),
 * that probability falls through to the next lower holo variant.
 *
 * @param rarity - The card's rarity tier (restricts available holo variants)
 * @param rng - Seeded random number generator
 * @returns The appropriate HoloVariant based on rarity and probability roll
 */
export function rollHolo(rarity: Rarity, rng: SeededRandom): HoloVariant {
  const roll = rng.next();

  // Cumulative probability thresholds for the full distribution
  // 0.000 - 0.800: none (80%)
  // 0.800 - 0.950: standard (15%)
  // 0.950 - 0.980: reverse (3%)
  // 0.980 - 0.995: full_art (1.5%) - legendary+ only
  // 0.995 - 1.000: prismatic (0.5%) - mythic only

  // 80% no holo
  if (roll < 0.80) return 'none';

  // 15% standard holo (0.80 - 0.95)
  if (roll < 0.95) return 'standard';

  // 3% reverse holo (0.95 - 0.98)
  if (roll < 0.98) return 'reverse';

  // 1.5% full art holo (0.98 - 0.995) - legendary or mythic only
  if (roll < 0.995) {
    // If card can have full art, grant it
    if (rarity === 'legendary' || rarity === 'mythic') {
      return 'full_art';
    }
    // Otherwise fall through to reverse (no extra probability, just redirect)
    return 'reverse';
  }

  // 0.5% prismatic holo (0.995 - 1.0) - mythic only
  if (rarity === 'mythic') {
    return 'prismatic';
  }
  // If not mythic but prismatic was rolled, fall through to full art or reverse
  if (rarity === 'legendary') {
    return 'full_art';
  }
  // All other rarities fall through to reverse
  return 'reverse';
}

/**
 * Roll for pack design based on US068 distribution.
 *
 * Distribution:
 * - 80% standard (default blue design)
 * - 15% holiday (festive seasonal theme)
 * - 5% premium (gold foil pattern - rare drop)
 *
 * @param rng - Seeded random number generator
 * @returns The appropriate PackDesign based on probability roll
 */
export function rollPackDesign(rng: SeededRandom): PackDesign {
  const roll = rng.next();

  // 80% standard (0.00 - 0.80)
  if (roll < 0.80) return 'standard';

  // 15% holiday (0.80 - 0.95)
  if (roll < 0.95) return 'holiday';

  // 5% premium (0.95 - 1.00)
  return 'premium';
}

/**
 * Generate a single pack of cards
 */
export function generatePack(config: PackConfig = DEFAULT_PACK_CONFIG, seed?: number): Pack {
  const rng = new SeededRandom(seed);
  const packCards: PackCard[] = [];
  const usedCardIds = new Set<string>();

  // Process each slot in the pack
  for (const slot of config.raritySlots) {
    let rarity: Rarity;

    if (slot.guaranteedRarity) {
      // Guaranteed rarity slot
      rarity = slot.guaranteedRarity;
    } else if (slot.rarityPool && slot.probability) {
      // Random rarity from probability pool
      rarity = weightedRandom(slot.probability, rng);
    } else {
      // Fallback to common
      rarity = 'common';
    }

    // Use the selectCards function to get a card from the appropriate rarity pool
    const [selectedCard] = selectCards(rarity, usedCardIds, 1, rng);

    // If no card was selected (database is empty), skip this slot
    if (!selectedCard) {
      continue;
    }

    // Determine holographic variant using rollHolo (US038)
    const holoType = rollHolo(rarity, rng);
    const isHolo = holoType !== 'none';

    // Create pack card with runtime properties
    const packCard: PackCard = {
      ...selectedCard,
      isRevealed: false,
      isHolo,
      holoType,
    };

    packCards.push(packCard);
  }

  // Shuffle the cards so rarity isn't predictable by position
  const shuffledCards = rng.shuffle(packCards);

  // Roll for pack design (US068 - 80% standard, 15% holiday, 5% premium)
  const packDesign = rollPackDesign(rng);

  // Create the pack
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
 * Generate multiple packs
 */
export function generatePacks(count: number, config?: PackConfig): Pack[] {
  const packs: Pack[] = [];
  for (let i = 0; i < count; i++) {
    packs.push(generatePack(config));
  }
  return packs;
}

/**
 * Calculate pack statistics (for display)
 */
export function getPackStats(pack: Pack): {
  totalCards: number;
  rarityBreakdown: Record<Rarity, number>;
  holoCount: number;
  bestCard: PackCard;
} {
  const rarityBreakdown: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };
  
  let holoCount = 0;
  let bestCard = pack.cards[0];
  
  for (const card of pack.cards) {
    rarityBreakdown[card.rarity]++;
    if (card.isHolo) holoCount++;
    if (compareRarity(card.rarity, bestCard.rarity) > 0) {
      bestCard = card;
    }
  }
  
  return {
    totalCards: pack.cards.length,
    rarityBreakdown,
    holoCount,
    bestCard,
  };
}
