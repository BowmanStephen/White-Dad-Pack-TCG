# CLAUDE.md - DadDeck™ Project Guide

**Project:** DadDeck™ - The Ultimate White Dad Trading Card Simulator
**Type:** Satirical Trading Card Game (TCG) Pack-Opening Simulator
**Status:** Stable & Production Ready
**Version:** 2.0.0

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

### Tooling
- **Bun** - Package manager & runtime (see `bun.lock`)
- **TypeScript** - Type safety across the codebase
- **Vitest 4.0+** - Testing framework

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
│  │ • collection.astro│  │ • TradeCreator  │  │ • Button    │ │
│  │ • crafting.astro│  │ • DeckBuilder   │  │ • Navigation│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  State Management Layer (Nanostores)                       │
│  ├─────────────────┐  ├─────────────────┐  ├─────────────┐ │
│  │  Core Stores     │  │  Feature Stores  │  │  UI Stores   │ │
│  │                 │  │                 │  │             │ │
│  │ • pack.ts       │  │ • crafting.ts   │  │ • ui.ts     │ │
│  │ • collection.ts │  │ • trade.ts      │  │ • audio.ts  │ │
│  │ • battle.ts     │  │ • achievements.ts│ │ • theme.ts   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                       │
│  ├─────────────────┐  ├─────────────────┐  ├─────────────┐ │
│  │  Generators      │  │  Validators     │  │  Utilities  │ │
│  │                 │  │                 │  │             │ │
│  │ • pack/generator │  │ • security/     │  │ • utils/    │ │
│  │ • battle/combat  │  │ • deck/         │  │ • random.ts │ │
│  │ • leaderboard/  │  │ • upgrade/      │  │ • errors.ts │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ├─────────────────┐  ├─────────────────┐  ├─────────────┐ │
│  │  Static Data     │  │  Persistent     │  │  Cache      │ │
│  │                 │  │  Storage        │  │             │ │
│  │ • cards.json    │  │ • collection    │  │ • computed  │ │
│  │ • seasons.json  │  │ • crafting      │  │ • metadata  │ │
│  │ • config.ts    │  │ • history       │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Principles

1. **Island Architecture** 🏝️
   - Astro renders static content by default (SEO-friendly, fast)
   - Svelte islands hydrate for interactivity (pack opening, trading, etc.)
   - Strategic hydration: `client:load`, `client:idle`, `client:visible`

2. **Reactive State Management** ⚡
   - Nanostores provide lightweight, atomic state management
   - Persistent stores sync to LocalStorage automatically
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
- **Feature State**: `crafting.ts`, `trade.ts`, `battle.ts`, `achievements.ts`
- **UI State**: `theme.ts`, `audio.ts`, `notifications.ts`

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
- LocalStorage for user data (collection, preferences)
- Custom encoders handle Date serialization
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
│       ├── TradeCreator (trading interface)
│       ├── DeckBuilder (deck management)
│       └── CraftingStation (crafting interface)
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

**Battle System** (`src/lib/mechanics/combat.ts`):
```typescript
export function calculateBattleResult(
  attackerDeck: Deck,
  defenderDeck: Deck
): BattleResult {
  // Calculate total stats for each deck
  const attackerStats = calculateDeckStats(attackerDeck);
  const defenderStats = calculateDeckStats(defenderDeck);

  // Apply type advantages and synergy bonuses
  const typeBonus = getTypeAdvantage(attackerDeck, defenderDeck);

  // Calculate damage with random modifier
  const damage = Math.max(1,
    attackerStats.grillSkill - defenderStats.fixIt +
    typeBonus + randomModifier()
  );

  return { damage, winner, attackerStats, defenderStats };
}
```

**Crafting Recipes** (`src/lib/crafting/index.ts`):
```typescript
export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'common_to_uncommon',
    inputRarity: 'common',
    inputCount: 5,
    outputRarity: 'uncommon',
    outputCount: 1,
    successRate: 1.0, // 100% success
  },
  {
    id: 'rare_to_epic',
    inputRarity: 'rare',
    inputCount: 5,
    outputRarity: 'epic',
    outputCount: 1,
    successRate: 0.5, // 50% success
    failReturnRate: 0.6, // Return 60% on fail
  },
  // ... more recipes
];
```

### Security Architecture

**Ralph Loop cross-reference:** In Ralph Loop terms, `validatePackBeforeOpen()` is a
"Stop Hook" (bouncer) that blocks state transitions until validation passes. See
`docs/RALPH_LOOP_ARCHITECTURE.md`.

**Anti-Cheat System** (`src/lib/security/pack-validator.ts`):
```typescript
export async function validatePackBeforeOpen(pack: Pack): Promise<ValidationResult> {
  // 1. Duplicate detection
  const duplicateCheck = await detectDuplicatePack(pack, getFingerprint());

  // 2. Rarity distribution validation
  validateRarityDistribution(pack.cards, DEFAULT_PACK_CONFIG);

  // 3. Statistical anomaly detection
  const statsCheck = detectStatisticalAnomalies(pack);

  // 4. Entropy verification
  const entropyCheck = await validatePackEntropy(pack, entropy);

  return {
    valid: !duplicateCheck.isDuplicate &&
            !statsCheck.hasAnomalies &&
            entropyCheck.valid,
    violations: [...duplicateCheck.violations, ...statsCheck.violations]
  };
}
```

**Input Sanitization:**
```typescript
function validateCardSelection(cardIds: string[]): ValidationResult {
  // Check for duplicates
  if (new Set(cardIds).size !== cardIds.length) {
    return { valid: false, error: 'Duplicate cards not allowed' };
  }

  // Check ownership
  for (const cardId of cardIds) {
    if (!isCardOwned(cardId)) {
      return { valid: false, error: `Card ${cardId} not owned` };
    }
  }

  return { valid: true };
}
```

### Performance Optimization

**Build Optimization** (`astro.config.mjs`):
```javascript
rollupOptions: {
  output: {
    manualChunks: (id) => {
      if (id.includes('html2canvas')) return 'vendor-html2canvas';
      if (id.includes('svelte')) return 'vendor-svelte';
      if (id.includes('nanostores')) return 'vendor-nanostores';
      return 'vendor';
    }
  }
}
```

**Bundle Strategy:**
- `vendor-html2canvas`: ~150KB (largest dependency)
- `vendor-svelte`: ~60KB (Svelte runtime)
- `vendor-nanostores`: ~15KB (State management)
- `vendor`: ~100KB (Other dependencies)
- **Total gzipped**: ~200KB

**Runtime Optimizations:**
- Lazy loading for non-critical components
- Image optimization with Sharp (quality: 85)
- Code splitting reduces initial load
- Tree shaking eliminates unused code

---

## 🤖 Agentic Iteration Patterns (Ralph Loop Architecture)

DadDeck already uses several "agentic loop" ideas (even though the game itself is not
LLM-driven). This section is a shared vocabulary for designing reliable, user-trust-building
loops in UI/state machines.

**Deep dive doc:** `docs/RALPH_LOOP_ARCHITECTURE.md`

### How to map Ralph Loop concepts onto DadDeck

- **State machine loops:** `PackState` and batch flows already model loop phases
  (generate → animate → reveal → results). The Ralph Loop frame helps us be explicit
  about "phase" and "exit conditions".
- **Stop hooks / backpressure:** `validatePackBeforeOpen()` is a practical "stop hook"
  gate. It’s the bouncer that prevents invalid output from advancing the state machine.
- **HOTL dashboards:** For batch operations, prefer a "Mission Control" UI (objective,
  progress, validation lights) over raw logs.
- **Make retries visible:** If we add retry loops (e.g., autonomous pack generation),
  show attempts/why (trust via transparency).

## 📁 Project Structure

```
/
├── public/                   # Static assets (images, fonts, etc.)
├── src/
│   ├── components/          # Reusable components
│   │   ├── landing/         # Landing page components
│   │   │   ├── Hero.astro           # Hero section
│   │   │   ├── Features.astro       # Feature highlights
│   │   │   ├── FeaturedCards.astro  # Showcase cards
│   │   │   ├── PackPreview.astro    # Pack preview animation
│   │   │   └── Footer.astro         # Site footer
│   │   ├── pack/            # Pack opening components
│   │   │   ├── PackOpener.svelte        # Main pack opening UI
│   │   │   ├── PackAnimation.svelte    # Pack tear animation
│   │   │   ├── CardRevealer.svelte     # Individual card reveal
│   │   │   └── PackResults.svelte      # Results screen
│   │   ├── card/            # Card components
│   │   │   ├── Card.svelte             # Individual card display
│   │   │   ├── CardStats.svelte        # Card stats visualization
│   │   │   ├── CardBack.svelte         # Card back design
│   │   │   └── CardComparison.svelte   # Side-by-side comparison
│   │   ├── collection/      # Collection management
│   │   │   ├── CollectionManager.svelte # Main collection UI
│   │   │   ├── CollectionStats.svelte  # Stats overview
│   │   │   ├── Gallery.svelte          # Card gallery
│   │   │   ├── PackHistoryPanel.svelte # Pack opening history
│   │   │   └── PackHistoryEntry.svelte # Individual pack entry
│   │   ├── batch/           # Batch pack opening
│   │   │   ├── BatchOpener.svelte      # Multi-pack opener
│   │   │   ├── BatchResults.svelte     # Results display
│   │   │   └── BatchReview.svelte      # Review batch pulls
│   │   ├── deck/            # Deck building
│   │   │   ├── DeckBuilder.svelte      # Main deck builder
│   │   │   ├── DeckSelector.svelte     # Deck slot selection
│   │   │   ├── DeckCardList.svelte     # Card list view
│   │   │   └── DeckStats.svelte        # Deck statistics
│   │   ├── upgrade/         # Card upgrade system
│   │   │   ├── UpgradeManager.svelte   # Upgrade UI
│   │   │   └── CardUpgradeModal.svelte # Upgrade confirmation
│   │   ├── crafting/        # Card crafting
│   │   │   ├── CraftingStation.svelte  # Crafting UI
│   │   │   ├── CardSelector.svelte     # Material selection
│   │   │   ├── RecipeSelector.svelte   # Recipe selection
│   │   │   ├── CraftingResult.svelte   # Result display
│   │   │   └── CraftingAnimation.svelte # Animation
│   │   ├── trade/           # Trading system
│   │   │   ├── TradeCreator.svelte     # Create trade offers
│   │   │   ├── TradeOfferViewer.svelte # View offers
│   │   │   └── TradeHistory.svelte     # Trade history
│   │   ├── leaderboard/     # Leaderboards
│   │   │   ├── LeaderboardPage.svelte  # Main leaderboard
│   │   │   ├── LeaderboardList.svelte  # Ranking list
│   │   │   ├── LeaderboardFilters.svelte # Filters
│   │   │   └── LeaderboardEntry.svelte # Individual entry
│   │   ├── achievements/    # Achievement system
│   │   │   ├── AchievementPopup.svelte # Achievement unlock
│   │   │   ├── AchievementGallery.svelte # Gallery view
│   │   │   └── index.ts             # Achievement definitions
│   │   ├── daily/           # Daily rewards
│   │   │   ├── DailyRewardsBanner.svelte # Streak banner
│   │   │   └── DailyRewardsModal.svelte  # Rewards modal
│   │   ├── notifications/   # Notification system
│   │   │   ├── NotificationContainer.svelte # Container
│   │   │   ├── ToastItem.svelte           # Toast items
│   │   │   └── NotificationSettings.svelte # Settings
│   │   ├── loading/         # Loading states
│   │   │   ├── CardSkeleton.svelte         # Card placeholder
│   │   │   ├── CollectionGridSkeleton.svelte # Grid placeholder
│   │   │   └── FadeIn.svelte               # Fade animation
│   │   ├── art/            # Generative art
│   │   │   └── GenerativeCardArt.svelte    # Procedural artwork
│   │   └── common/          # Shared components
│   │       ├── Logo.astro             # DadDeck™ logo
│   │       ├── Button.astro           # Reusable button
│   │       ├── Slider.svelte          # Range slider
│   │       ├── Toggle.svelte          # Toggle switch
│   │       ├── ThemeToggle.svelte     # Light/dark mode
│   │       ├── CinematicToggle.svelte # Animation toggle
│   │       ├── TutorialOverlay.svelte # Tutorial tooltips
│   │       ├── ErrorDisplay.svelte    # Error display
│   │       ├── ErrorMessage.svelte    # Error messages
│   │       └── ErrorBoundary.svelte   # Error boundary
│   ├── layouts/             # Astro layouts
│   │   └── BaseLayout.astro # Root layout with global styles
│   ├── lib/                 # Business logic
│   │   ├── cards/
│   │   │   └── database.ts  # Card data access layer (wraps JSON)
│   │   ├── pack/
│   │   │   └── generator.ts # Pack generation logic (512 lines)
│   │   ├── security/
│   │   │   └── pack-validator.ts # Anti-cheat validation
│   │   ├── mechanics/
│   │   │   └── combat.ts    # Battle mechanics (US090)
│   │   ├── collection/
│   │   │   ├── utils.ts     # Collection utilities
│   │   │   └── presets.ts   # Preset collections
│   │   ├── deck/
│   │   │   ├── index.ts     # Deck management
│   │   │   ├── validators.ts # Deck validation rules
│   │   │   └── utils.ts     # Deck utilities
│   │   ├── upgrade/
│   │   │   ├── index.ts     # Upgrade system
│   │   │   └── executor.ts  # Upgrade execution
│   │   ├── crafting/
│   │   │   └── index.ts     # Crafting recipes & logic
│   │   ├── leaderboard/
│   │   │   └── generator.ts # Leaderboard generation
│   │   ├── art/
│   │   │   ├── generative-art.ts # Procedural artwork
│   │   │   └── dad-type-colors.ts # Type color mappings
│   │   ├── seo.ts           # SEO utilities (meta tags, OG)
│   │   └── utils/
│   │       ├── random.ts    # Random number utilities
│   │       ├── seeded-random.ts # Seeded randomness
│   │       ├── image-generation.ts # Image helpers
│   │       ├── image-optimization.ts # Image optimization
│   │       └── performance.ts # Performance monitoring
│   ├── data/                # Static data files
│   │   └── cards.json       # Card database (50+ cards)
│   ├── stores/              # Nanostores (state management)
│   │   ├── pack.ts          # Pack state & operations
│   │   ├── ui.ts            # UI state (animations, routing)
│   │   ├── deck.ts          # Deck state management
│   │   ├── upgrade.ts       # Upgrade state
│   │   ├── batch.ts         # Batch opening state
│   │   ├── theme.ts         # Theme (light/dark) state
│   │   ├── audio.ts         # Audio settings state
│   │   ├── notifications.ts # Notification state
│   │   ├── lightbox.ts      # Lightbox overlay state
│   │   ├── tutorial.ts      # Tutorial progress state
│   │   └── analytics/       # Analytics providers
│   │       ├── ga.ts        # Google Analytics
│   │       └── plausible.ts # Plausible Analytics
│   ├── types/               # TypeScript definitions
│   │   ├── index.ts         # Main export (re-exports all types)
│   │   ├── card.ts          # Card-related types
│   │   ├── pack.ts          # Pack types
│   │   ├── collection.ts    # Collection types
│   │   ├── achievements.ts  # Achievement types
│   │   ├── daily-rewards.ts # Daily rewards types
│   │   ├── constants.ts     # Game constants
│   │   ├── trading-crafting.ts # Trading & crafting types
│   │   ├── season.ts        # Season types
│   │   ├── core.ts          # Core shared types
│   │   ├── admin.ts         # Admin types
│   │   ├── analytics.ts     # Analytics types
│   │   ├── api.ts           # API types
│   │   ├── email.ts         # Email types
│   │   ├── events.ts        # Event types
│   │   ├── features.ts      # Feature flags
│   │   ├── gameplay.ts      # Gameplay mechanics
│   │   ├── leaderboard.ts   # Leaderboard types
│   │   ├── monetization.ts  # Monetization types
│   │   ├── security.ts      # Security types
│   │   └── social.ts        # Social features
│   ├── i18n/                # Internationalization
│   │   ├── index.ts         # Translation utilities
│   │   ├── store.ts         # Locale state management
│   │   ├── locales/         # Translation files
│   │   │   ├── en.json      # English (300+ keys)
│   │   │   └── es.json      # Spanish
│   │   └── README.md        # I18N documentation
│   └── pages/               # Astro routes
│       ├── index.astro      # Landing page
│       ├── pack.astro       # Pack opening page
│       ├── collection.astro # Collection management
│       ├── deck-builder.astro # Deck building
│       ├── upgrade.astro    # Card upgrades
│       ├── crafting.astro   # Card crafting
│       ├── trade.astro      # Trading hub
│       ├── trade/create.astro # Create trade offers
│       ├── leaderboard.astro # Leaderboards
│       ├── offline.astro    # Offline page
│       └── test.astro       # Testing page
├── tests/                   # Test files (Vitest)
│   ├── pack/
│   │   └── generator.test.ts   # Pack generation tests
│   ├── card/
│   │   └── database.test.ts    # Card data validation
│   ├── unit/
│   │   ├── lib/security/pack-validator.test.ts
│   │   └── stores/collection.test.ts
│   └── integration/         # End-to-end tests
├── discord-bot/            # Discord bot integration
│   └── index.ts            # Bot entry point
├── scripts/                # Build utility scripts
│   ├── optimize-images.mjs # Image optimization
│   └── generate-sitemap.mjs # Sitemap generation
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

### Dad Types & Special Card Types

**Core DICKTATOR DADS (archetypes):**
```
BBQ_DAD | FIX_IT_DAD | GOLF_DAD | COUCH_DAD | LAWN_DAD
CAR_DAD | OFFICE_DAD | COOL_DAD | COACH_DAD | CHEF_DAD
HOLIDAY_DAD | WAREHOUSE_DAD | VINTAGE_DAD | FASHION_DAD
TECH_DAD
```

**Extended Archetypes & Variants:**
```
SUBURBAN_SPY | GAMER_GIZZARDS | PREPPER_PENIS
BBQ_BRAWLER | SUBURBAN_SOCIALITE | NEIGHBORHOOD_NOSY
SON_SPAWNS | DAUGHTER_DINGBATS | UNCLE_UPROARS
SUBURBAN_SIDEKICKS
```

**Special Card Types (inspired by classic TCG mechanics):**
```
ITEM      - Equipment and accessories (standard gear)
EVENT     - Shitshow Scenarios (one-time use cards, MTG-style)
TERRAIN   - Suburban Shitfields (permanent battlefield modifiers, Pokémon Stadium-style)
EVOLUTION - Midlife Crisis Mutations (upgrade base dads, Pokémon Evolution-style)
CURSE     - Dad Damnations (negative effects on opponents, MTG Curses-style)
TRAP      - Suburban Suckerpunches (face-down triggered effects, Yu-Gi-Oh! Trap-style)
```

See `DadDecK_Card_Types.md` for detailed examples and mechanics of all card types.

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
6. Share → Individual card images for social media
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

**Ralph Loop cross-reference:** Treat generation + validation like a loop with a "stop hook"
gate (validation) before advancing to reveal. This is the same trust pattern described in
`docs/RALPH_LOOP_ARCHITECTURE.md` (backpressure + visible acceptance criteria).

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
// See RARITY_CONFIG in src/types/index.ts
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
**`src/data/cards.json`** - Contains all card data (50+ cards)
**`src/lib/cards/database.ts`** - Data access layer that loads and wraps the JSON

### Adding New Cards
1. **Add card to `src/data/cards.json`**: Follow the JSON structure with all required fields
2. **Update database.ts** if needed: The data access layer in `src/lib/cards/database.ts` provides helper functions

**Card structure (JSON):**
```json
{
  "id": "bbq_dad_001",
  "name": "Grillmaster Gary",
  "subtitle": "The Flame Keeper",
  "type": "BBQ_DAD",
  "rarity": "rare",
  "artwork": "/images/cards/bbq-dad-001.png",
  "stats": {
    "dadJoke": 75,
    "grillSkill": 95,
    "fixIt": 40,
    "napPower": 30,
    "remoteControl": 50,
    "thermostat": 60,
    "sockSandal": 45,
    "beerSnob": 70
  },
  "flavorText": "Propane is just a suggestion.",
  "abilities": [{
    "name": "Perfect Sear",
    "description": "Flip a burger. If it lands rare, gain +10 Grill Skill."
  }],
  "series": 1,
  "cardNumber": 1,
  "totalInSeries": 50,
  "artist": "AI Assistant",
  "holoVariant": "reverse"
}
```

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
1. **Define types first** - Add to `src/types/index.ts`
2. **Create store** - Add to `src/stores/` if stateful
3. **Build component** - Use .astro for static, .svelte for interactive
4. **Add logic** - Place in `src/lib/` folder
5. **Test** - Add test file to `tests/` directory

### Styling Guidelines
- **Use Tailwind utility classes** - See `tailwind.config.mjs`
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

**4. LocalStorage Quota Exceeded**
```typescript
// ✅ SOLUTION: Quota management with compression
import { persistentAtom } from '@nanostores/persistent';

export const collection = persistentAtom(
  'daddeck-collection',
  DEFAULT_COLLECTION,
  {
    encode: (value) => JSON.stringify(value), // Add compression here
    decode: (value) => JSON.parse(value),
  }
);

// Monitor quota
function checkQuota() {
  const usage = JSON.stringify(localStorage).length;
  const limit = 5 * 1024 * 1024; // 5MB typical
  if (usage > limit * 0.9) {
    console.warn('LocalStorage near capacity');
  }
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

// Mock LocalStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
} as Storage;
```

---

## 🎨 Styling & Theming

### CSS Utilities Strategy

**Two-Tier Approach:**
1. **Component Classes** (`src/styles/global.css`) - Reusable semantic classes
2. **Tailwind Utilities** - Layout, spacing, and one-off styling

**When to Use Component Classes:**
- ✅ Repeated patterns (buttons, modals, inputs)
- ✅ Complex hover/focus states
- ✅ Consistent UI elements

**When to Use Tailwind:**
- ✅ Layout (grid, flex, spacing)
- ✅ Responsive breakpoints
- ✅ One-off styling needs

**Documentation:** See `docs/CSS_UTILITIES.md` for complete component class reference.

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
        dad: {
          bbq: '#ef4444',
          fixit: '#22c55e',
          golf: '#06b6d4',
          // ... other type colors
        }
      },
      animation: {
        'pack-tear': 'tear 1s ease-out',
        'card-flip': 'flip 0.6s ease-out',
        'glow-pulse': 'glow 2s ease-in-out infinite',
      }
    }
  }
}
```

### Styling Patterns

**1. Rarity-Based Styling**
```svelte
<div class="card border-2 border-rarity-{card.rarity}">
  <!-- Dynamic border color based on rarity -->
</div>

<!-- Or with computed classes -->
<script>
  const rarityColors = {
    common: 'border-gray-400',
    rare: 'border-yellow-500',
    epic: 'border-purple-500',
  };

  $: borderClass = rarityColors[card.rarity];
</script>

<div class="card border-2 {borderClass}">
  <!-- ... -->
</div>
```

**2. Responsive Design**
```svelte
<!-- Mobile-first approach -->
<div class="
  grid
  grid-cols-2           <!-- Mobile: 2 columns -->
  md:grid-cols-3        <!-- Tablet: 3 columns -->
  lg:grid-cols-4        <!-- Desktop: 4 columns -->
  gap-4                 <!-- Consistent spacing -->
">
  {#each cards as card}
    <Card {card} />
  {/each}
</div>
```

**3. Dark Mode Support**
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

**4. Animation Performance**
```svelte
<!-- ✅ GOOD: GPU-accelerated animations -->
<div class="transform will-change-transform transition-transform">
  <!-- Animating transform and opacity -->
</div>

<!-- ❌ BAD: CPU-intensive animations -->
<div class="animate-width">
  <!-- Avoid animating layout properties -->
</div>
```

---

## 🧪 Testing

### Run Tests
```bash
bun test                    # Watch mode
bun run test:run            # Single run
```

### Test Configuration
**Vitest setup** (`vitest.config.ts`):
- **Environment:** Node (for unit tests)
- **Include pattern:** `tests/**/*.test.ts`
- **Path aliases:** Same as tsconfig.json (`@/`, `@lib/`, `@stores/`, etc.)

### Test Structure
```
tests/
├── pack/
│   └── generator.test.ts   # Pack generation logic tests
├── card/
│   └── database.test.ts    # Card data validation tests
├── unit/
│   ├── lib/security/pack-validator.test.ts  # Anti-cheat tests
│   └── stores/collection.test.ts            # Store tests
└── integration/            # End-to-end flow tests
```

### What to Test
- **Pack generation** - Correct rarity distribution
- **Card data** - Valid stats, types, required fields
- **Random functions** - Distribution accuracy
- **UI state** - State transitions work correctly
- **Security** - Pack validation, anti-cheat measures

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
bun run generate-sitemap   # Generate sitemap.xml
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

### Environment Variables (Future)
```bash
# .env.example
PUBLIC_API_URL=           # For future API features
PUBLIC_ANALYTICS_ID=      # For tracking (GA, Plausible, etc.)
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
- ✅ 50+ unique cards in database

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

// Or use Svelte's $inspect directive
<script>
  import { inspect } from 'svelte';

  // Log all reactive statement executions
  $inspect(currentPack);
</script>
```

**2. Performance Profiling**
```javascript
// Measure pack generation time
console.time('pack-generation');
const pack = generatePack(config);
console.timeEnd('pack-generation');

// Profile animation performance
performance.mark('animation-start');
// ... animation code
performance.mark('animation-end');
performance.measure('animation', 'animation-start', 'animation-end');
```

**3. Network Requests**
```typescript
// Check if assets are loading
const img = new Image();
img.onload = () => console.log('Image loaded:', img.src);
img.onerror = () => console.error('Image failed:', img.src);
img.src = card.artwork;
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

  // 4. Check LocalStorage
  console.log('LocalStorage available:', !!localStorage);
  console.log('Current usage:', JSON.stringify(localStorage).length, 'bytes');
}
```

**Issue: Animations Laggy**
```svelte
<script>
  // Check if animations are causing lag
  let fps = $state(0);
  let frameCount = 0;
  let lastTime = performance.now();

  function measureFPS() {
    frameCount++;
    const currentTime = performance.now();
    if (currentTime >= lastTime + 1000) {
      fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      frameCount = 0;
      lastTime = currentTime;
    }
    requestAnimationFrame(measureFPS);
  }

  onMount(() => measureFPS());
</script>

<div>FPS: {fps}</div>
```

**Issue: LocalStorage Full**
```typescript
function checkStorage() {
  const total = JSON.stringify(localStorage).length;
  const limit = 5 * 1024 * 1024; // 5MB
  const percentage = (total / limit) * 100;

  if (percentage > 90) {
    console.warn(`Storage at ${percentage.toFixed(1)}% capacity`);
    // Suggest clearing old packs or compressing data
  }

  return { total, limit, percentage };
}
```

### Debug Mode Toggle

```typescript
// src/stores/debug.ts
import { atom } from 'nanostores';

export const debugMode = atom(false);

export function enableDebug() {
  debugMode.set(true);
  console.log('%c🔧 Debug Mode Enabled', 'color: orange; font-size: 16px');
}

export function logStore(storeName: string, store: any) {
  if (!debugMode.get()) return;

  store.subscribe((value: any) => {
    console.log(`%c[${storeName}]`, 'color: blue', value);
  });
}
```

---

## ⚡ Performance Optimization Guide

### Bundle Analysis

```bash
# Analyze bundle size
bun run build
bunx vite-bundle-visualizer
```

**Optimization Targets:**
- Initial JS bundle: <200KB (gzipped)
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Pack generation: <500ms

### Code Splitting Strategy

**1. Route-Based Splitting**
```typescript
// Astro automatically splits by route
// Each page gets its own chunk

// Lazy load heavy components
const PackOpener = lazy(() => import('@/components/pack/PackOpener.svelte'));
```

**2. Vendor Chunking** (Already configured)
```javascript
// astro.config.mjs
manualChunks: (id) => {
  if (id.includes('html2canvas')) return 'vendor-html2canvas';
  if (id.includes('svelte')) return 'vendor-svelte';
  if (id.includes('nanostores')) return 'vendor-nanostores';
  return 'vendor';
}
```

**3. Dynamic Imports**
```typescript
// Load expensive features on demand
async function openShareDialog() {
  const { ShareDialog } = await import('@/components/share/ShareDialog.svelte');
  // Show dialog
}
```

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

**2. Virtual Scrolling** (For large collections)
```svelte
<!-- Only render visible items -->
<script>
  import { VirtualList } from 'svelte-virtual-list';

  let visibleRange = $state({ start: 0, end: 20 });

  function onScroll(event) {
    const { scrollTop, clientHeight } = event.target;
    visibleRange.start = Math.floor(scrollTop / ITEM_HEIGHT);
    visibleRange.end = visibleRange.start + Math.ceil(clientHeight / ITEM_HEIGHT);
  }
</script>

<div on:scroll={onScroll}>
  {#each cards.slice(visibleRange.start, visibleRange.end) as card}
    <Card {card} style="position: absolute; top: {card.index * ITEM_HEIGHT}px" />
  {/each}
</div>
```

**3. Debouncing User Input**
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

### Image Optimization

**1. Pre-Load Critical Images**
```svelte
<link rel="preload" as="image" href="/images/pack-base.png" />
```

**2. Lazy Load Offscreen Images**
```svelte
<img
  src={card.artwork}
  loading="lazy"
  decoding="async"
/>
```

**3. Use Modern Formats**
```html
<!-- Serve WebP with fallback -->
<picture>
  <source srcset="/images/card.webp" type="image/webp" />
  <img src="/images/card.png" alt="Card" />
</picture>
```

---

## 🚀 Deployment Guide

### Pre-Deployment Checklist

```bash
# 1. Run all checks
bun run test           # Ensure tests pass
bun run build          # Verify build succeeds
bun run preview        # Test production build locally

# 2. Check bundle size
bun run build
du -sh dist/           # Should be <500KB

# 3. Test critical paths
# - Pack opening flow
# - Collection persistence
# - Mobile responsiveness

# 4. Validate SEO
# - Check meta tags
# - Verify sitemap.xml
# - Test Open Graph tags
```

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
bun install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

**vercel.json Configuration:**
```json
{
  "buildCommand": "bun run build",
  "outputDirectory": "dist",
  "framework": null,
  "headers": [
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Netlify Deployment

**netlify.toml Configuration:**
```toml
[build]
  command = "bun run build"
  publish = "dist"

[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables

**For Production:**
```bash
# Vercel/Netlify Dashboard
PUBLIC_ANALYTICS_ID=G-XXXXXXXXXX
PUBLIC_SENTRY_DSN=https://...
PUBLIC_DISCORD_CLIENT_ID=YOUR_CLIENT_ID
```

**For Local Development:**
```bash
# .env.local
PUBLIC_ANALYTICS_ID=debug
PUBLIC_API_URL=http://localhost:4321
```

### Post-Deployment Monitoring

**1. Analytics Integration**
```typescript
// src/lib/analytics/track.ts
export function trackPackOpen(pack: Pack) {
  if (typeof window === 'undefined') return;

  // Google Analytics
  window.gtag?.('event', 'pack_open', {
    rarity: pack.bestRarity,
    card_count: pack.cards.length,
    holo_count: pack.cards.filter(c => c.isHolo).length
  });

  // Plausible
  window.plausible?.('Pack Open', {
    props: { rarity: pack.bestRarity }
  });
}
```

**2. Error Tracking** (Sentry)
```typescript
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});

// Track errors in stores
currentPack.subscribe((pack) => {
  try {
    // ... operations
  } catch (error) {
    Sentry.captureException(error);
  }
});
```

**3. Performance Monitoring**
```typescript
// Measure Core Web Vitals
export function reportWebVitals(metric) {
  const { name, value, id } = metric;

  // Send to analytics
  window.gtag?.('event', name, {
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    event_label: id,
    non_interaction: true,
  });
}
```

---

## 🐛 Common Issues & Solutions

### Pack Generation Not Working
**Check:** `src/lib/pack/generator.ts` - ensure `CARDS` array is populated
**Check:** Browser console for Nanostores errors
**Fix:** Clear localStorage: `localStorage.clear()`

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

## 📝 Key Files to Understand

### Must Read (Priority Order)
1. **`src/types/index.ts`** - All types, understand the data model
2. **`src/stores/pack.ts`** - Pack state management
3. **`src/lib/pack/generator.ts`** - How packs are created
4. **`src/components/pack/PackOpener.svelte`** - Main pack opening UI
5. **`PRD.md`** - Full product requirements (90KB document!)

### Quick Reference Files
- **`docs/CARD_MECHANICS.md`** - Complete card collecting & pack opening mechanics (NEW)
- **`docs/RALPH_LOOP_ARCHITECTURE.md`** - Agentic loop UX patterns (stop hooks, HOTL)
- **`tailwind.config.mjs`** - Custom design tokens
- **`astro.config.mjs`** - Integrations & build config (code splitting, terser)
- **`vitest.config.ts`** - Test configuration with path aliases
- **`src/data/cards.json`** - All card data (50+ cards)
- **`src/lib/security/pack-validator.ts`** - Anti-cheat validation logic

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

# Astro CLI
bun astro add <package>  # Add Astro integration
bun astro check          # Type check Astro components
```

---

## 🎯 Project Status & Features

### Core MVP Features ✅
- ✅ **Pack Opening Flow** - Complete 6-stage state machine (idle → results)
- ✅ **Card Reveal Animations** - Individual card flip with skip option
- ✅ **Rarity-based VFX** - Particle systems, glows, holo effects
- ✅ **Social Sharing** - Card pull sharing for social media
- ✅ **Collection Persistence** - LocalStorage-based collection management
- ✅ **Mobile Responsive** - 65% mobile, 35% desktop optimized
- ✅ **Batch Opening** - Open multiple packs at once (see HOTL dashboard patterns in
  `docs/RALPH_LOOP_ARCHITECTURE.md`)
- ✅ **Generative Card Art** - Procedural artwork for cards without images

### Advanced Features ✅

**Combat & Mechanics:**
- ✅ Card battle system (US090) with stat-based logic
- ✅ Type advantages and synergy bonuses
- ✅ Status effects (Grilled, Lectured, Drunk, etc.)
- ✅ Battle log generation and victory conditions

**Trading System:**
- ✅ Trade offer creation (card-for-card, bulk trades)
- ✅ Trade history and status tracking
- ✅ Trade validation and fair exchange checks

**Deck Building:**
- ✅ Deck builder with validation rules
- ✅ Multiple deck slots with save/load
- ✅ Deck stats visualization (type distribution, rarities)
- ✅ Card collection filtering for deck building

**Card Upgrade System:**
- ✅ Sacrifice cards to level up favorites
- ✅ Stat-based upgrade paths
- ✅ Upgrade success chance mechanics
- ✅ Material cost calculator

**Achievements & Rewards:**
- ✅ Achievement system with popup notifications
- ✅ Daily rewards system (login streaks)
- ✅ Achievement gallery and tracking

**Crafting:**
- ✅ Card crafting system with recipes
- ✅ Material collection and management
- ✅ Crafting animations and results

**Leaderboards:**
- ✅ Global leaderboards (collection value, pack count)
- ✅ Filterable by region and time period
- ✅ Real-time ranking updates

**UI/UX Enhancements:**
- ✅ Theme toggle (light/dark mode)
- ✅ Cinematic mode toggle (reduced animations)
- ✅ Tutorial overlay system
- ✅ Performance monitoring dashboard
- ✅ Error boundaries and error displays
- ✅ Loading skeletons for better perceived performance
- ✅ Toast notification system
- ✅ Card comparison view
- ✅ Pack history panel
- ✅ **Collection search** (SEARCH-001) - Full-text search across names and flavor text
- ✅ **Collection filters** (FILTER-001/002) - Multi-select rarity and dad type filters
- ✅ **Collection sorting** (FILTER-003) - Sort by date/rarity/type with ascending/descending
- ✅ **Interactive stat tooltips** - Desktop hover & mobile tap-to-reveal with detailed descriptions

**Analytics:**
- ✅ Google Analytics integration
- ✅ Plausible Analytics support (privacy-focused)
- ✅ Event tracking for pack opens, trades, etc.

**SEO:**
- ✅ Dynamic meta tags and Open Graph
- ✅ Sitemap generation (auto-runs on build)
- ✅ Image optimization pipeline (pre-build hook)

**Offline Support:**
- ✅ Offline page with service worker
- ✅ Graceful degradation for network issues

### Integration Features

**Discord Bot** (US091):
- Location: `discord-bot/index.ts`
- Command: `bun run discord-bot` (production) or `bun run discord-bot:dev` (watch mode)
- Integrates with Discord.js v14.25.1
- Features: Pack opening, card lookup, leaderboards

### Post-MVP Roadmap 🚧
- Season 2 card expansion (30+ new cards)
- User accounts & cloud collections (Server-side)
- Real-time multiplayer PvP matches
- Mobile application (React Native / Capacitor)
- Tournament mode & competitive seasons
- Guild/clan system (Neighborhood Alliances)

---

## 🎯 Claude Skills for DadDeck Development

### High-Priority Skills (Use First)

| Skill | When to Use |
|:------|:------------|
| **`performance-analyst`** | Optimizing animations, hitting 60fps target on pack opening |
| **`a11y-auditor`** | Accessibility review for pack opening flow, keyboard nav, screen readers |
| **`code-quality`** | Validate TypeScript strict mode, pre-commit checks, linting |
| **`frontend-design`** | Designing holo effects, premium visual polish, animations |
| **`systematic-debugging`** | Complex state machine bugs in pack flow, state transitions |

### Task-Specific Skills

| Task | Skill to Use |
|:-----|:------------|
| Adding new cards | `/code-quality` → validate data structure, then `/documentation-engineer` |
| Refactoring stores | `/architecture-advisor` → review Nanostores patterns |
| Animation issues | `/performance-analyst` → profile, then `/frontend-design` → optimize |
| Deployment | `/deployment-engineer` → Vercel optimization |
| New features | `/test-driven-development` → TDD workflow |
| State management | `/architecture-advisor` → review patterns, then `/systematic-debugging` if needed |

### Auto-Activating Skills

These trigger automatically on relevant files or keywords:
- `react-best-practices` → `.svelte` / `.astro` files
- `code-quality` → Keywords: "validate", "lint", "check"
- `performance-analyst` → Keywords: "performance", "slow", "optimize"
- `systematic-debugging` → Keywords: "bug", "error", "fail"

### Manual Activation

Type `/skillname` to invoke any skill in conversation (e.g., `/performance-analyst`).

---

**Last updated:** January 17, 2026

---

## 🆕 Recent Feature Additions (January 2026)

### Internationalization (I18N) System

**Infrastructure Added:**
- **`src/i18n/`** - Complete i18n system with locales
- **`src/i18n/index.ts`** - Core translation utilities (`t()`, `tc()`, `formatNumber()`, `formatDate()`)
- **`src/i18n/store.ts`** - Nanostores integration for reactive locale state
- **`src/i18n/locales/en.json`** - English base translation (300+ keys)
- **`src/i18n/locales/es.json`** - Complete Spanish translation
- **`src/components/common/LanguageSelector.svelte`** - Language dropdown UI

**Features:**
- **300+ translation keys** covering all UI strings
- **Parameter interpolation** - `{count}`, `{name}`, etc.
- **Browser language detection** - Auto-detects `navigator.language`
- **LocalStorage persistence** - Remembers user's language preference
- **Feature organization** - Keys grouped by feature (pack, card, collection, deck, trade, etc.)
- **Culturally appropriate translations** - Maintains dad humor tone in Spanish

**Usage Pattern:**
```svelte
<script>
  import { t } from '@/i18n';

  let packCount = 5;
</script>

<h1>{$t('pack.title')}</h1>
<p>{$t('pack.opened', { count: packCount })}</p>

<!-- Output: "Opened 5 packs" / "5 sobres abiertos" -->
```

**Updated Components:**
- **BaseLayout.astro** - Initializes i18n on app load
- **Navigation.svelte** - Integrated language selector (desktop + mobile)
- **All feature pages** - Using `t()` for UI strings

**Documentation:** See `I18N_IMPLEMENTATION.md` and `src/i18n/README.md`

---

### CSS Utilities Consolidation

**Problem Solved:** Components were repeating the same long Tailwind class strings, leading to larger HTML output and harder maintenance.

**Solution:** Created semantic component classes using Tailwind's `@apply` directive in `src/styles/global.css`.

**Documentation:** See `docs/CSS_UTILITIES.md` for complete reference.

**New Component Classes:**

**Buttons:**
- `.btn-primary` - Primary action buttons with gradient (pack opening, confirm)
- `.btn-secondary` - Secondary actions (cancel, go back)
- `.btn-icon` - Icon-only buttons (close, settings)
- `.btn-cta` - Large call-to-action buttons

**Modals:**
- `.modal-container` - Full-screen flex-centered wrapper
- `.modal-backdrop` - Backdrop overlay with blur
- `.modal-content` - Modal content container
- `.modal-close-btn` - Positioned close button

**Feature Cards:**
- `.feature-card` - Feature showcase cards
- `.icon-container` - Circular icon containers
- `.text-feature-title` - Feature title typography
- `.text-feature-desc` - Feature description typography

**Form Elements:**
- `.input-field` - Standard text input styling
- `.select-field` - Dropdown select styling
- `.checkbox-field` - Checkbox input styling
- `.range-slider` - Range input styling

**Loaders:**
- `.spinner` - Rotating loading spinner
- `.pulse-text` - Pulsing text animation
- `.skeleton` - Content placeholder animation

**Usage:**
```svelte
<!-- Before: Long Tailwind strings -->
<button class="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg shadow-lg hover:from-amber-400 hover:to-orange-400 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900">
  Open Pack
</button>

<!-- After: Semantic class -->
<button class="btn-primary">
  Open Pack
</button>
```

**Benefits:**
- 40-60% less HTML/Svelte output
- Consistent styling across components
- Easy to update common patterns
- More readable component code

---

### Type System Reorganization

**Changes:** Split monolithic `src/types/index.ts` into feature-specific type files for better maintainability.

**New Type Files:**
- `src/types/card.ts` - Card-related types (Card, CardStats, CardInCollection)
- `src/types/pack.ts` - Pack types (Pack, PackConfig, PackState)
- `src/types/collection.ts` - Collection types (UserCollection, PackHistoryEntry)
- `src/types/achievements.ts` - Achievement system types
- `src/types/daily-rewards.ts` - Daily rewards types
- `src/types/constants.ts` - Game constants (RARITY_CONFIG, DAD_TYPES, etc.)
- `src/types/trading-crafting.ts` - Trading and crafting types
- `src/types/season.ts` - Season-related types

**Benefits:**
- Faster TypeScript compilation
- Easier to find relevant types
- Better code organization
- Reduced merge conflicts

**Backward Compatible:** All types still re-exported from `src/types/index.ts` for existing imports.

---

### Collection Search & Filter System

**Components Added:**
- **CollectionSearch.svelte** (SEARCH-001) - Full-text search across card names and flavor text
- **CollectionFilters.svelte** (FILTER-001/002/003) - Multi-select filters for rarity and dad types
- **CollectionSort.svelte** (FILTER-003) - Sort by date obtained, rarity, or dad type (ascending/descending)

**Features:**
- **Real-time search** - Filters as you type with debouncing (300ms)
- **Flavor text search** - Search includes card flavor text for better discoverability
- **Multi-select filters** - Combine multiple rarities and dad types
- **Sort options** - Date obtained, rarity, dad type with ascending/descending toggle
- **Filter chips UI** - Visual filter tags that can be clicked to remove
- **Clear all button** - Reset all filters and search at once

**Implementation Pattern:**
```typescript
// Derived store pattern for filtering
import { computed } from 'nanostores';

export const filteredCards = computed(
  [collection, searchQuery, selectedRarities, selectedDadTypes, sortBy],
  (coll, search, rarities, types, sort) => {
    let cards = coll.cards;

    // Apply search filter
    if (search) {
      cards = cards.filter(card =>
        card.name.toLowerCase().includes(search.toLowerCase()) ||
        (card.flavorText && card.flavorText.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Apply rarity filter
    if (rarities.length > 0) {
      cards = cards.filter(card => rarities.includes(card.rarity));
    }

    // Apply dad type filter
    if (types.length > 0) {
      cards = cards.filter(card => types.includes(card.type));
    }

    // Apply sorting
    cards.sort((a, b) => {
      // Sort logic based on sortBy option
      return result;
    });

    return cards;
  }
);
```

### Interactive Stat Tooltips

**Component Added:**
- **StatTooltip.svelte** - Interactive tooltip component for card stats

**Features:**
- **Desktop hover** - 400ms delay before showing tooltip (prevents accidental triggers)
- **Mobile tap & hold** - Long press to show tooltip, 2-second auto-dismiss
- **Haptic feedback** - Vibration on mobile when tooltip appears
- **Smart positioning** - Automatically adjusts to stay within viewport bounds
- **Stat descriptions** - Detailed explanations of each stat's purpose
- **Stat ratings** - Visual rating scale (Terrible → Legendary) with color-coded progress bar
- **Rarity theming** - Tooltip colors match card rarity

**Usage Pattern:**
```svelte
<script>
  import { StatTooltip } from '@/components/card/StatTooltip.svelte';

  let statElement: HTMLElement;

  function handleMouseEnter(event) {
    // Programmatically trigger tooltip
  }
</script>

<div bind:this={statElement} on:mouseenter={handleMouseEnter}>
  <span>{card.stats.dadJoke}</span>
</div>

<StatTooltip
  statKey="dadJoke"
  statValue={card.stats.dadJoke}
  triggerElement={statElement}
  cardRarity={card.rarity}
/>
```

**Type Definitions Added:**
```typescript
// src/types/index.ts
export const STAT_DESCRIPTIONS: Record<keyof CardStats, string> = {
  dadJoke: 'Quality of terrible puns and "groaner" jokes...',
  grillSkill: 'BBQ mastery level. Determines success at grilling...',
  // ... etc for all 8 stats
};
```

**Accessibility Features:**
- ARIA `role="tooltip"` and `aria-live="polite"` for screen readers
- `prefers-reduced-motion` support disables animations
- Keyboard accessible (focus handling via parent element)
- High contrast text with text-shadow for readability

---

## 📚 Documentation Summary

This CLAUDE.md file now contains comprehensive documentation covering:

### Quick Reference
- **Tech Stack** - Astro, Svelte, Tailwind, Nanostores, Bun
- **Quick Commands** - Development, build, test, deploy
- **Project Structure** - Complete file organization

### Architecture Deep Dives
- **System Architecture** - 4-layer architecture diagram
- **Data Flow** - From user action to visual update
- **State Management** - Nanostores patterns and persistence
- **Component Architecture** - Hierarchy and communication
- **Key Algorithms** - Pack generation, battles, crafting
- **Security** - Anti-cheat and validation
- **Performance** - Build and runtime optimizations

### Development Guides
- **Feature Workflow** - Step-by-step feature development
- **Code Patterns** - Best practices and examples
- **Common Pitfalls** - Problems and solutions
- **Styling & Theming** - Tailwind configuration and patterns
- **Testing** - Unit and integration tests

### Production Readiness
- **Debugging Guide** - Browser DevTools and diagnostics
- **Performance Optimization** - Bundle analysis and code splitting
- **Deployment Guide** - Vercel/Netlify configurations
- **Post-Deployment** - Monitoring and analytics

### Project Status
- **Features** - Complete list of implemented features
- **Roadmap** - Future enhancements planned
- **Claude Skills** - When to use specialized agents

---

## 🎓 For New Developers

**Start Here:**
1. Read the **Project Overview** (section 1)
2. Study the **Architecture Overview** (section 4)
3. Follow the **Feature Development Workflow** (section 11)
4. Reference **Code Patterns & Best Practices** (section 11.2)
5. Check **Common Pitfalls** when stuck (section 11.3)

**Key Files to Understand:**
- `src/types/index.ts` - All data models
- `src/lib/pack/generator.ts` - Core business logic
- `src/stores/pack.ts` - State management example
- `astro.config.mjs` - Build configuration
- `tailwind.config.mjs` - Design tokens

**When Adding Features:**
1. Define types in `src/types/`
2. Create store in `src/stores/`
3. Add logic to `src/lib/`
4. Build component in `src/components/`
5. Write tests in `tests/`

**When Debugging:**
1. Check browser console for errors
2. Use `diagnosePackIssue()` for pack problems
3. Enable debug mode with `debugMode.set(true)`
4. Profile performance with DevTools

**Before Deploying:**
1. Run `bun test` - ensure tests pass
2. Run `bun run build` - verify build succeeds
3. Run `bun run preview` - test production build
4. Check bundle size: `du -sh dist/`

---

**Questions?** Check the PRD (`PRD.md`) or ask about specific components!
