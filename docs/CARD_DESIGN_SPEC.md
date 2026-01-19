# DadDeck™ Card Design Specification
**Version:** 1.0  
**Date:** January 18, 2026  
**Status:** Design Phase  

---

## Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [Card Anatomy](#card-anatomy)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Component Breakdown](#component-breakdown)
6. [Holographic Effects](#holographic-effects)
7. [Interactive States](#interactive-states)
8. [Information Architecture](#information-architecture)
9. [Special Card Types](#special-card-types)
10. [Responsive Behavior](#responsive-behavior)
11. [Accessibility](#accessibility)
12. [Implementation Details](#implementation-details)

---

## Design Philosophy

**Inspiration:** Magic: The Gathering + Pokémon TCG with modern minimalism

**Core Principles:**
- **Illustration-first** - Artwork is the hero (65% of card real estate)
- **Streamlined modern** - Only essential info visible by default
- **Visual hierarchy** - Information revealed progressively on interaction
- **Premium feel** - Luxury collectible aesthetic
- **Rarity-driven** - Visual weight and effects scale with rarity tier
- **No clutter** - White space is a feature, not a bug

**Target User:** Serious collector who appreciates both art and gameplay mechanics

---

## Card Anatomy

### Physical Dimensions
```
Standard Card Size: 63.5mm × 88.9mm (CCG standard)
Display Ratio: 0.714 (portrait)

Responsive Sizes (Web):
- sm:  192px × 268px   (mobile, list view)
- md:  288px × 403px   (collection grid)
- lg:  384px × 537px   (detail view)
```

### Layout Zones (Percentage-based)
```
┌─────────────────────────────┐
│      TYPE ICON (2%)         │  ← Top-left corner
├─────────────────────────────┤
│                             │
│     ILLUSTRATION (65%)      │  ← Bleeds to all edges
│     Hero artwork area       │
│                             │
├─────────────────────────────┤
│  NAME           RARITY (2%) │  ← Bottom zone (6%)
│  Elegant serif  Gem icon    │
├─────────────────────────────┤
│  TYPE | STAT1 | STAT2 (5%)  │  ← Info bar on hover
└─────────────────────────────┘

Breakdown:
- Illustration:    65% of card height
- Bottom padding:  6% of card height
- Side margins:    3% of card width (on each side)
- Corner radius:   8px (proportional to card size)
```

### Layer Stack (Depth Order)
```
Layer 5: Interactive overlays (hover state, tooltips)
Layer 4: Information bars (type, stats, abilities - appears on hover)
Layer 3: Gradient overlay (text readability at bottom)
Layer 2: Illustration (artwork, bleeds to edges)
Layer 1: Base background (rarity-colored)
Layer 0: Border & shadow (card container)
```

---

## Color System

### Rarity-Based Color Palette

```typescript
const RARITY_COLORS = {
  common: {
    primary: '#9ca3af',        // Gray-400
    dark: '#6b7280',           // Gray-500
    light: '#d1d5db',          // Gray-300
    glow: '#9ca3af',
    glowIntensity: 0.6,        // Subtle glow
    borderColor: '#9ca3af',
  },
  uncommon: {
    primary: '#3b82f6',        // Blue-500
    dark: '#1e40af',           // Blue-800
    light: '#93c5fd',          // Blue-300
    glow: '#60a5fa',           // Blue-400
    glowIntensity: 0.8,
    borderColor: '#60a5fa',
  },
  rare: {
    primary: '#eab308',        // Yellow-400
    dark: '#b45309',           // Yellow-700
    light: '#fef3c7',          // Yellow-100
    glow: '#facc15',           // Yellow-300
    glowIntensity: 1.0,
    borderColor: '#f59e0b',    // Amber-500
  },
  epic: {
    primary: '#a855f7',        // Purple-500
    dark: '#6d28d9',           // Purple-800
    light: '#e9d5ff',          // Purple-200
    glow: '#c084fc',           // Purple-400
    glowIntensity: 1.2,
    borderColor: '#c084fc',
  },
  legendary: {
    primary: '#f97316',        // Orange-500
    dark: '#92400e',           // Orange-900
    light: '#fed7aa',          // Orange-200
    glow: '#fb923c',           // Orange-400
    glowIntensity: 1.4,
    borderColor: '#fb923c',
  },
  mythic: {
    primary: '#ec4899',        // Pink-500
    dark: '#831843',           // Pink-900
    light: '#fbcfe8',          // Pink-200
    glow: '#f472b6',           // Pink-400
    glowIntensity: 1.6,        // Maximum glow
    borderColor: '#f472b6',
  },
}

// Dad Type Colors (for type icon background)
const DAD_TYPE_COLORS = {
  BBQ_DAD: '#ef4444',          // Red
  FIX_IT_DAD: '#22c55e',       // Green
  GOLF_DAD: '#06b6d4',         // Cyan
  COUCH_DAD: '#8b5cf6',        // Violet
  LAWN_DAD: '#84cc16',         // Lime
  CAR_DAD: '#f97316',          // Orange
  OFFICE_DAD: '#3b82f6',       // Blue
  COOL_DAD: '#06b6d4',         // Cyan
  COACH_DAD: '#dc2626',        // Red
  CHEF_DAD: '#f59e0b',         // Amber
  // ... additional types
}
```

### Background Gradients (Card Interior)
```
Common/Uncommon:
  linear-gradient(135deg, #0f172a, #1e293b, #0f172a)
  (Dark slate background for contrast)

Rare:
  linear-gradient(135deg, #1e3a8a, #1e293b, #172554)
  (Deep blue undertone)

Epic:
  linear-gradient(135deg, #581c87, #312e81, #3b0764)
  (Purple mystique)

Legendary:
  linear-gradient(135deg, #78350f, #7c2d12, #450a0a)
  (Warm amber-brown)

Mythic:
  linear-gradient(135deg, #831843, #701a75, #500724)
  (Deep pink-purple)
```

### Text Overlay Gradient (Bottom of Card)
```
Multi-layer gradient for text readability:
- Top:    rgba(0,0,0,0) transparent
- Middle: rgba(0,0,0,0.3)
- Bottom: rgba(0,0,0,0.7) opaque

Height: 25% of card (bottom zone)
Purpose: Ensure card name/info always readable over artwork
```

---

## Typography

### Font Stack
```
Headings (Card Name):
  Font: Serif (Georgia, 'Times New Roman', serif)
  Style: Elegant, luxurious feel
  Fallback: System serif fonts

Body (Stats, Type, Flavor):
  Font: Sans-serif (system fonts for performance)
  -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

Code (Ability descriptions):
  Font: Monospace for technical readability
  'SF Mono', Monaco, 'Cascadia Code', monospace
```

### Scale & Weights

**Card Name (Bottom-left)**
```
Size:     Responsive (scales with card size)
          md card: 1.25rem (20px)
Weight:   600 (semibold)
Color:    Rarity primary color (glowing)
Shadow:   text-shadow: 0 0 8px rgba(color, 0.8)
Letter-spacing: 0.05em (elegant spacing)
```

**Type Label (Bottom, appears on hover)**
```
Size:     0.75rem (12px)
Weight:   500 (medium)
Color:    rgba(255,255,255,0.9)
Position: Below name, indented
```

**Stat Values (Info bar)**
```
Size:     0.6875rem (11px)
Weight:   600 (bold for emphasis)
Color:    Rarity color or white
Spacing:  Monospace-style alignment
```

**Ability Text (Appears on hover)**
```
Size:     0.6875rem (11px)
Weight:   400 (regular)
Color:    rgba(255,255,255,0.85)
Style:    Italic for flavor text
Line-height: 1.4 for readability
Max-width: 85% of card (padding)
```

**Flavor Text (Bottom, secondary)**
```
Size:     0.625rem (10px)
Weight:   400 (regular)
Color:    rgba(255,255,255,0.6)
Style:    Italic
Opacity:  Reduced emphasis (secondary info)
```

---

## Component Breakdown

### 1. Card Container
**Purpose:** Base card frame, border, and shadow  
**Dimensions:** Responsive (sm/md/lg sizes)  
**Properties:**
```
Border:       2-8px (scales with rarity)
Border-color: Rarity-based
Border-radius: 8px
Background:   Rarity gradient
Box-shadow:   
  - Base: 0 10px 30px rgba(0,0,0,0.3)
  - Hover: 0 20px 50px rgba(rarity-color, 0.4)
  - Transition: 0.3s cubic-bezier(0.4,0,0.2,1)
```

### 2. Illustration Area
**Purpose:** Hero artwork display  
**Behavior:**
```
Size:       65% of card height, width: 100%
Position:   Absolute, top: 0, bleeds to edges
Background: Image (artwork)
Fallback:   GenerativeCardArt component for missing images
Filters:    
  - None (base state)
  - brightness(1.1) on hover (highlight)
  - Transition: 0.4s ease-out
```

### 3. Bottom Gradient Overlay
**Purpose:** Text readability, visual polish  
**Behavior:**
```
Height:     25% of card height (bottom zone)
Position:   Absolute, bottom: 0, full width
Background: Linear gradient (transparent → opaque black)
Z-index:    2
Opacity:    Blends with card background
```

### 4. Card Name Badge (Base)
**Purpose:** Primary identifier, always visible  
**Behavior:**
```
Position:   Absolute, bottom: 12px, left: 16px
Size:       1.25rem (md card)
Font:       Serif, bold
Color:      Rarity primary color with glow
Effect:     text-shadow glow (rarity-based intensity)
Baseline:   Consistent vertical alignment
```

### 5. Rarity Indicator (Base)
**Purpose:** Quick rarity identification  
**Behavior:**
```
Position:   Absolute, bottom: 12px, right: 12px
Size:       20px × 20px
Icon:       Gem/star shape in rarity color
Opacity:    Full (always visible)
Shadow:     Subtle drop shadow for depth
Hover:      Subtle scale (1 → 1.1) on card hover
```

### 6. Type Icon (Base)
**Purpose:** Dad type identification  
**Behavior:**
```
Position:   Absolute, top: 12px, left: 12px
Size:       28px × 28px (md card, responsive)
Background: 
  - Color: Dad type color
  - Opacity: 0.9
  - Border-radius: 6px
Icon:       Type symbol (SVG or emoji)
Opacity:    Readable but not dominating
```

### 7. Information Bar (Hover State)
**Purpose:** Display type, key stats, and ability  
**Behavior:**
```
Position:   Absolute, top: 60%, full width
Height:     Auto, min 40px
Background: rgba(0,0,0,0.7) backdrop blur
Padding:    12px 16px
Layout:     3-column grid (Type | Stat1 | Stat2)
Visibility: 
  - Hidden (base state)
  - Fade in (hover, 0.3s)
  - Visible on mobile (tap to reveal)
Content:
  - Type: "BBQ DAD" (bold, color-coded)
  - Stats: Key stats (only 2-3 most relevant)
  - Ability: Short ability name or effect
Transition: opacity 0.3s cubic-bezier(0.4,0,0.2,1)
```

### 8. Ability Section (Full Details)
**Purpose:** Complete ability information  
**Trigger:** Click/long-press reveals modal or bottom sheet  
**Content:**
```
Ability Name:     Bold, rarity-colored
Ability Effect:   Plain text, detailed description
Card Type:        If special (ITEM, EVENT, etc.)
Effects:          Structured list of game effects
Flavor Text:      Italic, secondary color
```

---

## Holographic Effects

### Base Card (Non-Holographic)
```
Effects: None (clean, minimal)
Appearance: Flat, matte finish with gradient background
Focus: Artwork and information clarity
```

### Standard Holographic Variant
**Effect Type:** "standard"  
**CSS Approach:**
```css
/* Subtle iridescent shine */
background: 
  linear-gradient(
    45deg,
    transparent 0%,
    rgba(255,255,255,0.1) 25%,
    transparent 50%
  );
background-size: 200% 200%;
animation: holoShimmer 3s linear infinite;

@keyframes holoShimmer {
  0% { background-position: 0% 0%; }
  100% { background-position: 200% 200%; }
}

/* Glow effect */
box-shadow:
  0 0 20px var(--glow-color),
  inset 0 0 20px rgba(255,255,255,0.1);
```

**Visual Result:**
- Subtle rainbow shimmer across the card
- Soft glow around edges
- Slow, gentle animation (3s cycle)
- Feels premium, not overdone

---

### Reverse Holographic Variant
**Effect Type:** "reverse"  
**CSS Approach:**
```css
/* Holographic background only, matte illustration */
.illustration { filter: brightness(0.9); }

.card-face::before {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    linear-gradient(
      135deg,
      rgba(255,0,255,0.1) 0%,
      rgba(0,255,255,0.1) 50%,
      rgba(255,255,0,0.1) 100%
    );
  animation: reverseHoloShimmer 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes reverseHoloShimmer {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
```

**Visual Result:**
- Background has rainbow iridescence
- Artwork remains clear and matte
- More dramatic effect than standard
- Animation slower and more fluid

---

### Full Art Holographic Variant
**Effect Type:** "full_art"  
**CSS Approach:**
```css
/* Holographic effect across entire card */
.card-face::after {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    linear-gradient(
      45deg,
      rgba(255,0,127,0.15) 0%,
      rgba(0,255,255,0.15) 25%,
      rgba(0,127,255,0.15) 50%,
      rgba(255,0,255,0.15) 75%,
      rgba(255,255,0,0.15) 100%
    );
  background-size: 400% 400%;
  animation: fullArtHoloShimmer 5s ease infinite;
  mix-blend-mode: screen;
  pointer-events: none;
}

@keyframes fullArtHoloShimmer {
  0% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
  100% { background-position: 0% 0%; }
}
```

**Visual Result:**
- Rainbow shimmer visible across entire card surface
- Artwork shows through with enhanced colors
- Slow, graceful animation (5s cycle)
- Premium, eye-catching effect

---

### Prismatic Holographic Variant (Mythic Only)
**Effect Type:** "prismatic"  
**CSS Approach:**
```css
.card-face {
  position: relative;
  overflow: hidden;
}

/* Multi-layer prismatic effect */
.card-face::before {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    conic-gradient(
      from 0deg at 50% 50%,
      #ff0080,
      #ff8c00,
      #40ff00,
      #00ffff,
      #0080ff,
      #8000ff,
      #ff0080
    );
  opacity: 0.2;
  animation: prismRotate 8s linear infinite;
  pointer-events: none;
}

.card-face::after {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    linear-gradient(
      135deg,
      rgba(255,255,255,0.3) 0%,
      transparent 50%,
      rgba(255,255,255,0.2) 100%
    );
  animation: prismaticShine 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes prismRotate {
  0% { transform: rotateZ(0deg); }
  100% { transform: rotateZ(360deg); }
}

@keyframes prismaticShine {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.4; }
}

/* Enhanced glow for mythic */
box-shadow:
  0 0 30px var(--glow-color),
  0 0 60px var(--glow-color),
  inset 0 0 30px rgba(255,255,255,0.2);
```

**Visual Result:**
- Rainbow conic gradient rotates slowly
- Combined with shimmer effect for complexity
- Bright, intense glow
- Eye-catching, legendary feel
- Premium animation chain (rotating + shining)

---

### Holo Effect Configuration
```typescript
interface HoloEffectConfig {
  type: 'none' | 'standard' | 'reverse' | 'full_art' | 'prismatic';
  glowIntensity: number;  // 0.6 → 1.6 based on rarity
  animationDuration: number; // 3s → 8s
  animationIntensity: number; // opacity, color intensity
  enableOnMobile: boolean; // Performance consideration
}

const HOLO_CONFIG: Record<HoloVariant, HoloEffectConfig> = {
  none: {
    type: 'none',
    glowIntensity: 0,
    animationDuration: 0,
    animationIntensity: 0,
    enableOnMobile: true,
  },
  standard: {
    type: 'standard',
    glowIntensity: 0.8,
    animationDuration: 3000,
    animationIntensity: 0.1,
    enableOnMobile: true,
  },
  reverse: {
    type: 'reverse',
    glowIntensity: 1.0,
    animationDuration: 4000,
    animationIntensity: 0.3,
    enableOnMobile: true,
  },
  full_art: {
    type: 'full_art',
    glowIntensity: 1.2,
    animationDuration: 5000,
    animationIntensity: 0.15,
    enableOnMobile: false, // More GPU intensive
  },
  prismatic: {
    type: 'prismatic',
    glowIntensity: 1.6,
    animationDuration: 8000,
    animationIntensity: 0.4,
    enableOnMobile: false, // Most intensive
  },
};
```

---

## Interactive States

### Base State (Resting)
```
Visibility:
  - Card name ✓ (visible)
  - Rarity icon ✓ (visible)
  - Type icon ✓ (visible)
  - Info bar ✗ (hidden)
  - Details modal ✗ (hidden)

Styling:
  - Border: Rarity color, normal thickness
  - Shadow: Subtle (0 10px 30px)
  - Illustration: Normal brightness
  - Glow: Subtle pulse (if holographic)

Interaction Zones:
  - Hover: Entire card
  - Click: Open detail modal
```

### Hover State (Desktop)
**Trigger:** Mouse enters card  
**Duration:** Smooth transition 0.3s  
**Changes:**
```
Visual Updates:
  ✓ Info bar fades in (opacity: 0 → 1)
  ✓ Border glows (glow-color, intensity × 1.5)
  ✓ Shadow expands (0 20px 50px)
  ✓ Illustration brightens (brightness: 1 → 1.1)
  ✓ Card lifts slightly (transform: translateY(-4px))
  ✓ Rarity icon scales (scale: 1 → 1.15)

Information Revealed:
  - Type label (e.g., "LEGENDARY")
  - Key stats (2-3 most relevant)
  - Short ability description

Cursor: pointer

Accessibility: Focus visible on keyboard tab
```

### Active/Click State
**Trigger:** User clicks card  
**Action:** Open detail modal/bottom sheet  
**Timing:** Immediate  
**Effect:**
```
Card animation: Small scale down (0.98) for 0.1s, then return
Modal opens with fade-in animation (0.3s)
```

### Touch State (Mobile)
**Trigger:** Tap card  
**Behavior:**
```
First tap: Reveal info bar (toggle visible)
Second tap: Open detail modal
Long-press: Quick preview (hold to see details)

Hover-like effects:
  - Slightly larger border glow
  - Info bar appears with tap feedback
  - No translation (avoids layout shift)

Optimizations:
  - Disable expensive animations (prismatic, full_art)
  - Use `touch-action: manipulation`
  - Debounce tap events (200ms)
```

### Loading State
**Trigger:** Image loading, async data  
**Behavior:**
```
Illustration area:
  - Placeholder: Gradient skeleton matching card rarity
  - Fallback: GenerativeCardArt component
  - Transition: Fade in when loaded (0.4s)

Info bar:
  - Blur effect (filter: blur(4px))
  - Opacity reduced (0.5)
  - Pulsing animation (opacity 0.5 → 0.8 → 0.5, 1.5s)

Duration: Until image or data loads
```

### Disabled State
**Trigger:** Card locked, unavailable, or in-use  
**Styling:**
```
Opacity: 0.6
Filter: grayscale(0.8) brightness(0.9)
Cursor: not-allowed
Interaction: No hover effects, click blocked
Border: Desaturated rarity color
```

---

## Information Architecture

### Always Visible (Passive)
These elements don't require interaction to see:
- **Illustration** - Card artwork (65% of card)
- **Card name** - Bottom-left corner
- **Rarity icon** - Bottom-right corner
- **Type icon** - Top-left corner

**Why:** Quick identification without interaction

---

### Visible on Hover/Tap (Active)
Revealed when user hovers or taps:
- **Type label** - "LEGENDARY", "EPIC", etc.
- **Dad type name** - "BBQ_DAD", "FIX_IT_DAD", etc.
- **Key stats** - 2-3 most relevant to card type
- **Short ability** - Primary ability name

**Why:** Minimize clutter while providing quick context

---

### Full Details (Modal)
Click to reveal comprehensive info:
- **All stats** - 8-stat radar chart or bar display
- **Full abilities** - Multiple ability descriptions
- **Flavor text** - The witty dad joke text
- **Card metadata** - Artist, series, card number
- **Collection info** - How many you own, duplicates
- **Action buttons** - Upgrade, add to wishlist, trade
- **Seasonal info** - Season and year released

**Why:** Detailed gameplay info without cluttering card view

---

### Stat Display Options (in Modal)

**Option A: Radar Chart**
```
- Hexagon shape with 8 axes (one per stat)
- Filled area shows card's stat profile
- Colorized by stat (not rarity)
- Interactive: hover axis for stat name & value
- Works well for comparing cards side-by-side
```

**Option B: Bar Chart**
```
- 8 horizontal bars, one per stat
- Length represents value (0-100)
- Colored by stat type
- Shows exact number on bar
- More readable on mobile
```

**Option C: Minimal List**
```
- Simple 2-column layout
- Left: Stat name (icon + text)
- Right: Value (0-100) with visual bar
- Compact, scannable
- Mobile-friendly
```

**Recommendation:** Use **Option A (Radar)** for detail modal; show **top 3 stats** as bar snippets in hover info bar.

---

## Special Card Types

### Regular Cards (Base Cards)
```
Layout: Standard (as above)
Stats: All 8 displayed
Abilities: 1-3 ability effects
Border: Rarity-based color
Glow: Standard rarity glow
Example: "Grillmaster Gary" (BBQ_DAD, Rare)
```

### Item Cards
```
Layout: 
  - 60% illustration (slightly reduced)
  - 40% equipment info
  
Header: Equipment icon + name
Stats: N/A (no stats for items)
Abilities: 2-4 equipment effects
Example: "Deluxe Spatula" (grants +10 Grill Skill)

Visual: Slightly different border treatment
Glow: Same as rarity
```

### Event Cards (Shitshow Scenarios)
```
Layout:
  - 50% illustration
  - 50% event effect text
  
Header: Event icon + name
Effect: Large, prominent (3-5 lines)
Stats: N/A
Duration: Optional (one-time vs. persistent)
Example: "BBQ Sauce Explosion" (all players take 5 damage)

Visual: Unique border pattern (dashed or hatched)
Color: Rarity-based but with event icon
```

### Terrain Cards (Suburban Shitfields)
```
Layout:
  - Large illustration (70%)
  - Small terrain effect zone (30%)
  
Header: Terrain icon + name
Effects: 2-3 field effects
Stats: N/A
Duration: Persistent (until played)
Example: "Neighbor's Pool Party" (opponent draw +1)

Visual: Textured border, special corner markers
Glow: Subtle, environmental effect
```

### Evolution Cards (Midlife Crisis Mutations)
```
Layout:
  - 55% evolved form illustration
  - 20% base form thumbnail (top-left)
  - 25% evolution effect text
  
Header: "Evolution of [Base Name]"
Base Form: Small card image showing previous form
Effect: How the upgrade changes stats/abilities
Stats: Both base and evolved stats displayed
Example: "Grillmaster Gary → Grillmaster Bobby (Platinum)"

Visual: Evolution arrow between forms
Glow: Enhanced (represents transformation)
```

### Curse Cards (Dad Damnations)
```
Layout: Standard + curse indicator
Stats: Curse strength (0-100)
Abilities: Curse effects (negative effects)
Target: Opponent or field
Duration: Removable or persistent
Example: "Lawn Curse" (opponent can't mow this turn)

Visual: Dark border, purple/red glow
Color: Special curse palette (desaturated)
```

### Trap Cards (Suburban Suckerpunches)
```
Layout: Hidden face-down + reveal animation
Stats: Trigger conditions
Abilities: Trap effect
Trigger: Opponent action (e.g., "when opponent plays red card")
Example: "Surprise Inspection" (reveal opponent's hand)

Visual: Special "face-down" card back
Glow: Muted until triggered
Animation: Quick flip animation on trigger
```

---

## Responsive Behavior

### Desktop (1024px+)
```
Card size: lg (384px × 537px)
Layout: Grid or list with spacing
Hover: Full interactive state enabled
Holo effects: All enabled (prismatic, full_art)
Info bar: Appears on hover smoothly
Modal: Desktop center modal with backdrop
```

### Tablet (768px - 1024px)
```
Card size: md (288px × 403px)
Layout: 2-3 columns grid
Hover: Limited (some devices support hover)
Touch: Primary interaction method
Holo effects: Standard and reverse enabled (no prismatic)
Info bar: Tap to reveal
Modal: Full-screen modal or bottom sheet (1/3 height)
```

### Mobile (< 768px)
```
Card size: sm (192px × 268px) to md (288px × 403px)
Layout: 2-column grid or stack vertically
Touch: Only interaction method
Hover: N/A (no hover effects)
Holo effects: Standard only (disabled for performance)
Info bar: Tap to reveal/toggle
Modal: Full-screen bottom sheet or stacked overlay
Gestures: Swipe to navigate, long-press for quick preview
```

### Responsive Info Bar
```
Desktop:
  - Fixed position (center)
  - 3-column layout (Type | Stat1 | Stat2)
  - 40px height
  - Full opacity

Mobile:
  - Full-width overlay
  - 2-column or stacked layout
  - Larger hit targets (48px+)
  - Tap to toggle visibility
```

---

## Accessibility

### Color & Contrast
```
✓ Rarity colors meet WCAG AA (4.5:1) minimum for white text
✓ No information conveyed by color alone (icons + text)
✓ Dark mode default (reduces eye strain for collectors)
✓ High contrast toggles available in settings
```

### Keyboard Navigation
```
✓ Tab order: Left-to-right, top-to-bottom
✓ Focus visible: 2px outline in rarity color
✓ Enter/Space: Open card detail modal
✓ Escape: Close modal
✓ Arrow keys: Navigate adjacent cards (grid view)
✓ Skip links: Jump to main card grid
```

### Screen Readers
```
✓ Card name as primary heading (h2)
✓ Rarity and type announced
✓ Stats readable as list (not just visual)
✓ Ability descriptions text content
✓ Aria-labels on interactive buttons
✓ Proper semantic HTML (button, img, etc.)

Example Announcement:
"Grillmaster Gary, Legendary BBQ Dad card
Rarity 5 stars
Stats: Dad Joke 75, Grill Skill 95, Fix It 40, Nap Power 30
Ability: Perfect Sear - Flip a burger. If rare, gain +10 Grill Skill
Button: Open details, Add to wishlist, Upgrade card"
```

### Motion & Animation
```
✓ Respects prefers-reduced-motion
✓ All animations removed or instant transitions
✓ No auto-playing animations (glow pulse disabled)
✓ User-triggered interactions only
```

### Touch & Mobile
```
✓ Hit targets minimum 44px × 44px
✓ No hover-only interactions (all have tap equivalent)
✓ Enough padding between cards (16px+)
✓ Readable text at small sizes (min 12px)
✓ Landscape orientation supported
```

---

## Implementation Details

### File Structure
```
src/components/card/
├── Card.svelte                 # Main component (refactored)
├── CardIllustration.svelte    # Illustration layer
├── CardNameBadge.svelte       # Name & rarity indicator
├── CardInfoBar.svelte         # Hover/tap info bar
├── CardDetailModal.svelte     # Full details modal
├── HoloEffect.svelte          # Holographic effects
├── StatDisplay.svelte         # Stats visualization (radar, bar, or list)
├── SpecialCardTypes.svelte    # Item, Event, Terrain, etc.
└── styles/
    ├── card-base.css          # Shared styles
    ├── card-holo.css          # Holographic effects
    ├── card-interactive.css   # Hover & states
    └── card-responsive.css    # Breakpoint styles
```

### Svelte Component Props

**Card.svelte**
```typescript
interface Props {
  card: PackCard;
  size?: 'sm' | 'md' | 'lg';              // Default: 'md'
  interactive?: boolean;                   // Default: true
  showDetails?: boolean;                   // Default: false (open modal)
  enableHoverInfo?: boolean;               // Default: true
  enableHoloEffects?: boolean;             // Auto-detected (mobile = false)
  onDetailClick?: () => void;
  onWishlistToggle?: (wishlisted: boolean) => void;
  compareMode?: boolean;                   // Side-by-side comparison mode
}
```

### CSS Variables (Per Card)
```css
--rarity-color: <rarity primary>;
--rarity-dark: <rarity dark>;
--rarity-glow: <rarity glow>;
--glow-intensity: <0.6 to 1.6>;
--border-thickness: <2px to 8px>;
--type-color: <dad type color>;
--shadow-blur: <10px to 30px>;
```

### Key Animations

**Hover In (0.3s)**
```
Info bar:   opacity 0 → 1
Border:     brightness 1 → 1.2
Shadow:     0 10px 30px → 0 20px 50px
Illustration: brightness 1 → 1.1
Rarity icon: scale 1 → 1.15
Card:       translateY 0 → -4px
```

**Holo Shimmer (3-8s loop)**
```
Shimmer position: translates across card
Opacity pulse: 0.2 → 0.4 → 0.2
Glow intensity: varies with animation phase
Smooth, continuous loop
```

**Tap Feedback (0.1s)**
```
Scale: 1 → 0.98 → 1 (click compression)
Haptic: Vibrate (if supported)
Ripple: Optional expand-circle effect
```

### Performance Optimizations

```typescript
// Disable expensive effects on low-end devices
const shouldEnableFullHolo = () => {
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 8;
  const isMobile = /mobile/i.test(navigator.userAgent);
  
  return !(isMobile && (cores < 4 || memory < 4));
};

// Use requestAnimationFrame for smooth animations
let frameId: number | null = null;

onMount(() => {
  frameId = requestAnimationFrame(updateAnimation);
  return () => {
    if (frameId) cancelAnimationFrame(frameId);
  };
});

// Lazy load detail modal content
const detailsVisible = writable(false);
const detailsLoaded = derived(detailsVisible, $v => $v);
```

### Browser Support
```
Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
CSS Features: grid, flexbox, backdrop-filter, CSS variables
JS Features: ES2020, requestAnimationFrame, IntersectionObserver
Fallbacks: No holo effects in unsupported browsers
```

---

## Migration Path from Current Implementation

### Phase 1: Refactor Component Structure
1. Extract illustration into CardIllustration.svelte
2. Create CardNameBadge.svelte for name + rarity
3. Create CardInfoBar.svelte for hover state

### Phase 2: Implement New Styling
1. Replace card background with rarity gradients
2. Update border styling (thickness scaling)
3. Refine typography (serif names, better contrast)

### Phase 3: Enhanced Interactions
1. Implement smooth hover transitions
2. Add info bar reveal/hide logic
3. Mobile tap-to-reveal functionality

### Phase 4: Holographic Effects
1. Create HoloEffect.svelte with configurable types
2. Integrate into Card.svelte conditionally
3. Add performance detection

### Phase 5: Polish & Details
1. Fine-tune animations and timings
2. Accessibility audit and fixes
3. Mobile & tablet testing
4. Performance optimization

---

## Success Criteria

✓ Card looks like premium TCG collectible  
✓ Information hierarchy clear (not cluttered)  
✓ Hover/tap reveals relevant info smoothly  
✓ Holographic effects are subtle but noticeable  
✓ Mobile experience is touch-first  
✓ Performance is smooth (60fps on mid-tier devices)  
✓ Accessibility standards met (WCAG AA)  
✓ Responsive across all breakpoints  

---

**Next Step:** Review this spec and approve before implementation begins.

Questions or changes needed?
