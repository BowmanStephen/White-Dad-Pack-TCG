# Ralph Loop Architecture Explained

**A visual guide to understanding your DadDeck™ architecture through the lens of Ralph Loop patterns**

---

## What is a Ralph Loop?

A **Ralph Loop** is an agentic iteration pattern with these key elements:

1. **State Machine** - Clear phases with exit conditions
2. **Stop Hooks** - Validation gates that block bad states
3. **Visible Progress** - Users see what's happening
4. **Retry Logic** - Graceful failure recovery
5. **Mission Control** - Dashboard-style UI for operations

---

## 🎯 Your Main Ralph Loop: Pack Opening

### The Complete Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ACTION LAYER                        │
│  User clicks "Open Pack" button                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    LISA LAYER (Planning)                     │
│  File: src/stores/pack.ts                                   │
│                                                              │
│  openNewPack() {                                            │
│    ✅ Set state to 'generating'                            │
│    ✅ Validate pack type (standard/premium/theme)           │
│    ✅ Get pity counter (bad luck protection)                │
│    ✅ Reset UI state                                        │
│  }                                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    RALPH LAYER (Execution)                   │
│  File: src/lib/pack/generator.ts                            │
│                                                              │
│  generatePack(config, seed, pityCounter) {                  │
│    ✅ Initialize RNG (seeded for reproducibility)           │
│    ✅ Process each rarity slot:                             │
│      - Slot 1-3: Common (100%)                             │
│      - Slot 4-5: Uncommon+ (74% uncommon, 20% rare, ...)    │
│      - Slot 6: Rare+ (87.9% rare, 10% epic, 2% legendary+)  │
│    ✅ Select cards without duplicates                       │
│    ✅ Roll for holographic variants (16.67% chance)         │
│    ✅ Shuffle cards (prevent position prediction)           │
│                                                              │
│    ⛔ STOP HOOK: validateRarityDistribution()              │
│    └─ If validation fails → THROW ERROR, STOP LOOP         │
│                                                              │
│    ✅ Return Pack object                                   │
│  }                                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACK TO LISA LAYER                        │
│  File: src/stores/pack.ts (continued)                       │
│                                                              │
│  ⛔ STOP HOOK: addPackToCollection(pack)                   │
│  └─ If storage fails → Show warning, DON'T BLOCK           │
│                                                              │
│  ✅ Track analytics event                                  │
│  ✅ Check wishlist for pulled cards                        │
│  ✅ Update state: 'generating' → 'pack_animate'             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    UI LAYER (Display)                        │
│  File: src/components/pack/PackOpener.svelte                │
│                                                              │
│  {#if packState === 'pack_animate'}                         │
│    <PackAnimation />                                        │
│      └─ Plays pack tear animation                          │
│      └─ Emits 'complete' event when done                    │
│      └─ User can skip (fast-forward)                       │
│  {/if}                                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              CARD REVEAL SUB-LOOP (Mini Ralph Loop)          │
│                                                              │
│  State: 'cards_ready' → 'revealing' → 'results'             │
│                                                              │
│  For each card in pack (6 cards):                          │
│    1. Show card back (unrevealed)                          │
│    2. User clicks/taps/presses key                         │
│    3. Flip animation plays                                 │
│    4. Show card front (revealed)                           │
│    5. Haptic feedback (vibration on mobile)                │
│    6. Track analytics                                      │
│    7. Move to next card OR show results                    │
│                                                              │
│  User can:                                                  │
│    - Skip all → Go straight to results                     │
│    - Navigate freely → Back/forward through cards          │
│    - Exit early → Go back to home                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────���──────┐
│                    COMPLETION (Exit Condition)               │
│  State: 'results' (terminal state)                          │
│                                                              │
│  ✅ Show all cards revealed                                │
│  ✅ Display pack statistics (rarity breakdown, etc.)        │
│  ✅ Show toast notification                               │
│  ✅ Track completion analytics                            │
│  ✅ Offer actions: "Open Another" or "Go Home"             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Stop Hooks (Your "Bouncers")

Stop hooks are validation gates that prevent invalid states from progressing.

### Primary Stop Hook: Rarity Distribution Validation

**Location:** `src/lib/pack/generator.ts:430`

```typescript
function validateRarityDistribution(cards: PackCard[], config: PackConfig): void {
  // Count rarities in the pack
  const rarityCounts: Record<Rarity, number> = {
    common: 0, uncommon: 0, rare: 0,
    epic: 0, legendary: 0, mythic: 0,
  };

  for (const card of cards) {
    rarityCounts[card.rarity]++;
  }

  // Check each slot's requirements
  for (const slot of config.raritySlots) {
    if (slot.guaranteedRarity) {
      const guaranteedCount = config.raritySlots.filter(
        s => s.guaranteedRarity === slot.guaranteedRarity
      ).length;

      const actualCount = rarityCounts[slot.guaranteedRarity];

      if (actualCount < guaranteedCount) {
        // 🛑 STOP THE LOOP - Throw error
        throw new Error(
          `Pack validation failed: expected at least ${guaranteedCount} ` +
          `${slot.guaranteedRarity} cards but found ${actualCount}.`
        );
      }
    }
  }

  // Verify total card count
  if (cards.length !== config.cardsPerPack) {
    throw new Error(
      `Pack validation failed: expected ${config.cardsPerPack} cards ` +
      `but got ${cards.length}.`
    );
  }
}
```

**What it does:**
- Ensures the generated pack meets minimum rarity requirements
- Prevents malformed packs from being saved
- Throws error if validation fails (STOPS the loop)
- Called AFTER pack generation, BEFORE saving to collection

### Secondary Stop Hook: Storage Validation

**Location:** `src/stores/pack.ts:95`

```typescript
// Save pack to collection (LocalStorage)
const saveResult = addPackToCollection(pack);

if (!saveResult.success) {
  // ⚠️ WARNING: Non-blocking stop hook
  // Creates error but doesn't block the pack opening
  const storageAppError = createAppError(
    'storage',
    saveResult.error || 'Failed to save pack to collection',
    [
      {
        label: 'Dismiss',
        action: () => storageError.set(null),
      },
    ]
  );
  storageError.set(storageAppError);
  logError(storageAppError, saveResult.error);
}

// ✅ Loop continues even if storage fails (graceful degradation)
```

**What it does:**
- Attempts to save pack to LocalStorage
- If storage fails, shows non-blocking warning
- **Does NOT stop the loop** - user can still open packs
- This is "graceful degradation" - user experience > data persistence

---

## 🔄 Visible Loop Pattern

Your pack opening shows the loop state to users at every phase:

### Phase 1: Generating (Working Phase)
```
┌─────────────────────────────┐
│   [Spinner Animation]       │
│   "Generating your pack..." │
└─────────────────────────────┘
```

### Phase 2: Pack Animation (Anticipation)
```
┌─────────────────────────────┐
│   [Pack Tear Animation]     │
│   (0.5-2 seconds)           │
│                              │
│   [Skip Button] ← User can  │
│   fast-forward              │
└─────────────────────────────┘
```

### Phase 3: Card Reveal (Iteration Progress)
```
┌─────────────────────────────┐
│   Card 3 of 6               │
│   [████────░░░░]            │
│                              │
│   [← Prev] [Reveal] [Next →] │
│   [Skip All]                │
└─────────────────────────────┘
```

### Phase 4: Results (Completion)
```
┌─────────────────────────────┐
│   Pack Complete! 🎉         │
│                              │
│   Best: Legendary            │
│   Holos: 2                   │
│                              │
│   [Open Another] [Go Home]   │
└─────────────────────────────┘
```

---

## 🔁 Retry Logic (The "Try Again" Pattern)

When something goes wrong, your system doesn't just crash - it offers recovery.

### Error Categories & Recovery Patterns

**Location:** `src/lib/utils/errors.ts`

| Error Type | User Message | Recovery Actions |
|------------|--------------|------------------|
| **Generation Failed** | "Something went wrong while creating your pack." | • Try Again (primary) <br> • Go Home |
| **Storage Full** | "Your browser's storage is full." | • Continue Without Saving <br> • Try Again |
| **Network Error** | "We couldn't connect to our servers." | • Retry (primary) <br> • Continue Offline |
| **Validation Failed** | "We encountered unexpected data." | • Refresh Page <br> • Go Home |

### Example: Generation Error Recovery

**Location:** `src/stores/pack.ts:70`

```typescript
try {
  const pack = generatePack(packConfig, undefined, pityCounter);
  currentPack.set(pack);
  packState.set('pack_animate');
} catch (error) {
  // 🔄 Create error with retry action
  const appError = createAppError(
    'generation',
    error instanceof Error ? error.message : 'Failed to generate pack',
    [
      {
        label: 'Try Again',           // ← Retry action
        action: () => openNewPack(finalPackType, finalThemeType),
        primary: true,                // ← Highlighted button
      },
      {
        label: 'Go Home',             // ← Exit action
        action: () => { window.location.href = '/'; },
      },
    ]
  );
  packError.set(appError);
  packState.set('idle');             // ← Reset to safe state
}
```

---

## 🎮 Mission Control UI

Your error display is a "Mission Control" dashboard - it shows the current state and provides actions.

### Error Display Component

**Location:** `src/components/common/ErrorDisplay.svelte`

```svelte
<div class="error-container">
  <!-- Error Icon -->
  <div class="error-icon">{error.icon}</div>

  <!-- Error Title -->
  <h2>{error.title}</h2>

  <!-- Error Message (User-friendly) -->
  <p>{error.message}</p>

  <!-- Recovery Actions (Buttons) -->
  <div class="error-actions">
    {#each error.recovery as action}
      <button
        class:primary={action.primary}
        onclick={action.action}
      >
        {action.label}
      </button>
    {/each}
  </div>

  <!-- Error ID (For debugging/support) -->
  <small>Error ID: {error.id}</small>
</div>
```

**What makes it "Mission Control":**
- ✅ Shows current error state (title, message, icon)
- ✅ Provides actionable buttons (not just "OK")
- ✅ Logs details for debugging (transparency)
- ✅ Error ID for support (traceability)

---

## 🌐 Network Resilience Loop (Advanced Ralph Loop)

Your network system implements a "resilient loop" that handles offline gracefully.

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: NetworkDetector (The Observer)                   │
│  File: src/lib/network/network-detector.ts                 │
│                                                              │
│  Monitors:                                                   │
│  • Online/offline status (navigator.onLine)                 │
│  • Connection type (wifi/cellular/ethernet)                 │
│  • Connection quality (effectiveType, RTT, downlink)        │
│                                                              │
│  Emits Custom Events:                                        │
│  • daddeck:network-online                                   │
│  • daddeck:network-offline                                  │
│  • daddeck:network-unstable                                 │
│  • daddeck:network-change                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: RequestQueue (The Retry Manager)                  │
│  File: src/lib/network/request-queue.ts                     │
│                                                              │
│  Features:                                                   │
│  • Queues failed requests when offline                      │
│  • Auto-retries when connection restored                    │
│  • Priority-based processing (high/normal/low)              │
│  • Exponential backoff (prevents spam)                      │
│  • Persists across page reloads (LocalStorage)              │
│                                                              │
│  Process:                                                    │
│  1. Request fails → Add to queue                           │
│  2. Network comes back → Auto-process queue                 │
│  3. Each request retries up to 3 times                      │
│  4. Failed requests are removed after max retries           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: OfflineBanner (The Mission Control)               │
│  File: src/components/network/OfflineBanner.svelte           │
│                                                              │
│  Shows:                                                      │
│  • "You're offline" banner (auto-shows/hides)               │
│  • Queue count ("3 requests pending")                       │
│  • Reconnecting... spinner                                  │
│  • Dismissible with localStorage preference                 │
└─────────────────────────────────────────────────────────────┘
```

### The Resilient Loop Pattern

```
┌─────────────────┐
│  User Online    │
│  Pack opening   │
│  works normally │
└────────┬────────┘
         │
         │ Connection lost!
         ▼
┌─────────────────┐
│  NetworkDetector │
│  detects offline │
│  emits: offline  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  RequestQueue    │
│  queues requests │
│  persists to     │
│  LocalStorage    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  OfflineBanner   │
│  shows: "You're  │
│  offline"        │
│  Queue count: 3  │
└────────┬────────┘
         │
         │ Connection restored!
         ▼
┌─────────────────┐
│  NetworkDetector │
│  detects online  │
│  emits: online   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  RequestQueue    │
│  auto-processes  │
│  queued requests │
│  (retry loop)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  OfflineBanner   │
│  auto-hides      │
│  shows: "Back    │
│  online!"        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  User Online    │
│  (Loop completes)│
└─────────────────┘
```

---

## 🎯 Lisa/Ralph Split (Planner vs Worker)

Your codebase implements the Lisa/Ralph pattern from Ralph Loop architecture.

### Lisa (The Planner) - State Management

**Location:** `src/stores/pack.ts`

```typescript
// Lisa decides WHAT to do
export async function openNewPack(packType?: PackType) {
  // 1. Reset state (prepare for work)
  currentCardIndex.set(0);
  revealedCards.set(new Set());
  packError.set(null);

  // 2. Set to generating state (signal work starting)
  packState.set('generating');

  // 3. Get configuration (plan the work)
  const packConfig = getPackConfig(finalPackType, finalThemeType);

  // 4. Get pity counter (check constraints)
  const pityCounter = getPityCounter();

  try {
    // 5. Delegate to Ralph (executor)
    const pack = generatePack(packConfig, undefined, pityCounter);

    // 6. Validate Ralph's work (stop hook)
    const saveResult = addPackToCollection(pack);
    if (!saveResult.success) {
      // Handle storage error (non-blocking)
    }

    // 7. Update state (work complete)
    currentPack.set(pack);
    packState.set('pack_animate');
  } catch (error) {
    // 8. Handle Ralph's failures
    const appError = createAppError('generation', error, [
      { label: 'Try Again', action: () => openNewPack(...) },
    ]);
    packError.set(appError);
  }
}
```

### Ralph (The Worker) - Pure Execution

**Location:** `src/lib/pack/generator.ts`

```typescript
// Ralph DOES the work (no state, no UI)
export function generatePack(
  config: PackConfig,
  seed?: number,
  pityCounter?: PityCounter
): Pack {
  // 1. Initialize RNG (deterministic)
  const rng = new SeededRandom(seed);

  // 2. Process each slot (pure work)
  for (const slot of config.raritySlots) {
    const rarity = rollRarity(slot, rng);
    const [card] = selectCards(rarity, usedIds, 1, rng);
    packCards.push(card);
  }

  // 3. Validate output (stop hook)
  validateRarityDistribution(packCards, config);

  // 4. Return result (no side effects)
  return pack;
}
```

**Key Differences:**
- **Lisa** manages state, UI, error handling, retry logic
- **Ralph** does pure computation, no side effects, deterministic
- **Lisa** decides when to start/stop loops
- **Ralph** executes loop iterations

---

## 🎓 Summary: Your Ralph Loop Architecture

Your DadDeck™ implementation demonstrates **advanced Ralph Loop patterns**:

### ✅ What You Got Right

1. **Clear State Machine** - 6 states with obvious transitions
2. **Stop Hooks** - Validation gates prevent bad states
3. **Visible Progress** - Users see loop status at all times
4. **Retry Logic** - Graceful error recovery with actionable buttons
5. **Mission Control UI** - Error displays show state + actions
6. **Lisa/Ralph Split** - Planner (stores) vs Worker (generator)
7. **Resilient Loops** - Network system handles offline gracefully
8. **Loop State Persistence** - Request queue survives page reloads

### 🚀 Advanced Techniques You're Using

- **Non-Blocking Stop Hooks** - Storage errors don't stop pack opening
- **Graceful Degradation** - App works even when features fail
- **Exponential Backoff** - Request queue prevents retry spam
- **Deterministic RNG** - Seeded randomness for reproducible packs
- **Sub-Loops** - Card reveal is a loop within the main loop
- **Fast-Forward** - Users can skip animations (control loop speed)

### 🎯 Key Insight

**Your entire app is a collection of nested Ralph Loops:**

- **Main Loop**: Pack opening (idle → generating → pack_animate → cards_ready → revealing → results)
- **Sub-Loop**: Card reveal (6 iterations, one per card)
- **Background Loop**: Network retry (continues until success or max retries)
- **Error Loop**: Try again → fail → offer retry → repeat

Each loop has:
- ✅ Clear exit conditions
- ✅ Progress visibility
- ✅ Error recovery
- ✅ User control

**This is production-quality agentic architecture.** 🎉

---

## 📚 Further Reading

- **Original Concept**: `docs/RALPH_LOOP_ARCHITECTURE.md` - Ralph Loop philosophy
- **Implementation**: `src/stores/pack.ts` - Lisa layer (planning)
- **Execution**: `src/lib/pack/generator.ts` - Ralph layer (worker)
- **Network**: `src/lib/network/` - Resilient loop patterns
- **Errors**: `src/lib/utils/errors.ts` - Error recovery patterns

---

**Last Updated:** January 18, 2026
**Author:** Claude Code (with Stephen via Ralph Loops)
