<script lang="ts">
  import { captureException } from '@/lib/sentry';
  import type { AppError } from '@/lib/utils/errors';

  interface Props {
    error: AppError;
    originalError?: Error | unknown;
    onClose?: () => void;
  }

  let {
    error,
    originalError,
    onClose,
  }: Props = $props();

  let email = $state('');
  let description = $state('');
  let includeLogs = $state(true);
  let isSubmitting = $state(false);
  let submitted = $state(false);

  // Get user agent for debugging
  const userAgent = navigator.userAgent;
  const url = window.location.href;
  const timestamp = new Date(error.timestamp).toISOString();

  // Format error details
  const errorDetails = {
    errorId: error.id,
    category: error.category,
    title: error.title,
    message: error.message,
    timestamp,
    url,
    userAgent,
    includeLogs,
  };

  // Add original error details if available
  if (originalError instanceof Error) {
    errorDetails.originalError = {
      name: originalError.name,
      message: originalError.message,
      stack: originalError.stack,
    };
  }

  function handleSubmit() {
    isSubmitting = true;

    try {
      // Send error report to Sentry with user feedback
      captureException(originalError instanceof Error ? originalError : new Error(error.message), {
        ...errorDetails,
        userFeedback: {
          email: email || 'anonymous',
          description,
        },
      });

      submitted = true;
      isSubmitting = false;

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose?.();
      }, 2000);
    } catch (err) {
      console.error('Failed to submit error report:', err);
      isSubmitting = false;
    }
  }

  function copyErrorId() {
    navigator.clipboard.writeText(error.id);
  }
</script>

<div class="error-report-backdrop" on:click={onClose}>
  <div class="error-report-modal" role="dialog" aria-modal="true" aria-labelledby="error-report-title">
    <div class="error-report-header">
      <h2 id="error-report-title">Report an Error</h2>
      <button class="close-btn" on:click={onClose} aria-label="Close modal">×</button>
    </div>

    {#if submitted}
      <div class="success-message">
        <div class="success-icon">✓</div>
        <h3>Report Submitted!</h3>
        <p>Thanks for helping us improve DadDeck.</p>
      </div>
    {:else}
      <div class="error-report-content">
        <!-- Error Summary -->
        <div class="error-summary">
          <div class="error-icon">{error.icon}</div>
          <div>
            <h3>{error.title}</h3>
            <p>{error.message}</p>
          </div>
        </div>

        <!-- Error Details -->
        <div class="error-details">
          <h4>Error Details</h4>
          <div class="detail-row">
            <span class="detail-label">Error ID:</span>
            <code class="error-id">{error.id}</code>
            <button class="copy-btn" on:click={copyErrorId} aria-label="Copy error ID">
              📋
            </button>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time:</span>
            <span>{new Date(error.timestamp).toLocaleString()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Category:</span>
            <span class="category-badge">{error.category}</span>
          </div>
        </div>

        <!-- User Feedback Form -->
        <form class="feedback-form" on:submit|preventDefault={handleSubmit}>
          <div class="form-group">
            <label for="error-email">
              Email (optional)
              <span class="help-text">Only if you want us to follow up</span>
            </label>
            <input
              id="error-email"
              type="email"
              placeholder="your@email.com"
              bind:value={email}
              disabled={isSubmitting}
            />
          </div>

          <div class="form-group">
            <label for="error-description">
              What happened? (optional)
              <span class="help-text">Describe what you were doing when this error occurred</span>
            </label>
            <textarea
              id="error-description"
              placeholder="I was opening a pack when..."
              rows="3"
              bind:value={description}
              disabled={isSubmitting}
            ></textarea>
          </div>

          <label class="checkbox-label">
            <input type="checkbox" bind:checked={includeLogs} disabled={isSubmitting} />
            <span>Include browser logs and diagnostics</span>
          </label>

          <div class="form-actions">
            <button type="button" class="btn-secondary" on:click={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" class="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Report'}
            </button>
          </div>
        </form>
      </div>
    {/if}

    <!-- Technical Details (collapsible) -->
    {#if import.meta.env.DEV}
      <details class="technical-details">
        <summary>Technical Details (Developer Only)</summary>
        <pre class="tech-details-content">{JSON.stringify(errorDetails, null, 2)}</pre>
      </details>
    {/if}
  </div>
</div>

<style>
  .error-report-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 1rem;
  }

  .error-report-modal {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-radius: 1rem;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(148, 163, 184, 0.1);
  }

  .error-report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  }

  .error-report-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #f1f5f9;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 2rem;
    cursor: pointer;
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    transition: all 0.2s;
    line-height: 1;
  }

  .close-btn:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  .error-report-content {
    padding: 1.5rem;
  }

  .success-message {
    text-align: center;
    padding: 3rem 1.5rem;
  }

  .success-icon {
    font-size: 4rem;
    color: #22c55e;
    margin-bottom: 1rem;
  }

  .success-message h3 {
    font-size: 1.5rem;
    color: #f1f5f9;
    margin-bottom: 0.5rem;
  }

  .success-message p {
    color: #94a3b8;
  }

  .error-summary {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 0.5rem;
  }

  .error-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
  }

  .error-summary h3 {
    margin: 0 0 0.5rem 0;
    color: #f1f5f9;
    font-size: 1.125rem;
  }

  .error-summary p {
    margin: 0;
    color: #94a3b8;
    font-size: 0.875rem;
  }

  .error-details {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: rgba(15, 23, 42, 0.5);
    border-radius: 0.5rem;
    border: 1px solid rgba(148, 163, 184, 0.1);
  }

  .error-details h4 {
    margin: 0 0 1rem 0;
    color: #f1f5f9;
    font-size: 1rem;
  }

  .detail-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }

  .detail-row:last-child {
    margin-bottom: 0;
  }

  .detail-label {
    color: #94a3b8;
    font-weight: 500;
    min-width: 80px;
  }

  .error-id {
    background: rgba(0, 0, 0, 0.3);
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-family: monospace;
    color: #22c55e;
    font-size: 0.8125rem;
  }

  .copy-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: all 0.2s;
  }

  .copy-btn:hover {
    background: rgba(34, 197, 94, 0.1);
  }

  .category-badge {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.8125rem;
    font-weight: 500;
  }

  .feedback-form {
    margin-top: 1.5rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    color: #f1f5f9;
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }

  .help-text {
    display: block;
    color: #64748b;
    font-size: 0.75rem;
    font-weight: 400;
    margin-top: 0.25rem;
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.75rem;
    background: rgba(15, 23, 42, 0.5);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 0.5rem;
    color: #f1f5f9;
    font-size: 0.875rem;
    font-family: inherit;
    transition: all 0.2s;
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .form-group input:disabled,
  .form-group textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #94a3b8;
    font-size: 0.875rem;
    cursor: pointer;
    user-select: none;
    margin-bottom: 1rem;
  }

  .checkbox-label input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
    cursor: pointer;
  }

  .form-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .form-actions button {
    flex: 1;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .form-actions button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: transparent;
    border: 1px solid rgba(148, 163, 184, 0.2);
    color: #94a3b8;
  }

  .btn-secondary:hover:not(:disabled) {
    background: rgba(148, 163, 184, 0.1);
    border-color: rgba(148, 163, 184, 0.3);
  }

  .btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border: none;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  .technical-details {
    margin-top: 1rem;
    padding: 0 1.5rem 1.5rem;
  }

  .technical-details summary {
    cursor: pointer;
    color: #64748b;
    font-size: 0.875rem;
    padding: 0.5rem 0;
    user-select: none;
  }

  .technical-details summary:hover {
    color: #94a3b8;
  }

  .tech-details-content {
    background: rgba(0, 0, 0, 0.3);
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: #94a3b8;
    line-height: 1.5;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .error-report-modal {
      max-height: 95vh;
    }

    .error-report-content {
      padding: 1rem;
    }

    .error-summary {
      flex-direction: column;
      text-align: center;
    }

    .detail-row {
      flex-wrap: wrap;
    }

    .detail-label {
      min-width: 100%;
      margin-bottom: 0.25rem;
    }
  }
</style>
