// Service worker de 176: red primero (los datos cambian a menudo) y copia local para abrir sin conexión.
var CACHE = '176-v6';
var BASE = ['./', 'index.html', 'data/mapa.js', 'data/contenido.js', 'data/sondeos.js', 'data/sondeos-xvi.js', 'data/escrutinio.js', 'data/senado2023.js', 'data/afinidad.js', 'manifest.webmanifest', 'icons/icono-192.png', 'icons/icono-512.png', 'icons/icono.svg'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(BASE); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e){
  var req = e.request, url = new URL(req.url);
  if(req.method !== 'GET' || url.origin !== self.location.origin) return; // analítica, fuentes, etc.: sin tocar
  var key = url.origin + url.pathname; // sin ?t=…: una sola copia de cada archivo aunque se pida cada minuto
  e.respondWith(fetch(req, { cache: 'no-cache' }).then(function(res){
    if(res.ok){ var copia = res.clone(); caches.open(CACHE).then(function(c){ c.put(key, copia); }); }
    return res;
  }).catch(function(){
    return caches.match(key).then(function(r){
      return r || (req.mode === 'navigate' ? caches.match(url.origin + url.pathname.replace(/[^/]*$/, '')) : Response.error());
    });
  }));
});
