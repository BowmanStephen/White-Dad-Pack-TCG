# DadDeck Types - Quick Reference

## Core Types (39 Total)

### Core Archetypes (15)
```
BBQ_DICKTATOR | FIX_IT_FUCKBOY | GOLF_GONAD | COUCH_CUMMANDER | LAWN_LUNATIC
CAR_COCK | OFFICE_ORGASMS | COOL_CUCKS | COACH_CUMSTERS | CHEF_CUMSTERS
HOLIDAY_HORNDOGS | WAREHOUSE_WANKERS | VINTAGE_VAGABONDS | FASHION_FUCK | TECH_TWATS
```

### Extended Archetypes (14)
```
SUBURBAN_SPY | GAMER_GIZZARDS | PREPPER_PENIS | BBQ_BRAWLER | SUBURBAN_SOCIALITE
NEIGHBORHOOD_NOSY | DUNE_DESERT | SODA_SUCKER | FURNITURE_FREAK | MARVEL_MASH
STAR_WARS_SWINGER | MCDONALDS_MEAT | POTTER_PERVERT | FORTNITE_FUCKER
```

### Family Types (4)
```
SON_SPAWNS | DAUGHTER_DINGBATS | UNCLE_UPROARS | SUBURBAN_SIDEKICKS
```

### Special Card Types (6)
```
ITEM | EVENT | TERRAIN | EVOLUTION | CURSE | TRAP
```

---

## New Interfaces

### Effect System
- `CardAttribute` - Individual stat/mechanic modifiers
- `CardEffect` - Complete effect definition with triggers
- `CardAbility` - (Updated) Ability now contains effects array

### Special Card Types
- `EventCardType` - SHITSHOW SCENARIOS (instant/sorcery)
- `TerrainCardType` - SUBURBAN SHITFIELDS (field modifiers)
- `EvolutionCardType` - MIDLIFE CRISIS MUTATIONS (card upgrades)
- `CurseCardType` - DAD DAMNATIONS (debuffs)
- `TrapCardType` - SUBURBAN SUCKERPUNCHES (triggered effects)

---

## Usage Examples

### Event Card
```typescript
const card: Card = {
  type: 'EVENT',
  eventData: {
    eventType: 'sorcery',
    targetType: 'field',
    effectOnActivation: [{ id: '1', name: 'Boom', ... }],
    effectOnResolution: [...],
    isInterruptible: true
  }
};
```

### Terrain Card
```typescript
const card: Card = {
  type: 'TERRAIN',
  terrainData: {
    terrainType: 'backyard',
    modifierType: 'stat_boost',
    globalEffect: { id: '1', ... },
    attackerBonus: [{ type: 'stat', target: 'grillSkill', value: 10, ... }],
    defenderBonus: [],
    turnsToPersist: -1
  }
};
```

### Evolution Card
```typescript
const card: Card = {
  type: 'EVOLUTION',
  evolutionData: {
    baseCardId: 'bbq_001',
    evolutionStage: 1,
    requirements: { minStats: { grillSkill: 80 }, turnsInPlay: 3 },
    statBoosts: { grillSkill: 15 },
    newAbilities: [...],
    abilityRetention: ['Flame On Fuckery']
  }
};
```

### Curse Card
```typescript
const card: Card = {
  type: 'CURSE',
  curseData: {
    curseType: 'debuff',
    targetCard: 'single_opponent',
    initialEffect: { ... },
    persistentEffect: { ... },
    turnsToPersist: 5,
    stackable: true,
    stackLimit: 3
  }
};
```

### Trap Card
```typescript
const card: Card = {
  type: 'TRAP',
  trapData: {
    trapType: 'counter',
    setStatus: 'face_down',
    triggerCondition: 'when opponent attacks',
    triggerEffect: { ... },
    canChain: true,
    chainPriority: 3,
    remainsActive: true
  }
};
```

---

## Display Names & Icons

```typescript
import { DAD_TYPE_NAMES, DAD_TYPE_ICONS } from '@/types';

// Get display name and icon for any DadType
const name = DAD_TYPE_NAMES['BBQ_DICKTATOR']; // "BBQ Dicktator"
const icon = DAD_TYPE_ICONS['BBQ_DICKTATOR']; // "🔥"
```

### Available Constants
- `DAD_ARCHETYPE_NAMES` / `DAD_ARCHETYPE_ICONS` (15 types)
- `EXTENDED_ARCHETYPE_NAMES` / `EXTENDED_ARCHETYPE_ICONS` (14 types)
- `FAMILY_TYPE_NAMES` / `FAMILY_TYPE_ICONS` (4 types)
- `SPECIAL_CARD_TYPE_NAMES` / `SPECIAL_CARD_TYPE_ICONS` (6 types)

---

## Effect Types

### EffectType
```
'passive'      - Always active
'active'       - Player activates
'triggered'    - Triggers on condition
'continuous'   - Persists until removed
```

### Target Types
```
keyof CardStats | 'all' | 'opponent' | 'field'
```

### Duration
```
0       - Permanent
1+      - Number of turns
-1      - Until manually removed (for CURSE/TERRAIN)
```

---

## Type Checking

```typescript
// Type guards
function isEventCard(card: Card): card is Card & { eventData: EventCardType } {
  return card.type === 'EVENT' && !!card.eventData;
}

function isTerrainCard(card: Card): card is Card & { terrainData: TerrainCardType } {
  return card.type === 'TERRAIN' && !!card.terrainData;
}

// Usage
if (isEventCard(card)) {
  console.log(card.eventData.eventType); // typed!
}
```

---

## Migration from Old Types

### Old Names → New Names
```
BBQ_DAD          → BBQ_DICKTATOR
FIX_IT_DAD       → FIX_IT_FUCKBOY
GOLF_DAD         → GOLF_GONAD
COUCH_DAD        → COUCH_CUMMANDER
LAWN_DAD         → LAWN_LUNATIC
CAR_DAD          → CAR_COCK
OFFICE_DAD       → OFFICE_ORGASMS
COOL_DAD         → COOL_CUCKS
COACH_DAD        → COACH_CUMSTERS
CHEF_DAD         → CHEF_CUMSTERS
HOLIDAY_DAD      → HOLIDAY_HORNDOGS
WAREHOUSE_DAD    → WAREHOUSE_WANKERS
VINTAGE_DAD      → VINTAGE_VAGABONDS
FASHION_DAD      → FASHION_FUCK
TECH_DAD         → TECH_TWATS
```

---

## Stats Reminder

The 8 card stats (CardStats interface):
```typescript
dadJoke       // Quality of terrible puns
grillSkill    // BBQ mastery level
fixIt         // Repair capabilities
napPower      // Ability to sleep anywhere
remoteControl // Channel surfing expertise
thermostat    // Temperature control obsession
sockSandal    // Fashion confidence
beerSnob      // Craft beer knowledge
```

---

## Rarity Tiers

```typescript
'common'    // Grey - Basic cards
'uncommon'  // Blue - Enhanced stats
'rare'      // Gold - Strong abilities
'epic'      // Purple - Premium animations
'legendary' // Orange - Full art
'mythic'    // Pink - Prismatic holo
```

---

## File Locations

- **Main Types:** `src/types/index.ts` (Lines 1-3856+)
- **Detailed Docs:** `TYPES_SUMMARY.md` (This directory)
- **Card Data:** `src/data/cards.json`
- **Database Layer:** `src/lib/cards/database.ts`
- **Pack Generator:** `src/lib/pack/generator.ts`

---

## Key Files That Use These Types

1. `src/stores/pack.ts` - Pack state management
2. `src/stores/deck.ts` - Deck building
3. `src/stores/collection.ts` - Card collection
4. `src/components/card/Card.svelte` - Card display
5. `src/components/battle/Battle.svelte` - Battle system
6. `src/lib/mechanics/combat.ts` - Combat logic

---

## Validation

```bash
# Verify TypeScript compilation
npx tsc --noEmit src/types/index.ts

# Run type tests
bun run test
```

✅ **All types verified and production-ready**

---

Generated: January 17, 2026  
Version: 1.0.0
