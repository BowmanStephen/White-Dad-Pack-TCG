/**
 * Collection Completion System
 *
 * Tracks progress toward collecting all cards and awards milestones.
 * Awards badges and bonus packs at 25%, 50%, 75%, and 100% completion.
 *
 * Features:
 * - Overall collection completion tracking
 * - Per-rarity completion tracking
 * - Per-type (Dad Type) completion tracking
 * - Milestone rewards (badges, packs, titles)
 * - Missing card identification
 *
 * @see docs/CARD_MECHANICS.md for full documentation
 */

import type {
  Rarity,
  DadType,
  Collection,
  CollectionCompletion,
  RarityCompletion,
  TypeCompletion,
  CompletionMilestone,
  CompletionReward,
  CompletionConfig,
} from '../../types';
import {
  DEFAULT_COMPLETION_CONFIG,
  COMPLETION_MILESTONES,
  RARITY_COMPLETION_MILESTONES,
} from '../../types';
import { getAllCards, getCardsByRarity } from '../cards/database';

// ============================================================================
// COMPLETION CALCULATION
// ============================================================================

const RARITIES: Rarity[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
  'mythic',
];

// Use internal X-rated DadType names from core.ts (Season 2+ branding)
const CORE_TYPES: DadType[] = [
  'BBQ_DICKTATOR',
  'FIX_IT_FUCKBOY',
  'GOLF_GONAD',
  'COUCH_CUMMANDER',
  'LAWN_LUNATIC',
  'CAR_COCK',
  'OFFICE_ORGASMS',
  'COOL_CUCKS',
  'COACH_CUMSTERS',
  'CHEF_CUMSTERS',
  'HOLIDAY_HORNDOGS',
  'WAREHOUSE_WANKERS',
  'VINTAGE_VAGABONDS',
  'FASHION_FUCK',
  'TECH_TWATS',
  'ITEM',
];

/**
 * Get all unique card IDs owned by the player
 */
function getOwnedCardIds(collection: Collection): Set<string> {
  const ownedIds = new Set<string>();
  for (const pack of collection.packs) {
    for (const card of pack.cards) {
      ownedIds.add(card.id);
    }
  }
  return ownedIds;
}

/**
 * Calculate completion percentage
 */
function calculatePercentage(owned: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((owned / total) * 100 * 100) / 100; // Round to 2 decimal places
}

/**
 * Create milestones for a completion category
 */
function createMilestones(
  percentage: number,
  milestoneRewards: Record<number, CompletionReward>,
  config: CompletionConfig
): CompletionMilestone[] {
  return config.milestonePercentages.map((threshold) => {
    const reward = milestoneRewards[threshold] || {
      type: 'badge' as const,
      value: `milestone_${threshold}`,
      description: `${threshold}% Complete`,
      icon: getMilestoneIcon(threshold),
    };

    return {
      percentage: threshold,
      reward,
      achieved: percentage >= threshold,
      achievedAt: percentage >= threshold ? new Date() : undefined,
    };
  });
}

/**
 * Calculate per-rarity completion
 */
function calculateRarityCompletion(
  ownedIds: Set<string>,
  config: CompletionConfig
): Record<Rarity, RarityCompletion> {
  const result: Record<Rarity, RarityCompletion> = {} as Record<
    Rarity,
    RarityCompletion
  >;

  for (const rarity of RARITIES) {
    const allCardsOfRarity = getCardsByRarity(rarity);
    const totalCards = allCardsOfRarity.length;
    const ownedCards = allCardsOfRarity.filter((card) => ownedIds.has(card.id)).length;
    const missingCardIds = allCardsOfRarity
      .filter((card) => !ownedIds.has(card.id))
      .map((card) => card.id);
    const percentage = calculatePercentage(ownedCards, totalCards);

    const milestoneRewards = RARITY_COMPLETION_MILESTONES[rarity] || {};
    const milestones = config.enableRarityMilestones
      ? createMilestones(percentage, milestoneRewards, config)
      : [];

    result[rarity] = {
      rarity,
      totalCards,
      ownedCards,
      percentage,
      missingCardIds,
      milestones,
    };
  }

  return result;
}

/**
 * Calculate per-type completion
 */
function calculateTypeCompletion(
  ownedIds: Set<string>
): Record<DadType, TypeCompletion> {
  const allCards = getAllCards();
  const result: Record<DadType, TypeCompletion> = {} as Record<
    DadType,
    TypeCompletion
  >;

  for (const type of CORE_TYPES) {
    const allCardsOfType = allCards.filter((card) => card.type === type);
    const totalCards = allCardsOfType.length;
    const ownedCards = allCardsOfType.filter((card) => ownedIds.has(card.id)).length;
    const missingCardIds = allCardsOfType
      .filter((card) => !ownedIds.has(card.id))
      .map((card) => card.id);
    const percentage = calculatePercentage(ownedCards, totalCards);

    result[type] = {
      type,
      totalCards,
      ownedCards,
      percentage,
      missingCardIds,
    };
  }

  return result;
}

/**
 * Calculate overall collection completion
 *
 * @param collection - The player's collection
 * @param config - Optional completion configuration
 * @returns CollectionCompletion object with full progress data
 */
export function calculateCollectionCompletion(
  collection: Collection,
  config: CompletionConfig = DEFAULT_COMPLETION_CONFIG
): CollectionCompletion {
  const allCards = getAllCards();
  const ownedIds = getOwnedCardIds(collection);

  const totalCardsInGame = allCards.length;
  const totalCardsOwned = ownedIds.size;
  const overallPercentage = calculatePercentage(totalCardsOwned, totalCardsInGame);

  // Create overall milestones
  const overallMilestones = createMilestones(
    overallPercentage,
    COMPLETION_MILESTONES,
    config
  );

  // Calculate per-rarity and per-type completion
  const rarityCompletion = calculateRarityCompletion(ownedIds, config);
  const typeCompletion = calculateTypeCompletion(ownedIds);

  // Collect achievements and badges
  const achievementsUnlocked: string[] = [];
  const badgesAwarded: string[] = [];

  // Check overall milestones for badges
  for (const milestone of overallMilestones) {
    if (milestone.achieved && milestone.reward.type === 'badge') {
      badgesAwarded.push(milestone.reward.value as string);
      achievementsUnlocked.push(`overall_${milestone.percentage}`);
    }
  }

  // Check rarity milestones for badges
  for (const rarity of Object.keys(rarityCompletion) as Rarity[]) {
    for (const milestone of rarityCompletion[rarity].milestones) {
      if (milestone.achieved && milestone.reward.type === 'badge') {
        badgesAwarded.push(milestone.reward.value as string);
        achievementsUnlocked.push(`${rarity}_${milestone.percentage}`);
      }
    }
  }

  return {
    totalCardsInGame,
    totalCardsOwned,
    overallPercentage,
    overallMilestones,
    rarityCompletion,
    typeCompletion,
    achievementsUnlocked,
    badgesAwarded,
    lastUpdated: new Date(),
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get missing cards for a specific rarity
 *
 * @param collection - The player's collection
 * @param rarity - The rarity to check
 * @returns Array of missing card IDs
 */
export function getMissingCardsByRarity(
  collection: Collection,
  rarity: Rarity
): string[] {
  const ownedIds = getOwnedCardIds(collection);
  const allCardsOfRarity = getCardsByRarity(rarity);
  return allCardsOfRarity
    .filter((card) => !ownedIds.has(card.id))
    .map((card) => card.id);
}

/**
 * Get missing cards for a specific type
 *
 * @param collection - The player's collection
 * @param type - The dad type to check
 * @returns Array of missing card IDs
 */
export function getMissingCardsByType(
  collection: Collection,
  type: DadType
): string[] {
  const ownedIds = getOwnedCardIds(collection);
  const allCards = getAllCards();
  const allCardsOfType = allCards.filter((card) => card.type === type);
  return allCardsOfType
    .filter((card) => !ownedIds.has(card.id))
    .map((card) => card.id);
}

/**
 * Get all missing cards
 *
 * @param collection - The player's collection
 * @returns Array of all missing card IDs
 */
export function getAllMissingCards(collection: Collection): string[] {
  const ownedIds = getOwnedCardIds(collection);
  const allCards = getAllCards();
  return allCards.filter((card) => !ownedIds.has(card.id)).map((card) => card.id);
}

/**
 * Check if a specific milestone has been achieved
 *
 * @param collection - The player's collection
 * @param milestonePercentage - The milestone percentage to check (25, 50, 75, 100)
 * @returns True if the milestone has been achieved
 */
export function isMilestoneAchieved(
  collection: Collection,
  milestonePercentage: number
): boolean {
  const completion = calculateCollectionCompletion(collection);
  return completion.overallPercentage >= milestonePercentage;
}

/**
 * Get newly achieved milestones since a previous completion state
 *
 * @param previousCompletion - Previous completion state
 * @param currentCompletion - Current completion state
 * @returns Array of newly achieved milestones
 */
export function getNewlyAchievedMilestones(
  previousCompletion: CollectionCompletion,
  currentCompletion: CollectionCompletion
): CompletionMilestone[] {
  const newMilestones: CompletionMilestone[] = [];

  // Check overall milestones
  for (const milestone of currentCompletion.overallMilestones) {
    const previousMilestone = previousCompletion.overallMilestones.find(
      (m) => m.percentage === milestone.percentage
    );
    if (milestone.achieved && (!previousMilestone || !previousMilestone.achieved)) {
      newMilestones.push(milestone);
    }
  }

  // Check rarity milestones
  for (const rarity of Object.keys(currentCompletion.rarityCompletion) as Rarity[]) {
    for (const milestone of currentCompletion.rarityCompletion[rarity].milestones) {
      const previousRarityCompletion = previousCompletion.rarityCompletion[rarity];
      const previousMilestone = previousRarityCompletion?.milestones.find(
        (m) => m.percentage === milestone.percentage
      );
      if (milestone.achieved && (!previousMilestone || !previousMilestone.achieved)) {
        newMilestones.push(milestone);
      }
    }
  }

  return newMilestones;
}

/**
 * Get completion progress summary for UI display
 *
 * @param collection - The player's collection
 * @returns Summary object for UI
 */
export function getCompletionSummary(collection: Collection): {
  overall: number;
  nextMilestone: number | null;
  cardsToNextMilestone: number;
  totalCards: number;
  ownedCards: number;
  rarityProgress: Record<Rarity, number>;
} {
  const completion = calculateCollectionCompletion(collection);

  // Find next unachieved milestone
  const nextMilestone = completion.overallMilestones.find((m) => !m.achieved);

  // Calculate cards needed for next milestone
  let cardsToNextMilestone = 0;
  if (nextMilestone) {
    const cardsNeeded = Math.ceil((nextMilestone.percentage / 100) * completion.totalCardsInGame);
    cardsToNextMilestone = Math.max(0, cardsNeeded - completion.totalCardsOwned);
  }

  // Rarity progress
  const rarityProgress: Record<Rarity, number> = {} as Record<Rarity, number>;
  for (const rarity of Object.keys(completion.rarityCompletion) as Rarity[]) {
    rarityProgress[rarity] = completion.rarityCompletion[rarity].percentage;
  }

  return {
    overall: completion.overallPercentage,
    nextMilestone: nextMilestone?.percentage || null,
    cardsToNextMilestone,
    totalCards: completion.totalCardsInGame,
    ownedCards: completion.totalCardsOwned,
    rarityProgress,
  };
}

/**
 * Calculate bonus packs to award for newly achieved milestones
 *
 * @param newMilestones - Array of newly achieved milestones
 * @returns Number of bonus packs to award
 */
export function calculateBonusPacksFromMilestones(
  newMilestones: CompletionMilestone[]
): number {
  let totalPacks = 0;

  for (const milestone of newMilestones) {
    // Parse pack count from description or use defaults
    switch (milestone.percentage) {
      case 25:
        totalPacks += 3;
        break;
      case 50:
        totalPacks += 5;
        break;
      case 75:
        totalPacks += 10;
        break;
      case 100:
        totalPacks += 20;
        break;
      default:
        // Rarity-specific milestones
        if (milestone.reward.description.includes('3 Bonus Packs')) {
          totalPacks += 3;
        } else if (milestone.reward.description.includes('5 Bonus Packs')) {
          totalPacks += 5;
        } else if (milestone.reward.description.includes('10 Bonus Packs')) {
          totalPacks += 10;
        } else if (milestone.reward.description.includes('20 Bonus Packs')) {
          totalPacks += 20;
        }
    }
  }

  return totalPacks;
}

function getMilestoneIcon(threshold: number): string {
  if (threshold === 100) {
    return '👑';
  }
  if (threshold >= 75) {
    return '🥇';
  }
  if (threshold >= 50) {
    return '🥈';
  }
  return '🥉';
}
