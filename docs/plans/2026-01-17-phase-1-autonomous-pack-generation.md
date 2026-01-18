#+#+#+#+---
title: Phase 1 - Autonomous Pack Generation (Validation Retry Loop)
date: 2026-01-17
project: DadDeck™ (White Dad Pack TCG)
related:
  - docs/RALPH_LOOP_ARCHITECTURE.md
  - docs/ralph-loop-daddeck-application-plan.md
---

# Phase 1 - Autonomous Pack Generation (Validation Retry Loop) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this
> plan task-by-task.

**Goal:** Add an **opt-in**, bounded retry loop that regenerates packs until validation passes.

**Architecture:** Wrap existing `generatePack()` with a “stop hook” validator that returns
SUCCESS/RETRY/FAILURE, record attempt telemetry, and surface attempt counts in UI.

**Tech Stack:** Astro + Svelte, TypeScript, Nanostores, Vitest, Bun.

---

## Task 1: Define attempt/result types

**Files:**
- Create: `src/types/loop.ts`
- Modify: `src/types/index.ts` (export re-exports if desired)
- Test: `tests/unit/loop/types.test.ts` (optional smoke test)

**Step 1: Add loop result types**

Define (example):
- `ExitCode` enum (`SUCCESS`, `FAILURE`, `RETRY`)
- `AttemptMeta` (attempt number, seed used, duration ms)
- `StopHookResult` (exitCode + optional reason/details)

**Step 2: Run tests**

Run: `bun run test:run`
Expected: PASS

---

## Task 2: Create autonomous generator wrapper

**Files:**
- Create: `src/lib/pack/autonomous-generator.ts`
- Modify: `src/lib/pack/generator.ts` (only if you need exported helpers; prefer no change)
- Test: `tests/unit/pack/autonomous-generator.test.ts`

**Step 1: Write failing tests**

Test cases:
- Retries when validation fails, stops when it passes.
- Respects max attempts (throws or returns failure outcome).
- Seed is rotated per attempt (deterministic per attempt).

**Step 2: Run test to verify it fails**

Run: `bun run test:run -- tests/unit/pack/autonomous-generator.test.ts`
Expected: FAIL (module/function not found)

**Step 3: Implement minimal wrapper**

Create `generatePackAutonomous()` that:
- accepts `config`, `seed?`, `maxAttempts?`
- loops: `pack = generatePack(config, seed + attempt)`
- validates via `validatePackBeforeOpen(pack)`
- returns `{ pack, attempts, lastValidation }` on success
- returns failure result (or throws) when max attempts reached

**Step 4: Run tests**

Run: `bun run test:run -- tests/unit/pack/autonomous-generator.test.ts`
Expected: PASS

---

## Task 3: Add opt-in toggle + telemetry to pack store

**Files:**
- Modify: `src/stores/pack.ts`
- Test: `tests/unit/stores/pack.test.ts` (extend existing tests if present)

**Step 1: Add store flag**

Add a persisted or in-memory toggle:
- `autonomousGenerationEnabled: boolean`

**Step 2: Plumb autonomous generator**

When enabled:
- use `generatePackAutonomous()` in the open-pack flow
- store attempt count in state for UI (`lastGenerationAttempts`)

**Step 3: Run tests**

Run: `bun run test:run -- tests/unit/stores/pack.test.ts`
Expected: PASS

---

## Task 4: Surface attempt count in PackOpener UI (minimal)

**Files:**
- Modify: `src/components/pack/PackOpener.svelte`
- Test: (optional) `tests/unit/components/pack-opener.test.ts` (if UI test infra exists)

**Step 1: Show attempts when > 1**

Display a small, non-intrusive label:
- “Validated after \(N\) attempts”

**Step 2: Manual verification**

Run: `bun run dev`
Verify:
- opening packs works as before when toggle off
- when toggle on, attempt label appears only if retries happened

---

## Definition of done

- Toggle exists and defaults to off.
- Autonomous generator retries until validation passes (bounded).
- Attempt count is recorded and optionally displayed.
- `bun run test:run` passes.
