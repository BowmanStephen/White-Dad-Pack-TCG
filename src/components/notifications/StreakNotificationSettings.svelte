<script lang="ts">
  import { onMount } from 'svelte';
  import {
    getNotificationConfig,
    getNotificationPermission,
    requestNotificationPermission,
    updateNotificationConfig,
    areBrowserNotificationsSupported,
    calculateHoursUntilExpiry
  } from '@/lib/notifications/streak';
  import { dailyRewardsState } from '@/stores/daily-rewards';
  import { t } from '@/i18n';

  // Notification state
  let config = $state(getNotificationConfig());
  let notificationPermission = $state<'default' | 'granted' | 'denied'>('default');
  let hoursUntilExpiry = $state<number | null>(null);
  let emailAddress = $state(config.emailAddress || '');

  // Load notification permission on mount
  onMount(() => {
    if (areBrowserNotificationsSupported()) {
      notificationPermission = getNotificationPermission();
    }

    // Calculate hours until streak expiry
    const state = dailyRewardsState.get();
    hoursUntilExpiry = calculateHoursUntilExpiry(state.lastLoginDate);
  });

  // Request notification permission
  async function enableNotifications() {
    const granted = await requestNotificationPermission();
    if (granted) {
      notificationPermission = 'granted';
      updateNotificationConfig({ browserNotifications: true });
      config = getNotificationConfig();
    }
  }

  // Toggle browser notifications
  function toggleBrowserNotifications() {
    if (notificationPermission !== 'granted') {
      enableNotifications();
      return;
    }

    updateNotificationConfig({ browserNotifications: !config.browserNotifications });
    config = getNotificationConfig();
  }

  // Toggle email reminders
  function toggleEmailReminders() {
    if (!config.emailReminders && !emailAddress) {
      alert('Please enter an email address first');
      return;
    }

    updateNotificationConfig({
      emailReminders: !config.emailReminders,
      emailAddress: emailAddress || undefined
    });
    config = getNotificationConfig();
  }

  // Update email address
  function updateEmail() {
    updateNotificationConfig({ emailAddress: emailAddress || undefined });
    config = getNotificationConfig();
  }

  // Format expiry time
  function formatExpiryTime(hours: number | null): string {
    if (hours === null) return 'N/A';
    if (hours <= 0) return 'Expired!';

    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);

    if (days > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${remainingHours}h`;
  }

  // Get urgency color
  function getUrgencyColor(hours: number | null): string {
    if (hours === null) return '#94a3b8';
    if (hours <= 6) return '#ef4444'; // Red
    if (hours <= 12) return '#f59e0b'; // Orange
    return '#22c55e'; // Green
  }
</script>

<div class="notification-settings">
  <div class="settings-header">
    <h3 class="settings-title">{$t('daily.notifications.title')}</h3>
    <p class="settings-subtitle">{$t('daily.notifications.subtitle')}</p>
  </div>

  <!-- Streak Status -->
  <div class="status-card">
    <div class="status-header">
      <span class="status-icon">⏰</span>
      <span class="status-title">{$t('daily.notifications.streakStatus')}</span>
    </div>
    <div class="status-content">
      <div class="expiry-display" style="color: {getUrgencyColor(hoursUntilExpiry)}">
        {formatExpiryTime(hoursUntilExpiry)}
      </div>
      <p class="expiry-hint">
        {#if hoursUntilExpiry !== null && hoursUntilExpiry <= 12}
          ⚠️ {$t('daily.notifications.expiringSoon')}
        {:else}
          {$t('daily.notifications.safeForNow')}
        {/if}
      </p>
    </div>
  </div>

  <!-- Browser Notifications -->
  <div class="setting-group">
    <div class="setting-header">
      <div class="setting-info">
        <span class="setting-icon">🔔</span>
        <div>
          <h4 class="setting-title">{$t('daily.notifications.browserNotifications')}</h4>
          <p class="setting-description">{$t('daily.notifications.browserDescription')}</p>
        </div>
      </div>
      <button
        class="toggle-button"
        class:active={config.browserNotifications && notificationPermission === 'granted'}
        class:disabled={!areBrowserNotificationsSupported()}
        on:click={toggleBrowserNotifications}
        disabled={!areBrowserNotificationsSupported()}
        aria-label="Toggle browser notifications"
      >
        {#if notificationPermission === 'granted' && config.browserNotifications}
          ON
        {:else if notificationPermission === 'denied'}
          BLOCKED
        {:else}
          OFF
        {/if}
      </button>
    </div>
    {#if !areBrowserNotificationsSupported()}
      <p class="warning-text">{$t('daily.notifications.notSupported')}</p>
    {:else if notificationPermission === 'denied'}
      <p class="warning-text">{$t('daily.notifications.blockedHint')}</p>
    {/if}
  </div>

  <!-- Email Reminders -->
  <div class="setting-group">
    <div class="setting-header">
      <div class="setting-info">
        <span class="setting-icon">📧</span>
        <div>
          <h4 class="setting-title">{$t('daily.notifications.emailReminders')}</h4>
          <p class="setting-description">{$t('daily.notifications.emailDescription')}</p>
        </div>
      </div>
      <button
        class="toggle-button"
        class:active={config.emailReminders}
        on:click={toggleEmailReminders}
        aria-label="Toggle email reminders"
      >
        {config.emailReminders ? 'ON' : 'OFF'}
      </button>
    </div>
    <div class="email-input-group">
      <input
        type="email"
        class="email-input"
        placeholder={$t('daily.notifications.emailPlaceholder')}
        bind:value={emailAddress}
        on:blur={updateEmail}
        aria-label="Email address for reminders"
      />
      <span class="input-hint">{$t('daily.notifications.emailHint')}</span>
    </div>
  </div>

  <!-- Warning Thresholds -->
  <div class="setting-group">
    <div class="setting-header">
      <div class="setting-info">
        <span class="setting-icon">⚙️</span>
        <div>
          <h4 class="setting-title">{$t('daily.notifications.warningThresholds')}</h4>
          <p class="setting-description">{$t('daily.notifications.thresholdsDescription')}</p>
        </div>
      </div>
    </div>
    <div class="thresholds-list">
      {#each config.warningThresholds as threshold}
        <div class="threshold-item">
          <span class="threshold-label">{threshold}h</span>
          <span class="threshold-description">
            {threshold === 6 ? $t('daily.notifications.critical') :
             threshold === 12 ? $t('daily.notifications.warning') :
             $t('daily.notifications.reminder')}
          </span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .notification-settings {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
    border-radius: 1rem;
    border: 2px solid rgba(251, 191, 36, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .settings-header {
    margin-bottom: 2rem;
    text-align: center;
  }

  .settings-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fbbf24;
    margin: 0 0 0.5rem 0;
    text-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
  }

  .settings-subtitle {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
  }

  .status-card {
    padding: 1rem;
    background: linear-gradient(135deg, rgba(51, 65, 85, 0.6) 0%, rgba(30, 41, 59, 0.8) 100%);
    border-radius: 0.75rem;
    border: 2px solid rgba(148, 163, 184, 0.2);
    margin-bottom: 1.5rem;
  }

  .status-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .status-icon {
    font-size: 1.5rem;
  }

  .status-title {
    font-size: 1rem;
    font-weight: 600;
    color: #e2e8f0;
    margin: 0;
  }

  .status-content {
    text-align: center;
  }

  .expiry-display {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 8px currentColor;
  }

  .expiry-hint {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
  }

  .setting-group {
    padding: 1rem;
    background: linear-gradient(135deg, rgba(51, 65, 85, 0.6) 0%, rgba(30, 41, 59, 0.8) 100%);
    border-radius: 0.75rem;
    border: 2px solid rgba(148, 163, 184, 0.2);
    margin-bottom: 1rem;
  }

  .setting-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .setting-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }

  .setting-icon {
    font-size: 1.5rem;
  }

  .setting-title {
    font-size: 1rem;
    font-weight: 600;
    color: #e2e8f0;
    margin: 0 0 0.25rem 0;
  }

  .setting-description {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
  }

  .toggle-button {
    padding: 0.5rem 1.25rem;
    background: linear-gradient(135deg, rgba(148, 163, 184, 0.2) 0%, rgba(71, 85, 105, 0.3) 100%);
    border: 2px solid rgba(148, 163, 184, 0.3);
    border-radius: 1.5rem;
    color: #e2e8f0;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
  }

  .toggle-button:hover:not(.disabled) {
    background: linear-gradient(135deg, rgba(148, 163, 184, 0.3) 0%, rgba(71, 85, 105, 0.4) 100%);
    transform: translateY(-1px);
  }

  .toggle-button.active {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    border-color: #22c55e;
    color: white;
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  }

  .toggle-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .warning-text {
    font-size: 0.875rem;
    color: #ef4444;
    margin: 0.5rem 0 0 0;
    padding: 0.5rem;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 0.5rem;
    border-left: 3px solid #ef4444;
  }

  .email-input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .email-input {
    padding: 0.75rem 1rem;
    background: rgba(15, 23, 42, 0.8);
    border: 2px solid rgba(148, 163, 184, 0.3);
    border-radius: 0.5rem;
    color: #e2e8f0;
    font-size: 0.875rem;
    transition: all 0.3s ease;
  }

  .email-input:focus {
    outline: none;
    border-color: #fbbf24;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
  }

  .input-hint {
    font-size: 0.75rem;
    color: #94a3b8;
    font-style: italic;
  }

  .thresholds-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .threshold-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background: rgba(15, 23, 42, 0.6);
    border-radius: 0.5rem;
    border: 1px solid rgba(148, 163, 184, 0.2);
  }

  .threshold-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #fbbf24;
  }

  .threshold-description {
    font-size: 0.875rem;
    color: #94a3b8;
  }

  @media (max-width: 768px) {
    .notification-settings {
      padding: 1rem;
    }

    .setting-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .toggle-button {
      align-self: flex-end;
    }

    .expiry-display {
      font-size: 2rem;
    }
  }
</style>
