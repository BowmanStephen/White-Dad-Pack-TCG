/**
 * Email System Store (US097 - Email System - Notifications)
 *
 * This module manages email notifications, preferences, verification, and
 * weekly digest preparation. Since this is a client-side application, actual
 * email sending would be handled by a backend service. This store prepares
 * email data and manages user preferences.
 */

import { persistentAtom } from '@nanostores/persistent';
import { atom } from 'nanostores';
import type {
  EmailState,
  EmailPreferences,
  EmailVerification,
  VerificationStatus,
  WeeklyDigestData,
  TradeOfferEmailData,
  DEFAULT_EMAIL_PREFERENCES,
  EmailCategory,
  EmailTemplate,
  EmailTemplateContext,
  RenderedEmail,
} from '../types';
import { collection } from './collection';
import { achievements } from './achievements';
import { tradeStore } from './trade';
import { dadPassSubscription } from './daddypass';
import { trackEvent } from './analytics';

// ============================================================================
// ENCODERS FOR PERSISTENCE
// ============================================================================

const emailPreferencesEncoder = {
  encode(data: EmailPreferences): string {
    return JSON.stringify(data, (_key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
  },
  decode(str: string): EmailPreferences {
    const data = JSON.parse(str);
    // Convert ISO strings back to Date objects
    const convertDates = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) {
        return obj.map(convertDates);
      }
      const converted: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (
          key === 'updatedAt' ||
          key === 'lastEmailSentAt' ||
          key === 'expiresAt' ||
          key === 'verifiedAt' ||
          key === 'createdAt'
        ) {
          converted[key] = new Date(value as string);
        } else {
          converted[key] = convertDates(value);
        }
      }
      return converted;
    };
    return convertDates(data);
  },
};

const verificationEncoder = {
  encode(data: EmailVerification): string {
    return JSON.stringify(data, (_key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
  },
  decode(str: string): EmailVerification {
    const data = JSON.parse(str);
    return {
      ...data,
      expiresAt: new Date(data.expiresAt),
      verifiedAt: data.verifiedAt ? new Date(data.verifiedAt) : undefined,
      createdAt: new Date(data.createdAt),
    };
  },
};

const digestEncoder = {
  encode(data: WeeklyDigestData): string {
    return JSON.stringify(data, (_key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
  },
  decode(str: string): WeeklyDigestData {
    const data = JSON.parse(str);
    return {
      ...data,
      weekStart: new Date(data.weekStart),
      weekEnd: new Date(data.weekEnd),
    };
  },
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialEmailState: EmailState = {
  preferences: null,
  verification: null,
  lastDigest: null,
  nextDigestDate: null,
  queueStats: null,
  isUpdatingPreferences: false,
  isSendingVerification: false,
  isVerifyingEmail: false,
  error: null,
  unsubscribeToken: null,
  unsubscribeSuccess: false,
};

// ============================================================================
// EMAIL STORES
// ============================================================================

// Email preferences (persistent)
export const $emailPreferences = persistentAtom<EmailPreferences | null>(
  'daddeck-email-preferences',
  null,
  emailPreferencesEncoder
);

// Email verification (persistent)
export const $emailVerification = persistentAtom<EmailVerification | null>(
  'daddeck-email-verification',
  null,
  verificationEncoder
);

// Last weekly digest (persistent)
export const $lastWeeklyDigest = persistentAtom<WeeklyDigestData | null>(
  'daddeck-last-digest',
  null,
  digestEncoder
);

// Email state (non-persistent UI state)
export const $emailState = atom<EmailState>(initialEmailState);

// Export stores without $ prefix
export const emailPreferences = $emailPreferences;
export const emailVerification = $emailVerification;
export const lastWeeklyDigest = $lastWeeklyDigest;
export const emailState = $emailState;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a unique email ID
 */
function generateEmailId(): string {
  return `email_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a verification code (6-digit)
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate unsubscribe token
 */
function generateUnsubscribeToken(): string {
  return Buffer.from(`${Date.now()}_${Math.random().toString(36)}`).toString('base64');
}

/**
 * Check if an email address is valid
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get unsubscribe URL for a user
 */
export function getUnsubscribeUrl(token: string): string {
  return `${window.location.origin}/unsubscribe?token=${token}`;
}

/**
 * Get email preferences URL
 */
export function getPreferencesUrl(): string {
  return `${window.location.origin}/settings#email`;
}

// ============================================================================
// EMAIL VERIFICATION
// ============================================================================

/**
 * Start email verification process
 * Sends a verification code to the user's email (simulated)
 */
export async function sendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
  const state = $emailState.get();
  $emailState.set({ ...state, isSendingVerification: true, error: null });

  // Validate email
  if (!isValidEmail(email)) {
    $emailState.set({ ...state, isSendingVerification: false, error: 'Invalid email address' });
    return { success: false, error: 'Invalid email address' };
  }

  // Create verification record
  const verification: EmailVerification = {
    id: generateEmailId(),
    email,
    status: 'pending',
    verificationCode: generateVerificationCode(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date(),
  };

  $emailVerification.set(verification);

  // Simulate sending email (in production, this would call an API)
  console.log('[Email System] Verification email sent to:', email);
  console.log('[Email System] Verification code:', verification.verificationCode);

  // Update state
  $emailState.set({ ...state, isSendingVerification: false, verification });

  // Track event
  trackEvent({
    type: 'settings_change',
    data: {
      setting: 'email_verification_sent',
      previousValue: '',
      newValue: 'pending',
    },
  } as any);

  return { success: true };
}

/**
 * Verify email with code
 */
export async function verifyEmail(code: string): Promise<{ success: boolean; error?: string }> {
  const state = $emailState.get();
  const verification = $emailVerification.get();

  if (!verification) {
    return { success: false, error: 'No verification pending' };
  }

  $emailState.set({ ...state, isVerifyingEmail: true, error: null });

  // Check if expired
  if (new Date() > verification.expiresAt) {
    verification.status = 'failed';
    $emailVerification.set({ ...verification });
    $emailState.set({ ...state, isVerifyingEmail: false, error: 'Verification code expired' });
    return { success: false, error: 'Verification code expired' };
  }

  // Check attempts
  if (verification.attempts >= verification.maxAttempts) {
    verification.status = 'failed';
    $emailVerification.set({ ...verification });
    $emailState.set({ ...state, isVerifyingEmail: false, error: 'Too many attempts' });
    return { success: false, error: 'Too many attempts' };
  }

  // Verify code
  verification.attempts++;
  if (code !== verification.verificationCode) {
    $emailVerification.set({ ...verification });
    $emailState.set({ ...state, isVerifyingEmail: false, error: 'Invalid verification code' });
    return { success: false, error: 'Invalid verification code' };
  }

  // Success!
  verification.status = 'verified';
  verification.verifiedAt = new Date();
  $emailVerification.set({ ...verification });

  // Update preferences
  const prefs = $emailPreferences.get();
  if (prefs) {
    prefs.verified = true;
    prefs.email = verification.email;
    $emailPreferences.set({ ...prefs });
  }

  $emailState.set({ ...state, isVerifyingEmail: false });

  // Track event
  trackEvent({
    type: 'settings_change',
    data: {
      setting: 'email_verified',
      previousValue: 'pending',
      newValue: 'verified',
    },
  } as any);

  return { success: true };
}

/**
 * Resend verification email
 */
export async function resendVerification(): Promise<{ success: boolean; error?: string }> {
  const verification = $emailVerification.get();

  if (!verification) {
    return { success: false, error: 'No email to verify' };
  }

  if (verification.status === 'verified') {
    return { success: false, error: 'Email already verified' };
  }

  return sendVerificationEmail(verification.email);
}

// ============================================================================
// EMAIL PREFERENCES MANAGEMENT
// ============================================================================

/**
 * Initialize email preferences for new user
 */
export function initializeEmailPreferences(email: string): EmailPreferences {
  const preferences: EmailPreferences = {
    email,
    verified: false,
    unsubscribeToken: generateUnsubscribeToken(),
    updatedAt: new Date(),
    ...DEFAULT_EMAIL_PREFERENCES,
  };

  $emailPreferences.set(preferences);
  return preferences;
}

/**
 * Update email preferences
 */
export function updateEmailPreferences<K extends keyof Omit<EmailPreferences, 'email' | 'verified' | 'unsubscribeToken' | 'updatedAt'>>(
  key: K,
  value: EmailPreferences[K]
): void {
  const prefs = $emailPreferences.get();
  if (!prefs) return;

  const updated: EmailPreferences = {
    ...prefs,
    [key]: value,
    updatedAt: new Date(),
  };

  $emailPreferences.set(updated);

  // Track event
  trackEvent({
    type: 'settings_change',
    data: {
      setting: `email_${key}`,
      previousValue: prefs[key],
      newValue: value,
    },
  } as any);
}

/**
 * Update user's email address (requires re-verification)
 */
export async function updateEmailAddress(newEmail: string): Promise<{ success: boolean; error?: string }> {
  if (!isValidEmail(newEmail)) {
    return { success: false, error: 'Invalid email address' };
  }

  const prefs = $emailPreferences.get();
  if (!prefs) {
    return { success: false, error: 'No email preferences found' };
  }

  // Update email but require verification
  prefs.email = newEmail;
  prefs.verified = false;
  prefs.updatedAt = new Date();
  $emailPreferences.set({ ...prefs });

  // Send new verification
  return sendVerificationEmail(newEmail);
}

/**
 * Check if a category is enabled
 */
export function isEmailCategoryEnabled(category: EmailCategory): boolean {
  const prefs = $emailPreferences.get();
  if (!prefs || !prefs.allEmailsEnabled) return false;

  switch (category) {
    case 'verification':
      return true; // Always send verification emails
    case 'weekly_digest':
      return prefs.weeklyDigestEnabled;
    case 'special_event':
      return prefs.specialEventEnabled;
    case 'trade_offer':
      return prefs.tradeOfferEnabled;
    case 'achievement':
      return prefs.achievementEnabled;
    case 'daddypass':
      return prefs.daddypassEnabled;
    case 'marketing':
      return prefs.marketingEnabled;
    default:
      return true;
  }
}

/**
 * Unsubscribe from all emails (one-click unsubscribe)
 */
export function unsubscribeAllEmails(token: string): { success: boolean; error?: string } {
  const prefs = $emailPreferences.get();

  if (!prefs) {
    return { success: false, error: 'No email preferences found' };
  }

  if (prefs.unsubscribeToken !== token) {
    return { success: false, error: 'Invalid unsubscribe token' };
  }

  // Disable all emails
  prefs.allEmailsEnabled = false;
  prefs.weeklyDigestEnabled = false;
  prefs.specialEventEnabled = false;
  prefs.tradeOfferEnabled = false;
  prefs.achievementEnabled = false;
  prefs.daddypassEnabled = false;
  prefs.marketingEnabled = false;
  prefs.updatedAt = new Date();

  $emailPreferences.set({ ...prefs });

  // Update state
  const state = $emailState.get();
  $emailState.set({ ...state, unsubscribeSuccess: true });

  return { success: true };
}

/**
 * Re-subscribe to emails
 */
export function resubscribeEmails(): void {
  const prefs = $emailPreferences.get();
  if (!prefs) return;

  prefs.allEmailsEnabled = true;
  prefs.weeklyDigestEnabled = true;
  prefs.specialEventEnabled = true;
  prefs.tradeOfferEnabled = true;
  prefs.achievementEnabled = true;
  prefs.daddypassEnabled = true;
  // Marketing stays opt-in
  prefs.updatedAt = new Date();

  $emailPreferences.set({ ...prefs });
}

// ============================================================================
// WEEKLY DIGEST PREPARATION
// ============================================================================

/**
 * Calculate next digest date based on preferences
 */
export function getNextDigestDate(): Date {
  const prefs = $emailPreferences.get();
  if (!prefs) {
    // Default: next Sunday at 9 AM
    const next = new Date();
    next.setDate(next.getDate() + (7 - next.getDay()));
    next.setHours(9, 0, 0, 0);
    return next;
  }

  const now = new Date();
  const next = new Date();
  const targetDay = prefs.digestDay; // 0-6 (Sunday-Saturday)
  const [hours, minutes] = prefs.digestTime.split(':').map(Number);

  next.setDate(now.getDate() + ((targetDay + 7 - now.getDay()) % 7));
  next.setHours(hours, minutes, 0, 0);

  // If the time has passed today, move to next week
  if (next <= now) {
    next.setDate(next.getDate() + 7);
  }

  return next;
}

/**
 * Prepare weekly digest data
 * Collects all data needed for the weekly email
 */
export function prepareWeeklyDigest(): WeeklyDigestData | null {
  const prefs = $emailPreferences.get();
  if (!prefs || !prefs.verified) {
    return null;
  }

  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setHours(23, 59, 59, 999);

  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  // Get collection data
  const collectionData = collection.get();
  const weeklyPacks = collectionData.packs.filter(
    (pack) => pack.openedAt >= weekStart && pack.openedAt <= weekEnd
  );

  // Get achievements
  const achievementsData = achievements.get();
  const weeklyAchievements = achievementsData.achievements
    .filter((a) => a.unlockedAt && a.unlockedAt >= weekStart && a.unlockedAt <= weekEnd)
    .map((a) => ({
      id: a.id,
      name: a.name,
      rarity: a.rarity,
    }));

  // Get trades
  const tradeData = tradeStore.get();
  const weeklyTrades = tradeData.tradeHistory.filter(
    (t) => t.completedAt >= weekStart && t.completedAt <= weekEnd
  );

  // Get DadPass progress
  const subscription = dadPassSubscription.get();
  let dadPassProgress = undefined;
  if (subscription && subscription.status === 'active') {
    dadPassProgress = {
      isActive: true,
      currentTier: subscription.currentTier,
      xpEarned: subscription.totalXP,
      rewardsClaimed: subscription.currentTier,
    };
  }

  // Calculate rarity breakdown
  const rarityBreakdown: Record<string, number> = {};
  let holoCount = 0;
  const bestPulls: Array<{
    cardId: string;
    cardName: string;
    rarity: string;
    isHolo: boolean;
  }> = [];

  for (const pack of weeklyPacks) {
    for (const card of pack.cards) {
      rarityBreakdown[card.rarity] = (rarityBreakdown[card.rarity] || 0) + 1;
      if (card.isHolo) holoCount++;

      // Track best pulls (rare+)
      if (['rare', 'epic', 'legendary', 'mythic'].includes(card.rarity)) {
        bestPulls.push({
          cardId: card.id,
          cardName: card.name,
          rarity: card.rarity,
          isHolo: card.isHolo,
        });
      }
    }
  }

  // Sort best pulls by rarity
  bestPulls.sort((a, b) => {
    const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 };
    return rarityOrder[b.rarity as keyof typeof rarityOrder] - rarityOrder[a.rarity as keyof typeof rarityOrder];
  });

  // Get last digest for comparison
  const lastDigest = $lastWeeklyDigest.get();
  let weekOverWeek = {
    packsOpenedChange: 0,
    newAchievements: weeklyAchievements.length,
  };

  if (lastDigest) {
    const lastWeekPacks = lastDigest.packsOpened;
    weekOverWeek.packsOpenedChange =
      lastWeekPacks > 0 ? ((weeklyPacks.length - lastWeekPacks) / lastWeekPacks) * 100 : 0;
  }

  const digest: WeeklyDigestData = {
    weekStart,
    weekEnd,
    userId: 'local_user', // Anonymous user
    email: prefs.email,
    packsOpened: weeklyPacks.length,
    totalCards: weeklyPacks.reduce((sum, pack) => sum + pack.cards.length, 0),
    rarityBreakdown,
    holoCount,
    bestPulls: bestPulls.slice(0, 5), // Top 5 best pulls
    achievementsUnlocked: weeklyAchievements,
    tradesCompleted: weeklyTrades.length,
    tradesReceived: tradeData.receivedTrades.filter(
      (t) => t.createdAt >= weekStart && t.createdAt <= weekEnd
    ).length,
    dadPassProgress,
    weekOverWeek,
    personalizedMessage: generatePersonalizedMessage(weeklyPacks.length, weeklyAchievements.length),
  };

  return digest;
}

/**
 * Generate personalized message based on activity
 */
function generatePersonalizedMessage(packsOpened: number, achievementsUnlocked: number): string {
  if (packsOpened === 0) {
    return "We missed you this week! Come back and open some packs to grow your collection.";
  } else if (packsOpened < 5) {
    return "You're off to a good start this week! Keep opening packs to discover more dads.";
  } else if (packsOpened < 15) {
    return "Great progress this week! You're building an impressive collection.";
  } else {
    return "You're on fire this week! Your dedication to dad card collecting is unmatched.";
  }
}

/**
 * Save weekly digest (for preview/history)
 */
export function saveWeeklyDigest(digest: WeeklyDigestData): void {
  $lastWeeklyDigest.set(digest);
  $emailState.set({
    ...$emailState.get(),
    lastDigest: digest,
    nextDigestDate: getNextDigestDate(),
  });
}

/**
 * Get current weekly digest data
 */
export function getWeeklyDigestData(): WeeklyDigestData | null {
  return $lastWeeklyDigest.get();
}

// ============================================================================
// EMAIL TEMPLATE RENDERING
// ============================================================================

/**
 * Render email template (simulated - in production, this would use a template engine)
 */
export function renderEmailTemplate(
  template: EmailTemplate,
  context: EmailTemplateContext
): RenderedEmail {
  const { recipientName, recipientEmail, unsubscribeUrl, preferencesUrl, siteUrl, data } = context;

  let subject = '';
  let htmlContent = '';
  let textContent = '';
  let previewText = '';

  switch (template) {
    case 'verification':
      subject = 'Verify Your DadDeck Email Address';
      previewText = 'Please verify your email to get started';
      htmlContent = renderVerificationEmail(context);
      textContent = renderVerificationEmailText(context);
      break;

    case 'weekly_digest':
      subject = `Your Weekly DadDeck Digest - ${new Date().toLocaleDateString()}`;
      previewText = 'See your pack opening summary and best pulls';
      htmlContent = renderWeeklyDigestEmail(context);
      textContent = renderWeeklyDigestEmailText(context);
      break;

    case 'trade_offer_received':
      subject = `New Trade Offer from ${data.senderName}`;
      previewText = `${data.senderName} wants to trade with you`;
      htmlContent = renderTradeOfferEmail(context);
      textContent = renderTradeOfferEmailText(context);
      break;

    case 'special_event':
      subject = data.subject || 'Special Event at DadDeck!';
      previewText = data.previewText || "Don't miss out!";
      htmlContent = renderSpecialEventEmail(context);
      textContent = renderSpecialEventEmailText(context);
      break;

    default:
      subject = 'DadDeck Notification';
      previewText = 'You have a new notification';
      htmlContent = renderDefaultEmail(context);
      textContent = renderDefaultEmailText(context);
  }

  return { subject, htmlContent, textContent, previewText };
}

// ============================================================================
// EMAIL TEMPLATE RENDERERS (Simplified HTML generation)
// ============================================================================

function renderVerificationEmail(context: EmailTemplateContext): string {
  const { recipientName, data } = context;
  const code = data.verificationCode || '000000';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: #f5f5f5; padding: 30px; border-radius: 10px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #1e40af; }
    .code { background: #1e40af; color: white; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; letter-spacing: 5px; border-radius: 5px; margin: 30px 0; }
    .button { display: inline-block; background: #fbbf24; color: #1e3a8a; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🎴 DadDeck</div>
      <h1>Verify Your Email Address</h1>
    </div>
    <p>Hi ${recipientName},</p>
    <p>Thanks for signing up for DadDeck! Please use the verification code below to confirm your email address:</p>
    <div class="code">${code}</div>
    <p>This code will expire in 24 hours.</p>
    <p>If you didn't request this verification, please ignore this email.</p>
    <div class="footer">
      <p>DadDeck - The Ultimate White Dad Trading Card Simulator</p>
      <p><a href="${context.preferencesUrl}">Manage Email Preferences</a> | <a href="${context.unsubscribeUrl}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function renderVerificationEmailText(context: EmailTemplateContext): string {
  const { recipientName, data } = context;
  const code = data.verificationCode || '000000';

  return `
DadDeck - Verify Your Email Address

Hi ${recipientName},

Thanks for signing up for DadDeck! Please use the verification code below to confirm your email address:

Verification Code: ${code}

This code will expire in 24 hours.

If you didn't request this verification, please ignore this email.

---
DadDeck - The Ultimate White Dad Trading Card Simulator
Manage preferences: ${context.preferencesUrl}
Unsubscribe: ${context.unsubscribeUrl}
  `.trim();
}

function renderWeeklyDigestEmail(context: EmailTemplateContext): string {
  const { recipientName, data } = context;
  const digest = data.digest as WeeklyDigestData;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Digest</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: #f5f5f5; padding: 30px; border-radius: 10px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #1e40af; }
    .stats { display: flex; gap: 20px; margin: 20px 0; }
    .stat { flex: 1; background: white; padding: 15px; border-radius: 5px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #1e40af; }
    .stat-label { font-size: 12px; color: #666; }
    .card { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #1e40af; }
    .card h3 { margin-top: 0; color: #1e40af; }
    .best-pull { display: flex; align-items: center; gap: 10px; margin: 10px 0; padding: 10px; background: #f9f9f9; border-radius: 5px; }
    .rarity { padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .rarity.common { background: #9ca3af; color: white; }
    .rarity.uncommon { background: #60a5fa; color: white; }
    .rarity.rare { background: #fbbf24; color: #1e3a8a; }
    .rarity.epic { background: #a855f7; color: white; }
    .rarity.legendary { background: #f97316; color: white; }
    .rarity.mythic { background: #ec4899; color: white; }
    .button { display: inline-block; background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🎴 DadDeck Weekly Digest</div>
      <p>${digest.weekStart.toLocaleDateString()} - ${digest.weekEnd.toLocaleDateString()}</p>
    </div>

    ${digest.personalizedMessage ? `<p><em>${digest.personalizedMessage}</em></p>` : ''}

    <div class="stats">
      <div class="stat">
        <div class="stat-value">${digest.packsOpened}</div>
        <div class="stat-label">Packs Opened</div>
      </div>
      <div class="stat">
        <div class="stat-value">${digest.totalCards}</div>
        <div class="stat-label">Total Cards</div>
      </div>
      <div class="stat">
        <div class="stat-value">${digest.holoCount}</div>
        <div class="stat-label">Holo Cards</div>
      </div>
    </div>

    ${digest.bestPulls.length > 0 ? `
    <div class="card">
      <h3>🌟 Your Best Pulls</h3>
      ${digest.bestPulls.map(pull => `
        <div class="best-pull">
          <span>${pull.cardName}</span>
          <span class="rarity ${pull.rarity}">${pull.rarity}</span>
          ${pull.isHolo ? '✨' : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${digest.achievementsUnlocked.length > 0 ? `
    <div class="card">
      <h3>🏆 Achievements Unlocked</h3>
      ${digest.achievementsUnlocked.map(a => `<p>${a.name}</p>`).join('')}
    </div>
    ` : ''}

    ${digest.tradesCompleted > 0 ? `
    <div class="card">
      <h3>🤝 Trades Completed</h3>
      <p>You completed ${digest.tradesCompleted} trade${digest.tradesCompleted > 1 ? 's' : ''} this week!</p>
    </div>
    ` : ''}

    <div style="text-align: center; margin: 30px 0;">
      <a href="${context.siteUrl}" class="button">Open More Packs</a>
    </div>

    <div class="footer">
      <p>DadDeck - The Ultimate White Dad Trading Card Simulator</p>
      <p><a href="${context.preferencesUrl}">Manage Email Preferences</a> | <a href="${context.unsubscribeUrl}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function renderWeeklyDigestEmailText(context: EmailTemplateContext): string {
  const { data, siteUrl, preferencesUrl, unsubscribeUrl } = context;
  const digest = data.digest as WeeklyDigestData;

  return `
DadDeck Weekly Digest
${digest.weekStart.toLocaleDateString()} - ${digest.weekEnd.toLocaleDateString()}

${digest.personalizedMessage || ''}

YOUR WEEKLY STATS:
- Packs Opened: ${digest.packsOpened}
- Total Cards: ${digest.totalCards}
- Holo Cards: ${digest.holoCount}

${digest.bestPulls.length > 0 ? `
BEST PULLS:
${digest.bestPulls.map(p => `- ${p.cardName} (${p.rarity}${p.isHolo ? ' Holo' : ''})`).join('\n')}
` : ''}

${digest.achievementsUnlocked.length > 0 ? `
ACHIEVEMENTS UNLOCKED:
${digest.achievementsUnlocked.map(a => `- ${a.name}`).join('\n')}
` : ''}

${digest.tradesCompleted > 0 ? `TRADES: ${digest.tradesCompleted} completed` : ''}

Open more packs: ${siteUrl}

---
DadDeck - The Ultimate White Dad Trading Card Simulator
Manage preferences: ${preferencesUrl}
Unsubscribe: ${unsubscribeUrl}
  `.trim();
}

function renderTradeOfferEmail(context: EmailTemplateContext): string {
  const { recipientName, data } = context;
  const tradeData = data as TradeOfferEmailData;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Trade Offer</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: #f5f5f5; padding: 30px; border-radius: 10px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #1e40af; }
    .trade-card { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .cards-list { margin: 15px 0; }
    .card-item { display: flex; align-items: center; gap: 10px; margin: 10px 0; padding: 10px; background: #f9f9f9; border-radius: 5px; }
    .rarity { padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .rarity.common { background: #9ca3af; color: white; }
    .rarity.uncommon { background: #60a5fa; color: white; }
    .rarity.rare { background: #fbbf24; color: #1e3a8a; }
    .rarity.epic { background: #a855f7; color: white; }
    .rarity.legendary { background: #f97316; color: white; }
    .rarity.mythic { background: #ec4899; color: white; }
    .button { display: inline-block; background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .expires { color: #dc2626; font-weight: bold; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🎴 DadDeck</div>
      <h1>New Trade Offer!</h1>
    </div>

    <p>Hi ${recipientName},</p>
    <p><strong>${tradeData.senderName}</strong> sent you a trade offer!</p>

    <div class="trade-card">
      <h3>📤 Cards They Offer (${tradeData.offeredCards.length})</h3>
      <div class="cards-list">
        ${tradeData.offeredCards.map(card => `
          <div class="card-item">
            <span>${card.name}</span>
            <span class="rarity ${card.rarity}">${card.rarity}</span>
            ${card.isHolo ? '✨' : ''}
          </div>
        `).join('')}
      </div>
    </div>

    <div class="trade-card">
      <h3>📥 Cards They Want (${tradeData.requestedCards.length})</h3>
      <div class="cards-list">
        ${tradeData.requestedCards.map(card => `
          <div class="card-item">
            <span>${card.name}</span>
            <span class="rarity ${card.rarity}">${card.rarity}</span>
            ${card.isHolo ? '✨' : ''}
          </div>
        `).join('')}
      </div>
    </div>

    ${tradeData.message ? `<p><strong>Message:</strong> "${tradeData.message}"</p>` : ''}

    <p class="expires">⚠️ This offer expires on ${tradeData.expiresAt.toLocaleDateString()}</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${tradeData.tradeUrl}" class="button">View Trade Offer</a>
    </div>

    <div class="footer">
      <p>DadDeck - The Ultimate White Dad Trading Card Simulator</p>
      <p><a href="${context.preferencesUrl}">Manage Email Preferences</a> | <a href="${tradeData.unsubscribeUrl}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function renderTradeOfferEmailText(context: EmailTemplateContext): string {
  const { recipientName, data, preferencesUrl, unsubscribeUrl } = context;
  const tradeData = data as TradeOfferEmailData;

  return `
DadDeck - New Trade Offer!

Hi ${recipientName},

${tradeData.senderName} sent you a trade offer!

CARDS THEY OFFER (${tradeData.offeredCards.length}):
${tradeData.offeredCards.map(c => `- ${c.name} (${c.rarity}${c.isHolo ? ' Holo' : ''})`).join('\n')}

CARDS THEY WANT (${tradeData.requestedCards.length}):
${tradeData.requestedCards.map(c => `- ${c.name} (${c.rarity}${c.isHolo ? ' Holo' : ''})`).join('\n')}

${tradeData.message ? `Message: "${tradeData.message}"\n` : ''}⚠️ This offer expires on ${tradeData.expiresAt.toLocaleDateString()}

View trade: ${tradeData.tradeUrl}

---
DadDeck - The Ultimate White Dad Trading Card Simulator
Manage preferences: ${preferencesUrl}
Unsubscribe: ${unsubscribeUrl}
  `.trim();
}

function renderSpecialEventEmail(context: EmailTemplateContext): string {
  const { recipientName, data } = context;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Special Event</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); padding: 30px; border-radius: 10px; }
    .content { background: white; padding: 30px; border-radius: 10px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #1e40af; }
    .button { display: inline-block; background: #fbbf24; color: #1e3a8a; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <div class="header">
        <div class="logo">🎴 DadDeck</div>
        <h1>${data.title || 'Special Event!'}</h1>
      </div>

      <p>Hi ${recipientName},</p>
      <p>${data.description || 'We have an exciting announcement!'}</p>

      ${data.imageUrl ? `<img src="${data.imageUrl}" alt="Event" style="max-width: 100%; border-radius: 10px; margin: 20px 0;">` : ''}

      ${data.startDate ? `<p><strong>When:</strong> ${new Date(data.startDate).toLocaleDateString()}</p>` : ''}
      ${data.endDate ? `<p><strong>Until:</strong> ${new Date(data.endDate).toLocaleDateString()}</p>` : ''}

      ${data.cta ? `<div style="text-align: center; margin: 30px 0;"><a href="${data.cta.url}" class="button">${data.cta.label}</a></div>` : ''}

      <div class="footer">
        <p>DadDeck - The Ultimate White Dad Trading Card Simulator</p>
        <p><a href="${context.preferencesUrl}">Manage Email Preferences</a> | <a href="${context.unsubscribeUrl}">Unsubscribe</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function renderSpecialEventEmailText(context: EmailTemplateContext): string {
  const { recipientName, data, siteUrl, preferencesUrl, unsubscribeUrl } = context;

  return `
DadDeck - ${data.title || 'Special Event!'}

Hi ${recipientName},

${data.description || 'We have an exciting announcement!'}

${data.startDate ? `When: ${new Date(data.startDate).toLocaleDateString()}` : ''}
${data.endDate ? `Until: ${new Date(data.endDate).toLocaleDateString()}` : ''}

${data.cta ? `${data.cta.label}: ${data.cta.url}` : ''}

Learn more: ${siteUrl}

---
DadDeck - The Ultimate White Dad Trading Card Simulator
Manage preferences: ${preferencesUrl}
Unsubscribe: ${unsubscribeUrl}
  `.trim();
}

function renderDefaultEmail(context: EmailTemplateContext): string {
  const { recipientName, preferencesUrl, unsubscribeUrl } = context;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DadDeck Notification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f5f5f5; padding: 30px; border-radius: 10px;">
    <h1 style="color: #1e40af;">🎴 DadDeck</h1>
    <p>Hi ${recipientName},</p>
    <p>You have a new notification at DadDeck.</p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
      <p>DadDeck - The Ultimate White Dad Trading Card Simulator</p>
      <p><a href="${preferencesUrl}">Manage Email Preferences</a> | <a href="${unsubscribeUrl}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function renderDefaultEmailText(context: EmailTemplateContext): string {
  const { recipientName, preferencesUrl, unsubscribeUrl } = context;

  return `
DadDeck Notification

Hi ${recipientName},

You have a new notification at DadDeck.

---
DadDeck - The Ultimate White Dad Trading Card Simulator
Manage preferences: ${preferencesUrl}
Unsubscribe: ${unsubscribeUrl}
  `.trim();
}

// ============================================================================
// EMAIL SENDING (Simulated)
// ============================================================================

/**
 * Send weekly digest email (simulated)
 * In production, this would call an API endpoint that sends the actual email
 */
export async function sendWeeklyDigest(): Promise<{ success: boolean; error?: string }> {
  const prefs = $emailPreferences.get();
  if (!prefs || !prefs.verified || !prefs.weeklyDigestEnabled) {
    return { success: false, error: 'Email not verified or weekly digest disabled' };
  }

  const digest = prepareWeeklyDigest();
  if (!digest) {
    return { success: false, error: 'Could not prepare digest' };
  }

  // Render email
  const rendered = renderEmailTemplate('weekly_digest', {
    recipientName: prefs.email.split('@')[0],
    recipientEmail: prefs.email,
    unsubscribeUrl: getUnsubscribeUrl(prefs.unsubscribeToken),
    preferencesUrl: getPreferencesUrl(),
    siteUrl: window.location.origin,
    data: { digest },
  });

  // Simulate sending (log to console)
  console.log('[Email System] Weekly digest prepared for:', prefs.email);
  console.log('[Email System] Subject:', rendered.subject);
  console.log('[Email System] Digest data:', digest);

  // Save digest
  saveWeeklyDigest(digest);

  // Update last sent timestamp
  prefs.lastEmailSentAt = new Date();
  $emailPreferences.set({ ...prefs });

  return { success: true };
}

/**
 * Send trade offer notification email (simulated)
 */
export async function sendTradeOfferEmail(
  tradeData: TradeOfferEmailData
): Promise<{ success: boolean; error?: string }> {
  const prefs = $emailPreferences.get();
  if (!prefs || !prefs.verified || !prefs.tradeOfferEnabled) {
    return { success: false, error: 'Email not verified or trade notifications disabled' };
  }

  // Render email
  const rendered = renderEmailTemplate('trade_offer_received', {
    recipientName: prefs.email.split('@')[0],
    recipientEmail: prefs.email,
    unsubscribeUrl: getUnsubscribeUrl(prefs.unsubscribeToken),
    preferencesUrl: getPreferencesUrl(),
    siteUrl: window.location.origin,
    data: tradeData,
  });

  // Simulate sending
  console.log('[Email System] Trade offer email prepared for:', prefs.email);
  console.log('[Email System] Subject:', rendered.subject);

  return { success: true };
}

/**
 * Send special event announcement email (simulated)
 */
export async function sendSpecialEventEmail(
  announcement: {
    title: string;
    description: string;
    startDate?: Date;
    endDate?: Date;
    imageUrl?: string;
    cta?: { label: string; url: string };
  }
): Promise<{ success: boolean; error?: string }> {
  const prefs = $emailPreferences.get();
  if (!prefs || !prefs.verified || !prefs.specialEventEnabled) {
    return { success: false, error: 'Email not verified or special events disabled' };
  }

  // Render email
  const rendered = renderEmailTemplate('special_event', {
    recipientName: prefs.email.split('@')[0],
    recipientEmail: prefs.email,
    unsubscribeUrl: getUnsubscribeUrl(prefs.unsubscribeToken),
    preferencesUrl: getPreferencesUrl(),
    siteUrl: window.location.origin,
    data: announcement,
  });

  // Simulate sending
  console.log('[Email System] Special event email prepared for:', prefs.email);
  console.log('[Email System] Subject:', rendered.subject);

  return { success: true };
}

// ============================================================================
// EMAIL EXPORT/IMPORT FOR UNFURL/URL SHARING
// ============================================================================

/**
 * Export email digest data as JSON (for sharing/debugging)
 */
export function exportDigestData(digest: WeeklyDigestData): string {
  return JSON.stringify(digest, null, 2);
}

/**
 * Get email digest as shareable URL (for unfurl-like functionality)
 */
export function getDigestShareUrl(digest: WeeklyDigestData): string {
  const encoded = btoa(JSON.stringify(digest));
  return `${window.location.origin}/digest?data=${encoded}`;
}
