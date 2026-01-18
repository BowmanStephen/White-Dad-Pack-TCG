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
    type AnimationQuality,
  } from '@/stores/ui';
  import { locale, changeLocale, getLocaleName, getAvailableLocales } from '@/i18n/store';
  import type { Locale } from '@/i18n';
  import {
    themeMode,
    setThemeMode,
    isDarkMode,
    getEffectiveTheme,
    type ThemeMode,
  } from '@/stores/theme';

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
  let currentLocale = $state<Locale>('en');
  let currentThemeMode = $state<ThemeMode>('auto');
  let currentIsDarkMode = $state(false);

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
    const unsubLocale = locale.subscribe((v) => (currentLocale = v));
    const unsubThemeMode = themeMode.subscribe((v) => (currentThemeMode = v));
    const unsubIsDarkMode = isDarkMode.subscribe((v) => (currentIsDarkMode = v));

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
      unsubLocale();
      unsubThemeMode();
      unsubIsDarkMode();
    };
  });

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

  // Helper function to get available locales
  function getLocaleOptions(): { value: Locale; label: string }[] {
    const locales = getAvailableLocales();
    return locales.map((loc) => ({
      value: loc,
      label: getLocaleName(loc),
    }));
  }

  // Format volume percentage
  function formatVolume(value: number): string {
    return `${Math.round(value * 100)}%`;
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

  <!-- Language Settings Section -->
  <section class="settings-section">
    <div class="section-header">
      <h2>🌐 Language Settings</h2>
      <p>Choose your preferred language</p>
    </div>

    <!-- Language Selector -->
    <div class="setting-row">
      <div class="setting-info">
        <label for="language-select" class="setting-label">Language</label>
        <p class="setting-description">Select your preferred language</p>
      </div>
      <select
        id="language-select"
        bind:value={currentLocale}
        on:change={(e) => changeLocale(e.target.value as Locale)}
        class="select-input"
        aria-label="Language preference"
      >
        {#each getLocaleOptions() as localeOption}
          <option value={localeOption.value}>{localeOption.label}</option>
        {/each}
      </select>
    </div>

    <!-- Language Note -->
    <div class="setting-note">
      <p>💡 <strong>Note:</strong> Changing the language will instantly update all text in the app. Your preference is saved automatically.</p>
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

  /* Select Input */
  .select-input {
    padding: 0.5rem 2rem 0.5rem 1rem;
    background: rgba(30, 41, 59, 0.8);
    border: 2px solid #475569;
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23fbbf24' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    transition: all 0.2s ease;
    min-width: 150px;
  }

  .select-input:hover {
    border-color: #fbbf24;
    background-color: rgba(251, 191, 36, 0.1);
  }

  .select-input:focus {
    outline: none;
    border-color: #fbbf24;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2);
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
</style>
