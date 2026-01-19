<script lang="ts">
  import { toggleSkipAnimations, toggleFastForward, skipAnimations, fastForward } from '../../stores/ui';
</script>

<div class="flex flex-col gap-2" data-testid="animation-controls">
  <!-- Skip animations toggle -->
  <button
    class="flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors border-2 {$skipAnimations ? 'border-amber-500' : 'border-slate-600'}"
    on:click={toggleSkipAnimations}
    aria-label="Toggle skip animations"
    aria-pressed={$skipAnimations}
    type="button"
    title="Always skip pack opening animations and reveal cards instantly"
  >
    <svg class="w-5 h-5 {$skipAnimations ? 'text-amber-400' : 'text-slate-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
    <span class="text-sm font-medium {$skipAnimations ? 'text-amber-400' : 'text-slate-300'}">
      Skip
    </span>
    {#if $skipAnimations}
      <span class="ml-auto text-xs bg-amber-500 text-black px-2 py-0.5 rounded font-bold">ON</span>
    {/if}
  </button>

  <!-- Fast forward toggle -->
  <button
    class="flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors border-2 {$fastForward ? 'border-blue-500' : 'border-slate-600'}"
    on:click={toggleFastForward}
    aria-label="Toggle fast forward"
    aria-pressed={$fastForward}
    type="button"
    title="Play pack opening animations at 2x speed for quicker reveals"
  >
    <svg class="w-5 h-5 {$fastForward ? 'text-blue-400' : 'text-slate-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
    </svg>
    <span class="text-sm font-medium {$fastForward ? 'text-blue-400' : 'text-slate-300'}">
      2x Speed
    </span>
    {#if $fastForward}
      <span class="ml-auto text-xs bg-blue-500 text-black px-2 py-0.5 rounded font-bold">ON</span>
    {/if}
  </button>
</div>

<style>
  button {
    min-width: 120px;
  }
</style>
