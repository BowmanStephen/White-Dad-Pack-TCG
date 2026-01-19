/**
 * Arrow Navigation Composable
 *
 * Svelte 5 composable for keyboard navigation in grids and lists.
 * Use this for card galleries, collection views, etc.
 *
 * Basic usage:
 * - Returns focusedIndex (reactive state), handleKeydown function, and setFocusedIndex function
 * - Pass handleKeydown to a container's on:keydown event
 * - Use focusedIndex.current to access the current index
 * - Call setFocusedIndex(index) to programmatically change focus
 */

interface ArrowNavigationOptions {
  /** Number of columns in the grid (for 2D navigation) */
  columns?: number;
  /** Wrap navigation from end to start */
  wrap?: boolean;
  /** Initial focused index */
  initialIndex?: number;
  /** Callback when index changes */
  onIndexChange?: (index: number) => void;
}

export function useArrowNavigation(
  itemCount: number,
  options: ArrowNavigationOptions = {}
) {
  const {
    columns = 1,
    wrap = true,
    initialIndex = 0,
    onIndexChange,
  } = options;

  // Reactive state using Svelte 5 runes
  let focusedIndex = $state(initialIndex);

  /**
   * Calculate new index based on arrow key
   */
  function calculateNewIndex(currentIndex: number, key: string): number {
    let newIndex = currentIndex;

    switch (key) {
      case 'ArrowLeft':
        newIndex = wrap
          ? (currentIndex - 1 + itemCount) % itemCount
          : Math.max(0, currentIndex - 1);
        break;

      case 'ArrowRight':
        newIndex = wrap
          ? (currentIndex + 1) % itemCount
          : Math.min(itemCount - 1, currentIndex + 1);
        break;

      case 'ArrowUp':
        if (columns > 1) {
          // 2D navigation: move up one row
          newIndex = wrap
            ? (currentIndex - columns + itemCount) % itemCount
            : Math.max(0, currentIndex - columns);
        } else {
          // 1D navigation: same as left
          newIndex = wrap
            ? (currentIndex - 1 + itemCount) % itemCount
            : Math.max(0, currentIndex - 1);
        }
        break;

      case 'ArrowDown':
        if (columns > 1) {
          // 2D navigation: move down one row
          newIndex = wrap
            ? (currentIndex + columns) % itemCount
            : Math.min(itemCount - 1, currentIndex + columns);
        } else {
          // 1D navigation: same as right
          newIndex = wrap
            ? (currentIndex + 1) % itemCount
            : Math.min(itemCount - 1, currentIndex + 1);
        }
        break;

      case 'Home':
        newIndex = 0;
        break;

      case 'End':
        newIndex = itemCount - 1;
        break;

      case 'PageUp':
        // Move up by rows
        newIndex = Math.max(0, currentIndex - columns * 3);
        break;

      case 'PageDown':
        // Move down by rows
        newIndex = Math.min(itemCount - 1, currentIndex + columns * 3);
        break;

      default:
        return currentIndex;
    }

    return newIndex;
  }

  /**
   * Handle keyboard navigation
   */
  function handleKeydown(event: KeyboardEvent) {
    // Only handle arrow keys and navigation keys
    const navigationKeys = [
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
      'PageUp',
      'PageDown',
    ];

    if (!navigationKeys.includes(event.key)) {
      return;
    }

    // Prevent default scrolling behavior for arrow keys
    event.preventDefault();

    const newIndex = calculateNewIndex(focusedIndex, event.key);

    if (newIndex !== focusedIndex) {
      focusedIndex = newIndex;

      // Focus the new element
      const newElement = document.querySelector(
        `[data-index="${newIndex}"]`
      ) as HTMLElement;
      newElement?.focus();

      // Call callback if provided
      onIndexChange?.(newIndex);
    }
  }

  /**
   * Set focused index programmatically
   */
  function setFocusedIndex(index: number) {
    if (index >= 0 && index < itemCount) {
      focusedIndex = index;

      // Focus the element
      const element = document.querySelector(
        `[data-index="${index}"]`
      ) as HTMLElement;
      element?.focus();

      onIndexChange?.(index);
    }
  }

  /**
   * Reset to initial index
   */
  function reset() {
    setFocusedIndex(initialIndex);
  }

  return {
    get focusedIndex() { return focusedIndex; },
    handleKeydown,
    setFocusedIndex,
    reset,
  };
}

/**
 * Alternative: Simpler version using Svelte stores
 *
 * @example
 * // Store-based version
 * ```svelte
 * <script lang="ts">
 *   import { writable } from 'svelte/store';
 *   import { useArrowKeyNavigation } from '@/lib/composables/useArrowNavigation';
 *
 *   declare const cards: unknown[];
 *   declare const focusedIndex: { subscribe: any; set: (value: number) => void };
 *   const handleKeydown = useArrowKeyNavigation(focusedIndex, cards.length, 4);
 * </script>
 * ```
 */
export function useArrowKeyNavigation(
  focusedIndex: { subscribe: any; set: (value: number) => void },
  itemCount: number,
  columns: number = 1
): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    const navigationKeys = [
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
    ];

    if (!navigationKeys.includes(event.key)) {
      return;
    }

    event.preventDefault();

    focusedIndex.subscribe((currentIndex: number) => {
      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowLeft':
          newIndex = Math.max(0, currentIndex - 1);
          break;
        case 'ArrowRight':
          newIndex = Math.min(itemCount - 1, currentIndex + 1);
          break;
        case 'ArrowUp':
          newIndex = Math.max(0, currentIndex - columns);
          break;
        case 'ArrowDown':
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
        focusedIndex.set(newIndex);

        // Focus the new element
        const newElement = document.querySelector(
          `[data-index="${newIndex}"]`
        ) as HTMLElement;
        newElement?.focus();
      }
    });
  };
}
