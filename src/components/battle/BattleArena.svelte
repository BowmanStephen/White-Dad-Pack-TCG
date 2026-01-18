<script lang="ts">
  import { collection } from '../../stores/collection';
  import type { Card as CardType, PackCard } from '../../types';
  import { RARITY_CONFIG } from '../../types';

  type DuelResult = {
    winner: CardType;
    loser: CardType;
    turns: number;
    log: string[];
  };
  import Card from '../card/Card.svelte';
  import { simulateBattle } from '../../lib/mechanics/combat';

  let availableCards = $state<PackCard[]>([]);
  let selectedCard = $state<PackCard | null>(null);
  let opponentCard = $state<PackCard | null>(null);
  let battleResult = $state<DuelResult | null>(null);
  let battleLog = $state<string[]>([]);
  let isBattling = $state(false);

  $effect(() => {
    const collectionData = collection.get();
    const cards: PackCard[] = [];
    for (const pack of collectionData.packs) {
      cards.push(...pack.cards);
    }
    availableCards = cards;

    if (selectedCard && !cards.find((card) => card.id === selectedCard?.id)) {
      selectedCard = null;
    }
    if (opponentCard && !cards.find((card) => card.id === opponentCard?.id)) {
      opponentCard = null;
    }
  });

  function getRarityColor(rarity: string): string {
    return RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG]?.color || '#9ca3af';
  }

  function selectPlayerCard(card: PackCard) {
    selectedCard = card;
    battleResult = null;
    battleLog = [];

    if (opponentCard?.id === card.id) {
      opponentCard = null;
    }
  }

  function rollOpponent() {
    if (!selectedCard) return;

    const pool = availableCards.filter((card) => card.id !== selectedCard?.id);
    if (pool.length === 0) return;

    opponentCard = pool[Math.floor(Math.random() * pool.length)];
    battleResult = null;
    battleLog = [];
  }

  $effect(() => {
    if (selectedCard && !opponentCard && availableCards.length > 1) {
      rollOpponent();
    }
  });

  function startDuel() {
    if (!selectedCard || !opponentCard || isBattling) return;

    isBattling = true;
    const result = simulateBattle(selectedCard, opponentCard);
    battleResult = result;
    battleLog = result.log;
    isBattling = false;
  }

  function resetDuel() {
    battleResult = null;
    battleLog = [];
  }

  let hasEnoughCards = $derived(availableCards.length > 1);
  let canRollOpponent = $derived(!!selectedCard && availableCards.length > 1);
  let canStartDuel = $derived(!!selectedCard && !!opponentCard && !isBattling);
  let playerWins = $derived(!!battleResult && !!selectedCard && battleResult.winner.id === selectedCard.id);
</script>

<div class="duel-container">
  <div class="duel-header">
    <h1 class="duel-title">Card Duel</h1>
    <p class="duel-subtitle">Pick a card from your collection and run a quick battle.</p>
  </div>

  {#if !hasEnoughCards}
    <div class="empty-state">
      <p>You need cards before you can duel.</p>
      <a class="primary-link" href="/pack">Open Packs</a>
    </div>
  {:else}
    <div class="duel-stage">
      <div class="duel-slot">
        <h2>Your Card</h2>
        {#if selectedCard}
          <Card card={selectedCard} size="sm" interactive={false} showBack={false} />
        {:else}
          <div class="card-placeholder">Select a card</div>
        {/if}
      </div>

      <div class="duel-divider">
        <span>VS</span>
        <div class="divider-glow"></div>
      </div>

      <div class="duel-slot">
        <h2>Opponent</h2>
        {#if opponentCard}
          <Card card={opponentCard} size="sm" interactive={false} showBack={false} />
        {:else}
          <div class="card-placeholder">Roll opponent</div>
        {/if}
      </div>
    </div>

    <div class="duel-controls">
      <button class="secondary-button" disabled={!canRollOpponent} on:click={rollOpponent}>
        Roll Opponent
      </button>
      <button class="primary-button" disabled={!canStartDuel} on:click={startDuel}>
        Start Duel
      </button>
      {#if battleResult}
        <button class="ghost-button" on:click={resetDuel}>Reset</button>
      {/if}
    </div>

    {#if battleResult}
      <div class="duel-results" class:win={playerWins} class:loss={!playerWins}>
        <h3>{playerWins ? 'Victory' : 'Defeat'}</h3>
        <p>{battleResult.winner.name} wins in {battleResult.turns} turns.</p>
      </div>

      <div class="duel-log">
        <h4>Battle Log</h4>
        <div class="log-entries">
          {#each battleLog as entry}
            <div class="log-entry">{entry}</div>
          {/each}
        </div>
      </div>
    {/if}

    <div class="card-picker">
      <h3>Your Collection</h3>
      <div class="picker-grid">
        {#each availableCards as card (card.id)}
          <button
            class="picker-card"
            class:selected={selectedCard?.id === card.id}
            style:border-color={getRarityColor(card.rarity)}
            on:click={() => selectPlayerCard(card)}
          >
            <span class="picker-name">{card.name}</span>
            <span class="picker-rarity" style:color={getRarityColor(card.rarity)}>
              {RARITY_CONFIG[card.rarity].name}
            </span>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .duel-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem 3rem;
  }

  .duel-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .duel-title {
    font-size: clamp(2rem, 3vw, 2.8rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
  }

  .duel-subtitle {
    color: #94a3b8;
    font-size: 1.05rem;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    background: rgba(15, 23, 42, 0.6);
    border-radius: 1rem;
  }

  .primary-link {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.65rem 1.6rem;
    border-radius: 999px;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #0f172a;
    font-weight: 700;
    text-decoration: none;
  }

  .duel-stage {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    align-items: center;
    background: radial-gradient(circle at top, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.7));
    border-radius: 1.25rem;
    padding: 2rem;
    border: 1px solid rgba(148, 163, 184, 0.15);
  }

  .duel-slot {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }

  .duel-slot h2 {
    font-size: 1.1rem;
    font-weight: 700;
  }

  .duel-divider {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    color: #fbbf24;
  }

  .divider-glow {
    position: absolute;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(251, 191, 36, 0.35) 0%, transparent 65%);
    filter: blur(4px);
    animation: pulse-glow 2.5s ease-in-out infinite;
  }

  .card-placeholder {
    width: 190px;
    height: 270px;
    border-radius: 1rem;
    border: 2px dashed rgba(148, 163, 184, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    text-align: center;
    padding: 1rem;
  }

  .duel-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
    margin: 1.75rem 0 2rem;
  }

  .primary-button,
  .secondary-button,
  .ghost-button {
    padding: 0.7rem 1.75rem;
    border-radius: 999px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .primary-button {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #0f172a;
    box-shadow: 0 10px 25px rgba(251, 191, 36, 0.25);
  }

  .secondary-button {
    background: #1e293b;
    color: #e2e8f0;
  }

  .ghost-button {
    background: transparent;
    border: 1px solid rgba(148, 163, 184, 0.4);
    color: #e2e8f0;
  }

  .primary-button:disabled,
  .secondary-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }

  .primary-button:not(:disabled):hover,
  .secondary-button:not(:disabled):hover,
  .ghost-button:hover {
    transform: translateY(-2px);
  }

  .duel-results {
    text-align: center;
    padding: 1.5rem;
    border-radius: 1rem;
    background: rgba(15, 23, 42, 0.7);
    margin-bottom: 1.5rem;
    border: 1px solid transparent;
  }

  .duel-results.win {
    border: 1px solid rgba(34, 197, 94, 0.4);
  }

  .duel-results.loss {
    border: 1px solid rgba(248, 113, 113, 0.4);
  }

  .duel-results h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .duel-log {
    background: rgba(15, 23, 42, 0.7);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .log-entries {
    max-height: 240px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: #e2e8f0;
  }

  .log-entry {
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    background: rgba(30, 41, 59, 0.6);
    font-size: 0.9rem;
  }

  .card-picker {
    background: rgba(15, 23, 42, 0.6);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid rgba(148, 163, 184, 0.15);
  }

  .card-picker h3 {
    margin-bottom: 1rem;
    font-weight: 700;
  }

  .picker-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.75rem;
    max-height: 360px;
    overflow-y: auto;
  }

  .picker-card {
    border: 2px solid transparent;
    border-radius: 0.75rem;
    padding: 0.75rem;
    background: rgba(15, 23, 42, 0.8);
    color: #e2e8f0;
    text-align: left;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    cursor: pointer;
  }

  .picker-card:hover {
    border-color: rgba(251, 191, 36, 0.35);
  }

  .picker-card.selected {
    box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.6);
  }

  .picker-card:hover {
    transform: translateY(-2px);
  }

  .picker-name {
    display: block;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .picker-rarity {
    font-size: 0.75rem;
    font-weight: 600;
  }

  @keyframes pulse-glow {
    0%, 100% {
      opacity: 0.7;
      transform: scale(0.9);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
  }

  @media (max-width: 720px) {
    .duel-stage {
      padding: 1.5rem;
    }

    .duel-divider {
      font-size: 1.25rem;
    }
  }
</style>
