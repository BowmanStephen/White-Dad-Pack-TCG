<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import type { ReferralCode, ReferralLink } from '@/types';
  import { trackEvent } from '@/stores/analytics';
  import { onDestroy } from 'svelte';

  export let referralCode: ReferralCode;
  export let referralLink: ReferralLink;
  export let onClose: () => void;

  let modalElement: HTMLElement;
  let previouslyFocusedElement: HTMLElement | null = null;

  // Focus management
  onDestroy(() => {
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }
  });

  // Platform icons
  const platforms = [
    {
      name: 'X (Twitter)',
      emoji: '𝕏',
      color: 'from-gray-700 to-gray-900',
      action: 'twitter',
    },
    {
      name: 'Facebook',
      emoji: '👍',
      color: 'from-blue-600 to-blue-800',
      action: 'facebook',
    },
    {
      name: 'Discord',
      emoji: '💬',
      color: 'from-indigo-600 to-indigo-800',
      action: 'discord',
    },
    {
      name: 'Copy Link',
      emoji: '🔗',
      color: 'from-green-600 to-green-800',
      action: 'copy',
    },
  ];

  function handleShare(action: string) {
    if (action === 'twitter') {
      shareToTwitter();
    } else if (action === 'facebook') {
      shareToFacebook();
    } else if (action === 'discord') {
      shareToDiscord();
    } else if (action === 'copy') {
      copyReferralLink();
    }
  }

  function shareToTwitter() {
    const text = `Join me in DadDeck™ - the ultimate white dad trading card game! 🎴🔥 Use my referral code: ${referralCode}\n\n${referralLink.url}`;

    const twitterUrl = new URL('https://twitter.com/intent/tweet');
    twitterUrl.searchParams.set('text', text);
    twitterUrl.searchParams.set('via', 'DadDeckTCG');

    trackEvent({
      type: 'referral_share',
      data: {
        platform: 'twitter',
        referralCode,
      },
    });

    window.open(twitterUrl.toString(), '_blank', 'noopener,noreferrer,width=550,height=420');
    onClose();
  }

  function shareToFacebook() {
    const facebookUrl = new URL('https://www.facebook.com/sharer/sharer.php');
    facebookUrl.searchParams.set('u', referralLink.url);
    facebookUrl.searchParams.set('quote', referralLink.shareText);

    trackEvent({
      type: 'referral_share',
      data: {
        platform: 'facebook',
        referralCode,
      },
    });

    window.open(facebookUrl.toString(), '_blank', 'noopener,noreferrer,width=550,height=420');
    onClose();
  }

  async function shareToDiscord() {
    try {
      await navigator.clipboard.writeText(
        `🎮 Join me in DadDeck™!\n\nUse my referral code: ${referralCode}\n\n${referralLink.url}`
      );

      trackEvent({
        type: 'referral_share',
        data: {
          platform: 'discord',
          referralCode,
        },
      });

      alert('Referral message copied! Paste it in Discord to share with friends.');
      onClose();
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy referral message. Please try again.');
    }
  }

  async function copyReferralLink() {
    try {
      await navigator.clipboard.writeText(referralLink.url);

      trackEvent({
        type: 'referral_share',
        data: {
          platform: 'copy',
          referralCode,
        },
      });

      alert('Referral link copied to clipboard!');
      onClose();
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy referral link. Please try again.');
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleModalKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    }
  }
</script>

<div
  bind:this={modalElement}
  class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
  in:fade={{ duration: 200 }}
  out:fade={{ duration: 150 }}
  on:click={handleBackdropClick}
  on:keydown={handleModalKeydown}
  role="dialog"
  aria-modal="true"
  aria-labelledby="referral-share-modal-title"
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
      on:click={onClose}
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
      <h2 id="referral-share-modal-title" class="text-2xl font-bold text-white text-center">
        Share Your Referral Link 🎁
      </h2>
      <p class="text-slate-400 text-center mt-2 text-sm">
        Earn 5 free packs for each friend who joins!
      </p>
    </div>

    <!-- Referral code display -->
    <div class="px-6 pb-4">
      <div class="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <p class="text-slate-400 text-xs uppercase font-semibold mb-2">Your Referral Code</p>
        <p class="text-3xl font-bold text-center text-amber-400 tracking-wider">{referralCode}</p>
      </div>
    </div>

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
            try {
              await navigator.share({
                title: 'Join DadDeck™',
                text: referralLink.shareText,
                url: referralLink.url,
              });

              trackEvent({
                type: 'referral_share',
                data: {
                  platform: 'native',
                  referralCode,
                },
              });

              onClose();
            } catch (error) {
              console.error('Native share failed:', error);
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

    <!-- Referral info -->
    <div class="px-6 pb-6">
      <div class="bg-blue-900/20 rounded-lg p-4 border border-blue-800">
        <h3 class="text-white font-semibold text-sm mb-2">🎁 Reward Details</h3>
        <ul class="text-slate-300 text-xs space-y-1">
          <li>• <strong class="text-amber-400">You get 5 free packs</strong> when your friend opens 10 packs</li>
          <li>• <strong class="text-amber-400">Your friend gets 2 free packs</strong> for joining</li>
          <li>• No limit on how many friends you can refer!</li>
        </ul>
      </div>
    </div>

    <!-- Footer note -->
    <div class="px-6 pb-6">
      <p class="text-slate-500 text-xs text-center">
        Press ESC or click outside to close
      </p>
    </div>
  </div>
</div>
