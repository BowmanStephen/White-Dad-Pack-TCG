<script lang="ts">
  import {
    motionMode,
    setMotionMode,
    isReducedMotion,
    systemPrefersReducedMotion,
    type MotionMode
  } from '@/stores/motion';

  // Local state
  let isOpen = $state(false);
  let dropdownElement = $state<HTMLElement | null>(null);
  let buttonElement = $state<HTMLElement | null>(null);

  /**
   * Svelte action to detect clicks outside an element
   */
  function clickOutside(node: HTMLElement, callback: () => void) {
    const handleClick = (event: MouseEvent) => {
      if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
        callback();
      }
    };

    document.addEventListener('click', handleClick, true);

    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    };
  }

  // Track motion mode changes
  let currentMode = $state<MotionMode>('auto');
  let isReduced = $state(false);
  let systemPrefers = $state(false);

  $effect(() => {
    const unsub1 = motionMode.subscribe((value) => {
      currentMode = value;
    });
    const unsub2 = isReducedMotion.subscribe((value) => {
      isReduced = value;
    });
    const unsub3 = systemPrefersReducedMotion.subscribe((value) => {
      systemPrefers = value;
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  });

  function handleModeSelect(mode: MotionMode) {
    setMotionMode(mode);
    isOpen = false;
  }

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function getModeLabel(mode: MotionMode): string {
    switch (mode) {
      case 'auto':
        return 'Auto';
      case 'reduced':
        return 'Reduced';
      case 'full':
        return 'Full';
    }
  }

  function getModeDescription(mode: MotionMode): string {
    switch (mode) {
      case 'auto':
        return systemPrefers
          ? 'System preference (currently: Reduced)'
          : 'System preference (currently: Full)';
      case 'reduced':
        return 'Minimize animations, no particles';
      case 'full':
        return 'All animations and effects enabled';
    }
  }

  const motionOptions: MotionMode[] = ['auto', 'reduced', 'full'];
</script>

<div class="motion-toggle-wrapper">
  <button
    bind:this={buttonElement}
    onclick={toggleDropdown}
    class="motion-toggle-button"
    aria-label="Motion settings"
    aria-haspopup="true"
    aria-expanded={isOpen}
    type="button"
  >
    <span class="motion-icon">
      {#if currentMode === 'auto'}
        {#if systemPrefers}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm6 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm6 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        {/if}
      {:else if currentMode === 'reduced'}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm6 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm6 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      {/if}
    </span>
    <svg xmlns="http://www.w3.org/2000/svg" class="dropdown-arrow" class:rotate-180={isOpen} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if isOpen}
    <div
      bind:this={dropdownElement}
      class="motion-dropdown"
      use:clickOutside={() => isOpen = false}
      role="menu"
      aria-label="Motion options"
    >
      {#each motionOptions as option}
        <button
          onclick={() => handleModeSelect(option)}
          class="motion-option"
          class:active={option === currentMode}
          role="menuitem"
          aria-label={getModeLabel(option)}
          aria-current={option === currentMode ? 'true' : undefined}
          type="button"
        >
          <span class="motion-option-icon">
            {#if option === 'auto'}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
              </svg>
            {:else if option === 'reduced'}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm6 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm6 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            {/if}
          </span>
          <span class="motion-option-content">
            <span class="motion-option-label">{getModeLabel(option)}</span>
            <span class="motion-option-description">{getModeDescription(option)}</span>
          </span>
          {#if option === currentMode}
            <svg xmlns="http://www.w3.org/2000/svg" class="check-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .motion-toggle-wrapper {
    position: relative;
    display: inline-block;
  }

  .motion-toggle-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 9999px;
    color: #e2e8f0;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 44px;
    min-height: 44px;
  }

  .motion-toggle-button:hover {
    background: rgba(51, 65, 85, 0.9);
    border-color: rgba(100, 116, 139, 0.6);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .motion-toggle-button:active {
    transform: translateY(0);
  }

  .motion-toggle-button:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
  }

  .motion-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
  }

  .motion-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .dropdown-arrow {
    width: 14px;
    height: 14px;
    color: #94a3b8;
    transition: transform 0.2s ease;
  }

  .dropdown-arrow.rotate-180 {
    transform: rotate(180deg);
  }

  .motion-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    z-index: 100;
    min-width: 300px;
    background: rgba(15, 23, 42, 0.98);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 0.75rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    animation: dropdown-fade-in 0.2s ease-out;
  }

  @keyframes dropdown-fade-in {
    from {
      opacity: 0;
      transform: translateY(-0.5rem) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .motion-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.875rem 1rem;
    background: transparent;
    border: none;
    color: #e2e8f0;
    text-align: left;
    transition: all 0.15s ease;
    cursor: pointer;
  }

  .motion-option:hover {
    background: rgba(51, 65, 85, 0.6);
  }

  .motion-option.active {
    background: rgba(37, 99, 235, 0.2);
    color: #60a5fa;
  }

  .motion-option:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: -2px;
  }

  .motion-option:not(:last-child) {
    border-bottom: 1px solid rgba(51, 65, 85, 0.5);
  }

  .motion-option-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .motion-option-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .motion-option-content {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    flex: 1;
  }

  .motion-option-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: inherit;
  }

  .motion-option-description {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .motion-option.active .motion-option-description {
    color: #93c5fd;
  }

  .check-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: #60a5fa;
  }

  /* Respect reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .motion-toggle-button:hover {
      transform: none;
    }

    .motion-dropdown {
      animation: none;
    }

    .motion-toggle-button,
    .motion-option {
      transition: none;
    }
  }
</style>
