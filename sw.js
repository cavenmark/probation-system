/* Service Worker — 试用期学习管理系统 PWA */
const CACHE_NAME = "probation-v2";
const ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

/* 安装：预缓存核心资源 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

/* 激活：清理旧缓存 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* 请求拦截：网络优先，离线回退缓存 */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  /* API 请求不走缓存 */
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        /* 成功获取，缓存一份 */
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        /* 网络失败，从缓存读取 */
        return caches.match(event.request);
      })
  );
});

/* ===== Web Push：接收推送消息 ===== */
self.addEventListener("push", (event) => {
  let data = { title: "学习提醒", body: "您有一条新通知" };
  try {
    if (event.data) data = JSON.parse(event.data.text());
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/icon-192.png",
    tag: data.tag || "reminder",
    data: data.data || {},
    requireInteraction: true,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "学习提醒", options)
  );
});

/* ===== 通知点击：打开应用 ===== */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // 如果已有打开的窗口，聚焦它
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      // 否则打开新窗口
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
