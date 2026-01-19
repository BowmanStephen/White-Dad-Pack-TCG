/**
 * Focus Trap Utility
 *
 * Traps keyboard focus within a container element.
 * Essential for modals, dropdowns, and other overlays.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface-trap/
 */

interface FocusTrapOptions {
  /** Element to return focus to when trap is deactivated */
  returnFocusTo?: HTMLElement;
  /** Callback when focus trap is activated */
  onActivate?: () => void;
  /** Callback when focus trap is deactivated */
  onDeactivate?: () => void;
  /**
   * Whether to autofocus the first focusable element
   * @default true
   */
  autoFocus?: boolean;
}

/**
 * Creates a focus trap within a container
 *
 * @param container - The container element
 * @param options - Configuration options
 * @returns Cleanup function to remove focus trap
 *
 * @example
 * ```svelte
 * <script>
 *   import { onMount } from 'svelte';
 *   import { createFocusTrap } from '@/lib/utils/focus-trap';
 *
 *   let modalElement: HTMLElement;
 *   let triggerElement: HTMLElement;
 *
 *   function openModal() {
 *     // Save trigger element
 *     triggerElement = document.activeElement as HTMLElement;
 *   }
 *
 *   onMount(() => {
 *     const cleanup = createFocusTrap(modalElement, {
 *       returnFocusTo: triggerElement,
 *       onActivate: () => console.log('Focus trap activated'),
 *       onDeactivate: () => console.log('Focus trap deactivated'),
 *       autoFocus: true,
 *     });
 *
 *     return cleanup;
 *   });
 * </script>
 *
 * <div bind:this={modalElement} role="dialog" aria-modal="true">
 *   Modal content
 * </div>
 * ```
 */
export function createFocusTrap(
  container: HTMLElement,
  options: FocusTrapOptions = {}
): () => void {
  const {
    returnFocusTo,
    onActivate,
    onDeactivate,
    autoFocus = true,
  } = options;

  if (!container) {
    console.warn('Focus trap: container element is required');
    return () => {};
  }

  // Find all focusable elements within container
  const getFocusableElements = (): HTMLElement[] => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input[type="text"]:not([disabled])',
      'input[type="radio"]:not([disabled])',
      'input[type="checkbox"]:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter(
      (element) =>
        element.offsetParent !== null || // Visible in layout
        element.tagName === 'A' || // Links can be hidden but valid
        element.getAttribute('aria-hidden') !== 'true'
    );
  };

  let focusableElements = getFocusableElements();
  let firstElement = focusableElements[0];
  let lastElement = focusableElements[focusableElements.length - 1];

  // Auto-focus first element
  if (autoFocus && firstElement) {
    firstElement.focus();
  }

  // Call activation callback
  onActivate?.();

  // Handle Tab key
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') {
      return;
    }

    // Refresh focusable elements in case DOM changed
    focusableElements = getFocusableElements();
    firstElement = focusableElements[0];
    lastElement = focusableElements[focusableElements.length - 1];

    // If no focusable elements, prevent tab
    if (!firstElement || !lastElement) {
      event.preventDefault();
      return;
    }

    // Shift + Tab
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    }
    // Tab
    else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Mark container as focus trap
  container.setAttribute('data-focus-trap', 'active');

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
    container.removeAttribute('data-focus-trap');

    // Return focus to trigger element
    if (returnFocusTo) {
      returnFocusTo.focus();
    }

    // Call deactivation callback
    onDeactivate?.();
  };
}

/**
 * Checks if an element has an active focus trap
 *
 * @param element - Element to check
 * @returns True if element is a focus trap
 */
export function hasActiveFocusTrap(element: HTMLElement): boolean {
  return element.getAttribute('data-focus-trap') === 'active';
}

/**
 * Manages focus trap lifecycle with Svelte component
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useFocusTrap } from '@/lib/utils/focus-trap';
 *   import { onMount } from 'svelte';
 *
 *   let container: HTMLElement;
 *   let isOpen = $state(false);
 *
 *   onMount(() => {
 *     if (isOpen) {
 *       return useFocusTrap(container);
 *     }
 *   });
 * </script>
 *
 * {#if isOpen}
 *   <div bind:this={container} role="dialog">
 *     Content
 *   </div>
 * {/if}
 * ```
 */
export function useFocusTrap(
  container: HTMLElement,
  options?: FocusTrapOptions
): () => void {
  return createFocusTrap(container, options);
}

/**
 * Svelte action version for focus trap
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { focusTrap } from '@/lib/utils/focus-trap';
 *
 *   let isOpen = false;
 * </script>
 *
 * {#if isOpen}
 *   <div use:focusTrap role="dialog">
 *     Modal content
 *   </div>
 * {/if}
 * ```
 */
export function focusTrap(
  node: HTMLElement,
  options: FocusTrapOptions = {}
): { update: (options: FocusTrapOptions) => void; destroy: () => void } {
  let cleanup = createFocusTrap(node, options);

  return {
    update: (newOptions: FocusTrapOptions) => {
      cleanup();
      cleanup = createFocusTrap(node, newOptions);
    },
    destroy: () => {
      cleanup();
    },
  };
}
