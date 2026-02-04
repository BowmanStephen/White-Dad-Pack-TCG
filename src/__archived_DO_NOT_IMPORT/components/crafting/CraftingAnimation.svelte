<script lang="ts">
  import { onMount } from 'svelte';
  import { craftingSession, craftingState } from '@/stores/crafting';
  import { collection } from '@/stores/collection';
  import Card from '../card/Card.svelte';
  import type { PackCard } from '@/types';
  import { RARITY_CONFIG } from '@/types';

  export let onComplete: () => void;

  // Animation phases
  let phase: 'gathering' | 'merging' | 'forging' | 'revealing' = 'gathering';
  let animationProgress = 0;
  let showSparkles = false;
  let showResult = false;

  // Card data for animation
  let inputCards: PackCard[] = [];
  let resultCard: PackCard | null = null;

  // Animation timing
  const GATHERING_DURATION = 800;
  const MERGING_DURATION = 600;
  const FORGING_DURATION = 600;
  const REVEALING_DURATION = 800;

  onMount(() => {
    // Get input cards from collection
    const session = $craftingSession;
    if (session) {
      for (const cardId of session.selectedCards) {
        const card = $collection?.cards.find((c) => c.id === cardId);
        if (card) {
          inputCards.push(card);
        }
      }
    }

    // Start animation sequence
    startAnimation();

    return () => {
      // Cleanup if needed
    };
  });

  async function startAnimation() {
    // Phase 1: Gathering cards
    phase = 'gathering';
    await animatePhase(GATHERING_DURATION);

    // Phase 2: Merging cards
    phase = 'merging';
    showSparkles = true;
    await animatePhase(MERGING_DURATION);

    // Phase 3: Forging (glow intensifies)
    phase = 'forging';
    await animatePhase(FORGING_DURATION);

    // Phase 4: Reveal result
    phase = 'revealing';
    showResult = true;
    await animatePhase(REVEALING_DURATION);

    // Complete animation
    setTimeout(() => {
      onComplete();
    }, 500);
  }

  function animatePhase(duration: number): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        animationProgress = Math.min((elapsed / duration) * 100, 100);

        if (elapsed >= duration) {
          clearInterval(interval);
          animationProgress = 0;
          resolve();
        }
      }, 16); // ~60fps
    });
  }

  function getPhaseText(): string {
    switch (phase) {
      case 'gathering':
        return 'Gathering materials...';
      case 'merging':
        return 'Merging cards...';
      case 'forging':
        return 'Forging new card...';
      case 'revealing':
        return 'Reveal!';
      default:
        return '';
    }
  }

  function getGlowIntensity(): number {
    switch (phase) {
      case 'gathering':
        return 0;
      case 'merging':
        return 0.5 + animationProgress / 200;
      case 'forging':
        return 1 + animationProgress / 100;
      case 'revealing':
        return 2;
      default:
        return 0;
    }
  }
</script>

<div class="crafting-animation fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
  <div class="relative w-full max-w-4xl p-8">
    <!-- Phase Title -->
    <div class="mb-8 text-center">
      <h2 class="text-3xl font-bold text-white mb-2" class:animate-pulse={phase === 'forging'}>
        {getPhaseText()}
      </h2>
      {#if phase !== 'revealing'}
        <div class="mx-auto h-2 w-64 overflow-hidden rounded-full bg-slate-800">
          <div
            class="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-100"
            style="width: {animationProgress}%"
          ></div>
        </div>
      {/if}
    </div>

    <!-- Animation Area -->
    <div class="relative flex items-center justify-center gap-8 min-h-[500px]">
      {#if phase === 'gathering'}
        <!-- Phase 1: Input Cards Gathering -->
        <div class="flex flex-wrap justify-center gap-4">
          {#each inputCards as card, i}
            <div
              class="transform transition-all duration-500"
              style="
                animation: float 2s ease-in-out infinite;
                animation-delay: {i * 0.1}s;
                transform: scale(0.8);
              "
            >
              <Card {card} size="sm" interactive={false} showBack={false} />
            </div>
          {/each}
        </div>

      {:else if phase === 'merging'}
        <!-- Phase 2: Cards Merging Together -->
        <div class="relative">
          <!-- Cards converging to center -->
          <div class="flex items-center justify-center">
            {#each inputCards as card, i}
              <div
                class="absolute transform transition-all duration-{MERGING_DURATION}"
                style="
                  animation: converge {MERGING_DURATION}ms ease-in-out;
                  animation-delay: {i * 50}ms;
                  transform: scale(0.6);
                  opacity: {1 - (animationProgress / 100)};
                "
              >
                <Card {card} size="sm" interactive={false} showBack={false} />
              </div>
            {/each}

            <!-- Central merge point with glow -->
            <div
              class="relative z-10 rounded-full"
              style="
                width: {100 + animationProgress * 2}px;
                height: {100 + animationProgress * 2}px;
                background: radial-gradient(circle, rgba(251, 191, 36, 0.8) 0%, rgba(245, 158, 11, 0.4) 50%, transparent 100%);
                box-shadow: 0 0 {animationProgress * 2}px {animationProgress}px rgba(251, 191, 36, 0.8);
                animation: pulse 0.5s ease-in-out infinite;
              "
            ></div>
          </div>

          <!-- Sparkles during merge -->
          {#if showSparkles}
            <div class="absolute inset-0 pointer-events-none">
              {#each Array(30) as _, i}
                <div
                  class="absolute h-2 w-2 rounded-full bg-amber-400 animate-ping"
                  style="
                    left: {40 + Math.random() * 20}%;
                    top: {40 + Math.random() * 20}%;
                    animation-delay: {Math.random() * 0.3}s;
                    animation-duration: {0.5 + Math.random() * 0.5}s;
                  "
                ></div>
              {/each}
            </div>
          {/if}
        </div>

      {:else if phase === 'forging'}
        <!-- Phase 3: Forging with Intense Glow -->
        <div class="relative">
          <!-- Intense glow effect -->
          <div
            class="absolute inset-0 flex items-center justify-center rounded-full"
            style="
              width: {300 + animationProgress * 3}px;
              height: {300 + animationProgress * 3}px;
              background: radial-gradient(circle, rgba(251, 191, 36, {0.6 + animationProgress / 200}) 0%, rgba(245, 158, 11, 0.3) 40%, transparent 70%);
              filter: blur({animationProgress / 10}px);
              animation: pulse 0.3s ease-in-out infinite;
            "
          ></div>

          <!-- Multiple layered glows -->
          {#each [0, 1, 2, 3, 4] as layer}
            <div
              class="absolute inset-0 flex items-center justify-center rounded-full opacity-60"
              style="
                width: {200 + layer * 50 + animationProgress * 2}px;
                height: {200 + layer * 50 + animationProgress * 2}px;
                border: 2px solid rgba(251, 191, 36, {0.8 - layer * 0.15});
                animation: rotate {2 + layer * 0.5}s linear infinite;
              "
            ></div>
          {/each}

          <!-- Central energy core -->
          <div
            class="relative z-10 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500"
            style="
              width: {150 + Math.sin(animationProgress / 10) * 20}px;
              height: {150 + Math.sin(animationProgress / 10) * 20}px;
              box-shadow: 0 0 {50 + animationProgress}px {20 + animationProgress / 2}px rgba(251, 191, 36, 0.9);
              animation: coreGlow 0.5s ease-in-out infinite alternate;
            "
          >
            <div class="flex h-full items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-16 w-16 text-white animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
          </div>

          <!-- Explosive sparkles -->
          <div class="absolute inset-0 pointer-events-none">
            {#each Array(50) as _, i}
              <div
                class="absolute h-1 w-1 rounded-full animate-ping"
                style="
                  left: {50 + Math.cos(i * 0.3) * (30 + animationProgress / 5)}%;
                  top: {50 + Math.sin(i * 0.3) * (30 + animationProgress / 5)}%;
                  background: i % 2 === 0 ? '#fbbf24' : '#f97316';
                  animation-delay: {i * 0.02}s;
                  animation-duration: {0.3 + Math.random() * 0.3}s;
                "
              ></div>
            {/each}
          </div>
        </div>

      {:else if phase === 'revealing'}
        <!-- Phase 4: Dramatic Result Reveal -->
        <div class="relative">
          {#if showResult && $craftingSession?.result}
            <!-- Card container with fanfare -->
            <div
              class="relative transform transition-all duration-1000"
              style="animation: cardReveal 1s ease-out forwards"
            >
              <!-- Result Card -->
              <div class="transform scale-125 hover:scale-150 transition-transform duration-300">
                <Card card={$craftingSession.result} size="lg" interactive={false} showBack={false} />
              </div>

              <!-- Fanfare ring -->
              <div
                class="absolute inset-0 rounded-full border-4"
                style="
                  width: 120%;
                  height: 120%;
                  left: -10%;
                  top: -10%;
                  border-color: {RARITY_CONFIG[$craftingSession.result.rarity].color};
                  animation: ringExpand 1s ease-out forwards;
                  opacity: 0.8;
                "
              ></div>

              <!-- Additional fanfare rings -->
              {#each [1, 2, 3] as ring}
                <div
                  class="absolute inset-0 rounded-full border-2"
                  style="
                    width: {100 + ring * 30}%;
                    height: {100 + ring * 30}%;
                    left: {-(ring * 15)}%;
                    top: {-(ring * 15)}%;
                    border-color: {RARITY_CONFIG[$craftingSession.result.rarity].color};
                    animation: ringExpand {1 + ring * 0.2}s ease-out {ring * 0.15}s forwards;
                    opacity: {0.6 - ring * 0.15};
                  "
                ></div>
              {/each}

              <!-- Burst particles -->
              <div class="absolute inset-0 pointer-events-none">
                {#each Array(40) as _, i}
                  <div
                    class="absolute h-2 w-2 rounded-full"
                    style="
                      left: 50%;
                      top: 50%;
                      background: {RARITY_CONFIG[$craftingSession.result.rarity].color};
                      animation: burst 0.8s ease-out {i * 0.02}s forwards;
                      --angle: {i * 9}deg;
                    "
                  ></div>
                {/each}
              </div>

              <!-- Corner sparkles -->
              {#each ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as corner}
                <div
                  class="absolute h-8 w-8 animate-pulse"
                  style="
                    {corner}: -20px;
                    background: radial-gradient(circle, {RARITY_CONFIG[$craftingSession.result.rarity].color} 0%, transparent 70%);
                    animation-delay: {corner === 'top-left' ? '0s' : corner === 'top-right' ? '0.1s' : corner === 'bottom-left' ? '0.2s' : '0.3s'};
                  "
                ></div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Success/Failure Indicator -->
    {#if phase === 'revealing' && $craftingSession}
      <div class="mt-8 text-center">
        {#if $craftingSession.status === 'success'}
          <p class="text-2xl font-bold text-green-400 animate-bounce">
            ✓ Crafting Successful!
          </p>
          <p class="text-lg text-white mt-2">
            You crafted a {$craftingSession.result?.rarity || ''} card!
          </p>
        {:else}
          <p class="text-2xl font-bold text-red-400 animate-pulse">
            ✗ Crafting Failed
          </p>
          <p class="text-lg text-gray-400 mt-2">
            Better luck next time!
          </p>
        {/if}
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
      transform: translateY(-15px);
    }
  }

  @keyframes converge {
    0% {
      transform: scale(0.8) translateX(0);
      opacity: 1;
    }
    100% {
      transform: scale(0.3) translateX(0);
      opacity: 0.3;
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.1);
      opacity: 1;
    }
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes coreGlow {
    0% {
      box-shadow: 0 0 50px 20px rgba(251, 191, 36, 0.9);
    }
    100% {
      box-shadow: 0 0 80px 30px rgba(251, 191, 36, 1);
    }
  }

  @keyframes cardReveal {
    0% {
      transform: scale(0) rotate(180deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.3) rotate(90deg);
      opacity: 0.8;
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  @keyframes ringExpand {
    0% {
      transform: scale(0.5);
      opacity: 1;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  @keyframes burst {
    0% {
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(cos(var(--angle)) * 200px, sin(var(--angle)) * 200px) scale(0);
      opacity: 0;
    }
  }
</style>
