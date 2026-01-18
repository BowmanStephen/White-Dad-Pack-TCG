# DadDeck™ - The Ultimate White Dad Trading Card Simulator

**Status:** Stable & Production Ready ✅
**Version:** 2.1.0

DadDeck™ is a satirical trading card game pack-opening simulator that parodies suburban American dad culture. Built with modern web technologies, it offers a premium, AAA-quality "pack pull" experience without the microtransactions.

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
- 🗃️ **Card Collection:** 50+ unique cards across 15+ "Dad Types" (BBQ, Fix-It, Lawn, etc.).
- ✨ **Rarity System:** 6 rarity tiers from Common to Mythic with unique holographic variants.
- 💾 **Persistence:** Your collection is saved locally and survives page reloads.

### Advanced Systems
- ⚔️ **Battle Mechanics:** Stat-based combat system with type advantages and synergy bonuses.
- 🛠️ **Deck Builder:** Create and validate custom decks for suburban dominance.
- 🧪 **Crafting & Upgrades:** Sacrifice duplicates to level up your favorite dads.
- 🏆 **Achievements & Leaderboards:** Track progress and compare collection value globally.
- 🤝 **Trading Hub:** Exchange cards through a structured trading system.

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

# Start development server
bun run dev

# Run tests
bun test
```

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

## 👨‍💻 Author

Built by **Stephen Bowman** with AI assistance.

**License:** Proprietary - All rights reserved.

