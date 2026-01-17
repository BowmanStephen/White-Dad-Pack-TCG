<script lang="ts">
  import { onMount } from 'svelte';
  import { collection } from '../../stores/collection';
  import { getCollectionStats } from '../../stores/collection';
  import {
    getUniqueCardsWithCounts,
    sortCardsByRarityAndName,
    filterCardsBySearch,
    filterCardsByRarity,
    filterCardsByHolo,
    filterCardsByTypes,
    getPaginatedCards,
    formatCardCount,
  } from '../../lib/collection/utils';
  import type { CollectionDisplayCard, Rarity, DadType } from '../../types';
  import Card from '../card/Card.svelte';
  import { RARITY_CONFIG, DAD_TYPE_NAMES, DAD_TYPE_ICONS } from '../../types';

  // State
  let allCards: CollectionDisplayCard[] = [];
  let displayedCards: CollectionDisplayCard[] = [];
  let page = 0;
  const pageSize = 24; // Load 24 cards at a time
  let hasMore = false;
  let isLoading = false;

  // Filters
  let searchTerm = '';
  let selectedRarity: Rarity | null = null;
  let holoOnly = false;
  let selectedTypes = new Set<DadType>();
  let showTypeFilter = false;

  // URL query param helpers
  function getQueryParam(param: string): string | null {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  }

  function getQueryParamArray(param: string): string[] {
    if (typeof window === 'undefined') return [];
    const params = new URLSearchParams(window.location.search);
    const value = params.get(param);
    return value ? value.split(',').map(v => v.trim()) : [];
  }

  function setQueryParam(param: string, value: string | null) {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (value === null) {
      url.searchParams.delete(param);
    } else {
      url.searchParams.set(param, value);
    }
    window.history.replaceState({}, '', url.toString());
  }

  function setQueryParamArray(param: string, values: string[]) {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (values.length === 0) {
      url.searchParams.delete(param);
    } else {
      url.searchParams.set(param, values.join(','));
    }
    window.history.replaceState({}, '', url.toString());
  }

  function initializeFromURL() {
    const rarityParam = getQueryParam('rarity');
    if (rarityParam && Object.keys(RARITY_CONFIG).includes(rarityParam)) {
      selectedRarity = rarityParam as Rarity;
    }

    const typeParam = getQueryParamArray('type');
    const validTypes = typeParam.filter((t): t is DadType => Object.keys(DAD_TYPE_NAMES).includes(t));
    if (validTypes.length > 0) {
      selectedTypes = new Set(validTypes);
      showTypeFilter = true;
    }
  }

  // Stats
  let stats = $derived(getCollectionStats());

  // Intersection observer for infinite scroll
  let loadMoreTrigger: HTMLDivElement;
  let observer: IntersectionObserver | null = null;

  // Load cards from collection
  function loadCards() {
    const currentCollection = collection.get();
    const uniqueCards = getUniqueCardsWithCounts(currentCollection.packs);
    allCards = sortCardsByRarityAndName(uniqueCards);
    applyFilters();
  }

  // Apply all filters
  function applyFilters() {
    let filtered = [...allCards];

    // Apply rarity filter
    filtered = filterCardsByRarity(filtered, selectedRarity);

    // Apply holo filter
    filtered = filterCardsByHolo(filtered, holoOnly);

    // Apply type filter
    filtered = filterCardsByTypes(filtered, selectedTypes);

    // Apply search filter
    filtered = filterCardsBySearch(filtered, searchTerm);

    // Paginate
    const result = getPaginatedCards(filtered, page, pageSize);
    displayedCards = result.cards;
    hasMore = result.hasMore;
  }

  // Load more cards (infinite scroll)
  function loadMore() {
    if (isLoading || !hasMore) return;

    isLoading = true;
    page++;

    const currentCollection = collection.get();
    const uniqueCards = getUniqueCardsWithCounts(currentCollection.packs);
    let filtered = sortCardsByRarityAndName(uniqueCards);

    // Apply all filters
    filtered = filterCardsByRarity(filtered, selectedRarity);
    filtered = filterCardsByHolo(filtered, holoOnly);
    filtered = filterCardsByTypes(filtered, selectedTypes);
    filtered = filterCardsBySearch(filtered, searchTerm);

    const result = getPaginatedCards(filtered, page, pageSize);
    displayedCards = [...displayedCards, ...result.cards];
    hasMore = result.hasMore;

    isLoading = false;
  }

  // Reset pagination when filters change
  function resetPagination() {
    page = 0;
    displayedCards = [];
    hasMore = false;
    applyFilters();
  }

  // Handle search input
  function handleSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    searchTerm = target.value;
    resetPagination();
  }

  // Handle rarity filter change
  function handleRarityFilter(rarity: Rarity | null) {
    selectedRarity = rarity;
    setQueryParam('rarity', rarity);
    resetPagination();
  }

  // Toggle holo filter
  function toggleHoloFilter() {
    holoOnly = !holoOnly;
    resetPagination();
  }

  // Handle type filter toggle
  function toggleTypeFilter() {
    showTypeFilter = !showTypeFilter;
  }

  // Handle type selection
  function toggleTypeSelection(type: DadType) {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    selectedTypes = newTypes;
    setQueryParamArray('type', Array.from(newTypes));
    resetPagination();
  }

  // Clear all type filters
  function clearTypeFilters() {
    selectedTypes = new Set();
    setQueryParamArray('type', []);
    resetPagination();
  }

  // Get all dad types as an array for iteration
  const dadTypes: DadType[] = Object.keys(DAD_TYPE_NAMES) as DadType[];

  // Setup intersection observer for infinite scroll
  onMount(() => {
    initializeFromURL();
    loadCards();

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoading) {
            loadMore();
          }
        },
        { rootMargin: '200px' }
      );

      if (loadMoreTrigger) {
        observer.observe(loadMoreTrigger);
      }
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  });

  // Subscribe to collection changes
  $effect(() => {
    // Re-run when collection changes
    collection.get();
    loadCards();
  });
</script>

<div class="gallery-container">
  <!-- Filters Bar -->
  <div class="filters-bar">
    <!-- Search -->
    <div class="search-box">
      <input
        type="text"
        placeholder="Search cards..."
        value={searchTerm}
        on:input={handleSearch}
        class="search-input"
      />
      <span class="search-icon">🔍</span>
    </div>

    <!-- Rarity Filter -->
    <div class="filter-group">
      <button
        class="filter-button"
        class:active={selectedRarity === null}
        on:click={() => handleRarityFilter(null)}
      >
        All
      </button>
      {#each Object.keys(RARITY_CONFIG) as rarity}
        <button
          class="filter-button"
          class:active={selectedRarity === rarity}
          style="--rarity-color: {RARITY_CONFIG[rarity as Rarity].color}"
          on:click={() => handleRarityFilter(rarity as Rarity)}
        >
          {RARITY_CONFIG[rarity as Rarity].name}
        </button>
      {/each}
    </div>

    <!-- Holo Filter -->
    <button
      class="holo-filter-button"
      class:active={holoOnly}
      on:click={toggleHoloFilter}
    >
      ✨ Holo Only
    </button>

    <!-- Type Filter Toggle -->
    <button
      class="type-filter-toggle"
      class:active={showTypeFilter}
      on:click={toggleTypeFilter}
    >
      🏷️ Types {selectedTypes.size > 0 ? `(${selectedTypes.size})` : ''}
    </button>
  </div>

  <!-- Type Filter Panel (collapsible) -->
  {#if showTypeFilter}
    <div class="type-filter-panel">
      <div class="type-filter-header">
        <h3 class="type-filter-title">Filter by Dad Type</h3>
        {#if selectedTypes.size > 0}
          <button class="clear-types-button" on:click={clearTypeFilters}>
            Clear All
          </button>
        {/if}
      </div>
      <div class="type-grid">
        {#each dadTypes as type}
          {@const isSelected = selectedTypes.has(type)}
          <button
            class="type-button"
            class:active={isSelected}
            on:click={() => toggleTypeSelection(type)}
          >
            <span class="type-icon">{DAD_TYPE_ICONS[type]}</span>
            <span class="type-name">{DAD_TYPE_NAMES[type]}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Stats Bar -->
  <div class="stats-bar">
    <div class="stat-item">
      <span class="stat-value">{stats.totalCards}</span>
      <span class="stat-label">Total Cards</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">{stats.uniqueCards}</span>
      <span class="stat-label">Unique</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">{stats.totalPacks}</span>
      <span class="stat-label">Packs Opened</span>
    </div>
    <div class="stat-item">
      <span class="stat-value" style="color: {RARITY_CONFIG.legendary.color}">
        {stats.legendaryPulls + stats.mythicPulls}
      </span>
      <span class="stat-label">Legendary+</span>
    </div>
    <div class="stat-item">
      <span class="stat-value" style="color: {RARITY_CONFIG.mythic.color}">
        {stats.mythicPulls}
      </span>
      <span class="stat-label">Mythic</span>
    </div>
  </div>

  <!-- Empty State -->
  {#if displayedCards.length === 0 && allCards.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📦</div>
      <h2 class="empty-title">No cards yet!</h2>
      <p class="empty-description">
        Open some packs to start building your collection.
      </p>
      <a href="/pack" class="empty-cta">Open Your First Pack</a>
    </div>
  {:else if displayedCards.length === 0}
    <div class="empty-state">
      <div class="empty-icon">🔍</div>
      <h2 class="empty-title">No cards found</h2>
      <p class="empty-description">
        Try adjusting your filters or search terms.
      </p>
    </div>
  {/if}

  <!-- Card Grid -->
  {#if displayedCards.length > 0}
    <div class="card-grid">
      {#each displayedCards as card (card.id)}
        <div class="card-wrapper" class:has-duplicate={card.duplicateCount > 1}>
          <Card
            {card}
            size="md"
            interactive={true}
            isFlipped={false}
            showBack={false}
            enableShare={false}
          />
          {#if card.duplicateCount > 1}
            <div class="duplicate-badge">
              {formatCardCount(card.duplicateCount)}
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Loading Trigger (for infinite scroll) -->
    {#if hasMore}
      <div
        bind:this={loadMoreTrigger}
        class="load-more-trigger"
        role="status"
        aria-live="polite"
      >
        {#if isLoading}
          <div class="loading-spinner">
            <span class="spinner"></span>
            <span>Loading more cards...</span>
          </div>
        {:else}
          <span class="load-more-hint">Scroll down to load more</span>
        {/if}
      </div>
    {:else if displayedCards.length > 0}
      <div class="end-message">
        <p>🎉 You've reached the end of your collection!</p>
      </div>
    {/if}
  {/if}
</div>

<style>
  .gallery-container {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem;
  }

  /* Filters Bar */
  .filters-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1rem;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.75rem;
    margin-bottom: 1rem;
    backdrop-filter: blur(8px);
  }

  .search-box {
    position: relative;
    flex: 1;
    min-width: 200px;
  }

  .search-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 0.5rem;
    color: white;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: #fbbf24;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
  }

  .search-input::placeholder {
    color: #94a3b8;
  }

  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }

  .filter-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .filter-button {
    padding: 0.5rem 1rem;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 0.5rem;
    color: #94a3b8;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .filter-button:hover {
    background: rgba(51, 65, 85, 0.8);
    color: white;
  }

  .filter-button.active {
    background: var(--rarity-color, #fbbf24);
    border-color: var(--rarity-color, #fbbf24);
    color: white;
    box-shadow: 0 0 15px var(--rarity-color, rgba(251, 191, 36, 0.3));
  }

  .holo-filter-button {
    padding: 0.5rem 1rem;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 0.5rem;
    color: #94a3b8;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .holo-filter-button:hover {
    background: rgba(51, 65, 85, 0.8);
    color: white;
  }

  .holo-filter-button.active {
    background: linear-gradient(135deg, #ec4899, #a855f7);
    border-color: #ec4899;
    color: white;
    box-shadow: 0 0 15px rgba(236, 72, 153, 0.3);
  }

  .type-filter-toggle {
    padding: 0.5rem 1rem;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 0.5rem;
    color: #94a3b8;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .type-filter-toggle:hover {
    background: rgba(51, 65, 85, 0.8);
    color: white;
  }

  .type-filter-toggle.active {
    background: rgba(251, 191, 36, 0.2);
    border-color: #fbbf24;
    color: #fbbf24;
  }

  /* Type Filter Panel */
  .type-filter-panel {
    padding: 1rem;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.75rem;
    margin-bottom: 1rem;
    backdrop-filter: blur(8px);
    animation: slideDown 0.2s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .type-filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .type-filter-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
    margin: 0;
  }

  .clear-types-button {
    padding: 0.25rem 0.75rem;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.5);
    border-radius: 0.375rem;
    color: #ef4444;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .clear-types-button:hover {
    background: rgba(239, 68, 68, 0.3);
    border-color: #ef4444;
  }

  .type-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }

  @media (min-width: 640px) {
    .type-grid {
      grid-template-columns: repeat(8, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .type-grid {
      grid-template-columns: repeat(8, 1fr);
      gap: 0.75rem;
    }
  }

  .type-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.75rem 0.5rem;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 0.5rem;
    color: #94a3b8;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    min-height: 70px;
  }

  .type-button:hover {
    background: rgba(51, 65, 85, 0.8);
    color: white;
    border-color: rgba(71, 85, 105, 0.8);
  }

  .type-button.active {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.1));
    border-color: #fbbf24;
    color: #fbbf24;
    box-shadow: 0 0 12px rgba(251, 191, 36, 0.3);
  }

  .type-icon {
    font-size: 1.25rem;
    line-height: 1;
  }

  .type-name {
    font-size: 0.6rem;
    text-align: center;
    line-height: 1.1;
    word-break: break-word;
  }

  /* Stats Bar */
  .stats-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    padding: 1rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.2);
    border-radius: 0.75rem;
    margin-bottom: 2rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
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

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.5rem;
  }

  .empty-description {
    font-size: 1rem;
    color: #94a3b8;
    margin-bottom: 2rem;
  }

  .empty-cta {
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #f59e0b, #fbbf24);
    color: white;
    font-weight: 700;
    border-radius: 0.75rem;
    text-decoration: none;
    transition: all 0.2s;
    box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
  }

  .empty-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
  }

  /* Card Grid */
  .card-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  /* Tablet: 4 columns */
  @media (min-width: 768px) {
    .card-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }
  }

  /* Desktop: 6 columns */
  @media (min-width: 1024px) {
    .card-grid {
      grid-template-columns: repeat(6, 1fr);
      gap: 2rem;
    }
  }

  .card-wrapper {
    position: relative;
  }

  .card-wrapper.has-duplicate :global(.card-perspective) {
    /* Extra visual indicator for duplicates */
  }

  .duplicate-badge {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    padding: 0.25rem 0.5rem;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: 9999px;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
    z-index: 10;
    min-width: 2rem;
    text-align: center;
  }

  /* Load More Trigger */
  .load-more-trigger {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    min-height: 100px;
  }

  .loading-spinner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #94a3b8;
  }

  .spinner {
    display: inline-block;
    width: 1.5rem;
    height: 1.5rem;
    border: 3px solid rgba(251, 191, 36, 0.2);
    border-top-color: #fbbf24;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .load-more-hint {
    color: #64748b;
    font-size: 0.875rem;
  }

  .end-message {
    display: flex;
    justify-content: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.875rem;
  }
</style>
