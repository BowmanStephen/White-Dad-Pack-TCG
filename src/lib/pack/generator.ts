import type { Card, Pack, PackCard, PackConfig, Rarity, HoloVariant, PackDesign, PackType, DadType } from '../../types';
import { getCardsByRarity, getAllCards, getCardsByRarityAndType } from '../cards/database';
import { generateId, weightedRandom, SeededRandom } from '../utils/random';
import { RARITY_ORDER } from '../../types';
import { getHighestPityTier } from './pity';

/**
 * Select cards from the rarity pool, excluding already used cards.
 *
 * This function implements the card selection logic for pack generation:
 * - Filters the card database by rarity (and type for theme packs)
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
 * @param themeType - Optional dad type filter for theme packs (PACK-001)
 * @returns Array of selected cards (may be empty if no cards available)
 */
export function selectCards(
  rarity: Rarity,
  excludedIds: Set<string>,
  count: number = 1,
  rng?: SeededRandom,
  themeType?: DadType
): Card[] {
  const selected: Card[] = [];

  for (let i = 0; i < count; i++) {
    // Get available cards of the requested rarity (and type for theme packs)
    let available = themeType
      ? getCardsByRarityAndType(rarity, themeType).filter((card) => !excludedIds.has(card.id))
      : getCardsByRarity(rarity).filter((card) => !excludedIds.has(card.id));

    // Fallback 1: Try adjacent rarities if pool is exhausted
    if (available.length === 0) {
      const rarityValue = RARITY_ORDER[rarity];
      const allRarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

      // Search outward from the requested rarity (lower first, then higher)
      for (const otherRarity of allRarities) {
        if (otherRarity === rarity) continue;

        const otherValue = RARITY_ORDER[otherRarity];
        // Try lower rarities first
        if (otherValue < rarityValue) {
          available = themeType
            ? getCardsByRarityAndType(otherRarity, themeType).filter((card) => !excludedIds.has(card.id))
            : getCardsByRarity(otherRarity).filter((card) => !excludedIds.has(card.id));
          if (available.length > 0) break;
        }
      }

      // If still no cards, try higher rarities
      if (available.length === 0) {
        for (const otherRarity of allRarities) {
          if (otherRarity === rarity) continue;

          const otherValue = RARITY_ORDER[otherRarity];
          if (otherValue > rarityValue) {
            available = themeType
              ? getCardsByRarityAndType(otherRarity, themeType).filter((card) => !excludedIds.has(card.id))
              : getCardsByRarity(otherRarity).filter((card) => !excludedIds.has(card.id));
            if (available.length > 0) break;
          }
        }
      }
    }

    // Fallback 2: Allow duplicates if all pools are exhausted
    if (available.length === 0) {
      available = themeType
        ? getCardsByRarityAndType(rarity, themeType)
        : getCardsByRarity(rarity);
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
  packType: 'standard',
};

/**
 * Premium pack configuration with higher rare chance (PACK-001)
 *
 * Slot breakdown:
 * - Slot 1-2: Common (100%)
 * - Slot 3-4: Uncommon or better (60% uncommon, 30% rare, 8% epic, 2% legendary+)
 * - Slot 5-6: Rare or better (70% rare, 20% epic, 9% legendary+, 1% mythic)
 * - Holo chance: 1 in 3 cards (~33.33%) - doubled from standard
 */
export const PREMIUM_PACK_CONFIG: PackConfig = {
  cardsPerPack: 6,
  raritySlots: [
    { slot: 1, guaranteedRarity: 'common' },
    { slot: 2, guaranteedRarity: 'common' },
    {
      slot: 3,
      rarityPool: true,
      probability: { uncommon: 0.60, rare: 0.30, epic: 0.08, legendary: 0.019, mythic: 0.001 }
    },
    {
      slot: 4,
      rarityPool: true,
      probability: { uncommon: 0.60, rare: 0.30, epic: 0.08, legendary: 0.019, mythic: 0.001 }
    },
    {
      slot: 5,
      rarityPool: true,
      probability: { rare: 0.70, epic: 0.20, legendary: 0.09, mythic: 0.01 }
    },
    {
      slot: 6,
      rarityPool: true,
      probability: { rare: 0.70, epic: 0.20, legendary: 0.09, mythic: 0.01 }
    },
  ],
  holoChance: 1 / 3, // ~33.33% chance for holo (doubled from standard)
  packType: 'premium',
};

/**
 * Theme pack configuration for specific dad types (PACK-001)
 *
 * Same rarity distribution as standard packs, but all cards are from
 * a specific dad type (BBQ_DAD, FIX_IT_DAD, etc.)
 *
 * Slot breakdown:
 * - Slot 1-3: Common (100%) of theme type
 * - Slot 4-5: Uncommon or better (74% uncommon, 20% rare, 5% epic, 1% legendary+) of theme type
 * - Slot 6: Rare or better (87.9% rare, 10% epic, 2% legendary+, 0.1% mythic) of theme type
 * - Holo chance: 1 in 6 cards (~16.67%)
 */
export function createThemePackConfig(themeType: DadType): PackConfig {
  return {
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
    holoChance: 1 / 6, // ~16.67% chance for holo
    packType: 'theme',
    themeType,
  };
}

/**
 * Get pack configuration by type (PACK-001)
 *
 * @param packType - The type of pack to get configuration for
 * @param themeType - Optional dad type for theme packs
 * @returns Pack configuration for the specified pack type
 *
 * @example
 * // Get standard pack config
 * const config = getPackConfig('standard');
 *
 * @example
 * // Get premium pack config
 * const config = getPackConfig('premium');
 *
 * @example
 * // Get theme pack config for BBQ dads
 * const config = getPackConfig('theme', 'BBQ_DAD');
 */
export function getPackConfig(packType: PackType, themeType?: DadType): PackConfig {
  switch (packType) {
    case 'standard':
      return DEFAULT_PACK_CONFIG;
    case 'premium':
      return PREMIUM_PACK_CONFIG;
    case 'theme':
      if (!themeType) {
        throw new Error('Theme pack requires a themeType parameter (dad type)');
      }
      return createThemePackConfig(themeType);
    default:
      return DEFAULT_PACK_CONFIG;
  }
}

/**
 * Compare two rarities
 *
 * @param a - First rarity to compare
 * @param b - Second rarity to compare
 * @returns Positive if a > b, negative if a < b, 0 if equal
 *
 * @example
 * compareRarity('rare', 'common') // > 0 (rare is higher)
 * compareRarity('uncommon', 'epic') // < 0 (uncommon is lower)
 * compareRarity('rare', 'rare') // === 0 (equal)
 */
export function compareRarity(a: Rarity, b: Rarity): number {
  return RARITY_ORDER[a] - RARITY_ORDER[b];
}

/**
 * Get the highest rarity from an array of cards
 *
 * @param cards - Array of cards to search
 * @returns The highest rarity tier found in the array
 *
 * @example
 * const cards = [
 *   { name: 'Card1', rarity: 'common' },
 *   { name: 'Card2', rarity: 'rare' },
 *   { name: 'Card3', rarity: 'uncommon' }
 * ];
 * getHighestRarity(cards) // Returns 'rare'
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
 * Validate rarity distribution matches pack configuration
 *
 * This function ensures the generated pack meets the minimum rarity requirements
 * specified in the configuration. It's a safeguard to detect:
 * - Misconfigured rarity slots
 * - Card database issues (missing rarities)
 * - Generation logic bugs
 *
 * @param cards - The generated pack cards
 * @param config - The pack configuration used
 * @throws Error if rarity distribution doesn't meet minimum requirements
 */
function validateRarityDistribution(cards: PackCard[], config: PackConfig): void {
  const rarityCounts: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };

  // Count rarities in the pack
  for (const card of cards) {
    rarityCounts[card.rarity]++;
  }

  // Check each slot's requirements
  for (const slot of config.raritySlots) {
    if (slot.guaranteedRarity) {
      // For guaranteed rarity slots, we need to ensure the pack contains
      // at least as many cards of that rarity as there are guaranteed slots
      const guaranteedCount = config.raritySlots.filter(
        s => s.guaranteedRarity === slot.guaranteedRarity
      ).length;

      const actualCount = rarityCounts[slot.guaranteedRarity];

      if (actualCount < guaranteedCount) {
        throw new Error(
          `Pack validation failed: expected at least ${guaranteedCount} ${slot.guaranteedRarity} cards ` +
          `but found ${actualCount}. This may indicate the card database is missing ${slot.guaranteedRarity} cards.`
        );
      }
    }

    // For probability slots, we don't enforce exact counts (that's probabilistic)
    // But we can add warnings if something looks very wrong
    if (slot.rarityPool && slot.probability) {
      // Check that at least some cards from the probability pool exist
      const poolRarities = Object.keys(slot.probability) as Rarity[];
      const poolCount = poolRarities.reduce((sum, rarity) => sum + rarityCounts[rarity], 0);

      // We should have at least 1 card from the probability pool across all such slots
      // This is a soft check - it's possible (though unlikely) to get 0
      if (poolCount === 0 && Math.random() < 0.01) {
        // Only warn 1% of the time to avoid spamming
        console.warn(
          `Pack generation warning: no cards from probability pool ${poolRarities.join(', ')} ` +
          `in this pack. This may be due to bad luck or missing cards.`
        );
      }
    }
  }

  // Additional sanity check: ensure we have the expected total number of cards
  if (cards.length !== config.cardsPerPack) {
    throw new Error(
      `Pack validation failed: expected ${config.cardsPerPack} cards but got ${cards.length}`
    );
  }
}

/**
 * Generate a single pack of cards based on configuration
 *
 * @param config - Pack configuration defining rarity slots and probabilities
 * @param seed - Optional seed for reproducible random generation (useful for testing)
 * @param pityCounter - Optional pity counter state for bad luck protection (PACK-003)
 * @returns A complete Pack object with 6 cards, design, and metadata
 *
 * @example
 * // Generate a random pack
 * const pack = generatePack();
 *
 * @example
 * // Generate a reproducible pack (same seed = same cards)
 * const pack1 = generatePack(DEFAULT_PACK_CONFIG, 12345);
 * const pack2 = generatePack(DEFAULT_PACK_CONFIG, 12345);
 * // pack1 === pack2 (identical cards and design)
 *
 * @example
 * // Generate with pity system (PACK-003)
 * const pityCounter = { rare: 10, epic: 5, legendary: 0, mythic: 0 };
 * const pack = generatePack(DEFAULT_PACK_CONFIG, undefined, pityCounter);
 * // Guaranteed rare due to pity (10 consecutive packs without rare+)
 *
 * @description
 * This function implements the core pack opening mechanics:
 * - Checks pity counter and applies bad luck protection if threshold reached (PACK-003)
 * - Processes each rarity slot in the config (guaranteed or probabilistic)
 * - Selects cards without duplicates within the pack
 * - Determines holo variants based on rarity probabilities
 * - Shuffles cards to prevent position-based prediction
 * - Assigns pack design (standard/holiday/premium)
 */
export function generatePack(
  config: PackConfig = DEFAULT_PACK_CONFIG,
  seed?: number,
  pityCounter?: { rare: number; epic: number; legendary: number; mythic: number }
): Pack {
  const rng = new SeededRandom(seed);
  const packCards: PackCard[] = [];
  const usedCardIds = new Set<string>();

  // Extract theme type for theme packs (PACK-001)
  const themeType = config.themeType as DadType | undefined;

  // PACK-003: Check if pity should trigger
  let pityRarity: Rarity | null = null;
  if (pityCounter) {
    pityRarity = getHighestPityTier(pityCounter);
    if (pityRarity) {
      console.log(`[Pity System] Triggering ${pityRarity} pity (bad luck protection)`);
    }
  }

  // Process each slot in the pack
  for (const slot of config.raritySlots) {
    let rarity: Rarity;

    if (slot.guaranteedRarity) {
      // Guaranteed rarity slot
      rarity = slot.guaranteedRarity;
    } else if (slot.rarityPool && slot.probability) {
      // PACK-003: Override with pity rarity if pity is triggered
      // and this is the last slot (slot 6 - the rare or better slot)
      if (pityRarity && slot.slot === 6) {
        rarity = pityRarity;
        console.log(`[Pity System] Overriding slot 6 rarity to ${rarity} (bad luck protection)`);
      } else {
        // Random rarity from probability pool
        rarity = weightedRandom(slot.probability, rng);
      }
    } else {
      // Fallback to common
      rarity = 'common';
    }

    // Use the selectCards function to get a card from the appropriate rarity pool
    // Pass themeType for theme packs to filter by dad type
    const [selectedCard] = selectCards(rarity, usedCardIds, 1, rng, themeType);

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

  // SAFEGUARD 1: Verify pack has exactly 6 cards
  if (packCards.length !== config.cardsPerPack) {
    throw new Error(
      `Pack generation failed: expected ${config.cardsPerPack} cards but got ${packCards.length}. ` +
      `This may indicate the card database is empty or missing required rarities.`
    );
  }

  // Shuffle the cards so rarity isn't predictable by position
  const shuffledCards = rng.shuffle(packCards);

  // SAFEGUARD 2: Verify rarity distribution within acceptable tolerance
  validateRarityDistribution(shuffledCards, config);

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
 * Calculate pack statistics for display purposes
 *
 * Computes useful statistics about a pack including:
 * - Total card count
 * - Rarity distribution (how many cards of each rarity)
 * - Number of holographic cards
 * - The best card in the pack (by rarity)
 *
 * @param pack - The pack to analyze
 * @returns Pack statistics including total cards, rarity breakdown, holo count, and best card
 *
 * @example
 * const pack = generatePack();
 * const stats = getPackStats(pack);
 * console.log(`Total: ${stats.totalCards}, Holos: ${stats.holoCount}`);
 * console.log(`Best: ${stats.bestCard.name} (${stats.bestCard.rarity})`);
 * console.log(`Rarities:`, stats.rarityBreakdown);
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
