/**
 * Tutorial Store
 *
 * Manages first-time user tutorial state and progress tracking.
 * Implements Ralph Loop patterns: stop hooks for tutorial gates,
 * HOTL dashboard for progress visibility.
 */

import { atom, computed } from 'nanostores';
import { persistentAtom } from '@/lib/utils/persistent';

/**
 * Welcome modal persistence - tracks if user has seen the welcome modal
 */
export const welcomeSeen = persistentAtom<boolean>('daddeck-welcome-seen', false, {
  encode: value => JSON.stringify(value),
  decode: value => {
    try {
      return JSON.parse(value);
    } catch {
      return false;
    }
  },
});

/**
 * Welcome modal visibility state (non-persistent, UI state only)
 */
export const welcomeModalVisible = atom<boolean>(false);

/**
 * Mark welcome as seen and hide the modal
 */
export function dismissWelcome(): void {
  welcomeSeen.set(true);
  welcomeModalVisible.set(false);
}

/**
 * Show welcome modal if not seen before
 */
export function showWelcomeIfNeeded(): void {
  if (!welcomeSeen.get()) {
    welcomeModalVisible.set(true);
  }
}

/**
 * Tutorial step definitions
 * Each step has an ID, title, content, and optional target selector for highlighting
 */
export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'wait' | 'next'; // What action advances the tutorial
  imageUrl?: string; // Optional image for the step
}

/**
 * Tutorial state shape
 */
export interface TutorialState {
  isActive: boolean;
  currentStepIndex: number;
  steps: TutorialStep[];
  completed: boolean;
  skipped: boolean;
  startedAt: number | null;
  completedAt: number | null;
}

/**
 * Tutorial definitions for different flows
 */
export const TUTORIALS: Record<string, TutorialStep[]> = {
  first_time: [
    {
      id: 'pack_button',
      title: 'Open Your First Pack',
      content:
        'Click the <strong>"Open Pack"</strong> button to start! Each pack contains 6 cards with different rarities - from Common to Mythic!',
      target: '[data-tutorial="pack-button"]',
      position: 'bottom',
      action: 'click',
    },
    {
      id: 'card_reveal',
      title: 'Watch Cards Reveal',
      content:
        'Enjoy the premium animations as each card is revealed! Higher rarity cards have more dramatic effects. Keep an eye out for holographic variants! ✨',
      target: '[data-tutorial="card-reveal"]',
      position: 'center',
      action: 'wait',
    },
    {
      id: 'share_pull',
      title: 'Share Your Pull',
      content:
        'Got an awesome card? Click the <strong>"Share"</strong> button to show your friends! Your card pull is saved as an image ready for social media. 📸',
      target: '[data-tutorial="share-button"]',
      position: 'bottom',
      action: 'next',
    },
  ],
};

/**
 * Persistent atom for tutorial completion
 * Tracks whether user has completed any tutorial
 */
export const tutorialProgress = persistentAtom<Record<string, boolean>>(
  'daddeck-tutorial-progress',
  {},
  {
    encode: value => JSON.stringify(value),
    decode: value => {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    },
  }
);

/**
 * Current active tutorial ID
 */
export const activeTutorialId = atom<string | null>(null);

/**
 * Current tutorial state
 */
export const tutorialState = atom<TutorialState>({
  isActive: false,
  currentStepIndex: 0,
  steps: [],
  completed: false,
  skipped: false,
  startedAt: null,
  completedAt: null,
});

/**
 * Current tutorial step (computed)
 */
export const currentStep = computed([tutorialState, activeTutorialId], (state, tutorialId) => {
  if (!state.isActive || !tutorialId) return null;
  const steps = TUTORIALS[tutorialId];
  if (!steps || state.currentStepIndex >= steps.length) return null;
  return steps[state.currentStepIndex];
});

/**
 * Tutorial progress percentage (computed)
 */
export const tutorialProgressPercent = computed([tutorialState], state => {
  if (state.steps.length === 0) return 0;
  return Math.round((state.currentStepIndex / state.steps.length) * 100);
});

/**
 * Check if a tutorial has been completed
 */
export function isTutorialCompleted(tutorialId: string): boolean {
  return Boolean(tutorialProgress.get()[tutorialId]);
}

/**
 * Start a tutorial
 */
export function startTutorial(tutorialId: string): void {
  const steps = TUTORIALS[tutorialId];
  if (!steps) {
    console.error(`Tutorial "${tutorialId}" not found`);
    return;
  }

  // Check if already completed
  if (isTutorialCompleted(tutorialId)) {
    return;
  }

  activeTutorialId.set(tutorialId);
  tutorialState.set({
    isActive: true,
    currentStepIndex: 0,
    steps,
    completed: false,
    skipped: false,
    startedAt: Date.now(),
    completedAt: null,
  });
}

/**
 * Advance to the next tutorial step
 */
export function nextStep(): void {
  const state = tutorialState.get();
  if (!state.isActive) return;

  const nextIndex = state.currentStepIndex + 1;
  const tutorialId = activeTutorialId.get();

  if (!tutorialId) return;

  const steps = TUTORIALS[tutorialId];
  if (!steps) return;

  // Check if tutorial is complete
  if (nextIndex >= steps.length) {
    completeTutorial();
    return;
  }

  // Advance to next step
  tutorialState.set({
    ...state,
    currentStepIndex: nextIndex,
  });
}

/**
 * Go to the previous tutorial step
 */
export function prevStep(): void {
  const state = tutorialState.get();
  if (!state.isActive || state.currentStepIndex === 0) return;

  tutorialState.set({
    ...state,
    currentStepIndex: state.currentStepIndex - 1,
  });
}

/**
 * Skip the tutorial
 */
export function skipTutorial(): void {
  const state = tutorialState.get();
  const tutorialId = activeTutorialId.get();

  tutorialState.set({
    ...state,
    isActive: false,
    skipped: true,
  });

  activeTutorialId.set(null);
}

/**
 * Complete the tutorial
 */
export function completeTutorial(): void {
  const state = tutorialState.get();
  const tutorialId = activeTutorialId.get();

  if (tutorialId) {
    // Mark tutorial as completed in persistent storage
    const progress = tutorialProgress.get();
    tutorialProgress.set({
      ...progress,
      [tutorialId]: true,
    });
  }

  tutorialState.set({
    ...state,
    isActive: false,
    completed: true,
    completedAt: Date.now(),
  });

  activeTutorialId.set(null);
}

/**
 * Reset tutorial progress (for testing)
 */
export function resetTutorial(tutorialId?: string): void {
  if (tutorialId) {
    const progress = tutorialProgress.get();
    // Create new object without the tutorialId (immutable pattern)
    const { [tutorialId]: _removed, ...rest } = progress;
    tutorialProgress.set(rest);
  } else {
    // Reset all tutorials
    tutorialProgress.set({});
  }

  // Reset current state if it matches
  const currentId = activeTutorialId.get();
  if (currentId === tutorialId || !tutorialId) {
    tutorialState.set({
      isActive: false,
      currentStepIndex: 0,
      steps: [],
      completed: false,
      skipped: false,
      startedAt: null,
      completedAt: null,
    });
    activeTutorialId.set(null);
  }
}

/**
 * Auto-start first-time tutorial if needed
 */
export function autoStartTutorial(): void {
  if (!isTutorialCompleted('first_time')) {
    startTutorial('first_time');
  }
}
