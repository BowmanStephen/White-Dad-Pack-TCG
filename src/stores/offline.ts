/**
 * Offline Action Queue Store
 *
 * Manages a queue of actions that failed due to being offline.
 * When the connection is restored, actions are automatically retried.
 *
 * Usage:
 * ```typescript
 * import { offlineQueue } from '@/stores/offline';
 *
 * // Queue an action for retry
 * offlineQueue.enqueue({
 *   type: 'pack_open',
 *   data: { config: {...} },
 *   retry: async () => { ... }
 * });
 *
 * // Process queue when back online
 * offlineQueue.processQueue();
 * ```
 */

import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

/**
 * Queued action that will be retried when back online
 */
export interface QueuedAction {
  id: string;
  type: 'pack_open' | 'collection_sync' | 'analytics' | 'custom';
  data: unknown;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

/**
 * Result of processing a queued action
 */
export interface ProcessResult {
  success: boolean;
  actionId: string;
  error?: string;
}

/**
 * Store state
 */
interface OfflineState {
  isOnline: boolean;
  queuedActions: QueuedAction[];
  lastSyncAttempt: Date | null;
}

// Reactive state
export const isOnline = atom(true);
export const queuedActions = atom<QueuedAction[]>([]);
export const queueCount = atom(0);
export const isProcessing = atom(false);
export const processResults = atom<ProcessResult[]>([]);

// Initialize from localStorage on client side
function initializeStoredActions(): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem('offline-queue');
    if (stored) {
      const parsed = JSON.parse(stored);
      const actions = parsed.map((a: any) => ({
        ...a,
        timestamp: new Date(a.timestamp)
      }));
      queuedActions.set(actions);
    }
  } catch (error) {
    console.error('[Offline Queue] Failed to load stored actions:', error);
  }

  // Set initial online status
  isOnline.set(navigator.onLine);
}

// Update queue count when actions change
queuedActions.subscribe((actions) => {
  queueCount.set(actions.length);

  // Persist to localStorage (client-side only)
  if (typeof window !== 'undefined') {
    try {
      const toStore = actions.map(a => ({
        ...a,
        timestamp: a.timestamp.toISOString()
      }));
      localStorage.setItem('offline-queue', JSON.stringify(toStore));
    } catch (error) {
      console.error('[Offline Queue] Failed to save actions:', error);
    }
  }
});

/**
 * Add an action to the queue
 */
export function enqueueAction(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount'>): void {
  const newAction: QueuedAction = {
    ...action,
    id: crypto.randomUUID(),
    timestamp: new Date(),
    retryCount: 0
  };

  const current = queuedActions.get();
  queuedActions.set([...current, newAction]);
}

/**
 * Remove an action from the queue
 */
export function dequeueAction(actionId: string): void {
  const current = queuedActions.get();
  queuedActions.set(current.filter(a => a.id !== actionId));
}

/**
 * Clear all queued actions
 */
export function clearQueue(): void {
  queuedActions.set([]);
  processResults.set([]);
}

/**
 * Process a single queued action
 * This is a placeholder - actual implementation depends on the action type
 */
async function processAction(action: QueuedAction): Promise<ProcessResult> {
  try {

    // Simulate processing (in real app, this would call actual APIs)
    switch (action.type) {
      case 'pack_open':
        // Pack opens are handled locally, so just mark as success
        return { success: true, actionId: action.id };

      case 'collection_sync':
        // Collection sync would be implemented when we have a backend
        return { success: true, actionId: action.id };

      case 'analytics':
        // Analytics events can be sent here
        return { success: true, actionId: action.id };

      case 'custom':
        // Custom actions with retry function
        if (action.data && typeof action.data === 'object' && 'retry' in action.data) {
          const retryFn = (action.data as any).retry as () => Promise<void>;
          await retryFn();
          return { success: true, actionId: action.id };
        }
        return { success: false, actionId: action.id, error: 'No retry function provided' };

      default:
        return { success: false, actionId: action.id, error: 'Unknown action type' };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Offline Queue] Action failed:', action.id, errorMessage);
    return { success: false, actionId: action.id, error: errorMessage };
  }
}

/**
 * Process all queued actions
 */
export async function processQueue(): Promise<void> {
  if (isProcessing.get()) {
    return;
  }

  const actions = queuedActions.get();
  if (actions.length === 0) {
    return;
  }

  isProcessing.set(true);

  const results: ProcessResult[] = [];
  const successfulIds: string[] = [];

  // Process each action
  for (const action of actions) {
    const result = await processAction(action);
    results.push(result);

    if (result.success) {
      successfulIds.push(result.actionId);
    } else {
      // Increment retry count
      action.retryCount++;

      // Check if we should give up
      if (action.retryCount >= action.maxRetries) {
        console.error('[Offline Queue] Max retries exceeded for action:', action.id);
        successfulIds.push(result.actionId); // Remove from queue even if failed
      }
    }
  }

  // Remove processed actions (successful or max retries reached)
  const remaining = actions.filter(a => !successfulIds.includes(a.id));
  queuedActions.set(remaining);

  // Store results for display
  processResults.set(results);

  isProcessing.set(false);
}

/**
 * Update online status
 */
export function setOnlineStatus(online: boolean): void {
  const wasOffline = !isOnline.get();
  isOnline.set(online);

  if (wasOffline && online) {
    // Connection restored, process queue
    processQueue();
  }
}

/**
 * Initialize offline detection
 */
export function initOfflineDetection(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  // Initialize stored actions from localStorage
  initializeStoredActions();

  const handleOnline = () => {
    setOnlineStatus(true);
  };

  const handleOffline = () => {
    setOnlineStatus(false);
  };

  // Listen for changes
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// Export actions object for convenience
export const offlineQueue = {
  enqueue: enqueueAction,
  dequeue: dequeueAction,
  clear: clearQueue,
  process: processQueue,
  isOnline: () => isOnline.get(),
  getQueueCount: () => queueCount.get(),
  getQueuedActions: () => queuedActions.get(),
  getProcessResults: () => processResults.get(),
  isProcessing: () => isProcessing.get()
};
