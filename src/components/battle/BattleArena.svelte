<script lang="ts">
  import { onMount } from 'svelte';
  import {
    battleMode,
    battleState,
    selectedCards,
    currentBattle,
    playerTeam,
    opponentTeam,
    rankedData,
    selectBattleCards,
    startBattle,
    resetBattle,
    setBattleMode,
    clearSelectedCards,
    getSelectedCards,
    hasSelectedCards,
    isBattling,
    getRankedTierInfo,
    getBattleStats,
  } from '../../stores/battle';
  import { collection } from '../../stores/collection';
  import type { PackCard, BattleMode } from '@/types';
  import { RARITY_CONFIG } from '@/types';

  // Reactive state
  let currentMode = $state(battleMode.get());
  let currentState = $state(battleState.get());
  let cards = $state(selectedCards.get());
  let battleResult = $state(currentBattle.get());
  let player = $state(playerTeam.get());
  let opponent = $state(opponentTeam.get());
  let ranked = $state(rankedData.get());

  // Local UI state
  let battleLog: string[] = [];
  let currentTurn = 0;
  let battleTimer: number | null = null;

  // Get all opened pack cards for selection
  let availableCards: PackCard[] = [];
  $effect(() => {
    const collectionData = collection.get();
    const allCards: PackCard[] = [];
    for (const pack of collectionData.packs) {
      allCards.push(...pack.cards);
    }
    availableCards = allCards;
  });

  // Battle statistics
  let stats = $state(getBattleStats());

  // Sync stores
  $effect(() => {
    currentMode = battleMode.get();
    currentState = battleState.get();
    cards = selectedCards.get();
    battleResult = currentBattle.get();
    player = playerTeam.get();
    opponent = opponentTeam.get();
    ranked = rankedData.get();
    stats = getBattleStats();
  });

  onMount(() => {
    // Load from collection on mount
  });

  // Toggle card selection
  function toggleCard(card: PackCard) {
    const current = getSelectedCards();
    const isSelected = current.some(c => c.id === card.id);

    if (isSelected) {
      // Remove from selection
      clearSelectedCards();
      const newSelection = current.filter(c => c.id !== card.id);
      selectBattleCards(newSelection);
    } else if (current.length < 3) {
      // Add to selection
      selectBattleCards([...current, card]);
    }
  }

  // Start the battle
  async function handleStartBattle() {
    if (!hasSelectedCards()) return;

    const result = await startBattle(currentMode);

    if (result.success) {
      // Start animation timer
      startBattleAnimation();
    }
  }

  // Animate battle (10 seconds total)
  function startBattleAnimation() {
    battleLog = [];
    currentTurn = 0;

    const result = currentBattle.get();
    if (!result) return;

    // Display battle log entries with delay
    const totalDuration = 10000; // 10 seconds
    const turnDuration = totalDuration / result.turns;

    battleTimer = window.setInterval(() => {
      currentTurn++;

      // Get logs for this turn
      const turnLogs = result.battleLog.filter(log => log.turn === currentTurn);
      for (const log of turnLogs) {
        battleLog.push(log.description);
      }

      if (currentTurn >= result.turns) {
        clearInterval(battleTimer!);
      }
    }, turnDuration);
  }

  // Reset for new battle
  function handleNewBattle() {
    resetBattle();
    battleLog = [];
    currentTurn = 0;
  }

  function isSelected(card: PackCard): boolean {
    return cards.some(c => c.id === card.id);
  }

  function getRarityColor(rarity: string) {
    return RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG]?.color || '#9ca3af';
  }

  // Computed helpers
  let canStartBattle = $derived(cards.length === 3);
  let hasEnoughCards = $derived(availableCards.length >= 3);

  // Tier info
  let tierInfo = $derived.by(() => {
    if (!ranked) return { color: '#cd7f32', icon: '🥉', name: 'Bronze' };
    const configs: Record<string, { color: string; icon: string; name: string }> = {
      bronze: { color: '#cd7f32', icon: '🥉', name: 'Bronze' },
      silver: { color: '#c0c0c0', icon: '🥈', name: 'Silver' },
      gold: { color: '#ffd700', icon: '🥇', name: 'Gold' },
      platinum: { color: '#e5e4e2', icon: '💎', name: 'Platinum' },
      diamond: { color: '#b9f2ff', icon: '💠', name: 'Diamond' },
      champion: { color: '#ff6b6b', icon: '👑', name: 'Champion' },
    };
    return configs[ranked.currentTier] || configs.bronze;
  });
</script>

<div class="battle-container">
  <!-- Header -->
  <div class="battle-header">
    <h1 class="battle-title">⚔️ Card Battles</h1>
    <p class="battle-subtitle">Use your collection to battle in auto-combat!</p>
  </div>

  <!-- Mode Selection -->
  {#if currentState === 'idle'}
    <div class="mode-selection">
      <div class="mode-toggle">
        <button
          class="mode-button"
          class:active={currentMode === 'casual'}
          on:click={() => setBattleMode('casual')}
        >
          🎮 Casual
        </button>
        <button
          class="mode-button ranked"
          class:active={currentMode === 'ranked'}
          on:click={() => setBattleMode('ranked')}
        >
          🏆 Ranked
        </button>
      </div>

      {#if currentMode === 'ranked' && ranked}
        <div class="ranked-display" style:color={tierInfo.color}>
          <span class="tier-icon">{tierInfo.icon}</span>
          <span class="tier-name">{tierInfo.name}</span>
          <span class="rank-info">Rank #{ranked.currentRank}</span>
          <span class="rank-points">{ranked.rankPoints} pts</span>
        </div>
        <div class="ranked-stats">
          <span>W: {ranked.wins}</span>
          <span>L: {ranked.losses}</span>
          <span>WR: {ranked.winRate}%</span>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Card Selection Phase -->
  {#if currentState === 'idle'}
    <div class="selection-phase">
      <h2>Select 3 Cards for Battle</h2>
      <p class="selection-hint">Choose wisely - stats and rarities determine battle outcome!</p>

      <div class="selection-status">
        <span class:selected={cards.length >= 1} class:slot-empty={cards.length < 1}>Slot 1</span>
        <span class:selected={cards.length >= 2} class:slot-empty={cards.length < 2}>Slot 2</span>
        <span class:selected={cards.length >= 3} class:slot-empty={cards.length < 3}>Slot 3</span>
      </div>

      {#if !hasEnoughCards}
        <div class="no-cards-message">
          <p>Open more packs to get cards for battle!</p>
          <a href="/pack" class="cta-button">Open Packs</a>
        </div>
      {:else}
        <div class="card-grid">
          {#each availableCards as card (card.id)}
            <div
              class="battle-card selectable"
              class:selected={isSelected(card)}
              on:click={() => toggleCard(card)}
              style:border-color={getRarityColor(card.rarity)}
            >
              <div class="card-image" style:background={getRarityColor(card.rarity)}></div>
              <div class="card-info">
                <span class="card-name">{card.name}</span>
                <span class="card-rarity" style:color={getRarityColor(card.rarity)}>
                  {RARITY_CONFIG[card.rarity].name}
                </span>
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <div class="battle-actions">
        <button
          class="start-button"
          disabled={!canStartBattle}
          on:click={handleStartBattle}
        >
          ⚔️ Start Battle
        </button>
      </div>
    </div>
  {/if}

  <!-- Battle Phase -->
  {#if currentState === 'battling'}
    <div class="battle-phase">
      <div class="battle-arena">
        <!-- Player Team -->
        <div class="team player-team">
          <h3>Your Team</h3>
          <div class="team-cards">
            {#each player?.cards || [] as card (card.card.id)}
              <div
                class="battle-card"
                class:alive={card.isAlive}
                class:dead={!card.isAlive}
                style:border-color={getRarityColor(card.card.rarity)}
              >
                <div class="card-name">{card.card.name}</div>
                <div class="hp-bar">
                  <div
                    class="hp-fill"
                    style:width={(card.currentHP / card.maxHP * 100) + '%'}
                    style:background={getRarityColor(card.card.rarity)}
                  ></div>
                </div>
                <div class="hp-text">{card.currentHP}/{card.maxHP}</div>
              </div>
            {/each}
          </div>
        </div>

        <!-- VS -->
        <div class="vs-divider">
          <span class="vs-text">VS</span>
          <div class="battle-timer">Turn {currentTurn}</div>
        </div>

        <!-- Opponent Team -->
        <div class="team opponent-team">
          <h3>Opponent Team</h3>
          <div class="team-cards">
            {#each opponent?.cards || [] as card (card.card.id)}
              <div
                class="battle-card"
                class:alive={card.isAlive}
                class:dead={!card.isAlive}
                style:border-color={getRarityColor(card.card.rarity)}
              >
                <div class="card-name">{card.card.name}</div>
                <div class="hp-bar">
                  <div
                    class="hp-fill"
                    style:width={(card.currentHP / card.maxHP * 100) + '%'}
                    style:background={getRarityColor(card.card.rarity)}
                  ></div>
                </div>
                <div class="hp-text">{card.currentHP}/{card.maxHP}</div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Battle Log -->
      <div class="battle-log">
        <h4>Battle Log</h4>
        <div class="log-entries">
          {#each battleLog as entry}
            <div class="log-entry">{entry}</div>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Results Phase -->
  {#if currentState === 'completed' && battleResult}
    <div class="results-phase">
      <div class="result-header" class:winner={battleResult.winner === 'player'} class:loser={battleResult.winner === 'opponent'}>
        {#if battleResult.winner === 'player'}
          <h2>🏆 VICTORY!</h2>
          <p>Your dads dominated the suburbs!</p>
        {:else if battleResult.winner === 'opponent'}
          <h2>💀 DEFEAT!</h2>
          <p>Your dads were out-dad-ed!</p>
        {:else}
          <h2>🤝 DRAW!</h2>
          <p>An evenly matched battle!</p>
        {/if}
      </div>

      {#if battleResult.rewards && currentMode === 'ranked'}
        <div class="rewards">
          <h3>Rewards</h3>
          <div class="reward-item">
            <span class="reward-label">XP:</span>
            <span class="reward-value">+{battleResult.rewards.xp}</span>
          </div>
          <div class="reward-item" class:positive={battleResult.rewards.rankPoints > 0} class:negative={battleResult.rewards.rankPoints < 0}>
            <span class="reward-label">Rank Points:</span>
            <span class="reward-value">{battleResult.rewards.rankPoints > 0 ? '+' : ''}{battleResult.rewards.rankPoints}</span>
          </div>
        </div>
      {/if}

      <div class="battle-stats">
        <p>Battle lasted {battleResult.turns} turns</p>
        <p>Duration: {Math.round(battleResult.duration / 1000)}s</p>
      </div>

      <div class="battle-actions">
        <button class="secondary-button" on:click={handleNewBattle}>
          New Battle
        </button>
      </div>

      <!-- Full Battle Log -->
      <div class="full-battle-log">
        <h4>Battle Log</h4>
        {#each battleResult.battleLog as entry}
          <div class="log-entry">{entry.description}</div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Stats Panel -->
  {#if currentState === 'idle'}
    <div class="stats-panel">
      <h3>Battle Statistics</h3>
      <div class="stat-grid">
        <div class="stat-item">
          <span class="stat-label">Total Battles</span>
          <span class="stat-value">{stats.totalBattles}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Wins</span>
          <span class="stat-value win">{stats.wins}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Losses</span>
          <span class="stat-value loss">{stats.losses}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Win Rate</span>
          <span class="stat-value">{stats.winRate}%</span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .battle-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .battle-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .battle-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
  }

  .battle-subtitle {
    color: #94a3b8;
    font-size: 1.1rem;
  }

  .mode-selection {
    background: rgba(30, 41, 59, 0.5);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    text-align: center;
  }

  .mode-toggle {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .mode-button {
    padding: 0.75rem 2rem;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    background: #334155;
    color: #94a3b8;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
  }

  .mode-button:hover {
    background: #475569;
  }

  .mode-button.active {
    background: #fbbf24;
    color: #0f172a;
    border-color: #fbbf24;
  }

  .mode-button.ranked.active {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
  }

  .ranked-display {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .tier-icon {
    font-size: 2rem;
  }

  .tier-name {
    font-size: 1.25rem;
  }

  .ranked-stats {
    display: flex;
    gap: 1rem;
    justify-content: center;
    color: #94a3b8;
    font-size: 0.875rem;
  }

  .selection-phase {
    background: rgba(30, 41, 59, 0.5);
    border-radius: 1rem;
    padding: 2rem;
  }

  .selection-phase h2 {
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .selection-hint {
    text-align: center;
    color: #94a3b8;
    margin-bottom: 1.5rem;
  }

  .selection-status {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .selection-status span {
    padding: 0.5rem 1.5rem;
    border-radius: 2rem;
    background: #334155;
    color: #94a3b8;
    font-weight: 600;
  }

  .selection-status span.selected {
    background: #22c55e;
    color: white;
  }

  .no-cards-message {
    text-align: center;
    padding: 3rem;
    color: #94a3b8;
  }

  .cta-button {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #0f172a;
    border-radius: 0.5rem;
    font-weight: 700;
    text-decoration: none;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
    max-height: 400px;
    overflow-y: auto;
    padding: 1rem;
  }

  .battle-card {
    border: 3px solid;
    border-radius: 0.75rem;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    background: rgba(15, 23, 42, 0.8);
  }

  .battle-card.selectable:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  }

  .battle-card.selectable.selected {
    background: rgba(34, 197, 94, 0.2);
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
  }

  .card-image {
    width: 100%;
    aspect-ratio: 3/4;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .card-info {
    text-align: center;
  }

  .card-name {
    font-weight: 600;
    display: block;
    margin-bottom: 0.25rem;
  }

  .card-rarity {
    font-size: 0.75rem;
    font-weight: 500;
  }

  .battle-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .start-button,
  .secondary-button {
    padding: 1rem 3rem;
    border-radius: 0.75rem;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  .start-button {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #0f172a;
  }

  .start-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
  }

  .start-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .secondary-button {
    background: #334155;
    color: #f8fafc;
  }

  .secondary-button:hover {
    background: #475569;
  }

  .battle-arena {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 2rem;
    align-items: center;
    background: rgba(30, 41, 59, 0.5);
    border-radius: 1rem;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .team {
    text-align: center;
  }

  .team h3 {
    margin-bottom: 1rem;
  }

  .team-cards {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .battle-card {
    padding: 1rem;
    border-radius: 0.5rem;
    background: rgba(15, 23, 42, 0.8);
    transition: all 0.3s;
  }

  .battle-card.alive {
    opacity: 1;
  }

  .battle-card.dead {
    opacity: 0.4;
    filter: grayscale(100%);
  }

  .hp-bar {
    height: 8px;
    background: #1e293b;
    border-radius: 4px;
    overflow: hidden;
    margin: 0.5rem 0;
  }

  .hp-fill {
    height: 100%;
    transition: width 0.3s;
  }

  .hp-text {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .vs-divider {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .vs-text {
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .battle-timer {
    font-size: 1.25rem;
    color: #94a3b8;
  }

  .battle-log {
    background: rgba(15, 23, 42, 0.8);
    border-radius: 1rem;
    padding: 1.5rem;
    max-height: 300px;
    overflow-y: auto;
  }

  .battle-log h4 {
    margin-bottom: 1rem;
  }

  .log-entry {
    padding: 0.5rem;
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
    font-size: 0.875rem;
  }

  .results-phase {
    background: rgba(30, 41, 59, 0.5);
    border-radius: 1rem;
    padding: 2rem;
    text-align: center;
  }

  .result-header {
    padding: 2rem;
    border-radius: 1rem;
    margin-bottom: 2rem;
  }

  .result-header.winner {
    background: rgba(34, 197, 94, 0.2);
    border: 2px solid #22c55e;
  }

  .result-header.loser {
    background: rgba(239, 68, 68, 0.2);
    border: 2px solid #ef4444;
  }

  .result-header h2 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .rewards {
    background: rgba(251, 191, 36, 0.1);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    display: inline-block;
  }

  .reward-item {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin: 0.5rem 0;
    font-weight: 600;
  }

  .reward-item.positive {
    color: #22c55e;
  }

  .reward-item.negative {
    color: #ef4444;
  }

  .full-battle-log {
    margin-top: 2rem;
    text-align: left;
  }

  .stats-panel {
    background: rgba(30, 41, 59, 0.5);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-top: 2rem;
  }

  .stats-panel h3 {
    margin-bottom: 1rem;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }

  .stat-item {
    text-align: center;
    padding: 1rem;
    background: rgba(15, 23, 42, 0.5);
    border-radius: 0.5rem;
  }

  .stat-label {
    display: block;
    font-size: 0.75rem;
    color: #94a3b8;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .stat-value.win {
    color: #22c55e;
  }

  .stat-value.loss {
    color: #ef4444;
  }

  @media (max-width: 768px) {
    .battle-arena {
      grid-template-columns: 1fr;
    }

    .stat-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .mode-toggle {
      flex-direction: column;
    }
  }
</style>
