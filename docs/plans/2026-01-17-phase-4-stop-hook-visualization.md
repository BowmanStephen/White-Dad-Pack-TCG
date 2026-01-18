---
title: Phase 4 - Stop Hook Visualization (Validation Traffic Lights)
date: 2026-01-17
project: DadDeck™ (White Dad Pack TCG)
related:
  - docs/RALPH_LOOP_ARCHITECTURE.md
  - docs/ralph-loop-daddeck-application-plan.md
---

# Phase 4 - Stop Hook Visualization (Validation Traffic Lights) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this
> plan task-by-task.

**Goal:** Make pack validation (“stop hook”) visible to players: what checks ran, what passed,
what failed, and whether retries occurred.

**Architecture:** Extend `validatePackBeforeOpen()` (or a wrapper) to return **structured,
UI-friendly check results**, then render them via a dedicated Svelte component.

**Tech Stack:** TypeScript, Svelte, Tailwind, Vitest, Bun.

---

## Task 1: Define validation check detail type

**Files:**
- Modify: `src/types/index.ts` (or create `src/types/security.ts`)
- Test: `tests/unit/lib/security/pack-validator.test.ts` (extend existing)

**Step 1: Add types**

Example:
- `ValidationCheckId = 'duplicate' | 'rarity' | 'stats' | 'entropy'`
- `ValidationCheckResult = { id, label, passed, message? }`
- `ValidationResult = { valid, violations, checks?: ValidationCheckResult[] }`

**Step 2: Run tests**

Run: `bun run test:run -- tests/unit/lib/security/pack-validator.test.ts`
Expected: PASS (or update snapshots/assertions)

---

## Task 2: Return check details from validator

**Files:**
- Modify: `src/lib/security/pack-validator.ts`
- Test: `tests/unit/lib/security/pack-validator.test.ts`

**Step 1: Write/extend failing test**

Assert that:
- `checks` exists
- each check has stable `id` and `passed` boolean

**Step 2: Implement**

Populate `checks` alongside the existing `valid`/`violations` fields.

---

## Task 3: Add Stop Hook status component (traffic lights + details)

**Files:**
- Create: `src/components/security/StopHookStatus.svelte`

**Step 1: Implement traffic light UI**

- Green = passed, Red = failed, Grey = not run/unknown
- Optional: compact mode for pack reveal screen

**Step 2: Ensure accessibility**

- ARIA labels for each light
- Text fallback list of check names + status

---

## Task 4: Render status during pack opening (and retries if enabled)

**Files:**
- Modify: `src/components/pack/PackOpener.svelte`
- Modify: `src/stores/pack.ts` (if it needs to store the last validation details)

**Step 1: Plumb `ValidationResult.checks` into UI**

Show:
- During generation/validation: current status (pending vs results)
- After generation: final check list (collapsible)

**Step 2: Manual verification**

Run: `bun run dev`
Verify:
- validation UI appears and does not block gameplay
- lights + messages look correct

---

## Definition of done

- Validator returns stable per-check results.
- Stop Hook status UI renders without crashes.
- Pack opening remains smooth; status is optional/collapsible.
- `bun run test:run` passes.
