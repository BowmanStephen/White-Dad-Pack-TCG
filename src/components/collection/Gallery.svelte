<script lang="ts">
  import { onMount } from 'svelte';
  import { collection } from '@/stores/collection';
  import {
    getUniqueCardsWithCounts,
    sortCardsByOption,
    getCardObtainedDates,
  } from '@/lib/collection/utils';
  import { FilterManager } from '@/lib/collection/filter-manager';
  import type { CollectionDisplayCard, Rarity, DadType, SortOption, PackCard, HoloVariant, StatRanges, SavedSearchPreset } from '@/types';
  import CardComparison from '@components/card/CardComparison.svelte';
  import CardLightbox from '@components/card/CardLightbox.svelte';
  import CardDetailModal from '@components/collection/CardDetailModal.svelte';
  import { openDetailModal, isDetailModalOpen, detailModalCard } from '@/stores/card-detail-modal';
  import { subscribeToStores } from '@/lib/utils/store-helpers';
  import {
    initializeGalleryFiltersFromURL,
    syncFiltersToURL,
  } from '@/lib/utils/url-params';

  // Extracted components
  import FilterPanel from '@components/collection/FilterPanel.svelte';
  import CardGrid from '@components/collection/CardGrid.svelte';

  // State
  let allCards = $state<CollectionDisplayCard[]>([]);
  let displayedCards = $state<CollectionDisplayCard[]>([]);
  let isInitialLoading = $state(true);

  // Filter manager (consolidated filter state and logic)
  let filterManager = new FilterManager();
  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

  // Result count tracking
  let totalFilteredCount = $state(0);

  // Obtained dates mapping
  let cardObtainedDates = new Map<string, Date>();

  // Card comparison state
  let selectedForCompare = $state<PackCard[]>([]);
  let showComparison = $state(false);

  // Detail modal store state
  let isDetailOpen = $state(isDetailModalOpen.get());
  let detailCard = $state<PackCard | null>(detailModalCard.get());
  let unsubscribeStores: (() => void) | null = null;

  // Reactive getter for filter state (re-runs when filterManager changes)
  function getFilterState() {
    return filterManager.getState();
  }

  // Derived state from FilterManager
  let filterState = $derived(getFilterState());
  let searchTerm = $derived(filterState.searchTerm);
  let selectedRarity = $derived(filterState.rarity);
  let selectedTypes = $derived(filterState.types);
  let holoOnly = $derived(filterState.holoOnly);
  let selectedHoloVariants = $derived(filterState.selectedHoloVariants);
  let selectedSort = $derived(filterState.sort);
  let statRanges = $derived(filterState.statRanges);
  let abilitiesMode = $derived(filterState.abilitiesMode);

  // Check if any filters are active
  let hasActiveFilters = $derived(
    selectedHoloVariants.size > 0 ||
    Object.keys(statRanges).length > 0 ||
    selectedTypes.size > 0 ||
    selectedRarity !== null ||
    searchTerm.length > 0
  );

  function initializeFromURL() {
    const { rarity, types, sort } = initializeGalleryFiltersFromURL();

    filterManager.updateState({
      rarity,
      types,
      sort,
    });
  }

  // Load cards from collection
  function loadCards() {
    const currentCollection = collection.get();
    const uniqueCards = getUniqueCardsWithCounts(currentCollection.packs);
    cardObtainedDates = getCardObtainedDates(currentCollection.packs);
    const state = filterManager.getState();
    allCards = sortCardsByOption(uniqueCards, state.sort, cardObtainedDates);
    applyFilters();
    isInitialLoading = false;
  }

  // Apply all filters using FilterManager
  function applyFilters() {
    const filtered = filterManager.applyFilters(allCards);
    totalFilteredCount = filtered.length;
    displayedCards = filtered;
  }

  // Reset pagination and apply filters
  function resetPagination() {
    applyFilters();
  }

  // ============================================================================
  // FILTER EVENT HANDLERS (from FilterPanel)
  // ============================================================================

  function handleSearch(event: CustomEvent<{ value: string }>) {
    filterManager.updateState({ searchTerm: event.detail.value });

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(() => {
      resetPagination();
    }, 300);
  }

  function handleClearSearch() {
    filterManager.updateState({ searchTerm: '' });
    resetPagination();
  }

  function handleRarityFilter(event: CustomEvent<{ rarity: Rarity | null }>) {
    filterManager.updateState({ rarity: event.detail.rarity });
    syncFiltersToURL({ rarity: event.detail.rarity });
    resetPagination();
  }

  function handleToggleHolo() {
    const state = filterManager.getState();
    filterManager.updateState({ holoOnly: !state.holoOnly });
    resetPagination();
  }

  function handleToggleType(event: CustomEvent<{ type: DadType }>) {
    const state = filterManager.getState();
    const newTypes = new Set(state.types);
    if (newTypes.has(event.detail.type)) {
      newTypes.delete(event.detail.type);
    } else {
      newTypes.add(event.detail.type);
    }
    filterManager.updateState({ types: newTypes });
    syncFiltersToURL({ types: newTypes });
    resetPagination();
  }

  function handleClearTypes() {
    filterManager.updateState({ types: new Set() });
    syncFiltersToURL({ types: new Set() });
    resetPagination();
  }

  function handleSortChange(event: CustomEvent<{ option: SortOption }>) {
    filterManager.updateState({ sort: event.detail.option });
    syncFiltersToURL({ sort: event.detail.option });
    // Re-sort all cards and apply filters
    allCards = sortCardsByOption(allCards, event.detail.option, cardObtainedDates);
    resetPagination();
  }

  function handleUpdateStatRange(event: CustomEvent<{ stat: keyof StatRanges; min: number; max: number }>) {
    const state = filterManager.getState();
    filterManager.updateState({
      statRanges: {
        ...state.statRanges,
        [event.detail.stat]: { min: event.detail.min, max: event.detail.max },
      },
    });
    resetPagination();
  }

  function handleClearStatRange(event: CustomEvent<{ stat: keyof StatRanges }>) {
    const state = filterManager.getState();
    const newRanges = { ...state.statRanges };
    delete newRanges[event.detail.stat];
    filterManager.updateState({ statRanges: newRanges });
    resetPagination();
  }

  function handleToggleHoloVariant(event: CustomEvent<{ variant: HoloVariant }>) {
    const state = filterManager.getState();
    const newVariants = new Set(state.selectedHoloVariants);
    if (newVariants.has(event.detail.variant)) {
      newVariants.delete(event.detail.variant);
    } else {
      newVariants.add(event.detail.variant);
    }
    filterManager.updateState({ selectedHoloVariants: newVariants });
    resetPagination();
  }

  function handleClearHoloVariants() {
    filterManager.updateState({ selectedHoloVariants: new Set() });
    resetPagination();
  }

  function handleSetAbilitiesMode(event: CustomEvent<{ mode: 'any' | 'hasAbilities' | 'noAbilities' }>) {
    filterManager.updateState({ abilitiesMode: event.detail.mode });
    resetPagination();
  }

  function handleApplySavedSearch(event: CustomEvent<{ preset: SavedSearchPreset }>) {
    const preset = event.detail.preset;
    filterManager.updateState({
      searchTerm: preset.filters.searchTerm,
      rarity: preset.filters.rarity,
      types: new Set(preset.filters.selectedTypes),
      selectedHoloVariants: new Set(preset.filters.holoVariants),
      statRanges: { ...preset.filters.statRanges },
    });
    resetPagination();
  }

  function handleClearAllFilters() {
    filterManager.reset();
    resetPagination();
  }

  // ============================================================================
  // CARD GRID EVENT HANDLERS
  // ============================================================================

  function handleCardClick(event: CustomEvent<{ card: PackCard; event: MouseEvent | KeyboardEvent }>) {
    openDetailModal(event.detail.card);
  }

  function handleToggleCardSelection(event: CustomEvent<{ card: PackCard }>) {
    const card = event.detail.card;
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

  // Derive comparison cards from selections
  const compareCard1 = $derived(selectedForCompare[0] || null);
  const compareCard2 = $derived(selectedForCompare[1] || null);

  // Setup
  onMount(() => {
    initializeFromURL();
    loadCards();
    unsubscribeStores = subscribeToStores([
      { store: isDetailModalOpen, onUpdate: (v) => { isDetailOpen = v; } },
      { store: detailModalCard, onUpdate: (v) => { detailCard = v; } },
    ]);

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      if (unsubscribeStores) {
        unsubscribeStores();
      }
    };
  });

  // Subscribe to collection changes
  $effect(() => {
    collection.get();
    loadCards();
  });
</script>

<div class="gallery-container">
  <!-- Filter Panel -->
  <FilterPanel
    {searchTerm}
    {selectedRarity}
    {selectedTypes}
    {holoOnly}
    {selectedHoloVariants}
    {selectedSort}
    {statRanges}
    {abilitiesMode}
    {totalFilteredCount}
    {hasActiveFilters}
    on:search={handleSearch}
    on:clearSearch={handleClearSearch}
    on:rarityFilter={handleRarityFilter}
    on:toggleHolo={handleToggleHolo}
    on:toggleType={handleToggleType}
    on:clearTypes={handleClearTypes}
    on:sortChange={handleSortChange}
    on:updateStatRange={handleUpdateStatRange}
    on:clearStatRange={handleClearStatRange}
    on:toggleHoloVariant={handleToggleHoloVariant}
    on:clearHoloVariants={handleClearHoloVariants}
    on:setAbilitiesMode={handleSetAbilitiesMode}
    on:applySavedSearch={handleApplySavedSearch}
    on:clearAllFilters={handleClearAllFilters}
  />

  <!-- Empty State -->
  {#if displayedCards.length === 0 && allCards.length === 0 && !isInitialLoading}
    <div class="empty-state">
      <div class="empty-icon">📦</div>
      <h2 class="empty-title">No cards yet!</h2>
      <p class="empty-description">
        Open some packs to start building your collection.
      </p>
      <a href="/pack" class="empty-cta">Open Your First Pack</a>
    </div>
  {:else if displayedCards.length === 0 && !isInitialLoading}
    <div class="empty-state">
      <div class="empty-icon">🔍</div>
      <h2 class="empty-title">No cards found</h2>
      <p class="empty-description">
        Try adjusting your filters or search terms.
      </p>
    </div>
  {:else}
    <!-- Card Grid -->
    <CardGrid
      {displayedCards}
      {selectedForCompare}
      isLoading={isInitialLoading}
      on:cardClick={handleCardClick}
      on:toggleCardSelection={handleToggleCardSelection}
    />
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

<!-- Card Detail Modal (PACK-022) -->
{#if isDetailOpen && detailCard}
  <CardDetailModal />
{/if}

<style>
  .gallery-container {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem;
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
</style>
