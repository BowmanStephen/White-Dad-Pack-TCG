# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

**Project:** DadDeck™ - The Ultimate White Dad Trading Card Simulator
**Type:** Satirical Trading Card Game (TCG) Pack-Opening Simulator
**Status:** Stable & Production Ready (MVP Scope)
**Version:** 2.2.0
**Last Updated:** January 18, 2026 (MVP Scope Reduction Complete)

---

## ⚠️ MVP SCOPE NOTICE (January 18, 2026)

**This project has undergone a significant scope reduction.** The codebase now focuses on **2 core features only**:

1. **Pack Opening** - Open booster packs, reveal cards
2. **Collection Management** - View, filter, search, sort your cards

### What Was Removed (Archived to `src/_archived/`)
The following features have been **archived and are NOT active**:
- Trading system
- Deck building
- Battle system (PvP combat)
- Crafting
- Achievements & daily rewards
- Leaderboards
- Premium/DadPass (monetization)
- Wishlist
- Upgrade system
- Referral system
- Batch opening

### What's Active
- **6 pages only**: `/`, `/pack`, `/collection`, `/settings`, `/offline`, `/404`
- **173 cards** in database
- **IndexedDB persistence** for collections
- **Pack opening** with 6-stage state machine
- **Collection search/filter/sort**

### Documentation Note
This CLAUDE.md contains documentation for both **active** and **archived** features. When working on this codebase, focus only on the 2 active features mentioned above. See `STATUS.md` for complete details on the scope reduction.

---

## 📚 Table of Contents

1. [Quick Start](#quick-start) - Get running in 60 seconds
2. [Project Overview](#-project-overview) - What & Why
3. [Architecture](#-architecture-overview) - How it's built
4. [Development Workflow](#-development-workflows) - How to work on it
5. [Component Library](#-component-architecture) - Building blocks
6. [Card System](#-card-system-design) - Core game mechanics
7. [Testing](#-testing) - Ensuring quality
8. [Performance](#-performance-optimization-guide) - Making it fast
9. [Deployment](#-deployment) - Getting it live
10. [Troubleshooting](#-debugging-guide) - When things break
11. [Reference](#-reference) - Look up details

---

## 🚀 Quick Start

**Get running in 60 seconds:**

```bash
# 1. Install dependencies
bun install

# 2. Start dev server
bun run dev
# → http://localhost:4321

# 3. Run tests (562/562 pass - 32 skipped from archived features)
bun test

# 4. Build for production
bun run build
```

**Essential Commands:**
```bash
bun run dev              # Start dev server (localhost:4321)
bun run build            # Build production site to ./dist/
bun run preview          # Preview production build
bun test                 # Run tests (watch mode)
bun run test:run         # Run tests once
bun run optimize:images  # Optimize images in public/
bun run generate-sitemap # Generate sitemap.xml
```

**What is DadDeck (MVP)?**
- Free browser-based TCG pack-opening simulator
- **2 core features only:** Pack opening + Collection management
- Parody of suburban American dad culture
- Premium animations, no microtransactions
- Built with Astro + Svelte + Tailwind

**Where to Start:**
1. New developer? → Read [Architecture](#-architecture-overview)
2. Adding a feature? → Read [Development Workflow](#-development-workflows)
3. Fixing a bug? → Read [Troubleshooting](#-debugging-guide)
4. Deploying? → Read [Deployment](#-deployment)
5. Understanding MVP scope? → See **[MVP SCOPE NOTICE](#-mvp-scope-notice-january-18-2026)** at top of file

---

## 🎯 Project Overview

DadDeck™ is a free, browser-based trading card pack-opening simulator that parodies suburban American dad culture through collectible cards. Think of it as a satirical mix of Magic: The Gathering meets Pokémon TCG, but all the cards are about dad stereotypes.

### Core Concept
- **Players open digital booster packs** containing 6-7 cards
- **Cards feature dad archetypes** (BBQ Dad, Fix-It Dad, Couch Dad, etc.)
- **Each card has stats** (Dad Joke, Grill Skill, Nap Power, etc.)
- **Premium AAA-quality animations** for pack opening
- **No microtransactions** - pure entertainment, social sharing focus
- **Shareable pulls** for viral potential

**See full PRD:** `PRD.md` (comprehensive product requirements document)

---

## 💻 Tech Stack

### Core Framework
- **Astro 5.16+** - Static site generator with component islands
- **Svelte 5.46+** - Interactive components (via `@astrojs/svelte`)
- **Tailwind CSS 3** - Utility-first styling (via `@astrojs/tailwind`)

### State Management
- **Nanostores 1.1+** - Lightweight reactive state management
  - `@nanostores/persistent` - LocalStorage persistence for collections
  - **IndexedDB migration** - Collections now stored in IndexedDB for better quota management

### Tooling
- **Bun** - Package manager & runtime (see `bun.lock`)
- **TypeScript** - Type safety across the codebase
- **Vitest 4.0+** - Testing framework
- **ESLint** - Custom config with TypeScript, Svelte, and test-specific rules
- **Prettier** - Code formatting with Svelte plugin
- **Storybook** - Component documentation and development (see `/storybook`)

### Package Manager
**Use Bun for all commands:**
```bash
bun install              # Install dependencies
bun run dev              # Start dev server (localhost:4321)
bun run build            # Build for production
bun run preview          # Preview production build
bun test                 # Run tests (watch mode)
bun run test:run         # Run tests once
bun run optimize:images  # Optimize images in public/
bun run generate-sitemap # Generate sitemap.xml
bun run discord-bot      # Run Discord bot
bun run discord-bot:dev  # Run Discord bot in watch mode
```

---

## 🏗️ Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DadDeck™ TCG System                      │
├─────────────────────────────────────────────────────────────┤
│  User Interface Layer                                      │
│  ├─────────────────┐  ├─────────────────┐  ├─────────────┐ │
│  │   Astro Pages    │  │   Svelte Islands │  │   Components│ │
│  │   (.astro)       │  │   (.svelte)     │  │   (.svelte) │ │
│  │                 │  │                 │  │             │ │
│  │ • index.astro   │  │ • PackOpener    │  │ • Card      │ │
│  │ • collection.astro│  │ • Gallery      │  │ • Button    │ │
│  │ • pack.astro    │  │ • Search        │  │ • Navigation│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  State Management Layer (Nanostores)                       │
│  ├─────────────────┐  ├─────────────────┐  ├─────────────┐ │
│  │  Core Stores     │  │  UI Stores       │  │  Feature Stores │ │
│  │                 │  │                 │  │             │ │
│  │ • pack.ts       │  │ • ui.ts         │  │ • theme.ts  │ │
│  │ • collection.ts │  │ • lightbox.ts   │  │ • audio.ts  │ │
│  │ • discovered.ts │  │ • offline.ts    │  │ • motion.ts │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                       │
│  ├─────────────────┐  ├─────────────────┐  ├─────────────┐ │
│  │  Generators      │  │  Validators     │  │  Utilities  │ │
│  │                 │  │                 │  │             │ │
│  │ • pack/generator │  │ • security/     │  │ • utils/    │ │
│  │ • cards/database │  │   sanitizer     │  │ • random.ts │ │
│  │ • collection/    │  │ • storage/      │  │ • errors.ts │ │
│  │   filter-manager │  │   quota-manager │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ├─────────────────┐  ├─────────────────┐  ├─────────────┐ │
│  │  Static Data     │  │  Persistent     │  │  Cache      │ │
│  │                 │  │  Storage        │  │             │ │
│  │ • cards.json    │  │ • collection    │  │ • computed  │ │
│  │ • (173 cards)   │  │   (IndexedDB)   │  │ • metadata  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Principles

1. **Island Architecture** 🏝️
   - Astro renders static content by default (SEO-friendly, fast)
   - Svelte islands hydrate for interactivity (pack opening, collection, etc.)
   - Strategic hydration: `client:load`, `client:idle`, `client:visible`

2. **Reactive State Management** ⚡
   - Nanostores provide lightweight, atomic state management
   - Persistent stores sync to IndexedDB automatically
   - Computed stores for derived state

3. **Type-Safe Development** 🔒
   - Comprehensive TypeScript definitions
   - Strict mode enabled
   - Type-safe store actions

4. **Security-First Design** 🛡️
   - Client-side validation with anti-cheat measures
   - Pack validation before opening
   - Duplicate detection and statistical anomaly checks

5. **Performance Optimization** 🚀
   - Code splitting: vendor chunks (html2canvas, svelte, nanostores)
   - Image optimization pipeline (pre-build hook)
   - Lazy loading for non-critical components

### Data Flow Architecture

```
User Action (click "Open Pack")
    ↓
Event Handler (Svelte component)
    ↓
Store Action (packStore.openPack())
    ↓
Business Logic (generator.ts - create pack)
    ↓
State Update (currentPack.set(newPack))
    ↓
Computed Updates (bestRarity, holoCount, etc.)
    ↓
Component Re-render (Svelte reactivity)
    ↓
Visual Update (animation, card reveal)
```

### State Management Patterns

**Store Categories:**
- **Core State**: `pack.ts`, `collection.ts`, `ui.ts`
- **UI State**: `theme.ts`, `audio.ts`, `lightbox.ts`, `offline.ts`, `motion.ts`, `notifications.ts`
- **Feature State**: `discovered.ts`, `tutorial.ts`, `card-detail-modal.ts`, `analytics.ts`, `cookies.ts`

**Store Communication:**
```typescript
// Direct imports between stores
import { collection } from '@/stores/collection';

// Store actions modify state
export function openPack(config: PackConfig) {
  const newPack = generatePack(config);
  currentPack.set(newPack);
}

// Computed stores for derived state
export const bestRarity = computed(
  [currentPack],
  (pack) => pack ? getHighestRarity(pack.cards) : null
);
```

**Persistence Strategy:**
- IndexedDB for user data (collection, discovered cards)
- Automatic migration from LocalStorage
- Quota management prevents overflow
- Graceful degradation when storage unavailable

### Component Architecture

**Component Hierarchy:**
```
BaseLayout (Astro)
├── Navigation (Svelte)
├── Main Content
│   ├── Landing (Astro - static SEO content)
│   │   ├── Hero
│   │   ├── Features
│   │   └── FeaturedCards
│   └── Interactive Islands (Svelte - hydrated)
│       ├── PackOpener (main pack opening flow)
│       ├── Gallery (collection grid)
│       ├── CollectionManager (filters/search/sort)
│       └── CardDetailModal (card inspection)
└── Footer (Astro)
```

**Component Communication:**
- **Props**: Parent-to-child data flow
- **Stores**: Global state shared across components
- **Events**: Custom events for component interaction
- **Context**: Theme and app-level configuration

### Key Algorithms

**Pack Generation** (`src/lib/pack/generator.ts`):
```typescript
// 512-line pack generation system
export function generatePack(config?: PackConfig, seed?: number): Pack {
  // 1. Initialize RNG with seed (or random)
  const rng = new SeededRandom(seed);

  // 2. Process each rarity slot
  for (const slot of config.raritySlots) {
    // Roll rarity based on slot probabilities
    let rarity = rollRarity(slot, rng);

    // Select card from rarity pool
    const [card] = selectCards(rarity, usedIds, 1, rng);

    // Roll for holographic variant (1 in 6)
    const holoType = rollHolo(rarity, rng);

    packCards.push({ ...card, isHolo: holoType !== 'none', holoType });
  }

  // 3. Validate rarity distribution
  validateRarityDistribution(packCards, config);

  // 4. Return pack
  return { id: generateId(), cards: packCards, ... };
}
```

**Rarity Distribution:**
- Slot 1-3: Common (100% guaranteed)
- Slot 4-5: Uncommon or better (74% uncommon, 20% rare, 5% epic, 1% legendary+)
- Slot 6: Rare or better (87.9% rare, 10% epic, 2% legendary+, 0.1% mythic)
- Holo chance: ~16.67% (1 in 6 cards)

---

## 📁 Project Structure

```
/
├── public/                   # Static assets (images, fonts, etc.)
├── src/
│   ├── components/          # Reusable components (18 active dirs)
│   │   ├── landing/         # Landing page components
│   │   │   ├── Hero.astro           # Hero section
│   │   │   ├── Features.astro       # Feature highlights
│   │   │   └── PackPreview.astro    # Pack preview animation
│   │   ├── pack/            # Pack opening components
│   │   │   ├── PackOpener.svelte        # Main pack opening UI
│   │   │   └── PackResults.svelte      # Results screen
│   │   ├── card/            # Card components
│   │   │   ├── Card.svelte             # Individual card display
│   │   │   ├── CardStats.svelte        # Card stats visualization
│   │   │   ├── StatTooltip.svelte      # Stat descriptions
│   │   │   └── AbilityTooltip.svelte   # Ability descriptions
│   │   ├── collection/      # Collection management
│   │   │   ├── CollectionManager.svelte # Main collection UI
│   │   │   ├── Gallery.svelte          # Card gallery
│   │   │   ├── CollectionSort.svelte   # Sort controls
│   │   │   ├── CardDetailModal.svelte  # Card inspection
│   │   │   └── PackHistoryEntry.svelte # Pack history
│   │   ├── settings/        # Settings page
│   │   │   └── SettingsManager.svelte  # Settings UI
│   │   ├── common/          # Shared components
│   │   │   ├── Logo.astro             # DadDeck™ logo
│   │   │   └── Navigation.svelte      # Site navigation
│   │   ├── error/           # Error handling
│   │   ├── loading/         # Loading states
│   │   ├── motion/          # Animation utilities
│   │   ├── network/         # Offline detection
│   │   ├── notifications/   # Toast notifications
│   │   ├── pwa/             # PWA install prompts
│   │   └── storage/         # Storage management UI
│   ├── layouts/             # Astro layouts
│   │   └── BaseLayout.astro # Root layout with global styles
│   ├── lib/                 # Business logic
│   │   ├── cards/
│   │   │   └── database.ts  # Card data access layer (wraps JSON)
│   │   ├── pack/
│   │   │   └── generator.ts # Pack generation logic (512 lines)
│   │   ├── security/
│   │   │   └── sanitizer.ts # XSS prevention
│   │   ├── storage/
│   │   │   └── quota-manager.ts # IndexedDB quota management
│   │   ├── collection/
│   │   │   └── filter-manager.ts # Search/filter/sort logic
│   │   └── utils/           # Utilities (random, errors, etc.)
│   ├── data/                # Static data files
│   │   └── cards.json       # Card database (173 cards)
│   ├── stores/              # Nanostores (state management)
│   │   ├── pack.ts          # Pack state & operations
│   │   ├── collection.ts    # Collection state (IndexedDB-backed)
│   │   ├── ui.ts            # UI state (modals, etc.)
│   │   ├── theme.ts         # Theme (light/dark) state
│   │   ├── audio.ts         # Audio settings
│   │   └── ...              # (11 other stores)
│   ├── types/               # TypeScript definitions
│   │   ├── index.ts         # Main export (re-exports all types)
│   │   ├── card.ts          # Card-related types
│   │   ├── pack.ts          # Pack types
│   │   ├── collection.ts    # Collection types
│   │   └── constants.ts     # Game constants
│   └── pages/               # Astro routes (6 pages)
│       ├── index.astro      # Landing page
│       ├── pack.astro       # Pack opening page
│       ├── collection.astro # Collection management
│       ├── settings.astro   # Settings page
│       ├── offline.astro    # Offline page
│       └── 404.astro        # Error page
├── tests/                   # Test files (Vitest)
│   ├── pack/
│   │   └── generator.test.ts   # Pack generation tests
│   ├── card/
│   │   └── database.test.ts    # Card data validation
│   ├── unit/
│   │   ├── lib/security/       # Security tests
│   │   ├── stores/             # Store tests
│   │   └── lib/utils/          # Utility tests
│   └── _archived/              # Tests for removed features
├── .storybook/                # Storybook configuration
│   └── main.ts                 # Storybook decorators and setup
├── astro.config.mjs        # Astro configuration + Vite optimization
├── vitest.config.ts        # Vitest configuration with path aliases
├── tailwind.config.mjs     # Tailwind configuration
├── tsconfig.json           # TypeScript configuration (strict mode)
├── package.json            # Dependencies & scripts
└── bun.lock               # Bun lockfile
```

---

## 🎨 Card System Design

### Rarity Tiers
6 rarity levels (common → mythic):
- **Common** (grey) - Basic cards, minimal effects
- **Uncommon** (blue) - Enhanced stats, minor effects
- **Rare** (gold) - Strong abilities, particle effects
- **Epic** (purple) - Premium animations, holo variants
- **Legendary** (orange) - Full art, intense effects
- **Mythic** (pink) - Prismatic holo, maximum particles

### Card Stats (8 attributes)
Each card has 0-100 in:
- **Dad Joke** - Quality of terrible puns
- **Grill Skill** - BBQ mastery level
- **Fix-It** - Repair capabilities
- **Nap Power** - Ability to sleep anywhere
- **Remote Control** - Channel surfing expertise
- **Thermostat** - Temperature control obsession
- **Sock & Sandal** - Fashion confidence
- **Beer Snob** - Craft beer knowledge

### Holographic Variants
- **none** - Standard non-holo
- **standard** - Basic holo shine
- **reverse** - Reverse holo (background only)
- **full_art** - Full art holo (entire card)
- **prismatic** - Prismatic rainbow holo (mythic only)

---

## 🔄 Pack Opening Flow

### User Journey
```
1. Landing Page → User clicks "Open Pack"
2. Pack Generation → 6-7 cards generated based on rarity slots
3. Pack Animation → Pack tears open (Svelte animation)
4. Card Reveal → Cards reveal one-by-one (skippable)
5. Results Screen → Display all cards, allow sharing
6. Collection Update → Cards saved to IndexedDB
```

### State Machine (PackState)
```typescript
'idle'           → Waiting for user to open pack
'generating'     → Pack is being generated
'pack_animate'   → Pack tear animation playing
'cards_ready'    → Cards ready to reveal
'revealing'      → Individual cards revealing
'results'        → All cards revealed, showing results
```

### Rarity Slot System
Each pack has guaranteed slots:
- Slot 1-3: Common (100%)
- Slot 4-5: Uncommon or better
- Slot 6: Rare or better
- **Holo chance:** 1 in 6 cards (random slot)

---

## 🧩 Component Architecture

### Astro Components (.astro)
- **Server-side rendered** by default
- **Static HTML generation** for performance
- **Use for:** Landing page, SEO content, static layouts

### Svelte Components (.svelte)
- **Client-side interactivity** via Astro islands
- **Reactive state** for animations & user interaction
- **Use for:** Pack opening, card reveal, UI controls

### Component Communication
```typescript
// Astro → Svelte: Pass props to .svelte components
<PackOpener client:load />  // 'client:load' hydrates on page load

// Svelte → Svelte: Use Nanostores for shared state
import { packStore } from '@/stores/pack';
const cards = packStore.get();  // Access shared pack state
```

---

## 🎭 Animation & VFX

### Design Principles
1. **60fps on mid-tier devices** - Performance target
2. **AAA game feel** - Premium particle effects, smooth easing
3. **Rarity-driven intensity** - Higher rarity = more dramatic
4. **Mobile-optimized** - Touch-friendly, no lag

### Animation Zones
- **Pack Tear** - CSS/SVG animation, 1-2s duration
- **Card Flip** - 3D transform, ease-out timing
- **Holo Sparkle** - Particle system based on rarity
- **Glow Pulse** - Box-shadow animation for rare+

### Rarity Visual Effects
```typescript
// See RARITY_CONFIG in src/types/constants.ts
common:    0 particles, 1x intensity
uncommon:  5 particles, 1.2x intensity
rare:     10 particles, 1.5x intensity
epic:     15 particles, 1.8x intensity
legendary:25 particles, 2.2x intensity
mythic:   40 particles, 3x intensity
```

---

## 🗄️ Data Layer

### Card Database Location
**`src/data/cards.json`** - Contains all card data (173 cards)
**`src/lib/cards/database.ts`** - Data access layer that loads and wraps the JSON

### Path Aliases (Import Shortcuts)
Configured in both `tsconfig.json` and `vitest.config.ts`:
```typescript
import { Card } from '@/types';           // src/types/
import { packStore } from '@/stores/pack'; // src/stores/pack
import { generatePack } from '@lib/pack/generator'; // src/lib/pack/generator
```

### Pack Generation Logic
**`src/lib/pack/generator.ts`** - Generates random packs (512 lines)

**Key functions:**
- `generatePack()` - Creates a new pack with rarity slots
- `rollRarity(slot)` - Determines card rarity based on slot
- `rollHolo()` - Determines if card gets holo variant
- `selectCards(rarity)` - Randomly selects card from rarity pool

**Seeded Randomness:** The generator supports seeded randomness for reproducible pack generation (useful for testing and events).

---

## 🎯 When Working on This Project

### Adding Features
1. **Define types first** - Add to `src/types/[feature].ts`
2. **Create store** - Add to `src/stores/` if stateful
3. **Build component** - Use .astro for static, .svelte for interactive
4. **Add logic** - Place in `src/lib/` folder
5. **Test** - Add test file to `tests/` directory

### Styling Guidelines
- **Use Tailwind utilities** - For layout, spacing, and styling
- **Follow rarity colors** - Use `RARITY_CONFIG` for consistency
- **Responsive-first** - Mobile breakpoint is default
- **Accessibility** - ARIA labels, keyboard navigation

### Performance Targets
- **Initial load:** <3 seconds
- **Pack generation:** <500ms
- **Animation FPS:** 60fps on mobile
- **Bundle size:** <500KB (gzipped)

---

## 🛠️ Development Workflows

### Feature Development Workflow

**Step 1: Planning & Types**
```typescript
// 1. Define your types in src/types/index.ts
export interface NewFeature {
  id: string;
  status: 'pending' | 'active' | 'complete';
  // ... other properties
}
```

**Step 2: Create State Management**
```typescript
// 2. Create store in src/stores/feature.ts
import { atom, computed } from 'nanostores';

export const featureState = atom<NewFeature[]>([]);
export const activeCount = computed(featureState,
  items => items.filter(i => i.status === 'active').length
);

export function addFeature(feature: NewFeature) {
  featureState.set([...featureState.get(), feature]);
}
```

**Step 3: Implement Business Logic**
```typescript
// 3. Add logic to src/lib/feature/
export function processFeature(input: Input): Output {
  // Pure functions for business logic
  return {
    result: input.value * 2,
    timestamp: new Date()
  };
}
```

**Step 4: Build Components**
```svelte
<!-- 4. Create component src/components/feature/FeatureUI.svelte -->
<script lang="ts">
  import { featureState, addFeature } from '@/stores/feature';

  let newFeature = $state('');

  function handleSubmit() {
    addFeature({ id: crypto.randomUUID(), status: 'pending' });
  }
</script>

<button on:click={handleSubmit}>Add Feature</button>
```

**Step 5: Integrate with Astro**
```astro
<!-- 5. Add page src/pages/feature.astro ---
import FeatureUI from '@/components/feature/FeatureUI.svelte';

<Layout title="New Feature">
  <FeatureUI client:load />
</Layout>
```

**Step 6: Write Tests**
```typescript
// 6. Add tests in tests/feature/
import { describe, it, expect } from 'vitest';
import { featureState, addFeature } from '@/stores/feature';

describe('Feature Store', () => {
  it('should add feature to state', () => {
    addFeature({ id: 'test', status: 'pending' });
    expect(featureState.get()).toHaveLength(1);
  });
});
```

### Code Patterns & Best Practices

**1. Store Actions Pattern**
```typescript
// ✅ GOOD: Actions encapsulate state changes
export function openPack(config: PackConfig) {
  const pack = generatePack(config);
  currentPack.set(pack);
  packState.set('cards_ready');
  addToHistory(pack);
}

// ❌ BAD: Direct state manipulation from components
import { currentPack } from '@/stores/pack';
currentPack.set(myPack); // Components shouldn't do this
```

**2. Derived State with Computed Stores**
```typescript
// ✅ GOOD: Use computed for derived state
export const cardCount = computed(collection,
  coll => coll.packs.reduce((sum, pack) => sum + pack.cards.length, 0)
);

// ❌ BAD: Manual recalculation
function getCardCount() {
  return collection.get().packs.reduce(...); // Error-prone
}
```

**3. Type Guards for Validation**
```typescript
// ✅ GOOD: Type guards for runtime validation
export function isPack(value: unknown): value is Pack {
  return (
    typeof value === 'object' && value !== null &&
    'id' in value && 'cards' in value &&
    Array.isArray(value.cards)
  );
}

// Usage
if (isPack(data)) {
  processPack(data); // TypeScript knows this is Pack
}
```

**4. Error Boundaries**
```svelte
<!-- ✅ GOOD: Wrap components in error boundaries -->
<ErrorBoundary>
  <PackOpener />
</ErrorBoundary>

<!-- ✅ GOOD: Fallback UI -->
{#if error}
  <ErrorMessage message={error.message} />
{:else}
  <PackOpener />
{/if}
```

**5. Loading States**
```svelte
<!-- ✅ GOOD: Skeleton loading -->
{#if loading}
  <CardSkeleton />
{:else}
  <Card {data} />
{/if}

<!-- ✅ GOOD: Progressive enhancement -->
<Card {data} />
{#if isLoadingMore}
  <CardSkeleton />
{/if}
```

### Common Pitfalls & Solutions

**1. State Not Updating**
```typescript
// ❌ PROBLEM: Direct mutation
const collection = collectionStore.get();
collection.packs.push(newPack); // Won't trigger reactivity

// ✅ SOLUTION: Immutable updates
const collection = collectionStore.get();
collectionStore.set({
  ...collection,
  packs: [...collection.packs, newPack]
});
```

**2. Astro Component Not Hydrating**
```astro
<!-- ❌ PROBLEM: Missing client directive -->
<PackOpener />  <!-- Won't be interactive -->

<!-- ✅ SOLUTION: Add client directive -->
<PackOpener client:load />  <!-- Hydrates on page load -->
<PackOpener client:idle />  <!-- Hydrates when browser idle -->
<PackOpener client:visible />  <!-- Hydrates when visible -->
```

**3. Import Path Errors**
```typescript
// ❌ PROBLEM: Relative paths
import { Card } from '../../../types/index';

// ✅ SOLUTION: Use path aliases
import { Card } from '@/types';  // Clean and maintainable
```

**4. IndexedDB Quota Exceeded**
```typescript
// ✅ SOLUTION: Quota management with compression
import { checkQuotaBeforeSave } from '@/lib/storage/quota-manager';

// Before opening pack
const result = await checkQuotaBeforeSave(5000); // 5KB estimate
if (!result.canSave) {
  console.warn(result.warning); // "Storage at 92% capacity"
  // Show warning to user
}
```

**5. Test Environment Issues**
```typescript
// ❌ PROBLEM: Tests failing due to missing DOM
import { describe, it } from 'vitest';

// ✅ SOLUTION: Configure Vitest environment
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',  // Or 'happy-dom' for lighter setup
    setupFiles: ['./tests/setup.ts']
  }
});

// tests/setup.ts
import { vi } from 'vitest';

// Mock IndexedDB
global.indexedDB = {
  // ... mock implementation
};
```

---

## 🧪 Testing

### Current Test Status
**Test Results (as of January 18, 2026):**
- ✅ **562/562 tests passing** (100% pass rate for active features)
- ⚠️ **32 tests skipped** - These are from **archived features**
- **Build Status:** ✅ Passing (6 pages, ~8s build time)
- **Type Checking:** ✅ TypeScript strict mode passing

**Note:** All 562 tests for active features pass. The 32 skipped tests are for archived features (battle system, trading, deck building, crafting, etc.) and are intentionally not run.

### Run Tests
```bash
# Unit Tests (Vitest)
bun test                    # Watch mode
bun run test:run            # Single run

# E2E Tests (Playwright)
bun run test:e2e            # Run all E2E tests
bun run test:e2e:ui         # Run with Playwright UI
bun run test:e2e:chromium   # Run on Chrome only

# Visual Regression Tests (Playwright)
bun run test:visual         # Run visual tests on Chromium
bun run test:visual:all     # Run on all desktop browsers
bun run test:visual:update  # Update baseline screenshots
```

### Test Configuration
**Vitest setup** (`vitest.config.ts`):
- **Environment:** Node (for unit tests)
- **Include pattern:** `tests/**/*.test.ts`
- **Path aliases:** Same as tsconfig.json (`@/`, `@lib/`, `@stores/`, etc.)
- **Coverage thresholds:** 60% lines, functions, statements; 55% branches

**Playwright setup** (`playwright.config.ts`):
- **E2E tests:** `tests/e2e/` directory
- **Visual tests:** `tests/visual/` directory
- **Browsers:** Chromium, Firefox, WebKit (Safari)
- **Viewports:** Desktop, Laptop, Tablet, Mobile
- **Screenshot comparison:** Built-in visual regression testing

### Test Structure
```
tests/
├── pack/
│   └── generator.test.ts   # Pack generation logic tests
├── card/
│   └── database.test.ts    # Card data validation tests
├── unit/
│   ├── lib/security/sanitizer.test.ts  # XSS prevention tests
│   ├── lib/storage/                   # IndexedDB quota tests
│   ├── stores/collection.test.ts       # Store tests
│   └── lib/utils/                     # Utility tests
├── e2e/                    # End-to-end flow tests
│   ├── pack-opening.spec.ts
│   ├── collection.spec.ts
│   └── navigation.spec.ts
├── performance/
│   └── animation-performance.test.ts  # Animation FPS tests
├── visual/                 # Visual regression tests
│   ├── card-visual.test.ts           # Card component screenshots
│   ├── pack-opening-visual.test.ts   # Pack opening flow screenshots
│   └── ui-components-visual.test.ts  # UI component screenshots
└── _archived/              # Tests for removed features (not run)
```

### What to Test (Active MVP Features)
- **Pack generation** - Correct rarity distribution
- **Card data** - Valid stats, types, required fields
- **Random functions** - Distribution accuracy
- **UI state** - State transitions work correctly
- **Security** - Input sanitization, XSS prevention
- **Collection management** - Search, filter, sort functionality
- **Visual regression** - Screenshot comparison to detect unintended UI changes

---

## 🚀 Deployment

### Build Configuration
**Astro + Vite setup** (`astro.config.mjs`):

**Code Splitting Strategy:**
- `vendor-html2canvas` - html2canvas library (largest dependency)
- `vendor-svelte` - Svelte runtime and animations
- `vendor-nanostores` - State management
- `vendor` - Other node modules

**Production Optimizations:**
- **Inline critical CSS** for faster initial render
- **Terser minification** with console.log removal
- **ES2020 target** for modern browsers
- **Image service** using Sharp (quality: 85)
- **HTML compression** enabled
- **Client prerender** experimental feature

**Pre-build Hooks:**
```bash
# Runs automatically before 'bun run build'
bun run optimize:images    # Optimize images in public/
bun run generate-og-image  # Generate OG image
bun run generate-sitemap   # Generate sitemap.xml
bun run generate-svgs      # Generate card SVGs
```

### Build for Production
```bash
bun run build              # Outputs to ./dist/ (runs prebuild hooks)
```

### Preview Build
```bash
bun run preview            # Serves ./dist/ locally
```

### Deployment Platforms (Recommended)
- **Vercel** - Zero-config deployment (recommended)
- **Netlify** - Alternative with edge functions
- **Cloudflare Pages** - Global CDN

---

## 🐛 Debugging Guide

### Browser DevTools

**1. Debugging State Changes**
```typescript
// Log store changes
import { currentPack } from '@/stores/pack';

currentPack.subscribe((pack) => {
  console.log('Pack updated:', pack);
});
```

**2. Error Logging & Diagnostics**
- **Error ID**: Every error generates a unique ID (e.g., `err_1737223456789_abc123`).
- **Sentry**: Errors are automatically captured and sent to Sentry if `PUBLIC_SENTRY_DSN` is set.
- **User Reports**: Users can click "Report Issue" in the error UI to send feedback.

**3. Performance Profiling**
```javascript
// Measure pack generation time
console.time('pack-generation');
const pack = generatePack(config);
console.timeEnd('pack-generation');
```

### Common Issues & Diagnostics

**Issue: Pack Opening Not Working**
```typescript
// Diagnostic checklist
function diagnosePackIssue() {
  // 1. Check store initialization
  console.log('Pack state:', packState.get());

  // 2. Verify card data loaded
  const cards = getAllCards();
  console.log('Card database size:', cards.length);

  // 3. Test generator
  try {
    const testPack = generatePack(DEFAULT_PACK_CONFIG, 12345);
    console.log('Test pack generated:', testPack);
  } catch (error) {
    console.error('Generator failed:', error);
  }
}
```

**Issue: IndexedDB Full**
```typescript
import { checkQuotaBeforeSave } from '@/lib/storage/quota-manager';

function checkStorage() {
  const info = getStorageInfo();
  const percentage = (info.used / info.limit) * 100;

  if (percentage > 90) {
    console.warn(`Storage at ${percentage.toFixed(1)}% capacity`);
    // Suggest clearing old packs
  }

  return info;
}
```

---

## ⚡ Performance Optimization Guide

### Bundle Analysis

```bash
# Analyze bundle size
bun run build
du -sh dist/
```

**Optimization Targets:**
- Initial JS bundle: <200KB (gzipped)
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Pack generation: <500ms

### Runtime Performance

**1. Memoization**
```svelte
<script>
  import { computed } from 'nanostores';

  // ✅ GOOD: Computed values are cached
  const expensiveValue = computed(data,
    items => items.map(calculateExpensiveThing)
  );

  // ❌ BAD: Recalculates on every access
  function getExpensiveValue() {
    return data.get().map(calculateExpensiveThing);
  }
</script>
```

**2. Debouncing User Input**
```typescript
import { debounce } from './utils/debounce';

export const searchQuery = atom('');

export const debouncedSearch = computed(
  searchQuery,
  debounce((query) => {
    // Expensive search operation
    return searchCards(query);
  }, 300)
);
```

---

## 📊 Success Metrics (MVP)

### Technical Goals
- ✅ Zero crashes during pack opening
- ✅ 60fps animations on mid-tier devices
- ✅ <3s initial page load
- ✅ Works on mobile (65%) and desktop (35%)

### Product Goals
- ✅ Unlimited free pack opening
- ✅ Premium pack opening feel
- ✅ Shareable card pulls
- ✅ 173 unique cards in database

---

## 🎨 Styling & Theming

### Tailwind Configuration

**Custom Design Tokens** (`tailwind.config.mjs`):
```javascript
export default {
  theme: {
    extend: {
      colors: {
        rarity: {
          common: '#9ca3af',    // Grey
          uncommon: '#3b82f6',  // Blue
          rare: '#eab308',      // Gold
          epic: '#a855f7',      // Purple
          legendary: '#f97316', // Orange
          mythic: '#ec4899',    // Pink
        },
      },
    }
  }
}
```

### Dark Mode Support
```svelte
<script>
  import { theme } from '@/stores/theme';
</script>

<div class="
  bg-white
  dark:bg-gray-900
  text-gray-900
  dark:text-gray-100
">
  <!-- Automatically adapts to theme -->
</div>
```

---

## 🔒 Security Architecture

### Input Sanitization
**`src/lib/security/sanitizer.ts`:**
```typescript
import DOMPurify from 'dompurify';

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: []
  });
}
```

### Pack Validation
**`src/lib/security/pack-validator.ts`:**
- Duplicate detection
- Rarity distribution validation
- Statistical anomaly detection
- Entropy verification

---

## 🌐 Internationalization (I18N)

**Infrastructure:**
- **`src/i18n/`** - Complete i18n system with locales
- **`src/i18n/index.ts`** - Core translation utilities (`t()`, `tc()`)
- **`src/i18n/locales/en.json`** - English base translation (300+ keys)
- **`src/i18n/locales/es.json`** - Complete Spanish translation

**Usage Pattern:**
```svelte
<script>
  import { t } from '@/i18n';
</script>

<h1>{$t('pack.title')}</h1>
<p>{$t('pack.opened', { count: packCount })}</p>
```

**See documentation:** `I18N_IMPLEMENTATION.md` and `src/i18n/README.md`

---

## 📝 Key Files to Understand

### Must Read (Priority Order)
1. **`src/types/index.ts`** - All types, understand the data model
2. **`src/stores/pack.ts`** - Pack state management
3. **`src/lib/pack/generator.ts`** - How packs are created
4. **`src/components/pack/PackOpener.svelte`** - Main pack opening UI
5. **`STATUS.md`** - Current project status and recent changes

### Quick Reference Files
- **`docs/TCG_BEST_PRACTICES.md`** - TCG simulator market research & best practices
- **`docs/CARD_MECHANICS.md`** - Complete card collecting & pack opening mechanics
- **`docs/RALPH_LOOP_ARCHITECTURE.md`** - Agentic loop UX patterns
- **`tailwind.config.mjs`** - Custom design tokens
- **`astro.config.mjs`** - Integrations & build config
- **`vitest.config.ts`** - Test configuration with path aliases
- **`src/data/cards.json`** - All card data (173 cards)

---

## 🎓 Learning Context

### For Stephen (UX Designer → Developer)

**This project is great for learning:**
- **Astro islands architecture** - Server + client components
- **Svelte reactivity** - Simpler than React, great for learning
- **State management patterns** - Nanostores are beginner-friendly
- **TypeScript in practice** - Real-world type safety
- **CSS animations** - Visual feedback & timing

**Focus on:**
1. **Understanding the pack flow** - Follow `PackState` transitions
2. **Component communication** - How stores connect components
3. **Animation timing** - When to use CSS vs JS animations
4. **Type safety** - Leverage TypeScript to catch bugs early

**When confused:**
- Ask: "What state is this component in?"
- Ask: "Where does this data come from?"
- Ask: "What happens when the user clicks X?"

---

## 🚦 Quick Commands Reference

```bash
# Development
bun install              # Install dependencies
bun run dev              # Start dev server (http://localhost:4321)

# Building
bun run build            # Build production site to ./dist/
bun run preview          # Preview production build
bun run optimize:images  # Optimize images in public/
bun run generate-sitemap # Generate sitemap.xml

# Testing
bun test                 # Run tests in watch mode
bun run test:run         # Run tests once

# Discord Bot
bun run discord-bot      # Run Discord bot
bun run discord-bot:dev  # Run Discord bot in watch mode
```

---

## 🎯 Project Status & Features

### Current MVP Scope ✅ (Active Features)

**Core Features:**
- ✅ **Pack Opening Flow** - Complete 6-stage state machine (idle → results)
- ✅ **Card Reveal Animations** - Individual card flip with skip option
- ✅ **Rarity-based VFX** - Particle systems, glows, holo effects
- ✅ **Collection Persistence** - IndexedDB-based collection management
- ✅ **Mobile Responsive** - 65% mobile, 35% desktop optimized
- ✅ **Generative Card Art** - Procedural artwork for cards without images

**Collection Management:**
- ✅ **Collection search** - Full-text search across names and flavor text
- ✅ **Collection filters** - Multi-select rarity and dad type filters
- ✅ **Collection sorting** - Sort by date/rarity/type with ascending/descending
- ✅ **Interactive stat tooltips** - Desktop hover & mobile tap-to-reveal

**UI/UX:**
- ✅ Theme toggle (light/dark mode)
- ✅ Error boundaries and error displays
- ✅ Loading skeletons for better perceived performance
- ✅ **Error Logging System** - Sentry integration, error report modal
- ✅ **Browser Diagnostics** - Automatic tracking of User Agent and URL

**Infrastructure:**
- ✅ Google Analytics integration
- ✅ Dynamic meta tags and Open Graph
- ✅ Sitemap generation (auto-runs on build)
- ✅ Image optimization pipeline (pre-build hook)
- ✅ Offline page with graceful degradation

---

### Archived Features 🗄️ (NOT Active - Moved to `src/_archived/`)

The following features were **removed in MVP scope reduction** (January 18, 2026):

**Archived Pages:**
- 🗄️ Battle system - Stat-based combat with type advantages
- 🗄️ Trading hub - Card-for-card trading, trade history
- 🗄️ Deck builder - Deck creation, validation, stats visualization
- 🗄️ Crafting station - Card crafting with recipes and materials
- 🗄️ Achievements - Popup notifications, achievement gallery
- 🗄️ Leaderboards - Global rankings by collection value
- 🗄️ Batch opening - Multi-pack opener
- 🗄️ Upgrade system - Sacrifice cards to level up favorites
- 🗄️ Daily rewards - Login streak rewards
- 🗄️ Wishlist - Track desired cards
- 🗄️ Premium/DadPass - Monetization features

**Note:** Documentation for archived features remains in this CLAUDE.md for historical reference. Code has been moved to `src/_archived/` and is **not loaded** in the active application.

---

### Test Status

**Current Test Results:**
- ✅ **562/562 tests passing** (100% pass rate for active features)
- ⚠️ **32 tests skipped** - These are from archived features
- **Build Status:** ✅ Passing (6 pages, ~8s build time)
- **Type Checking:** ✅ TypeScript strict mode passing

**Test Coverage:**
- Unit tests for pack generation, card database, security validation
- Store tests for collection management
- E2E tests for core flows (pack opening, collection)
- Visual regression tests for card components

---

## 🐛 Common Issues & Solutions

### Pack Generation Not Working
**Check:** `src/lib/pack/generator.ts` - ensure `CARDS` array is populated
**Check:** Browser console for Nanostores errors
**Fix:** Clear IndexedDB: Delete site data in browser DevTools

### Animations Laggy
**Check:** DevTools Performance tab for bottlenecks
**Fix:** Reduce particle count in `RARITY_CONFIG`
**Fix:** Use `will-change` CSS property for animated elements

### Types Not Found
**Check:** Import path uses `@/` alias: `import { Card } from '@/types'`
**Check:** `tsconfig.json` has path alias configured

### Svelte Component Not Hydrating
**Check:** Added `client:load` directive: `<PackOpener client:load />`
**Check:** Component is imported in `.astro` file

---

## 🎨 Design Resources

### Visual Assets Location
**`public/images/`** - All static images
- `/cards/` - Individual card artwork
- `/packs/` - Pack designs (closed, open, torn)
- `/ui/` - UI elements (buttons, icons, etc.)

### Card Artwork Specs
- **Format:** PNG with transparency
- **Size:** 400x550px (standard card ratio)
- **Resolution:** 2x (800x1100px) for retina displays

---

**Last updated:** January 18, 2026 (MVP Scope Reduction)
**Recent Update:** Updated documentation to reflect MVP scope reduction - focused on 2 core features (pack opening + collection management)

---

## 🧹 Recent Cleanup & Optimization (January 18, 2026)

### MVP Scope Reduction
- Removed 11 pages (from 17 to 6)
- Archived 20+ component directories
- Archived 15 store files
- Archived 18 type definition files
- **Result:** Cleaner, more focused codebase

**Impact:**
- 📉 Smaller bundle sizes
- 🚀 Faster build times
- 🧹 Cleaner codebase
- ✅ Zero breaking changes to active features
