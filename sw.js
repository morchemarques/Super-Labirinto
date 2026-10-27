const K='sl-v4',F=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(K).then(c=>c.addAll(F)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(clients.claim()));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);
 if(e.request.method!=='GET'||['/ev','/m','/ip'].includes(u.pathname))return; // rede de jogo nunca vai para o cache
 e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(K).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./super-labirinto.html'))))});
