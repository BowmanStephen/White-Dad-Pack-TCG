# TCG Best Practices & Market Research

**Generated:** January 18, 2026  
**Source:** Librarian Agent Research on Modern TCG Simulators  
**Version:** 1.0.0

---

## Overview

This document synthesizes research on modern trading card game (TCG) simulators and best practices, providing actionable recommendations for DadDeck™'s continued development and optimization.

**Research Focus:**
- TCG simulator market landscape (2023-2026)
- Pack opening UX patterns and psychology
- Collection management best practices
- Tech stack optimization strategies (Astro 5 + Svelte 5)
- Engagement, monetization, and social sharing tactics

---

## 1. TCG Simulator Market Analysis

### Current Competitive Landscape

The TCG simulator market has evolved from simple "click-to-reveal" tools to high-fidelity "unboxing experiences" with sophisticated social features.

#### Key Competitors (2025-2026)

| Simulator | Strengths | Weaknesses | Market Position |
|-----------|------------|-------------|-----------------|
| **Packz.io** | Fast load times, smooth animations, mobile-first | Limited card variety, no collection tracking | Casual / Quick entertainment |
| **PokemonSim.com** | Authentic pack feel, high-res assets | No deck building, simple features only | Nostalgic / Authentic experience |
| **Pokemoncard.io** | Full database, deck builder, EV calculator | Complex UI, slower onboarding | Serious collectors / Meta-analysis |
| **YGOPRODeck** | Auto-open, draft mode, competitive focus | Sterile interface, no "fun" factor | Competitive players / Drafting |
| **MTGBoxSim.com** | Expected Value (EV) tracking, statistical analysis | Learning curve, lacks visual polish | Value-focused collectors |

#### User Expectations (2025)

**Core Requirements:**
1. **Speed to Pack** - Users want to open their first pack in <2 clicks from landing page
2. **Physical Fidelity** - The "cut" or "tear" animation is now the standard for premium simulators (e.g., *Pokémon TCG Pocket*)
3. **Bulk Opening** - Power users expect "Open 100" or "Box Simulator" modes with summarized results
4. **Shareability** - One-click sharing of pulls to social media with dynamic OG images
5. **Collection Tracking** - Persistent collections with stats, filtering, and sorting

**Differentiation Opportunity for DadDeck™:**

Most simulators are **sterile and functional**. DadDeck™ can win by:
- Leaning into its **satirical narrative** - making "Failed Grill Session" pulls just as funny as "Mythic Lawn Dad"
- **Premium animations** - Competing with Pokémon TCG Pocket's pack opening experience
- **Viral potential** - Shareable dad humor combined with high-rarity pulls
- **No microtransactions** - Pure entertainment focus (rare in market)

---

## 2. Pack Opening Best Practices & Psychology

### The 6-Step Choreographed Emotion Pattern

Research on successful pack opening UX (from *Choreographed Emotion* by N3twork) identifies this emotional journey:

```
1. ANTICIPATION  → Hover effects simulate light reflecting off foil
2. THE TRIGGER   → Haptic-enabled swipe or click-drag to "rip" the top
3. THE BURST    → Particle effects colored by highest rarity in pack
4. THE BUILD     → Slow-reveal or "peel" interaction for final card
5. THE PAYOFF    → High-fidelity CSS shaders for holographic cards
6. THE COLLECTION → "New" badge on cards not currently in collection
```

### Actionable Implementation Notes

#### Step 1: Anticipation (Hover Effects)

**Best Practice:** Add subtle hover effects to closed pack that simulate light reflecting off foil.

```svelte
<!-- Pack hover with foil simulation -->
<div class="pack-container">
  <div class="pack-sheen" />
  <img src="/images/packs/pack-closed.png" alt="DadDeck Pack" />
</div>

<style>
.pack-container {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease-out;
}

.pack-container:hover {
  transform: scale(1.05);
}

.pack-sheen {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 40%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 60%
  );
  transform: translateX(-100%);
  animation: sheen 2s infinite;
}

@keyframes sheen {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
```

#### Step 2: The Trigger (Swipe to Tear)

**Best Practice:** Implement swipe-to-tear gesture on mobile for physical pack feel.

```typescript
// Swipe gesture detection
import { onMount } from 'svelte';

let startX = 0;
let currentX = 0;
let isDragging = false;
let tearProgress = 0;

function handleTouchStart(e: TouchEvent) {
  startX = e.touches[0].clientX;
  isDragging = true;
}

function handleTouchMove(e: TouchEvent) {
  if (!isDragging) return;
  currentX = e.touches[0].clientX;
  tearProgress = Math.min(1, (currentX - startX) / 200); // 200px tear distance
}

function handleTouchEnd() {
  if (tearProgress > 0.7) {
    // Tear completed
    openPack();
  } else {
    // Reset animation
    tearProgress = 0;
  }
  isDragging = false;
}

onMount(() => {
  const packElement = document.querySelector('.pack-tear-zone');
  packElement?.addEventListener('touchstart', handleTouchStart);
  packElement?.addEventListener('touchmove', handleTouchMove);
  packElement?.addEventListener('touchend', handleTouchEnd);
});
```

#### Step 3: The Burst (Particle Effects)

**Best Practice:** Particle color matches highest rarity in pack for visual hierarchy.

```typescript
// Burst effect implementation
function createBurstEffect(rarity: Rarity) {
  const colors = {
    common: '#9ca3af',
    uncommon: '#3b82f6',
    rare: '#eab308',
    epic: '#a855f7',
    legendary: '#f97316',
    mythic: '#ec4899'
  };

  const particleCount = RARITY_CONFIG[rarity].particles * 3; // Triple particles for burst

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'burst-particle';
    particle.style.backgroundColor = colors[rarity];
    particle.style.left = '50%';
    particle.style.top = '50%';
    
    // Random explosion velocity
    const angle = Math.random() * Math.PI * 2;
    const velocity = 100 + Math.random() * 200;
    particle.style.setProperty('--tx', `${Math.cos(angle) * velocity}px`);
    particle.style.setProperty('--ty', `${Math.sin(angle) * velocity}px`);
    
    document.body.appendChild(particle);
    
    // Remove after animation
    setTimeout(() => particle.remove(), 1000);
  }
}
```

#### Step 4: The Build (Slow-Reveal for Final Card)

**Best Practice:** Final card (usually highest rarity) uses slow-reveal "peel" interaction.

```svelte
<!-- Card peel reveal -->
<div class="card-peel-container" style="background-image: url('{card.artwork}')">
  <div class="card-peel-overlay" style="clip-path: inset({peelProgress}% 0 0 0)" />
</div>

<style>
.card-peel-container {
  position: relative;
  width: 400px;
  height: 550px;
  background-size: cover;
}

.card-peel-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, #1e293b, #0f172a);
  transition: clip-path 0.8s ease-out;
}
</style>

<script>
  let peelProgress = 100;

  function handlePeelGesture(e: MouseEvent | TouchEvent) {
    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const y = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
    const relativeY = (y - rect.top) / rect.height;
    peelProgress = 100 - (relativeY * 100);
  }
</script>
```

#### Step 5: The Payoff (High-Fidelity Holo Shaders)

**Best Practice:** Use CSS shaders for holographic effects (see Simey's Holo Effects - gold standard).

```css
/* Holographic card effect (inspired by pokemon-cards-css) */
.holo-card {
  position: relative;
  transform-style: preserve-3d;
}

.holo-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 20%,
    rgba(255, 255, 255, 0.3) 25%,
    transparent 30%
  );
  mix-blend-mode: color-dodge;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: 10;
}

.holo-card:hover::before {
  opacity: 1;
  animation: holo-shimmer 1.5s infinite linear;
}

@keyframes holo-shimmer {
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(200%) skewX(-15deg); }
}

/* Gyroscope-based reflection (mobile) */
@media (max-width: 768px) {
  .holo-card::before {
    background: radial-gradient(
      circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
      rgba(255, 255, 255, 0.4) 0%,
      transparent 50%
    );
  }
}
```

#### Step 6: The Collection ("New" Badge)

**Best Practice:** Badge on cards not currently in user's collection.

```svelte
<!-- "New" badge on unowned cards -->
{#if !isInCollection(card.id)}
  <div class="new-badge">NEW!</div>
{/if}

<style>
.new-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(135deg, #f97316, #ef4444);
  color: white;
  font-weight: bold;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 9999px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  animation: badge-pulse 2s infinite;
  z-index: 20;
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
</style>
```

### Variable Ratio Reinforcement (Psychology)

**Key Insight:** The "Near-Miss" (seeing a rare card flash by) is a stronger dopamine trigger than constant low-value wins.

**Implementation:**
```typescript
// Add "Near-Miss" effect to card reveal
function revealCard(card: Card, index: number, totalCards: number) {
  // Final card gets slow-reveal (high anticipation)
  if (index === totalCards - 1) {
    showSlowReveal(card);
    return;
  }

  // Non-final cards: 30% chance of "Near-Miss" flash
  if (card.rarity === 'rare' || card.rarity === 'epic') {
    if (Math.random() < 0.3) {
      flashNearMiss(card);
    }
  }

  showCard(card);
}

function flashNearMiss(card: Card) {
  // Briefly flash the card as if it's legendary, then reveal true rarity
  const flashOverlay = document.createElement('div');
  flashOverlay.className = 'near-miss-flash';
  flashOverlay.style.backgroundColor = '#f97316'; // Legendary color
  document.body.appendChild(flashOverlay);

  setTimeout(() => {
    flashOverlay.remove();
  }, 150); // 150ms flash - barely perceptible but hits dopamine
}
```

---

## 3. Collection Management & Mobile UX

### LocalStorage Quota Management

**Problem:** LocalStorage has a 5MB limit (typical). As collections grow, this will fail.

**Solution:** Migrate to **IndexedDB** using **`localForage`** library for gigabytes of storage.

#### Implementation

```bash
# Install localForage
bun add localforage
```

```typescript
// src/lib/storage/indexeddb.ts
import localforage from 'localforage';

// Configure localForage
localforage.config({
  name: 'DadDeck',
  storeName: 'collection',
  driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE], // Fallback to LocalStorage
});

// Collection persistence
export async function saveCollection(collection: UserCollection): Promise<void> {
  try {
    await localforage.setItem('collection', collection);
  } catch (error) {
    console.error('Failed to save collection:', error);
    // Fallback: Save only card IDs, fetch metadata from static JSON
    await saveCompactCollection(collection);
  }
}

export async function loadCollection(): Promise<UserCollection | null> {
  try {
    const collection = await localforage.getItem<UserCollection>('collection');
    return collection;
  } catch (error) {
    console.error('Failed to load collection:', error);
    return null;
  }
}

// Compact storage (fallback)
async function saveCompactCollection(collection: UserCollection) {
  const compact = {
    cards: collection.cards.map(c => ({
      id: c.id,
      timestamp: c.timestamp,
      isHolo: c.isHolo
    })),
    packs: collection.packs.map(p => ({
      id: p.id,
      timestamp: p.timestamp,
      cardIds: p.cards.map(c => c.id)
    }))
  };
  
  await localforage.setItem('collection-compact', compact);
}
```

#### Nanostores Integration

```typescript
// src/stores/collection.ts
import { atom } from 'nanostores';
import { saveCollection, loadCollection } from '@/lib/storage/indexeddb';

const DEFAULT_COLLECTION: UserCollection = {
  cards: [],
  packs: [],
  stats: { totalCards: 0, packsOpened: 0 }
};

export const collection = atom<UserCollection>(DEFAULT_COLLECTION);

// Load from IndexedDB on mount
loadCollection().then(loaded => {
  if (loaded) {
    collection.set(loaded);
  }
});

// Save to IndexedDB on change (debounced)
let saveTimeout: number;
collection.subscribe((coll) => {
  clearTimeout(saveTimeout);
  saveTimeout = window.setTimeout(() => {
    saveCollection(coll);
  }, 500); // Debounce saves
});
```

### Mobile-First Filtering UX

**Best Practice:** Use "Bottom Sheet" for filters on mobile, chips for active filters.

```svelte
<!-- Mobile bottom sheet for filters -->
<div class="mobile-filter-container">
  <!-- Filter chips (visible by default) -->
  <div class="filter-chips">
    {#each selectedRarities as rarity}
      <span class="chip" on:click={() => removeRarity(rarity)}>
        {rarity} ✕
      </span>
    {/each}
    
    {#if selectedRarities.length > 0 || selectedTypes.length > 0}
      <button class="clear-filters" on:click={clearAllFilters}>
        Clear All
      </button>
    {/if}
    
    <button class="add-filter-btn" on:click={openFilterSheet}>
      + Filters
    </button>
  </div>
  
  <!-- Bottom sheet (slide up) -->
  <div class="filter-sheet" class:open={isFilterSheetOpen}>
    <div class="filter-sheet-header">
      <h3>Filter Collection</h3>
      <button class="close-btn" on:click={closeFilterSheet}>✕</button>
    </div>
    
    <div class="filter-section">
      <h4>Rarity</h4>
      <div class="checkbox-group">
        {#each RARITIES as rarity}
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              checked={selectedRarities.includes(rarity)}
              on:change={() => toggleRarity(rarity)}
            />
            <span>{rarity}</span>
          </label>
        {/each}
      </div>
    </div>
    
    <div class="filter-section">
      <h4>Dad Type</h4>
      <div class="checkbox-group">
        {#each DAD_TYPES as type}
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              checked={selectedTypes.includes(type)}
              on:change={() => toggleType(type)}
            />
            <span>{type}</span>
          </label>
        {/each}
      </div>
    </div>
    
    <button class="apply-btn" on:click={closeFilterSheet}>
      Apply Filters
    </button>
  </div>
  
  <!-- Backdrop -->
  <div 
    class="filter-backdrop" 
    class:open={isFilterSheetOpen}
    on:click={closeFilterSheet}
  />
</div>

<style>
.filter-chips {
  display: flex;
  gap: 8px;
  padding: 12px;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

.chip {
  background: #3b82f6;
  color: white;
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 14px;
  flex-shrink: 0;
}

.filter-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 20px 20px 0 0;
  max-height: 80vh;
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
  z-index: 100;
}

.filter-sheet.open {
  transform: translateY(0);
}

.filter-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 99;
}

.filter-backdrop.open {
  opacity: 1;
  pointer-events: auto;
}

@media (min-width: 768px) {
  .filter-sheet {
    position: static;
    transform: none;
    max-height: none;
  }
  
  .filter-backdrop {
    display: none;
  }
}
</style>
```

### "Binder" Metaphor for Collection UI

**Best Practice:** Organize cards by "Series" or "Set" in a visual binder layout to increase "Completionist" drive.

```svelte
<!-- Binder-style collection UI -->
<div class="binder-grid">
  {#each SERIES as series}
    <div class="binder-page">
      <div class="binder-header">
        <h2>Series {series.number}: {series.name}</h2>
        <div class="completion-badge">
          {series.owned} / {series.total} ({Math.round(series.owned / series.total * 100)}%)
        </div>
      </div>
      
      <div class="card-slots">
        {#each series.cards as card}
          <div class="card-slot" class:owned={isOwned(card.id)}>
            {#if isOwned(card.id)}
              <img src={card.artwork} alt={card.name} />
            {:else}
              <div class="card-placeholder">
                <span>?</span>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
.binder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  padding: 24px;
}

.binder-page {
  background: #1e293b;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.binder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #334155;
}

.completion-badge {
  background: #3b82f6;
  color: white;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: bold;
}

.card-slots {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.card-slot {
  aspect-ratio: 400 / 550;
  border-radius: 4px;
  overflow: hidden;
  background: #0f172a;
  border: 2px solid #334155;
}

.card-slot.owned {
  border-color: #10b981;
}

.card-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  font-size: 24px;
  font-weight: bold;
}
</style>
```

---

## 4. Tech Stack Optimization (Astro 5 + Svelte 5)

### Svelte 5 Runes for Performance

**Key Benefit:** Svelte 5 Runes (`$state`, `$derived`) provide **fine-grained reactivity**. Updating a single card in a 500-item collection won't re-render the entire grid.

#### Example: Fine-Grained Collection Updates

```svelte
<!-- Bad: Svelte 4 - Entire collection re-renders -->
<script lang="ts">
  import { collection } from '@/stores/collection';
  
  $: cards = $collection.cards;
</script>

{#each cards as card}
  <Card {card} />
{/each}

<!-- Good: Svelte 5 - Only updated slots re-render -->
<script lang="ts">
  import { collection } from '@/stores/collection';
  
  const cards = $derived.by(() => 
    $collection.cards.map(card => ({ id: card.id, ...card }))
  );
  
  function addCard(newCard: Card) {
    collection.update(coll => ({
      ...coll,
      cards: [...coll.cards, newCard]
    }));
  }
</script>

{#each cards() as card (card.id)}
  <Card {card} />
{/each}
```

### Astro 5 Content Layer

**Best Practice:** Define card database in `src/content/config.ts` for build-time type safety and faster data fetching.

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const card = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    subtitle: z.string(),
    type: z.enum(['BBQ_DAD', 'FIX_IT_DAD', /* ... */]),
    rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']),
    artwork: z.string(),
    stats: z.object({
      dadJoke: z.number().min(0).max(100),
      grillSkill: z.number().min(0).max(100),
      // ... other stats
    }),
    flavorText: z.string().optional(),
    abilities: z.array(z.object({
      name: z.string(),
      description: z.string()
    })).optional(),
    series: z.number(),
    cardNumber: z.number(),
    totalInSeries: z.number(),
    artist: z.string()
  })
});

export const collections = { card };
```

```typescript
// src/lib/cards/database.ts (Astro Content Layer)
import { getCollection } from 'astro:content';

export async function getAllCards(): Promise<Card[]> {
  const cards = await getCollection('card');
  return cards.map(entry => entry.data);
}

export async function getCardsByRarity(rarity: Rarity): Promise<Card[]> {
  const cards = await getCollection('card');
  return cards
    .filter(entry => entry.data.rarity === rarity)
    .map(entry => entry.data);
}
```

**Benefits:**
- **Build-time type safety** - TypeScript errors at build time, not runtime
- **Faster than JSON** - Content Layer is optimized for static data
- **Image optimization** - Automatic image optimization for artwork
- **Collection filtering** - Built-in query methods

### GPU-Accelerated Animations

**Best Practice:** Always use `transform` and `opacity` for animations. Never animate `width`, `height`, or `top/left`.

```css
/* ✅ GOOD: GPU-accelerated */
.card-flip {
  transform: rotateY(180deg);
  opacity: 1;
  will-change: transform;
  transition: transform 0.6s ease-out, opacity 0.6s ease-out;
}

/* ❌ BAD: CPU-intensive (triggers reflow) */
.card-flip {
  width: 400px;
  height: 550px;
  top: 0;
  left: 0;
  transition: all 0.6s ease-out;
}
```

**Advanced: Use `will-change` sparingly**

```css
/* Only use will-change for elements that will animate */
.pack-tear-zone:hover {
  will-change: transform;
}

/* Remove after animation to free GPU memory */
.pack-tear-zone:not(:hover) {
  will-change: auto;
}
```

### Virtual Scrolling for Large Collections

**Best Practice:** Use virtual scrolling when collection > 200 items to maintain 60fps.

```typescript
// src/components/collection/VirtualGrid.svelte
<script lang="ts">
  import { onMount } from 'svelte';
  
  let cards: Card[] = [];
  let visibleRange = $state({ start: 0, end: 20 });
  let containerHeight = $state(0);
  
  const ITEM_HEIGHT = 600; // Card height + gap
  const COLUMNS = 3;
  
  function calculateVisibleRange(scrollTop: number, clientHeight: number) {
    const start = Math.floor(scrollTop / ITEM_HEIGHT) * COLUMNS;
    const end = Math.ceil((scrollTop + clientHeight) / ITEM_HEIGHT) * COLUMNS;
    visibleRange = { start, end };
  }
  
  function onScroll(event: Event) {
    const target = event.target as HTMLElement;
    calculateVisibleRange(target.scrollTop, target.clientHeight);
  }
  
  onMount(() => {
    const container = document.querySelector('.virtual-grid') as HTMLElement;
    containerHeight = container.clientHeight;
  });
</script>

<div class="virtual-grid" on:scroll={onScroll} style="height: {Math.ceil(cards.length / COLUMNS) * ITEM_HEIGHT}px">
  {#each cards.slice(visibleRange.start, visibleRange.end) as card (card.id)}
    <Card {card} style="position: absolute; top: {Math.floor(cards.indexOf(card) / COLUMNS) * ITEM_HEIGHT}px" />
  {/each}
</div>
```

---

## 5. Engagement & Social Sharing

### Dynamic Social Images (OG Generation)

**Best Practice:** Use **Vercel Satori** (or `@vercel/og`) to generate dynamic PNGs of user's best pulls for social sharing.

```bash
# Install Satori
bun add satori
```

```typescript
// src/lib/og/generate-pull-image.ts
import satori from 'satori';
import { writeFile } from 'fs/promises';

export async function generatePullImage(pull: Pull): Promise<Buffer> {
  const svg = await satori(
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      padding: '40px',
      fontFamily: 'Inter'
    }}>
      <div style={{ color: '#f97316', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        🎴 DadDeck™ Pull
      </div>
      
      <div style={{
        width: '400px',
        height: '550px',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '20px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        <img src={pull.card.artwork} alt={pull.card.name} />
      </div>
      
      <div style={{ color: 'white', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
        {pull.card.name}
      </div>
      
      <div style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '20px' }}>
        {pull.card.subtitle}
      </div>
      
      <div style={{
        display: 'flex',
        gap: '12px',
        padding: '12px',
        background: 'rgba(59, 130, 246, 0.2)',
        borderRadius: '8px',
        border: '2px solid #3b82f6'
      }}>
        <div style={{ color: 'white', fontSize: '14px' }}>
          <strong>Rarity:</strong> {pull.card.rarity.toUpperCase()}
        </div>
        <div style={{ color: 'white', fontSize: '14px' }}>
          <strong>Holo:</strong> {pull.card.isHolo ? '✓' : '✗'}
        </div>
      </div>
      
      <div style={{ marginTop: 'auto', color: '#64748b', fontSize: '14px' }}>
        daddeck.app • Pull #{pull.packNumber}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: await loadFonts()
    }
  );
  
  // Convert SVG to PNG using Sharp or similar
  const png = await svgToPng(svg);
  return png;
}
```

**Astro Route for Social Images:**

```astro
// src/pages/share/pull/[id].astro
import { generatePullImage } from '@/lib/og/generate-pull-image';
import { getPullById } from '@/lib/data/pulls';

export async function GET({ params }) {
  const pull = await getPullById(params.id);
  
  if (!pull) {
    return new Response('Pull not found', { status: 404 });
  }
  
  const image = await generatePullImage(pull);
  
  return new Response(image, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
```

### Retention Strategies (No Microtransactions)

#### Daily "Dad Allowance"

```typescript
// src/lib/rewards/daily-allowance.ts
const DAILY_PACKS = 3;
const ALLOWANCE_KEY = 'daddeck-daily-allowance';

export interface DailyAllowance {
  lastClaim: string;
  packsClaimed: number;
  streak: number;
}

export async function getDailyAllowance(): Promise<DailyAllowance> {
  const stored = localStorage.getItem(ALLOWANCE_KEY);
  if (!stored) {
    return { lastClaim: '', packsClaimed: 0, streak: 0 };
  }
  
  return JSON.parse(stored);
}

export async function claimDailyPack(): Promise<{ success: boolean; remaining: number; streak: number }> {
  const allowance = await getDailyAllowance();
  const today = new Date().toDateString();
  
  // Reset if new day
  if (allowance.lastClaim !== today) {
    const newAllowance: DailyAllowance = {
      lastClaim: today,
      packsClaimed: 1,
      streak: allowance.streak + 1
    };
    
    localStorage.setItem(ALLOWANCE_KEY, JSON.stringify(newAllowance));
    return { success: true, remaining: DAILY_PACKS - 1, streak: newAllowance.streak };
  }
  
  // Check if allowance available
  if (allowance.packsClaimed >= DAILY_PACKS) {
    return { success: false, remaining: 0, streak: allowance.streak };
  }
  
  // Claim pack
  const newAllowance: DailyAllowance = {
    ...allowance,
    packsClaimed: allowance.packsClaimed + 1
  };
  
  localStorage.setItem(ALLOWANCE_KEY, JSON.stringify(newAllowance));
  return { success: true, remaining: DAILY_PACKS - newAllowance.packsClaimed, streak: allowance.streak };
}
```

#### Achievements as Content

```typescript
// src/lib/achievements/definitions.ts
export interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: (collection: UserCollection) => boolean;
  reward: {
    type: 'packs' | 'theme' | 'sound';
    value: string | number;
  };
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'grill_master',
    name: 'The Grill Master',
    description: 'Own all BBQ Dad cards',
    requirement: (coll) => {
      const bbqDads = coll.cards.filter(c => c.type === 'BBQ_DAD');
      const totalBbqCards = getAllCards().filter(c => c.type === 'BBQ_DAD').length;
      return bbqDads.length === totalBbqCards;
    },
    reward: { type: 'theme', value: 'bbq-mode' },
    icon: '🍖'
  },
  {
    id: 'thermostat_dictator',
    name: 'Thermostat Dictator',
    description: 'Unlock a Mythic with 90+ Thermostat stat',
    requirement: (coll) => {
      return coll.cards.some(
        c => c.rarity === 'mythic' && c.stats.thermostat >= 90
      );
    },
    reward: { type: 'packs', value: 10 },
    icon: '🌡️'
  },
  {
    id: 'pack_opener_100',
    name: 'Pack Addict',
    description: 'Open 100 packs',
    requirement: (coll) => coll.stats.packsOpened >= 100,
    reward: { type: 'sound', value: 'dad-belch' },
    icon: '📦'
  }
];
```

#### Satirical Rewards

```typescript
// Reward types for completing achievements
export interface DadSound {
  id: string;
  name: string;
  audio: string;
  trigger: 'pack_open' | 'battle_win' | 'achievement_unlock';
}

export const DAD_SOUNDS: DadSound[] = [
  {
    id: 'dad_belch',
    name: 'Dad Belch',
    audio: '/sounds/dad-belch.mp3',
    trigger: 'pack_open'
  },
  {
    id: 'groan_pun',
    name: 'Groan Worthy',
    audio: '/sounds/groan-pun.mp3',
    trigger: 'achievement_unlock'
  }
];

export interface DadTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

export const DAD_THEMES: DadTheme[] = [
  {
    id: 'bbq_mode',
    name: 'BBQ Mode',
    colors: {
      primary: '#ef4444',
      secondary: '#f97316',
      background: '#1c1917',
      text: '#fef2f2'
    }
  },
  {
    id: 'golf_mode',
    name: 'Golf Course',
    colors: {
      primary: '#22c55e',
      secondary: '#10b981',
      background: '#14532d',
      text: '#f0fdf4'
    }
  }
];
```

---

## 6. Actionable Recommendations Summary

| Priority | Feature | Impact | Effort |
|----------|---------|---------|---------|
| **HIGH** | IndexedDB migration (localForage) | Solves 5MB LocalStorage limit for scaling | Medium |
| **HIGH** | Swipe-to-tear pack animation | Physical pack feel, mobile-first UX | Medium |
| **HIGH** | Dynamic OG images (Satori) | Viral social sharing, user acquisition | Medium |
| **HIGH** | Svelte 5 Runes migration | Fine-grained reactivity, 60fps on large collections | High |
| **MEDIUM** | "Binder" collection UI | Completionist drive, better organization | Low |
| **MEDIUM** | Holo shader system (Simey's) | Premium visual polish, competitive with TCG Pocket | Low |
| **MEDIUM** | Daily allowance system | Retention, daily active users | Low |
| **LOW** | Dad sounds and themes | Engagement, satirical rewards | Low |
| **LOW** | Virtual scrolling | Only needed >200 cards | High |

---

## 7. Recommended Resources

### Technical Resources

- **[Simey's Holo Effects](https://poke-holo.simey.me/)** - Gold standard for TCG CSS holo effects
- **[Astro 5 Content Layer Docs](https://docs.astro.build/en/guides/content-collections/)** - Type-safe static data
- **[Svelte 5 Runes](https://svelte.dev/docs/runes)** - Fine-grained reactivity patterns
- **[Vercel Satori](https://github.com/vercel/satori)** - Dynamic OG image generation
- **[localForage](https://localforage.github.io/localForage/)** - IndexedDB wrapper with fallbacks

### UX / Psychology Resources

- **[Choreographed Emotion (Medium)](https://medium.com/n3twork/choreographed-emotion-6-steps-to-a-great-card-reveal-ux-a6e6bb8487dd)** - Definitive pack opening UX guide
- **[Variable Ratio Reinforcement](https://en.wikipedia.org/wiki/Variable_ratio_schedule)** - Psychology of reward timing
- **[Pokémon TCG Pocket](https://www.pokemon.com/us/pokemon-tcg-pocket/)** - Current pack opening UX gold standard

### Competitor Research

- **Packz.io** - Fast load times, mobile-first approach
- **Pokemoncard.io** - Comprehensive database, deck builder
- **MTGBoxSim.com** - EV calculation, value tracking

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Migrate to IndexedDB with localForage
- [ ] Implement swipe-to-tear pack animation
- [ ] Add "New" badge to collection cards
- [ ] Update CLAUDE.md with storage migration notes

### Phase 2: Visual Polish (Week 3-4)
- [ ] Implement Simey's holo shader system
- [ ] Add 6-step choreographed emotion pattern
- [ ] Create "Binder" collection UI
- [ ] Add near-miss flash effect to card reveal

### Phase 3: Engagement Features (Week 5-6)
- [ ] Implement dynamic OG image generation (Satori)
- [ ] Create daily allowance system
- [ ] Add achievements with satirical rewards
- [ ] Build dad sounds and themes system

### Phase 4: Performance (Week 7-8)
- [ ] Migrate to Svelte 5 Runes
- [ ] Implement virtual scrolling for large collections
- [ ] Add GPU-accelerated animations (will-change)
- [ ] Profile and optimize 60fps target

---

**Last Updated:** January 18, 2026  
**Next Review:** April 2026 (after Phase 4 completion)
