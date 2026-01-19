# API Reference - DadDeck™

This document provides a comprehensive reference for the core types, stores, and library functions in the DadDeck™ project.

## 📖 Documentation Navigation
- 🏠 **[Project Home](./README.md)**
- 🏗️ **[Architecture](./ARCHITECTURE.md)**
- 🤝 **[Contributing](./CONTRIBUTING.md)**
- 🚢 **[Deployment](./DEPLOYMENT.md)**

---

## 📦 Core Types

Located in `src/types/index.ts`.

### `Card`
The fundamental data structure for every card in the game.
```typescript
export interface Card {
  id: string;
  name: string;
  subtitle?: string;
  type: DadType;
  rarity: Rarity;
  artwork: string;
  stats: CardStats;
  flavorText?: string;
  abilities: Ability[];
  series: number;
  cardNumber: number;
  totalInSeries: number;
  isHolo?: boolean;
  holoType?: HoloVariant;
}
```

### `CardStats`
Stat values ranging from 0 to 100.
```typescript
export interface CardStats {
  dadJoke: number;
  grillSkill: number;
  fixIt: number;
  napPower: number;
  remoteControl: number;
  thermostat: number;
  sockSandal: number;
  beerSnob: number;
}
```

### `Pack`
Structure of a generated booster pack.
```typescript
export interface Pack {
  id: string;
  cards: Card[];
  timestamp: number;
  seed: number;
  config: PackConfig;
}
```

---

## 🏬 State Stores (Nanostores)

### Store Usage Pattern
Every store follows the atomic pattern. Subscribe in components using Svelte 5 `$derived` or the store's `.get()` method.

```typescript
import { packState, openNewPack } from '@/stores/pack';

// Read state
const currentState = packState.get();

// Trigger action
await openNewPack();
```

### `packStore` (`src/stores/pack.ts`)
Manages the pack opening lifecycle.

#### State Atoms
- `currentPack`: `Atom<Pack | null>` - The currently active pack data.
- `packState`: `Atom<PackState>` - Sequence state (`idle`, `generating`, etc.).
- `revealedCards`: `Atom<Set<number>>` - Indices of cards revealed in current pack.

#### Actions
- `openNewPack()`: Starts the generation and validation sequence.
- `revealCard(index: number)`: Marks a card as revealed and triggers haptics/analytics.
- `skipToResults()`: Instantly reveals all cards and jumps to final screen.

---

## 🧩 Component Examples

### Card Display (`Card.svelte`)
Basic card display with rarity-based styling.

```svelte
<script lang="ts">
  import type { Card } from '@/types';
  import { RARITY_CONFIG } from '@/types';
  
  let { card } = $props<{ card: Card }>();
  
  const config = $derived(RARITY_CONFIG[card.rarity]);
</script>

<div class="card p-4 rounded-xl border-2" 
     style="border-color: {config.borderColor}; box-shadow: 0 0 10px {config.glowColor}">
  <img src={card.artwork} alt={card.name} class="w-full aspect-[3/4] object-cover rounded" />
  <h3 class="mt-2 font-bold">{card.name}</h3>
  <p class="text-sm italic">{card.subtitle}</p>
  <div class="mt-4 flex justify-between text-xs">
    <span>Joke: {card.stats.dadJoke}</span>
    <span>Grill: {card.stats.grillSkill}</span>
  </div>
</div>
```

### Collection Search (`CollectionSearch.svelte`)
Example of a debounced search input updating a store.

```svelte
<script lang="ts">
  import { searchQuery } from '@/stores/collection';
  
  let value = $state("");
  let timeout: ReturnType<typeof setTimeout>;

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    
    // Debounce to avoid excessive store updates
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      searchQuery.set(value);
    }, 300);
  }
</script>

<input 
  type="search" 
  {value} 
  oninput={handleInput} 
  placeholder="Search your Dads..." 
  class="w-full p-2 bg-slate-900 border border-slate-700 rounded"
/>
```

---

## 🛠️ Library Functions

### Pack Generation (`src/lib/pack/generator.ts`)
- `generatePack(config?: PackConfig, seed?: number): Pack`
  Generates a new pack based on rarity slot probabilities.
- `rollRarity(slot: RaritySlot): Rarity`
  Determines card rarity based on slot config.

### Combat Mechanics (`src/lib/mechanics/combat.ts`)
- `calculateBattleResult(attackerDeck: Deck, defenderDeck: Deck): BattleResult`
  Main entry point for the battle system.
- `getTypeAdvantage(attackerType: DadType, defenderType: DadType): number`
  Calculates damage modifiers based on card types.

### Security (`src/lib/security/pack-validator.ts`)
- `validatePackBeforeOpen(pack: Pack): Promise<ValidationResult>`
  Runs multiple checks (entropy, anomaly detection, duplicates) to verify pack integrity.

### Data Access (`src/lib/cards/database.ts`)
- `getAllCards(): Card[]`
  Returns the complete array of cards from the database.
- `getCardById(id: string): Card | undefined`
  Retrieves a specific card by its unique ID.
- `getCardsByRarity(rarity: Rarity): Card[]`
  Filters cards by rarity tier.

---

## 🎨 Constants & Config

### `RARITY_CONFIG`
Visual and probability settings for each rarity.
```typescript
export const RARITY_CONFIG = {
  common: { color: '#9ca3af', particles: 0, scale: 1.0 },
  rare: { color: '#eab308', particles: 10, scale: 1.1 },
  mythic: { color: '#ec4899', particles: 40, scale: 1.3 },
  // ...
};
```

### `DEFAULT_PACK_CONFIG`
Standard distribution for a booster pack (6 cards).
- Slots 1-3: Guaranteed Common
- Slot 4-5: Uncommon or better
- Slot 6: Rare or better

---

**Last Updated:** January 18, 2026
