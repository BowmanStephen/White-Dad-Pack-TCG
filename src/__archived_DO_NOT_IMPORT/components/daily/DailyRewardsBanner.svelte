<script lang="ts">
  import { onMount } from 'svelte';
  import { canClaimToday, currentStreak, checkDailyLogin } from '@/stores/daily-rewards';
  import { openDailyRewardsModal } from '@/stores/daily-rewards-modal';
  import { showToast } from '@/stores/ui';

  let showBanner = $state(false);
  let streakCount = $state(0);
  let timeUntilNext = $state('');
  let hasShownNotification = $state(false);

  function updateBanner() {
    const canClaim = canClaimToday.get();
    const streak = currentStreak.get();

    showBanner = canClaim;
    streakCount = streak;

    if (canClaim && !hasShownNotification) {
      // Show notification only once
      showToast(
        `Daily Reward Available! ${streakCount > 1 ? `${streakCount} day streak!` : '🎁'}`,
        'success'
      );
      hasShownNotification = true;
    }

    updateCountdown();
  }

  function updateCountdown() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    timeUntilNext = `${hours}h ${minutes}m`;
  }

  onMount(() => {
    // Check for URL param to open modal
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('daily') === 'true') {
      openDailyRewardsModal();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Check daily login on mount
    const newDay = checkDailyLogin();
    if (newDay) {
      updateBanner();
    } else {
      updateBanner();
    }

    // Update countdown every minute
    const interval = setInterval(() => {
      updateCountdown();
    }, 60000);

    return () => clearInterval(interval);
  });
</script>

{#if showBanner}
  <div
    class="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down"
    role="banner"
    aria-label="Daily rewards available"
  >
    <div class="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-4">
      <!-- Streak Fire Icon -->
      <div class="text-3xl animate-pulse">🔥</div>

      <!-- Streak Info -->
      <div class="flex-1">
        <p class="font-bold text-lg">
          {streakCount > 1 ? `${streakCount} Day Streak!` : 'Daily Reward Ready!'}
        </p>
        <p class="text-sm opacity-90">
          {streakCount > 1 ? `Bonus rewards active!` : 'Claim your free pack now!'}
        </p>
      </div>

      <!-- Claim Button -->
      <button
        on:click={openDailyRewardsModal}
        class="bg-white text-amber-600 px-4 py-2 rounded-lg font-bold hover:bg-amber-50 active:scale-95 transition-all duration-200"
      >
        Claim
      </button>

      <!-- Close Button -->
      <button
        on:click={() => (showBanner = false)}
        class="text-white hover:text-amber-200 transition-colors"
        aria-label="Close banner"
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
    </div>

    <!-- Countdown Timer -->
    <div class="text-center mt-1">
      <p class="text-xs text-white opacity-75">Next reward in: {timeUntilNext}</p>
    </div>
  </div>

  <style>
    .animate-slide-down {
      animation: slideDown 0.5s ease-out;
    }

    @keyframes slideDown {
      from {
        transform: translate(-50%, -100%);
        opacity: 0;
      }
      to {
        transform: translate(-50%, 0);
        opacity: 1;
      }
    }
  </style>
{/if}
