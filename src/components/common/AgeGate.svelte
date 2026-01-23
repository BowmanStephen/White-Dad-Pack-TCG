<!--
  AgeGate.svelte
  Age verification modal for adult humor content
  Shows once per user, stored in localStorage
-->

<script lang="ts">
  import { onMount } from 'svelte';

  const STORAGE_KEY = 'dadddeck_age_verified';
  const STORAGE_KEY_TIMESTAMP = 'dadddeck_age_verification_date';

  let showModal = $state(false);
  let isDeclined = $state(false);

  onMount(() => {
    // Check if user has already verified
    const verified = localStorage.getItem(STORAGE_KEY);
    if (verified !== 'true') {
      // Small delay to let page load before showing modal
      setTimeout(() => {
        showModal = true;
      }, 500);
    }
  });

  function handleConfirm() {
    localStorage.setItem(STORAGE_KEY, 'true');
    localStorage.setItem(STORAGE_KEY_TIMESTAMP, new Date().toISOString());
    showModal = false;
  }

  function handleDecline() {
    isDeclined = true;
  }

  function handleGoBack() {
    // Navigate away or show friendly message
    window.history.back();
  }
</script>

{#if showModal}
  <div
    class="age-gate-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="age-gate-title"
    aria-describedby="age-gate-description"
  >
    <div class="age-gate-modal">
      {#if !isDeclined}
        <!-- Age Verification Form -->
        <div class="age-gate-content">
          <div class="age-gate-icon">🔞</div>
          <h1 id="age-gate-title" class="age-gate-title">Age Verification Required</h1>
          <p id="age-gate-description" class="age-gate-description">
            This game contains <strong>adult humor</strong> and <strong>mature themes</strong>.
            You must be 18 years or older to play.
          </p>

          <div class="age-gate-info">
            <div class="info-item">
              <span class="info-icon">🎮</span>
              <span class="info-text">Free to play trading card game</span>
            </div>
            <div class="info-item">
              <span class="info-icon">😈</span>
              <span class="info-text">Satirical humor & parody content</span>
            </div>
            <div class="info-item">
              <span class="info-icon">🃏</span>
              <span class="info-text">Collect dad-themed cards</span>
            </div>
          </div>

          <div class="age-gate-actions">
            <button
              class="age-gate-button confirm"
              onclick={handleConfirm}
            >
              I am 18 or older - Enter
            </button>
            <button
              class="age-gate-button decline"
              onclick={handleDecline}
            >
              I am under 18
            </button>
          </div>

          <p class="age-gate-disclaimer">
            By entering, you confirm that you are 18 years of age or older.
          </p>
        </div>
      {:else}
        <!-- Under 18 Response -->
        <div class="age-gate-content declined">
          <div class="age-gate-icon">🛡️</div>
          <h1 class="age-gate-title">Sorry, Young Padawan</h1>
          <p class="age-gate-description">
            This game contains mature content and is not appropriate for players under 18.
          </p>
          <p class="age-gate-alternative">
            Come back when you're older! In the meantime, there are plenty of other
            awesome card games to explore.
          </p>
          <div class="age-gate-actions">
            <button
              class="age-gate-button back"
              onclick={handleGoBack}
            >
              Go Back
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .age-gate-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 23, 42, 0.98);
    backdrop-filter: blur(10px);
    padding: 1rem;
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .age-gate-modal {
    max-width: 500px;
    width: 100%;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 2px solid rgba(251, 191, 36, 0.3);
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.4s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .age-gate-content {
    text-align: center;
  }

  .age-gate-content.declined {
    opacity: 1;
  }

  .age-gate-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    animation: bounce 2s ease-in-out infinite;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .age-gate-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #fbbf24;
    margin: 0 0 1rem 0;
    line-height: 1.2;
  }

  .age-gate-description {
    font-size: 1rem;
    color: #94a3b8;
    margin: 0 0 1.5rem 0;
    line-height: 1.6;
  }

  .age-gate-description strong {
    color: #fbbf24;
    font-weight: 600;
  }

  .age-gate-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 0 0 1.5rem 0;
    padding: 1rem;
    background: rgba(30, 41, 59, 0.5);
    border-radius: 0.75rem;
    border: 1px solid rgba(71, 85, 105, 0.3);
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-align: left;
  }

  .info-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  .info-text {
    font-size: 0.875rem;
    color: #e2e8f0;
  }

  .age-gate-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 0 0 1rem 0;
  }

  .age-gate-button {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
  }

  .age-gate-button.confirm {
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    color: #0f172a;
    border-color: #fbbf24;
    box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
  }

  .age-gate-button.confirm:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
  }

  .age-gate-button.decline {
    background: transparent;
    color: #94a3b8;
    border-color: rgba(148, 163, 184, 0.3);
  }

  .age-gate-button.decline:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.3);
  }

  .age-gate-button.back {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border-color: #3b82f6;
  }

  .age-gate-button.back:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  }

  .age-gate-disclaimer {
    font-size: 0.75rem;
    color: #64748b;
    margin: 0;
  }

  .age-gate-alternative {
    font-size: 0.9rem;
    color: #cbd5e1;
    margin: 0 0 1.5rem 0;
    line-height: 1.5;
  }

  /* Responsive adjustments */
  @media (min-width: 640px) {
    .age-gate-modal {
      padding: 2.5rem;
    }

    .age-gate-title {
      font-size: 2rem;
    }

    .age-gate-actions {
      flex-direction: row;
    }

    .age-gate-button {
      flex: 1;
    }
  }
</style>
