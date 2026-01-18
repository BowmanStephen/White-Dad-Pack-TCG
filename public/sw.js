/// <reference lib="webworker" />

const CACHE_NAME = 'dadddeck-v1';
const OFFLINE_URL = '/offline';

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

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome extensions and other protocols
  if (!url.protocol.startsWith('http')) return;

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

// Strategy: Cache First
// Try cache first, if miss, fetch from network and cache
async function cacheFirst(request) {
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
async function networkFirst(request) {
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

// Check if URL matches static asset pattern
function isStaticAsset(url) {
  const pathname = url.pathname;
  return CACHE_PATTERNS.static.some((pattern) => pattern.test(pathname));
}

// Check if URL matches page request pattern
function isPageRequest(url) {
  const pathname = url.pathname;
  return CACHE_PATTERNS.pages.some((pattern) => pattern.test(pathname)) ||
         pathname === '/' ||
         requestPageAcceptsHTML(url);
}

// Check if request accepts HTML
function requestPageAcceptsHTML(url) {
  // This is a simplified check - in production you'd inspect the Accept header
  // but we can't access it here easily
  return url.pathname === '/' ||
         url.pathname.endsWith('.html') ||
         !url.pathname.includes('.');
}

// Handle messages from clients (e.g., manual cache updates)
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
});
