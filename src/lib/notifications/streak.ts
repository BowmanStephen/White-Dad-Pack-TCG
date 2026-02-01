/**
 * Streak Protection Notification System
 *
 * Warns users when their daily login streak is about to expire.
 * Supports browser notifications and email reminders (infrastructure for future).
 *
 * Features:
 * - Browser notifications with permission handling
 * - Configurable warning thresholds (6h, 12h, 24h before expiry)
 * - Email reminder option (requires backend integration)
 * - Notification history tracking
 */

// ============================================================================
// TYPES
// ============================================================================

export interface StreakNotificationConfig {
  enabled: boolean;
  browserNotifications: boolean;
  emailReminders: boolean;
  emailAddress?: string;
  warningThresholds: number[]; // Hours before streak expires
}

export interface StreakNotificationHistory {
  lastNotified: Date | null;
  notificationCount: number;
  lastEmailSent: Date | null;
}

export interface StreakWarning {
  hoursRemaining: number;
  streakLength: number;
  message: string;
  urgency: 'low' | 'medium' | 'critical';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CONFIG: StreakNotificationConfig = {
  enabled: true,
  browserNotifications: true,
  emailReminders: false,
  warningThresholds: [6, 12, 24] // Hours before expiry
};

const STORAGE_KEY = 'daddeck-streak-notifications';

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let config: StreakNotificationConfig = DEFAULT_CONFIG;
let history: StreakNotificationHistory = {
  lastNotified: null,
  notificationCount: 0,
  lastEmailSent: null
};

/**
 * Load notification configuration from localStorage
 */
export function loadNotificationConfig(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      config = { ...DEFAULT_CONFIG, ...parsed };

      // Convert date strings back to Date objects
      if (parsed.history) {
        history = {
          lastNotified: parsed.history.lastNotified ? new Date(parsed.history.lastNotified) : null,
          notificationCount: parsed.history.notificationCount || 0,
          lastEmailSent: parsed.history.lastEmailSent ? new Date(parsed.history.lastEmailSent) : null
        };
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) console.error('Failed to load notification config:', error);
  }
}

/**
 * Save notification configuration to localStorage
 */
export function saveNotificationConfig(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ config, history }));
  } catch (error) {
    if (import.meta.env.DEV) console.error('Failed to save notification config:', error);
  }
}

/**
 * Get current notification configuration
 */
export function getNotificationConfig(): StreakNotificationConfig {
  return { ...config };
}

/**
 * Update notification configuration
 */
export function updateNotificationConfig(updates: Partial<StreakNotificationConfig>): void {
  config = { ...config, ...updates };
  saveNotificationConfig();
}

/**
 * Get notification history
 */
export function getNotificationHistory(): StreakNotificationHistory {
  return { ...history };
}

// ============================================================================
// BROWSER NOTIFICATIONS
// ============================================================================

/**
 * Check if browser notifications are supported
 */
export function areBrowserNotificationsSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Check browser notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!areBrowserNotificationsSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!areBrowserNotificationsSupported()) {
    if (import.meta.env.DEV) console.warn('Browser notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Send browser notification for streak warning
 */
export async function sendStreakNotification(warning: StreakWarning): Promise<boolean> {
  if (!config.enabled || !config.browserNotifications) {
    return false;
  }

  const permission = getNotificationPermission();
  if (permission !== 'granted') {
    if (import.meta.env.DEV) console.warn('Browser notification permission not granted');
    return false;
  }

  // Check cooldown (don't spam notifications)
  if (history.lastNotified) {
    const hoursSinceLastNotification = (Date.now() - history.lastNotified.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastNotification < 1) {
      return false; // Wait at least 1 hour between notifications
    }
  }

  try {
    const notificationOptions: NotificationOptions = {
      body: warning.message,
      icon: '/images/packs/closed-pack.png',
      badge: '/images/packs/closed-pack.png',
      tag: 'streak-warning',
      requireInteraction: true,
    };
    
    const notification = new Notification('🎮 Streak About to Expire!', notificationOptions);

    // Handle notification actions
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Update history
    history.lastNotified = new Date();
    history.notificationCount++;
    saveNotificationConfig();

    return true;
  } catch (error) {
    if (import.meta.env.DEV) console.error('Failed to send browser notification:', error);
    return false;
  }
}

// ============================================================================
// STREAK EXPIRY CALCULATION
// ============================================================================

/**
 * Calculate hours until streak expires
 * Streak expires 48 hours after last login
 */
export function calculateHoursUntilExpiry(lastLoginDate: Date | null): number | null {
  if (!lastLoginDate) {
    return null;
  }

  const now = Date.now();
  const expiryTime = lastLoginDate.getTime() + 48 * 60 * 60 * 1000; // 48 hours
  const hoursRemaining = (expiryTime - now) / (1000 * 60 * 60);

  return Math.max(0, Math.round(hoursRemaining * 10) / 10); // Round to 1 decimal
}

/**
 * Generate streak warning message
 */
export function generateStreakWarning(hoursRemaining: number, streakLength: number): StreakWarning {
  let urgency: 'low' | 'medium' | 'critical';
  let message: string;

  if (hoursRemaining <= 6) {
    urgency = 'critical';
    message = `⚠️ Critical! Your ${streakLength}-day streak expires in ${hoursRemaining}h! Login now to save it!`;
  } else if (hoursRemaining <= 12) {
    urgency = 'medium';
    message = `⏰ Hey! Your ${streakLength}-day streak expires in ${hoursRemaining}h. Don't lose your progress!`;
  } else {
    urgency = 'low';
    message = `💪 Your ${streakLength}-day streak expires in ${hoursRemaining}h. Keep it going!`;
  }

  return {
    hoursRemaining,
    streakLength,
    message,
    urgency
  };
}

/**
 * Check if user should be notified about streak expiry
 */
export function shouldNotifyStreak(lastLoginDate: Date | null, streakLength: number): boolean {
  if (!config.enabled || !config.browserNotifications) {
    return false;
  }

  const hoursRemaining = calculateHoursUntilExpiry(lastLoginDate);
  if (hoursRemaining === null) {
    return false;
  }

  // Check if within warning thresholds
  const shouldWarn = config.warningThresholds.some(threshold =>
    hoursRemaining <= threshold && hoursRemaining > threshold - 2
  );

  return shouldWarn && streakLength >= 3; // Only notify for streaks of 3+ days
}

// ============================================================================
// EMAIL REMINDERS (INFRASTRUCTURE FOR FUTURE)
// ============================================================================

/**
 * Send email reminder for streak warning
 * NOTE: This requires backend integration. Currently logs to console.
 */
export async function sendEmailReminder(warning: StreakWarning): Promise<boolean> {
  if (!config.enabled || !config.emailReminders || !config.emailAddress) {
    return false;
  }

  // Check cooldown (don't spam emails)
  if (history.lastEmailSent) {
    const hoursSinceLastEmail = (Date.now() - history.lastEmailSent.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastEmail < 6) {
      return false; // Wait at least 6 hours between emails
    }
  }

  // TODO: Implement actual email sending via backend API
  // For now, just log to console in DEV mode
  if (import.meta.env.DEV) {
    console.log('[EMAIL REMINDER]', {
      to: config.emailAddress,
      subject: `🎮 Your ${warning.streakLength}-Day Streak is About to Expire!`,
      body: warning.message,
      timestamp: new Date().toISOString()
    });
  }

  // Update history
  history.lastEmailSent = new Date();
  saveNotificationConfig();

  return true;
}

/**
 * Update email address for reminders
 */
export function updateEmailAddress(email: string): void {
  config.emailAddress = email;
  saveNotificationConfig();
}

// ============================================================================
// NOTIFICATION ORCHESTRATION
// ============================================================================

/**
 * Check and send streak warnings
 * This should be called periodically (e.g., on page load, every hour)
 */
export async function checkAndNotifyStreak(lastLoginDate: Date | null, streakLength: number): Promise<void> {
  if (!config.enabled) {
    return;
  }

  const hoursRemaining = calculateHoursUntilExpiry(lastLoginDate);
  if (hoursRemaining === null) {
    return;
  }

  // Check if we should notify
  if (!shouldNotifyStreak(lastLoginDate, streakLength)) {
    return;
  }

  // Generate warning
  const warning = generateStreakWarning(hoursRemaining, streakLength);

  // Send browser notification
  await sendStreakNotification(warning);

  // Send email reminder (if enabled)
  if (config.emailReminders) {
    await sendEmailReminder(warning);
  }
}

/**
 * Initialize notification system
 * Call this on app initialization
 */
export function initializeStreakNotifications(): void {
  loadNotificationConfig();

  // Request notification permission if not already granted
  if (config.browserNotifications && areBrowserNotificationsSupported()) {
    if (Notification.permission === 'default') {
      // Don't request immediately - wait for user interaction
      if (import.meta.env.DEV) console.log('[STREAK NOTIFICATIONS] Browser notifications available. Call requestNotificationPermission() after user interaction.');
    }
  }

  // Set up periodic checks (every 30 minutes)
  if (typeof window !== 'undefined') {
    setInterval(() => {
      const state = window.localStorage.getItem('daddeck-daily-rewards');
      if (state) {
        try {
          const parsed = JSON.parse(state);
          const lastLoginDate = parsed.lastLoginDate ? new Date(parsed.lastLoginDate) : null;
          const streakLength = parsed.currentStreak || 0;
          checkAndNotifyStreak(lastLoginDate, streakLength);
        } catch (error) {
          if (import.meta.env.DEV) console.error('Failed to check streak notifications:', error);
        }
      }
    }, 30 * 60 * 1000); // 30 minutes
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Enable all streak notifications
 */
export function enableStreakNotifications(): void {
  updateNotificationConfig({ enabled: true });
}

/**
 * Disable all streak notifications
 */
export function disableStreakNotifications(): void {
  updateNotificationConfig({ enabled: false });
}

/**
 * Enable browser notifications
 */
export function enableBrowserNotifications(): void {
  updateNotificationConfig({ browserNotifications: true });
}

/**
 * Disable browser notifications
 */
export function disableBrowserNotifications(): void {
  updateNotificationConfig({ browserNotifications: false });
}

/**
 * Enable email reminders
 */
export function enableEmailReminders(email: string): void {
  updateNotificationConfig({ emailReminders: true, emailAddress: email });
}

/**
 * Disable email reminders
 */
export function disableEmailReminders(): void {
  updateNotificationConfig({ emailReminders: false });
}

/**
 * Clear notification history
 */
export function clearNotificationHistory(): void {
  history = {
    lastNotified: null,
    notificationCount: 0,
    lastEmailSent: null
  };
  saveNotificationConfig();
}

/**
 * Reset notification configuration to defaults
 */
export function resetNotificationConfig(): void {
  config = { ...DEFAULT_CONFIG };
  history = {
    lastNotified: null,
    notificationCount: 0,
    lastEmailSent: null
  };
  saveNotificationConfig();
}
