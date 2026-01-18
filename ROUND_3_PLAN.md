# Round 3: Enhanced Card Detail Modal - Implementation Plan

## Overview
Upgrade the card viewing experience with:
- **3D Card Flip** - Realistic front/back animation
- **Zoom Functionality** - Pan & zoom interactive viewing
- **Set Information** - Card number, rarity tiers, progression
- **Full Stats Dashboard** - Radar chart, stat comparisons, ratings
- **Collection Context** - Owned count, first pull date, trade status

## 🎯 Deliverables

### 1. Enhanced 3D Card Flip Component (`Card3DFlip.svelte`)
**Goal**: Replace basic CSS flip with immersive 3D perspective

**Features:**
- Realistic perspective transform
- Mouse/touch interaction (drag to flip)
- Smooth easing (cubic-bezier for realism)
- Back side showing holographic pattern
- Particle effects on flip completion
- Gyroscope support for mobile (tilt to see depth)
- Auto-rotate option for showcase mode

**Lines:** ~350
**Props:**
- `card: PackCard`
- `autoRotate: boolean = false`
- `interactive: boolean = true`
- `showParticles: boolean = true`

### 2. Interactive Zoom Modal (`ZoomableCardModal.svelte`)
**Goal**: Advanced viewing with pan & zoom capabilities

**Features:**
- Pinch-to-zoom (mobile)
- Mouse wheel zoom (desktop)
- Drag to pan when zoomed
- Zoom limits (1x to 3x)
- Zoom percentage indicator
- Reset zoom button
- Smooth transitions
- Touch gesture support

**Lines:** ~400
**Props:**
- `card: PackCard`
- `isOpen: boolean`
- `maxZoom: number = 3`
- `minZoom: number = 1`

### 3. Enhanced Stats Dashboard (`EnhancedCardStats.svelte`)
**Goal**: Rich visual stats with comparisons

**Features:**
- Radar chart with all 8 stats
- Individual stat bars with animated fill
- Stat ratings (Terrible → Legendary)
- Type-based stat bonuses highlighted
- Comparative stats (vs average, vs best in type)
- Stat descriptions on hover/tap
- Rarity-specific styling

**Lines:** ~450
**Props:**
- `card: PackCard`
- `showComparison: boolean = true`
- `showRatings: boolean = true`

### 4. Set Information Panel (`CardSetInfo.svelte`)
**Goal**: Complete card identity & progression

**Features:**
- Card number with visual progress bar (#42/50)
- Rarity tier progression (show all rarities in series)
- Holoraphic variant info
- Edition/season badge
- Collector's notes placeholder
- Set completion percentage
- Missing cards from set (if owned <50%)

**Lines:** ~300
**Props:**
- `card: PackCard`
- `ownedCount: number`
- `seriesTotal: number`

### 5. Collection Context Footer (`CardCollectionContext.svelte`)
**Goal**: Ownership & status info

**Features:**
- Owned count with trading availability
- First pull date with streak indicator
- Holo/variant ownership status
- Favorite/wishlist toggle buttons
- Quick deck builder integration
- Trade offer quick actions

**Lines:** ~250
**Props:**
- `card: PackCard`
- `ownedCount: number`
- `onAddToDeck: () => void`
- `onStartTrade: () => void`

### 6. Updated Lightbox Store Enhancement
**Goal**: Support new zoom/flip modes

**Updates:**
- Add `cardViewMode: 'default' | '3d' | 'zoom'`
- Add `zoomLevel: number`
- Add `isFlipped: boolean`
- Add action for updating these

**Lines:** ~50 additions

---

## 📐 Technical Details

### 3D Flip Implementation
```typescript
// CSS Transform approach for performance
perspective: 1000px;
transform: rotateY(calc(var(--flip-angle) * 1deg));
transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);

// Back side uses --flip-angle * -1 for facing out
// Particle effects trigger when Math.abs(flipAngle - lastFlipAngle) > 90
```

### Zoom Implementation
```typescript
// Smooth zoom with transform
transform: scale(zoomLevel);
transform-origin: center;

// Pan offset when zoomed
transform: translate(panX, panY) scale(zoomLevel);

// Gesture detection
on:wheel -> prevent default + adjust zoomLevel
on:touchstart/touchmove -> detect pinch distance
```

### Stats Visualization
```typescript
// Radar chart: 8 axes (one per stat)
// Use SVG for smooth lines and animations
// Animated fill from 0 to stat value on mount

// Stat bars: horizontal progress bars with rarity gradient
// Color matches rarity, width = stat/100
// Labels show stat name + value + rating tier
```

---

## 🎨 UI/UX Enhancements

### Layout Changes
```
┌──────────────────────────────────────────────┐
│  Close [X]  Card Name  Navigation [<] [>]    │
├─────────────────┬──────────────────────────┤
│                 │  Rarity | Type | Season  │
│   3D Card       │  ───────────────────────  │
│   (Flippable)   │  Set #42/50 [Progress]   │
│                 │  ───────────────────────  │
│   Click to      │  Stats Radar Chart       │
│   Flip          │  ───────────────────────  │
│                 │  Stat Bars (8 total)     │
├─────────────────┴──────────────────────────┤
│  Flavor Text (Centered, Large)              │
├─────────────────────────────────────────────┤
│  Abilities Section                          │
├─────────────────────────────────────────────┤
│  [Owned: 2] [Favorite ♡] [Add to Deck]     │
└─────────────────────────────────────────────┘
```

### Color Scheme
- Rarity-based border glow (matches card rarity)
- Stat bars use gradient from dark → rarity color
- Background: Dark slate with subtle stars/pattern
- Text: High contrast white on dark

### Animations
- **Card Flip**: 0.6s ease-out (cubic-bezier for bounce)
- **Stat Fill**: 0.8s staggered start (100ms between each)
- **Zoom**: 0.3s ease-out transitions
- **Particles**: 1s fade-out on completion

---

## 📦 Components to Create/Update

### New Files (1,750 total lines)
```
src/components/card/
├── Card3DFlip.svelte              (+350 lines)
├── ZoomableCardModal.svelte       (+400 lines)
├── EnhancedCardStats.svelte       (+450 lines)
├── CardSetInfo.svelte             (+300 lines)
├── CardCollectionContext.svelte   (+250 lines)
└── Card3DFlip.stories.ts          (+100 lines) [Storybook]
```

### Updated Files
```
src/stores/
└── lightbox.ts                    (+50 lines)

src/components/card/
└── CardLightbox.svelte            (+100 lines - integrate new components)

src/styles/
└── global.css                     (+150 lines - 3D transforms, animations)
```

---

## ✅ QA Checklist

### Desktop Testing
- [ ] 3D flip works smoothly (60fps)
- [ ] Mouse drag flip interaction
- [ ] Zoom with mouse wheel works
- [ ] Pan when zoomed
- [ ] Keyboard shortcuts (Space to flip, Esc to close)
- [ ] All rarity variants render correctly
- [ ] Stats visualization displays all 8 stats
- [ ] Radar chart animates on load

### Mobile Testing
- [ ] Touch flip (swipe or tap)
- [ ] Pinch-to-zoom works
- [ ] Gyroscope tilt (if enabled)
- [ ] No layout breaking on small screens
- [ ] Buttons easily tappable
- [ ] No performance issues on mid-tier devices

### Accessibility
- [ ] Keyboard navigation (arrows, space, escape)
- [ ] Screen reader labels for all sections
- [ ] High contrast text
- [ ] Color not the only differentiator
- [ ] Prefers-reduced-motion respected
- [ ] Focus indicators visible

### Cross-Browser
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (iOS)
- [ ] Mobile Chrome/Firefox

---

## 🚀 Execution Order

1. **Phase 1** (Day 1) - Core Components
   - Card3DFlip.svelte
   - CardSetInfo.svelte
   - Update lightbox store

2. **Phase 2** (Day 2) - Statistics
   - EnhancedCardStats.svelte
   - Radar chart visualization
   - Stat animations

3. **Phase 3** (Day 3) - Interaction
   - ZoomableCardModal.svelte
   - Zoom/pan gestures
   - Mobile optimization

4. **Phase 4** (Day 4) - Polish
   - CardCollectionContext.svelte
   - Integration testing
   - Performance optimization

---

## 📊 Success Metrics

- ✅ 3D flip smooth on 60fps (mid-tier devices)
- ✅ All 8 stats display with radar + bars
- ✅ Zoom works to 3x magnification
- ✅ Mobile pinch-to-zoom functional
- ✅ Zero console errors
- ✅ Accessibility score 95+
- ✅ Bundle size increase <50KB (gzipped)

---

**Status**: Ready for implementation
**Effort**: 4-5 hours
**Complexity**: High (3D transforms, gestures, complex SVG)
