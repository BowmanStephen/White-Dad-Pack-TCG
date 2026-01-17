# CLAUDE.md - DadDeck™ Project Guide

**Project:** DadDeck™ - The Ultimate White Dad Trading Card Simulator
**Type:** Satirical Trading Card Game (TCG) Pack-Opening Simulator
**Status:** Active Development (MVP Phase)

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
│   │   │   └── CardStats.svelte        # Card stats visualization
│   │   └── common/          # Shared components
│   │       ├── Logo.astro             # DadDeck™ logo
│   │       └── Button.astro           # Reusable button
│   ├── layouts/             # Astro layouts
│   │   └── BaseLayout.astro # Root layout with global styles
│   ├── lib/                 # Business logic
│   │   ├── cards/
│   │   │   └── database.ts  # Card data access layer (wraps JSON)
│   │   ├── pack/
│   │   │   └── generator.ts # Pack generation logic (512 lines)
│   │   ├── security/
│   │   │   └── pack-validator.ts # Anti-cheat validation
│   │   └── utils/
│   │       └── random.ts    # Random number utilities
│   ├── data/                # Static data files
│   │   └── cards.json       # Card database (50+ cards)
│   ├── stores/              # Nanostores (state management)
│   │   ├── pack.ts          # Pack state & operations
│   │   └── ui.ts            # UI state (animations, routing)
│   ├── types/               # TypeScript definitions
│   │   └── index.ts         # ALL types (Card, Pack, Rarity, etc.)
│   └── pages/               # Astro routes
│       └── index.astro      # Landing page
├── tests/                   # Test files (Vitest)
├── discord-bot/            # Discord bot integration
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

### Dad Types (16 categories)
```
BBQ_DAD | FIX_IT_DAD | GOLF_DAD | COUCH_DAD | LAWN_DAD
CAR_DAD | OFFICE_DAD | COOL_DAD | COACH_DAD | CHEF_DAD
HOLIDAY_DAD | WAREHOUSE_DAD | VINTAGE_DAD | FASHION_DAD
TECH_DAD | ITEM (equipment/items)
```

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

## 🎯 Project Status & Recent Features

### Completed Features (US091-US099)
**Latest Implementations:**
- ✅ **US099: Live Events System** - Weekend Events & Event Shop
- ✅ **US098: Referral System** - Growth Loop with rewards
- ✅ **US097: Email System** - Notifications & updates
- ✅ **US096: Admin Panel** - Content Management System
- ✅ **US095: Security** - Anti-Cheat System
- ✅ **US094: Monetization** - DadPass System (battle pass)
- ✅ **US093: Monetization** - Premium Packs
- ✅ **US092: Localization** - Multi-language support
- ✅ **US091: API Integration** - Discord Bot
- ✅ **US090: Card Battles** - Minigame

**Core MVP Features:**
- ✅ Basic pack opening flow
- ✅ Card reveal animations
- ✅ Rarity-based visual effects
- ✅ Social sharing functionality
- ✅ Card collection persistence (LocalStorage)
- ✅ Mobile responsiveness polish

### Additional Integration
**Discord Bot** (US091):
- Command: `bun run discord-bot` (dev) or `bun run discord-bot:dev` (watch mode)
- Location: `discord-bot/index.ts`
- Integrates with Discord.js v14.25.1

### What's Next
**Post-MVP Roadmap:**
- Season 2 card expansion (30+ new cards)
- User accounts & cloud collections
- Trading system between players
- Enhanced deck building mini-game

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

**Questions?** Check the PRD (`PRD.md`) or ask about specific components!
