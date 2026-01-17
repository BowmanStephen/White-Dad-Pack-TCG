<script lang="ts">
  import type { DadPassSummary } from '@/types';

  export let summary: DadPassSummary;
</script>

<div class="daddypass-progress">
  <h2>Your Progress</h2>
  <div class="progress-bar-container">
    <div class="progress-bar">
      <div class="progress-fill" style="width: {summary.progressPercent}%"></div>
    </div>
    <span class="progress-text">{Math.floor(summary.progressPercent)}%</span>
  </div>
  <div class="tier-info">
    <span class="current-tier">Tier {summary.currentTier}</span>
    <span class="divider">/</span>
    <span class="max-tier">{summary.maxTier}</span>
  </div>
  <div class="xp-info">
    <span class="xp-amount">{summary.totalXP} XP</span>
    <span class="xp-label">Total XP Earned</span>
  </div>
</div>

<style>
  .daddypass-progress {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .daddypass-progress h2 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
    color: #1f2937;
  }

  .progress-bar-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .progress-bar {
    flex: 1;
    height: 24px;
    background: #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
    border-radius: 12px;
    transition: width 0.3s ease-out;
    position: relative;
  }

  .progress-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .progress-text {
    font-weight: 700;
    color: #f59e0b;
    min-width: 3rem;
    text-align: right;
  }

  .tier-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .current-tier {
    font-size: 1.25rem;
    font-weight: 700;
    color: #f59e0b;
  }

  .divider {
    color: #9ca3af;
  }

  .max-tier {
    color: #6b7280;
  }

  .xp-info {
    display: flex;
    flex-direction: column;
  }

  .xp-amount {
    font-size: 2rem;
    font-weight: 800;
    color: #1f2937;
  }

  .xp-label {
    font-size: 0.875rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  @media (max-width: 768px) {
    .daddypass-progress {
      padding: 1rem;
    }

    .xp-amount {
      font-size: 1.5rem;
    }
  }
</style>
