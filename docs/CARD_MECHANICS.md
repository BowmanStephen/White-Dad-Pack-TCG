# Card Collecting & Pack Opening Mechanics

**Version:** 2.0.0  
**Last Updated:** January 17, 2026

This document details the complete card collecting and pack opening mechanics for DadDeck TCG, including rarity systems, pity mechanics, collection bonuses, trading, combat, deck building, and engagement loops.

---

## Table of Contents

1. [Pack Opening System](#1-pack-opening-system)
2. [Rarity Distribution](#2-rarity-distribution)
3. [Holographic System](#3-holographic-system)
4. [Pity & Bad Luck Protection](#4-pity--bad-luck-protection)
5. [Collection System](#5-collection-system)
6. [Card Crafting](#6-card-crafting)
7. [Card Upgrades](#7-card-upgrades)
8. [Batch Pack Opening](#8-batch-pack-opening)
9. [Pack Variants](#9-pack-variants)
10. [Trading System](#10-trading-system)
11. [Deck Building](#11-deck-building)
12. [Combat System](#12-combat-system)
13. [Daily Rewards](#13-daily-rewards)
14. [Achievement System](#14-achievement-system)
15. [Card Stats & Abilities](#15-card-stats--abilities)
16. [Dad Types & Synergies](#16-dad-types--synergies)
17. [Engagement Loops](#17-engagement-loops)
18. [Technical Implementation](#18-technical-implementation)

---

## 1. Pack Opening System

### 1.1 Standard Pack Structure

Every standard pack contains **6 cards** distributed across guaranteed slots:

| Slot | Guaranteed Rarity | Notes |
|------|-------------------|-------|
| 1-3 | Common (100%) | Always 3 common cards |
| 4-5 | Uncommon+ Pool | Probability-weighted selection |
| 6 | Rare+ Pool | Guaranteed rare or better |

### 1.2 Pack Opening State Machine

```
PackState Flow:
┌─────────────────────────────────────────────────────────────┐
│  'idle' → 'generating' → 'pack_animate' → 'cards_ready' →  │
│  'revealing' → 'results'                                    │
└─────────────────────────────────────────────────────────────┘
```

**State Descriptions:**

| State | Duration | Description |
|-------|----------|-------------|
| `idle` | - | Waiting for user to open pack |
| `generating` | 200-500ms | Pack being generated (with validation) |
| `pack_animate` | 2.5-4s | Pack tear animation playing |
| `cards_ready` | - | Cards ready to reveal |
| `revealing` | Variable | User revealing cards one by one |
| `results` | - | All cards revealed, showing summary |

### 1.3 Animation Phases

```javascript
// From PRD - Animation timing
PACK_ANIMATION_CONFIG = {
  phases: {
    appearance: { duration: 500, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
    glow: { duration: 1000, easing: 'ease-in-out' },
    rarityHint: { duration: 300, easing: 'ease-out' },
    tear: { duration: 800, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
    emerge: { duration: 500, easing: 'ease-out' }
  },
  skipEnabled: true,
  performanceMode: 'auto'
};
```

### 1.4 Skip Mechanics

Users can skip animations at any point:
- **Tap/Click during pack animation** → Fast-forward to card reveal
- **Skip to Results button** → Reveals all cards instantly
- **Auto-reveal mode** → Cards reveal automatically with 300ms delay

---

## 2. Rarity Distribution

### 2.1 Six-Tier Rarity System

| Rarity | Order | Color | Description |
|--------|-------|-------|-------------|
| Common | 0 | Grey (#9ca3af) | Basic cards, minimal effects |
| Uncommon | 1 | Blue (#60a5fa) | Enhanced stats, minor effects |
| Rare | 2 | Gold (#fbbf24) | Strong abilities, particle effects |
| Epic | 3 | Purple (#a855f7) | Premium animations, holo variants |
| Legendary | 4 | Orange (#f97316) | Full art, intense effects |
| Mythic | 5 | Pink (#ec4899) | Prismatic holo, maximum particles |

### 2.2 Slot Probabilities

**Slots 4-5 (Uncommon+ Pool):**
```
Uncommon:  74.0%
Rare:      20.0%
Epic:       5.0%
Legendary:  0.9%
Mythic:     0.1%
```

**Slot 6 (Rare+ Pool):**
```
Rare:      87.9%
Epic:      10.0%
Legendary:  1.99%
Mythic:     0.1%
```

### 2.3 Expected Pack Composition

Per 100 packs opened (600 cards total):
- ~300 Common (from slots 1-3)
- ~148 Uncommon
- ~128 Rare
- ~20 Epic
- ~3.8 Legendary
- ~0.4 Mythic

**Average pulls to hit:**
- Epic: ~30 packs
- Legendary: ~167 packs
- Mythic: ~1,500 packs

### 2.4 Rarity Visual Effects

```typescript
RARITY_CONFIG = {
  common: { particleCount: 0, animationIntensity: 1.0 },
  uncommon: { particleCount: 5, animationIntensity: 1.2 },
  rare: { particleCount: 10, animationIntensity: 1.5 },
  epic: { particleCount: 15, animationIntensity: 1.8 },
  legendary: { particleCount: 25, animationIntensity: 2.2 },
  mythic: { particleCount: 40, animationIntensity: 3.0 }
};
```

---

## 3. Holographic System

### 3.1 Holo Variant Types

| Variant | Probability | Restrictions |
|---------|-------------|--------------|
| None | 80% | - |
| Standard | 15% | Any rarity |
| Reverse | 3% | Any rarity |
| Full Art | 1.5% | Legendary+ only |
| Prismatic | 0.5% | Mythic only |

### 3.2 Holo Distribution Logic

```typescript
// From generator.ts - rollHolo function
function rollHolo(rarity: Rarity, rng: SeededRandom): HoloVariant {
  const roll = rng.next();
  
  if (roll < 0.80) return 'none';        // 80% no holo
  if (roll < 0.95) return 'standard';    // 15% standard
  if (roll < 0.98) return 'reverse';     // 3% reverse
  
  // Full art (1.5%) - legendary+ only
  if (roll < 0.995) {
    if (rarity === 'legendary' || rarity === 'mythic') {
      return 'full_art';
    }
    return 'reverse'; // Fall through
  }
  
  // Prismatic (0.5%) - mythic only
  if (rarity === 'mythic') return 'prismatic';
  if (rarity === 'legendary') return 'full_art';
  return 'reverse'; // Fall through
}
```

### 3.3 Holo Visual Effects

| Variant | Effect Description |
|---------|-------------------|
| Standard | Basic rainbow sheen, responds to tilt/mouse |
| Reverse | Holo background, non-holo artwork |
| Full Art | Extended artwork with holo border |
| Prismatic | Rainbow cascade effect, maximum shimmer |

---

## 4. Pity & Bad Luck Protection

### 4.1 Pity System Overview

The pity system protects players from extended bad luck streaks by guaranteeing higher rarity pulls after a threshold.

**Recommended Implementation:**

```typescript
interface PityCounter {
  packsSinceEpic: number;      // Reset when Epic+ pulled
  packsSinceLegendary: number; // Reset when Legendary+ pulled
  packsSinceMythic: number;    // Reset when Mythic pulled
  packsSinceHolo: number;      // Reset when any Holo pulled
}

const PITY_THRESHOLDS = {
  epic: 50,        // Guaranteed Epic+ after 50 packs
  legendary: 200,  // Guaranteed Legendary+ after 200 packs
  mythic: 500,     // Guaranteed Mythic after 500 packs
  holo: 10,        // Guaranteed Holo after 10 packs
};
```

### 4.2 Pity Trigger Logic

```typescript
function applyPitySystem(pack: Pack, pity: PityCounter): Pack {
  // Check pity thresholds in order of rarity
  if (pity.packsSinceMythic >= PITY_THRESHOLDS.mythic) {
    // Force upgrade one card to Mythic
    upgradeRandomCardToRarity(pack, 'mythic');
    resetPityCounter(pity, 'mythic');
  } else if (pity.packsSinceLegendary >= PITY_THRESHOLDS.legendary) {
    upgradeRandomCardToRarity(pack, 'legendary');
    resetPityCounter(pity, 'legendary');
  } else if (pity.packsSinceEpic >= PITY_THRESHOLDS.epic) {
    upgradeRandomCardToRarity(pack, 'epic');
    resetPityCounter(pity, 'epic');
  }
  
  // Holo pity (separate system)
  if (pity.packsSinceHolo >= PITY_THRESHOLDS.holo) {
    forceHoloOnRandomCard(pack);
    pity.packsSinceHolo = 0;
  }
  
  return pack;
}
```

### 4.3 Soft Pity (Increasing Odds)

Before hard pity triggers, implement "soft pity" that gradually increases odds:

```typescript
const SOFT_PITY_CONFIG = {
  epic: {
    startAt: 30,           // Start increasing at 30 packs
    hardPity: 50,          // Guarantee at 50 packs
    increasePerPack: 0.02  // +2% per pack after soft pity
  },
  legendary: {
    startAt: 150,
    hardPity: 200,
    increasePerPack: 0.005 // +0.5% per pack
  }
};

function getSoftPityBonus(packsSince: number, config: SoftPityConfig): number {
  if (packsSince < config.startAt) return 0;
  const overflow = packsSince - config.startAt;
  return overflow * config.increasePerPack;
}
```

### 4.4 Pity Display UI

Show players their pity progress transparently:

```
┌─────────────────────────────────────────┐
│ Your Luck Meter                         │
├─────────────────────────────────────────┤
│ Epic Pity:      ████████░░ 42/50 (84%)  │
│ Legendary Pity: ███░░░░░░░ 67/200 (34%) │
│ Mythic Pity:    █░░░░░░░░░ 89/500 (18%) │
│ Holo Pity:      ███████░░░ 7/10 (70%)   │
└─────────────────────────────────────────┘
```

---

## 5. Collection System

### 5.1 Collection State

```typescript
interface Collection {
  packs: Pack[];
  metadata: {
    totalPacksOpened: number;
    lastOpenedAt: Date | null;
    uniqueCards: string[];     // Card IDs (not instances)
    rarePulls: number;         // Rare+ count
    holoPulls: number;
    rarityCounts: Record<Rarity, number>;
    created: Date;
  };
}
```

### 5.2 Collection Statistics

Automatically tracked stats:

| Stat | Description |
|------|-------------|
| `totalPacks` | Total packs opened all-time |
| `totalCards` | Total cards in collection |
| `uniqueCards` | Distinct card types owned |
| `rarePulls` | Cards Rare or better |
| `holoPulls` | Holographic cards total |
| `completionRate` | % of card catalog collected |

### 5.3 Duplicate Tracking

Each card instance is tracked separately:

```typescript
// Get all copies of a specific card
function getCardInstances(packs: Pack[], cardId: string): PackCard[] {
  const instances: PackCard[] = [];
  for (const pack of packs) {
    for (const card of pack.cards) {
      if (card.id === cardId) {
        instances.push(card);
      }
    }
  }
  return instances;
}

// Count duplicates (instances - 1)
function getDuplicateCount(packs: Pack[], cardId: string): number {
  return getCardInstances(packs, cardId).length - 1;
}
```

### 5.4 Collection Completion Bonuses

**Tier Rewards:**

| Completion % | Reward |
|--------------|--------|
| 25% | "Quarter Collector" badge + 5 bonus packs |
| 50% | "Half-Way Dad" badge + 10 bonus packs |
| 75% | "Serious Collector" badge + 15 bonus packs |
| 100% | "Complete Dad" badge + Exclusive Mythic |

**Set Completion Bonuses:**

| Achievement | Reward |
|-------------|--------|
| All Commons | "Common Sense" badge |
| All Uncommons | "Uncommon Effort" badge |
| All Rares | "Rare Enthusiast" badge |
| All Epics | "Epic Journey" badge |
| All Legendaries | "Legendary Status" badge |
| All Mythics | "Mythical Achievement" badge |
| All Holos | "Holo Hunter" badge |

### 5.5 Collection Value Calculation

```typescript
const RARITY_VALUES = {
  common: 1,
  uncommon: 5,
  rare: 25,
  epic: 100,
  legendary: 500,
  mythic: 2500
};

const HOLO_MULTIPLIERS = {
  none: 1.0,
  standard: 1.5,
  reverse: 2.0,
  full_art: 5.0,
  prismatic: 10.0
};

function calculateCardValue(card: PackCard): number {
  const baseValue = RARITY_VALUES[card.rarity];
  const holoMultiplier = HOLO_MULTIPLIERS[card.holoType];
  return baseValue * holoMultiplier;
}

function calculateCollectionValue(collection: Collection): number {
  return collection.packs.reduce((total, pack) => {
    return total + pack.cards.reduce((packTotal, card) => {
      return packTotal + calculateCardValue(card);
    }, 0);
  }, 0);
}
```

---

## 6. Card Crafting

### 6.1 Crafting Overview

Players can combine duplicate cards to craft higher-rarity cards.

### 6.2 Crafting Recipes

| Recipe | Input | Output | Success Rate |
|--------|-------|--------|--------------|
| Common → Uncommon | 5 Common | 1 Uncommon | 100% |
| Uncommon → Rare | 5 Uncommon | 1 Rare | 100% |
| Rare → Epic | 5 Rare | 1 Epic | 50% |
| Epic → Legendary | 5 Epic | 1 Legendary | 50% |
| Legendary → Mythic | 5 Legendary | 1 Mythic | 25% |

### 6.3 Failure Protection

When high-tier crafts fail:

| Recipe | Fail Return Rate | Cards Returned |
|--------|------------------|----------------|
| Rare → Epic | 60% | 3 of 5 cards |
| Epic → Legendary | 40% | 2 of 5 cards |
| Legendary → Mythic | 20% | 1 of 5 cards |

### 6.4 Crafting Flow

```
┌──────────────────────────────────────────────────────────────┐
│ 1. Select Recipe                                             │
│    ↓                                                         │
│ 2. Select Input Cards (5 of matching rarity)                 │
│    ↓                                                         │
│ 3. Confirm (show success rate & fail protection)             │
│    ↓                                                         │
│ 4. Animation (3 seconds)                                     │
│    ↓                                                         │
│ 5a. SUCCESS: Reveal new card with celebration                │
│ 5b. FAILURE: Show returned cards (if any)                    │
└──────────────────────────────────────────────────────────────┘
```

### 6.5 Crafting Holo Bonus

Crafted cards have a 10% chance to be Holo (vs 20% from packs):

```typescript
function generateCraftedCard(rarity: Rarity): PackCard {
  const isHolo = Math.random() < 0.1; // 10% holo chance
  
  let holoType: HoloVariant = 'none';
  if (isHolo) {
    if (rarity === 'mythic') holoType = 'prismatic';
    else if (rarity === 'legendary') holoType = 'full_art';
    else holoType = Math.random() < 0.5 ? 'reverse' : 'standard';
  }
  
  return { ...baseCard, isHolo, holoType };
}
```

---

## 7. Card Upgrades

### 7.1 Upgrade System Overview

Consume duplicate cards to permanently boost a card's stats.

### 7.2 Upgrade Configuration

```typescript
DEFAULT_UPGRADE_CONFIG = {
  maxLevel: 3,           // Maximum upgrade level
  costPerLevel: 5,       // Duplicates required per upgrade
  statIncreasePerLevel: 5 // +5 to all stats per level
};
```

### 7.3 Upgrade Effects

| Level | Cost | Stat Bonus | Visual Change |
|-------|------|------------|---------------|
| 0 → 1 | 5 cards | +5 all stats | Bronze border |
| 1 → 2 | 5 cards | +10 all stats | Silver border |
| 2 → 3 | 5 cards | +15 all stats | Gold border |

### 7.4 Upgrade Validation

```typescript
function validateUpgrade(
  packs: Pack[],
  cardId: string,
  currentLevel: number
): { valid: boolean; reason?: string } {
  // Check max level
  if (currentLevel >= 3) {
    return { valid: false, reason: 'Card is already at maximum level (3)' };
  }
  
  // Check duplicate count
  const duplicateCount = countCardDuplicates(packs, cardId);
  if (duplicateCount < 5) {
    return { 
      valid: false, 
      reason: `Need 5 duplicates to upgrade, only have ${duplicateCount}` 
    };
  }
  
  return { valid: true };
}
```

### 7.5 Stat Calculation

```typescript
function calculateUpgradedStats(
  baseStats: CardStats,
  level: number
): CardStats {
  const bonus = level * 5; // +5 per level
  
  return {
    dadJoke: Math.min(100, baseStats.dadJoke + bonus),
    grillSkill: Math.min(100, baseStats.grillSkill + bonus),
    fixIt: Math.min(100, baseStats.fixIt + bonus),
    napPower: Math.min(100, baseStats.napPower + bonus),
    remoteControl: Math.min(100, baseStats.remoteControl + bonus),
    thermostat: Math.min(100, baseStats.thermostat + bonus),
    sockSandal: Math.min(100, baseStats.sockSandal + bonus),
    beerSnob: Math.min(100, baseStats.beerSnob + bonus),
  };
}
```

---

## 8. Batch Pack Opening

### 8.1 Batch Configuration

```typescript
interface BatchConfig {
  totalPacks: number;  // 1-50 packs
  fastForward: boolean; // Skip animations
  autoSave: boolean;    // Auto-save to collection
}
```

### 8.2 Batch State Machine

```
BatchState Flow:
┌──────────────────────────────────────────────────────────────┐
│ 'idle' → 'preparing' → 'opening' → 'complete' → 'reviewing' │
│                           ↓                                  │
│                       'paused' (if cancelled)                │
└──────────────────────────────────────────────────────────────┘
```

### 8.3 Batch Progress Tracking

```typescript
interface BatchProgress {
  currentPack: number;   // Current pack being opened
  totalPacks: number;    // Total packs to open
  cardsOpened: number;   // Cards revealed so far
  totalCards: number;    // Total cards to reveal
  percentage: number;    // 0-100 progress
}
```

### 8.4 Batch Summary

After completion, users see:

```
┌───────────────────────────────────────────────────┐
│ BATCH COMPLETE - 10 Packs Opened!                │
├───────────────────────────────────────────────────┤
│ Total Cards: 60                                   │
│                                                   │
│ Rarity Breakdown:                                 │
│   Common:    30 (50.0%)                          │
│   Uncommon:  15 (25.0%)                          │
│   Rare:      12 (20.0%)                          │
│   Epic:       2 (3.3%)                           │
│   Legendary:  1 (1.7%)                           │
│   Mythic:     0 (0.0%)                           │
│                                                   │
│ Holos: 8 (13.3%)                                 │
│                                                   │
│ Best Pulls:                                       │
│   1. Legendary BBQ Dad (Full Art Holo)           │
│   2. Epic Fix-It Dad (Reverse Holo)              │
│   3. Rare Golf Dad (Standard Holo)               │
│                                                   │
│ Duration: 12.4 seconds                           │
└───────────────────────────────────────────────────┘
```

### 8.5 Review Mode

After batch completion, users can:
- Browse through individual packs
- Navigate with arrow keys or swipe
- See detailed stats per pack
- Share individual notable pulls

---

## 9. Pack Variants

### 9.1 Standard Pack Designs

| Design | Probability | Visual Theme |
|--------|-------------|--------------|
| Standard | 80% | Blue gradient, default |
| Holiday | 15% | Festive seasonal theme |
| Premium | 5% | Gold foil pattern |

### 9.2 Season Packs

Season-specific packs with themed designs:

| Season | Design | Theme |
|--------|--------|-------|
| Base Set | `base_set` | Blue, classic |
| Summer BBQ | `summer_bbq` | Red/orange, fire |
| Fall Foliage | `fall_foliage` | Orange/brown, leaves |
| Winter Wonderland | `winter_wonderland` | Blue/white, snow |
| Spring Bloom | `spring_bloom` | Green/pink, flowers |

### 9.3 Special Pack Types (Future)

| Pack Type | Cards | Special Rules |
|-----------|-------|---------------|
| Premium Pack | 6 | Guaranteed Epic+ in slot 6 |
| Legendary Pack | 6 | Guaranteed Legendary+ in slot 6 |
| Mythic Pack | 6 | Guaranteed Mythic in slot 6 |
| All-Holo Pack | 6 | Every card is Holographic |
| Type Pack | 6 | All cards of specific Dad Type |

### 9.4 Event Packs

Limited-time packs during events:

| Event | Duration | Bonus |
|-------|----------|-------|
| Father's Day | 1 week | 2x Legendary rate |
| Super Bowl | 3 days | Coach Dad guaranteed |
| Thanksgiving | 1 week | Holiday design 100% |
| Black Friday | 1 day | 3x all rates |

---

## 10. Trading System

### 10.1 Trade Overview

Players can create trade offers to exchange cards with others via shareable links.

### 10.2 Trade Configuration

```typescript
const DEFAULT_TRADE_CONFIG = {
  maxCardsPerSide: 6,      // Max 6 cards offered/requested
  tradeExpirationDays: 7,   // Trades expire after 7 days
  maxActiveTrades: 10,      // Max 10 pending trades at once
};
```

### 10.3 Trade States

| State | Description |
|-------|-------------|
| `pending` | Trade created, awaiting response |
| `accepted` | Trade completed successfully |
| `rejected` | Trade declined by recipient |
| `cancelled` | Trade cancelled by creator |
| `expired` | Trade exceeded 7-day limit |

### 10.4 Trade Flow

```
┌──────────────────────────────────────────────────────────────┐
│ TRADE CREATION FLOW                                          │
├──────────────────────────────────────────────────────────────┤
│ 1. Start New Trade                                           │
│    ↓                                                         │
│ 2. Select Cards to Offer (from your collection, max 6)       │
│    ↓                                                         │
│ 3. Specify Cards You Want (max 6)                            │
│    ↓                                                         │
│ 4. Add Optional Message                                      │
│    ↓                                                         │
│ 5. Generate Shareable Link                                   │
│    ↓                                                         │
│ 6. Share via Discord/Twitter/Copy Link                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ TRADE RESPONSE FLOW                                          │
├──────────────────────────────────────────────────────────────┤
│ 1. Click Shared Trade Link                                   │
│    ↓                                                         │
│ 2. View Trade Details (offered vs requested cards)           │
│    ↓                                                         │
│ 3. Accept or Reject                                          │
│    ↓                                                         │
│ 4a. ACCEPT: Cards transferred, added to history              │
│ 4b. REJECT: Trade marked declined, creator notified          │
└──────────────────────────────────────────────────────────────┘
```

### 10.5 Trade Fairness Calculation

```typescript
function calculateTradeFairness(offered: TradeCard[], requested: TradeCard[]): {
  fairnessScore: number;  // 0-100, 50 = perfectly fair
  assessment: 'unfair_to_sender' | 'fair' | 'unfair_to_receiver';
} {
  const offeredValue = offered.reduce((sum, card) => 
    sum + calculateCardValue(card), 0);
  const requestedValue = requested.reduce((sum, card) => 
    sum + calculateCardValue(card), 0);
  
  const ratio = offeredValue / requestedValue;
  
  if (ratio < 0.7) return { fairnessScore: 20, assessment: 'unfair_to_sender' };
  if (ratio > 1.3) return { fairnessScore: 80, assessment: 'unfair_to_receiver' };
  return { fairnessScore: 50, assessment: 'fair' };
}
```

### 10.6 Trade History

All completed trades are logged:

```typescript
interface TradeHistoryEntry {
  id: string;
  completedAt: Date;
  partnerName: string;
  givenCards: TradeCard[];
  receivedCards: TradeCard[];
  status: 'accepted' | 'rejected';
}
```

---

## 11. Deck Building

### 11.1 Deck Rules

| Rule | Value |
|------|-------|
| Max decks per user | 10 |
| Min cards per deck | 1 |
| Max copies per card | 4 |
| Deck name max length | 50 characters |
| Description max length | 200 characters |

### 11.2 Deck State

```typescript
interface Deck {
  id: string;
  name: string;
  description?: string;
  cards: DeckCard[];       // Cards with counts
  createdAt: Date;
  updatedAt: Date;
  stats: DeckStats;        // Computed statistics
}

interface DeckCard {
  cardId: string;
  card: Card;
  count: number;           // 1-4 copies
}
```

### 11.3 Deck Statistics

Automatically calculated for each deck:

```typescript
interface DeckStats {
  totalCards: number;      // Including duplicates
  uniqueCards: number;     // Distinct card types
  rarityBreakdown: Record<Rarity, number>;
  typeBreakdown: Record<DadType, number>;
  statTotal: CardStats;    // Sum of all card stats
  averageStats: CardStats; // Average stats per card
}
```

### 11.4 Deck Validation

```typescript
function validateDeck(deck: Deck, existingDecks: Deck[]): DeckValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Name validation
  if (!deck.name || deck.name.trim().length === 0) {
    errors.push('Deck name is required');
  }

  // Card count validation
  if (deck.cards.length === 0) {
    errors.push('Deck must contain at least 1 card');
  }

  // Check for exceeding 4 copies
  const cardCounts = new Map<string, number>();
  for (const deckCard of deck.cards) {
    const current = cardCounts.get(deckCard.cardId) || 0;
    cardCounts.set(deckCard.cardId, current + deckCard.count);
    
    if (current + deckCard.count > 4) {
      errors.push(`Card "${deckCard.card.name}" exceeds maximum of 4 copies`);
    }
  }

  // Deck limit warning
  if (existingDecks.length >= 10 && !existingDecks.find(d => d.id === deck.id)) {
    warnings.push('Maximum of 10 decks reached');
  }

  return { isValid: errors.length === 0, errors, warnings };
}
```

### 11.5 Deck Building Strategies

**Type-Focused Decks:**
| Strategy | Cards | Synergy Bonus |
|----------|-------|---------------|
| BBQ Alliance | 4+ BBQ_DAD + CHEF_DAD | +30% Grill Skill |
| Suburban Dream | LAWN_DAD + CAR_DAD + WAREHOUSE_DAD | +20% all stats |
| Office Dynasty | OFFICE_DAD + TECH_DAD | +25% Remote Control |
| Cool Kids | COOL_DAD + FASHION_DAD | +15% Dad Joke |

**Stat-Focused Decks:**
| Strategy | Target | Effect |
|----------|--------|--------|
| Max Grill | Stack grillSkill | Burn damage focus |
| Nap Meta | Stack napPower | Defense/sustain |
| Joke Master | Stack dadJoke | Psychological damage |

---

## 12. Combat System

### 12.1 Combat Overview

Cards can battle using their stats and abilities. Combat uses a turn-based system with type advantages.

### 12.2 Power Calculation

```typescript
function calculateCardPower(card: Card): number {
  const stats = Object.values(card.stats);
  const average = stats.reduce((a, b) => a + b, 0) / stats.length;

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
```

### 12.3 Type Advantages

Certain Dad Types have advantages over others:

```
BBQ_DAD      → beats → COUCH_DAD, CHEF_DAD
FIX_IT_DAD   → beats → CAR_DAD, WAREHOUSE_DAD  
GOLF_DAD     → beats → COOL_DAD, COACH_DAD
COUCH_DAD    → beats → OFFICE_DAD, COACH_DAD
LAWN_DAD     → beats → FASHION_DAD, COUCH_DAD
CAR_DAD      → beats → FIX_IT_DAD, VINTAGE_DAD
OFFICE_DAD   → beats → COUCH_DAD, TECH_DAD
COOL_DAD     → beats → GOLF_DAD, VINTAGE_DAD
COACH_DAD    → beats → COUCH_DAD, LAWN_DAD
CHEF_DAD     → beats → BBQ_DAD, COUCH_DAD
HOLIDAY_DAD  → beats → LAWN_DAD, FASHION_DAD
WAREHOUSE_DAD → beats → CAR_DAD, FIX_IT_DAD
VINTAGE_DAD  → beats → TECH_DAD, COOL_DAD
FASHION_DAD  → beats → COOL_DAD, OFFICE_DAD
TECH_DAD     → beats → OFFICE_DAD, VINTAGE_DAD
```

**Multipliers:**
- Advantage: 1.5x damage
- Disadvantage: 0.75x damage
- Neutral: 1.0x damage

### 12.4 Status Effects

| Effect | Duration | Impact |
|--------|----------|--------|
| `grilled` | 2 turns | -10% grillSkill, -5% fixIt |
| `lectured` | 2 turns | -15% dadJoke, +10% thermostat |
| `awkward` | 2 turns | -20% dadJoke, +10% sockSandal |
| `drunk` | 3 turns | +30% beerSnob, -40% fixIt, -20% grillSkill |
| `bored` | 2 turns | +20% napPower, +15% remoteControl |
| `inspired` | 3 turns | +15% dadJoke, +10% grillSkill |

### 12.5 Battle Simulation

```typescript
function simulateBattle(attacker: Card, defender: Card): BattleResult {
  let attackerHP = calculateCardPower(attacker) * 10;
  let defenderHP = calculateCardPower(defender) * 10;
  let turns = 0;
  const maxTurns = 10;
  const log: string[] = [];

  while (attackerHP > 0 && defenderHP > 0 && turns < maxTurns) {
    turns++;
    
    // Attacker attacks
    const result = executeAbility(attacker, defender);
    const typeAdv = getTypeAdvantage(attacker.type, defender.type);
    let damage = Math.floor(result.damage * typeAdv);
    
    defenderHP -= damage;
    
    if (defenderHP <= 0) break;
    
    // Defender counter-attacks
    const counterResult = executeAbility(defender, attacker);
    const counterTypeAdv = getTypeAdvantage(defender.type, attacker.type);
    let counterDamage = Math.floor(counterResult.damage * counterTypeAdv);
    
    attackerHP -= counterDamage;
  }

  return {
    winner: attackerHP > defenderHP ? attacker : defender,
    loser: attackerHP > defenderHP ? defender : attacker,
    turns,
    log,
  };
}
```

### 12.6 Card Synergies

Special bonuses when certain cards are paired:

| Synergy Name | Cards Required | Bonus |
|--------------|----------------|-------|
| Mythic Alliance | 2 Mythic cards | 2.0x damage |
| BBQ Alliance | BBQ_DAD + CHEF_DAD | 1.3x damage |
| Suburban Dream | LAWN_DAD + CAR_DAD + WAREHOUSE_DAD | 1.3x all stats |
| Couch Potato Crew | Multiple COUCH_DAD | Infinite Nap buff |

---

## 13. Daily Rewards

### 13.1 7-Day Reward Cycle

| Day | Reward Type | Value | Description |
|-----|-------------|-------|-------------|
| 1 | pack | 1 | 1 Standard Pack |
| 2 | pack | 1 | 1 Standard Pack |
| 3 | cards | 3 | 3 Bonus Cards |
| 4 | pack | 1 | 1 Standard Pack |
| 5 | boosted_pack | 1 | 1 Boosted Pack (better odds) |
| 6 | pack | 2 | 2 Standard Packs |
| 7 | boosted_pack | 1 | 1 Premium Pack (rare+ guaranteed) |

### 13.2 Streak Bonuses

| Streak Length | Multiplier | Description |
|---------------|------------|-------------|
| 7 days | 1.0x | Weekly streak complete |
| 14 days | 1.2x | 2-week streak: 20% bonus |
| 30 days | 1.5x | 30-day streak: 50% bonus |
| 100 days | 2.0x | 100-day legend: 2x rewards |

### 13.3 Streak Logic

```typescript
function initializeDailyRewards(): void {
  const state = dailyRewards.get();
  const today = getStartOfToday();

  if (!state.lastLoginDate) {
    // First time user
    initializeNewUser();
    return;
  }

  const daysSinceLastLogin = getDaysBetween(state.lastLoginDate, today);

  if (daysSinceLastLogin === 1) {
    // Consecutive day - increment streak
    incrementStreak();
  } else if (daysSinceLastLogin > 1) {
    // Missed a day - reset streak
    resetStreak();
  }
  // Same day - no changes
}
```

### 13.4 Claim Mechanics

- **Claim Window:** Reward available at midnight local time
- **Countdown Timer:** Shows HH:MM:SS until next claim
- **Auto-Notification:** Browser push when reward ready
- **Streak Preservation:** 24-hour grace period before reset

---

## 14. Achievement System

### 14.1 Achievement Categories

| Category | Icon | Focus |
|----------|------|-------|
| Opening | 📦 | Pack milestones |
| Collection | 📚 | Unique card goals |
| Rare | ✨ | Rarity-specific pulls |
| Holo | 🌈 | Holographic collection |
| Variety | 🎯 | Type completion |
| Daily | 📅 | Login streaks |

### 14.2 Achievement Rarities

| Rarity | Color | Difficulty |
|--------|-------|------------|
| Bronze | #cd7f32 | Easy |
| Silver | #c0c0c0 | Medium |
| Gold | #ffd700 | Hard |
| Platinum | #e5e4e2 | Expert |

### 14.3 Complete Achievement List

**Pack Opening Achievements:**
| ID | Name | Requirement | Rarity |
|----|------|-------------|--------|
| first_pack | First Pack | Open 1 pack | Bronze |
| ten_packs | Pack Enthusiast | Open 10 packs | Silver |
| fifty_packs | Dedicated Dad | Open 50 packs | Gold |
| hundred_packs | Dedicated | Open 100 packs | Platinum |

**Collection Achievements:**
| ID | Name | Requirement | Rarity |
|----|------|-------------|--------|
| collector | Collector | Own 25 unique cards | Silver |
| master_collector | Master Collector | Own 50 unique cards | Gold |

**Rarity Achievements:**
| ID | Name | Requirement | Rarity |
|----|------|-------------|--------|
| rare_pull | Rare Find | Pull a Rare+ card | Bronze |
| epic_pull | Epic Discovery | Pull an Epic card | Silver |
| legendary_pull | Legendary Hunter | Pull a Legendary card | Gold |
| mythic_hunter | Mythic Hunter | Pull a Mythic card | Platinum |

**Holo Achievements:**
| ID | Name | Requirement | Rarity |
|----|------|-------------|--------|
| holo_collector | Holo Collector | Pull 10 holo cards | Silver |
| holo_master | Holo Master | Pull 25 holo cards | Gold |

**Daily Streak Achievements:**
| ID | Name | Requirement | Rarity |
|----|------|-------------|--------|
| daily_streak_3 | Consistent Dad | 3-day streak | Bronze |
| daily_streak_7 | Weekly Warrior | 7-day streak | Silver |
| daily_streak_14 | Dedicated Dad | 14-day streak | Gold |
| daily_streak_30 | Monthly Master | 30-day streak | Platinum |
| daily_rewards_10 | Reward Collector | Claim 10 rewards | Bronze |
| daily_rewards_50 | Reward Hoarder | Claim 50 rewards | Gold |

### 14.4 Achievement Unlock Flow

```typescript
function checkAndUnlockAchievements(context: AchievementContext): Achievement[] {
  const newlyUnlocked: Achievement[] = [];

  for (const [id, definition] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
    // Skip if already unlocked
    if (isAchievementUnlocked(id)) continue;

    // Check if condition is met
    if (definition.checkCondition(context)) {
      const result = unlockAchievement(id);
      if (result.unlocked && result.achievement) {
        newlyUnlocked.push(result.achievement);
        // Show notification popup
        notifyAchievementUnlocked(result.achievement);
      }
    }

    // Update progress for progressive achievements
    if (definition.getProgress && !isAchievementUnlocked(id)) {
      const progress = definition.getProgress(context);
      updateAchievementProgress(id, progress);
    }
  }

  return newlyUnlocked;
}
```

### 14.5 Achievement Notifications

When unlocked, achievements show:
- **Toast notification** with icon and name
- **Sound effect** (if enabled)
- **Badge added** to profile
- **Analytics event** tracked

---

## 15. Card Stats & Abilities

### 15.1 Eight Card Stats

| Stat | Icon | Description | Combat Use |
|------|------|-------------|------------|
| dadJoke | 👔 | Quality of terrible puns | Psychic damage |
| grillSkill | 🔥 | BBQ mastery level | Burn damage |
| fixIt | 🛠️ | Repair capabilities | Defense |
| napPower | 😴 | Sleep anywhere ability | Sustain/healing |
| remoteControl | 📺 | Channel surfing expertise | Control effects |
| thermostat | 🎯 | Temperature obsession | Resource management |
| sockSandal | 🧦 | Fashion confidence | Intimidation |
| beerSnob | 🍺 | Craft beer knowledge | Buff effects |

### 15.2 Stat Ranges

- **Minimum:** 0
- **Maximum:** 100
- **Average (Common):** 30-50
- **Average (Mythic):** 70-95

### 15.3 Stat Impact on Combat

```typescript
function calculateDamage(
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

  // Critical hit chance (10% base + 1% per 10 stat)
  const critChance = 0.1 + (attackPower / 1000);
  if (Math.random() < critChance) {
    damage = Math.floor(damage * 2);
  }

  return Math.max(1, damage);
}
```

### 15.4 Card Abilities

Each card has 1-3 abilities:

```typescript
interface CardAbility {
  name: string;
  description: string;
}

// Example abilities
const SAMPLE_ABILITIES = [
  { name: "Perfect Sear", description: "Flip a burger. If rare, gain +10 Grill Skill" },
  { name: "Dad Joke Barrage", description: "Tell 3 terrible jokes. -5 opponent morale each" },
  { name: "Power Nap", description: "Restore 20 HP, skip next turn" },
  { name: "Thermostat Lock", description: "Opponent cannot adjust stats for 2 turns" },
];
```

### 15.5 Ability Stat Mapping

Abilities automatically map to stats based on keywords:

| Keyword in Name | Uses Stat |
|-----------------|-----------|
| Grill | grillSkill |
| Fix | fixIt |
| Nap | napPower |
| Remote | remoteControl |
| Thermostat | thermostat |
| Sock | sockSandal |
| Beer | beerSnob |
| Joke | dadJoke |

---

## 16. Dad Types & Synergies

### 16.1 All 16 Dad Types

| Type | Icon | Specialty | Flavor |
|------|------|-----------|--------|
| BBQ_DAD | 🔥 | Grill Skill | "The flame keeper" |
| FIX_IT_DAD | 🛠️ | Fix-It | "Can repair anything" |
| GOLF_DAD | ⛳ | Strategy | "Always on the green" |
| COUCH_DAD | 📺 | Defense | "Professional napper" |
| LAWN_DAD | 🌱 | Endurance | "Grass doesn't mow itself" |
| CAR_DAD | 🚗 | Speed | "Weekend warrior" |
| OFFICE_DAD | 👔 | Control | "Meetings in progress" |
| COOL_DAD | 🎸 | Charisma | "Still got it" |
| COACH_DAD | 🏆 | Leadership | "Winning is everything" |
| CHEF_DAD | 👨‍🍳 | Skill | "Master of the kitchen" |
| HOLIDAY_DAD | 🎄 | Festive | "Deck the halls" |
| WAREHOUSE_DAD | 📦 | Bulk | "Costco champion" |
| VINTAGE_DAD | 🔧 | Experience | "Back in my day" |
| FASHION_DAD | 👟 | Style | "New balance enthusiast" |
| TECH_DAD | 💻 | Innovation | "Have you tried turning it off?" |
| ITEM | 🎁 | Equipment | Tools and accessories |

### 16.2 Type Color Palette

```typescript
const DAD_TYPE_COLORS = {
  BBQ_DAD: '#ef4444',      // Red
  FIX_IT_DAD: '#22c55e',   // Green
  GOLF_DAD: '#06b6d4',     // Cyan
  COUCH_DAD: '#8b5cf6',    // Purple
  LAWN_DAD: '#84cc16',     // Lime
  CAR_DAD: '#f97316',      // Orange
  OFFICE_DAD: '#64748b',   // Slate
  COOL_DAD: '#ec4899',     // Pink
  COACH_DAD: '#eab308',    // Yellow
  CHEF_DAD: '#f43f5e',     // Rose
  HOLIDAY_DAD: '#14b8a6',  // Teal
  WAREHOUSE_DAD: '#a855f7',// Purple
  VINTAGE_DAD: '#78716c',  // Stone
  FASHION_DAD: '#0ea5e9',  // Sky
  TECH_DAD: '#3b82f6',     // Blue
  ITEM: '#9ca3af',         // Gray
};
```

### 16.3 Synergy Bonuses

When building decks, certain type combinations provide bonuses:

**BBQ Alliance (BBQ_DAD + CHEF_DAD):**
- +30% Grill Skill to both cards
- "Ultimate Cookout" special ability

**Suburban Dream Team (LAWN_DAD + CAR_DAD + WAREHOUSE_DAD):**
- +20% all stats for included cards
- "HOA Nightmare" deck bonus

**Office Dynasty (OFFICE_DAD + TECH_DAD):**
- +25% Remote Control
- "Corporate Synergy" ability

**Cool Kids (COOL_DAD + FASHION_DAD):**
- +15% Dad Joke
- "Style Points" bonus damage

### 16.4 Type Distribution in Card Pool

Target distribution for balanced collection:

| Rarity | Cards per Type | Total Cards |
|--------|----------------|-------------|
| Common | 2-3 | ~40 |
| Uncommon | 1-2 | ~24 |
| Rare | 1 | ~16 |
| Epic | 0-1 | ~8 |
| Legendary | 0-1 | ~4 |
| Mythic | 0-1 | ~2 |

---

## 17. Engagement Loops

### 17.1 Core Loop

```
┌──────────────────────────────────────────────────────────────┐
│                    CORE ENGAGEMENT LOOP                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│  │  OPEN   │───▶│ COLLECT │───▶│  BUILD  │───▶│ BATTLE/ │   │
│  │  PACKS  │    │  CARDS  │    │  DECKS  │    │  TRADE  │   │
│  └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘   │
│       │              │              │              │         │
│       ▼              ▼              ▼              ▼         │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│  │  Feel   │    │  Track  │    │ Optimize│    │  Show   │   │
│  │Excitement│    │Progress │    │Strategy │    │  Off    │   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘   │
│       │              │              │              │         │
│       └──────────────┴──────────────┴──────────────┘         │
│                           │                                   │
│                           ▼                                   │
│                    ┌─────────────┐                            │
│                    │    SHARE    │                            │
│                    │   (Viral)   │                            │
│                    └─────────────┘                            │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 17.2 Daily Loop

```
DAILY ENGAGEMENT LOOP:
┌────────────────────────────────────────────────────────┐
│ 1. Login                                               │
│    ↓                                                   │
│ 2. Claim Daily Reward                                  │
│    ↓                                                   │
│ 3. Open Free Pack(s)                                   │
│    ↓                                                   │
│ 4. Check Achievements Progress                         │
│    ↓                                                   │
│ 5. Review Collection / Upgrade Cards                   │
│    ↓                                                   │
│ 6. Check/Respond to Trades                             │
│    ↓                                                   │
│ 7. Share Notable Pulls                                 │
└────────────────────────────────────────────────────────┘
```

### 17.3 Weekly Loop

| Day | Focus Activity |
|-----|----------------|
| Monday | Start new weekly challenge |
| Tuesday-Thursday | Daily pack opening |
| Friday | Review trade offers |
| Saturday | Batch pack opening session |
| Sunday | Complete weekly, claim Day 7 reward |

### 17.4 Long-Term Progression

```
PROGRESSION MILESTONES:
┌──────────────────────────────────────────────────────────┐
│ Week 1:  First pack, learn mechanics, 10 packs opened   │
│ Week 2:  First rare pull, start collection              │
│ Week 3:  First epic, try crafting                       │
│ Week 4:  25 unique cards, first trade                   │
│ Month 2: First legendary, build first deck              │
│ Month 3: 50% collection, first battle win               │
│ Month 6: First mythic, complete set bonus               │
│ Year 1:  Complete collection, all achievements          │
└──────────────────────────────────────────────────────────┘
```

### 17.5 Retention Mechanics

**Short-term (1-7 days):**
- Daily reward streak
- Free pack on first login
- Achievement notifications
- New card reveals

**Medium-term (1-4 weeks):**
- Weekly challenges
- Collection progress
- Crafting projects
- Deck building goals

**Long-term (1+ months):**
- Set completion
- Pity system satisfaction
- Season content
- Social features (trades, sharing)

### 17.6 Social Sharing Incentives

| Action | Reward | Viral Potential |
|--------|--------|-----------------|
| Share first pack | 3 bonus packs | New user hook |
| Share Legendary | 1 bonus pack | Rare content |
| Share Mythic | 5 bonus packs | Ultra-rare |
| Share completed set | 10 bonus packs | Major milestone |
| Refer a friend | Premium pack | Social growth |

---

## 18. Technical Implementation

### 11.1 Pack Generation Flow

```typescript
// Simplified flow
function generatePack(config = DEFAULT_PACK_CONFIG, seed?: number): Pack {
  const rng = new SeededRandom(seed);
  const packCards: PackCard[] = [];
  const usedCardIds = new Set<string>();
  
  // 1. Process each slot
  for (const slot of config.raritySlots) {
    const rarity = determineSlotRarity(slot, rng);
    const card = selectCard(rarity, usedCardIds, rng);
    const holoType = rollHolo(rarity, rng);
    
    packCards.push({
      ...card,
      isRevealed: false,
      isHolo: holoType !== 'none',
      holoType,
    });
  }
  
  // 2. Shuffle to prevent position prediction
  const shuffledCards = rng.shuffle(packCards);
  
  // 3. Validate distribution
  validateRarityDistribution(shuffledCards, config);
  
  // 4. Roll pack design
  const design = rollPackDesign(rng);
  
  return {
    id: generateId(),
    cards: shuffledCards,
    openedAt: new Date(),
    bestRarity: getHighestRarity(shuffledCards),
    design,
  };
}
```

### 11.2 Seeded Randomness

All randomness uses seeded RNG for:
- **Reproducibility** - Same seed = same pack
- **Testing** - Deterministic unit tests
- **Anti-cheat** - Server can verify client packs

```typescript
class SeededRandom {
  private seed: number;
  
  constructor(seed?: number) {
    this.seed = seed ?? Date.now();
  }
  
  next(): number {
    // Mulberry32 algorithm
    this.seed |= 0;
    this.seed = (this.seed + 0x6D2B79F5) | 0;
    let t = this.seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  
  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
  
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
```

### 11.3 Security Validation

Every pack undergoes validation before opening:

```typescript
async function validatePackBeforeOpen(pack: Pack): Promise<ValidationResult> {
  // 1. Duplicate detection
  const duplicateCheck = await detectDuplicatePack(pack);
  
  // 2. Rarity distribution check
  const rarityCheck = validateRarityDistribution(pack.cards);
  
  // 3. Statistical anomaly detection
  const statsCheck = detectStatisticalAnomalies(pack);
  
  // 4. Entropy verification
  const entropyCheck = await validatePackEntropy(pack);
  
  return {
    valid: !duplicateCheck.isDuplicate && 
           !statsCheck.hasAnomalies && 
           entropyCheck.valid,
    violations: [...]
  };
}
```

### 11.4 LocalStorage Persistence

Collection data persists to LocalStorage with:
- Custom Date serialization
- Quota management (5MB limit)
- Graceful degradation
- Export/import functionality

```typescript
// Automatic persistence via nanostores
export const collection = persistentAtom<Collection>(
  'daddeck-collection',
  DEFAULT_COLLECTION,
  collectionEncoder
);
```

### 11.5 Performance Considerations

| Metric | Target | Implementation |
|--------|--------|----------------|
| Pack generation | <500ms | Pre-generated card pools |
| Animation FPS | 60fps | GPU-accelerated transforms |
| Initial load | <3s | Code splitting, lazy loading |
| Storage check | <10ms | Cached quota estimation |

---

## Appendix A: Constants Reference

```typescript
// Pack configuration
const DEFAULT_PACK_CONFIG = {
  cardsPerPack: 6,
  holoChance: 1/6,  // ~16.67%
};

// Rarity order (for comparisons)
const RARITY_ORDER = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythic: 5,
};

// Upgrade configuration
const DEFAULT_UPGRADE_CONFIG = {
  maxLevel: 3,
  costPerLevel: 5,
  statIncreasePerLevel: 5,
};

// Trade configuration
const DEFAULT_TRADE_CONFIG = {
  maxCardsPerSide: 6,
  tradeExpirationDays: 7,
  maxActiveTrades: 10,
};

// Crafting configuration
const DEFAULT_CRAFTING_CONFIG = {
  maxHistoryEntries: 100,
  enableSoundEffects: true,
  animationDuration: 3000,
};
```

---

## Appendix B: File Locations

| Feature | Location |
|---------|----------|
| Pack Generation | `src/lib/pack/generator.ts` |
| Collection Store | `src/stores/collection.ts` |
| Pack Store | `src/stores/pack.ts` |
| Batch Store | `src/stores/batch.ts` |
| Crafting Logic | `src/lib/crafting/executor.ts` |
| Upgrade Logic | `src/lib/upgrade/executor.ts` |
| Types | `src/types/index.ts` |
| Card Database | `src/data/cards.json` |
| Security Validation | `src/lib/security/pack-validator.ts` |

---

**Document maintained by:** DadDeck Development Team  
**Last reviewed:** January 17, 2026
