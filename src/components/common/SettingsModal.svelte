<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import { modalOpen, closeModal, animationQuality, setAnimationQuality, getEffectiveQuality, screenShakeEnabled, setScreenShakeEnabled, toggleScreenShake } from '@/stores/ui';
  import type { AnimationQuality } from '@/stores/ui';
  import { muted, masterVolume, musicVolume, sfxVolume, toggleMute, setMasterVolume, setMusicVolume, setSfxVolume } from '@/stores/audio';
  import { onMount, onDestroy, untrack } from 'svelte';
  import Slider from './Slider.svelte';
  import Toggle from './Toggle.svelte';

  // Local reactive state
  let isOpen = false;
  let modalElement: HTMLElement;
  let previouslyFocusedElement: HTMLElement | null = null;

  // Audio state (convert from 0-1 to 0-100 for slider)
  let isMuted = $state(false);
  let masterVol = $state(70);
  let musicVol = $state(70);
  let sfxVol = $state(80);

  // Graphics state
  let quality: AnimationQuality = 'auto';
  let qualityDropdownOpen = $state(false);
  let qualityButtonElement: HTMLElement;
  let qualityDropdownElement: HTMLElement;
  let isScreenShakeEnabled = $state(true);

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

  // Subscribe to modalOpen store (with cleanup to prevent memory leak)
  let modalUnsubscribe: (() => void) | null = null;
  if (typeof window !== 'undefined') {
    modalUnsubscribe = modalOpen.subscribe((value) => {
      isOpen = value === 'settings';
      if (isOpen) {
        // Store the previously focused element
        previouslyFocusedElement = document.activeElement as HTMLElement;
        // Sync audio state when modal opens
        syncAudioState();
        // Focus the modal
        setTimeout(() => {
          modalElement?.focus();
        }, 50);
      } else if (previouslyFocusedElement) {
        // Return focus to the previously focused element
        setTimeout(() => {
          previouslyFocusedElement?.focus();
        }, 50);
      }
    });
  }

  // Subscribe to audio stores
  $effect(() => {
    const unsubMuted = muted.subscribe((value) => {
      isMuted = value;
    });
    const unsubMaster = masterVolume.subscribe((value) => {
      masterVol = Math.round(value * 100);
    });
    const unsubMusic = musicVolume.subscribe((value) => {
      musicVol = Math.round(value * 100);
    });
    const unsubSfx = sfxVolume.subscribe((value) => {
      sfxVol = Math.round(value * 100);
    });
    const unsubQuality = animationQuality.subscribe((value) => {
      quality = value;
    });
    const unsubScreenShake = screenShakeEnabled.subscribe((value) => {
      isScreenShakeEnabled = value;
    });

    return () => {
      unsubMuted();
      unsubMaster();
      unsubMusic();
      unsubSfx();
      unsubQuality();
      unsubScreenShake();
    };
  });

  function syncAudioState() {
    // Sync local state with store values (using untrack to avoid reactivity loops)
    untrack(() => {
      isMuted = muted.get();
      masterVol = Math.round(masterVolume.get() * 100);
      musicVol = Math.round(musicVolume.get() * 100);
      sfxVol = Math.round(sfxVolume.get() * 100);
    });
  }

  // Focus trap for modal
  function handleModalKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose();
      return;
    }

    if (e.key === 'Tab') {
      const focusableElements = modalElement?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }

  onMount(() => {
    // Store previously focused element when modal mounts
    if (isOpen) {
      previouslyFocusedElement = document.activeElement as HTMLElement;
    }
  });

  onDestroy(() => {
    // Clean up modalOpen subscription to prevent memory leak
    if (modalUnsubscribe) {
      modalUnsubscribe();
    }
    // Restore focus when modal is destroyed
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }
  });

  function handleClose() {
    closeModal();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  function handleMuteChange() {
    toggleMute();
  }

  function handleMasterVolumeChange(val: number) {
    masterVol = val;
    setMasterVolume(val / 100);
  }

  function handleMusicVolumeChange(val: number) {
    musicVol = val;
    setMusicVolume(val / 100);
  }

  function handleSfxVolumeChange(val: number) {
    sfxVol = val;
    setSfxVolume(val / 100);
  }

  function handleQualityChange(q: AnimationQuality) {
    setAnimationQuality(q);
    qualityDropdownOpen = false;
  }

  function handleScreenShakeChange() {
    toggleScreenShake();
  }

  function toggleQualityDropdown() {
    qualityDropdownOpen = !qualityDropdownOpen;
  }

  function getQualityLabel(q: AnimationQuality): string {
    switch (q) {
      case 'auto':
        return 'Auto-Detect';
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
    }
  }

  function getQualityDescription(q: AnimationQuality): string {
    switch (q) {
      case 'auto':
        const effective = getEffectiveQuality();
        return `Automatically adjusted based on device (currently: ${effective.charAt(0).toUpperCase() + effective.slice(1)})`;
      case 'high':
        return 'All particle effects enabled for premium visuals';
      case 'medium':
        return 'Reduced particles (50%) for balanced performance';
      case 'low':
        return 'Minimal particles (20%) for maximum performance';
    }
  }

  // Quality options for dropdown
  const qualityOptions: AnimationQuality[] = ['auto', 'high', 'medium', 'low'];

  // Icon snippets
  const volumeIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  `;

  const musicIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  `;

  const sfxIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  `;
</script>

{#if isOpen}
  <div
    bind:this={modalElement}
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    in:fade={{ duration: 200 }}
    out:fade={{ duration: 150 }}
    on:click={handleBackdropClick}
    on:keydown={handleModalKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="settings-modal-title"
    tabindex="-1"
  >
    <div
      class="relative w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-slate-800"
      in:scale={{ duration: 300, easing: backOut }}
      out:scale={{ duration: 150 }}
      on:click|stopPropagation
    >
      <!-- Close button -->
      <button
        on:click={closeModal}
        class="absolute top-4 right-4 p-3 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800 min-w-[44px] min-h-[44px]"
        aria-label="Close settings"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Modal header -->
      <div class="p-6 pb-4">
        <h2 id="settings-modal-title" class="text-2xl font-bold text-white">
          Settings
        </h2>
        <p class="text-slate-400 mt-1 text-sm">
          Customize your experience
        </p>
      </div>

      <!-- Settings content -->
      <div class="p-6 pt-2 space-y-6 max-h-[60vh] overflow-y-auto">
        <!-- Audio Settings Section -->
        <div class="settings-section">
          <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            Audio
          </h3>

          <div class="space-y-4">
            <!-- Mute Toggle -->
            <div class="setting-row">
              <Toggle
                bind:checked={isMuted}
                label="Mute All Sounds"
                ariaLabel="Toggle mute all sounds"
                onchange={handleMuteChange}
              />
              <p class="setting-description">
                Quickly disable all audio. Individual volume controls below are preserved.
              </p>
            </div>

            <!-- Master Volume -->
            <div class="setting-row">
              <Slider
                bind:value={masterVol}
                min={0}
                max={100}
                step={1}
                label="Master Volume"
                ariaLabel="Master volume"
                onchange={(e) => handleMasterVolumeChange(e.detail)}
              >
                {#snippet icon()}
                  {@html volumeIcon}
                {/snippet}
              </Slider>
              <p class="setting-description">
                Overall volume level. Affects all sounds equally.
              </p>
            </div>

            <!-- Music Volume -->
            <div class="setting-row">
              <Slider
                bind:value={musicVol}
                min={0}
                max={100}
                step={1}
                label="Music Volume"
                ariaLabel="Music volume"
                onchange={(e) => handleMusicVolumeChange(e.detail)}
              >
                {#snippet icon()}
                  {@html musicIcon}
                {/snippet}
              </Slider>
              <p class="setting-description">
                Background music volume (coming soon).
              </p>
            </div>

            <!-- SFX Volume -->
            <div class="setting-row">
              <Slider
                bind:value={sfxVol}
                min={0}
                max={100}
                step={1}
                label="Sound Effects"
                ariaLabel="Sound effects volume"
                onchange={(e) => handleSfxVolumeChange(e.detail)}
              >
                {#snippet icon()}
                  {@html sfxIcon}
                {/snippet}
              </Slider>
              <p class="setting-description">
                Pack tears, card reveals, and other game sounds.
              </p>
            </div>
          </div>
        </div>

        <!-- Graphics Settings Section -->
        <div class="settings-section">
          <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Graphics
          </h3>

          <div class="space-y-4">
            <!-- Screen Shake Toggle -->
            <div class="setting-row">
              <Toggle
                bind:checked={isScreenShakeEnabled}
                label="Screen Shake Effects"
                ariaLabel="Toggle screen shake effects"
                onchange={handleScreenShakeChange}
              />
              <p class="setting-description">
                Subtle screen shake on mythic card reveals for epic moments. Disabled automatically if you prefer reduced motion.
              </p>
            </div>

            <!-- Animation Quality Dropdown -->
            <div class="setting-row">
              <div class="relative" use:clickOutside={() => qualityDropdownOpen = false}>
                <button
                  bind:this={qualityButtonElement}
                  on:click={toggleQualityDropdown}
                  class="quality-select-button"
                  aria-expanded={qualityDropdownOpen}
                  aria-haspopup="listbox"
                  type="button"
                >
                  <span class="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span class="font-medium text-white">Animation Quality</span>
                  </span>
                  <span class="flex items-center gap-2">
                    <span class="text-slate-300">{getQualityLabel(quality)}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400 transition-transform duration-200" class:rotate-180={qualityDropdownOpen} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                {#if qualityDropdownOpen}
                  <div
                    bind:this={qualityDropdownElement}
                    class="quality-dropdown-menu"
                    role="listbox"
                    aria-label="Animation quality options"
                  >
                    {#each qualityOptions as option}
                      <button
                        on:click={() => handleQualityChange(option)}
                        class="quality-option"
                        class:active={option === quality}
                        role="option"
                        aria-selected={option === quality}
                        type="button"
                      >
                        <span class="flex-1 text-left">{getQualityLabel(option)}</span>
                        {#if option === quality}
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                        {/if}
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
              <p class="setting-description">
                {getQualityDescription(quality)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 pb-6">
        <p class="text-slate-500 text-xs text-center">
          Settings are saved automatically
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .setting-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .setting-description {
    font-size: 0.75rem;
    color: #64748b;
    margin: 0;
    padding-left: 0;
    line-height: 1.4;
  }

  /* Custom scrollbar for settings content */
  :global(.overflow-y-auto) {
    scrollbar-width: thin;
    scrollbar-color: #475569 #1e293b;
  }

  :global(.overflow-y-auto::-webkit-scrollbar) {
    width: 8px;
  }

  :global(.overflow-y-auto::-webkit-scrollbar-track) {
    background: #1e293b;
    border-radius: 4px;
  }

  :global(.overflow-y-auto::-webkit-scrollbar-thumb) {
    background: #475569;
    border-radius: 4px;
  }

  :global(.overflow-y-auto::-webkit-scrollbar-thumb:hover) {
    background: #64748b;
  }

  /* Quality Select Button */
  .quality-select-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.75rem 1rem;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 0.5rem;
    color: #e2e8f0;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .quality-select-button:hover {
    background: #334155;
    border-color: #475569;
  }

  .quality-select-button:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
  }

  /* Quality Dropdown Menu */
  .quality-dropdown-menu {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    right: 0;
    z-index: 50;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 0.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    animation: dropdown-fade-in 0.2s ease-out;
  }

  @keyframes dropdown-fade-in {
    from {
      opacity: 0;
      transform: translateY(-0.5rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Quality Option */
  .quality-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    color: #e2e8f0;
    font-size: 0.875rem;
    text-align: left;
    transition: background 0.15s ease;
    cursor: pointer;
  }

  .quality-option:hover {
    background: #334155;
  }

  .quality-option.active {
    background: #1e3a5f;
    color: #60a5fa;
  }

  .quality-option:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: -2px;
  }

  .quality-option:not(:last-child) {
    border-bottom: 1px solid #334155;
  }
</style>
