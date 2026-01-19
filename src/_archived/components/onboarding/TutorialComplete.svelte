<!--
TutorialComplete.svelte

Celebration modal shown when tutorial is completed.
Includes confetti animation and achievement unlock.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import {
    tutorialState,
    autoStartTutorial,
    resetTutorial,
  } from '@/stores/tutorial';

  export let onDismiss = () => {};

  let show = false;
  let container: HTMLElement;

  onMount(() => {
    // Show celebration after a short delay
    setTimeout(() => {
      show = true;
      createConfetti();
    }, 300);
  });

  function createConfetti() {
    const colors = ['#ef4444', '#3b82f6', '#eab308', '#a855f7', '#22c55e'];

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'absolute w-2 h-2 rounded-full';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = '-10px';
      confetti.style.animation = `fall ${2 + Math.random() * 2}s linear forwards`;
      confetti.style.animationDelay = `${Math.random() * 0.5}s`;

      if (container) {
        container.appendChild(confetti);

        // Remove confetti after animation
        setTimeout(() => {
          confetti.remove();
        }, 4000);
      }
    }
  }

  function handleDismiss() {
    show = false;
    setTimeout(() => {
      onDismiss();
    }, 300);
  }
</script>

{#if show}
  <div
    bind:this={container}
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    transition:fade="{{ duration: 300 }}"
    role="dialog"
    aria-modal="true"
    aria-labelledby="tutorial-complete-title"
  >
    <div
      class="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 max-w-md mx-4 shadow-2xl text-center transform scale-100"
      transition:scale="{{ duration: 300 }}"
    >
      <!-- Trophy icon -->
      <div class="mb-6">
        <svg
          class="w-24 h-24 mx-auto text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      </div>

      <!-- Title -->
      <h2
        id="tutorial-complete-title"
        class="text-3xl font-bold text-white mb-3"
      >
        Tutorial Complete! 🎉
      </h2>

      <!-- Message -->
      <p class="text-white/90 text-lg mb-6">
        You're now ready to open packs, collect cards, and build your collection!
      </p>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-white/20 rounded-xl p-4">
          <p class="text-white/80 text-sm">Steps Completed</p>
          <p class="text-white text-2xl font-bold">
            {$tutorialState.steps.length}
          </p>
        </div>
        <div class="bg-white/20 rounded-xl p-4">
          <p class="text-white/80 text-sm">Time Spent</p>
          <p class="text-white text-2xl font-bold">
            {Math.round(
              (($tutorialState.completedAt || 0) -
                ($tutorialState.startedAt || 0)) /
                1000 / 60
            )}m
          </p>
        </div>
      </div>

      <!-- Next steps -->
      <div class="bg-white/20 rounded-xl p-4 mb-6 text-left">
        <p class="text-white font-semibold mb-2">What's Next?</p>
        <ul class="text-white/90 text-sm space-y-1">
          <li>✨ Open more packs and collect rare cards</li>
          <li>🏆 Build decks and battle other players</li>
          <li>🔄 Trade cards with other collectors</li>
          <li>⚡ Upgrade cards and craft new ones</li>
        </ul>
      </div>

      <!-- Dismiss button -->
      <button
        on:click={handleDismiss}
        class="w-full px-6 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-white/90 transition-colors shadow-lg"
        type="button"
      >
        Start Collecting! 🎴
      </button>
    </div>
  </div>
{/if}

<style>
  @keyframes fall {
    to {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
</style>
