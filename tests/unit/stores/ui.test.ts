/**
 * UI State Tests - US044
 * Tests for UI store (toast, modal, pointer, device capabilities)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  $prefersReducedMotion,
  $isTouchDevice,
  $hasGyroscope,
  $pointerPosition,
  $deviceOrientation,
  $modalOpen,
  $toasts,
  initializeUI,
  requestGyroscopePermission,
  updatePointerPosition,
  showToast,
  removeToast,
  openModal,
  closeModal,
} from '../../../src/stores/ui';

// Mock window and navigator for tests
const mockMatchMedia = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

// Define window if it doesn't exist (test environment)
if (typeof window === 'undefined') {
  (global as any).window = {
    matchMedia: mockMatchMedia,
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
  };
}

// Define navigator if it doesn't exist
if (typeof navigator === 'undefined') {
  (global as any).navigator = {
    maxTouchPoints: 0,
  };
}

describe('UI Store - US044: UI State Tests', () => {
  beforeEach(() => {
    // Reset all stores before each test
    $prefersReducedMotion.set(false);
    $isTouchDevice.set(false);
    $hasGyroscope.set(false);
    $pointerPosition.set({ x: 0.5, y: 0.5 });
    $deviceOrientation.set({ alpha: 0, beta: 0, gamma: 0 });
    $modalOpen.set(null);
    $toasts.set([]);

    // Reset global mocks
    (window as any).matchMedia = mockMatchMedia;
    (window as any).ontouchstart = undefined;
    (navigator as any).maxTouchPoints = 0;
    delete (global as any).DeviceOrientationEvent;
    delete (window as any).DeviceOrientationEvent;

    vi.clearAllMocks();
  });

  describe('Reduced Motion Preference', () => {
    it('should start with reduced motion disabled by default', () => {
      const prefersReduced = $prefersReducedMotion.get();
      expect(prefersReduced).toBe(false);
    });

    it('should set reduced motion to true when media query matches', () => {
      const mockMediaQueryList = {
        matches: true,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      };
      mockMatchMedia.mockReturnValue(mockMediaQueryList);

      initializeUI();

      expect($prefersReducedMotion.get()).toBe(true);
    });

    it('should keep reduced motion false when media query does not match', () => {
      const mockMediaQueryList = {
        matches: false,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      };
      mockMatchMedia.mockReturnValue(mockMediaQueryList);

      initializeUI();

      expect($prefersReducedMotion.get()).toBe(false);
    });

    it('should persist reduced motion state', () => {
      $prefersReducedMotion.set(true);
      expect($prefersReducedMotion.get()).toBe(true);

      $prefersReducedMotion.set(false);
      expect($prefersReducedMotion.get()).toBe(false);
    });
  });

  describe('Touch Device Detection', () => {
    it('should detect touch device when touch events exist', () => {
      // Mock touch support
      (window as any).ontouchstart = vi.fn();
      (navigator as any).maxTouchPoints = 5;

      initializeUI();

      const isTouch = $isTouchDevice.get();
      expect(isTouch).toBe(true);
    });

    it('should detect no touch device when no touch support', () => {
      // Mock no touch support - need to ensure ontouchstart doesn't exist
      // and also delete it completely
      delete (window as any).ontouchstart;
      (navigator as any).maxTouchPoints = 0;

      initializeUI();

      const isTouch = $isTouchDevice.get();
      expect(isTouch).toBe(false);
    });

    it('should persist touch device state', () => {
      $isTouchDevice.set(true);
      expect($isTouchDevice.get()).toBe(true);

      $isTouchDevice.set(false);
      expect($isTouchDevice.get()).toBe(false);
    });
  });

  describe('Gyroscope Detection', () => {
    it('should detect gyroscope when DeviceOrientationEvent exists without requestPermission', () => {
      // Mock DeviceOrientationEvent without requestPermission (non-iOS)
      const mockEventClass = class {};
      // Set on both global and window
      (global as any).DeviceOrientationEvent = mockEventClass;
      (window as any).DeviceOrientationEvent = mockEventClass;
      // Ensure requestPermission is NOT a function
      (mockEventClass as any).requestPermission = undefined;

      initializeUI();

      const hasGyro = $hasGyroscope.get();
      expect(hasGyro).toBe(true);
    });

    it('should not detect gyroscope when DeviceOrientationEvent does not exist', () => {
      // Mock no DeviceOrientationEvent
      delete (global as any).DeviceOrientationEvent;
      delete (window as any).DeviceOrientationEvent;

      initializeUI();

      const hasGyro = $hasGyroscope.get();
      expect(hasGyro).toBe(false);
    });

    it('should set gyroscope to false when permission request needed (iOS 13+)', () => {
      // Mock iOS 13+ behavior
      const mockEventClass = class {};
      (mockEventClass as any).requestPermission = vi.fn().mockResolvedValue('granted');
      (global as any).DeviceOrientationEvent = mockEventClass;
      (window as any).DeviceOrientationEvent = mockEventClass;

      initializeUI();

      // Should initially be false until permission granted
      expect($hasGyroscope.get()).toBe(false);
    });

    it('should persist gyroscope state', () => {
      $hasGyroscope.set(true);
      expect($hasGyroscope.get()).toBe(true);

      $hasGyroscope.set(false);
      expect($hasGyroscope.get()).toBe(false);
    });
  });

  describe('Pointer Position State', () => {
    it('should start with center position (0.5, 0.5)', () => {
      const position = $pointerPosition.get();
      expect(position).toEqual({ x: 0.5, y: 0.5 });
    });

    it('should update pointer position correctly', () => {
      updatePointerPosition(0.25, 0.75);

      const position = $pointerPosition.get();
      expect(position).toEqual({ x: 0.25, y: 0.75 });
    });

    it('should persist pointer position', () => {
      $pointerPosition.set({ x: 0.1, y: 0.9 });

      const position = $pointerPosition.get();
      expect(position).toEqual({ x: 0.1, y: 0.9 });
    });

    it('should handle edge cases (0 and 1)', () => {
      updatePointerPosition(0, 0);
      expect($pointerPosition.get()).toEqual({ x: 0, y: 0 });

      updatePointerPosition(1, 1);
      expect($pointerPosition.get()).toEqual({ x: 1, y: 1 });
    });

    it('should handle values outside 0-1 range', () => {
      updatePointerPosition(-0.5, 1.5);

      const position = $pointerPosition.get();
      expect(position).toEqual({ x: -0.5, y: 1.5 });
    });
  });

  describe('Device Orientation State', () => {
    it('should start with zero orientation', () => {
      const orientation = $deviceOrientation.get();
      expect(orientation).toEqual({ alpha: 0, beta: 0, gamma: 0 });
    });

    it('should persist device orientation', () => {
      $deviceOrientation.set({ alpha: 45, beta: 30, gamma: 15 });

      const orientation = $deviceOrientation.get();
      expect(orientation).toEqual({ alpha: 45, beta: 30, gamma: 15 });
    });

    it('should handle negative orientation values', () => {
      $deviceOrientation.set({ alpha: -10, beta: -20, gamma: -30 });

      const orientation = $deviceOrientation.get();
      expect(orientation).toEqual({ alpha: -10, beta: -20, gamma: -30 });
    });

    it('should handle large orientation values', () => {
      $deviceOrientation.set({ alpha: 360, beta: 180, gamma: 90 });

      const orientation = $deviceOrientation.get();
      expect(orientation).toEqual({ alpha: 360, beta: 180, gamma: 90 });
    });
  });

  describe('Modal State', () => {
    it('should start with no modal open', () => {
      const modal = $modalOpen.get();
      expect(modal).toBeNull();
    });

    it('should open modal with ID', () => {
      openModal('test-modal');

      const modal = $modalOpen.get();
      expect(modal).toBe('test-modal');
    });

    it('should close modal', () => {
      openModal('test-modal');
      closeModal();

      const modal = $modalOpen.get();
      expect(modal).toBeNull();
    });

    it('should persist modal state', () => {
      $modalOpen.set('settings-modal');

      const modal = $modalOpen.get();
      expect(modal).toBe('settings-modal');
    });

    it('should handle opening multiple modals (last one wins)', () => {
      openModal('modal-1');
      openModal('modal-2');

      const modal = $modalOpen.get();
      expect(modal).toBe('modal-2');
    });

    it('should handle closing when no modal is open', () => {
      expect(() => closeModal()).not.toThrow();
      expect($modalOpen.get()).toBeNull();
    });
  });

  describe('Toast Notifications', () => {
    vi.useFakeTimers();

    it('should start with empty toasts array', () => {
      const toasts = $toasts.get();
      expect(toasts).toEqual([]);
    });

    it('should add a toast notification', () => {
      showToast('Test message', 'info');

      const toasts = $toasts.get();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('Test message');
      expect(toasts[0].type).toBe('info');
      expect(toasts[0].id).toBeDefined();
    });

    it('should add success toast', () => {
      showToast('Success!', 'success');

      const toasts = $toasts.get();
      expect(toasts[0].type).toBe('success');
    });

    it('should add error toast', () => {
      showToast('Error!', 'error');

      const toasts = $toasts.get();
      expect(toasts[0].type).toBe('error');
    });

    it('should add multiple toasts', () => {
      showToast('First', 'info');
      showToast('Second', 'success');
      showToast('Third', 'error');

      const toasts = $toasts.get();
      expect(toasts).toHaveLength(3);
    });

    it('should remove toast by ID', () => {
      showToast('Test message', 'info');
      const toasts = $toasts.get();
      const toastId = toasts[0].id;

      removeToast(toastId);

      const updatedToasts = $toasts.get();
      expect(updatedToasts).toHaveLength(0);
    });

    it('should only remove specified toast', () => {
      showToast('First', 'info');
      showToast('Second', 'success');
      const toasts = $toasts.get();
      const firstId = toasts[0].id;

      removeToast(firstId);

      const updatedToasts = $toasts.get();
      expect(updatedToasts).toHaveLength(1);
      expect(updatedToasts[0].message).toBe('Second');
    });

    it('should auto-remove toast after 3 seconds', () => {
      showToast('Auto-remove test', 'info');

      const toasts = $toasts.get();
      expect(toasts).toHaveLength(1);

      vi.advanceTimersByTime(3000);

      const updatedToasts = $toasts.get();
      expect(updatedToasts).toHaveLength(0);
    });

    it('should handle removing non-existent toast', () => {
      showToast('Test', 'info');

      expect(() => removeToast('non-existent-id')).not.toThrow();

      const toasts = $toasts.get();
      expect(toasts).toHaveLength(1);
    });

    it('should persist toast state', () => {
      $toasts.set([
        { id: '1', message: 'Test 1', type: 'info' },
        { id: '2', message: 'Test 2', type: 'success' },
      ]);

      const toasts = $toasts.get();
      expect(toasts).toHaveLength(2);
    });

    it('should generate unique IDs for each toast', () => {
      showToast('First', 'info');
      showToast('Second', 'info');

      const toasts = $toasts.get();
      expect(toasts[0].id).not.toBe(toasts[1].id);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });
  });

  describe('State Transitions and Integration', () => {
    it('should maintain independent states', () => {
      $prefersReducedMotion.set(true);
      $isTouchDevice.set(true);
      $hasGyroscope.set(true);
      $pointerPosition.set({ x: 0.25, y: 0.75 });
      $deviceOrientation.set({ alpha: 45, beta: 30, gamma: 15 });
      $modalOpen.set('test-modal');
      showToast('Test', 'info');

      expect($prefersReducedMotion.get()).toBe(true);
      expect($isTouchDevice.get()).toBe(true);
      expect($hasGyroscope.get()).toBe(true);
      expect($pointerPosition.get()).toEqual({ x: 0.25, y: 0.75 });
      expect($deviceOrientation.get()).toEqual({ alpha: 45, beta: 30, gamma: 15 });
      expect($modalOpen.get()).toBe('test-modal');
      expect($toasts.get()).toHaveLength(1);
    });

    it('should handle rapid state changes', () => {
      for (let i = 0; i < 10; i++) {
        $pointerPosition.set({ x: i * 0.1, y: i * 0.1 });
        $modalOpen.set(`modal-${i}`);
      }

      expect($pointerPosition.get()).toEqual({ x: 0.9, y: 0.9 });
      expect($modalOpen.get()).toBe('modal-9');
    });
  });

  describe('Edge Cases', () => {
    it('should handle initializeUI when window is undefined', () => {
      const originalWindow = global.window;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - intentionally removing window for test
      delete global.window;

      expect(() => initializeUI()).not.toThrow();

      global.window = originalWindow;
    });

    it('should handle requestGyroscopePermission when no permission method exists', async () => {
      // Mock DeviceOrientationEvent without requestPermission
      const mockEventClass = class {};
      (global as any).DeviceOrientationEvent = mockEventClass;
      (window as any).DeviceOrientationEvent = mockEventClass;
      (mockEventClass as any).requestPermission = undefined;

      const result = await requestGyroscopePermission();
      expect(result).toBe(true);
    });

    it('should handle gyroscope permission denial', async () => {
      const mockEventClass = class {};
      (mockEventClass as any).requestPermission = vi.fn().mockResolvedValue('denied');
      (global as any).DeviceOrientationEvent = mockEventClass;
      (window as any).DeviceOrientationEvent = mockEventClass;

      const result = await requestGyroscopePermission();
      expect(result).toBe(false);
      expect($hasGyroscope.get()).toBe(false);
    });

    it('should handle gyroscope permission error', async () => {
      const mockEventClass = class {};
      (mockEventClass as any).requestPermission = vi.fn().mockRejectedValue(new Error('Permission error'));
      (global as any).DeviceOrientationEvent = mockEventClass;
      (window as any).DeviceOrientationEvent = mockEventClass;

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await requestGyroscopePermission();
      expect(result).toBe(false);
      expect($hasGyroscope.get()).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('State Reset and Cleanup', () => {
    it('should allow manual state reset', () => {
      $prefersReducedMotion.set(true);
      $isTouchDevice.set(true);
      $modalOpen.set('test-modal');
      showToast('Test', 'info');

      // Manually reset
      $prefersReducedMotion.set(false);
      $isTouchDevice.set(false);
      $modalOpen.set(null);
      $toasts.set([]);

      expect($prefersReducedMotion.get()).toBe(false);
      expect($isTouchDevice.get()).toBe(false);
      expect($modalOpen.get()).toBeNull();
      expect($toasts.get()).toEqual([]);
    });

    it('should handle resetting pointer position to center', () => {
      $pointerPosition.set({ x: 0.1, y: 0.2 });
      $pointerPosition.set({ x: 0.5, y: 0.5 });

      expect($pointerPosition.get()).toEqual({ x: 0.5, y: 0.5 });
    });

    it('should handle clearing device orientation', () => {
      $deviceOrientation.set({ alpha: 45, beta: 30, gamma: 15 });
      $deviceOrientation.set({ alpha: 0, beta: 0, gamma: 0 });

      expect($deviceOrientation.get()).toEqual({ alpha: 0, beta: 0, gamma: 0 });
    });
  });
});
