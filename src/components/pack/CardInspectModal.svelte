<script lang="ts">
  import type { PackCard } from '@/types';
  import { RARITY_CONFIG, DAD_TYPE_ICONS } from '@/types';
  import { fade, scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import { onMount } from 'svelte';
  import Card from '../card/Card.svelte';

  interface Props {
    card: PackCard | null;
    onClose: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    hasPrevious?: boolean;
    hasNext?: boolean;
  }

  let { card, onClose, onPrevious, onNext, hasPrevious = false, hasNext = false }: Props = $props();

  let modalElement = $state<HTMLElement>();

  // FIX: Focus the modal when it opens so keyboard events work
  onMount(() => {
    if (modalElement) {
      modalElement.focus();
    }
  });

  // FIX: Use window-level key listener for better keyboard support
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'ArrowLeft' && onPrevious) {
      e.preventDefault();
      onPrevious();
    } else if (e.key === 'ArrowRight' && onNext) {
      e.preventDefault();
      onNext();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if card}
  {@const rarity = RARITY_CONFIG[card.rarity]}
  <div
    bind:this={modalElement}
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
    in:fade={{ duration: 300 }}
    out:fade={{ duration: 200 }}
    onclick={onClose}
    role="dialog"
    aria-modal="true"
    aria-label="Card details for {card.name}"
    tabindex="-1"
  >
    <!-- Close button -->
    <button
      onclick={(e) => { e.stopPropagation(); onClose(); }}
      class="fixed top-8 right-8 text-white/50 hover:text-white text-5xl font-light transition-colors z-50"
      aria-label="Close card details"
    >
      ×
    </button>

    <!-- Left navigation -->
    {#if onPrevious}
      <div class="fixed top-1/2 left-4 -translate-y-1/2 hidden md:block z-40">
        <button
          onclick={(e) => { e.stopPropagation(); onPrevious?.(); }}
          disabled={!hasPrevious}
          class="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-0 transition-all backdrop-blur"
          aria-label="Previous card"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>
    {/if}

    <!-- Right navigation -->
    {#if onNext}
      <div class="fixed top-1/2 right-4 -translate-y-1/2 hidden md:block z-40">
        <button
          onclick={(e) => { e.stopPropagation(); onNext?.(); }}
          disabled={!hasNext}
          class="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-0 transition-all backdrop-blur"
          aria-label="Next card"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    {/if}

    <!-- Content -->
    <div
      class="relative max-w-5xl w-full max-h-[95vh] overflow-y-auto"
      in:scale={{ duration: 400, easing: backOut }}
      out:scale={{ duration: 200 }}
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex flex-col lg:flex-row gap-12 items-center lg:items-center px-4 md:px-20 pb-10">
        <!-- Card display -->
        <div class="flex-shrink-0">
          <Card {card} size="lg" interactive={true} enableShare={true} />
        </div>

        <!-- Card info -->
        <div class="flex-1 w-full text-white">
          <div class="text-xs font-black px-3 py-1 rounded-full inline-block mb-4 uppercase tracking-[0.2em] shadow-lg" style="background: {rarity.color}; color: white;">
            {rarity.name} Pull
          </div>

          <h2 class="text-5xl md:text-6xl font-black mb-6 tracking-tighter">{card.name}</h2>

          {#if card.flavorText}
            <blockquote class="text-slate-300 italic mb-10 text-2xl leading-relaxed opacity-80 border-l-8 pl-8" style="border-color: {rarity.color};">
              "{card.flavorText}"
            </blockquote>
          {/if}

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-4 mb-10">
            <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Identity</h3>
              <div class="flex items-center gap-3">
                <span class="text-4xl">{DAD_TYPE_ICONS[card.type]}</span>
                <div>
                  <div class="font-black text-white uppercase text-sm tracking-widest">{card.type.replace('_', ' ')}</div>
                  <div class="text-xs text-slate-400">Class Type</div>
                </div>
              </div>
            </div>

            <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Serial</h3>
              <div class="text-2xl font-black text-white">#{card.cardNumber.toString().padStart(3, '0')}</div>
              <div class="text-xs text-slate-400 font-bold">Collector Number</div>
            </div>
          </div>

          <div class="flex flex-wrap gap-4 mt-auto opacity-40">
            <span class="text-[10px] font-bold uppercase tracking-widest">Artist: {card.artist}</span>
            <span class="text-[10px] font-bold uppercase tracking-widest">Series: {card.series}</span>
            <span class="text-[10px] font-bold uppercase tracking-widest">Year: 2024</span>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
