import { atom } from 'nanostores';

const TUTORIAL_COMPLETED_KEY = 'daddeck_tutorial_completed';

export type TutorialStep = 1 | 2 | 3 | null;

// Tutorial state
export const $tutorialVisible = atom<boolean>(false);
export const $tutorialStep = atom<TutorialStep>(1);
export const $tutorialCompleted = atom<boolean>(false);

// Export stores without $ prefix for imports
export const tutorialVisible = $tutorialVisible;
export const tutorialStep = $tutorialStep;
export const tutorialCompleted = $tutorialCompleted;

/**
 * Initialize tutorial state from localStorage
 */
export function initializeTutorial(): void {
  if (typeof window === 'undefined') return;

  const completed = localStorage.getItem(TUTORIAL_COMPLETED_KEY) === 'true';
  $tutorialCompleted.set(completed);

  // If not completed, show tutorial
  if (!completed) {
    $tutorialVisible.set(true);
  }
}

/**
 * Go to next tutorial step
 */
export function nextTutorialStep(): void {
  const currentStep = $tutorialStep.get();

  if (currentStep === 1) {
    $tutorialStep.set(2);
  } else if (currentStep === 2) {
    $tutorialStep.set(3);
  } else if (currentStep === 3) {
    completeTutorial();
  }
}

/**
 * Go to previous tutorial step
 */
export function previousTutorialStep(): void {
  const currentStep = $tutorialStep.get();

  if (currentStep === 2) {
    $tutorialStep.set(1);
  } else if (currentStep === 3) {
    $tutorialStep.set(2);
  }
}

/**
 * Skip the tutorial
 */
export function skipTutorial(): void {
  $tutorialVisible.set(false);
}

/**
 * Complete the tutorial and mark as done
 */
export function completeTutorial(permanent: boolean = false): void {
  $tutorialVisible.set(false);
  $tutorialStep.set(1); // Reset for next time

  if (permanent) {
    $tutorialCompleted.set(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
    }
  }
}

/**
 * Reset tutorial (for testing or user request)
 */
export function resetTutorial(): void {
  $tutorialCompleted.set(false);
  $tutorialVisible.set(true);
  $tutorialStep.set(1);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TUTORIAL_COMPLETED_KEY);
  }
}

/**
 * Show tutorial manually (even if completed)
 */
export function showTutorial(): void {
  $tutorialVisible.set(true);
  $tutorialStep.set(1);
}
