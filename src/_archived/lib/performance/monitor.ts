/**
 * PACK-100: Performance Monitoring Utility
 *
 * Runtime performance monitoring for animation frame rates,
 * rendering times, and GPU acceleration detection.
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  droppedFrames: number;
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
}

export interface PerformanceReport {
  timestamp: number;
  duration: number;
  metrics: PerformanceMetrics;
  deviceInfo: DeviceInfo;
  animation: string;
}

export interface DeviceInfo {
  userAgent: string;
  hardwareConcurrency: number | undefined;
  deviceMemory: number | undefined;
  isMobile: boolean;
  isLowEnd: boolean;
}

/**
 * Performance monitor for tracking animation performance
 */
export class PerformanceMonitor {
  private fpsMeter: ReturnType<typeof import('../utils/performance').createFPSMeter>;
  private frameTimes: number[] = [];
  private droppedFrames = 0;
  private startTime = 0;
  private isMonitoring = false;
  private rafId: number | null = null;

  constructor() {
    // Dynamic import to avoid circular dependency
    const { createFPSMeter } = require('../utils/performance');
    this.fpsMeter = createFPSMeter();
  }

  /**
   * Start monitoring performance
   */
  start(): void {
    if (this.isMonitoring) return;

    this.startTime = performance.now();
    this.frameTimes = [];
    this.droppedFrames = 0;
    this.isMonitoring = true;

    this.rafId = requestAnimationFrame(this.measureFrame.bind(this));
  }

  /**
   * Stop monitoring and return metrics
   */
  stop(): PerformanceMetrics {
    if (!this.isMonitoring) {
      return this.getMetrics();
    }

    this.isMonitoring = false;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    return this.getMetrics();
  }

  /**
   * Measure individual frame
   */
  private measureFrame(): void {
    if (!this.isMonitoring) return;

    const frameStart = performance.now();
    const fps = this.fpsMeter.measure();
    const frameTime = 1000 / fps;

    this.frameTimes.push(frameTime);

    // Track dropped frames (below 30fps)
    if (fps < 30) {
      this.droppedFrames++;
    }

    this.rafId = requestAnimationFrame(this.measureFrame.bind(this));
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    const fps = this.fpsMeter.getFPS();

    if (this.frameTimes.length === 0) {
      return {
        fps,
        frameTime: 0,
        droppedFrames: 0,
        averageFPS: fps,
        minFPS: fps,
        maxFPS: fps,
      };
    }

    const averageFPS = this.frameTimes.length > 0
      ? 1000 / (this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length)
      : fps;

    const minFPS = this.frameTimes.length > 0
      ? 1000 / Math.max(...this.frameTimes)
      : fps;

    const maxFPS = this.frameTimes.length > 0
      ? 1000 / Math.min(...this.frameTimes)
      : fps;

    return {
      fps,
      frameTime: this.frameTimes[this.frameTimes.length - 1] || 0,
      droppedFrames: this.droppedFrames,
      averageFPS,
      minFPS,
      maxFPS,
    };
  }

  /**
   * Generate performance report
   */
  generateReport(animation: string): PerformanceReport {
    const metrics = this.getMetrics();
    const duration = performance.now() - this.startTime;

    return {
      timestamp: Date.now(),
      duration,
      metrics,
      deviceInfo: this.getDeviceInfo(),
      animation,
    };
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): DeviceInfo {
    return {
      userAgent: navigator.userAgent,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ),
      isLowEnd: this.isLowEndDevice(),
    };
  }

  /**
   * Check if device is low-end
   */
  private isLowEndDevice(): boolean {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    const memoryLimit =
      'deviceMemory' in navigator &&
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory !== undefined &&
      (navigator as Navigator & { deviceMemory: number }).deviceMemory < 4;

    const slowCPU =
      'hardwareConcurrency' in navigator &&
      navigator.hardwareConcurrency !== undefined &&
      navigator.hardwareConcurrency < 4;

    return isMobile || memoryLimit || slowCPU;
  }
}

/**
 * Global performance monitor instance
 */
let globalMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = new PerformanceMonitor();
  }
  return globalMonitor;
}

/**
 * Monitor animation performance
 * @param animation Animation name
 * @param fn Animation function to monitor
 * @returns Result with performance metrics
 */
export async function monitorAnimation<T>(
  animation: string,
  fn: () => Promise<T> | T
): Promise<{ result: T; report: PerformanceReport }> {
  const monitor = getPerformanceMonitor();
  monitor.start();

  try {
    const result = await fn();
    const report = monitor.generateReport(animation);
    return { result, report };
  } finally {
    monitor.stop();
  }
}

/**
 * Log performance report to console (development only)
 */
export function logPerformanceReport(report: PerformanceReport): void {
  if (import.meta.env.DEV) {
    console.group(`🎬 Performance Report: ${report.animation}`);
    console.log(`📊 FPS: ${report.metrics.fps} (avg: ${report.metrics.averageFPS.toFixed(1)})`);
    console.log(`⏱️ Frame Time: ${report.metrics.frameTime.toFixed(2)}ms`);
    console.log(`📉 Dropped Frames: ${report.metrics.droppedFrames}`);
    console.log(`💻 Device: ${report.deviceInfo.isMobile ? 'Mobile' : 'Desktop'}`);
    console.log(`🔧 Cores: ${report.deviceInfo.hardwareConcurrency || 'Unknown'}`);
    console.log(`💾 RAM: ${report.deviceInfo.deviceMemory ? `${report.deviceInfo.deviceMemory}GB` : 'Unknown'}`);
    console.log(`⚡ Low-End: ${report.deviceInfo.isLowEnd ? 'Yes' : 'No'}`);
    console.groupEnd();
  }
}

/**
 * Check if performance meets 60fps target
 */
export function meets60fpsTarget(report: PerformanceReport): boolean {
  const { averageFPS, droppedFrames } = report.metrics;
  const durationSeconds = report.duration / 1000;
  const totalFrames = durationSeconds * 60;
  const droppedFramePercentage = (droppedFrames / totalFrames) * 100;

  // Target: Average FPS >= 55 (allowing 8% variance)
  // Target: Dropped frames < 5%
  return averageFPS >= 55 && droppedFramePercentage < 5;
}

/**
 * Check if performance meets 30fps target (low-end devices)
 */
export function meets30fpsTarget(report: PerformanceReport): boolean {
  const { averageFPS, droppedFrames } = report.metrics;
  const durationSeconds = report.duration / 1000;
  const totalFrames = durationSeconds * 30;
  const droppedFramePercentage = (droppedFrames / totalFrames) * 100;

  // Target: Average FPS >= 27 (allowing 10% variance)
  // Target: Dropped frames < 10%
  return averageFPS >= 27 && droppedFramePercentage < 10;
}
