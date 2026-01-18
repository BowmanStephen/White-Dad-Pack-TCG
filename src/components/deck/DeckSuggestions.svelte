<script lang="ts">
  import type { Deck } from '@/types';
  import { DAD_TYPE_ICONS, DAD_TYPE_NAMES, RARITY_CONFIG, STAT_ICONS } from '@/types';
  import { t } from '@/i18n';
  import { analyzeDeckSynergy, checkCardSynergy, analyzeDeckStats } from '@/lib/deck/suggestions';
  import { collection } from '@/stores/collection';
  import { onMount, onDestroy } from 'svelte';
  import GenerativeCardArt from '../art/GenerativeCardArt.svelte';

  export let deck: Deck;
  export let compact: boolean = false;

  // Get cards from collection
  let userCollectionCards: any[] = [];
  let unsubCollection: (() => void) | null = null;

  // Analyze synergy
  $: userCollection = { cards: userCollectionCards };
  $: analysis = userCollection && deck ? analyzeDeckSynergy(deck, userCollection) : null;
  $: synergyPotential = analysis?.synergyPotential ?? 0;
  $: typeSuggestions = analysis?.typeSuggestions ?? [];
  $: cardRecommendations = analysis?.cardRecommendations ?? [];
  $: currentBonus = analysis?.currentBonus ?? 0;
  $: possibleBonus = analysis?.possibleBonus ?? 0;
  $: dominantType = analysis?.dominantType ?? null;

  // Analyze stats
  $: statAnalysis = userCollection && deck ? analyzeDeckStats(deck, userCollection) : null;
  $: weakestStat = statAnalysis?.weakestStat ?? null;
  $: strongestStat = statAnalysis?.strongestStat ?? null;
  $: imbalances = statAnalysis?.imbalances ?? [];
  $: balanceScore = statAnalysis?.overallBalance ?? 0;
  $: statRecommendations = statAnalysis?.recommendations ?? [];

  // Subscribe to collection on mount
  onMount(() => {
    if (typeof window !== 'undefined') {
      // Get initial collection
      try {
        const coll = collection.get();
        userCollectionCards = coll.cards || [];
      } catch (e) {
        console.error('Error accessing collection:', e);
        userCollectionCards = [];
      }

      // Subscribe to changes
      if (typeof collection.subscribe === 'function') {
        unsubCollection = collection.subscribe((value) => {
          userCollectionCards = value?.cards || [];
        });
      }
    }
  });

  onDestroy(() => {
    unsubCollection?.();
  });

  // Check if card has synergy (for drag highlighting)
  export function hasSynergy(card: any): boolean {
    return checkCardSynergy(card, deck);
  }

  // Helper to get priority color
  function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#eab308';
      case 'low':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  }

  // Helper to get rarity color
  function getRarityColor(rarity: string): string {
    return RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG]?.color || '#9ca3af';
  }
</script>

{#if analysis && (typeSuggestions.length > 0 || cardRecommendations.length > 0)}
  <div class="deck-suggestions" class:compact>
    <!-- Synergy Potential -->
    <div class="synergy-overview">
      <h3 class="suggestions-title">{$t('deck.synergy.title')}</h3>
      <div class="synergy-potential">
        <div class="potential-header">
          <span class="potential-label">{$t('deck.synergy.potential')}</span>
          <span class="potential-value" class:potential-high={synergyPotential >= 85} class:potential-medium={synergyPotential >= 60 && synergyPotential < 85} class:potential-low={synergyPotential < 60}>
            {synergyPotential}%
          </span>
        </div>
        <div class="potential-bar">
          <div class="potential-fill" style="width: {synergyPotential}%"></div>
        </div>
        {#if currentBonus > 0}
          <div class="current-bonus">
            <span class="bonus-icon">✨</span>
            <span class="bonus-text">{$t('deck.synergy.currentBonus')}: +{currentBonus * 100}%</span>
          </div>
        {/if}
      </div>
    </div>

    {#if !compact}
      <!-- Type Suggestions -->
      {#if typeSuggestions.length > 0}
        <div class="suggestions-section">
          <h4 class="section-subtitle">{$t('deck.synergy.typeSuggestions')}</h4>
          <div class="suggestions-list">
            {#each typeSuggestions.slice(0, 3) as suggestion}
              {#if suggestion.suggestedCount > 0}
                <div class="suggestion-item">
                  <div class="suggestion-icon">
                    <span class="type-badge">{DAD_TYPE_ICONS[suggestion.type]}</span>
                  </div>
                  <div class="suggestion-content">
                    <div class="suggestion-type">{DAD_TYPE_NAMES[suggestion.type]}</div>
                    <div class="suggestion-reason">{suggestion.reason}</div>
                  </div>
                  <div class="suggestion-count">
                    <span class="count-current">{suggestion.currentCount}</span>
                    <span class="count-arrow">→</span>
                    <span class="count-suggested">{suggestion.currentCount + suggestion.suggestedCount}</span>
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        </div>
      {/if}

      <!-- Card Recommendations -->
      {#if cardRecommendations.length > 0}
        <div class="suggestions-section">
          <h4 class="section-subtitle">{$t('deck.synergy.recommendedCards')}</h4>
          <div class="recommendations-grid">
            {#each cardRecommendations.slice(0, 4) as rec}
              <div
                class="recommendation-card"
                class:priority-high={rec.priority === 'high'}
                class:priority-medium={rec.priority === 'medium'}
                class:priority-low={rec.priority === 'low'}
              >
                <GenerativeCardArt card={rec.card} size="sm" />
                <div class="recommendation-info">
                  <div class="recommendation-name">{rec.card.name}</div>
                  <div class="recommendation-reason">{rec.reason}</div>
                  <div
                    class="recommendation-rarity"
                    style="color: {RARITY_CONFIG[rec.card.rarity].color}"
                  >
                    {RARITY_CONFIG[rec.card.rarity].label}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Dominant Type Display -->
      {#if dominantType}
        <div class="dominant-type">
          <span class="dominant-label">{$t('deck.synergy.dominantType')}:</span>
          <span class="dominant-value">
            <span class="type-icon">{DAD_TYPE_ICONS[dominantType]}</span>
            {DAD_TYPE_NAMES[dominantType]}
          </span>
        </div>
      {/if}
    {/if}

    <!-- Stat Optimization Section -->
    {#if statAnalysis && !compact}
      <!-- Balance Score -->
      <div class="optimization-section">
        <h3 class="section-title optimization-title">{$t('deck.optimization.title')}</h3>
        <div class="balance-score-card">
          <div class="score-label">{$t('deck.optimization.balance')}</div>
          <div
            class="score-value"
            class:score-high={balanceScore >= 75}
            class:score-medium={balanceScore >= 50 && balanceScore < 75}
            class:score-low={balanceScore < 50}
          >
            {balanceScore}%
          </div>
        </div>

        {#if balanceScore >= 75 && imbalances.length === 0}
          <!-- Well-balanced deck message -->
          <div class="balanced-message">
            <span class="icon">✓</span>
            <span>{$t('deck.optimization.balancedDeck')}</span>
          </div>
        {/if}

        <!-- Weakest Stat -->
        {#if weakestStat && balanceScore < 75}
          <div class="stat-warning">
            <h4 class="warning-title">
              <span class="icon">⚠️</span>
              {$t('deck.optimization.weakestStat')}: {weakestStat.statName}
            </h4>
            <div class="stat-details">
              <div class="stat-current">
                <span class="label">{weakestStat.statName}:</span>
                <span class="value low">{weakestStat.currentValue}</span>
              </div>
              <div class="stat-target">
                <span class="label">{$t('deck.optimization.targetValue', { value: weakestStat.targetValue })}</span>
              </div>
              <p class="improve-text">
                {$t('deck.optimization.improveDeck', { stat: weakestStat.statName.toLowerCase() })}
              </p>
            </div>

            <!-- Recommended cards for weakest stat -->
            {#if weakestStat.recommendedCards.length > 0}
              <div class="recommended-cards">
                <div class="rec-header">
                  <span class="priority-dot" style="background-color: {getPriorityColor(weakestStat.priority)}"></span>
                  <span class="priority-text">
                    {weakestStat.priority === 'high'
                      ? $t('deck.optimization.priorityHigh')
                      : weakestStat.priority === 'medium'
                        ? $t('deck.optimization.priorityMedium')
                        : $t('deck.optimization.priorityLow')}
                  </span>
                </div>
                <div class="rec-cards-list">
                  {#each weakestStat.recommendedCards.slice(0, 3) as card}
                    <div class="rec-card-item">
                      <GenerativeCardArt card={card} size="sm" />
                      <div class="rec-card-info">
                        <div class="rec-card-name">{card.name}</div>
                        <div class="rec-card-stat">
                          <span class="stat-icon-small">{STAT_ICONS[weakestStat.statKey]}</span>
                          <span class="stat-value-small">{card.stats[weakestStat.statKey]}</span>
                        </div>
                      </div>
                      <div class="rec-card-rarity" style="color: {getRarityColor(card.rarity)}">
                        {RARITY_CONFIG[card.rarity].label}
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Stat Imbalances -->
        {#if imbalances.length > 0}
          <div class="imbalances-section">
            <h4 class="section-subtitle">{$t('deck.optimization.statImbalances')}</h4>
            <div class="imbalances-list">
              {#each imbalances.slice(0, 5) as imbalance}
                <div
                  class="imbalance-item"
                  class:imbalance-high={imbalance.isHigh}
                  class:imbalance-low={!imbalance.isHigh}
                >
                  <span class="stat-icon">{STAT_ICONS[imbalance.statKey]}</span>
                  <div class="imbalance-info">
                    <span class="stat-name">{imbalance.statName}</span>
                    <span class="stat-value">{imbalance.value}</span>
                  </div>
                  <div class="imbalance-badge">
                    {#if imbalance.isHigh}
                      <span class="badge high">↑</span>
                      <span class="badge-text">{$t('deck.optimization.aboveAverage')}</span>
                    {:else}
                      <span class="badge low">↓</span>
                      <span class="badge-text">{$t('deck.optimization.belowAverage')}</span>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- All Stat Recommendations -->
        {#if statRecommendations.length > 0 && balanceScore < 75}
          <div class="stat-recommendations">
            <h4 class="section-subtitle">{$t('deck.optimization.recommendations')}</h4>
            {#each statRecommendations.slice(0, 3) as rec}
              <div class="stat-rec-item">
                <div class="stat-rec-header">
                  <span class="priority-dot" style="background-color: {getPriorityColor(rec.priority)}"></span>
                  <span class="stat-name">{rec.statName}</span>
                  <span class="stat-diff">+{rec.difference}</span>
                </div>
                {#if rec.recommendedCards.length > 0}
                  <div class="stat-rec-cards">
                    {#each rec.recommendedCards.slice(0, 3) as card}
                      <div class="mini-card">
                        <GenerativeCardArt card={card} size="sm" />
                        <div class="mini-card-name">{card.name}</div>
                        <div class="mini-card-stat">{card.stats[rec.statKey]} {rec.statName}</div>
                      </div>
                    {/each}
                  </div>
                {:else}
                  <div class="no-cards">{$t('deck.optimization.noRecommendations')}</div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .deck-suggestions {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-radius: 12px;
    padding: 1.5rem;
    color: #f1f5f9;
  }

  .deck-suggestions.compact {
    padding: 1rem;
  }

  .synergy-overview {
    margin-bottom: 1.5rem;
  }

  .suggestions-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #f8fafc;
    margin: 0 0 1rem 0;
  }

  .synergy-potential {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    padding: 1rem;
  }

  .potential-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .potential-label {
    font-size: 0.875rem;
    color: #cbd5e1;
    font-weight: 500;
  }

  .potential-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #f8fafc;
  }

  .potential-value.potential-high {
    color: #22c55e;
  }

  .potential-value.potential-medium {
    color: #eab308;
  }

  .potential-value.potential-low {
    color: #ef4444;
  }

  .potential-bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.75rem;
  }

  .potential-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
    transition: width 0.3s ease;
    border-radius: 4px;
  }

  .current-bonus {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #fde047;
  }

  .bonus-icon {
    font-size: 1rem;
  }

  .bonus-text {
    font-weight: 500;
  }

  .suggestions-section {
    margin-top: 1.5rem;
  }

  .section-subtitle {
    font-size: 1rem;
    font-weight: 600;
    color: #cbd5e1;
    margin: 0 0 0.75rem 0;
  }

  .suggestions-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.2s;
  }

  .suggestion-item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .suggestion-icon {
    flex-shrink: 0;
  }

  .type-badge {
    font-size: 1.5rem;
  }

  .suggestion-content {
    flex: 1;
    min-width: 0;
  }

  .suggestion-type {
    font-size: 0.875rem;
    font-weight: 600;
    color: #f8fafc;
    margin-bottom: 0.25rem;
  }

  .suggestion-reason {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .suggestion-count {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }

  .count-current {
    color: #94a3b8;
  }

  .count-arrow {
    color: #64748b;
  }

  .count-suggested {
    color: #22c55e;
  }

  .recommendations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.75rem;
  }

  .recommendation-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.2s;
  }

  .recommendation-card:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
  }

  .recommendation-card.priority-high {
    border-color: rgba(234, 179, 8, 0.3);
    background: rgba(234, 179, 8, 0.05);
  }

  .recommendation-card.priority-medium {
    border-color: rgba(59, 130, 246, 0.3);
  }

  .recommendation-card.priority-low {
    opacity: 0.7;
  }

  .recommendation-info {
    text-align: center;
  }

  .recommendation-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #f8fafc;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .recommendation-reason {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-bottom: 0.25rem;
  }

  .recommendation-rarity {
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .dominant-type {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dominant-label {
    font-size: 0.875rem;
    color: #94a3b8;
  }

  .dominant-value {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #f8fafc;
  }

  .dominant-value .type-icon {
    font-size: 1rem;
  }

  /* Optimization Section */
  .optimization-section {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .optimization-title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .balance-score-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .balance-score-card .score-label {
    font-size: 0.875rem;
    color: #cbd5e1;
    font-weight: 500;
  }

  .balance-score-card .score-value {
    font-size: 2rem;
    font-weight: 700;
    margin-left: auto;
  }

  .balanced-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 8px;
    color: #22c55e;
    font-weight: 500;
  }

  .stat-warning {
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 8px;
  }

  .warning-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #f87171;
    margin-bottom: 0.75rem;
  }

  .stat-details {
    margin-bottom: 1rem;
  }

  .stat-current {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .stat-current .label {
    font-size: 0.875rem;
    color: #94a3b8;
  }

  .stat-current .value {
    font-size: 1rem;
    font-weight: 600;
  }

  .stat-current .value.low {
    color: #ef4444;
  }

  .stat-target {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-bottom: 0.75rem;
  }

  .improve-text {
    font-size: 0.875rem;
    color: #cbd5e1;
    margin: 0;
  }

  .recommended-cards {
    margin-top: 1rem;
  }

  .rec-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .priority-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .priority-text {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .rec-cards-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .rec-card-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    transition: background 0.2s;
  }

  .rec-card-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .rec-card-info {
    flex: 1;
    min-width: 0;
  }

  .rec-card-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #f8fafc;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rec-card-stat {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .rec-card-rarity {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .imbalances-section {
    margin-top: 1.5rem;
  }

  .imbalances-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .imbalance-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    border-left: 3px solid transparent;
  }

  .imbalance-item.imbalance-low {
    border-left-color: #ef4444;
  }

  .imbalance-item.imbalance-high {
    border-left-color: #22c55e;
  }

  .imbalance-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .imbalance-info .stat-name {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .imbalance-info .stat-value {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .imbalance-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .imbalance-badge .badge {
    font-size: 0.875rem;
    font-weight: 700;
  }

  .imbalance-badge .badge.high {
    color: #22c55e;
  }

  .imbalance-badge .badge.low {
    color: #ef4444;
  }

  .imbalance-badge .badge-text {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .stat-recommendations {
    margin-top: 1.5rem;
  }

  .stat-rec-item {
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
  }

  .stat-rec-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .stat-rec-header .stat-name {
    flex: 1;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .stat-diff {
    font-size: 0.875rem;
    font-weight: 600;
    color: #22c55e;
  }

  .stat-rec-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.5rem;
  }

  .mini-card {
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    text-align: center;
  }

  .mini-card-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: #f8fafc;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mini-card-stat {
    font-size: 0.625rem;
    color: #94a3b8;
  }

  .no-cards {
    font-size: 0.75rem;
    color: #94a3b8;
    text-align: center;
    padding: 0.5rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .recommendations-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }

    .suggestion-item {
      flex-wrap: wrap;
    }

    .suggestion-count {
      width: 100%;
      justify-content: center;
      margin-top: 0.5rem;
    }
  }
</style>
