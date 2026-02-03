<script lang="ts">
  /**
   * Performance Monitor Component
   *
   * Real-time FPS and frame time monitoring for particle system testing.
   * Use this component during development to profile performance on target devices.
   *
   * Usage:
   *   <PerformanceMonitor client:load />
   *
   * Features:
   *   - Real-time FPS counter
   *   - Frame time measurement (min/max/avg)
   *   - Device capability detection
   *   - Performance rating (excellent/good/fair/poor)
   *   - Console logging for detailed analysis
   */

  import { onMount, onDestroy } from 'svelte';
  import { createFPSMeter, isLowEndDevice } from '../../lib/utils/performance';

  // FPS meter state
  let currentFPS = $state(60);
  let fpsHistory = $state<number[]>([]);
  let isMonitoring = $state(false);

  // Frame time metrics
  let minFrameTime = $state(16.67);
  let maxFrameTime = $state(16.67);
  let avgFrameTime = $state(16.67);
  let frameSamples = $state(0);

  // Device info
  let deviceInfo = $state<{
    type: string;
    os: string;
    memory?: number;
    cores?: number;
    pixelRatio: number;
  }>({
    type: 'unknown',
    os: 'unknown',
    pixelRatio: 1
  });

  // Performance rating
  let performanceRating = $state<'excellent' | 'good' | 'fair' | 'poor'>('excellent');

  // FPS meter instance
  let fpsMeter: ReturnType<typeof createFPSMeter> | null = null;
  let monitoringInterval: ReturnType<typeof setInterval> | null = null;

  // FPS limit for history (last 60 readings = ~1 second at 60fps)
  const MAX_HISTORY = 60;

  onMount(() => {
    // Detect device capabilities
    detectDevice();

    // Create FPS meter
    fpsMeter = createFPSMeter();

    // Start monitoring
    startMonitoring();

    // Log initial device info
    console.group('🚀 Performance Monitor Initialized');
    console.log('Device:', deviceInfo);
    console.log('Low-end device:', isLowEndDevice());
    console.log('Pixel ratio:', window.devicePixelRatio);
    console.log('Screen size:', `${window.screen.width}x${window.screen.height}`);
    console.groupEnd();
  });

  onDestroy(() => {
    stopMonitoring();
  });

  function detectDevice() {
    const ua = navigator.userAgent;

    // Detect device type
    let type = 'desktop';
    if (/Mobile|Android|iPhone|iPad/i.test(ua)) {
      type = window.screen.width < 768 ? 'mobile' : 'tablet';
    }

    // Detect OS
    let os = 'unknown';
    if (/Android/i.test(ua)) os = 'android';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'ios';
    else if (/Windows/i.test(ua)) os = 'windows';
    else if (/Macintosh|Mac OS/i.test(ua)) os = 'macos';
    else if (/Linux/i.test(ua)) os = 'linux';

    deviceInfo = {
      type,
      os,
      // @ts-expect-error - deviceMemory not in all browsers
      memory: navigator.deviceMemory,
      cores: navigator.hardwareConcurrency,
      pixelRatio: window.devicePixelRatio || 1
    };
  }

  function startMonitoring() {
    if (isMonitoring) return;
    isMonitoring = true;

    // Update FPS every 100ms
    monitoringInterval = setInterval(() => {
      if (!fpsMeter) return;

      // Measure current FPS
      currentFPS = fpsMeter.measure();

      // Update FPS history
      fpsHistory = [...fpsHistory, currentFPS];
      if (fpsHistory.length > MAX_HISTORY) {
        fpsHistory.shift();
      }

      // Calculate frame time from FPS
      const frameTime = currentFPS > 0 ? 1000 / currentFPS : 0;

      // Update frame time metrics
      if (frameSamples === 0) {
        minFrameTime = frameTime;
        maxFrameTime = frameTime;
        avgFrameTime = frameTime;
      } else {
        minFrameTime = Math.min(minFrameTime, frameTime);
        maxFrameTime = Math.max(maxFrameTime, frameTime);
        avgFrameTime = (avgFrameTime * frameSamples + frameTime) / (frameSamples + 1);
      }
      frameSamples++;

      // Calculate performance rating
      updatePerformanceRating();

    }, 100);
  }

  function stopMonitoring() {
    isMonitoring = false;
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      monitoringInterval = null;
    }
  }

  function toggleMonitoring() {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  }

  function resetMetrics() {
    fpsHistory = [];
    minFrameTime = 16.67;
    maxFrameTime = 16.67;
    avgFrameTime = 16.67;
    frameSamples = 0;
  }

  function updatePerformanceRating() {
    if (currentFPS >= 55) {
      performanceRating = 'excellent';
    } else if (currentFPS >= 45) {
      performanceRating = 'good';
    } else if (currentFPS >= 30) {
      performanceRating = 'fair';
    } else {
      performanceRating = 'poor';
    }
  }

  function logDetailedMetrics() {
    console.group('📊 Performance Metrics (Detailed)');
    console.log(`Current FPS: ${currentFPS}`);
    console.log(`Frame Time: ${minFrameTime.toFixed(2)}ms / ${avgFrameTime.toFixed(2)}ms / ${maxFrameTime.toFixed(2)}ms (min/avg/max)`);
    console.log(`Frame Samples: ${frameSamples}`);
    console.log(`FPS History (last ${fpsHistory.length}):`, fpsHistory);
    console.log('Performance Rating:', performanceRating.toUpperCase());
    console.log('Device Info:', deviceInfo);
    console.groupEnd();
  }

  function getRatingColor() {
    switch (performanceRating) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
    }
  }

  function getRatingBgColor() {
    switch (performanceRating) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
    }
  }
</script>

<div class="performance-monitor fixed top-4 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-xl text-sm font-mono">
  <div class="flex items-center justify-between mb-3">
    <h3 class="text-lg font-bold">Performance Monitor</h3>
    <div class="flex gap-2">
      <button
        onclick={toggleMonitoring}
        class="px-3 py-1 rounded {isMonitoring ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}"
      >
        {isMonitoring ? 'Stop' : 'Start'}
      </button>
      <button
        onclick={resetMetrics}
        class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
      >
        Reset
      </button>
    </div>
  </div>

  <!-- FPS Display -->
  <div class="mb-3">
    <div class="flex items-center justify-between">
      <span class="text-gray-400">FPS:</span>
      <span class="text-2xl font-bold {getRatingColor()}">{currentFPS}</span>
    </div>
    <div class="mt-1 h-2 bg-gray-700 rounded-full overflow-hidden">
      <div
        class="h-full {getRatingBgColor()} transition-all duration-300"
        style="width: {Math.min((currentFPS / 60) * 100, 100)}%"
      ></div>
    </div>
  </div>

  <!-- Performance Rating -->
  <div class="mb-3">
    <div class="flex items-center justify-between">
      <span class="text-gray-400">Rating:</span>
      <span class="font-bold {getRatingColor()} uppercase">{performanceRating}</span>
    </div>
  </div>

  <!-- Frame Time Metrics -->
  <div class="mb-3 text-xs">
    <div class="text-gray-400 mb-1">Frame Time (ms):</div>
    <div class="grid grid-cols-3 gap-2">
      <div class="text-center">
        <div class="text-gray-500">Min</div>
        <div class="font-bold">{minFrameTime.toFixed(2)}</div>
      </div>
      <div class="text-center">
        <div class="text-gray-500">Avg</div>
        <div class="font-bold">{avgFrameTime.toFixed(2)}</div>
      </div>
      <div class="text-center">
        <div class="text-gray-500">Max</div>
        <div class="font-bold">{maxFrameTime.toFixed(2)}</div>
      </div>
    </div>
  </div>

  <!-- Device Info -->
  <div class="mb-3 text-xs border-t border-gray-700 pt-3">
    <div class="grid grid-cols-2 gap-2">
      <div>
        <span class="text-gray-400">Type:</span>
        <span class="ml-1">{deviceInfo.type}</span>
      </div>
      <div>
        <span class="text-gray-400">OS:</span>
        <span class="ml-1">{deviceInfo.os}</span>
      </div>
      {#if deviceInfo.memory}
        <div>
          <span class="text-gray-400">RAM:</span>
          <span class="ml-1">{deviceInfo.memory}GB</span>
        </div>
      {/if}
      {#if deviceInfo.cores}
        <div>
          <span class="text-gray-400">CPU:</span>
          <span class="ml-1">{deviceInfo.cores} cores</span>
        </div>
      {/if}
      <div class="col-span-2">
        <span class="text-gray-400">Pixel Ratio:</span>
        <span class="ml-1">{deviceInfo.pixelRatio}x</span>
      </div>
    </div>
  </div>

  <!-- Actions -->
  <div class="flex gap-2">
    <button
      onclick={logDetailedMetrics}
      class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs"
    >
      Log to Console
    </button>
  </div>

  <!-- Instructions -->
  <div class="mt-3 text-xs text-gray-400 border-t border-gray-700 pt-3">
    <div class="mb-1 font-bold text-gray-300">How to Use:</div>
    <ol class="list-decimal list-inside space-y-1">
      <li>Click "Start" to begin monitoring</li>
      <li>Trigger particle effects (open pack)</li>
      <li>Watch FPS during particle burst</li>
      <li>Click "Log to Console" for details</li>
    </ol>
  </div>
</div>

<style>
  .performance-monitor {
    min-width: 300px;
    max-width: 400px;
    font-family: 'Courier New', monospace;
  }
</style>
