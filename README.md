# DadDeck™ - The Ultimate White Dad Trading Card Simulator

**Status:** Stable & Production Ready ✅  
**Version:** 2.2.0  
**Last Updated:** January 18, 2026 (Migration 3 Complete)

DadDeck™ is a satirical trading card game pack-opening simulator that parodies suburban American dad culture. Built with modern web technologies, it offers a premium, AAA-quality "pack pull" experience without the microtransactions.

### ✅ What Works (MVP Scope)
- **Pack Opening** - Full 6-stage opening flow with premium animations
- **Collection Management** - IndexedDB-backed card persistence with search, filters, and sorting
- **Card Database** - 173 unique cards with full metadata
- **Error Logging** - Built-in error reporting system with Sentry integration and unique IDs
- **Responsive Design** - Works beautifully on mobile (65%) and desktop (35%)

### ⚠️ Known Limitations
- **MVP Scope (Jan 18, 2026)** - Focused on 2 core features only: pack opening + collection management
- **Archived Features** - Battle system, trading, deck building, crafting, achievements, and other features have been removed (see `src/_archived/`)
- **Server-Side Features Not Implemented** - No user accounts, cloud sync, or multiplayer
- **Discord Bot** - Experimental feature, limited functionality

---

## 📖 Documentation Navigation

- 🏗️ **[Architecture](./ARCHITECTURE.md)** - Technical overview, diagrams, and data flow.
- 🔌 **[API Reference](./API_REFERENCE.md)** - Core types, stores, and library functions.
- 🤝 **[Contributing](./CONTRIBUTING.md)** - Coding standards, Svelte 5 patterns, and PR process.
- 🚀 **[Deployment](./DEPLOYMENT.md)** - Production build, optimization, and hosting guide.
- 📝 **[PRD](./PRD.md)** - Full product requirements and design goals.
- 🎴 **[TCG Best Practices](./docs/TCG_BEST_PRACTICES.md)** - Market research and implementation guide (NEW).

---

## 🎯 Features

### Core Gameplay
- 🃏 **Pack Opening:** Full-fidelity 6-stage opening sequence with animations.
- 🗃️ **Card Collection:** 173 unique cards with IndexedDB persistence.
- ✨ **Rarity System:** 6 rarity tiers from Common to Mythic with holographic variants.
- 💾 **Persistence:** Your collection is saved to IndexedDB and survives page reloads.
- 🔍 **Collection Management:** Search, filter (by rarity/type), and sort your cards.

---

## 🛠️ Tech Stack

- **Framework:** [Astro 5.16+](https://astro.build/) (Island Architecture)
- **UI:** [Svelte 5.46+](https://svelte.dev/) (Interactive Islands)
- **Styling:** [Tailwind CSS 3](https://tailwindcss.com/)
- **State:** [Nanostores 1.1+](https://github.com/nanostores/nanostores) (Atomic Reactive State)
- **Runtime:** [Bun](https://bun.sh/)
- **Tests:** [Vitest 4.0+](https://vitest.dev/)

---

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start development server (opens http://localhost:4321)
bun run dev

# Run tests (watch mode)
bun test

# Build for production
bun run build

# Preview production build locally
bun run preview
```

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/BowmanStephen/White-Dad-Pack-TCG.git
   cd White-Dad-Pack-TCG
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start development server**
   ```bash
   bun run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:4321`
   - Click "Open Pack" to start collecting!

### Available Commands

| Command | Purpose |
|---------|---------|
| `bun run dev` | Start development server with hot reload |
| `bun run build` | Build for production (outputs to `./dist/`) |
| `bun run preview` | Preview production build locally |
| `bun test` | Run tests in watch mode |
| `bun run test:run` | Run tests once |
| `bun run optimize:images` | Optimize images in `public/` |
| `bun run generate-sitemap` | Generate `sitemap.xml` |

---

## 📚 Documentation

Detailed documentation for developers and contributors:

- 🏗️ **[Architecture](./ARCHITECTURE.md)** - Technical overview, data flow, and state machines.
- 🤝 **[Contributing](./CONTRIBUTING.md)** - Coding standards, workflow, and PR process.
- 🔌 **[API Reference](./API_REFERENCE.md)** - Core types, stores, and library functions.
- 🚀 **[Deployment](./DEPLOYMENT.md)** - Production build and hosting guide.
- 📝 **[PRD](./PRD.md)** - Full product requirements and design goals.
- 🎴 **[TCG Best Practices](./docs/TCG_BEST_PRACTICES.md)** - Market research and implementation guide (NEW).

---

## 💻 Quick Code Example

Here's how easy it is to interact with the DadDeck™ store in a Svelte 5 component:

```svelte
<script lang="ts">
  import { currentPack, openNewPack, packState } from '@/stores/pack';
  import Card from '@/components/card/Card.svelte';

  // Svelte 5 logic with Nanostores
  const pack = $derived(currentPack.get());
  const state = $derived(packState.get());
</script>

<div class="pack-opener">
  {#if state === 'idle'}
    <button onclick={openNewPack} class="btn-primary">
      Open Booster Pack
    </button>
  {:else if pack}
    <div class="grid grid-cols-3 gap-4">
      {#each pack.cards as card}
        <Card {card} />
      {/each}
    </div>
  {/if}
</div>
```

---

## 🔒 Security & Anti-Cheat

DadDeck™ includes a built-in anti-cheat system (`src/lib/security/pack-validator.ts`) that validates pack generation integrity, entropy, and statistical distribution to ensure fair play even in a client-side environment.

---

## 🔗 See Also

- **[Card Mechanics](./docs/CARD_MECHANICS.md)** - Detailed look at how rarity and holos work.
- **[Ralph Loop Architecture](./docs/RALPH_LOOP_ARCHITECTURE.md)** - Our agentic approach to UX and state.
- **[Performance Guide](./docs/PERFORMANCE_OPTIMIZATION.md)** - How we hit 60fps on mobile.

---

## 🧑‍💻 Development Status

### Build & Test Status
- **Build:** ✅ Passing (0 errors, 0 warnings)
- **Tests:** ✅ 562/562 tests passing (32 skipped - archived features)
- **Type Checking:** ✅ TypeScript strict mode passing
- **Bundle Size:** ~200KB gzipped (optimized)

### Recent Changes (Jan 18, 2026)
- 🎯 **MVP Scope Reduction** - Focused on 2 core features (pack opening + collection)
- 🧹 **Code cleanup** - Archived 20+ component directories, removed ~2,463 lines of dead code
- 📦 **Type system refactor** - Split monolithic type file into 27 modular feature files
- 💾 **IndexedDB migration** - Collections now stored in IndexedDB for better quota management
- 🔍 **Collection search & filters** - Full-text search, multi-select filters, sorting
- 📊 **Interactive stat tooltips** - Hover & tap-to-reveal on card stats

### Current Architecture

**Frontend Stack:**
- **Astro 5** - Static site generation with component islands
- **Svelte 5** - Interactive components with runes-based reactivity
- **Tailwind CSS 3** - Utility-first styling with custom design tokens
- **Nanostores** - Lightweight atomic state management with LocalStorage persistence

**Key Features:**
- **Pack Generation** - Seeded randomness with rarity slot system
- **Anti-Cheat** - Duplicate detection, statistical anomaly checking
- **Responsive Design** - Mobile-first approach (65% mobile, 35% desktop)
- **LocalStorage Persistence** - Collections survive page reloads

### For Developers

**Getting Started:**
1. Read [CLAUDE.md](./CLAUDE.md) for project context and guidance
2. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for technical overview
3. Review [CONTRIBUTING.md](./CONTRIBUTING.md) for code standards

**Next Steps for Contributors:**
- Post-MVP roadmap includes user accounts, cloud sync, multiplayer battles
- Premium features deferred to Phase 2 (monetization strategy TBD)
- Server-side infrastructure not yet implemented

---

## 👨‍💻 Author

Built by **Stephen Bowman** with AI assistance.

**License:** Proprietary - All rights reserved.

