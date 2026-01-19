/**
 * DadDeck™ Ability Keyword System (PACK-040)
 *
 * Standardized keywords for card abilities that provide consistent,
 * predictable effects across all cards.
 *
 * ## Why Keywords?
 *
 * **Problem:** Abilities have free-form text descriptions that are hard to parse,
 * inconsistent, and don't translate well to gameplay mechanics.
 *
 * **Solution:** Keywords provide standardized, predictable effects that can be:
 * - Programmatically executed in battle system
 * - Explained via tooltips for new players
 * - Combined and stacked in predictable ways
 * - Localized to different languages
 *
 * ## Keyword Categories
 *
 * 1. **Damage Keywords** - Direct damage effects
 * 2. **Status Keywords** - Apply status effects (grilled, lectured, etc.)
 * 3. **Buff Keywords** - Temporary stat boosts
 * 4. **Debuff Keywords** - Temporary stat reductions
 * 5. **Utility Keywords** - Draw cards, heal, shuffle, etc.
 * 6. **Special Keywords** - Unique effects (transform, evolve, etc.)
 *
 * ## Usage Pattern
 *
 * ```typescript
 * // In card data (cards.json):
 * {
 *   "abilities": [
 *     {
 *       "name": "Flame On Fuckery",
 *       "keywords": ["BURN", "AOE"],
 *       "keywordValues": {
 *         "BURN": 50,
 *         "AOE": "all"
 *       },
 *       "description": "Apply BURN (50 damage) to all opponents."
 *     }
 *   ]
 * }
 *
 * // In code:
 * import { executeKeywords } from '@/lib/mechanics/keywords';
 *
 * const result = executeKeywords(card.ability.keywords, card, target);
 * // Returns damage, status effects, etc.
 * ```
 */

import type { Card, CardStats } from '../../types';
import type { StatusEffect } from './combat';

/**
 * All ability keywords in the game
 *
 * Keywords are organized by category for better organization and discoverability.
 * Each keyword has a standardized effect that can be executed programmatically.
 */
export type AbilityKeyword =
  // Damage Keywords
  | 'BURN'          // Fire damage over time (BBQ_DAD signature)
  | 'LECTURE'       // Psychic damage, reduces attack (COUCH_DAD signature)
  | 'FIX'           // Physical damage, can repair self (FIX_IT_DAD signature)
  | 'NAP'           // Skips turn, heals self (COUCH_DAD signature)
  | 'SWING'         // Basic physical damage (GOLF_DAD, COACH_DAD)
  | 'REMOTE'        // Ranged damage (REMOTE_CONTROL stat)

  // Status Keywords (PACK-011)
  | 'GRILL'         // Apply GRILLED status (-20% defense)
  | 'LECTURE_STATUS' // Apply LECTURED status (-20% attack)
  | 'DRUNK'         // Apply DRUNK status (-30% accuracy)
  | 'WIRED'         // Apply WIRED status (+30% speed)

  // Buff Keywords
  | 'BUFF_STAT'     // Boost specific stat temporarily
  | 'BUFF_ALL'      // Boost all stats temporarily
  | 'SHIELD'        // Reduce incoming damage
  | 'RALLY'         // Boost all ally cards

  // Debuff Keywords
  | 'WEAKEN'        // Reduce specific stat
  | 'WEAKEN_ALL'    // Reduce all stats
  | 'EXPOSE'        // Increase incoming damage

  // Utility Keywords
  | 'DRAW'          // Draw cards from deck
  | 'HEAL'          // Restore HP
  | 'DISCARD'       // Discard cards from hand
  | 'SHUFFLE'       // Shuffle deck or hand

  // Target Keywords
  | 'AOE'           // Area of effect (hits all opponents)
  | 'SINGLE'        // Single target (default)
  | 'SELF'          // Affects self only
  | 'ALLY'          // Affects ally cards
  | 'RANDOM'        // Random target

  // Special Keywords
  | 'TRANSFORM'     // Transform into another card
  | 'EVOLVE'        // Upgrade card stats/rarity
  | 'SACRIFICE'     // Destroy self for effect
  | 'STEAL'         // Take control of card
  | 'COPY'          // Copy ability from another card;

/**
 * Keyword definition with execution parameters
 */
export interface KeywordEffect {
  keyword: AbilityKeyword;
  category: 'damage' | 'status' | 'buff' | 'debuff' | 'utility' | 'target' | 'special';
  value?: number | string;    // Numeric value or parameter (e.g., damage amount)
  target: TargetType;         // Who gets affected
  duration?: number;          // Duration in turns (0 = instant)
  condition?: string;         // Optional condition (e.g., "if HP < 50%")
  stackable?: boolean;        // Can this keyword stack? (default: false)
}

/**
 * Target types for keyword effects
 */
export type TargetType =
  | 'self'           // Affects the card using the ability
  | 'opponent'       // Affects the opposing card
  | 'all_opponents'  // Affects all opponent cards
  | 'ally'           // Affects a random ally card
  | 'all_allies'     // Affects all ally cards
  | 'all'            // Affects everyone
  | 'random'         // Random target
  | 'field';         // Affects the battlefield

/**
 * Keyword execution result
 */
export interface KeywordExecutionResult {
  success: boolean;
  damage: number;
  healing: number;
  statusEffects: StatusEffect[];
  statChanges: Partial<CardStats>;
  flavorText: string;
  criticalHit: boolean;
}

/**
 * Keyword definitions registry
 *
 * This is the master list of all keywords, their categories,
 * default values, and explanations for tooltips.
 */
export const KEYWORD_DEFINITIONS: Record<AbilityKeyword, {
  category: 'damage' | 'status' | 'buff' | 'debuff' | 'utility' | 'target' | 'special';
  defaultValue: number | string;
  description: string;
  detailedExplanation: string;
  example?: string;
  statUsed?: keyof CardStats; // Which stat scales the effect
}> = {
  // === DAMAGE KEYWORDS ===

  BURN: {
    category: 'damage',
    defaultValue: 30,
    description: 'Deal fire damage over 2 turns',
    detailedExplanation: 'Deals fire damage immediately and applies a damage-over-time effect. Fire damage scales with GRILL SKILL.',
    example: 'BURN (50) = 50 damage now + 25 damage next turn',
    statUsed: 'grillSkill',
  },

  LECTURE: {
    category: 'damage',
    defaultValue: 25,
    description: 'Deal psychic damage and reduce attack',
    detailedExplanation: 'Mental attack that damages and reduces opponent\'s offensive stats. Psychic damage scales with DAD JOKE.',
    example: 'LECTURE (40) = 40 damage + -20% attack for 2 turns',
    statUsed: 'dadJoke',
  },

  FIX: {
    category: 'damage',
    defaultValue: 20,
    description: 'Deal physical damage and repair self',
    detailedExplanation: 'Hammer attack that damages opponent and heals self. Physical damage scales with FIX IT stat.',
    example: 'FIX (35) = 35 damage + heal self for 17',
    statUsed: 'fixIt',
  },

  NAP: {
    category: 'utility',
    defaultValue: 30,
    description: 'Skip turn, then heal and boost stats',
    detailedExplanation: 'Fall asleep to recover. Heals HP and boosts all stats. Healing scales with NAP POWER.',
    example: 'NAP (40) = Skip 1 turn, heal 40 HP, +10% all stats',
    statUsed: 'napPower',
  },

  SWING: {
    category: 'damage',
    defaultValue: 25,
    description: 'Basic physical attack',
    detailedExplanation: 'Standard physical attack using clubs, rackets, or sports equipment. Scales with GRILL SKILL.',
    example: 'SWING (45) = 45 physical damage',
    statUsed: 'grillSkill',
  },

  REMOTE: {
    category: 'damage',
    defaultValue: 20,
    description: 'Ranged attack using remote or technology',
    detailedExplanation: 'Attack from a distance using channel surfing or tech skills. Scales with REMOTE CONTROL.',
    example: 'REMOTE (30) = 30 ranged damage',
    statUsed: 'remoteControl',
  },

  // === STATUS KEYWORDS (PACK-011) ===

  GRILL: {
    category: 'status',
    defaultValue: 2,
    description: 'Apply GRILLED status (-20% defense)',
    detailedExplanation: 'Target is covered in BBQ sauce, reducing defense (GRILL SKILL, FIX IT) by 20% for 2 turns. Stacks up to 2x.',
    example: 'GRILL (2) = -20% defense for 2 turns',
  },

  LECTURE_STATUS: {
    category: 'status',
    defaultValue: 2,
    description: 'Apply LECTURED status (-20% attack)',
    detailedExplanation: 'Target receives an unsolicited lecture, reducing all offensive stats by 20% for 2 turns. Stacks up to 2x.',
    example: 'LECTURE_STATUS (2) = -20% attack for 2 turns',
  },

  DRUNK: {
    category: 'status',
    defaultValue: 2,
    description: 'Apply DRUNK status (-30% accuracy)',
    detailedExplanation: 'Target has had too many craft beers, reducing hit chance by 30% for 2 turns. Does not stack.',
    example: 'DRUNK (2) = -30% hit chance for 2 turns',
  },

  WIRED: {
    category: 'status',
    defaultValue: 2,
    description: 'Apply WIRED status (+30% speed)',
    detailedExplanation: 'Target consumed too much coffee/energy drinks, increasing action speed by 30% for 2 turns. Stacks up to 2x.',
    example: 'WIRED (2) = +30% speed for 2 turns',
  },

  // === BUFF KEYWORDS ===

  BUFF_STAT: {
    category: 'buff',
    defaultValue: 20,
    description: 'Boost specific stat by +20%',
    detailedExplanation: 'Temporarily increase one stat by 20%. The buffed stat is usually the card\'s highest stat.',
    example: 'BUFF_STAT (dadJoke, 25) = +25% DAD JOKE for 2 turns',
  },

  BUFF_ALL: {
    category: 'buff',
    defaultValue: 10,
    description: 'Boost all stats by +10%',
    detailedExplanation: 'Temporary boost to all 8 stats. Great for closing out games.',
    example: 'BUFF_ALL (15) = +15% all stats for 2 turns',
  },

  SHIELD: {
    category: 'buff',
    defaultValue: 30,
    description: 'Reduce incoming damage by 30%',
    detailedExplanation: 'Absorbs 30% of damage for 2 turns. Does not stack with itself.',
    example: 'SHIELD (40) = -40% damage taken for 2 turns',
  },

  RALLY: {
    category: 'buff',
    defaultValue: 15,
    description: 'Boost all ally cards by +15%',
    detailedExplanation: 'Inspire all cards in your deck with +15% to all stats for 2 turns.',
    example: 'RALLY (20) = All allies +20% stats for 2 turns',
  },

  // === DEBUFF KEYWORDS ===

  WEAKEN: {
    category: 'debuff',
    defaultValue: 20,
    description: 'Reduce specific stat by -20%',
    detailedExplanation: 'Temporarily reduce one stat by 20%. Usually targets the opponent\'s best stat.',
    example: 'WEAKEN (grillSkill, 25) = -25% GRILL SKILL for 2 turns',
  },

  WEAKEN_ALL: {
    category: 'debuff',
    defaultValue: 10,
    description: 'Reduce all stats by -10%',
    detailedExplanation: 'Temporary reduction to all 8 stats. Devastating against high-stat cards.',
    example: 'WEAKEN_ALL (15) = -15% all stats for 2 turns',
  },

  EXPOSE: {
    category: 'debuff',
    defaultValue: 30,
    description: 'Increase incoming damage by 30%',
    detailedExplanation: 'Target takes 30% more damage from all sources for 2 turns.',
    example: 'EXPOSE (40) = +40% damage taken for 2 turns',
  },

  // === UTILITY KEYWORDS ===

  DRAW: {
    category: 'utility',
    defaultValue: 1,
    description: 'Draw 1 card from deck',
    detailedExplanation: 'Add a card from your deck to your hand. Essential for card advantage.',
    example: 'DRAW (2) = Draw 2 cards',
  },

  HEAL: {
    category: 'utility',
    defaultValue: 30,
    description: 'Restore 30 HP',
    detailedExplanation: 'Heal self or ally for the specified amount. Scales with FIX IT stat.',
    example: 'HEAL (50) = Restore 50 HP',
    statUsed: 'fixIt',
  },

  DISCARD: {
    category: 'utility',
    defaultValue: 1,
    description: 'Discard 1 card from hand',
    detailedExplanation: 'Force opponent to discard cards. Disrupts their strategy.',
    example: 'DISCARD (2) = Opponent discards 2 cards',
  },

  SHUFFLE: {
    category: 'utility',
    defaultValue: 0,
    description: 'Shuffle deck or hand',
    detailedExplanation: 'Randomize the order of cards in deck or hand. Useful for RNG manipulation.',
    example: 'SHUFFLE = Randomize deck order',
  },

  // === TARGET KEYWORDS ===

  AOE: {
    category: 'target',
    defaultValue: 'all_opponents',
    description: 'Area of effect - hits all opponents',
    detailedExplanation: 'This ability affects all opposing cards, not just one. Each card takes full damage/effect.',
    example: 'AOE BURN (30) = All opponents take 30 burn damage',
  },

  SINGLE: {
    category: 'target',
    defaultValue: 'opponent',
    description: 'Single target - one opponent',
    detailedExplanation: 'Default targeting. Affects only the selected opponent.',
    example: 'SINGLE BURN (50) = One opponent takes 50 burn damage',
  },

  SELF: {
    category: 'target',
    defaultValue: 'self',
    description: 'Affects self only',
    detailedExplanation: 'This ability only affects the card using it. Cannot target opponents.',
    example: 'SELF HEAL (40) = Heal self for 40 HP',
  },

  ALLY: {
    category: 'target',
    defaultValue: 'ally',
    description: 'Affects one ally card',
    detailedExplanation: 'Target a random or selected ally card. Cannot affect self.',
    example: 'ALLY BUFF_STAT (20) = One ally +20% stat',
  },

  RANDOM: {
    category: 'target',
    defaultValue: 'random',
    description: 'Random target',
    detailedExplanation: 'Target is chosen randomly from valid targets. Can hit friend or foe depending on ability.',
    example: 'RANDOM BURN (40) = Random target takes 40 damage',
  },

  // === SPECIAL KEYWORDS ===

  TRANSFORM: {
    category: 'special',
    defaultValue: 0,
    description: 'Transform into another card',
    detailedExplanation: 'Replace this card with a different card from your collection. Original card is lost.',
    example: 'TRANSFORM (bbq_dad_002) = Become BBQ Dad #002',
  },

  EVOLVE: {
    category: 'special',
    defaultValue: 0,
    description: 'Upgrade stats and rarity',
    detailedExplanation: 'Permanently increase this card\'s stats by +10 and upgrade rarity tier if possible.',
    example: 'EVOLVE = +10 all stats, rarity+ if possible',
  },

  SACRIFICE: {
    category: 'special',
    defaultValue: 0,
    description: 'Destroy self for powerful effect',
    detailedExplanation: 'This card is destroyed, but you gain a powerful benefit. Card is removed from game.',
    example: 'SACRIFICE = Destroy this card, deal 100 damage',
  },

  STEAL: {
    category: 'special',
    defaultValue: 0,
    description: 'Take control of target card',
    detailedExplanation: 'Permanently take control of opponent\'s card. Card joins your collection.',
    example: 'STEAL = Take control of opponent card',
  },

  COPY: {
    category: 'special',
    defaultValue: 0,
    description: 'Copy ability from another card',
    detailedExplanation: 'This card gains the ability of another card in play. Copy lasts for this battle.',
    example: 'COPY (target) = Gain target\'s ability',
  },
};

/**
 * Get keyword definition for tooltip display
 *
 * Returns the keyword definition with description and example.
 * Used by tooltip system to explain keywords on hover.
 *
 * @param keyword - The keyword to look up
 * @returns Keyword definition object
 *
 * @example
 * const def = getKeywordDefinition('BURN');
 * console.log(def.description); // "Deal fire damage over 2 turns"
 * console.log(def.detailedExplanation); // Full explanation
 * console.log(def.example); // "BURN (50) = 50 damage now + 25 damage next turn"
 */
export function getKeywordDefinition(keyword: AbilityKeyword): {
  category: string;
  description: string;
  detailedExplanation: string;
  example?: string;
  statUsed?: keyof CardStats;
} {
  const def = KEYWORD_DEFINITIONS[keyword];
  if (!def) {
    return {
      category: 'unknown',
      description: 'Unknown keyword',
      detailedExplanation: 'This keyword is not yet defined.',
    };
  }

  return {
    category: def.category,
    description: def.description,
    detailedExplanation: def.detailedExplanation,
    example: def.example,
    statUsed: def.statUsed,
  };
}

/**
 * Parse keywords from ability text (legacy support)
 *
 * Extracts keywords from free-form ability descriptions.
 * This is for backwards compatibility with existing card data.
 *
 * @param description - Free-form ability description
 * @returns Array of detected keywords with inferred values
 *
 * @example
 * const keywords = parseKeywordsFromDescription(
 *   "Sets everything ablaze. +50 burn damage!"
 * );
 * // Returns: [{ keyword: 'BURN', value: 50, target: 'all_opponents' }]
 */
export function parseKeywordsFromDescription(description: string): KeywordEffect[] {
  const keywords: KeywordEffect[] = [];
  const lowerDesc = description.toLowerCase();

  // Helper to check if we've already added a keyword
  const hasKeyword = (keyword: AbilityKeyword) => keywords.some(k => k.keyword === keyword);

  // Damage keyword patterns - only parse if value is explicitly mentioned
  // Pattern: number followed by keyword name (e.g., "+50 burn damage")
  const burnMatch = description.match(/(\d+).*?(?:burn|fire|flame)/i);
  if (burnMatch) {
    keywords.push({
      keyword: 'BURN',
      category: 'damage',
      value: parseInt(burnMatch[1]),
      target: lowerDesc.includes('all') || lowerDesc.includes('every') ? 'all_opponents' : 'opponent',
    });
  }

  const lectureMatch = description.match(/(\d+).*?(?:lecture|talk|mansplain)/i);
  if (lectureMatch) {
    keywords.push({
      keyword: 'LECTURE',
      category: 'damage',
      value: parseInt(lectureMatch[1]),
      target: 'opponent',
    });
  }

  const fixMatch = description.match(/(\d+).*?(?:fix|repair|hammer)/i);
  if (fixMatch) {
    keywords.push({
      keyword: 'FIX',
      category: 'damage',
      value: parseInt(fixMatch[1]),
      target: lowerDesc.includes('self') ? 'self' : 'opponent',
    });
  }

  const napMatch = description.match(/(\d+).*?(?:nap|sleep|rest)/i);
  if (napMatch) {
    keywords.push({
      keyword: 'NAP',
      category: 'utility',
      value: parseInt(napMatch[1]),
      target: 'self',
    });
  }

  const swingMatch = description.match(/(\d+).*?(?:swing|hit|strike)/i);
  if (swingMatch) {
    keywords.push({
      keyword: 'SWING',
      category: 'damage',
      value: parseInt(swingMatch[1]),
      target: 'opponent',
    });
  }

  // Status keyword patterns - only add if not already added from damage parsing
  if (!hasKeyword('GRILL') && (lowerDesc.includes('grill') || lowerDesc.includes('bbq sauce'))) {
    keywords.push({
      keyword: 'GRILL',
      category: 'status',
      value: KEYWORD_DEFINITIONS.GRILL.defaultValue as number,
      target: 'opponent',
      duration: 2,
    });
  }

  if (!hasKeyword('LECTURE_STATUS') && (lowerDesc.includes('lectured') || lowerDesc.includes('bored'))) {
    keywords.push({
      keyword: 'LECTURE_STATUS',
      category: 'status',
      value: KEYWORD_DEFINITIONS.LECTURE_STATUS.defaultValue as number,
      target: 'opponent',
      duration: 2,
    });
  }

  if (!hasKeyword('DRUNK') && (lowerDesc.includes('drunk') || lowerDesc.includes('beer') || lowerDesc.includes('wasted'))) {
    keywords.push({
      keyword: 'DRUNK',
      category: 'status',
      value: KEYWORD_DEFINITIONS.DRUNK.defaultValue as number,
      target: 'opponent',
      duration: 2,
    });
  }

  // Target keywords - only add if not already present
  if (!hasKeyword('AOE') && (lowerDesc.includes('all') || lowerDesc.includes('every') || lowerDesc.includes('aoe'))) {
    keywords.push({
      keyword: 'AOE',
      category: 'target',
      value: 'all_opponents',
      target: 'all_opponents',
    });
  }

  if (!hasKeyword('SELF') && (lowerDesc.includes('self') || lowerDesc.includes('yourself'))) {
    keywords.push({
      keyword: 'SELF',
      category: 'target',
      value: 'self',
      target: 'self',
    });
  }

  return keywords;
}

/**
 * Execute keyword effects in battle
 *
 * Processes an array of keywords and applies their effects.
 * Returns damage, healing, status effects, and other results.
 *
 * @param keywords - Array of keyword effects to execute
 * @param sourceCard - The card using the ability
 * @param targetCard - The target card (if applicable)
 * @returns Execution result with damage, healing, status effects, etc.
 *
 * @example
 * const result = executeKeywords(
 *   [
 *     { keyword: 'BURN', value: 50, target: 'opponent', category: 'damage' },
 *     { keyword: 'GRILL', value: 2, target: 'opponent', category: 'status', duration: 2 }
 *   ],
 *   sourceCard,
 *   targetCard
 * );
 * console.log(result.damage); // 50
 * console.log(result.statusEffects); // [{ type: 'grilled', duration: 2, stacks: 1 }]
 */
export function executeKeywords(
  keywords: KeywordEffect[],
  sourceCard: Card,
  targetCard: Card
): KeywordExecutionResult {
  let totalDamage = 0;
  let totalHealing = 0;
  const statusEffects: StatusEffect[] = [];
  const statChanges: Partial<CardStats> = {};
  const flavorTexts: string[] = [];

  // Check for critical hit (base 10% chance)
  const critChance = 0.1 + (sourceCard.stats.dadJoke / 1000);
  const criticalHit = Math.random() < critChance;

  for (const effect of keywords) {
    // Get the stat used for this keyword (if any)
    const statUsed = KEYWORD_DEFINITIONS[effect.keyword]?.statUsed;
    const statValue = statUsed ? sourceCard.stats[statUsed] : 0;

    // Calculate damage based on stat scaling
    let baseDamage = 0;
    if (typeof effect.value === 'number') {
      baseDamage = effect.value;
      // Scale with stat if applicable
      if (statUsed) {
        baseDamage = Math.floor(baseDamage * (1 + statValue / 200));
      }
    }

    // Apply critical hit
    if (criticalHit) {
      baseDamage = Math.floor(baseDamage * 1.5);
    }

    switch (effect.keyword) {
      // === DAMAGE KEYWORDS ===
      case 'BURN':
      case 'LECTURE':
      case 'FIX':
      case 'SWING':
      case 'REMOTE':
        totalDamage += baseDamage;
        flavorTexts.push(`Deals ${baseDamage} ${effect.keyword.toLowerCase()} damage!`);
        break;

      case 'NAP':
        totalHealing += baseDamage;
        flavorTexts.push(`Heals ${baseDamage} HP from a power nap!`);
        // Buff all stats
        for (const stat in sourceCard.stats) {
          const key = stat as keyof CardStats;
          statChanges[key] = sourceCard.stats[key] * 1.1;
        }
        break;

      // === STATUS KEYWORDS ===
      case 'GRILL':
        statusEffects.push({
          type: 'grilled',
          duration: effect.duration || 2,
          stacks: 1,
        });
        flavorTexts.push('Applies GRILLED status! (-20% defense)');
        break;

      case 'LECTURE_STATUS':
        statusEffects.push({
          type: 'lectured',
          duration: effect.duration || 2,
          stacks: 1,
        });
        flavorTexts.push('Applies LECTURED status! (-20% attack)');
        break;

      case 'DRUNK':
        statusEffects.push({
          type: 'drunk',
          duration: effect.duration || 2,
          stacks: 1,
        });
        flavorTexts.push('Applies DRUNK status! (-30% accuracy)');
        break;

      case 'WIRED':
        statusEffects.push({
          type: 'wired',
          duration: effect.duration || 2,
          stacks: 1,
        });
        flavorTexts.push('Applies WIRED status! (+30% speed)');
        break;

      // === BUFF KEYWORDS ===
      case 'BUFF_STAT':
        // Boost highest stat
        const highestStat = Object.entries(sourceCard.stats)
          .sort(([, a], [, b]) => b - a)[0];
        if (highestStat) {
          const [statKey, statVal] = highestStat;
          const buffAmount = typeof effect.value === 'number'
            ? statVal * (effect.value / 100)
            : statVal * 0.2;
          statChanges[statKey as keyof CardStats] = statVal + buffAmount;
          flavorTexts.push(`Boosts ${statKey} by ${Math.floor(buffAmount)}!`);
        }
        break;

      case 'BUFF_ALL':
        for (const stat in sourceCard.stats) {
          const key = stat as keyof CardStats;
          const buffAmount = typeof effect.value === 'number'
            ? sourceCard.stats[key] * (effect.value / 100)
            : sourceCard.stats[key] * 0.1;
          statChanges[key] = sourceCard.stats[key] + buffAmount;
        }
        flavorTexts.push(`Boosts all stats by ${effect.value}%!`);
        break;

      case 'HEAL':
        totalHealing += baseDamage;
        flavorTexts.push(`Heals ${baseDamage} HP!`);
        break;

      // === DEBUFF KEYWORDS ===
      case 'WEAKEN':
        // Weaken target's highest stat
        const targetHighestStat = Object.entries(targetCard.stats)
          .sort(([, a], [, b]) => b - a)[0];
        if (targetHighestStat) {
          const [statKey, statVal] = targetHighestStat;
          const weakenAmount = typeof effect.value === 'number'
            ? statVal * (effect.value / 100)
            : statVal * 0.2;
          statChanges[statKey as keyof CardStats] = statVal - weakenAmount;
          flavorTexts.push(`Weakens ${statKey} by ${Math.floor(weakenAmount)}!`);
        }
        break;

      // === TARGET KEYWORDS ===
      case 'AOE':
        // Handled by target selection in battle system
        break;

      case 'SINGLE':
      case 'SELF':
      case 'ALLY':
      case 'RANDOM':
        // Handled by target selection in battle system
        break;

      // === SPECIAL KEYWORDS ===
      case 'SACRIFICE':
        totalDamage += 100; // Massive damage
        flavorTexts.push('Sacrifices self for 100 damage!');
        break;

      default:
        // Unknown keyword - skip
        break;
    }
  }

  return {
    success: totalDamage > 0 || totalHealing > 0 || statusEffects.length > 0 || Object.keys(statChanges).length > 0,
    damage: totalDamage,
    healing: totalHealing,
    statusEffects,
    statChanges,
    flavorText: flavorTexts.join(' '),
    criticalHit,
  };
}

/**
 * Validate keyword effects
 *
 * Checks if keyword effects are valid and can be executed.
 * Useful for debugging and preventing invalid abilities.
 *
 * @param keywords - Array of keyword effects to validate
 * @returns Validation result with isValid flag and errors array
 *
 * @example
 * const validation = validateKeywords([
 *   { keyword: 'BURN', value: 50, target: 'opponent', category: 'damage' }
 * ]);
 * console.log(validation.isValid); // true
 * console.log(validation.errors); // []
 */
export function validateKeywords(keywords: KeywordEffect[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const effect of keywords) {
    // Check if keyword exists
    if (!KEYWORD_DEFINITIONS[effect.keyword]) {
      errors.push(`Unknown keyword: ${effect.keyword}`);
      continue;
    }

    // Check if value is valid
    const def = KEYWORD_DEFINITIONS[effect.keyword];
    if (effect.value !== undefined && typeof effect.value !== typeof def.defaultValue) {
      errors.push(
        `Invalid value type for ${effect.keyword}: expected ${typeof def.defaultValue}, got ${typeof effect.value}`
      );
    }

    // Check if target is valid
    const validTargets: TargetType[] = ['self', 'opponent', 'all_opponents', 'ally', 'all_allies', 'all', 'random', 'field'];
    if (effect.target && !validTargets.includes(effect.target)) {
      errors.push(`Invalid target for ${effect.keyword}: ${effect.target}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get all keywords by category
 *
 * Returns all keywords in a specific category.
 * Useful for UI filters and tooltips.
 *
 * @param category - The category to filter by
 * @returns Array of keywords in the category
 *
 * @example
 * const damageKeywords = getKeywordsByCategory('damage');
 * // Returns: ['BURN', 'LECTURE', 'FIX', 'NAP', 'SWING', 'REMOTE']
 */
export function getKeywordsByCategory(
  category: 'damage' | 'status' | 'buff' | 'debuff' | 'utility' | 'target' | 'special'
): AbilityKeyword[] {
  return Object.entries(KEYWORD_DEFINITIONS)
    .filter(([_, def]) => def.category === category)
    .map(([keyword]) => keyword as AbilityKeyword);
}

/**
 * Format keyword for display in UI
 *
 * Returns a human-readable string for a keyword with its value.
 * Used in ability descriptions and tooltips.
 *
 * @param keyword - The keyword to format
 * @param value - Optional value override
 * @returns Formatted string like "BURN (50)" or "GRILL (2 turns)"
 *
 * @example
 * formatKeywordForDisplay('BURN', 50); // "BURN (50)"
 * formatKeywordForDisplay('GRILL', 2); // "GRILL (2 turns)"
 */
export function formatKeywordForDisplay(
  keyword: AbilityKeyword,
  value?: number | string
): string {
  const def = KEYWORD_DEFINITIONS[keyword];
  if (!def) {
    return keyword;
  }

  const displayValue = value ?? def.defaultValue;

  if (keyword === 'GRILL' || keyword === 'LECTURE_STATUS' || keyword === 'DRUNK' || keyword === 'WIRED') {
    return `${keyword} (${displayValue} turns)`;
  }

  return `${keyword} (${displayValue})`;
}
