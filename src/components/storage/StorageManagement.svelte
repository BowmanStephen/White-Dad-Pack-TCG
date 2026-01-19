<!--
PACK-045: Storage Management Component

Provides UI for:
- Viewing current storage usage
- Manually triggering quota management
- Archiving old packs
- Clearing all data
-->
<script lang="ts">
  import { clearUserCollection } from '@/stores/collection';
  import { getStorageQuotaInfo, getQuotaSummary, autoManageQuota } from '@/lib/storage/quota-manager';

  // State
  let quotaInfo = $state<{
    used: number;
    total: number;
    percentage: number;
    driver: string;
  } | null>(null);

  let quotaStatus = $state('Loading...');
  let isLoading = $state(false);
  let actionMessage = $state('');
  let actionType: 'success' | 'error' | 'info' = 'info';

  // Format bytes to human-readable
  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.pow(k, i));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // Load quota information
  async function loadQuotaInfo() {
    try {
      quotaInfo = await getStorageQuotaInfo();
      quotaStatus = await getQuotaSummary();
    } catch (error) {
      console.error('[StorageManagement] Failed to load quota info:', error);
      quotaStatus = 'Failed to load storage information';
    }
  }

  // Manually trigger quota management
  async function handleAutoManage() {
    if (isLoading) return;

    isLoading = true;
    actionMessage = 'Optimizing storage...';
    actionType = 'info';

    try {
      const result = await autoManageQuota(getQuotaStatus);
      if (result.success) {
        actionMessage = `✓ ${result.actions.join(', ')}`;
        actionType = 'success';
        await loadQuotaInfo();
      } else {
        actionMessage = `✗ No optimization needed: ${result.actions.join(', ')}`;
        actionType = 'error';
      }
    } catch (error) {
      actionMessage = '✗ Failed to optimize storage';
      actionType = 'error';
      console.error('[StorageManagement] Failed to manage quota:', error);
    } finally {
      isLoading = false;
    }
  }

  // Clear all collection data
  async function handleClearAll() {
    if (isLoading) return;

    const confirmed = confirm(
      'Are you sure you want to delete ALL collection data? ' +
      'This cannot be undone. Consider exporting your collection first!'
    );

    if (!confirmed) return;

    isLoading = true;
    actionMessage = 'Clearing collection...';
    actionType = 'info';

    try {
      const result = clearUserCollection();

      if (result.success) {
        actionMessage = '✓ Collection cleared successfully';
        actionType = 'success';
        await loadQuotaInfo(); // Refresh display
      } else {
        actionMessage = `✗ Failed to clear collection: ${result.error}`;
        actionType = 'error';
      }
    } catch (error) {
      actionMessage = '✗ Failed to clear collection';
      actionType = 'error';
      console.error('[StorageManagement] Failed to clear collection:', error);
    } finally {
      isLoading = false;
    }
  }

  // Export collection data
  async function handleExport() {
    try {
      const { exportCollection } = await import('@/stores/collection');
      const data = await exportCollection();

      // Create download link
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daddeck-collection-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      actionMessage = '✓ Collection exported successfully';
      actionType = 'success';
    } catch (error) {
      actionMessage = '✗ Failed to export collection';
      actionType = 'error';
      console.error('[StorageManagement] Failed to export:', error);
    }
  }

  // Load quota info on mount
  loadQuotaInfo();
</script>

<div class="storage-management">
  <!-- Storage Status Card -->
  <section class="card status-card">
    <h2>Storage Status</h2>

    {#if quotaInfo}
      <div class="quota-display">
        <div class="quota-bar-container">
          <div class="quota-info">
            <span class="quota-text">
              {formatBytes(quotaInfo.used)} / {formatBytes(quotaInfo.total)}
            </span>
            <span class="quota-percentage">{quotaInfo.percentage.toFixed(1)}%</span>
          </div>
          <progress
            value={quotaInfo.percentage}
            max="100"
            class="quota-bar"
            class:warning={quotaInfo.percentage >= 75}
            class:critical={quotaInfo.percentage >= 90}
          />
        </div>

        <div class="quota-details">
          <div class="detail-item">
            <span class="detail-label">Storage Driver:</span>
            <span class="detail-value">{quotaInfo.driver}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Status:</span>
            <span class="detail-value" class:warning={quotaInfo.percentage >= 75} class:critical={quotaInfo.percentage >= 90}>
              {quotaInfo.percentage >= 90 ? 'Almost Full' : quotaInfo.percentage >= 75 ? 'Getting Full' : 'Healthy'}
            </span>
          </div>
        </div>
      </div>
    {:else}
      <p class="loading-text">Loading storage information...</p>
    {/if}

    <p class="quota-status">{quotaStatus}</p>
  </section>

  <!-- Actions Card -->
  <section class="card actions-card">
    <h2>Storage Actions</h2>
    <p>Manually optimize your storage to free up space.</p>

    <div class="actions-grid">
      <button
        class="action-btn optimize"
        on:click={handleAutoManage}
        disabled={isLoading}
        class:loading={isLoading}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        <span>Auto-Optimize</span>
      </button>

      <button
        class="action-btn export"
        on:click={handleExport}
        disabled={isLoading}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>Export Collection</span>
      </button>

      <button
        class="action-btn clear"
        on:click={handleClearAll}
        disabled={isLoading}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        <span>Clear All Data</span>
      </button>
    </div>

    {#if actionMessage}
      <div class="action-message" class:{actionType}>
        {actionMessage}
      </div>
    {/if}
  </section>

  <!-- Tips Card -->
  <section class="card tips-card">
    <h2>Storage Tips</h2>
    <ul>
      <li>
        <strong>Auto-Optimize</strong> automatically compresses old pack data and archives packs older than 30 days.
      </li>
      <li>
        <strong>Export Collection</strong> downloads a backup of your entire collection as a JSON file.
      </li>
      <li>
        <strong>Clear All Data</strong> permanently deletes your collection. Export first if you want to keep it!
      </li>
      <li>
        <strong>Storage Driver</strong>: We use IndexedDB, which can store much more data than LocalStorage (typically 50MB+).
      </li>
    </ul>
  </section>
</div>

<style>
  .storage-management {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .card h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
  }

  .card > p {
    margin: 0 0 1rem 0;
    color: #6b7280;
    font-size: 0.875rem;
  }

  /* Status Card */
  .quota-display {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .quota-bar-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .quota-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
    color: #374151;
  }

  .quota-text {
    font-weight: 500;
  }

  .quota-percentage {
    font-weight: 600;
  }

  .quota-bar {
    width: 100%;
    height: 12px;
    border-radius: 6px;
    overflow: hidden;
  }

  .quota-bar::-webkit-progress-bar {
    background: #e5e7eb;
  }

  .quota-bar::-webkit-progress-value {
    background: #10b981;
    transition: background 0.3s;
  }

  .quota-bar.warning::-webkit-progress-value {
    background: #f59e0b;
  }

  .quota-bar.critical::-webkit-progress-value {
    background: #ef4444;
  }

  .quota-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    background: #f9fafb;
    border-radius: 6px;
    font-size: 0.875rem;
  }

  .detail-label {
    color: #6b7280;
  }

  .detail-value {
    font-weight: 500;
    color: #1f2937;
  }

  .detail-value.warning {
    color: #d97706;
  }

  .detail-value.critical {
    color: #dc2626;
  }

  .quota-status {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
    font-style: italic;
  }

  .loading-text {
    text-align: center;
    color: #6b7280;
    padding: 1rem;
  }

  /* Actions Card */
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .action-btn.optimize {
    background: #dbeafe;
    color: #1e40af;
  }

  .action-btn.optimize:hover:not(:disabled) {
    background: #bfdbfe;
  }

  .action-btn.export {
    background: #d1fae5;
    color: #065f46;
  }

  .action-btn.export:hover:not(:disabled) {
    background: #a7f3d0;
  }

  .action-btn.clear {
    background: #fee2e2;
    color: #991b1b;
  }

  .action-btn.clear:hover:not(:disabled) {
    background: #fecaca;
  }

  .action-btn.loading {
    position: relative;
  }

  .action-btn.loading::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .action-message {
    margin-top: 1rem;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
  }

  .action-message.success {
    background: #d1fae5;
    color: #065f46;
  }

  .action-message.error {
    background: #fee2e2;
    color: #991b1b;
  }

  .action-message.info {
    background: #dbeafe;
    color: #1e40af;
  }

  /* Tips Card */
  .tips-card ul {
    margin: 0;
    padding-left: 1.5rem;
    color: #4b5563;
    font-size: 0.875rem;
    line-height: 1.6;
  }

  .tips-card li {
    margin-bottom: 0.5rem;
  }

  .tips-card strong {
    color: #1f2937;
  }

  /* Dark mode support */
  :global(.dark) .card {
    background: #1f2937;
  }

  :global(.dark) .card h2 {
    color: #f9fafb;
  }

  :global(.dark) .card > p {
    color: #9ca3af;
  }

  :global(.dark) .quota-info,
  :global(.dark) .detail-item {
    color: #e5e7eb;
  }

  :global(.dark) .detail-value {
    color: #f9fafb;
  }

  :global(.dark) .quota-bar::-webkit-progress-bar {
    background: #374151;
  }

  :global(.dark) .detail-item {
    background: #374151;
  }

  :global(.dark) .detail-label {
    color: #9ca3af;
  }

  :global(.dark) .tips-card li {
    color: #d1d5db;
  }

  :global(.dark) .tips-card strong {
    color: #f9fafb;
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .actions-grid {
      grid-template-columns: 1fr;
    }

    .quota-details {
      grid-template-columns: 1fr;
    }
  }
</style>
