#!/usr/bin/env python3
"""Copia de la web en un solo HTML, para guardarla como artefacto privado en Claude.

Junta index.html y los archivos de data/ en un único archivo, quita la veda, el service worker y la
analítica, y añade un aviso con la fecha de la copia. Sirve tanto para el index.html de antes de la veda
como para el que ya la incluye.

Uso:  python3 herramientas/captura.py SALIDA.html [--intencion] [--raiz DIR] [--fecha "23 nov 2026, 23:45"]
  --intencion  solo la pestaña Intención (por defecto, la app entera)
  --raiz       carpeta con index.html y data/ (por defecto, la del repositorio)
"""
import argparse
import os
import re
import sys
from datetime import datetime, timedelta, timezone

ap = argparse.ArgumentParser()
ap.add_argument('salida')
ap.add_argument('--intencion', action='store_true')
ap.add_argument('--raiz', default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ap.add_argument('--fecha', default=datetime.now(timezone(timedelta(hours=1))).strftime('%d/%m/%Y %H:%M'))
a = ap.parse_args()

s = open(os.path.join(a.raiz, 'index.html'), encoding='utf-8').read()


def cambia(viejo, nuevo, opcional=False):
    global s
    c = s.count(viejo)
    if c == 0 and opcional:
        return
    if c != 1:
        sys.exit('No encuentro (%d veces): %s' % (c, viejo[:80]))
    s = s.replace(viejo, nuevo)


# Esqueleto: el artefacto pone doctype, html, head, body, charset y viewport
m = re.match(r'<!DOCTYPE html>\s*<html[^>]*>\s*<head>\s*<meta charset="utf-8">\s*<meta name="viewport"[^>]*>\s*(<title>[^<]*</title>)\s*', s)
if not m:
    sys.exit('No he podido quitar la cabecera de index.html')
s = ('<title>Intención de voto 176</title>' if a.intencion else m.group(1)) + '\n' + s[m.end():]
s = re.sub(r'<meta name="(theme-color|apple-mobile-web-app-title|mobile-web-app-capable|apple-mobile-web-app-capable)"[^>]*>\n', '', s)
s = re.sub(r'<link rel="(manifest|icon|apple-touch-icon)"[^>]*>\n', '', s)
s = s.replace('</head>\n<body>\n', '').replace('</body>\n</html>', '')
if not s.startswith('<title>'):
    sys.exit('No he podido quitar la cabecera de index.html')

# Datos dentro de la página
def datos(m):
    js = open(os.path.join(a.raiz, 'data', m.group(1)), encoding='utf-8').read()
    return '<script>\n' + js.replace('</', '<\\/') + '\n</script>'
s, n = re.subn(r'<script src="data/([a-z]+\.js)"></script>', datos, s)
if n < 3:
    sys.exit('Faltan archivos de datos (%d)' % n)

# Sin veda ni recargas (VD vacío deja la veda sin fechas), sin bienvenida
cambia('var VD = C.meta.veda || {}', 'var VD = {}', opcional=True)
cambia("if(!store('pe-coach')){", 'if(false){')

if a.intencion:
    for t in ['camaras', 'leyes', 'propuestas', 'mapa']:
        s, n = re.subn(r'  <button class="tab" role="tab" data-tab="%s"[^\n]*\n' % t, '', s)
        if n != 1:
            sys.exit('No encuentro la pestaña ' + t)
    cambia('<section id="s-camaras" class="stack" role="tabpanel" aria-labelledby="t-camaras">',
           '<section id="s-camaras" class="stack" role="tabpanel" aria-labelledby="t-camaras" hidden>')
    s = re.sub(r"var TABS = [^\n]*?\], RENDER", "var TABS = ['sondeos'], RENDER", s, count=1)
    cambia("if(TABS.indexOf(tab) < 0) tab = 'camaras';", 'if(TABS.indexOf(tab) < 0) tab = TABS[0];')
    cambia("go(location.hash.slice(1) || 'camaras');", "go('sondeos');")

# Fuera: service worker y analítica
s = re.sub(r"<script>\nif\('serviceWorker' in navigator\)[^\n]*\n</script>\n", '', s)
s = re.sub(r'<script data-goatcounter=[^\n]*</script>', '', s)
if 'serviceWorker' in s or 'gc.zgo.at' in s:
    sys.exit('No he podido quitar el service worker o la analítica')

# Aviso de copia
que = 'Pestaña Intención de 176' if a.intencion else 'Copia de la web 176'
s += """<script>
(function(){
  var S = (window.PE || {}).sondeos || {}, f = S.actualizado || '', M = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var fl = f ? (+f.slice(8, 10)) + ' de ' + M[+f.slice(5, 7) - 1] + ' de ' + f.slice(0, 4) : '';
  var e = document.getElementById('estado'); if(e) e.textContent = 'Copia guardada el %(fecha)s' + (fl ? ' · sondeos del ' + fl : '');
  var m = document.querySelector('main');
  if(m) m.insertAdjacentHTML('afterbegin', '<div class="card" style="margin-bottom:14px;border-left:4px solid var(--warn)"><p class="eyebrow">Copia privada</p><p style="margin:4px 0 0">%(que)s tal como estaba el %(fecha)s' + (fl ? ', con los sondeos publicados hasta el ' + fl : '') + '. No la compartas entre el 24 de noviembre y el cierre de los colegios el 29-N a las 20:00.</p></div>');
})();
</script>
""" % {'fecha': a.fecha, 'que': que}

open(a.salida, 'w', encoding='utf-8').write(s)
print('Copia escrita en %s (%d KB)' % (a.salida, len(s.encode('utf-8')) // 1024))
