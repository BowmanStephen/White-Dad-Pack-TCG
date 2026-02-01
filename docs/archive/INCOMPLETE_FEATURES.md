# Incomplete Features & TODO Items

## High Priority - Core Functionality

### 1. Stripe Payment Integration
**Status:** Incomplete  
**Impact:** Premium pack purchases cannot be processed

#### 1.1 Create Stripe Checkout Session
- **File:** [src/stores/premium.ts](file:///Users/stephen_bowman/Documents/GitHub/_work/White\ Dad\ Pack\ TCG/src/stores/premium.ts#L170)
- **Line:** 170
- **Function:** `initializePurchase()`
- **Issue:** Placeholder throws error instead of creating checkout session
- **What's Needed:**
  - Backend API route: `POST /api/stripe/create-checkout`
  - Accept: `packConfigId`, `sessionId`
  - Return: `checkoutUrl` for redirect
  - Integrate with Stripe API
- **Current Code:**
  ```typescript
  throw new Error('Stripe checkout not yet implemented. Add backend API route first.');
  ```

#### 1.2 Verify Stripe Checkout Success
- **File:** [src/stores/premium.ts](file:///Users/stephen_bowman/Documents/GitHub/_work/White\ Dad\ Pack\ TCG/src/stores/premium.ts#L232)
- **Line:** 232
- **Function:** `handleStripeSuccess(checkoutSessionId: string)`
- **Issue:** Verification logic not implemented
- **What's Needed:**
  - Backend API route: `POST /api/stripe/verify-session`
  - Accept: `checkoutSessionId`
  - Return: `{ packConfigId, validated }`
  - Validate payment intent with Stripe
  - Mark purchase as verified in database

#### 1.3 Server-Side Receipt Validation
- **File:** [src/stores/premium.ts](file:///Users/stephen_bowman/Documents/GitHub/_work/White\ Dad\ Pack\ TCG/src/stores/premium.ts#L285)
- **Line:** 285
- **Function:** `validateReceipt(sessionId: string)`
- **Issue:** Receipt validation not implemented
- **What's Needed:**
  - Backend API route: `POST /api/stripe/validate-receipt`
  - Verify Stripe payment intent
  - Validate payment amount matches expected price
  - Return signed receipt
  - Security: Must verify server-side (not trusted from client)

---

## Medium Priority - Feature Completion

### 2. Daddy Pass Reward System
- **File:** [src/stores/daddypass.ts](file:///Users/stephen_bowman/Documents/GitHub/_work/White\ Dad\ Pack\ TCG/src/stores/daddypass.ts#L290)
- **Line:** 290
- **Function:** `claimReward(rewardId: string)`
- **Case:** `'exclusive_card'`
- **Issue:** Exclusive card reward not integrated with collection system
- **What's Needed:**
  - When exclusive card reward is claimed
  - Add card to user's collection
  - Update collection stats
  - Possibly trigger notification
- **Current Code:**
  ```typescript
  case 'exclusive_card':
    // TODO: Add exclusive card to collection
    // This would integrate with the collection system
    break;
  ```

---

## Low Priority - UI/UX Enhancements

### 3. Card Navigation in Pack Revealer
- **File:** [src/components/pack/CardRevealer.svelte](file:///Users/stephen_bowman/Documents/GitHub/_work/White\ Dad\ Pack\ TCG/src/components/pack/CardRevealer.svelte#L429)
- **Line:** 429
- **Component:** Card indicator buttons
- **Issue:** Clicking card indicator buttons doesn't navigate to card
- **What's Needed:**
  - Implement `goToCard()` function or dispatcher
  - Allow users to click indicator dots to jump to specific card
  - Update animation/scroll to selected card
- **Current Code:**
  ```typescript
  on:click={() => dispatch('next') /* TODO: implement goToCard */}
  ```

---

## Summary

| Priority | Feature | Type | Blocker |
|----------|---------|------|---------|
| High | Stripe Checkout | Backend API | Yes |
| High | Stripe Verification | Backend API | Yes |
| High | Receipt Validation | Backend API | Yes |
| Medium | Exclusive Card Reward | Integration | No |
| Low | Card Navigation | UI | No |

### Total Issues: 5
- **Critical (blocking):** 3
- **Implementation needed:** 2
- **Enhancement:** 1

---

## Notes

1. **Stripe Integration** - All three Stripe functions need backend implementation before premium features can work
2. **Testing** - Recommend setting up Stripe test mode for development
3. **Security** - Receipt validation MUST be server-side; never trust client-side payment verification
4. **Dependencies** - Exclusive card feature depends on collection system (already implemented)
