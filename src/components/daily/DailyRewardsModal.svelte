<script lang="ts">
  import {
    dailyRewardsState,
    claimDailyReward,
    currentDay,
    currentStreak,
    longestStreak,
    canClaimToday,
    nextClaimAvailable,
    DAILY_REWARD_TIERS,
    getStreakBonus
  } from '@/stores/daily-rewards';
  import { dailyRewardsModalOpen } from '@/stores/daily-rewards-modal';
  import { showToast } from '@/stores/ui';
  import { onMount } from 'svelte';

  let isOpen = $state(false);

  // Subscribe to modal state
  $effect(() => {
    const unsubscribe = dailyRewardsModalOpen.subscribe((value) => {
      isOpen = value;
    });
    return unsubscribe;
  });

  let claiming = $state(false);
  let timeUntilNext = $state('');
  let justClaimed = $state(false);

  onMount(() => {
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  });

  function updateCountdown() {
    const nextTime = nextClaimAvailable.get();
    const now = new Date();
    const diff = nextTime.getTime() - now.getTime();

    if (diff <= 0) {
      timeUntilNext = 'Available now!';
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    timeUntilNext = `${hours}h ${minutes}m ${seconds}s`;
  }

  async function handleClaim() {
    const canClaim = canClaimToday.get();

    if (!canClaim || claiming) {
      return;
    }

    claiming = true;

    try {
      const reward = claimDailyReward();

      if (reward) {
        justClaimed = true;

        // Show success notification
        showToast(`Daily Reward Claimed! 🎉 You got ${reward.rewardValue}x ${reward.rewardType.replace('_', ' ')}!`, 'success');

        // Close modal after animation
        setTimeout(() => {
          dailyRewardsModalOpen.set(false);
          justClaimed = false;
        }, 2000);
      }
    } catch (error) {
      showToast('Could not claim reward. Please try again.', 'error');
    } finally {
      claiming = false;
    }
  }

  function getRewardIcon(rewardType: string): string {
    switch (rewardType) {
      case 'pack':
        return '📦';
      case 'boosted_pack':
        return '🔥';
      case 'cards':
        return '🃏';
      case 'currency':
        return '💰';
      default:
        return '🎁';
    }
  }

  function getRewardClass(day: number, claimed: boolean): string {
    if (claimed) {
      return 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900 dark:border-green-400 dark:text-green-200';
    }

    if (day === $currentDay) {
      return 'bg-amber-100 border-amber-500 text-amber-700 dark:bg-amber-900 dark:border-amber-400 dark:text-amber-200 ring-2 ring-amber-400';
    }

    if (day < $currentDay) {
      return 'bg-gray-100 border-gray-400 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400';
    }

    return 'bg-white border-gray-300 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 opacity-60';
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    on:click={() => dailyRewardsModalOpen.set(false)}
    role="dialog"
    aria-modal="true"
    aria-labelledby="daily-rewards-title"
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

    <!-- Modal Content -->
    <div
      class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      on:click|stopPropagation
    >
      <!-- Close Button -->
      <button
        on:click={() => dailyRewardsModalOpen.set(false)}
        class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        aria-label="Close modal"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <!-- Header -->
      <div class="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-t-2xl">
        <h2 id="daily-rewards-title" class="text-3xl font-bold mb-2">
          Daily Rewards 🎁
        </h2>
        <div class="flex items-center gap-4">
          <!-- Current Streak -->
          <div class="flex items-center gap-2">
            <span class="text-2xl">🔥</span>
            <div>
              <p class="text-sm opacity-90">Current Streak</p>
              <p class="text-2xl font-bold">{$currentStreak} days</p>
            </div>
          </div>

          <!-- Longest Streak -->
          <div class="flex items-center gap-2">
            <span class="text-2xl">🏆</span>
            <div>
              <p class="text-sm opacity-90">Best Streak</p>
              <p class="text-2xl font-bold">{$longestStreak} days</p>
            </div>
          </div>

          <!-- Streak Bonus -->
          {#if $currentStreak >= 3}
            <div class="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
              <span class="text-xl">⚡</span>
              <div>
                <p class="text-xs opacity-90">Active Bonus</p>
                <p class="text-lg font-bold">{getStreakBonus($currentStreak)}x</p>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Countdown Timer -->
        <div class="mb-6 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {#if $canClaimToday}
              <span class="text-green-600 dark:text-green-400 font-bold">Reward available now!</span>
            {:else}
              Next reward in: <span class="font-mono font-bold">{timeUntilNext}</span>
            {/if}
          </p>
        </div>

        <!-- Rewards Grid -->
        <div class="grid grid-cols-7 gap-2 mb-6">
          {#each DAILY_REWARD_TIERS as tier (tier.day)}
            <div
              class="{getRewardClass(tier.day, $dailyRewardsState.rewards[tier.day - 1].claimed)}
                border-2 rounded-lg p-3 text-center transition-all duration-200"
            >
              <!-- Day Number -->
              <p class="text-xs font-bold mb-1">Day {tier.day}</p>

              <!-- Reward Icon -->
              <div class="text-3xl mb-1">{getRewardIcon(tier.rewardType)}</div>

              <!-- Reward Value -->
              <p class="text-sm font-semibold">{tier.baseValue}x</p>

              <!-- Claimed Status -->
              {#if $dailyRewardsState.rewards[tier.day - 1].claimed}
                <div class="mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mx-auto text-green-600 dark:text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              {/if}
            </div>
          {/each}
        </div>

        <!-- Current Day Reward Info -->
        <div class="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-600 rounded-lg">
          <h3 class="font-bold text-lg mb-2">Today's Reward</h3>
          <div class="flex items-center gap-4">
            <span class="text-4xl">{getRewardIcon(DAILY_REWARD_TIERS[$currentDay - 1].rewardType)}</span>
            <div>
              <p class="font-bold">{DAILY_REWARD_TIERS[$currentDay - 1].description}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {#if $currentStreak >= 3}
                  With streak bonus: {getStreakBonus($currentStreak)}x rewards!
                {:else}
                  Login for 3+ days to unlock streak bonuses!
                {/if}
              </p>
            </div>
          </div>
        </div>

        <!-- Claim Button -->
        <button
          on:click={handleClaim}
          disabled={!$canClaimToday || claiming || justClaimed}
          class="w-full btn-primary text-xl py-4 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
        >
          {#if claiming}
            <span class="flex items-center justify-center gap-2">
              <svg
                class="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Claiming...
            </span>
          {:else if justClaimed}
            <span class="flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Claimed!
            </span>
          {:else if !$canClaimToday}
            Already Claimed
          {:else}
            Claim Daily Reward
          {/if}
        </button>

        <!-- Streak Bonus Info -->
        {#if $currentStreak < 3}
          <div class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>🔥 Login 3 days in a row for 1.25x bonus!</p>
            <p>🏆 Login 7 days in a row for 2x mega bonus!</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
