#!/usr/bin/env python3
"""Veda electoral: retira de data/sondeos.js las encuestas y las medias, y las restaura después.

  python3 herramientas/veda.py quitar      # 23-N, 23:55: deja solo lo que no es un sondeo y "veda": true
  python3 herramientas/veda.py restaurar   # 29-N, 20:05: vuelve a la última versión antes de quitar
  python3 herramientas/veda.py comprobar   # dice si el archivo está en veda y si carga bien

«quitar» no hace commit: el mensaje del commit tiene que empezar por MARCA para que «restaurar» encuentre
la versión anterior en el historial de git. «restaurar» toma el archivo del commit padre de ese commit
y conserva `resultado` si entretanto se ha rellenado.
"""
import json
import os
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARCHIVO = os.path.join(RAIZ, 'data', 'sondeos.js')
PREFIJO = 'window.PE=window.PE||{};window.PE.sondeos='
MARCA = 'Veda electoral: se retiran los sondeos'
NOTA = ('Veda electoral: del 24 de noviembre al cierre de los colegios el 29-N a las 20:00 la ley prohíbe '
        'publicar sondeos. Los datos vuelven a las 20:05.')
# Lo único que se queda durante la veda: nada de esto es un sondeo
QUEDA = ['revisado', 'estado', 'notas', 'resultado']
QUEDA_SENADO = ['total', 'mayoria', 'electos', 'designados', 'notaDesignados']


def leer(texto):
    i = texto.index('=', texto.index('PE.sondeos'))
    return json.loads(texto[i + 1:].strip().rstrip(';'))


def escribir(obj):
    with open(ARCHIVO, 'w', encoding='utf-8') as f:
        f.write(PREFIJO + '\n' + json.dumps(obj, ensure_ascii=False, indent=1) + '\n;\n')


def quitar():
    d = leer(open(ARCHIVO, encoding='utf-8').read())
    if d.get('veda'):
        sys.exit('data/sondeos.js ya está en veda')
    nuevo = {'veda': True}
    for k in QUEDA:
        if k in d:
            nuevo[k] = d[k]
    nuevo['notas'] = [NOTA]
    nuevo['senado'] = {k: d['senado'][k] for k in QUEDA_SENADO if k in d.get('senado', {})}
    escribir(nuevo)
    print('Sondeos retirados. Haz commit con un mensaje que empiece por: «%s»' % MARCA)


def restaurar():
    sha = subprocess.run(['git', 'log', '-1', '--format=%H', '--grep=^' + MARCA, '--', 'data/sondeos.js'],
                         cwd=RAIZ, capture_output=True, text=True, check=True).stdout.strip()
    if not sha:
        sys.exit('No encuentro el commit «%s» en el historial' % MARCA)
    antes = subprocess.run(['git', 'show', sha + '^:data/sondeos.js'], cwd=RAIZ, capture_output=True, text=True, check=True).stdout
    d = leer(antes)
    actual = leer(open(ARCHIVO, encoding='utf-8').read())
    if actual.get('resultado') is not None:
        d['resultado'] = actual['resultado']
    if actual.get('pieDeUrna'):
        d['pieDeUrna'] = actual['pieDeUrna']
    if actual.get('revisado'):
        d['revisado'] = actual['revisado']
    d['notas'] = ['Del 24 al 29 de noviembre a las 20:00 no se publicaron sondeos por la veda electoral: '
                  'esta es la última media antes de la veda.']
    d.pop('veda', None)
    escribir(d)
    print('Sondeos restaurados desde %s^ (%d encuestas en lista)' % (sha[:7], len(d.get('lista') or [])))


def comprobar():
    d = leer(open(ARCHIVO, encoding='utf-8').read())
    print('veda' if d.get('veda') else 'con sondeos (%d encuestas)' % len(d.get('lista') or []))


{'quitar': quitar, 'restaurar': restaurar, 'comprobar': comprobar}[sys.argv[1] if len(sys.argv) > 1 else 'comprobar']()
