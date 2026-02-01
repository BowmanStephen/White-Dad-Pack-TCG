# CLAUDE.md

**Stack:** Astro 5 + Svelte 5 + Tailwind + Bun | **Status:** MVP (Pack Opening + Collection only)

---

## Known Blockers

**Component Tests Blocked** — `tests/components/` cannot run (Vitest 4.x + Svelte 5 incompatibility). Unit tests work fine.

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
Run `bun run` to see available scripts. Key commands: `bun test`, `bun run test:e2e`, `bun run build`.

### MVP Scope — Do not touch archived features
Only 2 features active: **Pack Opening** and **Collection**.
Everything in `src/_archived/` is frozen — do not modify, import from, or reference.

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
3. **Store actions:** Logic lives in stores (`src/stores/`), not components
4. **Types are modular:** Add to existing files in `src/types/`, never create new ones

---

## Architecture

**4 Layers:** UI (Astro + Svelte islands) → State (Nanostores + IndexedDB) → Logic (`src/lib/`) → Data (`src/data/cards.json`)
