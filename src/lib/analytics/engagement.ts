/**
 * DadDeck User Engagement Analytics
 *
 * Tracks user engagement metrics across sessions:
 * - Session duration tracking
 * - Packs opened per session
 * - Feature usage (crafting, battles, trading, deck building, upgrades)
 *
 * @packageDocumentation
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Feature usage tracking for different game features
 */
export type FeatureType =
  | 'crafting'
  | 'battle'
  | 'trade'
  | 'deck_builder'
  | 'upgrade'
  | 'batch_open'
  | 'collection_search'
  | 'collection_filter'
  | 'share_pack';

/**
 * Single feature usage event
 */
export interface FeatureUsageEvent {
  feature: FeatureType;
  timestamp: number;
  sessionId: string;
  details?: Record<string, unknown>;
}

/**
 * Session engagement data
 */
export interface SessionEngagement {
  sessionId: string;
  startTime: number;
  endTime?: number;
  duration?: number;  // Duration in seconds
  packsOpened: number;
  featureUsage: Record<FeatureType, number>;  // Count of uses per feature
  lastActivity: number;
}

/**
 * Aggregated engagement metrics across all sessions
 */
export interface EngagementMetrics {
  totalSessions: number;
  totalSessionDuration: number;  // Total seconds across all sessions
  averageSessionDuration: number;  // Average session duration in minutes
  longestSession: number;  // Longest session duration in minutes
  totalPacksOpened: number;
  averagePacksPerSession: number;
  featureUsage: Record<FeatureType, {
    totalUses: number;
    sessionsUsed: number;  // Number of sessions where feature was used
    averageUsesPerSession: number;
  }>;
  mostUsedFeature?: FeatureType;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEYS = {
  SESSION_ENGAGEMENT: 'engagement_session',
  FEATURE_HISTORY: 'engagement_features',
  SESSION_ID: 'engagement_session_id',
} as const;

const SESSION_TIMEOUT = 30 * 60 * 1000;  // 30 minutes of inactivity = new session

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Get or create current session ID
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    const lastSessionData = stored ? JSON.parse(stored) : null;
    const now = Date.now();

    // Check if session has timed out (30 minutes of inactivity)
    if (lastSessionData && (now - lastSessionData.lastActivity) < SESSION_TIMEOUT) {
      // Update activity time
      lastSessionData.lastActivity = now;
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, JSON.stringify(lastSessionData));
      return lastSessionData.sessionId;
    }

    // Create new session
    const newSessionId = `session_${now}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem(
      STORAGE_KEYS.SESSION_ID,
      JSON.stringify({ sessionId: newSessionId, lastActivity: now })
    );

    // Initialize new session engagement
    const newSession: SessionEngagement = {
      sessionId: newSessionId,
      startTime: now,
      packsOpened: 0,
      featureUsage: {
        crafting: 0,
        battle: 0,
        trade: 0,
        deck_builder: 0,
        upgrade: 0,
        batch_open: 0,
        collection_search: 0,
        collection_filter: 0,
        share_pack: 0,
      },
      lastActivity: now,
    };
    saveSessionEngagement(newSession);

    return newSessionId;
  } catch (error) {
    console.warn('[Engagement] Failed to get session ID:', error);
    return 'unknown';
  }
}

/**
 * Get current session engagement data
 */
export function getSessionEngagement(): SessionEngagement {
  if (typeof window === 'undefined') {
    return createDefaultSession('server');
  }

  try {
    const sessionId = getSessionId();
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION_ENGAGEMENT);

    if (stored) {
      const sessionData = JSON.parse(stored);
      if (sessionData.sessionId === sessionId) {
        return sessionData;
      }
    }

    // Create new session if not found or ID mismatch
    return createDefaultSession(sessionId);
  } catch (error) {
    console.warn('[Engagement] Failed to get session engagement:', error);
    return createDefaultSession('unknown');
  }
}

/**
 * Save session engagement data
 */
function saveSessionEngagement(session: SessionEngagement): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.SESSION_ENGAGEMENT, JSON.stringify(session));
  } catch (error) {
    console.warn('[Engagement] Failed to save session engagement:', error);
  }
}

/**
 * Create default session engagement
 */
function createDefaultSession(sessionId: string): SessionEngagement {
  return {
    sessionId,
    startTime: Date.now(),
    packsOpened: 0,
    featureUsage: {
      crafting: 0,
      battle: 0,
      trade: 0,
      deck_builder: 0,
      upgrade: 0,
      batch_open: 0,
      collection_search: 0,
      collection_filter: 0,
      share_pack: 0,
    },
    lastActivity: Date.now(),
  };
}

/**
 * Update session activity timestamp
 * Call this periodically (e.g., on user interactions)
 */
export function updateSessionActivity(): void {
  const session = getSessionEngagement();
  session.lastActivity = Date.now();

  // Update session duration if it's the end of a session
  if (session.endTime) {
    session.duration = Math.round((session.endTime - session.startTime) / 1000);
  } else {
    // Update duration so far
    session.duration = Math.round((Date.now() - session.startTime) / 1000);
  }

  saveSessionEngagement(session);
}

/**
 * End current session and save to history
 */
export function endSession(): void {
  const session = getSessionEngagement();
  const now = Date.now();

  session.endTime = now;
  session.duration = Math.round((now - session.startTime) / 1000);

  // Save to feature history
  saveSessionToHistory(session);

  // Clear current session
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION_ENGAGEMENT);
  } catch (error) {
    console.warn('[Engagement] Failed to clear session:', error);
  }
}

// ============================================================================
// PACK OPENING TRACKING
// ============================================================================

/**
 * Record a pack open event in the current session
 */
export function recordPackOpen(): void {
  const session = getSessionEngagement();
  session.packsOpened++;
  session.lastActivity = Date.now();

  saveSessionEngagement(session);
}

/**
 * Get number of packs opened in current session
 */
export function getSessionPackCount(): number {
  return getSessionEngagement().packsOpened;
}

// ============================================================================
// FEATURE USAGE TRACKING
// ============================================================================

/**
 * Record feature usage
 * @param feature - The feature being used
 * @param details - Optional additional details about the usage
 */
export function recordFeatureUsage(
  feature: FeatureType,
  details?: Record<string, unknown>
): void {
  const session = getSessionEngagement();
  session.featureUsage[feature]++;
  session.lastActivity = Date.now();

  saveSessionEngagement(session);

  // Also save to feature usage history for long-term tracking
  saveFeatureUsageEvent({
    feature,
    timestamp: Date.now(),
    sessionId: session.sessionId,
    details,
  });
}

/**
 * Get feature usage count for current session
 */
export function getSessionFeatureUsage(feature: FeatureType): number {
  return getSessionEngagement().featureUsage[feature];
}

/**
 * Get all feature usage for current session
 */
export function getAllSessionFeatureUsage(): Record<FeatureType, number> {
  return getSessionEngagement().featureUsage;
}

/**
 * Save feature usage event to history
 */
function saveFeatureUsageEvent(event: FeatureUsageEvent): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FEATURE_HISTORY);
    const history: FeatureUsageEvent[] = stored ? JSON.parse(stored) : [];

    // Append new event
    history.push(event);

    // Keep last 1000 events
    const trimmed = history.slice(-1000);

    localStorage.setItem(STORAGE_KEYS.FEATURE_HISTORY, JSON.stringify(trimmed));
  } catch (error) {
    console.warn('[Engagement] Failed to save feature usage:', error);
  }
}

/**
 * Get feature usage history
 */
export function getFeatureUsageHistory(): FeatureUsageEvent[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FEATURE_HISTORY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// ============================================================================
// SESSION HISTORY
// ============================================================================

/**
 * Session history record
 */
interface SessionHistoryRecord {
  sessionId: string;
  startTime: number;
  endTime: number;
  duration: number;  // Duration in seconds
  packsOpened: number;
  featureUsage: Record<FeatureType, number>;
}

/**
 * Save completed session to history
 */
function saveSessionToHistory(session: SessionEngagement): void {
  if (typeof window === 'undefined') return;

  try {
    const key = 'engagement_session_history';
    const stored = localStorage.getItem(key);
    const history: SessionHistoryRecord[] = stored ? JSON.parse(stored) : [];

    const record: SessionHistoryRecord = {
      sessionId: session.sessionId,
      startTime: session.startTime,
      endTime: session.endTime || Date.now(),
      duration: session.duration || 0,
      packsOpened: session.packsOpened,
      featureUsage: session.featureUsage,
    };

    // Append to history
    history.push(record);

    // Keep last 100 sessions
    const trimmed = history.slice(-100);

    localStorage.setItem(key, JSON.stringify(trimmed));
  } catch (error) {
    console.warn('[Engagement] Failed to save session to history:', error);
  }
}

/**
 * Get session history
 */
export function getSessionHistory(): SessionHistoryRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const key = 'engagement_session_history';
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// ============================================================================
// AGGREGATED ENGAGEMENT METRICS
// ============================================================================

/**
 * Calculate aggregated engagement metrics across all sessions
 */
export function calculateEngagementMetrics(): EngagementMetrics {
  const history = getSessionHistory();
  const currentSession = getSessionEngagement();

  // Include current session in calculations
  const allSessions: SessionHistoryRecord[] = [
    ...history,
    {
      sessionId: currentSession.sessionId,
      startTime: currentSession.startTime,
      endTime: Date.now(),
      duration: currentSession.duration || Math.round((Date.now() - currentSession.startTime) / 1000),
      packsOpened: currentSession.packsOpened,
      featureUsage: currentSession.featureUsage,
    },
  ];

  if (allSessions.length === 0) {
    return {
      totalSessions: 0,
      totalSessionDuration: 0,
      averageSessionDuration: 0,
      longestSession: 0,
      totalPacksOpened: 0,
      averagePacksPerSession: 0,
      featureUsage: {
        crafting: { totalUses: 0, sessionsUsed: 0, averageUsesPerSession: 0 },
        battle: { totalUses: 0, sessionsUsed: 0, averageUsesPerSession: 0 },
        trade: { totalUses: 0, sessionsUsed: 0, averageUsesPerSession: 0 },
        deck_builder: { totalUses: 0, sessionsUsed: 0, averageUsesPerSession: 0 },
        upgrade: { totalUses: 0, sessionsUsed: 0, averageUsesPerSession: 0 },
        batch_open: { totalUses: 0, sessionsUsed: 0, averageUsesPerSession: 0 },
        collection_search: { totalUses: 0, sessionsUsed: 0, averageUsesPerSession: 0 },
        collection_filter: { totalUses: 0, sessionsUsed: 0, averageUsesPerSession: 0 },
        share_pack: { totalUses: 0, sessionsUsed: 0, averageUsesPerSession: 0 },
      },
    };
  }

  // Calculate session metrics
  const totalSessionDuration = allSessions.reduce((sum, s) => sum + s.duration, 0);
  const averageSessionDuration = totalSessionDuration / allSessions.length / 60;  // Convert to minutes
  const longestSession = Math.max(...allSessions.map((s) => s.duration)) / 60;  // Convert to minutes

  const totalPacksOpened = allSessions.reduce((sum, s) => sum + s.packsOpened, 0);
  const averagePacksPerSession = totalPacksOpened / allSessions.length;

  // Calculate feature usage metrics
  const featureTypes: FeatureType[] = [
    'crafting',
    'battle',
    'trade',
    'deck_builder',
    'upgrade',
    'batch_open',
    'collection_search',
    'collection_filter',
    'share_pack',
  ];

  const featureUsage: EngagementMetrics['featureUsage'] = {} as any;

  for (const feature of featureTypes) {
    const totalUses = allSessions.reduce((sum, s) => sum + s.featureUsage[feature], 0);
    const sessionsUsed = allSessions.filter((s) => s.featureUsage[feature] > 0).length;
    const averageUsesPerSession = sessionsUsed > 0 ? totalUses / sessionsUsed : 0;

    featureUsage[feature] = {
      totalUses,
      sessionsUsed,
      averageUsesPerSession,
    };
  }

  // Find most used feature
  let mostUsedFeature: FeatureType | undefined;
  let maxUses = 0;
  for (const feature of featureTypes) {
    if (featureUsage[feature].totalUses > maxUses) {
      maxUses = featureUsage[feature].totalUses;
      mostUsedFeature = feature;
    }
  }

  return {
    totalSessions: allSessions.length,
    totalSessionDuration,
    averageSessionDuration: Math.round(averageSessionDuration),
    longestSession: Math.round(longestSession),
    totalPacksOpened,
    averagePacksPerSession: Math.round(averagePacksPerSession * 10) / 10,
    featureUsage,
    mostUsedFeature,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get current session duration in minutes
 */
export function getCurrentSessionDuration(): number {
  const session = getSessionEngagement();
  const durationMs = Date.now() - session.startTime;
  return Math.round(durationMs / 60000);
}

/**
 * Format duration as human-readable string
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format engagement metrics for display
 */
export function formatEngagementMetrics(metrics: EngagementMetrics): string {
  const lines: string[] = [];

  lines.push('=== USER ENGAGEMENT METRICS ===');
  lines.push(`Total Sessions: ${metrics.totalSessions}`);
  lines.push(`Avg Session Duration: ${metrics.averageSessionDuration} min`);
  lines.push(`Longest Session: ${metrics.longestSession} min`);
  lines.push(`Total Packs Opened: ${metrics.totalPacksOpened}`);
  lines.push(`Avg Packs per Session: ${metrics.averagePacksPerSession}`);
  lines.push('');
  lines.push('Feature Usage:');

  for (const [feature, stats] of Object.entries(metrics.featureUsage)) {
    if (stats.totalUses > 0) {
      lines.push(
        `  ${feature.padEnd(20)}: ${stats.totalUses} uses (${stats.sessionsUsed} sessions, avg ${stats.averageUsesPerSession.toFixed(1)}/session)`
      );
    }
  }

  if (metrics.mostUsedFeature) {
    lines.push('');
    lines.push(`Most Used Feature: ${metrics.mostUsedFeature}`);
  }

  return lines.join('\n');
}

/**
 * Log engagement summary to console (for debugging)
 */
export function logEngagementSummary(): void {
  const metrics = calculateEngagementMetrics();
  const currentDuration = getCurrentSessionDuration();

  console.log('=== DADDECK ENGAGEMENT SUMMARY ===\n');
  console.log(`Current Session Duration: ${currentDuration} min`);
  console.log(`Current Session Packs: ${getSessionPackCount()}`);
  console.log('\n');
  console.log(formatEngagementMetrics(metrics));
  console.log('\n=== END ENGAGEMENT SUMMARY ===');
}

/**
 * Clear all engagement data
 */
export function clearEngagementData(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION_ENGAGEMENT);
    localStorage.removeItem(STORAGE_KEYS.FEATURE_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    localStorage.removeItem('engagement_session_history');
  } catch (error) {
    console.warn('[Engagement] Failed to clear data:', error);
  }
}

/**
 * Export all engagement data as JSON
 */
export function exportEngagementData(): {
  currentSession: SessionEngagement;
  sessionHistory: SessionHistoryRecord[];
  featureUsageHistory: FeatureUsageEvent[];
  aggregatedMetrics: EngagementMetrics;
} {
  return {
    currentSession: getSessionEngagement(),
    sessionHistory: getSessionHistory(),
    featureUsageHistory: getFeatureUsageHistory(),
    aggregatedMetrics: calculateEngagementMetrics(),
  };
}
