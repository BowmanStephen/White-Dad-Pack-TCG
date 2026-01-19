<script lang="ts">
  import { currentPage, currentPageStats, setViewMode, setSortMode } from '@/stores/binder';
  import { viewMode as viewModeStore, sortMode as sortModeStore } from '@/stores/binder';
  import Card from '@/components/card/Card.svelte';
  import type { BinderPage as BinderPageType } from '@/stores/binder';

  let page = $state<BinderPageType | null>(null);
  let stats = $state<any>(null);
  let viewMode = $state<'grid' | 'list'>('grid');
  let sortMode = $state<'manual' | 'rarity' | 'type' | 'date'>('manual');

  // Subscribe to stores
  $effect(() => {
    const unsubPage = currentPage.subscribe(p => page = p);
    return () => unsubPage();
  });

  $effect(() => {
    const unsubStats = currentPageStats.subscribe(s => stats = s);
    return () => unsubStats();
  });
</script>

<div class="binder-page-container">
  {#if page}
    <!-- Header -->
    <div class="page-header">
      <div class="page-info">
        <h1>{page.name}</h1>
        {#if page.description}
          <p class="description">{page.description}</p>
        {/if}
      </div>

      <!-- Controls -->
      <div class="page-controls">
        <div class="stat-badges">
          {#if stats}
            <span class="stat-badge">
              <strong>{stats.filledSlots}</strong>/{stats.totalSlots}
            </span>
            <span class="stat-badge">
              {stats.fillPercentage}% Full
            </span>
          {/if}
        </div>

        <div class="view-controls">
          <button
            class="control-btn"
            class:active={viewMode === 'grid'}
            onclick={() => {
              viewMode = 'grid';
              setViewMode('grid');
            }}
            aria-label="Grid view"
          >
            ⊞
          </button>
          <button
            class="control-btn"
            class:active={viewMode === 'list'}
            onclick={() => {
              viewMode = 'list';
              setViewMode('list');
            }}
            aria-label="List view"
          >
            ☰
          </button>
        </div>

        <div class="sort-controls">
          <select
            value={sortMode}
            onchange={(e) => {
              sortMode = e.currentTarget.value as any;
              setSortMode(sortMode);
            }}
            class="sort-select"
          >
            <option value="manual">Manual</option>
            <option value="rarity">Rarity</option>
            <option value="type">Type</option>
            <option value="date">Date Added</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Grid View -->
    {#if viewMode === 'grid'}
      <div
        class="card-grid"
        style={`--columns: ${page.columns}`}
      >
        {#each page.slots as slot (slot.id)}
          <div class="card-slot" class:filled={!!slot.cardId} class:favorite={slot.isFavorite}>
            {#if slot.card}
              <Card card={slot.card} interactive={true} />
              {#if slot.isFavorite}
                <div class="favorite-badge">★</div>
              {/if}
            {:else}
              <div class="empty-slot">
                <div class="empty-icon">+</div>
                <span>Empty</span>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    <!-- List View -->
    {#if viewMode === 'list'}
      <div class="card-list">
        {#each page.slots.filter(s => s.cardId) as slot (slot.id)}
          {#if slot.card}
            <div class="list-item">
              <div class="list-card-info">
                <strong>{slot.card.name}</strong>
                <span
                  class="rarity"
                  class:rarity-common={slot.card.rarity === 'common'}
                  class:rarity-uncommon={slot.card.rarity === 'uncommon'}
                  class:rarity-rare={slot.card.rarity === 'rare'}
                  class:rarity-epic={slot.card.rarity === 'epic'}
                  class:rarity-legendary={slot.card.rarity === 'legendary'}
                  class:rarity-mythic={slot.card.rarity === 'mythic'}
                >
                  {slot.card.rarity}
                </span>
              </div>
              {#if slot.isFavorite}
                <span class="favorite-indicator">★</span>
              {/if}
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .binder-page-container {
    padding: 1.5rem;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 0.5rem;
    color: #fff;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    gap: 2rem;
  }

  .page-info h1 {
    margin: 0 0 0.5rem 0;
    font-size: 1.75rem;
    font-weight: 700;
  }

  .description {
    color: #b0b0b0;
    margin: 0;
    font-size: 0.875rem;
  }

  .page-controls {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .stat-badges {
    display: flex;
    gap: 0.75rem;
  }

  .stat-badge {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }

  .view-controls,
  .sort-controls {
    display: flex;
    gap: 0.5rem;
  }

  .control-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 1rem;
    transition: all 200ms ease;
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .control-btn.active {
    background: rgba(255, 165, 0, 0.3);
    border-color: rgba(255, 165, 0, 0.5);
    color: #ffa500;
  }

  .sort-select {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .sort-select:hover,
  .sort-select:focus {
    background: rgba(255, 255, 255, 0.15);
    outline: none;
  }

  /* Grid View */
  .card-grid {
    display: grid;
    grid-template-columns: repeat(var(--columns), 1fr);
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .card-slot {
    aspect-ratio: 5 / 7;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    transition: all 200ms ease;
  }

  .card-slot:hover {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.08);
  }

  .card-slot.filled {
    border-color: rgba(255, 165, 0, 0.3);
    background: rgba(255, 165, 0, 0.05);
  }

  .card-slot.favorite {
    border-color: rgba(255, 215, 0, 0.5);
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
  }

  .empty-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .empty-icon {
    font-size: 2rem;
    opacity: 0.5;
  }

  .favorite-badge {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    color: #000;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
  }

  /* List View */
  .card-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.25rem;
    transition: all 200ms ease;
  }

  .list-item:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .list-card-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .list-card-info strong {
    font-size: 0.95rem;
  }

  .rarity {
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .rarity-common { background: rgba(156, 163, 175, 0.3); }
  .rarity-uncommon { background: rgba(59, 130, 246, 0.3); }
  .rarity-rare { background: rgba(234, 179, 8, 0.3); }
  .rarity-epic { background: rgba(168, 85, 247, 0.3); }
  .rarity-legendary { background: rgba(249, 115, 22, 0.3); }
  .rarity-mythic { background: rgba(236, 72, 153, 0.3); }

  .favorite-indicator {
    font-size: 1.2rem;
    color: #ffd700;
  }

  @media (max-width: 768px) {
    .page-header {
      flex-direction: column;
      gap: 1rem;
    }

    .page-controls {
      width: 100%;
      justify-content: space-between;
    }

    .page-info h1 {
      font-size: 1.25rem;
    }

    .card-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
