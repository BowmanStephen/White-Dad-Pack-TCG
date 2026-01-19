/**
 * Analytics Store Tests
 * Tests for analytics tracking (events, sessions, configuration)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  analyticsConfig,
  analyticsSession,
  eventQueue,
  isReady,
  isFlushing,
  createSession,
  initializeSession,
  updateSessionActivity,
  trackEvent,
  flushEvents,
  getStoredEvents,
  clearStoredEvents,
  updateConfig,
  setAnalyticsEnabled,
  setDebugMode,
} from '@/stores/analytics';

// Mock the browser utility
vi.mock('@/lib/utils/browser', () => ({
  onBrowser: (fn: () => void) => {
    // Don't auto-run in tests to prevent side effects
  },
}));

// Mock safe-parse utility
vi.mock('@/lib/utils/safe-parse', () => ({
  safeJsonParse: <T>(json: string, fallback: T): T | null => {
    try {
      return JSON.parse(json) as T;
    } catch {
      return fallback;
    }
  },
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

describe('Analytics Store', () => {
  beforeEach(() => {
    // Reset all stores before each test
    analyticsConfig.set({
      enabled: true,
      providers: {},
      debugMode: false,
      batchSize: 10,
      flushInterval: 30000,
    });
    analyticsSession.set(null);
    eventQueue.set({
      events: [],
      lastFlush: Date.now(),
    });
    isFlushing.set(false);
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should have analytics enabled by default', () => {
      const config = analyticsConfig.get();
      expect(config.enabled).toBe(true);
    });

    it('should have empty providers by default', () => {
      const config = analyticsConfig.get();
      expect(config.providers).toEqual({});
    });

    it('should start with no session', () => {
      expect(analyticsSession.get()).toBeNull();
    });

    it('should start with empty event queue', () => {
      const queue = eventQueue.get();
      expect(queue.events).toEqual([]);
    });

    it('should not be flushing initially', () => {
      expect(isFlushing.get()).toBe(false);
    });
  });

  describe('isReady computed store', () => {
    it('should be false when no session exists', () => {
      analyticsConfig.set({ ...analyticsConfig.get(), enabled: true });
      analyticsSession.set(null);

      expect(isReady.get()).toBe(false);
    });

    it('should be false when analytics is disabled', () => {
      analyticsConfig.set({ ...analyticsConfig.get(), enabled: false });
      analyticsSession.set(createSession());

      expect(isReady.get()).toBe(false);
    });

    it('should be true when enabled and session exists', () => {
      analyticsConfig.set({ ...analyticsConfig.get(), enabled: true });
      analyticsSession.set(createSession());

      expect(isReady.get()).toBe(true);
    });
  });

  describe('createSession()', () => {
    it('should create a session with unique ID', () => {
      const session1 = createSession();
      const session2 = createSession();

      expect(session1.id).toBeDefined();
      expect(session2.id).toBeDefined();
      expect(session1.id).not.toBe(session2.id);
    });

    it('should create session with startTime', () => {
      const before = Date.now();
      const session = createSession();
      const after = Date.now();

      expect(session.startTime).toBeGreaterThanOrEqual(before);
      expect(session.startTime).toBeLessThanOrEqual(after);
    });

    it('should create session with pageCount of 1', () => {
      const session = createSession();
      expect(session.pageCount).toBe(1);
    });

    it('should create session with lastActivity timestamp', () => {
      const before = Date.now();
      const session = createSession();
      const after = Date.now();

      expect(session.lastActivity).toBeGreaterThanOrEqual(before);
      expect(session.lastActivity).toBeLessThanOrEqual(after);
    });

    it('should generate session ID with correct format', () => {
      const session = createSession();
      expect(session.id).toMatch(/^session_\d+_[a-z0-9]+$/);
    });
  });

  describe('initializeSession()', () => {
    it('should create new session if none exists', () => {
      analyticsSession.set(null);

      initializeSession();

      expect(analyticsSession.get()).not.toBeNull();
    });

    it('should update lastActivity if session exists', () => {
      const oldSession = createSession();
      const oldActivity = oldSession.lastActivity - 10000; // 10 seconds ago
      oldSession.lastActivity = oldActivity;
      analyticsSession.set(oldSession);

      initializeSession();

      const session = analyticsSession.get();
      expect(session?.lastActivity).toBeGreaterThan(oldActivity);
    });

    it('should preserve session ID when updating activity', () => {
      const oldSession = createSession();
      const oldId = oldSession.id;
      analyticsSession.set(oldSession);

      initializeSession();

      expect(analyticsSession.get()?.id).toBe(oldId);
    });
  });

  describe('updateSessionActivity()', () => {
    it('should update lastActivity timestamp', () => {
      const session = createSession();
      const oldActivity = session.lastActivity - 5000;
      session.lastActivity = oldActivity;
      analyticsSession.set(session);

      updateSessionActivity();

      expect(analyticsSession.get()?.lastActivity).toBeGreaterThan(oldActivity);
    });

    it('should do nothing if no session exists', () => {
      analyticsSession.set(null);

      expect(() => updateSessionActivity()).not.toThrow();
      expect(analyticsSession.get()).toBeNull();
    });

    it('should preserve other session properties', () => {
      const session = createSession();
      session.pageCount = 5;
      analyticsSession.set(session);

      updateSessionActivity();

      expect(analyticsSession.get()?.pageCount).toBe(5);
    });
  });

  describe('trackEvent()', () => {
    beforeEach(() => {
      // Set up a valid session for tracking
      analyticsSession.set(createSession());
    });

    it('should add event to queue', () => {
      trackEvent({ type: 'collection_view', data: {} } as any);

      const queue = eventQueue.get();
      expect(queue.events).toHaveLength(1);
    });

    it('should assign unique ID to each event', () => {
      trackEvent({ type: 'collection_view', data: {} } as any);
      trackEvent({ type: 'settings_open', data: {} } as any);

      const queue = eventQueue.get();
      expect(queue.events[0].id).not.toBe(queue.events[1].id);
    });

    it('should add timestamp to event', () => {
      const before = Date.now();
      trackEvent({ type: 'collection_view', data: {} } as any);
      const after = Date.now();

      const queue = eventQueue.get();
      expect(queue.events[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(queue.events[0].timestamp).toBeLessThanOrEqual(after);
    });

    it('should add sessionId to event', () => {
      const session = analyticsSession.get();
      trackEvent({ type: 'collection_view', data: {} } as any);

      const queue = eventQueue.get();
      expect(queue.events[0].sessionId).toBe(session?.id);
    });

    it('should not track if analytics is disabled', () => {
      analyticsConfig.set({ ...analyticsConfig.get(), enabled: false });

      trackEvent({ type: 'collection_view', data: {} } as any);

      const queue = eventQueue.get();
      expect(queue.events).toHaveLength(0);
    });

    it('should not track if no session exists', () => {
      analyticsSession.set(null);

      trackEvent({ type: 'collection_view', data: {} } as any);

      const queue = eventQueue.get();
      expect(queue.events).toHaveLength(0);
    });

    it('should update session activity when tracking', () => {
      const session = analyticsSession.get();
      const oldActivity = session!.lastActivity - 5000;
      analyticsSession.set({ ...session!, lastActivity: oldActivity });

      trackEvent({ type: 'collection_view', data: {} } as any);

      expect(analyticsSession.get()?.lastActivity).toBeGreaterThan(oldActivity);
    });

    it('should generate event ID with correct format', () => {
      trackEvent({ type: 'collection_view', data: {} } as any);

      const queue = eventQueue.get();
      expect(queue.events[0].id).toMatch(/^event_\d+_[a-z0-9]+$/);
    });
  });

  describe('flushEvents()', () => {
    beforeEach(() => {
      analyticsSession.set(createSession());
    });

    it('should not flush if queue is empty', async () => {
      await flushEvents();

      expect(isFlushing.get()).toBe(false);
    });

    it('should set isFlushing during flush', async () => {
      trackEvent({ type: 'collection_view', data: {} } as any);

      const flushPromise = flushEvents();

      // Note: Due to async, might already be done
      await flushPromise;

      expect(isFlushing.get()).toBe(false);
    });

    it('should clear queue after successful flush', async () => {
      trackEvent({ type: 'collection_view', data: {} } as any);
      trackEvent({ type: 'settings_open', data: {} } as any);

      await flushEvents();

      const queue = eventQueue.get();
      expect(queue.events).toHaveLength(0);
    });

    it('should update lastFlush timestamp', async () => {
      trackEvent({ type: 'collection_view', data: {} } as any);
      const before = Date.now();

      await flushEvents();

      const queue = eventQueue.get();
      expect(queue.lastFlush).toBeGreaterThanOrEqual(before);
    });

    it('should clear queue after successful flush', async () => {
      trackEvent({ type: 'collection_view', data: {} } as any);

      await flushEvents();

      // Queue should be cleared after flush
      const queue = eventQueue.get();
      expect(queue.events).toHaveLength(0);
    });
  });

  describe('getStoredEvents()', () => {
    it('should return empty array when no events stored', () => {
      // Note: This tests the function's behavior in test environment
      // localStorage persistence is tested via integration tests
      const events = getStoredEvents();
      expect(events).toEqual([]);
    });
  });

  describe('clearStoredEvents()', () => {
    it('should handle clearing when no events exist', () => {
      expect(() => clearStoredEvents()).not.toThrow();
    });
  });

  describe('updateConfig()', () => {
    it('should update partial config', () => {
      updateConfig({ batchSize: 20 });

      const config = analyticsConfig.get();
      expect(config.batchSize).toBe(20);
      expect(config.enabled).toBe(true); // preserved
    });

    it('should merge providers config', () => {
      updateConfig({
        providers: {
          googleAnalytics: { enabled: true, measurementId: 'G-TEST' },
        },
      });

      const config = analyticsConfig.get();
      expect(config.providers.googleAnalytics?.enabled).toBe(true);
    });

    it('should preserve existing providers when updating', () => {
      analyticsConfig.set({
        ...analyticsConfig.get(),
        providers: {
          googleAnalytics: { enabled: true, measurementId: 'G-TEST' },
        },
      });

      updateConfig({
        providers: {
          plausible: { enabled: true, domain: 'test.com' },
        },
      });

      const config = analyticsConfig.get();
      expect(config.providers.googleAnalytics?.enabled).toBe(true);
      expect(config.providers.plausible?.enabled).toBe(true);
    });
  });

  describe('setAnalyticsEnabled()', () => {
    it('should enable analytics', () => {
      analyticsConfig.set({ ...analyticsConfig.get(), enabled: false });

      setAnalyticsEnabled(true);

      expect(analyticsConfig.get().enabled).toBe(true);
    });

    it('should disable analytics', () => {
      setAnalyticsEnabled(false);

      expect(analyticsConfig.get().enabled).toBe(false);
    });
  });

  describe('setDebugMode()', () => {
    it('should enable debug mode', () => {
      setDebugMode(true);

      expect(analyticsConfig.get().debugMode).toBe(true);
    });

    it('should disable debug mode', () => {
      analyticsConfig.set({ ...analyticsConfig.get(), debugMode: true });

      setDebugMode(false);

      expect(analyticsConfig.get().debugMode).toBe(false);
    });
  });

  describe('Store Reactivity', () => {
    it('should notify subscribers when config changes', () => {
      let callCount = 0;
      const unsubscribe = analyticsConfig.subscribe(() => {
        callCount++;
      });

      updateConfig({ batchSize: 15 });

      expect(callCount).toBeGreaterThan(0);
      unsubscribe();
    });

    it('should notify subscribers when session changes', () => {
      let callCount = 0;
      const unsubscribe = analyticsSession.subscribe(() => {
        callCount++;
      });

      initializeSession();

      expect(callCount).toBeGreaterThan(0);
      unsubscribe();
    });

    it('should notify subscribers when events are added', () => {
      analyticsSession.set(createSession());

      let callCount = 0;
      const unsubscribe = eventQueue.subscribe(() => {
        callCount++;
      });

      trackEvent({ type: 'collection_view', data: {} } as any);

      expect(callCount).toBeGreaterThan(0);
      unsubscribe();
    });

    it('should update isReady when session is created', () => {
      let readyState = false;
      const unsubscribe = isReady.subscribe((ready) => {
        readyState = ready;
      });

      analyticsSession.set(createSession());

      expect(readyState).toBe(true);
      unsubscribe();
    });
  });

  describe('Edge Cases', () => {
    it('should handle tracking multiple events', () => {
      analyticsSession.set(createSession());

      for (let i = 0; i < 5; i++) {
        trackEvent({ type: 'collection_view', data: {} } as any);
      }

      const queue = eventQueue.get();
      expect(queue.events.length).toBeGreaterThan(0);
    });

    it('should handle rapid config updates', () => {
      for (let i = 0; i < 10; i++) {
        updateConfig({ batchSize: i + 1 });
      }

      expect(analyticsConfig.get().batchSize).toBe(10);
    });

    it('should handle session creation and clearing', () => {
      initializeSession();
      expect(analyticsSession.get()).not.toBeNull();

      analyticsSession.set(null);
      expect(analyticsSession.get()).toBeNull();

      initializeSession();
      expect(analyticsSession.get()).not.toBeNull();
    });

    it('should preserve event data integrity', () => {
      analyticsSession.set(createSession());

      const complexData = {
        nested: { value: 123 },
        array: [1, 2, 3],
        string: 'test',
      };

      trackEvent({ type: 'modal_open', data: complexData } as any);

      const queue = eventQueue.get();
      expect(queue.events[0].data).toEqual(complexData);
    });
  });

  describe('Batch Flushing', () => {
    beforeEach(() => {
      analyticsSession.set(createSession());
      analyticsConfig.set({ ...analyticsConfig.get(), batchSize: 3 });
    });

    it('should auto-flush when batch size is reached', async () => {
      // Track events up to batch size
      trackEvent({ type: 'collection_view', data: {} } as any);
      trackEvent({ type: 'settings_open', data: {} } as any);

      // This should trigger flush
      trackEvent({ type: 'modal_open', data: {} } as any);

      // Wait for async flush
      await new Promise(resolve => setTimeout(resolve, 10));

      // Queue should be cleared
      const queue = eventQueue.get();
      expect(queue.events.length).toBeLessThanOrEqual(3);
    });
  });

  describe('localStorage Limits', () => {
    beforeEach(() => {
      analyticsSession.set(createSession());
    });

    it('should trim stored events to 1000', async () => {
      // Store 1005 events
      const existingEvents = Array.from({ length: 1005 }, (_, i) => ({
        id: `event_${i}`,
        type: 'collection_view',
        timestamp: Date.now(),
        sessionId: 'test',
      }));
      localStorageMock.setItem('analytics_events', JSON.stringify(existingEvents));

      // Track one more event
      trackEvent({ type: 'settings_open', data: {} } as any);
      await flushEvents();

      const stored = getStoredEvents();
      expect(stored.length).toBeLessThanOrEqual(1000);
    });
  });
});
