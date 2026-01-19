# DadDeck™ Card Design - MTG-Style Layout
**Updated Design Direction: Traditional TCG Card Format**

---

## Design Philosophy Shift

**Previous Approach:** Minimalist, illustration-focused, information hidden behind interaction  
**New Approach:** Traditional TCG, information-rich, Magic: The Gathering style layout  

**Why This Matters:**
- Players expect TCG cards to show comprehensive info at a glance
- MTG/Pokémon trained users know how to read this format
- More engaging (immediate visual info hierarchy)
- Information is discoverable without clicking
- Premium, professional TCG aesthetic

---

## Card Anatomy (MTG-Style)

### Physical Layout Zones

```
┌─────────────────────────────────────────┐
│ CARD NAME              COST SYMBOLS    │  Top bar (8%)
│ (serif, bold)         (rarity-based)   │
├─────────────────────────────────────────┤
│                                         │
│     ILLUSTRATION AREA (bleeds)          │  Illustration (50-60%)
│     (professional TCG art)              │
│                                         │
├─────────────────────────────────────────┤
│ Type Line: Creature — Dad, Legendary   │  Type line (4%)
├─────────────────────────────────────────┤
│                                         │
│ Ability/Effect Text Area                │  Abilities (15-20%)
│ (formatted like MTG rules text)         │
│                                         │
├─────────────────────────────────────────┤
│ "Flavor text here in italics"           │  Flavor text (5%)
├─────────────────────────────────────────┤
│ DAD JOKE 75 | GRILL SKILL 95 | FIX-IT │ Stats bar (6%)
│ 025/150 • Series 1                      │ Set info (2%)
└─────────────────────────────────────────┘
```

### Percentage Breakdown

| Zone | Height | Purpose |
|------|--------|---------|
| **Header (Name + Cost)** | 8% | Card identification + cost |
| **Illustration** | 50-60% | Artwork (variable per type) |
| **Type Line** | 4% | Card type classification |
| **Ability/Effect Text** | 15-20% | Game mechanics (variable) |
| **Flavor Text** | 5% | Story/humor |
| **Stats/Set Info** | 6% | Stats badges + card number |

---

## Top Bar (Name & Cost)

### Design

```
┌─────────────────────────────────────────┐
│ GRILLMASTER GARY         ❋❋❋❋          │
│ (1.5rem serif, bold)  (rarity cost)     │
└─────────────────────────────────────────┘
```

### Elements

**Card Name**
- Font: Serif (Georgia, Times New Roman, serif)
- Size: 1.25-1.5rem (scales with card size)
- Weight: 700 (bold)
- Color: Black or dark color
- Text shadow: Optional (for readability over dark backgrounds)

**Cost/Mana Symbols**
- Position: Top-right corner
- Format: Rarity-based cost icons (rarity-colored circles with symbols)
- Common cost: 1-2 symbols
- Uncommon cost: 2-3 symbols
- Rare cost: 3-4 symbols
- Epic cost: 4-5 symbols
- Legendary cost: 4-5 (with star icon)
- Mythic cost: 5 (with multi-color shimmer)

**Example:**
```
Grillmaster Gary:  ❋ ❋ ❋ ❋
Suburban Strategist: ❋ ❋ ❋ (planeswalker)
Deluxe Spatula:    ◆ ◆ (blue equipment)
```

---

## Illustration Area

### Size & Bleed
- **Size:** 50-60% of card height
- **Bleed:** Extends to all edges (professional print standard)
- **Frame:** Gold or rarity-colored frame around illustration
- **Corner radius:** 8px for web, bleed for print

### Illustration Content
- Professional TCG-quality artwork
- Character-focused (not busy backgrounds)
- Clear focal point (main character/object)
- Rarity-appropriate intensity
  - Common: Simpler, calmer scenes
  - Uncommon: More detailed, interesting
  - Rare: Dramatic lighting, dynamic composition
  - Epic: Magic/effects visible
  - Legendary: Heroic, grandiose
  - Mythic: Otherworldly, mysterious

---

## Type Line

### Format
```
Creature — Dad, Legendary

Artifact — Equipment

Instant — Event

Enchantment — Aura
```

### Elements
- **Main Type:** Creature, Artifact, Instant, Enchantment, Sorcery, Land
- **Subtype:** Dad, Equipment, Legendary, Aura, Event, etc.
- **Color:** Rarity-based (matches card rarity)
- **Font:** Small serif (0.75rem), medium weight

---

## Ability/Effect Text

### Formatting Rules

**Ability Name**
- Bold, rarity color
- Followed by cost in braces (if applicable)
- Example: `Perfect Sear — {Tap}: Deal 3 damage to any target.`

**Effect Description**
- Regular serif or sans-serif font
- 0.75rem size (readable but compact)
- Line-height: 1.4 (spacing for readability)
- Max-width: 90% of card width

**Multiple Abilities**
- Separated by blank line
- Each ability clearly delineated
- Stacked vertically

**Ability Keywords**
- Bolded for emphasis
- Standard TCG keywords (Legendary, Tap, Cost, etc.)

### Example Text Block

```
Perfect Sear — {Tap}: Deal 3 damage to any target.

Whenever Grillmaster Gary attacks, you gain 2 life
for each food token you control.

He's not yelling, just passionate.
```

---

## Flavor Text

### Design
- **Font:** Italic serif (0.625rem)
- **Color:** Darker than ability text (de-emphasized)
- **Opacity:** 0.8-0.9 (readable but secondary)
- **Position:** Bottom, separated by line
- **Purpose:** Humor, world-building, character development

### Content
- One-liner jokes (dad humor)
- Short story snippets
- Character quotes
- Sarcastic commentary

### Examples
```
"Medium rare? That's what I'd call your mother's driving skills."

"Every Saturday, rain or shine."

"I've been playing for 20 years. One day I'll break. It's a skill shot."
```

---

## Stats Display

### Format: Stat Badges (Bottom of Card)

**Location:** Bottom bar, left to right

**Badge Design:**
```
┌────────────────┐
│  DAD JOKE      │
│      75        │  Circular or oval badge
│   (icon)       │  Rarity-colored background
└────────────────┘
```

**Display Options:**

**Option 1: Horizontal Stat Row (Most Common)**
```
DAD JOKE 75 | GRILL SKILL 95 | FIX-IT 40
```
- Space-separated values
- Monospace alignment
- Fits most cards

**Option 2: Stat Box (Stat-Heavy Cards)**
```
┌─────────────────────┐
│ DAD JOKE    75      │
│ GRILL SKILL  95     │
│ FIX-IT       40     │
│ NAP POWER    30     │
└─────────────────────┘
```
- Multi-row layout
- Better for cards with many stats
- Left-aligned labels, right-aligned values

**Option 3: Radar Chart Overlay (Special Cards)**
```
Transparent hexagon stat chart
overlaid on illustration (visible on hover/tap)
Shows all 8 stats visually
```

### Stat Badge Styling
- **Background:** Rarity-colored (semi-transparent circle)
- **Text:** Bold, white or light color
- **Icon:** Stat-specific icon (joke, grill, wrench, etc.)
- **Size:** 36-48px per badge (md card)
- **Spacing:** 8-12px between badges

---

## Set Information

### Bottom-Right Corner

```
025/150 • Series 1
```

- **Card Number:** 025 (position)
- **Total Cards:** /150 (set size)
- **Series:** Series 1
- **Expansion Symbol:** Optional rarity indicator
- **Font:** Small (0.6rem), monospace
- **Color:** Subdued, legible

---

## Special Card Type Variations

### 1. Regular Creature Cards
**Layout:** Standard (50% art, 50% info)  
**Stats:** Full 8-stat display at bottom  
**Abilities:** 1-3 abilities  
**Flavor:** Always included

**Example:** Grillmaster Gary

---

### 2. Stat-Heavy Creatures
**Layout:** 55% art, 45% info  
**Stats:** All 8 stats visible in grid or overlay  
**Abilities:** 0-1 ability (secondary to stats)  
**Feature:** Stats overlaid on illustration (semi-transparent box)

**Example:** Bogey Bob, the Eternal Duffer

---

### 3. Ability-Heavy Creatures
**Layout:** 40% art, 60% info  
**Stats:** Key 3-4 stats only  
**Abilities:** 2-4 complex abilities  
**Feature:** Full ability text block (multiple lines)

**Example:** Suburban Strategist

---

### 4. Equipment Cards (Item)
**Layout:** 60% art, 40% info  
**Stats:** Equipment bonus (+X/+X) in callout  
**Abilities:** Equipment effect + equip cost  
**Type Line:** "Artifact — Equipment"  
**Feature:** Golden border, equipment icon

**Example:** Deluxe Spatula, Weber Genesis Grill

---

### 5. Event Cards (Instant/Sorcery)
**Layout:** 50% art, 50% info  
**Stats:** N/A  
**Abilities:** Single effect, prominently displayed  
**Type Line:** "Instant — Event" or "Sorcery — Event"  
**Feature:** Dashed border, energetic design, large effect text

**Example:** BBQ Sauce Explosion

---

### 6. Legendary Planeswalker Cards
**Layout:** 55% art, 45% info  
**Stats:** Loyalty counter (bottom-right corner)  
**Abilities:** +1, -3, ultimate abilities (3 total)  
**Type Line:** "Legendary Planeswalker — Dad"  
**Feature:** Loyalty value (starting value), different text format

**Example:** The Dad, Lord of a Cul-de-Sac

---

## Color & Border System

### Border Thickness (Rarity-Based)

```
Common:     2px solid border
Uncommon:   2px solid border
Rare:       3px solid border
Epic:       3px solid border
Legendary:  4px solid border
Mythic:     4px solid border + prismatic edge
```

### Border Color (Rarity-Based)

| Rarity | Color | Hex | Effect |
|--------|-------|-----|--------|
| Common | Gray | #9ca3af | Subtle shadow |
| Uncommon | Blue | #3b82f6 | Blue glow |
| Rare | Gold | #eab308 | Gold foil effect |
| Epic | Purple | #a855f7 | Purple shimmer |
| Legendary | Orange | #f97316 | Warm glow |
| Mythic | Pink | #ec4899 | Prismatic shimmer |

### Special Borders for Card Types

**Equipment Cards:**
- Golden/brass texture border
- Slightly ornate corners
- Equipment icon in corner

**Event Cards:**
- Dashed border (energetic feel)
- Rarity color but more vivid
- Lightning corner markers

**Planeswalker Cards:**
- Standard border with loyalty indicator
- Rarity-colored with shimmer

**Legendary Cards:**
- Thicker border (4px)
- Rarity color + texture
- Crown or star corner markers

---

## Typography System

### Hierarchy

**Level 1: Card Name**
- 1.5rem serif, bold
- Rarity color (optional glow)
- Primary focus

**Level 2: Type Line**
- 0.75rem serif, regular
- Dark color
- Secondary focus

**Level 3: Ability Text**
- 0.75rem serif, regular
- Black or dark text
- Primary content

**Level 4: Flavor Text**
- 0.625rem italic serif
- Desaturated, secondary color
- De-emphasized

**Level 5: Set Info**
- 0.6rem monospace
- Subtle color
- Minimal presence

---

## Holographic Effects (Adapted)

### For MTG-Style Cards

**Base Card (Non-Holo):**
- Flat, matte finish
- Clean appearance
- Standard rarity colors

**Standard Holo:**
- Subtle shimmer on illustration
- Foil effect on rarity color areas
- Gentle glow on border
- Refined, not overdone

**Rare Holo:**
- More prominent shimmer
- Foil effect across name area
- Visible glow on border
- Premium feel

**Legendary Holo:**
- Full illustration shimmer
- Rainbow foil highlights
- Intense border glow
- Premium collectible feel

**Mythic Prismatic:**
- Rotating rainbow effect on border
- Hologram across entire card
- Maximum drama and rarity feel
- Collector's crown jewel

---

## Interactive States (Hover/Tap)

### Desktop Hover
- Border glow intensifies
- Subtle lift effect (+2px shadow)
- Illustration brightness +10%
- Rarity color pulses gently
- Smooth 0.3s transition

### Mobile Tap
- Border glow activates
- Card scale +1% (tactile feedback)
- Haptic vibration (if supported)
- Details remain visible (all info on card)

### Click/Modal
- Opens detail view with:
  - Larger card image
  - Full rules text
  - Ability clarifications
  - Card lore/history
  - Collection info

---

## Component Structure

### HTML/SVG Layout
```
<card>
  <!-- Top bar -->
  <header>
    <name>Grillmaster Gary</name>
    <cost>❋ ❋ ❋ ❋</cost>
  </header>
  
  <!-- Illustration with frame -->
  <illustration-frame>
    <illustration src="..." />
  </illustration-frame>
  
  <!-- Type line -->
  <type-line>Creature — Dad, Legendary</type-line>
  
  <!-- Abilities section -->
  <abilities>
    <ability>
      <name>Perfect Sear</name>
      <cost>{T}</cost>
      <text>Deal 3 damage to any target.</text>
    </ability>
  </abilities>
  
  <!-- Flavor text -->
  <flavor-text>"Medium rare?..."</flavor-text>
  
  <!-- Stats bar -->
  <stats-bar>
    <stat label="DAD JOKE">75</stat>
    <stat label="GRILL SKILL">95</stat>
    <stat label="FIX-IT">40</stat>
  </stats-bar>
  
  <!-- Set info -->
  <set-info>025/150 • Series 1</set-info>
</card>
```

---

## Responsive Sizing

### Mobile (< 768px)
```
Card size: 180px × 252px
Font sizes: -20% (readable but compact)
Stats: Abbreviated (75/95/40)
Illustration: 50% of card
Abilities: Single-line summary or hidden until modal
```

### Tablet (768px - 1024px)
```
Card size: 280px × 390px
Font sizes: -10%
Illustration: 55% of card
All information visible
Stats: Full display
```

### Desktop (1024px+)
```
Card size: 380px × 532px (Standard MTG)
Font sizes: 100% (designed for)
Illustration: 55-60% of card
All information visible and readable
Stats: Full display with icons
```

---

## Design Advantages

✅ **Professional TCG Feel** - Looks like actual Magic/Pokémon cards  
✅ **Information Rich** - All critical info visible at a glance  
✅ **Traditional Format** - Players know how to read this layout  
✅ **Scalable** - Works across mobile, tablet, desktop  
✅ **Collectible** - Feels premium and polished  
✅ **Flexible** - Accommodates different card types easily  
✅ **Accessible** - All information in structured format  

---

## Implementation Checklist

- [ ] Update Card.svelte with MTG-style layout
- [ ] Create top bar component (name + cost)
- [ ] Style illustration frame with rarity border
- [ ] Format type line component
- [ ] Create ability text formatting
- [ ] Add flavor text styling
- [ ] Create stats badge component
- [ ] Add set info display
- [ ] Implement responsive scaling
- [ ] Test across all device sizes
- [ ] Validate text readability
- [ ] Add holographic effects
- [ ] Test interactive states
- [ ] Verify accessibility

---

**Status:** MTG-Style Design Direction Established ✓  
**Next Phase:** Implementation (Component Refactoring to MTG Layout)
