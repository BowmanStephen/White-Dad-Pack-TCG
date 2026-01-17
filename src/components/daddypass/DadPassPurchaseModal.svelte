<script lang="ts">
  import { dadPassSubscription } from '@/stores/daddypass';

  export let onPurchase: (autoRenew: boolean) => void;
  export let onClose: () => void;
  export let processing = false;

  let autoRenew = false;

  function handlePurchase() {
    onPurchase(autoRenew);
  }

  function handleClose() {
    if (!processing) {
      onClose();
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }
</script>

<div class="modal-backdrop" on:click={handleBackdropClick}>
  <div class="modal-content" on:click={(e) => e.stopPropagation()}>
    <div class="modal-header">
      <h2>Get DadPass</h2>
      <button class="close-btn" on:click={handleClose} disabled={processing}>×</button>
    </div>

    <div class="modal-body">
      <div class="price-tag">
        <span class="price-amount">$4.99</span>
        <span class="price-duration">/ 30 days</span>
      </div>

      <div class="features-list">
        <h3>What's Included:</h3>
        <ul>
          <li>
            <span class="feature-icon">✨</span>
            <span class="feature-text">Premium packs every 3 days</span>
          </li>
          <li>
            <span class="feature-icon">📅</span>
            <span class="feature-text">Daily XP rewards (+100 XP/day)</span>
          </li>
          <li>
            <span class="feature-icon">💎</span>
            <span class="feature-text">EXCLUSIVE Legendary card at tier 10</span>
          </li>
          <li>
            <span class="feature-icon">👑</span>
            <span class="feature-text">EXCLUSIVE Mythic card at tier 30</span>
          </li>
          <li>
            <span class="feature-icon">🏷️</span>
            <span class="feature-text">Exclusive titles & card backs</span>
          </li>
          <li>
            <span class="feature-icon">🎁</span>
            <span class="feature-text">10 bonus premium packs</span>
          </li>
        </ul>
      </div>

      <div class="autorenew-toggle">
        <label class="toggle-label">
          <input type="checkbox" bind:checked={autoRenew} />
          <span class="toggle-slider"></span>
          <span class="toggle-text">Auto-renew DadPass ($4.99 every 30 days)</span>
        </label>
      </div>

      <div class="terms">
        <p>By purchasing DadPass, you agree to our terms of service.</p>
        <p>Cancel anytime from your account settings.</p>
      </div>
    </div>

    <div class="modal-footer">
      <button class="cancel-btn" on:click={handleClose} disabled={processing}>
        Maybe Later
      </button>
      <button class="purchase-btn" on:click={handlePurchase} disabled={processing}>
        {processing ? 'Processing...' : 'Get DadPass'}
      </button>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #1f2937;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    color: #6b7280;
    cursor: pointer;
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
  }

  .close-btn:hover:not(:disabled) {
    background: #f3f4f6;
    color: #1f2937;
  }

  .close-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .price-tag {
    text-align: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border-radius: 12px;
    border: 2px solid #fbbf24;
  }

  .price-amount {
    display: block;
    font-size: 3rem;
    font-weight: 800;
    color: #78350f;
  }

  .price-duration {
    display: block;
    font-size: 1.125rem;
    color: #92400e;
  }

  .features-list {
    margin-bottom: 2rem;
  }

  .features-list h3 {
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    color: #1f2937;
  }

  .features-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .features-list li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f3f4f6;
  }

  .features-list li:last-child {
    border-bottom: none;
  }

  .feature-icon {
    font-size: 1.5rem;
  }

  .feature-text {
    font-size: 1rem;
    color: #374151;
  }

  .autorenew-toggle {
    margin-bottom: 1.5rem;
  }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    user-select: none;
  }

  .toggle-label input[type="checkbox"] {
    display: none;
  }

  .toggle-slider {
    position: relative;
    width: 48px;
    height: 24px;
    background: #d1d5db;
    border-radius: 12px;
    transition: background 0.3s;
  }

  .toggle-slider::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: transform 0.3s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .toggle-label input:checked + .toggle-slider {
    background: #16a34a;
  }

  .toggle-label input:checked + .toggle-slider::before {
    transform: translateX(24px);
  }

  .toggle-text {
    font-size: 0.875rem;
    color: #374151;
  }

  .terms {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
  }

  .terms p {
    margin: 0;
    font-size: 0.75rem;
    color: #6b7280;
    line-height: 1.5;
  }

  .terms p:last-child {
    margin-top: 0.5rem;
  }

  .modal-footer {
    display: flex;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .cancel-btn,
  .purchase-btn {
    flex: 1;
    padding: 0.875rem;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-btn {
    background: #f3f4f6;
    color: #374151;
  }

  .cancel-btn:hover:not(:disabled) {
    background: #e5e7eb;
  }

  .purchase-btn {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #78350f;
    box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
  }

  .purchase-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.6);
  }

  .cancel-btn:disabled,
  .purchase-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .modal-content {
      max-height: 95vh;
    }

    .modal-footer {
      flex-direction: column;
    }

    .price-amount {
      font-size: 2.5rem;
    }
  }
</style>
