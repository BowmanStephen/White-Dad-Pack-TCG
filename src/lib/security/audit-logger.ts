/**
 * Audit Logging System
 *
 * Tracks security-related events for monitoring and forensics:
 * - Pack opens
 * - Security violations
 * - Ban actions
 * - Suspicious activities
 *
 * Logs are stored in localStorage with automatic rotation.
 */

import type { AuditLogEntry, SecurityEvent, SecurityViolation, ViolationSeverity } from '../../types/security';
import { deepClone } from './utils';

/**
 * Maximum number of log entries to keep in localStorage
 */
const MAX_LOG_ENTRIES = 1000;

/**
 * Storage key for audit logs
 */
const STORAGE_KEY = 'security_audit_logs';

/**
 * In-memory log cache
 */
let logCache: AuditLogEntry[] = [];

/**
 * Initialize the audit logger
 */
export function initAuditLogger(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      logCache = JSON.parse(stored) as AuditLogEntry[];
      // Convert timestamp strings back to Date objects
      logCache = logCache.map((entry) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }));
    }
  } catch {
    logCache = [];
  }
}

/**
 * Save logs to localStorage
 */
function saveLogs(): void {
  try {
    // Keep only the most recent entries
    const toSave = logCache.slice(-MAX_LOG_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    // Log full, clear old entries
    console.warn('LocalStorage full, clearing old audit logs:', error);
    clearOldLogs();
    try {
      const toSave = logCache.slice(-Math.floor(MAX_LOG_ENTRIES / 2));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // Still failing, give up on persistence
    }
  }
}

/**
 * Clear old log entries
 */
function clearOldLogs(): void {
  const toKeep = logCache.slice(-Math.floor(MAX_LOG_ENTRIES / 2));
  logCache = toKeep;
}

/**
 * Generate a unique log entry ID
 */
function generateLogId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create an audit log entry
 */
export function createAuditLog(
  action: string,
  details: Record<string, unknown>,
  severity: ViolationSeverity = 'low',
  fingerprint: string = 'unknown',
  userId?: string
): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: generateLogId(),
    timestamp: new Date(),
    action,
    userId,
    fingerprint,
    details: deepClone(details),
    severity,
  };

  logCache.push(entry);
  saveLogs();

  return entry;
}

/**
 * Log a security event
 */
export function logSecurityEvent(event: SecurityEvent): void {
  const severityMap: Record<SecurityEvent['type'], ViolationSeverity> = {
    pack_open: 'low',
    pack_validation: 'medium',
    violation_detected: 'high',
    ban_applied: 'critical',
    ban_removed: 'medium',
  };

  createAuditLog(
    `security_event:${event.type}`,
    event.data,
    severityMap[event.type],
    event.fingerprint
  );
}

/**
 * Log a security violation
 */
export function logViolation(violation: SecurityViolation): void {
  createAuditLog(
    `violation:${violation.type}`,
    {
      violationId: violation.id,
      type: violation.type,
      severity: violation.severity,
      details: violation.details,
      metadata: violation.metadata,
    },
    violation.severity,
    violation.fingerprint
  );
}

/**
 * Log a pack opening event
 */
export function logPackOpen(
  packId: string,
  packType: string,
  fingerprint: string,
  metadata?: Record<string, unknown>
): void {
  createAuditLog('pack_open', {
    packId,
    packType,
    ...metadata,
  }, 'low', fingerprint);
}

/**
 * Log a ban application
 */
export function logBanApplied(
  fingerprint: string,
  reason: string,
  permanent: boolean,
  expiresAt?: Date,
  userId?: string
): void {
  createAuditLog('ban_applied', {
    reason,
    permanent,
    expiresAt: expiresAt?.toISOString(),
  }, 'critical', fingerprint, userId);
}

/**
 * Log a ban removal
 */
export function logBanRemoved(
  fingerprint: string,
  reason: string,
  userId?: string
): void {
  createAuditLog('ban_removed', {
    reason,
  }, 'medium', fingerprint, userId);
}

/**
 * Log suspicious activity
 */
export function logSuspiciousActivity(
  activity: string,
  fingerprint: string,
  details: Record<string, unknown>
): void {
  createAuditLog('suspicious_activity', {
    activity,
    ...details,
  }, 'high', fingerprint);
}

/**
 * Get recent log entries
 */
export function getRecentLogs(count: number = 100): AuditLogEntry[] {
  return logCache.slice(-count);
}

/**
 * Get logs by severity
 */
export function getLogsBySeverity(severity: ViolationSeverity): AuditLogEntry[] {
  return logCache.filter((entry) => entry.severity === severity);
}

/**
 * Get logs by action type
 */
export function getLogsByAction(action: string): AuditLogEntry[] {
  return logCache.filter((entry) => entry.action === action);
}

/**
 * Get logs by fingerprint
 */
export function getLogsByFingerprint(fingerprint: string): AuditLogEntry[] {
  return logCache.filter((entry) => entry.fingerprint === fingerprint);
}

/**
 * Get logs within a date range
 */
export function getLogsByDateRange(start: Date, end: Date): AuditLogEntry[] {
  return logCache.filter((entry) => {
    const timestamp = entry.timestamp.getTime();
    return timestamp >= start.getTime() && timestamp <= end.getTime();
  });
}

/**
 * Get violation statistics
 */
export function getViolationStats(): {
  total: number;
  bySeverity: Record<ViolationSeverity, number>;
  byType: Record<string, number>;
  byFingerprint: Record<string, number>;
} {
  const bySeverity: Record<ViolationSeverity, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
  const byType: Record<string, number> = {};
  const byFingerprint: Record<string, number> = {};

  for (const entry of logCache) {
    if (entry.action.startsWith('violation:')) {
      bySeverity[entry.severity]++;

      const violationType = entry.action.replace('violation:', '');
      byType[violationType] = (byType[violationType] || 0) + 1;

      byFingerprint[entry.fingerprint] = (byFingerprint[entry.fingerprint] || 0) + 1;
    }
  }

  return {
    total: Object.values(bySeverity).reduce((a, b) => a + b, 0),
    bySeverity,
    byType,
    byFingerprint,
  };
}

/**
 * Get top offenders (fingerprints with most violations)
 */
export function getTopOffenders(limit: number = 10): Array<{
  fingerprint: string;
  violationCount: number;
  lastViolation: Date;
}> {
  const stats = getViolationStats().byFingerprint;

  return Object.entries(stats)
    .map(([fingerprint, violationCount]) => {
      const logs = getLogsByFingerprint(fingerprint);
      const violationLogs = logs.filter((l) => l.action.startsWith('violation:'));
      const lastViolation = violationLogs[violationLogs.length - 1]?.timestamp || new Date();

      return { fingerprint, violationCount, lastViolation };
    })
    .sort((a, b) => b.violationCount - a.violationCount)
    .slice(0, limit);
}

/**
 * Clear all audit logs (admin only)
 */
export function clearAuditLogs(): void {
  logCache = [];
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Export logs as JSON
 */
export function exportLogs(): string {
  return JSON.stringify(logCache, null, 2);
}

/**
 * Import logs from JSON
 */
export function importLogs(json: string): boolean {
  try {
    const imported = JSON.parse(json) as AuditLogEntry[];
    if (!Array.isArray(imported)) {
      return false;
    }

    // Validate and convert dates
    for (const entry of imported) {
      if (!entry.id || !entry.timestamp || !entry.action) {
        return false;
      }
      entry.timestamp = new Date(entry.timestamp);
    }

    logCache = imported;
    saveLogs();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get log statistics
 */
export function getLogStats(): {
  totalEntries: number;
  oldestEntry?: Date;
  newestEntry?: Date;
  averageEntriesPerDay: number;
} {
  if (logCache.length === 0) {
    return {
      totalEntries: 0,
      averageEntriesPerDay: 0,
    };
  }

  const oldestEntry = logCache[0]?.timestamp;
  const newestEntry = logCache[logCache.length - 1]?.timestamp;

  const daysSpan = newestEntry && oldestEntry
    ? Math.max(1, (newestEntry.getTime() - oldestEntry.getTime()) / (1000 * 60 * 60 * 24))
    : 1;

  return {
    totalEntries: logCache.length,
    oldestEntry,
    newestEntry,
    averageEntriesPerDay: logCache.length / daysSpan,
  };
}

// Initialize on import
initAuditLogger();
