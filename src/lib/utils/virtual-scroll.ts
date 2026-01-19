/**
 * Virtual Scrolling Utility
 *
 * Implements windowed rendering for large lists to improve performance.
 * Only renders items visible in the viewport plus a buffer zone.
 *
 * PERF-003: Fix scroll jank with large collections (100+ cards)
 */

export interface VirtualScrollConfig {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  bufferItems?: number; // Number of items to render outside viewport
}

export interface VirtualScrollState {
  startIndex: number;
  endIndex: number;
  offsetY: number;
  visibleItems: number[];
}

/**
 * Calculate which items should be rendered based on scroll position
 *
 * @param scrollTop - Current scroll position from top
 * @param config - Virtual scroll configuration
 * @returns State with start/end indices and offset
 */
export function calculateVisibleRange(
  scrollTop: number,
  config: VirtualScrollConfig
): VirtualScrollState {
  const {
    itemCount,
    itemHeight,
    containerHeight,
    bufferItems = 5 // Default buffer: 5 items above/below viewport
  } = config;

  // Calculate how many items fit in viewport
  const viewportItemCount = Math.ceil(containerHeight / itemHeight);

  // Calculate start index based on scroll position
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / itemHeight) - bufferItems
  );

  // Calculate end index (start + viewport + buffers)
  const endIndex = Math.min(
    itemCount - 1,
    startIndex + viewportItemCount + bufferItems * 2
  );

  // Calculate offset for positioning items
  const offsetY = startIndex * itemHeight;

  // Generate array of visible indices
  const visibleItems: number[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push(i);
  }

  return {
    startIndex,
    endIndex,
    offsetY,
    visibleItems,
  };
}

/**
 * Calculate total height of the virtual container
 *
 * @param config - Virtual scroll configuration
 * @returns Total height in pixels
 */
export function getTotalHeight(config: VirtualScrollConfig): number {
  return config.itemCount * config.itemHeight;
}

/**
 * Get estimated card height based on viewport size
 *
 * Mobile: ~200px per card (2 columns)
 * Tablet: ~250px per card (4 columns)
 * Desktop: ~300px per card (6 columns)
 *
 * @returns Estimated card height in pixels
 */
export function getEstimatedCardHeight(): number {
  if (typeof window === 'undefined') return 250;

  const width = window.innerWidth;

  if (width < 768) {
    return 200; // Mobile: 2 columns
  } else if (width < 1024) {
    return 250; // Tablet: 4 columns
  } else {
    return 300; // Desktop: 6 columns
  }
}

/**
 * Create a reactive virtual scroll store for Svelte
 *
 * @param config - Virtual scroll configuration
 * @returns Store with virtual scroll state and methods
 */
export function createVirtualScrollStore(config: VirtualScrollConfig) {
  let scrollTop = $state(0);
  let state = $state<VirtualScrollState>({
    startIndex: 0,
    endIndex: Math.min(config.itemCount - 1, config.bufferItems || 5),
    offsetY: 0,
    visibleItems: Array.from({ length: Math.min(config.itemCount, 10) }, (_, i) => i),
  });

  function handleScroll(event: Event) {
    const target = event.target as HTMLElement;
    scrollTop = target.scrollTop;
    state = calculateVisibleRange(scrollTop, config);
  }

  function scrollToIndex(index: number) {
    scrollTop = index * config.itemHeight;
    state = calculateVisibleRange(scrollTop, config);
  }

  return {
    get state() {
      return state;
    },
    get scrollTop() {
      return scrollTop;
    },
    handleScroll,
    scrollToIndex,
  };
}

/**
 * Type for Svelte 5 virtual scroll directive
 */
export type VirtualScrollDirective = (
  container: HTMLElement,
  config: VirtualScrollConfig
) => {
  update: (config: VirtualScrollConfig) => void;
  destroy: () => void;
};

/**
 * Svelte action for virtual scrolling
 * Usage: <div use:virtualScroll={config} />
 */
export function virtualScroll(
  container: HTMLElement,
  config: VirtualScrollConfig
) {
  let currentConfig = config;

  const handleScroll = () => {
    const state = calculateVisibleRange(container.scrollTop, currentConfig);
    container.dispatchEvent(
      new CustomEvent('virtualscroll', {
        detail: state,
      })
    );
  };

  // Initial calculation
  handleScroll();

  // Add scroll listener with passive option for better performance
  container.addEventListener('scroll', handleScroll, { passive: true });

  return {
    update(newConfig: VirtualScrollConfig) {
      currentConfig = newConfig;
      handleScroll();
    },
    destroy() {
      container.removeEventListener('scroll', handleScroll);
    },
  };
}
