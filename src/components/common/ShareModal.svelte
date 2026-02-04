<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import { backOut } from 'svelte/easing';
import { fade, scale } from 'svelte/transition';
import { createFocusTrap } from '@/lib/utils/focus-trap';
import { handleEscapeKey } from '@/lib/utils/keyboard';
import { trackEvent } from '@/stores/analytics';
import { closeModal, modalOpen, showToast } from '@/stores/ui';
import { RARITY_ORDER, type Card } from '@/types';

interface Props {
  cards?: Card[];
  packImageElement?: HTMLElement | null;
}

let { cards = [], packImageElement = null }: Props = $props();

type ShareAction = 'twitter' | 'discord' | 'download' | 'native';

type Platform = {
  name: string;
  emoji: string;
  color: string;
  action: ShareAction;
};

// Local reactive state
let isOpen = $state(false);
let modalElement = $state<HTMLElement | null>(null);
let cleanupFocusTrap: (() => void) | null = null;
let previouslyFocusedElement: HTMLElement | null = null;

// Subscribe to modalOpen store (with cleanup)
let unsubscribe: (() => void) | null = null;

onMount(() => {
  if (typeof window !== 'undefined') {
    unsubscribe = modalOpen.subscribe(handleModalStateChange);
  }
});

// Clean up subscription on destroy
onDestroy(() => {
  if (unsubscribe) {
    unsubscribe();
  }
  if (cleanupFocusTrap) {
    cleanupFocusTrap();
  }
});

// Handle Escape key to close modal
function handleKeydown(e: KeyboardEvent): void {
  handleEscapeKey(e, handleClose);
}

// Platform icons (using emoji for simplicity, can be replaced with SVG icons)
const platforms: Platform[] = [
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

async function handleShare(action: ShareAction): Promise<void> {
  switch (action) {
    case 'twitter':
      await shareToTwitter();
      return;
    case 'discord':
      await shareToDiscord();
      return;
    case 'download':
      await downloadPackImage();
      return;
    default:
      return;
  }
}

async function shareToTwitter(): Promise<void> {
  if (!cards.length) {
    return;
  }

  const bestCard = getBestCard(cards);

  if (!bestCard) {
    return;
  }

  const rarityStars = '★'.repeat(RARITY_ORDER[bestCard.rarity] + 1);
  const text = `Just pulled: ${bestCard.name} ${rarityStars} ${bestCard.flavorText}`;

  const twitterUrl = new URL('https://twitter.com/intent/tweet');
  twitterUrl.searchParams.set('text', text);
  twitterUrl.searchParams.set('via', 'DadDeckTCG');

  // Track share event
  trackShareEvent('twitter');

  const newWindow = window.open(
    twitterUrl.toString(),
    '_blank',
    'noopener,noreferrer,width=550,height=420'
  );

  // Check for popup blocker
  if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
    showToast('Pop-up blocked! Please allow pop-ups to share on Twitter.', 'error');
  }
}

async function shareToDiscord(): Promise<void> {
  // Copy instructions to clipboard
  const instructions =
    '📸 Right-click the image below → Copy Image → Paste in Discord!\n\n' +
    'Or click Download to save it.';

  try {
    await navigator.clipboard.writeText(instructions);

    // Track share event
    trackShareEvent('discord');

    showToast(
      'Instructions copied! Paste them in Discord, then right-click the image to copy it.',
      'info'
    );
  } catch (error) {
    showToast('Failed to copy instructions. Please try again.', 'error');
  }
}

async function downloadPackImage(): Promise<void> {
  if (!packImageElement) {
    showToast('No pack image to download.', 'error');
    return;
  }

  try {
    const blob = await createPackImageBlob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daddieck-pack-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Track download event
    trackShareEvent('download');

    showToast('Pack image downloaded!', 'success');
  } catch (error) {
    console.error('Download failed:', error);
    showToast('Failed to download image. Please try again.', 'error');
  }
}

async function handleNativeShare(): Promise<void> {
  if (!cards.length || !packImageElement) {
    showToast('No pack image available to share.', 'error');
    return;
  }

  try {
    const blob = await createPackImageBlob();
    const file = new File([blob], 'daddieck-pack.png', {
      type: 'image/png',
    });

    await navigator.share({
      title: 'DadDeck™ Pull',
      text: 'Just opened a pack on DadDeck™!',
      files: [file],
    });

    trackShareEvent('native');
    showToast('Thanks for sharing!', 'success');
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Native share failed:', error);
      showToast('Failed to open share dialog. Please try again.', 'error');
    }
  }
}

function handleClose(): void {
  closeModal();
}

function handleBackdropClick(e: MouseEvent): void {
  if (e.target === e.currentTarget) {
    handleClose();
  }
}

function handleModalStateChange(value: string | null): void {
  const shouldBeOpen = value === 'share';

  if (shouldBeOpen && !isOpen) {
    openModal();
    return;
  }

  if (!shouldBeOpen && isOpen) {
    closeModalState();
  }
}

function openModal(): void {
  isOpen = true;
  previouslyFocusedElement = document.activeElement as HTMLElement;
  setTimeout(function () {
    cleanupFocusTrap = createFocusTrap(modalElement, {
      returnFocusTo: previouslyFocusedElement || undefined,
      autoFocus: true,
    });
  }, 100);
}

function closeModalState(): void {
  isOpen = false;

  if (cleanupFocusTrap) {
    cleanupFocusTrap();
    cleanupFocusTrap = null;
  }
}

function handlePlatformClick(event: MouseEvent): void {
  const target = event.currentTarget as HTMLElement | null;
  const action = target?.dataset.action as ShareAction | undefined;

  if (!action) {
    return;
  }

  void handleShare(action);
}

function getBestCard(cardList: Card[]): Card | null {
  let best: Card | null = null;

  for (const card of cardList) {
    if (!best) {
      best = card;
      continue;
    }

    if (RARITY_ORDER[card.rarity] > RARITY_ORDER[best.rarity]) {
      best = card;
    }
  }

  return best;
}

function trackShareEvent(platform: ShareAction): void {
  trackEvent({
    type: 'share',
    data: {
      platform,
      packId: 'unknown',
      cardCount: cards.length,
    },
  });
}

async function createPackImageBlob(): Promise<Blob> {
  const html2canvas = await loadHtml2Canvas();
  const canvas = await html2canvas.default(packImageElement!, {
    backgroundColor: '#0f172a',
    scale: 2,
    logging: false,
    useCORS: true,
    allowTaint: true,
  });

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(function (blob) {
      if (!blob) {
        reject(new Error('Failed to create image blob'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });
}

async function loadHtml2Canvas(): Promise<typeof import('html2canvas')> {
  try {
    return await import('html2canvas');
  } catch (err) {
    console.error('[ShareModal] Failed to load html2canvas:', err);
    throw new Error('Failed to load image generation library');
  }
}
</script>

{#if isOpen}
  <div
    bind:this={modalElement}
    class="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    in:fade={{ duration: 200 }}
    out:fade={{ duration: 150 }}
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    tabindex="0"
    role="dialog"
    aria-modal="true"
    aria-labelledby="share-modal-title"
  >
    <div
      class="relative w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-slate-800"
      in:scale={{ duration: 300, easing: backOut }}
      out:scale={{ duration: 150 }}
    >
      <!-- Close button -->
      <button
        onclick={closeModal}
        class="absolute top-4 right-4 p-3 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800 min-w-[44px] min-h-[44px]"
        aria-label="Close share modal"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
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
            <div
              class="aspect-video bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center"
            >
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
            data-action={platform.action}
            onclick={handlePlatformClick}
            class="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r {platform.color} hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            aria-label="Share to {platform.name}"
            type="button"
          >
            <span class="text-2xl">{platform.emoji}</span>
            <span class="flex-1 text-left font-semibold text-white">{platform.name}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 text-white/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        {/each}

        <!-- Native share option (if available) -->
        {#if typeof navigator !== 'undefined' && 'share' in navigator}
          <button
            onclick={handleNativeShare}
            class="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            aria-label="Share with native share dialog"
            type="button"
          >
            <span class="text-2xl">📱</span>
            <span class="flex-1 text-left font-semibold text-white">More Options</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 text-white/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        {/if}
      </div>

      <!-- Footer note -->
      <div class="px-6 pb-6">
        <p class="text-slate-500 text-xs text-center">Press ESC or click outside to close</p>
      </div>
    </div>
  </div>
{/if}
