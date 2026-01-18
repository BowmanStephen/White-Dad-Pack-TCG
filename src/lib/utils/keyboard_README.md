# Keyboard Navigation Utilities

This file provides helper functions for keyboard accessibility in Svelte components.

## Functions

### `handleKeyboardActivation(event, callback)`
Activates an element when Enter or Space is pressed.
- **Parameters**:
  - `event`: KeyboardEvent
  - `callback`: Function to execute on activation
- **Use case**: Make custom div elements keyboard-accessible

### `handleEscapeKey(event, callback)`
Handles Escape key to dismiss modals, dropdowns, etc.
- **Parameters**:
  - `event`: KeyboardEvent
  - `callback`: Function to execute on Escape
- **Use case**: Close modals, dropdowns, or overlays

### `trapFocus(container)`
Traps focus within a container (for modals, dropdowns).
- **Parameters**:
  - `container`: The DOM element to trap focus within
- **Returns**: Cleanup function to remove event listeners
- **Use case**: Focus management for modals

### `handleArrowNavigation(event, currentIndex, itemCount, columns, callback)`
Arrow key navigation for grids and lists.
- **Parameters**:
  - `event`: KeyboardEvent
  - `currentIndex`: Currently focused index
  - `itemCount`: Total number of items
  - `columns`: Number of columns in the grid (for 2D navigation)
  - `callback`: Function to execute with new index
- **Returns**: New index or null if no navigation occurred
- **Use case**: Keyboard navigation in card grids, galleries

### `manageFocusReturn(triggerElement)`
Manages focus return after closing a modal/dropdown.
- **Parameters**:
  - `triggerElement`: The element that opened the modal
- **Returns**: Cleanup function to restore focus
- **Use case**: Restore focus to trigger after closing modal

### `getLiveRegionAttrs(politeness)`
Generates ARIA attributes for live regions.
- **Parameters**:
  - `politeness`: 'polite' (default) or 'assertive'
- **Returns**: ARIA attributes object
- **Use case**: Screen reader announcements

## Full Implementation

See `src/lib/utils/keyboard.ts` for the complete implementation.
