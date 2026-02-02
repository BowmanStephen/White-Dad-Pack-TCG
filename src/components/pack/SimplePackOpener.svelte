<script lang="ts">
import { onMount } from 'svelte';
import { packState, currentPack, openPack, resetPack } from '@/stores/simple-pack';
import type { Pack, PackState } from '@/stores/simple-pack';
import SimpleCard from '@/components/card/SimpleCard.svelte';

// Local reactive state - use different names than the stores
let uiState: PackState = $state('idle');
let packData: Pack | null = $state(null);

onMount(() => {
  // Initial values from stores
  uiState = packState.get();
  packData = currentPack.get();

  // Subscribe to store changes
  const unsubState = packState.subscribe((s: PackState) => {
    uiState = s;
  });
  const unsubPack = currentPack.subscribe((p: Pack | null) => {
    packData = p;
  });

  return () => {
    unsubState();
    unsubPack();
  };
});

async function handleOpenPack() {
  await openPack();
}

function handleOpenAnother() {
  resetPack();
}
</script>

<div class="max-w-7xl mx-auto px-4 py-8 min-h-screen">
  {#if uiState === 'idle'}
    <!-- LATE NIGHT INFOMERCIAL HERO -->
    <div class="text-center relative">
      <!-- Starburst background -->
      <div
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fuchsia-900/40 via-purple-900/20 to-transparent blur-3xl"
      ></div>

      <div class="relative z-10">
        <!-- Main Headline with chrome effect -->
        <h1
          class="text-5xl md:text-7xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-orange-600"
          style="text-shadow: 0 0 60px rgba(234,179,8,0.6), 0 0 100px rgba(234,179,8,0.3); filter: drop-shadow(0 4px 8px rgba(0,0,0,0.8));"
        >
          UNLOCK DAD CARDS!
        </h1>

        <p
          class="text-xl md:text-2xl text-fuchsia-300 font-bold mb-2 uppercase tracking-widest"
          style="text-shadow: 0 0 20px rgba(192,38,211,0.8);"
        >
          ★ Collect Them All ★
        </p>

        <p class="text-lg text-purple-200/80 mb-10 max-w-2xl mx-auto">
          Over 50 ridiculous suburban dad cards waiting to be discovered!
        </p>

        <!-- MEGA PACK BUTTON -->
        <div class="relative inline-block group">
          <!-- Glow effect -->
          <div
            class="absolute -inset-1 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"
          ></div>

          <button
            onclick={handleOpenPack}
            class="relative inline-flex items-center justify-center px-16 py-8 text-2xl font-black text-white uppercase tracking-wider bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 rounded-2xl hover:scale-105 transition-transform duration-200 overflow-hidden"
            style="box-shadow: 0 0 80px rgba(168,85,247,0.6), inset 0 1px 0 rgba(255,255,255,0.3);"
          >
            <!-- Shine effect -->
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
            ></div>

            <span class="mr-4 text-4xl animate-bounce">🎁</span>
            <span class="relative z-10">OPEN FREE PACK!</span>
          </button>
        </div>

        <!-- Trust badges -->
        <div
          class="flex justify-center gap-6 mt-8 text-sm font-bold text-cyan-300/70 uppercase tracking-wider"
        >
          <span>✓ No Credit Card</span>
          <span>✓ Instant Delivery</span>
          <span>✓ 100% Hilarious</span>
        </div>
      </div>
    </div>
  {:else if uiState === 'opening'}
    <!-- DRUMROLL MOMENT -->
    <div class="text-center py-20">
      <div class="relative inline-block">
        <!-- Pulsing mystery box -->
        <div
          class="w-40 h-56 bg-gradient-to-br from-pink-600 via-purple-600 to-cyan-600 rounded-2xl animate-pulse shadow-2xl"
          style="box-shadow: 0 0 60px rgba(168,85,247,0.8);"
        ></div>

        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-6xl animate-bounce">🎁</span>
        </div>

        <!-- Sparkle effects -->
        <div class="absolute -top-4 -left-4 text-yellow-400 text-2xl animate-ping">✨</div>
        <div
          class="absolute -bottom-4 -right-4 text-yellow-400 text-2xl animate-ping"
          style="animation-delay: 0.5s;"
        >
          ✨
        </div>
      </div>

      <p
        class="mt-10 text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 animate-pulse uppercase tracking-widest"
      >
        Unpacking...
      </p>
    </div>
  {:else if uiState === 'revealed' && packData}
    <!-- RESULTS - TREASURE REVEAL -->
    <div class="text-center mb-10">
      <!-- Victory headline -->
      <h2 class="text-4xl md:text-6xl font-black mb-4">
        <span
          class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-500"
          style="filter: drop-shadow(0 0 30px rgba(234,179,8,0.6));"
        >
          ★ JACKPOT! ★
        </span>
      </h2>

      <p class="text-xl text-purple-200 font-bold uppercase tracking-widest">
        You Unlocked {packData.cards.length} Epic Dad Cards!
      </p>
    </div>

    <!-- Cards Grid with stagger animation -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
      {#each packData.cards as card, i}
        <div class="animate-reveal" style="animation-delay: {i * 0.1}s;">
          <SimpleCard {card} size="md" />
        </div>
      {/each}
    </div>

    <!-- CTA to open another -->
    <div class="text-center">
      <div class="relative inline-block group">
        <div
          class="absolute -inset-1 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-500"
        ></div>

        <button
          onclick={handleOpenAnother}
          class="relative inline-flex items-center justify-center px-12 py-6 text-xl font-black text-white uppercase tracking-wider bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-xl hover:scale-105 transition-transform duration-200"
          style="box-shadow: 0 0 50px rgba(59,130,246,0.5);"
        >
          <span class="mr-3 text-3xl">🎯</span>
          OPEN ANOTHER PACK!
        </button>
      </div>

      <p class="mt-4 text-cyan-300/60 text-sm font-bold uppercase tracking-wider">
        Collect them all! No purchase necessary!
      </p>
    </div>
  {/if}
</div>

<style>
@keyframes reveal {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.8);
  }
  50% {
    transform: translateY(-10px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-reveal {
  opacity: 0;
  animation: reveal 0.6s ease-out forwards;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 1s ease-in-out infinite;
}

@keyframes ping {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.75;
  }
  50% {
    opacity: 1;
  }
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}
</style>
