<script lang="ts">
  import type { StatusEffect } from '../../lib/mechanics/combat';

  export let effect: StatusEffect;
  export let size: 'sm' | 'md' | 'lg' = 'md';

  const STATUS_CONFIG: Record<StatusEffect['type'], { icon: string; label: string; color: string; bgColor: string }> = {
    grilled: {
      icon: '🔥',
      label: 'Grilled (-20% Defense)',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
    },
    lectured: {
      icon: '📢',
      label: 'Lectured (-20% Attack)',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1).',
    },
    drunk: {
      icon: '🍺',
      label: 'Drunk (-30% Accuracy)',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1).',
    },
    wired: {
      icon: '⚡',
      label: 'Wired (+30% Speed)',
      color: '#eab308',
      bgColor: 'rgba(234, 179, 8, 0.1).',
    },
    awkward: {
      icon: '😬',
      label: 'Awkward',
      color: '#9ca3af',
      bgColor: 'rgba(156, 163, 175, 0.1).',
    },
    bored: {
      icon: '😴',
      label: 'Bored',
      color: '#6b7280',
      bgColor: 'rgba(107, 114, 128, 0.1).',
    },
    inspired: {
      icon: '✨',
      label: 'Inspired',
      color: '#fbbf24',
      bgColor: 'rgba(251, 191, 36, 0.1).',
    },
  };

  const config = STATUS_CONFIG[effect.type];
  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-10 h-10 text-lg',
  }[size];
</script>

<div
  class="status-icon {sizeClasses} rounded-full flex items-center justify-center border-2"
  style="background-color: {config.bgColor}; border-color: {config.color};"
  title="{config.label} ({effect.duration} turns{effect.stacks > 1 ? `, ${effect.stacks} stacks` : ''})"
>
  <span class="text-lg">{config.icon}</span>
  {#if effect.duration > 1}
    <span class="absolute -top-1 -right-1 bg-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center"
          style="color: {config.color};">
      {effect.duration}
    </span>
  {/if}
  {#if effect.stacks > 1}
    <span class="absolute -bottom-1 -right-1 bg-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center"
          style="color: {config.color};">
      ×{effect.stacks}
    </span>
  {/if}
</div>

<style>
  .status-icon {
    position: relative;
    transition: transform 0.2s ease;
  }

  .status-icon:hover {
    transform: scale(1.1);
    z-index: 10;
  }
</style>
