<script lang="ts">
  /**
   * CollectionSearch - Card search component for collection
   *
   * Features:
   * - Search by card name
   * - Search by flavor text
   * - 300ms debounce on input
   *
   * Props:
   * - searchTerm: Current search term
   * - placeholder: Input placeholder text
   * - debounceMs: Debounce delay in milliseconds (default 300)
   *
   * Callbacks:
   * - onSearch: Called when search term changes (after debounce)
   * - onClear: Called when search is cleared
   */

  import { onDestroy } from 'svelte';
  import { recordFeatureUsage } from '@/lib/analytics/engagement';

  interface Props {
    searchTerm?: string;
    placeholder?: string;
    debounceMs?: number;
    onSearch?: (term: string) => void;
    onClear?: () => void;
  }

  let {
    searchTerm = '',
    placeholder = 'Search cards...',
    debounceMs = 300,
    onSearch,
    onClear,
  }: Props = $props();

  // Debounce timeout
  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
  let localSearchTerm = $state(searchTerm);

  /**
   * Handle search input with debounce
   * Debounces for {debounceMs} to avoid excessive re-renders
   */
  function handleSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    localSearchTerm = target.value;

    // Clear existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set new timeout for debounce
    debounceTimeout = setTimeout(() => {
      searchTerm = localSearchTerm;
      onSearch?.(localSearchTerm);
    }, debounceMs);
  }

  /**
   * Clear search and reset
   */
  function clearSearch() {
    localSearchTerm = '';
    searchTerm = '';
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
      debounceTimeout = null;
    }
    onClear?.();
  }

  // Cleanup timeout on unmount
  onDestroy(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
  });
</script>

<div class="collection-search">
  <div class="search-container">
    <input
      type="text"
      class="search-input"
      placeholder={placeholder}
      value={localSearchTerm}
      oninput={handleSearch}
      aria-label="Search cards by name or flavor text"
    />
    <span class="search-icon" aria-hidden="true">🔍</span>
    {#if localSearchTerm}
      <button
        class="search-clear"
        onclick={clearSearch}
        aria-label="Clear search"
        type="button"
      >
        ✕
      </button>
    {/if}
  </div>

  {#if localSearchTerm}
    <div class="search-hint">
      Searching by: <span class="search-term">"{localSearchTerm}"</span>
    </div>
  {/if}
</div>

<style>
  .collection-search {
    width: 100%;
    max-width: 600px;
  }

  .search-container {
    position: relative;
    width: 100%;
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
    font-size: 1rem;
    line-height: 1;
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

  .search-hint {
    margin-top: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.375rem;
    font-size: 0.75rem;
    color: #94a3b8;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .search-term {
    color: #fbbf24;
    font-weight: 600;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .search-input {
      font-size: 0.8125rem;
      padding: 0.625rem 1rem 0.625rem 2.25rem;
      padding-right: 2.25rem;
    }

    .search-icon {
      left: 0.625rem;
      font-size: 0.875rem;
    }

    .search-clear {
      min-width: 2.5rem;
      min-height: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      right: 0.625rem;
      font-size: 0.8125rem;
    }

    .search-hint {
      font-size: 0.6875rem;
    }
  }
</style>
