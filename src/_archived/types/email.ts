/**
 * Email System Types (US097 - Email System - Notifications)
 *
 * This module defines all types for the email notification system including:
 * - Email verification
 * - Weekly digest emails
 * - Special event announcements
 * - Trade offer notifications
 * - Email preferences and unsubscribe handling
 */

// ============================================================================
// EMAIL TYPES AND CATEGORIES
// ============================================================================

/**
 * Email notification categories
 */
export type EmailCategory =
  | 'verification'      // Email verification
  | 'weekly_digest'     // Weekly pack opening summary
  | 'special_event'     // Special event announcements
  | 'trade_offer'       // Trade offer notifications
  | 'achievement'       // Achievement unlocked
  | 'marketing';        // General marketing (optional)

/**
 * Email delivery status
 */
export type EmailStatus = 'pending' | 'sent' | 'failed' | 'bounced' | 'unsubscribed';

/**
 * Email template types
 */
export type EmailTemplate =
  | 'verification'
  | 'weekly_digest'
  | 'special_event'
  | 'trade_offer_received'
  | 'trade_offer_accepted'
  | 'trade_offer_expired'
  | 'achievement_unlocked';

// ============================================================================
// EMAIL VERIFICATION TYPES
// ============================================================================

/**
 * Email verification status
 */
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'failed';

/**
 * Email verification record
 */
export interface EmailVerification {
  id: string;
  email: string;
  status: VerificationStatus;
  verificationCode: string;
  expiresAt: Date;
  verifiedAt?: Date;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
}

// ============================================================================
// EMAIL PREFERENCES TYPES
// ============================================================================

/**
 * Email notification preferences (per category)
 */
export interface EmailPreferences {
  // Email address
  email: string;
  verified: boolean;

  // Per-category preferences (user can opt-in/opt-out)
  weeklyDigestEnabled: boolean;
  specialEventEnabled: boolean;
  tradeOfferEnabled: boolean;
  achievementEnabled: boolean;
  marketingEnabled: boolean;

  // Global email toggle
  allEmailsEnabled: boolean;

  // Digest frequency (for weekly digest)
  digestDay: number; // 0-6 (Sunday-Saturday)
  digestTime: string; // HH:mm format

  // Unsubscribe token (for one-click unsubscribe)
  unsubscribeToken: string;

  // Timestamps
  updatedAt: Date;
  lastEmailSentAt?: Date;
}

/**
 * Email preference update options
 */
export type EmailPreferenceKey = keyof Omit<
  EmailPreferences,
  'email' | 'verified' | 'unsubscribeToken' | 'updatedAt' | 'lastEmailSentAt'
>;

// ============================================================================
// WEEKLY DIGEST TYPES
// ============================================================================

/**
 * Weekly digest data summary
 */
export interface WeeklyDigestData {
  weekStart: Date;
  weekEnd: Date;
  userId: string;
  email: string;

  // Pack opening summary
  packsOpened: number;
  totalCards: number;
  rarityBreakdown: Record<string, number>; // rarity -> count
  holoCount: number;

  // Best pulls
  bestPulls: Array<{
    cardId: string;
    cardName: string;
    rarity: string;
    isHolo: boolean;
  }>;

  // Achievements unlocked
  achievementsUnlocked: Array<{
    id: string;
    name: string;
    rarity: string;
  }>;

  // Trades completed
  tradesCompleted: number;
  tradesReceived: number;

  // Stats comparison vs last week
  weekOverWeek: {
    packsOpenedChange: number; // percentage
    newAchievements: number;
  };

  // Personalized message
  personalizedMessage?: string;
}

/**
 * Prepared weekly digest email
 */
export interface PreparedDigest {
  id: string;
  data: WeeklyDigestData;
  preparedAt: Date;
  scheduledFor: Date;
  status: EmailStatus;
  htmlContent?: string;
  textContent?: string;
}

// ============================================================================
// SPECIAL EVENT ANNOUNCEMENT TYPES
// ============================================================================

/**
 * Special event announcement
 */
export interface SpecialEventAnnouncement {
  id: string;
  title: string;
  description: string;
  eventType: 'season_launch' | 'holiday_event' | 'promotion' | 'community_event';
  startDate: Date;
  endDate?: Date;
  imageUrl?: string;
  cta?: {
    label: string;
    url: string;
  };

  // Email targeting
  targetAudience: 'all' | 'verified' | 'active' | 'inactive';

  // Email content
  subject: string;
  previewText: string;
  htmlContent?: string;
  textContent?: string;

  // Sending status
  scheduledFor?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';

  // Analytics
  totalRecipients: number;
  sentCount: number;
  openCount?: number;
  clickCount?: number;

  createdAt: Date;
  createdBy: string; // Admin username
}

// ============================================================================
// TRADE OFFER EMAIL TYPES
// ============================================================================

/**
 * Trade offer notification data
 */
export interface TradeOfferEmailData {
  tradeId: string;
  senderName: string;
  senderEmail?: string;
  offeredCards: Array<{
    id: string;
    name: string;
    rarity: string;
    isHolo: boolean;
  }>;
  requestedCards: Array<{
    id: string;
    name: string;
    rarity: string;
    isHolo: boolean;
  }>;
  message?: string;
  expiresAt: Date;
  tradeUrl: string;
  unsubscribeUrl: string;
}

/**
 * Trade offer email types
 */
export type TradeOfferEmailType =
  | 'offer_received'    // New trade offer received
  | 'offer_accepted'    // Your trade offer was accepted
  | 'offer_expired'     // Trade offer expired
  | 'offer_cancelled';  // Trade offer was cancelled

// ============================================================================
// EMAIL QUEUE TYPES
// ============================================================================

/**
 * Queued email for sending
 */
export interface QueuedEmail {
  id: string;
  category: EmailCategory;
  template: EmailTemplate;
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  data: Record<string, any>;
  status: EmailStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attempts: number;
  maxAttempts: number;
  scheduledFor?: Date;
  sentAt?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Email queue statistics
 */
export interface EmailQueueStats {
  totalQueued: number;
  totalSent: number;
  totalFailed: number;
  byCategory: Record<EmailCategory, number>;
  byStatus: Record<EmailStatus, number>;
}

// ============================================================================
// EMAIL STATE TYPES
// ============================================================================

/**
 * Email system state for UI
 */
export interface EmailState {
  // User's email preferences
  preferences: EmailPreferences | null;

  // Verification status
  verification: EmailVerification | null;

  // Weekly digest data (for preview)
  lastDigest: WeeklyDigestData | null;
  nextDigestDate: Date | null;

  // Queue status (admin view)
  queueStats: EmailQueueStats | null;

  // UI state
  isUpdatingPreferences: boolean;
  isSendingVerification: boolean;
  isVerifyingEmail: boolean;
  error: string | null;

  // Unsubscribe handling
  unsubscribeToken: string | null;
  unsubscribeSuccess: boolean;
}

// ============================================================================
// DEFAULT EMAIL PREFERENCES
// ============================================================================

/**
 * Default email preferences for new users
 */
export const DEFAULT_EMAIL_PREFERENCES: Omit<
  EmailPreferences,
  'email' | 'unsubscribeToken' | 'updatedAt'
> = {
  verified: false,
  weeklyDigestEnabled: true,
  specialEventEnabled: true,
  tradeOfferEnabled: true,
  achievementEnabled: true,
  marketingEnabled: false, // Opt-in only
  allEmailsEnabled: true,
  digestDay: 0, // Sunday
  digestTime: '09:00',
};

// ============================================================================
// EMAIL TEMPLATE HELPERS
// ============================================================================

/**
 * Email template rendering context
 */
export interface EmailTemplateContext {
  recipientName: string;
  recipientEmail: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
  siteUrl: string;
  data: Record<string, any>;
}

/**
 * Email rendering result
 */
export interface RenderedEmail {
  subject: string;
  htmlContent: string;
  textContent: string;
  previewText: string;
}
