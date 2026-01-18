<script lang="ts">
  import type { PlayerStats } from '@/types';

  export let stats: PlayerStats;

  // Stat items to display
  const statItems = [
    { key: 'totalPacksOpened', label: 'Packs Opened', icon: '📦', color: '#667eea' },
    { key: 'totalCards', label: 'Total Cards', icon: '🃏', color: '#764ba2' },
    { key: 'uniqueCards', label: 'Unique Cards', icon: '✨', color: '#f59e0b' },
    { key: 'rarePulls', label: 'Rare Pulls', icon: '💎', color: '#3b82f6' },
    { key: 'epicPulls', label: 'Epic Pulls', icon: '🌟', color: '#a855f7' },
    { key: 'legendaryPulls', label: 'Legendary Pulls', icon: '👑', color: '#f97316' },
    { key: 'mythicPulls', label: 'Mythic Pulls', icon: '🌈', color: '#ec4899' },
    { key: 'holoPulls', label: 'Holo Pulls', icon: '✨', color: '#14b8a6' },
    { key: 'collectionValue', label: 'Collection Value', icon: '💰', color: '#22c55e', format: true },
  ] as const;
</script>

<div class="stats-display">
  <div class="stats-grid">
    {#each statItems as item}
      {@const value = stats[item.key as keyof PlayerStats]}
      {@const formattedValue = item.format ? value.toLocaleString() : value}
      <div
        class="stat-card"
        style="--stat-color: {item.color};"
      >
        <div class="stat-icon" style="background: {item.color};">
          {item.icon}
        </div>
        <div class="stat-info">
          <span class="stat-value">{formattedValue}</span>
          <span class="stat-label">{item.label}</span>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .stats-display {
    width: 100%;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .stat-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
    border: 2px solid transparent;
    border-radius: 12px;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .stat-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--stat-color);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 0;
  }

  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  .stat-card:hover::before {
    opacity: 0.05;
  }

  .stat-icon {
    position: relative;
    z-index: 1;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .stat-info {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 800;
    line-height: 1;
    background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .stat-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .stats-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.75rem;
    }

    .stat-card {
      padding: 1rem;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      font-size: 1.5rem;
    }

    .stat-value {
      font-size: 1.5rem;
    }

    .stat-label {
      font-size: 0.75rem;
    }
  }
</style>
