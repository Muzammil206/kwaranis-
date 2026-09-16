/* NIS Kwara — PWA service worker */
const CACHE = 'nis-kwara-v1'

const NAV_CACHE = `${CACHE}-pages`
const STATIC_CACHE = `${CACHE}-static`

const VALID_CHANNELS = ['https://', 'http://']

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter(k => !k.startsWith(CACHE)).map(k => caches.delete(k)))
      await self.clients.claim()
    })()
  )
})

// URLs we never want to serve from cache (auth always hits the network).
function shouldBypass(url: URL): boolean {
  return url.pathname.startsWith('/api/auth/') || url.pathname === '/api/auth'
}

async function networkFirst(request: Request) {
  const cache = await caches.open(NAV_CACHE)
  try {
    const fresh = await fetch(request)
    if (fresh.ok) cache.put(request, fresh.clone())
    return fresh
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    return Response.error()
  }
}

async function staleWhileRevalidate(request: Request) {
  const cache = await caches.open(STATIC_CACHE)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then(res => {
      if (res.ok) cache.put(request, res.clone())
      return res
    })
    .catch(() => cached)
  return cached || (await network)
}

self.addEventListener('fetch', event => {
  const req = event.request

  if (req.method !== 'GET') return
  if (!VALID_CHANNELS.some(p => req.url.startsWith(p))) return

  const url = new URL(req.url)
  if (shouldBypass(url)) return

  // PDFs, reports, and payment images: cache once fetched so members can
  // reopen/download receipts offline.
  if (url.pathname.startsWith('/api/receipts') || url.pathname.startsWith('/api/reports')) {
    event.respondWith(networkFirst(req))
    return
  }

  // App shell / document navigations: network-first with offline fallback.
  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req))
    return
  }

  // Next static assets (/_next, /icons, fonts, …): stale-while-revalidate.
  event.respondWith(staleWhileRevalidate(req))
})