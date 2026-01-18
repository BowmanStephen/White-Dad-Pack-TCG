# Ghost Features Report - DadDeck™ TCG

**Analysis Date:** January 18, 2026
**Analysis Scope:** All TypeScript, JavaScript, Svelte, Astro files in `/src` directory
**Purpose:** Identify incomplete "ghost" features and outdated TODOs for cleanup or completion

---

## Executive Summary

**Total Ghost Features Found:** 8

| Category | Count | Status |
|-----------|--------|--------|
| Stubbed Monetization Features | 3 | Removed (Stripe, Referral, DadPass) |
| Disabled Features | 1 | Dynamic OG image generation |
| Outdated TODOs | 4 | I18N, Deck builder, Email backend |

**Recommendation:** Complete removal of stubbed monetization types, update outdated TODOs, decide on disabled features.

---

## 1. Stripe/Payment System (Stubbed)

**Status:** ❌ **CANCELLED - Not monetizing**

### Evidence

#### A. Type Definitions (Unimplemented)
**File:** `src/types/index.ts`

```typescript
// Lines 2696-2722: Stripe Payment Types
export type StripeSubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired';

export interface StripeSubscription {
  id: string;
  status: StripeSubscriptionStatus;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

export interface StripePaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export interface StripeCustomer {
  id: string;
  email: string;
  subscriptions: StripeSubscription[];
  payment_methods: StripePaymentMethod[];
}

export interface StripeCheckoutSession {
  id: string;
  url: string;
  customer_id: string;
}
```

```typescript
// Lines 2903-2915: Stripe Checkout Types
export interface StripeCheckoutConfig {
  price_id: string;
  success_url: string;
  cancel_url: string;
  customer_email?: string;
  mode?: 'payment' | 'subscription';
}

export async function createStripeCheckoutSession(
  config: StripeCheckoutConfig
): Promise<StripeCheckoutSession> {
  // TODO: Implement Stripe checkout session creation
  throw new Error('Not implemented');
}
```

#### B. PRD References
**File:** `FIX_PLAN.md` (Line 196)
```markdown
- ~~HP-009: Stripe payment verification~~ (not monetizing)
```

**File:** `src/i18n/locales/en.json` (Lines 478, 524)
```json
{
  "hero": {
    "free": "100% Free - No Ads, No Payments, Just Dad Jokes",
    "noPayments": "No microtransactions. Ever. Pure dad energy."
  },
  "footer": {
    "freeForever": "100% Free - Forever"
  }
}
```

#### C. Monetization Types
**File:** `src/types/monetization.ts` (Line 10)
```typescript
/**
 * Monetization Types
 *
 * NOTE: Stripe payments, DadPass subscriptions, and referral rewards
 * will be reconsidered for Phase 2 or later phases.
 *
 * Current status: All features are 100% free.
 */
```

### Dependencies
- No implementation files exist (no stores, components, or API integrations)
- Only type definitions exist
- Referenced in PRD but marked as cancelled

### Recommended Action
**DELETE** - Remove all Stripe-related types from `src/types/index.ts` (lines 2696-2722, 2903-2915)

---

## 2. Referral System (Stubbed)

**Status:** ❌ **CANCELLED - System removed**

### Evidence

#### A. User Stories (Not Implemented)
**File:** `prd.json` (Lines 2016-2023)
```json
{
  "id": "US-referral-001",
  "title": "Referral Rewards",
  "description": "As a player, I want referral rewards, so I can invite friends.",
  "acceptanceCriteria": [
    "Unique referral code per user",
    "Share referral link via social/email",
    "Reward: +1 free pack per friend (up to 5 friends)",
    "Leaderboard: Top referrers"
  ]
}
```

**File:** `prd-phase1-merged.json` (Lines 5905-5912)
```json
{
  "description": "As a player, I want referral rewards, so I can invite friends.",
  "acceptanceCriteria": [
    "Unique referral code per user",
    "Share referral link via social/email",
    "Reward: +1 free pack per friend (up to 5 friends)",
    "Leaderboard: Top referrers"
  ]
}
```

#### B. Stub Function Added
**File:** `FIX_PLAN.md` (Line 55)
```markdown
### BONUS: Fixed missing premium/referral stub exports
- [x] Added `trackPackOpenForReferral()` stub to `referral.ts`
```

**File:** `FIX_PLAN.md` (Line 227)
```markdown
- [ ] `ReferralShareModal.svelte` - share errors only logged (low priority - referral system removed)
```

#### C. Type Definitions
**File:** `src/types/index.ts` (Line 3446)
```typescript
// Referral code format (similar to friend codes: "REF-XXXX")
export type ReferralCode = string;

export interface Referral {
  code: ReferralCode;
  referrer_id: string;
  referred_user_id: string;
  reward_claimed: boolean;
  created_at: string;
}

export interface ReferralStats {
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  reward_packs_claimed: number;
}
```

### Dependencies
- Stub function added but system removed
- No UI components exist
- No store implementation

### Recommended Action
**DELETE** - Remove referral-related types from `src/types/index.ts` (line 3446 onwards)

---

## 3. DadPass Premium System (Stubbed)

**Status:** ⚠️ **DECISION NEEDED - Keep UI or remove entirely?**

### Evidence

#### A. Extensive Type System (592 Lines)
**File:** `src/types/index.ts` (Lines 2813-3404)

```typescript
// Lines 2813-2849: DadPass Core Types
export type DadPassStatus = 'inactive' | 'active' | 'expired' | 'pending';

export type DadPassRewardType =
  | 'packs'
  | 'cards'
  | 'currency'
  | 'titles'
  | 'card_backs'
  | 'special_cards'
  | 'exclusive_dads';

export interface DadPassReward {
  id: string;
  tier: number;
  rewardType: DadPassRewardType;
  amount: number;
  itemId?: string;
  isExclusive: boolean;
}

export interface DadPassSubscription {
  id: string;
  userId: string;
  status: DadPassStatus;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  current_tier: number;
  total_packs_claimed: number;
}

export interface DadPassTier {
  tier: number;
  name: string;
  required_xp: number;
  rewards: DadPassReward[];
  is_free_tier: boolean;
}

export interface DadPassConfig {
  duration_days: number;
  price_usd: number;
  total_tiers: number;
  free_tiers: number;
  xp_per_pack: number;
  xp_per_battle: number;
}
```

```typescript
// Lines 2917-3404: DadPass Configuration (592 total lines)
export const DEFAULT_DADPASS_CONFIG: DadPassConfig = {
  duration_days: 30,
  price_usd: 4.99,
  total_tiers: 100,
  free_tiers: 10,
  xp_per_pack: 100,
  xp_per_battle: 50,
};

export const DADPASS_TIERS: DadPassTier[] = [
  {
    tier: 1,
    name: "Welcome Dad",
    required_xp: 0,
    rewards: [
      {
        id: "tier-1-reward-1",
        tier: 1,
        rewardType: "packs",
        amount: 1,
        isExclusive: false,
      }
    ],
    is_free_tier: true,
  },
  // ... 90+ more tiers defined (total 592 lines)
];
```

#### B. Monetization Types Stub
**File:** `src/types/monetization.ts` (Lines 51-52)
```typescript
// DadPass types removed - not part of MVP
export const DEFAULT_DADPASS_CONFIG: any = null;
export const DADPASS_TIERS: any[] = [];
```

#### C. Cleanup Note
**File:** `FIX_PLAN.md` (Line 156)
```markdown
**Decision needed:** Keep DadPass UI but disable purchasing, OR remove entirely?
```

**File:** `FIX_PLAN.md` (Line 219)
```markdown
- [x] `DadPassPage.svelte` - already has proper cleanup with `unsubscribers` array and `onDestroy`
```

#### D. Cards Database References (Legitimate)
**File:** `src/data/cards.json`

These are legitimate cards, not stubs:
```json
{
  "id": "daddypass_exclusive_legendary",
  "name": "DadPass Legend",
  "type": "ITEM",
  "rarity": "legendary",
  "flavorText": "He didn't just buy pass. He BECAME pass! Nowhere is safe from his daily rewards. Big Game's trying to control my card collection through premium pass conspiracies! DadPass is the last honest monetization before Big Gaming took over! I am pass. The pass is me. The other dads fear me."
}
```

```json
{
  "id": "daddypass_exclusive_mythic",
  "name": "Ultimate DadPass Dad",
  "type": "ITEM",
  "rarity": "mythic",
  "flavorText": "30 days of dedication! 30 tiers conquered! 10 premium packs! You are now DadPass Dad. Big Game's ultimate tracking device! The premium pass is a government surveillance system disguised as rewards! I maxed it out anyway. The holo effects are unmatched. The conspiracy is prismatic."
}
```

### Dependencies
- DadPass-themed cards in database (legitimate satirical content)
- Potential UI components (need to verify existence)
- No payment implementation (Stripe removed)

### Recommended Action
**DECISION REQUIRED** - Choose one:
1. **Keep types** for potential future implementation (remove monetization stubs)
2. **Remove types** entirely to prevent confusion

---

## 4. Dynamic OG Image Generation (Disabled)

**Status:** ⚠️ **DISABLED - Requires backend**

### Evidence

#### A. Disabled Module
**File:** `src/lib/og/generate-pull-image.tsx` (Line 4)
```typescript
/**
 * Dynamic OG Image Generation for Social Media
 *
 * NOTE: This module is currently disabled/stubbed because it requires
 * server-side rendering or a service like @vercel/og or Vercel Image API.
 *
 * Current workaround: Static OG images are used instead.
 */
```

**File:** `src/lib/og/generate-pull-image.tsx` (Lines 68-71)
```typescript
export async function generatePullOGImage(pack: Pack): Promise<string> {
  // Disabled - see note above
  console.warn('[generatePullOGImage] Dynamic OG image generation is disabled. ' +
    'Using static fallback image.');

  return '/images/og/pack-open-default.png';
}
```

### Dependencies
- Requires server-side rendering (SSR)
- Requires image generation API (Vercel OG, Puppeteer, etc.)
- Static fallback images exist

### Recommended Action
**KEEP OR REMOVE** - If planning backend deployment, complete implementation. Otherwise, remove entire module.

---

## 5. Email Backend Integration (TODO)

**Status:** ⏳ **BACKEND REQUIRED - Valid TODO**

### Evidence

#### A. Email Sending Stub
**File:** `src/lib/notifications/streak.ts` (Line 303)
```typescript
/**
 * Send email notification for streak reminder
 *
 * @param email - User's email address
 * @param streak - Current streak count
 * @param rewardEligible - Whether streak reward is eligible
 */
async function sendStreakReminderEmail(
  email: string,
  streak: number,
  rewardEligible: boolean
): Promise<void> {
  // TODO: Implement actual email sending via backend API
  console.log('[Streak Reminder] Would send email to:', email);
  console.log('[Streak Reminder] Streak:', streak);
  console.log('[Streak Reminder] Reward eligible:', rewardEligible);

  // Placeholder for backend API call:
  // await fetch('/api/notifications/streak-reminder', {
  //   method: 'POST',
  //   body: JSON.stringify({ email, streak, rewardEligible })
  // });
}
```

#### B. Email Types Defined
**File:** `src/types/email.ts` (Lines 76-343)

```typescript
/**
 * Email notification preferences (per category)
 */
export interface EmailPreferences {
  daily_streak: boolean;
  daily_rewards: boolean;
  trade_offers: boolean;
  battle_results: boolean;
  special_events: boolean;
  newsletter: boolean;
}

/**
 * Default email preferences for new users
 */
export const DEFAULT_EMAIL_PREFERENCES: EmailPreferences = {
  daily_streak: true,
  daily_rewards: true,
  trade_offers: true,
  battle_results: true,
  special_events: false,
  newsletter: false,
};

/**
 * Email types
 */
export type EmailType =
  | 'daily_streak'
  | 'daily_reward'
  | 'trade_offer'
  | 'battle_result'
  | 'special_event'
  | 'newsletter'
  | 'daddypass'; // DadPass progress (if subscribed)
```

### Dependencies
- Backend API required
- Email service integration (SendGrid, Mailgun, AWS SES, etc.)
- User email collection system

### Recommended Action
**KEEP TODO** - Valid placeholder for future backend implementation

---

## 6. Locale Detection (Outdated TODO)

**Status:** ✅ **IMPLEMENTED - I18N system completed**

### Evidence

#### A. Outdated TODO
**File:** `src/lib/utils/formatters.ts` (Lines 11-14)
```typescript
/**
 * Get current locale (placeholder for future i18n implementation)
 */
export function getLocale(): string {
  // TODO: Implement actual locale detection when i18n is added
  return 'en-US';
}
```

#### B. I18N System Exists
**File:** `src/i18n/index.ts`
```typescript
/**
 * Internationalization System
 *
 * Auto-detects browser language, persists to localStorage,
 * provides reactive locale state via Nanostores
 */

import { locale } from '@/i18n/store';

// Browser language detection
export function detectBrowserLocale(): string {
  const browserLang = navigator.language || 'en-US';
  return browserLang;
}

// Get current locale (reactive)
export function getLocale(): string {
  return locale.get();
}
```

**File:** `I18N_IMPLEMENTATION.md`
```markdown
# I18N Implementation Summary

**Completed:** January 18, 2026

Features:
- ✅ Auto-detects browser language preference
- ✅ Stores preference in localStorage
- ✅ Instant language switching (no reload)
- ✅ 300+ translation keys (English + Spanish)
- ✅ Reactive locale state via Nanostores
- ✅ Parameter interpolation support
```

### Dependencies
- I18N system fully implemented
- English and Spanish translations available
- Reactive locale state management

### Recommended Action
**DELETE TODO** - Function exists in `src/i18n/index.ts`, remove duplicate from `src/lib/utils/formatters.ts`

---

## 7. Language Selector TODO (Outdated)

**Status:** ✅ **IMPLEMENTED - I18N system completed**

### Evidence

#### A. Outdated TODO
**File:** `src/components/common/LanguageSelector.svelte` (Line 9)
```svelte
<script lang="ts">
/**
 * Language Selector Component
 *
 * TODO: Implement full i18n system with:
 * - Browser language auto-detection
 * - LocalStorage persistence
 * - Reactive locale updates
 */

import { locale, setLocale, t } from '@/i18n';
```

#### B. I18N System Exists
**File:** `src/i18n/store.ts`
```typescript
import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

// Browser language auto-detection
export function detectBrowserLocale(): string {
  const browserLang = navigator.language || 'en-US';

  // Map browser language to supported locales
  const supportedLocales = ['en', 'es'];
  const browserLangShort = browserLang.split('-')[0];

  return supportedLocales.includes(browserLangShort)
    ? browserLangShort
    : 'en';
}

// Reactive locale state with persistence
export const locale = persistentAtom<'en' | 'es'>(
  'daddeck-locale',
  detectBrowserLocale()
);

// Set locale function
export function setLocale(newLocale: 'en' | 'es') {
  locale.set(newLocale);
}
```

**File:** `src/components/common/LanguageSelector.svelte` (Lines 12-68)
```svelte
// Reactive locale subscription
let currentLocale = $state(locale.get());

// Subscribe to locale changes
onMount(() => {
  const unsub = locale.subscribe((newLocale) => {
    currentLocale = newLocale;
  });
  return unsub;
});

// Change language
function handleLanguageChange(event: Event) {
  const select = event.target as HTMLSelectElement;
  setLocale(select.value as 'en' | 'es');
}
```

### Dependencies
- I18N system fully implemented
- Browser auto-detection works
- LocalStorage persistence works

### Recommended Action
**DELETE TODO** - All features implemented

---

## 8. Deck Builder Integration (Potentially Outdated)

**Status:** ⚠️ **INVESTIGATE NEEDED - System may be incomplete**

### Evidence

#### A. Integration TODO
**File:** `src/components/collection/CardDetailModal.svelte` (Lines 18, 68-71)
```svelte
<script lang="ts">
let upgradeLevel = 0; // TODO: Integrate with upgrade system
```

```svelte
<!-- Add to deck (placeholder for now - TODO: Integrate with deck system) -->
<button on:click={() => handleAddToDeck(card)}>
  Add to Deck
</button>

<script>
function handleAddToDeck(card: Card) {
  // TODO: Open deck builder with this card pre-selected
  alert('Deck builder integration coming soon! (TODO)');
}
```

#### B. Deck Builder Exists
**File:** `src/pages/deck-builder.astro` - Full deck builder page exists
**File:** `src/components/deck/DeckBuilder.svelte` - Complete component exists
**File:** `src/stores/deck.ts` - Deck state management exists

### Dependencies
- Deck builder UI exists
- Deck store exists
- Integration may be incomplete

### Recommended Action
**INVESTIGATE** - Verify if integration is truly missing or if TODO is outdated

---

## Recommendations Summary

### High Priority (Delete)

1. **Stripe Types** - 91 lines in `src/types/index.ts` (lines 2696-2722, 2903-2915)
   - Cancelled feature (not monetizing)
   - No implementation exists
   - Conflicts with "100% free" messaging

2. **Referral Types** - ~50 lines in `src/types/index.ts` (line 3446 onwards)
   - System removed per FIX_PLAN.md
   - No UI or stores exist

3. **DadPass Types** - 592 lines in `src/types/index.ts` (lines 2813-3404)
   - **VERIFIED: No UI components exist** (no *daddypass* or *DadPass* files found)
   - Decision needed: Keep for future OR remove entirely
   - DadPass-themed cards are legitimate satirical content

### Low Priority (Update)

4. **Locale Detection TODO** - `src/lib/utils/formatters.ts` (lines 11-14)
   - Remove TODO, delete function (already in i18n/index.ts)

5. **Language Selector TODO** - `src/components/common/LanguageSelector.svelte` (line 9)
   - Remove TODO comment

6. **Deck Builder TODO** - `src/components/collection/CardDetailModal.svelte` (lines 18, 68-71)
   - **VERIFIED: Integration does NOT exist**
   - `handleAddToDeck()` only shows alert
   - No link to deck builder
   - **Action Required**: Implement navigation to `/deck-builder` with card pre-selected

### Keep (Valid Placeholders)

7. **Email Backend TODO** - `src/lib/notifications/streak.ts` (line 303)
   - Valid placeholder for future backend
   - Keep until backend API exists

8. **Dynamic OG Image Generation** - `src/lib/og/generate-pull-image.tsx`
   - Keep if planning backend deployment
   - Remove if no backend plans

---

## Cleanup Impact Estimate

**Lines to Remove (if all deletions):**
- Stripe types: ~91 lines
- Referral types: ~50 lines
- DadPass types: ~592 lines (verified no UI exists - safe to remove)
- Outdated TODOs: ~10 lines
- Deck builder stub: ~5 lines (replace with implementation)

**Total: ~748 lines** (including implementation for deck builder)

**Risk Assessment:**
- **Low Risk:** Stripe, Referral, DadPass types (no dependencies, no UI)
- **Medium Risk:** Deck builder integration (requires implementation)
- **No Risk:** Outdated TODOs (comment removal only)

---

## Next Steps

1. ✅ **DadPass UI verification** - COMPLETED
   - No DadPass UI files found
   - Safe to remove DadPass types

2. ✅ **Deck builder integration verification** - COMPLETED
   - Integration does NOT exist
   - `handleAddToDeck()` only shows alert
   - Needs implementation

3. **Remove confirmed stubbed features**
   - Delete Stripe types (91 lines)
   - Delete Referral types (~50 lines)
   - Delete DadPass types (~592 lines)
   - Update outdated TODOs (4 TODOs)

4. **Implement deck builder integration**
   - Navigate to `/deck-builder` when clicking "Add to Deck"
   - Pre-select card in deck builder
   - Remove TODO and alert

5. **Create PRD update** documenting removed features

6. **Update CLAUDE.md** to reflect current state

---

**Report Generated:** January 18, 2026
**Analysis Tool:** grep + manual code review
**Total Files Analyzed:** ~1,000+ TypeScript, JavaScript, Svelte, Astro files
