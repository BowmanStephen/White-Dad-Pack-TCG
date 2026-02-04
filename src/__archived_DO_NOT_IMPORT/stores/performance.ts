/**
 * Performance Monitoring Store (PACK-102)
 *
 * Real-time performance monitoring with:
 * - FPS tracking
 * - Memory usage monitoring
 * - Bundle size tracking
 * - Page timing metrics
 * - Warning thresholds
 * - JSON export functionality
 */

import { atom, computed } from 'nanostores';
import type {
  PerformanceMetrics,
  PerformanceState,
  PerformanceWarning,
  PerformanceThresholds,
  MemoryMetrics,
  BundleMetrics,
  TimingMetrics,
} from '@/types';

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  fps: {
    low: 45,
    medium: 30,
  },
  memory: {
    low: 0.7, // 70%
    medium: 0.85, // 85%
  },
  bundle: {
    maxSize: 500 * 1024, // 500KB
  },
  timing: {
    maxLoadTime: 3000, // 3 seconds
  },
};

// ============================================================================
// STATE STORES
// ============================================================================

// Performance monitoring state
export const performanceState = atom<PerformanceState>({
  metrics: null,
  warnings: [],
  isMonitoring: false,
  lastUpdate: null,
});

// Performance thresholds (configurable)
export const performanceThresholds = atom<PerformanceThresholds>(DEFAULT_THRESHOLDS);

// Whether monitoring is active
export const isMonitoring = computed(
  [performanceState],
  (state) => state.isMonitoring
);

// Current metrics (or null if not monitoring)
export const currentMetrics = computed(
  [performanceState],
  (state) => state.metrics
);

// Active warnings
export const activeWarnings = computed(
  [performanceState],
  (state) => state.warnings
);

// Has high severity warnings
export const hasHighSeverityWarnings = computed(
  [performanceState],
  (state) => state.warnings.some(w => w.severity === 'high')
);

// ============================================================================
// FPS TRACKING
// ============================================================================

let fpsFrames = 0;
let fpsLastTime = performance.now();
let fpsRafId: number | null = null;
let currentFPS = 60;

function measureFPS(): number {
  fpsFrames++;
  const now = performance.now();

  if (now >= fpsLastTime + 1000) {
    currentFPS = Math.round((fpsFrames * 1000) / (now - fpsLastTime));
    fpsFrames = 0;
    fpsLastTime = now;
  }

  return currentFPS;
}

function startFPSMonitoring(): void {
  if (fpsRafId !== null) return;

  function loop() {
    measureFPS();
    fpsRafId = requestAnimationFrame(loop);
  }

  fpsRafId = requestAnimationFrame(loop);
}

function stopFPSMonitoring(): void {
  if (fpsRafId !== null) {
    cancelAnimationFrame(fpsRafId);
    fpsRafId = null;
  }
}

// ============================================================================
// MEMORY TRACKING
// ============================================================================

function getMemoryMetrics(): MemoryMetrics | null {
  if (typeof window === 'undefined') return null;

  // Check if performance.memory is available (Chrome-based browsers)
  const memory = (performance as any).memory;
  if (!memory) return null;

  const usedJSHeapSize = memory.usedJSHeapSize;
  const totalJSHeapSize = memory.totalJSHeapSize;
  const jsHeapSizeLimit = memory.jsHeapSizeLimit;

  return {
    usedJSHeapSize,
    totalJSHeapSize,
    jsHeapSizeLimit,
    usagePercentage: usedJSHeapSize / jsHeapSizeLimit,
  };
}

// ============================================================================
// BUNDLE TRACKING
// ============================================================================

let bundleMetricsCache: BundleMetrics | null = null;

async function getBundleMetrics(): Promise<BundleMetrics | null> {
  if (typeof window === 'undefined') return null;

  // Return cached metrics if available
  if (bundleMetricsCache) return bundleMetricsCache;

  try {
    // Get performance entries for resources
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    // Group by script/chunk
    const chunks = new Map<string, number>();

    for (const resource of resources) {
      if (resource.name.includes('.js') && !resource.name.includes('node_modules')) {
        // Extract chunk name from URL
        const urlParts = resource.name.split('/');
        const chunkName = urlParts[urlParts.length - 1];

        const currentSize = chunks.get(chunkName) || 0;
        chunks.set(chunkName, currentSize + resource.transferSize);
      }
    }

    // Calculate total size
    let totalSize = 0;
    let largestChunk = { name: 'N/A', size: 0 };

    for (const [name, size] of chunks.entries()) {
      totalSize += size;
      if (size > largestChunk.size) {
        largestChunk = { name, size };
      }
    }

    // Estimate compressed size (assume ~70% compression)
    const compressedSize = Math.round(totalSize * 0.7);

    bundleMetricsCache = {
      totalSize,
      compressedSize,
      chunkCount: chunks.size,
      largestChunk,
    };

    return bundleMetricsCache;
  } catch (error) {
    console.warn('[Performance] Failed to get bundle metrics:', error);
    return null;
  }
}

// ============================================================================
// TIMING METRICS
// ============================================================================

function getTimingMetrics(): TimingMetrics | null {
  if (typeof window === 'undefined') return null;

  try {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (!navigation) return null;

    // Paint timing
    const paintEntries = performance.getEntriesByType('paint');
    let firstPaint: number | null = null;
    let firstContentfulPaint: number | null = null;

    for (const entry of paintEntries) {
      if (entry.name === 'first-paint') {
        firstPaint = Math.round(entry.startTime);
      } else if (entry.name === 'first-contentful-paint') {
        firstContentfulPaint = Math.round(entry.startTime);
      }
    }

    return {
      domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
      loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
      firstPaint,
      firstContentfulPaint,
    };
  } catch (error) {
    console.warn('[Performance] Failed to get timing metrics:', error);
    return null;
  }
}

// ============================================================================
// WARNING CHECKING
// ============================================================================

function generateWarningId(): string {
  return `warning_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function checkWarnings(metrics: PerformanceMetrics, thresholds: PerformanceThresholds): PerformanceWarning[] {
  const warnings: PerformanceWarning[] = [];
  const now = Date.now();

  // Check FPS
  if (metrics.fps < thresholds.fps.medium) {
    warnings.push({
      id: generateWarningId(),
      type: 'fps',
      severity: 'high',
      message: `Critically low FPS: ${metrics.fps} (threshold: ${thresholds.fps.medium})`,
      timestamp: now,
      value: metrics.fps,
      threshold: thresholds.fps.medium,
    });
  } else if (metrics.fps < thresholds.fps.low) {
    warnings.push({
      id: generateWarningId(),
      type: 'fps',
      severity: 'medium',
      message: `Low FPS: ${metrics.fps} (threshold: ${thresholds.fps.low})`,
      timestamp: now,
      value: metrics.fps,
      threshold: thresholds.fps.low,
    });
  }

  // Check memory
  if (metrics.memory.usagePercentage > thresholds.memory.medium) {
    warnings.push({
      id: generateWarningId(),
      type: 'memory',
      severity: 'high',
      message: `Critical memory usage: ${(metrics.memory.usagePercentage * 100).toFixed(1)}% (threshold: ${thresholds.memory.medium * 100}%)`,
      timestamp: now,
      value: metrics.memory.usagePercentage,
      threshold: thresholds.memory.medium,
    });
  } else if (metrics.memory.usagePercentage > thresholds.memory.low) {
    warnings.push({
      id: generateWarningId(),
      type: 'memory',
      severity: 'low',
      message: `High memory usage: ${(metrics.memory.usagePercentage * 100).toFixed(1)}% (threshold: ${thresholds.memory.low * 100}%)`,
      timestamp: now,
      value: metrics.memory.usagePercentage,
      threshold: thresholds.memory.low,
    });
  }

  // Check bundle size
  if (metrics.bundle.totalSize > thresholds.bundle.maxSize) {
    warnings.push({
      id: generateWarningId(),
      type: 'bundle',
      severity: 'medium',
      message: `Bundle size exceeds limit: ${formatBytes(metrics.bundle.totalSize)} (max: ${formatBytes(thresholds.bundle.maxSize)})`,
      timestamp: now,
      value: metrics.bundle.totalSize,
      threshold: thresholds.bundle.maxSize,
    });
  }

  // Check timing
  if (metrics.timing.loadComplete > thresholds.timing.maxLoadTime) {
    warnings.push({
      id: generateWarningId(),
      type: 'timing',
      severity: 'medium',
      message: `Slow page load: ${metrics.timing.loadComplete}ms (max: ${thresholds.timing.maxLoadTime}ms)`,
      timestamp: now,
      value: metrics.timing.loadComplete,
      threshold: thresholds.timing.maxLoadTime,
    });
  }

  return warnings;
}

// ============================================================================
// METRICS COLLECTION
// ============================================================================

async function collectMetrics(): Promise<PerformanceMetrics | null> {
  if (typeof window === 'undefined') return null;

  const fps = currentFPS;
  const memory = getMemoryMetrics();
  const bundle = await getBundleMetrics();
  const timing = getTimingMetrics();

  if (!memory || !bundle || !timing) {
    console.warn('[Performance] Some metrics unavailable');
    return null;
  }

  return {
    fps,
    memory,
    bundle,
    timing,
    timestamp: Date.now(),
  };
}

// ============================================================================
// MONITORING CONTROL
// ============================================================================

let updateInterval: number | null = null;

/**
 * Start performance monitoring
 */
export async function startMonitoring(updateIntervalMs: number = 1000): Promise<void> {
  if (performanceState.get().isMonitoring) {
    console.warn('[Performance] Monitoring already active');
    return;
  }

  // Only enable in development
  if (!import.meta.env.DEV) {
    console.warn('[Performance] Monitoring only available in development mode');
    return;
  }

  console.log('[Performance] Starting monitoring...');

  // Start FPS tracking
  startFPSMonitoring();

  // Initial metrics collection
  const metrics = await collectMetrics();
  if (!metrics) {
    console.error('[Performance] Failed to collect initial metrics');
    return;
  }

  const thresholds = performanceThresholds.get();
  const warnings = checkWarnings(metrics, thresholds);

  performanceState.set({
    metrics,
    warnings,
    isMonitoring: true,
    lastUpdate: Date.now(),
  });

  // Set up periodic updates
  updateInterval = window.setInterval(async () => {
    const newMetrics = await collectMetrics();
    if (!newMetrics) return;

    const currentThresholds = performanceThresholds.get();
    const newWarnings = checkWarnings(newMetrics, currentThresholds);

    performanceState.set({
      metrics: newMetrics,
      warnings: newWarnings,
      isMonitoring: true,
      lastUpdate: Date.now(),
    });
  }, updateIntervalMs);

  console.log('[Performance] Monitoring started');
}

/**
 * Stop performance monitoring
 */
export function stopMonitoring(): void {
  if (!performanceState.get().isMonitoring) {
    console.warn('[Performance] Monitoring not active');
    return;
  }

  console.log('[Performance] Stopping monitoring...');

  // Stop FPS tracking
  stopFPSMonitoring();

  // Clear update interval
  if (updateInterval !== null) {
    clearInterval(updateInterval);
    updateInterval = null;
  }

  // Update state
  performanceState.set({
    metrics: performanceState.get().metrics,
    warnings: [],
    isMonitoring: false,
    lastUpdate: Date.now(),
  });

  console.log('[Performance] Monitoring stopped');
}

/**
 * Update performance thresholds
 */
export function updateThresholds(updates: Partial<PerformanceThresholds>): void {
  const current = performanceThresholds.get();
  performanceThresholds.set({
    ...current,
    ...updates,
    fps: { ...current.fps, ...updates.fps },
    memory: { ...current.memory, ...updates.memory },
    bundle: { ...current.bundle, ...updates.bundle },
    timing: { ...current.timing, ...updates.timing },
  });
}

/**
 * Clear all warnings
 */
export function clearWarnings(): void {
  const state = performanceState.get();
  performanceState.set({
    ...state,
    warnings: [],
  });
}

/**
 * Export metrics as JSON
 */
export function exportMetricsAsJSON(): string {
  const state = performanceState.get();

  if (!state.metrics) {
    throw new Error('No metrics to export');
  }

  const exportData = {
    timestamp: new Date().toISOString(),
    metrics: state.metrics,
    warnings: state.warnings,
    thresholds: performanceThresholds.get(),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download metrics as JSON file
 */
export function downloadMetricsJSON(): void {
  const state = performanceState.get();

  if (!state.metrics) {
    console.error('[Performance] No metrics to download');
    return;
  }

  try {
    const json = exportMetricsAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    console.log('[Performance] Metrics downloaded');
  } catch (error) {
    console.error('[Performance] Failed to download metrics:', error);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Format milliseconds to human-readable format
 */
export function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Auto-start monitoring in development mode
if (import.meta.env.DEV && typeof window !== 'undefined') {
  // Start monitoring after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      startMonitoring(1000);
    }, 1000);
  });
}
