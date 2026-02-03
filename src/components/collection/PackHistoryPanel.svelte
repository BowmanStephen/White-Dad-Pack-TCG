<script lang="ts">
  import { onMount } from 'svelte';
  import { collection } from '@/stores/collection';
  import PackHistoryEntry from '@components/collection/PackHistoryEntry.svelte';

  // State
  let displayedPacks = $state<Array<{ id: string; expanded: boolean }>>([]);
  let page = 0;
  const pageSize = 10; // Show 10 packs initially, load more on scroll
  let hasMore = $state(false);
  let isLoading = $state(false);

  // Intersection observer for infinite scroll
  let loadMoreTrigger = $state<HTMLDivElement | null>(null);
  let observer: IntersectionObserver | null = null;

  // Load pack history
  function loadPacks() {
    const currentCollection = collection.get();
    const allPacks = currentCollection.packs;

    // Paginate packs
    const startIndex = 0;
    const endIndex = (page + 1) * pageSize;
    const paginatedPacks = allPacks.slice(startIndex, endIndex);

    // Map to display format with expansion state
    displayedPacks = paginatedPacks.map(pack => ({
      id: pack.id,
      expanded: false,
    }));

    hasMore = endIndex < allPacks.length;
  }

  // Load more packs (infinite scroll)
  function loadMore() {
    if (isLoading || !hasMore) return;

    isLoading = true;
    page++;

    const currentCollection = collection.get();
    const allPacks = currentCollection.packs;

    // Get next page of packs
    const startIndex = page * pageSize;
    const endIndex = (page + 1) * pageSize;
    const newPacks = allPacks.slice(startIndex, endIndex);

    // Add to displayed packs
    displayedPacks = [
      ...displayedPacks,
      ...newPacks.map(pack => ({
        id: pack.id,
        expanded: false,
      })),
    ];

    hasMore = endIndex < allPacks.length;
    isLoading = false;
  }

  // Get pack object by ID
  function getPackById(id: string) {
    const currentCollection = collection.get();
    return currentCollection.packs.find(p => p.id === id);
  }

  // Toggle pack expansion
  function togglePackExpansion(id: string) {
    const index = displayedPacks.findIndex(p => p.id === id);
    if (index !== -1) {
      displayedPacks = [...displayedPacks];
      displayedPacks[index] = { ...displayedPacks[index], expanded: !displayedPacks[index].expanded };
    }
  }

  // Setup intersection observer for infinite scroll
  onMount(() => {
    loadPacks();

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
    page = 0;
    loadPacks();
  });
</script>

<div class="history-panel">
  <div class="history-header">
    <h2 class="history-title">📜 Recent Packs</h2>
    <p class="history-subtitle">Your last {displayedPacks.length} pack openings</p>
  </div>

  <!-- Empty State -->
  {#if displayedPacks.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📦</div>
      <h3 class="empty-title">No packs opened yet</h3>
      <p class="empty-description">
        Open your first pack to start tracking your history!
      </p>
      <a href="/pack" class="empty-cta">Open a Pack</a>
    </div>
  {:else}
    <!-- Pack List -->
    <div class="pack-list" role="list" aria-label="Pack opening history">
      {#each displayedPacks as packEntry (packEntry.id)}
        {@const pack = getPackById(packEntry.id)}
        {#if pack}
          <PackHistoryEntry
            {pack}
            expanded={packEntry.expanded}
            ontoggle={() => togglePackExpansion(packEntry.id)}
          />
        {/if}
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
            <span>Loading more packs...</span>
          </div>
        {:else}
          <span class="load-more-hint">Scroll down to load more</span>
        {/if}
      </div>
    {:else}
      <div class="end-message">
        <p>🎉 You've reached the beginning of your pack history!</p>
      </div>
    {/if}
  {/if}
</div>

<style>
  .history-panel {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 1rem;
  }

  .history-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .history-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.5rem;
  }

  .history-subtitle {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
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

  /* Pack List */
  .pack-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
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
    text-align: center;
  }
</style>
