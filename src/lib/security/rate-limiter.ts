/**
 * Rate Limiting System
 *
 * Prevents abuse by limiting the frequency of actions:
 * - Pack opening (standard and premium)
 * - Batch pack opening
 * - API calls
 *
 * Uses a sliding window algorithm with LocalStorage persistence.
 */

import type { RateLimitConfig, RateLimitStatus } from '../../types/security';
import { getSecondsUntil, generateRateLimitKey } from './utils';

/**
 * Rate limit bucket tracking requests within a time window
 */
interface RateLimitBucket {
  count: number;
  windowStart: number; // Timestamp
  burstCount: number; // Allow brief bursts above limit
}

/**
 * Default rate limit configurations
 */
export const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  pack_open: {
    maxRequests: 60, // 60 packs per minute
    windowMs: 60000, // 1 minute
    burstAllowed: 10, // Allow brief bursts of 10 over limit
  },
  premium_pack_open: {
    maxRequests: 10, // 10 premium packs per hour
    windowMs: 3600000, // 1 hour
    burstAllowed: 2,
  },
  batch_open: {
    maxRequests: 5, // 5 batch operations per hour
    windowMs: 3600000,
    burstAllowed: 1,
  },
  api_call: {
    maxRequests: 100, // 100 API calls per minute
    windowMs: 60000,
    burstAllowed: 20,
  },
};

/**
 * In-memory bucket cache for performance
 * Falls back to localStorage for persistence
 */
const bucketCache: Map<string, RateLimitBucket> = new Map();

/**
 * Storage key prefix
 */
const STORAGE_PREFIX = 'security_ratelimit_';

/**
 * Get or create a rate limit bucket for an identifier
 */
function getBucket(key: string): RateLimitBucket {
  // Check memory cache first
  const cached = bucketCache.get(key);
  if (cached) {
    // Check if window has expired
    const now = Date.now();
    if (now - cached.windowStart < 86400000) { // 24 hours
      return cached;
    }
    // Expired, remove from cache
    bucketCache.delete(key);
  }

  // Try to load from localStorage
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (stored) {
      const parsed = JSON.parse(stored) as RateLimitBucket;
      bucketCache.set(key, parsed);
      return parsed;
    }
  } catch {
    // localStorage not available or corrupted
  }

  // Create new bucket
  const bucket: RateLimitBucket = {
    count: 0,
    windowStart: Date.now(),
    burstCount: 0,
  };
  bucketCache.set(key, bucket);
  saveBucket(key, bucket);
  return bucket;
}

/**
 * Save a bucket to localStorage
 */
function saveBucket(key: string, bucket: RateLimitBucket): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(bucket));
  } catch {
    // localStorage full or not available
  }
}

/**
 * Clean up expired buckets from memory
 */
function cleanupExpiredBuckets(): void {
  const now = Date.now();
  for (const [key, bucket] of bucketCache.entries()) {
    if (now - bucket.windowStart > 86400000) { // 24 hours
      bucketCache.delete(key);
      try {
        localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      } catch {
        // Ignore storage errors
      }
    }
  }
}

/**
 * Check if a request is allowed under rate limits
 *
 * @param action - The action type (e.g., 'pack_open')
 * @param identifier - Unique identifier (e.g., fingerprint, user ID)
 * @param config - Optional custom rate limit config
 * @returns Rate limit status
 */
export function checkRateLimit(
  action: string,
  identifier: string,
  config?: RateLimitConfig
): RateLimitStatus {
  // Get configuration (use default if not provided)
  const limitConfig = config || DEFAULT_RATE_LIMITS[action];
  if (!limitConfig) {
    // No rate limiting configured for this action
    return {
      remaining: Infinity,
      resetAt: new Date(Date.now() + limitConfig?.windowMs || 60000),
      isBlocked: false,
    };
  }

  const key = generateRateLimitKey(action, identifier);
  const bucket = getBucket(key);
  const now = Date.now();

  // Check if window has expired
  const windowElapsed = now - bucket.windowStart;
  if (windowElapsed > limitConfig.windowMs) {
    // Reset for new window
    bucket.count = 0;
    bucket.burstCount = 0;
    bucket.windowStart = now;
  }

  // Calculate remaining requests
  const totalLimit = limitConfig.maxRequests + limitConfig.burstAllowed;
  const remaining = Math.max(0, totalLimit - bucket.count);

  // Check if blocked
  const isBlocked = bucket.count >= limitConfig.maxRequests;

  // Calculate reset time
  const windowEnd = bucket.windowStart + limitConfig.windowMs;
  const resetAt = new Date(windowEnd);

  return {
    remaining,
    resetAt,
    isBlocked,
    retryAfter: isBlocked ? getSecondsUntil(resetAt) : undefined,
  };
}

/**
 * Record a request (increment counter)
 *
 * @param action - The action type
 * @param identifier - Unique identifier
 * @returns true if request was recorded, false if blocked
 */
export function recordRequest(action: string, identifier: string): boolean {
  const status = checkRateLimit(action, identifier);

  if (status.isBlocked) {
    return false;
  }

  const key = generateRateLimitKey(action, identifier);
  const bucket = getBucket(key);
  bucket.count++;
  saveBucket(key, bucket);

  // Periodic cleanup
  if (bucket.count % 10 === 0) {
    cleanupExpiredBuckets();
  }

  return true;
}

/**
 * Reset rate limit for an identifier (admin function)
 *
 * @param action - The action type
 * @param identifier - Unique identifier
 */
export function resetRateLimit(action: string, identifier: string): void {
  const key = generateRateLimitKey(action, identifier);
  bucketCache.delete(key);
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get current rate limit status without recording
 *
 * @param action - The action type
 * @param identifier - Unique identifier
 * @returns Rate limit status
 */
export function getRateLimitStatus(
  action: string,
  identifier: string
): RateLimitStatus {
  return checkRateLimit(action, identifier);
}

/**
 * Check if multiple actions are allowed
 *
 * @param checks - Array of {action, identifier} pairs
 * @returns Array of rate limit statuses
 */
export function checkMultipleRateLimits(
  checks: Array<{ action: string; identifier: string }>
): RateLimitStatus[] {
  return checks.map((check) => checkRateLimit(check.action, check.identifier));
}

/**
 * Check pack opening rate limit
 */
export function canOpenPack(identifier: string): RateLimitStatus {
  return checkRateLimit('pack_open', identifier);
}

/**
 * Record a pack opening
 */
export function recordPackOpen(identifier: string): boolean {
  return recordRequest('pack_open', identifier);
}

/**
 * Check premium pack opening rate limit
 */
export function canOpenPremiumPack(identifier: string): RateLimitStatus {
  return checkRateLimit('premium_pack_open', identifier);
}

/**
 * Record a premium pack opening
 */
export function recordPremiumPackOpen(identifier: string): boolean {
  return recordRequest('premium_pack_open', identifier);
}

/**
 * Check batch opening rate limit
 */
export function canOpenBatch(identifier: string): RateLimitStatus {
  return checkRateLimit('batch_open', identifier);
}

/**
 * Record a batch opening
 */
export function recordBatchOpen(identifier: string): boolean {
  return recordRequest('batch_open', identifier);
}

/**
 * Get all rate limit stats for monitoring
 */
export function getRateLimitStats(identifier: string): {
  packOpens: RateLimitStatus;
  premiumPackOpens: RateLimitStatus;
  batchOpens: RateLimitStatus;
  apiCalls: RateLimitStatus;
} {
  return {
    packOpens: checkRateLimit('pack_open', identifier),
    premiumPackOpens: checkRateLimit('premium_pack_open', identifier),
    batchOpens: checkRateLimit('batch_open', identifier),
    apiCalls: checkRateLimit('api_call', identifier),
  };
}

/**
 * Clear all rate limit data (for testing/admin)
 */
export function clearAllRateLimits(): void {
  bucketCache.clear();
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore storage errors
  }
}
