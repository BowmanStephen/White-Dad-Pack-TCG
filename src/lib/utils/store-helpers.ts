/**
 * Store Helpers for Svelte 5 + Nanostores
 *
 * Utilities for subscribing to Nanostores in Svelte 5 components.
 * Svelte 5 runes ($state, $derived) don't automatically work with Nanostores,
 * so we need to manually subscribe in onMount and sync values.
 */
import type { ReadableAtom } from 'nanostores';

/**
 * Subscription cleanup function type
 */
export type Unsubscriber = () => void;

/**
 * Store subscription configuration
 */
export interface StoreSubscription<T> {
  /** The Nanostore to subscribe to */
  store: ReadableAtom<T>;
  /** Callback to update local state when store changes */
  onUpdate: (value: T) => void;
}

/**
 * Subscribe to multiple Nanostores at once
 *
 * Returns a cleanup function that unsubscribes from all stores.
 * Use in onMount for proper lifecycle management.
 *
 * @param subscriptions - Array of store/callback pairs
 * @returns Cleanup function to unsubscribe all
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { onMount } from 'svelte';
 *   import { subscribeToStores } from '@lib/utils/store-helpers';
 *   import { currentPack, packState } from '@/stores/pack';
 *
 *   let pack = $state<Pack | null>(currentPack.get());
 *   let state = $state<PackState>(packState.get());
 *
 *   onMount(() => {
 *     return subscribeToStores([
 *       { store: currentPack, onUpdate: (v) => { pack = v; } },
 *       { store: packState, onUpdate: (v) => { state = v; } },
 *     ]);
 *   });
 * </script>
 * ```
 */
export function subscribeToStores<T extends unknown[]>(subscriptions: {
  [K in keyof T]: StoreSubscription<T[K]>;
}): Unsubscriber {
  const unsubscribers = subscriptions.map(({ store, onUpdate }) => store.subscribe(onUpdate));

  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
}

/**
 * Create a single store subscription
 *
 * Convenience wrapper for subscribing to one store.
 *
 * @param store - The Nanostore to subscribe to
 * @param onUpdate - Callback when store value changes
 * @returns Cleanup function to unsubscribe
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { onMount } from 'svelte';
 *   import { subscribeToStore } from '@lib/utils/store-helpers';
 *   import { packState } from '@/stores/pack';
 *
 *   let state = $state<PackState>(packState.get());
 *
 *   onMount(() => subscribeToStore(packState, (v) => { state = v; }));
 * </script>
 * ```
 */
export function subscribeToStore<T>(
  store: ReadableAtom<T>,
  onUpdate: (value: T) => void
): Unsubscriber {
  return store.subscribe(onUpdate);
}

/**
 * Get initial value from store
 *
 * Utility to get the current value of a Nanostore for initializing Svelte state.
 *
 * @param store - The Nanostore to read from
 * @returns Current value of the store
 *
 * @example
 * let state = $state(getStoreValue(packState));
 */
export function getStoreValue<T>(store: ReadableAtom<T>): T {
  return store.get();
}
