<script lang="ts">
  /**
   * SETTINGS-001: Settings Manager Component
   *
   * Manages all user settings:
   * - Audio settings (volume, mute)
   * - Animation settings (reduce motion, cinematic mode, skip animations)
   * - Language preference
   */

  import { onMount } from 'svelte';
  import {
    muted,
    masterVolume,
    musicVolume,
    sfxVolume,
    toggleMute,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
    soundTheme,
    setSoundTheme,
    type SoundTheme,
  } from '@/stores/audio';
  import {
    motionMode,
    setMotionMode,
    initializeMotionSettings,
    type MotionMode,
  } from '@/stores/motion';
  import {
    cinematicMode,
    setCinematicMode,
    skipAnimations,
    setSkipAnimations,
    fastForward,
    setFastForward,
    animationQuality,
    setAnimationQuality,
    particlePreset,
    setParticlePreset,
    PARTICLE_PRESETS,
    particleIntensity,
    setParticleIntensity,
    getParticleIntensityMultiplier,
    type AnimationQuality,
    type ParticlePreset,
  } from '@/stores/ui';

  import {
    themeMode,
    setThemeMode,
    isDarkMode,
    getEffectiveTheme,
    type ThemeMode,
  } from '@/stores/theme';
  import {
    notificationPreferences,
    togglePushEnabled,
    setPushEnabled,
    updatePushPermission,
    requestPushPermission,
    toggleDailyRewardNotifications,
    setDailyRewardNotifications,
    toggleTradeNotifications,
    setTradeNotifications,
    toggleAchievementNotifications,
    setAchievementNotifications,
    toggleGeneralNotifications,
    setGeneralNotifications,
    toggleNotificationSound,
    setNotificationSound,
    toggleNotificationVibration,
    setNotificationVibration,
    toggleQuietHours,
    setQuietHours,
    setQuietHoursStart,
    setQuietHoursEnd,
    resetNotificationPreferences,
    isPushSupported,
    isPushPermissionGranted,
    isPushPermissionDenied,
    type NotificationPreferences,
  } from '@/stores/notifications';
  import {
    clearCollectionData,
    clearSettingsData,
    clearAllData,
    confirmClearCollection,
    confirmClearSettings,
    confirmClearAll,
  } from '@/lib/storage/data-manager';
  import type { ClearDataResult } from '@/types';

  // Initialize motion settings on mount
  onMount(() => {
    initializeMotionSettings();
  });

  // Reactive state for store values
  let isMuted = $state(false);
  let currentMasterVolume = $state(0.7);
  let currentMusicVolume = $state(0.7);
  let currentSfxVolume = $state(0.8);
  let currentSoundTheme = $state<SoundTheme>('default');
  let currentMotionMode = $state<MotionMode>('auto');
  let currentCinematicMode = $state<'normal' | 'cinematic'>('normal');
  let currentSkipAnimations = $state(false);
  let currentFastForward = $state(false);
  let currentAnimationQuality = $state<AnimationQuality>('auto');
  let currentParticlePreset = $state<ParticlePreset>('high');
  let currentParticleIntensity = $state(3);
  let currentThemeMode = $state<ThemeMode>('auto');
  let currentIsDarkMode = $state(false);
  let currentNotificationPrefs = $state<NotificationPreferences>(notificationPreferences.get());

  // Subscribe to store changes
  $effect(() => {
    const unsubMuted = muted.subscribe((v) => (isMuted = v));
    const unsubMaster = masterVolume.subscribe((v) => (currentMasterVolume = v));
    const unsubMusic = musicVolume.subscribe((v) => (currentMusicVolume = v));
    const unsubSfx = sfxVolume.subscribe((v) => (currentSfxVolume = v));
    const unsubTheme = soundTheme.subscribe((v) => (currentSoundTheme = v));
    const unsubMotion = motionMode.subscribe((v) => (currentMotionMode = v));
    const unsubCinematic = cinematicMode.subscribe((v) => (currentCinematicMode = v));
    const unsubSkip = skipAnimations.subscribe((v) => (currentSkipAnimations = v));
    const unsubFast = fastForward.subscribe((v) => (currentFastForward = v));
    const unsubQuality = animationQuality.subscribe((v) => (currentAnimationQuality = v));
    const unsubPreset = particlePreset.subscribe((v) => (currentParticlePreset = v));
    const unsubIntensity = particleIntensity.subscribe((v) => (currentParticleIntensity = v));
    const unsubThemeMode = themeMode.subscribe((v) => (currentThemeMode = v));
    const unsubIsDarkMode = isDarkMode.subscribe((v) => (currentIsDarkMode = v));
    const unsubNotifications = notificationPreferences.subscribe((v) => (currentNotificationPrefs = v));

    return () => {
      unsubMuted();
      unsubMaster();
      unsubMusic();
      unsubSfx();
      unsubTheme();
      unsubMotion();
      unsubCinematic();
      unsubSkip();
      unsubFast();
      unsubQuality();
      unsubPreset();
      unsubIntensity();
      unsubThemeMode();
      unsubIsDarkMode();
      unsubNotifications();
    };
  });

  // Notification helper functions
  async function handleRequestPushPermission() {
    const permission = await requestPushPermission();
    if (permission === 'denied') {
      alert('Push notifications were denied. You can enable them in your browser settings.');
    }
  }

  function formatTime(value: string): string {
    const [hours, minutes] = value.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }

  // Sound theme options
  const soundThemes = [
    { value: 'default' as SoundTheme, label: 'Default' },
    { value: 'japanese' as SoundTheme, label: 'Japanese' },
    { value: 'retro' as SoundTheme, label: 'Retro' },
  ];

  // Motion mode options
  const motionModes = [
    {
      value: 'auto' as MotionMode,
      label: 'Auto',
      description: 'Follow your system preferences for reduced motion',
    },
    {
      value: 'reduced' as MotionMode,
      label: 'Reduced',
      description: 'Minimize all animations and motion effects',
    },
    {
      value: 'full' as MotionMode,
      label: 'Full',
      description: 'Enable all animations and particle effects',
    },
  ];

  // Animation quality options
  const animationQualities = [
    {
      value: 'auto' as AnimationQuality,
      label: 'Auto',
      description: 'Automatically adjust based on device performance',
    },
    {
      value: 'high' as AnimationQuality,
      label: 'High',
      description: 'Maximum particle effects and animations',
    },
    {
      value: 'medium' as AnimationQuality,
      label: 'Medium',
      description: 'Balanced performance and visual quality',
    },
    {
      value: 'low' as AnimationQuality,
      label: 'Low',
      description: 'Minimal animations for best performance',
    },
  ];

  // Particle preset options (PACK-VFX-030)
  const particlePresets = [
    {
      value: 'low' as ParticlePreset,
      label: 'Low',
      description: '50% particles, no screen shake - best performance',
    },
    {
      value: 'medium' as ParticlePreset,
      label: 'Medium',
      description: '75% particles, reduced effects for smoother performance',
    },
    {
      value: 'high' as ParticlePreset,
      label: 'High',
      description: '100% particles, all effects enabled (default)',
    },
    {
      value: 'ultra' as ParticlePreset,
      label: 'Ultra',
      description: '150% particles, maximum drama for epic reveals',
    },
  ];

  // Cinematic mode options
  const cinematicModes = [
    {
      value: 'normal' as const,
      label: 'Normal',
      description: 'Standard pack opening speed',
    },
    {
      value: 'cinematic' as const,
      label: 'Cinematic',
      description: 'Slower, more dramatic pack openings with enhanced effects',
    },
  ];

  // Theme mode options
  const themeModes = [
    {
      value: 'auto' as ThemeMode,
      label: 'Auto',
      description: 'Follow your system preference (light/dark)',
    },
    {
      value: 'light' as ThemeMode,
      label: 'Light',
      description: 'Always use light mode',
    },
    {
      value: 'dark' as ThemeMode,
      label: 'Dark',
      description: 'Always use dark mode',
    },
  ];

  // Format volume percentage
  function formatVolume(value: number): string {
    return `${Math.round(value * 100)}%`;
  }

  // PACK-075: Data Management Functions
  async function handleClearCollection() {
    if (!confirmClearCollection()) {
      return;
    }

    const result: ClearDataResult = await clearCollectionData();

    if (result.success) {
      alert('✅ ' + result.message);
      // Optionally reload to show fresh state
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      alert('❌ ' + result.message + (result.error ? '\n\nError: ' + result.error : ''));
    }
  }

  async function handleClearSettings() {
    if (!confirmClearSettings()) {
      return;
    }

    const result: ClearDataResult = await clearSettingsData();

    if (result.success) {
      alert('✅ ' + result.message);
      // Reload to apply default settings
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      alert('❌ ' + result.message + (result.error ? '\n\nError: ' + result.error : ''));
    }
  }

  async function handleClearAll() {
    if (!confirmClearAll()) {
      return;
    }

    const result: ClearDataResult = await clearAllData();

    if (result.success) {
      alert('✅ ' + result.message);
      // Page will reload automatically from clearAllData()
    } else {
      alert('❌ ' + result.message + (result.error ? '\n\nError: ' + result.error : ''));
    }
  }
</script>

<div class="settings-container">
  <!-- Audio Settings Section -->
  <section class="settings-section">
    <div class="section-header">
      <h2>🔊 Audio Settings</h2>
      <p>Control sound effects and music</p>
    </div>

    <!-- Mute Toggle -->
    <div class="setting-row">
      <div class="setting-info">
        <label for="mute-toggle" class="setting-label">Mute All Sounds</label>
        <p class="setting-description">Disable all audio in the game</p>
      </div>
      <button
        id="mute-toggle"
        class="toggle-button"
        class:active={isMuted}
        on:click={toggleMute}
        aria-pressed={isMuted}
        type="button"
      >
        <span class="toggle-slider"></span>
        <span class="toggle-label">{isMuted ? 'Off' : 'On'}</span>
      </button>
    </div>

    <!-- Master Volume -->
    <div class="setting-row">
      <div class="setting-info">
        <label for="master-volume" class="setting-label">Master Volume</label>
        <p class="setting-description">{formatVolume(currentMasterVolume)}</p>
      </div>
      <input
        id="master-volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={currentMasterVolume}
        on:input={(e) => setMasterVolume(parseFloat(e.target.value))}
        class="slider"
        disabled={isMuted}
        aria-label="Master volume"
      />
    </div>

    <!-- Music Volume -->
    <div class="setting-row">
      <div class="setting-info">
        <label for="music-volume" class="setting-label">Music Volume</label>
        <p class="setting-description">{formatVolume(currentMusicVolume)}</p>
      </div>
      <input
        id="music-volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={currentMusicVolume}
        on:input={(e) => setMusicVolume(parseFloat(e.target.value))}
        class="slider"
        disabled={isMuted}
        aria-label="Music volume"
      />
    </div>

    <!-- Sound Effects Volume -->
    <div class="setting-row">
      <div class="setting-info">
        <label for="sfx-volume" class="setting-label">Sound Effects Volume</label>
        <p class="setting-description">{formatVolume(currentSfxVolume)}</p>
      </div>
      <input
        id="sfx-volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        bind:value={currentSfxVolume}
        on:input={(e) => setSfxVolume(parseFloat(e.target.value))}
        class="slider"
        disabled={isMuted}
        aria-label="Sound effects volume"
      />
    </div>

    <!-- Sound Theme -->
    <div class="setting-row">
      <div class="setting-info">
        <label for="sound-theme" class="setting-label">Sound Theme</label>
        <p class="setting-description">Choose your audio style</p>
      </div>
      <select
        id="sound-theme"
        bind:value={currentSoundTheme}
        on:change={(e) => setSoundTheme(e.target.value as SoundTheme)}
        class="select-input"
        aria-label="Sound theme"
      >
        {#each soundThemes as theme}
          <option value={theme.value}>{theme.label}</option>
        {/each}
      </select>
    </div>
  </section>

  <!-- Animation Settings Section -->
  <section class="settings-section">
    <div class="section-header">
      <h2>🎬 Animation Settings</h2>
      <p>Customize visual effects and animations</p>
    </div>

    <!-- Motion Mode -->
    <div class="setting-row">
      <div class="setting-info">
        <label for="motion-mode" class="setting-label">Motion Mode</label>
        <p class="setting-description">Control animation intensity</p>
      </div>
      <select
        id="motion-mode"
        bind:value={currentMotionMode}
        on:change={(e) => setMotionMode(e.target.value as MotionMode)}
        class="select-input"
        aria-label="Motion mode"
      >
        {#each motionModes as mode}
          <option value={mode.value}>{mode.label}</option>
        {/each}
      </select>
    </div>

    <!-- Motion Mode Description -->
    <div class="setting-description-box">
      {#each motionModes as mode}
        {#if mode.value === currentMotionMode}
          <p>{mode.description}</p>
        {/if}
      {/each}
    </div>

    <!-- Animation Quality -->
    <div class="setting-row">
      <div class="setting-info">
        <label for="animation-quality" class="setting-label">Animation Quality</label>
        <p class="setting-description">Balance between visuals and performance</p>
      </div>
      <select
        id="animation-quality"
        bind:value={currentAnimationQuality}
        on:change={(e) => setAnimationQuality(e.target.value as AnimationQuality)}
        class="select-input"
        aria-label="Animation quality"
      >
        {#each animationQualities as quality}
          <option value={quality.value}>{quality.label}</option>
        {/each}
      </select>
    </div>

    <!-- Animation Quality Description -->
    <div class="setting-description-box">
      {#each animationQualities as quality}
        {#if quality.value === currentAnimationQuality}
          <p>{quality.description}</p>
        {/if}
      {/each}
    </div>

    <!-- Particle Quality Preset (PACK-VFX-030) -->
    <div class="setting-row">
      <div class="setting-info">
        <label for="particle-preset" class="setting-label">Particle Quality Preset</label>
        <p class="setting-description">Quick particle effect quality settings</p>
      </div>
      <select
        id="particle-preset"
        bind:value={currentParticlePreset}
        on:change={(e) => setParticlePreset(e.target.value as ParticlePreset)}
        class="select-input"
        aria-label="Particle quality preset"
      >
        {#each particlePresets as preset}
          <option value={preset.value}>{preset.label}</option>
        {/each}
      </select>
    </div>

    <!-- Particle Preset Description -->
    <div class="setting-description-box">
      {#each particlePresets as preset}
        {#if preset.value === currentParticlePreset}
          <p>{preset.description}</p>
        {/if}
      {/each}
    </div>

    <!-- Cinematic Mode -->
    <div class="setting-row">
      <div class="setting-info">
        <label for="cinematic-mode" class="setting-label">Pack Opening Mode</label>
        <p class="setting-description">Choose your pack opening experience</p>
      </div>
      <select
        id="cinematic-mode"
        bind:value={currentCinematicMode}
        on:change={(e) => setCinematicMode(e.target.value as 'normal' | 'cinematic')}
        class="select-input"
        aria-label="Cinematic mode"
      >
        {#each cinematicModes as mode}
          <option value={mode.value}>{mode.label}</option>
        {/each}
      </select>
    </div>

    <!-- Cinematic Mode Description -->
    <div class="setting-description-box">
      {#each cinematicModes as mode}
        {#if mode.value === currentCinematicMode}
          <p>{mode.description}</p>
        {/if}
      {/each}
    </div>

    <!-- Skip Animations Toggle -->
    <div class="setting-row">
      <div class="setting-info">
        <label for="skip-animations" class="setting-label">Skip Animations</label>
        <p class="setting-description">Instant card reveals without animations</p>
      </div>
      <button
        id="skip-animations"
        class="toggle-button"
        class:active={currentSkipAnimations}
        on:click={() => setSkipAnimations(!currentSkipAnimations)}
        aria-pressed={currentSkipAnimations}
        type="button"
      >
        <span class="toggle-slider"></span>
        <span class="toggle-label">{currentSkipAnimations ? 'On' : 'Off'}</span>
      </button>
    </div>

    <!-- Fast Forward Toggle -->
    <div class="setting-row">
      <div class="setting-info">
        <label for="fast-forward" class="setting-label">Fast Forward (2x)</label>
        <p class="setting-description">Double animation speed for quicker openings</p>
      </div>
      <button
        id="fast-forward"
        class="toggle-button"
        class:active={currentFastForward}
        on:click={() => setFastForward(!currentFastForward)}
        aria-pressed={currentFastForward}
        type="button"
      >
        <span class="toggle-slider"></span>
        <span class="toggle-label">{currentFastForward ? 'On' : 'Off'}</span>
      </button>
    </div>

    <!-- Particle Intensity Slider (PACK-VFX-029) -->
    <div class="setting-row">
      <div class="setting-info">
        <label for="particle-intensity" class="setting-label">Particle Intensity</label>
        <p class="setting-description">
          {currentParticleIntensity === 1 ? 'Minimal (20%)' :
           currentParticleIntensity === 2 ? 'Low (60%)' :
           currentParticleIntensity === 3 ? 'Normal (100%)' :
           currentParticleIntensity === 4 ? 'High (150%)' :
           currentParticleIntensity === 5 ? 'Maximum (200%)' : 'Normal (100%)'}
        </p>
      </div>
      <div class="slider-container">
        <input
          id="particle-intensity"
          type="range"
          min="1"
          max="5"
          step="1"
          bind:value={currentParticleIntensity}
          on:input={(e) => setParticleIntensity(parseInt(e.target.value, 10))}
          class="slider"
          aria-label="Particle intensity"
          aria-valuemin="1"
          aria-valuemax="5"
          aria-valuenow={currentParticleIntensity}
          aria-valuetext={currentParticleIntensity === 1 ? 'Minimal' :
                          currentParticleIntensity === 2 ? 'Low' :
                          currentParticleIntensity === 3 ? 'Normal' :
                          currentParticleIntensity === 4 ? 'High' :
                          currentParticleIntensity === 5 ? 'Maximum' : 'Normal'}
        />
        <div class="slider-labels">
          <span>Min</span>
          <span>Max</span>
        </div>
      </div>
    </div>

    <!-- Particle Intensity Description -->
    <div class="setting-description-box">
      <p>✨ Control particle effect density. Lower values improve performance on slower devices.</p>
    </div>
  </section>

  <!-- Theme Settings Section -->
  <section class="settings-section">
    <div class="section-header">
      <h2>🎨 Theme Settings</h2>
      <p>Choose your preferred color scheme</p>
    </div>

    <!-- Theme Mode -->
    <div class="setting-row">
      <div class="setting-info">
        <label for="theme-mode" class="setting-label">Theme Mode</label>
        <p class="setting-description">Control the app's appearance</p>
      </div>
      <select
        id="theme-mode"
        bind:value={currentThemeMode}
        on:change={(e) => setThemeMode(e.target.value as ThemeMode)}
        class="select-input"
        aria-label="Theme mode"
      >
        {#each themeModes as mode}
          <option value={mode.value}>{mode.label}</option>
        {/each}
      </select>
    </div>

    <!-- Theme Mode Description -->
    <div class="setting-description-box">
      {#each themeModes as mode}
        {#if mode.value === currentThemeMode}
          <p>{mode.description}</p>
        {/if}
      {/each}
    </div>

    <!-- Current Theme Indicator -->
    <div class="setting-row">
      <div class="setting-info">
        <span class="setting-label">Current Theme</span>
      </div>
      <div class="theme-indicator">
        <span class="theme-indicator-dot" class:dark={currentIsDarkMode}></span>
        <span class="theme-indicator-text">
          {currentThemeMode === 'auto'
            ? `Auto (${getEffectiveTheme()})`
            : currentThemeMode.charAt(0).toUpperCase() + currentThemeMode.slice(1)}
        </span>
      </div>
    </div>

    <!-- Theme Note -->
    <div class="setting-note">
      <p>💡 <strong>Note:</strong> Theme changes apply instantly. Your preference is saved automatically.</p>
    </div>
  </section>

  <!-- Notification Settings Section -->
  <section class="settings-section">
    <div class="section-header">
      <h2>🔔 Notification Settings</h2>
      <p>Manage how and when you receive notifications</p>
    </div>

    <!-- Push Notifications Toggle -->
    {#if isPushSupported()}
      <div class="setting-row">
        <div class="setting-info">
          <label for="push-toggle" class="setting-label">Push Notifications</label>
          <p class="setting-description">
            {isPushPermissionDenied()
              ? 'Push notifications denied in browser settings'
              : isPushPermissionGranted()
                ? 'Push notifications enabled'
                : 'Enable browser push notifications'}
          </p>
        </div>
        {#if isPushPermissionDenied()}
          <button
            class="toggle-button disabled"
            disabled
            aria-pressed="false"
            type="button"
          >
            <span class="toggle-slider"></span>
            <span class="toggle-label">Denied</span>
          </button>
        {:else if isPushPermissionGranted()}
          <button
            id="push-toggle"
            class="toggle-button"
            class:active={currentNotificationPrefs.pushEnabled}
            on:click={togglePushEnabled}
            aria-pressed={currentNotificationPrefs.pushEnabled}
            type="button"
          >
            <span class="toggle-slider"></span>
            <span class="toggle-label">{currentNotificationPrefs.pushEnabled ? 'On' : 'Off'}</span>
          </button>
        {:else}
          <button
            id="push-toggle"
            class="btn-primary"
            on:click={handleRequestPushPermission}
            type="button"
          >
            Enable
          </button>
        {/if}
      </div>

      <!-- Daily Reward Notifications -->
      <div class="setting-row">
        <div class="setting-info">
          <label for="daily-reward-toggle" class="setting-label">Daily Rewards</label>
          <p class="setting-description">Get notified about daily login rewards and streaks</p>
        </div>
        <button
          id="daily-reward-toggle"
          class="toggle-button"
          class:active={currentNotificationPrefs.dailyRewardNotifications}
          on:click={toggleDailyRewardNotifications}
          aria-pressed={currentNotificationPrefs.dailyRewardNotifications}
          type="button"
        >
          <span class="toggle-slider"></span>
          <span class="toggle-label">{currentNotificationPrefs.dailyRewardNotifications ? 'On' : 'Off'}</span>
        </button>
      </div>

      <!-- Trade Notifications -->
      <div class="setting-row">
        <div class="setting-info">
          <label for="trade-toggle" class="setting-label">Trade Notifications</label>
          <p class="setting-description">Get notified about trade offers and updates</p>
        </div>
        <button
          id="trade-toggle"
          class="toggle-button"
          class:active={currentNotificationPrefs.tradeNotifications}
          on:click={toggleTradeNotifications}
          aria-pressed={currentNotificationPrefs.tradeNotifications}
          type="button"
        >
          <span class="toggle-slider"></span>
          <span class="toggle-label">{currentNotificationPrefs.tradeNotifications ? 'On' : 'Off'}</span>
        </button>
      </div>

      <!-- Achievement Notifications -->
      <div class="setting-row">
        <div class="setting-info">
          <label for="achievement-toggle" class="setting-label">Achievement Notifications</label>
          <p class="setting-description">Get notified when you unlock achievements</p>
        </div>
        <button
          id="achievement-toggle"
          class="toggle-button"
          class:active={currentNotificationPrefs.achievementNotifications}
          on:click={toggleAchievementNotifications}
          aria-pressed={currentNotificationPrefs.achievementNotifications}
          type="button"
        >
          <span class="toggle-slider"></span>
          <span class="toggle-label">{currentNotificationPrefs.achievementNotifications ? 'On' : 'Off'}</span>
        </button>
      </div>

      <!-- General Notifications -->
      <div class="setting-row">
        <div class="setting-info">
          <label for="general-toggle" class="setting-label">General Notifications</label>
          <p class="setting-description">General updates and announcements</p>
        </div>
        <button
          id="general-toggle"
          class="toggle-button"
          class:active={currentNotificationPrefs.generalNotifications}
          on:click={toggleGeneralNotifications}
          aria-pressed={currentNotificationPrefs.generalNotifications}
          type="button"
        >
          <span class="toggle-slider"></span>
          <span class="toggle-label">{currentNotificationPrefs.generalNotifications ? 'On' : 'Off'}</span>
        </button>
      </div>

      <!-- Notification Sound -->
      <div class="setting-row">
        <div class="setting-info">
          <label for="notification-sound-toggle" class="setting-label">Notification Sound</label>
          <p class="setting-description">Play sound for notifications</p>
        </div>
        <button
          id="notification-sound-toggle"
          class="toggle-button"
          class:active={currentNotificationPrefs.soundEnabled}
          on:click={toggleNotificationSound}
          aria-pressed={currentNotificationPrefs.soundEnabled}
          type="button"
        >
          <span class="toggle-slider"></span>
          <span class="toggle-label">{currentNotificationPrefs.soundEnabled ? 'On' : 'Off'}</span>
        </button>
      </div>

      <!-- Notification Vibration -->
      <div class="setting-row">
        <div class="setting-info">
          <label for="notification-vibration-toggle" class="setting-label">Notification Vibration</label>
          <p class="setting-description">Vibrate for notifications (mobile only)</p>
        </div>
        <button
          id="notification-vibration-toggle"
          class="toggle-button"
          class:active={currentNotificationPrefs.vibrationEnabled}
          on:click={toggleNotificationVibration}
          aria-pressed={currentNotificationPrefs.vibrationEnabled}
          type="button"
        >
          <span class="toggle-slider"></span>
          <span class="toggle-label">{currentNotificationPrefs.vibrationEnabled ? 'On' : 'Off'}</span>
        </button>
      </div>

      <!-- Quiet Hours Toggle -->
      <div class="setting-row">
        <div class="setting-info">
          <label for="quiet-hours-toggle" class="setting-label">Quiet Hours</label>
          <p class="setting-description">Disable notifications during specific hours</p>
        </div>
        <button
          id="quiet-hours-toggle"
          class="toggle-button"
          class:active={currentNotificationPrefs.quietHoursEnabled}
          on:click={toggleQuietHours}
          aria-pressed={currentNotificationPrefs.quietHoursEnabled}
          type="button"
        >
          <span class="toggle-slider"></span>
          <span class="toggle-label">{currentNotificationPrefs.quietHoursEnabled ? 'On' : 'Off'}</span>
        </button>
      </div>

      <!-- Quiet Hours Time Range -->
      {#if currentNotificationPrefs.quietHoursEnabled}
        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">Quiet Hours Range</label>
            <p class="setting-description">
              {formatTime(currentNotificationPrefs.quietHoursStart)} - {formatTime(currentNotificationPrefs.quietHoursEnd)}
            </p>
          </div>
          <div class="time-inputs">
            <input
              type="time"
              bind:value={currentNotificationPrefs.quietHoursStart}
              on:change={(e) => setQuietHoursStart(e.target.value)}
              class="time-input"
              aria-label="Quiet hours start time"
            />
            <span class="time-separator">to</span>
            <input
              type="time"
              bind:value={currentNotificationPrefs.quietHoursEnd}
              on:change={(e) => setQuietHoursEnd(e.target.value)}
              class="time-input"
              aria-label="Quiet hours end time"
            />
          </div>
        </div>

        <!-- Quiet Hours Description -->
        <div class="setting-description-box">
          <p>🌙 Notifications will be silenced between {formatTime(currentNotificationPrefs.quietHoursStart)} and {formatTime(currentNotificationPrefs.quietHoursEnd)}.</p>
        </div>
      {/if}

      <!-- Reset Notifications Button -->
      <div class="setting-row">
        <div class="setting-info">
          <label class="setting-label">Reset Notifications</label>
          <p class="setting-description">Reset all notification settings to defaults</p>
        </div>
        <button
          class="btn-secondary"
          on:click={resetNotificationPreferences}
          type="button"
        >
          Reset
        </button>
      </div>

      <!-- Notification Note -->
      <div class="setting-note">
        <p>💡 <strong>Note:</strong> Push notifications require browser permission. Category-specific settings only apply if push notifications are enabled.</p>
      </div>
    {:else}
      <!-- Push Not Supported Message -->
      <div class="setting-note">
        <p>⚠️ <strong>Not Supported:</strong> Your browser does not support push notifications. Try using a modern browser like Chrome, Firefox, or Edge.</p>
      </div>
    {/if}
  </section>

  <!-- Data Management Section -->
  <section class="settings-section">
    <div class="section-header">
      <h2>🗑️ Data Management</h2>
      <p>Clear your data to start fresh</p>
    </div>

    <!-- Warning Box -->
    <div class="setting-warning">
      <p>⚠️ <strong>Warning:</strong> These actions cannot be undone. Please be certain before proceeding.</p>
    </div>

    <!-- Clear Collection Button -->
    <div class="setting-row">
      <div class="setting-info">
        <label class="setting-label">Clear Collection</label>
        <p class="setting-description">Delete all packs, cards, decks, and achievements</p>
      </div>
      <button
        class="btn-danger"
        on:click={handleClearCollection}
        type="button"
      >
        Clear Collection
      </button>
    </div>

    <!-- Clear Settings Button -->
    <div class="setting-row">
      <div class="setting-info">
        <label class="setting-label">Clear Settings</label>
        <p class="setting-description">Reset all settings to default values</p>
      </div>
      <button
        class="btn-danger"
        on:click={handleClearSettings}
        type="button"
      >
        Clear Settings
      </button>
    </div>

    <!-- Clear All Data Button -->
    <div class="setting-row">
      <div class="setting-info">
        <label class="setting-label">Clear All Data</label>
        <p class="setting-description">Complete factory reset - delete everything</p>
      </div>
      <button
        class="btn-danger"
        on:click={handleClearAll}
        type="button"
      >
        Clear All Data
      </button>
    </div>

    <!-- Data Management Note -->
    <div class="setting-note">
      <p>💡 <strong>Note:</strong> "Clear Collection" keeps your settings intact. "Clear Settings" keeps your collection. "Clear All Data" removes everything and reloads the app.</p>
    </div>
  </section>

  <!-- Save Indicator -->
  <div class="save-indicator">
    <p>✓ All settings are saved automatically</p>
  </div>
</div>

<style>
  .settings-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }

  .settings-section {
    background: rgba(30, 41, 59, 0.8);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 1px solid rgba(251, 191, 36, 0.2);
    backdrop-filter: blur(10px);
  }

  .section-header {
    margin-bottom: 1.5rem;
    border-bottom: 1px solid rgba(251, 191, 36, 0.2);
    padding-bottom: 1rem;
  }

  .section-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: #fbbf24;
  }

  .section-header p {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
  }

  .setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  }

  .setting-row:last-child {
    border-bottom: none;
  }

  .setting-info {
    flex: 1;
    margin-right: 1rem;
  }

  .setting-label {
    display: block;
    font-size: 1rem;
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 0.25rem;
  }

  .setting-description {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
  }

  /* Toggle Button */
  .toggle-button {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: rgba(30, 41, 59, 0.8);
    border: 2px solid #475569;
    border-radius: 9999px;
    color: #e2e8f0;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 80px;
    justify-content: space-between;
  }

  .toggle-button:hover {
    border-color: #fbbf24;
    background: rgba(251, 191, 36, 0.1);
  }

  .toggle-button.active {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    border-color: #fbbf24;
    color: #0f172a;
  }

  .toggle-slider {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: currentColor;
    transition: transform 0.2s ease;
  }

  .toggle-button.active .toggle-slider {
    transform: translateX(4px);
  }

  .toggle-label {
    font-size: 0.875rem;
  }

  /* Range Slider */
  .slider {
    width: 150px;
    height: 8px;
    border-radius: 4px;
    background: #475569;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fbbf24;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fbbf24;
    cursor: pointer;
    border: none;
    transition: transform 0.2s ease;
  }

  .slider::-moz-range-thumb:hover {
    transform: scale(1.2);
  }

  .slider:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Slider Container (for labeled sliders) */
  .slider-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 150px;
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    font-weight: 600;
    color: #94a3b8;
  }

  /* Select Input */
  .select-input {
    position: relative;
    z-index: 100;
    padding: 0.5rem 2rem 0.5rem 1rem;
    background: rgba(30, 41, 59, 0.8);
    border: 2px solid #475569;
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    /* FIX: Ensure dropdown works across all browsers - use appearance: auto for native behavior */
    appearance: auto;
    -webkit-appearance: auto;
    -moz-appearance: auto;
    /* Keep custom chevron as fallback for browsers that support it with auto */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23fbbf24' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 1rem;
    transition: all 0.2s ease;
    min-width: 150px;
  }

  /* Rotate chevron on hover for visual feedback */
  .select-input:hover {
    border-color: #fbbf24;
    background-color: rgba(251, 191, 36, 0.1);
  }

  .select-input:focus {
    outline: none;
    border-color: #fbbf24;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2);
    position: relative;
    z-index: 1000;
  }

  /* Ensure select dropdown options are visible */
  .select-input:focus-visible {
    z-index: 9999;
  }

  /* Add active state for when select is open (clicked) */
  .select-input:active {
    transform: scale(0.98);
  }

  /* Style options within select */
  .select-input option {
    background: #1e293b;
    color: #e2e8f0;
    padding: 0.5rem;
  }

  .select-input option:hover,
  .select-input option:checked {
    background: rgba(251, 191, 36, 0.2);
    color: #fbbf24;
  }

  /* Description Box */
  .setting-description-box {
    background: rgba(15, 23, 42, 0.6);
    border-left: 3px solid #fbbf24;
    padding: 0.75rem 1rem;
    border-radius: 4px;
    margin-top: -0.5rem;
    margin-bottom: 1rem;
  }

  .setting-description-box p {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
  }

  /* Note Box */
  .setting-note {
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
  }

  .setting-note p {
    font-size: 0.875rem;
    color: #fbbf24;
    margin: 0;
  }

  .setting-note strong {
    font-weight: 600;
  }

  /* Theme Indicator */
  .theme-indicator {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: rgba(15, 23, 42, 0.6);
    border-radius: 8px;
    border: 2px solid rgba(71, 85, 105, 0.5);
  }

  .theme-indicator-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    box-shadow: 0 0 8px rgba(251, 191, 36, 0.5);
    transition: all 0.3s ease;
  }

  .theme-indicator-dot.dark {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    box-shadow: 0 0 8px rgba(96, 165, 250, 0.5);
  }

  .theme-indicator-text {
    font-size: 0.875rem;
    font-weight: 600;
    color: #e2e8f0;
  }

  /* Save Indicator */
  .save-indicator {
    text-align: center;
    padding: 1rem;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 8px;
    margin-top: 2rem;
  }

  .save-indicator p {
    font-size: 0.875rem;
    color: #22c55e;
    margin: 0;
    font-weight: 600;
  }

  /* Responsive Design */
  @media (max-width: 640px) {
    .settings-container {
      padding: 0.5rem;
    }

    .settings-section {
      padding: 1rem;
    }

    .setting-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .setting-info {
      margin-right: 0;
    }

    .slider {
      width: 100%;
    }

    .select-input {
      width: 100%;
    }

    .toggle-button {
      width: 100%;
    }

    .section-header h2 {
      font-size: 1.25rem;
    }
  }

  /* Time Inputs for Quiet Hours */
  .time-inputs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .time-input {
    padding: 0.5rem;
    background: rgba(30, 41, 59, 0.8);
    border: 2px solid #475569;
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 0.875rem;
    font-weight: 600;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .time-input:hover {
    border-color: #fbbf24;
    background-color: rgba(251, 191, 36, 0.1);
  }

  .time-input:focus {
    outline: none;
    border-color: #fbbf24;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2);
  }

  .time-separator {
    color: #94a3b8;
    font-weight: 600;
    font-size: 0.875rem;
  }

  /* Disabled Toggle Button */
  .toggle-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toggle-button.disabled:hover {
    border-color: #475569;
    background: rgba(30, 41, 59, 0.8);
  }

  /* Secondary Button (for Reset) */
  .btn-secondary {
    padding: 0.5rem 1rem;
    background: transparent;
    border: 2px solid #ef4444;
    border-radius: 8px;
    color: #ef4444;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-secondary:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: #dc2626;
    color: #dc2626;
  }

  .btn-secondary:active {
    transform: scale(0.95);
  }

  /* Warning Box (PACK-075) */
  .setting-warning {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .setting-warning p {
    font-size: 0.875rem;
    color: #ef4444;
    margin: 0;
  }

  .setting-warning strong {
    font-weight: 600;
  }

  /* Danger Button (PACK-075) */
  .btn-danger {
    padding: 0.5rem 1rem;
    background: transparent;
    border: 2px solid #ef4444;
    border-radius: 8px;
    color: #ef4444;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .btn-danger:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: #dc2626;
    color: #dc2626;
  }

  .btn-danger:active {
    transform: scale(0.95);
  }
</style>
