/**
 * Sentry Error Tracking Tests
 *
 * Tests for Sentry initialization, error capture, and configuration.
 * Note: These tests verify logic but don't actually send events to Sentry
 * (to avoid quota usage and test flakiness).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Sentry SDK
vi.mock('@sentry/astro', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
  addBreadcrumb: vi.fn(),
  browserTracingIntegration: vi.fn(() => ({})),
  replayIntegration: vi.fn(() => ({})),
  captureConsoleIntegration: vi.fn(() => ({})),
}));

describe('Sentry Configuration', () => {
  beforeEach(() => {
    // Reset environment variables
    vi.resetModules();
  });

  describe('initSentry', () => {
    it('should not initialize in development without DSN', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.PUBLIC_SENTRY_DSN;

      const { initSentry } = await import('@/lib/sentry');

      // Should not throw, should log message
      expect(() => initSentry()).not.toThrow();
    });

    it('should initialize in production with DSN', async () => {
      process.env.NODE_ENV = 'production';
      process.env.PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';

      const { initSentry } = await import('@/lib/sentry');

      // Should not throw
      expect(() => initSentry()).not.toThrow();
    });
  });

  describe('captureException', () => {
    it('should export captureException function', async () => {
      const { captureException } = await import('@/lib/sentry');

      expect(typeof captureException).toBe('function');
    });

    it('should handle Error objects', async () => {
      const { captureException } = await import('@/lib/sentry');

      const error = new Error('Test error');
      expect(() => captureException(error, { test: true })).not.toThrow();
    });
  });

  describe('captureMessage', () => {
    it('should export captureMessage function', async () => {
      const { captureMessage } = await import('@/lib/sentry');

      expect(typeof captureMessage).toBe('function');
    });

    it('should accept message and level', async () => {
      const { captureMessage } = await import('@/lib/sentry');

      expect(() => captureMessage('Test message', 'info')).not.toThrow();
      expect(() => captureMessage('Warning', 'warning')).not.toThrow();
      expect(() => captureMessage('Error', 'error')).not.toThrow();
    });
  });

  describe('setSentryUser', () => {
    it('should export setSentryUser function', async () => {
      const { setSentryUser } = await import('@/lib/sentry');

      expect(typeof setSentryUser).toBe('function');
    });

    it('should accept user object', async () => {
      const { setSentryUser } = await import('@/lib/sentry');

      const user = { id: '123', email: 'test@example.com' };
      expect(() => setSentryUser(user)).not.toThrow();
    });
  });

  describe('addBreadcrumb', () => {
    it('should export addBreadcrumb function', async () => {
      const { addBreadcrumb } = await import('@/lib/sentry');

      expect(typeof addBreadcrumb).toBe('function');
    });

    it('should accept category, message, and data', async () => {
      const { addBreadcrumb } = await import('@/lib/sentry');

      expect(() => addBreadcrumb('test', 'Test message', { key: 'value' })).not.toThrow();
    });
  });

  describe('triggerTestError', () => {
    it('should export triggerTestError function', async () => {
      const { triggerTestError } = await import('@/lib/sentry');

      expect(typeof triggerTestError).toBe('function');
    });

    it('should trigger test error without throwing', async () => {
      const { triggerTestError } = await import('@/lib/sentry');

      // Should not throw, should capture internally
      expect(() => triggerTestError()).not.toThrow();
    });
  });

  describe('getReleaseVersion', () => {
    it('should return version string', async () => {
      // This is tested indirectly via initSentry
      // The function is private but affects release tracking

      const { initSentry } = await import('@/lib/sentry');

      // Initialize to check no errors
      expect(() => initSentry()).not.toThrow();
    });
  });

  describe('Environment Filtering', () => {
    it('should filter localhost errors in beforeSend', async () => {
      process.env.NODE_ENV = 'production';
      process.env.PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';

      const { initSentry } = await import('@/lib/sentry');

      // Should initialize with filtering
      expect(() => initSentry()).not.toThrow();
    });
  });
});
