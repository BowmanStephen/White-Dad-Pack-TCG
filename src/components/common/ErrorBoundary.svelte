<script lang="ts">
  import { onMount } from 'svelte';
  import { createAppError, logError, categorizeError, type AppError } from '../../lib/utils/errors';
  import ErrorDisplay from './ErrorDisplay.svelte';

  interface Props {
    fallbackTitle?: string;
    fallbackMessage?: string;
    component?: string; // Component name for better error tracking
    onRetry?: () => void; // Custom retry handler
    showDetails?: boolean; // Show error details in dev mode
    children: import('svelte').Snippets;
  }

  let {
    fallbackTitle = 'Component Error',
    fallbackMessage = 'Something went wrong with this component. Please refresh the page.',
    component = 'Unknown',
    onRetry,
    showDetails = import.meta.env.DEV,
    children,
  }: Props = $props();

  let hasError = $state(false);
  let error: AppError | null = $state(null);
  let errorId = $state('');

  // Handle error and display friendly message
  function handleError(e: Error | unknown): void {
    hasError = true;
    const category = categorizeError(e);

    // Generate unique error ID for this component instance
    errorId = `err_${component}_${Date.now()}`;

    // Build recovery actions
    const recovery = [];

    // Add custom retry if provided
    if (onRetry) {
      recovery.push({
        label: 'Try Again',
        action: () => {
          reset();
          onRetry();
        },
        primary: true,
      });
    }

    // Add page reload option
    recovery.push({
      label: 'Reload Page',
      action: () => window.location.reload(),
    });

    // Add go home option (not primary)
    recovery.push({
      label: 'Go Home',
      action: () => (window.location.href = '/'),
    });

    // Create error object
    error = createAppError(
      category,
      e instanceof Error ? e : 'An unexpected error occurred',
      recovery
    );

    // Enhance error with component context
    error.id = errorId;
    if (showDetails && import.meta.env.DEV) {
      console.group(`%c🔍 ErrorBoundary Details: ${component}`, 'color: #f59e0b; font-weight: bold;');
      console.log('Component:', component);
      console.log('Error ID:', errorId);
      console.log('Error Category:', category);
      if (e instanceof Error) {
        console.log('Error Name:', e.name);
        console.log('Error Message:', e.message);
        console.log('Stack Trace:', e.stack);
      }
      console.groupEnd();
    }

    // Log to console
    logError(error, e);

    // Log to Sentry (if available)
    logToSentry(error, e, component);
  }

  // Log to Sentry (when integrated)
  function logToSentry(appError: AppError, originalError: Error | unknown, componentName: string) {
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry;

      Sentry.withScope((scope: any) => {
        scope.setTag('component', componentName);
        scope.setTag('error_category', appError.category);
        scope.setContext('error_boundary', {
          error_id: appError.id,
          component: componentName,
          timestamp: new Date(appError.timestamp).toISOString(),
        });

        if (originalError instanceof Error) {
          Sentry.captureException(originalError);
        } else {
          Sentry.captureMessage(appError.message);
        }
      });
    }
  }

  // Reset error state
  function reset() {
    hasError = false;
    error = null;
    errorId = '';
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
</script>

{#if hasError && error}
  <div class="error-boundary-wrapper">
    <ErrorDisplay {error} />
    {#if showDetails && import.meta.env.DEV}
      <details class="error-details">
        <summary>Developer Details</summary>
        <div class="error-details-content">
          <p><strong>Component:</strong> {component}</p>
          <p><strong>Error ID:</strong> {errorId}</p>
          <p><strong>Category:</strong> {error.category}</p>
          <p><strong>Timestamp:</strong> {new Date(error.timestamp).toLocaleString()}</p>
        </div>
      </details>
    {/if}
  </div>
{:else}
  {@render children()}
{/if}

<style>
  .error-boundary-wrapper {
    padding: 1rem;
  }

  .error-details {
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 0.5rem;
    font-size: 0.875rem;
  }

  .error-details summary {
    cursor: pointer;
    font-weight: 600;
    color: #94a3b8;
    user-select: none;
  }

  .error-details summary:hover {
    color: #cbd5e1;
  }

  .error-details-content {
    margin-top: 0.75rem;
    padding-left: 1rem;
  }

  .error-details-content p {
    margin: 0.25rem 0;
    color: #94a3b8;
  }

  .error-details-content strong {
    color: #cbd5e1;
  }
</style>
