<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import { modalOpen, closeModal } from '@/stores/ui';
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

  // Subscribe to modalOpen store
  if (typeof window !== 'undefined') {
    modalOpen.subscribe((value) => {
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

    return () => {
      unsubMuted();
      unsubMaster();
      unsubMusic();
      unsubSfx();
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

        <!-- Future Settings Sections -->
        <!--
        <div class="settings-section">
          <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
            Graphics
          </h3>
          <p class="text-slate-500 text-sm">More settings coming soon...</p>
        </div>
        -->
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
</style>
