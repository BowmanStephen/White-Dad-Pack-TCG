<script lang="ts">
  import * as uiStore from '@/stores/ui';

  // Subscribe to cinematic mode
  const isCinematic = $derived(uiStore.cinematicMode.get() === 'cinematic');

  function handleToggle() {
    uiStore.toggleCinematicMode();
  }
</script>

<button
  class="cinematic-toggle"
  class:active={isCinematic}
  data-testid="cinematic-toggle"
  onclick={handleToggle}
  aria-label="Toggle cinematic mode"
  aria-pressed={isCinematic}
  title={isCinematic ? 'Cinematic mode ON - Slower, more dramatic animations' : 'Cinematic mode OFF - Standard animations'}
>
  <span class="toggle-icon" class:icon-film={isCinematic} class:icon-film-outline={!isCinematic}>
    {#if isCinematic}
      🎬
    {:else}
      🎬
    {/if}
  </span>
  <span class="toggle-label">
    {isCinematic ? 'Cinematic' : 'Normal'}
  </span>
</button>

<style>
  .cinematic-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(30, 41, 59, 0.8);
    border: 2px solid #475569;
    border-radius: 9999px;
    color: #cbd5e1;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(8px);
  }

  .cinematic-toggle:hover {
    background: rgba(51, 65, 85, 0.8);
    border-color: #64748b;
    transform: translateY(-1px);
  }

  .cinematic-toggle:active {
    transform: translateY(0);
  }

  .cinematic-toggle.active {
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(168, 85, 247, 0.3));
    border-color: #ec4899;
    color: #fce7f3;
    box-shadow: 0 0 20px rgba(236, 72, 153, 0.4);
  }

  .toggle-icon {
    font-size: 1.25rem;
    line-height: 1;
    transition: transform 0.3s ease;
  }

  .cinematic-toggle:hover .toggle-icon {
    transform: scale(1.1);
  }

  .cinematic-toggle.active .toggle-icon {
    animation: pulse-glow 2s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% {
      filter: drop-shadow(0 0 4px rgba(236, 72, 153, 0.6));
    }
    50% {
      filter: drop-shadow(0 0 12px rgba(236, 72, 153, 1));
    }
  }

  .toggle-label {
    letter-spacing: 0.025em;
  }

  /* Mobile optimization */
  @media (max-width: 640px) {
    .cinematic-toggle {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }

    .toggle-icon {
      font-size: 1rem;
    }
  }
</style>
