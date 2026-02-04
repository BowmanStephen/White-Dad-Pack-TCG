<script lang="ts">
  import { onMount } from 'svelte';
  import type {
    LeaderboardCategory,
    LeaderboardScope,
    LeaderboardTimePeriod,
    LeaderboardRegion,
  } from '@/types/leaderboard';
  import {
    LEADERBOARD_CATEGORIES,
    TIME_PERIODS,
    REGIONS,
  } from '@/types/leaderboard';
  import {
    setCategory,
    setScope,
    setTimePeriod,
    setRegion,
    currentCategory,
    currentScope,
    currentTimePeriod,
    currentRegion,
  } from '@/stores/leaderboard';

  // Props
  interface Props {
    showRegionFilter?: boolean;
  }

  let { showRegionFilter = false }: Props = $props();

  // Local state for UI
  let selectedCategory: LeaderboardCategory = $state(currentCategory.get());
  let selectedScope: LeaderboardScope = $state(currentScope.get());
  let selectedTimePeriod: LeaderboardTimePeriod = $state(currentTimePeriod.get());
  let selectedRegion: LeaderboardRegion = $state(currentRegion.get());

  // Sync store changes to local state
  onMount(() => {
    const unsubscribeCategory = currentCategory.subscribe((value) => {
      selectedCategory = value;
    });
    const unsubscribeScope = currentScope.subscribe((value) => {
      selectedScope = value;
    });
    const unsubscribeTimePeriod = currentTimePeriod.subscribe((value) => {
      selectedTimePeriod = value;
    });
    const unsubscribeRegion = currentRegion.subscribe((value) => {
      selectedRegion = value;
    });

    return () => {
      unsubscribeCategory();
      unsubscribeScope();
      unsubscribeTimePeriod();
      unsubscribeRegion();
    };
  });

  // Event handlers
  function handleCategoryChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value as LeaderboardCategory;
    selectedCategory = value;
    setCategory(value);
  }

  function handleScopeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value as LeaderboardScope;
    selectedScope = value;
    setScope(value);
  }

  function handleTimePeriodChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value as LeaderboardTimePeriod;
    selectedTimePeriod = value;
    setTimePeriod(value);
  }

  function handleRegionChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value as LeaderboardRegion;
    selectedRegion = value;
    setRegion(value);
  }
</script>

<div class="leaderboard-filters space-y-4">
  <!-- Category Filter -->
  <div class="filter-group">
    <label for="category-filter" class="filter-label">
      Category
    </label>
    <select
      id="category-filter"
      class="select-field"
      onchange={handleCategoryChange}
    >
      {#each Object.entries(LEADERBOARD_CATEGORIES) as [key, config]}
        <option value={key} selected={selectedCategory === key}>
          {config.icon} {config.label}
        </option>
      {/each}
    </select>
  </div>

  <!-- Scope Filter -->
  <div class="filter-group">
    <label for="scope-filter" class="filter-label">
      Scope
    </label>
    <select
      id="scope-filter"
      class="select-field"
      onchange={handleScopeChange}
    >
      <option value="global" selected={selectedScope === 'global'}>
        🌍 Global
      </option>
      <option value="friends" selected={selectedScope === 'friends'}>
        👥 Friends
      </option>
    </select>
  </div>

  <!-- Time Period Filter -->
  <div class="filter-group">
    <label for="time-period-filter" class="filter-label">
      Time Period
    </label>
    <select
      id="time-period-filter"
      class="select-field"
      onchange={handleTimePeriodChange}
    >
      {#each Object.entries(TIME_PERIODS) as [key, config]}
        <option value={key} selected={selectedTimePeriod === key}>
          {config.label}
        </option>
      {/each}
    </select>
    <p class="filter-description">
      {TIME_PERIODS[selectedTimePeriod].description}
    </p>
  </div>

  <!-- Region Filter (Future Feature) -->
  {#if showRegionFilter}
    <div class="filter-group">
      <label for="region-filter" class="filter-label">
        Region
      </label>
      <select
        id="region-filter"
        class="select-field"
        onchange={handleRegionChange}
      >
        {#each Object.entries(REGIONS) as [key, config]}
          <option value={key} selected={selectedRegion === key}>
            {config.label}
          </option>
        {/each}
      </select>
      <p class="filter-description">
        {REGIONS[selectedRegion].description}
      </p>
    </div>
  {/if}
</div>

<style>
  .leaderboard-filters {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary, #1e293b);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .filter-description {
    font-size: 0.75rem;
    color: var(--color-text-secondary, #64748b);
    margin: 0;
    padding-left: 0.5rem;
  }

  :global(.dark) .filter-label {
    color: var(--color-text-primary, #f1f5f9);
  }

  :global(.dark) .filter-description {
    color: var(--color-text-secondary, #94a3b8);
  }
</style>
