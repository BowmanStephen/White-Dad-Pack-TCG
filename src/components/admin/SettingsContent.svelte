<script lang="ts">
  /**
   * Admin Settings Component
   *
   * Site-wide settings and configuration.
   * Admin only.
   */

  import { hasRole } from '@/stores/admin';
  import { adminSettings, updateAdminSettings } from '@/stores/admin-panel';

  // Check permissions
  if (!hasRole('admin')) {
    alert('Access denied: Admin role required');
    window.location.href = '/admin/dashboard';
  }

  let settings = $adminSettings;

  function handleSave() {
    updateAdminSettings(settings);
    alert('Settings saved successfully!');
  }
</script>

<div class="admin-settings">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Settings</h1>
      <p class="text-slate-400">Configure site-wide settings</p>
    </div>
    <button
      on:click={handleSave}
      class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
    >
      Save Settings
    </button>
  </div>

  <div class="space-y-6">
    <!-- General Settings -->
    <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <h2 class="text-lg font-semibold text-white mb-4">General Settings</h2>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">Site Name</label>
          <input
            type="text"
            bind:value={settings.siteName}
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">Site Description</label>
          <textarea
            bind:value={settings.siteDescription}
            rows="2"
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Access Control -->
    <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <h2 class="text-lg font-semibold text-white mb-4">Access Control</h2>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-white">Maintenance Mode</p>
            <p class="text-sm text-slate-400">Take the site offline for maintenance</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              bind:checked={settings.maintenanceMode}
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-white">Open Registration</p>
            <p class="text-sm text-slate-400">Allow new users to register</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              bind:checked={settings.registrationOpen}
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>

    <!-- Version Requirements -->
    <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <h2 class="text-lg font-semibold text-white mb-4">Version Requirements</h2>

      <div>
        <label class="block text-sm font-medium text-slate-300 mb-2">Minimum App Version</label>
        <input
          type="text"
          bind:value={settings.minVersion}
          placeholder="1.0.0"
          class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p class="text-xs text-slate-400 mt-1">Users below this version will be prompted to update</p>
      </div>
    </div>

    <!-- Announcement Banner -->
    <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <h2 class="text-lg font-semibold text-white mb-4">Site Banner</h2>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">Banner Message</label>
          <textarea
            bind:value={settings.announcementBanner}
            placeholder="Enter announcement banner message (leave empty to hide)"
            rows="2"
            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          ></textarea>
          <p class="text-xs text-slate-400 mt-1">Displayed at the top of all pages</p>
        </div>
      </div>
    </div>
  </div>
</div>
