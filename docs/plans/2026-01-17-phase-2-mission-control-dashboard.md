---
title: Phase 2 - Batch Mission Control Dashboard (HOTL UI)
date: 2026-01-17
project: DadDeck™ (White Dad Pack TCG)
related:
  - docs/RALPH_LOOP_ARCHITECTURE.md
  - docs/ralph-loop-daddeck-application-plan.md
---

# Phase 2 - Batch Mission Control Dashboard (HOTL UI) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this
> plan task-by-task.

**Goal:** Add a “Mission Control” dashboard to batch opening that visualizes objective,
progress, and validation/backpressure status.

**Architecture:** Extend `batch` state to track per-pack attempt/validation outcomes and
render a dashboard component alongside existing batch UI.

**Tech Stack:** Svelte, Nanostores, TypeScript, Tailwind, Vitest, Bun.

---

## Task 1: Extend batch store telemetry model

**Files:**
- Modify: `src/stores/batch.ts`
- Test: `tests/unit/stores/batch.test.ts` (or create if missing)

**Step 1: Add per-pack telemetry fields**

Example fields:
- `packIndex`
- `generationAttempts`
- `validationStatus`: `pending | pass | fail`
- `lastErrorSummary?`

**Step 2: Add helper selectors**

Computed/derived values:
- overall progress percent
- counts of pass/fail/pending

**Step 3: Run tests**

Run: `bun run test:run -- tests/unit/stores/batch.test.ts`
Expected: PASS

---

## Task 2: Create Mission Control dashboard component

**Files:**
- Create: `src/components/batch/MissionControlDashboard.svelte`

**Step 1: Implement layout**

Recommended hierarchy (from Ralph Loop doc):
- Top: Objective (“Open 10 packs”)
- Center: Phase indicator (“Generating / Validating / Complete”)
- Side: Context/attempt meter (simple attempt count for now)
- Bottom: Status grid (traffic lights for each pack)

**Step 2: Keep it non-blocking**

It should render even if telemetry is missing (fallback UI).

---

## Task 3: Integrate dashboard into batch flow

**Files:**
- Modify: `src/components/batch/BatchOpener.svelte`
- (Optional) Modify: `src/pages/pack.astro` or wherever batch mode is surfaced

**Step 1: Add dashboard in existing layout**

Place dashboard above or beside results (responsive: stack on mobile).

**Step 2: Manual verification**

Run: `bun run dev`
Verify:
- batch opening still works
- dashboard updates as packs are generated/revealed

---

## Definition of done

- Dashboard is visible during batch open.
- Telemetry is updated per pack (at least attempts + pass/fail/pending).
- No regressions in existing batch UX.
- `bun run test:run` passes.
