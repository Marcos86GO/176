#!/usr/bin/env python3
"""Recuento del 29-N: descarga los resultados provisionales y escribe data/escrutinio.js.

Fuente: el servicio de datos de El Español, que republica el escrutinio provisional
del Ministerio del Interior (la web del Ministerio no es accesible desde el entorno de
las tareas: tiene un desafío anti-bots). Las mismas rutas sirven 2023 con datos reales,
así que el script se puede probar con `--eleccion 2023/23j`.

Uso (desde la raíz del repositorio):
  python3 scripts/escrutinio.py                     # 29-N: actualiza data/escrutinio.js
  python3 scripts/escrutinio.py --comprobar         # solo dice qué hay, no escribe nada
  python3 scripts/escrutinio.py --eleccion 2023/23j --salida /ruta/prueba.js   # prueba con 2023

Códigos de salida: 0 = archivo actualizado; 3 = sin datos nuevos (no hay que hacer
commit); 1 = error (el archivo no se toca).

Qué rellena: fase, actualizado, escrutado, voto, escanos, prov (e, v, s, V),
participacion.final, historia, senado.escrutado, senado.electos, modos.espana.voto,
fuente y fuenteHash. Conserva todo lo demás: participacion.avances, definitivo,
notaDefinitivo, modos (correo, extranjero…), senado.designados, senado.prov…
Los avances de participación, el voto por correo y el del extranjero (CERA) no están
en esta fuente: se rellenan a mano (ver docs/plan-29N.md, apartado 4).
"""
import argparse
import concurrent.futures
import datetime
import json
import os
import sys
import urllib.request
import zoneinfo

BASE = 'https://www.elespanol.com/resultados/elecciones/generals/data/v2'
PREFIJO = 'window.PE=window.PE||{};window.PE.escrutinio='
MADRID = zoneinfo.ZoneInfo('Europe/Madrid')
P23 = 70.40  # participación de la noche del 23-J (sin voto del extranjero), misma base que la del 29-N

# Código INE -> (id de El Español, ruta de la provincia). Comprobado con los datos de 2023.
PROVINCIAS = {
    '01': ('9', 'pais-vasco/araba-alava'),
    '02': ('4172', 'castilla-la-mancha/albacete'),
    '03': ('9887', 'comunidad-valenciana/alacant'),
    '04': ('1592', 'andalucia/almeria'),
    '05': ('5455', 'castilla-y-leon/avila'),
    '06': ('8280', 'extremadura/badajoz'),
    '07': ('3787', 'islas-baleares/illes-balears'),
    '08': ('635', 'cataluna/barcelona'),
    '09': ('5458', 'castilla-y-leon/burgos'),
    '10': ('8281', 'extremadura/caceres'),
    '11': ('1594', 'andalucia/cadiz'),
    '12': ('9885', 'comunidad-valenciana/castello'),
    '13': ('4173', 'castilla-la-mancha/ciudad-real'),
    '14': ('1595', 'andalucia/cordoba'),
    '15': ('2', 'galicia/a-coruna'),
    '16': ('4174', 'castilla-la-mancha/cuenca'),
    '17': ('636', 'cataluna/girona'),
    '18': ('1597', 'andalucia/granada'),
    '19': ('4175', 'castilla-la-mancha/guadalajara'),
    '20': ('11', 'pais-vasco/gipuzkoa'),
    '21': ('1590', 'andalucia/huelva'),
    '22': ('2637', 'aragon/huesca'),
    '23': ('1596', 'andalucia/jaen'),
    '24': ('5461', 'castilla-y-leon/leon'),
    '25': ('637', 'cataluna/lleida'),
    '26': ('9629', 'la-rioja/la-rioja'),
    '27': ('3', 'galicia/lugo'),
    '28': ('8793', 'comunidad-de-madrid/madrid'),
    '29': ('1593', 'andalucia/malaga'),
    '30': ('9053', 'region-de-murcia/murcia'),
    '31': ('9117', 'navarra/navarra'),
    '32': ('4', 'galicia/ourense'),
    '33': ('3659', 'principado-de-asturias/asturias'),
    '34': ('5459', 'castilla-y-leon/palencia'),
    '35': ('3916', 'islas-canarias/las-palmas'),
    '36': ('5', 'galicia/pontevedra'),
    '37': ('5462', 'castilla-y-leon/salamanca'),
    '38': ('3915', 'islas-canarias/santa-cruz-de-tenerife'),
    '39': ('4044', 'cantabria/cantabria'),
    '40': ('5454', 'castilla-y-leon/segovia'),
    '41': ('1591', 'andalucia/sevilla'),
    '42': ('5460', 'castilla-y-leon/soria'),
    '43': ('638', 'cataluna/tarragona'),
    '44': ('2635', 'aragon/teruel'),
    '45': ('4176', 'castilla-la-mancha/toledo'),
    '46': ('9886', 'comunidad-valenciana/valencia'),
    '47': ('5456', 'castilla-y-leon/valladolid'),
    '48': ('10', 'pais-vasco/bizkaia'),
    '49': ('5457', 'castilla-y-leon/zamora'),
    '50': ('2636', 'aragon/zaragoza'),
    '51': ('8276', 'ceuta/ceuta'),
    '52': ('9049', 'melilla/melilla'),
}

# Candidaturas de El Español -> códigos de la app. Lo que no está aquí se descarta salvo que saque escaños.
CONGRESO = {
    'PP': 'PP', 'UPN': 'PP', 'PSOE': 'PSOE', 'VOX': 'VOX', 'FA': 'FA', 'SUMAR': 'FA', 'PODEMOS': 'PODEMOS',
    'ERC': 'ERC', 'JUNTS': 'JUNTS', 'BILDU': 'BILDU', 'PNV': 'PNV', 'BNG': 'BNG', 'CC': 'CC', 'CCa': 'CC',
    'ADELANTE': 'ADELANTE', 'SALF': 'SALF', 'COMPROMIS': 'COMPROMIS', 'PACMA': 'PACMA', 'TE': 'TE',
    'CUP': 'CUP', 'NC': 'NC', 'UPL': 'UPL',
}
SENADO = {
    'PP': 'PP', 'UPN': 'PP', 'SDP': 'SDP', 'PSOE': 'SDP', 'VOX': 'VOX', 'JUNTS': 'JUNTS', 'PNV': 'PNV',
    'ERC': 'ERC', 'BILDU': 'BILDU', 'PODEMOS': 'PODEMOS', 'ADELANTE': 'ADELANTE',
}
SENADO_ERC_BILDU = ('ERC-BILDU', 'ERC+Bil')  # candidatura conjunta: se reparte entre ERC y BILDU


def bajar(ruta, intentos=3):
    url = BASE + '/' + ruta.strip('/') + '/'
    ultimo = None
    for _ in range(intentos):
        try:
            req = urllib.request.Request(url, headers={'Accept': 'application/json', 'User-Agent': '176-escrutinio/1.0'})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read().decode('utf-8'))
        except Exception as e:  # red o JSON roto: reintentar
            ultimo = e
    raise RuntimeError('No se pudo descargar ' + url + ': ' + str(ultimo))


def leer(ruta):
    with open(ruta, encoding='utf-8') as f:
        t = f.read().strip()
    if not t.startswith(PREFIJO) or not t.endswith(';'):
        raise ValueError(ruta + ' no tiene el formato esperado')
    return json.loads(t[len(PREFIJO):-1])


def escribir(ruta, datos):
    tmp = ruta + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        f.write(PREFIJO + '\n' + json.dumps(datos, ensure_ascii=False, indent=1) + '\n;\n')
    leer(tmp)  # vuelve a leerlo antes de sustituir el bueno
    os.replace(tmp, ruta)


def r1(x):
    return round(x, 1)


def candidaturas(resultados, tabla):
    """Suma votos y escaños por código de la app."""
    votos, escanos, otros = {}, {}, {}
    for c in resultados:
        nombre, v = c.get('name'), c.get('values') or {}
        cod = tabla.get(nombre)
        n, s = int(v.get('votes') or 0), int(v.get('sits') or 0)
        if cod is None:
            if s:  # una candidatura desconocida con escaño se guarda con su nombre
                cod = nombre
            else:
                otros[nombre] = otros.get(nombre, 0) + n
                continue
        votos[cod] = votos.get(cod, 0) + n
        if s:
            escanos[cod] = escanos.get(cod, 0) + s
    return votos, escanos, otros


def provincia(eleccion, ine, nacional):
    """Resultado de una provincia: su página o, si falla, la entrada del mapa nacional."""
    ident, ruta = PROVINCIAS[ine]
    try:
        d = bajar(eleccion + '/pages/congress/' + ruta)
        md = d.get('metaData') or {}
        votos, esc, otros = candidaturas(d.get('results') or [], CONGRESO)
        validos = sum(votos.values()) + sum(otros.values()) + int(md.get('whiteVotes') or 0)
        e = float(md.get('scruted') or 0)
    except Exception:
        m = (nacional.get('resultsMap') or {}).get(ident) or {}
        votos, esc, otros = candidaturas(m.get('results') or [], CONGRESO)
        validos = sum(votos.values()) + sum(otros.values())  # sin blancos: aproximado
        e = float(m.get('sc') or 0)
    if e <= 0 or validos <= 0:
        return {'e': 0, 'v': {}, 's': {}}
    v = {k: r1(100 * n / validos) for k, n in sorted(votos.items(), key=lambda x: -x[1]) if 100 * n / validos >= 0.5 or k in esc}
    return {'e': r1(e), 'v': v, 's': esc, 'V': validos}


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--eleccion', default='2026/29n', help='año/convocatoria en El Español (2023/23j para probar)')
    ap.add_argument('--entrada', default='data/escrutinio.js', help='archivo actual (se conserva lo que no viene de la fuente)')
    ap.add_argument('--salida', default=None, help='dónde escribir (por defecto, el mismo archivo de entrada)')
    ap.add_argument('--comprobar', action='store_true', help='solo muestra lo que hay en la fuente')
    ap.add_argument('--forzar', action='store_true', help='escribe aunque la fuente no haya cambiado')
    a = ap.parse_args()
    salida = a.salida or a.entrada

    try:
        actual = leer(a.entrada)
        nac = bajar(a.eleccion + '/pages/congress')
        sen = bajar(a.eleccion + '/pages/senate')
    except Exception as e:
        print('ERROR:', e, file=sys.stderr)
        return 1

    md, mds = nac.get('metaData') or {}, sen.get('metaData') or {}
    escrutado = float(md.get('scruted') or 0)
    resumen = 'Congreso %.2f %% escrutado, participación %s %% · Senado %.2f %% · empezado: %s' % (
        escrutado, md.get('participation'), float(mds.get('scruted') or 0), nac.get('started'))
    if a.comprobar:
        print(resumen)
        return 0
    if not nac.get('started') or escrutado <= 0:
        print('Aún no hay escrutinio en la fuente (' + resumen + '). No se cambia nada.')
        return 3
    huella = (nac.get('hashData') or '') + '/' + (sen.get('hashData') or '')
    if huella == actual.get('fuenteHash') and not a.forzar:
        print('Sin datos nuevos desde la última actualización (' + resumen + ').')
        return 3

    # Congreso, toda España
    votos, escanos, otros = candidaturas(nac.get('results') or [], CONGRESO)
    validos = sum(votos.values()) + sum(otros.values()) + int(md.get('whiteVotes') or 0)
    voto = {k: r1(100 * n / validos) for k, n in sorted(votos.items(), key=lambda x: -x[1]) if 100 * n / validos >= 0.1 or k in escanos}
    if sum(escanos.values()) > 350:
        print('ERROR: los escaños suman %d' % sum(escanos.values()), file=sys.stderr)
        return 1

    # Provincias, en paralelo
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
        prov = dict(zip(PROVINCIAS, ex.map(lambda c: provincia(a.eleccion, c, nac), PROVINCIAS)))

    # Senado: senadores elegidos por candidatura; la conjunta ERC-EH Bildu se reparte según su voto al Congreso
    _, sen_esc, _ = candidaturas([c for c in (sen.get('results') or []) if c.get('name') not in SENADO_ERC_BILDU], SENADO)
    electos = {}
    for c in sen.get('results') or []:
        s = int((c.get('values') or {}).get('sits') or 0)
        if not s:
            continue
        if c.get('name') in SENADO_ERC_BILDU:
            e_, b_ = votos.get('ERC', 0), votos.get('BILDU', 0)
            erc = round(s * e_ / (e_ + b_)) if e_ + b_ else s
            electos['ERC'] = electos.get('ERC', 0) + erc
            electos['BILDU'] = electos.get('BILDU', 0) + s - erc
        elif c.get('name') not in SENADO:
            electos['OTROS'] = electos.get('OTROS', 0) + s
    for k, s in sen_esc.items():
        if k in SENADO.values():
            electos[k] = electos.get(k, 0) + s
    electos = {k: v for k, v in sorted(electos.items(), key=lambda x: -x[1]) if v}

    nuevo = dict(actual)
    ahora = datetime.datetime.now(MADRID).replace(microsecond=0)
    if actual.get('fase') in ('recuento', 'final') and actual.get('voto') and actual.get('escrutado') != r1(escrutado):
        h = actual.get('actualizado') or ''
        hora = h[11:16] if len(h) >= 16 else ''
        nuevo['historia'] = (actual.get('historia') or []) + [{'h': hora, 'e': actual.get('escrutado'), 'voto': actual.get('voto')}]
    nuevo['fase'] = 'final' if escrutado >= 100 else 'recuento'
    nuevo['actualizado'] = ahora.isoformat()
    nuevo['escrutado'] = r1(escrutado) if escrutado < 100 else 100
    nuevo['voto'] = voto
    nuevo['escanos'] = escanos
    nuevo['prov'] = prov
    part = dict(actual.get('participacion') or {})
    part['final'] = {'p': r1(float(md.get('participation') or 0)), 'p23': P23}
    nuevo['participacion'] = part
    senado = dict(actual.get('senado') or {})
    senado['escrutado'] = r1(float(mds.get('scruted') or 0))
    senado['electos'] = electos
    nuevo['senado'] = senado
    modos = dict(actual.get('modos') or {})
    if not (modos.get('extranjero') or {}).get('contado'):
        modos['espana'] = {'voto': voto}
    nuevo['modos'] = modos
    nuevo['fuente'] = {'t': 'Ministerio del Interior, escrutinio provisional (vía El Español)', 'u': 'https://www.elespanol.com/elecciones/generales/'}
    nuevo['fuenteHash'] = huella

    try:
        escribir(salida, nuevo)
    except Exception as e:
        print('ERROR al escribir:', e, file=sys.stderr)
        return 1
    print('Escrito %s: %s %% escrutado · %s · Senado %s %%' % (salida, nuevo['escrutado'],
          ', '.join('%s %d' % kv for kv in sorted(escanos.items(), key=lambda x: -x[1])[:6]), senado['escrutado']))
    return 0


if __name__ == '__main__':
    sys.exit(main())
