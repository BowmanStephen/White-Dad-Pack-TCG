/**
 * Security and Anti-Cheat Types
 *
 * This module defines the core types for the security system including:
 * - Rate limiting
 * - Pack validation
 * - Audit logging
 * - Ban system
 * - Entropy verification
 */

/**
 * Security violation severity levels
 */
export type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Types of security violations
 */
export type ViolationType =
  | 'rate_limit_exceeded'
  | 'pack_manipulation'
  | 'entropy_mismatch'
  | 'duplicate_detection'
  | 'client_tampering'
  | 'suspicious_pattern'
  | 'exploit_attempt';

/**
 * A security violation record
 */
export interface SecurityViolation {
  id: string;
  type: ViolationType;
  severity: ViolationSeverity;
  timestamp: Date;
  details: string;
  metadata?: Record<string, unknown>;
  fingerprint: string; // Browser/device fingerprint
}

/**
 * Ban status for a user/device
 */
export interface BanStatus {
  isBanned: boolean;
  reason?: string;
  expiresAt?: Date;
  permanent: boolean;
  violationIds: string[];
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRequests: number; // Maximum requests allowed
  windowMs: number; // Time window in milliseconds
  burstAllowed: number; // Allow brief bursts above limit
}

/**
 * Rate limit status for a user
 */
export interface RateLimitStatus {
  remaining: number;
  resetAt: Date;
  isBlocked: boolean;
  retryAfter?: number; // Seconds until retry allowed
}

/**
 * Pack validation result
 */
export interface PackValidationResult {
  valid: boolean;
  entropyVerified: boolean;
  duplicateDetected: boolean;
  anomalies: string[];
  serverSeed?: string;
  clientSeed?: string;
}

/**
 * Entropy data for pack verification
 */
export interface PackEntropy {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  hash: string; // Hash of combined seeds
  timestamp: Date;
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  userId?: string;
  fingerprint: string;
  details: Record<string, unknown>;
  severity: ViolationSeverity;
}

/**
 * Security event for monitoring
 */
export interface SecurityEvent {
  type: 'pack_open' | 'pack_validation' | 'violation_detected' | 'ban_applied' | 'ban_removed';
  timestamp: Date;
  fingerprint: string;
  data: Record<string, unknown>;
}

/**
 * Fingerprint data for device identification
 */
export interface DeviceFingerprint {
  browser: string;
  os: string;
  screen: string;
  timezone: string;
  language: string;
  canvas: string;
  webgl: string;
  audio: string;
  hash: string;
}

/**
 * Security configuration
 */
export interface SecurityConfig {
  rateLimiting: {
    packOpens: RateLimitConfig;
    batchOpens: RateLimitConfig;
    apiCalls: RateLimitConfig;
  };
  entropy: {
    enabled: boolean;
    rotationInterval: number; // How often to rotate seeds (ms)
    hashAlgorithm: 'SHA-256' | 'SHA-512';
  };
  violations: {
    maxLowSeverity: number; // Max low-severity before action
    maxMediumSeverity: number;
    maxHighSeverity: number;
    criticalThreshold: number; // Auto-ban on critical
  };
  bans: {
    defaultDuration: number; // Default ban duration in ms
    maxPermanentViolations: number; // Violations before permanent ban
  };
}

/**
 * Security stats for monitoring
 */
export interface SecurityStats {
  totalViolations: number;
  activeBans: number;
  rateLimitBlocks: number;
  packValidationFailures: number;
  topViolationTypes: Record<ViolationType, number>;
  averageViolationsPerDay: number;
}
