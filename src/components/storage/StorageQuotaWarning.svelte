<!--
PACK-045: Storage Quota Warning Component

Displays warnings and errors about storage quota to users.
Automatically listens for storage events and shows notifications.
-->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getQuotaInfo, getQuotaStatus } from '@/stores/collection';

  // Props (Svelte 5 runes mode)
  interface Props {
    showManual?: boolean; // Allow manual display
  }

  let { showManual = false }: Props = $props();

  // State
  let visible = $state(false);
  let message = $state('');
  let type: 'warning' | 'error' = 'warning';
  let quotaInfo = $state<{
    used: number;
    total: number;
    percentage: number;
    driver: string;
  } | null>(null);

  // Format bytes to human-readable
  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // Handle storage warning events
  function handleStorageWarning(event: Event) {
    const customEvent = event as CustomEvent<{ message: string; type: 'warning' | 'error' }>;
    message = customEvent.detail.message;
    type = customEvent.detail.type;
    visible = true;

    // Auto-hide after 10 seconds
    setTimeout(() => {
      visible = false;
    }, 10000);
  }

  // Handle storage error events
  function handleStorageError(event: Event) {
    const customEvent = event as CustomEvent<{ message: string; type: 'warning' | 'error' }>;
    message = customEvent.detail.message;
    type = customEvent.detail.type;
    visible = true;

    // Don't auto-hide errors
  }

  // Manually check quota
  async function checkQuota() {
    try {
      quotaInfo = await getQuotaInfo();
    } catch (error) {
      console.error('[StorageQuotaWarning] Failed to get quota info:', error);
    }
  }

  // Close notification
  function close() {
    visible = false;
  }

  // Listen for storage events
  onMount(() => {
    window.addEventListener('daddeck:storage-warning', handleStorageWarning);
    window.addEventListener('daddeck:storage-error', handleStorageError);
    checkQuota();
  });

  onDestroy(() => {
    window.removeEventListener('daddeck:storage-warning', handleStorageWarning);
    window.removeEventListener('daddeck:storage-error', handleStorageError);
  });
</script>

{#if visible || showManual}
  <div
    class="storage-warning"
    class:warning={type === 'warning'}
    class:error={type === 'error'}
    role="alert"
    aria-live="polite"
  >
    <div class="warning-content">
      <div class="warning-icon">
        {#if type === 'warning'}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        {/if}
      </div>

      <div class="warning-message">
        <h3>{type === 'warning' ? 'Storage Warning' : 'Storage Error'}</h3>
        <p>{message}</p>

        {#if quotaInfo}
          <div class="quota-info">
            <p><strong>Storage Usage:</strong> {formatBytes(quotaInfo.used)} / {formatBytes(quotaInfo.total)} ({quotaInfo.percentage.toFixed(1)}%)</p>
            <progress value={quotaInfo.percentage} max="100" class="quota-progress" />
          </div>
        {/if}
      </div>

      <button class="close-btn" on:click={close} aria-label="Close warning">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </div>
{/if}

<style>
  .storage-warning {
    position: fixed;
    bottom: 20px;
    right: 20px;
    max-width: 400px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  }

  .storage-warning.warning {
    border-left: 4px solid #f59e0b;
  }

  .storage-warning.error {
    border-left: 4px solid #ef4444;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .warning-content {
    display: flex;
    gap: 12px;
    padding: 16px;
  }

  .warning-icon {
    flex-shrink: 0;
    display: flex;
    align-items: flex-start;
  }

  .warning-icon svg {
    width: 24px;
    height: 24px;
  }

  .warning svg {
    color: #f59e0b;
  }

  .error .warning-icon svg {
    color: #ef4444;
  }

  .warning-message {
    flex: 1;
    min-width: 0;
  }

  .warning-message h3 {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 600;
  }

  .warning.warning .warning-message h3 {
    color: #92400e;
  }

  .error .warning-message h3 {
    color: #991b1b;
  }

  .warning-message p {
    margin: 0 0 8px 0;
    font-size: 14px;
    line-height: 1.4;
  }

  .quota-info {
    margin-top: 8px;
    padding: 8px;
    background: #f3f4f6;
    border-radius: 4px;
    font-size: 13px;
  }

  .quota-info p {
    margin: 0 0 4px 0;
  }

  .quota-progress {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
  }

  .quota-progress::-webkit-progress-bar {
    background: #e5e7eb;
  }

  .warning .quota-progress::-webkit-progress-value {
    background: #f59e0b;
  }

  .error .quota-progress::-webkit-progress-value {
    background: #ef4444;
  }

  .close-btn {
    flex-shrink: 0;
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #6b7280;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  .close-btn:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  /* Dark mode support */
  :global(.dark) .storage-warning {
    background: #1f2937;
    color: #f9fafb;
  }

  :global(.dark) .warning.warning .warning-message h3 {
    color: #fcd34d;
  }

  :global(.dark) .error .warning-message h3 {
    color: #fca5a5;
  }

  :global(.dark) .quota-info {
    background: #374151;
  }

  :global(.dark) .quota-progress::-webkit-progress-bar {
    background: #4b5563;
  }

  :global(.dark) .close-btn {
    color: #9ca3af;
  }

  :global(.dark) .close-btn:hover {
    background: #374151;
    color: #f3f4f6;
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .storage-warning {
      left: 10px;
      right: 10px;
      bottom: 10px;
      max-width: none;
    }
  }
</style>
