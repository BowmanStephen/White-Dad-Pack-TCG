<script lang="ts">
  import { themeMode, setThemeMode, isDarkMode, toggleTheme, getEffectiveTheme, type ThemeMode } from '@/stores/theme';
  import { onMount } from 'svelte';

  // Local state
  let isOpen = $state(false);
  let dropdownElement: HTMLElement;
  let buttonElement: HTMLElement;

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

  // Track theme mode changes
  let currentMode: ThemeMode = 'auto';
  let isDark = $state(false);

  $effect(() => {
    const unsub1 = themeMode.subscribe((value) => {
      currentMode = value;
    });
    const unsub2 = isDarkMode.subscribe((value) => {
      isDark = value;
    });

    return () => {
      unsub1();
      unsub2();
    };
  });

  function handleToggle() {
    toggleTheme();
  }

  function handleModeSelect(mode: ThemeMode) {
    setThemeMode(mode);
    isOpen = false;
  }

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function getModeLabel(mode: ThemeMode): string {
    switch (mode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'auto':
        return 'Auto';
    }
  }

  function getModeDescription(mode: ThemeMode): string {
    switch (mode) {
      case 'light':
        return 'Always use light mode';
      case 'dark':
        return 'Always use dark mode';
      case 'auto':
        const effective = getEffectiveTheme();
        return `System preference (currently: ${effective.charAt(0).toUpperCase() + effective.slice(1)})`;
    }
  }

  // Sun icon
  const sunIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  `;

  // Moon icon
  const moonIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  `;

  // Auto icon (sun + moon)
  const autoIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  `;

  const themeOptions: ThemeMode[] = ['auto', 'light', 'dark'];

  function getCurrentIcon() {
    if (currentMode === 'auto') {
      return isDark ? moonIcon : sunIcon;
    }
    return currentMode === 'dark' ? moonIcon : sunIcon;
  }
</script>

<div class="theme-toggle-wrapper">
  <button
    bind:this={buttonElement}
    on:click={toggleDropdown}
    class="theme-toggle-button"
    aria-label="Toggle theme"
    aria-haspopup="true"
    aria-expanded={isOpen}
    type="button"
  >
    <span class="theme-icon" class:dark-mode={isDark}>
      {@html getCurrentIcon()}
    </span>
    <svg xmlns="http://www.w3.org/2000/svg" class="dropdown-arrow" class:rotate-180={isOpen} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if isOpen}
    <div
      bind:this={dropdownElement}
      class="theme-dropdown"
      use:clickOutside={() => isOpen = false}
      role="menu"
      aria-label="Theme options"
    >
      {#each themeOptions as option}
        <button
          on:click={() => handleModeSelect(option)}
          class="theme-option"
          class:active={option === currentMode}
          role="menuitem"
          aria-label={getModeLabel(option)}
          aria-current={option === currentMode ? 'true' : undefined}
          type="button"
        >
          <span class="theme-option-icon">
            {#if option === 'light'}
              {@html sunIcon}
            {:else if option === 'dark'}
              {@html moonIcon}
            {:else}
              {@html autoIcon}
            {/if}
          </span>
          <span class="theme-option-content">
            <span class="theme-option-label">{getModeLabel(option)}</span>
            <span class="theme-option-description">{getModeDescription(option)}</span>
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
  .theme-toggle-wrapper {
    position: relative;
    display: inline-block;
  }

  .theme-toggle-button {
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

  .theme-toggle-button:hover {
    background: rgba(51, 65, 85, 0.9);
    border-color: rgba(100, 116, 139, 0.6);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .theme-toggle-button:active {
    transform: translateY(0);
  }

  .theme-toggle-button:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
  }

  .theme-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease;
  }

  .theme-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .theme-icon.dark-mode {
    transform: rotate(180deg);
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

  .theme-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    z-index: 100;
    min-width: 280px;
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

  .theme-option {
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

  .theme-option:hover {
    background: rgba(51, 65, 85, 0.6);
  }

  .theme-option.active {
    background: rgba(37, 99, 235, 0.2);
    color: #60a5fa;
  }

  .theme-option:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: -2px;
  }

  .theme-option:not(:last-child) {
    border-bottom: 1px solid rgba(51, 65, 85, 0.5);
  }

  .theme-option-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .theme-option-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .theme-option-content {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    flex: 1;
  }

  .theme-option-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: inherit;
  }

  .theme-option-description {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .theme-option.active .theme-option-description {
    color: #93c5fd;
  }

  .check-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: #60a5fa;
  }
</style>
