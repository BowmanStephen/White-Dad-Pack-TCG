# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Version:** 2.2.1 | **Status:** MVP (Pack Opening + Collection only) | **Stack:** Astro 5 + Svelte 5 + Tailwind + Bun

---

## IMPORTANT: Known Blockers

### Component Tests Blocked (Vitest 4.x + Svelte 5)
- `tests/components/` directory cannot run — `ReferenceError: document is not defined`
- **Root cause:** Vitest 4.0.17's happy-dom doesn't initialize globals before Svelte imports
- **Workaround:** None working. Wait for Svelte 5.5+ native test utilities
- **Impact:** Cannot write component tests. Unit tests (`tests/unit/`) work fine.
- See `TESTS_COMPONENTS_ENV_ISSUE.md` for full analysis

---

## YOU MUST Follow These Rules

### Imports
```typescript
// Always use path aliases
import type { Card, Pack } from '@/types';
import { packStore } from '@/stores/pack';
import { generatePack } from '@lib/pack/generator';

// NEVER use relative imports like '../../../types'
```

### Package Manager
```bash
# YOU MUST use Bun, not npm/yarn
bun install
bun run dev        # localhost:4321
bun test
bun run build
```

### MVP Scope
Only 2 features are active:
1. **Pack Opening** — 6-stage state machine in `src/stores/pack.ts`
2. **Collection Management** — search/filter/sort in `src/components/collection/`

Everything else is archived to `src/_archived/`. Do not modify archived code.

---

## Key Files (Read These First)

| File | Purpose |
|------|---------|
| `src/stores/pack.ts` | Pack state machine (idle → generating → revealing → results) |
| `src/lib/pack/generator.ts` | Pack generation with seeded RNG (512 lines) |
| `src/types/index.ts` | Barrel file re-exporting all types |
| `src/data/cards.json` | 173 cards with stats, abilities, rarities |
| `STATUS.md` | Current project status and recent changes |

---

## Domain Knowledge (Claude Can't Guess This)

### Pack Rarity Slots
- Slots 1-3: Always Common
- Slots 4-5: Uncommon+ (74% uncommon, 20% rare, 5% epic, 1% legendary+)
- Slot 6: Rare+ (87.9% rare, 10% epic, 2% legendary+, 0.1% mythic)
- Holo chance: 1 in 6 cards

### PackState Machine
```typescript
'idle' → 'generating' → 'pack_animate' → 'cards_ready' → 'revealing' → 'results'
```

### Rarity Levels (6 tiers)
common → uncommon → rare → epic → legendary → mythic

### IndexedDB Storage
Collections use IndexedDB (not LocalStorage). Use `checkQuotaBeforeSave()` before saving.

---

## Commands

```bash
# Development
bun install              # Install dependencies (MUST use Bun)
bun run dev              # Dev server at localhost:4321
bun run build            # Production build → ./dist/

# Testing
bun test                 # Watch mode (562 pass, 32 skipped for archived)
bun run test:run         # Single run
bun run test:e2e         # Playwright E2E
bun run test:visual      # Visual regression

# Single test file
bun test tests/unit/pack/generator.test.ts

# Linting & formatting
bun run lint             # ESLint check
bun run lint:fix         # ESLint auto-fix
bun run format           # Prettier format
```

**Coverage thresholds:** 60% lines/functions, 55% branches

---

## Gotchas

1. **Svelte hydration:** Always add `client:load` to Svelte components in .astro files
2. **State mutation:** Use immutable updates (`{...obj}`) — direct mutation won't trigger reactivity
3. **Test environment:** Component tests blocked (see blocker above), only write unit tests
4. **Type imports:** Import from `@/types` barrel file, not individual type files
5. **Svelte 5 runes:** Use `$state`, `$derived`, `$effect` for reactivity (not legacy `$:`)
6. **Nanostores in Svelte 5:** Access stores with `$derived(myStore.get())`, not `$myStore`

---

## Project Structure (Quick Reference)

```
src/
├── components/          # Svelte + Astro components
│   ├── pack/           # PackOpener.svelte, PackResults.svelte
│   ├── collection/     # Gallery.svelte, CollectionManager.svelte
│   └── card/           # Card.svelte, CardStats.svelte
├── stores/             # Nanostores (pack.ts, collection.ts, ui.ts)
├── lib/                # Business logic (pack/generator.ts, cards/database.ts)
├── types/              # TypeScript definitions (barrel: index.ts)
├── data/cards.json     # Card database (173 cards)
└── pages/              # Astro routes (6 pages: /, /pack, /collection, /settings, /offline, /404)
```

---

## Architecture Overview

**4-Layer Model:**
1. **UI Layer** — Astro pages + Svelte islands (components hydrate with `client:load/visible`)
2. **State Layer** — Nanostores with LocalStorage/IndexedDB persistence
3. **Logic Layer** — Pure functions in `src/lib/` (pack generation, validation, security)
4. **Data Layer** — Static JSON (`src/data/cards.json`)

**Store → Component pattern:** Components subscribe to stores, trigger store actions (logic lives in stores, not components).

---

## Not Covered Here

- **How to work with Stephen:** See global `~/.claude/CLAUDE.md`
- **Architecture diagrams:** See `ARCHITECTURE.md`
- **Full PRD:** See `PRD.md`
- **Card mechanics:** See `docs/CARD_MECHANICS.md`
