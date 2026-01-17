<script lang="ts">
  /**
   * Admin Shell Component
   *
   * Main admin panel layout with sidebar navigation and content area.
   * Handles authentication check and section navigation.
   */

  import { onMount, onDestroy } from 'svelte';
  import { logout, hasRole, startActivityCheck } from '@/stores/admin';
  import {
    currentSection,
    setCurrentSection,
    sidebarCollapsed,
    toggleSidebar,
    getNotifications,
    unreadNotificationsCount,
    markAllNotificationsRead,
  } from '@/stores/admin-panel';

  // Props
  export let currentSection: 'dashboard' | 'cards' | 'packs' | 'announcements' | 'users' | 'analytics' | 'settings';
  export let username: string = 'Admin';

  // Local state
  let notificationOpen = false;
  let activityCleanup: (() => void) | null = null;

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', requiredRole: 'moderator' as const },
    { id: 'cards', label: 'Cards', icon: '🎴', requiredRole: 'admin' as const },
    { id: 'packs', label: 'Packs', icon: '📦', requiredRole: 'admin' as const },
    { id: 'announcements', label: 'Announcements', icon: '📢', requiredRole: 'moderator' as const },
    { id: 'users', label: 'Users', icon: '👥', requiredRole: 'moderator' as const },
    { id: 'analytics', label: 'Analytics', icon: '📈', requiredRole: 'moderator' as const },
    { id: 'settings', label: 'Settings', icon: '⚙️', requiredRole: 'admin' as const },
  ];

  // Computed
  $: notifications = getNotifications();
  $: unreadCount = unreadNotificationsCount();
  $: visibleNavItems = navItems.filter(item => hasRole(item.requiredRole));
  $: collapsed = $sidebarCollapsed;

  // Lifecycle
  onMount(() => {
    // Start activity check for session refresh
    activityCleanup = startActivityCheck();
  });

  onDestroy(() => {
    if (activityCleanup) {
      activityCleanup();
    }
  });

  // Handlers
  function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      window.location.href = '/admin/login';
    }
  }

  function handleNavigate(section: typeof currentSection) {
    setCurrentSection(section);
  }

  function toggleNotifications() {
    notificationOpen = !notificationOpen;
    if (notificationOpen && unreadCount > 0) {
      markAllNotificationsRead();
    }
  }
</script>

<div class="admin-shell flex min-h-screen bg-slate-900">
  <!-- Sidebar -->
  <aside
    class="sidebar bg-slate-800 border-r border-slate-700 flex flex-col transition-all duration-300 {collapsed
      ? 'w-16'
      : 'w-64'}"
  >
    <!-- Logo -->
    <div class="p-4 border-b border-slate-700">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span class="text-xl">🎴</span>
        </div>
        {#if !collapsed}
          <div class="transition-opacity duration-200">
            <h1 class="text-lg font-bold text-white">DadDeck™</h1>
            <p class="text-xs text-slate-400">Admin Panel</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
      {#each visibleNavItems as item}
        {#if hasRole(item.requiredRole)}
          <button
            on:click={() => handleNavigate(item.id)}
            class="nav-item w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors {currentSection === item.id
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'}"
            title={collapsed ? item.label : ''}
          >
            <span class="text-xl flex-shrink-0">{item.icon}</span>
            {#if !collapsed}
              <span class="font-medium transition-opacity duration-200">{item.label}</span>
            {/if}
          </button>
        {/if}
      {/each}
    </nav>

    <!-- User Menu -->
    <div class="p-4 border-t border-slate-700">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
          <span class="text-lg">👤</span>
        </div>
        {#if !collapsed}
          <div class="flex-1 min-w-0 transition-opacity duration-200">
            <p class="text-sm font-medium text-white truncate">{username}</p>
            <p class="text-xs text-slate-400 capitalize">{hasRole('admin') ? 'Administrator' : 'Moderator'}</p>
          </div>
        {/if}
        <button
          on:click={handleLogout}
          class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
          title="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  </aside>

  <!-- Main Content -->
  <main class="flex-1 flex flex-col overflow-hidden">
    <!-- Header -->
    <header class="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            on:click={toggleSidebar}
            class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 class="text-xl font-semibold text-white capitalize">{currentSection.replace('-', ' ')}</h2>
        </div>

        <div class="flex items-center gap-4">
          <!-- Notifications -->
          <div class="relative">
            <button
              on:click={toggleNotifications}
              class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors relative"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {#if unreadCount > 0}
                <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              {/if}
            </button>

            <!-- Notifications Dropdown -->
            {#if notificationOpen}
              <div class="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                <div class="p-4 border-b border-slate-700">
                  <h3 class="font-semibold text-white">Notifications</h3>
                </div>
                <div class="max-h-96 overflow-y-auto">
                  {#if notifications.length > 0}
                    {#each notifications.slice(0, 10) as notification}
                      <div
                        class="px-4 py-3 border-b border-slate-700 last:border-0 hover:bg-slate-700 transition-colors {notification.read
                          ? 'opacity-60'
                          : ''}"
                      >
                        <div class="flex items-start gap-3">
                          <span class="notification-icon {notification.type === 'success'
                            ? 'text-green-500'
                            : notification.type === 'error'
                            ? 'text-red-500'
                            : notification.type === 'warning'
                            ? 'text-yellow-500'
                            : 'text-blue-500'}">
                            {notification.type === 'success'
                              ? '✓'
                              : notification.type === 'error'
                              ? '✕'
                              : notification.type === 'warning'
                              ? '⚠'
                              : 'ℹ'}
                          </span>
                          <div class="flex-1 min-w-0">
                            <p class="text-sm text-white">{notification.message}</p>
                            <p class="text-xs text-slate-400 mt-1">
                              {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                                Math.floor((notification.timestamp.getTime() - Date.now()) / 1000 / 60),
                                'minute'
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    {/each}
                  {:else}
                    <div class="px-4 py-8 text-center text-slate-400">
                      <p>No notifications</p>
                    </div>
                  {/if}
                </div>
              </div>
            {/if}
          </div>

          <!-- Back to Site -->
          <a
            href="/"
            class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Back to Site"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </a>
        </div>
      </div>
    </header>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto p-6">
      <svelte:component this={getSectionComponent(currentSection)} />
    </div>
  </main>
</div>

<style>
  .admin-shell {
    font-family: system-ui, -apple-system, sans-serif;
  }

  .sidebar {
    scrollbar-width: thin;
    scrollbar-color: rgb(51 65 85) transparent;
  }

  .sidebar::-webkit-scrollbar {
    width: 6px;
  }

  .sidebar::-webkit-scrollbar-track {
    background: transparent;
  }

  .sidebar::-webkit-scrollbar-thumb {
    background-color: rgb(51 65 85);
    border-radius: 3px;
  }
</style>

<script lang="ts">
  // Dynamic component loader for sections
  function getSectionComponent(section: string) {
    switch (section) {
      case 'dashboard':
        return DashboardContent;
      case 'cards':
        return CardsContent;
      case 'packs':
        return PacksContent;
      case 'announcements':
        return AnnouncementsContent;
      case 'users':
        return UsersContent;
      case 'analytics':
        return AnalyticsContent;
      case 'settings':
        return SettingsContent;
      default:
        return DashboardContent;
    }
  }

  // Import section components
  import DashboardContent from './DashboardContent.svelte';
  import CardsContent from './cards/CardsManagement.svelte';
  import PacksContent from './packs/PackConfiguration.svelte';
  import AnnouncementsContent from './announcements/AnnouncementManagement.svelte';
  import UsersContent from './users/UserModeration.svelte';
  import AnalyticsContent from './analytics/AnalyticsDashboard.svelte';
  import SettingsContent from './SettingsContent.svelte';
</script>
