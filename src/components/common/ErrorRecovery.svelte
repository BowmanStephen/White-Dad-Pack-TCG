<script lang="ts">
  import type { AppError } from '../../lib/utils/errors';
  import { logError } from '../../lib/utils/errors';
  import FadeIn from '../loading/FadeIn.svelte';

  interface Props {
    error: AppError;
    onRetry?: () => Promise<void> | void;
    onDismiss?: () => void;
    isRetrying?: boolean;
  }

  let { error, onRetry, onDismiss, isRetrying = false }: Props = $props();
  let retrySuccess = $state(false);
  let retryFailed = $state(false);

  // Handle retry with error clearing
  async function handleRetry() {
    if (!onRetry) return;

    // Reset states
    retrySuccess = false;
    retryFailed = false;

    try {
      await onRetry();
      retrySuccess = true;

      // Auto-dismiss on success after 2 seconds
      setTimeout(() => {
        if (retrySuccess && onDismiss) {
          onDismiss();
        }
      }, 2000);
    } catch (e) {
      retryFailed = true;
      // Log the retry failure
      const retryError = {
        name: 'RetryFailed',
        message: `Retry attempt failed for error ${error.id}`,
        stack: e instanceof Error ? e.stack : undefined,
      };
      logError(error, retryError);
    }
  }

  // Get primary recovery action or use onRetry
  function getPrimaryAction() {
    if (onRetry) {
      return {
        label: 'Retry',
        action: handleRetry,
        primary: true,
      };
    }
    return error.recovery.find(r => r.primary) || error.recovery[0];
  }

  // Get secondary actions
  function getSecondaryActions() {
    if (onRetry) {
      return error.recovery;
    }
    return error.recovery.filter(r => !r.primary);
  }
</script>

<div class="error-recovery" role="alert" aria-live="assertive">
  <FadeIn>
    <div class="recovery-container">
      <!-- Error Icon with Animation -->
      <div class="error-icon" class:success={retrySuccess} class:failed={retryFailed} aria-hidden="true">
        {retrySuccess ? '✅' : retryFailed ? '❌' : error.icon}
      </div>

      <!-- Error Content -->
      <div class="recovery-content">
        <h2 class="error-title">
          {retrySuccess ? 'Success!' : retryFailed ? 'Retry Failed' : error.title}
        </h2>

        <p class="error-message">
          {retrySuccess
            ? 'The operation completed successfully.'
            : retryFailed
              ? 'The retry attempt failed. Please try again or contact support if this persists.'
              : error.message}
        </p>

        <!-- Retry Status -->
        {#if isRetrying}
          <div class="retry-status" aria-live="polite">
            <div class="spinner"></div>
            <span>Retrying...</span>
          </div>
        {/if}

        <!-- Recovery Actions -->
        {#if !retrySuccess}
          <div class="recovery-actions">
            {#if onRetry}
              <button
                class="btn-retry"
                onclick={handleRetry}
                disabled={isRetrying}
                aria-label="Retry operation"
              >
                {isRetrying ? 'Retrying...' : 'Retry'}
              </button>
            {/if}

            {#each getSecondaryActions() as action}
              <button
                class="btn-secondary"
                onclick={action.action}
                disabled={isRetrying}
              >
                {action.label}
              </button>
            {/each}

            {#if onDismiss}
              <button
                class="btn-dismiss"
                onclick={onDismiss}
                disabled={isRetrying}
                aria-label="Dismiss error"
              >
                Dismiss
              </button>
            {/if}
          </div>
        {/if}

        <!-- Error ID for Support -->
        <div class="error-footer">
          <span class="error-id">Error ID: {error.id}</span>
          <span class="error-time">
            {new Date(error.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  </FadeIn>
</div>

<style>
  .error-recovery {
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
    padding: 1rem;
  }

  .recovery-container {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.04) 100%);
    border: 2px solid rgba(239, 68, 68, 0.25);
    border-radius: 1rem;
    padding: 2rem;
    position: relative;
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
  }

  .error-icon {
    font-size: 3.5rem;
    text-align: center;
    margin-bottom: 1rem;
    animation: shake 0.5s ease-in-out;
    transition: transform 0.3s ease;
  }

  .error-icon.success {
    animation: success 0.6s ease-out;
    transform: scale(1.1);
  }

  .error-icon.failed {
    animation: shake 0.5s ease-in-out, pulse 1s ease-in-out infinite;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }

  @keyframes success {
    0% { transform: scale(0.5); opacity: 0; }
    50% { transform: scale(1.2); }
    100% { transform: scale(1.1); opacity: 1; }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .recovery-content {
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

  .retry-status {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 0.5rem;
    color: #fcd34d;
    font-size: 0.9375rem;
    font-weight: 500;
    margin-bottom: 1rem;
  }

  .spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(245, 158, 11, 0.3);
    border-top-color: #fcd34d;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .recovery-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
    margin-bottom: 1rem;
  }

  .btn-retry,
  .btn-secondary,
  .btn-dismiss {
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

  .btn-retry {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: #1f2937;
    box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.3);
  }

  .btn-retry:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px -1px rgba(245, 158, 11, 0.4);
  }

  .btn-retry:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-secondary {
    background: rgba(75, 85, 99, 0.5);
    color: #d1d5db;
    border: 1px solid rgba(107, 114, 128, 0.5);
  }

  .btn-secondary:hover:not(:disabled) {
    background: rgba(75, 85, 99, 0.7);
    border-color: rgba(156, 163, 175, 0.5);
  }

  .btn-dismiss {
    background: transparent;
    color: #9ca3af;
    border: 1px solid rgba(107, 114, 128, 0.3);
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
    min-width: auto;
  }

  .btn-dismiss:hover:not(:disabled) {
    background: rgba(75, 85, 99, 0.3);
    color: #d1d5db;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  .error-footer {
    display: flex;
    justify-content: center;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(75, 85, 99, 0.3);
    font-size: 0.75rem;
    color: #6b7280;
  }

  .error-id,
  .error-time {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  /* Responsive adjustments */
  @media (min-width: 640px) {
    .recovery-actions {
      flex-direction: row;
      justify-content: center;
      flex-wrap: wrap;
    }

    .error-footer {
      justify-content: space-between;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .error-icon,
    .spinner {
      animation: none;
    }

    .btn-retry:hover,
    .btn-secondary:hover {
      transform: none;
    }
  }
</style>
