// Service Worker for LocalKan PWA
const CACHE_NAME = 'localkan-v2.0.0';
const STATIC_CACHE = 'localkan-static-v2.0.0';

// Resources to cache for offline functionality
const CACHE_RESOURCES = [
  '/',
  '/boards/boards.html',
  '/board/board.html',
  '/boards/boards.css',
  '/board/board.css',
  '/boards/boards.js',
  '/board/board.js',
  '/shared/sync.js',
  '/manifest.json',
  // External CDN resources
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static resources');
        // Cache core resources, but don't fail if some CDN resources are unavailable
        return Promise.allSettled(
          CACHE_RESOURCES.map(url => {
            return cache.add(url).catch(error => {
              console.warn(`[SW] Failed to cache ${url}:`, error);
              return null;
            });
          })
        );
      })
      .then(() => {
        console.log('[SW] Static resources cached successfully');
        // Force activation of new service worker
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension and other protocols
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    caches.open(STATIC_CACHE)
      .then(cache => {
        return cache.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              // Serve from cache
              console.log('[SW] Serving from cache:', event.request.url);
              
              // For HTML pages, try to update cache in background
              if (event.request.destination === 'document') {
                fetch(event.request)
                  .then(response => {
                    if (response && response.status === 200) {
                      cache.put(event.request, response.clone());
                    }
                  })
                  .catch(error => {
                    console.log('[SW] Background update failed:', error);
                  });
              }
              
              return cachedResponse;
            }
            
            // Not in cache, try network
            return fetch(event.request)
              .then(response => {
                // Cache successful responses
                if (response && response.status === 200 && response.type === 'basic') {
                  console.log('[SW] Caching new resource:', event.request.url);
                  cache.put(event.request, response.clone());
                }
                return response;
              })
              .catch(error => {
                console.log('[SW] Network request failed:', event.request.url, error);
                
                // Return offline fallback for navigation requests
                if (event.request.destination === 'document') {
                  return new Response(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <title>LocalKan - Offline</title>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>
                        body {
                          font-family: 'Inter', system-ui, sans-serif;
                          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                          color: white;
                          text-align: center;
                          padding: 40px 20px;
                          margin: 0;
                          min-height: 100vh;
                          display: flex;
                          flex-direction: column;
                          justify-content: center;
                          align-items: center;
                        }
                        .offline-icon {
                          font-size: 4rem;
                          margin-bottom: 20px;
                        }
                        .retry-btn {
                          background: rgba(255,255,255,0.2);
                          color: white;
                          border: 2px solid rgba(255,255,255,0.3);
                          padding: 12px 24px;
                          border-radius: 12px;
                          font-size: 1rem;
                          cursor: pointer;
                          margin-top: 20px;
                          transition: all 0.2s ease;
                        }
                        .retry-btn:hover {
                          background: rgba(255,255,255,0.3);
                        }
                      </style>
                    </head>
                    <body>
                      <div class="offline-icon">📱</div>
                      <h1>You're Offline</h1>
                      <p>LocalKan is available offline, but some features may be limited.</p>
                      <p>Your data is stored locally and will sync when you're back online.</p>
                      <button class="retry-btn" onclick="window.location.reload()">
                        Try Again
                      </button>
                    </body>
                    </html>
                  `, {
                    status: 200,
                    statusText: 'OK',
                    headers: { 'Content-Type': 'text/html' }
                  });
                }
                
                // For other requests, throw the error
                throw error;
              });
          });
      })
  );
});

// Background sync for data synchronization
self.addEventListener('sync', event => {
  if (event.tag === 'localkan-sync') {
    console.log('[SW] Background sync requested');
    event.waitUntil(
      // Broadcast to all clients to trigger sync
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'BACKGROUND_SYNC',
            action: 'sync-data'
          });
        });
      })
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting requested');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME
    });
  }
});

// Push notifications (for future enhancement)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'LocalKan notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open LocalKan',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('LocalKan', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[SW] Service Worker registered for LocalKan PWA');