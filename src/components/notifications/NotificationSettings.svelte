<script lang="ts">
  import {
    notificationPreferences,
    updatePreference,
    toggleCategory,
    requestPushPermission,
    getPushPermission,
    isPushSupported,
    type NotificationCategory,
    isCategoryEnabled,
  } from '../../stores/notifications';
  import Toggle from '../common/Toggle.svelte';

  const categories: Array<{ id: NotificationCategory; name: string; icon: string; description: string }> = [
    { id: 'daily_reward', name: 'Daily Rewards', icon: '🎁', description: 'Get notified when your daily reward is ready' },
    { id: 'trade', name: 'Trade Offers', icon: '📦', description: 'Get notified when you receive trade offers' },
    { id: 'achievement', name: 'Achievements', icon: '🏆', description: 'Get notified when you unlock achievements' },
    { id: 'general', name: 'General', icon: '🔔', description: 'General app notifications' },
  ];

  $: preferences = $notificationPreferences;
  $: pushSupported = isPushSupported();
  $: pushPermission = getPushPermission();
  $: pushEnabled = preferences.pushEnabled && pushPermission === 'granted';

  async function handleRequestPermission() {
    await requestPushPermission();
  }

  function handleTogglePush() {
    if (pushPermission === 'default') {
      handleRequestPermission();
    } else if (pushPermission === 'granted') {
      updatePreference('pushEnabled', !preferences.pushEnabled);
    }
  }

  function handleToggleCategory(category: NotificationCategory) {
    toggleCategory(category);
  }
</script>

<div class="notification-settings space-y-6">
  <!-- Push Notifications Section -->
  <section class="space-y-4">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Push Notifications</h2>

    {#if pushSupported}
      <div class="space-y-3">
        <!-- Permission Status -->
        <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div class="flex items-center gap-3">
            <span class="text-2xl" aria-hidden="true">📱</span>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Browser Notifications</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {#if pushPermission === 'granted'}
                  Notifications enabled
                {:else if pushPermission === 'denied'}
                  Notifications blocked in browser settings
                {:else}
                  Enable notifications to stay updated
                {/if}
              </p>
            </div>
          </div>

          {#if pushPermission !== 'denied'}
            <button
              on:click={handleTogglePush}
              class="px-4 py-2 text-sm font-medium rounded-lg transition-colors {pushEnabled
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'}"
              disabled={pushPermission === 'denied'}
            >
              {pushPermission === 'default' ? 'Enable' : pushEnabled ? 'Enabled' : 'Disabled'}
            </button>
          {/if}
        </div>

        {#if pushPermission === 'default'}
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Enable push notifications to receive alerts even when the browser is closed.
          </p>
        {/if}
      </div>
    {:else}
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Push notifications are not supported in your browser.
      </p>
    {/if}
  </section>

  <!-- Notification Categories -->
  <section class="space-y-4">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Notification Categories</h2>

    <div class="space-y-2">
      {#each categories as category}
        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div class="flex items-center gap-3">
            <span class="text-xl" aria-hidden="true">{category.icon}</span>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{category.name}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{category.description}</p>
            </div>
          </div>

          <Toggle
            checked={isCategoryEnabled(category.id)}
            onChange={() => handleToggleCategory(category.id)}
            label={`Toggle ${category.name} notifications`}
          />
        </div>
      {/each}
    </div>
  </section>

  <!-- In-App Settings -->
  <section class="space-y-4">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">In-App Settings</h2>

    <div class="space-y-3">
      <!-- Sound -->
      <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div class="flex items-center gap-3">
          <span class="text-xl" aria-hidden="true">🔊</span>
          <div>
            <p class="font-medium text-gray-900 dark:text-white">Sound</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Play sound for notifications</p>
          </div>
        </div>

        <Toggle
          checked={preferences.soundEnabled}
          onChange={(checked) => updatePreference('soundEnabled', checked)}
          label="Toggle notification sound"
        />
      </div>

      <!-- Vibration -->
      <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div class="flex items-center gap-3">
          <span class="text-xl" aria-hidden="true">📳</span>
          <div>
            <p class="font-medium text-gray-900 dark:text-white">Vibration</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Vibrate on mobile devices</p>
          </div>
        </div>

        <Toggle
          checked={preferences.vibrationEnabled}
          onChange={(checked) => updatePreference('vibrationEnabled', checked)}
          label="Toggle notification vibration"
        />
      </div>
    </div>
  </section>

  <!-- Quiet Hours -->
  <section class="space-y-4">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Quiet Hours</h2>

    <div class="space-y-3">
      <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div class="flex items-center gap-3">
          <span class="text-xl" aria-hidden="true">🌙</span>
          <div>
            <p class="font-medium text-gray-900 dark:text-white">Enable Quiet Hours</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Mute notifications during specific hours
            </p>
          </div>
        </div>

        <Toggle
          checked={preferences.quietHoursEnabled}
          onChange={(checked) => updatePreference('quietHoursEnabled', checked)}
          label="Toggle quiet hours"
        />
      </div>

      {#if preferences.quietHoursEnabled}
        <div class="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div class="flex-1">
            <label for="quiet-start" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Time
            </label>
            <input
              id="quiet-start"
              type="time"
              value={preferences.quietHoursStart}
              on:change={(e) => updatePreference('quietHoursStart', e.target.value)}
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div class="flex-1">
            <label for="quiet-end" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Time
            </label>
            <input
              id="quiet-end"
              type="time"
              value={preferences.quietHoursEnd}
              on:change={(e) => updatePreference('quietHoursEnd', e.target.value)}
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      {/if}
    </div>
  </section>
</div>
