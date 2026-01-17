<script lang="ts">
  import { getCollectionStats, collection } from '../../stores/collection';
  import { RARITY_CONFIG, type Rarity } from '../../types';
  import { getCardCount } from '../../lib/cards/database';

  // Total unique cards in the database
  const TOTAL_UNIQUE_CARDS = getCardCount();

  // Reactive stats from collection
  let stats = $derived(getCollectionStats());

  // Compute rarity counts from all packs
  function getRarityCounts(): Record<Rarity, number> {
    const current = collection.get();
    const counts: Record<Rarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
    };

    for (const pack of current.packs) {
      for (const card of pack.cards) {
        counts[card.rarity]++;
      }
    }

    return counts;
  }

  // Reactive rarity counts
  let rarityCounts = $derived(getRarityCounts());

  // Completion percentage
  let completionPercent = $derived(
    TOTAL_UNIQUE_CARDS > 0 ? Math.round((stats.uniqueCards / TOTAL_UNIQUE_CARDS) * 100) : 0
  );

  // Format rarity breakdown string
  function formatRarityBreakdown(): string {
    const parts: string[] = [];
    const rarities: Rarity[] = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];

    for (const rarity of rarities) {
      const count = rarityCounts[rarity];
      if (count > 0) {
        parts.push(`${count} ${RARITY_CONFIG[rarity].name}`);
      }
    }

    if (parts.length === 0) {
      return 'No cards yet';
    }

    // Join with commas, use 'and' before last item
    if (parts.length === 1) {
      return parts[0];
    } else if (parts.length === 2) {
      return parts.join(' and ');
    } else {
      return parts.slice(0, -1).join(', ') + ', and ' + parts[parts.length - 1];
    }
  }

  // Get all rarities for iteration (in display order)
  const displayRarities: Rarity[] = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
</script>

<!-- Stats Header -->
<div class="stats-header">
  <!-- Main Message -->
  <div class="stats-message">
    <h2 class="stats-title">
      You own <span class="highlight">{stats.uniqueCards}</span> unique cards from{' '}
      <span class="highlight">{stats.totalPacks}</span> pack{stats.totalPacks !== 1 ? 's' : ''}
    </h2>
    <p class="stats-subtitle">
      {formatRarityBreakdown()}
    </p>
  </div>

  <!-- Stats Grid -->
  <div class="stats-grid">
    <!-- Total Cards -->
    <div class="stat-card">
      <div class="stat-icon">🃏</div>
      <div class="stat-info">
        <span class="stat-value">{stats.totalCards}</span>
        <span class="stat-label">Total Cards</span>
      </div>
    </div>

    <!-- Completion -->
    <div class="stat-card completion">
      <div class="stat-icon">📊</div>
      <div class="stat-info">
        <span class="stat-value">{stats.uniqueCards}/{TOTAL_UNIQUE_CARDS}</span>
        <span class="stat-label">Collected ({completionPercent}%)</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: {completionPercent}%"></div>
      </div>
    </div>

    <!-- Rare+ Pulls -->
    <div class="stat-card">
      <div class="stat-icon">✨</div>
      <div class="stat-info">
        <span class="stat-value">{stats.rarePulls + stats.epicPulls + stats.legendaryPulls + stats.mythicPulls}</span>
        <span class="stat-label">Rare+ Pulls</span>
      </div>
    </div>

    <!-- Holo Pulls -->
    <div class="stat-card">
      <div class="stat-icon">🌈</div>
      <div class="stat-info">
        <span class="stat-value">{stats.holoPulls}</span>
        <span class="stat-label">Holo Pulls</span>
      </div>
    </div>
  </div>

  <!-- Rarity Breakdown -->
  <div class="rarity-breakdown">
    <h3 class="rarity-title">Rarity Breakdown</h3>
    <div class="rarity-list">
      {#each displayRarities as rarity}
        {@const count = rarityCounts[rarity]}
        {@const config = RARITY_CONFIG[rarity]}
        <div class="rarity-item" style="--rarity-color: {config.color}">
          <div class="rarity-dot" style="background: {config.color}"></div>
          <span class="rarity-name">{config.name}</span>
          <span class="rarity-count">{count}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .stats-header {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem 1rem;
    background: linear-gradient(
      135deg,
      rgba(15, 23, 42, 0.9) 0%,
      rgba(30, 41, 59, 0.8) 100%
    );
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 1rem;
    backdrop-filter: blur(12px);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }

  /* Main Message */
  .stats-message {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(71, 85, 105, 0.2);
  }

  .stats-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin: 0 0 0.75rem 0;
    line-height: 1.4;
  }

  .stats-title .highlight {
    color: #fbbf24;
    text-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
  }

  .stats-subtitle {
    font-size: 1rem;
    color: #94a3b8;
    margin: 0;
    line-height: 1.5;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  @media (min-width: 640px) {
    .stats-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.75rem;
    transition: all 0.3s ease;
  }

  .stat-card:hover {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(251, 191, 36, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .stat-card.completion {
    flex-direction: column;
    align-items: stretch;
  }

  .stat-icon {
    font-size: 2rem;
    line-height: 1;
    flex-shrink: 0;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
  }

  .stat-card.completion .stat-info {
    align-items: center;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fbbf24;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Progress Bar */
  .progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(15, 23, 42, 0.8);
    border-radius: 3px;
    overflow: hidden;
    margin-top: 0.5rem;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #f59e0b, #fbbf24, #fcd34d);
    border-radius: 3px;
    transition: width 0.5s ease-out;
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
  }

  /* Rarity Breakdown */
  .rarity-breakdown {
    background: rgba(15, 23, 42, 0.4);
    border: 1px solid rgba(71, 85, 105, 0.2);
    border-radius: 0.75rem;
    padding: 1.25rem;
  }

  .rarity-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
    margin: 0 0 1rem 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .rarity-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  @media (min-width: 640px) {
    .rarity-list {
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
  }

  @media (min-width: 768px) {
    .rarity-list {
      grid-template-columns: repeat(6, 1fr);
    }
  }

  .rarity-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
    transition: all 0.2s ease;
  }

  .rarity-item:hover {
    background: rgba(51, 65, 85, 0.8);
    border-color: var(--rarity-color, #fbbf24);
    box-shadow: 0 0 12px var(--rarity-color, rgba(251, 191, 36, 0.2));
  }

  .rarity-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 0 8px currentColor;
  }

  .rarity-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: #94a3b8;
    flex: 1;
  }

  .rarity-count {
    font-size: 0.875rem;
    font-weight: 700;
    color: white;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .stats-header {
      padding: 1rem;
    }

    .stats-title {
      font-size: 1.25rem;
    }

    .stats-subtitle {
      font-size: 0.875rem;
    }

    .stat-value {
      font-size: 1.25rem;
    }

    .stat-icon {
      font-size: 1.5rem;
    }
  }
</style>
