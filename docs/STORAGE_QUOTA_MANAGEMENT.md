# PACK-045: Storage Quota Management

## Overview

The DadDeck™ application includes a comprehensive storage quota management system to prevent save failures and optimize storage usage. This system monitors IndexedDB storage capacity, automatically compresses old data, and provides user-facing warnings and controls.

## Architecture

### Storage Layer

- **Primary Storage**: IndexedDB (via localforage library)
- **Capacity**: Typically 50MB to several GB (varies by browser)
- **Fallback**: LocalStorage (5MB limit) - only used if IndexedDB unavailable

### Quota Management Components

1. **`src/lib/storage/quota-manager.ts`**: Core quota management logic
2. **`src/lib/storage/indexeddb.ts`**: IndexedDB integration with quota checks
3. **`src/stores/collection.ts`**: Collection store with quota-aware saving
4. **`src/components/storage/StorageQuotaWarning.svelte`**: User-facing warning notifications
5. **`src/components/storage/StorageManagement.svelte`**: Storage management UI

## Features

### Automatic Quota Management

The system automatically manages storage at different capacity thresholds:

#### Stage 1: Compression at 75% Usage
- Compresses pack data older than 30 days
- Removes unnecessary fields (abilities, flavorText, etc.)
- Keeps essential data (id, cards, rarity, dates)

#### Stage 2: Archiving at 85% Usage
- Archives packs older than 30 days to external storage
- Removes archived packs from main collection
- Returns JSON data for user to save

#### Stage 3: Emergency Archiving at 90% Usage
- Archives packs older than 15 days
- More aggressive cleanup to prevent storage full errors

### User-Facing Features

#### Storage Warning Notifications
- **Warning Level** (90%+): Yellow warning banner
  - Auto-dismisses after 10 seconds
  - Shows storage usage percentage
  - Provides actionable message

- **Error Level** (95%+): Red error banner
  - Requires manual dismissal
  - Blocks further saves until resolved
  - Suggests manual cleanup

#### Storage Management Page (`/storage`)
- **Storage Status**: Visual display of current usage
  - Progress bar with color coding
  - Used/total storage display
  - Percentage indicator

- **Storage Actions**:
  - **Auto-Optimize**: Manually trigger quota management
  - **Export Collection**: Download full collection as JSON
  - **Clear All Data**: Permanently delete all collection data

- **Tips Section**: Helpful information about storage management

## API Reference

### Quota Information

```typescript
interface StorageQuotaInfo {
  used: number;           // Bytes used
  total: number;          // Total bytes available
  percentage: number;     // Percentage used (0-100)
  driver: string;         // Storage driver (indexeddb, localstorage, etc.)
  needsWarning: boolean;  // True if usage >= 90%
  isFull: boolean;        // True if usage >= 95%
}
```

### Core Functions

#### `getStorageQuotaInfo()`
Returns current storage quota information.

```typescript
const quotaInfo = await getStorageQuotaInfo();
console.log(`Storage: ${quotaInfo.percentage.toFixed(1)}% used`);
```

#### `checkQuotaBeforeSave(additionalBytes: number)`
Checks if a save operation would exceed quota limits.

```typescript
const result = await checkQuotaBeforeSave(1024);
if (!result.canSave) {
  console.error(result.warning);
}
```

#### `compressOldData(collection, daysOld)`
Compresses old pack data to save space.

```typescript
const result = await compressOldData(collection, 30);
console.log(`Compressed ${result.archivedPacks} packs, saved ${result.savedBytes} bytes`);
```

#### `archiveOldPacks(collection, daysOld)`
Archives old packs and returns them for external storage.

```typescript
const result = await archiveOldPacks(collection, 30);
if (result.archivedData) {
  // Save result.archivedData to file or server
  downloadJSON(result.archivedData, 'archive.json');
}
```

#### `autoManageQuota(collection)`
Automatically manages quota based on current usage.

```typescript
const result = await autoManageQuota(collection);
if (result.updatedCollection) {
  collection.set(result.updatedCollection); // Apply changes
  console.log('Actions:', result.actions);
}
```

## Usage Examples

### Example 1: Check Storage Before Opening Pack

```typescript
import { checkQuotaBeforeSave } from '@/lib/storage/quota-manager';

async function openPackWithQuotaCheck() {
  // Estimate size of new pack
  const estimatedSize = 5000; // ~5KB

  const quotaCheck = await checkQuotaBeforeSave(estimatedSize);

  if (!quotaCheck.canSave) {
    alert(quotaCheck.warning);
    return;
  }

  if (quotaCheck.warning) {
    console.warn(quotaCheck.warning);
    // Show warning to user but proceed
  }

  // Open pack normally
  const newPack = generatePack();
  addPackToCollection(newPack);
}
```

### Example 2: Manual Storage Cleanup

```typescript
import { manageStorageQuota } from '@/stores/collection';

async function cleanupStorage() {
  const result = await manageStorageQuota();

  if (result.success) {
    alert(`Storage optimized! ${result.actions.join(', ')}`);
  } else {
    alert('Cleanup failed: ' + result.actions.join(', '));
  }
}
```

### Example 3: Export Collection Before Clearing

```typescript
import { exportCollection, clearUserCollection } from '@/stores/collection';

async function clearWithBackup() {
  // Export first
  const data = await exportCollection();

  // Download as JSON file
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `daddeck-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();

  // Then clear
  if (confirm('Collection exported. Clear all data now?')) {
    clearUserCollection();
  }
}
```

## Event System

The quota manager dispatches custom events for UI components to listen to:

### `daddeck:storage-warning`
Triggered when storage is approaching quota limit (90%+).

```typescript
window.addEventListener('daddeck:storage-warning', (event) => {
  const { message, type } = event.detail;
  console.warn(`Storage warning: ${message}`);
});
```

### `daddeck:storage-error`
Triggered when storage is full or save fails.

```typescript
window.addEventListener('daddeck:storage-error', (event) => {
  const { message, type } = event.detail;
  console.error(`Storage error: ${message}`);
});
```

## Configuration

### Thresholds

Configure quota management thresholds in `src/lib/storage/quota-manager.ts`:

```typescript
const WARNING_THRESHOLD = 0.90;  // 90% - Show warning
const FULL_THRESHOLD = 0.95;     // 95% - Considered "full"
const ARCHIVE_DAYS = 30;         // Archive packs older than 30 days
```

### Compression Strategy

Customize compression in `compressPackData()` function:

```typescript
function compressPackData(pack: Pack): any {
  return {
    id: pack.id,
    cards: pack.cards.map(card => ({
      id: card.id,
      rarity: card.rarity,
      isHolo: card.isHolo,
      // Remove: abilities, flavorText, etc.
    })),
    openedAt: pack.openedAt,
    bestRarity: pack.bestRarity,
    design: pack.design
  };
}
```

## Browser Compatibility

| Browser | IndexedDB | LocalStorage Fallback | Notes |
|---------|-----------|----------------------|-------|
| Chrome | ✅ 50MB+ | ✅ 5MB | Full support |
| Firefox | ✅ 50MB+ | ✅ 5MB | Full support |
| Safari | ✅ 1GB+ | ✅ 5MB | Large quota |
| Edge | ✅ 50MB+ | ✅ 5MB | Full support |
| Mobile Safari | ✅ ~1GB | ✅ 5MB | iOS support |
| Chrome Mobile | ✅ 50MB+ | ✅ 5MB | Android support |

## Testing

Run quota management tests:

```bash
bun test tests/unit/lib/storage/quota-manager.test.ts
```

## Troubleshooting

### Issue: "Storage is almost full" warning appears frequently

**Solution**: Manually trigger storage cleanup from `/storage` page, or export collection and clear old data.

### Issue: Auto-optimization not working

**Solution**: Check browser console for errors. Ensure IndexedDB is available and not disabled in browser settings.

### Issue: Archived packs are lost

**Solution**: Always export collection before allowing automatic archiving. Consider implementing server-side storage for archives.

## Future Enhancements

Potential improvements for the quota management system:

1. **Server-Side Archiving**: Automatically upload archived packs to cloud storage
2. **Smart Archiving**: Prioritize keeping high-rarity packs in local storage
3. **Predictive Warnings**: Warn users before they hit limits based on usage trends
4. **Compression Algorithm**: Use actual compression (LZMA, gzip) for better space savings
5. **User Preferences**: Allow users to configure cleanup thresholds

## Related Documentation

- [PACK-028: IndexedDB Migration](./MIGRATION_3_CHANGES.md)
- [PACK-003: Pity Counter System](../PACK-003_PITY_COUNTER.md)
- [Browser Support Implementation](./BROWSER_SUPPORT_IMPLEMENTATION.md)

---

**Last Updated**: January 18, 2026
**Status**: ✅ Implemented and tested
