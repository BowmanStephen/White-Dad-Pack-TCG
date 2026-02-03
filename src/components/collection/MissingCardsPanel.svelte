<script lang="ts">
  import { onMount } from 'svelte';
  import { collection } from '@/stores/collection';
  import { getAllCards, getCardById } from '@/lib/cards/database';
  import type { Card, Rarity, DadType } from '@/types';
  import { RARITY_CONFIG } from '@/types';

  // UI state
  let showDetails = $state(false);
  let selectedCard = $state<Card | null>(null);
  let groupBy = $state<'rarity' | 'type'>('rarity');
  let expandedSections = $state<Set<string>>(new Set());

  // Get all cards from database
  const allCards = getAllCards();

  // Collection data
  let ownedCardIds: string[] = [];
  let completionStats = $state({
    totalCards: allCards.length,
    uniqueOwned: 0,
    completionPercentage: 0,
    missingCount: allCards.length
  });

  // Computed data for template
  let missingCardsList = $state<Card[]>([]);
  let missingByRarity = $state<Record<Rarity, Card[]>>({
    common: [],
    uncommon: [],
    rare: [],
    epic: [],
    legendary: [],
    mythic: [],
  });
  let missingByType = $state<Record<string, Card[]>>({});

  // Load collection data
  function loadCollection() {
    const currentCollection = collection.get();
    ownedCardIds = currentCollection.metadata.uniqueCards;

    // Calculate stats once
    const totalCards = allCards.length;
    const uniqueOwned = ownedCardIds.length;
    const completionPercentage = totalCards > 0
      ? Math.round((uniqueOwned / totalCards) * 1000) / 10
      : 0;
    const missingCount = totalCards - uniqueOwned;

    completionStats = { totalCards, uniqueOwned, completionPercentage, missingCount };

    // Update missing message
    missingMessage = `${missingCount} cards missing`;

    // Compute missing cards
    const nextMissingCards = allCards.filter((card) => !ownedCardIds.includes(card.id));

    // Group by rarity
    const nextMissingByRarity: Record<Rarity, Card[]> = {
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
      legendary: [],
      mythic: [],
    };
    for (const card of nextMissingCards) {
      nextMissingByRarity[card.rarity].push(card);
    }

    // Group by type
    const nextMissingByType: Record<string, Card[]> = {};
    for (const card of nextMissingCards) {
      if (!nextMissingByType[card.type]) {
        nextMissingByType[card.type] = [];
      }
      nextMissingByType[card.type].push(card);
    }

    missingCardsList = nextMissingCards;
    missingByRarity = nextMissingByRarity;
    missingByType = nextMissingByType;
  }

  // Get rarity order for sorting
  const rarityOrder: Record<Rarity, number> = {
    common: 0,
    uncommon: 1,
    rare: 2,
    epic: 3,
    legendary: 4,
    mythic: 5,
  };

  // Toggle section expansion
  function toggleSection(section: string) {
    if (expandedSections.has(section)) {
      expandedSections.delete(section);
    } else {
      expandedSections.add(section);
    }
    expandedSections = new Set(expandedSections);
  }

  // Expand all sections
  function expandAll() {
    const sections = groupBy === 'rarity'
      ? Object.keys(missingByRarity)
      : Object.keys(missingByType);
    expandedSections = new Set(sections);
  }

  // Collapse all sections
  function collapseAll() {
    expandedSections = new Set();
  }

  // Show card details
  function showCardDetails(cardId: string) {
    const card = getCardById(cardId);
    if (card) {
      selectedCard = card;
      showDetails = true;
    }
  }

  // Close details modal
  function closeDetails() {
    showDetails = false;
    selectedCard = null;
  }

  // Get rarity color
  function getRarityColor(rarity: Rarity): string {
    return RARITY_CONFIG[rarity].color;
  }

  // Format type name for display
  function formatTypeName(type: DadType): string {
    return type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Reactive missing count message
  let missingMessage = $state('');

  // Initialize on mount
  onMount(() => {
    loadCollection();
  });
</script>

<!-- Missing Cards Tracker -->
<div class="missing-tracker">
  <!-- Progress Header -->
  <div class="progress-header">
    <h2 class="tracker-title">Missing Cards Tracker</h2>

    <!-- Completion Badge -->
    <div class="completion-badge">
      <span class="completion-count">{completionStats.uniqueOwned}/{completionStats.totalCards}</span>
      <span class="completion-label">collected</span>
    </div>

    <!-- Progress Bar -->
    <div class="progress-bar-container">
      <div class="progress-bar">
        <div
          class="progress-fill"
          style="width: {completionStats.completionPercentage}%; background: linear-gradient(90deg, #fbbf24, #f59e0b);"
        ></div>
      </div>
      <span class="progress-percentage">{completionStats.completionPercentage}%</span>
    </div>

    <!-- Missing Count -->
    <p class="missing-count">
      {missingMessage}
    </p>
  </div>

  <!-- Group By Toggle -->
  <div class="group-by-toggle">
    <button
      class="toggle-btn {groupBy === 'rarity' ? 'active' : ''}"
      onclick={() => {
        groupBy = 'rarity';
        expandedSections = new Set();
      }}
    >
      Group by Rarity
    </button>
    <button
      class="toggle-btn {groupBy === 'type' ? 'active' : ''}"
      onclick={() => {
        groupBy = 'type';
        expandedSections = new Set();
      }}
    >
      Group by Type
    </button>
  </div>

  <!-- Expand/Collapse All -->
  <div class="expand-controls">
    <button class="text-btn" onclick={expandAll}>Expand All</button>
    <span class="separator">|</span>
    <button class="text-btn" onclick={collapseAll}>Collapse All</button>
  </div>

  <!-- Missing Cards List -->
  <div class="missing-list">
    {#if groupBy === 'rarity'}
      <!-- Group by Rarity -->
      {#each Object.keys(missingByRarity).sort((a, b) => rarityOrder[b as Rarity] - rarityOrder[a as Rarity]) as rarity}
        {@const cards = missingByRarity[rarity as Rarity]}
        {#if cards.length > 0}
          <div class="missing-section">
            <button
              class="section-header"
              onclick={() => toggleSection(rarity)}
              aria-expanded={expandedSections.has(rarity)}
            >
              <div class="section-info">
                <span
                  class="rarity-dot"
                  style="background-color: {getRarityColor(rarity as Rarity)};"
                ></span>
                <span class="section-title">{rarity.toUpperCase()}</span>
                <span class="section-count">({cards.length})</span>
              </div>
              <span class="expand-icon">{expandedSections.has(rarity) ? '▼' : '▶'}</span>
            </button>

            {#if expandedSections.has(rarity)}
              <div class="section-cards">
                {#each cards as card}
                  <button
                    class="missing-card"
                    onclick={() => showCardDetails(card.id)}
                  >
                    <div class="card-thumbnail">
                      <img
                        src={card.artwork}
                        alt="{card.name}, {card.rarity} rarity {card.type}. {card.subtitle}"
                        loading="lazy"
                        class="thumbnail-image"
                      />
                      <div class="card-overlay">
                        <span class="view-icon" aria-hidden="true">👁️</span>
                      </div>
                    </div>
                    <div class="card-info">
                      <span class="card-name">{card.name}</span>
                      <span class="card-subtitle">{card.subtitle}</span>
                    </div>
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      {/each}
    {:else}
      <!-- Group by Type -->
      {#each Object.keys(missingByType).sort((a, b) => a.localeCompare(b)) as type}
        {@const cards = missingByType[type]}
        {#if cards.length > 0}
          <div class="missing-section">
            <button
              class="section-header"
              onclick={() => toggleSection(type)}
              aria-expanded={expandedSections.has(type)}
            >
              <div class="section-info">
                <span class="type-icon">👨</span>
                <span class="section-title">{formatTypeName(type as DadType)}</span>
                <span class="section-count">({cards.length})</span>
              </div>
              <span class="expand-icon">{expandedSections.has(type) ? '▼' : '▶'}</span>
            </button>

            {#if expandedSections.has(type)}
              <div class="section-cards">
                {#each cards as card}
                  <button
                    class="missing-card"
                    onclick={() => showCardDetails(card.id)}
                  >
                    <div class="card-thumbnail">
                      <img
                        src={card.artwork}
                        alt="{card.name}, {card.rarity} rarity {card.type}. {card.subtitle}"
                        loading="lazy"
                        class="thumbnail-image"
                      />
                      <div class="card-overlay">
                        <span class="view-icon" aria-hidden="true">👁️</span>
                      </div>
                    </div>
                    <div class="card-info">
                      <span class="card-name">{card.name}</span>
                      <span class="card-subtitle">{card.subtitle}</span>
                    </div>
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      {/each}
    {/if}

    {#if missingCardsList.length === 0 && completionStats.uniqueOwned > 0}
      <div class="complete-message">
        <span class="complete-icon">🎉</span>
        <p class="complete-text">🎉 Complete! You've collected all cards!</p>
      </div>
    {:else if missingCardsList.length === 0 && completionStats.uniqueOwned === 0}
      <div class="empty-state-message">
        <span class="empty-icon">📦</span>
        <p class="empty-text">No cards yet!</p>
        <p class="empty-subtext">Open some packs to start building your collection.</p>
        <a href="/pack" class="empty-cta">Open Your First Pack</a>
      </div>
    {/if}
  </div>
</div>

<!-- Card Details Modal -->
{#if showDetails && selectedCard}
  <div class="details-modal" role="dialog" aria-modal="true" tabindex="-1">
    <button class="details-overlay" onclick={closeDetails} aria-label="Close details" type="button"></button>
    <div class="details-content" role="document">
      <button class="close-btn" onclick={closeDetails} aria-label="Close details" type="button">
        ✕
      </button>

      <div class="card-display">
        <img src={selectedCard.artwork} alt={selectedCard.name} class="card-image" />

        <div class="card-details">
          <h3 class="detail-name">{selectedCard.name}</h3>
          <p class="detail-subtitle">{selectedCard.subtitle}</p>

          <div class="detail-meta">
            <span class="detail-rarity" style="color: {getRarityColor(selectedCard.rarity)};">
              {selectedCard.rarity.toUpperCase()}
            </span>
            <span class="detail-type">{formatTypeName(selectedCard.type)}</span>
          </div>

          <div class="detail-stats">
            <h4>Stats</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Dad Joke</span>
                <span class="stat-value">{selectedCard.stats.dadJoke}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Grill Skill</span>
                <span class="stat-value">{selectedCard.stats.grillSkill}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Fix-It</span>
                <span class="stat-value">{selectedCard.stats.fixIt}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Nap Power</span>
                <span class="stat-value">{selectedCard.stats.napPower}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Remote Control</span>
                <span class="stat-value">{selectedCard.stats.remoteControl}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Thermostat</span>
                <span class="stat-value">{selectedCard.stats.thermostat}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Sock & Sandal</span>
                <span class="stat-value">{selectedCard.stats.sockSandal}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Beer Snob</span>
                <span class="stat-value">{selectedCard.stats.beerSnob}</span>
              </div>
            </div>
          </div>

          {#if selectedCard.flavorText}
            <div class="detail-flavor">
              <h4>Flavor Text</h4>
              <p class="flavor-text">"{selectedCard.flavorText}"</p>
            </div>
          {/if}

          {#if selectedCard.abilities && selectedCard.abilities.length > 0}
            <div class="detail-abilities">
              <h4>Abilities</h4>
              {#each selectedCard.abilities as ability}
                <div class="ability-item">
                  <span class="ability-name">{ability.name}</span>
                  <p class="ability-desc">{ability.description}</p>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Missing Cards Tracker */
  .missing-tracker {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  /* Progress Header */
  .progress-header {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .tracker-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
    margin: 0 0 1rem 0;
  }

  .completion-badge {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
    border: 2px solid rgba(251, 191, 36, 0.3);
    border-radius: 0.75rem;
    margin-bottom: 1rem;
  }

  .completion-count {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fbbf24;
    line-height: 1;
  }

  .completion-label {
    font-size: 0.875rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .progress-bar-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .progress-bar {
    flex: 1;
    height: 0.75rem;
    background: rgba(30, 41, 59, 0.8);
    border-radius: 9999px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #fbbf24, #f59e0b);
    transition: width 0.5s ease;
    border-radius: 9999px;
  }

  .progress-percentage {
    font-size: 1.125rem;
    font-weight: 700;
    color: #fbbf24;
    min-width: 3.5rem;
    text-align: right;
  }

  .missing-count {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
  }

  /* Group By Toggle */
  .group-by-toggle {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .toggle-btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 0.5rem;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toggle-btn:hover {
    background: rgba(51, 65, 85, 0.8);
    border-color: rgba(100, 116, 139, 0.5);
    color: white;
  }

  .toggle-btn.active {
    background: rgba(251, 191, 36, 0.2);
    border-color: rgba(251, 191, 36, 0.5);
    color: #fbbf24;
  }

  /* Expand/Collapse Controls */
  .expand-controls {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .text-btn {
    background: transparent;
    border: none;
    color: #3b82f6;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    transition: color 0.2s ease;
  }

  .text-btn:hover {
    color: #60a5fa;
    text-decoration: underline;
  }

  .separator {
    color: #64748b;
  }

  /* Missing List */
  .missing-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .missing-section {
    background: rgba(30, 41, 59, 0.4);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .section-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .section-header:hover {
    background: rgba(51, 65, 85, 0.4);
  }

  .section-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .rarity-dot,
  .type-icon {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .type-icon {
    width: auto;
    height: auto;
    font-size: 1rem;
  }

  .section-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: white;
    text-transform: uppercase;
  }

  .section-count {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .expand-icon {
    font-size: 0.625rem;
    color: #94a3b8;
    transition: transform 0.2s ease;
  }

  .section-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.5rem;
    padding: 0 0.5rem 0.5rem 0.5rem;
    border-top: 1px solid rgba(71, 85, 105, 0.2);
  }

  /* Missing Card */
  .missing-card {
    display: flex;
    gap: 0.75rem;
    padding: 0.5rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .missing-card:hover {
    background: rgba(30, 41, 59, 0.8);
    border-color: #fbbf24;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
  }

  .card-thumbnail {
    position: relative;
    width: 60px;
    height: 82px;
    flex-shrink: 0;
    border-radius: 0.375rem;
    overflow: hidden;
    background: rgba(15, 23, 42, 0.8);
  }

  .thumbnail-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .card-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .missing-card:hover .card-overlay {
    opacity: 1;
  }

  .view-icon {
    font-size: 1.25rem;
  }

  .card-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.125rem;
    min-width: 0;
  }

  .card-name {
    font-size: 0.8125rem;
    font-weight: 600;
    color: white;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-subtitle {
    font-size: 0.6875rem;
    color: #94a3b8;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Complete Message */
  .complete-message {
    text-align: center;
    padding: 2rem;
    background: rgba(34, 197, 94, 0.1);
    border: 2px solid rgba(34, 197, 94, 0.3);
    border-radius: 0.75rem;
  }

  .complete-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  .complete-text {
    font-size: 1rem;
    font-weight: 600;
    color: #22c55e;
    margin: 0;
  }

  /* Empty State Message */
  .empty-state-message {
    text-align: center;
    padding: 3rem 2rem;
    background: rgba(30, 41, 59, 0.4);
    border: 1px dashed rgba(71, 85, 105, 0.5);
    border-radius: 0.75rem;
  }

  .empty-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
    opacity: 0.6;
  }

  .empty-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
    margin: 0 0 0.5rem 0;
  }

  .empty-subtext {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0 0 1.5rem 0;
  }

  .empty-cta {
    display: inline-block;
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #f59e0b, #fbbf24);
    color: white;
    font-weight: 700;
    border-radius: 0.75rem;
    text-decoration: none;
    transition: all 0.2s ease;
    box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
  }

  .empty-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
  }

  /* Details Modal */
  .details-modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    animation: fadeIn 0.2s ease;
  }

  .details-overlay {
    position: absolute;
    inset: 0;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .details-content {
    z-index: 1;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 1rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
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

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 2rem;
    height: 2rem;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 50%;
    color: #94a3b8;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 1;
  }

  .close-btn:hover {
    background: rgba(30, 41, 59, 0.8);
    border-color: #fbbf24;
    color: white;
  }

  .card-display {
    padding: 3rem 1.5rem 1.5rem 1.5rem;
  }

  .card-image {
    width: 100%;
    max-width: 300px;
    height: auto;
    display: block;
    margin: 0 auto 1.5rem auto;
    border-radius: 0.75rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }

  .card-details {
    text-align: center;
  }

  .detail-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin: 0 0 0.25rem 0;
  }

  .detail-subtitle {
    font-size: 1rem;
    color: #94a3b8;
    margin: 0 0 1rem 0;
  }

  .detail-meta {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  .detail-rarity,
  .detail-type {
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    background: rgba(15, 23, 42, 0.8);
    border-radius: 9999px;
  }

  .detail-stats,
  .detail-flavor,
  .detail-abilities {
    text-align: left;
    margin-bottom: 1.5rem;
  }

  .detail-stats h4,
  .detail-flavor h4,
  .detail-abilities h4 {
    font-size: 0.875rem;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 0.75rem 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    background: rgba(15, 23, 42, 0.6);
    border-radius: 0.375rem;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .stat-value {
    font-size: 0.875rem;
    font-weight: 700;
    color: #fbbf24;
  }

  .flavor-text {
    font-size: 0.875rem;
    color: #94a3b8;
    font-style: italic;
    line-height: 1.5;
    margin: 0;
  }

  .ability-item {
    padding: 0.75rem;
    background: rgba(15, 23, 42, 0.6);
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .ability-name {
    display: block;
    font-size: 0.875rem;
    font-weight: 700;
    color: #fbbf24;
    margin-bottom: 0.25rem;
  }

  .ability-desc {
    font-size: 0.8125rem;
    color: #94a3b8;
    line-height: 1.4;
    margin: 0;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .missing-tracker {
      padding: 1rem;
    }

    .completion-count {
      font-size: 1.25rem;
    }

    .section-cards {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .details-content {
      max-height: 95vh;
    }

    .card-image {
      max-width: 250px;
    }
  }
</style>
