<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { SORT_OPTION_CONFIG } from '../../types';
  import type { SortOption } from '../../types';

  // Props
  let {
    selectedSort = 'rarity_desc',
  }: {
    selectedSort: SortOption;
  } = $props();

  // Events
  const dispatch = createEventDispatcher();

  // UI State
  let showDropdown = $state(false);

  // Group sort options by category
  const sortGroups = $derived(
    Object.entries(SORT_OPTION_CONFIG).reduce(
      (groups, [key, config]) => {
        const [category, direction] = key.split('_');
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push({
          value: key as SortOption,
          name: config.name,
          description: config.description,
          direction: direction === 'asc' ? 'asc' : 'desc',
        });
        return groups;
      },
      {} as Record<string, Array<{ value: SortOption; name: string; description: string; direction: string }>>
    )
  );

  const categoryIcons: Record<string, string> = {
    rarity: '💎',
    name: '📝',
    date: '📅',
    type: '👨',
  };

  const categoryNames: Record<string, string> = {
    rarity: 'Rarity',
    name: 'Card Name',
    date: 'Date Acquired',
    type: 'Dad Type',
  };

  function handleSortChange(option: SortOption) {
    selectedSort = option;
    dispatch('sort', { option });
    showDropdown = false;
  }

  function toggleDropdown() {
    showDropdown = !showDropdown;
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.sort-dropdown')) {
      showDropdown = false;
    }
  }

  // Get current sort config
  const currentConfig = $derived(SORT_OPTION_CONFIG[selectedSort]);
</script>

<svelte:window onclick={handleClickOutside} />

<div class="collection-sort">
  <button
    class="sort-button"
    onclick={toggleDropdown}
    aria-expanded={showDropdown}
    aria-haspopup="listbox"
    type="button"
  >
    <span class="sort-icon">🔀</span>
    <span class="sort-label">{currentConfig.name}</span>
    <span class="sort-description">{currentConfig.description}</span>
    <span class="sort-arrow" class:expanded={showDropdown}>▼</span>
  </button>

  {#if showDropdown}
    <div class="sort-dropdown" role="listbox">
      {#each Object.entries(sortGroups) as [category, options]}
        <div class="sort-group">
          <div class="sort-group-header">
            <span class="sort-group-icon">{categoryIcons[category]}</span>
            <span class="sort-group-name">{categoryNames[category]}</span>
          </div>
          <div class="sort-group-options">
            {#each options as option}
              <button
                class="sort-option"
                class:selected={selectedSort === option.value}
                onclick={() => handleSortChange(option.value)}
                role="option"
                aria-selected={selectedSort === option.value}
                type="button"
              >
                <span class="sort-option-direction">
                  {option.direction === 'asc' ? '↑' : '↓'}
                </span>
                <span class="sort-option-info">
                  <span class="sort-option-name">{option.name}</span>
                  <span class="sort-option-desc">{option.description}</span>
                </span>
                {#if selectedSort === option.value}
                  <span class="sort-option-check">✓</span>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .collection-sort {
    position: relative;
    display: inline-block;
  }

  .sort-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    background: linear-gradient(135deg, #7c3aed, #6366f1);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 0.5rem;
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .sort-button:hover {
    background: linear-gradient(135deg, #6d28d9, #4f46e5);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
    transform: translateY(-1px);
  }

  .sort-icon {
    font-size: 1rem;
    line-height: 1;
  }

  .sort-label {
    font-weight: 700;
    line-height: 1;
  }

  .sort-description {
    font-size: 0.75rem;
    font-weight: 400;
    opacity: 0.9;
    line-height: 1;
  }

  .sort-arrow {
    margin-left: auto;
    font-size: 0.75rem;
    transition: transform 0.2s ease;
    line-height: 1;
  }

  .sort-arrow.expanded {
    transform: rotate(180deg);
  }

  .sort-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    z-index: 100;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 0.75rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    min-width: 280px;
    max-width: 400px;
    overflow: hidden;
    animation: dropdownFadeIn 0.2s ease;
  }

  @keyframes dropdownFadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .sort-group {
    padding: 0.75rem;
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  }

  .sort-group:last-child {
    border-bottom: none;
  }

  .sort-group-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    padding: 0 0.5rem;
  }

  .sort-group-icon {
    font-size: 1rem;
    line-height: 1;
  }

  .sort-group-name {
    font-size: 0.75rem;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1;
  }

  .sort-group-options {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .sort-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 0.75rem;
    background: transparent;
    border: 2px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
  }

  .sort-option:hover {
    background: rgba(51, 65, 85, 0.8);
    border-color: rgba(100, 116, 139, 0.5);
    color: white;
    transform: translateX(2px);
  }

  .sort-option.selected {
    background: rgba(124, 58, 237, 0.2);
    border-color: #8b5cf6;
    color: #a78bfa;
    box-shadow: 0 0 15px rgba(124, 58, 237, 0.2);
  }

  .sort-option-direction {
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1;
    flex-shrink: 0;
  }

  .sort-option-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    flex: 1;
  }

  .sort-option-name {
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.2;
  }

  .sort-option-desc {
    font-size: 0.75rem;
    opacity: 0.8;
    line-height: 1.2;
  }

  .sort-option-check {
    font-size: 1rem;
    font-weight: 700;
    color: #22c55e;
    line-height: 1;
    flex-shrink: 0;
  }

  /* Responsive adjustments */
  @media (max-width: 639px) {
    .sort-button {
      padding: 0.5rem 0.75rem;
      font-size: 0.8125rem;
    }

    .sort-description {
      display: none;
    }

    .sort-dropdown {
      left: 0;
      right: 0;
      min-width: auto;
      max-width: none;
    }

    .sort-option {
      padding: 0.5rem 0.625rem;
    }

    .sort-option-desc {
      display: none;
    }
  }
</style>
