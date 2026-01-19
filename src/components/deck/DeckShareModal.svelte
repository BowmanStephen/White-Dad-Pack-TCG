<script lang="ts">
   import { createEventDispatcher } from 'svelte';
   import { currentDeck } from '@/stores/deck';
   import { exportDeckToCode, exportDeckToText, generateDeckShareUrl } from '@/lib/deck/sharing';
   import { showToast } from '@/stores/ui';
   import type { Deck } from '@/types';

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  const dispatch = createEventDispatcher();

  let activeTab = $state<'code' | 'text' | 'url'>('code');
  let copied = $state<'code' | 'text' | 'url' | null>(null);
  let copyTimeout = $state<ReturnType<typeof setTimeout> | null>(null);

  let deck = $derived($currentDeck);

  let deckCode = $derived(deck ? exportDeckToCode(deck) : '');
  let deckText = $derived(deck ? exportDeckToText(deck) : '');
  let deckUrl = $derived(deck ? generateDeckShareUrl(deck) : '');

  function close() {
    open = false;
    dispatch('close');
  }

  async function copyToClipboard(type: 'code' | 'text' | 'url') {
    let text = '';

    switch (type) {
      case 'code':
        text = deckCode;
        break;
      case 'text':
        text = deckText;
        break;
      case 'url':
        text = deckUrl;
        break;
    }

    try {
      await navigator.clipboard.writeText(text);

      // Show copied feedback
      copied = type;

      // Clear timeout if exists
      if (copyTimeout) {
        clearTimeout(copyTimeout);
      }

      // Reset after 2 seconds
      copyTimeout = setTimeout(() => {
        copied = null;
      }, 2000);
    } catch (error) {
      showToast('Failed to copy to clipboard. Please try again.', 'error');
    }
  }

  function shareToTwitter() {
    const text = `Check out my "${deck?.name}" deck in DadDeck™! 🎴`;
    const url = deckUrl;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  }

  function shareToReddit() {
    const title = `DadDeck™: ${deck?.name}`;
    const url = deckUrl;
    const redditUrl = `https://reddit.com/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(redditUrl, '_blank', 'width=550,height=420');
  }
</script>

{#if open && deck}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/60 backdrop-blur-sm"
      on:click={close}
      role="presentation"
    ></div>

    <!-- Modal Content -->
    <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Share Deck</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Share "{deck.name}" with friends or save it for later
          </p>
        </div>
        <button
          on:click={close}
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 dark:border-gray-700">
        <button
          class="flex-1 px-6 py-3 text-sm font-medium transition-colors {activeTab === 'code'
            ? 'text-amber-600 border-b-2 border-amber-600'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}"
          on:click={() => activeTab = 'code'}
        >
          Deck Code
        </button>
        <button
          class="flex-1 px-6 py-3 text-sm font-medium transition-colors {activeTab === 'text'
            ? 'text-amber-600 border-b-2 border-amber-600'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}"
          on:click={() => activeTab = 'text'}
        >
          Text Format
        </button>
        <button
          class="flex-1 px-6 py-3 text-sm font-medium transition-colors {activeTab === 'url'
            ? 'text-amber-600 border-b-2 border-amber-600'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}"
          on:click={() => activeTab = 'url'}
        >
          Share Link
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[60vh]">
        {#if activeTab === 'code'}
          <!-- Deck Code Tab -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shareable Deck Code
              </label>
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Copy this code to share your deck. Others can import it using the "Import Deck" button.
              </p>
              <div class="relative">
                <textarea
                  readonly
                  class="w-full px-4 py-3 pr-12 text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 dark:text-white resize-none"
                  rows="4"
                  value={deckCode}
                ></textarea>
                <button
                  on:click={() => copyToClipboard('code')}
                  class="absolute right-2 top-2 p-2 text-gray-600 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400 transition-colors"
                  aria-label="Copy deck code"
                >
                  {#if copied === 'code'}
                    <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  {:else}
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  {/if}
                </button>
              </div>
            </div>
          </div>

        {:else if activeTab === 'text'}
          <!-- Text Format Tab -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Text Format
              </label>
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Human-readable format for sharing in chats, forums, or Discord.
              </p>
              <div class="relative">
                <pre
                  readonly
                  class="w-full px-4 py-3 pr-12 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 dark:text-white overflow-x-auto whitespace-pre-wrap"
                >{deckText}</pre>
                <button
                  on:click={() => copyToClipboard('text')}
                  class="absolute right-2 top-2 p-2 text-gray-600 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400 transition-colors"
                  aria-label="Copy deck text"
                >
                  {#if copied === 'text'}
                    <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  {:else}
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  {/if}
                </button>
              </div>
            </div>
          </div>

        {:else if activeTab === 'url'}
          <!-- Share Link Tab -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Share Link
              </label>
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Direct link to your deck. Clicking this link will automatically import the deck.
              </p>
              <div class="relative">
                <input
                  type="text"
                  readonly
                  class="w-full px-4 py-3 pr-12 text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 dark:text-white"
                  value={deckUrl}
                />
                <button
                  on:click={() => copyToClipboard('url')}
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400 transition-colors"
                  aria-label="Copy share link"
                >
                  {#if copied === 'url'}
                    <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  {:else}
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  {/if}
                </button>
              </div>
            </div>

            <!-- Social Share Buttons -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Share to Social Media
              </label>
              <div class="flex gap-3">
                <button
                  on:click={shareToTwitter}
                  class="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>Twitter</span>
                </button>
                <button
                  on:click={shareToReddit}
                  class="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                  </svg>
                  <span>Reddit</span>
                </button>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <button
          on:click={close}
          class="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
        >
          Done
        </button>
      </div>
    </div>
  </div>
{/if}
