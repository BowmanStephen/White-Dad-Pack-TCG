# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Stack:** Astro 5 + Svelte 5 + Tailwind + Bun | **Status:** MVP (Pack Opening + Collection only)

## Commands
```bash
bun run dev          # Start dev server (localhost:4321)
bun run build        # Production build
bun run preview      # Preview production build
bun test             # Run tests (watch mode)
bun run test:run     # Run tests once
bun run test:e2e     # Run Playwright e2e tests
bun run test:e2e:ui  # Run e2e with visual debugger
bun run lint         # Check for lint errors
bun run lint:fix     # Auto-fix lint errors
```

## Known Blockers
**Component Tests Blocked** — `tests/components/` cannot run (Vitest 4.x + Svelte 5 incompatibility). Unit tests work.

## YOU MUST Follow These Rules

### Imports — Always use path aliases
```typescript
import type { Card, Pack } from '@/types';
import { packStore } from '@/stores/pack';
// NEVER relative imports like '../../../types'
```
Available: `@/*`, `@components/*`, `@lib/*`, `@stores/*`, `@data/*`, `@types/*`, `@mocks/*`

### MVP Scope — Do not touch archived features
Only **Pack Opening** and **Collection** active. `src/_archived/` is frozen — do not modify or import from.

## Gotchas
1. **Svelte in Astro:** Always add `client:load` to Svelte components in .astro files
2. **Nanostores in Svelte 5:** Access with `$derived(myStore.get())`, not `$myStore`
3. **Store actions:** Logic lives in stores (`src/stores/`), not components
4. **Types are modular:** Add to existing files in `src/types/`, never create new ones
5. **Storage:** Collections use IndexedDB. Use `checkQuotaBeforeSave()` before saving.
