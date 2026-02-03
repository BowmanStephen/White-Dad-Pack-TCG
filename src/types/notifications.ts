// ============================================================================
// NOTIFICATION TYPES (US081 - Notification System - Browser Push)
// ============================================================================

// Notification types
export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'achievement';

// Notification categories for push notifications
export type NotificationCategory = 'daily_reward' | 'trade' | 'achievement' | 'general';

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  category?: NotificationCategory;
  duration?: number;
  persistent?: boolean;
  timestamp: Date;
  read?: boolean;
  actions?: NotificationAction[];
  icon?: string;
  data?: Record<string, unknown>;
}

// Notification action (button/link in notification)
export interface NotificationAction {
  id: string;
  label: string;
  primary?: boolean;
  action: () => void | Promise<void>;
}

// Notification preferences (user settings)
export interface NotificationPreferences {
  pushEnabled: boolean;
  pushPermission: 'default' | 'granted' | 'denied';
  dailyRewardNotifications: boolean;
  tradeNotifications: boolean;
  achievementNotifications: boolean;
  generalNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

// Notification state
export interface NotificationState {
  notifications: Notification[];
  preferences: NotificationPreferences;
  unreadCount: number;
}

// Browser push notification payload
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string;
  requireInteraction?: boolean;
  timestamp?: number;
}

// Push notification subscription info
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
