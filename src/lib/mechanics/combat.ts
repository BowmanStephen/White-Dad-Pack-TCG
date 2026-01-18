import type { Card, CardStats, DadType, Deck } from '../../types';
import type { DeckBattleResult } from '../../types/deck';
import { getTypeAdvantage } from './type-advantages';
import { SeededRandom } from '../utils/seeded-random';

/**
 * DadDeck™ Combat Mechanics
 * Where dad stereotypes battle for suburban dominance
 *
 * ## STAT NORMALIZATION (PACK-007)
 *
 * **Problem:** Without normalization, larger decks (5 cards) would always beat
 * smaller decks (3 cards) because they have higher TOTAL stats, even if their
 * average stats per card are lower.
 *
 * **Solution:** All stats are normalized by card count before battles.
 *
 * **Normalization Formula:**
 * ```
 * normalizedStat = statTotal / totalCards
 * normalizedPower = average(all normalizedStats)
 * ```
 *
 * **Example:**
 * - 3-card deck: Each card has 70 stats → normalized power = 70
 * - 5-card deck: Each card has 50 stats → normalized power = 50
 * - Result: 3-card deck wins despite lower TOTAL stats (210 vs 250)
 *
 * **Benefits:**
 * - ✅ Fair gameplay regardless of deck size
 * - ✅ Quality over quantity (better stats win, not more cards)
 * - ✅ Strategic deck building (optimize per-card stats)
 *
 * **Implementation:**
 * - `DeckStats.averageStats` already contains normalized stats (divided by card count)
 * - `calculateBattleResult()` uses these normalized stats for fair battles
 * - Type advantages and synergies apply AFTER normalization
 */

// Damage types for abilities
export type DamageType = 'burn' | 'psychic' | 'awkward' | 'boring' | 'alcohol' | 'physical';

// Status effects (PACK-011)
export type StatusEffectType =
  | 'grilled'     // BBQ_DAD: defense -20%
  | 'lectured'    // COUCH_DAD: attack -20%
  | 'drunk'       // HOLIDAY_DAD: accuracy -30%
  | 'wired'       // TECH_DAD: speed +30%
  | 'awkward'     // Legacy: awkward status
  | 'bored'       // Legacy: bored status
  | 'inspired';   // Legacy: inspired status

export interface StatusEffect {
  type: StatusEffectType;
  duration: number; // turns remaining
  stacks: number;   // stack count (max 2)
}

/**
 * Calculate stat modifier from status effect (PACK-011)
 *
 * Status effects modify stats by percentage:
 * - grilled: -20% defense (grillSkill, fixIt)
 * - lectured: -20% attack (dadJoke, grillSkill, fixIt, napPower, remoteControl, thermostat, sockSandal, beerSnob)
 * - drunk: -30% accuracy (all stats, reduces hit chance)
 * - wired: +30% speed (increases action frequency or priority)
 *
 * @param effect - The status effect to calculate modifier for
 * @param baseStat - The base stat value before modification
 * @returns Modified stat value
 *
 * @example
 * const modified = calculateStatusEffectModifier(
 *   { type: 'grilled', duration: 2, stacks: 1 },
 *   80 // base defense stat
 * );
 * // Returns 64 (80 - 20%)
 */
export function calculateStatusEffectModifier(
  effect: StatusEffect,
  baseStat: number
): number {
  const stackMultiplier = 1 + (effect.stacks - 1) * 0.5; // 2nd stack is 50% as potent

  switch (effect.type) {
    case 'grilled':
      // -20% defense per stack (to grillSkill and fixIt)
      return baseStat * (1 - 0.2 * stackMultiplier);

    case 'lectured':
      // -20% attack per stack (to all offensive stats)
      return baseStat * (1 - 0.2 * stackMultiplier);

    case 'drunk':
      // -30% accuracy (reduces hit chance, not raw stat)
      return baseStat; // Stat unchanged, applied to hit chance calculation

    case 'wired':
      // +30% speed (action frequency or priority)
      return baseStat * (1 + 0.3 * stackMultiplier);

    // Legacy status effects (preserve existing behavior)
    case 'awkward':
      return baseStat;
    case 'bored':
      return baseStat;
    case 'inspired':
      return baseStat;

    default:
      return baseStat;
  }
}

/**
 * Apply all status effects to card stats (PACK-011)
 *
 * Processes active status effects and returns modified stats.
 * Effects stack additively up to max 2 stacks.
 *
 * @param card - The card to apply effects to
 * @param effects - Array of active status effects
 * @returns Modified card stats with all effects applied
 *
 * @example
 * const effects = [
 *   { type: 'grilled', duration: 2, stacks: 1 },
 *   { type: 'lectured', duration: 1, stacks: 2 }
 * ];
 * const modifiedStats = applyStatusEffectsToCard(card, effects);
 */
export function applyStatusEffectsToCard(
  card: Card,
  effects: StatusEffect[]
): CardStats {
  const modifiedStats = { ...card.stats };

  // Group effects by type for stacking
  const effectMap = new Map<StatusEffectType, StatusEffect[]>();
  for (const effect of effects) {
    if (!effectMap.has(effect.type)) {
      effectMap.set(effect.type, []);
    }
    effectMap.get(effect.type)!.push(effect);
  }

  // Apply stacked effects (max 2 stacks)
  for (const [type, effectsOfType] of effectMap) {
    const stacks = Math.min(2, effectsOfType.length);
    const effect: StatusEffect = { type, duration: 0, stacks };

    // Apply to all stats
    for (const statKey in modifiedStats) {
      const key = statKey as keyof CardStats;
      modifiedStats[key] = calculateStatusEffectModifier(
        effect,
        modifiedStats[key]
      );
    }
  }

  // Clamp values between 0-100
  for (const key in modifiedStats) {
    modifiedStats[key as keyof CardStats] = Math.max(
      0,
      Math.min(100, modifiedStats[key as keyof CardStats])
    );
  }

  return modifiedStats;
}

/**
 * Reduce duration of all status effects by 1 turn (PACK-011)
 *
 * Called at end of each turn. Removes effects when duration reaches 0.
 *
 * @param effects - Array of active status effects
 * @returns Array of effects with reduced duration (expired effects removed)
 *
 * @example
 * const effects = [
 *   { type: 'grilled', duration: 2, stacks: 1 },
 *   { type: 'lectured', duration: 1, stacks: 1 }
 * ];
 * const nextTurn = tickStatusEffects(effects);
 * // grilled: duration 1, lectured: removed
 */
export function tickStatusEffects(effects: StatusEffect[]): StatusEffect[] {
  return effects
    .map(effect => ({
      ...effect,
      duration: effect.duration - 1,
    }))
    .filter(effect => effect.duration > 0);
}

/**
 * Add status effect to card (PACK-011)
 *
 * Handles stacking logic (max 2 stacks). Refreshes duration if already present.
 *
 * @param currentEffects - Array of current active effects
 * @param newEffect - New effect to add
 * @returns Updated array of effects
 *
 * @example
 * const effects = [{ type: 'grilled', duration: 2, stacks: 1 }];
 * const updated = addStatusEffect(effects, { type: 'grilled', duration: 2, stacks: 1 });
 * // Returns: [{ type: 'grilled', duration: 2, stacks: 2 }]
 */
export function addStatusEffect(
  currentEffects: StatusEffect[],
  newEffect: StatusEffect
): StatusEffect[] {
  const existing = currentEffects.find(e => e.type === newEffect.type);

  if (existing) {
    // Stack or refresh
    if (existing.stacks < 2) {
      existing.stacks++;
    }
    existing.duration = newEffect.duration; // Refresh duration
    return [...currentEffects];
  }

  // Add new effect
  return [...currentEffects, newEffect];
}

// Combat state
export interface CombatState {
  attacker: Card;
  defender: Card;
  attackerStats: CardStats;
  defenderStats: CardStats;
  statusEffects: StatusEffect[];
  turn: number;
}

// Ability execution result
export interface AbilityResult {
  success: boolean;
  damage: number;
  statusEffects: StatusEffect[];
  flavorText: string;
  criticalHit: boolean;
}

/**
 * Calculate base power from stats
 *
 * Power is calculated as:
 * - Average of all card stats
 * - Multiplied by rarity multiplier (common = 1.0x, mythic = 3.0x)
 *
 * @param card - The card to calculate power for
 * @returns Base power value (used for HP calculations in battles)
 *
 * @example
 * const card = { stats: { dadJoke: 50, grillSkill: 70, ... }, rarity: 'rare' };
 * const power = calculateCardPower(card); // ~60 * 1.5 = 90
 */
export function calculateCardPower(card: Card): number {
  const stats = Object.values(card.stats);
  const average = stats.reduce((a, b) => a + b, 0) / stats.length;

  // Rarity multiplier
  const rarityMultipliers: Record<string, number> = {
    common: 1.0,
    uncommon: 1.2,
    rare: 1.5,
    epic: 1.8,
    legendary: 2.2,
    mythic: 3.0,
  };
  const rarityMultiplier = rarityMultipliers[card.rarity] ?? 1.0;

  return Math.floor(average * rarityMultiplier);
}

/**
 * Calculate damage based on attacker vs defender stats
 *
 * Damage calculation:
 * - Base: attackPower - (defensePower * 0.5), minimum 5
 * - RNG modifier: ±20% random factor
 * - Critical hit: 2x damage (10% base chance + 1% per 10 attack stat)
 *
 * @param attacker - The attacking card
 * @param defender - The defending card
 * @param attackStat - Which stat to use for attack
 * @param defenseStat - Which stat to use for defense
 * @returns Calculated damage value (minimum 1)
 *
 * @example
 * const damage = calculateDamage(
 *   bbqDadCard,
 *   coachDadCard,
 *   'grillSkill',
 *   'dadJoke'
 * );
 */
export function calculateDamage(
  attacker: Card,
  defender: Card,
  attackStat: keyof CardStats,
  defenseStat: keyof CardStats
): number {
  const attackPower = attacker.stats[attackStat];
  const defensePower = defender.stats[defenseStat];

  // Base damage calculation
  let damage = Math.max(5, attackPower - defensePower * 0.5);

  // RNG factor (±20%)
  const rng = 0.8 + Math.random() * 0.4;
  damage = Math.floor(damage * rng);

  // Critical hit chance (10% base, +1% per 10 stat points)
  const critChance = 0.1 + (attackPower / 1000);
  const isCritical = Math.random() < critChance;

  if (isCritical) {
    damage = Math.floor(damage * 2);
  }

  return Math.max(1, damage);
}

/**
 * Execute a card's ability
 *
 * Ability execution process:
 * 1. Validates ability exists
 * 2. Determines appropriate stat based on ability name keyword
 * 3. Calculates damage using attacker vs defender stats
 * 4. Applies status effects based on card type (30% chance)
 * 5. Generates random flavor text for the action
 *
 * @param card - The card using the ability
 * @param target - The target card
 * @param abilityIndex - Index of ability in card.abilities array (default: 0)
 * @returns Ability result with success status, damage, status effects, flavor text, and critical hit flag
 *
 * @example
 * const result = executeAbility(bbqDadCard, coachDadCard);
 * console.log(result.damage, result.flavorText, result.statusEffects);
 */
export function executeAbility(
  card: Card,
  target: Card,
  abilityIndex: number = 0
): AbilityResult {
  const ability = card.abilities[abilityIndex];
  if (!ability) {
    return {
      success: false,
      damage: 0,
      statusEffects: [],
      flavorText: `${card.name} forgot what he was doing.`,
      criticalHit: false,
    };
  }

  // Determine which stat to use based on ability type
  const statMapping: Record<string, keyof CardStats> = {
    'Grill': 'grillSkill',
    'Fix': 'fixIt',
    'Nap': 'napPower',
    'Remote': 'remoteControl',
    'Thermostat': 'thermostat',
    'Sock': 'sockSandal',
    'Beer': 'beerSnob',
    'Joke': 'dadJoke',
  };

  // Find matching stat
  let attackStat: keyof CardStats = 'dadJoke'; // default
  for (const [keyword, stat] of Object.entries(statMapping)) {
    if (ability.name.includes(keyword)) {
      attackStat = stat;
      break;
    }
  }

  // Calculate damage
  const defenseStat = attackStat; // same stat defends for now
  const damage = calculateDamage(card, target, attackStat, defenseStat);
  const criticalHit = damage > calculateDamage(card, target, attackStat, defenseStat) * 0.5;

  // Generate status effects (PACK-011)
  const statusEffects: StatusEffect[] = [];

  if (card.type === 'BBQ_DAD' && Math.random() < 0.3) {
    statusEffects.push({
      type: 'grilled',
      duration: 2,
      stacks: 1,
    });
  }

  if (card.type === 'COUCH_DAD' && Math.random() < 0.3) {
    statusEffects.push({
      type: 'lectured',
      duration: 2,
      stacks: 1,
    });
  }

  if (card.type === 'HOLIDAY_DAD' && Math.random() < 0.3) {
    statusEffects.push({
      type: 'drunk',
      duration: 2,
      stacks: 1,
    });
  }

  if (card.type === 'TECH_DAD' && Math.random() < 0.3) {
    statusEffects.push({
      type: 'wired',
      duration: 2,
      stacks: 1,
    });
  }

  // Legacy status effects (preserve for backwards compatibility)
  if (card.type === 'COACH_DAD' && Math.random() < 0.3) {
    statusEffects.push({
      type: 'inspired',
      duration: 3,
      stacks: 1,
    });
  }

  if (card.type === 'COUCH_DAD' && Math.random() < 0.3 && !statusEffects.find(e => e.type === 'lectured')) {
    statusEffects.push({
      type: 'bored',
      duration: 2,
      stacks: 1,
    });
  }

  // Generate flavor text
  const flavorTexts = [
    `${card.name} uses ${ability.name}! ${ability.description}`,
    `${card.name}: "${ability.description}"`,
    `${card.name} hits ${target.name} with ${ability.name}!`,
    `${ability.name} activates! ${target.subtitle} looks confused.`,
  ];

  const flavorText = flavorTexts[Math.floor(Math.random() * flavorTexts.length)];

  return {
    success: true,
    damage,
    statusEffects,
    flavorText,
    criticalHit,
  };
}

/**
 * Check for type advantages (imported from type-advantages.ts)
 *
 * This function is now a re-export for backwards compatibility.
 * The actual implementation is in src/lib/mechanics/type-advantages.ts
 *
 * Type advantages work like Pokémon:
 * - Advantage: 1.2x damage (+20% bonus)
 * - Disadvantage: 0.8x damage (-20% penalty)
 * - Neutral: 1.0x damage
 *
 * @param attacker - Attacking dad type
 * @param defender - Defending dad type
 * @returns Damage multiplier (1.2 for advantage, 0.8 for disadvantage, 1.0 for neutral)
 *
 * @example
 * getTypeAdvantage('BBQ_DAD', 'GOLF_DAD') // Returns 1.2 (advantage)
 * getTypeAdvantage('GOLF_DAD', 'BBQ_DAD') // Returns 1.0 (neutral)
 * getTypeAdvantage('FIX_IT_DAD', 'TECH_DAD') // Returns 1.2 (advantage)
 */
export { getTypeAdvantage };

/**
 * Apply status effects to a card (LEGACY - use applyStatusEffectsToCard)
 *
 * @deprecated Use applyStatusEffectsToCard instead for PACK-011 status effects
 * This function is kept for backwards compatibility with existing code.
 *
 * Status effects modify card stats temporarily:
 * - grilled: -10% grillSkill, -5% fixIt
 * - lectured: -15% dadJoke, +10% thermostat
 * - awkward: -20% dadJoke, +10% sockSandal
 * - drunk: +30% beerSnob, -40% fixIt, -20% grillSkill
 * - bored: +20% napPower, +15% remoteControl
 * - inspired: +15% dadJoke, +10% grillSkill
 *
 * All stat changes are clamped to 0-100 range.
 *
 * @param card - The card to apply effects to
 * @param effects - Array of status effects to apply
 * @returns Modified card stats with all effects applied
 *
 * @example
 * const effects = [{ type: 'grilled', duration: 2, strength: 50 }];
 * const modifiedStats = applyStatusEffects(card, effects);
 * // card.stats.grillSkill reduced by 5 (50 * 0.1)
 */
export function applyStatusEffects(
  card: Card,
  effects: StatusEffect[]
): CardStats {
  // Convert legacy status effects to new PACK-011 format
  const pack011Effects: StatusEffect[] = effects.map(e => ({
    type: e.type,
    duration: e.duration,
    stacks: 1, // Legacy effects don't stack
  }));

  return applyStatusEffectsToCard(card, pack011Effects);
}

/**
 * Check for card synergies (combo system)
 *
 * Synergies provide damage multipliers when specific card combinations exist:
 * - Mythic Alliance: Two mythic cards = 2.0x damage
 * - Type Synergies: Specific type combinations = 1.3x damage
 * - No Synergy: 1.0x damage (default)
 *
 * @param card1 - First card in the pair
 * @param card2 - Second card in the pair
 * @returns Synergy result with hasSynergy flag, bonus multiplier, name, and description
 *
 * @example
 * const synergy = checkSynergy(mythicCard1, mythicCard2);
 * console.log(synergy.hasSynergy); // true
 * console.log(synergy.synergyBonus); // 2.0
 * console.log(synergy.synergyName); // "Mythic Alliance"
 */
export function checkSynergy(card1: Card, card2: Card): {
  hasSynergy: boolean;
  synergyBonus: number;
  synergyName: string;
  description: string;
} {
  // Type synergies
  const typeSynergies: Record<string, [DadType[], DadType[], string, string]> = {
    'BBQ Alliance': [
      ['BBQ_DAD', 'CHEF_DAD'],
      ['BBQ_DAD', 'CHEF_DAD'],
      'Ultimate Cookout',
      '+30% Grill Skill, both cards'
    ],
    'Suburban Dream Team': [
      ['LAWN_DAD', 'CAR_DAD', 'WAREHOUSE_DAD'],
      ['LAWN_DAD', 'CAR_DAD', 'WAREHOUSE_DAD'],
      'HOA Nightmares',
      '+20% all stats for all lawn/car/warehouse dads'
    ],
    'Couch Potato Crew': [
      ['COUCH_DAD', 'ITEM'],
      ['COUCH_DAD'],
      'Infinite Nap',
      'Target never wakes up'
    ],
  };

  // Check rarity synergies
  if (card1.rarity === card2.rarity && card1.rarity === 'mythic') {
    return {
      hasSynergy: true,
      synergyBonus: 2.0,
      synergyName: 'Mythic Alliance',
      description: 'Double damage from both mythic cards',
    };
  }

  // Check type synergies
  for (const [types1, types2, synergyName, description] of Object.values(typeSynergies)) {
    if (
      types1.includes(card1.type) &&
      types2.includes(card2.type)
    ) {
      return {
        hasSynergy: true,
        synergyBonus: 1.3,
        synergyName,
        description,
      };
    }
  }

  // Default: no synergy
  return {
    hasSynergy: false,
    synergyBonus: 1.0,
    synergyName: '',
    description: '',
  };
}

/**
 * Simulate a full battle between two cards
 *
 * Battle simulation mechanics:
 * - HP = calculateCardPower(card) * 10
 * - Each turn, both cards attack simultaneously
 * - Type advantages apply (1.5x or 0.75x damage)
 * - Synergies detected and applied
 * - Status effects can trigger (30% chance based on card type)
 * - Max 10 turns, winner determined by HP if time expires
 *
 * @param attacker - The attacking card
 * @param defender - The defending card
 * @returns Battle result with winner, loser, turn count, and detailed battle log
 *
 * @example
 * const result = simulateBattle(bbqDad, coachDad);
 * console.log(`Winner: ${result.winner.name} in ${result.turns} turns`);
 * console.log(result.log.join('\n')); // Full battle log
 */
export function simulateBattle(attacker: Card, defender: Card): {
  winner: Card;
  loser: Card;
  turns: number;
  log: string[];
} {
  const log: string[] = [];
  let attackerHP = calculateCardPower(attacker) * 10;
  let defenderHP = calculateCardPower(defender) * 10;
  let turns = 0;
  const maxTurns = 10;

  log.push(`⚔️ BATTLE: ${attacker.name} vs ${defender.name}!`);
  log.push(`${attacker.name} power: ${attackerHP}`);
  log.push(`${defender.name} power: ${defenderHP}`);

  // Check type advantage
  const typeAdv = getTypeAdvantage(attacker.type, defender.type);
  if (typeAdv > 1.0) {
    log.push(`${attacker.type} has advantage over ${defender.type}! (+50% damage)`);
  } else if (typeAdv < 1.0) {
    log.push(`${attacker.type} at disadvantage against ${defender.type}! (-25% damage)`);
  }

  while (attackerHP > 0 && defenderHP > 0 && turns < maxTurns) {
    turns++;

    // Attacker attacks
    const result = executeAbility(attacker, defender);
    let damage = Math.floor(result.damage * typeAdv);

    // Apply synergy bonus
    const synergy = checkSynergy(attacker, defender);
    if (synergy.hasSynergy) {
      damage = Math.floor(damage * synergy.synergyBonus);
      log.push(`💥 SYNERGY: ${synergy.synergyName}! ${synergy.description}`);
    }

    defenderHP -= damage;
    log.push(`Turn ${turns}: ${attacker.name} uses ${result.flavorText}`);
    log.push(`  → ${damage} damage! ${criticalHit(result) ? '💥 CRITICAL!' : ''}`);

    if (result.statusEffects.length > 0) {
      log.push(`  → Status effects: ${result.statusEffects.map(e => e.type).join(', ')}`);
    }

    if (defenderHP <= 0) {
      log.push(`\n🏆 ${attacker.name} WINS in ${turns} turns!`);
      return {
        winner: attacker,
        loser: defender,
        turns,
        log,
      };
    }

    // Defender attacks back
    const defendResult = executeAbility(defender, attacker);
    const defendTypeAdv = getTypeAdvantage(defender.type, attacker.type);
    let defendDamage = Math.floor(defendResult.damage * defendTypeAdv);

    attackerHP -= defendDamage;
    log.push(`  Counter: ${defender.name} hits back for ${defendDamage} damage!`);

    if (attackerHP <= 0) {
      log.push(`\n🏆 ${defender.name} WINS in ${turns} turns!`);
      return {
        winner: defender,
        loser: attacker,
        turns,
        log,
      };
    }

    log.push(`  HP: ${attackerHP} vs ${defenderHP}\n`);
  }

  // If battle exceeds max turns, higher HP wins
  const winner = attackerHP > defenderHP ? attacker : defender;
  const loser = attackerHP > defenderHP ? defender : attacker;

  log.push(`\n⏰ Time's up! ${winner.name} wins by HP!`);

  return {
    winner,
    loser,
    turns,
    log,
  };
}

function criticalHit(result: AbilityResult): boolean {
  return result.criticalHit;
}

/**
 * Compare two cards and predict winner
 *
 * Prediction logic:
 * 1. Check for synergies (85% confidence if synergy exists)
 * 2. Check for significant power difference (75% confidence if >20% difference)
 * 3. Default to effective power comparison (55% confidence - close match)
 *
 * @param card1 - First card to compare
 * @param card2 - Second card to compare
 * @returns Prediction result with winner, confidence level (0-100), and reasoning
 *
 * @example
 * const prediction = predictWinner(card1, card2);
 * console.log(`Predicted winner: ${prediction.winner.name}`);
 * console.log(`Confidence: ${prediction.confidence}%`);
 * console.log(`Reason: ${prediction.reason}`);
 */
export function predictWinner(card1: Card, card2: Card): {
  winner: Card;
  confidence: number;
  reason: string;
} {
  const power1 = calculateCardPower(card1);
  const power2 = calculateCardPower(card2);

  const typeAdv1 = getTypeAdvantage(card1.type, card2.type);
  const typeAdv2 = getTypeAdvantage(card2.type, card1.type);

  const effectivePower1 = power1 * typeAdv1;
  const effectivePower2 = power2 * typeAdv2;

  const synergy12 = checkSynergy(card1, card2);
  const synergy21 = checkSynergy(card2, card1);

  if (synergy12.hasSynergy) {
    return {
      winner: card1,
      confidence: 85,
      reason: `Has synergy: ${synergy12.synergyName}`,
    };
  }

  if (synergy21.hasSynergy) {
    return {
      winner: card2,
      confidence: 85,
      reason: `Has synergy: ${synergy21.synergyName}`,
    };
  }

  if (effectivePower1 > effectivePower2 * 1.2) {
    return {
      winner: card1,
      confidence: 75,
      reason: `Significantly higher power (${power1} vs ${power2})`,
    };
  }

  if (effectivePower2 > effectivePower1 * 1.2) {
    return {
      winner: card2,
      confidence: 75,
      reason: `Significantly higher power (${power2} vs ${power1})`,
    };
  }

  // Close match
  const winner = effectivePower1 > effectivePower2 ? card1 : card2;
  return {
    winner,
    confidence: 55,
    reason: `Close match! Could go either way.`,
  };
}

/**
 * Calculate battle result between two decks with stat normalization
 *
 * **STAT NORMALIZATION:**
 * To ensure fair gameplay regardless of deck size, all stats are normalized by card count.
 * This prevents larger decks (e.g., 5 cards) from always beating smaller decks (e.g., 3 cards).
 *
 * Normalization formula:
 * - normalizedStat = statTotal / totalCards
 * - A 3-card deck with total stats of 300 will have the same normalized power as a 5-card deck with total stats of 500
 *
 * Battle calculation:
 * 1. Extract normalized stats from each deck's stats.averageStats (already divided by card count)
 * 2. Calculate effective power for each deck using normalized stats
 * 3. Apply type advantages based on most common card type in each deck
 * 4. Apply synergy bonuses if synergies exist between cards
 * 5. Apply RNG variance: ±10% random variance (PACK-010)
 * 6. Check for critical hit: 5% chance for 1.5x damage (PACK-010)
 * 7. Check for glancing blow: 10% chance for 0.5x damage (PACK-010)
 * 8. Determine winner based on effective power comparison
 *
 * **RNG SYSTEM (PACK-010):**
 * - Seeded RNG for replayability: Same seed = same result
 * - ±10% random variance on final damage
 * - Critical hit: 5% chance for 1.5x damage
 * - Glancing blow: 10% chance for 0.5x damage
 * - Critical and glancing blows are mutually exclusive
 *
 * @param attackerDeck - The attacking deck
 * @param defenderDeck - The defending deck
 * @param seed - Optional seed for reproducible RNG (default: random)
 * @returns Battle result with winner, loser, damage, stats comparison, and battle details
 *
 * @example
 * // Random battle
 * const result = calculateBattleResult(threeCardDeck, fiveCardDeck);
 * console.log(`Winner: ${result.winner.name}`);
 * console.log(`Damage: ${result.damage}`);
 *
 * @example
 * // Seeded battle (reproducible)
 * const result = calculateBattleResult(deck1, deck2, 12345);
 * // Using seed 12345 will always produce the same result
 */
export function calculateBattleResult(
  attackerDeck: Deck,
  defenderDeck: Deck,
  seed?: number
): DeckBattleResult {
  // Initialize seeded RNG if seed provided, otherwise use Math.random()
  const rng = seed !== undefined ? new SeededRandom(seed) : null;

  // Extract normalized stats (already divided by card count)
  const attackerStats = attackerDeck.stats.averageStats;
  const defenderStats = defenderDeck.stats.averageStats;

  // Calculate total normalized power for each deck
  const attackerPower = calculateNormalizedPower(attackerStats);
  const defenderPower = calculateNormalizedPower(defenderStats);

  // Determine most common types for type advantage calculation
  const attackerMainType = getMainType(attackerDeck);
  const defenderMainType = getMainType(defenderDeck);

  // Apply type advantage
  const typeAdvantage = getTypeAdvantage(attackerMainType, defenderMainType);
  const effectiveAttackerPower = attackerPower * typeAdvantage;

  // Check for themed deck synergy bonuses (PACK-009)
  const attackerSynergy = calculateSynergyBonus(attackerDeck);
  const defenderSynergy = calculateSynergyBonus(defenderDeck);

  // Apply attacker's themed synergy bonus
  const finalAttackerPower = effectiveAttackerPower * attackerSynergy.multiplier;

  // Calculate base damage (difference in power, minimum 5)
  let rawDamage = Math.max(5, finalAttackerPower - defenderPower);

  // PACK-010: RNG Variance System
  let damageMultiplier = 1.0;
  let hitType: 'normal' | 'critical' | 'glancing' = 'normal';

  // Helper function for random numbers (seeded or not)
  const random = (): number => rng ? rng.next() : Math.random();

  // Check for critical hit (5% chance) or glancing blow (10% chance)
  // Roll for glancing blow first (10%)
  const glancingRoll = random();
  if (glancingRoll < 0.10) {
    // Glancing blow! (10% chance)
    damageMultiplier = 0.5;
    hitType = 'glancing';
  } else {
    // No glancing blow, check for critical hit (5% chance)
    const criticalRoll = random();
    if (criticalRoll < 0.05) {
      // Critical hit! (5% chance)
      damageMultiplier = 1.5;
      hitType = 'critical';
    }
  }

  // Apply ±10% random variance to damage
  const varianceRoll = random();
  const variance = 0.9 + (varianceRoll * 0.2); // 0.9 to 1.1

  // Calculate final damage with all modifiers
  let damage = Math.floor(rawDamage * damageMultiplier * variance);
  damage = Math.max(1, damage); // Minimum 1 damage

  // Determine winner
  const attackerWins = finalAttackerPower > defenderPower;
  const winner = attackerWins ? attackerDeck : defenderDeck;
  const loser = attackerWins ? defenderDeck : attackerDeck;

  // Build battle log with RNG information
  const log: string[] = [
    `⚔️ BATTLE: ${attackerDeck.name} (${attackerDeck.stats.totalCards} cards) vs ${defenderDeck.name} (${defenderDeck.stats.totalCards} cards)`,
    `Attacker normalized power: ${attackerPower.toFixed(1)}`,
    `Defender normalized power: ${defenderPower.toFixed(1)}`,
    typeAdvantage > 1.0
      ? `${attackerMainType} has advantage over ${defenderMainType}! (+${Math.round((typeAdvantage - 1) * 100)}% damage)`
      : typeAdvantage < 1.0
      ? `${attackerMainType} at disadvantage against ${defenderMainType}! (${Math.round(typeAdvantage * 100)}% damage)`
      : 'No type advantage',
    attackerSynergy.multiplier > 1.0 ? attackerSynergy.description : '',
    `Final attacker power: ${finalAttackerPower.toFixed(1)}`,
    '',
    `🎲 RNG System:`,
    hitType === 'critical'
      ? `  💥 CRITICAL HIT! (1.5x damage)`
      : hitType === 'glancing'
      ? `  💨 Glancing blow... (0.5x damage)`
      : '  Normal hit',
    `  Variance: ${variance < 1.0 ? '-' : '+'}${Math.abs((variance - 1.0) * 100).toFixed(1)}%`,
    `  Base damage: ${Math.floor(rawDamage)}`,
    `  Final damage: ${damage}`,
    '',
    `🏆 Winner: ${winner.name}`,
  ].filter(Boolean);

  return {
    winner,
    loser,
    damage,
    attackerStats: {
      totalPower: attackerPower,
      effectivePower: effectiveAttackerPower,
      finalPower: finalAttackerPower,
      normalizedStats: attackerStats,
      mainType: attackerMainType,
    },
    defenderStats: {
      totalPower: defenderPower,
      effectivePower: defenderPower, // No type advantage applied to defender in this calculation
      finalPower: defenderPower,
      normalizedStats: defenderStats,
      mainType: defenderMainType,
    },
    typeAdvantage,
    synergyBonus: attackerSynergy.multiplier, // PACK-009: Themed synergy bonus
    turns: 1, // Deck battles are single-turn calculations
    log,
  };
}

/**
 * Calculate normalized power from card stats
 *
 * Normalized power is the average of all stats, ensuring that decks of different
 * sizes can compete fairly. Stats should already be normalized (divided by card count)
 * before passing to this function.
 *
 * @param stats - Normalized card stats (average stats per card)
 * @returns Normalized power value (average of all stats)
 *
 * @example
 * const normalizedStats = { dadJoke: 50, grillSkill: 70, fixIt: 60, ... };
 * const power = calculateNormalizedPower(normalizedStats); // ~60
 */
function calculateNormalizedPower(stats: CardStats): number {
  const statValues = Object.values(stats);
  return statValues.reduce((sum, stat) => sum + stat, 0) / statValues.length;
}

/**
 * Get the most common card type in a deck
 *
 * Used for determining type advantages in deck battles.
 * Returns the type with the highest count in the deck.
 *
 * @param deck - The deck to analyze
 * @returns The most common dad type in the deck
 *
 * @example
 * const mainType = getMainType(deck); // 'BBQ_DAD'
 */
function getMainType(deck: Deck): DadType {
  const typeBreakdown = deck.stats.typeBreakdown;
  let maxCount = 0;
  let mainType: DadType = 'BBQ_DAD'; // default

  for (const [type, count] of Object.entries(typeBreakdown)) {
    if (count > maxCount) {
      maxCount = count;
      mainType = type as DadType;
    }
  }

  return mainType;
}

/**
 * Calculate synergy bonus between two decks
 *
 * Checks all card pairs between decks for synergies and returns
 * the highest synergy bonus found.
 *
 * @param deck1 - First deck
 * @param deck2 - Second deck
 * @returns Synergy bonus multiplier (1.0 = no synergy, up to 2.0 for mythic alliances)
 *
 * @example
 * const bonus = calculateDeckSynergyBonus(deck1, deck2);
 * // Returns 1.3 if BBQ_DAD + CHEF_DAD synergy found
 */
function calculateDeckSynergyBonus(deck1: Deck, deck2: Deck): number {
  let maxBonus = 1.0;

  // Check all card pairs between decks
  for (const dc1 of deck1.cards) {
    for (const dc2 of deck2.cards) {
      const synergy = checkSynergy(dc1.card, dc2.card);
      if (synergy.hasSynergy && synergy.synergyBonus > maxBonus) {
        maxBonus = synergy.synergyBonus;
      }
    }
  }

  return maxBonus;
}

/**
 * Calculate themed deck synergy bonus (PACK-009)
 *
 * Detects if a deck is themed (all same dad type) and applies bonuses:
 * - 5+ cards of same type: 15% synergy bonus (1.15x multiplier)
 * - 3+ cards of same type: 5% synergy bonus (1.05x multiplier)
 * - Mixed types: no bonus (1.0x multiplier)
 *
 * This rewards specialization and themed deck building over balanced decks.
 *
 * @param deck - The deck to check for themed synergy
 * @returns Synergy result with bonus multiplier, theme name, and description
 *
 * @example
 * // All BBQ_DAD deck (5 cards)
 * const bonus = calculateSynergyBonus(bbqDeck);
 * console.log(bonus.multiplier); // 1.15
 * console.log(bonus.theme); // 'BBQ_BROS'
 * console.log(bonus.description); // 'BBQ_BROS SYNERGY +15%'
 *
 * @example
 * // Mixed deck (no theme)
 * const bonus = calculateSynergyBonus(mixedDeck);
 * console.log(bonus.multiplier); // 1.0
 * console.log(bonus.theme); // ''
 */
export function calculateSynergyBonus(deck: Deck): {
  multiplier: number;
  theme: string;
  description: string;
} {
  // Count cards by type
  const typeCounts: Record<string, number> = {};

  // Initialize with known types
  const knownTypes: DadType[] = [
    'BBQ_DAD', 'FIX_IT_DAD', 'GOLF_DAD', 'COUCH_DAD', 'LAWN_DAD',
    'CAR_DAD', 'OFFICE_DAD', 'COOL_DAD', 'COACH_DAD', 'CHEF_DAD',
    'HOLIDAY_DAD', 'WAREHOUSE_DAD', 'VINTAGE_DAD', 'FASHION_DAD',
    'TECH_DAD', 'ITEM'
  ];

  for (const type of knownTypes) {
    typeCounts[type] = 0;
  }

  // Count each card's type
  for (const deckCard of deck.cards) {
    const cardType = deckCard.card.type;
    typeCounts[cardType] = (typeCounts[cardType] || 0) + 1;
  }

  // Find the dominant type
  let maxCount = 0;
  let dominantType: string | null = null;

  for (const [type, count] of Object.entries(typeCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantType = type;
    }
  }

  // No cards or empty deck
  if (!dominantType || maxCount === 0) {
    return {
      multiplier: 1.0,
      theme: '',
      description: '',
    };
  }

  // Check if deck is themed (all same type or majority same type)
  // 5+ cards of same type = 15% bonus
  if (maxCount >= 5) {
    const themeName = dominantType
      .replace('_DAD', '')
      .replace('_DICKTATOR', '')
      .replace('_', ' ')
      .replace(' ', '_') + '_BROS';
    return {
      multiplier: 1.15,
      theme: themeName,
      description: `${themeName.replace(/_/g, ' ')} SYNERGY +15%`,
    };
  }

  // 3+ cards of same type = 5% bonus
  if (maxCount >= 3) {
    const themeName = dominantType
      .replace('_DAD', '')
      .replace('_DICKTATOR', '')
      .replace('_', ' ')
      .replace(' ', '_') + '_BROS';
    return {
      multiplier: 1.05,
      theme: themeName,
      description: `${themeName.replace(/_/g, ' ')} SYNERGY +5%`,
    };
  }

  // Mixed types: no bonus
  return {
    multiplier: 1.0,
    theme: '',
    description: '',
  };
}
