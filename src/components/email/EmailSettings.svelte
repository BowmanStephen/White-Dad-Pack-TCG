<script lang="ts">
  import { onMount } from 'svelte';
  import Toggle from '../common/Toggle.svelte';
  import {
    emailPreferences,
    emailVerification,
    initializeEmailPreferences,
    sendVerificationEmail,
    verifyEmail,
    resendVerification,
    updateEmailAddress,
    updateEmailPreferences,
    isEmailCategoryEnabled,
    unsubscribeAllEmails,
    resubscribeEmails,
    getNextDigestDate,
  } from '@/stores/email';
  import type { EmailPreferences, VerificationStatus } from '@/types';
  import { notifySuccess, notifyError, notifyInfo } from '@/stores/notifications';

  // Local state
  let email = $state('');
  let verificationCode = $state('');
  let isSending = $state(false);
  let isVerifying = $state(false);
  let showVerificationInput = $state(false);

  // Email preferences state
  let prefs = $state<EmailPreferences | null>(null);
  let verification = $state<EmailVerification | null>(null);
  let nextDigestDate = $state<Date | null>(null);

  // Load data on mount
  onMount(() => {
    loadPreferences();
    loadVerification();
  });

  // Subscribe to stores
  $effect(() => {
    const unsubPrefs = emailPreferences.subscribe((value) => {
      prefs = value;
      if (value) {
        email = value.email;
      }
    });
    const unsubVerification = emailVerification.subscribe((value) => {
      verification = value;
      showVerificationInput = value?.status === 'pending';
    });

    return () => {
      unsubPrefs();
      unsubVerification();
    };
  });

  function loadPreferences() {
    const storedPrefs = emailPreferences.get();
    if (storedPrefs) {
      prefs = storedPrefs;
      email = storedPrefs.email;
    }
    nextDigestDate = getNextDigestDate();
  }

  function loadVerification() {
    verification = emailVerification.get();
    showVerificationInput = verification?.status === 'pending';
  }

  async function handleSaveEmail() {
    if (!email || !email.includes('@')) {
      notifyError('Please enter a valid email address');
      return;
    }

    const existingPrefs = emailPreferences.get();

    if (!existingPrefs) {
      // New email preferences
      const newPrefs = initializeEmailPreferences(email);
      prefs = newPrefs;
    } else if (email !== existingPrefs.email) {
      // Update existing email
      isSending = true;
      const result = await updateEmailAddress(email);
      isSending = false;

      if (!result.success) {
        notifyError(result.error || 'Failed to update email');
        return;
      }
    }

    // Send verification
    await handleSendVerification();
  }

  async function handleSendVerification() {
    isSending = true;
    const result = await sendVerificationEmail(email);
    isSending = false;

    if (result.success) {
      showVerificationInput = true;
      notifySuccess('Verification code sent to your email');
    } else {
      notifyError(result.error || 'Failed to send verification');
    }
  }

  async function handleVerify() {
    if (!verificationCode || verificationCode.length !== 6) {
      notifyError('Please enter a valid 6-digit code');
      return;
    }

    isVerifying = true;
    const result = await verifyEmail(verificationCode);
    isVerifying = false;

    if (result.success) {
      showVerificationInput = false;
      verificationCode = '';
      notifySuccess('Email verified successfully!');
    } else {
      notifyError(result.error || 'Verification failed');
    }
  }

  async function handleResendCode() {
    const result = await resendVerification();
    if (result.success) {
      notifySuccess('New verification code sent');
    } else {
      notifyError(result.error || 'Failed to resend code');
    }
  }

  function handleToggleAllEmails(checked: boolean) {
    if (!prefs) return;

    if (checked) {
      resubscribeEmails();
    } else {
      unsubscribeAllEmails(prefs.unsubscribeToken);
    }

    // Reload preferences
    loadPreferences();
  }

  function handleWeeklyDigestChange(checked: boolean) {
    if (!prefs) return;
    updateEmailPreferences('weeklyDigestEnabled', checked);
    loadPreferences();
  }

  function handleSpecialEventChange(checked: boolean) {
    if (!prefs) return;
    updateEmailPreferences('specialEventEnabled', checked);
    loadPreferences();
  }

  function handleTradeOfferChange(checked: boolean) {
    if (!prefs) return;
    updateEmailPreferences('tradeOfferEnabled', checked);
    loadPreferences();
  }

  function handleAchievementChange(checked: boolean) {
    if (!prefs) return;
    updateEmailPreferences('achievementEnabled', checked);
    loadPreferences();
  }

  function handleDadPassChange(checked: boolean) {
    if (!prefs) return;
    updateEmailPreferences('daddypassEnabled', checked);
    loadPreferences();
  }

  function handleMarketingChange(checked: boolean) {
    if (!prefs) return;
    updateEmailPreferences('marketingEnabled', checked);
    loadPreferences();
  }

  function getVerificationStatus(): VerificationStatus {
    return verification?.status || 'unverified';
  }

  function getVerificationStatusText(): string {
    const status = getVerificationStatus();
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending';
      case 'unverified':
        return 'Not Verified';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  }

  function getVerificationStatusColor(): string {
    const status = getVerificationStatus();
    switch (status) {
      case 'verified':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  }

  // Weekday names for digest day selection
  const weekdays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  function handleDigestDayChange(day: number) {
    if (!prefs) return;
    updateEmailPreferences('digestDay', day);
    nextDigestDate = getNextDigestDate();
    loadPreferences();
  }

  function handleDigestTimeChange(time: string) {
    if (!prefs) return;
    updateEmailPreferences('digestTime', time);
    nextDigestDate = getNextDigestDate();
    loadPreferences();
  }

  // Generate time options (every hour from 0-23)
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });
</script>

<div class="email-settings">
  <!-- Email Verification Section -->
  <div class="settings-section">
    <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      Email Address
    </h3>

    <div class="space-y-4">
      <!-- Current Email Status -->
      {#if prefs}
        <div class="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
          <div>
            <p class="text-white font-medium">{prefs.email}</p>
            <p class="text-sm {getVerificationStatusColor()}">{getVerificationStatusText()}</p>
          </div>
          {#if prefs.verified}
            <span class="text-green-400 text-2xl">✓</span>
          {:else if showVerificationInput}
            <button
              on:click={handleResendCode}
              disabled={isSending}
              class="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
              type="button"
            >
              Resend Code
            </button>
          {/if}
        </div>
      {/if}

      <!-- Email Input -->
      <div class="setting-row">
        <label for="email-input" class="text-slate-300 text-sm">Email Address</label>
        <div class="flex gap-2">
          <input
            id="email-input"
            type="email"
            bind:value={email}
            placeholder="your@email.com"
            class="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSending || prefs?.verified}
          />
          <button
            on:click={handleSaveEmail}
            disabled={isSending || (prefs?.verified && email === prefs.email)}
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors min-w-[100px]"
            type="button"
          >
            {isSending ? 'Sending...' : prefs?.verified && email === prefs.email ? 'Verified' : 'Verify'}
          </button>
        </div>
        <p class="setting-description">
          Add your email to receive weekly digests, trade notifications, and special event announcements.
        </p>
      </div>

      <!-- Verification Code Input -->
      {#if showVerificationInput}
        <div class="setting-row p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
          <label for="verification-code" class="text-slate-300 text-sm">Enter Verification Code</label>
          <div class="flex gap-2 mt-2">
            <input
              id="verification-code"
              type="text"
              bind:value={verificationCode}
              placeholder="123456"
              maxlength="6"
              class="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-center text-xl tracking-widest placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isVerifying}
            />
            <button
              on:click={handleVerify}
              disabled={isVerifying || !verificationCode || verificationCode.length !== 6}
              class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors min-w-[100px]"
              type="button"
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </button>
          </div>
          <p class="setting-description mt-2">
            Enter the 6-digit code sent to {email}. Code expires in 24 hours.
          </p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Email Preferences Section -->
  {#if prefs}
    <div class="settings-section">
      <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        Email Notifications
      </h3>

      <div class="space-y-4">
        <!-- Master Email Toggle -->
        <div class="setting-row">
          <Toggle
            checked={prefs.allEmailsEnabled}
            label="Enable All Email Notifications"
            ariaLabel="Toggle all email notifications"
            onchange={(e) => handleToggleAllEmails(e.detail)}
          />
          <p class="setting-description">
            Master switch for all email notifications. Disable to stop all emails.
          </p>
        </div>

        {#if prefs.allEmailsEnabled}
          <!-- Weekly Digest -->
          <div class="setting-row">
            <Toggle
              checked={prefs.weeklyDigestEnabled}
              label="Weekly Pack Digest"
              ariaLabel="Toggle weekly digest emails"
              onchange={(e) => handleWeeklyDigestChange(e.detail)}
              disabled={!prefs.allEmailsEnabled}
            />
            <p class="setting-description">
              Receive a weekly summary of your pack openings, best pulls, and achievements.
            </p>

            {#if prefs.weeklyDigestEnabled}
              <div class="mt-2 pl-6 space-y-2">
                <!-- Digest Day Selector -->
                <div>
                  <label class="text-slate-400 text-xs uppercase tracking-wide">Send on</label>
                  <div class="flex flex-wrap gap-1 mt-1">
                    {#each weekdays as day, index}
                      <button
                        on:click={() => handleDigestDayChange(index)}
                        class="px-2 py-1 text-xs rounded {prefs.digestDay === index ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}"
                        type="button"
                      >
                        {day.slice(0, 3)}
                      </button>
                    {/each}
                  </div>
                </div>

                <!-- Digest Time Selector -->
                <div>
                  <label class="text-slate-400 text-xs uppercase tracking-wide">At</label>
                  <select
                    value={prefs.digestTime}
                    onchange={(e) => handleDigestTimeChange(e.currentTarget.value)}
                    class="mt-1 px-3 py-1 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {#each timeOptions as time}
                      <option value={time}>{time}</option>
                    {/each}
                  </select>
                </div>

                {#if nextDigestDate}
                  <p class="text-slate-500 text-xs">
                    Next digest: {nextDigestDate.toLocaleDateString()} at {prefs.digestTime}
                  </p>
                {/if}
              </div>
            {/if}
          </div>

          <!-- Special Events -->
          <div class="setting-row">
            <Toggle
              checked={prefs.specialEventEnabled}
              label="Special Event Announcements"
              ariaLabel="Toggle special event emails"
              onchange={(e) => handleSpecialEventChange(e.detail)}
              disabled={!prefs.allEmailsEnabled}
            />
            <p class="setting-description">
              Get notified about seasonal launches, holiday events, and promotions.
            </p>
          </div>

          <!-- Trade Offers -->
          <div class="setting-row">
            <Toggle
              checked={prefs.tradeOfferEnabled}
              label="Trade Offer Notifications"
              ariaLabel="Toggle trade offer emails"
              onchange={(e) => handleTradeOfferChange(e.detail)}
              disabled={!prefs.allEmailsEnabled}
            />
            <p class="setting-description">
              Receive email alerts when you receive new trade offers from other players.
            </p>
          </div>

          <!-- Achievements -->
          <div class="setting-row">
            <Toggle
              checked={prefs.achievementEnabled}
              label="Achievement Unlocked"
              ariaLabel="Toggle achievement emails"
              onchange={(e) => handleAchievementChange(e.detail)}
              disabled={!prefs.allEmailsEnabled}
            />
            <p class="setting-description">
              Celebrate your achievements with email notifications when you unlock them.
            </p>
          </div>

          <!-- DadPass -->
          <div class="setting-row">
            <Toggle
              checked={prefs.daddypassEnabled}
              label="DadPass Rewards & Updates"
              ariaLabel="Toggle DadPass emails"
              onchange={(e) => handleDadPassChange(e.detail)}
              disabled={!prefs.allEmailsEnabled}
            />
            <p class="setting-description">
              Updates about your DadPass subscription, new rewards, and exclusive benefits.
            </p>
          </div>

          <!-- Marketing (Opt-in only) -->
          <div class="setting-row">
            <Toggle
              checked={prefs.marketingEnabled}
              label="Marketing Emails (Optional)"
              ariaLabel="Toggle marketing emails"
              onchange={(e) => handleMarketingChange(e.detail)}
              disabled={!prefs.allEmailsEnabled}
            />
            <p class="setting-description">
              Occasional updates about new features, community highlights, and DadDeck news. Opt-in only.
            </p>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Unsubscribe Info -->
  {#if prefs && prefs.verified}
    <div class="mt-4 p-3 bg-slate-800/50 rounded-lg">
      <p class="text-slate-400 text-xs">
        All emails include an unsubscribe link. You can also disable all emails above.
      </p>
    </div>
  {/if}
</div>

<style>
  .email-settings {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .setting-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .setting-description {
    font-size: 0.75rem;
    color: #64748b;
    margin: 0;
    padding-left: 0;
    line-height: 1.4;
  }
</style>
