/**
 * Unit Tests for Tutorial Store
 *
 * Tests the tutorial state management:
 * 1. Initial state
 * 2. startTutorial() - Start a tutorial flow
 * 3. nextStep() / prevStep() - Navigate tutorial steps
 * 4. skipTutorial() - Skip the current tutorial
 * 5. completeTutorial() - Mark tutorial as complete
 * 6. isTutorialCompleted() - Check completion status
 * 7. Computed stores (currentStep, tutorialProgressPercent)
 * 8. resetTutorial() - Reset for testing
 * 9. autoStartTutorial() - Auto-start first-time tutorial
 *
 * User Story: PACK-052
 * Acceptance Criteria: Test tutorial store functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  tutorialProgress,
  activeTutorialId,
  tutorialState,
  currentStep,
  tutorialProgressPercent,
  isTutorialCompleted,
  startTutorial,
  nextStep,
  prevStep,
  skipTutorial,
  completeTutorial,
  resetTutorial,
  autoStartTutorial,
  TUTORIALS,
  type TutorialStep,
  type TutorialState,
} from '@/stores/tutorial';

// localStorage is already mocked globally in tests/setup.ts
// No need to define our own mock

// Default tutorial state for reset
const DEFAULT_TUTORIAL_STATE: TutorialState = {
  isActive: false,
  currentStepIndex: 0,
  steps: [],
  completed: false,
  skipped: false,
  startedAt: null,
  completedAt: null,
};

describe('Tutorial Store', () => {
  beforeEach(() => {
    // Reset all stores before each test
    tutorialProgress.set({});
    activeTutorialId.set(null);
    tutorialState.set(DEFAULT_TUTORIAL_STATE);
    // localStorage is cleared in setup.ts
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should start with inactive tutorial', () => {
      const state = tutorialState.get();
      expect(state.isActive).toBe(false);
    });

    it('should have no active tutorial ID initially', () => {
      const id = activeTutorialId.get();
      expect(id).toBeNull();
    });

    it('should have empty tutorial progress initially', () => {
      const progress = tutorialProgress.get();
      expect(progress).toEqual({});
    });

    it('should have currentStepIndex at 0 initially', () => {
      const state = tutorialState.get();
      expect(state.currentStepIndex).toBe(0);
    });

    it('should have empty steps array initially', () => {
      const state = tutorialState.get();
      expect(state.steps).toEqual([]);
    });

    it('should have completed as false initially', () => {
      const state = tutorialState.get();
      expect(state.completed).toBe(false);
    });

    it('should have skipped as false initially', () => {
      const state = tutorialState.get();
      expect(state.skipped).toBe(false);
    });

    it('should have null timestamps initially', () => {
      const state = tutorialState.get();
      expect(state.startedAt).toBeNull();
      expect(state.completedAt).toBeNull();
    });
  });

  describe('TUTORIALS constant', () => {
    it('should have first_time tutorial defined', () => {
      expect(TUTORIALS.first_time).toBeDefined();
      expect(Array.isArray(TUTORIALS.first_time)).toBe(true);
    });

    it('should have valid tutorial steps', () => {
      const firstTimeTutorial = TUTORIALS.first_time;
      expect(firstTimeTutorial.length).toBeGreaterThan(0);

      firstTimeTutorial.forEach((step) => {
        expect(step.id).toBeDefined();
        expect(step.title).toBeDefined();
        expect(step.content).toBeDefined();
      });
    });

    it('should have steps with required properties', () => {
      const step = TUTORIALS.first_time[0];
      expect(step).toHaveProperty('id');
      expect(step).toHaveProperty('title');
      expect(step).toHaveProperty('content');
    });
  });

  describe('startTutorial()', () => {
    it('should start a valid tutorial', () => {
      startTutorial('first_time');

      const state = tutorialState.get();
      expect(state.isActive).toBe(true);
      expect(state.currentStepIndex).toBe(0);
      expect(state.steps).toEqual(TUTORIALS.first_time);
    });

    it('should set active tutorial ID', () => {
      startTutorial('first_time');

      expect(activeTutorialId.get()).toBe('first_time');
    });

    it('should set startedAt timestamp', () => {
      const beforeStart = Date.now();
      startTutorial('first_time');
      const afterStart = Date.now();

      const state = tutorialState.get();
      expect(state.startedAt).toBeGreaterThanOrEqual(beforeStart);
      expect(state.startedAt).toBeLessThanOrEqual(afterStart);
    });

    it('should not start if tutorial already completed', () => {
      // Mark tutorial as completed first
      tutorialProgress.set({ first_time: true });

      startTutorial('first_time');

      const state = tutorialState.get();
      expect(state.isActive).toBe(false);
    });

    it('should not start non-existent tutorial', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      startTutorial('non_existent_tutorial');

      expect(tutorialState.get().isActive).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should reset state when starting tutorial', () => {
      startTutorial('first_time');

      const state = tutorialState.get();
      expect(state.completed).toBe(false);
      expect(state.skipped).toBe(false);
      expect(state.completedAt).toBeNull();
    });
  });

  describe('nextStep()', () => {
    beforeEach(() => {
      startTutorial('first_time');
    });

    it('should advance to next step', () => {
      const initialIndex = tutorialState.get().currentStepIndex;

      nextStep();

      expect(tutorialState.get().currentStepIndex).toBe(initialIndex + 1);
    });

    it('should complete tutorial when reaching last step', () => {
      // Advance to the last step
      const steps = TUTORIALS.first_time;
      for (let i = 0; i < steps.length - 1; i++) {
        nextStep();
      }

      // This should complete the tutorial
      nextStep();

      const state = tutorialState.get();
      expect(state.isActive).toBe(false);
      expect(state.completed).toBe(true);
    });

    it('should do nothing if tutorial is not active', () => {
      tutorialState.set(DEFAULT_TUTORIAL_STATE);

      nextStep();

      expect(tutorialState.get().currentStepIndex).toBe(0);
    });

    it('should preserve other state when advancing', () => {
      const stateBefore = tutorialState.get();
      const startedAt = stateBefore.startedAt;

      nextStep();

      const stateAfter = tutorialState.get();
      expect(stateAfter.startedAt).toBe(startedAt);
      expect(stateAfter.isActive).toBe(true);
    });
  });

  describe('prevStep()', () => {
    beforeEach(() => {
      startTutorial('first_time');
      nextStep(); // Move to step 1
    });

    it('should go to previous step', () => {
      const currentIndex = tutorialState.get().currentStepIndex;

      prevStep();

      expect(tutorialState.get().currentStepIndex).toBe(currentIndex - 1);
    });

    it('should not go below step 0', () => {
      tutorialState.set({
        ...tutorialState.get(),
        currentStepIndex: 0,
      });

      prevStep();

      expect(tutorialState.get().currentStepIndex).toBe(0);
    });

    it('should do nothing if tutorial is not active', () => {
      tutorialState.set({
        ...DEFAULT_TUTORIAL_STATE,
        currentStepIndex: 2,
      });

      prevStep();

      expect(tutorialState.get().currentStepIndex).toBe(2);
    });
  });

  describe('skipTutorial()', () => {
    beforeEach(() => {
      startTutorial('first_time');
    });

    it('should deactivate the tutorial', () => {
      skipTutorial();

      expect(tutorialState.get().isActive).toBe(false);
    });

    it('should mark tutorial as skipped', () => {
      skipTutorial();

      expect(tutorialState.get().skipped).toBe(true);
    });

    it('should clear active tutorial ID', () => {
      skipTutorial();

      expect(activeTutorialId.get()).toBeNull();
    });

    it('should not mark as completed', () => {
      skipTutorial();

      expect(tutorialState.get().completed).toBe(false);
    });

    it('should not save to progress (can be restarted)', () => {
      skipTutorial();

      expect(isTutorialCompleted('first_time')).toBe(false);
    });
  });

  describe('completeTutorial()', () => {
    beforeEach(() => {
      startTutorial('first_time');
    });

    it('should deactivate the tutorial', () => {
      completeTutorial();

      expect(tutorialState.get().isActive).toBe(false);
    });

    it('should mark tutorial as completed', () => {
      completeTutorial();

      expect(tutorialState.get().completed).toBe(true);
    });

    it('should set completedAt timestamp', () => {
      const beforeComplete = Date.now();
      completeTutorial();
      const afterComplete = Date.now();

      const state = tutorialState.get();
      expect(state.completedAt).toBeGreaterThanOrEqual(beforeComplete);
      expect(state.completedAt).toBeLessThanOrEqual(afterComplete);
    });

    it('should save completion to persistent progress', () => {
      completeTutorial();

      expect(isTutorialCompleted('first_time')).toBe(true);
    });

    it('should clear active tutorial ID', () => {
      completeTutorial();

      expect(activeTutorialId.get()).toBeNull();
    });
  });

  describe('isTutorialCompleted()', () => {
    it('should return false for uncompleted tutorial', () => {
      expect(isTutorialCompleted('first_time')).toBe(false);
    });

    it('should return true for completed tutorial', () => {
      tutorialProgress.set({ first_time: true });

      expect(isTutorialCompleted('first_time')).toBe(true);
    });

    it('should return false for non-existent tutorial', () => {
      expect(isTutorialCompleted('non_existent')).toBe(false);
    });

    it('should handle multiple tutorials', () => {
      tutorialProgress.set({
        first_time: true,
        advanced: false,
      });

      expect(isTutorialCompleted('first_time')).toBe(true);
      expect(isTutorialCompleted('advanced')).toBe(false);
    });
  });

  describe('Computed Stores', () => {
    describe('currentStep', () => {
      it('should return null when no tutorial is active', () => {
        expect(currentStep.get()).toBeNull();
      });

      it('should return current step when tutorial is active', () => {
        startTutorial('first_time');

        const step = currentStep.get();
        expect(step).not.toBeNull();
        expect(step?.id).toBe(TUTORIALS.first_time[0].id);
      });

      it('should update when step advances', () => {
        startTutorial('first_time');

        const step1 = currentStep.get();
        nextStep();
        const step2 = currentStep.get();

        expect(step1?.id).not.toBe(step2?.id);
      });

      it('should return null when step index exceeds steps', () => {
        startTutorial('first_time');

        // Force invalid state
        tutorialState.set({
          ...tutorialState.get(),
          currentStepIndex: 999,
        });

        expect(currentStep.get()).toBeNull();
      });
    });

    describe('tutorialProgressPercent', () => {
      it('should return 0 when no steps', () => {
        expect(tutorialProgressPercent.get()).toBe(0);
      });

      it('should return 0 at start of tutorial', () => {
        startTutorial('first_time');

        expect(tutorialProgressPercent.get()).toBe(0);
      });

      it('should increase as steps advance', () => {
        startTutorial('first_time');
        const numSteps = TUTORIALS.first_time.length;

        nextStep();

        const expectedPercent = Math.round((1 / numSteps) * 100);
        expect(tutorialProgressPercent.get()).toBe(expectedPercent);
      });

      it('should be calculated correctly', () => {
        startTutorial('first_time');
        const numSteps = TUTORIALS.first_time.length;

        // Move halfway through
        const halfwayIndex = Math.floor(numSteps / 2);
        for (let i = 0; i < halfwayIndex; i++) {
          nextStep();
        }

        const expectedPercent = Math.round((halfwayIndex / numSteps) * 100);
        expect(tutorialProgressPercent.get()).toBe(expectedPercent);
      });
    });
  });

  describe('resetTutorial()', () => {
    beforeEach(() => {
      startTutorial('first_time');
      completeTutorial();
    });

    it('should reset specific tutorial progress', () => {
      expect(isTutorialCompleted('first_time')).toBe(true);

      resetTutorial('first_time');

      expect(isTutorialCompleted('first_time')).toBe(false);
    });

    it('should reset all tutorials when no ID provided', () => {
      tutorialProgress.set({
        first_time: true,
        advanced: true,
      });

      resetTutorial();

      expect(tutorialProgress.get()).toEqual({});
    });

    it('should reset tutorial state if active tutorial matches', () => {
      startTutorial('first_time');

      resetTutorial('first_time');

      const state = tutorialState.get();
      expect(state.isActive).toBe(false);
      expect(state.currentStepIndex).toBe(0);
    });

    it('should clear active tutorial ID when resetting active tutorial', () => {
      startTutorial('first_time');

      resetTutorial('first_time');

      expect(activeTutorialId.get()).toBeNull();
    });

    it('should not affect other tutorials', () => {
      tutorialProgress.set({
        first_time: true,
        advanced: true,
      });

      resetTutorial('first_time');

      expect(isTutorialCompleted('advanced')).toBe(true);
    });
  });

  describe('autoStartTutorial()', () => {
    it('should start first_time tutorial if not completed', () => {
      autoStartTutorial();

      expect(tutorialState.get().isActive).toBe(true);
      expect(activeTutorialId.get()).toBe('first_time');
    });

    it('should not start tutorial if already completed', () => {
      tutorialProgress.set({ first_time: true });

      autoStartTutorial();

      expect(tutorialState.get().isActive).toBe(false);
    });
  });

  describe('Store Reactivity', () => {
    it('should notify subscribers when tutorial state changes', () => {
      let callCount = 0;
      const unsubscribe = tutorialState.subscribe(() => {
        callCount++;
      });

      startTutorial('first_time');

      expect(callCount).toBeGreaterThan(0);

      unsubscribe();
    });

    it('should notify activeTutorialId subscribers', () => {
      let lastId: string | null = 'initial';
      const unsubscribe = activeTutorialId.subscribe((id) => {
        lastId = id;
      });

      startTutorial('first_time');

      expect(lastId).toBe('first_time');

      unsubscribe();
    });

    it('should notify currentStep subscribers', () => {
      let stepCount = 0;
      const unsubscribe = currentStep.subscribe(() => {
        stepCount++;
      });

      startTutorial('first_time');
      nextStep();

      expect(stepCount).toBeGreaterThan(1);

      unsubscribe();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid step changes', () => {
      startTutorial('first_time');

      expect(() => {
        for (let i = 0; i < 10; i++) {
          nextStep();
          prevStep();
        }
      }).not.toThrow();
    });

    it('should handle starting while already active', () => {
      startTutorial('first_time');
      nextStep();

      // Start again (should reset to beginning if not completed)
      resetTutorial('first_time');
      startTutorial('first_time');

      expect(tutorialState.get().currentStepIndex).toBe(0);
    });

    it('should handle multiple complete calls', () => {
      startTutorial('first_time');

      completeTutorial();
      completeTutorial();
      completeTutorial();

      expect(isTutorialCompleted('first_time')).toBe(true);
    });

    it('should handle skipping already completed tutorial', () => {
      startTutorial('first_time');
      completeTutorial();

      // Try to restart and skip
      resetTutorial('first_time');
      startTutorial('first_time');
      skipTutorial();

      expect(tutorialState.get().skipped).toBe(true);
      expect(tutorialState.get().completed).toBe(false);
    });

    it('should maintain data integrity across operations', () => {
      startTutorial('first_time');
      const startedAt = tutorialState.get().startedAt;

      nextStep();
      nextStep();
      prevStep();

      expect(tutorialState.get().startedAt).toBe(startedAt);
      expect(tutorialState.get().isActive).toBe(true);
    });
  });

  describe('TutorialStep Interface', () => {
    it('should have valid step structure', () => {
      const step = TUTORIALS.first_time[0];

      expect(typeof step.id).toBe('string');
      expect(typeof step.title).toBe('string');
      expect(typeof step.content).toBe('string');
    });

    it('should have optional position property', () => {
      const step = TUTORIALS.first_time[0];

      if (step.position) {
        expect(['top', 'bottom', 'left', 'right', 'center']).toContain(step.position);
      }
    });

    it('should have optional action property', () => {
      const step = TUTORIALS.first_time[0];

      if (step.action) {
        expect(['click', 'wait', 'next']).toContain(step.action);
      }
    });

    it('should have optional target selector', () => {
      const step = TUTORIALS.first_time[0];

      if (step.target) {
        expect(typeof step.target).toBe('string');
      }
    });
  });
});
