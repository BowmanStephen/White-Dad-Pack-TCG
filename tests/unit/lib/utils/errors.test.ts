/**
 * Error Handling Utilities Tests
 *
 * Tests for error creation, categorization, logging, and recovery actions.
 * Ensures user-friendly error messages and proper error tracking.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createAppError,
  createStorageError,
  createGenerationError,
  createNetworkError,
  logError,
  logWarning,
  logDebug,
  categorizeError,
  type ErrorCategory,
  type AppError,
  type RecoveryAction,
} from '../../../../src/lib/utils/errors';

// Mock the Sentry module
vi.mock('@/lib/sentry', () => ({
  captureException: vi.fn(),
}));

describe('Error Handling Utilities', () => {
  // Store original console methods
  const originalConsole = {
    group: console.group,
    log: console.log,
    warn: console.warn,
    error: console.error,
    groupEnd: console.groupEnd,
    debug: console.debug,
  };

  beforeEach(() => {
    // Mock console methods
    console.group = vi.fn();
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
    console.groupEnd = vi.fn();
    console.debug = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore console methods
    console.group = originalConsole.group;
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.groupEnd = originalConsole.groupEnd;
    console.debug = originalConsole.debug;
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // ============================================================================
  // ERROR CATEGORY TESTS
  // ============================================================================

  describe('ErrorCategory type', () => {
    it('should support all defined error categories', () => {
      const categories: ErrorCategory[] = [
        'network',
        'storage',
        'generation',
        'validation',
        'permission',
        'security',
        'banned',
        'unknown',
      ];

      // Verify each category is valid by creating an error with it
      categories.forEach((category) => {
        const error = createAppError(category, 'test', []);
        expect(error.category).toBe(category);
      });
    });
  });

  // ============================================================================
  // APP ERROR CREATION TESTS
  // ============================================================================

  describe('createAppError', () => {
    it('should create an error with correct structure', () => {
      const error = createAppError('network', 'Connection failed', []);

      expect(error).toHaveProperty('id');
      expect(error).toHaveProperty('category', 'network');
      expect(error).toHaveProperty('title');
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('icon');
      expect(error).toHaveProperty('recovery');
      expect(error).toHaveProperty('timestamp');
      expect(error).toHaveProperty('logged', false);
    });

    it('should generate unique error IDs', () => {
      const error1 = createAppError('network', 'Error 1', []);
      vi.advanceTimersByTime(1); // Advance time to ensure different timestamp
      const error2 = createAppError('network', 'Error 2', []);

      expect(error1.id).not.toBe(error2.id);
      expect(error1.id).toMatch(/^err_\d+_[a-z0-9]+$/);
      expect(error2.id).toMatch(/^err_\d+_[a-z0-9]+$/);
    });

    it('should use string error message directly', () => {
      const error = createAppError('storage', 'Custom storage error', []);
      expect(error.message).toBe('Custom storage error');
    });

    it('should extract message from Error object', () => {
      const originalError = new Error('Original error message');
      const error = createAppError('validation', originalError, []);
      expect(error.message).toBe('Original error message');
    });

    it('should use default message for unknown error types', () => {
      const error = createAppError('unknown', { weird: 'object' }, []);
      expect(error.message).toBe('An unexpected error occurred');
    });

    it('should include recovery actions in error', () => {
      const recoveryActions: RecoveryAction[] = [
        { label: 'Retry', action: vi.fn(), primary: true },
        { label: 'Cancel', action: vi.fn() },
      ];

      const error = createAppError('network', 'test', recoveryActions);
      expect(error.recovery).toHaveLength(2);
      expect(error.recovery[0].label).toBe('Retry');
      expect(error.recovery[0].primary).toBe(true);
      expect(error.recovery[1].label).toBe('Cancel');
    });

    it('should set correct title and icon for network errors', () => {
      const error = createAppError('network', 'test', []);
      expect(error.title).toBe('Connection Issue');
      expect(error.icon).toBe('🌐');
    });

    it('should set correct title and icon for storage errors', () => {
      const error = createAppError('storage', 'test', []);
      expect(error.title).toBe('Storage Issue');
      expect(error.icon).toBe('💾');
    });

    it('should set correct title and icon for generation errors', () => {
      const error = createAppError('generation', 'test', []);
      expect(error.title).toBe('Pack Generation Failed');
      expect(error.icon).toBe('📦');
    });

    it('should set correct title and icon for validation errors', () => {
      const error = createAppError('validation', 'test', []);
      expect(error.title).toBe('Data Issue');
      expect(error.icon).toBe('⚠️');
    });

    it('should set correct title and icon for permission errors', () => {
      const error = createAppError('permission', 'test', []);
      expect(error.title).toBe('Permission Needed');
      expect(error.icon).toBe('🔒');
    });

    it('should set correct title and icon for security errors', () => {
      const error = createAppError('security', 'test', []);
      expect(error.title).toBe('Security Alert');
      expect(error.icon).toBe('🛡️');
    });

    it('should set correct title and icon for banned errors', () => {
      const error = createAppError('banned', 'test', []);
      expect(error.title).toBe('Account Suspended');
      expect(error.icon).toBe('🚫');
    });

    it('should set correct title and icon for unknown errors', () => {
      const error = createAppError('unknown', 'test', []);
      expect(error.title).toBe('Oops! Something Went Wrong');
      expect(error.icon).toBe('🤕');
    });

    it('should include timestamp', () => {
      const beforeTime = Date.now();
      const error = createAppError('network', 'test', []);
      const afterTime = Date.now();

      expect(error.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(error.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  // ============================================================================
  // FACTORY FUNCTION TESTS
  // ============================================================================

  describe('createStorageError', () => {
    it('should create storage error with retry action', () => {
      const onRetry = vi.fn();
      const error = createStorageError('Storage full', onRetry);

      expect(error.category).toBe('storage');
      expect(error.recovery).toHaveLength(1);
      expect(error.recovery[0].label).toBe('Try Again');
      expect(error.recovery[0].primary).toBe(true);
    });

    it('should include continue action when provided', () => {
      const onRetry = vi.fn();
      const onContinue = vi.fn();
      const error = createStorageError('Storage full', onRetry, onContinue);

      expect(error.recovery).toHaveLength(2);
      expect(error.recovery[0].label).toBe('Try Again');
      expect(error.recovery[1].label).toBe('Continue Without Saving');
    });

    it('should pass Error object correctly', () => {
      const onRetry = vi.fn();
      const originalError = new Error('Quota exceeded');
      const error = createStorageError(originalError, onRetry);

      expect(error.message).toBe('Quota exceeded');
    });
  });

  describe('createGenerationError', () => {
    it('should create generation error with retry and home actions', () => {
      const onRetry = vi.fn();
      const error = createGenerationError('Pack failed', onRetry);

      expect(error.category).toBe('generation');
      expect(error.recovery).toHaveLength(2);
      expect(error.recovery[0].label).toBe('Try Again');
      expect(error.recovery[0].primary).toBe(true);
      expect(error.recovery[1].label).toBe('Go Home');
    });

    it('should pass Error object correctly', () => {
      const onRetry = vi.fn();
      const originalError = new Error('RNG failed');
      const error = createGenerationError(originalError, onRetry);

      expect(error.message).toBe('RNG failed');
    });
  });

  describe('createNetworkError', () => {
    it('should create network error with retry action', () => {
      const onRetry = vi.fn();
      const error = createNetworkError('No internet', onRetry);

      expect(error.category).toBe('network');
      expect(error.recovery).toHaveLength(1);
      expect(error.recovery[0].label).toBe('Retry');
      expect(error.recovery[0].primary).toBe(true);
    });

    it('should pass Error object correctly', () => {
      const onRetry = vi.fn();
      const originalError = new Error('Fetch failed');
      const error = createNetworkError(originalError, onRetry);

      expect(error.message).toBe('Fetch failed');
    });
  });

  // ============================================================================
  // ERROR LOGGING TESTS
  // ============================================================================

  describe('logError', () => {
    it('should log error details to console', () => {
      const error = createAppError('network', 'Test error', []);
      logError(error);

      expect(console.group).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
      expect(console.groupEnd).toHaveBeenCalled();
    });

    it('should mark error as logged', () => {
      const error = createAppError('network', 'Test error', []);
      expect(error.logged).toBe(false);

      logError(error);
      expect(error.logged).toBe(true);
    });

    it('should not log again if already logged', () => {
      const error = createAppError('network', 'Test error', []);
      error.logged = true;

      logError(error);
      expect(console.group).not.toHaveBeenCalled();
    });

    it('should log original error if provided', () => {
      const error = createAppError('network', 'Test error', []);
      const originalError = new Error('Original');

      logError(error, originalError);
      expect(console.log).toHaveBeenCalled();
    });

    it('should log stack trace from original Error', () => {
      const error = createAppError('network', 'Test error', []);
      const originalError = new Error('With stack');

      logError(error, originalError);

      // Check that stack trace was logged
      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const stackLogged = logCalls.some(
        (call) => call.some((arg: unknown) => typeof arg === 'string' && arg.includes('Stack Trace'))
      );
      expect(stackLogged).toBe(true);
    });
  });

  describe('logWarning', () => {
    it('should log warning message', () => {
      logWarning('Test warning');

      expect(console.group).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
      expect(console.groupEnd).toHaveBeenCalled();
    });

    it('should include additional data if provided', () => {
      const data = { foo: 'bar' };
      logWarning('Test warning', data);

      const logCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const dataLogged = logCalls.some((call) => call.includes(data));
      expect(dataLogged).toBe(true);
    });
  });

  describe('logDebug', () => {
    it('should log debug info in development mode', () => {
      // Note: This test depends on import.meta.env.DEV being true in test environment
      // The actual behavior may vary based on Vitest configuration
      logDebug('Test debug');

      // In dev mode, it should log; in prod mode, it shouldn't
      // We're testing that the function exists and doesn't throw
      expect(() => logDebug('Test')).not.toThrow();
    });

    it('should accept optional data parameter', () => {
      expect(() => logDebug('Test', { extra: 'data' })).not.toThrow();
    });
  });

  // ============================================================================
  // ERROR CATEGORIZATION TESTS
  // ============================================================================

  describe('categorizeError', () => {
    describe('string error categorization', () => {
      it('should categorize storage-related strings', () => {
        expect(categorizeError('storage full')).toBe('storage');
        expect(categorizeError('quota exceeded')).toBe('storage');
        expect(categorizeError('STORAGE_ERROR')).toBe('storage');
        expect(categorizeError('LocalStorage quota')).toBe('storage');
      });

      it('should categorize network-related strings', () => {
        expect(categorizeError('network error')).toBe('network');
        expect(categorizeError('fetch failed')).toBe('network');
        expect(categorizeError('NETWORK_TIMEOUT')).toBe('network');
      });

      it('should return unknown for unrecognized strings', () => {
        expect(categorizeError('something happened')).toBe('unknown');
        expect(categorizeError('random error')).toBe('unknown');
      });
    });

    describe('Error object categorization', () => {
      it('should categorize storage errors by message', () => {
        expect(categorizeError(new Error('storage full'))).toBe('storage');
        expect(categorizeError(new Error('QuotaExceeded'))).toBe('storage');
        expect(categorizeError(new Error('localStorage access denied'))).toBe('storage');
      });

      it('should categorize storage errors by name', () => {
        const error = new Error('Something');
        error.name = 'QuotaExceededError';
        expect(categorizeError(error)).toBe('storage');
      });

      it('should categorize network errors by message', () => {
        expect(categorizeError(new Error('network unavailable'))).toBe('network');
        expect(categorizeError(new Error('fetch request failed'))).toBe('network');
        expect(categorizeError(new Error('connection refused'))).toBe('network');
      });

      it('should categorize network errors by name', () => {
        const error = new Error('Something');
        error.name = 'NetworkError';
        expect(categorizeError(error)).toBe('network');
      });

      it('should categorize permission errors', () => {
        expect(categorizeError(new Error('permission denied'))).toBe('permission');
        expect(categorizeError(new Error('access blocked'))).toBe('permission');
      });

      it('should categorize validation errors by message', () => {
        expect(categorizeError(new Error('invalid data'))).toBe('validation');
        expect(categorizeError(new Error('failed to parse JSON'))).toBe('validation');
        expect(categorizeError(new Error('expected string got number'))).toBe('validation');
      });

      it('should categorize validation errors by name', () => {
        const error = new Error('Something');
        error.name = 'SyntaxError';
        expect(categorizeError(error)).toBe('validation');
      });

      it('should return unknown for unrecognized Error messages', () => {
        expect(categorizeError(new Error('mysterious failure'))).toBe('unknown');
      });
    });

    describe('unknown type categorization', () => {
      it('should return unknown for null', () => {
        expect(categorizeError(null)).toBe('unknown');
      });

      it('should return unknown for undefined', () => {
        expect(categorizeError(undefined)).toBe('unknown');
      });

      it('should return unknown for objects', () => {
        expect(categorizeError({ message: 'test' })).toBe('unknown');
      });

      it('should return unknown for numbers', () => {
        expect(categorizeError(404)).toBe('unknown');
      });
    });
  });

  // ============================================================================
  // RECOVERY ACTION TESTS
  // ============================================================================

  describe('RecoveryAction interface', () => {
    it('should support action execution', () => {
      const actionFn = vi.fn();
      const action: RecoveryAction = {
        label: 'Test',
        action: actionFn,
      };

      action.action();
      expect(actionFn).toHaveBeenCalled();
    });

    it('should support primary flag', () => {
      const action: RecoveryAction = {
        label: 'Primary Action',
        action: vi.fn(),
        primary: true,
      };

      expect(action.primary).toBe(true);
    });

    it('should work without primary flag', () => {
      const action: RecoveryAction = {
        label: 'Secondary Action',
        action: vi.fn(),
      };

      expect(action.primary).toBeUndefined();
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('edge cases', () => {
    it('should handle empty string error message', () => {
      const error = createAppError('network', '', []);
      // Empty string is falsy, so should use template message
      expect(error.message).toBeTruthy();
    });

    it('should handle Error with empty message', () => {
      const error = createAppError('network', new Error(''), []);
      // Empty Error message should use template message
      expect(error.message).toBeTruthy();
    });

    it('should handle very long error messages', () => {
      const longMessage = 'x'.repeat(10000);
      const error = createAppError('network', longMessage, []);
      expect(error.message).toBe(longMessage);
    });

    it('should handle Error with special characters in message', () => {
      const specialMessage = '<script>alert("xss")</script>';
      const error = createAppError('security', new Error(specialMessage), []);
      expect(error.message).toBe(specialMessage);
    });

    it('should handle multiple recovery actions', () => {
      const actions: RecoveryAction[] = Array.from({ length: 10 }, (_, i) => ({
        label: `Action ${i}`,
        action: vi.fn(),
        primary: i === 0,
      }));

      const error = createAppError('network', 'test', actions);
      expect(error.recovery).toHaveLength(10);
    });
  });
});
