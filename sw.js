/* Service Worker — 试用期学习管理系统 PWA */
const CACHE_NAME = "probation-v1";
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
