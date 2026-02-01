# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Stack:** Astro 5 + Svelte 5 + Tailwind + Bun | **Status:** MVP (Pack Opening + Collection only)

---

## IMPORTANT: Known Blockers

### Component Tests Blocked (Vitest 4.x + Svelte 5)
`tests/components/` cannot run — `ReferenceError: document is not defined`. No workaround; unit tests work fine.

---

## YOU MUST Follow These Rules

### Imports — Always use path aliases
```typescript
import type { Card, Pack } from '@/types';
import { packStore } from '@/stores/pack';
// NEVER use relative imports like '../../../types'
```
Available aliases: `@/*`, `@components/*`, `@lib/*`, `@stores/*`, `@data/*`, `@types/*`, `@mocks/*`

### Package Manager — Bun only
```bash
bun install && bun run dev    # localhost:4321
bun run build                 # Production build → ./dist/
bun run preview               # Preview production build
bun test                      # Watch mode
bun run test:run              # Single run (all tests)
bun run test:run path/to/test # Single test file
bun run test:e2e              # Playwright (all browsers)
bun run test:e2e:chromium     # Playwright (Chromium only)
bun run lint:fix              # ESLint auto-fix
```

### MVP Scope
Only 2 features active: **Pack Opening** (`src/stores/pack.ts`) and **Collection** (`src/components/collection/`).
Everything else is in `src/_archived/` — do not modify.

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
2. **Nanostores:** Access with `$derived(myStore.get())`, not `$myStore`

---

## Architecture

**4 Layers:** UI (Astro + Svelte islands) → State (Nanostores) → Logic (`src/lib/`) → Data (`cards.json`)

Components subscribe to stores and trigger store actions — logic lives in stores, not components.
