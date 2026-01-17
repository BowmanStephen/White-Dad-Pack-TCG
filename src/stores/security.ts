/**
 * Security Store
 *
 * Centralizes all security functionality:
 * - Rate limiting
 * - Pack validation
 * - Ban management
 * - Audit logging
 * - Device fingerprinting
 */

import { atom } from 'nanostores';
import type { Pack } from '../types';
import type {
  SecurityViolation,
  BanStatus,
  RateLimitStatus,
  DeviceFingerprint,
  SecurityConfig,
  SecurityStats,
  PackEntropy,
} from '../types/security';

// Import security modules
import {
  validatePack,
  createPackEntropy,
  generateClientEntropy,
  generateServerEntropy,
} from '../lib/security/pack-validator';
import {
  isBanned,
  checkAutoBanThreshold,
  shouldImmediateBan,
  applyImmediateBan,
} from '../lib/security/ban-system';
import {
  canOpenPack,
  canOpenPremiumPack,
  canOpenBatch,
  recordPackOpen,
  recordPremiumPackOpen,
  recordBatchOpen,
} from '../lib/security/rate-limiter';
import {
  logPackOpen,
  logSecurityEvent,
  logViolation,
  getViolationStats,
  getTopOffenders,
  getLogStats,
} from '../lib/security/audit-logger';
import {
  generateDeviceFingerprint,
  fingerprintsMatch,
} from '../lib/security/utils';

// ============================================================================
// STATE
// ============================================================================

/**
 * Current device fingerprint
 */
export const deviceFingerprint = atom<string | null>(null);

/**
 * Full device fingerprint data
 */
export const fingerprintData = atom<DeviceFingerprint | null>(null);

/**
 * Current ban status
 */
export const banStatus = atom<BanStatus>({ isBanned: false, violationIds: [] });

/**
 * Rate limit status for pack opens
 */
export const packRateLimit = atom<RateLimitStatus>({
  remaining: Infinity,
  resetAt: new Date(),
  isBlocked: false,
});

/**
 * Security violations for current session
 */
export const sessionViolations = atom<SecurityViolation[]>([]);

/**
 * Security stats (computed from audit logs)
 */
export const securityStats = atom<SecurityStats>({
  totalViolations: 0,
  activeBans: 0,
  rateLimitBlocks: 0,
  packValidationFailures: 0,
  topViolationTypes: {
    rate_limit_exceeded: 0,
    pack_manipulation: 0,
    entropy_mismatch: 0,
    duplicate_detection: 0,
    client_tampering: 0,
    suspicious_pattern: 0,
    exploit_attempt: 0,
  },
  averageViolationsPerDay: 0,
});

/**
 * Current pack entropy (for validation)
 */
export const currentEntropy = atom<PackEntropy | null>(null);

/**
 * Security initialized flag
 */
export const securityInitialized = atom<boolean>(false);

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the security system
 */
export async function initSecurity(): Promise<void> {
  if (securityInitialized.get()) {
    return;
  }

  try {
    // Generate device fingerprint
    const fp = await generateDeviceFingerprint();
    fingerprintData.set(fp);
    deviceFingerprint.set(fp.hash);

    // Check ban status
    const banned = isBanned(fp.hash);
    banStatus.set(banned);

    // Update rate limit status
    updateRateLimitStatus();

    // Calculate security stats
    updateSecurityStats();

    securityInitialized.set(true);
  } catch (error) {
    console.error('Failed to initialize security system:', error);
    // Continue without security (fail open)
    securityInitialized.set(true);
  }
}

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Check if user can open a pack
 */
export function checkCanOpenPack(): RateLimitStatus {
  const fp = deviceFingerprint.get();
  if (!fp) {
    return { remaining: 0, resetAt: new Date(), isBlocked: true };
  }

  const status = canOpenPack(fp);
  packRateLimit.set(status);
  return status;
}

/**
 * Check if user can open a premium pack
 */
export function checkCanOpenPremiumPack(): RateLimitStatus {
  const fp = deviceFingerprint.get();
  if (!fp) {
    return { remaining: 0, resetAt: new Date(), isBlocked: true };
  }

  return canOpenPremiumPack(fp);
}

/**
 * Check if user can open a batch
 */
export function checkCanOpenBatch(): RateLimitStatus {
  const fp = deviceFingerprint.get();
  if (!fp) {
    return { remaining: 0, resetAt: new Date(), isBlocked: true };
  }

  return canOpenBatch(fp);
}

/**
 * Update rate limit status in store
 */
function updateRateLimitStatus(): void {
  const status = checkCanOpenPack();
  packRateLimit.set(status);
}

// ============================================================================
// PACK VALIDATION
// ============================================================================

/**
 * Validate a pack before opening
 */
export async function validatePackBeforeOpen(
  pack: Pack,
  existingEntropy?: PackEntropy
): Promise<{ valid: boolean; entropy?: PackEntropy; violation?: SecurityViolation }> {
  const fp = deviceFingerprint.get() || 'unknown';

  // Check ban status first
  const banned = isBanned(fp);
  if (banned.isBanned) {
    return {
      valid: false,
      violation: {
        id: `viol_banned_${Date.now()}`,
        type: 'client_tampering',
        severity: 'critical',
        timestamp: new Date(),
        details: 'User is banned',
        fingerprint: fp,
      },
    };
  }

  // Check rate limits
  const rateLimit = checkCanOpenPack();
  if (rateLimit.isBlocked) {
    const violation: SecurityViolation = {
      id: `viol_ratelimit_${Date.now()}`,
      type: 'rate_limit_exceeded',
      severity: 'medium',
      timestamp: new Date(),
      details: 'Rate limit exceeded for pack opening',
      fingerprint: fp,
    };
    addViolation(violation);
    return { valid: false, violation };
  }

  // Create or use existing entropy
  const entropy = existingEntropy || await createPackEntropy();
  currentEntropy.set(entropy);

  // Validate the pack
  const validationResult = await validatePack(pack, entropy, fp);

  if (!validationResult.valid) {
    // Create violation for validation failure
    const violationType = validationResult.duplicateDetected
      ? 'duplicate_detection'
      : validationResult.anomalies.some((a) => a.includes('Entropy'))
      ? 'entropy_mismatch'
      : 'pack_manipulation';

    const violation: SecurityViolation = {
      id: `viol_validation_${Date.now()}`,
      type: violationType,
      severity: validationResult.duplicateDetected ? 'high' : 'medium',
      timestamp: new Date(),
      details: validationResult.anomalies.join('; '),
      fingerprint: fp,
      metadata: {
        anomalies: validationResult.anomalies,
        entropyVerified: validationResult.entropyVerified,
      },
    };

    addViolation(violation);

    // Check for immediate ban
    if (shouldImmediateBan(violation.type)) {
      applyImmediateBan(fp, violation);
      banStatus.set(isBanned(fp));
    }

    return { valid: false, entropy, violation };
  }

  return { valid: true, entropy };
}

/**
 * Record a successful pack open
 */
export function recordSuccessfulPackOpen(pack: Pack, packType: string): void {
  const fp = deviceFingerprint.get() || 'unknown';

  // Record in rate limiter
  recordPackOpen(fp);

  // Log the event
  logPackOpen(pack.id, packType, fp, {
    cardCount: pack.cards.length,
    bestRarity: pack.bestRarity,
  });

  // Update rate limit status
  updateRateLimitStatus();
}

// ============================================================================
// BAN MANAGEMENT
// ============================================================================

/**
 * Get current ban status
 */
export function getCurrentBanStatus(): BanStatus {
  const fp = deviceFingerprint.get();
  if (!fp) {
    return { isBanned: false, violationIds: [] };
  }

  const status = isBanned(fp);
  banStatus.set(status);
  return status;
}

/**
 * Add a violation to the session
 */
export function addViolation(violation: SecurityViolation): void {
  const violations = sessionViolations.get();
  violations.push(violation);
  sessionViolations.set(violations);

  // Log the violation
  logViolation(violation);

  // Check for auto-ban threshold
  const fp = deviceFingerprint.get() || 'unknown';
  const banResult = checkAutoBanThreshold(fp, violations);

  if (banResult && banResult.isBanned) {
    banStatus.set(banResult);
    logSecurityEvent({
      type: 'ban_applied',
      timestamp: new Date(),
      fingerprint: fp,
      data: {
        reason: banResult.reason,
        violationIds: banResult.violationIds,
      },
    });
  }

  // Update security stats
  updateSecurityStats();
}

/**
 * Clear session violations
 */
export function clearSessionViolations(): void {
  sessionViolations.set([]);
}

// ============================================================================
// SECURITY STATS
// ============================================================================

/**
 * Update security stats from audit logs
 */
function updateSecurityStats(): void {
  const violationStats = getViolationStats();
  const logStats = getLogStats();
  const topOffenders = getTopOffenders(5);

  securityStats.set({
    totalViolations: violationStats.total,
    activeBans: topOffenders.length,
    rateLimitBlocks: violationStats.byType['rate_limit_exceeded'] || 0,
    packValidationFailures:
      (violationStats.byType['pack_manipulation'] || 0) +
      (violationStats.byType['entropy_mismatch'] || 0) +
      (violationStats.byType['duplicate_detection'] || 0),
    topViolationTypes: violationStats.byType as SecurityStats['topViolationTypes'],
    averageViolationsPerDay: logStats.averageEntriesPerDay,
  });
}

/**
 * Get current security stats
 */
export function getSecurityStats(): SecurityStats {
  return securityStats.get();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if the current user is banned
 */
export function isCurrentUserBanned(): boolean {
  const status = banStatus.get();
  return status.isBanned;
}

/**
 * Get the current device fingerprint hash
 */
export function getFingerprint(): string | null {
  return deviceFingerprint.get();
}

/**
 * Get full device fingerprint data
 */
export function getFingerprintData(): DeviceFingerprint | null {
  return fingerprintData.get();
}

/**
 * Regenerate device fingerprint (for testing/admin)
 */
export async function regenerateFingerprint(): Promise<string> {
  const fp = await generateDeviceFingerprint();
  fingerprintData.set(fp);
  deviceFingerprint.set(fp.hash);
  return fp.hash;
}

/**
 * Check if two fingerprints match
 */
export function compareFingerprints(fp1: string, fp2: string): boolean {
  return fingerprintsMatch(fp1, fp2);
}

// ============================================================================
// EXPORT SECURITY MODULE
// ============================================================================

/**
 * Security module export for easy access
 */
export const security = {
  // Initialization
  init: initSecurity,

  // Rate limiting
  canOpenPack: checkCanOpenPack,
  canOpenPremiumPack: checkCanOpenPremiumPack,
  canOpenBatch: checkCanOpenBatch,

  // Pack validation
  validatePack: validatePackBeforeOpen,
  recordPackOpen: recordSuccessfulPackOpen,

  // Ban management
  isBanned: isCurrentUserBanned,
  getBanStatus: getCurrentBanStatus,
  addViolation,
  clearViolations: clearSessionViolations,

  // Stats
  getStats: getSecurityStats,

  // Fingerprint
  getFingerprint,
  getFingerprintData,
  regenerateFingerprint,
  compareFingerprints,
};

// Direct exports for convenience
export const getBanStatus = getCurrentBanStatus;
