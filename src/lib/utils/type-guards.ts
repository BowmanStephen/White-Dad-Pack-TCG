/**
 * Type-safe utility functions for accessing Records with union type keys
 */

/**
 * Safely access a Record by a Rarity key
 * TypeScript can't guarantee that a Rarity value is a valid key, so this helper
 * provides type-safe access with a runtime assertion.
 */
export function getRarityRecordValue<T>(
  record: Record<string, T>,
  key: string
): T {
  if (!(key in record)) {
    throw new Error(`Invalid rarity key: ${key}`);
  }
  return record[key];
}

/**
 * Safely access a Record by a DadType key
 * TypeScript can't guarantee that a DadType value is a valid key, so this helper
 * provides type-safe access with a runtime assertion.
 */
export function getDadTypeRecordValue<T>(
  record: Record<string, T>,
  key: string
): T {
  if (!(key in record)) {
    throw new Error(`Invalid dad type key: ${key}`);
  }
  return record[key];
}

/**
 * Type-safe Record initializer for Rarity
 * Creates a Record with all Rarity keys initialized to the same value
 */
export function createRarityRecord<T>(value: T): Record<string, T> {
  return {
    common: value,
    uncommon: value,
    rare: value,
    epic: value,
    legendary: value,
    mythic: value,
  };
}

/**
 * Type-safe Record initializer for DadType
 * Creates a Record with all DadType keys initialized to the same value
 */
export function createDadTypeRecord<T>(value: T): Record<string, T> {
  return {
    BBQ_DAD: value,
    FIX_IT_DAD: value,
    GOLF_DAD: value,
    COUCH_DAD: value,
    LAWN_DAD: value,
    CAR_DAD: value,
    OFFICE_DAD: value,
    COOL_DAD: value,
    COACH_DAD: value,
    CHEF_DAD: value,
    HOLIDAY_DAD: value,
    WAREHOUSE_DAD: value,
    VINTAGE_DAD: value,
    FASHION_DAD: value,
    TECH_DAD: value,
    SUBURBAN_SPY: value,
    GAMER_GIZZARDS: value,
    PREPPER_PENIS: value,
    BBQ_BRAWLER: value,
    SUBURBAN_SOCIALITE: value,
    NEIGHBORHOOD_NOSY: value,
    SON_SPAWNS: value,
    DAUGHTER_DINGBATS: value,
    UNCLE_UPROARS: value,
    SUBURBAN_SIDEKICKS: value,
    ITEM: value,
    EVENT: value,
    TERRAIN: value,
    EVOLUTION: value,
    CURSE: value,
    TRAP: value,
  };
}
