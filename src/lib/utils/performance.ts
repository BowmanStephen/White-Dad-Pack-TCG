/**
 * Performance Utilities for 60fps Animations
 *
 * This module provides utilities for:
 * - Debouncing expensive operations
 * - Throttling rapid events
 * - RequestAnimationFrame scheduling
 * - Idle callback scheduling
 */

/**
 * Debounce function execution (prevents layout thrashing)
 * @param fn Function to debounce
 * @param delay Wait time in ms (default: 100ms)
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 100
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined;
  let lastArgs: Parameters<T> | undefined;

  return function debounced(...args: Parameters<T>) {
    lastArgs = args;

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      fn(...lastArgs!);
      timeoutId = undefined;
      lastArgs = undefined;
    }, delay);
  };
}

/**
 * Throttle function execution (limits execution rate)
 * @param fn Function to throttle
 * @param limit Minimum time between executions in ms (default: 16ms for ~60fps)
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 16 // ~60fps
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastArgs: Parameters<T> | undefined;

  return function throttled(...args: Parameters<T>) {
    lastArgs = args;

    if (!inThrottle) {
      fn(...args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = undefined;
        }
      }, limit);
    }
  };
}

/**
 * Schedule function with requestAnimationFrame (60fps aligned)
 * @param fn Function to execute
 * @returns Cancel function
 */
export function rafSchedule(fn: () => void): () => void {
  let rafId: number | null = null;

  const schedule = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      fn();
      rafId = null;
    });
  };

  schedule();

  return () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}

/**
 * Batch multiple DOM reads to prevent layout thrashing
 * @param reads Array of read functions
 * @returns Results of all reads
 */
export function batchReads<T>(reads: (() => T)[]): T[] {
  return reads.map(read => read());
}

/**
 * Schedule function during browser idle time
 * @param fn Function to execute when idle
 * @param timeout Maximum wait time in ms (default: 2000ms)
 * @returns Cancel function
 */
export function scheduleIdle(
  fn: () => void,
  timeout: number = 2000
): () => void {
  let handle: number | undefined;

  if ('requestIdleCallback' in window) {
    handle = (window as any).requestIdleCallback(
      () => fn(),
      { timeout }
    ) as number;

    return () => {
      if (handle !== undefined) {
        (window as any).cancelIdleCallback(handle);
      }
    };
  }

  // Fallback to setTimeout
  const timerId = setTimeout(fn, 0);
  return () => clearTimeout(timerId);
}

/**
 * Measure FPS for performance monitoring
 * @returns FPS value and measurement function
 */
export function createFPSMeter() {
  let frames = 0;
  let lastTime = performance.now();
  let fps = 60;

  const measure = () => {
    frames++;
    const now = performance.now();

    if (now >= lastTime + 1000) {
      fps = Math.round((frames * 1000) / (now - lastTime));
      frames = 0;
      lastTime = now;
    }

    return fps;
  };

  return {
    measure,
    getFPS: () => fps,
  };
}

/**
 * Check if device is low-end (mobile, slower CPU)
 * @returns true if device is likely low-end
 */
export function isLowEndDevice(): boolean {
  // Check for mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Check for limited memory (if available)
  const memoryLimit =
    'deviceMemory' in navigator &&
    (navigator as any).deviceMemory < 4; // Less than 4GB RAM

  // Check for slow CPU (hardware concurrency)
  const slowCPU =
    'hardwareConcurrency' in navigator &&
    (navigator as any).hardwareConcurrency < 4; // Less than 4 cores

  return isMobile || memoryLimit || slowCPU;
}

/**
 * Reduce animation complexity based on device capabilities
 * @returns Recommended particle count multiplier
 */
export function getParticleMultiplier(): number {
  if (isLowEndDevice()) {
    return 0.5; // Half particles on low-end devices
  }
  return 1; // Full particles on capable devices
}

/**
 * Batch multiple writes to prevent layout thrashing
 * @param writes Array of write functions
 */
export function batchWrites(writes: (() => void)[]): void {
  // Use requestAnimationFrame to batch writes
  requestAnimationFrame(() => {
    writes.forEach(write => write());
  });
}

/**
 * Create a debounced resize handler
 * @param fn Function to call on resize
 * @returns Debounced resize handler
 */
export function createResizeHandler(fn: () => void): () => void {
  const debounced = debounce(fn, 150);
  window.addEventListener('resize', debounced);
  return () => window.removeEventListener('resize', debounced);
}

/**
 * Create a throttled scroll handler
 * @param fn Function to call on scroll
 * @returns Throttled scroll handler
 */
export function createScrollHandler(fn: () => void): () => void {
  const throttled = throttle(fn, 16); // ~60fps
  window.addEventListener('scroll', throttled, { passive: true });
  return () => window.removeEventListener('scroll', throttled);
}

/**
 * Create a throttled requestAnimationFrame loop
 * @param callback Function to execute each frame
 * @param targetFPS Target FPS (default: 60, use 30 for low-end devices)
 * @returns Object with start and stop methods
 */
export function createThrottledRAF(
  callback: (deltaTime: number) => void,
  targetFPS: number = 60
): { start: () => void; stop: () => void; isRunning: () => boolean } {
  let rafId: number | null = null;
  let lastTime = 0;
  const frameInterval = 1000 / targetFPS;

  function animate(currentTime: number) {
    if (!lastTime) lastTime = currentTime;

    const deltaTime = currentTime - lastTime;

    if (deltaTime >= frameInterval) {
      // Execute callback with actual delta time
      callback(deltaTime);
      lastTime = currentTime - (deltaTime % frameInterval);
    }

    rafId = requestAnimationFrame(animate);
  }

  return {
    start: () => {
      if (rafId === null) {
        lastTime = 0;
        rafId = requestAnimationFrame(animate);
      }
    },
    stop: () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
        lastTime = 0;
      }
    },
    isRunning: () => rafId !== null,
  };
}
