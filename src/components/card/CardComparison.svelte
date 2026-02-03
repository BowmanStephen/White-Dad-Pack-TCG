<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { PackCard, CardStats } from '@/types';
  import { RARITY_CONFIG, STAT_NAMES, STAT_ICONS } from '@/types';
  import Card from '@components/card/Card.svelte';

  interface Props {
    card1?: PackCard | null;
    card2?: PackCard | null;
    isOpen?: boolean;
  }

  let {
    card1 = null,
    card2 = null,
    isOpen = false,
  }: Props = $props();

  const dispatch = createEventDispatcher();

  // Close the comparison modal
  export function close() {
    dispatch('close');
  }

  // Calculate total score for a card (sum of all stats)
  function calculateTotalScore(card: PackCard): number {
    return Object.values(card.stats).reduce((sum, value) => sum + value, 0);
  }

  // Determine which card wins a specific stat
  // Returns: 1 if card1 wins, 2 if card2 wins, 0 if tie
  function getStatWinner(statKey: keyof CardStats): number {
    if (!card1 || !card2) return 0;
    const val1 = card1.stats[statKey];
    const val2 = card2.stats[statKey];
    if (val1 > val2) return 1;
    if (val2 > val1) return 2;
    return 0;
  }

  // Determine overall winner based on total score
  function getOverallWinner(): number {
    if (!card1 || !card2) return 0;
    const score1 = calculateTotalScore(card1);
    const score2 = calculateTotalScore(card2);
    if (score1 > score2) return 1;
    if (score2 > score1) return 2;
    return 0;
  }

  // Get all stat keys for iteration
  const statKeys: (keyof CardStats)[] = Object.keys(STAT_NAMES) as (keyof CardStats)[];

  // Calculate winner counts
  const card1Wins = $derived(card1 && card2 ? statKeys.filter(k => getStatWinner(k) === 1).length : 0);
  const card2Wins = $derived(card1 && card2 ? statKeys.filter(k => getStatWinner(k) === 2).length : 0);
  const ties = $derived(card1 && card2 ? statKeys.filter(k => getStatWinner(k) === 0).length : 0);

  // Overall winner
  const overallWinner = $derived(getOverallWinner());

  // Total scores
  const totalScore1 = $derived(card1 ? calculateTotalScore(card1) : 0);
  const totalScore2 = $derived(card2 ? calculateTotalScore(card2) : 0);
</script>

{#if isOpen && card1 && card2}
  <div class="comparison-overlay" role="dialog" aria-modal="true" aria-labelledby="comparison-title" tabindex="-1">
    <button class="comparison-overlay-button" onclick={close} aria-label="Close comparison" type="button"></button>
    <div class="comparison-content">
      <!-- Header -->
      <div class="comparison-header">
        <h2 id="comparison-title" class="comparison-title">⚔️ Card Comparison</h2>
        <button class="close-button" onclick={close} aria-label="Close comparison" type="button">✕</button>
      </div>

      <!-- Overall Winner Banner -->
      <div class="winner-banner" class:winner-1={overallWinner === 1} class:winner-2={overallWinner === 2} class:tied={overallWinner === 0}>
        {#if overallWinner === 1}
          <div class="winner-content">
            <span class="winner-icon">🏆</span>
            <span class="winner-text">
              <strong>{card1.name}</strong> wins by {totalScore1 - totalScore2} points!
            </span>
          </div>
        {:else if overallWinner === 2}
          <div class="winner-content">
            <span class="winner-icon">🏆</span>
            <span class="winner-text">
              <strong>{card2.name}</strong> wins by {totalScore2 - totalScore1} points!
            </span>
          </div>
        {:else}
          <div class="winner-content">
            <span class="winner-icon">🤝</span>
            <span class="winner-text">It's a tie! Both cards have {totalScore1} total points.</span>
          </div>
        {/if}
      </div>

      <!-- Stats Summary -->
      <div class="stats-summary">
        <div class="summary-card summary-1">
          <div class="summary-label">{card1.name}</div>
          <div class="summary-stats">
            <span class="wins">{card1Wins} wins</span>
            <span class="ties">{ties} ties</span>
          </div>
        </div>
        <div class="summary-divider">VS</div>
        <div class="summary-card summary-2">
          <div class="summary-label">{card2.name}</div>
          <div class="summary-stats">
            <span class="wins">{card2Wins} wins</span>
            <span class="ties">{ties} ties</span>
          </div>
        </div>
      </div>

      <!-- Cards Display -->
      <div class="cards-display">
        <div class="card-column">
          <div class="card-header">
            <span class="card-rarity" style="color: {RARITY_CONFIG[card1.rarity].color}">
              {RARITY_CONFIG[card1.rarity].name}
            </span>
            <span class="card-score">{totalScore1} pts</span>
          </div>
          <Card
            card={card1}
            size="sm"
            interactive={false}
            isFlipped={false}
            showBack={false}
            enableShare={false}
          />
        </div>

        <div class="card-column">
          <div class="card-header">
            <span class="card-rarity" style="color: {RARITY_CONFIG[card2.rarity].color}">
              {RARITY_CONFIG[card2.rarity].name}
            </span>
            <span class="card-score">{totalScore2} pts</span>
          </div>
          <Card
            card={card2}
            size="sm"
            interactive={false}
            isFlipped={false}
            showBack={false}
            enableShare={false}
          />
        </div>
      </div>

      <!-- Stats Comparison Table -->
      <div class="stats-table">
        <h3 class="table-title">Stat-by-Stat Breakdown</h3>

        {#each statKeys as statKey}
          {@const winner = getStatWinner(statKey)}
          {@const statName = STAT_NAMES[statKey]}
          {@const statIcon = STAT_ICONS[statKey]}
          {@const value1 = card1.stats[statKey]}
          {@const value2 = card2.stats[statKey]}
          {@const percent1 = value1}
          {@const percent2 = value2}

          <div class="stat-row" class:winner-1={winner === 1} class:winner-2={winner === 2} class:tied={winner === 0}>
            <div class="stat-label">
              <span class="stat-icon">{statIcon}</span>
              <span class="stat-name">{statName}</span>
            </div>

            <div class="stat-bars">
              <!-- Card 1 Bar -->
              <div class="stat-bar-container">
                <div
                  class="stat-bar bar-1"
                  class:winner={winner === 1}
                  class:loser={winner === 2}
                  style="width: {percent1}%"
                  role="progressbar"
                  aria-label="{card1.name} {statName}: {value1}"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={value1}
                >
                  <span class="stat-value">{value1}</span>
                </div>
              </div>

              <!-- VS Badge -->
              <div class="vs-badge" aria-hidden="true">
                {#if winner === 1}
                  <span class="winner-badge">W</span>
                {:else if winner === 2}
                  <span class="loser-badge">L</span>
                {:else}
                  <span class="tie-badge">T</span>
                {/if}
              </div>

              <!-- Card 2 Bar -->
              <div class="stat-bar-container">
                <div
                  class="stat-bar bar-2"
                  class:winner={winner === 2}
                  class:loser={winner === 1}
                  style="width: {percent2}%"
                  role="progressbar"
                  aria-label="{card2.name} {statName}: {value2}"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={value2}
                >
                  <span class="stat-value">{value2}</span>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Footer Actions -->
      <div class="comparison-footer">
        <button class="btn btn-secondary" onclick={close} aria-label="Close card comparison dialog" type="button">Close Comparison</button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Overlay */
  .comparison-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    animation: fadeIn 0.2s ease;
  }

  .comparison-overlay-button {
    position: absolute;
    inset: 0;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* Content */
  .comparison-content {
    position: relative;
    z-index: 1;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 1rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    width: 100%;
    max-width: 900px;
    max-height: 95vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Header */
  .comparison-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
    background: rgba(15, 23, 42, 0.6);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .comparison-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: white;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .close-button {
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem;
    line-height: 1;
    transition: color 0.2s ease;
  }

  .close-button:hover {
    color: white;
  }

  /* Winner Banner */
  .winner-banner {
    padding: 1rem 1.5rem;
    text-align: center;
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
    background: rgba(30, 41, 59, 0.6);
  }

  .winner-banner.winner-1 {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1));
    border-color: rgba(34, 197, 94, 0.3);
  }

  .winner-banner.winner-2 {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
    border-color: rgba(59, 130, 246, 0.3);
  }

  .winner-banner.tied {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.1));
    border-color: rgba(251, 191, 36, 0.3);
  }

  .winner-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  .winner-icon {
    font-size: 1.5rem;
  }

  .winner-text {
    font-size: 0.9375rem;
    color: white;
  }

  /* Stats Summary */
  .stats-summary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: rgba(15, 23, 42, 0.6);
  }

  .summary-card {
    flex: 1;
    text-align: center;
    padding: 0.75rem;
    border-radius: 0.5rem;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(71, 85, 105, 0.3);
  }

  .summary-card.summary-1 {
    border-color: rgba(34, 197, 94, 0.3);
  }

  .summary-card.summary-2 {
    border-color: rgba(59, 130, 246, 0.3);
  }

  .summary-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #94a3b8;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .summary-stats {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    font-size: 0.8125rem;
  }

  .summary-stats .wins {
    color: #22c55e;
    font-weight: 700;
  }

  .summary-stats .ties {
    color: #fbbf24;
  }

  .summary-divider {
    font-size: 0.875rem;
    font-weight: 700;
    color: #fbbf24;
    padding: 0 0.5rem;
  }

  /* Cards Display */
  .cards-display {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
    justify-items: center;
    background: rgba(15, 23, 42, 0.4);
  }

  .card-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 200px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .card-rarity {
    color: #fbbf24;
  }

  .card-score {
    background: rgba(251, 191, 36, 0.2);
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    color: #fbbf24;
  }

  /* Stats Table */
  .stats-table {
    padding: 1.5rem;
    background: rgba(15, 23, 42, 0.6);
  }

  .table-title {
    font-size: 1rem;
    font-weight: 700;
    color: white;
    margin: 0 0 1rem 0;
    text-align: center;
  }

  .stat-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    transition: all 0.2s;
  }

  .stat-row.winner-1 {
    border-color: rgba(34, 197, 94, 0.5);
    background: rgba(34, 197, 94, 0.1);
  }

  .stat-row.winner-2 {
    border-color: rgba(59, 130, 246, 0.5);
    background: rgba(59, 130, 246, 0.1);
  }

  .stat-row.tied {
    border-color: rgba(251, 191, 36, 0.5);
    background: rgba(251, 191, 36, 0.1);
  }

  .stat-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: #94a3b8;
  }

  .stat-icon {
    font-size: 1rem;
  }

  .stat-name {
    flex: 1;
  }

  .stat-bars {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .stat-bar-container {
    flex: 1;
  }

  .stat-bar {
    position: relative;
    height: 24px;
    border-radius: 0.375rem;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 0.5rem;
    transition: all 0.3s ease;
    min-width: 30px;
  }

  .stat-bar.bar-1 {
    background: linear-gradient(90deg, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.6));
    border: 1px solid rgba(34, 197, 94, 0.5);
    justify-content: flex-start;
    padding-left: 0.5rem;
  }

  .stat-bar.bar-2 {
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.6));
    border: 1px solid rgba(59, 130, 246, 0.5);
  }

  .stat-bar.winner {
    box-shadow: 0 0 10px currentColor;
  }

  .stat-bar.bar-1.winner {
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
  }

  .stat-bar.bar-2.winner {
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
  }

  .stat-bar.loser {
    opacity: 0.6;
  }

  .stat-value {
    font-size: 0.75rem;
    font-weight: 700;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  .vs-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
  }

  .winner-badge,
  .loser-badge,
  .tie-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .winner-badge {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
  }

  .loser-badge {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
  }

  .tie-badge {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: white;
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
  }

  /* Footer */
  .comparison-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(71, 85, 105, 0.3);
    background: rgba(15, 23, 42, 0.6);
    display: flex;
    justify-content: center;
  }

  .btn {
    padding: 0.625rem 1.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 0.5rem;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-secondary {
    background: rgba(30, 41, 59, 0.8);
    color: #94a3b8;
    border-color: rgba(71, 85, 105, 0.5);
  }

  .btn-secondary:hover {
    background: rgba(51, 65, 85, 0.8);
    border-color: rgba(100, 116, 139, 0.5);
    color: white;
  }

  /* Scrollbar styling */
  .comparison-content::-webkit-scrollbar {
    width: 8px;
  }

  .comparison-content::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.6);
  }

  .comparison-content::-webkit-scrollbar-thumb {
    background: rgba(71, 85, 105, 0.5);
    border-radius: 4px;
  }

  .comparison-content::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 116, 139, 0.5);
  }

  /* Responsive */
  @media (max-width: 640px) {
    .cards-display {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .stat-bars {
      flex-wrap: wrap;
    }

    .stat-bar-container {
      min-width: 120px;
    }

    .vs-badge {
      order: 3;
      width: 100%;
      margin-top: 0.25rem;
    }

    .stats-summary {
      flex-direction: column;
      gap: 0.5rem;
    }

    .summary-divider {
      transform: rotate(90deg);
      padding: 0.25rem;
    }
  }
</style>
