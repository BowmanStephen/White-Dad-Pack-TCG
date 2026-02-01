# CLAUDE.md — DadDeck TCG

**Stack:** Astro 5 + Svelte 5 + Tailwind + Bun | **Status:** MVP (Pack Opening + Collection only)

---

## IMPORTANT: Known Blockers

### Component Tests Blocked (Vitest 4.x + Svelte 5)
- `tests/components/` cannot run — `ReferenceError: document is not defined`
- **Root cause:** Vitest 4.0.17's happy-dom doesn't initialize globals before Svelte imports
- **Workaround:** None. Wait for Svelte 5.5+ native test utilities. Unit tests work fine.

---

## YOU MUST Follow These Rules

### Imports — Always use path aliases
```typescript
import type { Card, Pack } from '@/types';
import { packStore } from '@/stores/pack';
// NEVER use relative imports like '../../../types'
```

### Package Manager — Bun only
```bash
bun install && bun run dev    # localhost:4321
bun test                      # Watch mode
bun run test:run              # Single run
bun run test:e2e              # Playwright
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

1. **Svelte hydration:** Always add `client:load` to Svelte components in .astro files
2. **State mutation:** Use immutable updates (`{...obj}`) — direct mutation won't trigger reactivity
3. **Svelte 5 runes:** Use `$state`, `$derived`, `$effect` (not legacy `$:`)
4. **Nanostores:** Access with `$derived(myStore.get())`, not `$myStore`
5. **Type imports:** Import from `@/types` barrel, not individual type files

---

## Architecture

**4 Layers:** UI (Astro + Svelte islands) → State (Nanostores) → Logic (`src/lib/`) → Data (`cards.json`)

Components subscribe to stores and trigger store actions — logic lives in stores, not components.

---

## See Also

- **Working with Stephen:** `~/.claude/CLAUDE.md`
- **Architecture diagrams:** `ARCHITECTURE.md`
- **Card mechanics:** `docs/CARD_MECHANICS.md`
