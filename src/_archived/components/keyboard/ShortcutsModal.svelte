<script lang="ts">
  import { onMount } from 'svelte';
  import { closeModal, modalOpen } from '@/stores/ui';
  import {
    getAllShortcuts,
    formatShortcutKey,
    getShortcutsByCategory,
  } from '@/lib/keyboard/shortcuts';

  // Get shortcuts organized by category
  let shortcutsByCategory = getShortcutsByCategory();

  // Close modal on escape
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }

  // Listen for escape key
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  // Close modal when clicking backdrop
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  // Category labels
  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    pack: 'Pack Opening',
    collection: 'Collection',
    deck: 'Deck Builder',
    general: 'General',
  };

  // Get category label
  function getCategoryLabel(category: string): string {
    return categoryLabels[category] || category;
  }
</script>

{#if $modalOpen === 'shortcuts'}
  <div
    class="modal-backdrop"
    on:click={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-labelledby="shortcuts-title"
  >
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header">
        <h2 id="shortcuts-title" class="modal-title">
          Keyboard Shortcuts
        </h2>
        <button
          class="modal-close-btn"
          on:click={closeModal}
          aria-label="Close"
        >
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Description -->
      <p class="modal-description">
        Use these keyboard shortcuts to navigate and interact with DadDeck more efficiently.
      </p>

      <!-- Shortcuts List -->
      <div class="shortcuts-list">
        {#each Object.entries(shortcutsByCategory) as [category, shortcuts]}
          {#if shortcuts.length > 0}
            <div class="shortcut-category">
              <h3 class="category-title">
                {getCategoryLabel(category)}
              </h3>
              <div class="shortcuts-grid">
                {#each shortcuts as shortcut}
                  <div class="shortcut-item">
                    <div class="shortcut-description">
                      {shortcut.description}
                    </div>
                    <kbd class="shortcut-key">
                      {formatShortcutKey(shortcut.key)}
                    </kbd>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        {/each}
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn-secondary" on:click={closeModal}>
          Close
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Modal Backdrop */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 1000;
    padding: 1rem;
    animation: fade-in 0.2s ease-out;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Modal Content */
  .modal-content {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 2px solid rgba(251, 191, 36, 0.3);
    border-radius: 1rem;
    max-width: 600px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: slide-up 0.3s ease-out;
  }

  @keyframes slide-up {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Header */
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fbbf24;
    margin: 0;
  }

  .modal-close-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .modal-close-btn:hover {
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
  }

  .modal-close-btn svg {
    width: 1.5rem;
    height: 1.5rem;
  }

  /* Description */
  .modal-description {
    padding: 1rem 1.5rem;
    color: #cbd5e1;
    font-size: 0.875rem;
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  }

  /* Shortcuts List */
  .shortcuts-list {
    padding: 1.5rem;
  }

  .shortcut-category {
    margin-bottom: 2rem;
  }

  .shortcut-category:last-child {
    margin-bottom: 0;
  }

  .category-title {
    font-size: 1rem;
    font-weight: 600;
    color: #f8fafc;
    margin: 0 0 1rem 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .shortcuts-grid {
    display: grid;
    gap: 0.75rem;
  }

  .shortcut-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
    transition: all 0.2s ease;
  }

  .shortcut-item:hover {
    background: rgba(251, 191, 36, 0.05);
    border-color: rgba(251, 191, 36, 0.2);
  }

  .shortcut-description {
    color: #cbd5e1;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .shortcut-key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2.5rem;
    padding: 0.25rem 0.75rem;
    background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
    border: 2px solid rgba(251, 191, 36, 0.4);
    border-radius: 0.375rem;
    color: #fbbf24;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  /* Footer */
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(71, 85, 105, 0.3);
  }

  /* Responsive */
  @media (max-width: 640px) {
    .modal-content {
      max-height: 90vh;
    }

    .modal-header {
      padding: 1rem;
    }

    .modal-title {
      font-size: 1.25rem;
    }

    .shortcuts-list {
      padding: 1rem;
    }
  }

  /* Scrollbar Styling */
  .modal-content::-webkit-scrollbar {
    width: 8px;
  }

  .modal-content::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.5);
  }

  .modal-content::-webkit-scrollbar-thumb {
    background: rgba(251, 191, 36, 0.3);
    border-radius: 4px;
  }

  .modal-content::-webkit-scrollbar-thumb:hover {
    background: rgba(251, 191, 36, 0.5);
  }
</style>
