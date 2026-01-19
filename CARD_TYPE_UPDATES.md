# Card Type Support Updates - Implementation Guide

## Overview
This document tracks updates to support new card types (EVENT, TERRAIN, EVOLUTION, CURSE, TRAP) across all Svelte and Astro components.

## Components to Update

### 1. src/components/card/Card.svelte
**Purpose:** Main card display component

**Changes Made:**
- ✅ Add `isSpecialCardType()` type guard function
- ✅ Add `getSpecialCardTypeLabel()` function for readable type names
- ✅ Add `getSpecialCardIcon()` function for type-specific icons
- ✅ Add `getSpecialCardBorderColor()` function for visual distinction
- ✅ Add special card type badge to card face (top-right corner)
- ✅ Add conditional glow effect based on card type
- ✅ Hide stats display for non-dad-archetype cards (EVENT, TERRAIN, CURSE, TRAP)
- ✅ Render card effects/abilities for special types
- ✅ Add visual indicator for effect count

**Key Features:**
```
- EVENT cards: ⚡ amber glow, show triggered effects
- TERRAIN cards: 🏘️ emerald glow, show field modifiers
- EVOLUTION cards: 🔄 purple glow, show stats (base + evolved)
- CURSE cards: 💀 red glow, show negative effects on opponent
- TRAP cards: 🪤 blue glow, show face-down trigger conditions
- ITEM cards: 🎁 orange glow, show equipment bonuses
```

### 2. src/components/card/CardStats.svelte
**Purpose:** Stat bar display component

**Changes Made:**
- ✅ Add type guards to detect special card types
- ✅ Add conditional rendering: only show stats for dad archetypes (BBQ_DAD, FIX_IT_DAD, etc.)
- ✅ Add "No stats" message for EVENT, TERRAIN, CURSE, TRAP cards
- ✅ For EVOLUTION cards: show both base and evolved stats
- ✅ For ITEM cards: show equipment bonuses instead of stats

**Rendering Logic:**
```typescript
- Regular dads: Show 8 stats (dadJoke, grillSkill, etc.)
- EVOLUTION: Show "Base Stats" + "Evolved Stats" sections
- ITEM: Show "Bonuses" - equipment stat boosts
- EVENT/TERRAIN/CURSE/TRAP: Show "No base stats - effect-based card"
```

### 3. src/components/pack/PackOpener.svelte
**Purpose:** Main pack opening animation controller

**Changes Made:**
- ✅ Add special card type detection during pack generation
- ✅ Add conditional animation parameters based on card type
- ✅ EVENT cards: Faster reveal (120ms instead of 300ms), electrical effect
- ✅ TERRAIN cards: Slower reveal (400ms), earth shake animation
- ✅ EVOLUTION cards: Standard reveal + mutation glow effect
- ✅ CURSE cards: Dark swirl animation, ominous sound
- ✅ TRAP cards: Face-down reveal, trigger animation on hover
- ✅ ITEM cards: Shimmer effect, equipment jingle sound
- ✅ Pass card type to CardRevealer component for specialized animations

**Animation Timings:**
```
EVENT: 120ms (fast + snappy)
TERRAIN: 400ms (slow + impactful)
EVOLUTION: 300ms (standard + glow)
CURSE: 300ms (standard + dark)
TRAP: 300ms (standard + hidden)
ITEM: 250ms (medium + shimmer)
DAD ARCHETYPES: 300ms (baseline)
```

### 4. src/components/collection/CollectionManager.svelte
**Purpose:** Collection display and management

**Changes Made:**
- ✅ Add special card type section in filters
- ✅ Add filter chips for EVENT, TERRAIN, EVOLUTION, CURSE, TRAP
- ✅ Add "Card Type" category dropdown
- ✅ Add visual badges for card type in grid
- ✅ Add filter logic to include/exclude special types
- ✅ Add sorting by card type (special types grouped)
- ✅ Add count badges per card type
- ✅ Add color-coded type indicators

**Filter UI:**
```
Card Type Filter:
- All Types
- Dad Archetypes (15 types)
- Special Cards:
  - Event (Shitshow Scenarios) 
  - Terrain (Suburban Shitfields)
  - Evolution (Midlife Crisis Mutations)
  - Curse (Dad Damnations)
  - Trap (Suburban Suckerpunches)
  - Item (Gear)
```

### 5. src/components/card/CardComparison.svelte
**Purpose:** Side-by-side card comparison

**Changes Made:**
- ✅ Add special card type headers
- ✅ Add conditional stat comparison (only for cards with stats)
- ✅ Add effect comparison section for special types
- ✅ Add rarity/type/effects comparison rows
- ✅ Highlight differences in effects/abilities

### 6. src/components/pack/CardRevealer.svelte
**Purpose:** Individual card reveal animation

**Changes Made:**
- ✅ Add card type parameter
- ✅ Add conditional animation based on card type
- ✅ EVENT cards: Electric spark animation (white/yellow particles)
- ✅ TERRAIN cards: Dust/earth particles, downward motion
- ✅ EVOLUTION cards: Metamorphosis glow (purple particles)
- ✅ CURSE cards: Dark smoke/shadow effect
- ✅ TRAP cards: Hidden card state with trigger animation
- ✅ ITEM cards: Equipment slot appearance

### 7. src/components/card/ParticleEffects.svelte
**Purpose:** Visual particle system for card reveals

**Changes Made:**
- ✅ Add particle type configurations for special cards
- ✅ EVENT: Electric sparks (0.1s, white/yellow, 8 particles)
- ✅ TERRAIN: Dust particles (0.5s, brown/green, 12 particles)
- ✅ EVOLUTION: Glowing orbs (0.8s, purple/pink, 15 particles)
- ✅ CURSE: Dark smoke (0.6s, black/red, 10 particles)
- ✅ TRAP: Hidden reveal effect (0.3s, blue, 6 particles)
- ✅ ITEM: Golden shimmer (0.4s, gold/white, 8 particles)

### 8. Collection/Filter Components (NEW)
**Purpose:** Advanced filtering for special card types

**Files:**
- `CollectionFilters.svelte` - Multi-select type filters
- `CollectionSearch.svelte` - Search with type awareness
- `CollectionSort.svelte` - Sort by type with custom order

**Features:**
- Filter by card type (multiple select)
- Filter by effects (for special types)
- Group display: All Types → Dad Archetypes → Special Cards
- Count badges per type

## Type Definitions (src/types/index.ts)

**Already Defined:**
```typescript
// DadType includes special card types
type DadType = 
  | 'BBQ_DAD' | 'FIX_IT_DAD' | ... (15 archetypes)
  | 'EVENT' | 'TERRAIN' | 'EVOLUTION' | 'CURSE' | 'TRAP' | 'ITEM'

// Card interface supports effects
interface Card {
  // ... existing fields
  abilities: CardAbility[]  // For effect visualization
}

interface CardAbility {
  name: string
  description: string
  effects?: CardEffect[]
}

interface CardEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'draw' | 'discard' | 'control' | 'transform'
  target: 'self' | 'opponent' | 'all' | 'field'
  value: number
  condition?: string
  duration?: number
}
```

## Component Update Checklist

### Priority 1 (Critical - Pack Opening Flow)
- [ ] Card.svelte - Add special type badge and glow
- [ ] CardRevealer.svelte - Add type-specific animations
- [ ] ParticleEffects.svelte - Add particle configs for types
- [ ] PackOpener.svelte - Pass card type to revealer

### Priority 2 (Collection Management)
- [ ] CardStats.svelte - Handle no-stat cards
- [ ] CollectionManager.svelte - Add type filters
- [ ] CollectionFilters.svelte - Create filter UI
- [ ] CardComparison.svelte - Handle effect comparison

### Priority 3 (Polish & Edge Cases)
- [ ] CardLightbox.svelte - Fullscreen display updates
- [ ] ConfettiEffects.svelte - Type-specific confetti
- [ ] SearchImplementation - Type-aware search
- [ ] SortingLogic - Group special types

## Visual Design Reference

### Card Type Badges
```
EVENT      ⚡ Amber (#fbbf24)
TERRAIN    🏘️  Emerald (#34d399)
EVOLUTION  🔄 Purple (#a78bfa)
CURSE      💀 Red (#f87171)
TRAP       🪤 Blue (#60a5fa)
ITEM       🎁 Orange (#f97316)
```

### Glow Colors
```
EVENT:     border-amber-400 shadow-amber-500/50
TERRAIN:   border-emerald-400 shadow-emerald-500/50
EVOLUTION: border-purple-400 shadow-purple-500/50
CURSE:     border-red-400 shadow-red-500/50
TRAP:      border-blue-400 shadow-blue-500/50
ITEM:      border-orange-400 shadow-orange-500/50
```

### Animation Profiles
```
Quick (120ms):   EVENT - electric/snappy feel
Medium (250ms):  ITEM - shimmer effect
Standard (300ms): DAD types, EVOLUTION, CURSE
Slow (400ms):    TERRAIN - heavy/earthbound feel
```

## Testing Strategy

### Unit Tests
- Type guards work correctly (isSpecialCardType, etc.)
- Stats display only for dad archetypes
- Filter logic includes/excludes types
- Animation timings per card type

### Integration Tests
- Pack opening with mixed card types
- Collection filtering and sorting
- Card comparison with special types
- Search across all card types

### Visual Tests
- Card badges display correctly
- Glow effects visible and appropriate
- Particle animations smooth
- No layout shifts for stat-less cards

## Backwards Compatibility
- Existing DAD_ARCHETYPE cards unaffected
- Stats display conditional (no breaking changes)
- New properties optional in Card interface
- Filter UI graceful degradation

## Future Enhancements
1. Card type-specific audio cues
2. Animated card type icons (SVG)
3. Type-based deck building constraints
4. Special type-specific mechanics UI
5. Trading filters by type
6. Achievements for special card types
