// Service worker de 176: red primero (los datos cambian a menudo) y copia local para abrir sin conexión.
var CACHE = '176-v1';
var BASE = ['./', 'index.html', 'data/mapa.js', 'data/contenido.js', 'data/sondeos.js', 'manifest.webmanifest', 'icons/icono-192.png', 'icons/icono-512.png', 'icons/icono.svg'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(BASE); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return; // analítica, fuentes, etc.: sin tocar
  e.respondWith(fetch(req).then(function(res){
    if(res.ok){ var copia = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copia); }); }
    return res;
  }).catch(function(){
    return caches.match(req, { ignoreSearch: true }).then(function(r){
      return r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error());
    });
  }));
});
