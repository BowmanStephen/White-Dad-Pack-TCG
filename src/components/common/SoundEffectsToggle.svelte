<script lang="ts">
  /**
   * SoundEffectsToggle Component
   *
   * A quick toggle for sound effects (mute/unmute).
   * This provides fast access to audio controls without visiting settings.
   *
   * Usage:
   * <SoundEffectsToggle />
   */

  import { muted, toggleMute } from '../../stores/audio';

  let isMuted = $state(false);

  // Subscribe to muted state
  $effect(() => {
    const unsubscribe = muted.subscribe((value) => {
      isMuted = value;
    });
    return unsubscribe;
  });

  function handleClick() {
    toggleMute();
  }
</script>

<button
  class="sound-toggle"
  on:click={handleClick}
  aria-label={isMuted ? 'Enable sounds' : 'Mute sounds'}
  aria-pressed={isMuted}
  type="button"
  title={isMuted ? 'Enable sounds' : 'Mute sounds'}
>
  {#if isMuted}
    <!-- Muted icon -->
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  {:else}
    <!-- Sound on icon -->
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  {/if}
</button>

<style>
  .sound-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0.5rem;
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    border-radius: 0.5rem;
    transition: color 0.2s ease, background 0.2s ease, transform 0.2s ease;
  }

  .sound-toggle:hover {
    color: #f8fafc;
    background: rgba(251, 191, 36, 0.1);
  }

  .sound-toggle:active {
    transform: scale(0.95);
  }

  /* Animation for muted state */
  .sound-toggle :global(svg) {
    transition: all 0.2s ease;
  }

  .sound-toggle:hover :global(svg) {
    transform: scale(1.1);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .sound-toggle {
      width: 2.25rem;
      height: 2.25rem;
    }
  }
</style>
