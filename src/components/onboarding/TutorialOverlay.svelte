<!--
TutorialOverlay.svelte

Full-screen tutorial overlay with backdrop and step content.
Implements Ralph Loop HOTL dashboard pattern for tutorial visibility.
-->
<script lang="ts">
import { onMount, onDestroy, tick } from 'svelte';
import { fade } from 'svelte/transition';
import { sanitizeHTML } from '@/lib/security/sanitizer';
import {
  tutorialState,
  currentStep,
  tutorialProgressPercent,
  nextStep,
  prevStep,
  skipTutorial,
  completeTutorial,
} from '@/stores/tutorial';

const tutorial = $derived(tutorialState.get());
const step = $derived(currentStep.get());
const progressPercent = $derived(tutorialProgressPercent.get());

let highlightedElement: HTMLElement | null = null;
let overlay = $state<HTMLElement | null>(null);
let spotlight = $state<HTMLElement | null>(null);
let dontShowAgain = $state(false);

// SSR guard
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

async function scrollToElement(): Promise<void> {
  await tick();
  if (!highlightedElement) return;

  highlightedElement.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'center',
  });
}

async function updateSpotlight(): Promise<void> {
  if (!isBrowser) return;

  await tick();

  const step = currentStep.get();
  if (!step?.target) {
    if (spotlight) spotlight.style.display = 'none';
    return;
  }

  const target = document.querySelector(step.target) as HTMLElement | null;
  if (!target) {
    console.warn(`Tutorial target not found: ${step.target}`);
    if (spotlight) spotlight.style.display = 'none';
    return;
  }

  highlightedElement = target;

  const rect = target.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  if (spotlight) {
    spotlight.style.display = 'block';
    spotlight.style.top = `${rect.top + scrollTop}px`;
    spotlight.style.left = `${rect.left + scrollLeft}px`;
    spotlight.style.width = `${rect.width}px`;
    spotlight.style.height = `${rect.height}px`;
  }

  await scrollToElement();
}

function handleKeydown(event: KeyboardEvent): void {
  if (!tutorialState.get().isActive) return;

  switch (event.key) {
    case 'Escape':
      skipTutorial();
      break;
    case 'ArrowRight':
      nextStep();
      break;
    case 'ArrowLeft':
      prevStep();
      break;
  }
}

let unsubscribe: (() => void) | null = null;

onMount(() => {
  if (!isBrowser) return;

  window.addEventListener('keydown', handleKeydown);
  unsubscribe = currentStep.subscribe(updateSpotlight);

  updateSpotlight();
});

onDestroy(() => {
  if (!isBrowser) return;

  window.removeEventListener('keydown', handleKeydown);
  if (unsubscribe) unsubscribe();
});

function handleSkip(): void {
  if (dontShowAgain) {
    completeTutorial();
  } else {
    skipTutorial();
  }
}

function handleFinish(): void {
  if (tutorial.currentStepIndex === tutorial.steps.length - 1) {
    completeTutorial();
  } else {
    nextStep();
  }
}
</script>

{#if tutorial.isActive}
  <div
    bind:this={overlay}
    role="dialog"
    aria-modal="true"
    aria-labelledby="tutorial-title"
    tabindex="-1"
    class="fixed inset-0 z-50 flex items-center justify-center"
  >
    <!-- Dark backdrop -->
    <button
      class="absolute inset-0 bg-black/70 backdrop-blur-sm"
      transition:fade={{ duration: 300 }}
      onclick={skipTutorial}
      aria-label="Close tutorial"
      type="button"
    ></button>

    <!-- Spotlight cutout for highlighted element -->
    {#if step?.target}
      <div
        bind:this={spotlight}
        class="absolute z-10 pointer-events-none transition-all duration-300"
        style="box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);"
      >
        <div class="absolute inset-0 border-4 border-yellow-400 rounded-lg animate-pulse"></div>
      </div>
    {/if}

    <!-- Tutorial content box -->
    <div
      class="relative z-20 w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transition-all duration-300"
      class:fixed={!step?.target}
      class:inset-4={!step?.target}
      class:m-auto={!step?.target}
    >
      <!-- Progress bar -->
      <div class="h-1 bg-gray-200 dark:bg-gray-700 rounded-t-2xl overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style="width: {progressPercent}%"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Title -->
        <h2 id="tutorial-title" class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {step?.title || 'Tutorial'}
        </h2>

        <!-- Step counter -->
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Step {tutorial.currentStepIndex + 1} of {tutorial.steps.length}
        </p>

        <!-- Content -->
        <p class="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
          <!-- eslint-disable svelte/no-at-html-tags -->
          {@html sanitizeHTML(step?.content || '')}
          <!-- eslint-enable svelte/no-at-html-tags -->
        </p>

        <!-- Optional image -->
        {#if step?.imageUrl}
          <div class="mb-6 rounded-lg overflow-hidden">
            <img src={step.imageUrl} alt={step.title} class="w-full h-auto" loading="lazy" />
          </div>
        {/if}

        <!-- Navigation buttons -->
        <div class="flex items-center justify-between gap-4">
          <button
            onclick={handleSkip}
            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium"
            type="button"
          >
            Skip Tutorial
          </button>

          <div class="flex gap-3">
            {#if tutorial.currentStepIndex > 0}
              <button
                onclick={prevStep}
                class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                type="button"
              >
                ← Previous
              </button>
            {/if}

            <button
              onclick={handleFinish}
              class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium shadow-lg hover:shadow-xl"
              type="button"
            >
              {tutorial.currentStepIndex === tutorial.steps.length - 1 ? 'Finish' : 'Next →'}
            </button>
          </div>
        </div>

        <!-- Don't show again checkbox -->
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={dontShowAgain}
              class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">
              Don't show this tutorial again
            </span>
          </label>
        </div>

        <!-- Keyboard hint -->
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          Tip: Use arrow keys to navigate, Escape to skip
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
/* Ensure backdrop sits above everything except modal */
[role='dialog'] {
  isolation: isolate;
}
</style>
