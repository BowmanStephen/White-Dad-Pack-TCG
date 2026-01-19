# Pre-existing Build Issue

## Issue
The build fails with a "window is not defined" error during SSR from the collection store.

## Error
```
window is not defined
Location: src/stores/collection.ts:108
Error: collectionStore.subscribe() being called at module level
```

## Root Cause
In `src/stores/collection.ts` line 108, there's a `collectionStore.subscribe()` call that happens during module evaluation. This runs during SSR when `window` is not available.

## Status
This is a **pre-existing issue** not caused by ERROR-003 changes. The issue exists in the main branch and was not introduced by the offline banner implementation.

## Workaround
The dev server works fine, and the feature functions correctly. The issue only affects the production build.

## Recommended Fix
Move the `collectionStore.subscribe()` call to be lazily initialized only on the client side, similar to how it's handled in the new offline store.
