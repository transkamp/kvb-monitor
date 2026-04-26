/**
 * KVB Abfahrtsmonitor — Service Worker
 *
 * Cache strategies:
 *   - /api/*                 → network-only (live data must never be stale)
 *   - /_next/static/*, icons → cache-first  (versioned, immutable)
 *   - HTML pages             → network-first with cache fallback
 *   - sw.js, manifest        → network-only (no self-caching)
 *
 * Bump CACHE_VERSION when changing this file or cache layout.
 */

const CACHE_VERSION = "v1";
const STATIC_CACHE = `kvb-static-${CACHE_VERSION}`;
const PAGES_CACHE = `kvb-pages-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)))
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== PAGES_CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Same-origin only.
  if (url.origin !== self.location.origin) return;

  // Never cache API responses or the SW/manifest themselves.
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname === "/sw.js" ||
    url.pathname === "/manifest.webmanifest"
  ) {
    return; // default: pass-through to network
  }

  // Static assets: cache-first.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/favicon.ico" ||
    url.pathname === "/favicon.png"
  ) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // HTML / pages: network-first, cache fallback.
  if (req.mode === "navigate" || req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirst(req, PAGES_CACHE));
    return;
  }
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    return cached || Response.error();
  }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const cached = await cache.match(req);
    return cached || Response.error();
  }
}
