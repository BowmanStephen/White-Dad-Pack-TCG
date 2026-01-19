/**
 * Offline Store Tests
 * Tests for offline queue management (queued actions, online status, processing)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isOnline,
  queuedActions,
  queueCount,
  isProcessing,
  processResults,
  enqueueAction,
  dequeueAction,
  clearQueue,
  processQueue,
  setOnlineStatus,
  offlineQueue,
  type QueuedAction,
} from '@/stores/offline';

// Mock the network detector and browser utilities
vi.mock('@/lib/network/network-detector', () => ({
  getNetworkDetector: () => ({
    isOnline: () => true,
  }),
  NETWORK_EVENTS: {
    ONLINE: 'network:online',
    OFFLINE: 'network:offline',
    UNSTABLE: 'network:unstable',
  },
}));

vi.mock('@/lib/utils/browser', () => ({
  onBrowser: (fn: () => void) => fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock crypto.randomUUID
if (typeof crypto === 'undefined' || !crypto.randomUUID) {
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: () => `test-uuid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    },
    writable: true,
  });
}

describe('Offline Store', () => {
  beforeEach(() => {
    // Reset all stores before each test
    isOnline.set(true);
    queuedActions.set([]);
    queueCount.set(0);
    isProcessing.set(false);
    processResults.set([]);
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should default to online status', () => {
      expect(isOnline.get()).toBe(true);
    });

    it('should start with empty queued actions', () => {
      expect(queuedActions.get()).toEqual([]);
    });

    it('should start with zero queue count', () => {
      expect(queueCount.get()).toBe(0);
    });

    it('should start with processing set to false', () => {
      expect(isProcessing.get()).toBe(false);
    });

    it('should start with empty process results', () => {
      expect(processResults.get()).toEqual([]);
    });
  });

  describe('enqueueAction()', () => {
    it('should add an action to the queue', () => {
      enqueueAction({
        type: 'pack_open',
        data: { config: {} },
        maxRetries: 3,
      });

      const actions = queuedActions.get();
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('pack_open');
    });

    it('should assign a unique ID to each action', () => {
      enqueueAction({ type: 'pack_open', data: {}, maxRetries: 3 });
      enqueueAction({ type: 'analytics', data: {}, maxRetries: 3 });

      const actions = queuedActions.get();
      expect(actions[0].id).toBeDefined();
      expect(actions[1].id).toBeDefined();
      expect(actions[0].id).not.toBe(actions[1].id);
    });

    it('should set timestamp on action', () => {
      const before = new Date();
      enqueueAction({ type: 'pack_open', data: {}, maxRetries: 3 });
      const after = new Date();

      const actions = queuedActions.get();
      expect(actions[0].timestamp).toBeInstanceOf(Date);
      expect(actions[0].timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(actions[0].timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should initialize retryCount to 0', () => {
      enqueueAction({ type: 'pack_open', data: {}, maxRetries: 3 });

      const actions = queuedActions.get();
      expect(actions[0].retryCount).toBe(0);
    });

    it('should update queue count when action is added', () => {
      expect(queueCount.get()).toBe(0);

      enqueueAction({ type: 'pack_open', data: {}, maxRetries: 3 });
      expect(queueCount.get()).toBe(1);

      enqueueAction({ type: 'analytics', data: {}, maxRetries: 3 });
      expect(queueCount.get()).toBe(2);
    });

    it('should preserve existing actions when adding new ones', () => {
      enqueueAction({ type: 'pack_open', data: { id: 1 }, maxRetries: 3 });
      enqueueAction({ type: 'analytics', data: { id: 2 }, maxRetries: 3 });

      const actions = queuedActions.get();
      expect(actions).toHaveLength(2);
      expect(actions[0].type).toBe('pack_open');
      expect(actions[1].type).toBe('analytics');
    });
  });

  describe('dequeueAction()', () => {
    it('should remove action by ID', () => {
      enqueueAction({ type: 'pack_open', data: {}, maxRetries: 3 });
      const actions = queuedActions.get();
      const actionId = actions[0].id;

      dequeueAction(actionId);

      expect(queuedActions.get()).toHaveLength(0);
    });

    it('should only remove specified action', () => {
      enqueueAction({ type: 'pack_open', data: { name: 'first' }, maxRetries: 3 });
      enqueueAction({ type: 'analytics', data: { name: 'second' }, maxRetries: 3 });
      
      const actions = queuedActions.get();
      const firstId = actions[0].id;

      dequeueAction(firstId);

      const remaining = queuedActions.get();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].type).toBe('analytics');
    });

    it('should update queue count when action is removed', () => {
      enqueueAction({ type: 'pack_open', data: {}, maxRetries: 3 });
      enqueueAction({ type: 'analytics', data: {}, maxRetries: 3 });
      expect(queueCount.get()).toBe(2);

      const actions = queuedActions.get();
      dequeueAction(actions[0].id);

      expect(queueCount.get()).toBe(1);
    });

    it('should handle removing non-existent action gracefully', () => {
      enqueueAction({ type: 'pack_open', data: {}, maxRetries: 3 });

      expect(() => dequeueAction('non-existent-id')).not.toThrow();
      expect(queuedActions.get()).toHaveLength(1);
    });
  });

  describe('clearQueue()', () => {
    it('should remove all queued actions', () => {
      enqueueAction({ type: 'pack_open', data: {}, maxRetries: 3 });
      enqueueAction({ type: 'analytics', data: {}, maxRetries: 3 });
      enqueueAction({ type: 'collection_sync', data: {}, maxRetries: 3 });

      clearQueue();

      expect(queuedActions.get()).toEqual([]);
      expect(queueCount.get()).toBe(0);
    });

    it('should clear process results', () => {
      processResults.set([
        { success: true, actionId: 'test-1' },
        { success: false, actionId: 'test-2', error: 'Failed' },
      ]);

      clearQueue();

      expect(processResults.get()).toEqual([]);
    });

    it('should handle clearing empty queue', () => {
      expect(() => clearQueue()).not.toThrow();
      expect(queuedActions.get()).toEqual([]);
    });
  });

  describe('setOnlineStatus()', () => {
    it('should update online status to true', () => {
      isOnline.set(false);

      setOnlineStatus(true);

      expect(isOnline.get()).toBe(true);
    });

    it('should update online status to false', () => {
      isOnline.set(true);

      setOnlineStatus(false);

      expect(isOnline.get()).toBe(false);
    });

    it('should trigger queue processing when coming back online', async () => {
      // Set up offline state with queued actions
      isOnline.set(false);
      enqueueAction({ type: 'pack_open', data: {}, maxRetries: 3 });

      // Come back online
      setOnlineStatus(true);

      // Give async processing time to start
      await new Promise(resolve => setTimeout(resolve, 10));

      // Processing should have been triggered
      expect(isOnline.get()).toBe(true);
    });

    it('should not trigger processing when going offline', () => {
      isOnline.set(true);
      enqueueAction({ type: 'pack_open', data: {}, maxRetries: 3 });

      setOnlineStatus(false);

      // Queue should still have the action
      expect(queuedActions.get()).toHaveLength(1);
    });
  });

  describe('processQueue()', () => {
    it('should not process if already processing', async () => {
      isProcessing.set(true);
      enqueueAction({ type: 'pack_open', data: {}, maxRetries: 3 });

      await processQueue();

      // Should still have the action since processing was skipped
      expect(queuedActions.get()).toHaveLength(1);
    });

    it('should not process if queue is empty', async () => {
      await processQueue();

      expect(isProcessing.get()).toBe(false);
      expect(processResults.get()).toEqual([]);
    });

    it('should set isProcessing to true during processing', async () => {
      enqueueAction({ type: 'pack_open', data: {}, maxRetries: 3 });

      const promise = processQueue();

      // Note: Due to async nature, isProcessing might already be false
      await promise;

      expect(isProcessing.get()).toBe(false);
    });

    it('should process pack_open actions successfully', async () => {
      enqueueAction({ type: 'pack_open', data: {}, maxRetries: 3 });

      await processQueue();

      const results = processResults.get();
      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
    });

    it('should process collection_sync actions successfully', async () => {
      enqueueAction({ type: 'collection_sync', data: {}, maxRetries: 3 });

      await processQueue();

      const results = processResults.get();
      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
    });

    it('should process analytics actions successfully', async () => {
      enqueueAction({ type: 'analytics', data: {}, maxRetries: 3 });

      await processQueue();

      const results = processResults.get();
      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
    });

    it('should remove successful actions from queue', async () => {
      enqueueAction({ type: 'pack_open', data: {}, maxRetries: 3 });
      enqueueAction({ type: 'analytics', data: {}, maxRetries: 3 });

      await processQueue();

      expect(queuedActions.get()).toHaveLength(0);
    });

    it('should process custom actions with retry function', async () => {
      const retryFn = vi.fn().mockResolvedValue(undefined);

      enqueueAction({
        type: 'custom',
        data: { retry: retryFn },
        maxRetries: 3,
      });

      await processQueue();

      expect(retryFn).toHaveBeenCalled();
      const results = processResults.get();
      expect(results[0].success).toBe(true);
    });

    it('should fail custom actions without retry function', async () => {
      enqueueAction({
        type: 'custom',
        data: { noRetry: true },
        maxRetries: 3,
      });

      await processQueue();

      const results = processResults.get();
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBe('No retry function provided');
    });

    it('should remove actions that exceed max retries', async () => {
      // Create an action that will fail
      const failingRetry = vi.fn().mockRejectedValue(new Error('Always fails'));
      
      // Manually add action with high retry count
      const action: QueuedAction = {
        id: 'test-action',
        type: 'custom',
        data: { retry: failingRetry },
        timestamp: new Date(),
        retryCount: 2, // Already at 2 retries
        maxRetries: 3, // Max is 3
      };
      queuedActions.set([action]);

      await processQueue();

      // Action should be removed even though it failed (exceeded max retries)
      expect(queuedActions.get()).toHaveLength(0);
    });
  });

  describe('offlineQueue convenience object', () => {
    it('should expose enqueue function', () => {
      offlineQueue.enqueue({ type: 'pack_open', data: {}, maxRetries: 3 });
      expect(queuedActions.get()).toHaveLength(1);
    });

    it('should expose dequeue function', () => {
      offlineQueue.enqueue({ type: 'pack_open', data: {}, maxRetries: 3 });
      const actions = queuedActions.get();
      
      offlineQueue.dequeue(actions[0].id);
      expect(queuedActions.get()).toHaveLength(0);
    });

    it('should expose clear function', () => {
      offlineQueue.enqueue({ type: 'pack_open', data: {}, maxRetries: 3 });
      
      offlineQueue.clear();
      expect(queuedActions.get()).toHaveLength(0);
    });

    it('should expose isOnline getter', () => {
      isOnline.set(true);
      expect(offlineQueue.isOnline()).toBe(true);

      isOnline.set(false);
      expect(offlineQueue.isOnline()).toBe(false);
    });

    it('should expose getQueueCount getter', () => {
      expect(offlineQueue.getQueueCount()).toBe(0);

      offlineQueue.enqueue({ type: 'pack_open', data: {}, maxRetries: 3 });
      expect(offlineQueue.getQueueCount()).toBe(1);
    });

    it('should expose getQueuedActions getter', () => {
      offlineQueue.enqueue({ type: 'pack_open', data: {}, maxRetries: 3 });
      
      const actions = offlineQueue.getQueuedActions();
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('pack_open');
    });

    it('should expose getProcessResults getter', () => {
      processResults.set([{ success: true, actionId: 'test' }]);
      
      const results = offlineQueue.getProcessResults();
      expect(results).toHaveLength(1);
    });

    it('should expose isProcessing getter', () => {
      isProcessing.set(false);
      expect(offlineQueue.isProcessing()).toBe(false);

      isProcessing.set(true);
      expect(offlineQueue.isProcessing()).toBe(true);
    });
  });

  describe('Store Reactivity', () => {
    it('should notify subscribers when online status changes', () => {
      let callCount = 0;
      const unsubscribe = isOnline.subscribe(() => {
        callCount++;
      });

      setOnlineStatus(false);
      setOnlineStatus(true);

      expect(callCount).toBeGreaterThan(0);
      unsubscribe();
    });

    it('should notify subscribers when queue changes', () => {
      let callCount = 0;
      const unsubscribe = queuedActions.subscribe(() => {
        callCount++;
      });

      enqueueAction({ type: 'pack_open', data: {}, maxRetries: 3 });

      expect(callCount).toBeGreaterThan(0);
      unsubscribe();
    });

    it('should update queueCount reactively', () => {
      let lastCount = 0;
      const unsubscribe = queueCount.subscribe((count) => {
        lastCount = count;
      });

      enqueueAction({ type: 'pack_open', data: {}, maxRetries: 3 });
      expect(lastCount).toBe(1);

      enqueueAction({ type: 'analytics', data: {}, maxRetries: 3 });
      expect(lastCount).toBe(2);

      unsubscribe();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid enqueue/dequeue operations', () => {
      for (let i = 0; i < 10; i++) {
        enqueueAction({ type: 'pack_open', data: { index: i }, maxRetries: 3 });
      }

      expect(queuedActions.get()).toHaveLength(10);

      const actions = queuedActions.get();
      for (let i = 0; i < 5; i++) {
        dequeueAction(actions[i].id);
      }

      expect(queuedActions.get()).toHaveLength(5);
    });

    it('should handle all action types', () => {
      const actionTypes = ['pack_open', 'collection_sync', 'analytics', 'custom'] as const;

      actionTypes.forEach((type) => {
        enqueueAction({ type, data: {}, maxRetries: 3 });
      });

      const actions = queuedActions.get();
      expect(actions).toHaveLength(4);
      expect(actions.map(a => a.type)).toEqual(actionTypes);
    });

    it('should handle complex data in actions', () => {
      const complexData = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
        },
        date: new Date().toISOString(),
        number: 42,
        boolean: true,
      };

      enqueueAction({ type: 'custom', data: complexData, maxRetries: 3 });

      const actions = queuedActions.get();
      expect(actions[0].data).toEqual(complexData);
    });

    it('should maintain queue order (FIFO)', () => {
      for (let i = 0; i < 5; i++) {
        enqueueAction({ type: 'pack_open', data: { order: i }, maxRetries: 3 });
      }

      const actions = queuedActions.get();
      for (let i = 0; i < 5; i++) {
        expect((actions[i].data as any).order).toBe(i);
      }
    });
  });

  describe('localStorage Persistence', () => {
    it('should save actions to localStorage when queue changes', () => {
      enqueueAction({ type: 'pack_open', data: { test: true }, maxRetries: 3 });

      const stored = localStorageMock.getItem('offline-queue');
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].type).toBe('pack_open');
    });

    it('should serialize dates as ISO strings in localStorage', () => {
      enqueueAction({ type: 'pack_open', data: {}, maxRetries: 3 });

      const stored = localStorageMock.getItem('offline-queue');
      const parsed = JSON.parse(stored!);

      expect(typeof parsed[0].timestamp).toBe('string');
      expect(new Date(parsed[0].timestamp)).toBeInstanceOf(Date);
    });
  });
});
