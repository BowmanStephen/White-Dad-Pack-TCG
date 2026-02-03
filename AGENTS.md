# AGENTS.md

Guidance for agentic coding tools working in this repo.
Keep changes aligned with project rules in `CLAUDE.md` and `CONTRIBUTING.md`.

## Stack and scope

- Stack: Astro 5 + Svelte 5 + Tailwind + Bun.
- MVP scope: Pack Opening + Collection only.
- Do not touch or import from `src/_archived/`.

## Command quick reference

Use Bun for installs and scripts.

### Dev and build

```bash
bun install
bun run dev            # localhost:4321
bun run build          # production build
bun run preview        # preview production build
```

### Lint and format

```bash
bun run lint           # ESLint
bun run lint:fix
bun run format         # Prettier write
bun run format:check
```

### Tests

```bash
bun test               # Vitest watch
bun run test:run       # Vitest once
bun run test:coverage  # coverage run
```

### Run a single unit test

```bash
bun run test:run -- tests/unit/some-file.test.ts
bun run test:run -- -t "test name or regex"
```

### E2E and visual tests (Playwright)

```bash
bun run test:e2e
bun run test:e2e -- tests/e2e/some-flow.spec.ts
bun run test:e2e -- -g "test name or regex"

bun run test:visual
bun run test:visual:update
```

### Other useful scripts

```bash
bun run prebuild        # optimize images, OG image, sitemap, SVGs
bun run generate-sitemap
bun run validate:env
```

## Known blockers

- Component tests in `tests/components/` are blocked by Vitest 4 + Svelte 5.

## Repo rules to follow

- **Imports:** always use path aliases, never relative imports.
  - `@/*`, `@components/*`, `@lib/*`, `@stores/*`, `@data/*`, `@types/*`, `@mocks/*`
- **Astro + Svelte:** add `client:load` to Svelte components used in `.astro` files.
- **Svelte + Nanostores:** access stores with `$derived(myStore.get())`, not `$myStore`.
- **Store actions:** logic lives in `src/stores/`, not in components.
- **Types:** add to existing files in `src/types/`, never create new ones.
- **Storage:** collections use IndexedDB; call `checkQuotaBeforeSave()` before saving.

## Code style guidelines

These are enforced by ESLint + Prettier and existing patterns.

### Imports

- Use `import type` for type-only imports.
- Prefer absolute aliases for everything in `src/` and `tests/mocks/`.
- Keep imports grouped by: external, internal aliases, relative (rare).

### Formatting (Prettier)

- `printWidth: 100`, `tabWidth: 2`, `semi: true`, `singleQuote: true`.
- `trailingComma: es5`, `arrowParens: avoid`.
- Svelte sort order: `options-scripts-markup-styles`.

### TypeScript

- Strict mode is on; avoid implicit `any`.
- `any` is allowed but warned; use it only when unavoidable.
- Unused args/vars must be prefixed with `_`.

### Svelte 5

- Use runes (`$state`, `$derived`, `$effect`, `$props`).
- Avoid direct prop mutation; emit events or use bound state.
- Prefer store actions for business logic.

### Nanostores

- Use `persistentAtom`/`persistentMap` for persistence.
- Use computed stores for derived data.
- Components should call store actions, not write store state directly.

### Tailwind CSS

- Use utility classes; follow rarity color system in `tailwind.config.mjs`.
- Mobile-first breakpoints (`md`, `lg`, `xl`).

### Naming conventions (follow existing usage)

- Svelte components and files: PascalCase (e.g., `Card.svelte`).
- Functions, variables, store exports: camelCase.
- Constants: UPPER_SNAKE_CASE when truly constant.
- Types and interfaces: PascalCase.

### Error handling and validation

- Validate pack generation with `src/lib/security/pack-validator.ts` patterns.
- Guard state transitions; avoid skipping pack state machine steps.
- Sanitize user inputs where relevant (existing pattern uses DOMPurify).
- Keep errors actionable; include context and IDs if existing patterns use them.

## Testing conventions

- Unit tests live under `tests/` and use `*.test.ts`.
- Playwright specs use `*.spec.ts` and live in `tests/e2e/` or `tests/integration/`.
- Vitest uses `happy-dom` and `tests/setup.ts`.

## Project docs to check

- `CLAUDE.md` for must-follow rules.
- `CONTRIBUTING.md` for workflow and patterns.
- `ARCHITECTURE.md` for data flow and state machines.
- `API_REFERENCE.md` for core types and store APIs.

## Cursor/Copilot rules

- No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` found.

## Change checklist

- Stays within MVP scope; avoids `src/_archived/`.
- Uses path aliases for imports.
- Uses Svelte 5 runes and proper Nanostore access.
- Uses `checkQuotaBeforeSave()` before IndexedDB writes.
- Format/lint before handing off.
