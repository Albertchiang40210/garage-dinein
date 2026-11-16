// 離線快取:第一次有網路時載入後,之後斷網也能開啟
const CACHE = 'dinein-shell-v1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// 有網路就更新快取,沒網路就用快取
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // cache:'no-cache' = 每次都向伺服器確認有沒有新檔,不吃瀏覽器 10 分鐘的暫存
  e.respondWith(fetch(e.request, {cache: 'no-cache'}).then(r => {
    const copy = r.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
