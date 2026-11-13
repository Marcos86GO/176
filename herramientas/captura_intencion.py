#!/usr/bin/env python3
"""Captura de la pestaña Intención en una sola página HTML, para guardarla como artefacto privado.

Junta index.html y los tres archivos de datos en un único archivo, deja solo la pestaña Intención
(interactiva: Congreso/Senado, CIS de fondo, calculadora de pactos, sondeo a sondeo…), quita la veda,
la recarga automática, el service worker y la analítica, y añade un aviso con la fecha de la captura.

Uso:  python3 herramientas/captura_intencion.py SALIDA.html ["23 nov 2026, 23:30"]
"""
import os
import sys
from datetime import datetime, timedelta, timezone

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
salida = sys.argv[1]
cuando = sys.argv[2] if len(sys.argv) > 2 else datetime.now(timezone(timedelta(hours=1))).strftime('%d/%m/%Y %H:%M')

s = open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()


def cambia(viejo, nuevo, n=1):
    global s
    c = s.count(viejo)
    if c != n:
        sys.exit('No encuentro (%d veces): %s' % (c, viejo[:80]))
    s = s.replace(viejo, nuevo)


def datos(nombre):
    js = open(os.path.join(RAIZ, 'data', nombre), encoding='utf-8').read()
    return '<script>\n' + js.replace('</', '<\\/') + '\n</script>'


# Esqueleto: el artefacto pone doctype, html, head, body, charset y viewport
cambia('<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>176 · Panorama político español</title>\n',
       '<title>Intención de voto 176</title>\n')
for viejo in ['<meta name="theme-color" content="#111B24">\n', '<link rel="manifest" href="manifest.webmanifest">\n',
              '<link rel="icon" href="icons/icono.svg" type="image/svg+xml">\n',
              '<link rel="icon" href="icons/icono-192.png" type="image/png" sizes="192x192">\n',
              '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n', '<meta name="apple-mobile-web-app-title" content="176">\n',
              '<meta name="mobile-web-app-capable" content="yes">\n', '<meta name="apple-mobile-web-app-capable" content="yes">\n',
              '</head>\n<body>\n', '</body>\n</html>']:
    cambia(viejo, '')

# Solo la pestaña Intención
for t in ['camaras', 'leyes', 'propuestas', 'mapa']:
    linea = [l for l in s.split('\n') if 'data-tab="%s"' % t in l and '<button class="tab"' in l]
    if len(linea) != 1:
        sys.exit('No encuentro la pestaña ' + t)
    cambia(linea[0] + '\n', '')

cambia('<section id="s-camaras" class="stack" role="tabpanel" aria-labelledby="t-camaras">', '<section id="s-camaras" class="stack" role="tabpanel" aria-labelledby="t-camaras" hidden>')

# Datos dentro de la página
for n in ['mapa.js', 'contenido.js', 'sondeos.js']:
    cambia('<script src="data/%s"></script>' % n, datos(n))

# Sin veda, sin noche electoral y sin recargas (VD vacío deja V0 y V1 sin fecha)
cambia('var VD = C.meta.veda || {}', 'var VD = {}')
cambia("var TABS = VEDA ? ['camaras','leyes','propuestas','mapa'] : ['camaras','sondeos','leyes','propuestas','mapa'], RENDER",
       "var TABS = ['sondeos'], RENDER")
cambia("if(TABS.indexOf(tab) < 0) tab = 'camaras';", 'if(TABS.indexOf(tab) < 0) tab = TABS[0];')
cambia("go(location.hash.slice(1) || 'camaras');", "go('sondeos');")
cambia("if(!store('pe-coach')){", 'if(false){')

# Aviso de captura
cambia('})();\n</script>\n<script>\n(function(){\n  var KEY', """$('#estado').textContent = 'Copia guardada el """ + cuando + """ · sondeos del ' + fecha(S.actualizado);
$('#aviso').innerHTML = '<div class="card" style="margin-bottom:14px;border-left:4px solid var(--warn)"><p class="eyebrow">Copia privada</p><p style="margin:4px 0 0">Pestaña Intención de 176 tal como estaba el """ + cuando + """, con los sondeos publicados hasta el ' + fecha(S.actualizado, 1) + '. Es la última estimación antes de la veda: no la compartas entre el 24 de noviembre y el cierre de los colegios el 29-N a las 20:00.</p></div>';
})();
</script>
<script>
(function(){
  var KEY""")

# Fuera: service worker y analítica
cambia("<script>\nif('serviceWorker' in navigator){ window.addEventListener('load', function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); }); }\n</script>\n", '')
i = s.index('<script data-goatcounter=')
s = s[:i] + s[s.index('</script>', i) + 9:]

open(salida, 'w', encoding='utf-8').write(s)
print('Captura escrita en %s (%d KB)' % (salida, len(s.encode('utf-8')) // 1024))
