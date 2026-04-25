const CACHE="sam-v4";
const ASSETS=["/index.html","/manifest.json"];

self.addEventListener("install",e=>{
  self.skipWaiting();
});

self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",e=>{
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});
