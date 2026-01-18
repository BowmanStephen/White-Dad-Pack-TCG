/**
 * NOTIF-002: Notification Preferences Store
 *
 * Manages user notification preferences:
 * - Push notification settings
 * - Category-specific toggles (daily rewards, trades, achievements, general)
 * - Sound and vibration settings per notification type
 * - Quiet hours configuration
 */

import { atom } from 'nanostores';
import type { NotificationPreferences, NotificationCategory } from '@/types';

// ============================================================================
// LocalStorage Keys
// ============================================================================
const PREFS_KEY = 'daddeck_notification_preferences';

// ============================================================================
// Default Preferences
// ============================================================================
const DEFAULT_PREFERENCES: NotificationPreferences = {
  pushEnabled: false,
  pushPermission: 'default',
  dailyRewardNotifications: true,
  tradeNotifications: true,
  achievementNotifications: true,
  generalNotifications: false,
  soundEnabled: true,
  vibrationEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

// ============================================================================
// Load preferences from localStorage
// ============================================================================
function loadPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_PREFERENCES };
  }

  try {
    const stored = localStorage.getItem(PREFS_KEY);
    if (stored) {
      return {
        ...DEFAULT_PREFERENCES,
        ...JSON.parse(stored),
      };
    }
  } catch (error) {
    console.warn('Failed to load notification preferences:', error);
  }

  return { ...DEFAULT_PREFERENCES };
}

// ============================================================================
// Store Initialization
// ============================================================================
export const notificationPreferences = atom<NotificationPreferences>(loadPreferences());

// ============================================================================
// Helper: Save preferences to localStorage
// ============================================================================
function savePreferences(preferences: NotificationPreferences): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save notification preferences:', error);
  }
}

// ============================================================================
// Push Notification Settings
// ============================================================================

/**
 * Toggle push notifications on/off
 * Note: This does not request browser permission - use requestPushPermission() for that
 */
export function togglePushEnabled(): void {
  const current = notificationPreferences.get();
  const newPreferences = {
    ...current,
    pushEnabled: !current.pushEnabled,
  };
  notificationPreferences.set(newPreferences);
  savePreferences(newPreferences);
}

/**
 * Set push enabled state
 */
export function setPushEnabled(enabled: boolean): void {
  const current = notificationPreferences.get();
  const newPreferences = {
    ...current,
    pushEnabled: enabled,
  };
  notificationPreferences.set(newPreferences);
  savePreferences(newPreferences);
}

/**
 * Update push permission status
 * Call this when browser permission changes
 */
export function updatePushPermission(permission: NotificationPreferences['pushPermission']): void {
  const current = notificationPreferences.get();
  const newPreferences = {
    ...current,
    pushPermission: permission,
  };
  notificationPreferences.set(newPreferences);
  savePreferences(newPreferences);
}

/**
 * Request browser push notification permission
 * Returns the permission status
 */
export async function requestPushPermission(): Promise<NotificationPreferences['pushPermission']> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default';
  }

  const permission = await Notification.requestPermission();
  updatePushPermission(permission);

  // If permission granted, enable push notifications
  if (permission === 'granted') {
    setPushEnabled(true);
  }

  return permission;
}

// ============================================================================
// Category-Specific Notification Toggles
// ============================================================================

/**
 * Toggle daily reward notifications
 */
export function toggleDailyRewardNotifications(): void {
  const current = notificationPreferences.get();
  const newPreferences = {
    ...current,
    dailyRewardNotifications: !current.dailyRewardNotifications,
  };
  notificationPreferences.set(newPreferences);
  savePreferences(newPreferences);
}

/**
 * Set daily reward notifications
 */
export function setDailyRewardNotifications(enabled: boolean): void {
  const current = notificationPreferences.get();
  const newPreferences = {
    ...current,
    dailyRewardNotifications: enabled,
  };
  notificationPreferences.set(newPreferences);
  savePreferences(newPreferences);
}

/**
 * Toggle trade notifications
 */
export function toggleTradeNotifications(): void {
  const current = notificationPreferences.get();
  const newPreferences = {
    ...current,
    tradeNotifications: !current.tradeNotifications,
  };
  notificationPreferences.set(newPreferences);
  savePreferences(newPreferences);
}

/**
 * Set trade notifications
 */
export function setTradeNotifications(enabled: boolean): void {
  const current = notificationPreferences.get();
  const newPreferences = {
    ...current,
    tradeNotifications: enabled,
  };
  notificationPreferences.set(newPreferences);
  savePreferences(newPreferences);
}

/**
 * Toggle achievement notifications
 */
export function toggleAchievementNotifications(): void {
  const current = notificationPreferences.get();
  const newPreferences = {
    ...current,
    achievementNotifications: !current.achievementNotifications,
  };
  notificationPreferences.set(newPreferences);
  savePreferences(newPreferences);
}

/**
 * Set achievement notifications
 */
export function setAchievementNotifications(enabled: boolean): void {
  const current = notificationPreferences.get();
  const newPreferences = {
    ...current,
    achievementNotifications: enabled,
  };
  notificationPreferences.set(newPreferences);
  savePreferences(newPreferences);
}

/**
 * Toggle general notifications
 */
export function toggleGeneralNotifications(): void {
  const current = notificationPreferences.get();
  const newPreferences = {
    ...current,
    generalNotifications: !current.generalNotifications,
  };
  notificationPreferences.set(newPreferences);
  savePreferences(newPreferences);
}

/**
 * Set general notifications
 */
export function setGeneralNotifications(enabled: boolean): void {
  const current = notificationPreferences.get();
  const newPreferences = {
    ...current,
    generalNotifications: enabled,
  };
  notificationPreferences.set(newPreferences);
  savePreferences(newPreferences);
}

// ============================================================================
// Sound & Vibration Settings
// ============================================================================

/**
 * Toggle notification sound on/off
 */
export function toggleNotificationSound(): void {
  const current = notificationPreferences.get();
  const newPreferences = {
    ...current,
    soundEnabled: !current.soundEnabled,
  };
  notificationPreferences.set(newPreferences);
  savePreferences(newPreferences);
}

/**
 * Set notification sound enabled
 */
export function setNotificationSound(enabled: boolean): void {
  const current = notificationPreferences.get();
  const newPreferences = {
    ...current,
    soundEnabled: enabled,
  };
  notificationPreferences.set(newPreferences);
  savePreferences(newPreferences);
}

/**
 * Toggle notification vibration on/off
 */
export function toggleNotificationVibration(): void {
  const current = notificationPreferences.get();
  const newPreferences = {
    ...current,
    vibrationEnabled: !current.vibrationEnabled,
  };
  notificationPreferences.set(newPreferences);
  savePreferences(newPreferences);
}

/**
 * Set notification vibration enabled
 */
export function setNotificationVibration(enabled: boolean): void {
  const current = notificationPreferences.get();
  const newPreferences = {
    ...current,
    vibrationEnabled: enabled,
  };
  notificationPreferences.set(newPreferences);
  savePreferences(newPreferences);
}

// ============================================================================
// Quiet Hours Configuration
// ============================================================================

/**
 * Toggle quiet hours on/off
 */
export function toggleQuietHours(): void {
  const current = notificationPreferences.get();
  const newPreferences = {
    ...current,
    quietHoursEnabled: !current.quietHoursEnabled,
  };
  notificationPreferences.set(newPreferences);
  savePreferences(newPreferences);
}

/**
 * Set quiet hours enabled
 */
export function setQuietHours(enabled: boolean): void {
  const current = notificationPreferences.get();
  const newPreferences = {
    ...current,
    quietHoursEnabled: enabled,
  };
  notificationPreferences.set(newPreferences);
  savePreferences(newPreferences);
}

/**
 * Set quiet hours start time (HH:MM format)
 */
export function setQuietHoursStart(time: string): void {
  const current = notificationPreferences.get();
  const newPreferences = {
    ...current,
    quietHoursStart: time,
  };
  notificationPreferences.set(newPreferences);
  savePreferences(newPreferences);
}

/**
 * Set quiet hours end time (HH:MM format)
 */
export function setQuietHoursEnd(time: string): void {
  const current = notificationPreferences.get();
  const newPreferences = {
    ...current,
    quietHoursEnd: time,
  };
  notificationPreferences.set(newPreferences);
  savePreferences(newPreferences);
}

/**
 * Set both quiet hours start and end times
 */
export function setQuietHoursRange(start: string, end: string): void {
  const current = notificationPreferences.get();
  const newPreferences = {
    ...current,
    quietHoursStart: start,
    quietHoursEnd: end,
  };
  notificationPreferences.set(newPreferences);
  savePreferences(newPreferences);
}

// ============================================================================
// Helper: Check if notifications should be sent right now
// ============================================================================

/**
 * Check if current time is within quiet hours
 * Returns true if quiet hours are enabled and current time is in the quiet period
 */
export function isInQuietHours(): boolean {
  const preferences = notificationPreferences.get();

  if (!preferences.quietHoursEnabled) {
    return false;
  }

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;

  const [startHours, startMinutes] = preferences.quietHoursStart.split(':').map(Number);
  const [endHours, endMinutes] = preferences.quietHoursEnd.split(':').map(Number);
  const startTimeInMinutes = startHours * 60 + startMinutes;
  const endTimeInMinutes = endHours * 60 + endMinutes;

  // Handle case where quiet hours span midnight (e.g., 22:00 to 08:00)
  if (startTimeInMinutes > endTimeInMinutes) {
    // Quiet hours go from start time to midnight, then midnight to end time
    return currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes < endTimeInMinutes;
  } else {
    // Normal case: quiet hours are within the same day
    return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes;
  }
}

/**
 * Check if a notification category is enabled and not in quiet hours
 */
export function canShowNotification(category: NotificationCategory): boolean {
  const preferences = notificationPreferences.get();

  // Check if category is enabled
  let categoryEnabled = false;
  switch (category) {
    case 'daily_reward':
      categoryEnabled = preferences.dailyRewardNotifications;
      break;
    case 'trade':
      categoryEnabled = preferences.tradeNotifications;
      break;
    case 'achievement':
      categoryEnabled = preferences.achievementNotifications;
      break;
    case 'general':
      categoryEnabled = preferences.generalNotifications;
      break;
  }

  if (!categoryEnabled) {
    return false;
  }

  // Check quiet hours
  if (isInQuietHours()) {
    return false;
  }

  return true;
}

/**
 * Check if notification sound should play
 */
export function canPlayNotificationSound(): boolean {
  const preferences = notificationPreferences.get();
  return preferences.soundEnabled && !isInQuietHours();
}

/**
 * Check if notification vibration should trigger
 */
export function canVibrateNotification(): boolean {
  const preferences = notificationPreferences.get();
  return preferences.vibrationEnabled && !isInQuietHours();
}

// ============================================================================
// Helper: Reset all preferences to defaults
// ============================================================================

/**
 * Reset all notification preferences to default values
 */
export function resetNotificationPreferences(): void {
  notificationPreferences.set({ ...DEFAULT_PREFERENCES });
  savePreferences(DEFAULT_PREFERENCES);
}

// ============================================================================
// Helper: Get current preferences
// ============================================================================

/**
 * Get current notification preferences
 */
export function getNotificationPreferences(): NotificationPreferences {
  return notificationPreferences.get();
}

// ============================================================================
// Helper: Check if push notifications are supported
// ============================================================================

/**
 * Check if browser supports push notifications
 */
export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Check if push permission has been granted
 */
export function isPushPermissionGranted(): boolean {
  if (!isPushSupported()) {
    return false;
  }

  const preferences = notificationPreferences.get();
  return preferences.pushPermission === 'granted';
}

/**
 * Check if push permission has been denied
 */
export function isPushPermissionDenied(): boolean {
  if (!isPushSupported()) {
    return false;
  }

  const preferences = notificationPreferences.get();
  return preferences.pushPermission === 'denied';
}
