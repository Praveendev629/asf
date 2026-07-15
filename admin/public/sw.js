const CACHE_NAME = "asf-admin-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE_NAME).map((x) => caches.delete(x)))));
  self.clients.claim();
});

self.addEventListener("push", (event) => {
  let data = { title: "ASF Admin", body: "You have a new update!", url: "/" };
  if (event.data) {
    try { data = { ...data, ...event.data.json() }; } catch { data.body = event.data.text(); }
  }
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body, icon: "/logo.png", badge: "/logo.png",
    vibrate: [200, 100, 200], tag: "asf-admin", renotify: true,
    data: { url: data.url || "/" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((w) => {
    for (const c of w) { if (c.url.includes(self.location.origin)) { c.navigate(url); return c.focus(); } }
    return clients.openWindow(url);
  }));
});
