<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import type { PackCard } from '@/types';

// Animation phases: 'idle' | 'tearing' | 'revealing' | 'showing'
let phase = $state<'idle' | 'tearing' | 'revealing' | 'showing'>('idle');
let animationFrame: number | null = null;
let containerElement = $state<HTMLDivElement | null>(null);
let leftHalf = $state<HTMLDivElement | null>(null);
let rightHalf = $state<HTMLDivElement | null>(null);

// Sample cards for preview (will flash briefly)
const previewCards: PackCard[] = [
  {
    id: 'preview_1',
    name: 'Grillmaster Gary',
    subtitle: 'The Flame Keeper',
    type: 'BBQ_DAD',
    rarity: 'rare',
    artwork: '/images/cards/bbq-dad-001.png',
    stats: {
      dadJoke: 75,
      grillSkill: 95,
      fixIt: 40,
      napPower: 30,
      remoteControl: 50,
      thermostat: 60,
      sockSandal: 45,
      beerSnob: 70,
    },
    flavorText: '"Propane is just a suggestion."',
    abilities: [
      {
        name: 'Perfect Sear',
        description: 'Flip a burger. If it lands rare, gain +10 Grill Skill.',
      },
    ],
    series: 1,
    cardNumber: 1,
    totalInSeries: 50,
    artist: 'AI Assistant',
    isRevealed: false,
    isHolo: true,
    holoType: 'reverse',
  },
  {
    id: 'preview_2',
    name: 'Lawn Lieutenant Larry',
    subtitle: 'Keeper of the Green',
    type: 'LAWN_DAD',
    rarity: 'epic',
    artwork: '/images/cards/lawn-dad-001.png',
    stats: {
      dadJoke: 60,
      grillSkill: 30,
      fixIt: 50,
      napPower: 45,
      remoteControl: 40,
      thermostat: 55,
      sockSandal: 80,
      beerSnob: 50,
    },
    flavorText: '"The grass is always greener when you water it at 5 AM."',
    abilities: [
      {
        name: 'Precision Cut',
        description: 'Gain +20 Thermostat when mowing in diagonal patterns.',
      },
    ],
    series: 1,
    cardNumber: 15,
    totalInSeries: 50,
    artist: 'AI Assistant',
    isRevealed: false,
    isHolo: true,
    holoType: 'standard',
  },
];

let currentCardIndex = $state(0);
let showCardFlash = $state(false);
let tearProgress = $state(0);
let loopTimeout: number | null = null;

function startAnimation() {
  phase = 'tearing';
  tearProgress = 0;
  showCardFlash = false;

  // Animate tear effect
  const tearDuration = 600; // 0.6s for tear
  const tearStart = performance.now();

  function animateTear(now: number) {
    const elapsed = now - tearStart;
    tearProgress = Math.min(elapsed / tearDuration, 1);

    if (tearProgress < 1) {
      animationFrame = requestAnimationFrame(animateTear);
    } else {
      // Tear complete, show cards
      phase = 'revealing';
      showCardFlash = true;
      currentCardIndex = 0;

      // Flash each card briefly
      setTimeout(() => {
        currentCardIndex = 1;
      }, 400);

      // After showing cards, reset and loop
      setTimeout(() => {
        phase = 'idle';
        showCardFlash = false;
        loopTimeout = window.setTimeout(startAnimation, 500);
      }, 1400);
    }
  }

  animationFrame = requestAnimationFrame(animateTear);
}

function handleTryNow() {
  window.location.href = '/pack';
}

onMount(() => {
  // Start animation loop after a short delay
  loopTimeout = window.setTimeout(startAnimation, 1000);

  return () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (loopTimeout) clearTimeout(loopTimeout);
  };
});

onDestroy(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  if (loopTimeout) clearTimeout(loopTimeout);
});
</script>

<section class="relative py-20 px-4 overflow-hidden" bind:this={containerElement}>
  <!-- Background gradient -->
  <div class="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"></div>

  <!-- Animated background particles -->
  <div class="absolute inset-0 opacity-20">
    <div class="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
    <div
      class="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"
      style="animation-delay: 0.5s;"
    ></div>
    <div
      class="absolute bottom-1/4 left-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
      style="animation-delay: 1s;"
    ></div>
  </div>

  <div class="relative max-w-4xl mx-auto text-center">
    <!-- Section title -->
    <h2 class="text-4xl md:text-5xl font-black mb-4">
      <span class="text-white">Experience the</span>
      <span class="text-amber-400"> Thrill</span>
    </h2>
    <p class="text-slate-400 text-lg mb-12 max-w-2xl mx-auto">
      Watch the pack tear open and reveal rare cards. Every pack is a chance to find something
      legendary.
    </p>

    <!-- Animation container -->
    <div class="relative flex justify-center items-center mb-12" style="height: 450px;">
      {#if phase === 'idle' || phase === 'tearing'}
        <!-- Pack before/during tear -->
        <div class="relative" style="perspective: 1000px;">
          <!-- Glow effect -->
          <div
            class="absolute inset-0 bg-gradient-to-r from-amber-500/40 to-orange-500/40 blur-3xl rounded-3xl"
            class:animate-pulse={phase === 'tearing'}
          ></div>

          <!-- Pack container -->
          <div class="relative w-64 h-96 md:w-72 md:h-[420px]">
            <!-- Left half of pack -->
            <div
              bind:this={leftHalf}
              class="pack-half absolute inset-0 rounded-2xl overflow-hidden"
              style="transform-origin: left center;"
              class:tearing-left={phase === 'tearing'}
            >
              <div
                class="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-4 border-amber-500/50 rounded-2xl"
              >
                <div class="absolute inset-4 border-2 border-amber-500/30 rounded-xl"></div>

                <div class="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <div class="text-center">
                    <div class="text-4xl md:text-5xl font-bold mb-1">
                      <span class="text-amber-400">Dad</span><span class="text-white">Deck</span>
                    </div>
                    <div class="text-amber-400/80 text-sm mb-6">SERIES 1</div>

                    <div
                      class="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-6 border-2 border-amber-500/30"
                    >
                      <span class="text-6xl">👔</span>
                    </div>

                    <div class="text-white font-bold text-lg">BOOSTER PACK</div>
                    <div class="text-slate-400 text-sm">6 Cards Inside</div>
                  </div>
                </div>

                <!-- Shimmer effect -->
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none"
                ></div>
              </div>

              <!-- Tear line (visible on left half) -->
              {#if phase === 'tearing'}
                <div
                  class="absolute right-0 top-0 bottom-0 w-1 bg-amber-400/80 shadow-lg shadow-amber-400/50"
                ></div>
              {/if}
            </div>

            <!-- Right half of pack -->
            <div
              bind:this={rightHalf}
              class="pack-half absolute inset-0 rounded-2xl overflow-hidden"
              style="transform-origin: right center;"
              class:tearing-right={phase === 'tearing'}
            >
              <div
                class="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-4 border-amber-500/50 rounded-2xl"
              >
                <div class="absolute inset-4 border-2 border-amber-500/30 rounded-xl"></div>

                <!-- Mirrored content for right half -->
                <div
                  class="absolute inset-0 flex flex-col items-center justify-center p-8"
                  style="transform: scaleX(-1);"
                >
                  <div class="text-center" style="transform: scaleX(-1);">
                    <div class="text-4xl md:text-5xl font-bold mb-1">
                      <span class="text-amber-400">Dad</span><span class="text-white">Deck</span>
                    </div>
                    <div class="text-amber-400/80 text-sm mb-6">SERIES 1</div>

                    <div
                      class="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-6 border-2 border-amber-500/30"
                    >
                      <span class="text-6xl">👔</span>
                    </div>

                    <div class="text-white font-bold text-lg">BOOSTER PACK</div>
                    <div class="text-slate-400 text-sm">6 Cards Inside</div>
                  </div>
                </div>

                <!-- Shimmer effect -->
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none"
                ></div>
              </div>

              <!-- Tear line (visible on right half) -->
              {#if phase === 'tearing'}
                <div
                  class="absolute left-0 top-0 bottom-0 w-1 bg-amber-400/80 shadow-lg shadow-amber-400/50"
                ></div>
              {/if}
            </div>
          </div>
        </div>
      {:else}
        <!-- Revealed cards -->
        <div class="flex gap-6 items-center justify-center">
          {#each previewCards as card, index}
            <div
              class="card-flash-container"
              class:visible={currentCardIndex >= index}
              style="animation-delay: {index * 200}ms;"
            >
              <!-- Mini card preview -->
              <div
                class="relative w-40 h-56 rounded-xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-105"
              >
                <!-- Card background based on rarity -->
                <div
                  class="absolute inset-0"
                  class:bg-rare={card.rarity === 'rare'}
                  class:bg-epic={card.rarity === 'epic'}
                ></div>

                <!-- Card content -->
                <div
                  class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center"
                >
                  <div class="text-3xl mb-2">
                    {card.type === 'BBQ_DAD' ? '🔥' : '🌱'}
                  </div>
                  <div class="text-white font-bold text-sm leading-tight">{card.name}</div>
                  <div
                    class="text-xs mt-1 px-2 py-0.5 rounded-full font-black"
                    class:bg-rare={card.rarity === 'rare'}
                    class:bg-epic={card.rarity === 'epic'}
                  >
                    {card.rarity.toUpperCase()}
                  </div>
                  {#if card.isHolo}
                    <div
                      class="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-black bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                    >
                      HOLO
                    </div>
                  {/if}
                </div>

                <!-- Glow effect -->
                <div
                  class="absolute inset-0 pointer-events-none"
                  class:glow-rare={card.rarity === 'rare'}
                  class:glow-epic={card.rarity === 'epic'}
                ></div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Try It Now button -->
    <button
      onclick={handleTryNow}
      class="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
    >
      <span class="relative z-10 flex items-center gap-2">
        Try It Now
        <svg
          class="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          ></path>
        </svg>
      </span>

      <!-- Shimmer effect on button -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:animate-shimmer-fast"
      ></div>
    </button>
  </div>
</section>

<style>
/* 60fps optimized animations using transforms and opacity */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes shimmer-fast {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 3s ease-in-out infinite;
}

:global(.group:hover .group-hover\:animate-shimmer-fast) {
  animation: shimmer-fast 1.5s ease-in-out;
}

/* Pack tear animation using transform for GPU acceleration */
.pack-half {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.tearing-left {
  transform: rotateY(-25deg) translateX(-20px);
  opacity: 0.7;
}

.tearing-right {
  transform: rotateY(25deg) translateX(20px);
  opacity: 0.7;
}

/* Card flash animation */
.card-flash-container {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-flash-container.visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Card rarity backgrounds */
.bg-rare {
  background: linear-gradient(135deg, #1e3a8a, #1e293b);
  border: 3px solid #fbbf24;
}

.bg-epic {
  background: linear-gradient(135deg, #581c87, #312e81);
  border: 3px solid #a855f7;
}

/* Glow effects */
.glow-rare {
  box-shadow:
    0 0 20px rgba(251, 191, 36, 0.4),
    0 0 40px rgba(251, 191, 36, 0.2);
  animation: glow-pulse-rare 2s ease-in-out infinite;
}

.glow-epic {
  box-shadow:
    0 0 25px rgba(168, 85, 247, 0.5),
    0 0 50px rgba(168, 85, 247, 0.3);
  animation: glow-pulse-epic 2s ease-in-out infinite;
}

@keyframes glow-pulse-rare {
  0%,
  100% {
    box-shadow:
      0 0 20px rgba(251, 191, 36, 0.4),
      0 0 40px rgba(251, 191, 36, 0.2);
  }
  50% {
    box-shadow:
      0 0 30px rgba(251, 191, 36, 0.6),
      0 0 60px rgba(251, 191, 36, 0.4);
  }
}

@keyframes glow-pulse-epic {
  0%,
  100% {
    box-shadow:
      0 0 25px rgba(168, 85, 247, 0.5),
      0 0 50px rgba(168, 85, 247, 0.3);
  }
  50% {
    box-shadow:
      0 0 35px rgba(168, 85, 247, 0.7),
      0 0 70px rgba(168, 85, 247, 0.5);
  }
}

/* Optimize animations for 60fps */
@media (prefers-reduced-motion: reduce) {
  .pack-half,
  .card-flash-container,
  .animate-shimmer,
  :global(.group:hover .group-hover\:animate-shimmer-fast),
  .glow-rare,
  .glow-epic {
    animation: none !important;
    transition: none !important;
  }
}
</style>
