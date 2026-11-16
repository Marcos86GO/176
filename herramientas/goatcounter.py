#!/usr/bin/env python3
"""Respuestas del test de afinidad desde la API de estadísticas de GoatCounter, en el CSV que lee herramientas/afinidad.js.

La exportación de GoatCounter (POST /api/v0/export) puede salir vacía; las estadísticas, no. Este script lista las
rutas de evento que empiezan por «afinidad/» (cada una lleva las respuestas y el identificador del dispositivo), y para
cada una pide la comunidad autónoma aproximada y el último día en que se registró. No guarda nada más.

Uso:
  python3 herramientas/goatcounter.py <salida.csv> [desde AAAA-MM-DD]
  node herramientas/afinidad.js <salida.csv>

La clave de la API la añade el proxy del entorno: no hay que pasar ninguna cabecera Authorization.
"""
import json, sys, time, unicodedata, urllib.parse, urllib.request, datetime

BASE = 'https://politica176.goatcounter.com/api/v0'
# Nombres de región que usa GoatCounter (en inglés) → código ISO 3166-2 de la comunidad autónoma
REG = {
    'andalusia': 'AN', 'andalucia': 'AN', 'aragon': 'AR', 'asturias': 'AS', 'principality of asturias': 'AS',
    'balearic islands': 'IB', 'illes balears': 'IB', 'canary islands': 'CN', 'canarias': 'CN', 'cantabria': 'CB',
    'castille-la mancha': 'CM', 'castilla-la mancha': 'CM', 'castile-la mancha': 'CM', 'castille and leon': 'CL',
    'castilla y leon': 'CL', 'castile and leon': 'CL', 'catalonia': 'CT', 'cataluna': 'CT', 'catalunya': 'CT',
    'extremadura': 'EX', 'galicia': 'GA', 'madrid': 'MD', 'community of madrid': 'MD', 'navarre': 'NC', 'navarra': 'NC',
    'basque country': 'PV', 'pais vasco': 'PV', 'euskadi': 'PV', 'murcia': 'MC', 'region of murcia': 'MC',
    'la rioja': 'RI', 'valencia': 'VC', 'valencian community': 'VC', 'comunidad valenciana': 'VC', 'ceuta': 'CE', 'melilla': 'ML'
}

def norm(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s or '') if unicodedata.category(c) != 'Mn').lower().strip()

def get(path, **q):
    url = BASE + path + ('?' + urllib.parse.urlencode(q, doseq=True) if q else '')
    for intento in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'Accept': 'application/json'}), timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(5 * (intento + 1)); continue
            raise
    raise RuntimeError('GoatCounter no responde: ' + url)

def main():
    salida = sys.argv[1]
    desde = sys.argv[2] if len(sys.argv) > 2 else '2026-11-01'
    hasta = datetime.date.today().isoformat()
    rango = {'start': desde, 'end': hasta}
    rutas, despues = [], None
    while True:
        q = dict(rango, limit=100)
        if despues: q['exclude_paths'] = despues
        d = get('/stats/hits', **q)
        nuevas = [h for h in d.get('hits', []) if h.get('event') and h.get('path', '').startswith('afinidad/')]
        rutas += nuevas
        if not d.get('more'): break
        despues = [h['path_id'] for h in d.get('hits', [])] + (despues or [])
        time.sleep(0.5)
    filas = []
    for h in rutas:
        dias = [s['day'] for s in h.get('stats', []) if s.get('daily', sum(s.get('hourly', [])))]
        dia = max(dias) if dias else hasta
        time.sleep(0.4)
        paises = get('/stats/locations', include_paths=h['path_id'], **rango).get('stats', [])
        loc = ''
        if paises:
            pais = max(paises, key=lambda x: x.get('count', 0)).get('id', '')
            loc = pais
            if pais == 'ES':
                time.sleep(0.4)
                regs = get('/stats/locations/ES', include_paths=h['path_id'], **rango).get('stats', [])
                if regs:
                    cod = REG.get(norm(max(regs, key=lambda x: x.get('count', 0)).get('name', '')))
                    if cod: loc = 'ES-' + cod
        filas.append((h['path'], loc, dia + 'T12:00:00Z'))
    with open(salida, 'w', encoding='utf-8') as f:
        f.write('Path,Bot,Location,Date\n')
        for p, loc, d in filas:
            f.write('%s,0,%s,%s\n' % (p, loc, d))
    print('rutas de afinidad: %d (las de «yo-» las descarta afinidad.js)' % len(filas))

if __name__ == '__main__':
    main()
