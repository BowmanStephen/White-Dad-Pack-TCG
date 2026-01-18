# DadDeck TCG - Complete Feature Inventory

**Generated:** January 18, 2026  
**Purpose:** Comprehensive documentation of all implemented features in DadDeck TCG  
**Version:** 2.2.0

---

## 📋 Executive Summary

DadDeck TCG is a satirical trading card game simulator featuring suburban American dad culture. Built with Astro + Svelte + Nanostores, it features 50+ unique cards, 15 dad types, 6 rarity tiers, and comprehensive gameplay mechanics including pack opening, collection management, deck building, battles, trading, and crafting.

**Tech Stack:**
- **Frontend:** Astro 5.16+, Svelte 5.46+, Tailwind CSS 3
- **State Management:** Nanostores 1.1+ with IndexedDB persistence
- **Build:** Bun runtime with Vitest 4.0+ testing
- **Deployment:** Static site generation (Vercel/Netlify ready)

**Scope:**
- 31 state management stores
- 29 component directories
- 10 page routes
- 25+ major features
- 50+ cards in database

---

## 🎮 Core Gameplay Systems

### 1. Pack Opening System

**State Machine (6 stages):**
```
idle → generating → pack_animate → cards_ready → revealing → results
```

**Key Features:**
- **Rarity Distribution:** Guaranteed slots (1-3: common, 4-5: uncommon+, 6: rare+)
- **Pity System (PACK-003):** Bad luck protection with guaranteed pulls
  - Rare at 10 packs
  - Epic at 30 packs
  - Legendary at 60 packs
  - Mythic at 100 packs
- **RNG Variance (PACK-010):** Seeded randomness with ±10% variance
- **Tear Animations (PACK-027):** Random pack tear animation selection
- **Auto-Reveal:** 0.3s delay between card reveals
- **Wishlist Integration (PACK-020):** Highlights wishlisted cards
- **Holographic Variants:** 5 types (none, standard, reverse, full_art, prismatic)

**File:** `src/stores/pack.ts` (535 lines)

---

### 2. Collection Management System

**Storage Architecture:**
- **IndexedDB:** Browser-based persistent storage
- **Quota Management (PACK-045):** Automatic cleanup at 75%, 85%, 90%, 95% capacity
- **Debouncing:** 500ms save delay to prevent excessive writes

**Features:**
- **Rarity Tracking:** Counts of each rarity owned
- **Statistics:** Total cards, unique cards, best pulls, pack opening history
- **Search (SEARCH-001):** Full-text search across names and flavor text
- **Filters (FILTER-001/002):** Multi-select rarity and dad type filters
- **Sort (FILTER-003):** Date obtained, rarity, dad type with ascending/descending
- **Pack History:** Complete record of all opened packs
- **Missing Cards Panel:** Tracks cards not yet collected
- **Wishlist Panel (PACK-020):** Mark desired cards for alerts

**File:** `src/stores/collection.ts` (508 lines)

---

### 3. Deck Building System

**Validation Rules:**
- Maximum 10 decks per player
- Maximum 4 copies of any card per deck
- Minimum 1 card per deck
- Deck name max 50 characters

**Analytics Tracking:**
- Deck size
- Average rarity
- Total power (sum of all card stats × rarity multiplier)
- Card count
- Deck type (custom/prebuilt)

**Stat Normalization:**
- Ensures fair battles regardless of deck size
- Formula: `stats ÷ cardCount`

**File:** `src/stores/deck.ts` (278 lines)

---

### 4. Battle System

**Power Calculation:**
```typescript
cardPower = average(stats) × rarityMultiplier

rarityMultipliers:
  common: 1.0x
  uncommon: 1.2x
  rare: 1.5x
  epic: 1.8x
  legendary: 2.2x
  mythic: 3.0x
```

**Damage Formula:**
```typescript
baseDamage = attackPower - (defensePower × 0.5)
damage = max(5, baseDamage)

// RNG factor (±20%)
rng = 0.8 + Math.random() × 0.4
damage = floor(damage × rng)

// Critical hit (10% base + 1% per 10 attack stat)
critChance = 0.1 + (attackPower / 1000)
if (random() < critChance) damage ×= 2
```

**Type Advantages (PACK-007):**
- Rock-paper-scissors balance system
- Each type has 2 advantages, 2 disadvantages
- Advantage: +20% damage (1.2x multiplier)
- Disadvantage: -20% damage (0.8x multiplier)
- 15 dad types with complete advantage matrix

**Status Effects (PACK-011):**
- Stacking system (max 2 stacks per effect type)
- Second stack is 50% as potent
- 8 effect types (Grilled, Lectured, Drunk, Fixed, Napped, Remote-Controlled, Thermostat-War, Sock-Sandal-Shamed)

**Themed Deck Synergy (PACK-009):**
- Rewards specialization
- 5+ cards same type: +15% power
- 3+ cards same type: +5% power

**RNG Variance (PACK-010):**
- Glancing blow: 10% chance for 0.5x damage
- Critical hit: 5% chance for 1.5x damage
- ±10% random variance on all attacks

**File:** `src/lib/mechanics/combat.ts` (640 lines)

---

### 5. Trading System

**Features:**
- **URL Encoding:** Share trade offers via URL-safe base64 encoding
- **Validation:** Both offered and requested cards required (max 6 each)
- **Expiration:** Automatic clearing of expired trades
- **History:** Complete record of all trades
- **Status Tracking:** pending, accepted, declined, expired

**Trade Flow:**
1. Select offered cards (from your collection)
2. Select requested cards (from partner's collection)
3. Validate trade (both sides have required cards)
4. Create trade offer with 7-day expiration
5. Share URL with trading partner
6. Partner accepts/declines
7. Cards exchanged on acceptance

**File:** `src/stores/trade.ts` (338 lines)

---

### 6. Crafting System

**Recipes:**
- `common_to_uncommon`: 5 common → 1 uncommon (100% success)
- `uncommon_to_rare`: 5 uncommon → 1 rare (80% success, 60% return)
- `rare_to_epic`: 5 rare → 1 epic (30% success, 60% return)
- `epic_to_legendary`: 5 epic → 1 legendary (15% success, 40% return)
- `legendary_to_mythic`: 5 legendary → 1 mythic (5% success, 20% return)
- `holo_upgrade`: 3 same rarity + 1 holo → 1 holo variant (50% success)

**Recipe Discovery:**
- Starter recipes unlocked by default
- New recipes discovered on successful craft
- Persists to LocalStorage
- Toast notification on discovery

**Session Tracking:**
- Unique session ID for analytics
- Tracks crafts per session
- Success/failure statistics

**File:** `src/stores/crafting.ts` (453 lines)

---

## 🏆 Achievement System

**Toast Queue:**
- Sequential display of achievement popups
- 4-5 second auto-hide (5s for platinum/gold)
- Sound effects based on rarity
- Maximum 3 toasts queued

**Categories:**
- **Collection:** First card, complete rarity sets, etc.
- **Pack Opening:** X packs opened, pull first mythic, etc.
- **Battle:** X battles won, defeat all types, etc.
- **Trading:** X trades completed, etc.
- **Crafting:** X successful crafts, discover all recipes, etc.

**Persistence:**
- Achievements saved to LocalStorage
- Unlock timestamps tracked
- Rarity tiers (bronze, silver, gold, platinum)

**File:** `src/stores/achievements.ts` (193 lines)

---

## 🎨 UI/UX Features

### Theme System
- **Light/Dark Mode:** Toggle with persistence
- **System Preference:** Auto-detects prefers-color-scheme
- **Smooth Transitions:** 0.3s fade between themes

### Audio System
- **Sound Effects:** Pack tear, card reveal, achievement unlock
- **Rarity-Based:** Different sounds for each rarity
- **Volume Control:** Adjustable with mute option
- **Persistence:** Remembers user preferences

### Cinematic Mode
- **Reduced Animations:** For accessibility/performance
- **Simplified Effects:** Fewer particles, shorter duration
- **Respects Preferences:** Syncs with prefers-reduced-motion

### Notification System
- **Toast Queue:** Sequential message display
- **Event Types:** success, error, warning, info
- **Auto-Dismiss:** 3-5 second timeout
- **Manual Dismiss:** Click to close

### Tutorial System
- **Overlay:** Contextual tooltips
- **Progress Tracking:** Remembers completed steps
- **Skip Option:** Users can bypass
- **Onboarding:** First-time user guidance

### Loading States
- **Skeleton Screens:** Card skeletons, grid skeletons
- **Fade-In Animation:** Smooth content appearance
- **Progressive Enhancement:** Content loads incrementally

---

## 📊 Analytics System

**Providers:**
- **Google Analytics:** Event tracking, pageviews
- **Plausible:** Privacy-focused alternative

**Events Tracked:**
- `pack_opened` - Pack opening with rarity, holo count
- `battle_played` - Battle results with winner, type advantage
- `deck_created` - Deck statistics (size, power, rarity)
- `trade_completed` - Trade details (card counts)
- `craft_executed` - Crafting results (recipe, success)

**Privacy:**
- No personal identifiers
- Aggregate statistics only
- Respects Do Not Track

---

## 🔒 Security & Validation

### Anti-Cheat (PACK-012)
- **Duplicate Detection:** Fingerprint-based duplicate pack detection
- **Rarity Validation:** Ensures valid rarity distribution
- **Statistical Anomaly Detection:** Identifies suspicious patterns
- **Entropy Verification:** Validates randomness quality

### Deck Validation
- **Ownership Check:** Ensures player owns all cards in deck
- **Copy Limit:** Maximum 4 copies per card
- **Name Validation:** Length and character restrictions
- **Deck Count:** Maximum 10 decks per player

### Input Sanitization
- **DOMPurify:** HTML sanitization for user input
- **Entity Encoding:** Prevents XSS attacks
- **Type Guards:** Runtime type validation

---

## 📁 State Management Architecture

### Store Categories (31 total)

**Core State (6):**
1. `pack.ts` - Pack opening state machine
2. `collection.ts` - Collection management
3. `deck.ts` - Deck building
4. `trade.ts` - Trading system
5. `crafting.ts` - Crafting system
6. `battle.ts` - Battle state (empty - uses mechanics)

**Feature State (8):**
7. `upgrade.ts` - Card upgrades (empty)
8. `achievements.ts` - Achievement tracking
9. `daily-rewards.ts` - Daily login rewards (empty)
10. `leaderboard.ts` - Leaderboards (empty)
11. `wishlist.ts` - Wishlist management
12. `batch.ts` - Batch pack opening
13. `offline.ts` - Offline support
14. `network.ts` - Network status monitoring

**UI State (6):**
15. `ui.ts` - General UI state
16. `theme.ts` - Light/dark mode
17. `audio.ts` - Audio settings
18. `notifications.ts` - Toast notifications
19. `lightbox.ts` - Image lightbox
20. `tutorial.ts` - Tutorial progress

**Analytics (3):**
21. `analytics/ga.ts` - Google Analytics
22. `analytics/plausible.ts` - Plausible Analytics
23. `analytics/index.ts` - Analytics manager

**Other (4):**
24. `i18n.ts` - Internationalization (empty - uses /i18n/)
25. `errors.ts` - Error handling
26. `constants.ts` - Game constants
27. `config.ts` - App configuration

---

## 🎯 Component Architecture

### Component Directories (29 total)

**Pack Opening (7):**
1. `pack/` - Pack opening flow
2. `card/` - Card components
3. `loading/` - Loading states

**Battle Arena (4):**
4. `battle/` - Battle system
5. `art/` - Generative art

**Collection (9):**
6. `collection/` - Collection management
7. `gallery/` - Card gallery
8. `filters/` - Filter components

**Deck Building (4):**
9. `deck/` - Deck builder
10. `deck/selector/` - Deck selection
11. `deck/list/` - Card list
12. `deck/stats/` - Deck statistics

**Trading (3):**
13. `trade/` - Trading system
14. `trade/create/` - Trade creation
15. `trade/view/` - Trade viewing

**Crafting (5):**
16. `crafting/` - Crafting station
17. `crafting/selector/` - Material selection
18. `crafting/recipe/` - Recipe selection
19. `crafting/result/` - Result display
20. `crafting/animation/` - Crafting animation

**Other Features (10):**
21. `achievements/` - Achievement popups
22. `daily/` - Daily rewards
23. `leaderboard/` - Leaderboards
24. `notifications/` - Toast notifications
25. `upgrade/` - Card upgrades
26. `batch/` - Batch opening
27. `landing/` - Landing page
28. `nav/` - Navigation
29. `common/` - Shared components

---

## 📄 Page Routes (10 total)

1. `/` - Landing page (SEO-optimized)
2. `/pack` - Pack opening
3. `/collection` - Collection management
4. `/deck-builder` - Deck building
5. `/battle` - Battle arena
6. `/trade` - Trading hub
7. `/crafting` - Crafting station
8. `/achievements` - Achievement gallery
9. `/settings` - Settings management
10. `/offline` - Offline page

---

## 🃏 Card System Design

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

### Rarity Tiers (6 levels)
- **Common** (grey) - 1.0x power multiplier
- **Uncommon** (blue) - 1.2x power multiplier
- **Rare** (gold) - 1.5x power multiplier
- **Epic** (purple) - 1.8x power multiplier
- **Legendary** (orange) - 2.2x power multiplier
- **Mythic** (pink) - 3.0x power multiplier

### Dad Types (15 core types)
1. BBQ_DICKTATOR - Beats: GOLF_GONAD, COUCH_CUMMANDER
2. FIX_IT_FUCKBOY - Beats: TECH_TWATS, CAR_COCK
3. GOLF_GONAD - Beats: COACH_CUMSTERS, COOL_CUCKS
4. COUCH_CUMMANDER - Beats: OFFICE_ORGASMS, CHEF_CUMSTERS
5. CAR_COCK - Beats: WAREHOUSE_WANKER, VINTAGE_VIRGIN
6. OFFICE_ORGASMS - Beats: TECH_TWATS, GYM_BRAINS
7. COOL_CUCKS - Beats: FASHION_FAGGOT, SUBURBAN_SPY
8. COACH_CUMSTERS - Beats: BBQ_DICKTATOR, WAREHOUSE_WANKER
9. CHEF_CUMSTERS - Beats: FIX_IT_FUCKBOY, FASHION_FAGGOT
10. TECH_TWATS - Beats: COUCH_CUMMANDER, CAR_COCK
11. WAREHOUSE_WANKER - Beats: OFFICE_ORGASMS, COACH_CUMSTERS
12. VINTAGE_VIRGIN - Beats: COOL_CUCKS, SUBURBAN_SPY
13. FASHION_FAGGOT - Beats: CAR_COCK, GYM_BRAINS
14. SUBURBAN_SPY - Beats: GOLF_GONAD, BBQ_DICKTATOR
15. GYM_BRAINS - Beats: CHEF_CUMSTERS, VINTAGE_VIRGIN

### Holographic Variants (5 types)
- **none** - Standard non-holo
- **standard** - Basic holo shine
- **reverse** - Reverse holo (background only)
- **full_art** - Full art holo (entire card)
- **prismatic** - Prismatic rainbow holo (mythic only)

---

## 🔧 Configuration Files

### vitest.config.mjs
- Environment: jsdom
- Coverage thresholds: 60% lines, functions, statements; 55% branches
- Path aliases: @, @components, @lib, @stores, @data
- Setup files: ./tests/setup.ts

### tailwind.config.mjs
- Dark mode: class-based
- Content: .astro, .html, .js, .jsx, .md, .mdx, .svelte, .ts, .tsx, .vue
- Custom colors: rarity, brand, gradient
- Custom animations: pack-glow, card-flip, legendary-burst, slide-in, shimmer, pulse-glow

### astro.config.mjs
- Site: https://dadddeck.com
- Output: static
- Integrations: svelte, tailwind
- Code splitting: vendor-html2canvas, vendor-svelte, vendor-nanostores
- Minification: terser with console.log removal
- Image optimization: Sharp (quality: 85)
- Target: ES2020

### package.json
- Dependencies: 18 production packages
- Dev dependencies: 24 development packages
- Scripts: dev, build, preview, test, optimize:images, generate-sitemap, discord-bot

---

## 📈 Key Metrics

**Codebase Size:**
- 31 state stores
- 29 component directories
- 10 page routes
- 27 type definition files
- 50+ cards in database

**Performance Targets:**
- Initial load: <3 seconds
- Pack generation: <500ms
- Animation FPS: 60fps on mobile
- Bundle size: <500KB (gzipped)

**Test Coverage:**
- Target: 60% (current thresholds)
- Vitest for unit tests
- Playwright for E2E tests
- Visual regression tests

---

## 🚀 Deployment

**Platforms:**
- Vercel (recommended)
- Netlify
- Cloudflare Pages

**Build Command:**
```bash
bun run build
```

**Pre-build Hooks:**
```bash
bun run optimize:images    # Optimize images in public/
bun run generate-sitemap   # Generate sitemap.xml
bun run generate-svgs      # Generate card SVGs
```

**Environment Variables:**
```bash
PUBLIC_API_URL=           # For future API features
PUBLIC_ANALYTICS_ID=      # For tracking (GA, Plausible)
```

---

## 📚 Documentation

**Key Documentation Files:**
- `CLAUDE.md` - Project guide (this file's parent)
- `PRD.md` - Product requirements document
- `docs/RALPH_LOOP_ARCHITECTURE.md` - Agentic iteration patterns
- `docs/TCG_BEST_PRACTICES.md` - Market research and best practices
- `docs/CSS_UTILITIES.md` - Component classes reference
- `docs/PACK-045_IMPLEMENTATION_SUMMARY.md` - Storage quota management
- `I18N_IMPLEMENTATION.md` - Internationalization system
- `src/i18n/README.md` - I18N usage guide

---

## 🎓 For New Developers

**Start Here:**
1. Read this document (COMPLETE_FEATURE_INVENTORY.md)
2. Study the Architecture Overview in CLAUDE.md
3. Follow the Feature Development Workflow
4. Reference Code Patterns & Best Practices
5. Check Common Pitfalls when stuck

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

---

**Last updated:** January 18, 2026  
**Version:** 2.2.0  
**Status:** Production Ready
