const CACHE_NAME = "asf-delivery-v1";
const STATIC_ASSETS = ["/", "/login", "/manifest.json", "/logo.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE_NAME).map((x) => caches.delete(x)))));
  self.clients.claim();
});

// Chrome requires a fetch handler for PWA installability
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.pathname.startsWith("/api/")) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "ASF Delivery", body: "You have a new update!", url: "/login" };
  if (event.data) {
    try { data = { ...data, ...event.data.json() }; } catch { data.body = event.data.text(); }
  }
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body, icon: "/logo.png", badge: "/logo.png",
    vibrate: [200, 100, 200], tag: "asf-delivery", renotify: true,
    data: { url: data.url || "/login" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/login";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((w) => {
    for (const c of w) { if (c.url.includes(self.location.origin)) { c.navigate(url); return c.focus(); } }
    return clients.openWindow(url);
  }));
});
