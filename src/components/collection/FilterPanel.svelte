<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Rarity, DadType, SortOption, HoloVariant, StatRanges, SavedSearchPreset } from '../../types';
  import { RARITY_CONFIG, DAD_TYPE_NAMES, DAD_TYPE_ICONS, STAT_NAMES, STAT_ICONS, HOLO_VARIANT_NAMES, HOLO_VARIANT_ICONS } from '../../types';
  import { SAVED_SEARCH_PRESETS } from '../../lib/collection/presets';
  import CollectionSort from './CollectionSort.svelte';

  // Props (read-only filter state from parent)
  interface Props {
    searchTerm: string;
    selectedRarity: Rarity | null;
    selectedTypes: Set<DadType>;
    holoOnly: boolean;
    selectedHoloVariants: Set<HoloVariant>;
    selectedSort: SortOption;
    statRanges: StatRanges;
    abilitiesMode: 'any' | 'hasAbilities' | 'noAbilities';
    totalFilteredCount: number;
    hasActiveFilters: boolean;
  }

  let {
    searchTerm,
    selectedRarity,
    selectedTypes,
    holoOnly,
    selectedHoloVariants,
    selectedSort,
    statRanges,
    abilitiesMode,
    totalFilteredCount,
    hasActiveFilters,
  }: Props = $props();

  // Event dispatcher for parent communication
  const dispatch = createEventDispatcher<{
    search: { value: string };
    clearSearch: void;
    rarityFilter: { rarity: Rarity | null };
    toggleHolo: void;
    toggleType: { type: DadType };
    clearTypes: void;
    sortChange: { option: SortOption };
    updateStatRange: { stat: keyof StatRanges; min: number; max: number };
    clearStatRange: { stat: keyof StatRanges };
    toggleHoloVariant: { variant: HoloVariant };
    clearHoloVariants: void;
    setAbilitiesMode: { mode: 'any' | 'hasAbilities' | 'noAbilities' };
    applySavedSearch: { preset: SavedSearchPreset };
    clearAllFilters: void;
  }>();

  // UI state toggles (local to this component)
  let showTypeFilter = $state(false);
  let showAdvancedFilters = $state(false);
  let showStatRanges = $state(false);
  let showHoloVariants = $state(false);
  let showSavedSearches = $state(false);
  let showAbilitiesFilter = $state(false);

  // Show type filter if types are selected on mount
  $effect(() => {
    if (selectedTypes.size > 0) {
      showTypeFilter = true;
    }
  });

  // Saved searches (static presets)
  const savedSearches = SAVED_SEARCH_PRESETS;

  // Get all dad types as an array for iteration
  const dadTypes: DadType[] = Object.keys(DAD_TYPE_NAMES) as DadType[];

  // Get stat keys for iteration
  const statKeys = Object.keys(STAT_NAMES) as Array<keyof typeof STAT_NAMES>;

  // Get holo variants for iteration
  const holoVariants: HoloVariant[] = Object.keys(HOLO_VARIANT_NAMES) as HoloVariant[];

  // Event handlers that dispatch to parent
  function handleSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    dispatch('search', { value: target.value });
  }

  function clearSearch() {
    dispatch('clearSearch');
  }

  function handleRarityFilter(rarity: Rarity | null) {
    dispatch('rarityFilter', { rarity });
  }

  function toggleHoloFilter() {
    dispatch('toggleHolo');
  }

  function toggleTypeFilter() {
    showTypeFilter = !showTypeFilter;
  }

  function toggleTypeSelection(type: DadType) {
    dispatch('toggleType', { type });
  }

  function clearTypeFilters() {
    dispatch('clearTypes');
  }

  function handleSortChange(sortOption: SortOption) {
    dispatch('sortChange', { option: sortOption });
  }

  function toggleAdvancedFilters() {
    showAdvancedFilters = !showAdvancedFilters;
  }

  function toggleStatRanges() {
    showStatRanges = !showStatRanges;
  }

  function toggleHoloVariants() {
    showHoloVariants = !showHoloVariants;
  }

  function toggleSavedSearches() {
    showSavedSearches = !showSavedSearches;
  }

  function toggleAbilitiesFilter() {
    showAbilitiesFilter = !showAbilitiesFilter;
  }

  function updateStatRange(stat: keyof StatRanges, min: number, max: number) {
    dispatch('updateStatRange', { stat, min, max });
  }

  function clearStatRange(stat: keyof StatRanges) {
    dispatch('clearStatRange', { stat });
  }

  function toggleHoloVariant(variant: HoloVariant) {
    dispatch('toggleHoloVariant', { variant });
  }

  function clearHoloVariants() {
    dispatch('clearHoloVariants');
  }

  function setAbilitiesMode(mode: 'any' | 'hasAbilities' | 'noAbilities') {
    dispatch('setAbilitiesMode', { mode });
  }

  function applySavedSearch(preset: SavedSearchPreset) {
    dispatch('applySavedSearch', { preset });
    showSavedSearches = false;
  }

  function clearAllFilters() {
    dispatch('clearAllFilters');
    showTypeFilter = false;
    showStatRanges = false;
    showHoloVariants = false;
  }
</script>

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
  {#if hasActiveFilters}
    <button
      class="clear-all-button"
      onclick={clearAllFilters}
      aria-label="Clear all filters"
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
        <button class="clear-types-button" onclick={clearTypeFilters} aria-label="Clear all type filters">
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

      <!-- Abilities Filter -->
      <div class="advanced-filter-section">
        <button
          class="advanced-filter-section-toggle"
          onclick={toggleAbilitiesFilter}
        >
          <span class="section-icon">⚡</span>
          <span class="section-title">Abilities</span>
          <span class="section-arrow" class:rotated={showAbilitiesFilter}>▼</span>
          {#if abilitiesMode !== 'any'}
            <span class="section-count">(active)</span>
          {/if}
        </button>
        {#if showAbilitiesFilter}
          <div class="abilities-filter-grid">
            <button
              class="ability-mode-button"
              class:active={abilitiesMode === 'any'}
              onclick={() => setAbilitiesMode('any')}
            >
              <span class="mode-icon">🃏</span>
              <span class="mode-name">All Cards</span>
              <span class="mode-description">Show cards with or without abilities</span>
            </button>
            <button
              class="ability-mode-button"
              class:active={abilitiesMode === 'hasAbilities'}
              onclick={() => setAbilitiesMode('hasAbilities')}
            >
              <span class="mode-icon">✨</span>
              <span class="mode-name">Has Abilities</span>
              <span class="mode-description">Only cards with abilities</span>
            </button>
            <button
              class="ability-mode-button"
              class:active={abilitiesMode === 'noAbilities'}
              onclick={() => setAbilitiesMode('noAbilities')}
            >
              <span class="mode-icon">📄</span>
              <span class="mode-name">No Abilities</span>
              <span class="mode-description">Only cards without abilities</span>
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
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

  /* Abilities Filter Grid */
  .abilities-filter-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(15, 23, 42, 0.5);
  }

  @media (min-width: 640px) {
    .abilities-filter-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .ability-mode-button {
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
    min-height: 80px;
  }

  .ability-mode-button:hover {
    background: rgba(51, 65, 85, 0.8);
    color: white;
    border-color: rgba(168, 85, 247, 0.5);
  }

  .ability-mode-button.active {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.2));
    border-color: #22c55e;
    color: #22c55e;
    box-shadow: 0 0 12px rgba(34, 197, 94, 0.3);
  }

  .mode-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  .mode-name {
    font-size: 0.7rem;
    font-weight: 700;
    text-align: center;
    line-height: 1.2;
  }

  .mode-description {
    font-size: 0.6rem;
    color: #64748b;
    text-align: center;
    line-height: 1.2;
  }

  .ability-mode-button.active .mode-description {
    color: rgba(34, 197, 94, 0.8);
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
