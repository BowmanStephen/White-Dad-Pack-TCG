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
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 0.5rem;
    color: #fca5a5;
    font-size: 0.875rem;
    line-height: 1.4;
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
