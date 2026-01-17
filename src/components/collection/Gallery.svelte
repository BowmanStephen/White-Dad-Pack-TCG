<script lang="ts">
  import { onMount } from 'svelte';
  import { collection } from '../../stores/collection';
  import {
    getUniqueCardsWithCounts,
    sortCardsByRarityAndName,
    sortCardsByOption,
    getCardObtainedDates,
    filterCardsBySearch,
    filterCardsByRarity,
    filterCardsByHolo,
    filterCardsByTypes,
    getPaginatedCards,
    formatCardCount,
  } from '../../lib/collection/utils';
  import type { CollectionDisplayCard, Rarity, DadType, SortOption } from '../../types';
  import Card from '../card/Card.svelte';
  import { RARITY_CONFIG, DAD_TYPE_NAMES, DAD_TYPE_ICONS, SORT_OPTION_CONFIG } from '../../types';

  // State
  let allCards: CollectionDisplayCard[] = [];
  let displayedCards: CollectionDisplayCard[] = [];
  let page = 0;
  const pageSize = 24; // Load 24 cards at a time
  let hasMore = false;
  let isLoading = false;

  // Filters
  let searchTerm = '';
  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
  let selectedRarity: Rarity | null = null;
  let holoOnly = false;
  let selectedTypes = new Set<DadType>();
  let showTypeFilter = false;

  // Sort
  let selectedSort: SortOption = 'rarity_desc';
  let showSortDropdown = false;
  let cardObtainedDates = new Map<string, Date>();

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

    const sortParam = getQueryParam('sort');
    if (sortParam && Object.keys(SORT_OPTION_CONFIG).includes(sortParam)) {
      selectedSort = sortParam as SortOption;
    }
  }

  // Intersection observer for infinite scroll
  let loadMoreTrigger: HTMLDivElement;
  let observer: IntersectionObserver | null = null;

  // Load cards from collection
  function loadCards() {
    const currentCollection = collection.get();
    const uniqueCards = getUniqueCardsWithCounts(currentCollection.packs);
    cardObtainedDates = getCardObtainedDates(currentCollection.packs);
    allCards = sortCardsByOption(uniqueCards, selectedSort, cardObtainedDates);
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
    let filtered = sortCardsByOption(uniqueCards, selectedSort, cardObtainedDates);

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

  // Handle search input with debounce
  function handleSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    searchTerm = target.value;

    // Clear existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set new timeout for 300ms debounce
    debounceTimeout = setTimeout(() => {
      resetPagination();
    }, 300);
  }

  // Clear search
  function clearSearch() {
    searchTerm = '';
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

  // Handle sort selection
  function handleSortChange(sortOption: SortOption) {
    selectedSort = sortOption;
    setQueryParam('sort', sortOption);
    showSortDropdown = false;
    resetPagination();
  }

  // Toggle sort dropdown
  function toggleSortDropdown() {
    showSortDropdown = !showSortDropdown;
  }

  // Close sort dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.sort-dropdown-container')) {
      showSortDropdown = false;
    }
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

    // Add click outside listener for dropdowns
    document.addEventListener('click', handleClickOutside);

    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      document.removeEventListener('click', handleClickOutside);
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
      {#if searchTerm}
        <button
          class="search-clear"
          on:click={clearSearch}
          aria-label="Clear search"
          type="button"
        >✕</button>
      {/if}
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

    <!-- Sort Dropdown -->
    <div class="sort-dropdown-container">
      <button
        class="sort-button"
        class:active={showSortDropdown}
        on:click={toggleSortDropdown}
      >
        <span class="sort-icon">📶</span>
        <span class="sort-label">{SORT_OPTION_CONFIG[selectedSort].name}</span>
        <span class="sort-arrow" class:rotated={showSortDropdown}>▼</span>
      </button>
      {#if showSortDropdown}
        <div class="sort-dropdown-menu">
          {#each Object.entries(SORT_OPTION_CONFIG) as [key, config]}
            {@const option = key as SortOption}
            <button
              class="sort-option"
              class:selected={selectedSort === option}
              on:click={() => handleSortChange(option)}
            >
              <span class="sort-option-name">{config.name}</span>
              <span class="sort-option-desc">{config.description}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>

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
    <div class="card-grid" class:animate-sort={true}>
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
    padding-right: 2.5rem;
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

  .search-clear {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(71, 85, 105, 0.5);
    border: none;
    border-radius: 50%;
    width: 1.25rem;
    height: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    padding: 0;
  }

  .search-clear:hover {
    background: rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  .search-clear:active {
    transform: translateY(-50%) scale(0.95);
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

  /* Sort Dropdown */
  .sort-dropdown-container {
    position: relative;
  }

  .sort-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

  .sort-button:hover {
    background: rgba(51, 65, 85, 0.8);
    color: white;
    border-color: rgba(251, 191, 36, 0.5);
  }

  .sort-button.active {
    background: rgba(251, 191, 36, 0.2);
    border-color: #fbbf24;
    color: #fbbf24;
  }

  .sort-icon {
    font-size: 1rem;
    line-height: 1;
  }

  .sort-label {
    flex: 1;
    text-align: left;
  }

  .sort-arrow {
    font-size: 0.6rem;
    transition: transform 0.2s;
  }

  .sort-arrow.rotated {
    transform: rotate(180deg);
  }

  .sort-dropdown-menu {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    min-width: 200px;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 0.75rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(12px);
    z-index: 100;
    animation: fadeIn 0.2s ease-out;
    overflow: hidden;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .sort-option {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.125rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(71, 85, 105, 0.2);
    color: #94a3b8;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
  }

  .sort-option:last-child {
    border-bottom: none;
  }

  .sort-option:hover {
    background: rgba(51, 65, 85, 0.5);
    color: white;
  }

  .sort-option.selected {
    background: rgba(251, 191, 36, 0.2);
    color: #fbbf24;
  }

  .sort-option-name {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .sort-option-desc {
    font-size: 0.7rem;
    opacity: 0.7;
  }

  .sort-option.selected .sort-option-desc {
    opacity: 1;
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

  /* Card reordering animation */
  .card-grid.animate-sort .card-wrapper {
    animation: cardReorder 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes cardReorder {
    0% {
      opacity: 0;
      transform: scale(0.9) translateY(20px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
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
