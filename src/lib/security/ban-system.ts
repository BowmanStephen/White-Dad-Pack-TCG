/**
 * Ban System
 *
 * Manages bans for cheaters and abusers:
 * - Automatic ban thresholds based on violations
 * - Manual ban management
 * - Temporary and permanent bans
 * - Ban appeals (placeholder for future)
 *
 * Uses localStorage for persistence. In production, this would
 * be server-side with a database.
 */

import type { BanStatus, SecurityViolation, ViolationSeverity, ViolationType } from '../../types/security';
import { logBanApplied, logBanRemoved } from './audit-logger';
import { isPast } from './utils';

/**
 * Ban record stored in the system
 */
interface BanRecord {
  fingerprint: string;
  reason: string;
  violationIds: string[];
  createdAt: Date;
  expiresAt?: Date;
  permanent: boolean;
  active: boolean;
}

/**
 * Storage key for bans
 */
const STORAGE_KEY = 'security_bans';

/**
 * In-memory ban cache
 */
const banCache: Map<string, BanRecord> = new Map();

/**
 * Default ban durations by severity (milliseconds)
 */
const BAN_DURATIONS: Record<ViolationSeverity, number> = {
  low: 0, // No auto-ban for low severity
  medium: 3600000, // 1 hour
  high: 86400000, // 1 day
  critical: 604800000, // 1 week
};

/**
 * Violation thresholds for auto-ban
 */
const VIOLATION_THRESHOLDS: Record<ViolationSeverity, number> = {
  low: 20, // 20 low-severity violations
  medium: 10, // 10 medium-severity violations
  high: 5, // 5 high-severity violations
  critical: 1, // Immediate ban on critical
};

/**
 * Initialize the ban system
 */
export function initBanSystem(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const records = JSON.parse(stored) as BanRecord[];
      for (const record of records) {
        record.createdAt = new Date(record.createdAt);
        if (record.expiresAt) {
          record.expiresAt = new Date(record.expiresAt);
        }
        banCache.set(record.fingerprint, record);
      }
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Save bans to localStorage
 */
function saveBans(): void {
  try {
    const records = Array.from(banCache.values());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Storage full or unavailable
  }
}

/**
 * Check if a fingerprint is currently banned
 */
export function isBanned(fingerprint: string): BanStatus {
  const record = banCache.get(fingerprint);

  if (!record || !record.active) {
    return {
      isBanned: false,
      permanent: false,
      violationIds: [],
    };
  }

  // Check if temporary ban has expired
  if (!record.permanent && record.expiresAt && isPast(record.expiresAt)) {
    // Auto-unban expired bans
    unban(fingerprint, 'Ban expired');
    return {
      isBanned: false,
      permanent: false,
      violationIds: [],
    };
  }

  return {
    isBanned: true,
    reason: record.reason,
    expiresAt: record.expiresAt,
    permanent: record.permanent,
    violationIds: record.violationIds,
  };
}

/**
 * Apply a ban to a fingerprint
 */
export function ban(
  fingerprint: string,
  reason: string,
  violationIds: string[],
  options: {
    permanent?: boolean;
    duration?: number; // Duration in milliseconds
  } = {}
): BanStatus {
  const record = banCache.get(fingerprint);

  // Check if already permanently banned
  if (record?.permanent) {
    return isBanned(fingerprint);
  }

  const permanent = options.permanent ?? false;
  const duration = options.duration;

  const banRecord: BanRecord = {
    fingerprint,
    reason,
    violationIds,
    createdAt: new Date(),
    expiresAt: permanent ? undefined : new Date(Date.now() + (duration || BAN_DURATIONS.high)),
    permanent,
    active: true,
  };

  banCache.set(fingerprint, banRecord);
  saveBans();

  logBanApplied(fingerprint, reason, permanent, banRecord.expiresAt);

  return isBanned(fingerprint);
}

/**
 * Remove a ban from a fingerprint
 */
export function unban(fingerprint: string, reason: string): boolean {
  const record = banCache.get(fingerprint);
  if (!record) {
    return false;
  }

  record.active = false;
  saveBans();

  logBanRemoved(fingerprint, reason);

  return true;
}

/**
 * Check if violations should trigger an auto-ban
 */
export function checkAutoBanThreshold(
  fingerprint: string,
  violations: SecurityViolation[]
): BanStatus | null {
  // Count violations by severity
  const severityCounts: Record<ViolationSeverity, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  const violationIds: string[] = [];

  for (const violation of violations) {
    severityCounts[violation.severity]++;
    violationIds.push(violation.id);
  }

  // Check for immediate ban conditions
  if (severityCounts.critical >= VIOLATION_THRESHOLDS.critical) {
    return ban(
      fingerprint,
      `Auto-ban: ${severityCounts.critical} critical violation(s)`,
      violationIds,
      { permanent: false, duration: BAN_DURATIONS.critical }
    );
  }

  if (severityCounts.high >= VIOLATION_THRESHOLDS.high) {
    return ban(
      fingerprint,
      `Auto-ban: ${severityCounts.high} high-severity violation(s)`,
      violationIds,
      { permanent: false, duration: BAN_DURATIONS.high }
    );
  }

  if (severityCounts.medium >= VIOLATION_THRESHOLDS.medium) {
    return ban(
      fingerprint,
      `Auto-ban: ${severityCounts.medium} medium-severity violation(s)`,
      violationIds,
      { permanent: false, duration: BAN_DURATIONS.medium }
    );
  }

  if (severityCounts.low >= VIOLATION_THRESHOLDS.low) {
    return ban(
      fingerprint,
      `Auto-ban: ${severityCounts.low} low-severity violation(s)`,
      violationIds,
      { permanent: false, duration: BAN_DURATIONS.medium }
    );
  }

  return null; // No ban triggered
}

/**
 * Get all active bans
 */
export function getActiveBans(): Array<{
  fingerprint: string;
  reason: string;
  expiresAt?: Date;
  permanent: boolean;
  violationCount: number;
}> {
  const activeBans: Array<{
    fingerprint: string;
    reason: string;
    expiresAt?: Date;
    permanent: boolean;
    violationCount: number;
  }> = [];

  for (const record of banCache.values()) {
    if (!record.active) continue;

    // Skip expired temporary bans
    if (!record.permanent && record.expiresAt && isPast(record.expiresAt)) {
      continue;
    }

    activeBans.push({
      fingerprint: record.fingerprint,
      reason: record.reason,
      expiresAt: record.expiresAt,
      permanent: record.permanent,
      violationCount: record.violationIds.length,
    });
  }

  return activeBans;
}

/**
 * Get ban statistics
 */
export function getBanStats(): {
  totalBans: number;
  activeBans: number;
  permanentBans: number;
  temporaryBans: number;
  averageDuration: number;
} {
  let activeCount = 0;
  let permanentCount = 0;
  let temporaryCount = 0;
  let totalDuration = 0;
  let durationCount = 0;

  for (const record of banCache.values()) {
    if (!record.active) continue;

    if (!record.permanent && record.expiresAt && isPast(record.expiresAt)) {
      continue;
    }

    activeCount++;

    if (record.permanent) {
      permanentCount++;
    } else {
      temporaryCount++;
      if (record.expiresAt) {
        const duration = record.expiresAt.getTime() - record.createdAt.getTime();
        totalDuration += duration;
        durationCount++;
      }
    }
  }

  return {
    totalBans: banCache.size,
    activeBans: activeCount,
    permanentBans: permanentCount,
    temporaryBans: temporaryCount,
    averageDuration: durationCount > 0 ? totalDuration / durationCount : 0,
  };
}

/**
 * Clear all bans (admin only)
 */
export function clearAllBans(): void {
  banCache.clear();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get ban history for a fingerprint
 */
export function getBanHistory(fingerprint: string): Array<{
  reason: string;
  createdAt: Date;
  expiresAt?: Date;
  permanent: boolean;
  violationIds: string[];
}> {
  const record = banCache.get(fingerprint);
  if (!record) {
    return [];
  }

  return [{
    reason: record.reason,
    createdAt: record.createdAt,
    expiresAt: record.expiresAt,
    permanent: record.permanent,
    violationIds: record.violationIds,
  }];
}

/**
 * Check if a violation type should trigger an immediate ban
 */
export function shouldImmediateBan(violationType: ViolationType): boolean {
  const immediateBanTypes: ViolationType[] = [
    'pack_manipulation',
    'entropy_mismatch',
    'exploit_attempt',
  ];

  return immediateBanTypes.includes(violationType);
}

/**
 * Apply an immediate ban for a serious violation
 */
export function applyImmediateBan(
  fingerprint: string,
  violation: SecurityViolation
): BanStatus {
  return ban(
    fingerprint,
    `Immediate ban: ${violation.type} - ${violation.details}`,
    [violation.id],
    { permanent: false, duration: BAN_DURATIONS.critical }
  );
}

// Initialize on import
initBanSystem();
