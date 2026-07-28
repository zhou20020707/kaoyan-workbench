// 考研备考工作台 Service Worker
const CACHE = 'kypt-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// 安装：预缓存核心资源
self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{})).then(()=>self.skipWaiting())
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

// 请求拦截：缓存优先，网络回退
self.addEventListener('fetch', e=>{
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached) return cached;
      return fetch(e.request).then(resp=>{
        // 只缓存同源和成功的响应
        if(resp && resp.status===200 && (e.request.url.startsWith(self.location.origin) || e.request.url.startsWith('https://cdn.jsdelivr'))){
          const copy = resp.clone();
          caches.open(CACHE).then(c=>c.put(e.request, copy)).catch(()=>{});
        }
        return resp;
      }).catch(()=>cached);
    })
  );
});
