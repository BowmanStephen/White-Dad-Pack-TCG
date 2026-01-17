<!--
  Premium Pack Purchase Modal (US093 - Monetization - Premium Packs)

  Modal for purchasing premium packs via Stripe.
  Handles purchase flow, error states, and success confirmation.
-->

<script lang="ts">
  import { purchaseUI, getActivePremiumPacks, closePurchaseModal, simulatePremiumPackPurchase } from '@/stores/premium';
  import type { PremiumPackConfig } from '@/types';

  // UI state
  let selectedPack: PremiumPackConfig | null = null;
  let isSimulating = false;

  // Get active premium packs
  const activePacks = getActivePremiumPacks();
  const ui = purchaseUI.get();

  // Select pack for purchase
  function selectPack(pack: PremiumPackConfig) {
    selectedPack = pack;
  }

  // Handle purchase (simulation for development)
  async function handlePurchase() {
    if (!selectedPack) return;

    isSimulating = true;

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate successful purchase (bypasses Stripe)
      simulatePremiumPackPurchase(selectedPack.id);

      // Show success state
      purchaseUI.set({
        ...ui,
        success: true,
        isProcessing: false,
      });
    } catch (error) {
      purchaseUI.set({
        ...ui,
        error: error instanceof Error ? error.message : 'Purchase failed',
        isProcessing: false,
      });
    } finally {
      isSimulating = false;
    }
  }

  // Close modal
  function close() {
    closePurchaseModal();
    selectedPack = null;
  }
</script>

{#if ui.isCheckoutOpen}
  <div class="modal-overlay" on:click={close}>
    <div class="modal-content" on:click|stopPropagation>
      <!-- Modal Header -->
      <div class="modal-header">
        <h2 class="modal-title">Premium Packs</h2>
        <button class="close-button" on:click={close} aria-label="Close modal">
          ✕
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        {#if ui.error}
          <div class="error-message">
            <span class="error-icon">⚠️</span>
            <span class="error-text">{ui.error}</span>
          </div>
        {/if}

        {#if ui.success}
          <div class="success-message">
            <span class="success-icon">✅</span>
            <div class="success-content">
              <h3>Purchase Successful!</h3>
              <p>Your premium pack has been added to your inventory.</p>
            </div>
            <button class="btn btn-primary" on:click={close}>
              Done
            </button>
          </div>
        {:else if ui.isProcessing}
          <div class="processing-message">
            <div class="spinner"></div>
            <p>Processing your purchase...</p>
          </div>
        {:else}
          <!-- Pack Selection -->
          <div class="pack-selection">
            <p class="intro-text">Select a premium pack to purchase:</p>

            <div class="pack-list">
              {#each activePacks as pack (pack.id)}
                <div
                  class="pack-option"
                  class:selected={selectedPack?.id === pack.id}
                  on:click={() => selectPack(pack)}
                  role="button"
                  tabindex="0"
                  on:keypress={(e) => e.key === 'Enter' && selectPack(pack)}
                >
                  <div class="pack-info">
                    <h4 class="pack-name">{pack.name}</h4>
                    <p class="pack-description">{pack.description}</p>
                    <div class="pack-features">
                      <span class="feature">📦 {pack.cardsPerPack} Cards</span>
                      <span class="feature">⭐ Guaranteed {pack.rarityGuarantee.toUpperCase()}+</span>
                      <span class="feature">💎 {pack.mythicChanceMultiplier}x Mythic</span>
                    </div>
                  </div>
                  <div class="pack-price">
                    <span class="price-amount">${pack.price.toFixed(2)}</span>
                  </div>
                </div>
              {/each}
            </div>

            <!-- Purchase Button -->
            <div class="purchase-actions">
              <button
                class="btn btn-secondary"
                on:click={close}
                disabled={isSimulating}
              >
                Cancel
              </button>
              <button
                class="btn btn-primary"
                on:click={handlePurchase}
                disabled={!selectedPack || isSimulating}
              >
                {#if isSimulating}
                  <span class="spinner-small"></span>
                  Processing...
                {:else}
                  Purchase for ${selectedPack?.price.toFixed(2)}
                {/if}
              </button>
            </div>

            <!-- Developer Note -->
            <div class="dev-note">
              <p><strong>Developer Note:</strong> Stripe checkout not yet configured.</p>
              <p>This simulation bypasses payment processing. For production:</p>
              <ol>
                <li>Add <code>PUBLIC_STRIPE_PUBLIC_KEY</code> to <code>.env</code></li>
                <li>Create Stripe products and prices</li>
                <li>Implement backend API routes</li>
              </ol>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
  }

  .modal-content {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 16px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow: auto;
    border: 2px solid #ffd700;
    box-shadow: 0 0 40px rgba(255, 215, 0, 0.2);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px;
    border-bottom: 1px solid rgba(255, 215, 0, 0.2);
  }

  .modal-title {
    font-size: 24px;
    font-weight: 700;
    color: #ffd700;
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    color: #94a3b8;
    font-size: 24px;
    cursor: pointer;
    padding: 4px;
    line-height: 1;
    transition: color 0.2s ease;
  }

  .close-button:hover {
    color: #fff;
  }

  .modal-body {
    padding: 24px;
  }

  .error-message,
  .success-message,
  .processing-message {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    border-radius: 12px;
    text-align: center;
  }

  .error-message {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #fca5a5;
  }

  .success-message {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: #86efac;
    flex-direction: column;
  }

  .processing-message {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: #93c5fd;
    justify-content: center;
  }

  .error-icon,
  .success-icon {
    font-size: 32px;
  }

  .success-content {
    text-align: center;
  }

  .success-content h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
  }

  .success-content p {
    margin: 0 0 16px 0;
    color: #94a3b8;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(59, 130, 246, 0.3);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .intro-text {
    color: #94a3b8;
    font-size: 16px;
    margin-bottom: 20px;
  }

  .pack-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }

  .pack-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid transparent;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .pack-option:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 215, 0, 0.3);
  }

  .pack-option.selected {
    background: rgba(255, 215, 0, 0.1);
    border-color: #ffd700;
  }

  .pack-info {
    flex: 1;
  }

  .pack-name {
    font-size: 16px;
    font-weight: 700;
    color: #ffd700;
    margin: 0 0 4px 0;
  }

  .pack-description {
    font-size: 14px;
    color: #94a3b8;
    margin: 0 0 8px 0;
  }

  .pack-features {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .feature {
    font-size: 12px;
    color: #cbd5e1;
    background: rgba(255, 255, 255, 0.05);
    padding: 4px 8px;
    border-radius: 4px;
  }

  .pack-price {
    text-align: right;
  }

  .price-amount {
    font-size: 24px;
    font-weight: 800;
    color: #ffd700;
  }

  .purchase-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
  }

  .btn {
    flex: 1;
    padding: 14px 24px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: #334155;
    color: #fff;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #475569;
  }

  .btn-primary {
    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
    color: #1a1a2e;
  }

  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #ffdd00 0%, #ffbb00 100%);
    transform: scale(1.02);
  }

  .spinner-small {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(26, 26, 46, 0.3);
    border-top-color: #1a1a2e;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 8px;
  }

  .dev-note {
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 8px;
    padding: 16px;
    font-size: 13px;
    color: #fbbf24;
  }

  .dev-note p {
    margin: 0 0 8px 0;
  }

  .dev-note p:last-child {
    margin-bottom: 0;
  }

  .dev-note code {
    background: rgba(0, 0, 0, 0.3);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
  }

  .dev-note ol {
    margin: 8px 0 0 0;
    padding-left: 20px;
  }

  .dev-note li {
    margin-bottom: 4px;
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .modal-content {
      max-height: 95vh;
    }

    .modal-header,
    .modal-body {
      padding: 16px;
    }

    .pack-option {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .purchase-actions {
      flex-direction: column;
    }

    .btn {
      width: 100%;
    }
  }
</style>
