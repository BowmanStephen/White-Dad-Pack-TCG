/**
 * Rate Limiter Tests
 *
 * SEC-002: Client-side rate limiting for pack generation
 * Tests the sliding window algorithm and edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  recordPackOpen,
  getRateLimitStatus,
  resetRateLimit,
  getRateLimitConfig,
} from '@/lib/utils/rate-limiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Note: The setup file (tests/setup.ts) already clears localStorage
    // in its beforeEach hook, so we don't need to do it here
    // We just need to clear the rate limit data directly
    const resetKey = () => {
      try {
        global.localStorage?.removeItem('daddeck-rate-limit');
      } catch {
        // Ignore if localStorage not available
      }
    };
    resetKey();
  });

  describe('getRateLimitConfig', () => {
    it('should return correct configuration', () => {
      const config = getRateLimitConfig();

      expect(config.maxRequests).toBe(10);
      expect(config.windowMs).toBe(60 * 1000); // 1 minute
      expect(config.burstAllowed).toBe(2);
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return initial status with 10 remaining', () => {
      const status = getRateLimitStatus();

      expect(status.remaining).toBe(10);
      expect(status.isBlocked).toBe(false);
      expect(status.resetAt).toBeInstanceOf(Date);
      expect(status.retryAfter).toBeUndefined();
    });

    it('should decrease remaining after recording pack opens', () => {
      // Record 3 pack opens
      recordPackOpen();
      recordPackOpen();
      recordPackOpen();

      const status = getRateLimitStatus();

      expect(status.remaining).toBe(7);
      expect(status.isBlocked).toBe(false);
    });

    it('should block after 10 pack opens', () => {
      // Record 10 pack opens
      for (let i = 0; i < 10; i++) {
        recordPackOpen();
      }

      const status = getRateLimitStatus();

      expect(status.remaining).toBe(0);
      expect(status.isBlocked).toBe(true);
      expect(status.retryAfter).toBeDefined();
      expect(status.retryAfter).toBeGreaterThan(0);
      expect(status.retryAfter).toBeLessThanOrEqual(60);
    });

    it('should allow burst up to 12 pack opens', () => {
      // Record 12 pack opens (10 + 2 burst)
      for (let i = 0; i < 12; i++) {
        recordPackOpen();
      }

      const status = getRateLimitStatus();

      expect(status.remaining).toBe(0);
      expect(status.isBlocked).toBe(true);
    });

    it('should reset after window expires', () => {
      // Record 10 pack opens
      for (let i = 0; i < 10; i++) {
        recordPackOpen();
      }

      // Mock expired window by manipulating localStorage directly
      const oldData = JSON.parse(global.localStorage.getItem('daddeck-rate-limit') || '{}');
      oldData.windowStart = Date.now() - 61 * 1000; // 61 seconds ago
      global.localStorage.setItem('daddeck-rate-limit', JSON.stringify(oldData));

      const status = getRateLimitStatus();

      expect(status.remaining).toBe(10);
      expect(status.isBlocked).toBe(false);
    });
  });

  describe('checkRateLimit', () => {
    it('should allow pack opens when under limit', () => {
      const result = checkRateLimit();

      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.retryAfter).toBeUndefined();
    });

    it('should allow pack opens up to the limit', () => {
      // Record 9 pack opens
      for (let i = 0; i < 9; i++) {
        recordPackOpen();
      }

      const result = checkRateLimit();

      expect(result.allowed).toBe(true);
    });

    it('should block pack opens at the limit', () => {
      // Record 10 pack opens
      for (let i = 0; i < 10; i++) {
        recordPackOpen();
      }

      const result = checkRateLimit();

      expect(result.allowed).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.retryAfter).toBeDefined();
      expect(result.error).toContain('Rate limit exceeded');
    });

    it('should block pack opens beyond burst limit', () => {
      // Record 13 pack opens (beyond burst of 12)
      for (let i = 0; i < 13; i++) {
        recordPackOpen();
      }

      const result = checkRateLimit();

      expect(result.allowed).toBe(false);
      expect(result.error).toContain('Too many pack opens');
    });

    it('should provide accurate retry time', () => {
      // Record 10 pack opens
      for (let i = 0; i < 10; i++) {
        recordPackOpen();
      }

      const result = checkRateLimit();
      const status = getRateLimitStatus();

      expect(result.retryAfter).toBe(status.retryAfter);
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.retryAfter).toBeLessThanOrEqual(60);
    });
  });

  describe('recordPackOpen', () => {
    it('should increment pack count', () => {
      recordPackOpen();

      const status = getRateLimitStatus();
      expect(status.remaining).toBe(9);
    });

    it('should persist to localStorage', () => {
      recordPackOpen();

      const stored = global.localStorage.getItem('daddeck-rate-limit');
      expect(stored).toBeDefined();

      const data = JSON.parse(stored || '{}');
      expect(data.timestamps).toHaveLength(1);
      expect(data.timestamps[0]).toBeGreaterThan(0);
    });

    it('should clean up old timestamps', () => {
      // Record a pack open
      recordPackOpen();

      // Manipulate localStorage to add old timestamp
      const oldData = JSON.parse(global.localStorage.getItem('daddeck-rate-limit') || '{}');
      oldData.timestamps.push(Date.now() - 61 * 1000); // 61 seconds ago
      global.localStorage.setItem('daddeck-rate-limit', JSON.stringify(oldData));

      // Record another pack open
      recordPackOpen();

      const status = getRateLimitStatus();
      expect(status.remaining).toBe(9); // Only 1 recent pack recorded
    });
  });

  describe('resetRateLimit', () => {
    it('should clear all rate limit data', () => {
      // Record some pack opens
      recordPackOpen();
      recordPackOpen();
      recordPackOpen();

      // Reset
      resetRateLimit();

      const status = getRateLimitStatus();
      expect(status.remaining).toBe(10);
      expect(status.isBlocked).toBe(false);

      const stored = global.localStorage.getItem('daddeck-rate-limit');
      expect(stored).toBeNull();
    });
  });

  describe('sliding window behavior', () => {
    it('should correctly track time-based windows', async () => {
      // Record 5 pack opens
      for (let i = 0; i < 5; i++) {
        recordPackOpen();
      }

      let status = getRateLimitStatus();
      expect(status.remaining).toBe(5);

      // Wait and record 3 more
      await new Promise((resolve) => setTimeout(resolve, 100));

      for (let i = 0; i < 3; i++) {
        recordPackOpen();
      }

      status = getRateLimitStatus();
      expect(status.remaining).toBe(2);
    });

    it('should handle rapid successive opens', () => {
      // Record 10 pack opens rapidly
      for (let i = 0; i < 10; i++) {
        recordPackOpen();
      }

      const status = getRateLimitStatus();
      expect(status.remaining).toBe(0);
      expect(status.isBlocked).toBe(true);
    });
  });

  describe('edge cases', () => {

    it('should handle corrupted localStorage data', () => {
      // Set corrupted data
      global.localStorage.setItem('daddeck-rate-limit', 'invalid-json');

      // Should not throw error
      const status = getRateLimitStatus();
      expect(status.remaining).toBe(10);
    });

    it('should handle missing timestamps', () => {
      // Set data with missing timestamps
      global.localStorage.setItem('daddeck-rate-limit', JSON.stringify({
        timestamps: [],
        windowStart: Date.now(),
      }));

      const status = getRateLimitStatus();
      expect(status.remaining).toBe(10);
    });

    it('should handle undefined window', () => {
      // Set data without windowStart
      global.localStorage.setItem('daddeck-rate-limit', JSON.stringify({
        timestamps: [Date.now()],
      }));

      const status = getRateLimitStatus();
      expect(status.remaining).toBeDefined();
    });
  });
});
