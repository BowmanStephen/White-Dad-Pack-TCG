# New Card Types Guide - DadDeck™ TCG Mechanics

**Document:** Comprehensive guide to EVENT, TERRAIN, EVOLUTION, CURSE, and TRAP card types  
**Audience:** Developers, game designers, content creators  
**Last Updated:** January 17, 2026

---

## 📖 Table of Contents

1. [EVENT Cards - SHITSHOW SCENARIOS](#event-cards--shitshow-scenarios)
2. [TERRAIN Cards - SUBURBAN SHITFIELDS](#terrain-cards--suburban-shitfields)
3. [EVOLUTION Cards - MIDLIFE CRISIS MUTATIONS](#evolution-cards--midlife-crisis-mutations)
4. [CURSE Cards - DAD DAMNATIONS](#curse-cards--dad-damnations)
5. [TRAP Cards - SUBURBAN SUCKERPUNCHES](#trap-cards--suburban-suckerpunches)
6. [Gameplay Examples](#gameplay-examples)
7. [Integration Notes](#integration-notes)

---

## EVENT Cards - SHITSHOW SCENARIOS

### Overview
EVENT cards are one-time-use cards that trigger specific effects. Inspired by Magic: The Gathering's Instants and Sorceries, these cards represent chaotic suburban events that affect the game state.

### Mechanics
- **Type:** One-time use (discarded after activation)
- **Timing:** Can be "instant" (any time) or "sorcery" (main phase only)
- **Target:** May require specific archetypes in play or affect all dads
- **Duration:** Instant effect (no lingering damage)
- **Stats:** No inherent stats (effect-based)

### Type Definition
```typescript
export interface EventCardType {
  effectType: 'instant' | 'sorcery';
  effect: CardEffect;
  targetRequirement?: string;
  flavorTrigger?: string;
}
```

### Examples

#### "BBQ Blowout Bonanza" (Rare EVENT)
```json
{
  "id": "EVENT_001",
  "name": "BBQ Blowout Bonanza",
  "subtitle": "Grillpocalypse Now",
  "type": "EVENT",
  "rarity": "rare",
  "eventData": {
    "effectType": "instant",
    "effect": {
      "type": "buff",
      "target": "all",
      "value": 30,
      "condition": "if BBQ_DICKTATOR in play",
      "duration": 1
    },
    "flavorTrigger": "The grill exploded and I jizzed fire!"
  },
  "flavorText": "Big Propane planned this shit!"
}
```

#### "Power Outage Orgasm" (Common EVENT)
```json
{
  "id": "EVENT_002",
  "name": "Power Outage Orgasm",
  "subtitle": "Grid Down, Dick Up",
  "type": "EVENT",
  "rarity": "common",
  "eventData": {
    "effectType": "sorcery",
    "effect": {
      "type": "debuff",
      "target": "opponent",
      "value": -20,
      "condition": "targeting TECH_TWATS",
      "duration": 1
    },
    "flavorTrigger": "Lights out, boner on!"
  },
  "flavorText": "Big Electric's cutting power for 5G mind control!"
}
```

### Display In Collection
- Shows effect description prominently
- Displays trigger/timing conditions
- No stats section (effect-based)
- Badge: ⚡ (Amber/Yellow)

### Pack Pull Odds
- Include in ~10% of packs
- Rarity-distributed (common to legendary)
- Limited to 1 EVENT per pack

---

## TERRAIN Cards - SUBURBAN SHITFIELDS

### Overview
TERRAIN cards modify the battlefield permanently until replaced. Inspired by Pokémon Stadium and Magic: The Gathering Lands, these cards affect how all dads in play perform.

### Mechanics
- **Type:** Persistent field effect
- **Duration:** Permanent (until replaced or game ends)
- **Scope:** Affects all dads or specific archetypes
- **Negative Effect:** Can penalize opponent archetypes
- **Replacement:** Can be replaced by another TERRAIN card
- **Stats:** No inherent stats
- **Activation Cost:** Optional (energy/resource cost)

### Type Definition
```typescript
export interface TerrainCardType {
  fieldEffect: CardEffect;
  affectedArchetypes?: DadType[];
  negativeEffectOnOpponents?: CardEffect;
  permanentUntilReplaced: boolean;
  activationCost?: number;
}
```

### Examples

#### "Backyard BBQ Battleground" (Rare TERRAIN)
```json
{
  "id": "TERRAIN_001",
  "name": "Backyard BBQ Battleground",
  "subtitle": "Propane Pussy Palace",
  "type": "TERRAIN",
  "rarity": "rare",
  "terrainData": {
    "fieldEffect": {
      "type": "buff",
      "target": "self",
      "value": 25,
      "condition": "BBQ_DICKTATOR dads only"
    },
    "affectedArchetypes": ["BBQ_DICKTATOR", "BBQ_BRAWLER"],
    "negativeEffectOnOpponents": {
      "type": "debuff",
      "target": "opponent",
      "value": -10
    },
    "permanentUntilReplaced": true
  },
  "flavorText": "My backyard's a grill orgy! Fuck Big Gas tryin' to ban my propane!"
}
```

#### "Cul-de-Sac Cum-Zone" (Uncommon TERRAIN)
```json
{
  "id": "TERRAIN_002",
  "name": "Cul-de-Sac Cum-Zone",
  "subtitle": "Suburban Sex Street",
  "type": "TERRAIN",
  "rarity": "uncommon",
  "terrainData": {
    "fieldEffect": {
      "type": "buff",
      "target": "self",
      "value": 20,
      "condition": "CAR_COCK dads only"
    },
    "affectedArchetypes": ["CAR_COCK"],
    "negativeEffectOnOpponents": {
      "type": "debuff",
      "target": "opponent",
      "value": -15
    },
    "permanentUntilReplaced": true
  },
  "flavorText": "I fuck my cul-de-sac raw! Tesla's got spy cams in every goddamn mailbox!"
}
```

### Display In Collection
- Shows active field effect prominently
- Lists affected archetypes
- Shows opponent penalty
- No stats section
- Badge: 🏘️ (Emerald/Green)

### Strategic Depth
- Building around field effects
- Terrain advantage matchups
- Terrain replacement strategy
- Synergy with archetype selection

---

## EVOLUTION Cards - MIDLIFE CRISIS MUTATIONS

### Overview
EVOLUTION cards upgrade a base DICKTATOR DAD into a more powerful version. Inspired by Pokémon Evolution, these cards create upgrade paths for your favorite dads.

### Mechanics
- **Type:** Upgrade card (replaces base dad)
- **Requirement:** Must have base dad in deck or play
- **Stat Boosts:** Inherits base stats + additions
- **New Abilities:** May include new special abilities
- **Flavor:** Story of the midlife crisis transformation
- **Rarity:** Generally higher rarity than base card
- **Stats:** Inherits and enhances base stats

### Type Definition
```typescript
export interface EvolutionCardType {
  evolvesFrom: string;           // Base card ID
  statBoosts: Partial<CardStats>; // Stat additions
  newAbilities: CardAbility[];   // New abilities
  transformationFlavor: string;  // Story
}
```

### Examples

#### "Grill God Gary" (Legendary EVOLUTION)
**Evolves from:** "Grill Master Gary the Groin-Griller" (ID: 001)

```json
{
  "id": "EVOLUTION_001",
  "name": "Grill God Gary",
  "subtitle": "Propane Panty-Melter",
  "type": "EVOLUTION",
  "rarity": "legendary",
  "stats": {
    "dadJoke": 85,        // Inherited from base
    "grillSkill": 100,    // Inherited + boosted
    "fixIt": 30,
    "napPower": 40,
    "remoteControl": 50,
    "thermostat": 60,
    "sockSandal": 70,
    "beerSnob": 75
  },
  "evolutionData": {
    "evolvesFrom": "001",
    "statBoosts": {
      "dadJoke": 30,
      "grillSkill": 30
    },
    "newAbilities": [
      {
        "name": "Inferno Ejaculation",
        "description": "+50 AOE fire damage, burns all opponent cards in play"
      }
    ],
    "transformationFlavor": "I fucked the grill into godhood! Big Burger King fears my flame!"
  },
  "flavorText": "Gary evolved through pure fucking propane dedication and manifested his ultimate grilling potential!"
}
```

#### "Recliner Rage Randy" (Epic EVOLUTION)
**Evolves from:** "Recliner Randy Nap-Nut"

```json
{
  "id": "EVOLUTION_002",
  "name": "Recliner Rage Randy",
  "subtitle": "Nap 'Til I Nut Nuke",
  "type": "EVOLUTION",
  "rarity": "epic",
  "evolutionData": {
    "evolvesFrom": "recliner_randy_id",
    "statBoosts": {
      "napPower": 30,
      "remoteControl": 20
    },
    "newAbilities": [
      {
        "name": "Snooze Nuke",
        "description": "+40 defense blast when damaged while napping"
      }
    ],
    "transformationFlavor": "Randy's nap power reached critical mass and created a nuclear defensive aura!"
  }
}
```

### Display In Collection
- Shows evolution chain/path
- Displays inherited base stats
- Shows stat boosts visually (+30 Stat)
- Lists new abilities with effects
- Badge: 🔄 (Purple)

### Strategic Depth
- Planning evolution chains
- Base card selection for evolution
- Upgrade timing in battles
- Archetype-specific evolution paths

---

## CURSE Cards - DAD DAMNATIONS

### Overview
CURSE cards apply negative effects to opponents that persist for a duration. Inspired by Magic: The Gathering's Curses and Enchantments, these cards are tools for psychological warfare.

### Mechanics
- **Type:** Persistent negative effect
- **Duration:** Lasts N turns (typically 2-5)
- **Scope:** Single opponent dad or all opponent dads
- **Removal:** May or may not be removable
- **Removal Condition:** If removable, specify how
- **Stats:** No inherent stats
- **Effects:** Always debuff/negative

### Type Definition
```typescript
export interface CurseCardType {
  target: 'single_dad' | 'all_opponents';
  effect: CardEffect;
  duration: number;
  canBeRemoved: boolean;
  removalCondition?: string;
}
```

### Examples

#### "Chemtrail Cock-Block" (Rare CURSE)
```json
{
  "id": "CURSE_001",
  "name": "Chemtrail Cock-Block",
  "subtitle": "Sky Sperm Suppression",
  "type": "CURSE",
  "rarity": "rare",
  "curseData": {
    "target": "single_dad",
    "effect": {
      "type": "debuff",
      "target": "opponent",
      "value": -30,
      "condition": "attack power reduced, grillSkill disabled",
      "duration": 3
    },
    "duration": 3,
    "canBeRemoved": true,
    "removalCondition": "If opponent plays TERRAIN card or uses removal effect"
  },
  "flavorText": "The sky's fucking my dick dry! Big Gov's spraying boner-killer clouds!"
}
```

#### "5G Shrink-Dick Signal" (Epic CURSE)
```json
{
  "id": "CURSE_002",
  "name": "5G Shrink-Dick Signal",
  "subtitle": "Tower Testicle Torture",
  "type": "CURSE",
  "rarity": "epic",
  "curseData": {
    "target": "all_opponents",
    "effect": {
      "type": "debuff",
      "target": "opponent",
      "value": -40,
      "condition": "remoteControl reduced for all TECH_TWATS",
      "duration": 2
    },
    "duration": 2,
    "canBeRemoved": false,
    "removalCondition": null
  },
  "flavorText": "5G towers zap my balls to bits! Verizon's castrating us with waves!"
}
```

### Display In Collection
- Shows curse effect and duration
- Displays removal condition (if any)
- Shows affected dads/archetypes
- No stats section
- Badge: 💀 (Red)

### Strategic Depth
- Timing curse application
- Stacking multiple curses
- Planning removal strategy
- Curse/anti-curse deck building

---

## TRAP Cards - SUBURBAN SUCKERPUNCHES

### Overview
TRAP cards are set face-down and trigger when specific conditions are met. Inspired by Yu-Gi-Oh! Trap Cards, these cards provide surprise mechanics and reactive gameplay.

### Mechanics
- **Type:** Face-down triggered effect
- **Trigger:** Activates on specific opponent action
- **Timing:** Reactive (opponent action triggered)
- **Duration:** One-time use (usually)
- **Setup:** Can be set face-down on field
- **Stats:** No inherent stats
- **Effects:** Can be positive or negative

### Type Definition
```typescript
export interface TrapCardType {
  trigger: 'on_attack' | 'on_card_play' | 'on_stat_boost' | 'on_end_of_turn';
  effect: CardEffect;
  faceDown: boolean;
  oneTimeUse: boolean;
}
```

### Examples

#### "Garage Sale Gangbang" (Rare TRAP)
```json
{
  "id": "TRAP_001",
  "name": "Garage Sale Gangbang",
  "subtitle": "Bargain Basement Boner",
  "type": "TRAP",
  "rarity": "rare",
  "trapData": {
    "trigger": "on_card_play",
    "effect": {
      "type": "control",
      "target": "opponent",
      "value": 1,
      "condition": "if opponent plays ITEM card"
    },
    "faceDown": true,
    "oneTimeUse": true
  },
  "flavorText": "I fucked your garage sale finds! eBay's a government pawn shop!"
}
```

#### "Dad Bod Butt-Bomb" (Uncommon TRAP)
```json
{
  "id": "TRAP_002",
  "name": "Dad Bod Butt-Bomb",
  "subtitle": "Gut Grenade Gasm",
  "type": "TRAP",
  "rarity": "uncommon",
  "trapData": {
    "trigger": "on_attack",
    "effect": {
      "type": "damage",
      "target": "opponent",
      "value": 50,
      "condition": "reflects 50% of attack damage",
      "duration": 0
    },
    "faceDown": true,
    "oneTimeUse": true
  },
  "flavorText": "My beer gut's a weapon, bitch! Big Fitness hides fat-melting chemtrails!"
}
```

### Display In Collection
- Shows trigger condition prominently
- Displays face-down status
- Shows effect on trigger
- Badge: 🪤 (Blue)

### Strategic Depth
- Trap placement strategy
- Baiting opponent actions
- Trap-heavy deck building
- Mind games with trap signals

---

## Gameplay Examples

### Example 1: EVENT Card in Action
```
Player's turn:
1. Has "BBQ Blowout Bonanza" (EVENT) in hand
2. Has "Grill Master Gary" on field (BBQ_DICKTATOR)
3. Plays EVENT instantly (doesn't cost turn action)
4. All BBQ dads gain +30 grillSkill for 1 turn
5. "BBQ Blowout Bonanza" discarded to graveyard
6. Opponent's turn continues
```

### Example 2: TERRAIN Card Strategy
```
Player 1's turn:
1. Plays "Backyard BBQ Battleground" (TERRAIN)
2. Field is now modified: BBQ dads get +25 grillSkill
3. Opponent non-BBQ dads get -10 stats

Player 2's turn:
1. Plays "Cul-de-Sac Cum-Zone" (TERRAIN)
2. Replaces previous terrain
3. Now CAR dads get +20 speed, others get -15 remoteControl
```

### Example 3: EVOLUTION Card Upgrade
```
Player's deck contains:
1. "Grill Master Gary" (base DICKTATOR DAD)
2. "Grill God Gary" (EVOLUTION of base)

When playing:
1. Put "Grill Master Gary" on field (level 1)
2. Later, play "Grill God Gary" 
3. Evolves "Grill Master Gary" → "Grill God Gary"
4. New stats inherited + boosted
5. New ability "Inferno Ejaculation" available
```

### Example 4: CURSE + TRAP Combo
```
Opponent's turn:
1. Opponent attacks with TECH dad
2. Your face-down "Dad Bod Butt-Bomb" triggers
3. Reflects 50% damage back to opponent

Later, you play:
1. "5G Shrink-Dick Signal" (CURSE)
2. All opponent TECH dads -40 remoteControl for 2 turns
3. Opponent cannot remove it (canBeRemoved: false)
```

---

## Integration Notes

### Pack Generation
- Include special card types in ~15-20% of packs
- Distribute by rarity (rarer types = higher rarity)
- Cap at 1 special card type per pack

### Battle System
- EVENT cards playable only during main phase
- TERRAIN cards replace previous terrain automatically
- EVOLUTION requires base card in deck
- CURSE persists until duration expires
- TRAP triggers on exact condition match

### Collection Display
- Filter by special card type
- Show badges in grid view
- Conditional detail panels based on type
- No stats display for stat-less types

### Deck Building
- Special card types can be included in decks
- Building constraints per type (e.g., max 1 active TERRAIN)
- Type-specific synergies with archetypes
- Evolution chains must include base card

---

## Summary Table

| Type | Badge | Color | Stats | Duration | Removal |
|------|-------|-------|-------|----------|---------|
| EVENT | ⚡ | Amber | ❌ | Instant | Single-use |
| TERRAIN | 🏘️ | Emerald | ❌ | Permanent | Replace |
| EVOLUTION | 🔄 | Purple | ✅ | Permanent | Discard |
| CURSE | 💀 | Red | ❌ | N turns | Varies |
| TRAP | 🪤 | Blue | ❌ | Triggered | Varies |

---

**Last Updated:** January 17, 2026  
**Status:** Complete & Production Ready
