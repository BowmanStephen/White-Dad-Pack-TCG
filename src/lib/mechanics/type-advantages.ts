import type { DadType } from '../../types';

/**
 * DadDeck™ Type Advantage Matrix - Backyard Boner Edition
 *
 * ## DESIGN PRINCIPLES (PACK-008)
 *
 * **Rock-Paper-Scissors Balance:**
 * - Each type has exactly **2 advantages** (deals +20% damage)
 * - Each type has exactly **2 disadvantages** (receives +20% damage from opponents)
 * - 11 types are neutral (no bonus)
 * - Creates strategic depth in deck building
 */

/**
 * Type advantage multiplier values
 */
export const ADVANTAGE_MULTIPLIER = 1.2; // +20% damage
export const DISADVANTAGE_MULTIPLIER = 0.8; // -20% damage (inverse of advantage)
export const NEUTRAL_MULTIPLIER = 1.0; // No bonus

/**
 * Type Advantage Matrix
 *
 * PERFECTLY BALANCED: Each type appears exactly twice in advantages (ensuring 2 disadvantages per type)
 *
 * Thematic advantages based on dad stereotype rivalries
 */
export const TYPE_ADVANTAGE_MATRIX: Record<DadType, DadType[]> = {
  // BBQ_DICKTATOR beats GOLF_GONAD (heat melts game) and COUCH_CUMMANDER (fire burns couch)
  BBQ_DICKTATOR: ['GOLF_GONAD', 'COUCH_CUMMANDER'],

  // FIX_IT_FUCKBOY beats TECH_TWATS (analog beats digital) and CAR_COCK (fixes cars)
  FIX_IT_FUCKBOY: ['TECH_TWATS', 'CAR_COCK'],

  // GOLF_GONAD beats COACH_CUMSTERS (rivalry) and COOL_CUCKS (golf is cool)
  GOLF_GONAD: ['COACH_CUMSTERS', 'COOL_CUCKS'],

  // COUCH_CUMMANDER beats OFFICE_ORGASMS (remote beats office) and CHEF_CUMSTERS (lazy beats cooking)
  COUCH_CUMMANDER: ['OFFICE_ORGASMS', 'CHEF_CUMSTERS'],

  // LAWN_LUNATIC beats WAREHOUSE_WANKERS (nature beats warehouse) and CHEF_CUMSTERS (grass stains beat white uniform)
  LAWN_LUNATIC: ['WAREHOUSE_WANKERS', 'CHEF_CUMSTERS'],

  // CAR_COCK beats FASHION_FUCK (practical beats style) and HOLIDAY_HORNDOGS (road trips beat staying home)
  CAR_COCK: ['FASHION_FUCK', 'HOLIDAY_HORNDOGS'],

  // OFFICE_ORGASMS beats CAR_COCK (commuter beats driver) and LAWN_LUNATIC (indoors beats outdoors)
  OFFICE_ORGASMS: ['CAR_COCK', 'LAWN_LUNATIC'],

  // COOL_CUCKS beats FASHION_FUCK (style intimidation) and COACH_CUMSTERS (cool beats coaching)
  COOL_CUCKS: ['FASHION_FUCK', 'COACH_CUMSTERS'],

  // COACH_CUMSTERS beats TECH_TWATS (strategy beats tech) and FIX_IT_FUCKBOY (coaching beats DIY)
  COACH_CUMSTERS: ['TECH_TWATS', 'FIX_IT_FUCKBOY'],

  // CHEF_CUMSTERS beats BBQ_DICKTATOR (kitchen beats BBQ) and HOLIDAY_HORNDOGS (cooking beats ordering takeout)
  CHEF_CUMSTERS: ['BBQ_DICKTATOR', 'HOLIDAY_HORNDOGS'],

  // HOLIDAY_HORNDOGS beats LAWN_LUNATIC (vacation beats yard work) and COUCH_CUMMANDER (festive beats lazy)
  HOLIDAY_HORNDOGS: ['LAWN_LUNATIC', 'COUCH_CUMMANDER'],

  // WAREHOUSE_WANKERS beats VINTAGE_VAGABONDS (bulk inventory beats old stuff) and BBQ_DICKTATOR (bulk storage beats grill)
  WAREHOUSE_WANKERS: ['VINTAGE_VAGABONDS', 'BBQ_DICKTATOR'],

  // VINTAGE_VAGABONDS beats COOL_CUCKS (classic beats modern) and FIX_IT_FUCKBOY (old tools vs new tools)
  VINTAGE_VAGABONDS: ['COOL_CUCKS', 'FIX_IT_FUCKBOY'],

  // FASHION_FUCK beats WAREHOUSE_WANKERS (style beats bulk) and OFFICE_ORGASMS (style beats corporate)
  FASHION_FUCK: ['WAREHOUSE_WANKERS', 'OFFICE_ORGASMS'],

  // TECH_TWATS beats GOLF_GONAD (golf GPS beats caddy) and VINTAGE_VAGABONDS (tech beats old tech)
  TECH_TWATS: ['GOLF_GONAD', 'VINTAGE_VAGABONDS'],

  // Extended archetypes (neutral for now - can be expanded)
  GAMER_GIZZARDS: [],
  PREPPER_PENIS: [],
  BBQ_BRAWLER: [],
  SUBURBAN_SOCIALITE: [],
  NEIGHBORHOOD_NOSY: [],

  // Family Variants (neutral)
  SON_SPAWNS: [],
  DAUGHTER_DINGBATS: [],
  UNCLE_UPROARS: [],
  SUBURBAN_SIDEKICKS: [],

  // Special card types have no advantages
  ITEM: [],
  EVENT: [],
  TERRAIN: [],
  EVOLUTION: [],
  CURSE: [],
  TRAP: [],

  // Crossover Events (neutral)
  DUNE_DESERT: [],
  MARVEL_MASH: [],
  STAR_WARS_SWINGER: [],
  MCDONALDS_MEAT: [],
  POTTER_PERVERT: [],
  FORTNITE_FUCKER: [],
};

/**
 * Get type advantage multiplier between attacker and defender
 *
 * @param attacker - Attacking dad type
 * @param defender - Defending dad type
 * @returns Damage multiplier (1.2 for advantage, 0.8 for disadvantage, 1.0 for neutral)
 */
export function getTypeAdvantage(attacker: DadType, defender: DadType): number {
  if (TYPE_ADVANTAGE_MATRIX[attacker]?.includes(defender)) {
    return ADVANTAGE_MULTIPLIER;
  }

  if (TYPE_ADVANTAGE_MATRIX[defender]?.includes(attacker)) {
    return DISADVANTAGE_MULTIPLIER;
  }

  return NEUTRAL_MULTIPLIER;
}

/**
 * Get all types this type has advantage over
 */
export function getAdvantages(type: DadType): DadType[] {
  return TYPE_ADVANTAGE_MATRIX[type] || [];
}

/**
 * Get all types this type has disadvantage against
 */
export function getDisadvantages(type: DadType): DadType[] {
  const disadvantages: DadType[] = [];

  for (const [otherType, advantages] of Object.entries(TYPE_ADVANTAGE_MATRIX)) {
    if (advantages.includes(type)) {
      disadvantages.push(otherType as DadType);
    }
  }

  return disadvantages;
}

/**
 * Get all neutral matchups for a type
 */
export function getNeutrals(type: DadType): DadType[] {
  const advantages = getAdvantages(type);
  const disadvantages = getDisadvantages(type);
  const coreTypes: DadType[] = [
    'BBQ_DICKTATOR', 'FIX_IT_FUCKBOY', 'GOLF_GONAD', 'COUCH_CUMMANDER',
    'LAWN_LUNATIC', 'CAR_COCK', 'OFFICE_ORGASMS', 'COOL_CUCKS',
    'COACH_CUMSTERS', 'CHEF_CUMSTERS', 'HOLIDAY_HORNDOGS', 'WAREHOUSE_WANKERS',
    'VINTAGE_VAGABONDS', 'FASHION_FUCK', 'TECH_TWATS',
  ];

  return coreTypes.filter(
    t => t !== type && !advantages.includes(t) && !disadvantages.includes(t)
  );
}

/**
 * Check if a type matchup is advantageous
 */
export function hasAdvantage(attacker: DadType, defender: DadType): boolean {
  return getTypeAdvantage(attacker, defender) === ADVANTAGE_MULTIPLIER;
}

/**
 * Check if a type matchup is disadvantageous
 */
export function hasDisadvantage(attacker: DadType, defender: DadType): boolean {
  return getTypeAdvantage(attacker, defender) === DISADVANTAGE_MULTIPLIER;
}

/**
 * Validate that the type advantage matrix is balanced (core types only)
 */
export function validateMatrix(): void {
  const errors: string[] = [];
  const coreTypes: DadType[] = [
    'BBQ_DICKTATOR', 'FIX_IT_FUCKBOY', 'GOLF_GONAD', 'COUCH_CUMMANDER',
    'LAWN_LUNATIC', 'CAR_COCK', 'OFFICE_ORGASMS', 'COOL_CUCKS',
    'COACH_CUMSTERS', 'CHEF_CUMSTERS', 'HOLIDAY_HORNDOGS', 'WAREHOUSE_WANKERS',
    'VINTAGE_VAGABONDS', 'FASHION_FUCK', 'TECH_TWATS',
  ];

  for (const type of coreTypes) {
    const advantages = TYPE_ADVANTAGE_MATRIX[type] || [];

    if (advantages.length !== 2) {
      errors.push(`${type} has ${advantages.length} advantages (expected 2)`);
    }

    const disadvantages = getDisadvantages(type);
    if (disadvantages.length !== 2) {
      errors.push(`${type} has ${disadvantages.length} disadvantages (expected 2)`);
    }
  }

  if (errors.length > 0) {
    throw new Error('Type advantage matrix is unbalanced:\n' + errors.join('\n'));
  }
}
