/**
 * Client-Side Rate Limiter
 *
 * Implements a sliding window rate limiting algorithm to prevent
 * excessive pack opening attempts and ensure fair usage.
 *
 * SEC-002: Max 10 packs per minute with cooldown timer
 *
 * @example
 * ```typescript
 * import { checkRateLimit, recordPackOpen, getRateLimitStatus } from './rate-limiter';
 *
 * // Check if user can open a pack
 * const status = getRateLimitStatus();
 * if (!status.isBlocked) {
 *   await openNewPack();
 *   recordPackOpen();
 * }
 * ```
 */

import type { RateLimitConfig, RateLimitStatus } from '@/types/security';

/**
 * Rate limit configuration for pack opening
 * SEC-002: Max 10 packs per minute
 */
const PACK_OPEN_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
  burstAllowed: 2, // Allow brief bursts up to 12 packs
};

/**
 * Storage key for rate limit data in localStorage
 */
const RATE_LIMIT_STORAGE_KEY = 'daddeck-rate-limit';

/**
 * Interface for rate limit data stored in localStorage
 */
interface RateLimitData {
  timestamps: number[]; // Timestamps of pack open attempts
  windowStart: number; // Start of current window
}

/**
 * Get rate limit data from localStorage
 */
function getRateLimitData(): RateLimitData {
  if (typeof window === 'undefined') {
    return { timestamps: [], windowStart: Date.now() };
  }

  try {
    const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to read rate limit data from localStorage:', error);
  }

  return { timestamps: [], windowStart: Date.now() };
}

/**
 * Save rate limit data to localStorage
 */
function saveRateLimitData(data: RateLimitData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save rate limit data to localStorage:', error);
  }
}

/**
 * Clean up old timestamps outside the current window
 *
 * @param data - Rate limit data
 * @param now - Current timestamp
 * @returns Cleaned data with only recent timestamps
 */
function cleanOldTimestamps(data: RateLimitData, now: number): RateLimitData {
  const windowEnd = data.windowStart + PACK_OPEN_CONFIG.windowMs;

  // If window has expired, start fresh
  if (now >= windowEnd) {
    return {
      timestamps: [],
      windowStart: now,
    };
  }

  // Remove timestamps outside the current window
  const validTimestamps = data.timestamps.filter(
    (timestamp) => timestamp >= data.windowStart && timestamp < windowEnd
  );

  return {
    ...data,
    timestamps: validTimestamps,
  };
}

/**
 * Get current rate limit status
 *
 * Returns remaining requests, reset time, and block status
 *
 * @returns Rate limit status
 */
export function getRateLimitStatus(): RateLimitStatus {
  const now = Date.now();
  let data = getRateLimitData();

  // Clean up old timestamps
  data = cleanOldTimestamps(data, now);

  const requestCount = data.timestamps.length;
  const remaining = Math.max(0, PACK_OPEN_CONFIG.maxRequests - requestCount);
  const resetAt = new Date(data.windowStart + PACK_OPEN_CONFIG.windowMs);
  const isBlocked = requestCount >= PACK_OPEN_CONFIG.maxRequests;

  return {
    remaining,
    resetAt,
    isBlocked,
    retryAfter: isBlocked ? Math.ceil((resetAt.getTime() - now) / 1000) : undefined,
  };
}

/**
 * Check if a pack open is allowed under rate limits
 *
 * @returns Object with allowed flag and optional error message
 */
export function checkRateLimit(): { allowed: boolean; error?: string; retryAfter?: number } {
  const status = getRateLimitStatus();

  if (status.isBlocked) {
    return {
      allowed: false,
      error: `Rate limit exceeded. Please wait ${status.retryAfter} seconds before opening more packs.`,
      retryAfter: status.retryAfter,
    };
  }

  // Check burst limit (allow brief bursts above maxRequests)
  const data = getRateLimitData();
  const burstExceeded =
    data.timestamps.length > PACK_OPEN_CONFIG.maxRequests + PACK_OPEN_CONFIG.burstAllowed;

  if (burstExceeded) {
    return {
      allowed: false,
      error: `Too many pack opens in quick succession. Please slow down.`,
      retryAfter: status.retryAfter,
    };
  }

  return { allowed: true };
}

/**
 * Record a pack open attempt
 *
 * Should be called after a successful pack open to update rate limit state
 */
export function recordPackOpen(): void {
  const now = Date.now();
  let data = getRateLimitData();

  // Clean up old timestamps first
  data = cleanOldTimestamps(data, now);

  // Add current timestamp
  data.timestamps.push(now);

  // Save updated data
  saveRateLimitData(data);
}

/**
 * Reset rate limit data
 *
 * Clears all rate limit state (useful for testing or admin actions)
 */
export function resetRateLimit(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to reset rate limit data:', error);
  }
}

/**
 * Get rate limit configuration
 *
 * Returns the current rate limit settings
 *
 * @returns Rate limit configuration
 */
export function getRateLimitConfig(): RateLimitConfig {
  return { ...PACK_OPEN_CONFIG };
}
