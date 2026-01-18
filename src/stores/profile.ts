/**
 * Profile Store
 *
 * Manages player profile state with customization options including
 * username, avatar selection, bio text, favorite card display, and badges.
 * Uses persistent storage for profile data.
 */

import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type {
  PlayerProfile,
  ProfileSettings,
  AvatarId,
  Badge,
  ProfileViewMode,
  PlayerStats,
} from '@/types';
import { AVATARS, PROFILE_BADGES } from '@/types';
import { userProfile as leaderboardProfile } from '@/stores/leaderboard';
import { sanitizeProfileName } from '@/lib/security';

/**
 * Custom encoder to handle Date serialization in persistent storage
 */
const profileEncoder = {
  decode(value: any): any {
    if (!value) return null;
    if (value.createdAt) value.createdAt = new Date(value.createdAt);
    if (value.updatedAt) value.updatedAt = new Date(value.updatedAt);
    if (value.stats?.lastActive) value.stats.lastActive = new Date(value.stats.lastActive);
    if (value.stats?.joinedAt) value.stats.joinedAt = new Date(value.stats.joinedAt);
    if (value.badges) {
      value.badges = value.badges.map((badge: any) => ({
        ...badge,
        unlockedAt: badge.unlockedAt ? new Date(badge.unlockedAt) : undefined,
      }));
    }
    return value;
  },
  encode(value: any): any {
    if (!value) return null;
    return value;
  },
};

/**
 * Current player profile (persistent)
 * Extends leaderboard profile with customization options
 */
export const profile = persistentAtom<PlayerProfile | null>('daddeck-profile', null, {
  encode: profileEncoder.encode,
  decode: profileEncoder.decode,
});

/**
 * Profile view mode (edit vs view)
 */
export const viewMode = atom<ProfileViewMode>('view');

/**
 * Saving state for profile updates
 */
export const isSaving = atom<boolean>(false);

/**
 * Error state for profile operations
 */
export const profileError = atom<string | null>(null);

/**
 * Get the default avatar ID
 */
export function getDefaultAvatar(): AvatarId {
  return 'grill_master';
}

/**
 * Generate a unique player ID (anonymous)
 */
export function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a new player profile
 */
export function createProfile(stats: PlayerStats): PlayerProfile {
  const defaultAvatar = getDefaultAvatar();
  const leaderboardProf = leaderboardProfile.get();

  return {
    playerId: generatePlayerId(),
    pseudonym: sanitizeProfileName(leaderboardProf?.pseudonym || 'New Dad 🍖'),
    username: '', // User will set this
    avatarId: defaultAvatar,
    bio: '',
    favoriteCardId: null,
    badges: [],
    stats: {
      ...stats,
      lastActive: new Date(),
      joinedAt: new Date(),
    },
    friends: leaderboardProf?.friends || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Initialize profile if not exists
 */
export function initializeProfile(stats: PlayerStats): PlayerProfile {
  const existing = profile.get();
  if (existing) {
    return existing;
  }

  const newProfile = createProfile(stats);
  profile.set(newProfile);
  return newProfile;
}

/**
 * Update profile settings (username, avatar, bio, favorite card)
 */
export function updateProfileSettings(settings: Partial<ProfileSettings>): void {
  const current = profile.get();
  if (!current) {
    profileError.set('Profile not initialized');
    return;
  }

  // Validate bio length (140 char max)
  if (settings.bio !== undefined && settings.bio.length > 140) {
    profileError.set('Bio must be 140 characters or less');
    return;
  }

  // Validate username (not empty)
  if (settings.username !== undefined && settings.username.trim() === '') {
    profileError.set('Username cannot be empty');
    return;
  }

  const updated: PlayerProfile = {
    ...current,
    ...(settings.username && { username: sanitizeProfileName(settings.username) }),
    ...(settings.avatarId && { avatarId: settings.avatarId }),
    ...(settings.bio !== undefined && { bio: settings.bio.trim() }),
    ...(settings.favoriteCardId !== undefined && { favoriteCardId: settings.favoriteCardId }),
    updatedAt: new Date(),
  };

  profile.set(updated);
  profileError.set(null);
}

/**
 * Update username
 */
export function updateUsername(username: string): void {
  updateProfileSettings({ username });
}

/**
 * Update avatar
 */
export function updateAvatar(avatarId: AvatarId): void {
  updateProfileSettings({ avatarId });
}

/**
 * Update bio
 */
export function updateBio(bio: string): void {
  updateProfileSettings({ bio });
}

/**
 * Update favorite card
 */
export function updateFavoriteCard(cardId: string | null): void {
  updateProfileSettings({ favoriteCardId: cardId });
}

/**
 * Unlock a badge
 */
export function unlockBadge(badgeId: string): boolean {
  const current = profile.get();
  if (!current) {
    profileError.set('Profile not initialized');
    return false;
  }

  // Check if badge already unlocked
  if (current.badges.some((b) => b.id === badgeId)) {
    return false;
  }

  // Find badge definition
  const badgeDef = PROFILE_BADGES.find((b) => b.id === badgeId);
  if (!badgeDef) {
    profileError.set('Badge not found');
    return false;
  }

  // Add unlocked badge with timestamp
  const unlockedBadge: Badge = {
    ...badgeDef,
    unlockedAt: new Date(),
  };

  profile.set({
    ...current,
    badges: [...current.badges, unlockedBadge],
    updatedAt: new Date(),
  });

  profileError.set(null);
  return true;
}

/**
 * Update badge progress
 */
export function updateBadgeProgress(badgeId: string, progress: number): void {
  const current = profile.get();
  if (!current) {
    profileError.set('Profile not initialized');
    return;
  }

  const badgeDef = PROFILE_BADGES.find((b) => b.id === badgeId);
  if (!badgeDef || badgeDef.maxProgress === undefined) {
    return; // Badge doesn't support progress
  }

  const existingBadge = current.badges.find((b) => b.id === badgeId);

  if (existingBadge) {
    // Update existing badge progress
    profile.set({
      ...current,
      badges: current.badges.map((b) =>
        b.id === badgeId
          ? { ...b, progress: Math.max(0, Math.min(progress, badgeDef.maxProgress!)) }
          : b
      ),
      updatedAt: new Date(),
    });
  } else {
    // Add badge with progress
    const badgeWithProgress: Badge = {
      ...badgeDef,
      progress: Math.max(0, Math.min(progress, badgeDef.maxProgress)),
    };

    profile.set({
      ...current,
      badges: [...current.badges, badgeWithProgress],
      updatedAt: new Date(),
    });
  }

  // Auto-unlock when progress reaches max
  const updated = profile.get();
  const trackedBadge = updated?.badges.find((b) => b.id === badgeId);
  if (trackedBadge && trackedBadge.progress === badgeDef.maxProgress && !trackedBadge.unlockedAt) {
    unlockBadge(badgeId);
  }

  profileError.set(null);
}

/**
 * Update player statistics (called from other systems)
 */
export function updateStats(stats: Partial<PlayerStats>): void {
  const current = profile.get();
  if (!current) {
    profileError.set('Profile not initialized');
    return;
  }

  profile.set({
    ...current,
    stats: {
      ...current.stats,
      ...stats,
      lastActive: new Date(),
    },
    updatedAt: new Date(),
  });
  profileError.set(null);
}

/**
 * Check badges based on stats and unlock automatically
 */
export function checkAndUnlockBadges(): Badge[] {
  const current = profile.get();
  if (!current) {
    return [];
  }

  const newlyUnlocked: Badge[] = [];
  const stats = current.stats;

  // Collection badges
  if (stats.totalPacksOpened >= 1) {
    if (unlockBadge('collector_starter')) {
      const badge = PROFILE_BADGES.find((b) => b.id === 'collector_starter');
      if (badge) newlyUnlocked.push(badge);
    }
  }
  if (stats.totalPacksOpened >= 10) {
    updateBadgeProgress('collector_10', 10);
    if (unlockBadge('collector_10')) {
      const badge = PROFILE_BADGES.find((b) => b.id === 'collector_10');
      if (badge) newlyUnlocked.push(badge);
    }
  } else if (stats.totalPacksOpened > 0) {
    updateBadgeProgress('collector_10', stats.totalPacksOpened);
  }

  if (stats.totalPacksOpened >= 50) {
    updateBadgeProgress('collector_50', 50);
    if (unlockBadge('collector_50')) {
      const badge = PROFILE_BADGES.find((b) => b.id === 'collector_50');
      if (badge) newlyUnlocked.push(badge);
    }
  } else if (stats.totalPacksOpened > 0) {
    updateBadgeProgress('collector_50', stats.totalPacksOpened);
  }

  if (stats.totalPacksOpened >= 100) {
    updateBadgeProgress('collector_100', 100);
    if (unlockBadge('collector_100')) {
      const badge = PROFILE_BADGES.find((b) => b.id === 'collector_100');
      if (badge) newlyUnlocked.push(badge);
    }
  } else if (stats.totalPacksOpened > 0) {
    updateBadgeProgress('collector_100', stats.totalPacksOpened);
  }

  // Social badges
  if (current.friends.length >= 1) {
    updateBadgeProgress('social_friend', 1);
    if (unlockBadge('social_friend')) {
      const badge = PROFILE_BADGES.find((b) => b.id === 'social_friend');
      if (badge) newlyUnlocked.push(badge);
    }
  }

  if (current.friends.length >= 5) {
    updateBadgeProgress('social_5_friends', 5);
    if (unlockBadge('social_5_friends')) {
      const badge = PROFILE_BADGES.find((b) => b.id === 'social_5_friends');
      if (badge) newlyUnlocked.push(badge);
    }
  } else if (current.friends.length > 0) {
    updateBadgeProgress('social_5_friends', current.friends.length);
  }

  // Achievement badges (checked from achievement system)
  const achievementBadges = current.badges.filter((b) => b.category === 'achievement').length;
  if (achievementBadges >= 1) {
    if (unlockBadge('achievement_first')) {
      const badge = PROFILE_BADGES.find((b) => b.id === 'achievement_first');
      if (badge) newlyUnlocked.push(badge);
    }
  }
  if (achievementBadges >= 10) {
    if (unlockBadge('achievement_10')) {
      const badge = PROFILE_BADGES.find((b) => b.id === 'achievement_10');
      if (badge) newlyUnlocked.push(badge);
    }
  }

  return newlyUnlocked;
}

/**
 * Add a friend by player ID
 */
export function addFriend(playerId: string): void {
  const current = profile.get();
  if (!current) {
    profileError.set('Profile not initialized');
    return;
  }

  if (!current.friends.includes(playerId)) {
    profile.set({
      ...current,
      friends: [...current.friends, playerId],
      updatedAt: new Date(),
    });
    profileError.set(null);

    // Check for social badges
    checkAndUnlockBadges();
  }
}

/**
 * Remove a friend by player ID
 */
export function removeFriend(playerId: string): void {
  const current = profile.get();
  if (!current) {
    profileError.set('Profile not initialized');
    return;
  }

  profile.set({
    ...current,
    friends: current.friends.filter((id) => id !== playerId),
    updatedAt: new Date(),
  });
  profileError.set(null);
}

/**
 * Set view mode
 */
export function setViewMode(mode: ProfileViewMode): void {
  viewMode.set(mode);
}

/**
 * Toggle between edit and view mode
 */
export function toggleEditMode(): void {
  const current = viewMode.get();
  viewMode.set(current === 'edit' ? 'view' : 'edit');
}

/**
 * Get avatar by ID
 */
export function getAvatar(avatarId: AvatarId) {
  return AVATARS[avatarId];
}

/**
 * Get all available avatars
 */
export function getAllAvatars() {
  return Object.values(AVATARS);
}

/**
 * Export profile data (for sharing/debugging)
 */
export function exportProfileData(): string {
  const current = profile.get();
  if (!current) {
    return '';
  }

  return JSON.stringify(
    {
      username: current.username,
      pseudonym: current.pseudonym,
      avatarId: current.avatarId,
      bio: current.bio,
      badgesUnlocked: current.badges.length,
      totalPacksOpened: current.stats.totalPacksOpened,
      uniqueCards: current.stats.uniqueCards,
    },
    null,
    2
  );
}
