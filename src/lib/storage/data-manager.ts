/**
 * PACK-075: Data Management Utilities
 *
 * Provides functions to clear various types of user data:
 * - Clear collection data (packs, cards)
 * - Clear settings/preferences
 * - Clear all data (fresh start)
 *
 * All operations include confirmation checks and success notifications.
 */

import { clearAllCollectionData } from '@/stores/collection';
import { resetNotificationPreferences } from '@/stores/notifications';
import type { ClearDataResult } from '@/types';

// ============================================================================
// COLLECTION DATA
// ============================================================================

/**
 * Clear all collection data (packs, cards, deck, achievements, etc.)
 * Keeps user settings intact.
 *
 * @returns Promise<ClearDataResult> Result of the operation
 */
export async function clearCollectionData(): Promise<ClearDataResult> {
  try {
    if (typeof window === 'undefined') {
      return {
        success: false,
        cleared: 'collection',
        message: 'Cannot clear data in server environment',
        error: 'SERVER_ENVIRONMENT'
      };
    }

    // Clear the collection store
    await clearAllCollectionData();

    return {
      success: true,
      cleared: 'collection',
      message: 'Collection data cleared successfully. You now have a fresh collection!'
    };
  } catch (error) {
    console.error('[DataManager] Failed to clear collection:', error);
    return {
      success: false,
      cleared: 'collection',
      message: 'Failed to clear collection data',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ============================================================================
// SETTINGS DATA
// ============================================================================

/**
 * Clear all user settings and preferences
 * Keeps collection data intact.
 *
 * @returns Promise<ClearDataResult> Result of the operation
 */
export async function clearSettingsData(): Promise<ClearDataResult> {
  try {
    if (typeof window === 'undefined') {
      return {
        success: false,
        cleared: 'settings',
        message: 'Cannot clear data in server environment',
        error: 'SERVER_ENVIRONMENT'
      };
    }

    // Clear all localStorage items related to settings
    const settingsKeys = [
      'daddeck_notification_preferences',
      'daddeck_audio_volume',
      'daddeck_audio_muted',
      'daddeck_theme',
      'daddeck_motion_mode',
      'daddeck_ui_settings',
      'daddeck_language',
      'daddeck_cinematic_mode',
      'daddeck_tutorial_progress',
      // Add more keys as needed
    ];

    for (const key of settingsKeys) {
      localStorage.removeItem(key);
    }

    // Reset notification preferences to defaults
    resetNotificationPreferences();

    return {
      success: true,
      cleared: 'settings',
      message: 'Settings cleared successfully. Default preferences will be used.'
    };
  } catch (error) {
    console.error('[DataManager] Failed to clear settings:', error);
    return {
      success: false,
      cleared: 'settings',
      message: 'Failed to clear settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ============================================================================
// ALL DATA
// ============================================================================

/**
 * Clear ALL data (collection + settings)
 * This is a complete factory reset of the app.
 *
 * @returns Promise<ClearDataResult> Result of the operation
 */
export async function clearAllData(): Promise<ClearDataResult> {
  try {
    if (typeof window === 'undefined') {
      return {
        success: false,
        cleared: 'all',
        message: 'Cannot clear data in server environment',
        error: 'SERVER_ENVIRONMENT'
      };
    }

    // Clear collection first
    const collectionResult = await clearCollectionData();
    if (!collectionResult.success) {
      return collectionResult;
    }

    // Then clear settings
    const settingsResult = await clearSettingsData();
    if (!settingsResult.success) {
      return settingsResult;
    }

    // Reload the page to apply fresh state
    setTimeout(() => {
      window.location.reload();
    }, 1000);

    return {
      success: true,
      cleared: 'all',
      message: 'All data cleared successfully! The app will reload momentarily...'
    };
  } catch (error) {
    console.error('[DataManager] Failed to clear all data:', error);
    return {
      success: false,
      cleared: 'all',
      message: 'Failed to clear all data',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ============================================================================
// CONFIRMATION HELPERS
// ============================================================================

/**
 * Show confirmation dialog for clearing collection
 * @returns boolean - true if user confirms
 */
export function confirmClearCollection(): boolean {
  return window.confirm(
    '⚠️ WARNING: This will delete your entire card collection!\n\n' +
    'This includes:\n' +
    '• All opened packs\n' +
    '• All cards in your collection\n' +
    '• Deck configurations\n' +
    '• Achievement progress\n' +
    '• Daily reward streaks\n\n' +
    'This cannot be undone!\n\n' +
    'Are you sure you want to clear your collection?'
  );
}

/**
 * Show confirmation dialog for clearing settings
 * @returns boolean - true if user confirms
 */
export function confirmClearSettings(): boolean {
  return window.confirm(
    '⚠️ WARNING: This will reset all your settings!\n\n' +
    'This includes:\n' +
    '• Audio preferences (volume, mute)\n' +
    '• Theme and display settings\n' +
    '• Animation preferences\n' +
    '• Notification settings\n' +
    '• Language preference\n' +
    '• Tutorial progress\n\n' +
    'This cannot be undone!\n\n' +
    'Are you sure you want to reset all settings?'
  );
}

/**
 * Show confirmation dialog for clearing all data
 * @returns boolean - true if user confirms
 */
export function confirmClearAll(): boolean {
  return window.confirm(
    '⚠️ WARNING: This will delete ALL data!\n\n' +
    'This includes:\n' +
    '• Your entire card collection\n' +
    '• All user settings and preferences\n' +
    '• All app data\n\n' +
    'This is a complete factory reset.\n' +
    'You will start fresh as if you just installed the app.\n\n' +
    'This cannot be undone!\n\n' +
    'Are you absolutely sure you want to delete everything?'
  );
}
