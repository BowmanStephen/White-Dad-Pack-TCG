<script lang="ts">
  import {
    collectionFilters,
    toggleRarity,
    clearRarities,
    selectAllRarities,
    isRaritySelected,
    getSelectedCount,
    hasActiveFilters,
    toggleType,
    clearTypes,
    selectAllTypes,
    isTypeSelected,
    getSelectedTypeCount,
    hasActiveTypeFilters,
  } from '../../stores/collectionFilters';
  import { collection } from '../../stores/collection';
  import { RARITY_CONFIG, DAD_TYPE_NAMES, DAD_TYPE_ICONS } from '../../types';
  import type { Rarity, DadType } from '../../types';

  // Get all rarities for iteration
  const rarities: Rarity[] = Object.keys(RARITY_CONFIG) as Rarity[];

  // Get all dad types for iteration
  const dadTypes: DadType[] = Object.keys(DAD_TYPE_NAMES) as DadType[];

  // Subscribe to filter changes
  let selectedCount = $derived(getSelectedCount());
  let hasActive = $derived(hasActiveFilters());
  let selectedTypeCount = $derived(getSelectedTypeCount());
  let hasActiveTypes = $derived(hasActiveTypeFilters());

  // Get all unique cards from collection
  let allCards = $derived(collection.get().packs.flatMap(pack => pack.cards));

  // Count cards by dad type
  let cardsByType = $derived.by(() => {
    const counts = new Map<DadType, number>();

    for (const card of allCards) {
      const current = counts.get(card.type) || 0;
      counts.set(card.type, current + 1);
    }

    return counts;
  });

  // Count cards by rarity
  let cardsByRarity = $derived.by(() => {
    const counts = new Map<Rarity, number>();

    for (const card of allCards) {
      const current = counts.get(card.rarity) || 0;
      counts.set(card.rarity, current + 1);
    }

    return counts;
  });
</script>

<div class="collection-filters">
  <div class="filters-header">
    <h3 class="filters-title">Filter by Rarity</h3>
    <div class="filters-actions">
      {#if hasActive}
        <button
          class="action-button clear-button"
          onclick={clearRarities}
          title="Clear all filters"
          type="button"
        >
          <span class="action-icon">✕</span>
          <span class="action-text">Clear</span>
        </button>
      {:else}
        <button
          class="action-button select-all-button"
          onclick={selectAllRarities}
          title="Select all rarities"
          type="button"
        >
          <span class="action-icon">☑</span>
          <span class="action-text">Select All</span>
        </button>
      {/if}

      {#if selectedCount > 0}
        <div class="selected-count">
          {selectedCount} {selectedCount === 1 ? 'rarity' : 'rarities'} selected
        </div>
      {/if}
    </div>
  </div>

  <div class="rarity-filters-grid">
    {#each rarities as rarity}
      {@const isSelected = isRaritySelected(rarity)}
      {@const config = RARITY_CONFIG[rarity]}
      {@const count = cardsByRarity.get(rarity) || 0}
      <button
        class="rarity-filter-button"
        class:active={isSelected}
        style="--rarity-color: {config.color}"
        onclick={() => toggleRarity(rarity)}
        type="button"
        aria-pressed={isSelected}
      >
        <span class="rarity-indicator"></span>
        <span class="rarity-name">{config.name}</span>
        <span class="rarity-count">{count}</span>
        {#if isSelected}
          <span class="rarity-check">✓</span>
        {/if}
      </button>
    {/each}
  </div>

  {#if selectedCount > 0}
    <div class="filters-footer">
      <span class="filters-hint">
        Click rarity buttons to add/remove filters
      </span>
    </div>
  {/if}

  <!-- Dad Type Filter Section -->
  <div class="dad-type-filters">
    <div class="filters-header">
      <h3 class="filters-title">Filter by Dad Type</h3>
      <div class="filters-actions">
        {#if hasActiveTypes}
          <button
            class="action-button clear-button"
            onclick={clearTypes}
            title="Clear all type filters"
            type="button"
          >
            <span class="action-icon">✕</span>
            <span class="action-text">Clear</span>
          </button>
        {:else}
          <button
            class="action-button select-all-button"
            onclick={selectAllTypes}
            title="Select all types"
            type="button"
          >
            <span class="action-icon">☑</span>
            <span class="action-text">Select All</span>
          </button>
        {/if}

        {#if selectedTypeCount > 0}
          <div class="selected-count">
            {selectedTypeCount} {selectedTypeCount === 1 ? 'type' : 'types'} selected
          </div>
        {/if}
      </div>
    </div>

    <div class="dad-type-filters-grid">
      {#each dadTypes as type}
        {@const isSelected = isTypeSelected(type)}
        {@const name = DAD_TYPE_NAMES[type]}
        {@const icon = DAD_TYPE_ICONS[type]}
        {@const count = cardsByType.get(type) || 0}
        <button
          class="dad-type-filter-button"
          class:active={isSelected}
          onclick={() => toggleType(type)}
          type="button"
          aria-pressed={isSelected}
          title="{name} ({count} cards)"
        >
          <span class="dad-type-icon">{icon}</span>
          <span class="dad-type-name">{name}</span>
          <span class="dad-type-count">{count}</span>
          {#if isSelected}
            <span class="dad-type-check">✓</span>
          {/if}
        </button>
      {/each}
    </div>

    {#if selectedTypeCount > 0}
      <div class="filters-footer">
        <span class="filters-hint">
          Click type buttons to add/remove filters
        </span>
      </div>
    {/if}
  </div>
</div>

<style>
  .collection-filters {
    padding: 1rem;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.75rem;
    backdrop-filter: blur(8px);
  }

  .filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .filters-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: white;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .filters-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .action-button {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 0.5rem;
    color: #94a3b8;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-button:hover {
    background: rgba(51, 65, 85, 0.8);
    color: white;
    border-color: rgba(100, 116, 139, 0.5);
  }

  .clear-button:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
    color: #ef4444;
  }

  .select-all-button:hover {
    background: rgba(34, 197, 94, 0.2);
    border-color: rgba(34, 197, 94, 0.5);
    color: #22c55e;
  }

  .action-icon {
    font-size: 0.875rem;
    line-height: 1;
  }

  .action-text {
    font-size: 0.75rem;
    line-height: 1;
  }

  .selected-count {
    padding: 0.375rem 0.75rem;
    background: rgba(251, 191, 36, 0.2);
    border: 1px solid rgba(251, 191, 36, 0.5);
    border-radius: 9999px;
    color: #fbbf24;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .rarity-filters-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  @media (min-width: 640px) {
    .rarity-filters-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (min-width: 768px) {
    .rarity-filters-grid {
      grid-template-columns: repeat(6, 1fr);
    }
  }

  .rarity-filter-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 0.5rem;
    background: rgba(30, 41, 59, 0.8);
    border: 2px solid rgba(71, 85, 105, 0.5);
    border-radius: 0.5rem;
    color: #94a3b8;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    position: relative;
    overflow: hidden;
  }

  .rarity-filter-button:hover {
    background: rgba(51, 65, 85, 0.8);
    color: white;
    border-color: rgba(100, 116, 139, 0.5);
    transform: translateY(-1px);
  }

  .rarity-filter-button.active {
    background: var(--rarity-color);
    border-color: var(--rarity-color);
    color: white;
    box-shadow: 0 0 15px var(--rarity-color);
    transform: translateY(-1px);
  }

  .rarity-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.5;
  }

  .rarity-filter-button.active .rarity-indicator {
    opacity: 1;
    box-shadow: 0 0 8px currentColor;
  }

  .rarity-name {
    flex: 1;
    text-align: center;
    line-height: 1.1;
  }

  .rarity-count {
    position: absolute;
    top: 0.25rem;
    left: 0.25rem;
    font-size: 0.65rem;
    font-weight: 600;
    padding: 0.125rem 0.375rem;
    background: rgba(15, 23, 42, 0.8);
    border-radius: 9999px;
    color: #94a3b8;
  }

  .rarity-filter-button.active .rarity-count {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .rarity-check {
    font-size: 0.875rem;
    font-weight: 700;
    line-height: 1;
  }

  .filters-footer {
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(71, 85, 105, 0.3);
  }

  .filters-hint {
    font-size: 0.75rem;
    color: #94a3b8;
    text-align: center;
    display: block;
  }

  /* Responsive adjustments */
  @media (max-width: 639px) {
    .filters-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .filters-actions {
      width: 100%;
      justify-content: space-between;
    }

    .rarity-filter-button {
      padding: 0.625rem 0.375rem;
      font-size: 0.7rem;
    }

    .rarity-name {
      font-size: 0.65rem;
    }
  }

  /* Dad Type Filters */
  .dad-type-filters {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(71, 85, 105, 0.3);
  }

  .dad-type-filters-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  @media (min-width: 640px) {
    .dad-type-filters-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (min-width: 768px) {
    .dad-type-filters-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .dad-type-filters-grid {
      grid-template-columns: repeat(6, 1fr);
    }
  }

  .dad-type-filter-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    padding: 0.75rem 0.5rem;
    background: rgba(30, 41, 59, 0.8);
    border: 2px solid rgba(71, 85, 105, 0.5);
    border-radius: 0.5rem;
    color: #94a3b8;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    position: relative;
    overflow: hidden;
    min-height: 4.5rem;
  }

  .dad-type-filter-button:hover {
    background: rgba(51, 65, 85, 0.8);
    color: white;
    border-color: rgba(100, 116, 139, 0.5);
    transform: translateY(-1px);
  }

  .dad-type-filter-button.active {
    background: rgba(34, 197, 94, 0.2);
    border-color: rgba(34, 197, 94, 0.7);
    color: #22c55e;
    box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
    transform: translateY(-1px);
  }

  .dad-type-icon {
    font-size: 1.5rem;
    line-height: 1;
    opacity: 0.7;
  }

  .dad-type-filter-button.active .dad-type-icon {
    opacity: 1;
    filter: drop-shadow(0 0 4px currentColor);
  }

  .dad-type-name {
    font-size: 0.65rem;
    line-height: 1.1;
    text-align: center;
    word-break: break-word;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dad-type-count {
    position: absolute;
    bottom: 0.25rem;
    right: 0.25rem;
    font-size: 0.6rem;
    font-weight: 600;
    padding: 0.125rem 0.375rem;
    background: rgba(15, 23, 42, 0.9);
    border-radius: 9999px;
    color: #94a3b8;
  }

  .dad-type-filter-button.active .dad-type-count {
    background: rgba(34, 197, 94, 0.3);
    color: #22c55e;
  }

  .dad-type-check {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    font-size: 0.75rem;
    font-weight: 700;
    line-height: 1;
    color: #22c55e;
  }

  @media (max-width: 639px) {
    .dad-type-filter-button {
      padding: 0.625rem 0.375rem;
      font-size: 0.65rem;
      min-height: 4rem;
    }

    .dad-type-icon {
      font-size: 1.25rem;
    }

    .dad-type-name {
      font-size: 0.6rem;
    }
  }
</style>
