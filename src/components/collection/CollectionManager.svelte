<script lang="ts">
  import {
    exportCollection,
    importCollection,
    collection,
    clearCollection,
  } from '@/stores/collection';
  import type { Collection } from '@/types';

  // UI state
  let showModal = $state(false);
  let importMode = $state<'merge' | 'replace' | null>(null);
  let error = $state<string | null>(null);
  let success = $state<string | null>(null);
  let isProcessing = $state(false);

  // File input ref
  let fileInput: HTMLInputElement;

  // Get current collection stats (guard for SSR)
  let currentPackCount = $derived(typeof window !== 'undefined' ? collection.get().packs.length : 0);

  /**
   * Export collection as JSON file
   * Filename: daddeck-collection-[timestamp].json
   */
  function handleExport() {
    try {
      const data = exportCollection();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `daddeck-collection-${timestamp}.json`;

      // Create blob and download
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccess(`Collection exported to ${filename}`);
    } catch (err) {
      showError(
        err instanceof Error ? err.message : 'Failed to export collection'
      );
    }
  }

  /**
   * Trigger file input click for import
   */
  function triggerImport() {
    fileInput.click();
  }

  /**
   * Handle file selection for import
   */
  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json')) {
      showError('Please select a JSON file');
      return;
    }

    // Show modal to choose merge or replace
    showModal = true;
    importMode = null;
    error = null;
    success = null;
  }

  /**
   * Read and parse the selected file
   */
  async function readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Validate collection data structure
   */
  function validateCollection(data: unknown): { valid: boolean; error?: string } {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid data format' };
    }

    const col = data as Partial<Collection>;

    if (!Array.isArray(col.packs)) {
      return { valid: false, error: 'Missing or invalid packs array' };
    }

    if (!col.metadata || typeof col.metadata !== 'object') {
      return { valid: false, error: 'Missing or invalid metadata' };
    }

    // Validate each pack has required fields
    for (let i = 0; i < col.packs.length; i++) {
      const pack = col.packs[i];
      if (!pack.id || typeof pack.id !== 'string') {
        return { valid: false, error: `Pack ${i + 1} missing valid id` };
      }
      if (!Array.isArray(pack.cards)) {
        return { valid: false, error: `Pack ${i + 1} missing cards array` };
      }
      if (!pack.openedAt) {
        return { valid: false, error: `Pack ${i + 1} missing openedAt date` };
      }
    }

    return { valid: true };
  }

  /**
   * Execute import with selected mode (merge or replace)
   */
  async function executeImport(mode: 'merge' | 'replace') {
    isProcessing = true;
    error = null;
    success = null;

    try {
      const file = fileInput.files?.[0];
      if (!file) {
        showError('No file selected');
        return;
      }

      const json = await readFile(file);
      const data = JSON.parse(json);

      // Validate collection structure
      const validation = validateCollection(data);
      if (!validation.valid) {
        showError(validation.error || 'Invalid collection format');
        return;
      }

      const importedCollection = data as Collection;

      if (mode === 'replace') {
        // Replace entire collection
        const result = importCollection(json);
        if (!result.success) {
          showError(result.error || 'Failed to import collection');
          return;
        }
        showSuccess(
          `Replaced collection with ${result.imported} pack${result.imported !== 1 ? 's' : ''}`
        );
      } else {
        // Merge collections
        const current = collection.get();
        const mergedPacks = [...importedCollection.packs, ...current.packs];

        // Deduplicate packs by ID (keep imported version)
        const uniquePacks = Array.from(
          new Map(mergedPacks.map((pack) => [pack.id, pack])).values()
        );

        // Merge metadata
        const mergedMetadata = {
          totalPacksOpened:
            importedCollection.metadata.totalPacksOpened +
            current.metadata.totalPacksOpened,
          lastOpenedAt: current.metadata.lastOpenedAt,
          uniqueCards: [
            ...new Set([
              ...importedCollection.metadata.uniqueCards,
              ...current.metadata.uniqueCards,
            ]),
          ],
          rarePulls:
            importedCollection.metadata.rarePulls + current.metadata.rarePulls,
          holoPulls:
            importedCollection.metadata.holoPulls + current.metadata.holoPulls,
        };

        const merged: Collection = {
          packs: uniquePacks,
          metadata: mergedMetadata,
        };

        // Save merged collection
        const result = importCollection(JSON.stringify(merged));
        if (!result.success) {
          showError(result.error || 'Failed to merge collections');
          return;
        }
        showSuccess(
          `Merged ${importedCollection.packs.length} pack${importedCollection.packs.length !== 1 ? 's' : ''} into collection`
        );
      }

      // Close modal and reset
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (err) {
      showError(
        err instanceof Error ? err.message : 'Failed to import collection'
      );
    } finally {
      isProcessing = false;
    }
  }

  /**
   * Clear entire collection (with confirmation)
   */
  function handleClearCollection() {
    if (
      !confirm(
        'Are you sure you want to delete your entire collection? This cannot be undone.'
      )
    ) {
      return;
    }

    const result = clearCollection();
    if (!result.success) {
      showError(result.error || 'Failed to clear collection');
      return;
    }

    showSuccess('Collection cleared');
    setTimeout(() => {
      closeModal();
    }, 1500);
  }

  function closeModal() {
    showModal = false;
    importMode = null;
    error = null;
    success = null;
    // Reset file input
    if (fileInput) {
      fileInput.value = '';
    }
  }

  function showError(message: string) {
    error = message;
    success = null;
  }

  function showSuccess(message: string) {
    success = message;
    error = null;
  }
</script>

<!-- Manager Toolbar -->
<div class="manager-toolbar">
  <!-- Export Button -->
  <button
    class="btn btn-export"
    onclick={handleExport}
    disabled={currentPackCount === 0}
    title="Download your collection as a JSON file"
  >
    <span class="btn-icon">📤</span>
    <span class="btn-text">Export Collection</span>
  </button>

  <!-- Import Button -->
  <button
    class="btn btn-import"
    onclick={triggerImport}
    title="Import a collection from a JSON file"
  >
    <span class="btn-icon">📥</span>
    <span class="btn-text">Import Collection</span>
  </button>

  <!-- Clear Button -->
  <button
    class="btn btn-clear"
    onclick={handleClearCollection}
    disabled={currentPackCount === 0}
    title="Delete all packs from your collection"
  >
    <span class="btn-icon">🗑️</span>
    <span class="btn-text">Clear Collection</span>
  </button>

  <!-- Hidden File Input -->
  <input
    type="file"
    accept=".json"
    bind:this={fileInput}
    onchange={handleFileSelect}
    class="hidden-input"
  />
</div>

<!-- Import Modal -->
{#if showModal}
  <div class="modal-overlay" onclick={closeModal}>
    <div
      class="modal-content"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="modal-header">
        <h2 id="modal-title" class="modal-title">Import Collection</h2>
        <button class="modal-close" onclick={closeModal} aria-label="Close modal">
          ✕
        </button>
      </div>

      <div class="modal-body">
        {#if error}
          <div class="alert alert-error" role="alert">
            <span class="alert-icon">⚠️</span>
            <span class="alert-message">{error}</span>
          </div>
        {/if}

        {#if success}
          <div class="alert alert-success" role="alert">
            <span class="alert-icon">✅</span>
            <span class="alert-message">{success}</span>
          </div>
        {/if}

        {#if !importMode && !error && !success}
          <p class="modal-description">
            Choose how to import the collection file:
          </p>

          <div class="import-options">
            <button
              class="option-card"
              onclick={() => executeImport('merge')}
              disabled={isProcessing}
            >
              <div class="option-icon">🔀</div>
              <div class="option-content">
                <h3 class="option-title">Merge</h3>
                <p class="option-description">
                  Combine imported packs with your existing collection. Duplicate
                  packs are skipped.
                </p>
              </div>
            </button>

            <button
              class="option-card"
              onclick={() => executeImport('replace')}
              disabled={isProcessing}
            >
              <div class="option-icon">🔄</div>
              <div class="option-content">
                <h3 class="option-title">Replace</h3>
                <p class="option-description">
                  Replace your entire collection with the imported one. Your
                  current collection will be lost!
                </p>
              </div>
            </button>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" onclick={closeModal} disabled={isProcessing}>
              Cancel
            </button>
          </div>
        {/if}

        {#if isProcessing}
          <div class="processing" role="status">
            <div class="spinner"></div>
            <p>Processing collection...</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  /* Manager Toolbar */
  .manager-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 0.5rem;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-export {
    background: linear-gradient(135deg, #059669, #10b981);
    color: white;
    border-color: rgba(16, 185, 129, 0.3);
  }

  .btn-export:hover:not(:disabled) {
    background: linear-gradient(135deg, #047857, #059669);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    transform: translateY(-1px);
  }

  .btn-import {
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    color: white;
    border-color: rgba(59, 130, 246, 0.3);
  }

  .btn-import:hover:not(:disabled) {
    background: linear-gradient(135deg, #1d4ed8, #2563eb);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    transform: translateY(-1px);
  }

  .btn-clear {
    background: linear-gradient(135deg, #dc2626, #ef4444);
    color: white;
    border-color: rgba(239, 68, 68, 0.3);
  }

  .btn-clear:hover:not(:disabled) {
    background: linear-gradient(135deg, #b91c1c, #dc2626);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    transform: translateY(-1px);
  }

  .btn-secondary {
    background: rgba(30, 41, 59, 0.8);
    color: #94a3b8;
    border-color: rgba(71, 85, 105, 0.5);
  }

  .btn-secondary:hover:not(:disabled) {
    background: rgba(51, 65, 85, 0.8);
    border-color: rgba(100, 116, 139, 0.5);
    color: white;
  }

  .btn-icon {
    font-size: 1rem;
    line-height: 1;
  }

  .btn-text {
    line-height: 1;
  }

  .hidden-input {
    display: none;
  }

  /* Modal Overlay */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Modal Content */
  .modal-content {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 1rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
    background: rgba(15, 23, 42, 0.6);
  }

  .modal-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: white;
    margin: 0;
  }

  .modal-close {
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem;
    line-height: 1;
    transition: color 0.2s ease;
  }

  .modal-close:hover {
    color: white;
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
  }

  .modal-description {
    font-size: 0.9375rem;
    color: #94a3b8;
    margin: 0 0 1.5rem 0;
    line-height: 1.5;
  }

  /* Import Options */
  .import-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .option-card {
    display: flex;
    gap: 1rem;
    padding: 1.25rem;
    background: rgba(15, 23, 42, 0.6);
    border: 2px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
  }

  .option-card:hover:not(:disabled) {
    background: rgba(30, 41, 59, 0.8);
    border-color: #fbbf24;
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
    transform: translateY(-2px);
  }

  .option-card:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .option-icon {
    font-size: 2rem;
    line-height: 1;
    flex-shrink: 0;
  }

  .option-content {
    flex: 1;
  }

  .option-title {
    font-size: 1rem;
    font-weight: 700;
    color: white;
    margin: 0 0 0.375rem 0;
  }

  .option-description {
    font-size: 0.8125rem;
    color: #94a3b8;
    margin: 0;
    line-height: 1.4;
  }

  /* Alerts */
  .alert {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .alert-error {
    background: rgba(220, 38, 38, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .alert-success {
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .alert-icon {
    font-size: 1.25rem;
    line-height: 1;
    flex-shrink: 0;
  }

  .alert-message {
    font-size: 0.875rem;
    color: white;
    line-height: 1.4;
  }

  /* Processing Spinner */
  .processing {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(71, 85, 105, 0.3);
    border-top-color: #fbbf24;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .processing p {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
  }

  /* Modal Footer */
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .manager-toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .btn {
      justify-content: center;
    }

    .option-card {
      padding: 1rem;
    }

    .modal-content {
      max-height: 95vh;
    }
  }
</style>
