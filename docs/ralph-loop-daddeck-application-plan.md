---
title: DadDeck × Ralph Loop Patterns (Application Plan)
created: 2026-01-17
related:
  - docs/RALPH_LOOP_ARCHITECTURE.md
  - docs/plans/2026-01-17-phase-1-autonomous-pack-generation.md
  - docs/plans/2026-01-17-phase-2-mission-control-dashboard.md
  - docs/plans/2026-01-17-phase-4-stop-hook-visualization.md
---

# DadDeck × Ralph Loop Patterns (Application Plan)

This doc maps the **Ralph Loop Architecture** concepts onto DadDeck’s existing
state-machine-driven gameplay and outlines a phased roadmap for adding **visible
validation**, **retry loops**, and **mission-control UX** (without changing core gameplay).

See the full background doc: `docs/RALPH_LOOP_ARCHITECTURE.md`.

## Current Ralph Loop-like patterns already in DadDeck

- **State machine loops**: `PackState` (and batch flows) already model deterministic
  phases and transitions.
- **Stop hooks**: `validatePackBeforeOpen()` in `src/lib/security/pack-validator.ts`
  acts as a bouncer gate before user-facing outcomes.
- **Progress tracking**: Batch opening tracks counts/steps (a precursor to HOTL UI).
- **Context control (deterministic)**: Pack generation supports seeded randomness,
  which is a form of "context" that can be rotated between attempts.

## Ralph Loop patterns that are missing (opportunities)

- **Autonomous iteration**: Retry-until-valid loops (with max attempts + telemetry).
- **Explicit “completion promises”**: A typed, reusable definition of “done”.
- **Visible backpressure**: UI surfaces that show *why* validation failed and what
  the system is doing next.
- **Mission Control UX for batch**: Objective/progress/traffic lights over raw logs.

## Proposed phases (roadmap)

### Phase 1: Autonomous pack generation (retry loop)

Goal: add an **opt-in** generator that retries pack generation until validation passes
(bounded by max attempts).

Plan: `docs/plans/2026-01-17-phase-1-autonomous-pack-generation.md`

### Phase 2: Mission Control Dashboard for batch operations

Goal: add a HOTL “Mission Control” view for batch open progress + validation status.

Plan: `docs/plans/2026-01-17-phase-2-mission-control-dashboard.md`

### Phase 4: Stop Hook visualization (traffic lights + details)

Goal: show validation checks during pack opening (what passed, what failed, when
we retried).

Plan: `docs/plans/2026-01-17-phase-4-stop-hook-visualization.md`

## Implementation priorities

- **Priority 1 (High impact, lower complexity)**: Phase 1 + Phase 4
- **Priority 2 (High UX value, medium complexity)**: Phase 2

## Non-goals (for now)

- True LLM "context window" tracking (DadDeck pack gen is deterministic RNG today).
- Plan regeneration / Lisa-style interviews (keep future-facing only).
