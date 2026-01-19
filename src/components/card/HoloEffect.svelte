<script lang="ts">
  import type { PackCard } from '../../types';
  import { onMount, onDestroy } from 'svelte';

  export let card: PackCard;
  export let mouseX: number = 0.5;
  export let mouseY: number = 0.5;
  export let interactive: boolean = true;

  // Device orientation support for gyroscope
  let gamma = 0; // Left/Right tilt (-90 to 90)
  let beta = 0;  // Front/Back tilt (-180 to 180)
  let hasGyroscope = false;

  // Time-based animation for prismatic cards
  let time = 0;
  let animationFrameId: number | null = null;

  // Performance detection
  let isBrowser = typeof window !== 'undefined';
  let effectsEnabled = true;

  // Check device capabilities on mount
  onMount(() => {
    if (!isBrowser) return;

    // Check for low-end devices
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 8;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Disable on low-end devices
    effectsEnabled = !(isMobile && (hardwareConcurrency < 4 || memory < 4));

    // Request device orientation permission for iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined') {
      const requestPermission = (DeviceOrientationEvent as any).requestPermission;

      if (typeof requestPermission === 'function') {
        requestPermission()
          .then((response: string) => {
            if (response === 'granted') {
              setupGyroscope();
            }
          })
          .catch(() => {
            // Permission denied - fall back to mouse only
          });
      } else {
        // Non-iOS devices don't need permission
        setupGyroscope();
      }
    }

    // Start animation loop for prismatic cards
    if (card.holoType === 'prismatic' || card.holoType === 'full_art') {
      animationFrameId = requestAnimationFrame(animate);
    }
  });

  onDestroy(() => {
    if (animationFrameId !== null && isBrowser) {
      cancelAnimationFrame(animationFrameId);
    }
    removeGyroscope();
  });

  function setupGyroscope() {
    if (!isBrowser) return;

    // Check if device orientation is supported
    if (window.DeviceOrientationEvent) {
      hasGyroscope = true;
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
  }

  function removeGyroscope() {
    if (!isBrowser) return;
    if (hasGyroscope) {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    }
  }

  function handleDeviceOrientation(event: DeviceOrientationEvent) {
    if (!interactive || !effectsEnabled) return;

    // Gamma: Left/Right tilt (-90 to 90 degrees)
    if (event.gamma !== null) {
      gamma = Math.max(-90, Math.min(90, event.gamma));
    }

    // Beta: Front/Back tilt (-180 to 180 degrees)
    if (event.beta !== null) {
      beta = Math.max(-180, Math.min(180, event.beta));
    }
  }

  function animate(t: number) {
    time = t;
    if (isBrowser && effectsEnabled) {
      animationFrameId = requestAnimationFrame(animate);
    }
  }

  // Normalize gyroscope values to 0-1 range for CSS
  $: normalizedGamma = (gamma + 90) / 180; // 0 to 1
  $: normalizedBeta = (beta + 180) / 360; // 0 to 1

  // Use gyroscope if available, otherwise fall back to mouse
  $: xPosition = hasGyroscope ? normalizedGamma : mouseX;
  $: yPosition = hasGyroscope ? normalizedBeta : mouseY;

  // Calculate gradient angle based on position
  $: gradientAngle = xPosition * 360;

  // Gradient definitions for different holo types
  $: holoGradient = (() => {
    switch (card.holoType) {
      case 'standard':
        return `linear-gradient(${gradientAngle}deg,
          rgba(255,0,0,0.15),
          rgba(255,127,0,0.13),
          rgba(255,255,0,0.15),
          rgba(0,255,0,0.13),
          rgba(0,0,255,0.15),
          rgba(75,0,130,0.13),
          rgba(148,0,211,0.15)
        )`;

      case 'reverse':
        return `linear-gradient(135deg,
          transparent 45%,
          rgba(255,255,255,0.08) 50%,
          transparent 55%
        )`;

      case 'full_art':
        return `linear-gradient(${time * 0.05}deg,
          rgba(255,0,0,0.2),
          rgba(255,127,0,0.18),
          rgba(255,255,0,0.2),
          rgba(0,255,0,0.18),
          rgba(0,0,255,0.2),
          rgba(75,0,130,0.18),
          rgba(148,0,211,0.2)
        )`;

      case 'prismatic':
        return `linear-gradient(${time * 0.1}deg,
          rgba(255,0,128,0.25),
          rgba(128,0,255,0.23),
          rgba(0,128,255,0.25),
          rgba(0,255,255,0.23),
          rgba(0,255,128,0.25),
          rgba(128,255,0,0.23),
          rgba(255,255,0,0.25),
          rgba(255,128,0,0.23)
        )`;

      default:
        return 'none';
    }
  })();

  // Radial highlight gradient
  $: highlightGradient = `radial-gradient(
    circle at ${xPosition * 100}% ${yPosition * 100}%,
    rgba(255,255,255,${card.holoType === 'prismatic' ? 0.5 : card.holoType === 'full_art' ? 0.4 : 0.3}) 0%,
    transparent ${card.holoType === 'prismatic' ? 40 : 50}%
  )`;

  // Animation class based on holo type
  $: animationClass = (() => {
    if (!effectsEnabled) return '';

    switch (card.holoType) {
      case 'full_art':
        return 'holo-sheen';
      case 'prismatic':
        return 'prismatic-holo';
      default:
        return '';
    }
  })();
</script>

{#if card.isHolo && effectsEnabled}
  <div
    class="holo-effect absolute inset-0 pointer-events-none z-10"
    class:{animationClass}
    style="
      background: {holoGradient};
      mix-blend-mode: color-dodge;
    "
  ></div>

  <div
    class="absolute inset-0 pointer-events-none z-10"
    style="
      background: {highlightGradient};
      backdrop-filter: brightness(1.1) saturate(1.2);
      -webkit-backdrop-filter: brightness(1.1) saturate(1.2);
    "
  ></div>

  {#if card.holoType === 'reverse'}
    <div
      class="absolute inset-0 pointer-events-none z-10"
      style="
        background: linear-gradient(135deg,
          transparent 45%,
          rgba(255,255,255,0.08) 50%,
          transparent 55%
        );
        backdrop-filter: blur(0.5px);
        -webkit-backdrop-filter: blur(0.5px);
      "
    ></div>
  {/if}
{/if}

<style>
  .holo-effect {
    transition: background 0.3s ease-out;
    will-change: background;
  }

  .holo-sheen {
    animation: holo-sheen 8s linear infinite;
    will-change: filter, background;
  }

  .prismatic-holo {
    animation: prismatic-shift 6s linear infinite;
    will-change: filter, background;
  }

  @keyframes holo-sheen {
    0%, 100% {
      opacity: 0.7;
    }
    50% {
      opacity: 0.9;
    }
  }

  @keyframes prismatic-shift {
    0% {
      filter: hue-rotate(0deg) brightness(1);
    }
    50% {
      filter: hue-rotate(180deg) brightness(1.1);
    }
    100% {
      filter: hue-rotate(360deg) brightness(1);
    }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .holo-sheen,
    .holo-effect {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
