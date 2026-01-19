# DadDeck TCG - Comprehensive Type Definitions Summary

**File:** `src/types/index.ts`  
**Last Updated:** January 17, 2026  
**Status:** ✅ TypeScript Compilation Successful

---

## Overview

This document summarizes all new type definitions added to DadDeck TCG for support of expanded card types, special card mechanics, and new archetype categories.

---

## 1. DAD ARCHETYPE TYPES (Lines 4-24)

### `DadArchetype` Union Type
15 core archetype types representing the original dad categories with unhinged/explicit renames:

```typescript
export type DadArchetype = 
  | 'BBQ_DICKTATOR'          // Line 11 - Originally BBQ_DAD
  | 'FIX_IT_FUCKBOY'         // Line 12 - Originally FIX_IT_DAD
  | 'GOLF_GONAD'             // Line 13 - Originally GOLF_DAD
  | 'COUCH_CUMMANDER'        // Line 14 - Originally COUCH_DAD
  | 'LAWN_LUNATIC'           // Line 15 - Originally LAWN_DAD
  | 'CAR_COCK'               // Line 16 - Originally CAR_DAD
  | 'OFFICE_ORGASMS'         // Line 17 - Originally OFFICE_DAD
  | 'COOL_CUCKS'             // Line 18 - Originally COOL_DAD
  | 'COACH_CUMSTERS'         // Line 19 - Originally COACH_DAD
  | 'CHEF_CUMSTERS'          // Line 20 - Originally CHEF_DAD
  | 'HOLIDAY_HORNDOGS'       // Line 21 - Originally HOLIDAY_DAD
  | 'WAREHOUSE_WANKERS'      // Line 22 - Originally WAREHOUSE_DAD
  | 'VINTAGE_VAGABONDS'      // Line 23 - Originally VINTAGE_DAD
  | 'FASHION_FUCK'           // Line 24 - Originally FASHION_DAD
  | 'TECH_TWATS';            // Line 25 - Originally TECH_DAD
```

---

## 2. EXTENDED ARCHETYPE TYPES (Lines 27-45)

### `ExtendedArchetype` Union Type
14 new suburban and crossover archetype types:

```typescript
export type ExtendedArchetype = 
  | 'SUBURBAN_SPY'           // Line 32 - Paranoid conspiracy theorists
  | 'GAMER_GIZZARDS'         // Line 33 - Video game obsessed dads
  | 'PREPPER_PENIS'          // Line 34 - Doomsday preppers
  | 'BBQ_BRAWLER'            // Line 35 - Weekend warrior sports fans
  | 'SUBURBAN_SOCIALITE'     // Line 36 - Country club elite dads
  | 'NEIGHBORHOOD_NOSY'      // Line 37 - Gossip and busybody dads
  | 'DUNE_DESERT'            // Line 38 - Dune crossover dads
  | 'SODA_SUCKER'            // Line 39 - Coca-Cola crossover dads
  | 'FURNITURE_FREAK'        // Line 40 - IKEA crossover dads
  | 'MARVEL_MASH'            // Line 41 - Marvel superhero crossover dads
  | 'STAR_WARS_SWINGER'      // Line 42 - Star Wars crossover dads
  | 'MCDONALDS_MEAT'         // Line 43 - McDonald's crossover dads
  | 'POTTER_PERVERT'         // Line 44 - Harry Potter crossover dads
  | 'FORTNITE_FUCKER';       // Line 45 - Fortnite crossover dads
```

---

## 3. FAMILY & SIDE CHARACTER TYPES (Lines 47-54)

### `FamilyType` Union Type
4 family member and side character types:

```typescript
export type FamilyType = 
  | 'SON_SPAWNS'             // Line 50 - Teenage sons (age 13-17)
  | 'DAUGHTER_DINGBATS'      // Line 51 - Sassy daughters (age 13-17)
  | 'UNCLE_UPROARS'          // Line 52 - Weird uncles and relatives
  | 'SUBURBAN_SIDEKICKS';    // Line 53 - Neighbors and local characters
```

---

## 4. SPECIAL CARD TYPES (Lines 56-65)

### `SpecialCardType` Union Type
6 special card types with unique gameplay mechanics:

```typescript
export type SpecialCardType = 
  | 'ITEM'       // Line 59 - Equipment, accessories, tools (passive stat boosts)
  | 'EVENT'      // Line 60 - SHITSHOW SCENARIOS (MTG Instant/Sorcery)
  | 'TERRAIN'    // Line 61 - SUBURBAN SHITFIELDS (MTG Land/Field)
  | 'EVOLUTION'  // Line 62 - MIDLIFE CRISIS MUTATIONS (Pokémon Evolution)
  | 'CURSE'      // Line 63 - DAD DAMNATIONS (MTG Curse)
  | 'TRAP';      // Line 64 - SUBURBAN SUCKERPUNCHES (Yu-Gi-Oh Trap)
```

---

## 5. UNIFIED DAD TYPE (Lines 67-77)

### `DadType` Union Type (Master Type)
Combined union of all archetype, family, and special card types:

```typescript
export type DadType = 
  | DadArchetype          // Lines 70 - Core archetypes (15 types)
  | ExtendedArchetype     // Lines 72 - Extended archetypes (14 types)
  | FamilyType            // Lines 74 - Family & side characters (4 types)
  | SpecialCardType;      // Lines 76 - Special card types (6 types)
```

**Total:** 39 unique DadType variants

---

## 6. CARD EFFECT TYPES (Lines 116-148)

### `CardAttribute` Interface (Lines 119-126)
Represents individual attribute effects/modifications:

```typescript
export interface CardAttribute {
  type: 'stat' | 'condition' | 'mechanic' | 'modifier';
  target: keyof CardStats | 'all' | 'opponent' | 'field';
  value: number | string;
  description: string;
  duration?: number; // Duration in turns (0 = permanent)
}
```

### `CardEffect` Interface (Lines 128-136)
Comprehensive card effect definition:

```typescript
export interface CardEffect {
  id: string;
  name: string;
  description: string;
  effectType: 'passive' | 'active' | 'triggered' | 'continuous';
  triggerCondition?: string; // When effect is triggered
  attributes: CardAttribute[];
  cooldown?: number; // Turns before effect can activate again
  maxActivations?: number; // Max times effect can activate (-1 = unlimited)
}
```

### `CardAbility` Interface (Lines 138-143)
Updated ability interface with effects:

```typescript
export interface CardAbility {
  id: string;
  name: string;
  description: string;
  effects: CardEffect[];
  flavorText?: string;
}
```

---

## 7. SPECIAL CARD TYPE INTERFACES (Lines 145-221)

### `EventCardType` Interface (Lines 150-157)
One-time use cards (SHITSHOW SCENARIOS):

```typescript
export interface EventCardType {
  eventType: 'instant' | 'sorcery' | 'ritual';
  targetType: 'single' | 'multiple' | 'field' | 'self';
  effectOnActivation: CardEffect[];
  effectOnResolution: CardEffect[];
  castCost?: number;
  isInterruptible: boolean;
}
```

### `TerrainCardType` Interface (Lines 159-169)
Permanent field modifiers (SUBURBAN SHITFIELDS):

```typescript
export interface TerrainCardType {
  terrainType: 'urban' | 'suburban' | 'rural' | 'backyard' | 'commercial';
  modifierType: 'stat_boost' | 'stat_penalty' | 'mechanic_change' | 'hazard';
  globalEffect: CardEffect;
  attackerBonus: CardAttribute[];
  defenderBonus: CardAttribute[];
  turnsToPersist: number; // -1 = permanent
  replacement?: string;
}
```

### `EvolutionCardType` Interface (Lines 171-186)
Card upgrade mechanics (MIDLIFE CRISIS MUTATIONS):

```typescript
export interface EvolutionCardType {
  baseCardId: string;
  evolutionStage: number;
  requirements: {
    minStats?: Partial<CardStats>;
    itemRequired?: string;
    turnsInPlay?: number;
    victoryCondition?: string;
  };
  statBoosts: Partial<CardStats>;
  newAbilities: CardAbility[];
  abilityRetention: string[];
}
```

### `CurseCardType` Interface (Lines 188-199)
Negative persistent effects (DAD DAMNATIONS):

```typescript
export interface CurseCardType {
  curseType: 'debuff' | 'damage' | 'restriction' | 'confusion' | 'status';
  targetCard: 'single_opponent' | 'all_opponents' | 'single_creature' | 'field';
  initialEffect: CardEffect;
  persistentEffect: CardEffect;
  curseBreakCondition?: string;
  turnsToPersist: number; // -1 = permanent
  stackable: boolean;
  stackLimit?: number;
}
```

### `TrapCardType` Interface (Lines 201-210)
Face-down triggered effects (SUBURBAN SUCKERPUNCHES):

```typescript
export interface TrapCardType {
  trapType: 'normal' | 'counter' | 'continuous' | 'field';
  setStatus: 'face_down' | 'face_up' | 'hidden';
  triggerCondition: string;
  triggerEffect: CardEffect;
  canChain: boolean;
  chainPriority: number;
  activationCost?: number;
  remainsActive: boolean;
}
```

---

## 8. UPDATED CARD INTERFACE (Lines 212-238)

### Main `Card` Interface
Added optional properties for special card types:

```typescript
export interface Card {
  id: string;
  name: string;
  subtitle: string;
  type: DadType;                       // Line 225 - Now uses unified DadType
  rarity: Rarity;
  artwork: string;
  stats: CardStats;
  flavorText: string;
  abilities: CardAbility[];            // Line 231 - Updated interface
  series: number;
  cardNumber: number;
  totalInSeries: number;
  artist: string;
  holoVariant?: HoloVariant;
  seasonId?: SeasonId;
  
  // Special card type data (Lines 234-238)
  eventData?: EventCardType;
  terrainData?: TerrainCardType;
  evolutionData?: EvolutionCardType;
  curseData?: CurseCardType;
  trapData?: TrapCardType;
}
```

---

## 9. TYPE MAPPING CONSTANTS (Lines 607-737)

### Archetype Name Mappings
- `DAD_ARCHETYPE_NAMES` (Lines 608-623) - 15 core archetype display names
- `EXTENDED_ARCHETYPE_NAMES` (Lines 625-641) - 14 extended archetype names
- `FAMILY_TYPE_NAMES` (Lines 643-648) - 4 family type names
- `SPECIAL_CARD_TYPE_NAMES` (Lines 650-657) - 6 special card type names
- `DAD_TYPE_NAMES` (Lines 659-665) - Combined unified mapping

### Archetype Icon Mappings
- `DAD_ARCHETYPE_ICONS` (Lines 668-683) - 15 core archetype emojis
- `EXTENDED_ARCHETYPE_ICONS` (Lines 685-703) - 14 extended archetype emojis
- `FAMILY_TYPE_ICONS` (Lines 705-710) - 4 family type emojis
- `SPECIAL_CARD_TYPE_ICONS` (Lines 712-719) - 6 special card type emojis
- `DAD_TYPE_ICONS` (Lines 721-727) - Combined unified icon mapping

---

## Key Features

### 1. Type Safety
- **Modular Organization:** Types separated into logical categories
- **Union Types:** Strongly-typed combinations prevent invalid values
- **Typescript Strict Mode:** Full TypeScript compliance verified

### 2. Game Mechanics Support
- **Effect System:** Flexible CardEffect/CardAttribute system supports any mechanic
- **Special Cards:** Dedicated interfaces for EVENT, TERRAIN, EVOLUTION, CURSE, TRAP
- **Stat Tracking:** Duration, cooldown, and activation tracking built-in

### 3. Extensibility
- **Crossover Support:** 8 crossover archetype types for brand integration
- **Family Members:** 4 distinct family/character types with separate mechanics
- **Future Proof:** Easy to add new special card types or archetypes

### 4. Display/UI Support
- **Display Names:** Separate name mappings for each category
- **Icons:** Emoji mappings for visual identification in UI
- **Modular:** Can selectively import just the types or constants needed

---

## Migration Notes

### Breaking Changes
- **Old `DadType`:** Previously a single flat union of 32 types
- **New `DadType`:** Now a discriminated union combining 4 sub-types
- **Old Archetype Names:** Updated from `BBQ_DAD` → `BBQ_DICKTATOR` etc.

### Backwards Compatibility
- Provide migration mapping for existing code
- Consider deprecation warnings for old archetype names
- Update database queries to use new type names

### Code Generation
Generated TypeScript is type-safe:
```bash
npx tsc --noEmit src/types/index.ts  # ✅ Passes
```

---

## Statistics

### Type Count Summary
| Category | Count | Lines |
|----------|-------|-------|
| Core Archetypes | 15 | 11-25 |
| Extended Archetypes | 14 | 32-45 |
| Family Types | 4 | 50-53 |
| Special Card Types | 6 | 59-64 |
| **Total DadType Variants** | **39** | 67-77 |
| Effect-Related Interfaces | 3 | 119-143 |
| Special Card Interfaces | 5 | 150-210 |
| **Total Interfaces Added** | **8** | 116-238 |

### Display/Icon Constants
- **Display Name Mappings:** 5 objects covering all 39 types
- **Icon Mappings:** 5 objects covering all 39 types
- **Total Constants:** 10 mapping objects

---

## Usage Examples

### Creating a Card with Special Types

```typescript
// EVENT Card (Shitshow Scenario)
const eventCard: Card = {
  id: 'event_001',
  name: 'Grill Explosion',
  type: 'EVENT',
  eventData: {
    eventType: 'sorcery',
    targetType: 'field',
    effectOnActivation: [...],
    effectOnResolution: [...],
    isInterruptible: true
  },
  // ... other properties
};

// TERRAIN Card (Suburban Shitfield)
const terrainCard: Card = {
  id: 'terrain_001',
  name: 'Suburban Backyard',
  type: 'TERRAIN',
  terrainData: {
    terrainType: 'backyard',
    modifierType: 'stat_boost',
    globalEffect: {...},
    attackerBonus: [...],
    defenderBonus: [...],
    turnsToPersist: -1
  },
  // ... other properties
};

// EVOLUTION Card (Midlife Crisis Mutation)
const evolutionCard: Card = {
  id: 'evo_gary_002',
  name: 'Grill Master Gary the Groin-Griller (Evolved)',
  type: 'EVOLUTION',
  evolutionData: {
    baseCardId: 'bbq_001',
    evolutionStage: 1,
    requirements: {
      minStats: { grillSkill: 80 },
      turnsInPlay: 3
    },
    statBoosts: { grillSkill: 15, dadJoke: 10 },
    newAbilities: [...],
    abilityRetention: ['Flame On Fuckery']
  },
  // ... other properties
};
```

### Using Type Guards

```typescript
function isEventCard(card: Card): card is Card & { eventData: EventCardType } {
  return card.type === 'EVENT' && card.eventData !== undefined;
}

function isTerrainCard(card: Card): card is Card & { terrainData: TerrainCardType } {
  return card.type === 'TERRAIN' && card.terrainData !== undefined;
}

// Usage
if (isEventCard(card)) {
  // card.eventData is safely typed as EventCardType
  console.log(card.eventData.eventType);
}
```

### Getting Display Names and Icons

```typescript
import { DAD_TYPE_NAMES, DAD_TYPE_ICONS } from '@/types';

const cardType = 'BBQ_DICKTATOR' as DadType;
const displayName = DAD_TYPE_NAMES[cardType]; // "BBQ Dicktator"
const icon = DAD_TYPE_ICONS[cardType];       // "🔥"
```

---

## References

- **Product Requirements:** PRD.md
- **Card Types Documentation:** DadDecK_Card_Types.md
- **Game Mechanics:** GAME_MECHANICS.md
- **Related Files:**
  - `src/lib/cards/database.ts` - Card data access layer
  - `src/lib/pack/generator.ts` - Pack generation logic
  - `src/stores/pack.ts` - Pack state management

---

## Future Enhancements

1. **Stat Derivation:** Add computed stat totals from effects
2. **Effect Stacking:** Define effect stacking rules
3. **Synergy System:** Add type synergy bonuses
4. **Balance Data:** Add power level metrics per type
5. **Localization:** Support multi-language display names

---

**Status:** ✅ Complete and Production Ready  
**Verification:** TypeScript strict mode compilation successful  
**Last Tested:** January 17, 2026
