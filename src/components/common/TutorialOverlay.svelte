<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import {
    tutorialVisible,
    tutorialStep,
    nextTutorialStep,
    previousTutorialStep,
    skipTutorial,
    completeTutorial,
    initializeTutorial,
  } from '../../stores/tutorial';

  let dontShowAgain = $state(false);
  let spotlightElement: HTMLElement | null = null;

  // Tutorial steps configuration
  const steps = [
    {
      step: 1,
      title: 'Welcome to DadDeck™!',
      description: 'Click the "Open Your First Pack" button to get started. Each pack contains 6-7 random dad cards with varying rarities.',
      targetSelector: 'a[href="/pack"]', // Open Pack button on landing page
      position: 'bottom',
    },
    {
      step: 2,
      title: 'Watch the Magic Happen',
      description: 'Your pack will tear open with a satisfying animation, then reveal cards one by one. Click to reveal or press Space to skip ahead!',
      targetSelector: '#main-content', // Main content area on pack page
      position: 'center',
    },
    {
      step: 3,
      title: 'Share Your Pulls',
      description: 'Got an amazing card? Share it with friends! Click the Share button to post your pull on social media or copy a link.',
      targetSelector: 'button[title*="Share"]', // Share button
      position: 'bottom',
    },
  ];

  // Get current step info (using Svelte 5 runes)
  const currentStepInfo = $derived(steps.find((s) => s.step === $tutorialStep) || steps[0]);

  // Focus trap for tutorial
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      skipTutorial();
    } else if (e.key === 'ArrowRight') {
      nextTutorialStep();
    } else if (e.key === 'ArrowLeft') {
      previousTutorialStep();
    }
  }

  // Position spotlight based on target element
  function updateSpotlight() {
    if (typeof window === 'undefined') return;

    const target = document.querySelector(currentStepInfo.value.targetSelector) as HTMLElement;
    spotlightElement = target;

    if (target) {
      // Scroll target into view
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Update spotlight when step changes
  $effect(() => {
    if ($tutorialStep) {
      // Wait for DOM to update
      setTimeout(updateSpotlight, 100);
    }
  });

  // Initialize tutorial on mount
  onMount(() => {
    initializeTutorial();
    // Add keydown listener
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });

  function handleNext() {
    if ($tutorialStep === 3) {
      completeTutorial(dontShowAgain);
    } else {
      nextTutorialStep();
    }
  }

  function handleSkip() {
    completeTutorial(dontShowAgain);
  }
</script>

{#if $tutorialVisible}
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center"
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="tutorial-title"
    tabindex="-1"
  >
    <!-- Darkened background -->
    <div
      class="absolute inset-0 bg-black/70 backdrop-blur-sm"
      in:fade={{ duration: 300 }}
      out:fade={{ duration: 200 }}
    ></div>

    <!-- Spotlight highlight -->
    <div
      class="absolute pointer-events-none transition-all duration-500"
      in:fade={{ duration: 300 }}
      style={spotlightElement ? `
        top: ${spotlightElement.getBoundingClientRect().top}px;
        left: ${spotlightElement.getBoundingClientRect().left}px;
        width: ${spotlightElement.offsetWidth}px;
        height: ${spotlightElement.offsetHeight}px;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 60px rgba(251, 191, 36, 0.5);
        border-radius: 12px;
        border: 3px solid rgb(251, 191, 36);
      ` : 'display: none;'}
    ></div>

    <!-- Tutorial card -->
    <div
      class="relative z-10 max-w-md w-full mx-4"
      in:fly={{ y: 50, duration: 400 }}
      out:fly={{ y: -50, duration: 200 }}
    >
      <div class="bg-slate-900 border border-amber-500/50 rounded-2xl shadow-2xl shadow-amber-500/20 overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
          <div class="flex items-center justify-between">
            <h2 id="tutorial-title" class="text-xl font-black text-white">
              {currentStepInfo.value.title}
            </h2>
            <div class="flex items-center gap-1">
              {#each steps as step}
                <div
                  class="w-2 h-2 rounded-full transition-all {step.step === $tutorialStep ? 'bg-white' : 'bg-white/50'}"
                ></div>
              {/each}
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <p class="text-slate-300 text-lg mb-6 leading-relaxed">
            {currentStepInfo.value.description}
          </p>

          <!-- Step indicator -->
          <div class="flex items-center justify-center gap-2 mb-6">
            <div class="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
                style="width: {$tutorialStep * 33.33}%"
              ></div>
            </div>
            <span class="text-sm font-bold text-slate-400">
              {$tutorialStep}/3
            </span>
          </div>

          <!-- Don't show again checkbox -->
          {#if $tutorialStep === 3}
            <label class="flex items-center gap-3 mb-6 cursor-pointer group">
              <div class="relative">
                <input
                  type="checkbox"
                  bind:checked={dontShowAgain}
                  class="peer appearance-none w-5 h-5 border-2 border-slate-600 rounded bg-slate-800 checked:bg-amber-500 checked:border-amber-500 transition-colors"
                />
                <svg
                  class="absolute inset-0 w-5 h-5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <span class="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                Don't show this again
              </span>
            </label>
          {/if}

          <!-- Actions -->
          <div class="flex gap-3">
            {#if $tutorialStep > 1}
              <button
                on:click={previousTutorialStep}
                class="px-4 py-3 bg-slate-800 text-slate-300 font-bold rounded-lg hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
              >
                Back
              </button>
            {/if}

            <button
              on:click={handleSkip}
              class="px-4 py-3 text-slate-400 font-bold rounded-lg hover:text-slate-300 hover:bg-slate-800/50 transition-all"
              class:text-slate-500={$tutorialStep !== 3}
            >
              Skip
            </button>

            <div class="flex-1"></div>

            <button
              on:click={handleNext}
              class="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25"
            >
              {$tutorialStep === 3 ? 'Get Started!' : 'Next'}
            </button>
          </div>
        </div>

        <!-- Keyboard hints -->
        <div class="px-6 pb-4">
          <div class="flex items-center justify-center gap-4 text-xs text-slate-500">
            <span class="flex items-center gap-1">
              <kbd
                class="px-2 py-1 bg-slate-800 border border-slate-700 rounded font-mono"
              >Esc</kbd>
              Skip
            </span>
            <span class="flex items-center gap-1">
              <kbd
                class="px-2 py-1 bg-slate-800 border border-slate-700 rounded font-mono"
              >→</kbd>
              Next
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  kbd {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.75rem;
  }
</style>
