<script lang="ts">
  import type { AppError } from '../../lib/utils/errors';
  import FadeIn from '../loading/FadeIn.svelte';

  interface Props {
    error: AppError;
    onDismiss?: () => void;
  }

  let { error, onDismiss }: Props = $props();

  // Execute recovery action
  function handleRecovery(action: () => void) {
    try {
      action();
    } catch (e) {
      console.error('Recovery action failed:', e);
    }
  }
</script>

<div class="error-display" role="alert" aria-live="assertive">
  <FadeIn>
    <div class="error-container">
      <!-- Error Icon -->
      <div class="error-icon" aria-hidden="true">
        {error.icon}
      </div>

      <!-- Error Content -->
      <div class="error-content">
        <h2 class="error-title">{error.title}</h2>
        <p class="error-message">{error.message}</p>

        <!-- Recovery Actions -->
        {#if error.recovery.length > 0}
          <div class="error-actions">
            {#each error.recovery as recovery}
              <button
                class="error-button"
                class:primary={recovery.primary}
                onclick={() => handleRecovery(recovery.action)}
              >
                {recovery.label}
              </button>
            {/each}
          </div>
        {/if}

        <!-- Dismiss Button (optional) -->
        {#if onDismiss}
          <button
            class="error-dismiss"
            onclick={onDismiss}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        {/if}
      </div>
    </div>
  </FadeIn>
</div>

<style>
  .error-display {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    padding: 1rem;
  }

  .error-container {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
    border: 2px solid rgba(239, 68, 68, 0.3);
    border-radius: 1rem;
    padding: 2rem;
    position: relative;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
  }

  .error-icon {
    font-size: 4rem;
    text-align: center;
    margin-bottom: 1rem;
    animation: shake 0.5s ease-in-out;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  .error-content {
    text-align: center;
  }

  .error-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fca5a5;
    margin: 0 0 0.75rem 0;
  }

  .error-message {
    font-size: 1rem;
    color: #d1d5db;
    line-height: 1.6;
    margin: 0 0 1.5rem 0;
  }

  .error-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }

  .error-button {
    min-width: 180px;
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
  }

  .error-button.primary {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: #1f2937;
    box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.3);
  }

  .error-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px -1px rgba(245, 158, 11, 0.4);
  }

  .error-button.primary:active {
    transform: translateY(0);
  }

  .error-button:not(.primary) {
    background: rgba(75, 85, 99, 0.5);
    color: #d1d5db;
    border: 1px solid rgba(107, 114, 128, 0.5);
  }

  .error-button:not(.primary):hover {
    background: rgba(75, 85, 99, 0.7);
    border-color: rgba(156, 163, 175, 0.5);
  }

  .error-dismiss {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: none;
    background: rgba(75, 85, 99, 0.5);
    color: #9ca3af;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .error-dismiss:hover {
    background: rgba(107, 114, 128, 0.7);
    color: #d1d5db;
  }

  /* Responsive adjustments */
  @media (min-width: 640px) {
    .error-actions {
      flex-direction: row;
      justify-content: center;
    }
  }
</style>
