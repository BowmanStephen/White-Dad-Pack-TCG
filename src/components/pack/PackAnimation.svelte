<script lang="ts">
import { onMount } from 'svelte';
import type { Rarity, PackDesign, TearAnimation } from '@/types';
import {
  RARITY_CONFIG,
  PACK_DESIGN_CONFIG,
  TEAR_ANIMATION_CONFIG,
  type TearAnimationConfig,
} from '@/types';
import * as uiStore from '@/stores/ui';
import * as packStore from '@/stores/pack';
import { quickReveal as quickRevealStore } from '@/stores/ui';
import { playPackTear } from '@/stores/audio';
import { isReducedMotion } from '@/stores/motion';
import {
  ANIMATION_TIMINGS,
  TEAR_GESTURE_CONFIG,
  HAPTIC_PATTERNS,
  RARITY_ANIMATION_MODIFIERS,
} from '@/lib/config/pack-config';
import {
  getVisualEffectsForRarity,
  triggerRarityHaptic,
  isLegendaryPlus as checkLegendaryPlus,
} from '@/lib/effects/rarity-effects';

interface Props {
  bestRarity?: Rarity;
  design?: PackDesign;
  tearAnimation?: TearAnimation;
  oncomplete?: () => void;
  onskip?: () => void;
}

let {
  bestRarity = 'common',
  design = 'standard',
  tearAnimation = 'standard',
  oncomplete,
  onskip,
}: Props = $props();

// Helper to dispatch events in both legacy and modern style
function dispatch(event: 'complete' | 'skip') {
  if (event === 'complete' && oncomplete) oncomplete();
  if (event === 'skip' && onskip) onskip();
}

let phase = $state<'appear' | 'glow' | 'tear' | 'burst'>('appear');
let packElement: HTMLDivElement;
let animationFrameId: number | null = null;
let particles = $state<
  Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }>
>([]);
let reducedMotion = $state(false);

// Swipe-to-tear gesture state
let touchStartX = $state(0);
let isDragging = $state(false);
let tearProgress = $state(0);

// Hover and interaction state for shake animations
let isHovered = $state(false);
let isHolding = $state(false);

// Derived values - converted from Svelte 4 $: to Svelte 5 $derived
const rarityConfig = $derived(RARITY_CONFIG[bestRarity]);
const packDesign = $derived(PACK_DESIGN_CONFIG[design]);
const glowColor = $derived(rarityConfig.glowColor);

// PACK-027: Get tear animation configuration
const tearConfig = $derived(TEAR_ANIMATION_CONFIG[tearAnimation]);

// Get cinematic configuration
const cinematicConfig = $derived(uiStore.getCinematicConfig());
const isCinematic = $derived(uiStore.cinematicMode.get() === 'cinematic');

// Calculate particle count with tear animation and cinematic multipliers
const baseParticleCount = $derived(reducedMotion ? 0 : rarityConfig.particleCount);
const particleCount = $derived(
  Math.floor(baseParticleCount * tearConfig.particleCount * cinematicConfig.particleMultiplier)
);

// Animation timing (PACK-027: Varies by tear animation type)
// Base phase durations from centralized config, multiplied by tear animation config
const BASE_PHASE_DURATIONS = {
  appear: ANIMATION_TIMINGS.APPEAR_MS,
  glow: ANIMATION_TIMINGS.GLOW_MS,
  tear: ANIMATION_TIMINGS.TEAR_MS,
  burst: ANIMATION_TIMINGS.BURST_MS,
};

// PACK-VFX-015: Cinematic mode pack tear set to 1.8s
// Calculate tear duration based on cinematic mode vs normal mode
const tearDuration = $derived(
  isCinematic
    ? ANIMATION_TIMINGS.CINEMATIC_TEAR_MS
    : BASE_PHASE_DURATIONS.tear * tearConfig.phaseMultipliers.tear
);

const phaseDurations = $derived({
  appear:
    (BASE_PHASE_DURATIONS.appear * tearConfig.phaseMultipliers.appear) /
    cinematicConfig.speedMultiplier,
  glow:
    (BASE_PHASE_DURATIONS.glow * tearConfig.phaseMultipliers.glow) /
    cinematicConfig.speedMultiplier,
  tear: tearDuration, // PACK-VFX-015: Use calculated tear duration (1.8s in cinematic)
  burst:
    (BASE_PHASE_DURATIONS.burst * tearConfig.phaseMultipliers.burst) /
    cinematicConfig.speedMultiplier,
});

// PACK-027: Shake animation class based on tear animation intensity
const shakeClass = $derived(
  (() => {
    if (tearConfig.shakeIntensity === 'subtle') return 'animate-pack-shake-subtle';
    if (tearConfig.shakeIntensity === 'intense') return 'animate-pack-shake-intense';
    return 'animate-pack-shake';
  })()
);

// Rarity-specific effect state
let showScreenFlash = $state(false);
let showLightning = $state(false);
let showGoldenTrail = $state(false);

// Rarity tier helpers
const isLegendaryPlus = $derived(bestRarity === 'legendary' || bestRarity === 'mythic');
const isEpic = $derived(bestRarity === 'epic');
const isRare = $derived(bestRarity === 'rare');

// Rarity-specific shake intensity (overrides tear animation config for high rarities)
const effectiveShakeClass = $derived(
  (() => {
    if (isLegendaryPlus) return 'animate-pack-shake-legendary';
    if (isEpic) return 'animate-pack-shake-intense';
    return shakeClass;
  })()
);

const isShakeBase = $derived(phase === 'tear' && effectiveShakeClass === 'animate-pack-shake');
const isShakeSubtle = $derived(
  phase === 'tear' && effectiveShakeClass === 'animate-pack-shake-subtle'
);
const isShakeIntense = $derived(
  phase === 'tear' && effectiveShakeClass === 'animate-pack-shake-intense'
);
const isShakeLegendary = $derived(
  phase === 'tear' && effectiveShakeClass === 'animate-pack-shake-legendary'
);
const isShakeFestive = $derived(
  phase === 'tear' && effectiveShakeClass === 'animate-pack-shake-festive'
);
const isShakeGolden = $derived(
  phase === 'tear' && effectiveShakeClass === 'animate-pack-shake-golden'
);

// Trigger rarity-specific effects during tear phase
function triggerRarityEffects(): void {
  // Get visual effects configuration from centralized module
  const effects = getVisualEffectsForRarity(bestRarity);
  showScreenFlash = effects.screenFlash;
  showLightning = effects.lightning;
  showGoldenTrail = effects.goldenTrail;

  // Trigger haptic feedback based on rarity
  triggerRarityHaptic(bestRarity);
}

// Clear rarity effects
function clearRarityEffects(): void {
  showScreenFlash = false;
  showLightning = false;
  showGoldenTrail = false;
}

// Failsafe timer to prevent stuck animations
let failsafeTimer: ReturnType<typeof setTimeout> | null = null;

onMount(() => {
  // Subscribe to reduced motion preference (PACK-057)
  const unsubscribe = isReducedMotion.subscribe((value: boolean) => {
    reducedMotion = value;
  });

  // Set up failsafe timer - if animation gets stuck, force completion
  failsafeTimer = setTimeout(() => {
    console.warn('[PackAnimation] Failsafe triggered - forcing animation complete');
    dispatch('complete');
  }, ANIMATION_TIMINGS.FAILSAFE_TIMEOUT_MS);

  // Start animation
  runAnimation();

  // Cleanup function
  return () => {
    unsubscribe();
    // Clear failsafe timer
    if (failsafeTimer !== null) {
      clearTimeout(failsafeTimer);
      failsafeTimer = null;
    }
    // Cleanup animation frame
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }
  };
});

async function runAnimation() {
  // Check for quick reveal mode - skip to results after brief flash
  if (quickRevealStore.get()) {
    phase = 'appear';
    await delay(ANIMATION_TIMINGS.QUICK_REVEAL_FLASH_MS);
    // Clear failsafe timer since we're completing early
    if (failsafeTimer !== null) {
      clearTimeout(failsafeTimer);
      failsafeTimer = null;
    }
    dispatch('complete');
    return;
  }

  // Check if tear already completed via swipe gesture
  if (tearProgress >= TEAR_GESTURE_CONFIG.COMPLETE_PERCENTAGE) {
    // Skip tear phase if already completed
    phase = 'burst';
  } else {
    // Phase 1: Pack appears (with ease-out)
    phase = 'appear';
    await delay(phaseDurations.appear);

    // Phase 2: Pack glows (builds anticipation) - longer in cinematic mode and slow tear
    phase = 'glow';
    await delay(phaseDurations.glow);

    // Phase 3: Pack tears open (the main event) - only runs if not swiped
    phase = 'tear';

    // Trigger rarity-specific visual effects
    triggerRarityEffects();

    // Play pack tear sound effect (enhanced in cinematic mode)
    if (cinematicConfig.audioEnhanced) {
      // Play louder/dramatic tear sound in cinematic mode
      playPackTear();
    } else {
      playPackTear();
    }

    // Initialize particles for burst phase
    if (!reducedMotion) {
      initParticles();
      animateParticles();
    }

    // For legendary+ cards, add slow-mo effect
    const tearTime = isLegendaryPlus
      ? phaseDurations.tear * RARITY_ANIMATION_MODIFIERS.LEGENDARY_TEAR_MULTIPLIER
      : phaseDurations.tear;
    await delay(tearTime);

    // Clear effects before burst
    clearRarityEffects();
  }

  // Phase 4: Burst and fade
  phase = 'burst';
  await delay(phaseDurations.burst);

  // Stop particle animation
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // Reset tear progress
  tearProgress = 0;

  // Clear failsafe timer since we completed normally
  if (failsafeTimer !== null) {
    clearTimeout(failsafeTimer);
    failsafeTimer = null;
  }

  // Animation complete
  dispatch('complete');
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function handleClick() {
  // If tear is in progress (user swiping), skip to burst
  if (isDragging && tearProgress > 0) {
    handleCompleteTear();
  } else {
    // Normal click to skip
    dispatch('skip');
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === ' ' || event.key === 'Enter' || event.key === 'Escape') {
    dispatch('skip');
  }
}

function handleMouseEnter() {
  isHovered = true;
}

function handleMouseLeave() {
  isHovered = false;
  isHolding = false;
}

function handleMouseDown() {
  isHolding = true;
  // Initialize drag for swipe-to-tear (desktop)
  touchStartX = 0;
  isDragging = true;
  tearProgress = 0;
}

function handleMouseUp() {
  isHolding = false;
  isDragging = false;
  // Trigger tear if sufficient progress
  if (tearProgress >= TEAR_GESTURE_CONFIG.COMPLETE_PERCENTAGE) {
    handleCompleteTear();
  } else {
    tearProgress = 0;
  }
}

// Swipe-to-tear gesture handlers (mobile)
function handleTouchStart(event: TouchEvent) {
  touchStartX = event.touches[0].clientX;
  isDragging = true;
  tearProgress = 0;
}

function handleTouchMove(event: TouchEvent) {
  if (!isDragging) return;

  const currentX = event.touches[0].clientX;
  const deltaX = currentX - touchStartX;

  // Calculate tear progress (normalized to 0-1)
  tearProgress = Math.min(1, Math.max(0, deltaX / TEAR_GESTURE_CONFIG.THRESHOLD_PX));

  // Only prevent scrolling when actively tearing the pack (not just touching)
  // This allows users to scroll the page when not performing a tear gesture
  if (tearProgress > TEAR_GESTURE_CONFIG.VISUAL_FEEDBACK_THRESHOLD) {
    event.preventDefault();
    phase = 'tear';
  }
}

function handleTouchEnd(event: TouchEvent) {
  isDragging = false;

  // Trigger tear if sufficient progress
  if (tearProgress >= TEAR_GESTURE_CONFIG.COMPLETE_PERCENTAGE) {
    handleCompleteTear();
  } else {
    tearProgress = 0;
  }
}

// Mouse drag handlers (desktop)
function handleMouseMove(event: MouseEvent) {
  if (!isDragging) return;

  const deltaX = event.movementX;
  tearProgress = Math.min(1, Math.max(0, tearProgress + deltaX / TEAR_GESTURE_CONFIG.THRESHOLD_PX));

  // Visual feedback: shake pack as tear progresses
  if (tearProgress > TEAR_GESTURE_CONFIG.VISUAL_FEEDBACK_THRESHOLD) {
    phase = 'tear';
  }
}

// Complete the tear animation
function handleCompleteTear() {
  isDragging = false;
  tearProgress = 0;
  // Haptic feedback (vibrate on mobile)
  if (navigator.vibrate) {
    navigator.vibrate(HAPTIC_PATTERNS.PACK_TEAR);
  }
  // Continue to next animation phase
  phase = 'burst';
}

// Particle system for tear burst (60fps optimized)
// Enhanced particle count in cinematic mode and tear animation
function initParticles() {
  particles = [];
  const count = particleCount || 10;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 2 + Math.random() * 3;
    particles.push({
      x: 50,
      y: 50,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 3,
      alpha: 1,
    });
  }
}

function animateParticles() {
  if (phase !== 'burst') return;

  // Update particle positions - slower in cinematic mode
  const speedFactor = cinematicConfig.speedMultiplier;
  particles = particles
    .map(p => ({
      ...p,
      x: p.x + p.vx * 0.3 * speedFactor,
      y: p.y + p.vy * 0.3 * speedFactor,
      alpha: p.alpha - 0.02 * speedFactor,
      size: p.size * 0.98,
    }))
    .filter(p => p.alpha > 0);

  if (particles.length > 0 && phase === 'burst') {
    animationFrameId = requestAnimationFrame(animateParticles);
  }
}
</script>

<div
  class="relative cursor-pointer"
  data-testid="pack-animation"
  bind:this={packElement}
  onclick={handleClick}
  onkeydown={handleKeydown}
  onmousedown={handleMouseDown}
  onmouseup={handleMouseUp}
  onmousemove={handleMouseMove}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  ontouchstart={handleTouchStart}
  ontouchmove={handleTouchMove}
  ontouchend={handleTouchEnd}
  role="button"
  tabindex="0"
  aria-label="Swipe to open pack or click to skip animation"
>
  <!-- Swipe instruction (shown on first load) -->
  {#if phase === 'glow'}
    <div
      class="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium animate-pulse"
    >
      Swipe to tear! →
    </div>
  {/if}

  <!-- Tear progress indicator -->
  {#if isDragging && tearProgress > 0}
    <div class="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
      <div
        class="w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-100"
        style="width: {tearProgress * 100}%"
      ></div>
    </div>
  {/if}

  <!-- RARITY EFFECTS: Screen flash for Legendary+ -->
  {#if showScreenFlash}
    <div
      class="fixed inset-0 z-50 pointer-events-none animate-screen-flash"
      style="background: {rarityConfig.glowColor};"
    ></div>
  {/if}

  <!-- RARITY EFFECTS: Lightning for Epic -->
  {#if showLightning}
    <div class="absolute inset-0 z-30 pointer-events-none overflow-hidden">
      <svg class="absolute inset-0 w-full h-full animate-lightning" viewBox="0 0 400 600">
        <path
          d="M 180 0 L 220 180 L 160 200 L 240 400 L 140 250 L 200 270 L 120 500"
          fill="none"
          stroke="#a855f7"
          stroke-width="4"
          stroke-linecap="round"
          class="animate-lightning-bolt"
          style="filter: drop-shadow(0 0 20px #a855f7) drop-shadow(0 0 40px #7c3aed);"
        />
      </svg>
    </div>
  {/if}

  <!-- RARITY EFFECTS: Golden trail for Rare -->
  {#if showGoldenTrail}
    <div class="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      <div
        class="absolute inset-0 animate-golden-trail"
        style="background: radial-gradient(ellipse at center, rgba(251, 191, 36, 0.4) 0%, transparent 70%);"
      ></div>
    </div>
  {/if}

  <!-- Glow effect (builds anticipation) -->
  <div
    class="absolute inset-0 rounded-2xl blur-3xl transition-all duration-300 ease-out"
    class:opacity-0={phase === 'appear'}
    class:opacity-40={phase === 'glow'}
    class:opacity-80={phase === 'tear' || phase === 'burst'}
    class:scale-125={phase === 'tear'}
    class:scale-150={phase === 'burst'}
    style:background={glowColor}
  ></div>

  <!-- Pack container -->
  <div
    class="relative w-64 h-96 md:w-80 md:h-[480px] transition-all duration-300 ease-out"
    class:scale-0={phase === 'appear'}
    class:scale-100={phase === 'glow'}
    class:scale-105={phase === 'tear'}
    class:scale-110={phase === 'burst'}
    class:opacity-0={phase === 'burst'}
    style:animation={phase === 'appear' ? 'packAppear 0.4s ease-out forwards' : 'none'}
  >
    <!-- Pack wrapper with shake during tear (PACK-027: dynamic shake based on tear animation) -->
    <div
      class="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-transform duration-200 ease-out"
      class:animate-pack-shake={isShakeBase}
      class:animate-pack-shake-subtle={isShakeSubtle}
      class:animate-pack-shake-intense={isShakeIntense}
      class:animate-pack-shake-legendary={isShakeLegendary}
      class:animate-pack-shake-festive={isShakeFestive}
      class:animate-pack-shake-golden={isShakeGolden}
      class:animate-pack-hover={isHovered && !isHolding && phase !== 'tear' && phase !== 'burst'}
      class:animate-pack-hold={isHolding && phase !== 'tear' && phase !== 'burst'}
    >
      <!-- Pack background - uses pack design gradient -->
      <div
        class="absolute inset-0 border-4 rounded-2xl transition-all duration-300 ease-out"
        style:background={`linear-gradient(to bottom right, ${packDesign.gradientStart}, ${packDesign.gradientEnd})`}
        style:border-color={phase === 'tear' || phase === 'burst'
          ? packDesign.primaryColor
          : packDesign.borderColor}
      >
        <!-- Inner pattern - uses pack design accent color -->
        <div
          class="absolute inset-4 border-2 rounded-xl"
          style:border-color={`${packDesign.accentColor}33`}
        ></div>

        <!-- Pack design overlay patterns -->
        {#if design === 'holiday'}
          <!-- Holiday snowflake pattern -->
          <div class="absolute inset-0 pointer-events-none opacity-20">
            <div class="absolute top-8 left-8 text-2xl">❄️</div>
            <div class="absolute top-16 right-12 text-xl">❄️</div>
            <div class="absolute bottom-20 left-12 text-lg">❄️</div>
            <div class="absolute top-32 left-16 text-xl">❄️</div>
            <div class="absolute bottom-32 right-8 text-2xl">❄️</div>
          </div>
        {:else if design === 'premium'}
          <!-- Premium gold foil pattern -->
          <div class="absolute inset-0 pointer-events-none opacity-30">
            <div
              class="absolute inset-0"
              style:background={`repeating-linear-gradient(45deg, transparent, transparent 10px, ${packDesign.accentColor}22 10px, ${packDesign.accentColor}22 20px)`}
            ></div>
          </div>
        {/if}

        <!-- Pack design -->
        <div class="absolute inset-0 flex flex-col items-center justify-center p-8">
          <!-- Logo area -->
          <div class="text-center mb-6">
            <div class="text-4xl md:text-5xl font-bold">
              <span style:color={packDesign.accentColor}>Dad</span><span class="text-white"
                >Deck</span
              >
            </div>
            <div style:color={`${packDesign.accentColor}cc`} class="text-sm mt-1">SERIES 1</div>
            <!-- Pack design badge -->
            {#if design !== 'standard'}
              <div
                class="mt-2 px-3 py-1 rounded-full text-xs font-bold"
                style:background={packDesign.primaryColor}
                style:color="white"
              >
                {packDesign.name.toUpperCase()}
              </div>
            {/if}
          </div>

          <!-- Pack art -->
          <div
            class="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center mb-6 border-2 transition-all duration-300 ease-out"
            style:background={`linear-gradient(135deg, ${rarityConfig.color}33, ${rarityConfig.color}11)`}
            style:border-color={`${rarityConfig.color}66`}
          >
            {#if design === 'holiday'}
              <span class="text-6xl md:text-7xl">🎄</span>
            {:else if design === 'premium'}
              <span class="text-6xl md:text-7xl">👑</span>
            {:else}
              <span class="text-6xl md:text-7xl">👔</span>
            {/if}
          </div>

          <!-- Pack info -->
          <div class="text-center">
            <div class="text-white font-bold text-lg">BOOSTER PACK</div>
            <div
              class:text-slate-400={design === 'standard'}
              class:text-red-200={design === 'holiday'}
              class:text-yellow-200={design === 'premium'}
              class="text-sm"
            >
              6 Cards Inside
            </div>
          </div>
        </div>

        <!-- Shimmer effect (anticipation) -->
        <div
          class="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-out"
          class:opacity-0={phase === 'appear' || phase === 'burst'}
          class:opacity-100={phase === 'glow' || phase === 'tear'}
          class:animate-shimmer={phase === 'glow' || phase === 'tear'}
          class:animate-shimmer-golden={phase === 'glow' ||
            (phase === 'tear' && design === 'premium')}
          style="background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%); background-size: 200% 100%;"
        ></div>

        <!-- SVG Tear effect overlay - different patterns per design -->
        {#if phase === 'tear' || phase === 'burst'}
          <div class="absolute inset-0 pointer-events-none">
            <svg viewBox="0 0 400 600" class="w-full h-full" style="overflow: visible;">
              {#if design === 'holiday'}
                <!-- Holiday: Zigzag tear like candy cane stripe -->
                <path
                  d="M 200 0 L 220 50 L 180 100 L 220 150 L 180 200 L 220 250 L 180 300 L 220 350 L 180 400 L 220 450 L 180 500 L 200 600"
                  fill="none"
                  stroke={packDesign.accentColor}
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="animate-tear-line"
                  style="filter: drop-shadow(0 0 8px {packDesign.primaryColor});"
                />
              {:else if design === 'premium'}
                <!-- Premium: Lightning bolt tear -->
                <path
                  d="M 200 0 L 185 100 L 210 150 L 180 200 L 215 250 L 175 300 L 220 350 L 170 400 L 225 450 L 165 500 L 200 600"
                  fill="none"
                  stroke={packDesign.accentColor}
                  stroke-width="5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="animate-tear-line-golden"
                  style="filter: drop-shadow(0 0 12px {packDesign.primaryColor});"
                />
              {:else}
                <!-- Standard: Classic jagged tear -->
                <path
                  d="M 200 0 L 195 100 L 205 150 L 192 200 L 208 250 L 193 300 L 207 350 L 194 400 L 206 450 L 195 500 L 205 600"
                  fill="none"
                  stroke={rarityConfig.color}
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="animate-tear-line"
                  style="filter: drop-shadow(0 0 8px {rarityConfig.color});"
                />
              {/if}
              <!-- Tear flare effect -->
              <circle
                cx="200"
                cy="300"
                r={phase === 'burst' ? 150 : 0}
                fill={design === 'premium' ? packDesign.accentColor : rarityConfig.color}
                fill-opacity="0.3"
                class="transition-all duration-300 ease-out"
                class:animate-burst-golden={design === 'premium'}
              />
            </svg>
          </div>
        {/if}

        <!-- White flash on tear -->
        {#if phase === 'tear'}
          <div class="absolute inset-0 bg-white/30 animate-flash-ease-out"></div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Particle burst (60fps optimized) -->
  {#if (phase === 'tear' || phase === 'burst') && !reducedMotion}
    <div class="absolute inset-0 pointer-events-none particle-container">
      {#each particles as particle, i}
        <div
          class="absolute rounded-full particle"
          style:left="{particle.x}%"
          style:top="{particle.y}%"
          style:width="{particle.size}px"
          style:height="{particle.size}px"
          style:background={rarityConfig.color}
          style:opacity={particle.alpha}
          style:transform="translate(-50%, -50%) translateZ(0)"
        ></div>
      {/each}
    </div>
  {/if}

  <!-- Skip hint - Persistent until burst ends + 500ms -->
  <div
    class="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-slate-400 text-sm transition-opacity duration-500 font-semibold"
    class:opacity-0={phase === 'burst'}
    role="status"
    aria-label="Interaction hint"
  >
    💡 Click or press Space to skip
  </div>
</div>

<style>
/* Pack appear animation - ease-out timing */
@keyframes packAppear {
  from {
    transform: scale(0) rotate(-15deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Pack shake animation - standard (ease-out timing) */
:global(.animate-pack-shake) {
  animation: packShake 0.5s ease-out;
}

@keyframes packShake {
  0%,
  100% {
    transform: translateX(0) rotate(0deg);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-4px) rotate(-0.5deg);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(4px) rotate(0.5deg);
  }
}

/* PACK-027: Subtle shake for slow-mo tear animation */
:global(.animate-pack-shake-subtle) {
  animation: packShakeSubtle 0.8s ease-out;
}

@keyframes packShakeSubtle {
  0%,
  100% {
    transform: translateX(0) rotate(0deg);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(-1px) rotate(-0.2deg);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(1px) rotate(0.2deg);
  }
}

/* PACK-027: Intense shake for explosive tear animation */
:global(.animate-pack-shake-intense) {
  animation: packShakeIntense 0.3s ease-out;
}

@keyframes packShakeIntense {
  0%,
  100% {
    transform: translateX(0) rotate(0deg);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-8px) rotate(-2deg);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(8px) rotate(2deg);
  }
}

/* Legendary+ shake - maximum drama with camera shake effect */
:global(.animate-pack-shake-legendary) {
  animation: packShakeLegendary 0.8s ease-out;
}

@keyframes packShakeLegendary {
  0%,
  100% {
    transform: translateX(0) translateY(0) rotate(0deg) scale(1);
  }
  10% {
    transform: translateX(-12px) translateY(-4px) rotate(-3deg) scale(1.02);
  }
  20% {
    transform: translateX(12px) translateY(4px) rotate(3deg) scale(1.02);
  }
  30% {
    transform: translateX(-10px) translateY(-2px) rotate(-2deg) scale(1.01);
  }
  40% {
    transform: translateX(10px) translateY(2px) rotate(2deg) scale(1.01);
  }
  50% {
    transform: translateX(-8px) translateY(-1px) rotate(-1.5deg) scale(1.005);
  }
  60% {
    transform: translateX(8px) translateY(1px) rotate(1.5deg) scale(1.005);
  }
  70% {
    transform: translateX(-4px) rotate(-1deg);
  }
  80% {
    transform: translateX(4px) rotate(1deg);
  }
  90% {
    transform: translateX(-2px) rotate(-0.5deg);
  }
}

/* Pack shake animation - holiday (festive bounce) */
:global(.animate-pack-shake-festive) {
  animation: packShakeFestive 0.5s ease-out;
}

@keyframes packShakeFestive {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateY(-6px) rotate(-2deg);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateY(-3px) rotate(2deg);
  }
}

/* Pack shake animation - premium (gentle sway) */
:global(.animate-pack-shake-golden) {
  animation: packShakeGolden 0.6s ease-out;
}

@keyframes packShakeGolden {
  0%,
  100% {
    transform: translateX(0) rotate(0deg);
  }
  25% {
    transform: translateX(-3px) rotate(-1deg);
  }
  50% {
    transform: translateX(3px) rotate(1deg);
  }
  75% {
    transform: translateX(-2px) rotate(-0.5deg);
  }
}

/* Subtle hover shake - indicates interactivity */
.animate-pack-hover {
  animation: packHoverShake 2s ease-in-out infinite;
}

@keyframes packHoverShake {
  0%,
  100% {
    transform: translateX(0) rotate(0deg);
  }
  25% {
    transform: translateX(-1px) rotate(-0.25deg);
  }
  75% {
    transform: translateX(1px) rotate(0.25deg);
  }
}

/* Intensified shake on hold - builds anticipation */
.animate-pack-hold {
  animation: packHoldShake 0.3s ease-in-out infinite;
}

@keyframes packHoldShake {
  0%,
  100% {
    transform: translateX(0) rotate(0deg);
  }
  20% {
    transform: translateX(-3px) rotate(-1deg);
  }
  40% {
    transform: translateX(3px) rotate(1deg);
  }
  60% {
    transform: translateX(-2px) rotate(-0.5deg);
  }
  80% {
    transform: translateX(2px) rotate(0.5deg);
  }
}

/* Shimmer effect - ease-in-out for smooth looping */
.animate-shimmer {
  animation: shimmer 1s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Shimmer effect - premium golden (slower, more luxurious) */
.animate-shimmer-golden {
  animation: shimmerGolden 1.5s ease-in-out infinite;
}

@keyframes shimmerGolden {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Flash effect - ease-out for smooth fade */
.animate-flash-ease-out {
  animation: flashEaseOut 0.3s ease-out forwards;
}

@keyframes flashEaseOut {
  0% {
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* Tear line animation - standard/ease-out */
.animate-tear-line {
  animation: tearLineDraw 0.5s ease-out forwards;
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
}

@keyframes tearLineDraw {
  to {
    stroke-dashoffset: 0;
  }
}

/* Tear line animation - premium golden (with glow pulse) */
.animate-tear-line-golden {
  animation:
    tearLineDrawGolden 0.5s ease-out forwards,
    tearLineGlow 0.5s ease-in-out infinite alternate;
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
}

@keyframes tearLineDrawGolden {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes tearLineGlow {
  from {
    filter: drop-shadow(0 0 8px gold);
  }
  to {
    filter: drop-shadow(0 0 16px gold);
  }
}

/* Burst animation - premium golden (expands more) */
.animate-burst-golden {
  animation: burstGolden 0.4s ease-out forwards;
}

@keyframes burstGolden {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* Performance optimization - only animate transform and opacity */
:global(.animate-pack-shake),
:global(.animate-pack-shake-festive),
:global(.animate-pack-shake-golden),
.animate-pack-hover,
.animate-pack-hold,
.animate-shimmer,
.animate-shimmer-golden,
.animate-flash-ease-out,
.animate-tear-line,
.animate-tear-line-golden,
.animate-burst-golden {
  will-change: transform, opacity;
  /* Performance: contain layout to prevent full reflows */
  contain: layout style paint;
}

/* GPU acceleration hint for pack container */
.relative.w-64.h-96 {
  transform: translateZ(0);
}

/* GPU acceleration for tear line */
.animate-tear-line,
.animate-tear-line-golden {
  transform: translateZ(0);
}

/* Swipe instruction pulse animation */
@keyframes pulse {
  0%,
  100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}

/* Particle performance optimizations */
.particle-container {
  contain: strict;
  transform: translateZ(0);
  will-change: contents;
}

.particle {
  will-change: transform, opacity;
  backface-visibility: hidden;
  perspective: 1000px;
  contain: layout style paint;
}

/* ============================================
     RARITY-SPECIFIC EFFECTS
     ============================================ */

/* Screen flash for Legendary+ pulls */
.animate-screen-flash {
  animation: screenFlash 0.6s ease-out forwards;
  pointer-events: none;
}

@keyframes screenFlash {
  0% {
    opacity: 0;
  }
  15% {
    opacity: 0.8;
  }
  30% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 0;
  }
}

/* Lightning effect for Epic pulls */
.animate-lightning {
  animation: lightningFlicker 0.4s ease-out;
}

@keyframes lightningFlicker {
  0%,
  100% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  20% {
    opacity: 0.3;
  }
  30% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  70% {
    opacity: 1;
  }
  90% {
    opacity: 0.2;
  }
}

.animate-lightning-bolt {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: lightningDraw 0.3s ease-out forwards;
}

@keyframes lightningDraw {
  to {
    stroke-dashoffset: 0;
  }
}

/* Golden trail for Rare pulls */
.animate-golden-trail {
  animation: goldenPulse 0.8s ease-in-out;
}

@keyframes goldenPulse {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  30% {
    opacity: 0.8;
    transform: scale(1.1);
  }
  60% {
    opacity: 0.6;
    transform: scale(1.2);
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}

/* Performance optimizations for rarity effects */
.animate-screen-flash,
.animate-lightning,
.animate-golden-trail {
  will-change: opacity, transform;
  contain: strict;
}
</style>
