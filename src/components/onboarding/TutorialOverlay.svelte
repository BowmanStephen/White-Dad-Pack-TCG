<!--
TutorialOverlay.svelte

Full-screen tutorial overlay with backdrop and step content.
Implements Ralph Loop HOTL dashboard pattern for tutorial visibility.
-->
<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import {
    tutorialState,
    currentStep,
    tutorialProgressPercent,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial,
  } from '@/stores/tutorial';

  // Track highlighted element
  let highlightedElement: HTMLElement | null = null;
  let overlay: HTMLElement;
  let spotlight: HTMLElement;

  // Auto-scroll to highlighted element
  async function scrollToElement() {
    await tick();
    if (!highlightedElement) return;

    highlightedElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
  }

  // Update spotlight position when step changes
  async function updateSpotlight() {
    // Guard against SSR
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    await tick();

    const step = currentStep.get();
    if (!step?.target) {
      if (spotlight) spotlight.style.display = 'none';
      return;
    }

    // Find target element
    const target = document.querySelector(step.target) as HTMLElement;
    if (!target) {
      console.warn(`Tutorial target not found: ${step.target}`);
      if (spotlight) spotlight.style.display = 'none';
      return;
    }

    highlightedElement = target;

    // Calculate position
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

    // Scroll to element
    await scrollToElement();
  }

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
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

  // Subscribe to step changes
  let unsubscribe: (() => void) | null = null;

  onMount(() => {
    // Guard against SSR
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', handleKeydown);

    unsubscribe = currentStep.subscribe(() => {
      updateSpotlight();
    });

    // Initial update
    updateSpotlight();
  });

  onDestroy(() => {
    // Guard against SSR
    if (typeof window === 'undefined') return;

    window.removeEventListener('keydown', handleKeydown);
    if (unsubscribe) unsubscribe();
  });

  // Get step position for tooltip placement
  function getPositionClass(position?: string): string {
    switch (position) {
      case 'top':
        return 'bottom-full mb-4';
      case 'bottom':
        return 'top-full mt-4';
      case 'left':
        return 'right-full mr-4';
      case 'right':
        return 'left-full ml-4';
      case 'center':
      default:
        return '';
    }
  }
</script>

{#if $tutorialState.isActive}
  <div
    bind:this={overlay}
    role="dialog"
    aria-modal="true"
    aria-labelledby="tutorial-title"
    class="fixed inset-0 z-50 flex items-center justify-center"
    on:click={(e) => {
      // Close if clicking outside spotlight
      if (e.target === overlay) skipTutorial();
    }}
  >
    <!-- Dark backdrop -->
    <div
      class="absolute inset-0 bg-black/70 backdrop-blur-sm"
      transition:fade="{{ duration: 300 }}"
    ></div>

    <!-- Spotlight cutout for highlighted element -->
    {#if $currentStep?.target}
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
      class:fixed={!$currentStep?.target}
      class:inset-4={!$currentStep?.target}
      class:m-auto={!$currentStep?.target}
    >
      <!-- Progress bar -->
      <div class="h-1 bg-gray-200 dark:bg-gray-700 rounded-t-2xl overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style="width: {$tutorialProgressPercent}%"
          role="progressbar"
          aria-valuenow={$tutorialProgressPercent}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Title -->
        <h2
          id="tutorial-title"
          class="text-2xl font-bold text-gray-900 dark:text-white mb-3"
        >
          {$currentStep?.title || 'Tutorial'}
        </h2>

        <!-- Step counter -->
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Step {$tutorialState.currentStepIndex + 1} of {$tutorialState.steps.length}
        </p>

        <!-- Content -->
        <p class="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
          {@html $currentStep?.content || ''}
        </p>

        <!-- Optional image -->
        {#if $currentStep?.imageUrl}
          <div class="mb-6 rounded-lg overflow-hidden">
            <img
              src={$currentStep.imageUrl}
              alt={$currentStep.title}
              class="w-full h-auto"
              loading="lazy"
            />
          </div>
        {/if}

        <!-- Navigation buttons -->
        <div class="flex items-center justify-between gap-4">
          <!-- Skip button -->
          <button
            on:click={skipTutorial}
            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium"
            type="button"
          >
            Skip Tutorial
          </button>

          <!-- Navigation -->
          <div class="flex gap-3">
            <!-- Previous button -->
            {#if $tutorialState.currentStepIndex > 0}
              <button
                on:click={prevStep}
                class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                type="button"
              >
                ← Previous
              </button>
            {/if}

            <!-- Next/Finish button -->
            <button
              on:click={() => {
                if ($tutorialState.currentStepIndex === $tutorialState.steps.length - 1) {
                  completeTutorial();
                } else {
                  nextStep();
                }
              }}
              class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium shadow-lg hover:shadow-xl"
              type="button"
            >
              {$tutorialState.currentStepIndex === $tutorialState.steps.length - 1
                ? 'Finish'
                : 'Next →'}
            </button>
          </div>
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
