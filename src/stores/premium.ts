/**
 * Premium Pack Store (US093 - Monetization - Premium Packs)
 *
 * Manages premium pack purchases, inventory, and Stripe integration
 */

import { atom, map } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type {
  PackType,
  PremiumPackConfig,
  PurchaseSession,
  PremiumPackInventory,
  StripeCheckoutSession,
  ReceiptValidation,
} from '../types';
import { PREMIUM_PACK_CONFIGS } from '../types';

// ============================================================================
// STATE
// ============================================================================

// Current pack type being opened (standard or premium)
export const currentPackType = atom<PackType>('standard');

// Premium pack inventory (persisted to localStorage)
export const premiumInventory = persistentAtom<PremiumPackInventory>('premium-inventory', {
  availablePacks: [],
  purchaseHistory: [],
  totalPacksPurchased: 0,
  totalSpent: 0,
} as PremiumPackInventory);

// Active purchase session
export const purchaseSession = map<{ data: PurchaseSession | null }>({ data: null });

// Purchase UI state
export const purchaseUI = map({
  isCheckoutOpen: false,
  isProcessing: false,
  error: null as string | null,
  success: false,
});

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Set the current pack type
 */
export function setPackType(type: PackType) {
  currentPackType.set(type);
}

/**
 * Get premium pack configuration by ID
 */
export function getPremiumPackConfig(packConfigId: string): PremiumPackConfig | undefined {
  return PREMIUM_PACK_CONFIGS.find((config) => config.id === packConfigId);
}

/**
 * Get all active premium pack configs
 */
export function getActivePremiumPacks(): PremiumPackConfig[] {
  return PREMIUM_PACK_CONFIGS.filter((config) => config.isActive);
}

/**
 * Check if user has premium packs available
 */
export function hasPremiumPacks(): boolean {
  const inventory = premiumInventory.get();
  return inventory.availablePacks.length > 0;
}

/**
 * Get count of available premium packs
 */
export function getPremiumPackCount(): number {
  const inventory = premiumInventory.get();
  return inventory.availablePacks.length;
}

/**
 * Use a premium pack (remove from inventory)
 */
export function usePremiumPack(packConfigId: string): boolean {
  const inventory = premiumInventory.get();
  const index = inventory.availablePacks.indexOf(packConfigId);

  if (index === -1) {
    return false;
  }

  inventory.availablePacks.splice(index, 1);
  premiumInventory.set({ ...inventory });
  return true;
}

/**
 * Add a premium pack to inventory (after purchase)
 */
export function addPremiumPackToInventory(packConfigId: string) {
  const inventory = premiumInventory.get();
  inventory.availablePacks.push(packConfigId);
  premiumInventory.set({ ...inventory });
}

// ============================================================================
// STRIPE PURCHASE FLOW
// ============================================================================

/**
 * Stripe is not yet configured - this is a placeholder for future implementation
 *
 * To enable Stripe payments:
 * 1. Create a Stripe account: https://stripe.com
 * 2. Add your Stripe publishable key to .env: PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
 * 3. Create products and prices in Stripe Dashboard
 * 4. Add Stripe Price IDs to PREMIUM_PACK_CONFIGS
 * 5. Implement API route for checkout session creation (e.g., /api/stripe/create-checkout)
 * 6. Implement webhook handler for payment success (e.g., /api/stipe/webhook)
 * 7. Test with Stripe test mode
 */

/**
 * Initiate premium pack purchase via Stripe
 *
 * This function will:
 * 1. Create a purchase session
 * 2. Redirect to Stripe Checkout (when configured)
 * 3. Handle success/failure callbacks
 *
 * @param packConfigId - Premium pack configuration to purchase
 * @returns Purchase session ID
 */
export async function initiatePremiumPackPurchase(packConfigId: string): Promise<string> {
  const config = getPremiumPackConfig(packConfigId);

  if (!config) {
    throw new Error(`Invalid premium pack config: ${packConfigId}`);
  }

  if (!config.isActive) {
    throw new Error(`Premium pack ${packConfigId} is not available`);
  }

  // Check if Stripe is configured
  const stripePublicKey = import.meta.env.PUBLIC_STRIPE_PUBLIC_KEY;

  if (!stripePublicKey) {
    throw new Error('Stripe is not configured. Contact administrator.');
  }

  // Create purchase session
  const sessionId = crypto.randomUUID();
  const session: PurchaseSession = {
    sessionId,
    packType: 'premium',
    packConfigId,
    status: 'pending',
    receiptValidated: false,
    timestamp: new Date(),
  };

  purchaseSession.set({ data: session });

  // TODO: Create Stripe checkout session via API
  // For now, this is a placeholder - in production, call your backend:
  // const response = await fetch('/api/stripe/create-checkout', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ packConfigId, sessionId }),
  // });
  // const { checkoutUrl } = await response.json();
  // window.location.href = checkoutUrl;

  throw new Error('Stripe checkout not yet implemented. Add backend API route first.');
}

/**
 * Simulate a successful premium pack purchase (for testing)
 *
 * This bypasses Stripe and directly adds a premium pack to inventory.
 * Only use this for development/testing purposes.
 *
 * @param packConfigId - Premium pack configuration to "purchase"
 */
export function simulatePremiumPackPurchase(packConfigId: string = 'premium_single') {
  const config = getPremiumPackConfig(packConfigId);

  if (!config) {
    throw new Error(`Invalid premium pack config: ${packConfigId}`);
  }

  const sessionId = crypto.randomUUID();
  const session: PurchaseSession = {
    sessionId,
    packType: 'premium',
    packConfigId,
    status: 'completed',
    receiptValidated: true,
    timestamp: new Date(),
    completedAt: new Date(),
  };

  // Update purchase history
  const inventory = premiumInventory.get();
  inventory.purchaseHistory.push(session);
  inventory.totalPacksPurchased++;
  inventory.totalSpent += config.price;

  // Add pack to inventory
  inventory.availablePacks.push(packConfigId);
  premiumInventory.set({ ...inventory });

  purchaseSession.set({ data: session });

  return session;
}

/**
 * Handle successful Stripe checkout
 *
 * Called when user returns from Stripe after successful payment
 *
 * @param checkoutSessionId - Stripe checkout session ID
 */
export async function handleStripeSuccess(checkoutSessionId: string): Promise<void> {
  // TODO: Verify checkout session with backend
  // const response = await fetch('/api/stripe/verify-session', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ checkoutSessionId }),
  // });
  // const { packConfigId, validated } = await response.json();

  // For now, this is a placeholder
  throw new Error('Stripe success handler not yet implemented');
}

/**
 * Handle failed/canceled Stripe checkout
 *
 * @param checkoutSessionId - Stripe checkout session ID
 */
export async function handleStripeCanceled(checkoutSessionId: string): Promise<void> {
  const currentSessionData = purchaseSession.get();
  const currentSession = currentSessionData?.data;

  if (currentSession && currentSession.status === 'pending') {
    purchaseSession.set({
      data: {
        ...currentSession,
        status: 'failed',
        error: 'Payment canceled by user',
      },
    });
  }

  purchaseUI.set({
    isCheckoutOpen: false,
    isProcessing: false,
    error: 'Payment was canceled',
    success: false,
  });
}

// ============================================================================
// RECEIPT VALIDATION (Security)
// ============================================================================

/**
 * Validate a purchase receipt
 *
 * This prevents client-side manipulation by verifying the purchase
 * server-side using cryptographic signatures.
 *
 * @param sessionId - Purchase session ID to validate
 * @returns Validation result
 */
export async function validateReceipt(sessionId: string): Promise<ReceiptValidation> {
  // TODO: Implement server-side receipt validation
  // This should call your backend which:
  // 1. Verifies the Stripe payment intent
  // 2. Checks the payment amount matches expected price
  // 3. Returns a signed receipt

  throw new Error('Receipt validation not yet implemented. Add backend API route first.');
}

/**
 * Check if a purchase session is valid
 *
 * Server-side verification to prevent tampering
 *
 * @param session - Purchase session to verify
 * @returns True if session is valid
 */
export function isValidPurchaseSession(session: PurchaseSession): boolean {
  // Basic client-side checks (server should do full validation)
  if (!session.sessionId || session.sessionId.length === 0) {
    return false;
  }

  if (session.packType !== 'premium') {
    return false;
  }

  if (session.status !== 'completed') {
    return false;
  }

  if (!session.receiptValidated) {
    return false;
  }

  const config = getPremiumPackConfig(session.packConfigId);
  if (!config) {
    return false;
  }

  return true;
}

// ============================================================================
// UI HELPERS
// ============================================================================

/**
 * Open purchase modal
 */
export function openPurchaseModal() {
  purchaseUI.set({
    isCheckoutOpen: true,
    isProcessing: false,
    error: null,
    success: false,
  });
}

/**
 * Close purchase modal
 */
export function closePurchaseModal() {
  purchaseUI.set({
    isCheckoutOpen: false,
    isProcessing: false,
    error: null,
    success: false,
  });
}

/**
 * Set purchase processing state
 */
export function setPurchaseProcessing(isProcessing: boolean) {
  purchaseUI.set({
    ...purchaseUI.get(),
    isProcessing,
  });
}

/**
 * Set purchase error
 */
export function setPurchaseError(error: string | null) {
  purchaseUI.set({
    ...purchaseUI.get(),
    error,
    isProcessing: false,
  });
}

/**
 * Set purchase success
 */
export function setPurchaseSuccess() {
  purchaseUI.set({
    ...purchaseUI.get(),
    success: true,
    isProcessing: false,
    error: null,
  });
}

/**
 * Get premium pack stats for display
 */
export function getPremiumPackStats() {
  const inventory = premiumInventory.get();
  const activePacks = getActivePremiumPacks();

  return {
    availablePacks: inventory.availablePacks.length,
    totalPurchased: inventory.totalPacksPurchased,
    totalSpent: inventory.totalSpent,
    averageSpend: inventory.totalPacksPurchased > 0
      ? inventory.totalSpent / inventory.totalPacksPurchased
      : 0,
    activePackConfigs: activePacks,
  };
}
