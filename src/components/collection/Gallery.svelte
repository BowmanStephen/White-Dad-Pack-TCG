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
    formatCardCount,
    filterCardsByStatRanges,
    filterCardsByHoloVariants,
    filterCardsByAdvancedSearch,
    getDefaultStatRanges,
    areStatRangesDefault,
  } from '../../lib/collection/utils';
  import { SAVED_SEARCH_PRESETS } from '../../lib/collection/presets';
  import type { CollectionDisplayCard, Rarity, DadType, SortOption, PackCard, HoloVariant, StatRanges, SavedSearchPreset } from '../../types';
  import Card from '../card/Card.svelte';
  import CardComparison from '../card/CardComparison.svelte';
  import CollectionGridSkeleton from '../loading/CollectionGridSkeleton.svelte';
  import FadeIn from '../loading/FadeIn.svelte';
  import { RARITY_CONFIG, DAD_TYPE_NAMES, DAD_TYPE_ICONS, SORT_OPTION_CONFIG, STAT_NAMES, STAT_ICONS, HOLO_VARIANT_NAMES, HOLO_VARIANT_ICONS } from '../../types';
  import CardLightbox from '../card/CardLightbox.svelte';
  import { openLightbox } from '../../stores/lightbox';
  import { calculateVisibleRange, getTotalHeight, getEstimatedCardHeight } from '../../lib/utils/virtual-scroll';
  import CollectionSort from './CollectionSort.svelte';

  // State
  let allCards: CollectionDisplayCard[] = [];
  let displayedCards: CollectionDisplayCard[] = [];
  let isInitialLoading = true; // Track initial load for skeleton

  // Virtual scroll state
  let scrollTop = $state(0);
  let virtualState = $state({
    startIndex: 0,
    endIndex: 0,
    offsetY: 0,
    visibleItems: [] as number[],
  });
  let scrollContainer: HTMLDivElement;

  // Filters
  let searchTerm = '';
  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
  let selectedRarity: Rarity | null = null;
  let holoOnly = false;
  let selectedTypes = new Set<DadType>();
  let showTypeFilter = false;

  // ============================================================================
  // ADVANCED SEARCH STATE (US077 - Card Search - Advanced Filters)
  // ============================================================================

  // Advanced search toggles
  let showAdvancedFilters = false;
  let showStatRanges = false;
  let showHoloVariants = false;
  let showSavedSearches = false;

  // Holo variant selection (multi-select)
  let selectedHoloVariants = new Set<HoloVariant>();

  // Stat range filters
  let statRanges: StatRanges = {};

  // Saved searches
  let savedSearches = SAVED_SEARCH_PRESETS;

  // Result count tracking
  let totalFilteredCount = 0;

  // Sort
  let selectedSort: SortOption = 'rarity_desc';
  let cardObtainedDates = new Map<string, Date>();

  // Card comparison state
  let selectedForCompare: PackCard[] = [];
  let showComparison = false;

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

  // Load cards from collection
  function loadCards() {
    const currentCollection = collection.get();
    const uniqueCards = getUniqueCardsWithCounts(currentCollection.packs);
    cardObtainedDates = getCardObtainedDates(currentCollection.packs);
    allCards = sortCardsByOption(uniqueCards, selectedSort, cardObtainedDates);
    applyFilters();
    updateVirtualScroll();
    isInitialLoading = false;
  }

  // Apply all filters
  function applyFilters() {
    let filtered = [...allCards];

    // Apply rarity filter
    filtered = filterCardsByRarity(filtered, selectedRarity);

    // Apply holo filter (legacy - for backward compatibility)
    if (holoOnly && selectedHoloVariants.size === 0) {
      // If legacy holoOnly is set but no new variants, use legacy filter
      filtered = filterCardsByHolo(filtered, holoOnly);
    } else if (selectedHoloVariants.size > 0) {
      // Use new holo variant filter
      filtered = filterCardsByHoloVariants(filtered, selectedHoloVariants);
    }

    // Apply type filter
    filtered = filterCardsByTypes(filtered, selectedTypes);

    // Apply search filter
    filtered = filterCardsBySearch(filtered, searchTerm);

    // Apply stat range filter (US077)
    filtered = filterCardsByStatRanges(filtered, statRanges);

    // Track total filtered count for result indicator
    totalFilteredCount = filtered.length;

    // Set all filtered cards as displayed (virtual scroll will handle rendering)
    displayedCards = filtered;
  }

  // Update virtual scroll state based on container dimensions
  function updateVirtualScroll() {
    if (!scrollContainer) return;

    const cardHeight = getEstimatedCardHeight();
    const containerHeight = scrollContainer.clientHeight;

    virtualState = calculateVisibleRange(scrollTop, {
      itemCount: displayedCards.length,
      itemHeight: cardHeight,
      containerHeight: containerHeight,
      bufferItems: 5,
    });
  }

  // Reset filters and scroll to top
  function resetPagination() {
    scrollTop = 0;
    applyFilters();
    updateVirtualScroll();
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
    resetPagination();
  }

  // Get all dad types as an array for iteration
  const dadTypes: DadType[] = Object.keys(DAD_TYPE_NAMES) as DadType[];

  // ============================================================================
  // CARD COMPARISON FUNCTIONS
  // ============================================================================

  /**
   * Toggle card selection for comparison
   * @param card - The card to select/deselect
   */
  function toggleCardSelection(card: PackCard) {
    const index = selectedForCompare.findIndex(c => c.id === card.id);

    if (index === -1) {
      // Card not selected, add it (max 2 cards)
      if (selectedForCompare.length < 2) {
        selectedForCompare = [...selectedForCompare, card];

        // If we now have 2 cards, show comparison
        if (selectedForCompare.length === 2) {
          showComparison = true;
        }
      } else {
        // Already 2 cards selected, replace first selection
        selectedForCompare = [selectedForCompare[1], card];
        showComparison = true;
      }
    } else {
      // Card already selected, deselect it
      selectedForCompare = selectedForCompare.filter(c => c.id !== card.id);
      showComparison = false;
    }
  }

  /**
   * Check if a card is currently selected for comparison
   * @param card - The card to check
   */
  function isCardSelected(card: PackCard): boolean {
    return selectedForCompare.some(c => c.id === card.id);
  }

  /**
   * Clear all selected cards
   */
  function clearComparison() {
    selectedForCompare = [];
    showComparison = false;
  }

  /**
   * Get selection badge number (1 or 2) for display
   * @param card - The card to check
   */
  function getSelectionNumber(card: PackCard): number | null {
    const index = selectedForCompare.findIndex(c => c.id === card.id);
    return index === -1 ? null : index + 1;
  }

  // Derive comparison cards from selections
  const compareCard1 = $derived(selectedForCompare[0] || null);
  const compareCard2 = $derived(selectedForCompare[1] || null);

  // ============================================================================
  // LIGHTBOX FUNCTIONS (US082 - Card Gallery - Lightbox View)
  // ============================================================================

  /**
   * Handle card click to open lightbox
   * @param card - The card to view in lightbox
   * @param event - The interaction event (to prevent bubbling)
   */
  function handleCardClick(card: PackCard, event: MouseEvent | KeyboardEvent) {
    event.stopPropagation();

    // Convert displayed cards to PackCard array for lightbox navigation
    const allDisplayedCards = displayedCards.map(c => ({
      ...c,
      isRevealed: true,
      isHolo: c.isHolo,
      holoType: c.holoType,
    }));

    // Find the index of the clicked card
    const cardIndex = allDisplayedCards.findIndex(c => c.id === card.id);

    // Open lightbox with the card and navigation list
    openLightbox(card, allDisplayedCards, cardIndex);
  }

  // ============================================================================
  // ADVANCED SEARCH FUNCTIONS (US077 - Card Search - Advanced Filters)
  // ============================================================================

  /**
   * Toggle advanced filters panel
   */
  function toggleAdvancedFilters() {
    showAdvancedFilters = !showAdvancedFilters;
  }

  /**
   * Toggle stat ranges panel
   */
  function toggleStatRanges() {
    showStatRanges = !showStatRanges;
  }

  /**
   * Toggle holo variants panel
   */
  function toggleHoloVariants() {
    showHoloVariants = !showHoloVariants;
  }

  /**
   * Toggle saved searches panel
   */
  function toggleSavedSearches() {
    showSavedSearches = !showSavedSearches;
  }

  /**
   * Update stat range filter
   */
  function updateStatRange(stat: keyof StatRanges, min: number, max: number) {
    statRanges = {
      ...statRanges,
      [stat]: { min, max },
    };
    resetPagination();
  }

  /**
   * Clear stat range filter
   */
  function clearStatRange(stat: keyof StatRanges) {
    const newRanges = { ...statRanges };
    delete newRanges[stat];
    statRanges = newRanges;
    resetPagination();
  }

  /**
   * Toggle holo variant selection
   */
  function toggleHoloVariant(variant: HoloVariant) {
    const newVariants = new Set(selectedHoloVariants);
    if (newVariants.has(variant)) {
      newVariants.delete(variant);
    } else {
      newVariants.add(variant);
    }
    selectedHoloVariants = newVariants;
    // Update legacy holoOnly for backward compatibility
    holoOnly = newVariants.size > 0 && newVariants.has('none') === false;
    resetPagination();
  }

  /**
   * Clear all holo variant selections
   */
  function clearHoloVariants() {
    selectedHoloVariants = new Set();
    holoOnly = false;
    resetPagination();
  }

  /**
   * Apply saved search preset
   */
  function applySavedSearch(preset: SavedSearchPreset) {
    searchTerm = preset.filters.searchTerm;
    selectedRarity = preset.filters.rarity;
    selectedTypes = new Set(preset.filters.selectedTypes);
    selectedHoloVariants = new Set(preset.filters.holoVariants);
    statRanges = { ...preset.filters.statRanges };
    holoOnly = selectedHoloVariants.size > 0 && !selectedHoloVariants.has('none');
    resetPagination();
    showSavedSearches = false;
  }

  /**
   * Clear all filters
   */
  function clearAllFilters() {
    searchTerm = '';
    selectedRarity = null;
    holoOnly = false;
    selectedTypes = new Set();
    selectedHoloVariants = new Set();
    statRanges = {};
    showTypeFilter = false;
    showStatRanges = false;
    showHoloVariants = false;
    resetPagination();
  }

  /**
   * Check if any advanced filters are active
   */
  function hasActiveAdvancedFilters(): boolean {
    return (
      selectedHoloVariants.size > 0 ||
      Object.keys(statRanges).length > 0 ||
      selectedTypes.size > 0 ||
      selectedRarity !== null ||
      searchTerm.length > 0
    );
  }

  /**
   * Get stat keys for iteration
   */
  const statKeys = Object.keys(STAT_NAMES) as Array<keyof typeof STAT_NAMES>;

  /**
   * Get holo variants for iteration
   */
  const holoVariants: HoloVariant[] = Object.keys(HOLO_VARIANT_NAMES) as HoloVariant[];

  // Setup virtual scroll
  onMount(() => {
    initializeFromURL();
    loadCards();

    // Add click outside listener for dropdowns
    document.addEventListener('click', handleClickOutside);

    // Update virtual scroll on resize
    const handleResize = () => {
      updateVirtualScroll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('resize', handleResize);
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
        oninput={handleSearch}
        class="search-input"
      />
      <span class="search-icon">🔍</span>
      {#if searchTerm}
        <button
          class="search-clear"
          onclick={clearSearch}
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
        onclick={() => handleRarityFilter(null)}
      >
        All
      </button>
      {#each Object.keys(RARITY_CONFIG) as rarity}
        <button
          class="filter-button"
          class:active={selectedRarity === rarity}
          style="--rarity-color: {RARITY_CONFIG[rarity as Rarity].color}"
          onclick={() => handleRarityFilter(rarity as Rarity)}
        >
          {RARITY_CONFIG[rarity as Rarity].name}
        </button>
      {/each}
    </div>

    <!-- Holo Filter -->
    <button
      class="holo-filter-button"
      class:active={holoOnly}
      onclick={toggleHoloFilter}
    >
      ✨ Holo Only
    </button>

    <!-- Sort Dropdown (FILTER-003) -->
    <CollectionSort
      selectedSort={selectedSort}
      on:sort={(e) => handleSortChange(e.detail.option)}
    />

    <!-- Type Filter Toggle -->
    <button
      class="type-filter-toggle"
      class:active={showTypeFilter}
      onclick={toggleTypeFilter}
    >
      🏷️ Types {selectedTypes.size > 0 ? `(${selectedTypes.size})` : ''}
    </button>

    <!-- Advanced Filters Toggle (US077) -->
    <button
      class="advanced-filters-toggle"
      class:active={showAdvancedFilters}
      onclick={toggleAdvancedFilters}
    >
      🔧 Advanced
    </button>

    <!-- Clear All Filters Button (US077) -->
    {#if hasActiveAdvancedFilters()}
      <button
        class="clear-all-button"
        onclick={clearAllFilters}
      >
        Clear All
      </button>
    {/if}

    <!-- Result Count Indicator (US077) -->
    {#if totalFilteredCount > 0}
      <div class="result-count">
        {totalFilteredCount} {totalFilteredCount === 1 ? 'card' : 'cards'}
      </div>
    {/if}
  </div>

  <!-- Type Filter Panel (collapsible) -->
  {#if showTypeFilter}
    <div class="type-filter-panel">
      <div class="type-filter-header">
        <h3 class="type-filter-title">Filter by Dad Type</h3>
        {#if selectedTypes.size > 0}
          <button class="clear-types-button" onclick={clearTypeFilters}>
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
            onclick={() => toggleTypeSelection(type)}
          >
            <span class="type-icon">{DAD_TYPE_ICONS[type]}</span>
            <span class="type-name">{DAD_TYPE_NAMES[type]}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- ============================================================================
       ADVANCED FILTERS PANELS (US077 - Card Search - Advanced Filters)
       ============================================================================ -->

  <!-- Advanced Filters Panel -->
  {#if showAdvancedFilters}
    <div class="advanced-filters-panel">
      <div class="advanced-filters-header">
        <h3 class="advanced-filters-title">Advanced Filters</h3>
        <button class="close-advanced-button" onclick={toggleAdvancedFilters}>
          ✕
        </button>
      </div>

      <div class="advanced-filters-grid">
        <!-- Saved Searches Presets -->
        <div class="advanced-filter-section">
          <button
            class="advanced-filter-section-toggle"
            onclick={toggleSavedSearches}
          >
            <span class="section-icon">⭐</span>
            <span class="section-title">Saved Searches</span>
            <span class="section-arrow" class:rotated={showSavedSearches}>▼</span>
          </button>
          {#if showSavedSearches}
            <div class="saved-searches-grid">
              {#each savedSearches as preset}
                <button
                  class="saved-search-preset"
                  onclick={() => applySavedSearch(preset)}
                >
                  <span class="preset-icon">{preset.icon}</span>
                  <div class="preset-info">
                    <span class="preset-name">{preset.name}</span>
                    <span class="preset-description">{preset.description}</span>
                  </div>
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Holo Variants -->
        <div class="advanced-filter-section">
          <button
            class="advanced-filter-section-toggle"
            onclick={toggleHoloVariants}
          >
            <span class="section-icon">✨</span>
            <span class="section-title">Holo Variants</span>
            <span class="section-arrow" class:rotated={showHoloVariants}>▼</span>
            {#if selectedHoloVariants.size > 0}
              <span class="section-count">({selectedHoloVariants.size})</span>
            {/if}
          </button>
          {#if showHoloVariants}
            <div class="holo-variants-grid">
              {#each holoVariants as variant}
                {@const isSelected = selectedHoloVariants.has(variant)}
                <button
                  class="holo-variant-button"
                  class:active={isSelected}
                  onclick={() => toggleHoloVariant(variant)}
                >
                  <span class="variant-icon">{HOLO_VARIANT_ICONS[variant]}</span>
                  <span class="variant-name">{HOLO_VARIANT_NAMES[variant]}</span>
                </button>
              {/each}
              {#if selectedHoloVariants.size > 0}
                <button
                  class="clear-holo-button"
                  onclick={clearHoloVariants}
                >
                  Clear All
                </button>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Stat Ranges -->
        <div class="advanced-filter-section">
          <button
            class="advanced-filter-section-toggle"
            onclick={toggleStatRanges}
          >
            <span class="section-icon">📊</span>
            <span class="section-title">Stat Ranges</span>
            <span class="section-arrow" class:rotated={showStatRanges}>▼</span>
            {#if Object.keys(statRanges).length > 0}
              <span class="section-count">({Object.keys(statRanges).length})</span>
            {/if}
          </button>
          {#if showStatRanges}
            <div class="stat-ranges-grid">
              {#each statKeys as stat}
                {@const range = statRanges[stat]}
                {@const defaultRange = { min: 0, max: 100 }}
                {@const currentMin = range?.min ?? defaultRange.min}
                {@const currentMax = range?.max ?? defaultRange.max}
                {@const isDefault = !range || (range.min === 0 && range.max === 100)}
                <div class="stat-range-control" class:has-filter={!isDefault}>
                  <div class="stat-range-header">
                    <span class="stat-icon">{STAT_ICONS[stat]}</span>
                    <span class="stat-name">{STAT_NAMES[stat]}</span>
                    {#if !isDefault}
                      <button
                        class="clear-stat-button"
                        onclick={() => clearStatRange(stat)}
                        aria-label="Clear {STAT_NAMES[stat]} filter"
                      >
                        ✕
                      </button>
                    {/if}
                  </div>
                  <div class="stat-range-inputs">
                    <div class="stat-range-input-group">
                      <label for="{stat}-min" class="stat-range-label">Min</label>
                      <input
                        id="{stat}-min"
                        type="number"
                        min="0"
                        max="100"
                        value={currentMin}
                        oninput={(e) => updateStatRange(stat, parseInt((e.target as HTMLInputElement).value) || 0, currentMax)}
                        class="stat-range-input"
                      />
                    </div>
                    <div class="stat-range-input-group">
                      <label for="{stat}-max" class="stat-range-label">Max</label>
                      <input
                        id="{stat}-max"
                        type="number"
                        min="0"
                        max="100"
                        value={currentMax}
                        oninput={(e) => updateStatRange(stat, currentMin, parseInt((e.target as HTMLInputElement).value) || 100)}
                        class="stat-range-input"
                      />
                    </div>
                  </div>
                  <div class="stat-range-value">
                    {currentMin} - {currentMax}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
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
  {#if isInitialLoading}
    <!-- Show skeleton while initially loading -->
    <CollectionGridSkeleton count={12} />
  {:else if displayedCards.length > 0}
    <FadeIn duration={300}>
      <!-- Virtual Scroll Container -->
      <div
        bind:this={scrollContainer}
        class="scroll-container"
        onscroll={(e) => {
          const target = e.currentTarget;
          scrollTop = target.scrollTop;
          updateVirtualScroll();
        }}
        role="region"
        aria-label="Card collection grid"
      >
        <!-- Spacer to create total height -->
        <div
          class="scroll-spacer"
          style="height: {getTotalHeight({
            itemCount: displayedCards.length,
            itemHeight: getEstimatedCardHeight(),
            containerHeight: scrollContainer?.clientHeight || 600,
          })}px;"
        ></div>

        <!-- Virtual viewport with offset -->
        <div class="virtual-viewport" style="transform: translateY({virtualState.offsetY}px);">
          <div class="card-grid" class:animate-sort={true}>
            {#each virtualState.visibleItems as index (index)}
              {@const card = displayedCards[index]}
              {@const isSelected = isCardSelected(card)}
              {@const selectionNum = getSelectionNumber(card)}
              <div class="card-wrapper" class:has-duplicate={card.duplicateCount > 1} class:selected={isSelected} onclick={(e) => handleCardClick(card, e)} role="button" tabindex="0" aria-label="View {card.name} in lightbox" onkeydown={(e) => e.key === 'Enter' && handleCardClick(card, e)}>
                <Card
                  {card}
                  size="md"
                  interactive={false}
                  isFlipped={false}
                  showBack={false}
                  enableShare={false}
                />
                {#if card.duplicateCount > 1}
                  <div class="duplicate-badge">
                    {formatCardCount(card.duplicateCount)}
                  </div>
                {/if}
                <!-- Zoom Indicator (appears on hover - US082) -->
                <div class="zoom-badge">
                  <span class="zoom-icon">🔍</span>
                </div>
                <!-- Compare Button (appears on hover) -->
                <button
                  class="compare-badge"
                  class:selected={isSelected}
                  onclick={(e) => {
                    e.stopPropagation();
                    toggleCardSelection(card);
                  }}
                  aria-label="Select for comparison"
                  title="Select for comparison"
                >
                  {#if isSelected}
                    <span class="compare-number">{selectionNum}</span>
                    <span class="compare-icon">✓</span>
                  {:else}
                    <span class="compare-icon">⚔️</span>
                  {/if}
                </button>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </FadeIn>

    <!-- End message for virtual scroll -->
    {#if displayedCards.length > 0}
      <div class="end-message">
        <p>🎉 Showing {virtualState.visibleItems.length} of {displayedCards.length} cards</p>
      </div>
    {/if}
  {/if}
</div>

<!-- Card Comparison Modal -->
<CardComparison
  card1={compareCard1}
  card2={compareCard2}
  isOpen={showComparison}
  on:close={() => {
    showComparison = false;
  }}
/>

<!-- Card Lightbox (US082) -->
<CardLightbox />

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
    min-width: 2.75rem;
    min-height: 2.75rem;
    width: 2.75rem;
    height: 2.75rem;
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

  /* Virtual Scroll Container */
  .scroll-container {
    position: relative;
    overflow-y: auto;
    max-height: calc(100vh - 400px); /* Leave room for filters */
    overflow-x: hidden;
  }

  .scroll-spacer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    pointer-events: none;
  }

  .virtual-viewport {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    will-change: transform;
  }

  /* Card Grid - Responsive with 2/4/6 columns */
  .card-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    padding: 0.75rem;
  }

  /* Mobile landscape (3 columns) */
  @media (min-width: 480px) and (max-width: 767px) {
    .card-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      padding: 1rem;
    }
  }

  /* Tablet: 4 columns */
  @media (min-width: 768px) {
    .card-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
      padding: 1.25rem;
    }

    .scroll-container {
      max-height: calc(100vh - 350px);
    }
  }

  /* Small desktop: 5 columns */
  @media (min-width: 1024px) {
    .card-grid {
      grid-template-columns: repeat(5, 1fr);
      gap: 1.5rem;
      padding: 1.5rem;
    }

    .scroll-container {
      max-height: calc(100vh - 300px);
    }
  }

  /* Large desktop: 6 columns */
  @media (min-width: 1280px) {
    .card-grid {
      grid-template-columns: repeat(6, 1fr);
      gap: 1.75rem;
      padding: 1.75rem;
    }
  }

  /* Extra large screens: 7 columns for ultra-wide displays */
  @media (min-width: 1536px) {
    .card-grid {
      grid-template-columns: repeat(7, 1fr);
      gap: 2rem;
      padding: 2rem;
    }
  }

  /* Card wrapper - ensures cards scale with grid */
  .card-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 4; /* Standard trading card ratio */
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .card-wrapper :global(.card-perspective) {
    width: 100% !important;
    height: 100% !important;
  }

  /* Make card content responsive */
  .card-wrapper :global(.card-container) {
    width: 100%;
    height: 100%;
  }

  .card-wrapper:hover {
    transform: scale(1.05);
    z-index: 5;
  }

  .card-wrapper:focus {
    outline: 2px solid #fbbf24;
    outline-offset: 2px;
    border-radius: 0.5rem;
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

  /* Zoom Badge (US082 - Lightbox indicator) */
  .zoom-badge {
    position: absolute;
    bottom: 0.5rem;
    left: 0.5rem;
    width: 2rem;
    height: 2rem;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border: 2px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    z-index: 15;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.2s ease;
  }

  .card-wrapper:hover .zoom-badge {
    opacity: 1;
    transform: scale(1);
  }

  .zoom-icon {
    font-size: 0.875rem;
    line-height: 1;
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

  .end-message {
    display: flex;
    justify-content: center;
    padding: 1rem;
    color: #94a3b8;
    font-size: 0.875rem;
    background: rgba(15, 23, 42, 0.5);
    border-radius: 0.5rem;
    margin-top: 1rem;
  }

  /* ============================================================================
     COMPARE BADGE STYLES
     ============================================================================ */

  .card-wrapper {
    position: relative;
  }

  .card-wrapper.selected :global(.card-perspective) {
    border-radius: 0.5rem;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.6);
  }

  .compare-badge {
    position: absolute;
    top: -0.5rem;
    left: -0.5rem;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border: 2px solid white;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
    z-index: 20;
    opacity: 0;
    transform: scale(0.8);
  }

  .card-wrapper:hover .compare-badge,
  .compare-badge.selected {
    opacity: 1;
    transform: scale(1);
  }

  .compare-badge:hover {
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    transform: scale(1.1);
  }

  .compare-badge.selected {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.5);
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 4px 12px rgba(251, 191, 36, 0.5);
    }
    50% {
      box-shadow: 0 4px 16px rgba(251, 191, 36, 0.7);
    }
  }

  .compare-icon {
    line-height: 1;
  }

  .compare-number {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 14px;
    height: 14px;
    background: #ef4444;
    border-radius: 50%;
    font-size: 0.625rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid white;
  }

  /* ============================================================================
     ADVANCED SEARCH STYLES (US077 - Card Search - Advanced Filters)
     ============================================================================ */

  /* Advanced Filters Toggle Button */
  .advanced-filters-toggle {
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

  .advanced-filters-toggle:hover {
    background: rgba(51, 65, 85, 0.8);
    color: white;
  }

  .advanced-filters-toggle.active {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.2));
    border-color: #a855f7;
    color: #a855f7;
    box-shadow: 0 0 15px rgba(168, 85, 247, 0.3);
  }

  /* Clear All Button */
  .clear-all-button {
    padding: 0.5rem 1rem;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.5);
    border-radius: 0.5rem;
    color: #ef4444;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .clear-all-button:hover {
    background: rgba(239, 68, 68, 0.3);
    border-color: #ef4444;
  }

  /* Result Count Indicator */
  .result-count {
    padding: 0.5rem 1rem;
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.5);
    border-radius: 0.5rem;
    color: #22c55e;
    font-size: 0.75rem;
    font-weight: 600;
  }

  /* Advanced Filters Panel */
  .advanced-filters-panel {
    padding: 1rem;
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(168, 85, 247, 0.3);
    border-radius: 0.75rem;
    margin-bottom: 1rem;
    backdrop-filter: blur(12px);
    animation: slideDown 0.3s ease-out;
    box-shadow: 0 10px 40px rgba(168, 85, 247, 0.1);
  }

  .advanced-filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(168, 85, 247, 0.2);
  }

  .advanced-filters-title {
    font-size: 1rem;
    font-weight: 600;
    color: #a855f7;
    margin: 0;
  }

  .close-advanced-button {
    padding: 0.25rem 0.5rem;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.5);
    border-radius: 0.375rem;
    color: #ef4444;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .close-advanced-button:hover {
    background: rgba(239, 68, 68, 0.3);
  }

  .advanced-filters-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Advanced Filter Section */
  .advanced-filter-section {
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .advanced-filter-section-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 0.875rem;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
  }

  .advanced-filter-section-toggle:hover {
    background: rgba(51, 65, 85, 0.5);
    color: white;
  }

  .section-icon {
    font-size: 1rem;
    line-height: 1;
  }

  .section-title {
    flex: 1;
  }

  .section-arrow {
    font-size: 0.6rem;
    transition: transform 0.2s;
  }

  .section-arrow.rotated {
    transform: rotate(180deg);
  }

  .section-count {
    padding: 0.125rem 0.5rem;
    background: rgba(251, 191, 36, 0.2);
    border-radius: 9999px;
    color: #fbbf24;
    font-size: 0.7rem;
    font-weight: 700;
  }

  /* Saved Searches Grid */
  .saved-searches-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(15, 23, 42, 0.5);
  }

  @media (min-width: 768px) {
    .saved-searches-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .saved-search-preset {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    padding: 0.75rem 0.5rem;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 0.5rem;
    color: #94a3b8;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
    min-height: 80px;
  }

  .saved-search-preset:hover {
    background: rgba(51, 65, 85, 0.8);
    color: white;
    border-color: rgba(251, 191, 36, 0.5);
    transform: translateY(-2px);
  }

  .preset-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  .preset-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .preset-name {
    font-weight: 700;
  }

  .preset-description {
    font-size: 0.6rem;
    opacity: 0.7;
    line-height: 1.2;
  }

  /* Holo Variants Grid */
  .holo-variants-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(15, 23, 42, 0.5);
  }

  @media (min-width: 640px) {
    .holo-variants-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .holo-variant-button {
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

  .holo-variant-button:hover {
    background: rgba(51, 65, 85, 0.8);
    color: white;
    border-color: rgba(168, 85, 247, 0.5);
  }

  .holo-variant-button.active {
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(168, 85, 247, 0.2));
    border-color: #ec4899;
    color: #ec4899;
    box-shadow: 0 0 12px rgba(236, 72, 153, 0.3);
  }

  .variant-icon {
    font-size: 1.25rem;
    line-height: 1;
  }

  .variant-name {
    font-size: 0.6rem;
    text-align: center;
    line-height: 1.1;
    word-break: break-word;
  }

  .clear-holo-button {
    grid-column: 1 / -1;
    padding: 0.5rem;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.5);
    border-radius: 0.375rem;
    color: #ef4444;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .clear-holo-button:hover {
    background: rgba(239, 68, 68, 0.3);
  }

  /* Stat Ranges Grid */
  .stat-ranges-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(15, 23, 42, 0.5);
  }

  @media (min-width: 640px) {
    .stat-ranges-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .stat-ranges-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .stat-range-control {
    padding: 0.75rem;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 0.5rem;
    transition: all 0.2s;
  }

  .stat-range-control.has-filter {
    border-color: #22c55e;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
  }

  .stat-range-header {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-bottom: 0.5rem;
  }

  .stat-icon {
    font-size: 1rem;
    line-height: 1;
  }

  .stat-name {
    flex: 1;
    font-size: 0.7rem;
    font-weight: 600;
    color: white;
  }

  .clear-stat-button {
    padding: 0.125rem 0.375rem;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.5);
    border-radius: 9999px;
    color: #ef4444;
    font-size: 0.6rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .clear-stat-button:hover {
    background: rgba(239, 68, 68, 0.3);
  }

  .stat-range-inputs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .stat-range-input-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-range-label {
    font-size: 0.6rem;
    color: #94a3b8;
  }

  .stat-range-input {
    width: 100%;
    padding: 0.375rem;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 0.375rem;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    text-align: center;
    transition: all 0.2s;
  }

  .stat-range-input:focus {
    outline: none;
    border-color: #22c55e;
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
  }

  .stat-range-input::placeholder {
    color: #64748b;
  }

  .stat-range-value {
    text-align: center;
    font-size: 0.7rem;
    font-weight: 700;
    color: #22c55e;
  }
</style>
