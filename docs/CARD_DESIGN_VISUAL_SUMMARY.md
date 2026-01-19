# Card Design Visual Summary

## Quick Reference Guide

### Card Layout Grid
```
┌─────────────────────────────────────────┐
│ [Type Icon]                    65%      │
│ (28×28)      ILLUSTRATION AREA (bleeds)│
│                                        │
│                                        │
│                                    [+]  │  "+" = Rarity gem
│                                        │
├─────────────────────────────────────────┤
│ [Info Bar - Hover State]                │  ← Fades in on hover
│ Type | Stat1 | Stat2                    │
├─────────────────────────────────────────┤
│ CARD NAME                         ◆     │  ◆ = Rarity indicator
│ (1.25rem, serif, gold glow)        6%   │
└─────────────────────────────────────────┘
```

### Color Palette (Rarity-Based)

| Rarity | Primary | Glow | Border | Intensity |
|--------|---------|------|--------|-----------|
| Common | #9ca3af | #9ca3af | #9ca3af | 0.6× |
| Uncommon | #3b82f6 | #60a5fa | #60a5fa | 0.8× |
| Rare | #eab308 | #facc15 | #f59e0b | 1.0× |
| Epic | #a855f7 | #c084fc | #c084fc | 1.2× |
| Legendary | #f97316 | #fb923c | #fb923c | 1.4× |
| Mythic | #ec4899 | #f472b6 | #f472b6 | 1.6× |

---

### Interactive States Timeline

```
BASE STATE (Resting)
│
├─ Hover detected (desktop)
│  │
│  ├─ Border glow begins (0.1s)
│  ├─ Illustration brightens (0.3s curve)
│  ├─ Card lifts -4px (0.3s ease-out)
│  ├─ Info bar fades in (0.3s)
│  ├─ Rarity icon scales 1→1.15 (0.3s)
│  │
│  └─ HOVER STATE (Stable)
│     ├─ Glow pulses continuously
│     ├─ Info visible (Type, 2 stats, ability)
│     └─ Ready for click
│
├─ Click detected
│  │
│  ├─ Card compresses 1→0.98 (0.1s)
│  ├─ Modal begins fade-in (0.3s)
│  │
│  └─ DETAIL MODAL OPEN
│     └─ Full info visible
│
└─ Touch state (mobile)
   │
   ├─ First tap: Toggle info bar
   ├─ Second tap: Open detail modal
   ├─ Long-press: Quick preview
   │
   └─ NO HOVER EFFECTS on mobile
```

---

### Holographic Effect Variants

```
STANDARD HOLO
- Subtle iridescent shimmer (3s cycle)
- Soft glow around edges
- 20px shimmer width
- Opacity 0.1 effect layer
- Perfect for: Uncommon, Rare

REVERSE HOLO  
- Matte illustration + holographic background
- Rainbow gradient in background only
- Slower animation (4s cycle)
- 30% peak opacity
- Perfect for: Rare, Epic

FULL ART HOLO
- Entire card has holographic effect
- Mix-blend-mode: screen (additive)
- Medium-speed animation (5s)
- Rainbow + shimmer combo
- Perfect for: Epic, Legendary

PRISMATIC HOLO (Mythic Only)
- Rotating conic gradient (8s rotation)
- Combined with shimmer effect
- Intense glow (2× intensity)
- Multi-layer animations
- Perfect for: Mythic (most dramatic)
```

---

### Information Reveal Hierarchy

**LEVEL 1: Always Visible**
```
├─ Illustration (65%)
├─ Card Name (bottom-left)
├─ Rarity Icon (bottom-right)
└─ Type Icon (top-left)
```

**LEVEL 2: Hover/Tap Reveal (Info Bar)**
```
├─ Type Label ("LEGENDARY", "EPIC", etc.)
├─ Dad Type ("BBQ_DAD", "FIX_IT_DAD", etc.)
├─ Key Stat 1 (e.g., Grill Skill: 95)
├─ Key Stat 2 (e.g., Dad Joke: 75)
└─ Primary Ability (short description)
```

**LEVEL 3: Click → Detail Modal**
```
├─ Full Ability Descriptions (1-3 abilities)
├─ All 8 Stats (radar or bar chart)
├─ Flavor Text (witty dad joke)
├─ Card Metadata (artist, series, number)
├─ Collection Info (ownership, duplicates)
├─ Action Buttons (Upgrade, Wishlist, Trade)
└─ Seasonal Info (if applicable)
```

---

### Responsive Sizes

```
MOBILE (< 768px)
├─ Card: sm (192px × 268px)
├─ Grid: 2 columns
├─ Holo: Standard only (disabled for perf)
├─ Info: Tap to toggle
└─ Modal: Full-screen bottom sheet

TABLET (768px - 1024px)
├─ Card: md (288px × 403px)
├─ Grid: 2-3 columns
├─ Holo: Standard + Reverse (no prismatic)
├─ Info: Appears on hover (some devices)
└─ Modal: 2/3 height bottom sheet

DESKTOP (1024px+)
├─ Card: lg (384px × 537px)
├─ Grid: 3-4 columns
├─ Holo: All enabled (including prismatic)
├─ Info: Smooth hover reveal
└─ Modal: Centered overlay with backdrop
```

---

### Typography Scale

```
CARD NAME
└─ Size: 1.25rem (md card)
   Weight: 600 (semibold)
   Family: Serif (Georgia, Times New Roman)
   Color: Rarity primary + glow
   Effect: text-shadow 0 0 8px rgba(color, 0.8)

TYPE LABEL (Hover)
└─ Size: 0.75rem (12px)
   Weight: 500 (medium)
   Color: rgba(255,255,255,0.9)

STAT VALUES (Hover)
└─ Size: 0.6875rem (11px)
   Weight: 600 (bold)
   Color: Rarity color or white
   Layout: Monospace-aligned

ABILITY TEXT
└─ Size: 0.6875rem (11px)
   Weight: 400 (regular)
   Color: rgba(255,255,255,0.85)
   Style: Line-height 1.4

FLAVOR TEXT (Modal)
└─ Size: 0.625rem (10px)
   Weight: 400 (regular)
   Color: rgba(255,255,255,0.6)
   Style: Italic
```

---

### Special Card Types

| Type | Layout | Stats | Border | Example |
|------|--------|-------|--------|---------|
| Regular | 65% art, 35% info | Yes (8) | Rarity-based | Grillmaster Gary |
| Item | 60% art, 40% effect | No | Solid | Deluxe Spatula |
| Event | 50/50 split | No | Dashed | BBQ Sauce Explosion |
| Terrain | 70% art, 30% effect | No | Textured | Neighbor's Pool Party |
| Evolution | 55% art, base thumbnail, effect | Yes | Evolution arrow | Gary → Bobby |
| Curse | Standard + indicator | Yes | Dark/purple | Lawn Curse |
| Trap | Face-down, flip on trigger | Trigger conditions | Muted | Surprise Inspection |

---

### Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Card hover animation | 0.3s | Smooth, no jank |
| Holo effect | 60fps | GPU-accelerated |
| Modal open | 0.3s fade-in | Snappy |
| Load artwork | < 2s | Placeholder until loaded |
| Mobile touch response | < 100ms | Immediate feedback |
| Full page (10 cards) | < 3s load | Total page time |

---

### Accessibility Checklist

✓ **Color Contrast**
  - White text on rarity colors ≥ 4.5:1 (WCAG AA)
  - No info by color alone (icons + labels)

✓ **Keyboard Navigation**
  - Tab order: left-to-right, top-to-bottom
  - Focus visible: 2px outline in rarity color
  - Enter: Open card details
  - Escape: Close modal

✓ **Screen Readers**
  - Semantic HTML (button, img, heading)
  - Aria-labels on interactive elements
  - Stats announced as list
  - Ability descriptions readable

✓ **Motion**
  - Respects prefers-reduced-motion
  - No auto-playing animations
  - User-triggered only

✓ **Touch**
  - Hit targets: minimum 44×44px
  - No hover-only interactions
  - 16px+ padding between cards
  - Readable at small sizes (12px+)

---

### Component Dependencies

```
Card.svelte (main)
├─ CardIllustration.svelte
│  └─ GenerativeCardArt.svelte (fallback)
├─ CardNameBadge.svelte
├─ RarityIcon.svelte
├─ TypeIcon.svelte
├─ CardInfoBar.svelte (appears on hover)
│  └─ StatDisplay.svelte (2-3 key stats)
├─ HoloEffect.svelte (if enabled)
│  ├─ StandardHolo.svelte
│  ├─ ReverseHolo.svelte
│  ├─ FullArtHolo.svelte
│  └─ PrismaticHolo.svelte
├─ CardDetailModal.svelte (on click)
│  ├─ StatChart.svelte (radar or bar)
│  ├─ AbilityList.svelte
│  ├─ FlavorText.svelte
│  └─ ActionButtons.svelte
└─ SpecialCardTypes.svelte (items, events, etc.)
```

---

## Design Tokens (CSS Variables)

```css
/* Rarity-based tokens */
--rarity-primary: /* dynamic */
--rarity-dark: /* dynamic */
--rarity-light: /* dynamic */
--rarity-glow: /* dynamic */
--glow-intensity: /* 0.6 to 1.6 */

/* Border & shadow */
--border-thickness: /* 2px to 8px */
--shadow-blur: /* 10px to 30px */
--shadow-spread: /* 0 to 10px */

/* Timing functions */
--transition-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--transition-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Spacing */
--card-padding: 16px;
--card-gap: 12px;
```

---

## Before/After Comparison

### BEFORE (Current Implementation)
```
✗ Cluttered card face (too much text)
✗ All stats visible (visual noise)
✗ Weak visual hierarchy
✗ Inconsistent rarity styling
✗ Basic holo effects (needs enhancement)
✗ No smooth transitions
```

### AFTER (New Design)
```
✓ Clean, illustration-focused
✓ Progressive information reveal
✓ Clear visual hierarchy
✓ Rarity drives entire aesthetic
✓ Premium holo effects with performance optimization
✓ Smooth, polished transitions
✓ Modern TCG premium aesthetic
✓ Mobile-first interaction model
```

---

## Review Checklist

- [ ] Layout proportions feel right (65% art, 35% info)?
- [ ] Color palette matches rarity tiers visually?
- [ ] Information hierarchy makes sense?
- [ ] Holographic effects are premium but not overdone?
- [ ] Interactive states are clear and intuitive?
- [ ] Responsive breakpoints cover all devices?
- [ ] Special card types are visually distinct?
- [ ] Accessibility requirements met?
- [ ] Performance targets achievable?
- [ ] Ready to proceed with implementation?

---

**Status:** Design Spec Complete ✓  
**Next Phase:** Implementation (Component Refactoring)
