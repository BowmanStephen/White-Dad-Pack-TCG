<!--
WelcomeModal.svelte

Welcome modal for new users (ONBOARD-002).
Shows before the tutorial to introduce DadDeck concept.

Features:
- Brief intro to DadDeck concept
- Call to action to start tutorial/open first pack
- Option to skip welcome and jump straight to action
- Persistent tracking via localStorage
- Responsive design with mobile-first approach
- Keyboard accessible (Escape to close, Enter to start)
- Focus trap for accessibility
-->
<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { fade, fly } from 'svelte/transition';
import { createFocusTrap } from '@/lib/utils/focus-trap';
import {
  welcomeSeen,
  welcomeModalVisible,
  dismissWelcome,
  showWelcomeIfNeeded,
} from '@/stores/tutorial';

// Props for callback when user chooses action
interface Props {
  onStartTutorial?: () => void;
  onSkip?: () => void;
}

let { onStartTutorial = () => {}, onSkip = () => {} }: Props = $props();

// Local state synced with store
let isVisible = $state(false);
let modalElement = $state<HTMLElement | null>(null);
let cleanupFocusTrap: (() => void) | null = null;
let showDelayTimer: ReturnType<typeof setTimeout> | null = null;

// Subscribe to store
let unsubscribe: (() => void) | null = null;

onMount(() => {
  // Subscribe to visibility store
  unsubscribe = welcomeModalVisible.subscribe((visible: boolean) => {
    isVisible = visible;
  });

  // Only run on client-side
  if (typeof window === 'undefined') return;

  // Check if user has already seen the welcome modal
  if (!welcomeSeen.get()) {
    // Show after a short delay for smooth experience
    showDelayTimer = setTimeout(() => {
      showWelcomeIfNeeded();
    }, 500);
  }
});

onDestroy(() => {
  // Cleanup subscription
  if (unsubscribe) {
    unsubscribe();
  }
  // Cleanup timeout
  if (showDelayTimer) {
    clearTimeout(showDelayTimer);
  }
  // Cleanup focus trap
  if (cleanupFocusTrap) {
    cleanupFocusTrap();
  }
});

// Setup focus trap when modal becomes visible
$effect(() => {
  if (isVisible && modalElement) {
    // Focus the modal and setup focus trap
    modalElement.focus();
    cleanupFocusTrap = createFocusTrap(modalElement, {
      autoFocus: true,
    });
  } else if (!isVisible && cleanupFocusTrap) {
    cleanupFocusTrap();
    cleanupFocusTrap = null;
  }
});

// Handle start tutorial button
function handleStart() {
  dismissWelcome();
  onStartTutorial();
}

// Handle skip button
function handleSkip() {
  dismissWelcome();
  onSkip();
}

// Handle keyboard navigation
function handleKeydown(event: KeyboardEvent) {
  if (!isVisible) return;

  switch (event.key) {
    case 'Escape':
      event.stopPropagation();
      event.preventDefault();
      handleSkip();
      break;
    case 'Enter':
      // Only trigger start if not focused on skip button
      if (document.activeElement?.textContent?.includes('Skip')) {
        return; // Let the button's native behavior handle it
      }
      event.stopPropagation();
      event.preventDefault();
      handleStart();
      break;
  }
}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isVisible}
  <div
    bind:this={modalElement}
    role="dialog"
    aria-modal="true"
    aria-labelledby="welcome-title"
    aria-describedby="welcome-description"
    tabindex="-1"
    class="fixed inset-0 z-[5000] flex items-center justify-center p-4"
  >
    <!-- Backdrop -->
    <button
      class="absolute inset-0 bg-black/70 backdrop-blur-sm"
      transition:fade={{ duration: 300 }}
      onclick={handleSkip}
      aria-label="Close welcome modal"
      type="button"
    ></button>

    <!-- Modal content -->
    <div
      class="relative z-10 w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl"
      transition:fly={{ y: 50, duration: 300 }}
    >
      <!-- Close button (top right) -->
      <button
        onclick={handleSkip}
        class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Close welcome"
        type="button"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <!-- Content -->
      <div class="p-8 md:p-12">
        <!-- Logo/Icon -->
        <div class="flex justify-center mb-6">
          <div
            class="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
        </div>

        <!-- Title -->
        <h2
          id="welcome-title"
          class="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4"
        >
          Welcome to DadDeck!
        </h2>

        <!-- Subtitle -->
        <p class="text-lg text-center text-gray-600 dark:text-gray-400 mb-6">
          The Ultimate White Dad Trading Card Simulator
        </p>

        <!-- Description -->
        <div id="welcome-description" class="prose prose-lg dark:prose-invert max-w-none mb-8">
          <p class="text-gray-700 dark:text-gray-300 text-center leading-relaxed">
            Open digital booster packs featuring collectible dad-themed cards. From <strong
              class="text-yellow-600">Grillmaster Gary</strong
            >
            to
            <strong class="text-green-600">Fix-It Dad</strong>, collect 50+ hilarious cards
            parodying suburban American dad culture.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <!-- Feature 1 -->
            <div
              class="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
            >
              <div
                class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3"
              >
                <svg
                  class="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Free to Play</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Unlimited pack opening, no microtransactions
              </p>
            </div>

            <!-- Feature 2 -->
            <div
              class="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
            >
              <div
                class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3"
              >
                <svg
                  class="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Premium Feel</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                AAA-quality animations and effects
              </p>
            </div>

            <!-- Feature 3 -->
            <div
              class="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
            >
              <div
                class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3"
              >
                <svg
                  class="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Collect & Battle</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Build your collection and compete
              </p>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Primary CTA: Start Tutorial -->
          <button
            onclick={handleStart}
            class="flex-1 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            type="button"
          >
            <span class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Start Tutorial
            </span>
          </button>

          <!-- Secondary: Skip to Action -->
          <button
            onclick={handleSkip}
            class="px-8 py-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            type="button"
          >
            Skip to Opening
          </button>
        </div>

        <!-- Keyboard hint -->
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-6 text-center">
          Press <kbd
            class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono"
            >Enter</kbd
          >
          to start or
          <kbd
            class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono"
            >Esc</kbd
          >
          to skip
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
/* Ensure proper z-index stacking */
[role='dialog'] {
  isolation: isolate;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  [role='dialog'] {
    padding: 1rem;
  }
}
</style>
