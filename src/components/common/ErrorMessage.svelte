<script lang="ts">
  import type { AppError } from '../../lib/utils/errors';
  import FadeIn from '../loading/FadeIn.svelte';

  interface Props {
    error: AppError;
    compact?: boolean;
  }

  let { error, compact = false }: Props = $props();
</script>

<div class="error-message" class:compact role="alert" aria-live="polite">
  <FadeIn>
    <span class="error-icon" aria-hidden="true">{error.icon}</span>
    <span class="error-text">
      {compact ? error.title : error.message}
    </span>
  </FadeIn>
</div>

<style>
  .error-message {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    /* WCAG AA compliant: darker background for contrast */
    background: rgba(220, 38, 38, 0.25); /* red-700 at 25% opacity (was red-500 at 10%) */
    border: 2px solid rgba(239, 68, 68, 0.6); /* Thicker, more opaque border */
    border-radius: 0.5rem;
    /* WCAG AA: lighter text for better contrast on dark backgrounds */
    color: #fca5a5; /* red-400 */
    font-size: 0.875rem;
    line-height: 1.4;
  }

  /* Dark mode override - higher contrast */
  :global(.dark) .error-message {
    background: rgba(220, 38, 38, 0.35); /* Higher opacity in dark mode */
    color: #fecaca; /* red-300 - lighter for dark mode */
  }

  .error-message.compact {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }

  .error-icon {
    font-size: 1.25rem;
    line-height: 1;
  }

  .error-message.compact .error-icon {
    font-size: 1rem;
  }

  .error-text {
    flex: 1;
  }
</style>
