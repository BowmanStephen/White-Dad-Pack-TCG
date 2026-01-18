/**
 * Analytics Store Tests
 * Tests for session management, event tracking, and flushing
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
} from '../../../src/stores/analytics';
import type { AnyAnalyticsEvent, AnalyticsSession } from '../../../src/types';

// Mock localStorage for Node.js environment
const mockLocalStorage = {
  store: new Map<string, string>(),
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  },
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  },
  removeItem(key: string): void {
    this.store.delete(key);
  },
  clear(): void {
    this.store.clear();
  },
};

// Mock window object
Object.defineProperty(global, 'window', {
  value: {
    localStorage: mockLocalStorage,
    addEventListener: vi.fn(),
  },
  writable: true,
});

// Mock document object
Object.defineProperty(global, 'document', {
  value: {
    visibilityState: 'visible',
    addEventListener: vi.fn(),
  },
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
    mockLocalStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Clean up after each test
    mockLocalStorage.clear();
  });

  describe('Session Management', () => {
    it('should create a new session with valid structure', () => {
      const session = createSession();

      expect(session).toBeDefined();
      expect(session.id).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(session.startTime).toBeGreaterThan(0);
      expect(session.pageCount).toBe(1);
      expect(session.lastActivity).toBeGreaterThan(0);
    });

    it('should initialize session when none exists', () => {
      expect(analyticsSession.get()).toBeNull();

      initializeSession();

      const session = analyticsSession.get();
      expect(session).not.toBeNull();
      expect(session?.id).toMatch(/^session_\d+_[a-z0-9]+$/);
    });

    it('should not overwrite existing session when initializing', () => {
      const originalSession = createSession();
      analyticsSession.set(originalSession);

      initializeSession();

      const currentSession = analyticsSession.get();
      expect(currentSession).not.toBeNull();
      expect(currentSession?.id).toBe(originalSession.id);
    });

    it('should update session activity timestamp', () => {
      const session = createSession();
      analyticsSession.set(session);

      const originalActivity = session.lastActivity;
      // Advance time
      vi.advanceTimersByTime(1000);

      updateSessionActivity();

      const updatedSession = analyticsSession.get();
      expect(updatedSession?.lastActivity).toBeGreaterThan(originalActivity);
    });

    it('should create unique session IDs', () => {
      const session1 = createSession();
      const session2 = createSession();

      expect(session1.id).not.toBe(session2.id);
    });

    it('should set page count to 1 on new session', () => {
      const session = createSession();
      expect(session.pageCount).toBe(1);
    });

    it('should have startTime and lastActivity close to now', () => {
      const now = Date.now();
      const session = createSession();

      expect(session.startTime).toBeLessThanOrEqual(now);
      expect(session.lastActivity).toBeLessThanOrEqual(now);
      expect(now - session.startTime).toBeLessThan(100);
    });
  });

  describe('Event Tracking', () => {
    beforeEach(() => {
      // Initialize session for event tracking tests
      initializeSession();
    });

    it('should track pack_open event', () => {
      trackEvent({
        type: 'pack_open',
        data: {
          packId: 'test-pack-1',
          cardCount: 6,
        },
      });

      const queue = eventQueue.get();
      expect(queue.events).toHaveLength(1);
      expect(queue.events[0].type).toBe('pack_open');
      expect(queue.events[0].data.packId).toBe('test-pack-1');
    });

    it('should track card_reveal event', () => {
      trackEvent({
        type: 'card_reveal',
        data: {
          packId: 'test-pack-1',
          cardIndex: 0,
          cardId: 'card-1',
          rarity: 'rare',
          isHolo: true,
          holoType: 'standard',
          autoRevealed: false,
        },
      });

      const queue = eventQueue.get();
      expect(queue.events).toHaveLength(1);
      expect(queue.events[0].type).toBe('card_reveal');
      expect(queue.events[0].data.rarity).toBe('rare');
      expect(queue.events[0].data.isHolo).toBe(true);
    });

    it('should track pack_complete event', () => {
      trackEvent({
        type: 'pack_complete',
        data: {
          packId: 'test-pack-1',
          cardCount: 6,
          bestRarity: 'legendary',
          holoCount: 2,
          duration: 5000,
          skipped: false,
        },
      });

      const queue = eventQueue.get();
      expect(queue.events).toHaveLength(1);
      expect(queue.events[0].type).toBe('pack_complete');
      expect(queue.events[0].data.bestRarity).toBe('legendary');
    });

    it('should track share event', () => {
      trackEvent({
        type: 'share',
        data: {
          platform: 'twitter',
          packId: 'test-pack-1',
          cardCount: 6,
        },
      });

      const queue = eventQueue.get();
      expect(queue.events).toHaveLength(1);
      expect(queue.events[0].type).toBe('share');
      expect(queue.events[0].data.platform).toBe('twitter');
    });

    it('should track collection_view event', () => {
      trackEvent({
        type: 'collection_view',
        data: {
          totalPacks: 10,
          totalCards: 60,
          uniqueCards: 45,
        },
      });

      const queue = eventQueue.get();
      expect(queue.events).toHaveLength(1);
      expect(queue.events[0].type).toBe('collection_view');
      expect(queue.events[0].data.totalPacks).toBe(10);
    });

    it('should auto-generate event ID', () => {
      trackEvent({
        type: 'pack_open',
        data: { packId: 'test', cardCount: 6 },
      });

      const queue = eventQueue.get();
      expect(queue.events[0].id).toMatch(/^event_\d+_[a-z0-9]+$/);
    });

    it('should auto-generate timestamp', () => {
      const now = Date.now();
      trackEvent({
        type: 'pack_open',
        data: { packId: 'test', cardCount: 6 },
      });

      const queue = eventQueue.get();
      expect(queue.events[0].timestamp).toBeGreaterThanOrEqual(now);
      expect(queue.events[0].timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('should add session ID to events', () => {
      const session = analyticsSession.get();
      expect(session).not.toBeNull();

      trackEvent({
        type: 'pack_open',
        data: { packId: 'test', cardCount: 6 },
      });

      const queue = eventQueue.get();
      expect(queue.events[0].sessionId).toBe(session?.id);
    });

    it('should not track events when analytics is disabled', () => {
      setAnalyticsEnabled(false);

      trackEvent({
        type: 'pack_open',
        data: { packId: 'test', cardCount: 6 },
      });

      const queue = eventQueue.get();
      expect(queue.events).toHaveLength(0);
    });

    it('should not track events when no session exists', () => {
      analyticsSession.set(null);

      trackEvent({
        type: 'pack_open',
        data: { packId: 'test', cardCount: 6 },
      });

      const queue = eventQueue.get();
      expect(queue.events).toHaveLength(0);
    });

    it('should track multiple events in sequence', () => {
      trackEvent({
        type: 'pack_open',
        data: { packId: 'pack-1', cardCount: 6 },
      });

      trackEvent({
        type: 'card_reveal',
        data: {
          packId: 'pack-1',
          cardIndex: 0,
          cardId: 'card-1',
          rarity: 'common',
          isHolo: false,
          holoType: 'none',
          autoRevealed: false,
        },
      });

      trackEvent({
        type: 'pack_complete',
        data: {
          packId: 'pack-1',
          cardCount: 6,
          bestRarity: 'rare',
          holoCount: 1,
          duration: 3000,
          skipped: false,
        },
      });

      const queue = eventQueue.get();
      expect(queue.events).toHaveLength(3);
    });

    it('should update session activity when tracking events', () => {
      const session = analyticsSession.get();
      expect(session).not.toBeNull();

      const originalActivity = session?.lastActivity ?? 0;
      vi.advanceTimersByTime(1000);

      trackEvent({
        type: 'pack_open',
        data: { packId: 'test', cardCount: 6 },
      });

      const updatedSession = analyticsSession.get();
      expect(updatedSession?.lastActivity).toBeGreaterThan(originalActivity);
    });

    it('should generate unique event IDs', () => {
      trackEvent({
        type: 'pack_open',
        data: { packId: 'test', cardCount: 6 },
      });

      trackEvent({
        type: 'pack_open',
        data: { packId: 'test', cardCount: 6 },
      });

      const queue = eventQueue.get();
      expect(queue.events[0].id).not.toBe(queue.events[1].id);
    });
  });

  describe('Event Flushing', () => {
    beforeEach(() => {
      initializeSession();
    });

    it('should flush events to localStorage', async () => {
      trackEvent({
        type: 'pack_open',
        data: { packId: 'test', cardCount: 6 },
      });

      await flushEvents();

      const storedEvents = getStoredEvents();
      expect(storedEvents).toHaveLength(1);
      expect(storedEvents[0].type).toBe('pack_open');
    });

    it('should clear queue after successful flush', async () => {
      trackEvent({
        type: 'pack_open',
        data: { packId: 'test', cardCount: 6 },
      });

      expect(eventQueue.get().events).toHaveLength(1);

      await flushEvents();

      expect(eventQueue.get().events).toHaveLength(0);
    });

    it('should update lastFlush timestamp after flushing', async () => {
      const originalFlush = eventQueue.get().lastFlush;
      vi.advanceTimersByTime(1000);

      trackEvent({
        type: 'pack_open',
        data: { packId: 'test', cardCount: 6 },
      });

      await flushEvents();

      expect(eventQueue.get().lastFlush).toBeGreaterThan(originalFlush);
    });

    it('should set isFlushing to true during flush', async () => {
      trackEvent({
        type: 'pack_open',
        data: { packId: 'test', cardCount: 6 },
      });

      const flushPromise = flushEvents();
      expect(isFlushing.get()).toBe(true);

      await flushPromise;
      expect(isFlushing.get()).toBe(false);
    });

    it('should handle empty queue gracefully', async () => {
      await expect(flushEvents()).resolves.not.toThrow();
      expect(eventQueue.get().events).toHaveLength(0);
    });

    it('should flush multiple events at once', async () => {
      for (let i = 0; i < 5; i++) {
        trackEvent({
          type: 'pack_open',
          data: { packId: `pack-${i}`, cardCount: 6 },
        });
      }

      await flushEvents();

      const storedEvents = getStoredEvents();
      expect(storedEvents).toHaveLength(5);
    });

    it('should append to existing events in localStorage', async () => {
      // Add initial event
      mockLocalStorage.setItem('analytics_events', JSON.stringify([
        {
          id: 'event-old-1',
          type: 'pack_open',
          timestamp: Date.now() - 10000,
          sessionId: analyticsSession.get()?.id ?? '',
          data: { packId: 'old-pack', cardCount: 6 },
        },
      ]));

      trackEvent({
        type: 'pack_open',
        data: { packId: 'new-pack', cardCount: 6 },
      });

      await flushEvents();

      const storedEvents = getStoredEvents();
      expect(storedEvents).toHaveLength(2);
      expect(storedEvents[0].data.packId).toBe('old-pack');
      expect(storedEvents[1].data.packId).toBe('new-pack');
    });

    it('should limit localStorage to 1000 most recent events', async () => {
      // Add 1001 events to storage
      const existingEvents: AnyAnalyticsEvent[] = [];
      for (let i = 0; i < 1001; i++) {
        existingEvents.push({
          id: `event-old-${i}`,
          type: 'pack_open',
          timestamp: Date.now() - i,
          sessionId: analyticsSession.get()?.id ?? '',
          data: { packId: `pack-${i}`, cardCount: 6 },
        });
      }
      mockLocalStorage.setItem('analytics_events', JSON.stringify(existingEvents));

      trackEvent({
        type: 'pack_open',
        data: { packId: 'new-pack', cardCount: 6 },
      });

      await flushEvents();

      const storedEvents = getStoredEvents();
      expect(storedEvents).toHaveLength(1000);
      // Should have the most recent 1000 events
      expect(storedEvents[0].data.packId).not.toBe('pack-0');
      expect(storedEvents[999].data.packId).toBe('new-pack');
    });
  });

  describe('Auto-Flush Triggers', () => {
    beforeEach(() => {
      initializeSession();
      // Set small batch size for testing
      analyticsConfig.set({
        enabled: true,
        providers: {},
        debugMode: false,
        batchSize: 3, // Small batch size
        flushInterval: 30000,
      });
    });

    it('should auto-flush when batch size is reached', async () => {
      // Track events up to batch size
      for (let i = 0; i < 3; i++) {
        trackEvent({
          type: 'pack_open',
          data: { packId: `pack-${i}`, cardCount: 6 },
        });
      }

      // Wait for async flush
      await new Promise(resolve => setTimeout(resolve, 0));

      // Queue should be empty (flushed)
      expect(eventQueue.get().events).toHaveLength(0);
    });

    it('should not auto-flush before batch size is reached', () => {
      // Track 2 events (below batch size of 3)
      for (let i = 0; i < 2; i++) {
        trackEvent({
          type: 'pack_open',
          data: { packId: `pack-${i}`, cardCount: 6 },
        });
      }

      // Queue should still have events
      expect(eventQueue.get().events).toHaveLength(2);
    });
  });

  describe('Configuration Management', () => {
    it('should update analytics config', () => {
      updateConfig({ batchSize: 20 });

      const config = analyticsConfig.get();
      expect(config.batchSize).toBe(20);
    });

    it('should update nested config properties', () => {
      updateConfig({
        providers: {
          googleAnalytics: {
            enabled: true,
            measurementId: 'G-TEST123',
          },
        },
      });

      const config = analyticsConfig.get();
      expect(config.providers.googleAnalytics?.enabled).toBe(true);
      expect(config.providers.googleAnalytics?.measurementId).toBe('G-TEST123');
    });

    it('should enable analytics', () => {
      setAnalyticsEnabled(false);
      expect(analyticsConfig.get().enabled).toBe(false);

      setAnalyticsEnabled(true);
      expect(analyticsConfig.get().enabled).toBe(true);
    });

    it('should disable analytics', () => {
      setAnalyticsEnabled(true);
      expect(analyticsConfig.get().enabled).toBe(true);

      setAnalyticsEnabled(false);
      expect(analyticsConfig.get().enabled).toBe(false);
    });

    it('should set debug mode', () => {
      setDebugMode(true);
      expect(analyticsConfig.get().debugMode).toBe(true);

      setDebugMode(false);
      expect(analyticsConfig.get().debugMode).toBe(false);
    });

    it('should merge partial updates with existing config', () => {
      updateConfig({
        enabled: false,
        batchSize: 15,
      });

      updateConfig({
        batchSize: 25,
      });

      const config = analyticsConfig.get();
      expect(config.enabled).toBe(false); // Preserved
      expect(config.batchSize).toBe(25); // Updated
    });
  });

  describe('Computed State', () => {
    it('should be ready when enabled and session exists', () => {
      analyticsConfig.set({ enabled: true, providers: {}, debugMode: false, batchSize: 10, flushInterval: 30000 });
      initializeSession();

      expect(isReady.get()).toBe(true);
    });

    it('should not be ready when disabled', () => {
      analyticsConfig.set({ enabled: false, providers: {}, debugMode: false, batchSize: 10, flushInterval: 30000 });
      initializeSession();

      expect(isReady.get()).toBe(false);
    });

    it('should not be ready when no session exists', () => {
      analyticsConfig.set({ enabled: true, providers: {}, debugMode: false, batchSize: 10, flushInterval: 30000 });
      analyticsSession.set(null);

      expect(isReady.get()).toBe(false);
    });

    it('should react to config changes', () => {
      initializeSession();

      expect(isReady.get()).toBe(true);

      setAnalyticsEnabled(false);
      expect(isReady.get()).toBe(false);
    });

    it('should react to session changes', () => {
      analyticsConfig.set({ enabled: true, providers: {}, debugMode: false, batchSize: 10, flushInterval: 30000 });

      expect(isReady.get()).toBe(false);

      initializeSession();
      expect(isReady.get()).toBe(true);
    });
  });

  describe('Stored Events Management', () => {
    beforeEach(() => {
      initializeSession();
    });

    it('should retrieve stored events from localStorage', () => {
      const testEvents: AnyAnalyticsEvent[] = [
        {
          id: 'event-1',
          type: 'pack_open',
          timestamp: Date.now(),
          sessionId: analyticsSession.get()?.id ?? '',
          data: { packId: 'test-1', cardCount: 6 },
        },
        {
          id: 'event-2',
          type: 'share',
          timestamp: Date.now(),
          sessionId: analyticsSession.get()?.id ?? '',
          data: { platform: 'twitter', packId: 'test-1', cardCount: 6 },
        },
      ];

      mockLocalStorage.setItem('analytics_events', JSON.stringify(testEvents));

      const storedEvents = getStoredEvents();
      expect(storedEvents).toHaveLength(2);
      expect(storedEvents[0].type).toBe('pack_open');
      expect(storedEvents[1].type).toBe('share');
    });

    it('should return empty array when no events stored', () => {
      const storedEvents = getStoredEvents();
      expect(storedEvents).toHaveLength(0);
    });

    it('should clear stored events from localStorage', () => {
      mockLocalStorage.setItem('analytics_events', JSON.stringify([
        {
          id: 'event-1',
          type: 'pack_open',
          timestamp: Date.now(),
          sessionId: analyticsSession.get()?.id ?? '',
          data: { packId: 'test', cardCount: 6 },
        },
      ]));

      expect(getStoredEvents()).toHaveLength(1);

      clearStoredEvents();

      expect(getStoredEvents()).toHaveLength(0);
      expect(mockLocalStorage.getItem('analytics_events')).toBeNull();
    });

    it('should handle corrupted localStorage data gracefully', () => {
      mockLocalStorage.setItem('analytics_events', 'invalid json');

      const storedEvents = getStoredEvents();
      expect(storedEvents).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle tracking when localStorage is full', async () => {
      initializeSession();

      // Mock localStorage to throw quota exceeded error
      const originalSetItem = mockLocalStorage.setItem;
      mockLocalStorage.setItem = vi.fn(() => {
        throw new DOMException('QuotaExceededError');
      });

      trackEvent({
        type: 'pack_open',
        data: { packId: 'test', cardCount: 6 },
      });

      // Should not throw, but events won't persist
      await expect(flushEvents()).resolves.not.toThrow();

      // Restore original
      mockLocalStorage.setItem = originalSetItem;
    });

    it('should handle rapid event tracking', () => {
      initializeSession();

      // Track many events rapidly
      for (let i = 0; i < 100; i++) {
        trackEvent({
          type: 'pack_open',
          data: { packId: `pack-${i}`, cardCount: 6 },
        });
      }

      const queue = eventQueue.get();
      expect(queue.events).toHaveLength(100);
    });

    it('should handle session creation in rapid succession', () => {
      const sessions: AnalyticsSession[] = [];
      for (let i = 0; i < 10; i++) {
        sessions.push(createSession());
      }

      // All sessions should have unique IDs
      const ids = new Set(sessions.map(s => s.id));
      expect(ids.size).toBe(10);
    });

    it('should handle updateSessionActivity when no session exists', () => {
      analyticsSession.set(null);

      expect(() => updateSessionActivity()).not.toThrow();
      expect(analyticsSession.get()).toBeNull();
    });
  });
});
