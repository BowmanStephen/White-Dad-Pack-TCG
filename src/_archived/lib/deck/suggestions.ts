/**
 * Deck suggestions module
 *
 * Provides type synergy analysis and card recommendations for deck building.
 */

import type { Card, Deck, DadType, DeckCard } from '@/types';
import { DAD_TYPE_NAMES } from '@/types';

/**
 * Type synergy suggestion
 */
export interface TypeSuggestion {
  type: DadType;
  currentCount: number;
  suggestedCount: number;
  synergyBonus: number; // e.g., 0.15 for 15% bonus
  reason: string;
}

/**
 * Card recommendation
 */
export interface CardRecommendation {
  card: Card;
  reason: string;
  synergyType: DadType;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Deck synergy analysis result
 */
export interface DeckSynergyAnalysis {
  dominantType: DadType | null;
  synergyPotential: number; // 0-100 percentage
  typeSuggestions: TypeSuggestion[];
  cardRecommendations: CardRecommendation[];
  currentBonus: number;
  possibleBonus: number;
}

/**
 * Analyze deck for type synergies and generate suggestions
 *
 * This function examines the current deck composition and suggests:
 * 1. The dominant type (if any)
 * 2. How many more cards of each type to add for synergy bonuses
 * 3. Specific cards from collection that would improve synergy
 * 4. Overall synergy potential percentage
 *
 * Synergy bonuses (from PACK-009):
 * - 5+ cards of same type: 15% bonus (1.15x multiplier)
 * - 3+ cards of same type: 5% bonus (1.05x multiplier)
 * - Mixed types: no bonus (1.0x multiplier)
 *
 * @param deck - Current deck being built
 * @param collection - User's card collection to recommend from
 * @returns Synergy analysis with suggestions and recommendations
 *
 * @example
 * ```ts
 * const analysis = analyzeDeckSynergy(myDeck, myCollection);
 * console.log(`Synergy Potential: ${analysis.synergyPotential}%`);
 * console.log(`Add ${analysis.typeSuggestions[0].suggestedCount} more BBQ_DAD for 15% bonus`);
 * ```
 */
export function analyzeDeckSynergy(
  deck: Deck,
  collection: { cards: Card[] }
): DeckSynergyAnalysis {
  // Count cards by type in current deck
  const typeCounts: Record<DadType, number> = {} as any;

  // Initialize with zero for all types
  const knownTypes: DadType[] = [
    'BBQ_DAD', 'FIX_IT_DAD', 'GOLF_DAD', 'COUCH_DAD', 'LAWN_DAD',
    'CAR_DAD', 'OFFICE_DAD', 'COOL_DAD', 'COACH_DAD', 'CHEF_DAD',
    'HOLIDAY_DAD', 'WAREHOUSE_DAD', 'VINTAGE_DAD', 'FASHION_DAD',
    'TECH_DAD', 'ITEM'
  ];

  for (const type of knownTypes) {
    typeCounts[type] = 0;
  }

  // Count each card's type (weighted by count in deck)
  for (const deckCard of deck.cards) {
    const cardType = deckCard.card.type;
    typeCounts[cardType] = (typeCounts[cardType] || 0) + deckCard.count;
  }

  // Find dominant type (most cards)
  let dominantType: DadType | null = null;
  let maxCount = 0;

  for (const [type, count] of Object.entries(typeCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantType = type as DadType;
    }
  }

  // Calculate current bonus
  let currentBonus = 0;
  if (maxCount >= 5) {
    currentBonus = 0.15; // 15% bonus
  } else if (maxCount >= 3) {
    currentBonus = 0.05; // 5% bonus
  }

  // Generate type suggestions
  const typeSuggestions: TypeSuggestion[] = [];

  for (const [type, count] of Object.entries(typeCounts)) {
    const typeKey = type as DadType;

    // Skip types with no cards
    if (count === 0) continue;

    // Calculate synergy bonus potential
    let synergyBonus = 0;
    let suggestedCount = 0;
    let reason = '';

    if (count >= 5) {
      // Already max bonus
      synergyBonus = 0.15;
      suggestedCount = 0;
      reason = `${DAD_TYPE_NAMES[typeKey]} synergy maximized at 15% bonus`;
    } else if (count >= 3) {
      // Has 5% bonus, suggest 2 more for 15%
      synergyBonus = 0.15;
      suggestedCount = 5 - count;
      reason = `Add ${suggestedCount} more ${DAD_TYPE_NAMES[typeKey]} for 15% synergy bonus`;
    } else if (count >= 1) {
      // Has some, suggest reaching 3 for 5%
      synergyBonus = 0.05;
      suggestedCount = 3 - count;
      reason = `Add ${suggestedCount} more ${DAD_TYPE_NAMES[typeKey]} for 5% synergy bonus`;
    }

    typeSuggestions.push({
      type: typeKey,
      currentCount: count,
      suggestedCount,
      synergyBonus,
      reason,
    });
  }

  // Sort suggestions by synergy bonus (highest first)
  typeSuggestions.sort((a, b) => b.synergyBonus - a.synergyBonus);

  // Calculate possible bonus
  const possibleBonus = typeSuggestions.length > 0
    ? typeSuggestions[0].synergyBonus
    : 0;

  // Calculate synergy potential (0-100%)
  // Base: 50% for having a deck
  // +20% for 3+ cards of same type
  // +30% for 5+ cards of same type
  let synergyPotential = 50; // Base
  if (maxCount >= 5) {
    synergyPotential = 100;
  } else if (maxCount >= 3) {
    synergyPotential = 75;
  }

  // Generate card recommendations from collection
  const cardRecommendations: CardRecommendation[] = [];

  // Recommend cards that match dominant type
  if (dominantType && maxCount < 5) {
    const needed = 5 - maxCount;

    // Find cards of dominant type in collection
    const matchingCards = collection.cards.filter(
      collectionCard =>
        collectionCard.type === dominantType &&
        !deck.cards.find(deckCard => deckCard.cardId === collectionCard.id)
    );

    // Sort by rarity (rarer first) and stats
    matchingCards.sort((a, b) => {
      // Prioritize higher rarity
      const rarityOrder: Record<string, number> = {
        mythic: 6,
        legendary: 5,
        epic: 4,
        rare: 3,
        uncommon: 2,
        common: 1,
      };
      const rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity];
      if (rarityDiff !== 0) return rarityDiff;

      // Then by average stats
      const aAvg = Object.values(a.stats).reduce((sum, val) => sum + val, 0) / 8;
      const bAvg = Object.values(b.stats).reduce((sum, val) => sum + val, 0) / 8;
      return bAvg - aAvg;
    });

    // Take top recommendations
    const topCards = matchingCards.slice(0, needed);
    for (const card of topCards) {
      let priority: 'high' | 'medium' | 'low' = 'medium';

      // High priority for mythic/legendary
      if (card.rarity === 'mythic' || card.rarity === 'legendary') {
        priority = 'high';
      }

      // Low priority for common
      if (card.rarity === 'common') {
        priority = 'low';
      }

      cardRecommendations.push({
        card,
        reason: `Matches dominant ${DAD_TYPE_NAMES[dominantType]} type`,
        synergyType: dominantType,
        priority,
      });
    }
  }

  // If no dominant type, suggest most popular types from collection
  if (!dominantType && deck.cards.length < 3) {
    // Count types in collection
    const collectionTypeCounts: Record<DadType, number> = {} as any;
    for (const type of knownTypes) {
      collectionTypeCounts[type] = 0;
    }

    for (const card of collection.cards) {
      collectionTypeCounts[card.type]++;
    }

    // Find most common type in collection
    let maxCollectionCount = 0;
    let mostCommonType: DadType = 'BBQ_DAD';

    for (const [type, count] of Object.entries(collectionTypeCounts)) {
      if (count > maxCollectionCount) {
        maxCollectionCount = count;
        mostCommonType = type as DadType;
      }
    }

    // Recommend cards of most common type
    const typeCards = collection.cards.filter(
      card => card.type === mostCommonType
    );

    const topCards = typeCards.slice(0, 3);
    for (const card of topCards) {
      cardRecommendations.push({
        card,
        reason: `Start building ${DAD_TYPE_NAMES[mostCommonType]} synergy`,
        synergyType: mostCommonType,
        priority: 'medium',
      });
    }
  }

  return {
    dominantType,
    synergyPotential,
    typeSuggestions,
    cardRecommendations,
    currentBonus,
    possibleBonus,
  };
}

/**
 * Check if a card synergizes with current deck
 *
 * Used for highlighting synergistic cards when dragging to deck.
 * Returns true if card matches dominant type or would create a new synergy.
 *
 * @param card - Card to check
 * @param deck - Current deck
 * @returns True if card has synergy with deck
 *
 * @example
 * ```ts
 * const hasSynergy = checkCardSynergy(bbqCard, myDeck);
 * // Returns true if deck has BBQ_DAD type cards
 * ```
 */
export function checkCardSynergy(card: Card, deck: Deck): boolean {
  // Count cards by type in deck
  const typeCounts: Record<string, number> = {};

  for (const deckCard of deck.cards) {
    const type = deckCard.card.type;
    typeCounts[type] = (typeCounts[type] || 0) + deckCard.count;
  }

  // Check if card's type already exists in deck
  const currentCount = typeCounts[card.type] || 0;

  // Has synergy if:
  // - Already has this type (any amount)
  // - Or adding this card would create a type (count goes from 0 to 1)
  return currentCount > 0 || deck.cards.length === 0;
}

/**
 * Get synergy bonus percentage for a deck
 *
 * @param deck - Deck to check
 * @returns Synergy bonus percentage (0, 5, or 15)
 */
export function getSynergyBonus(deck: Deck): number {
  // Count cards by type
  const typeCounts: Record<string, number> = {};

  for (const deckCard of deck.cards) {
    const type = deckCard.card.type;
    typeCounts[type] = (typeCounts[type] || 0) + deckCard.count;
  }

  // Find max count
  const maxCount = Math.max(...Object.values(typeCounts), 0);

  // Return bonus
  if (maxCount >= 5) return 15;
  if (maxCount >= 3) return 5;
  return 0;
}

/**
 * Stat optimization suggestion
 */
export interface StatOptimization {
  statKey: keyof Card['stats'];
  statName: string;
  currentValue: number;
  targetValue: number;
  difference: number;
  priority: 'high' | 'medium' | 'low';
  recommendedCards: Card[];
}

/**
 * Stat imbalance analysis
 */
export interface StatImbalance {
  statKey: keyof Card['stats'];
  statName: string;
  value: number;
  deviation: number; // How far from average
  isHigh: boolean; // true if above average, false if below
}

/**
 * Deck stat optimization analysis result
 */
export interface DeckStatOptimization {
  weakestStat: StatOptimization | null;
  strongestStat: StatOptimization | null;
  imbalances: StatImbalance[];
  overallBalance: number; // 0-100, higher = more balanced
  recommendations: StatOptimization[];
}

/**
 * Analyze deck stats for optimization opportunities
 *
 * This function examines the deck's stat distribution and identifies:
 * 1. Weakest stat (lowest average value)
 * 2. Strongest stat (highest average value)
 * 3. Stat imbalances (significant deviations from average)
 * 4. Overall balance score (0-100)
 * 5. Specific card recommendations to improve weak stats
 *
 * @param deck - Current deck being analyzed
 * @param collection - User's card collection for recommendations
 * @returns Stat optimization analysis with recommendations
 *
 * @example
 * ```ts
 * const analysis = analyzeDeckStats(myDeck, myCollection);
 * if (analysis.weakestStat) {
 *   console.log(`Lowest stat: ${analysis.weakestStat.statName} at ${analysis.weakestStat.currentValue}`);
 *   console.log(`Recommendation: Add ${analysis.weakestStat.recommendedCards[0].name}`);
 * }
 * ```
 */
export function analyzeDeckStats(
  deck: Deck,
  collection: { cards: Card[] }
): DeckStatOptimization {
  if (deck.cards.length === 0) {
    return {
      weakestStat: null,
      strongestStat: null,
      imbalances: [],
      overallBalance: 0,
      recommendations: [],
    };
  }

  const stats = deck.stats.averageStats;
  const statEntries = Object.entries(stats) as [keyof Card['stats'], number][];

  // Calculate average across all stats
  const statValues = statEntries.map(([, value]) => value);
  const averageStat = statValues.reduce((sum, val) => sum + val, 0) / statValues.length;

  // Find weakest and strongest stats
  let weakestStat: [keyof Card['stats'], number] | null = null;
  let strongestStat: [keyof Card['stats'], number] | null = null;
  let minValue = 100;
  let maxValue = 0;

  for (const [key, value] of statEntries) {
    if (value < minValue) {
      minValue = value;
      weakestStat = [key, value];
    }
    if (value > maxValue) {
      maxValue = value;
      strongestStat = [key, value];
    }
  }

  // Analyze imbalances (stats that deviate significantly from average)
  const imbalances: StatImbalance[] = [];
  const balanceThreshold = 15; // Consider imbalanced if deviates by 15+ points

  for (const [key, value] of statEntries) {
    const deviation = Math.abs(value - averageStat);
    if (deviation >= balanceThreshold) {
      imbalances.push({
        statKey: key,
        statName: getStatName(key),
        value,
        deviation,
        isHigh: value > averageStat,
      });
    }
  }

  // Sort imbalances by deviation (most imbalanced first)
  imbalances.sort((a, b) => b.deviation - a.deviation);

  // Calculate overall balance score (0-100)
  // Lower deviation from average = higher balance score
  const totalDeviation = statValues.reduce((sum, val) => sum + Math.abs(val - averageStat), 0);
  const maxPossibleDeviation = statValues.length * 50; // If all stats are 0 or 100
  const balanceScore = Math.max(0, 100 - (totalDeviation / maxPossibleDeviation) * 100);

  // Generate recommendations for weakest stat
  const recommendations: StatOptimization[] = [];

  if (weakestStat) {
    const [statKey, currentValue] = weakestStat;
    const targetValue = Math.round(averageStat + 10); // Target 10 points above current average
    const difference = targetValue - currentValue;

    // Find cards from collection that excel in this stat
    const recommendedCards = collection.cards
      .filter(
        card =>
          !deck.cards.find(deckCard => deckCard.cardId === card.id) &&
          card.stats[statKey] >= currentValue + difference
      )
      .sort((a, b) => b.stats[statKey] - a.stats[statKey])
      .slice(0, 5);

    // Determine priority based on severity
    let priority: 'high' | 'medium' | 'low' = 'low';
    if (difference >= 30) priority = 'high';
    else if (difference >= 15) priority = 'medium';

    recommendations.push({
      statKey,
      statName: getStatName(statKey),
      currentValue,
      targetValue,
      difference,
      priority,
      recommendedCards,
    });
  }

  // Generate optimization for each imbalanced stat
  for (const imbalance of imbalances) {
    if (imbalance.isHigh) continue; // Skip high stats (we want to boost low ones)

    const targetValue = Math.round(averageStat);
    const difference = targetValue - imbalance.value;

    // Find cards that can boost this stat
    const recommendedCards = collection.cards
      .filter(
        card =>
          !deck.cards.find(deckCard => deckCard.cardId === card.id) &&
          card.stats[imbalance.statKey] >= targetValue
      )
      .sort((a, b) => b.stats[imbalance.statKey] - a.stats[imbalance.statKey])
      .slice(0, 3);

    let priority: 'high' | 'medium' | 'low' = 'low';
    if (imbalance.deviation >= 30) priority = 'high';
    else if (imbalance.deviation >= 20) priority = 'medium';

    recommendations.push({
      statKey: imbalance.statKey,
      statName: imbalance.statName,
      currentValue: imbalance.value,
      targetValue,
      difference,
      priority,
      recommendedCards,
    });
  }

  // Sort recommendations by priority (high first)
  recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  // Build weakest stat optimization
  const weakestStatOpt = weakestStat
    ? {
        statKey: weakestStat[0],
        statName: getStatName(weakestStat[0]),
        currentValue: weakestStat[1],
        targetValue: Math.round(averageStat + 10),
        difference: Math.round(averageStat + 10) - weakestStat[1],
        priority: (weakestStat[1] < 40 ? 'high' : weakestStat[1] < 55 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
        recommendedCards: recommendations[0]?.recommendedCards || [],
      }
    : null;

  // Build strongest stat optimization
  const strongestStatOpt = strongestStat
    ? {
        statKey: strongestStat[0],
        statName: getStatName(strongestStat[0]),
        currentValue: strongestStat[1],
        targetValue: strongestStat[1],
        difference: 0,
        priority: 'low' as const,
        recommendedCards: [],
      }
    : null;

  return {
    weakestStat: weakestStatOpt,
    strongestStat: strongestStatOpt,
    imbalances,
    overallBalance: Math.round(balanceScore),
    recommendations,
  };
}

/**
 * Get friendly stat name from key
 */
function getStatName(key: keyof Card['stats']): string {
  const names: Record<keyof Card['stats'], string> = {
    dadJoke: 'Dad Joke',
    grillSkill: 'Grill Skill',
    fixIt: 'Fix-It',
    napPower: 'Nap Power',
    remoteControl: 'Remote Control',
    thermostat: 'Thermostat',
    sockSandal: 'Sock & Sandal',
    beerSnob: 'Beer Snob',
  };
  return names[key] || key;
}
