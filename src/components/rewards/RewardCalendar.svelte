<script lang="ts">
  import { onMount } from 'svelte';
  import type { DailyReward, DailyRewardTier } from '@/types/daily-rewards';
  import { t } from '@/i18n';

  // Props
  interface Props {
    rewards: DailyReward[];
    currentDay: number;
    streak: number;
  }

  let { rewards = [], currentDay = 1, streak = 0 }: Props = $props();

  // 7-day reward configuration
  const rewardTiers: DailyRewardTier[] = [
    {
      day: 1,
      rewardType: 'pack',
      baseValue: 1,
      description: 'Standard Pack',
      icon: '📦'
    },
    {
      day: 2,
      rewardType: 'pack',
      baseValue: 1,
      description: 'Standard Pack',
      icon: '📦'
    },
    {
      day: 3,
      rewardType: 'cards',
      baseValue: 3,
      description: '3 Common Cards',
      icon: '🃏'
    },
    {
      day: 4,
      rewardType: 'pack',
      baseValue: 2,
      description: '2 Standard Packs',
      icon: '📦'
    },
    {
      day: 5,
      rewardType: 'cards',
      baseValue: 1,
      description: '1 Rare Card',
      icon: '⭐'
    },
    {
      day: 6,
      rewardType: 'pack',
      baseValue: 1,
      description: '1 Premium Pack',
      icon: '🎁'
    },
    {
      day: 7,
      rewardType: 'boosted_pack',
      baseValue: 1,
      description: 'Mega Pack',
      icon: '🔥'
    }
  ];

  // Get reward status for a given day
  function getRewardStatus(day: number): 'claimed' | 'available' | 'locked' | 'upcoming' {
    const reward = rewards.find(r => r.day === day);

    if (reward?.claimed) {
      return 'claimed';
    } else if (day === currentDay) {
      return 'available';
    } else if (day < currentDay) {
      return 'locked'; // Missed day
    } else {
      return 'upcoming';
    }
  }

  // Get streak bonus for a day
  function getStreakBonus(day: number): number {
    if (streak >= 7) return 2.0; // 2x bonus for 7+ day streak
    if (streak >= 5) return 1.5; // 1.5x bonus for 5+ day streak
    if (streak >= 3) return 1.25; // 1.25x bonus for 3+ day streak
    return 1.0;
  }

  // Get reward display info
  function getRewardDisplay(day: number) {
    const tier = rewardTiers.find(t => t.day === day);
    const status = getRewardStatus(day);
    const bonus = getStreakBonus(day);

    return {
      tier,
      status,
      bonus,
      canClaim: status === 'available'
    };
  }
</script>

<div class="reward-calendar">
  <div class="calendar-header">
    <h2 class="calendar-title">{$t('daily.calendar.title')}</h2>
    <div class="streak-display">
      <span class="streak-icon">🔥</span>
      <span class="streak-count">{streak}</span>
      <span class="streak-label">{$t('daily.calendar.dayStreak')}</span>
    </div>
  </div>

  <div class="calendar-grid" role="list" aria-label="Daily rewards calendar">
    {#each rewardTiers as tier (tier.day)}
      {@const display = getRewardDisplay(tier.day)}
      <div
        class="reward-day"
        class:claimed={display.status === 'claimed'}
        class:available={display.status === 'available'}
        class:locked={display.status === 'locked'}
        class:upcoming={display.status === 'upcoming'}
        role="listitem"
        aria-label={`Day ${tier.day}: ${tier.description}`}
      >
        <div class="day-number">{tier.day}</div>

        <div class="reward-icon">
          {tier.icon}
          {#if display.bonus > 1}
            <div class="streak-badge" title="{$t('daily.calendar.streakBonus', { multiplier: display.bonus })}">
              {display.bonus}x
            </div>
          {/if}
        </div>

        <div class="reward-details">
          <div class="reward-description">{tier.description}</div>
          {#if display.status === 'claimed'}
            <div class="status-badge claimed-badge">{$t('daily.calendar.claimed')}</div>
          {:else if display.status === 'available'}
            <div class="status-badge available-badge">{$t('daily.calendar.available')}</div>
          {:else if display.status === 'locked'}
            <div class="status-badge locked-badge">{$t('daily.calendar.missed')}</div>
          {:else}
            <div class="reward-preview">{$t('daily.calendar.upcoming')}</div>
          {/if}
        </div>

        {#if display.canClaim}
          <div class="claim-pulse"></div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="calendar-footer">
    <p class="footer-text">{$t('daily.calendar.footerText')}</p>
  </div>
</div>

<style>
  .reward-calendar {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
    border-radius: 1rem;
    border: 2px solid rgba(251, 191, 36, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .calendar-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #fbbf24;
    margin: 0;
    text-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
  }

  .streak-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    border-radius: 2rem;
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
  }

  .streak-icon {
    font-size: 1.5rem;
    animation: pulse 2s ease-in-out infinite;
  }

  .streak-count {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
  }

  .streak-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1e293b;
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .reward-day {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.25rem;
    background: linear-gradient(135deg, rgba(51, 65, 85, 0.6) 0%, rgba(30, 41, 59, 0.8) 100%);
    border-radius: 0.75rem;
    border: 2px solid transparent;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .reward-day.available {
    border-color: #fbbf24;
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.2) 100%);
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
    transform: scale(1.02);
  }

  .reward-day.claimed {
    border-color: #22c55e;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.15) 100%);
    opacity: 0.9;
  }

  .reward-day.locked {
    border-color: #ef4444;
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.15) 100%);
    opacity: 0.7;
  }

  .reward-day.upcoming {
    opacity: 0.6;
  }

  .day-number {
    font-size: 0.875rem;
    font-weight: 600;
    color: #94a3b8;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .reward-icon {
    position: relative;
    font-size: 3rem;
    margin-bottom: 0.75rem;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
  }

  .streak-badge {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    padding: 0.25rem 0.5rem;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: 1rem;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
    animation: bounce 1s ease-in-out infinite;
  }

  .reward-details {
    text-align: center;
    width: 100%;
  }

  .reward-description {
    font-size: 0.875rem;
    font-weight: 500;
    color: #e2e8f0;
    margin-bottom: 0.5rem;
  }

  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .claimed-badge {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
  }

  .available-badge {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #1e293b;
    box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
    animation: pulse 2s ease-in-out infinite;
  }

  .locked-badge {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  }

  .reward-preview {
    font-size: 0.75rem;
    color: #94a3b8;
    font-style: italic;
  }

  .claim-pulse {
    position: absolute;
    inset: 0;
    border-radius: 0.75rem;
    background: radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%);
    animation: pulse-ring 2s ease-in-out infinite;
    pointer-events: none;
  }

  .calendar-footer {
    text-align: center;
    padding-top: 1rem;
    border-top: 1px solid rgba(148, 163, 184, 0.2);
  }

  .footer-text {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.9;
      transform: scale(1.05);
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-3px);
    }
  }

  @keyframes pulse-ring {
    0% {
      opacity: 0;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.1);
    }
    100% {
      opacity: 0;
      transform: scale(1);
    }
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .reward-calendar {
      padding: 1rem;
    }

    .calendar-title {
      font-size: 1.5rem;
    }

    .calendar-grid {
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 0.75rem;
    }

    .reward-day {
      padding: 1rem;
    }

    .reward-icon {
      font-size: 2.5rem;
    }
  }

  @media (max-width: 480px) {
    .calendar-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .reward-day {
      padding: 0.75rem;
    }

    .reward-icon {
      font-size: 2rem;
    }

    .reward-description {
      font-size: 0.75rem;
    }
  }
</style>
