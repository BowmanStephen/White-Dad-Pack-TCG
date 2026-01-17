import { atom, computed } from 'nanostores';
import type {
  AnyAnalyticsEvent,
  AnalyticsConfig,
  AnalyticsSession,
  EventQueue,
} from '@/types';

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: AnalyticsConfig = {
  enabled: true,
  providers: {},
  debugMode: import.meta.env.DEV,
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
};

// ============================================================================
// STATE STORES
// ============================================================================

// Analytics configuration
export const analyticsConfig = atom<AnalyticsConfig>(DEFAULT_CONFIG);

// Analytics session
export const analyticsSession = atom<AnalyticsSession | null>(null);

// Event queue (for batching events before sending)
export const eventQueue = atom<EventQueue>({
  events: [],
  lastFlush: Date.now(),
});

// Whether analytics is ready to track events
export const isReady = computed(
  [analyticsConfig, analyticsSession],
  (config, session) => config.enabled && session !== null
);

// Whether we're currently flushing events
export const isFlushing = atom<boolean>(false);

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Generate a new session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Create a new analytics session
 */
export function createSession(): AnalyticsSession {
  return {
    id: generateSessionId(),
    startTime: Date.now(),
    pageCount: 1,
    lastActivity: Date.now(),
  };
}

/**
 * Initialize the analytics session
 */
export function initializeSession(): void {
  const existingSession = analyticsSession.get();

  if (!existingSession) {
    analyticsSession.set(createSession());
    logDebug('Session created');
  } else {
    // Update last activity
    analyticsSession.set({
      ...existingSession,
      lastActivity: Date.now(),
    });
  }
}

/**
 * Update session activity timestamp
 */
export function updateSessionActivity(): void {
  const session = analyticsSession.get();
  if (session) {
    analyticsSession.set({
      ...session,
      lastActivity: Date.now(),
    });
  }
}

// ============================================================================
// EVENT TRACKING
// ============================================================================

/**
 * Generate a unique event ID
 */
function generateEventId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Add an event to the queue
 */
export function trackEvent(event: Omit<AnyAnalyticsEvent, 'id' | 'timestamp' | 'sessionId'>): void {
  const config = analyticsConfig.get();
  const session = analyticsSession.get();

  // Don't track if analytics is disabled or no session
  if (!config.enabled || !session) {
    logDebug('Event not tracked (analytics disabled or no session)', event.type);
    return;
  }

  // Create the full event with metadata - use type assertion to satisfy TypeScript
  const fullEvent = {
    ...event,
    id: generateEventId(),
    timestamp: Date.now(),
    sessionId: session.id,
  } as AnyAnalyticsEvent;

  // Add to queue
  const queue = eventQueue.get();
  eventQueue.set({
    ...queue,
    events: [...queue.events, fullEvent],
  });

  // Update session activity
  updateSessionActivity();

  logDebug('Event tracked:', fullEvent);

  // Check if we should flush the queue
  const shouldFlush =
    queue.events.length + 1 >= config.batchSize ||
    Date.now() - queue.lastFlush >= config.flushInterval;

  if (shouldFlush) {
    flushEvents();
  }
}

/**
 * Flush queued events to LocalStorage
 * This ensures events are persisted even if analytics providers aren't configured
 */
export async function flushEvents(): Promise<void> {
  const queue = eventQueue.get();
  const config = analyticsConfig.get();

  if (queue.events.length === 0) {
    return;
  }

  isFlushing.set(true);

  try {
    // Always persist to LocalStorage (for later retrieval/backup)
    persistEventsToStorage(queue.events);

    // If analytics providers are configured, send to them
    if (config.providers.googleAnalytics?.enabled || config.providers.plausible?.enabled) {
      await sendEventsToProviders(queue.events);
    }

    // Clear the queue after successful flush
    eventQueue.set({
      events: [],
      lastFlush: Date.now(),
    });

    logDebug(`Flushed ${queue.events.length} events`);
  } catch (error) {
    console.error('Failed to flush analytics events:', error);
  } finally {
    isFlushing.set(false);
  }
}

/**
 * Persist events to LocalStorage
 * This ensures events are logged even when analytics isn't configured
 */
function persistEventsToStorage(events: AnyAnalyticsEvent[]): void {
  if (typeof window === 'undefined') return;

  try {
    // Get existing events from storage
    const existing = localStorage.getItem('analytics_events');
    const storedEvents: AnyAnalyticsEvent[] = existing ? JSON.parse(existing) : [];

    // Append new events
    const updatedEvents = [...storedEvents, ...events];

    // Keep only last 1000 events to prevent storage overflow
    const trimmedEvents = updatedEvents.slice(-1000);

    localStorage.setItem('analytics_events', JSON.stringify(trimmedEvents));
  } catch (error) {
    console.warn('Failed to persist events to LocalStorage:', error);
  }
}

/**
 * Send events to configured analytics providers
 */
async function sendEventsToProviders(events: AnyAnalyticsEvent[]): Promise<void> {
  const config = analyticsConfig.get();

  // Google Analytics
  if (config.providers.googleAnalytics?.enabled) {
    await import('./analytics/providers/ga').then((m) =>
      m.default.sendEvents(events)
    );
  }

  // Plausible
  if (config.providers.plausible?.enabled) {
    await import('./analytics/providers/plausible').then((m) =>
      m.default.sendEvents(events)
    );
  }
}

/**
 * Get all stored events from LocalStorage
 */
export function getStoredEvents(): AnyAnalyticsEvent[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('analytics_events');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Clear all stored events from LocalStorage
 */
export function clearStoredEvents(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('analytics_events');
  } catch (error) {
    console.warn('Failed to clear stored events:', error);
  }
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Update analytics configuration
 */
export function updateConfig(updates: Partial<AnalyticsConfig>): void {
  const current = analyticsConfig.get();
  analyticsConfig.set({
    ...current,
    ...updates,
    providers: {
      ...current.providers,
      ...updates.providers,
    },
  });
  logDebug('Analytics config updated:', updates);
}

/**
 * Enable or disable analytics
 */
export function setAnalyticsEnabled(enabled: boolean): void {
  updateConfig({ enabled });
}

/**
 * Set debug mode
 */
export function setDebugMode(enabled: boolean): void {
  updateConfig({ debugMode: enabled });
}

// ============================================================================
// DEBUG LOGGING
// ============================================================================

function logDebug(...args: unknown[]): void {
  const config = analyticsConfig.get();
  if (config.debugMode) {
    console.log('[Analytics]', ...args);
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize session on module load
if (typeof window !== 'undefined') {
  initializeSession();

  // Flush events before page unload
  window.addEventListener('beforeunload', () => {
    flushEvents();
  });

  // Flush events on page visibility change (user leaving tab)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushEvents();
    }
  });
}
