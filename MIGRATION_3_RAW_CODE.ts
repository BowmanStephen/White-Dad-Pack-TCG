// ============================================================================
// MIGRATION 3: RAW CODE - COPY/PASTE READY
// ============================================================================
// File: src/lib/utils/migrations.ts
// Created: January 17, 2026
// ============================================================================

// SECTION 1: Version Update (Replace line 22)
// ============================================================================
export const CURRENT_SCHEMA_VERSION = 3;

// SECTION 2: Migration Function (Add after migration_2_add_season_support, before MIGRATION REGISTRY comment)
// ============================================================================
/**
 * Migration 3: Add card type overhaul support
 * - Adds new attributes: effects, cardAttributes, isSpecialType
 * - Converts old "type" values to new DICKTATOR naming (e.g., BBQ_DAD → BBQ_DICKTATOR)
 * - Adds support for special card types (EVENT, TERRAIN, EVOLUTION, CURSE, TRAP)
 * - Maintains backward compatibility with old card data
 */
const migration_3_add_card_type_support: MigrationFn = (data): any => {
  // Type mapping for old → new DICKTATOR naming convention
  const typeMapping: Record<string, string> = {
    // Core DICKTATOR DADS
    BBQ_DAD: 'BBQ_DICKTATOR',
    FIX_IT_DAD: 'FIX_IT_TECHNICIAN',
    GOLF_DAD: 'GOLF_COMMANDER',
    COUCH_DAD: 'COUCH_CUMMANDER',
    LAWN_DAD: 'LAWN_LIEUTENANT',
    CAR_DAD: 'CAR_CAPTAIN',
    OFFICE_DAD: 'OFFICE_OPERATIVE',
    COOL_DAD: 'COOL_CATALYST',
    COACH_DAD: 'COACH_COMMANDER',
    CHEF_DAD: 'CHEF_OVERLORD',
    HOLIDAY_DAD: 'HOLIDAY_HOST',
    WAREHOUSE_DAD: 'WAREHOUSE_WARDEN',
    VINTAGE_DAD: 'VINTAGE_VOYAGER',
    FASHION_DAD: 'FASHION_FUHRER',
    TECH_DAD: 'TECH_TITAN',

    // Extended Archetypes (already use new naming)
    SUBURBAN_SPY: 'SUBURBAN_SPY',
    GAMER_GIZZARDS: 'GAMER_GIZZARDS',
    PREPPER_PENIS: 'PREPPER_PENIS',
    BBQ_BRAWLER: 'BBQ_BRAWLER',
    SUBURBAN_SOCIALITE: 'SUBURBAN_SOCIALITE',
    NEIGHBORHOOD_NOSY: 'NEIGHBORHOOD_NOSY',
    SON_SPAWNS: 'SON_SPAWNS',
    DAUGHTER_DINGBATS: 'DAUGHTER_DINGBATS',
    UNCLE_UPROARS: 'UNCLE_UPROARS',
    SUBURBAN_SIDEKICKS: 'SUBURBAN_SIDEKICKS',

    // Special Card Types (pass through)
    ITEM: 'ITEM',
    EVENT: 'EVENT',
    TERRAIN: 'TERRAIN',
    EVOLUTION: 'EVOLUTION',
    CURSE: 'CURSE',
    TRAP: 'TRAP',
  };

  // Migrate all cards in all packs
  if (data.packs && Array.isArray(data.packs)) {
    for (const pack of data.packs) {
      if (pack.cards && Array.isArray(pack.cards)) {
        for (const card of pack.cards) {
          // Convert type to new naming convention
          if (card.type && typeof card.type === 'string') {
            const newType = typeMapping[card.type] || card.type;
            card.type = newType;
          }

          // Add new attributes if missing (idempotent check)
          if (!card.effects) {
            card.effects = [];
          }

          if (!card.cardAttributes) {
            card.cardAttributes = {
              isSpecialType: false,
              specialTypeInfo: null,
            };
          }

          // Mark special card types
          const specialTypes = ['ITEM', 'EVENT', 'TERRAIN', 'EVOLUTION', 'CURSE', 'TRAP'];
          if (specialTypes.includes(card.type)) {
            card.cardAttributes.isSpecialType = true;

            // Initialize special type info based on card type
            if (!card.cardAttributes.specialTypeInfo) {
              card.cardAttributes.specialTypeInfo = {
                cardType: card.type,
                triggerCondition: null,
                effectDuration: null,
                stackable: false,
              };
            }
          }

          // Add isRevealed flag if missing (for collection cards)
          if (!('isRevealed' in card)) {
            card.isRevealed = true;
          }

          // Ensure holoType is set (default to none if missing)
          if (!card.holoType && card.holoVariant) {
            card.holoType = card.holoVariant;
          } else if (!card.holoType) {
            card.holoType = 'none';
          }
        }
      }
    }
  }

  return data;
};

// SECTION 3: Registry Entry (Add to MIGRATIONS array after migration_2 entry)
// ============================================================================
{
  version: 3,
  description: 'Add card type overhaul: DICKTATOR naming, special types (EVENT/TERRAIN/etc), effects, and card attributes',
  migrate: migration_3_add_card_type_support,
},

// ============================================================================
// IMPLEMENTATION NOTES
// ============================================================================
// 1. Replace line 22 (CURRENT_SCHEMA_VERSION = 2) with SECTION 1
// 2. Add SECTION 2 function after migration_2_add_season_support function
// 3. Add SECTION 3 object to MIGRATIONS array after version 2 entry
// 
// Result: src/lib/utils/migrations.ts will have:
//   - CURRENT_SCHEMA_VERSION = 3 (line 22)
//   - migration_3_add_card_type_support function (lines 131-235)
//   - Version 3 entry in MIGRATIONS array (lines 256-259)
// ============================================================================
