/**
 * Admin Panel State Management
 *
 * Manages the overall admin panel UI state including:
 * - Navigation between sections
 * - Notifications
 * - Section-specific state
 */

import { map, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type {
  AdminSection,
  AdminPanelState,
  CardManagementState,
  PackConfigState,
  AnnouncementState,
  UserModerationState,
  AnalyticsDashboardState,
  AdminSettings,
} from '@/types';

// ============================================================================
// NOTIFICATIONS
// ============================================================================

interface AdminNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  read: boolean;
}

/**
 * Notification manager
 */
const notificationsStore = persistentAtom<AdminNotification[]>('admin-notifications', [], {
  encode: (value) => JSON.stringify(value),
  decode: (str) => {
    try {
      if (!str) return [];
      const parsed = JSON.parse(str);
      // Rehydrate Date objects
      return parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
    } catch {
      return [];
    }
  },
});

export function addNotification(
  type: AdminNotification['type'],
  message: string
): void {
  const notifications = notificationsStore.get();
  const newNotification: AdminNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type,
    message,
    timestamp: new Date(),
    read: false,
  };
  notificationsStore.set([newNotification, ...notifications].slice(0, 50)); // Keep last 50
}

export function markNotificationRead(id: string): void {
  const notifications = notificationsStore.get();
  notificationsStore.set(
    notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
  );
}

export function markAllNotificationsRead(): void {
  const notifications = notificationsStore.get();
  notificationsStore.set(notifications.map((n) => ({ ...n, read: true })));
}

export function clearNotification(id: string): void {
  const notifications = notificationsStore.get();
  notificationsStore.set(notifications.filter((n) => n.id !== id));
}

export function clearAllNotifications(): void {
  notificationsStore.set([]);
}

export const unreadNotificationsCount = computed(notificationsStore, (notifications) =>
  notifications.filter((n) => !n.read).length
);

// ============================================================================
// MAIN ADMIN PANEL STATE
// ============================================================================

/**
 * Sidebar collapsed state
 */
const sidebarCollapsedStore = persistentAtom<boolean>('admin-sidebar-collapsed', false);

export const sidebarCollapsed = computed(sidebarCollapsedStore, (collapsed) => collapsed);

export function toggleSidebar(): void {
  sidebarCollapsedStore.set(!sidebarCollapsedStore.get());
}

export function setSidebarCollapsed(collapsed: boolean): void {
  sidebarCollapsedStore.set(collapsed);
}

// ============================================================================
// NAVIGATION
// ============================================================================

/**
 * Current admin section
 */
const currentSectionStore = persistentAtom<AdminSection>('admin-current-section', 'dashboard');

export const currentSection = computed(currentSectionStore, (section) => section);

export function setCurrentSection(section: AdminSection): void {
  currentSectionStore.set(section);
}

export function navigateToSection(section: AdminSection): void {
  setCurrentSection(section);
}

// ============================================================================
// SECTION STATES
// ============================================================================

/**
 * Card management state
 */
export const cardManagementState = map<CardManagementState>({
  editState: 'idle',
  selectedCardId: null,
  formData: null,
  validationErrors: [],
  searchQuery: '',
  filterRarity: null,
  filterType: null,
});

export function setCardEditState(state: CardManagementState['editState']): void {
  cardManagementState.setKey('editState', state);
}

export function selectCard(cardId: string | null): void {
  cardManagementState.setKey('selectedCardId', cardId);
}

export function setCardFormData(data: CardManagementState['formData']): void {
  cardManagementState.setKey('formData', data);
}

export function setCardSearchQuery(query: string): void {
  cardManagementState.setKey('searchQuery', query);
}

export function setCardRarityFilter(rarity: CardManagementState['filterRarity']): void {
  cardManagementState.setKey('filterRarity', rarity);
}

export function setCardTypeFilter(type: CardManagementState['filterType']): void {
  cardManagementState.setKey('filterType', type);
}

export function setCardValidationErrors(errors: string[]): void {
  cardManagementState.setKey('validationErrors', errors);
}

/**
 * Pack configuration state
 */
export const packConfigState = map<PackConfigState>({
  configs: [],
  selectedConfigId: null,
  isEditing: false,
  isSaving: false,
  validationErrors: [],
});

export function setSelectedPackConfig(configId: string | null): void {
  packConfigState.setKey('selectedConfigId', configId);
}

export function setPackConfigEditing(editing: boolean): void {
  packConfigState.setKey('isEditing', editing);
}

export function setPackConfigSaving(saving: boolean): void {
  packConfigState.setKey('isSaving', saving);
}

/**
 * Announcement state
 */
export const announcementState = map<AnnouncementState>({
  announcements: [],
  selectedAnnouncementId: null,
  isEditing: false,
  isCreating: false,
  formData: null,
});

export function setSelectedAnnouncement(id: string | null): void {
  announcementState.setKey('selectedAnnouncementId', id);
}

export function setAnnouncementEditing(editing: boolean): void {
  announcementState.setKey('isEditing', editing);
}

export function setAnnouncementCreating(creating: boolean): void {
  announcementState.setKey('isCreating', creating);
}

/**
 * User moderation state
 */
export const userModerationState = map<UserModerationState>({
  users: [],
  selectedUserId: null,
  actionHistory: [],
  searchQuery: '',
  statusFilter: null,
  isPerformingAction: false,
});

export function setSelectedUser(userId: string | null): void {
  userModerationState.setKey('selectedUserId', userId);
}

export function setUserSearchQuery(query: string): void {
  userModerationState.setKey('searchQuery', query);
}

export function setUserStatusFilter(status: UserModerationState['statusFilter']): void {
  userModerationState.setKey('statusFilter', status);
}

export function setUserPerformingAction(performing: boolean): void {
  userModerationState.setKey('isPerformingAction', performing);
}

/**
 * Analytics dashboard state
 */
export const analyticsDashboardState = map<AnalyticsDashboardState>({
  data: null,
  timeRange: '7d',
  isLoading: false,
  error: null,
  refreshInterval: 30, // seconds
});

export function setAnalyticsTimeRange(range: AnalyticsDashboardState['timeRange']): void {
  analyticsDashboardState.setKey('timeRange', range);
}

export function setAnalyticsLoading(loading: boolean): void {
  analyticsDashboardState.setKey('isLoading', loading);
}

export function setAnalyticsData(data: AnalyticsDashboardState['data']): void {
  analyticsDashboardState.setKey('data', data);
}

export function setAnalyticsError(error: AnalyticsDashboardState['error']): void {
  analyticsDashboardState.setKey('error', error);
}

// ============================================================================
// ADMIN SETTINGS
// ============================================================================

/**
 * Admin site settings
 */
export const adminSettings = persistentAtom<AdminSettings>('admin-settings', {
  siteName: 'DadDeck™',
  siteDescription: 'The Ultimate White Dad Trading Card Simulator',
  maintenanceMode: false,
  registrationOpen: true,
  minVersion: '1.0.0',
  announcementBanner: null,
});

export function updateAdminSettings(updates: Partial<AdminSettings>): void {
  adminSettings.set({ ...adminSettings.get(), ...updates });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all notifications
 */
export function getNotifications(): AdminNotification[] {
  return notificationsStore.get();
}

/**
 * Reset all section states to initial values
 */
export function resetAllSectionStates(): void {
  cardManagementState.set({
    editState: 'idle',
    selectedCardId: null,
    formData: null,
    validationErrors: [],
    searchQuery: '',
    filterRarity: null,
    filterType: null,
  });

  packConfigState.set({
    configs: [],
    selectedConfigId: null,
    isEditing: false,
    isSaving: false,
    validationErrors: [],
  });

  announcementState.set({
    announcements: [],
    selectedAnnouncementId: null,
    isEditing: false,
    isCreating: false,
    formData: null,
  });

  userModerationState.set({
    users: [],
    selectedUserId: null,
    actionHistory: [],
    searchQuery: '',
    statusFilter: null,
    isPerformingAction: false,
  });

  analyticsDashboardState.set({
    data: null,
    timeRange: '7d',
    isLoading: false,
    error: null,
    refreshInterval: 30,
  });
}

/**
 * Format a notification for display
 */
export function formatNotification(notification: AdminNotification): string {
  const time = new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.floor((notification.timestamp.getTime() - Date.now()) / 1000 / 60),
    'minute'
  );
  return `[${time}] ${notification.message}`;
}
