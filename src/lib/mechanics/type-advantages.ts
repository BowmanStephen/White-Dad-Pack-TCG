import type { DadType } from '../../types';

/**
 * DadDeck™ Type Advantage Matrix
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
 * Type Advantage Matrix (16x16)
 *
 * PERFECTLY BALANCED: Each type appears exactly twice in advantages (ensuring 2 disadvantages per type)
 *
 * Thematic advantages based on dad stereotype rivalries
 */
export const TYPE_ADVANTAGE_MATRIX: Record<DadType, DadType[]> = {
  // BBQ_DAD beats GOLF_DAD (heat melts game) and COUCH_DAD (fire burns couch)
  BBQ_DAD: ['GOLF_DAD', 'COUCH_DAD'],

  // FIX_IT_DAD beats TECH_DAD (analog beats digital) and CAR_DAD (fixes cars)
  FIX_IT_DAD: ['TECH_DAD', 'CAR_DAD'],

  // GOLF_DAD beats COACH_DAD (rivalry) and COOL_DAD (golf is cool)
  GOLF_DAD: ['COACH_DAD', 'COOL_DAD'],

  // COUCH_DAD beats OFFICE_DAD (remote beats office) and CHEF_DAD (lazy beats cooking)
  COUCH_DAD: ['OFFICE_DAD', 'CHEF_DAD'],

  // LAWN_DAD beats WAREHOUSE_DAD (nature beats warehouse) and CHEF_DAD (grass stains beat white uniform)
  LAWN_DAD: ['WAREHOUSE_DAD', 'CHEF_DAD'],

  // CAR_DAD beats FASHION_DAD (practical beats style) and HOLIDAY_DAD (road trips beat staying home)
  CAR_DAD: ['FASHION_DAD', 'HOLIDAY_DAD'],

  // OFFICE_DAD beats CAR_DAD (commuter beats driver) and LAWN_DAD (indoors beats outdoors)
  OFFICE_DAD: ['CAR_DAD', 'LAWN_DAD'],

  // COOL_DAD beats FASHION_DAD (style intimidation) and COACH_DAD (cool beats coaching)
  COOL_DAD: ['FASHION_DAD', 'COACH_DAD'],

  // COACH_DAD beats TECH_DAD (strategy beats tech) and FIX_IT_DAD (coaching beats DIY)
  COACH_DAD: ['TECH_DAD', 'FIX_IT_DAD'],

  // CHEF_DAD beats BBQ_DAD (kitchen beats BBQ) and HOLIDAY_DAD (cooking beats ordering takeout)
  CHEF_DAD: ['BBQ_DAD', 'HOLIDAY_DAD'],

  // HOLIDAY_DAD beats LAWN_DAD (vacation beats yard work) and COUCH_DAD (festive beats lazy)
  HOLIDAY_DAD: ['LAWN_DAD', 'COUCH_DAD'],

  // WAREHOUSE_DAD beats VINTAGE_DAD (bulk inventory beats old stuff) and BBQ_DAD (bulk storage beats grill)
  WAREHOUSE_DAD: ['VINTAGE_DAD', 'BBQ_DAD'],

  // VINTAGE_DAD beats COOL_DAD (classic beats modern) and FIX_IT_DAD (old tools vs new tools)
  VINTAGE_DAD: ['COOL_DAD', 'FIX_IT_DAD'],

  // FASHION_DAD beats WAREHOUSE_DAD (style beats bulk) and OFFICE_DAD (style beats corporate)
  FASHION_DAD: ['WAREHOUSE_DAD', 'OFFICE_DAD'],

  // TECH_DAD beats GOLF_DAD (golf GPS beats caddy) and VINTAGE_DAD (tech beats old tech)
  TECH_DAD: ['GOLF_DAD', 'VINTAGE_DAD'],

  // Special card types have no advantages
  ITEM: [],
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
  const allTypes: DadType[] = [
    'BBQ_DAD', 'FIX_IT_DAD', 'GOLF_DAD', 'COUCH_DAD',
    'LAWN_DAD', 'CAR_DAD', 'OFFICE_DAD', 'COOL_DAD',
    'COACH_DAD', 'CHEF_DAD', 'HOLIDAY_DAD', 'WAREHOUSE_DAD',
    'VINTAGE_DAD', 'FASHION_DAD', 'TECH_DAD', 'ITEM',
  ];

  return allTypes.filter(
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
 * Validate that the type advantage matrix is balanced
 */
export function validateMatrix(): void {
  const errors: string[] = [];

  for (const [type, advantages] of Object.entries(TYPE_ADVANTAGE_MATRIX)) {
    if (type === 'ITEM') continue;

    if (advantages.length !== 2) {
      errors.push(`${type} has ${advantages.length} advantages (expected 2)`);
    }

    const disadvantages = getDisadvantages(type as DadType);
    if (disadvantages.length !== 2) {
      errors.push(`${type} has ${disadvantages.length} disadvantages (expected 2)`);
    }
  }

  if (errors.length > 0) {
    throw new Error('Type advantage matrix is unbalanced:\n' + errors.join('\n'));
  }
}
