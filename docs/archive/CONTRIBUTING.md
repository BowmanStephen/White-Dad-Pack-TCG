# Contributing to DadDeck™

Thank you for your interest in contributing to DadDeck™! As a satirical trading card game simulator parodying suburban American dad culture, we value creativity, humor, and technical excellence.

## 📖 Documentation Navigation
- 🏠 **[Project Home](./README.md)**
- 🏗️ **[Architecture](./ARCHITECTURE.md)**
- 🔌 **[API Reference](./API_REFERENCE.md)**
- 🚢 **[Deployment](./DEPLOYMENT.md)**

---

## 🚀 Getting Started

1. **Prerequisites:**
   - [Bun](https://bun.sh/) v1.0+ (Mandatory package manager)
   - Node.js v22+ (For specific build tooling)
   - Git

2. **Installation:**
   ```bash
   git clone <repository-url>
   cd "White Dad Pack TCG"
   bun install
   ```

3. **Development Server:**
   ```bash
   bun run dev
   ```

## 🛠️ Development Workflow

We follow a structured development pattern to ensure code quality and consistency:

1. **Define Types:** Start by defining your data models in `src/types/index.ts`.
2. **Create/Update Stores:** Implement state management in `src/stores/`.
3. **Implement Logic:** Add business logic in `src/lib/`.
4. **Build Components:**
   - Use `.astro` for static, server-rendered content.
   - Use `.svelte` for interactive client-side components (islands).
5. **Add Tests:** Write unit or integration tests in the `tests/` directory.
6. **Verify:** Run the full test suite and build process.

## 📝 Coding Standards

### TypeScript
- **Strict Mode:** We use TypeScript strict mode. Ensure all new code is fully typed.
- **Path Aliases:** Always use path aliases:
  - `@/` -> `src/`
  - `@lib/` -> `src/lib/`
  - `@stores/` -> `src/stores/`
  - `@components/` -> `src/components/`

### Svelte 5 Patterns
- Use **Runes** (`$state`, `$derived`, `$effect`, etc.) for reactivity.
- Ensure proper cleanup of store subscriptions in `onDestroy` or using the `$state` pattern.
- Avoid direct mutations of props; use events or bound state.

### State Management (Nanostores)
- Use **Persistent Stores** (`persistentAtom`, `persistentMap`) for data that must survive page reloads (e.g., collections).
- Use **Store Actions** pattern: Components should trigger functions in the store file rather than modifying the store directly.
- Use **Computed Stores** for derived state to ensure optimal performance.

#### Store Example (src/stores/collection.ts)
```typescript
import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type { Collection, Card } from '@/types';

// 1. Define persistent store with LocalStorage sync
export const collection = persistentAtom<Collection>('daddeck-collection', {
  packs: [],
  metadata: { totalPacksOpened: 0, uniqueCards: [] }
}, {
  encode: JSON.stringify,
  decode: JSON.parse
});

// 2. Computed store for derived state
export const uniqueCardCount = computed(collection, (coll) => {
  return coll.metadata.uniqueCards.length;
});

// 3. Store Action pattern (Logic lives in store, not component)
export function addCardToCollection(card: Card) {
  const current = collection.get();
  if (!current.metadata.uniqueCards.includes(card.id)) {
    collection.set({
      ...current,
      metadata: {
        ...current.metadata,
        uniqueCards: [...current.metadata.uniqueCards, card.id]
      }
    });
  }
}
```

### Svelte 5 Patterns
- Use **Runes** (`$state`, `$derived`, `$effect`) for local component reactivity.
- **Store Access:** Use the `$derived` rune to react to Nanostore changes.

#### Component Communication Example
```svelte
<script lang="ts">
  import { collection, uniqueCardCount } from '@/stores/collection';
  import { fade } from 'svelte/transition';

  // Props using Svelte 5 $props rune
  let { title = "My Collection", showStats = true } = $props<{
    title?: string;
    showStats?: boolean;
  }>();

  // React to global Nanostores
  const myCollection = $derived(collection.get());
  const count = $derived(uniqueCardCount.get());

  // Local reactive state
  let filter = $state("");

  // Derived local state
  const filteredCards = $derived(
    myCollection.metadata.uniqueCards.filter(id => id.includes(filter))
  );
</script>

<div class="p-4 bg-slate-800 text-white rounded-lg">
  <h2 class="text-xl font-bold">{title}</h2>
  
  {#if showStats}
    <p transition:fade>You have {count} unique cards!</p>
  {/if}

  <input 
    type="text" 
    bind:value={filter} 
    placeholder="Filter IDs..."
    class="mt-2 p-1 text-black rounded"
  />

  <ul class="mt-4">
    {#each filteredCards as id}
      <li>{id}</li>
    {/each}
  </ul>
</div>
```

### Styling (Tailwind CSS)

- Use Tailwind utility classes for all styling.
- Follow the rarity color system defined in `tailwind.config.mjs`.
- Design for mobile-first (responsive breakpoints: `md`, `lg`, `xl`).

## 🧪 Testing Guidelines

We use [Vitest](https://vitest.dev/) for testing.

- **Unit Tests:** Test individual utility functions and business logic in `tests/unit/`.
- **Integration Tests:** Test store interactions and multi-step flows in `tests/integration/`.
- **Database Tests:** Validate `cards.json` integrity in `tests/card/`.

**Run Commands:**
```bash
bun test                    # Watch mode
bun run test:run            # Single run
bun test --coverage         # View coverage report
```

## 🔒 Security & Performance

- **Validation:** Always validate data before updating stores, especially for pack generation and combat results.
- **Anti-Cheat:** Adhere to the patterns in `src/lib/security/pack-validator.ts`.
- **Bundle Size:** Be mindful of dependency sizes. Use dynamic imports (`import()`) for heavy libraries like `html2canvas`.
- **Lazy Loading:** Use Astro's `client:visible` or `client:idle` directives for non-critical islands.

## 📤 Pull Request Process

1. **Branching:** Create a descriptive branch name (e.g., `feature/new-card-type` or `fix/animation-lag`).
2. **Commit Messages:** Follow a clear, concise style (e.g., `feat: add BBQ Dad cards` or `fix: resolve collection hydration`).
3. **Checks:** Before submitting, ensure:
   - `bun test` passes 100%.
   - `bun run build` succeeds.
   - `bun run optimize:images` has been run for new assets.
4. **Documentation:** Add JSDoc comments to new public functions and update relevant documentation files.

## 🤝 Community & Humor

DadDeck™ is satirical. When writing flavor text or card abilities:
- Lean into "Dad" stereotypes (BBQ, lawn care, tech confusion, puns).
- Keep it lighthearted and parodic.
- Ensure content aligns with our community standards of being inclusive while satirical.

---

**Last Updated:** January 18, 2026
