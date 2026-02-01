# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Stack:** Astro 5 + Svelte 5 + Tailwind + Bun | **Status:** MVP (Pack Opening + Collection only)

---

## Known Blockers

**Component Tests Blocked (Vitest 4.x + Svelte 5)**
`tests/components/` cannot run — `ReferenceError: document is not defined`. No workaround; unit tests work fine.

---

## YOU MUST Follow These Rules

### Imports — Always use path aliases
```typescript
import type { Card, Pack } from '@/types';
import { packStore } from '@/stores/pack';
// NEVER use relative imports like '../../../types'
```
Available: `@/*`, `@components/*`, `@lib/*`, `@stores/*`, `@data/*`, `@types/*`, `@mocks/*`

### Package Manager — Bun only
```bash
bun install              # Install dependencies
bun run dev              # Dev server → localhost:4321
bun run build            # Production build → ./dist/
bun run preview          # Preview production build
```

### MVP Scope — Do not touch archived features
Only 2 features active: **Pack Opening** (`src/stores/pack.ts`) and **Collection** (`src/components/collection/`).
Everything in `src/_archived/` is frozen — do not modify, import from, or reference.

---

## Commands

### Testing
```bash
bun test                      # Watch mode
bun run test:run              # Single run (all tests)
bun run test:run tests/unit/  # Run specific folder
bun run test:run tests/unit/pack.test.ts  # Single file
bun run test:e2e              # Playwright (all browsers)
bun run test:e2e:chromium     # Playwright (Chromium only)
bun run test:visual           # Visual regression tests
```

### Linting & Formatting
```bash
bun run lint                  # ESLint check
bun run lint:fix              # ESLint auto-fix
bun run format                # Prettier format all
bun run format:check          # Check formatting
```

---

## Key Files

- `src/stores/pack.ts` — Pack opening state machine and generation
- `src/stores/collection.ts` — Card collection with IndexedDB persistence
- `src/lib/pack/` — Pack generation logic and validation
- `src/components/pack/` — Pack opening UI components
- `src/components/collection/` — Collection management UI
- `src/data/cards.json` — Card database (173 cards)

---

## Domain Knowledge

### Pack Rarity Slots
- Slots 1-3: Always Common
- Slots 4-5: Uncommon+ (74% uncommon, 20% rare, 5% epic, 1% legendary+)
- Slot 6: Rare+ (87.9% rare, 10% epic, 2% legendary+, 0.1% mythic)
- Holo chance: 1 in 6 cards

### State Machine
`idle → generating → pack_animate → cards_ready → revealing → results`

### Storage
Collections use IndexedDB (not LocalStorage). Use `checkQuotaBeforeSave()` before saving.

---

## Gotchas

1. **Svelte in Astro:** Always add `client:load` to Svelte components in .astro files
2. **Nanostores in Svelte 5:** Access with `$derived(myStore.get())`, not `$myStore`
3. **Store actions:** Logic lives in stores (`src/stores/`), not components — components call store functions

---

## Architecture

**4 Layers:** UI (Astro + Svelte islands) → State (Nanostores + IndexedDB) → Logic (`src/lib/`) → Data (`src/data/cards.json`)

**Test Organization:**
- `tests/unit/` — stores, lib functions
- `tests/e2e/` — Playwright browser tests
- `tests/visual/` — screenshot snapshots
- `tests/pack/`, `tests/card/`, `tests/art/` — domain-specific tests
