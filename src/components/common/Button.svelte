<script lang="ts">
  import { isReducedMotion } from '@/stores/motion';

  // Props
  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    href?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    class?: string;
  }

  let {
    variant = 'primary',
    size = 'md',
    href,
    disabled = false,
    type = 'button',
    class: className = ''
  }: Props = $props();

  // Ripple effect state
  let ripples: Array<{ id: number; x: number; y: number; size: number }> = $state([]);
  let buttonElement: HTMLButtonElement | HTMLAnchorElement;
  let rippleId = 0;

  // Check for reduced motion preference
  let reducedMotion = $state(false);

  $effect(() => {
    reducedMotion = isReducedMotion();
  });

  // Ripple effect handler
  function createRipple(event: MouseEvent) {
    if (disabled || reducedMotion) return;

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    // Calculate ripple size (ensure it covers the entire button)
    const size = Math.max(rect.width, rect.height) * 2.5;

    // Calculate ripple position (centered on click)
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    // Add new ripple
    const id = rippleId++;
    ripples = [...ripples, { id, x, y, size }];

    // Remove ripple after animation completes (600ms)
    setTimeout(() => {
      ripples = ripples.filter(r => r.id !== id);
    }, 600);
  }

  // Base classes
  const baseClasses =
    'relative inline-flex items-center justify-center font-bold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  // Variant classes
  const variantClasses = {
    primary:
      'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:from-amber-400 hover:to-orange-400 active:scale-95 focus:ring-amber-400',
    secondary:
      'bg-slate-700 text-white hover:bg-slate-600 active:scale-95 focus:ring-slate-400',
    ghost: 'bg-transparent text-white hover:bg-white/10 active:scale-95 focus:ring-white/50',
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  // Combine all classes
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  // Ripple animation styles
  const rippleAnimation = `
    @keyframes ripple {
      0% {
        transform: scale(0);
        opacity: 0.5;
      }
      100% {
        transform: scale(1);
        opacity: 0;
      }
    }
  `;
</script>

<svelte:head>
  <style>{rippleAnimation}</style>
</svelte:head>

{#if href}
  <a
    href={href}
    class={classes}
    onmousedown={createRipple}
    bind:this={buttonElement}
  >
    <slot />
    {#each ripples as ripple (ripple.id)}
      <span
        class="absolute pointer-events-none rounded-full bg-white/30"
        style="left: {ripple.x}px; top: {ripple.y}px; width: {ripple.size}px; height: {ripple.size}px; animation: ripple 0.6s ease-out forwards;"
      />
    {/each}
  </a>
{:else}
  <button
    type={type}
    class={classes}
    onmousedown={createRipple}
    bind:this={buttonElement}
    disabled={disabled}
  >
    <slot />
    {#each ripples as ripple (ripple.id)}
      <span
        class="absolute pointer-events-none rounded-full bg-white/30"
        style="left: {ripple.x}px; top: {ripple.y}px; width: {ripple.size}px; height: {ripple.size}px; animation: ripple 0.6s ease-out forwards;"
      />
    {/each}
  </button>
{/if}
