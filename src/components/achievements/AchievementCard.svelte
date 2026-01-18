<script lang="ts">
  import { onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import type { Achievement, AchievementRarity } from '@/types';
  import { ACHIEVEMENT_RARITY_CONFIG } from '@/types';
  import { t } from '@/i18n';

  // Props
  interface Props {
    achievement: Achievement;
  }

  let { achievement }: Props = $props();
  let showProgress = $state(false);

  // Animated progress value
  const progress = tweened(0, {
    duration: 600,
    easing: cubicOut,
  });

  // Get rarity configuration
  let rarityConfig = $derived(ACHIEVEMENT_RARITY_CONFIG[achievement.rarity]);

  // Calculate progress percentage
  let progressPercent = $derived(achievement.maxProgress && achievement.maxProgress > 0
    ? Math.min(100, (achievement.progress || 0) / achievement.maxProgress * 100)
    : 0
  );

  // Check if achievement is unlocked
  let isUnlocked = $derived(achievement.unlockedAt !== undefined);

  // Check if achievement has progress
  let hasProgress = $derived(achievement.maxProgress !== undefined && achievement.maxProgress > 1);

  // Animate progress on mount
  onMount(() => {
    if (hasProgress.value && !isUnlocked.value) {
      showProgress = true;
      progress.set(achievement.progress || 0);
    }
  });

  // Update progress when achievement changes
  $effect(() => {
    if (hasProgress.value && achievement.progress !== undefined) {
      progress.set(achievement.progress);
    }
  });
</script>

<div
  class="achievement-card"
  class:unlocked={isUnlocked.value}
  class:locked={!isUnlocked.value}
  style="border-color: {rarityConfig.value.borderColor};"
>
  <!-- Achievement icon and rarity -->
  <div class="achievement-header">
    <div
      class="achievement-icon"
      class:unlocked-icon={isUnlocked.value}
      style="color: {isUnlocked.value ? rarityConfig.value.color : '#666'};"
    >
      {achievement.icon || '🏆'}
    </div>
    <div class="achievement-info">
      <div class="achievement-rarity" style="color: {rarityConfig.value.color};">
        {rarityConfig.value.name}
      </div>
      <h3 class="achievement-name" class:unlocked-name={isUnlocked.value}>
        {achievement.name}
      </h3>
      <p class="achievement-description">
        {achievement.description}
      </p>
    </div>
  </div>

  <!-- Progress bar for multi-step achievements -->
  {#if hasProgress.value && !isUnlocked.value}
    <div class="progress-section" class:visible={showProgress}>
      <div class="progress-header">
        <span class="progress-label">
          {t('achievements.progress')}
        </span>
        <span class="progress-values">
          {Math.round($progress)} / {achievement.maxProgress}
        </span>
      </div>

      <!-- Progress bar track -->
      <div class="progress-track">
        <!-- Animated progress fill -->
        <div
          class="progress-fill"
          style="width: {$progress / (achievement.maxProgress || 1) * 100}%; background: {rarityConfig.value.color};"
        ></div>

        <!-- Progress glow effect -->
        <div
          class="progress-glow"
          style="width: {$progress / (achievement.maxProgress || 1) * 100}%; background: {rarityConfig.value.glowColor};"
        ></div>
      </div>

      <!-- Progress percentage -->
      <div class="progress-percent" style="color: {rarityConfig.value.color};">
        {Math.round(progressPercent.value)}%
      </div>
    </div>
  {:else if isUnlocked.value}
    <div class="unlocked-badge" style="background: {rarityConfig.value.bgColor}; color: {rarityConfig.value.color};">
      {t('achievements.complete')}
    </div>
  {/if}
</div>

<style>
  .achievement-card {
    position: relative;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-width: 2px;
    border-style: solid;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .achievement-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  .achievement-card.unlocked {
    background: linear-gradient(135deg, #1a1a2e 0%, #1e3a5f 100%);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }

  .achievement-card.locked {
    opacity: 0.85;
  }

  .achievement-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .achievement-icon {
    font-size: 48px;
    line-height: 1;
    flex-shrink: 0;
    filter: grayscale(100%) brightness(0.6);
    transition: all 0.3s ease;
  }

  .achievement-icon.unlocked-icon {
    filter: none;
    text-shadow: 0 0 20px currentColor;
    animation: bounce 0.6s ease-out;
  }

  @keyframes bounce {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.15);
    }
  }

  .achievement-info {
    flex: 1;
    min-width: 0;
  }

  .achievement-rarity {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4px;
    opacity: 0.9;
  }

  .achievement-name {
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 4px 0;
    line-height: 1.3;
    color: #e0e0e0;
    transition: color 0.3s ease;
  }

  .achievement-name.unlocked-name {
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .achievement-description {
    font-size: 13px;
    margin: 0;
    line-height: 1.4;
    color: #a0a0a0;
  }

  /* Progress Section */
  .progress-section {
    margin-top: 12px;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.4s ease;
  }

  .progress-section.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .progress-label {
    font-size: 12px;
    font-weight: 600;
    color: #b0b0b0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .progress-values {
    font-size: 13px;
    font-weight: 700;
    color: #ffffff;
  }

  .progress-track {
    position: relative;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .progress-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    border-radius: 4px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 10px currentColor;
  }

  .progress-glow {
    position: absolute;
    top: -2px;
    left: 0;
    height: calc(100% + 4px);
    border-radius: 4px;
    filter: blur(8px);
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0.6;
  }

  .progress-percent {
    margin-top: 4px;
    font-size: 12px;
    font-weight: 700;
    text-align: right;
  }

  /* Unlocked Badge */
  .unlocked-badge {
    display: inline-block;
    margin-top: 12px;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-width: 1px;
    border-style: solid;
  }

  /* Mobile Responsive */
  @media (max-width: 480px) {
    .achievement-card {
      padding: 12px;
    }

    .achievement-icon {
      font-size: 40px;
    }

    .achievement-name {
      font-size: 14px;
    }

    .achievement-description {
      font-size: 12px;
    }

    .progress-header {
      margin-bottom: 4px;
    }

    .progress-label {
      font-size: 11px;
    }

    .progress-values {
      font-size: 12px;
    }
  }
</style>
