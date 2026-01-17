<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import { modalOpen, closeModal } from '@/stores/ui';
  import type { Card } from '@/types';
  import { onMount, onDestroy } from 'svelte';

  export let cards: Card[] = [];
  export let packImageElement: HTMLElement | null = null;

  // Local reactive state
  let isOpen = false;
  let modalElement: HTMLElement;
  let previouslyFocusedElement: HTMLElement | null = null;

  // Subscribe to modalOpen store
  if (typeof window !== 'undefined') {
    modalOpen.subscribe((value) => {
      isOpen = value === 'share';
      if (isOpen) {
        // Store the previously focused element
        previouslyFocusedElement = document.activeElement as HTMLElement;
        // Focus the modal
        setTimeout(() => {
          modalElement?.focus();
        }, 50);
      } else if (previouslyFocusedElement) {
        // Return focus to the previously focused element
        setTimeout(() => {
          previouslyFocusedElement?.focus();
        }, 50);
      }
    });
  }

  // Focus trap for modal
  function handleModalKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose();
      return;
    }

    if (e.key === 'Tab') {
      const focusableElements = modalElement?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }

  onMount(() => {
    // Store previously focused element when modal mounts
    if (isOpen) {
      previouslyFocusedElement = document.activeElement as HTMLElement;
    }
  });

  onDestroy(() => {
    // Restore focus when modal is destroyed
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }
  });

  // Platform icons (using emoji for simplicity, can be replaced with SVG icons)
  const platforms = [
    {
      name: 'X (Twitter)',
      emoji: '𝕏',
      color: 'from-gray-700 to-gray-900',
      action: 'twitter',
    },
    {
      name: 'Discord',
      emoji: '💬',
      color: 'from-indigo-600 to-indigo-800',
      action: 'discord',
    },
    {
      name: 'Download',
      emoji: '⬇️',
      color: 'from-green-600 to-green-800',
      action: 'download',
    },
  ];

  async function handleShare(action: string) {
    if (action === 'twitter') {
      await shareToTwitter();
    } else if (action === 'discord') {
      await shareToDiscord();
    } else if (action === 'download') {
      await downloadPackImage();
    }
  }

  async function shareToTwitter() {
    if (!cards.length) return;

    const bestCard = cards.reduce((best, card) =>
      card.rarityTier > best.rarityTier ? card : best
    );

    const rarityStars = '★'.repeat(bestCard.rarityTier + 1);
    const text = `Just pulled: ${bestCard.name} ${rarityStars} ${bestCard.flavorText}`;

    const twitterUrl = new URL('https://twitter.com/intent/tweet');
    twitterUrl.searchParams.set('text', text);
    twitterUrl.searchParams.set('via', 'DadDeckTCG');

    window.open(twitterUrl.toString(), '_blank', 'noopener,noreferrer,width=550,height=420');
  }

  async function shareToDiscord() {
    // Copy instructions to clipboard
    const instructions = '📸 Right-click the image below → Copy Image → Paste in Discord!\n\nOr click Download to save it.';

    try {
      await navigator.clipboard.writeText(instructions);
      alert('Instructions copied! Paste them in Discord, then right-click the image to copy it.');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Right-click the preview image → Copy Image → Paste in Discord!');
    }
  }

  async function downloadPackImage() {
    if (!packImageElement) return;

    try {
      const canvas = await import('html2canvas').then((m) => m.default(packImageElement!, {
        backgroundColor: '#0f172a',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      }));

      const blob = await new Promise<Blob>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Failed to create image blob');

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daddieck-pack-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image. Please try again.');
    }
  }

  function handleClose() {
    closeModal();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }
</script>

{#if isOpen}
  <div
    bind:this={modalElement}
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    in:fade={{ duration: 200 }}
    out:fade={{ duration: 150 }}
    on:click={handleBackdropClick}
    on:keydown={handleModalKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="share-modal-title"
    tabindex="-1"
  >
    <div
      class="relative w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-slate-800"
      in:scale={{ duration: 300, easing: backOut }}
      out:scale={{ duration: 150 }}
      on:click|stopPropagation
    >
      <!-- Close button -->
      <button
        on:click={closeModal}
        class="absolute top-4 right-4 p-3 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800 min-w-[44px] min-h-[44px]"
        aria-label="Close share modal"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Modal header -->
      <div class="p-6 pb-4">
        <h2 id="share-modal-title" class="text-2xl font-bold text-white text-center">
          Share Your Pull
        </h2>
        <p class="text-slate-400 text-center mt-2 text-sm">
          Choose where to share your epic pack opening!
        </p>
      </div>

      <!-- Share preview -->
      {#if packImageElement}
        <div class="px-6 pb-4">
          <div class="bg-slate-800 rounded-xl p-3 border border-slate-700">
            <div class="aspect-video bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
              <p class="text-slate-500 text-sm">Pack preview</p>
            </div>
          </div>
          <p class="text-slate-500 text-xs text-center mt-2">Your pack will look like this</p>
        </div>
      {/if}

      <!-- Share buttons -->
      <div class="p-6 pt-2 space-y-3">
        {#each platforms as platform}
          <button
            on:click={() => handleShare(platform.action)}
            class="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r {platform.color} hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            aria-label="Share to {platform.name}"
            type="button"
          >
            <span class="text-2xl">{platform.emoji}</span>
            <span class="flex-1 text-left font-semibold text-white">{platform.name}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        {/each}

        <!-- Native share option (if available) -->
        {#if typeof navigator !== 'undefined' && navigator.share}
          <button
            on:click={async () => {
              if (cards.length && packImageElement) {
                try {
                  const canvas = await import('html2canvas').then((m) =>
                    m.default(packImageElement!, {
                      backgroundColor: '#0f172a',
                      scale: 2,
                      logging: false,
                      useCORS: true,
                      allowTaint: true,
                    })
                  );

                  const blob = await new Promise<Blob>((resolve) =>
                    canvas.toBlob(resolve, 'image/png')
                  );
                  if (!blob) throw new Error('Failed to create image blob');

                  const file = new File([blob], 'daddieck-pack.png', { type: 'image/png' });

                  await navigator.share({
                    title: 'DadDeck™ Pull',
                    text: `Just opened a pack on DadDeck™!`,
                    files: [file],
                  });
                } catch (error) {
                  console.error('Native share failed:', error);
                }
              }
            }}
            class="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            aria-label="Share with native share dialog"
            type="button"
          >
            <span class="text-2xl">📱</span>
            <span class="flex-1 text-left font-semibold text-white">More Options</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        {/if}
      </div>

      <!-- Footer note -->
      <div class="px-6 pb-6">
        <p class="text-slate-500 text-xs text-center">
          Press ESC or click outside to close
        </p>
      </div>
    </div>
  </div>
{/if}
