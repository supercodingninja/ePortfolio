/*
================================================================================
FILE: service-worker.js
PROJECT: ePortfolio PWA Refactor
AUTHOR: Frederick Thomas (The Super Coding Ninja™)
DESCRIPTION: Intelligent service worker with cache-busting, network-first for HTML,
             cache-first for assets, and automatic cleanup strategies
================================================================================
*/

/*
This Area Of Code Is: Cache Configuration Constants
Explanation: Defines cache names and versioning for different resource types
In Other Words: Names for the different storage boxes where we save website files
*/
const CACHE_CONFIG = {
    // This Area Of Code Is: Cache Name Prefix
    // Explanation: Base name that will be combined with version for cache identification
    // In Other Words: The main label for our cache storage
    PREFIX: 'scn-portfolio',
    
    // This Area Of Code Is: Cache Version
    // Explanation: Increment this to force cache update for all users
    // In Other Words: Change this number to make everyone get the latest version
    VERSION: 'v1.0.0',
    
    // This Area Of Code Is: Maximum Cache Age (7 days)
    // Explanation: Time in milliseconds before cached content is considered stale
    // In Other Words: How long to keep old files before checking for new ones (1 week)
    MAX_AGE: 7 * 24 * 60 * 60 * 1000
};

/*
This Area Of Code Is: Compiled Cache Names
Explanation: Combines prefix and version to create unique cache identifiers
In Other Words: The actual names used for each type of cache storage
*/
const CACHE_NAMES = {
    STATIC: `${CACHE_CONFIG.PREFIX}-static-${CACHE_CONFIG.VERSION}`,
    IMAGES: `${CACHE_CONFIG.PREFIX}-images-${CACHE_CONFIG.VERSION}`,
    PAGES: `${CACHE_CONFIG.PREFIX}-pages-${CACHE_CONFIG.VERSION}`,
    FONT: `${CACHE_CONFIG.PREFIX}-fonts-${CACHE_CONFIG.VERSION}`
};

/*
This Area Of Code Is: URL Patterns for Caching Strategies
Explanation: Regular expressions to categorize URLs for different caching behaviors
In Other Words: Rules to decide what type of cache each file goes into
*/
const URL_PATTERNS = {
    // This Area Of Code Is: Static Asset Pattern
    // Explanation: Matches CSS, JS, and JSON files for long-term caching
    // In Other Words: Finds style and code files to save for a long time
    STATIC: /\.(css|js|json)$/,
    
    // This Area Of Code Is: Image Pattern
    // Explanation: Matches image files including modern formats
    // In Other Words: Finds all picture files (jpg, png, svg, etc.)
    IMAGES: /\.(png|jpg|jpeg|gif|svg|webp|avif)$/,
    
    // This Area Of Code Is: Font Pattern
    // Explanation: Matches web font files from Google Fonts or local sources
    // In Other Words: Finds font files to make text look consistent
    FONTS: /fonts\.(googleapis|gstatic)\.com|\.(woff2?|ttf|otf)$/,
    
    // This Area Of Code Is: External API Pattern
    // Explanation: Identifies third-party API calls that shouldn't be cached
    // In Other Words: Finds calls to other websites that we shouldn't save
    EXTERNAL_API: /^https:\/\/(?!scn\.ninja|.*\.scn\.ninja)/
};

/*
This Area Of Code Is: Precache Resources List
Explanation: Core files that should be cached immediately on service worker install
In Other Words: Important files to save right away so the site works offline immediately
*/
const PRECACHE_RESOURCES = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    './register-sw.js',
    './assets/logoNfavicon/logo.jpeg',
    './assets/img/me.jpg',
    './assets/img/III.jpg',
    './assets/img/section__bg.jpeg'
];

/*
================================================================================
EVENT HANDLER: Install Event
================================================================================
*/

/*
This Area Of Code Is: Service Worker Install Event Listener
Explanation: Triggered when the service worker is first installed or updated
In Other Words: Runs when the app is first saved for offline use
*/
self.addEventListener('install', (event) => {
    /*
    This Area Of Code Is: Install Event Handler
    Explanation: Precaches critical resources and activates immediately
    In Other Words: Saves the most important files right away and takes control immediately
    */
    event.waitUntil(
        /*
        This Area Of Code Is: Cache Opening and Population
        Explanation: Opens the static cache and adds all precache resources
        In Other Words: Opens the storage box and puts in the essential files
        */
        caches.open(CACHE_NAMES.STATIC)
            .then((cache) => {
                console.log('[SW] Precaching static resources');
                return cache.addAll(PRECACHE_RESOURCES);
            })
            .then(() => {
                /*
                This Area Of Code Is: Skip Waiting Call
                Explanation: Forces the new service worker to activate immediately
                In Other Words: Makes the new version take over right away instead of waiting
                */
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Precache failed:', error);
            })
    );
});

/*
================================================================================
EVENT HANDLER: Activate Event
================================================================================
*/

/*
This Area Of Code Is: Service Worker Activate Event Listener
Explanation: Triggered when the service worker takes control of pages
In Other Words: Runs when the service worker starts managing the website
*/
self.addEventListener('activate', (event) => {
    /*
    This Area Of Code Is: Activate Event Handler
    Explanation: Cleans up old caches and claims all clients immediately
    In Other Words: Deletes old saved files and takes control of all open tabs
    */
    event.waitUntil(
        /*
        This Area Of Code Is: Old Cache Cleanup
        Explanation: Removes caches that don't match current version
        In Other Words: Deletes old storage boxes that have outdated files
        */
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            // Keep only current version caches
                            return cacheName.startsWith(CACHE_CONFIG.PREFIX) && 
                                   !Object.values(CACHE_NAMES).includes(cacheName);
                        })
                        .map((cacheName) => {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                /*
                This Area Of Code Is: Clients Claim
                Explanation: Takes control of all open pages without requiring refresh
                In Other Words: Makes this service worker control all open tabs immediately
                */
                return self.clients.claim();
            })
    );
});

/*
================================================================================
EVENT HANDLER: Fetch Event (Network Interception)
================================================================================
*/

/*
This Area Of Code Is: Fetch Event Listener
Explanation: Intercepts all network requests and applies caching strategies
In Other Words: Catches all website requests and decides how to handle them
*/
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    /*
    This Area Of Code Is: Request Method Validation
    Explanation: Only cache GET requests, ignore POST/PUT/DELETE/etc
    In Other Words: Only save files we're reading, not files we're sending
    */
    if (request.method !== 'GET') {
        return;
    }
    
    /*
    This Area Of Code Is: External API Bypass
    Explanation: Don't cache requests to external APIs
    In Other Words: Let calls to other websites go through normally without saving
    */
    if (URL_PATTERNS.EXTERNAL_API.test(request.url) && !request.url.includes('fonts')) {
        return;
    }
    
    /*
    This Area Of Code Is: Strategy Selection Logic
    Explanation: Determines which caching strategy to use based on request type
    In Other Words: Decides how to handle each type of file request
    */
    if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname === '') {
        /*
        This Area Of Code Is: HTML Page Strategy Assignment
        Explanation: HTML pages use Network First strategy for freshness
        In Other Words: For web pages, try the internet first, then use saved copy
        */
        event.respondWith(networkFirstStrategy(request, CACHE_NAMES.PAGES));
    } else if (URL_PATTERNS.IMAGES.test(request.url)) {
        /*
        This Area Of Code Is: Image Strategy Assignment
        Explanation: Images use Cache First strategy for performance
        In Other Words: For pictures, use saved copy first, then download if needed
        */
        event.respondWith(cacheFirstStrategy(request, CACHE_NAMES.IMAGES));
    } else if (URL_PATTERNS.FONTS.test(request.url)) {
        /*
        This Area Of Code Is: Font Strategy Assignment
        Explanation: Fonts use Cache First with long-term storage
        In Other Words: For fonts, always use saved copy to keep text consistent
        */
        event.respondWith(cacheFirstStrategy(request, CACHE_NAMES.FONT));
    } else if (URL_PATTERNS.STATIC.test(request.url)) {
        /*
        This Area Of Code Is: Static Asset Strategy Assignment
        Explanation: CSS/JS files use Stale While Revalidate for balance
        In Other Words: For styles and code, show saved version but check for updates in background
        */
        event.respondWith(staleWhileRevalidateStrategy(request, CACHE_NAMES.STATIC));
    }
});

/*
================================================================================
CACHING STRATEGIES
================================================================================
*/

/*
This Area Of Code Is: Network First Strategy Function
Explanation: Tries network first, falls back to cache if offline
In Other Words: Gets the latest version from internet, but shows saved copy if no connection
*/
async function networkFirstStrategy(request, cacheName) {
    try {
        /*
        This Area Of Code Is: Network Fetch Attempt
        Explanation: Attempts to fetch fresh resource from network
        In Other Words: Tries to download the file from the internet
        */
        const networkResponse = await fetch(request);
        
        /*
        This Area Of Code Is: Cache Update
        Explanation: If network succeeds, update the cache with fresh response
        In Other Words: Saves the new version for next time
        */
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        /*
        This Area Of Code Is: Cache Fallback
        Explanation: If network fails, return cached version or offline page
        In Other Words: If no internet, show the saved version instead
        */
        console.log('[SW] Network failed, serving from cache:', request.url);
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        /*
        This Area Of Code Is: Offline Fallback
        Explanation: If nothing in cache, return offline indicator
        In Other Words: If no saved copy exists, show an error message
        */
        return new Response('Offline - Content not cached', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain'
            })
        });
    }
}

/*
This Area Of Code Is: Cache First Strategy Function
Explanation: Tries cache first, fetches from network if not cached
In Other Words: Uses saved copy first, downloads only if we don't have it saved
*/
async function cacheFirstStrategy(request, cacheName) {
    /*
    This Area Of Code Is: Cache Lookup
    Explanation: Attempts to find resource in specified cache
    In Other Words: Checks if we already have this file saved
    */
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        /*
        This Area Of Code Is: Cache Hit Return
        Explanation: Returns cached response immediately for performance
        In Other Words: If we have it saved, use it right away
        */
        return cachedResponse;
    }
    
    try {
        /*
        This Area Of Code Is: Network Fetch on Cache Miss
        Explanation: Fetches from network if not in cache
        In Other Words: If we don't have it saved, download it now
        */
        const networkResponse = await fetch(request);
        
        /*
        This Area Of Code Is: Cache Population
        Explanation: Stores the fetched resource in cache for future requests
        In Other Words: Saves the downloaded file for next time
        */
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        /*
        This Area Of Code Is: Network Failure Handler
        Explanation: Returns error response if both cache and network fail
        In Other Words: If we can't get the file at all, show an error
        */
        console.error('[SW] Cache and network both failed:', request.url);
        return new Response('Resource unavailable offline', {
            status: 404,
            statusText: 'Not Found'
        });
    }
}

/*
This Area Of Code Is: Stale While Revalidate Strategy Function
Explanation: Returns cached version immediately while updating cache in background
In Other Words: Shows the saved version right away, but checks for updates behind the scenes
*/
async function staleWhileRevalidateStrategy(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    /*
    This Area Of Code Is: Background Fetch Promise
    Explanation: Creates promise that fetches and updates cache in background
    In Other Words: Sets up a background task to check for updates without waiting
    */
    const fetchPromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch((error) => {
            console.log('[SW] Background fetch failed:', error);
            return cachedResponse;
        });
    
    /*
    This Area Of Code Is: Return Cached or Network Response
    Explanation: Returns cached version immediately if available, otherwise wait for network
    In Other Words: Use saved copy now, or wait for download if we don't have it
    */
    return cachedResponse || fetchPromise;
}

/*
================================================================================
BACKGROUND SYNC & PERIODIC SYNC (Future Enhancement)
================================================================================
*/

/*
This Area Of Code Is: Message Event Listener
Explanation: Handles messages from the main thread for cache management
In Other Words: Listens for commands from the website to manage saved files
*/
self.addEventListener('message', (event) => {
    /*
    This Area Of Code Is: Message Handler
    Explanation: Processes commands sent from the main application
    In Other Words: Does what the website asks us to do
    */
    if (event.data === 'skipWaiting') {
        /*
        This Area Of Code Is: Skip Waiting Command
        Explanation: Forces immediate activation of waiting service worker
        In Other Words: Makes the new version take over when the website asks
        */
        self.skipWaiting();
    }
    
    if (event.data === 'clearCache') {
        /*
        This Area Of Code Is: Clear Cache Command
        Explanation: Clears all caches when requested by user/developer
        In Other Words: Deletes all saved files when asked
        */
        caches.keys().then((cacheNames) => {
            return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
        });
    }
});

/*
This Area Of Code Is: Push Event Listener (Placeholder)
Explanation: Handles push notifications (future enhancement)
In Other Words: Ready to receive notifications when I add that feature later
*/
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New update from Super Coding Ninja!',
        icon: './assets/logoNfavicon/logo.jpeg',
        badge: './assets/logoNfavicon/logo.jpeg',
        tag: 'scn-notification'
    };
    
    event.waitUntil(
        self.registration.showNotification('Super Coding Ninja™', options)
    );
});
