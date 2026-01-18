import type { Card, CardStats, DadType } from '../../types';

/**
 * DadDeck™ Combat Mechanics
 * Where dad stereotypes battle for suburban dominance
 */

// Damage types for abilities
export type DamageType = 'burn' | 'psychic' | 'awkward' | 'boring' | 'alcohol' | 'physical';

// Status effects
export interface StatusEffect {
  type: 'grilled' | 'lectured' | 'awkward' | 'drunk' | 'bored' | 'inspired';
  duration: number; // turns
  strength: number; // effect strength 1-100
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
  const rarityMultiplier = {
    common: 1.0,
    uncommon: 1.2,
    rare: 1.5,
    epic: 1.8,
    legendary: 2.2,
    mythic: 3.0,
  }[card.rarity];

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

  // Generate status effects
  const statusEffects: StatusEffect[] = [];

  if (card.type === 'BBQ_DAD' && Math.random() < 0.3) {
    statusEffects.push({
      type: 'grilled',
      duration: 2,
      strength: card.stats.grillSkill,
    });
  }

  if (card.type === 'COACH_DAD' && Math.random() < 0.3) {
    statusEffects.push({
      type: 'inspired',
      duration: 3,
      strength: card.stats.dadJoke,
    });
  }

  if (card.type === 'COUCH_DAD' && Math.random() < 0.3) {
    statusEffects.push({
      type: 'bored',
      duration: 2,
      strength: 100 - card.stats.napPower,
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
 * Check for type advantages
 *
 * Certain dad types have advantages over others, similar to Pokémon types:
 * - Advantage: 1.5x damage (e.g., BBQ_DAD vs COUCH_DAD)
 * - Disadvantage: 0.75x damage (e.g., COUCH_DAD vs BBQ_DAD)
 * - Neutral: 1.0x damage
 *
 * @param attacker - Attacking dad type
 * @param defender - Defending dad type
 * @returns Damage multiplier (1.5 for advantage, 0.75 for disadvantage, 1.0 for neutral)
 *
 * @example
 * getTypeAdvantage('BBQ_DAD', 'COUCH_DAD') // Returns 1.5 (advantage)
 * getTypeAdvantage('COUCH_DAD', 'BBQ_DAD') // Returns 0.75 (disadvantage)
 * getTypeAdvantage('BBQ_DAD', 'FIX_IT_DAD') // Returns 1.0 (neutral)
 */
export function getTypeAdvantage(attacker: DadType, defender: DadType): number {
  const advantages: Record<DadType, DadType[]> = {
    BBQ_DAD: ['COUCH_DAD', 'CHEF_DAD'],
    FIX_IT_DAD: ['CAR_DAD', 'WAREHOUSE_DAD'],
    GOLF_DAD: ['COOL_DAD', 'COACH_DAD'],
    COUCH_DAD: ['OFFICE_DAD', 'COACH_DAD'],
    LAWN_DAD: ['FASHION_DAD', 'COUCH_DAD'],
    CAR_DAD: ['FIX_IT_DAD', 'VINTAGE_DAD'],
    OFFICE_DAD: ['COUCH_DAD', 'TECH_DAD'],
    COOL_DAD: ['GOLF_DAD', 'VINTAGE_DAD'],
    COACH_DAD: ['COUCH_DAD', 'LAWN_DAD'],
    CHEF_DAD: ['BBQ_DAD', 'COUCH_DAD'],
    HOLIDAY_DAD: ['LAWN_DAD', 'FASHION_DAD'],
    WAREHOUSE_DAD: ['CAR_DAD', 'FIX_IT_DAD'],
    VINTAGE_DAD: ['TECH_DAD', 'COOL_DAD'],
    FASHION_DAD: ['COOL_DAD', 'OFFICE_DAD'],
    TECH_DAD: ['OFFICE_DAD', 'VINTAGE_DAD'],
    ITEM: [],
  };

  if (advantages[attacker]?.includes(defender)) {
    return 1.5; // 50% bonus damage
  }

  // Check for disadvantage
  for (const [type, disadvantaged] of Object.entries(advantages)) {
    if (disadvantaged.includes(attacker) && type === defender) {
      return 0.75; // 25% reduced damage
    }
  }

  return 1.0; // neutral
}

/**
 * Apply status effects to a card
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
  const modifiedStats = { ...card.stats };

  for (const effect of effects) {
    switch (effect.type) {
      case 'grilled':
        modifiedStats.grillSkill -= effect.strength * 0.1;
        modifiedStats.fixIt -= effect.strength * 0.05;
        break;
      case 'lectured':
        modifiedStats.dadJoke -= effect.strength * 0.15;
        modifiedStats.thermostat += effect.strength * 0.1;
        break;
      case 'awkward':
        modifiedStats.dadJoke -= effect.strength * 0.2;
        modifiedStats.sockSandal += effect.strength * 0.1;
        break;
      case 'drunk':
        modifiedStats.beerSnob += effect.strength * 0.3;
        modifiedStats.fixIt -= effect.strength * 0.4;
        modifiedStats.grillSkill -= effect.strength * 0.2;
        break;
      case 'bored':
        modifiedStats.napPower += effect.strength * 0.2;
        modifiedStats.remoteControl += effect.strength * 0.15;
        break;
      case 'inspired':
        modifiedStats.dadJoke += effect.strength * 0.15;
        modifiedStats.grillSkill += effect.strength * 0.1;
        break;
    }
  }

  // Clamp values between 0-100
  for (const key in modifiedStats) {
    modifiedStats[key as keyof CardStats] = Math.max(0, Math.min(100, modifiedStats[key as keyof CardStats]));
  }

  return modifiedStats;
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
