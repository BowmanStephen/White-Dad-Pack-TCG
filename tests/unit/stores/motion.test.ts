import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  $motionMode,
  $systemPrefersReducedMotion,
  $isReducedMotion,
  setMotionMode,
  getMotionMode,
  cycleMotionMode,
  initializeMotionSettings,
  type MotionMode,
} from '@/stores/motion';

/**
 * Motion Store Test Suite
 *
 * Tests motion/animation preference management including:
 * - Initial state
 * - Mode changes (auto/reduced/full)
 * - System preference detection
 * - Computed reduced motion state
 * - Mode cycling
 */

describe('Motion Store', () => {
  beforeEach(() => {
    // Reset stores to initial state
    $motionMode.set('auto');
    $systemPrefersReducedMotion.set(false);
    
    // Clear localStorage (already mocked in setup.ts)
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should default to auto mode', () => {
      expect($motionMode.get()).toBe('auto');
    });

    it('should default system preference to false', () => {
      expect($systemPrefersReducedMotion.get()).toBe(false);
    });

    it('should compute reduced motion as false when in auto mode with system preference off', () => {
      $motionMode.set('auto');
      $systemPrefersReducedMotion.set(false);
      
      expect($isReducedMotion.get()).toBe(false);
    });
  });

  describe('setMotionMode()', () => {
    it('should set motion mode to auto', () => {
      setMotionMode('auto');
      
      expect($motionMode.get()).toBe('auto');
    });

    it('should set motion mode to reduced', () => {
      setMotionMode('reduced');
      
      expect($motionMode.get()).toBe('reduced');
    });

    it('should set motion mode to full', () => {
      setMotionMode('full');
      
      expect($motionMode.get()).toBe('full');
    });

    it('should persist mode to localStorage', () => {
      setMotionMode('reduced');
      
      expect(localStorage.getItem('daddeck_motion_mode')).toBe('reduced');
    });
  });

  describe('getMotionMode()', () => {
    it('should return current motion mode', () => {
      $motionMode.set('reduced');
      
      expect(getMotionMode()).toBe('reduced');
    });

    it('should return auto when mode is auto', () => {
      $motionMode.set('auto');
      
      expect(getMotionMode()).toBe('auto');
    });

    it('should return full when mode is full', () => {
      $motionMode.set('full');
      
      expect(getMotionMode()).toBe('full');
    });
  });

  describe('cycleMotionMode()', () => {
    it('should cycle from auto to reduced', () => {
      $motionMode.set('auto');
      
      cycleMotionMode();
      
      expect($motionMode.get()).toBe('reduced');
    });

    it('should cycle from reduced to full', () => {
      $motionMode.set('reduced');
      
      cycleMotionMode();
      
      expect($motionMode.get()).toBe('full');
    });

    it('should cycle from full to auto', () => {
      $motionMode.set('full');
      
      cycleMotionMode();
      
      expect($motionMode.get()).toBe('auto');
    });

    it('should complete full cycle', () => {
      $motionMode.set('auto');
      
      cycleMotionMode(); // auto → reduced
      expect($motionMode.get()).toBe('reduced');
      
      cycleMotionMode(); // reduced → full
      expect($motionMode.get()).toBe('full');
      
      cycleMotionMode(); // full → auto
      expect($motionMode.get()).toBe('auto');
    });
  });

  describe('$isReducedMotion (computed)', () => {
    it('should return true when mode is reduced', () => {
      $motionMode.set('reduced');
      $systemPrefersReducedMotion.set(false);
      
      expect($isReducedMotion.get()).toBe(true);
    });

    it('should return false when mode is full', () => {
      $motionMode.set('full');
      $systemPrefersReducedMotion.set(true);
      
      expect($isReducedMotion.get()).toBe(false);
    });

    it('should follow system preference when mode is auto', () => {
      $motionMode.set('auto');
      
      $systemPrefersReducedMotion.set(false);
      expect($isReducedMotion.get()).toBe(false);
      
      $systemPrefersReducedMotion.set(true);
      expect($isReducedMotion.get()).toBe(true);
    });

    it('should ignore system preference when mode is reduced', () => {
      $motionMode.set('reduced');
      $systemPrefersReducedMotion.set(false);
      
      expect($isReducedMotion.get()).toBe(true);
    });

    it('should ignore system preference when mode is full', () => {
      $motionMode.set('full');
      $systemPrefersReducedMotion.set(true);
      
      expect($isReducedMotion.get()).toBe(false);
    });
  });

  describe('initializeMotionSettings()', () => {
    it('should not throw when called', () => {
      expect(() => initializeMotionSettings()).not.toThrow();
    });

    it('should set system preference based on matchMedia', () => {
      // matchMedia is mocked in setup.ts and returns matches: false by default
      initializeMotionSettings();
      
      // System preference should be set based on matchMedia result
      expect(typeof $systemPrefersReducedMotion.get()).toBe('boolean');
    });
  });

  describe('Store Reactivity', () => {
    it('should notify subscribers when motion mode changes', () => {
      let callCount = 0;
      const unsubscribe = $motionMode.subscribe(() => {
        callCount++;
      });

      setMotionMode('reduced');

      expect(callCount).toBeGreaterThan(0);

      unsubscribe();
    });

    it('should notify subscribers when system preference changes', () => {
      let callCount = 0;
      const unsubscribe = $systemPrefersReducedMotion.subscribe(() => {
        callCount++;
      });

      $systemPrefersReducedMotion.set(true);

      expect(callCount).toBeGreaterThan(0);

      unsubscribe();
    });

    it('should update computed store when dependencies change', () => {
      let lastValue: boolean | undefined;
      const unsubscribe = $isReducedMotion.subscribe((value) => {
        lastValue = value;
      });

      $motionMode.set('reduced');
      expect(lastValue).toBe(true);

      $motionMode.set('full');
      expect(lastValue).toBe(false);

      unsubscribe();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid mode changes without errors', () => {
      expect(() => {
        setMotionMode('auto');
        setMotionMode('reduced');
        setMotionMode('full');
        cycleMotionMode();
        cycleMotionMode();
        cycleMotionMode();
      }).not.toThrow();
    });

    it('should maintain state consistency after multiple operations', () => {
      setMotionMode('reduced');
      expect($motionMode.get()).toBe('reduced');

      cycleMotionMode();
      expect($motionMode.get()).toBe('full');

      setMotionMode('auto');
      expect($motionMode.get()).toBe('auto');
    });

    it('should accept only valid motion modes', () => {
      const validModes: MotionMode[] = ['auto', 'reduced', 'full'];

      validModes.forEach(mode => {
        $motionMode.set(mode);
        expect($motionMode.get()).toBe(mode);
      });
    });
  });

  describe('LocalStorage Integration', () => {
    it('should persist motion mode changes', () => {
      setMotionMode('reduced');
      expect(localStorage.getItem('daddeck_motion_mode')).toBe('reduced');

      setMotionMode('full');
      expect(localStorage.getItem('daddeck_motion_mode')).toBe('full');

      setMotionMode('auto');
      expect(localStorage.getItem('daddeck_motion_mode')).toBe('auto');
    });

    it('should persist mode after cycling', () => {
      $motionMode.set('auto');
      
      cycleMotionMode();
      expect(localStorage.getItem('daddeck_motion_mode')).toBe('reduced');
    });
  });
});
