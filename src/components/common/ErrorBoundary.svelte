<script lang="ts">
  import { onMount } from 'svelte';
  import { createAppError, logError, type AppError } from '../../lib/utils/errors';
  import ErrorDisplay from './ErrorDisplay.svelte';

  interface Props {
    fallbackTitle?: string;
    fallbackMessage?: string;
    children: import('svelte').Snippets;
  }

  let {
    fallbackTitle = 'Component Error',
    fallbackMessage = 'Something went wrong with this component. Please refresh the page.',
    children,
  }: Props = $props();

  let hasError = $state(false);
  let error: AppError | null = $state(null);

  // Handle error and display friendly message
  function handleError(e: Error | unknown): void {
    hasError = true;
    error = createAppError(
      'unknown',
      e instanceof Error ? e : 'An unexpected error occurred',
      [
        {
          label: 'Reload Page',
          action: () => window.location.reload(),
          primary: true,
        },
        {
          label: 'Go Home',
          action: () => (window.location.href = '/'),
        },
      ]
    );

    // Log to console
    logError(error, e);
  }

  // Wrap component lifecycle in error handling
  onMount(() => {
    // Set up global error handler for unhandled errors
    const handleErrorGlobal = (event: ErrorEvent) => {
      handleError(event.error);
      event.preventDefault(); // Prevent default error handling
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      handleError(event.reason);
      event.preventDefault(); // Prevent default handling
    };

    window.addEventListener('error', handleErrorGlobal);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleErrorGlobal);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  });

  // Try block wrapper for child components
  function tryRender() {
    try {
      return true;
    } catch (e) {
      handleError(e);
      return false;
    }
  }
</script>

{#if hasError && error}
  <ErrorDisplay {error} />
{:else}
  {@render children()}
{/if}
