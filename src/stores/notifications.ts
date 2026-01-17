import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type {
  Notification,
  NotificationAction,
  NotificationCategory,
  NotificationPreferences,
  NotificationState,
  NotificationType,
  PushNotificationPayload,
} from '../types';
import { trackEvent } from './analytics';

// ============================================================================
// NOTIFICATION TYPES CONFIGURATION
// ============================================================================

// Default durations by notification type (ms)
export const NOTIFICATION_DURATIONS: Record<NotificationType, number> = {
  success: 3000,
  error: 5000,
  info: 3000,
  warning: 4000,
  achievement: 6000,
};

// Notification icons by type
export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
  achievement: '🏆',
};

// ============================================================================
// ENCODER FOR NOTIFICATION STATE
// ============================================================================

const notificationEncoder = {
  encode(data: Notification[]): string {
    return JSON.stringify(data, (_key, value) => {
      // Convert Date objects to ISO strings
      if (value instanceof Date) {
        return value.toISOString();
      }
      // Functions (actions) can't be serialized, store null
      if (typeof value === 'function') {
        return null;
      }
      return value;
    });
  },
  decode(str: string): Notification[] {
    const data = JSON.parse(str);
    // Convert ISO strings back to Date objects
    return data.map((notification: Notification) => ({
      ...notification,
      timestamp: new Date(notification.timestamp),
      actions: notification.actions || [],
    }));
  },
};

const preferencesEncoder = {
  encode(data: NotificationPreferences): string {
    return JSON.stringify(data);
  },
  decode(str: string): NotificationPreferences {
    return JSON.parse(str);
  },
};

// ============================================================================
// DEFAULT NOTIFICATION PREFERENCES
// ============================================================================

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  pushEnabled: false,
  pushPermission: 'default',
  dailyRewardNotifications: true,
  tradeNotifications: true,
  achievementNotifications: true,
  generalNotifications: true,
  soundEnabled: true,
  vibrationEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

// ============================================================================
// NOTIFICATION STORES
// ============================================================================

// Active notifications (toast queue)
export const $notifications = atom<Notification[]>([]);

// Persistent notification history (notification center)
export const $notificationHistory = persistentAtom<Notification[]>(
  'daddeck-notification-history',
  [],
  notificationEncoder
);

// Notification preferences
export const $notificationPreferences = persistentAtom<NotificationPreferences>(
  'daddeck-notification-preferences',
  DEFAULT_NOTIFICATION_PREFERENCES,
  preferencesEncoder
);

// Computed: Unread count
export const $unreadCount = computed($notificationHistory, (history) =>
  history.filter((n) => !n.read).length
);

// Export stores without $ prefix
export const notifications = $notifications;
export const notificationHistory = $notificationHistory;
export const notificationPreferences = $notificationPreferences;
export const unreadCount = $unreadCount;

// ============================================================================
// BROWSER PUSH NOTIFICATION SUPPORT
// ============================================================================

/**
 * Check if browser supports push notifications
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Request push notification permission
 */
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    updatePreference('pushPermission', 'granted');
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    updatePreference('pushPermission', 'denied');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  updatePreference('pushPermission', permission);

  // Track permission request
  trackEvent({
    type: 'settings_change',
    data: {
      setting: 'push_permission',
      previousValue: 'default',
      newValue: permission,
    },
  } as any);

  return permission;
}

/**
 * Get current push permission status
 */
export function getPushPermission(): NotificationPermission {
  if (!isPushSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Show a browser push notification
 */
export async function showPushNotification(payload: PushNotificationPayload): Promise<boolean> {
  if (!isPushSupported()) return false;

  const preferences = $notificationPreferences.get();
  if (!preferences.pushEnabled || getPushPermission() !== 'granted') {
    return false;
  }

  // Check quiet hours
  if (isInQuietHours()) {
    return false;
  }

  try {
    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/badge-72.png',
      image: payload.image,
      tag: payload.tag,
      requireInteraction: payload.requireInteraction || false,
      timestamp: payload.timestamp || Date.now(),
      data: payload.data,
    } as NotificationOptions);

    // Add click handler
    if (payload.actions) {
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }

    return true;
  } catch (error) {
    console.error('Failed to show push notification:', error);
    return false;
  }
}

// ============================================================================
// NOTIFICATION PREFERENCES MANAGEMENT
// ============================================================================

/**
 * Update a single notification preference
 */
export function updatePreference<K extends keyof NotificationPreferences>(
  key: K,
  value: NotificationPreferences[K]
): void {
  const current = $notificationPreferences.get();
  $notificationPreferences.set({ ...current, [key]: value });
}

/**
 * Toggle a notification category
 */
export function toggleCategory(category: NotificationCategory): void {
  const preferences = $notificationPreferences.get();

  switch (category) {
    case 'daily_reward':
      updatePreference('dailyRewardNotifications', !preferences.dailyRewardNotifications);
      break;
    case 'trade':
      updatePreference('tradeNotifications', !preferences.tradeNotifications);
      break;
    case 'achievement':
      updatePreference('achievementNotifications', !preferences.achievementNotifications);
      break;
    case 'general':
      updatePreference('generalNotifications', !preferences.generalNotifications);
      break;
  }
}

/**
 * Check if a category is enabled
 */
export function isCategoryEnabled(category: NotificationCategory): boolean {
  const preferences = $notificationPreferences.get();

  switch (category) {
    case 'daily_reward':
      return preferences.dailyRewardNotifications;
    case 'trade':
      return preferences.tradeNotifications;
    case 'achievement':
      return preferences.achievementNotifications;
    case 'general':
      return preferences.generalNotifications;
  }
}

/**
 * Check if currently in quiet hours
 */
export function isInQuietHours(): boolean {
  const preferences = $notificationPreferences.get();
  if (!preferences.quietHoursEnabled) return false;

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [startHours, startMinutes] = preferences.quietHoursStart.split(':').map(Number);
  const [endHours, endMinutes] = preferences.quietHoursEnd.split(':').map(Number);

  const startTime = startHours * 60 + startMinutes;
  const endTime = endHours * 60 + endMinutes;

  // Handle quiet hours that span midnight
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime < endTime;
  }

  return currentTime >= startTime && currentTime < endTime;
}

// ============================================================================
// NOTIFICATION CREATION & MANAGEMENT
// ============================================================================

/**
 * Generate unique notification ID
 */
function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Show a notification (both in-app and push if enabled)
 */
export function showNotification(options: {
  type: NotificationType;
  title: string;
  message: string;
  category?: NotificationCategory;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  icon?: string;
  data?: Record<string, any>;
  push?: boolean; // Also show as push notification
}): string {
  const {
    type,
    title,
    message,
    category,
    duration,
    persistent = false,
    actions,
    icon,
    data,
    push = false,
  } = options;

  // Check if category is enabled
  if (category && !isCategoryEnabled(category)) {
    return '';
  }

  // Check quiet hours for non-achievement notifications
  if (isInQuietHours() && type !== 'achievement') {
    return '';
  }

  const id = generateNotificationId();
  const notificationDuration = duration ?? NOTIFICATION_DURATIONS[type];

  const notification: Notification = {
    id,
    type,
    title,
    message,
    category,
    duration: notificationDuration,
    persistent,
    timestamp: new Date(),
    read: false,
    actions,
    icon: icon || NOTIFICATION_ICONS[type],
    data,
  };

  // Add to active notifications
  const current = $notifications.get();
  $notifications.set([...current, notification]);

  // Add to notification history if persistent
  if (persistent) {
    const history = $notificationHistory.get();
    $notificationHistory.set([notification, ...history].slice(0, 100)); // Keep last 100
  }

  // Show push notification if requested
  if (push) {
    showPushNotification({
      title,
      body: message,
      icon,
      data,
      tag: id,
      requireInteraction: persistent,
    });
  }

  // Auto-dismiss after duration (if not persistent)
  if (notificationDuration > 0) {
    setTimeout(() => {
      removeNotification(id);
    }, notificationDuration);
  }

  return id;
}

/**
 * Remove a notification
 */
export function removeNotification(id: string): void {
  const current = $notifications.get();
  $notifications.set(current.filter((n) => n.id !== id));
}

/**
 * Mark a notification as read
 */
export function markAsRead(id: string): void {
  const history = $notificationHistory.get();
  const updated = history.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  $notificationHistory.set(updated);
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(): void {
  const history = $notificationHistory.get();
  const updated = history.map((n) => ({ ...n, read: true }));
  $notificationHistory.set(updated);
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(): void {
  $notifications.set([]);
}

/**
 * Clear notification history
 */
export function clearHistory(): void {
  $notificationHistory.set([]);
}

/**
 * Remove notification from history
 */
export function removeFromHistory(id: string): void {
  const history = $notificationHistory.get();
  $notificationHistory.set(history.filter((n) => n.id !== id));
}

// ============================================================================
// CONVENIENCE NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Show success notification
 */
export function notifySuccess(
  message: string,
  options?: Partial<Omit<Parameters<typeof showNotification>[0], 'type' | 'message' | 'title'>>
): string {
  return showNotification({
    type: 'success',
    title: 'Success',
    message,
    ...options,
  });
}

/**
 * Show error notification
 */
export function notifyError(
  message: string,
  options?: Partial<Omit<Parameters<typeof showNotification>[0], 'type' | 'message' | 'title'>>
): string {
  return showNotification({
    type: 'error',
    title: 'Error',
    message,
    duration: 5000, // Longer for errors
    ...options,
  });
}

/**
 * Show info notification
 */
export function notifyInfo(
  message: string,
  options?: Partial<Omit<Parameters<typeof showNotification>[0], 'type' | 'message' | 'title'>>
): string {
  return showNotification({
    type: 'info',
    title: 'Info',
    message,
    ...options,
  });
}

/**
 * Show warning notification
 */
export function notifyWarning(
  message: string,
  options?: Partial<Omit<Parameters<typeof showNotification>[0], 'type' | 'message' | 'title'>>
): string {
  return showNotification({
    type: 'warning',
    title: 'Warning',
    message,
    duration: 4000,
    ...options,
  });
}

/**
 * Show achievement notification
 */
export function notifyAchievement(
  title: string,
  message: string,
  options?: Partial<Omit<Parameters<typeof showNotification>[0], 'type' | 'message' | 'title'>>
): string {
  return showNotification({
    type: 'achievement',
    title,
    message,
    persistent: true,
    duration: 6000,
    category: 'achievement',
    ...options,
  });
}

// ============================================================================
// INTEGRATION NOTIFICATIONS
// ============================================================================

/**
 * Notify when daily reward is ready
 */
export function notifyDailyRewardReady(): void {
  showNotification({
    type: 'success',
    title: 'Daily Reward Ready!',
    message: 'Your daily reward is ready to claim. Come back and open your pack!',
    category: 'daily_reward',
    persistent: true,
    push: true,
  });
}

/**
 * Notify when a trade offer is received
 */
export function notifyTradeOffer(senderName: string, cardCount: number): void {
  showNotification({
    type: 'info',
    title: 'New Trade Offer!',
    message: `${senderName} sent you a trade offer with ${cardCount} card${cardCount > 1 ? 's' : ''}.`,
    category: 'trade',
    persistent: true,
    push: true,
    actions: [
      {
        id: 'view',
        label: 'View',
        primary: true,
        action: () => {
          // Navigate to trade view
          window.location.hash = '#trades';
        },
      },
    ],
  });
}

/**
 * Notify when achievement is unlocked
 */
export function notifyAchievementUnlocked(
  achievementName: string,
  achievementIcon: string
): void {
  showNotification({
    type: 'achievement',
    title: 'Achievement Unlocked!',
    message: `Congratulations! You unlocked "${achievementName}"`,
    category: 'achievement',
    persistent: true,
    icon: achievementIcon,
    push: true,
    actions: [
      {
        id: 'view',
        label: 'View Achievements',
        primary: true,
        action: () => {
          window.location.hash = '#achievements';
        },
      },
    ],
  });
}
