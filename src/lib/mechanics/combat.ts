import type { Card, CardStats, DadType, Rarity } from '../../types';

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
      ['COUCH_DAD', 'REMOTE_CONTROL' as any],
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
  for (const [name, [types1, types2], synergyName, description] of Object.values(typeSynergies)) {
    if (
      types1.includes(card1.type) &&
      types2.includes(card2.type)
    ) {
      return {
        hasSynergy: true,
        synergyBonus: 1.3,
        synergyName: name,
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
