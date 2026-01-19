# Card Type Layout Guide
**Detailed Layout Specifications for Each Card Type**

---

## Overview

Each card type has a unique layout optimized for its information needs, while maintaining the core design language:
- Clean, minimal aesthetic
- Rarity-driven styling
- Progressive information reveal
- Premium TCG feel

---

## 1. REGULAR CARDS (Base Dad Cards)

### Purpose
Main collectible cards representing dad archetypes with combat stats

### Layout
```
┌──────────────────────────────┐
│ [Type Icon]  ILLUSTRATION    │  65%
│ (28×28)      (bleeds)        │
│              (no glow)       │
│                              │
├──────────────────────────────┤
│ Gradient overlay (readable)  │
├──────────────────────────────┤
│ CARD NAME              ★     │  6%
│ (gold glow, serif)    rarity │
└──────────────────────────────┘

Hover State:
├──────────────────────────────┤
│ INFO BAR (appears on hover)  │
│ BBQ_DAD | Grill Skill: 95    │
│ Primary Ability: "Perfect..."│
├──────────────────────────────┤
```

### Information Priority
**Always Visible:**
- Illustration (hero)
- Card name
- Rarity indicator (gem icon)
- Type icon

**On Hover/Tap:**
- Dad type label ("BBQ_DAD")
- Top 2-3 stats (most relevant)
- Primary ability name

**In Detail Modal:**
- All 8 stats (radar chart or bars)
- Full ability descriptions (1-3)
- Flavor text
- Card metadata (artist, series, number)

### Styling
```
Border:     Rarity-based (2-8px)
Glow:       Rarity pulse (0.6-1.6×)
Background: Rarity gradient
Shadow:     Dynamic (0 10px 30px → 0 20px 50px)
```

### Examples
- Grillmaster Gary (Legendary, BBQ_DAD)
- Fix-It Frank (Rare, FIX_IT_DAD)
- Couch Potato Pete (Common, COUCH_DAD)

---

## 2. STAT-HEAVY CARDS (Stat-Focused Dads)

### Purpose
Cards where stats are primary focus (combat creatures, competitive cards)

### Layout
```
┌──────────────────────────────┐
│ [Type Icon]  ILLUSTRATION    │  60%
│ (32×32)      (slight glow)   │
│              (more focused)  │
│                              │
├──────────────────────────────┤
│ Gradient overlay             │
├──────────────────────────────┤
│ CARD NAME     [STAT DISPLAY] │  40%
│ (serif, glow) Radar chart    │
│               or stat bars   │
│               All 8 visible  │
└──────────────────────────────┘
```

### Stat Display Options

**Option A: Radar Chart (Recommended)**
```
       Dad Joke (75)
           ▲
          / \
    Remote Control (50)  Grill Skill (95)
        /     \        /      \
       /       ╱╲___╲/        \
   Thermostat ╱         ╲  Fix-It (40)
    (60)    ╱           ╲
          /               \
   Sock&Sandal          Nap Power (30)
      (45)
         ╲              ╱
          ╲ Beer Snob ╱  
           (70)

- Hexagon shape
- Color-coded by stat type
- Shows overall profile at a glance
- Interactive (hover axis for tooltip)
- Size: 120px × 120px (fits bottom zone)
```

**Option B: Bar Chart**
```
Dad Joke:        ████████░░░░░░░░░░  75
Grill Skill:     ████████████████░░░ 95
Fix-It:          ████░░░░░░░░░░░░░░  40
Nap Power:       ███░░░░░░░░░░░░░░░  30
Remote Control:  █████░░░░░░░░░░░░░  50
Thermostat:      ██████░░░░░░░░░░░░  60
Sock&Sandal:     ████░░░░░░░░░░░░░░  45
Beer Snob:       ███████░░░░░░░░░░░  70

- 8 horizontal bars
- Color by stat type
- Compact, scannable
- Works well on mobile
- Fits vertical space well
```

### Information Priority
**Always Visible:**
- Illustration
- Card name
- **All 8 stats** (in chart form) ← MAIN DIFFERENCE
- Rarity indicator

**On Hover/Tap:**
- Stat tooltips (hover axes)
- Ability preview

**In Detail Modal:**
- Stat breakdowns (how they're used)
- Ability descriptions
- Flavor text
- Card lore/biography

### Styling
```
Border:     Rarity-based (prominent)
Glow:       Enhanced (1.5× normal)
Background: Rarity gradient
Stat colors: Type-specific colors
Chart:      Centered at bottom
```

### Examples
- Grillmaster Gary (full stat display)
- Pro Golfer Glenn (golf stats emphasized)
- Car Enthusiast Carl (engine-themed stats)

---

## 3. ABILITY-HEAVY CARDS (Complex Mechanics)

### Purpose
Cards with multiple complex abilities, less emphasis on stats

### Layout
```
┌──────────────────────────────┐
│ [Type Icon]  ILLUSTRATION    │  50%
│ (28×28)      (focused on art)│
│                              │
├──────────────────────────────┤
│ Gradient overlay             │
├──────────────────────────────┤
│ CARD NAME (Epic rarity)      │  50%
│ Type: LEGENDARY CREATURE     │
│                              │
│ Masterful Planning:          │
│ At start of turn, draw 2 and │
│ discard 1. Costs 2 resources.│
│                              │
│ Tactical Advantage:          │
│ If you control 3+ cards,     │
│ +2 to all stats.             │
└──────────────────────────────┘
```

### Text Formatting
```
Ability Name:
  Font: Bold, serif (1.0rem)
  Color: Rarity color
  
Effect Description:
  Font: Regular, sans-serif (0.75rem)
  Color: rgba(255,255,255,0.85)
  Line-height: 1.5 (readable spacing)
  Max-width: 85% card width
  
Separator:
  Light gray line (1px, 0.3 opacity)
  Spacing: 8px above/below

Key terms (Proper abilities):
  Font-weight: 600 (bold)
  Color: Rarity color (highlight)
```

### Information Priority
**Always Visible:**
- Illustration (smaller, 50%)
- Card name
- **Primary abilities** (1-3, fully visible)
- Rarity indicator

**On Hover/Tap:**
- Full ability text becomes visible
- Secondary effects tooltip

**In Detail Modal:**
- Extended descriptions
- Ability interactions
- Resource costs
- Flavor text

### Styling
```
Border:     Rarity-based with detail
Glow:       Standard (1.0×)
Background: Rarity gradient with texture
Layout:     Vertical stack of abilities
Padding:    Generous (16-20px) for readability
```

### Examples
- Suburban Strategist (multiple tactics)
- Legendary Coach (complex coaching mechanics)
- Event cards (multiple simultaneous effects)

---

## 4. ITEM CARDS (Equipment)

### Purpose
Equipment or items that grant bonuses when equipped

### Layout
```
┌──────────────────────────────┐
│ [Equipment Icon]             │  60%
│ (32×32, gold background)     │
│ ILLUSTRATION (tool-like)     │
│ (bleeds to edges)            │
│                              │
├──────────────────────────────┤
│ Gradient overlay (gold tint) │
├──────────────────────────────┤
│ DELUXE SPATULA        [🔧]  │  6%
│ Equipment               item │
│                              │
│ +10 Grill Skill             │
│ Grants "BBQ Master"         │
│ when equipped               │
└──────────────────────────────┘
```

### Distinguishing Features
- **Border**: Golden/brass color (item-specific)
- **Border style**: Slightly ornate corners (decorative)
- **Icon**: Equipment icon instead of dad type
- **Title**: Equipment name in serif font
- **Label**: "Equipment" subtitle
- **Effects**: Stat bonuses + special effects

### Information Priority
**Always Visible:**
- Equipment artwork
- Equipment name
- Item icon
- Stat bonuses (+X to stat)
- Special effect grant

**On Hover/Tap:**
- Equip requirements
- Interactions with other cards
- Durability (if applicable)

**In Detail Modal:**
- Full equipment description
- Compatible card types
- Usage restrictions
- Flavor text (how it's used)

### Styling
```
Border:     Solid gold (4-5px, decorative corners)
Glow:       Golden glow (0.8×, warm tone)
Background: Dark brown/bronze gradient
Icon Color: #f59e0b (amber/gold)
Text:       Serif name, sans-serif effect text
```

### Examples
- Deluxe Spatula (+10 Grill Skill)
- Leather Recliner (+8 Nap Power, comfort buff)
- Premium Remote Control (+15 Remote Control, IR range)

---

## 5. EVENT CARDS (Shitshow Scenarios)

### Purpose
One-time or triggered events that affect gameplay

### Layout
```
┌──────────────────────────────┐
│ [Event Icon]  ILLUSTRATION   │  50%
│ (lightning/   (chaotic, fun) │
│  explosion)   (bright colors)│
│               [DASHED BORDER]│
├──────────────────────────────┤
│ Gradient overlay (intense)   │
├──────────────────────────────┤
│ BBQ SAUCE EXPLOSION   [⚡]   │  50%
│ Event Type                   │
│                              │
│ All players take 3 damage.   │
│ Randomly shuffle opponent's  │
│ hand.                        │
│                              │
│ Duration: One-time trigger   │
└──────────────────────────────┘
```

### Distinguishing Features
- **Border**: Dashed or zigzag pattern (energetic)
- **Border color**: Rarity-based, but more vivid
- **Icon**: Event/trigger icon
- **Illustration**: Chaotic, high-energy scenes
- **Effect text**: Prominent, action-oriented
- **Duration label**: "One-time" or "While in play"

### Information Priority
**Always Visible:**
- Illustration (action-focused)
- Event name
- Event type label
- **Primary effect** (always visible, not hidden)
- Trigger condition

**On Hover/Tap:**
- Secondary effects
- Damage/benefit breakdown
- Cost (if applicable)

**In Detail Modal:**
- Detailed effect resolution
- Interaction rules
- Timing (when triggers)
- Flavor text (the story)

### Styling
```
Border:     Dashed or wavy (energy)
Border-color: Rarity + more vivid
Glow:       Intense pulsing (1.2×)
Background: Rarity gradient, more saturated
Animation:  Slight shimmer on cards with ongoing effects
```

### Examples
- BBQ Sauce Explosion (damage event)
- Neighborhood Watch (effect event)
- Surprise Party (benefit event)

---

## 6. TERRAIN CARDS (Suburban Shitfields)

### Purpose
Persistent battlefield modifiers that affect both players

### Layout
```
┌──────────────────────────────┐
│ [Terrain Icon]               │  70%
│ (landscape)  ILLUSTRATION    │
│ (32×32)      (scenic, pretty)│
│              (pastoral tones)│
│                              │
├──────────────────────────────┤
│ Soft gradient overlay        │
├──────────────────────────────┤
│ NEIGHBOR'S POOL PARTY   [🌳] │  6%
│ Terrain                       │
│                              │
│ While in play: Both players  │
│ draw +1 card per turn.       │
└──────────────────────────────┘
```

### Distinguishing Features
- **Border**: Natural, earthy colors
- **Border texture**: Subtle grass/nature pattern
- **Icon**: Terrain/landscape icon
- **Illustration**: Large, scenic (70% of card)
- **Effects**: Affect entire board
- **Duration**: Persistent

### Information Priority
**Always Visible:**
- Large illustration (hero element)
- Terrain name
- Terrain type
- **Active effect** (visible at bottom)

**On Hover/Tap:**
- Full effect description
- When effect ends
- Removal conditions

**In Detail Modal:**
- Detailed effect mechanics
- Stat modifications
- Draw/discard triggers
- Flavor text (location description)

### Styling
```
Border:     Natural colors (green, brown)
Border-style: Textured, organic pattern
Glow:       Soft, environmental (0.8×)
Background: Nature-themed gradient
Corner marks: Small tree/landscape icons
```

### Examples
- Neighbor's Pool Party (draw boost)
- Pristine Lawn (stat modifers)
- Golf Course (specialty effects for golf dads)

---

## 7. EVOLUTION CARDS (Midlife Crisis Mutations)

### Purpose
Upgrade cards that transform base dads into enhanced versions

### Layout
```
┌──────────────────────────────┐
│ [Base Form Thumbnail]        │  65%
│ (64×64, framed)              │
│ EVOLVED FORM ILLUSTRATION    │
│ (main focus, bright aura)    │
│                              │
│      [Transformation Arrow]  │
│                              │
├──────────────────────────────┤
│ Gradient overlay             │
├──────────────────────────────┤
│ GRILLMASTER GARY →           │  35%
│ GRILLMASTER BOBBY            │
│ (Platinum Evolution)         │
│                              │
│ Grill Skill: 95 → 100 (+5)   │
│ Dad Joke: 75 → 80 (+5)       │
│                              │
│ Grants: +3 all stats         │
│ Platinum Evolution           │
└──────────────────────────────┘
```

### Distinguishing Features
- **Dual imagery**: Base form (small, top-left) + Evolved form (main)
- **Transformation arrow**: Visual connection between forms
- **Stats comparison**: Old → New format
- **Evolution type**: Special evolution name (e.g., "Platinum")
- **Enhancement text**: What the evolution grants

### Information Priority
**Always Visible:**
- Base form thumbnail
- Evolved form illustration
- Evolution name
- Stat improvements (+X per stat)
- Evolution special effect

**On Hover/Tap:**
- Full stat table (before/after)
- Resource cost
- Evolution conditions

**In Detail Modal:**
- Base card info
- Evolved card info
- Full ability set
- Flavor text (transformation story)

### Styling
```
Border:     Evolution colors (gradient transition)
Glow:       Enhanced (1.3×), shows transformation
Background: Gradient showing base → evolved colors
Base thumbnail: Small frame with rarity border
Arrow:      Gold/silver color, prominent
Stat text:  Monospace alignment, color-coded
```

### Examples
- Grillmaster Gary → Grillmaster Bobby (Platinum)
- Fix-It Frank → Master Mechanic Frank (Gold)
- Couch Pete → Throne King Pete (Diamond)

---

## 8. CURSE CARDS (Dad Damnations)

### Purpose
Negative effects applied to opponents

### Layout
```
┌──────────────────────────────┐
│ [Curse Icon]  ILLUSTRATION   │  60%
│ (dark purple) (eerie, moody) │
│ (32×32)       (desaturated)  │
│                              │
├──────────────────────────────┤
│ Dark gradient overlay        │
├──────────────────────────────┤
│ LAWN CURSE                ✕  │  6%
│ Curse (negative effect)      │
│                              │
│ Opponent cannot mow lawn     │
│ this turn. -5 Grill Skill.   │
│ Duration: Until next turn    │
└──────────────────────────────┘
```

### Distinguishing Features
- **Icon**: Curse/X symbol (dark, ominous)
- **Color palette**: Dark purples, desaturated
- **Illustration**: Eerie, slightly unsettling
- **Border**: Dark with subtle purple glow
- **Label**: "Curse" clearly marked
- **Effects**: Negative/debuff focused

### Information Priority
**Always Visible:**
- Curse artwork (moody)
- Curse name
- "Curse" label
- **Debuff effects** (visible)
- Duration

**On Hover/Tap:**
- Target specification
- Removal conditions
- Interaction with other cards

**In Detail Modal:**
- Full curse description
- Stat penalties
- Game state restrictions
- Flavor text (why it's bad)

### Styling
```
Border:     Dark purple (3-4px)
Glow:       Purple/red glow (0.9×, eerie)
Background: Dark gradient with texture
Text color: Desaturated colors (less vibrant)
Icon:       X or chains symbol
```

### Examples
- Lawn Curse (-5 Grill Skill)
- Hangover Hex (-10 Dad Joke, Bad Breath effect)
- Remote Lost (lose remote control ability)

---

## 9. TRAP CARDS (Suburban Suckerpunches)

### Purpose
Hidden face-down cards that trigger on opponent actions

### Layout (Face-Down)
```
┌──────────────────────────────┐
│         CARD BACK            │  100%
│         (unrevealed)         │
│    [DadDeck™ Logo]           │
│   [Pattern/Texture]          │
│  "?" symbol (subtle)         │
│                              │
├──────────────────────────────┤
│ FACE-DOWN TRAP               │
│ (hover: "Long-press to peek")│
└──────────────────────────────┘

Layout (Revealed)
├──────────────────────────────┤
│ [Trap Icon]  ILLUSTRATION    │  50%
│ (lightning/  (reveal moment) │
│  spring)     (surprising)    │
├──────────────────────────────┤
│ SURPRISE INSPECTION      [⚡] │  50%
│ Trap - Trigger Effect       │
│                              │
│ Trigger: When opponent plays │
│ red card, reveal opponent's  │
│ hand.                        │
│                              │
│ Cost: 2 resources to set     │
└──────────────────────────────┘
```

### Distinguishing Features
- **Face-down state**: Card back shown (unrevealed)
- **Reveal animation**: Quick flip when triggered
- **Icon**: Trap/spring symbol (energetic)
- **Trigger text**: "Trigger: When..."
- **Effect**: Resolves on opponent action

### Information Priority
**Face-Down State:**
- Card back only
- "Face-down trap" indicator
- Hint: "Long-press to peek"

**Revealed State:**
- Trap name
- Trigger condition (highlighted)
- **Trap effect** (what happens)
- Cost to set

**In Detail Modal:**
- Full trigger conditions
- Resolution order
- Interaction with other cards
- Flavor text

### Styling
```
Face-Down:
  Border:     Rarity border (but hidden)
  Background: Card back pattern
  Texture:    DadDeck™ logo/pattern
  Glow:       Subtle (unrevealed)

Revealed:
  Border:     Rarity-based + energetic
  Glow:       Intense, pulsing (1.2×)
  Background: Rarity gradient + surprise effect
  Animation:  Flip transition (0.6s)
```

### Examples
- Surprise Inspection (reveal opponent's hand)
- Sprinkler Surprise (damage when opponent mows)
- Doorbell Trap (interrupt opponent action)

---

## Comparison Table: All Card Types

| Type | Layout | Stats | Abilities | Border | Glow | Info Focus |
|------|--------|-------|-----------|--------|------|------------|
| **Regular** | 65% art | Yes (8) | 1-3 | Rarity | Normal | Balanced |
| **Stat-Heavy** | 60% art | **Visible** | 0-2 | Rarity (thick) | Enhanced | Stats |
| **Ability-Heavy** | 50% art | No | **2-4** | Rarity (detail) | Normal | Abilities |
| **Item** | 60% art | No | Effects | Gold (ornate) | Warm | Equipment |
| **Event** | 50% art | No | Effects | Dashed | Intense | Event |
| **Terrain** | 70% art | No | Field | Natural | Soft | Environment |
| **Evolution** | 65% art | Yes (before/after) | Transformed | Evolution | Enhanced | Transformation |
| **Curse** | 60% art | Negative | Debuffs | Dark purple | Eerie | Debuffs |
| **Trap** | 50% art | Trigger | Trigger | Energetic | Pulsing | Trigger |

---

## Implementation Considerations

### Component Structure
```
Card.svelte (variant prop)
├─ card-type: 'regular' | 'stat-heavy' | 'ability-heavy' | 
│             'item' | 'event' | 'terrain' | 'evolution' | 
│             'curse' | 'trap'
│
├─ CardIllustration (size varies per type)
├─ CardInfoBar (layout changes per type)
├─ CardNameBadge (styling per type)
└─ TypeSpecificDisplay (stat chart, abilities, etc.)
```

### CSS Modifiers
```css
.card--stat-heavy { /* adjustments */ }
.card--ability-heavy { /* adjustments */ }
.card--item { /* adjustments */ }
.card--event { /* adjustments */ }
.card--terrain { /* adjustments */ }
.card--evolution { /* adjustments */ }
.card--curse { /* adjustments */ }
.card--trap { /* adjustments */ }
```

### Props for Card Component
```typescript
interface CardProps {
  card: PackCard;
  cardType: 'regular' | 'stat-heavy' | 'ability-heavy' | 
            'item' | 'event' | 'terrain' | 'evolution' | 
            'curse' | 'trap';
  displayMode?: 'base' | 'stat-focused' | 'ability-focused';
  faceDown?: boolean; // For trap cards
  revealTrigger?: () => void; // For trap reveal
}
```

---

## Design Validation Checklist

- [ ] Each card type looks visually distinct
- [ ] Information hierarchy works for all types
- [ ] No card type feels cluttered
- [ ] Rarity styling applies across all types
- [ ] Special cards have unique border treatments
- [ ] Stat display options are clear (radar vs bars)
- [ ] Ability text is readable at all sizes
- [ ] Evolution cards show transformation clearly
- [ ] Trap cards have clear face-down/revealed states
- [ ] All types maintain premium aesthetic
- [ ] Hover/tap reveal works for all types
- [ ] Mobile responsive for all types

---

**Status:** Design Variations Complete ✓  
**Next Phase:** Implementation (Component Development)
