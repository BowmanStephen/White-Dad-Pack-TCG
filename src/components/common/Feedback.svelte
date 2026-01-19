<script lang="ts">
  import { isReducedMotion } from '@/stores/motion';
  import { onMount } from 'svelte';

  // Props
  interface Props {
    type: 'success' | 'error';
    show?: boolean;
    message?: string;
    position?: 'center' | 'top' | 'bottom';
    size?: 'sm' | 'md' | 'lg';
  }

  let {
    type,
    show = true,
    message = '',
    position = 'center',
    size = 'md'
  }: Props = $props();

  // State
  let visible = $state(show);
  let animated = $state(false);
  let reducedMotion = $state(false);

  // Check for reduced motion preference
  $effect(() => {
    reducedMotion = isReducedMotion();
  });

  // Trigger animation on mount
  $effect(() => {
    if (show && !reducedMotion) {
      animated = true;
    }
  });

  // Size classes
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const iconSizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  // Animation styles
  const animations = `
    @keyframes checkmark-draw {
      0% {
        stroke-dashoffset: 100;
      }
      100% {
        stroke-dashoffset: 0;
      }
    }

    @keyframes shake {
      0%, 100% {
        transform: translateX(0);
      }
      10%, 30%, 50%, 70%, 90% {
        transform: translateX(-4px);
      }
      20%, 40%, 60%, 80% {
        transform: translateX(4px);
      }
    }

    @keyframes color-flash-success {
      0% {
        background-color: rgba(34, 197, 94, 0);
      }
      50% {
        background-color: rgba(34, 197, 94, 0.3);
      }
      100% {
        background-color: rgba(34, 197, 94, 0);
      }
    }

    @keyframes color-flash-error {
      0% {
        background-color: rgba(239, 68, 68, 0);
      }
      50% {
        background-color: rgba(239, 68, 68, 0.3);
      }
      100% {
        background-color: rgba(239, 68, 68, 0);
      }
    }

    @keyframes scale-in {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .checkmark-path {
      stroke-dasharray: 100;
      stroke-dashoffset: 100;
      animation: checkmark-draw 0.6s ease-out forwards;
    }

    .shake-animation {
      animation: shake 0.5s ease-in-out;
    }

    .color-flash-success {
      animation: color-flash-success 0.6s ease-out;
    }

    .color-flash-error {
      animation: color-flash-error 0.6s ease-out;
    }

    .scale-in {
      animation: scale-in 0.3s ease-out;
    }
  `;
</script>

<svelte:head>
  <style>{animations}</style>
</svelte:head>

{#if visible}
  <div
    class="feedback-container {position === 'center' ? 'items-center justify-center' : position === 'top' ? 'items-start justify-center pt-8' : 'items-end justify-center pb-8'}"
    role="alert"
    aria-live="polite"
  >
    <div
      class="feedback-wrapper scale-in"
      class:shake-animation={type === 'error' && animated && !reducedMotion}
    >
      <!-- Color flash overlay -->
      <div
        class="color-flash-overlay absolute inset-0 rounded-full"
        class:color-flash-success={type === 'success' && animated && !reducedMotion}
        class:color-flash-error={type === 'error' && animated && !reducedMotion}
      ></div>

      <!-- Icon container -->
      <div
        class="feedback-icon relative {sizeClasses[size]} rounded-full flex items-center justify-center {type === 'success'
          ? 'bg-green-500'
          : 'bg-red-500'} shadow-lg"
      >
        {#if type === 'success'}
          <!-- Checkmark icon with SVG animation -->
          <svg
            class={iconSizeClasses[size]}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              class="checkmark-path"
              d="M20 6L9 17l-5-5"
            />
          </svg>
        {:else}
          <!-- Error X icon with shake animation -->
          <svg
            class={iconSizeClasses[size]}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        {/if}
      </div>

      <!-- Optional message -->
      {#if message}
        <div
          class="feedback-message mt-4 text-center {type === 'success'
            ? 'text-green-400'
            : 'text-red-400'} font-semibold"
        >
          {message}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .feedback-container {
    position: fixed;
    inset: 0;
    display: flex;
    pointer-events: none;
    z-index: 9999;
  }

  .feedback-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .feedback-icon {
    pointer-events: auto;
  }

  .feedback-message {
    animation: scale-in 0.3s ease-out 0.1s both;
  }
</style>
