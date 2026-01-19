<script lang="ts">
  import { getCollectionStats, collection } from '../../stores/collection';
  import { RARITY_CONFIG, type Rarity, type DadType, DAD_TYPE_NAMES, DAD_TYPE_ICONS } from '../../types';
  import { getCardCount } from '../../lib/cards/database';
  import { DEFAULT_PACK_CONFIG } from '../../lib/pack/generator';
  import { DAD_TYPE_COLORS } from '../../lib/art/dad-type-colors';
  import {
    formatCardCount,
    formatPackCount,
    formatPercentage,
    formatLuckPercentage,
  } from '../../lib/utils/formatters';
  import {
    getUniqueCardsWithCounts,
    calculateCollectionValue,
    formatCollectionValue,
    getValueBreakdownByRarity,
  } from '../../lib/collection/utils';

  // Create a combined config object for dad types
  const DAD_TYPE_CONFIG: Record<DadType, { name: string; emoji: string; color: string }> = Object.keys(DAD_TYPE_NAMES).reduce((acc, type) => {
    const dadType = type as DadType;
    acc[dadType] = {
      name: DAD_TYPE_NAMES[dadType],
      emoji: DAD_TYPE_ICONS[dadType],
      color: DAD_TYPE_COLORS[dadType].primary,
    };
    return acc;
  }, {} as Record<DadType, { name: string; emoji: string; color: string }>);

  // Total unique cards in the database
  const TOTAL_UNIQUE_CARDS = getCardCount();

  // Reactive stats from collection (guard for SSR)
  let stats = $derived(typeof window !== 'undefined' ? getCollectionStats() : {
    totalPacks: 0,
    totalCards: 0,
    uniqueCards: 0,
    rarePulls: 0,
    epicPulls: 0,
    legendaryPulls: 0,
    mythicPulls: 0,
    holoPulls: 0,
    lastOpenedAt: null,
  });

  // Calculate duplicate count
  let duplicateCount = $derived(stats.totalCards - stats.uniqueCards);

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

  // Calculate dad type counts from all unique cards
  function getDadTypeCounts(): Record<DadType, number> {
    const current = collection.get();
    const counts: Record<DadType, number> = {
      BBQ_DAD: 0,
      FIX_IT_DAD: 0,
      GOLF_DAD: 0,
      COUCH_DAD: 0,
      LAWN_DAD: 0,
      CAR_DAD: 0,
      OFFICE_DAD: 0,
      COOL_DAD: 0,
      COACH_DAD: 0,
      CHEF_DAD: 0,
      HOLIDAY_DAD: 0,
      WAREHOUSE_DAD: 0,
      VINTAGE_DAD: 0,
      FASHION_DAD: 0,
      TECH_DAD: 0,
      ITEM: 0,
    };

    // Count unique cards by type
    const uniqueCardIds = new Set<string>();
    for (const pack of current.packs) {
      for (const card of pack.cards) {
        if (!uniqueCardIds.has(card.id)) {
          uniqueCardIds.add(card.id);
          counts[card.type]++;
        }
      }
    }

    return counts;
  }

  // Reactive dad type counts
  let dadTypeCounts = $derived(getDadTypeCounts());

  // Get top dad types by collection count
  function getTopDadTypes(limit: number = 5): Array<{ type: DadType; count: number; percentage: number }> {
    const entries = Object.entries(dadTypeCounts) as Array<[DadType, number]>;
    const total = stats.uniqueCards;

    return entries
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([type, count]) => ({
        type,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }));
  }

  // Reactive top dad types
  let topDadTypes = $derived(getTopDadTypes(5));

  // ============================================================================
  // COLLECTION VALUE CALCULATION (PACK-023)
  // ============================================================================

  // Get unique cards with duplicate counts
  function getCardsWithValue(): Array<{ card: CollectionDisplayCard; value: number }> {
    const current = collection.get();
    const uniqueCards = getUniqueCardsWithCounts(current.packs);

    return uniqueCards.map(card => ({
      card,
      value: calculateCardValue(card),
    }));
  }

  // Calculate total collection value
  let totalCollectionValue = $derived(
    (() => {
      const current = collection.get();
      const uniqueCards = getUniqueCardsWithCounts(current.packs);
      return calculateCollectionValue(uniqueCards);
    })()
  );

  // Get value breakdown by rarity
  let valueBreakdown = $derived(
    (() => {
      const current = collection.get();
      const uniqueCards = getUniqueCardsWithCounts(current.packs);
      return getValueBreakdownByRarity(uniqueCards);
    })()
  );

  // Calculate expected rarity percentages based on pack configuration
  function calculateExpectedRates(): Record<Rarity, number> {
    const expected: Record<Rarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
    };

    // Sum up probabilities across all slots
    for (const slot of DEFAULT_PACK_CONFIG.raritySlots) {
      if (slot.guaranteedRarity) {
        expected[slot.guaranteedRarity] += 1;
      } else if (slot.probability) {
        for (const [rarity, prob] of Object.entries(slot.probability)) {
          expected[rarity as Rarity] += prob;
        }
      }
    }

    // Convert to percentages
    const totalCards = DEFAULT_PACK_CONFIG.cardsPerPack;
    for (const rarity of Object.keys(expected) as Rarity[]) {
      expected[rarity] = (expected[rarity] / totalCards) * 100;
    }

    return expected;
  }

  // Expected rates (constant)
  const EXPECTED_RATES = calculateExpectedRates();

  // Calculate actual rarity percentages
  function getActualRates(): Record<Rarity, number> {
    const total = stats.totalCards;
    const actual: Record<Rarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
    };

    if (total === 0) return actual;

    for (const rarity of Object.keys(rarityCounts) as Rarity[]) {
      actual[rarity] = (rarityCounts[rarity] / total) * 100;
    }

    return actual;
  }

  // Reactive actual rates
  let actualRates = $derived(getActualRates());

  // Calculate luck percentage (how much better/worse than expected)
  function calculateLuckPercentage(): number | null {
    const total = stats.totalCards;
    if (total === 0) return null;

    // Weight rarities by their "value" (rarity order)
    // mythic=5, legendary=4, epic=3, rare=2, uncommon=1, common=0
    const weights: Record<Rarity, number> = {
      common: 0,
      uncommon: 1,
      rare: 2,
      epic: 3,
      legendary: 4,
      mythic: 5,
    };

    // Calculate expected weighted score
    let expectedScore = 0;
    for (const rarity of Object.keys(EXPECTED_RATES) as Rarity[]) {
      expectedScore += EXPECTED_RATES[rarity] * weights[rarity] / 100;
    }

    // Calculate actual weighted score
    let actualScore = 0;
    for (const rarity of Object.keys(rarityCounts) as Rarity[]) {
      const rate = (rarityCounts[rarity] / total) * 100;
      actualScore += rate * weights[rarity] / 100;
    }

    // Luck is the percentage difference from expected
    // If actual score equals expected score, luck is 0%
    // Higher score = positive luck (luckier than average)
    // Lower score = negative luck (unluckier than average)
    if (expectedScore === 0) return 0;
    return ((actualScore - expectedScore) / expectedScore) * 100;
  }

  // Reactive luck percentage
  let luckPercentage = $derived(calculateLuckPercentage());

  // Get luck message and emoji
  function getLuckInfo(): { message: string; emoji: string; color: string } {
    if (luckPercentage === null) {
      return { message: 'Open packs to see your luck!', emoji: '🎁', color: '#94a3b8' };
    }

    const absLuck = Math.abs(luckPercentage);

    if (luckPercentage > 50) {
      return { message: 'Incredibly lucky!', emoji: '🌟', color: '#ec4899' };
    } else if (luckPercentage > 25) {
      return { message: 'Very lucky!', emoji: '✨', color: '#f97316' };
    } else if (luckPercentage > 10) {
      return { message: 'Luckier than average', emoji: '🍀', color: '#fbbf24' };
    } else if (luckPercentage > 0) {
      return { message: 'Slightly lucky', emoji: '😊', color: '#10b981' };
    } else if (luckPercentage === 0) {
      return { message: 'Perfectly average luck', emoji: '😐', color: '#94a3b8' };
    } else if (luckPercentage > -10) {
      return { message: 'Slightly unlucky', emoji: '😅', color: '#60a5fa' };
    } else if (luckPercentage > -25) {
      return { message: 'Unlucky lately', emoji: '😢', color: '#8b5cf6' };
    } else {
      return { message: 'RNGesus has abandoned you', emoji: '😭', color: '#ef4444' };
    }
  }

  // Reactive luck info
  let luckInfo = $derived(getLuckInfo());

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

    <!-- Unique Cards -->
    <div class="stat-card">
      <div class="stat-icon">⭐</div>
      <div class="stat-info">
        <span class="stat-value">{stats.uniqueCards}</span>
        <span class="stat-label">Unique Cards</span>
      </div>
    </div>

    <!-- Duplicates -->
    <div class="stat-card">
      <div class="stat-icon">🔄</div>
      <div class="stat-info">
        <span class="stat-value">{duplicateCount}</span>
        <span class="stat-label">Duplicates</span>
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

    <!-- Collection Value (PACK-023) -->
    <div class="stat-card value-card">
      <div class="stat-icon">💎</div>
      <div class="stat-info">
        <span class="stat-value">{formatCollectionValue(totalCollectionValue)}</span>
        <span class="stat-label">Collection Value</span>
      </div>
    </div>
  </div>

  <!-- Luck Meter -->
  <div class="luck-meter">
    <h3 class="luck-title">Your Luck</h3>
    <div class="luck-display" style="--luck-color: {luckInfo.color}">
      <div class="luck-emoji">{luckInfo.emoji}</div>
      <div class="luck-info">
        <div class="luck-message">{luckInfo.message}</div>
        {#if luckPercentage !== null}
          <div class="luck-percentage" class:lucky={luckPercentage > 0} class:unlucky={luckPercentage < 0}>
            {formatLuckPercentage(luckPercentage)} vs average
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Rarity Breakdown with Expected vs Actual -->
  <div class="rarity-breakdown">
    <h3 class="rarity-title">Rarity Breakdown (vs Expected)</h3>
    <div class="rarity-list">
      {#each displayRarities as rarity}
        {@const count = rarityCounts[rarity]}
        {@const config = RARITY_CONFIG[rarity]}
        {@const expected = EXPECTED_RATES[rarity]}
        {@const actual = actualRates[rarity]}
        {@const diff = actual - expected}
        <div class="rarity-item extended" style="--rarity-color: {config.color}">
          <div class="rarity-dot" style="background: {config.color}"></div>
          <span class="rarity-name">{config.name}</span>
          <span class="rarity-count">{count}</span>
          <span class="rarity-percent">{formatPercentage(actual / 100)}</span>
          <span class="rarity-expected" title="Expected: {formatPercentage(expected / 100)}">
            (expected {formatPercentage(expected / 100)})
          </span>
          {#if diff !== 0}
            <span class="rarity-diff" class:above={diff > 0} class:below={diff < 0}>
              {formatLuckPercentage(diff)}
            </span>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <!-- Visual Rarity Bar Chart -->
  <div class="rarity-chart">
    <h3 class="chart-title">Rarity Distribution</h3>
    <div class="chart-container">
      {#each displayRarities as rarity}
        {@const count = rarityCounts[rarity]}
        {@const config = RARITY_CONFIG[rarity]}
        {@const percentage = stats.totalCards > 0 ? (count / stats.totalCards) * 100 : 0}
        <div class="chart-bar" style="--bar-color: {config.color}; --bar-width: {percentage}%">
          <div class="bar-label">{config.name}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width: {percentage}%"></div>
          </div>
          <div class="bar-value">{count} ({formatPercentage(percentage / 100)})</div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Dad Type Collection Statistics -->
  <div class="dad-type-stats">
    <h3 class="chart-title">Most Collected Dad Types</h3>
    <div class="dad-type-grid">
      {#if topDadTypes.length === 0}
        <div class="no-data">No cards collected yet</div>
      {:else}
        {#each topDadTypes as { type, count, percentage }}
          {@const config = DAD_TYPE_CONFIG[type]}
          <div class="dad-type-card" style="--type-color: {config.color}">
            <div class="type-icon">{config.emoji}</div>
            <div class="type-info">
              <div class="type-name">{config.name}</div>
              <div class="type-stats">
                <span class="type-count">{formatCardCount(count)} cards</span>
                <span class="type-percent">{formatPercentage(percentage / 100)}</span>
              </div>
            </div>
            <div class="type-bar" style="width: {percentage}%"></div>
          </div>
        {/each}
      {/if}
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

  .stat-card.value-card {
    border-color: rgba(251, 191, 36, 0.3);
    background: rgba(251, 191, 36, 0.05);
  }

  .stat-card.value-card:hover {
    background: rgba(251, 191, 36, 0.1);
    border-color: rgba(251, 191, 36, 0.5);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
  }

  .stat-card.value-card .stat-value {
    font-size: 1.1rem;
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

  /* Luck Meter */
  .luck-meter {
    background: rgba(15, 23, 42, 0.4);
    border: 1px solid rgba(71, 85, 105, 0.2);
    border-radius: 0.75rem;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .luck-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
    margin: 0 0 1rem 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .luck-display {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(30, 41, 59, 0.6);
    border: 2px solid var(--luck-color, #94a3b8);
    border-radius: 0.75rem;
    transition: all 0.3s ease;
  }

  .luck-display:hover {
    background: rgba(51, 65, 85, 0.8);
    box-shadow: 0 0 20px var(--luck-color, rgba(148, 163, 184, 0.2));
  }

  .luck-emoji {
    font-size: 2.5rem;
    line-height: 1;
    flex-shrink: 0;
  }

  .luck-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
  }

  .luck-message {
    font-size: 1rem;
    font-weight: 700;
    color: white;
  }

  .luck-percentage {
    font-size: 0.875rem;
    color: #94a3b8;
  }

  .luck-percentage.lucky {
    color: #10b981;
  }

  .luck-percentage.unlucky {
    color: #ef4444;
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
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .rarity-item.extended {
    flex-wrap: wrap;
    padding: 0.75rem 1rem;
  }

  .rarity-expected {
    font-size: 0.75rem;
    color: #64748b;
    font-style: italic;
  }

  .rarity-percent {
    font-size: 0.875rem;
    font-weight: 600;
    color: #94a3b8;
    margin-left: auto;
  }

  .rarity-diff {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
  }

  .rarity-diff.above {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
  }

  .rarity-diff.below {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }

  /* Visual Rarity Bar Chart */
  .rarity-chart {
    background: rgba(15, 23, 42, 0.4);
    border: 1px solid rgba(71, 85, 105, 0.2);
    border-radius: 0.75rem;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .chart-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
    margin: 0 0 1.5rem 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .chart-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .chart-bar {
    display: grid;
    grid-template-columns: 120px 1fr auto;
    align-items: center;
    gap: 1rem;
  }

  .bar-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #94a3b8;
    text-transform: capitalize;
  }

  .bar-track {
    height: 24px;
    background: rgba(15, 23, 42, 0.8);
    border-radius: 0.375rem;
    overflow: hidden;
    position: relative;
  }

  .bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--bar-color), color-mix(in srgb, var(--bar-color) 80%, white));
    border-radius: 0.375rem;
    transition: width 0.6s ease-out;
    box-shadow: 0 0 10px var(--bar-color);
  }

  .bar-value {
    font-size: 0.875rem;
    font-weight: 700;
    color: white;
    text-align: right;
    min-width: 100px;
  }

  /* Dad Type Statistics */
  .dad-type-stats {
    background: rgba(15, 23, 42, 0.4);
    border: 1px solid rgba(71, 85, 105, 0.2);
    border-radius: 0.75rem;
    padding: 1.25rem;
  }

  .dad-type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }

  .no-data {
    grid-column: 1 / -1;
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.875rem;
  }

  .dad-type-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.75rem;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .dad-type-card:hover {
    background: rgba(51, 65, 85, 0.8);
    border-color: var(--type-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .type-icon {
    font-size: 2rem;
    line-height: 1;
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 23, 42, 0.8);
    border-radius: 0.5rem;
  }

  .type-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    z-index: 1;
  }

  .type-name {
    font-size: 1rem;
    font-weight: 700;
    color: white;
    text-transform: capitalize;
  }

  .type-stats {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
  }

  .type-count {
    color: #94a3b8;
  }

  .type-percent {
    font-weight: 700;
    color: var(--type-color);
  }

  .type-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--type-color), color-mix(in srgb, var(--type-color) 80%, white));
    transition: width 0.6s ease-out;
    box-shadow: 0 0 8px var(--type-color);
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

    .luck-emoji {
      font-size: 2rem;
    }

    .luck-message {
      font-size: 0.875rem;
    }

    .rarity-item.extended {
      font-size: 0.75rem;
    }

    .rarity-expected {
      display: none;
    }

    /* Chart responsive adjustments */
    .chart-bar {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .bar-label {
      font-size: 0.75rem;
    }

    .bar-value {
      font-size: 0.75rem;
      text-align: left;
    }

    /* Dad type responsive adjustments */
    .dad-type-grid {
      grid-template-columns: 1fr;
    }

    .type-icon {
      font-size: 1.5rem;
      width: 40px;
      height: 40px;
    }

    .type-name {
      font-size: 0.875rem;
    }

    .type-stats {
      font-size: 0.75rem;
    }
  }
</style>
