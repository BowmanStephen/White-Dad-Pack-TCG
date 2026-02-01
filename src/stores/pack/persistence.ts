/**
 * Pack Store - Persistence Layer
 *
 * Handles saving packs to IndexedDB with retry logic and error recovery.
 * Includes a memory backup queue for packs that fail to persist.
 */
import type { Pack } from '../../types';
import { addPackToCollection } from '../collection';
import { createAppError, logError } from '../../lib/utils/errors';
import { showToast } from '../ui';
import { storageError } from './state';
import { SAVE_RETRY_CONFIG } from '../../lib/config/pack-config';

// Memory backup for packs that fail to save (ensures user never loses their pack)
const pendingSaves: Pack[] = [];

/**
 * Get pending saves (for retry operations)
 */
export function getPendingSaves(): readonly Pack[] {
  return pendingSaves;
}

/**
 * Save pack to collection with retry logic and exponential backoff
 * Attempts MAX_ATTEMPTS times before falling back to memory-only storage
 */
export async function savePackWithRetry(pack: Pack, attempt = 1): Promise<void> {
  try {
    const saveResult = await addPackToCollection(pack);

    if (saveResult.success) {
      // Remove from pending saves if it was there
      const pendingIndex = pendingSaves.findIndex(p => p.id === pack.id);
      if (pendingIndex !== -1) {
        pendingSaves.splice(pendingIndex, 1);
      }
      // UX-007: Show visual confirmation toast when cards are saved
      showToast('✨ Cards saved to your collection!', 'success');
      return;
    }

    // Save failed - try again if we have attempts left
    if (attempt < SAVE_RETRY_CONFIG.MAX_ATTEMPTS) {
      const delayMs = SAVE_RETRY_CONFIG.BASE_DELAY_MS * Math.pow(2, attempt - 1); // 100, 200, 400ms
      if (import.meta.env.DEV) console.warn(`[Pack] Save attempt ${attempt} failed, retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return savePackWithRetry(pack, attempt + 1);
    }

    // All retries exhausted - add to memory backup
    handleSaveFailure(pack, saveResult.error || 'Unknown error');
  } catch (error) {
    // Unexpected error - try again if we have attempts left
    if (attempt < SAVE_RETRY_CONFIG.MAX_ATTEMPTS) {
      const delayMs = SAVE_RETRY_CONFIG.BASE_DELAY_MS * Math.pow(2, attempt - 1);
      if (import.meta.env.DEV) console.warn(`[Pack] Save attempt ${attempt} threw error, retrying in ${delayMs}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return savePackWithRetry(pack, attempt + 1);
    }

    // All retries exhausted
    handleSaveFailure(pack, error instanceof Error ? error.message : 'Critical storage error');
  }
}

/**
 * Handle persistent save failure - store in memory and show error
 */
function handleSaveFailure(pack: Pack, errorMessage: string): void {
  if (import.meta.env.DEV) console.error('[Pack] All save attempts failed:', errorMessage);

  // Add to memory backup to prevent data loss
  if (!pendingSaves.find(p => p.id === pack.id)) {
    pendingSaves.push(pack);
  }

  const fallbackError = createAppError(
    'storage',
    'Pack saved to temporary storage. Your collection may not persist after browser refresh.',
    [
      {
        label: 'Manage Storage',
        action: () => {
          storageError.set(null);
          window.location.href = '/settings';
        },
        primary: true,
      },
      {
        label: 'Retry Save',
        action: () => {
          storageError.set(null);
          // Retry all pending saves
          retryAllPendingSaves();
        },
      },
      {
        label: 'Dismiss',
        action: () => storageError.set(null),
      },
    ]
  );
  storageError.set(fallbackError);
  logError(fallbackError, errorMessage);
}

/**
 * Retry saving all pending packs
 */
export function retryAllPendingSaves(): void {
  pendingSaves.forEach(p => savePackWithRetry(p));
}
