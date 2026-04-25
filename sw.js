const CACHE="sam-v3";
const ASSETS=["/index.html","/manifest.json"];

self.addEventListener("install",e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>{
      // cache one by one so one failure doesn't break all
      return Promise.allSettled(ASSETS.map(a=>c.add(a)));
    }).then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",e=>{
  // API calls — never cache, always network
  if(e.request.url.includes("api.anthropic.com")){
    e.respondWith(fetch(e.request));
    return;
  }
  // everything else — cache first, then network
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached) return cached;
      return fetch(e.request).then(res=>{
        if(res&&res.status===200){
          const clone=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone));
        }
        return res;
      }).catch(()=>cached);
    })
  );
});
