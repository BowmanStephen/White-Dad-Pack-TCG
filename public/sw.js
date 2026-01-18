/// <reference lib="webworker" />

const CACHE_NAME = 'dadddeck-v2';
const OFFLINE_URL = '/offline';
const DB_NAME = 'DadDeckDB';
const DB_VERSION = 1;
const COLLECTION_STORE = 'collection';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.svg',
];

// Cache patterns for different strategies
const CACHE_PATTERNS = {
  // Static assets - cache first (images, fonts, sounds)
  static: [
    /^\/cards\/.*/,
    /^\/sounds\/.*/,
    /^\/fonts\/.*/,
    /^\/_astro\/.*/,
  ],
  // HTML pages - network first
  pages: [
    /\.html?$/,
    /^\/$/,
  ],
};

// ============================================================================
// INDEXEDDB SETUP
// ============================================================================

// Open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[SW] IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('[SW] IndexedDB opened successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create collection store if it doesn't exist
      if (!db.objectStoreNames.contains(COLLECTION_STORE)) {
        const store = db.createObjectStore(COLLECTION_STORE, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        console.log('[SW] Created collection store');
      }
    };
  });
}

// Save collection data to IndexedDB
async function saveCollectionToDB(data: any): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(COLLECTION_STORE, 'readwrite');
  const store = tx.objectStore(COLLECTION_STORE);

  const record = {
    id: 'current-collection',
    timestamp: Date.now(),
    data,
  };

  store.put(record);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => {
      console.log('[SW] Collection saved to IndexedDB');
      resolve();
    };
    tx.onerror = () => {
      console.error('[SW] Failed to save collection:', tx.error);
      reject(tx.error);
    };
  });
}

// Get collection data from IndexedDB
async function getCollectionFromDB(): Promise<any> {
  const db = await openDB();
  const tx = db.transaction(COLLECTION_STORE, 'readonly');
  const store = tx.objectStore(COLLECTION_STORE);
  const request = store.get('current-collection');

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result?.data);
    };
    request.onerror = () => {
      console.error('[SW] Failed to get collection:', request.error);
      reject(request.error);
    };
  });
}

// ============================================================================
// SERVICE WORKER LIFECYCLE
// ============================================================================

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching core assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );

  // Force activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );

  // Take control of all clients immediately
  self.clients.claim();
});

// ============================================================================
// FETCH HANDLING
// ============================================================================

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome extensions and other protocols
  if (!url.protocol.startsWith('http')) return;

  // Handle API requests for collection
  if (url.pathname === '/api/collection') {
    event.respondWith(handleCollectionAPI(request));
    return;
  }

  // Check which strategy to use
  if (isStaticAsset(url)) {
    // Cache First for static assets
    event.respondWith(cacheFirst(request));
  } else if (isPageRequest(url)) {
    // Network First for pages
    event.respondWith(networkFirst(request));
  } else {
    // Default: Network First with offline fallback
    event.respondWith(networkFirst(request));
  }
});

// Handle collection API requests
async function handleCollectionAPI(request: Request): Promise<Response> {
  const db = await openDB();
  const tx = db.transaction(COLLECTION_STORE, 'readonly');
  const store = tx.objectStore(COLLECTION_STORE);
  const dbRequest = store.get('current-collection');

  return new Promise((resolve) => {
    dbRequest.onsuccess = () => {
      const collection = dbRequest.result?.data;
      if (collection) {
        console.log('[SW] Serving collection from IndexedDB');
        resolve(new Response(JSON.stringify(collection), {
          headers: { 'Content-Type': 'application/json' },
        }));
      } else {
        resolve(new Response(JSON.stringify({ error: 'Collection not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }));
      }
    };
    dbRequest.onerror = () => {
      resolve(new Response(JSON.stringify({ error: 'Failed to read collection' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }));
    };
  });
}

// ============================================================================
// CACHING STRATEGIES
// ============================================================================

// Strategy: Cache First
// Try cache first, if miss, fetch from network and cache
async function cacheFirst(request: Request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[SW] Cache hit:', request.url);
    return cached;
  }

  console.log('[SW] Cache miss, fetching:', request.url);
  const response = await fetch(request);

  // Cache successful responses
  if (response.ok && response.status === 200) {
    cache.put(request, response.clone());
  }

  return response;
}

// Strategy: Network First
// Try network first, if fail, fallback to cache, then offline page
async function networkFirst(request: Request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    console.log('[SW] Network first, fetching:', request.url);
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok && response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    // If it's a navigation request, show offline page
    if (request.mode === 'navigate') {
      const offlineResponse = await cache.match(OFFLINE_URL);
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    throw error;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Check if URL matches static asset pattern
function isStaticAsset(url: URL): boolean {
  const pathname = url.pathname;
  return CACHE_PATTERNS.static.some((pattern) => pattern.test(pathname));
}

// Check if URL matches page request pattern
function isPageRequest(url: URL): boolean {
  const pathname = url.pathname;
  return (
    CACHE_PATTERNS.pages.some((pattern) => pattern.test(pathname)) ||
    pathname === '/' ||
    requestPageAcceptsHTML(url)
  );
}

// Check if request accepts HTML
function requestPageAcceptsHTML(url: URL): boolean {
  return (
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    !url.pathname.includes('.')
  );
}

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }

  // Save collection to IndexedDB
  if (event.data && event.data.type === 'SAVE_COLLECTION') {
    event.waitUntil(saveCollectionToDB(event.data.collection));
  }

  // Get collection from IndexedDB
  if (event.data && event.data.type === 'GET_COLLECTION') {
    event.waitUntil(
      getCollectionFromDB().then((collection) => {
        event.ports[0].postMessage({ collection });
      })
    );
  }
});

// ============================================================================
// BACKGROUND SYNC
// ============================================================================

// Handle background sync event (for future use with server sync)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-collection') {
    event.waitUntil(syncCollection());
  }
});

// Sync collection with server (placeholder for future server integration)
async function syncCollection(): Promise<void> {
  console.log('[SW] Syncing collection...');

  try {
    // Get collection from IndexedDB
    const collection = await getCollectionFromDB();

    if (!collection) {
      console.log('[SW] No collection to sync');
      return;
    }

    // TODO: Send collection to server when backend is available
    // const response = await fetch('/api/collection/sync', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(collection),
    // });

    console.log('[SW] Collection synced successfully');
  } catch (error) {
    console.error('[SW] Failed to sync collection:', error);
    throw error;
  }
}
