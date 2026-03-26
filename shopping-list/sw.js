const CACHE_NAME = "shopping-list-v2";
const ASSETS = [
    "/shopping-list/",
    "/shopping-list/index.html",
    "/shopping-list/styles.css",
    "/shopping-list/app.js",
    "/shopping-list/favicon.png"
];

// Install: cache shell assets
self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch: network-first for API/Firebase, cache-first for assets
self.addEventListener("fetch", (e) => {
    const url = new URL(e.request.url);

    // Always go to network for Firebase / Google APIs
    if (url.hostname.includes("googleapis.com") ||
        url.hostname.includes("gstatic.com") ||
        url.hostname.includes("firebaseio.com") ||
        url.hostname.includes("firestore.googleapis.com")) {
        return;
    }

    e.respondWith(
        fetch(e.request)
            .then(response => {
                // Update cache with fresh response
                if (response.ok && e.request.method === "GET") {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                }
                return response;
            })
            .catch(() => caches.match(e.request))
    );
});
