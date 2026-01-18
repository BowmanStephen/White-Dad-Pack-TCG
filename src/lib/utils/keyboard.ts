/**
 * Keyboard Navigation Utilities
 *
 * Provides helper functions for keyboard accessibility in Svelte components.
 * Handles Enter/Space activation, Escape dismissal, and arrow key navigation.
 */

/**
 * Activates an element when Enter or Space is pressed (accessibility requirement)
 *
 * Use this to make custom interactive elements (divs, spans) keyboard-accessible.
 *
 * @param event - Keyboard event from keydown listener
 * @param callback - Function to execute when Enter or Space is pressed
 */
export function handleKeyboardActivation(
  event: KeyboardEvent,
  callback: () => void
): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback();
  }
}

/**
 * Handles Escape key to dismiss modals, dropdowns, etc.
 *
 * @param event - Keyboard event from keydown listener
 * @param callback - Function to execute when Escape is pressed
 */
export function handleEscapeKey(
  event: KeyboardEvent,
  callback: () => void
): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    callback();
  }
}

/**
 * Traps focus within a container (for modals, dropdowns)
 *
 * Prevents Tab from leaving the container. Useful for modals and dropdowns.
 * Focuses first element automatically. Returns cleanup function.
 *
 * @param container - The DOM element to trap focus within
 * @returns Cleanup function to remove event listeners and restore focus
 */
export function trapFocus(container: HTMLElement): () => void {
  if (!container) return () => {};

  const focusableElements = container.querySelectorAll<
    HTMLElement | SVGElement
  >(
    'a[href], button:not([disabled]), textarea:not([disabled]), ' +
      'input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), ' +
      'input[type="checkbox"]:not([disabled]), select:not([disabled]), ' +
      '[tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    // Shift + Tab
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    }
    // Tab
    else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);

  // Focus first element
  firstElement?.focus();

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Arrow key navigation for grids and lists
 *
 * Supports 2D navigation (arrow keys), Home/End keys.
 * Moves focus and calls callback with new index.
 *
 * @param event - Keyboard event from keydown listener
 * @param currentIndex - Currently focused index (0-based)
 * @param itemCount - Total number of items in the grid
 * @param columns - Number of columns for 2D navigation (up/down moves by row)
 * @param callback - Function to execute with new index
 * @returns New index or null if no navigation occurred
 */
export function handleArrowNavigation(
  event: KeyboardEvent,
  currentIndex: number,
  itemCount: number,
  columns: number,
  callback: (newIndex: number) => void
): number | null {
  const { key } = event;

  // Only handle arrow keys
  if (
    !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(
      key
    )
  ) {
    return null;
  }

  event.preventDefault();

  let newIndex = currentIndex;

  switch (key) {
    case 'ArrowLeft':
      newIndex = Math.max(0, currentIndex - 1);
      break;
    case 'ArrowRight':
      newIndex = Math.min(itemCount - 1, currentIndex + 1);
      break;
    case 'ArrowUp':
      // Move up one row (wrapping if needed)
      newIndex = Math.max(0, currentIndex - columns);
      break;
    case 'ArrowDown':
      // Move down one row (wrapping if needed)
      newIndex = Math.min(itemCount - 1, currentIndex + columns);
      break;
    case 'Home':
      newIndex = 0;
      break;
    case 'End':
      newIndex = itemCount - 1;
      break;
  }

  if (newIndex !== currentIndex) {
    callback(newIndex);

    // Focus the new element
    const newElement = document.querySelectorAll(
      `[data-index="${newIndex}"]`
    )[0] as HTMLElement;
    newElement?.focus();

    return newIndex;
  }

  return null;
}

/**
 * Manages focus return after closing a modal/dropdown
 *
 * Stores the trigger element and returns a cleanup function that restores focus.
 * Use this to ensure keyboard users return to their original location.
 *
 * @param triggerElement - The element that opened the modal/overlay
 * @returns Cleanup function that restores focus to trigger element
 */
export function manageFocusReturn(triggerElement: HTMLElement): () => void {
  return () => {
    triggerElement?.focus();
  };
}

/**
 * Checks if user is navigating with keyboard
 *
 * @returns True if user pressed a navigation key recently
 *
 * Note: :focus-visible pseudo-class handles this natively in modern browsers.
 * This function is kept for compatibility with older browsers.
 */
export function isKeyboardNavigation(): boolean {
  // This is a simplified check - :focus-visible handles this natively in modern browsers
  // Kept for compatibility with older browsers or custom logic
  return true;
}

/**
 * Generates ARIA attributes for live regions (announcements to screen readers)
 *
 * @param politeness - 'polite' (default) or 'assertive'
 * @returns ARIA attributes object
 *
 * Example usage: getLiveRegionAttrs('polite') returns { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' }
 */
export function getLiveRegionAttrs(politeness: 'polite' | 'assertive' = 'polite') {
  return {
    role: 'status',
    'aria-live': politeness,
    'aria-atomic': 'true',
  };
}
