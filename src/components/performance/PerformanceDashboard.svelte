<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    performanceState,
    currentMetrics,
    activeWarnings,
    hasHighSeverityWarnings,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    downloadMetricsJSON,
    exportMetricsAsJSON,
    clearWarnings,
    formatBytes,
    formatMs,
  } from '@/stores/performance';

  let showWarnings = $state(false);
  let autoRefresh = $state(true);
  let refreshInterval: number | null = null;

  onMount(() => {
    // Auto-refresh every 2 seconds
    if (autoRefresh) {
      refreshInterval = window.setInterval(() => {
        // Metrics auto-update via store, just trigger reactivity
        performanceState.get();
      }, 2000);
    }
  });

  onDestroy(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });

  function handleDownload() {
    try {
      downloadMetricsJSON();
    } catch (error) {
      console.error('Failed to download metrics:', error);
      alert('Failed to download metrics. Please try again.');
    }
  }

  function handleCopyToClipboard() {
    try {
      const json = exportMetricsAsJSON();
      navigator.clipboard.writeText(json);
      alert('Metrics copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy metrics:', error);
      alert('Failed to copy metrics. Please try again.');
    }
  }

  function getSeverityColor(severity: string): string {
    switch (severity) {
      case 'high':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  }

  function getFPSColor(fps: number): string {
    if (fps < 30) return 'text-red-400';
    if (fps < 45) return 'text-yellow-400';
    return 'text-green-400';
  }

  function getMemoryColor(percentage: number): string {
    if (percentage > 0.85) return 'text-red-400';
    if (percentage > 0.7) return 'text-yellow-400';
    return 'text-green-400';
  }
</script>

<div class="performance-dashboard">
  <!-- Header -->
  <div class="dashboard-header">
    <div class="header-left">
      <h2 class="text-2xl font-bold text-white mb-1">Performance Dashboard</h2>
      <p class="text-sm text-gray-400">
        {#if $isMonitoring}
          <span class="text-green-400">● Monitoring Active</span>
        {:else}
          <span class="text-gray-500">○ Monitoring Inactive</span>
        {/if}
      </p>
    </div>

    <div class="header-actions flex gap-2">
      <button
        onclick={clearWarnings}
        class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
        disabled={$activeWarnings.length === 0}
      >
        Clear Warnings
      </button>
      <button
        onclick={handleCopyToClipboard}
        class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium"
        disabled={!($currentMetrics && $isMonitoring)}
      >
        Copy JSON
      </button>
      <button
        onclick={handleDownload}
        class="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors text-sm font-medium"
        disabled={!($currentMetrics && $isMonitoring)}
      >
        Download JSON
      </button>
    </div>
  </div>

  <!-- High Severity Warning Banner -->
  {#if $hasHighSeverityWarnings}
    <div class="warning-banner high-severity">
      <div class="warning-icon">⚠️</div>
      <div class="warning-content">
        <h3 class="warning-title">High Severity Warnings Detected</h3>
        <p class="warning-message">
          Performance issues detected. Review warnings below for details.
        </p>
      </div>
    </div>
  {/if}

  <!-- Metrics Grid -->
  {#if $currentMetrics}
    <div class="metrics-grid">
      <!-- FPS Card -->
      <div class="metric-card">
        <div class="metric-header">
          <h3 class="metric-title">Frame Rate</h3>
          <span class="metric-icon" class:fps-good={$currentMetrics.fps >= 45} class:fps-warning={$currentMetrics.fps < 45 && $currentMetrics.fps >= 30} class:fps-critical={$currentMetrics.fps < 30}>
            {#if $currentMetrics.fps < 30}
              🐌
            {:else if $currentMetrics.fps < 45}
              ⚠️
            {:else}
              🚀
            {/if}
          </span>
        </div>
        <div class="metric-value">
          <span class={getFPSColor($currentMetrics.fps)}>
            {$currentMetrics.fps}
          </span>
          <span class="metric-unit">FPS</span>
        </div>
        <div class="metric-status">
          {#if $currentMetrics.fps >= 45}
            <span class="status-good">Excellent</span>
          {:else if $currentMetrics.fps >= 30}
            <span class="status-warning">Acceptable</span>
          {:else}
            <span class="status-critical">Critical</span>
          {/if}
        </div>
      </div>

      <!-- Memory Card -->
      <div class="metric-card">
        <div class="metric-header">
          <h3 class="metric-title">Memory Usage</h3>
          <span class="metric-icon">💾</span>
        </div>
        <div class="metric-value">
          <span class={getMemoryColor($currentMetrics.memory.usagePercentage)}>
            {($currentMetrics.memory.usagePercentage * 100).toFixed(1)}%
          </span>
          <span class="metric-unit">Used</span>
        </div>
        <div class="metric-details">
          <div class="detail-item">
            <span class="detail-label">Used:</span>
            <span class="detail-value">{formatBytes($currentMetrics.memory.usedJSHeapSize)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Total:</span>
            <span class="detail-value">{formatBytes($currentMetrics.memory.totalJSHeapSize)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Limit:</span>
            <span class="detail-value">{formatBytes($currentMetrics.memory.jsHeapSizeLimit)}</span>
          </div>
        </div>
      </div>

      <!-- Bundle Card -->
      <div class="metric-card">
        <div class="metric-header">
          <h3 class="metric-title">Bundle Size</h3>
          <span class="metric-icon">📦</span>
        </div>
        <div class="metric-value">
          <span>{formatBytes($currentMetrics.bundle.totalSize)}</span>
          <span class="metric-unit">Total</span>
        </div>
        <div class="metric-details">
          <div class="detail-item">
            <span class="detail-label">Compressed:</span>
            <span class="detail-value">{formatBytes($currentMetrics.bundle.compressedSize)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Chunks:</span>
            <span class="detail-value">{$currentMetrics.bundle.chunkCount}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Largest:</span>
            <span class="detail-value">{$currentMetrics.bundle.largestChunk.name} ({formatBytes($currentMetrics.bundle.largestChunk.size)})</span>
          </div>
        </div>
      </div>

      <!-- Timing Card -->
      <div class="metric-card">
        <div class="metric-header">
          <h3 class="metric-title">Page Timing</h3>
          <span class="metric-icon">⏱️</span>
        </div>
        <div class="metric-value">
          <span>{formatMs($currentMetrics.timing.loadComplete)}</span>
          <span class="metric-unit">Load Time</span>
        </div>
        <div class="metric-details">
          <div class="detail-item">
            <span class="detail-label">DOM Ready:</span>
            <span class="detail-value">{formatMs($currentMetrics.timing.domContentLoaded)}</span>
          </div>
          {#if $currentMetrics.timing.firstPaint}
            <div class="detail-item">
              <span class="detail-label">First Paint:</span>
              <span class="detail-value">{formatMs($currentMetrics.timing.firstPaint)}</span>
            </div>
          {/if}
          {#if $currentMetrics.timing.firstContentfulPaint}
            <div class="detail-item">
              <span class="detail-label">First Contentful:</span>
              <span class="detail-value">{formatMs($currentMetrics.timing.firstContentfulPaint)}</span>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Warnings Section -->
    {#if $activeWarnings.length > 0}
      <div class="warnings-section">
        <div class="warnings-header">
          <h3 class="text-xl font-bold text-white mb-2">Warnings ({$activeWarnings.length})</h3>
          <button
            onclick={() => showWarnings = !showWarnings}
            class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showWarnings ? 'Hide' : 'Show'}
          </button>
        </div>

        {#if showWarnings}
          <div class="warnings-list">
            {#each $activeWarnings as warning (warning.id)}
              <div class="warning-item {getSeverityColor(warning.severity)}">
                <div class="warning-header">
                  <span class="warning-type uppercase text-xs font-bold">{warning.type}</span>
                  <span class="warning-severity uppercase text-xs font-bold">{warning.severity}</span>
                </div>
                <div class="warning-message">{warning.message}</div>
                <div class="warning-details">
                  <span class="text-gray-400 text-sm">
                    Value: {warning.type === 'memory' ? (warning.value * 100).toFixed(1) + '%' : warning.value}
                    / Threshold: {warning.type === 'memory' ? (warning.threshold * 100).toFixed(1) + '%' : warning.threshold}
                  </span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Last Update -->
    <div class="last-update">
      <span class="text-gray-400 text-sm">
        Last updated: {new Date($performanceState.lastUpdate || 0).toLocaleTimeString()}
      </span>
    </div>
  {:else}
    <!-- No Metrics State -->
    <div class="no-metrics">
      <div class="no-metrics-icon">📊</div>
      <h3 class="text-xl font-bold text-white mb-2">No Metrics Available</h3>
      <p class="text-gray-400 mb-4">
        {#if !$isMonitoring}
          Performance monitoring is not active. Click the button below to start monitoring.
        {:else}
          Collecting initial metrics...
        {/if}
      </p>
      {#if !$isMonitoring}
        <button
          onclick={() => startMonitoring()}
          class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
        >
          Start Monitoring
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .performance-dashboard {
    padding: 1.5rem;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-radius: 1rem;
    min-height: 600px;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .header-left {
    flex: 1;
    min-width: 200px;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .warning-banner {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid;
  }

  .warning-banner.high-severity {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
  }

  .warning-icon {
    font-size: 1.5rem;
  }

  .warning-content :global(.warning-title) {
    font-weight: 600;
    color: #f87171;
    margin: 0;
  }

  .warning-content :global(.warning-message) {
    color: #fca5a5;
    font-size: 0.875rem;
    margin: 0.25rem 0 0 0;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .metric-card {
    background: rgba(51, 65, 85, 0.5);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 0.75rem;
    padding: 1.5rem;
    backdrop-filter: blur(10px);
  }

  .metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .metric-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #cbd5e1;
    margin: 0;
  }

  .metric-icon {
    font-size: 1.5rem;
  }

  .metric-value {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .metric-value > span:first-child {
    font-size: 2rem;
    font-weight: 700;
  }

  .metric-unit {
    font-size: 0.875rem;
    color: #94a3b8;
    font-weight: 500;
  }

  .metric-status {
    display: flex;
    gap: 0.5rem;
  }

  .metric-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(148, 163, 184, 0.1);
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
  }

  .detail-label {
    color: #94a3b8;
  }

  .detail-value {
    color: #e2e8f0;
    font-weight: 500;
  }

  .status-good {
    color: #4ade80;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .status-warning {
    color: #facc15;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .status-critical {
    color: #f87171;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .warnings-section {
    background: rgba(51, 65, 85, 0.3);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .warnings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .warnings-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .warning-item {
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid;
  }

  .warning-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .warning-type {
    font-weight: 600;
  }

  .warning-severity {
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    background: rgba(0, 0, 0, 0.2);
  }

  .warning-message {
    color: inherit;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .warning-details {
    font-size: 0.75rem;
  }

  .last-update {
    text-align: center;
    padding-top: 1rem;
    border-top: 1px solid rgba(148, 163, 184, 0.1);
  }

  .no-metrics {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 4rem 2rem;
  }

  .no-metrics-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  @media (max-width: 768px) {
    .performance-dashboard {
      padding: 1rem;
    }

    .metrics-grid {
      grid-template-columns: 1fr;
    }

    .dashboard-header {
      flex-direction: column;
    }

    .header-actions {
      width: 100%;
      justify-content: stretch;
    }

    .header-actions button {
      flex: 1;
    }
  }
</style>
