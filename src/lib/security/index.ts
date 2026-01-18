/**
 * Security Module
 *
 * Comprehensive anti-cheat and security system for DadDeck TCG.
 *
 * Features:
 * - Rate limiting on pack opens
 * - Pack validation with entropy verification
 * - Duplicate detection for exploits
 * - Audit logging for security events
 * - Ban system for cheaters
 * - Device fingerprinting
 *
 * @module lib/security
 */

// ============================================================================
// Types
// ============================================================================

export * from '../../types/security';

// ============================================================================
// Pack Validation
// ============================================================================

export {
  validatePack,
  hashPackData,
  generateServerEntropy,
  generateClientEntropy,
  createEntropyHash,
  validatePackEntropy,
  detectDuplicatePack,
  validateRarityDistribution,
  validateCardIntegrity,
  createPackEntropy,
  shouldRotateEntropy,
} from './pack-validator';

// ============================================================================
// Rate Limiting
// ============================================================================

export {
  checkRateLimit,
  recordRequest,
  resetRateLimit,
  getRateLimitStatus,
  checkMultipleRateLimits,
  canOpenPack,
  recordPackOpen,
  canOpenPremiumPack,
  recordPremiumPackOpen,
  canOpenBatch,
  recordBatchOpen,
  getRateLimitStats,
  clearAllRateLimits,
} from './rate-limiter';

// ============================================================================
// Audit Logging
// ============================================================================

export {
  initAuditLogger,
  createAuditLog,
  logSecurityEvent,
  logViolation,
  logPackOpen,
  logBanApplied,
  logBanRemoved,
  logSuspiciousActivity,
  getRecentLogs,
  getLogsBySeverity,
  getLogsByAction,
  getLogsByFingerprint,
  getLogsByDateRange,
  getViolationStats,
  getTopOffenders,
  clearAuditLogs,
  exportLogs,
  importLogs,
  getLogStats,
} from './audit-logger';

// ============================================================================
// Ban System
// ============================================================================

export {
  initBanSystem,
  isBanned,
  ban,
  unban,
  checkAutoBanThreshold,
  getActiveBans,
  getBanStats,
  clearAllBans,
  getBanHistory,
  shouldImmediateBan,
  applyImmediateBan,
} from './ban-system';

// ============================================================================
// Utilities
// ============================================================================

export {
  createSecurityViolation,
  generateDeviceFingerprint,
  fingerprintsMatch,
  sanitizeInput,
  escapeHtml,
  filterProfanity,
  sanitizeProfileName,
  isValidPackId,
  generateRateLimitKey,
  getSecondsUntil,
  isPast,
  formatDate,
  parseDate,
  deepClone,
  shallowMerge,
} from './utils';
