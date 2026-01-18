<script lang="ts">
  import { onMount } from 'svelte';
  import { craftingSession, craftingState } from '@/stores/crafting';

  export let onComplete: () => void;

  let animationProgress = 0;
  let showSparkles = false;

  onMount(() => {
    // Animate progress
    const interval = setInterval(() => {
      animationProgress += 2;
      if (animationProgress >= 100) {
        clearInterval(interval);
        showSparkles = true;
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }, 20); // 1 second animation

    return () => clearInterval(interval);
  });
</script>

<div class="crafting-animation fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
  <div class="relative w-full max-w-md p-8">
    <!-- Card Slots -->
    <div class="mb-8 flex items-center justify-center gap-4">
      <!-- Input Cards -->
      <div class="flex -space-x-8">
        {#each Array(5) as _, i}
          <div
            class="relative h-32 w-24 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 shadow-lg transform transition-all duration-500"
            style="animation: float 2s ease-in-out infinite; animation-delay: {i * 0.1}s"
          >
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="h-16 w-12 rounded bg-slate-600/50"></div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Arrow -->
      <div class="flex h-12 w-12 items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 text-amber-500 animate-pulse"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>

      <!-- Output Card -->
      <div
        class="relative h-32 w-24 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 border-2 border-amber-400 shadow-lg shadow-amber-500/50 scale-110"
      >
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="h-16 w-12 rounded bg-slate-900/50 animate-pulse"></div>
        </div>
        {#if showSparkles}
          <div class="absolute inset-0 animate-ping opacity-75">
            <div class="h-full w-full rounded-lg bg-gradient-to-br from-amber-400 to-orange-500"></div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mb-4">
      <div class="h-4 overflow-hidden rounded-full bg-slate-800 border border-slate-700">
        <div
          class="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-100"
          style="width: {animationProgress}%"
        ></div>
      </div>
    </div>

    <!-- Status Text -->
    <div class="text-center">
      <p class="text-xl font-bold text-white mb-2">
        {#if animationProgress < 30}
          Combining materials...
        {:else if animationProgress < 60}
          Infusing essence...
        {:else if animationProgress < 90}
          Forging card...
        {:else}
          Almost there...
        {/if}
      </p>
      <p class="text-sm text-gray-400">
        {animationProgress.toFixed(0)}% complete
      </p>
    </div>

    <!-- Floating Particles -->
    {#if showSparkles}
      <div class="absolute inset-0 pointer-events-none">
        {#each Array(20) as _, i}
          <div
            class="absolute h-2 w-2 rounded-full bg-amber-400 animate-ping"
            style="
              left: {Math.random() * 100}%;
              top: {Math.random() * 100}%;
              animation-delay: {Math.random() * 0.5}s;
            "
          ></div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
</style>
