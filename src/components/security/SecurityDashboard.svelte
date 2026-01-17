<!--
  Security Dashboard Component

  Admin interface for monitoring security events:
  - Real-time violation tracking
  - Ban management
  - Rate limit status
  - Audit log viewer
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import {
    securityStats,
    sessionViolations,
    getSecurityStats,
    clearSessionViolations,
  } from '../../stores/security';
  import {
    getActiveBans,
    getTopOffenders,
    getRecentLogs,
    getViolationStats,
    getLogStats,
    type AuditLogEntry,
  } from '../../lib/security/audit-logger';
  import { isBanned, unban } from '../../lib/security/ban-system';
  import type { BanStatus, SecurityViolation } from '../../types/security';

  // State
  let showDashboard = $state(false);
  let refreshInterval: ReturnType<typeof setInterval> | null = null;

  // Computed values
  const stats = $derived(getSecurityStats());
  const violations = $derived(sessionViolations.get());
  const activeBans = $state<Array<{
    fingerprint: string;
    reason: string;
    expiresAt?: Date;
    permanent: boolean;
    violationCount: number;
  }>>([]);
  const topOffenders = $state<Array<{
    fingerprint: string;
    violationCount: number;
    lastViolation: Date;
  }>>([]);
  const recentLogs = $state<AuditLogEntry[]>([]);
  const logStats = $state(getLogStats());

  // Formatters
  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  }

  function formatFingerprint(fp: string): string {
    return `${fp.substring(0, 8)}...${fp.substring(fp.length - 8)}`;
  }

  function getSeverityColor(severity: SecurityViolation['severity']): string {
    const colors = {
      low: 'text-gray-600 bg-gray-100',
      medium: 'text-yellow-700 bg-yellow-100',
      high: 'text-orange-700 bg-orange-100',
      critical: 'text-red-700 bg-red-100',
    };
    return colors[severity];
  }

  // Actions
  async function refreshData() {
    activeBans = getActiveBans();
    topOffenders = getTopOffenders(10);
    recentLogs = getRecentLogs(50);
  }

  function handleUnban(fingerprint: string) {
    if (confirm(`Unban ${formatFingerprint(fingerprint)}?`)) {
      unban(fingerprint, 'Manual unban via dashboard');
      refreshData();
    }
  }

  function handleClearViolations() {
    if (confirm('Clear all session violations?')) {
      clearSessionViolations();
    }
  }

  function handleExportLogs() {
    const { exportLogs } = require('../../lib/security/audit-logger');
    const logs = exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Lifecycle
  onMount(() => {
    refreshData();
    refreshInterval = setInterval(refreshData, 5000); // Refresh every 5s
  });

  // Cleanup
  $effect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  });
</script>

<div class="security-dashboard">
  <!-- Toggle Button -->
  <button
    onclick={() => (showDashboard = !showDashboard)}
    class="toggle-button"
    aria-label="Toggle security dashboard"
  >
    {showDashboard ? '✕ Close' : '🔒 Security'}
  </button>

  {#if showDashboard}
    <div class="dashboard-content">
      <!-- Overview Stats -->
      <section class="stats-grid">
        <div class="stat-card">
          <h3>Total Violations</h3>
          <p class="stat-value">{stats.totalViolations}</p>
        </div>
        <div class="stat-card">
          <h3>Active Bans</h3>
          <p class="stat-value">{stats.activeBans}</p>
        </div>
        <div class="stat-card">
          <h3>Rate Limit Blocks</h3>
          <p class="stat-value">{stats.rateLimitBlocks}</p>
        </div>
        <div class="stat-card">
          <h3>Avg Violations/Day</h3>
          <p class="stat-value">{stats.averageViolationsPerDay.toFixed(1)}</p>
        </div>
      </section>

      <!-- Violation Breakdown -->
      <section class="violations-section">
        <h2>Violation Types</h2>
        <div class="violation-types">
          {#each Object.entries(stats.topViolationTypes) as [type, count]}
            {#if count > 0}
              <div class="violation-type">
                <span class="violation-name">{type.replace(/_/g, ' ')}</span>
                <span class="violation-count">{count}</span>
              </div>
            {/if}
          {/each}
        </div>
      </section>

      <!-- Active Bans -->
      <section class="bans-section">
        <div class="section-header">
          <h2>Active Bans ({activeBans.length})</h2>
        </div>
        <div class="bans-list">
          {#if activeBans.length === 0}
            <p class="empty-state">No active bans</p>
          {:else}
            {#each activeBans as ban}
              <div class="ban-item">
                <div class="ban-info">
                  <code class="fingerprint">{formatFingerprint(ban.fingerprint)}</code>
                  <span class="ban-reason">{ban.reason}</span>
                  <span class="ban-violations">{ban.violationCount} violations</span>
                  {#if ban.expiresAt}
                    <span class="ban-expires">
                      Expires: {formatDate(ban.expiresAt)}
                      ({formatDuration(ban.expiresAt.getTime() - Date.now())})
                    </span>
                  {:else}
                    <span class="ban-permanent">Permanent</span>
                  {/if}
                </div>
                <button
                  onclick={() => handleUnban(ban.fingerprint)}
                  class="unban-button"
                >
                  Unban
                </button>
              </div>
            {/each}
          {/each}
        </div>
      </section>

      <!-- Top Offenders -->
      {#if topOffenders.length > 0}
        <section class="offenders-section">
          <h2>Top Offenders</h2>
          <div class="offenders-list">
            {#each topOffenders as offender}
              <div class="offender-item">
                <code class="fingerprint">{formatFingerprint(offender.fingerprint)}</code>
                <span class="offender-count">{offender.violationCount} violations</span>
                <span class="offender-last">
                  Last: {formatDate(offender.lastViolation)}
                </span>
              </div>
            {/each}
          </div>
        </section>
      {/if}

      <!-- Session Violations -->
      {#if violations.length > 0}
        <section class="session-violations-section">
          <div class="section-header">
            <h2>Session Violations ({violations.length})</h2>
            <button
              onclick={handleClearViolations}
              class="clear-button"
            >
              Clear
            </button>
          </div>
          <div class="violations-list">
            {#each violations as violation}
              <div class="violation-item">
                <span class="violation-badge {getSeverityColor(violation.severity)}">
                  {violation.severity}
                </span>
                <span class="violation-type">{violation.type}</span>
                <span class="violation-details">{violation.details}</span>
                <span class="violation-time">{formatDate(violation.timestamp)}</span>
              </div>
            {/each}
          </div>
        </section>
      {/if}

      <!-- Recent Logs -->
      <section class="logs-section">
        <div class="section-header">
          <h2>Recent Activity</h2>
          <button onclick={handleExportLogs} class="export-button">
            Export Logs
          </button>
        </div>
        <div class="logs-list">
          {#each recentLogs.slice(-10).reverse() as log}
            <div class="log-item">
              <span class="log-action">{log.action}</span>
              <code class="log-fingerprint">{formatFingerprint(log.fingerprint)}</code>
              <span class="log-time">{formatDate(log.timestamp)}</span>
            </div>
          {/each}
        </div>
      </section>
    </div>
  {/if}
</div>

<style>
  .security-dashboard {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
  }

  .toggle-button {
    background: #1f2937;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s;
  }

  .toggle-button:hover {
    transform: scale(1.05);
  }

  .dashboard-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    margin-top: 10px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  .stat-card {
    background: #f9fafb;
    padding: 12px;
    border-radius: 8px;
  }

  .stat-card h3 {
    font-size: 12px;
    color: #6b7280;
    margin: 0 0 4px 0;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }

  section {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  section h2 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: #1f2937;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .violation-types {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .violation-type {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    background: #f9fafb;
    border-radius: 6px;
  }

  .violation-name {
    font-size: 13px;
    color: #4b5563;
  }

  .violation-count {
    font-weight: 600;
    color: #1f2937;
  }

  .bans-list,
  .offenders-list,
  .violations-list,
  .logs-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .ban-item,
  .offender-item,
  .violation-item,
  .log-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px;
    background: #f9fafb;
    border-radius: 6px;
    font-size: 12px;
  }

  .ban-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .fingerprint {
    font-family: monospace;
    font-size: 11px;
    color: #6b7280;
    background: #e5e7eb;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .ban-reason {
    color: #1f2937;
  }

  .ban-violations {
    color: #6b7280;
  }

  .ban-expires {
    color: #dc2626;
  }

  .ban-permanent {
    color: #dc2626;
    font-weight: 600;
  }

  .unban-button,
  .clear-button,
  .export-button {
    background: #ef4444;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    font-weight: 500;
  }

  .unban-button:hover,
  .clear-button:hover {
    background: #dc2626;
  }

  .export-button {
    background: #3b82f6;
  }

  .export-button:hover {
    background: #2563eb;
  }

  .violation-badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .violation-type {
    color: #1f2937;
    font-weight: 500;
  }

  .violation-details {
    flex: 1;
    color: #6b7280;
  }

  .violation-time,
  .log-time {
    color: #9ca3af;
    font-size: 11px;
  }

  .log-item {
    padding: 8px;
  }

  .log-action {
    flex: 1;
    color: #1f2937;
  }

  .log-fingerprint {
    font-size: 10px;
  }

  .empty-state {
    color: #9ca3af;
    font-style: italic;
    padding: 20px;
    text-align: center;
  }

  @media (max-width: 640px) {
    .dashboard-content {
      width: calc(100vw - 40px);
      max-width: none;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
