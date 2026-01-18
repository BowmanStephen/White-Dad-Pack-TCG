<script lang="ts">
  import { onMount } from 'svelte';
  import {
    wishlist,
    getSortedWishlist,
    removeFromWishlist,
    updateWishlistPriority,
    clearWishlist,
    getWishlistStats,
  } from '../../stores/wishlist';
  import { RARITY_CONFIG, DAD_TYPE_ICONS, type WishlistPriority } from '../../types';
  import { formatWishlistPriority, getPriorityColor } from '../../lib/collection/utils';

  let sortedEntries = $state([]);
  let stats = $state({ total: 0, priorityCounts: { low: 0, medium: 0, high: 0, urgent: 0 } });
  let showEditModal = $state(false);
  let editingEntry = $state(null);
  let newPriority = $state<WishlistPriority>('medium');
  let newReason = $state('');
  let showClearConfirm = $state(false);

  // Load wishlist on mount
  onMount(() => {
    loadWishlist();
  });

  function loadWishlist() {
    sortedEntries = getSortedWishlist();
    stats = getWishlistStats();
  }

  // Subscribe to wishlist changes
  $: if ($wishlist.entries.length !== sortedEntries.length) {
    loadWishlist();
  }

  function handleRemove(entryId: string) {
    const result = removeFromWishlist(entryId);
    if (result.success) {
      loadWishlist();
    }
  }

  function handleEdit(entry: any) {
    editingEntry = entry;
    newPriority = entry.priority;
    newReason = entry.reason || '';
    showEditModal = true;
  }

  function handleSaveEdit() {
    if (!editingEntry) return;

    const result = updateWishlistPriority(editingEntry.cardId, newPriority);
    if (result.success) {
      showEditModal = false;
      editingEntry = null;
      loadWishlist();
    }
  }

  function handleClearAll() {
    const result = clearWishlist();
    if (result.success) {
      showClearConfirm = false;
      loadWishlist();
    }
  }

  const priorityOptions: WishlistPriority[] = ['urgent', 'high', 'medium', 'low'];
</script>

<section class="wishlist-section">
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-black text-white flex items-center gap-2">
          <span class="text-2xl">⭐</span>
          My Wishlist
        </h2>
        <p class="text-slate-400 text-sm mt-1">
          Cards you're hunting for ({stats.total} total)
        </p>
      </div>

      {#if sortedEntries.length > 0}
        <button
          on:click={() => (showClearConfirm = true)}
          class="px-4 py-2 rounded-lg text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all duration-200"
        >
          Clear All
        </button>
      {/if}
    </div>

    <!-- Empty State -->
    {#if sortedEntries.length === 0}
      <div class="text-center py-12 px-4 bg-slate-800/50 rounded-xl border border-slate-700">
        <div class="text-6xl mb-4">📋</div>
        <h3 class="text-xl font-bold text-white mb-2">Your wishlist is empty</h3>
        <p class="text-slate-400 text-sm">
          Click the star icon on any card to add it to your wishlist
        </p>
      </div>
    {:else}
      <!-- Wishlist Entries -->
      <div class="space-y-3">
        {#each sortedEntries as entry (entry.cardId)}
          <div
            class="wishlist-entry flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-200"
          >
            <!-- Priority Badge -->
            <div
              class="priority-badge flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold text-white"
              style="background-color: {getPriorityColor(entry.priority)}33; border: 1.5px solid {getPriorityColor(entry.priority)}; color: {getPriorityColor(entry.priority)};"
            >
              {formatWishlistPriority(entry.priority)}
            </div>

            <!-- Card Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-lg">✦</span>
                <h4 class="text-white font-bold truncate">{entry.cardName}</h4>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                  style="background-color: {RARITY_CONFIG[entry.rarity].color}33; color: {RARITY_CONFIG[entry.rarity].color};"
                >
                  {entry.rarity}
                </span>
              </div>

              {#if entry.reason}
                <p class="text-slate-400 text-xs italic truncate">"{entry.reason}"</p>
              {/if}

              <p class="text-slate-500 text-[10px] mt-1">
                Added {new Date(entry.addedAt).toLocaleDateString()}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                on:click={() => handleEdit(entry)}
                class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-200"
                aria-label="Edit wishlist entry"
              >
                ✏️
              </button>
              <button
                on:click={() => handleRemove(entry.cardId)}
                class="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                aria-label="Remove from wishlist"
              >
                🗑️
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Edit Modal -->
    {#if showEditModal && editingEntry}
      <div class="modal-backdrop fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="modal-content bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-md w-full">
          <h3 class="text-xl font-bold text-white mb-4">Edit Wishlist Entry</h3>
          <p class="text-slate-300 text-sm mb-4">{editingEntry.cardName}</p>

          <!-- Priority Selection -->
          <div class="mb-4">
            <label class="block text-sm font-bold text-white mb-2">Priority</label>
            <div class="grid grid-cols-2 gap-2">
              {#each priorityOptions as priority}
                <button
                  on:click={() => (newPriority = priority)}
                  class="priority-option px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 border-2"
                  class:active={newPriority === priority}
                  style:border-color={getPriorityColor(priority)}
                  style:background-color={newPriority === priority ? getPriorityColor(priority) + '33' : 'transparent'}
                  style:color={getPriorityColor(priority)}
                >
                  {formatWishlistPriority(priority)}
                </button>
              {/each}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 mt-6">
            <button
              on:click={handleSaveEdit}
              class="flex-1 px-4 py-2 rounded-lg font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all duration-200"
            >
              Save Changes
            </button>
            <button
              on:click={() => (showEditModal = false)}
              class="flex-1 px-4 py-2 rounded-lg font-bold text-slate-300 bg-slate-700 hover:bg-slate-600 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Clear Confirmation Modal -->
    {#if showClearConfirm}
      <div class="modal-backdrop fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="modal-content bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-md w-full">
          <h3 class="text-xl font-bold text-white mb-2">Clear Wishlist?</h3>
          <p class="text-slate-300 text-sm mb-6">
            Are you sure you want to remove all {stats.total} cards from your wishlist? This action cannot be undone.
          </p>

          <div class="flex gap-2">
            <button
              on:click={handleClearAll}
              class="flex-1 px-4 py-2 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
            >
              Yes, Clear All
            </button>
            <button
              on:click={() => (showClearConfirm = false)}
              class="flex-1 px-4 py-2 rounded-lg font-bold text-slate-300 bg-slate-700 hover:bg-slate-600 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  .wishlist-section {
    background: radial-gradient(ellipse at top, rgba(251, 191, 36, 0.05) 0%, transparent 50%);
  }

  .modal-backdrop {
    animation: fadeIn 0.2s ease-out;
  }

  .modal-content {
    animation: slideUp 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .priority-option {
    transition: all 0.2s ease;
  }

  .priority-option:hover {
    transform: scale(1.02);
  }

  @media (prefers-reduced-motion: reduce) {
    .modal-backdrop,
    .modal-content,
    .priority-option {
      animation: none;
      transition: none;
    }
  }
</style>
