/**
 * Keyboard Shortcuts System (NAV-003)
 *
 * Provides global keyboard shortcuts for navigation and actions.
 * Shortcuts are active throughout the app and work on desktop.
 */

import { modalOpen, openModal } from '@/stores/ui';

/**
 * Keyboard shortcut definition
 */
export interface Shortcut {
  key: string;
  description: string;
  action: () => void | Promise<void>;
  preventDefault?: boolean;
}

/**
 * Route shortcuts for navigation
 */
const ROUTE_SHORTCUTS: Record<string, string> = {
  'o': '/',        // Open pack (home)
  'c': '/collection',  // Collection
  'd': '/deck-builder', // Deck builder
};

/**
 * Special shortcuts (modals and actions)
 */
const SPECIAL_SHORTCUTS: Record<string, Shortcut> = {
  '?': {
    key: '?',
    description: 'keyboard.showShortcuts',
    action: () => {
      if (typeof window !== 'undefined') {
        openModal('shortcuts', 'keyboard');
      }
    },
    preventDefault: true,
  },
  'Escape': {
    key: 'Escape',
    description: 'keyboard.closeModal',
    action: () => {
      if (typeof window !== 'undefined' && modalOpen.get()) {
        modalOpen.set(null);
      }
    },
    preventDefault: true,
  },
};

/**
 * All registered shortcuts
 */
let registeredShortcuts: Map<string, Shortcut> = new Map();

/**
 * Whether shortcuts are currently enabled
 */
let shortcutsEnabled = true;

/**
 * Initialize keyboard shortcuts system
 */
export function initializeShortcuts(): void {
  if (typeof window === 'undefined') return;

  // Register all shortcuts
  registerRouteShortcuts();
  registerSpecialShortcuts();

  // Add global event listener
  window.addEventListener('keydown', handleKeyDown);

  // Track shortcuts usage for analytics
  trackShortcutUsage();
}

/**
 * Register route navigation shortcuts
 */
function registerRouteShortcuts(): void {
  for (const [key, route] of Object.entries(ROUTE_SHORTCUTS)) {
    const shortcut: Shortcut = {
      key,
      description: getRouteDescription(route),
      action: () => navigateToRoute(route),
      preventDefault: true,
    };

    registeredShortcuts.set(key.toLowerCase(), shortcut);
  }
}

/**
 * Register special action shortcuts
 */
function registerSpecialShortcuts(): void {
  for (const [key, shortcut] of Object.entries(SPECIAL_SHORTCUTS)) {
    registeredShortcuts.set(key.toLowerCase(), shortcut);
  }
}

/**
 * Get description for route shortcut
 */
function getRouteDescription(route: string): string {
  const descriptions: Record<string, string> = {
    '/': 'keyboard.openPack',
    '/collection': 'keyboard.goToCollection',
    '/deck-builder': 'keyboard.goToDeckBuilder',
  };

  return descriptions[route] || 'keyboard.navigate';
}

/**
 * Navigate to route
 */
function navigateToRoute(route: string): void {
  if (typeof window === 'undefined') return;

  // Don't navigate if already on this route
  if (window.location.pathname === route) return;

  // Navigate using Astro's client-side router
  window.location.href = route;
}

/**
 * Handle keyboard events
 */
function handleKeyDown(event: KeyboardEvent): void {
  // Skip if shortcuts disabled
  if (!shortcutsEnabled) return;

  // Skip if user is typing in an input
  if (isTypingInInput(event)) return;

  // Skip if modal is open and not Escape key
  const currentModal = modalOpen.get();
  if (currentModal && event.key !== 'Escape') return;

  // Get the key (lowercase for case-insensitive matching)
  const key = event.key.toLowerCase();

  // Find matching shortcut
  const shortcut = registeredShortcuts.get(key);

  if (shortcut) {
    // Prevent default behavior if requested
    if (shortcut.preventDefault) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Execute the shortcut action
    try {
      shortcut.action();
    } catch (error) {
      console.error(`Error executing shortcut "${key}":`, error);
    }
  }
}

/**
 * Check if user is typing in an input field
 */
function isTypingInInput(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement;

  // Check if target is an input-like element
  const isInput = target instanceof HTMLInputElement ||
                  target instanceof HTMLTextAreaElement ||
                  target instanceof HTMLSelectElement ||
                  target.contentEditable === 'true';

  // Allow Escape key to work even in inputs
  if (isInput && event.key !== 'Escape') {
    return true;
  }

  return false;
}

/**
 * Enable keyboard shortcuts
 */
export function enableShortcuts(): void {
  shortcutsEnabled = true;
}

/**
 * Disable keyboard shortcuts
 */
export function disableShortcuts(): void {
  shortcutsEnabled = false;
}

/**
 * Get all registered shortcuts
 */
export function getAllShortcuts(): Shortcut[] {
  return Array.from(registeredShortcuts.values()).sort((a, b) =>
    a.key.localeCompare(b.key)
  );
}

/**
 * Get shortcuts by category
 */
export function getShortcutsByCategory(): Record<string, Shortcut[]> {
  const shortcuts = getAllShortcuts();

  return {
    navigation: shortcuts.filter(s =>
      s.key === 'o' || s.key === 'c' || s.key === 'd'
    ),
    actions: shortcuts.filter(s =>
      s.key === '?' || s.key === 'Escape'
    ),
  };
}

/**
 * Format shortcut key for display
 */
export function formatShortcutKey(key: string): string {
  // Format special keys
  const keyMap: Record<string, string> = {
    'escape': 'Esc',
    ' ': 'Space',
    'arrowup': '↑',
    'arrowdown': '↓',
    'arrowleft': '←',
    'arrowright': '→',
  };

  const formatted = keyMap[key.toLowerCase()] || key;

  // Capitalize single letters
  if (formatted.length === 1) {
    return formatted.toUpperCase();
  }

  return formatted;
}

/**
 * Track shortcut usage for analytics
 */
function trackShortcutUsage(): void {
  if (typeof window === 'undefined') return;

  // Track each shortcut execution
  const originalHandleKeyDown = handleKeyDown;
  const trackedHandleKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const shortcut = registeredShortcuts.get(key);

    if (shortcut && !isTypingInInput(event)) {
      // Track analytics event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'shortcut_used', {
          shortcut_key: key,
          route: window.location.pathname,
        });
      }
    }

    return originalHandleKeyDown(event);
  };

  // Replace event listener (would need to remove and re-add in real implementation)
}

/**
 * Cleanup keyboard shortcuts
 */
export function cleanupShortcuts(): void {
  if (typeof window === 'undefined') return;

  window.removeEventListener('keydown', handleKeyDown);
  registeredShortcuts.clear();
}

/**
 * Check if a shortcut is registered
 */
export function hasShortcut(key: string): boolean {
  return registeredShortcuts.has(key.toLowerCase());
}

/**
 * Register a custom shortcut
 */
export function registerShortcut(shortcut: Shortcut): void {
  registeredShortcuts.set(shortcut.key.toLowerCase(), shortcut);
}

/**
 * Unregister a shortcut
 */
export function unregisterShortcut(key: string): void {
  registeredShortcuts.delete(key.toLowerCase());
}
