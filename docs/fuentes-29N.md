# Fuentes de datos del 29-N

Resultado del ensayo del 26-N (jueves, 18:10). Complementa el apartado 4 de `docs/plan-29N.md`.

## 1. Ministerio del Interior: no accesible

El 26-N, igual que el 11-N, `www.interior.gob.es` e `infoelectoral.interior.gob.es` responden 403 con un desafío anti-bots (Cloudflare) a las peticiones del entorno de las tareas. No se intenta saltar esa protección. Los datos oficiales llegan a través de un medio que los republica.

## 2. Fuente principal: servicio de datos de El Español

El Español republica el escrutinio provisional del Ministerio en JSON. La ruta es la misma para 2023, con datos reales, y para el 29-N, ya creada y vacía (`"started": false`), lo que permite probarlo todo ahora.

Base: `https://www.elespanol.com/resultados/elecciones/generals/data/v2/`

| Qué | Ruta (29-N; para 2023, `2023/23j`) |
|---|---|
| Congreso, toda España (incluye `resultsMap` con las 52 provincias por id interno) | `2026/29n/pages/congress/` |
| Congreso, una provincia (con votos en blanco, participación y % escrutado) | `2026/29n/pages/congress/<comunidad>/<provincia>/`, p. ej. `comunidad-de-madrid/madrid/` |
| Senado, toda España (senadores por candidatura y % escrutado) | `2026/29n/pages/senate/` |
| Circunscripciones del Senado (59, con islas): id, nombre y ruta | `territories/senate/constituencies/` |

- `metaData`: `scruted` (% escrutado), `participation`, `votes`, `whiteVotes`, `nullVotes`, `census`, `sits`.
- `results`: lista de candidaturas con `values.votes`, `values.sits` y `values.percVotes`. El porcentaje de El Español es sobre los votos a candidaturas, sin los blancos. El script lo recalcula sobre los votos válidos (con blancos), como da el Ministerio.
- `hashData` cambia con cada actualización: el script lo guarda en `fuenteHash` para saber si hay datos nuevos.
- La tabla de ids internos y códigos INE de las 52 provincias está en `scripts/escrutinio.py` (`PROVINCIAS`). Está comprobada con 2023: los escaños de todas las provincias coinciden con los oficiales, y los votos de Huelva y Jaén, las dos que podían confundirse, cuadran exactamente.
- Candidaturas del 29-N en la fuente: Congreso con PP, UPN, PSOE, VOX, FA, PODEMOS, ERC, JUNTS, BILDU, PNV, BNG, CC, COMPROMIS, ADELANTE, SALF, TE, PACMA y otras; Senado con PP, UPN, SDP, PSOE, VOX, JUNTS, PNV, `ERC-BILDU` (conjunta), PODEMOS, ADELANTE, ASG, AHI, GBAI, CC, BNG y otras.

## 3. Script: `scripts/escrutinio.py`

Solo biblioteca estándar de Python. Desde la raíz del repositorio:

```
python3 scripts/escrutinio.py --comprobar        # qué hay en la fuente, sin escribir
python3 scripts/escrutinio.py                    # actualiza data/escrutinio.js
python3 scripts/escrutinio.py --eleccion 2023/23j --salida /ruta/prueba.js   # prueba con 2023
```

- Códigos de salida:
  - `0`: archivo actualizado; hacer commit y push.
  - `3`: sin datos nuevos o aún sin escrutinio; no hacer commit.
  - `1`: error; el archivo no se toca.
- Tarda unos 3 segundos: 2 descargas nacionales y 52 provinciales, 8 en paralelo. Si una provincia falla, usa su entrada del mapa nacional, sin blancos.
- Rellena `fase` (`recuento`, o `final` al 100 %), `actualizado` (hora de la descarga), `escrutado`, `voto`, `escanos`, `prov` (`e`, `v`, `s`, `V`), `participacion.final` (con `p23` = 70,4, la de la noche de 2023), `historia` (añade el dato anterior), `senado.escrutado`, `senado.electos`, `modos.espana.voto` (mientras no se cuente el extranjero), `fuente` y `fuenteHash`.
- Conserva todo lo demás: `participacion.avances`, `definitivo`, `notaDefinitivo`, `modos` (correo y extranjero), `senado.designados`, `senado.notaDesignados` y `senado.prov` si existe.
- Códigos:
  - UPN se suma al PP, igual que en el resto de la web, y en 2023 Sumar cuenta como FA.
  - En el Senado, PSOE cuenta como SDP. La candidatura conjunta ERC-EH Bildu se reparte entre ERC y BILDU según el voto de cada uno al Congreso, porque la fuente solo da el total. Lo que no tiene código va a OTROS.
- Prueba del 26-N con los datos de 2023:
  - 350 escaños, PP 138 (con UPN), PSOE 121, Vox 33, FA 31.
  - Las 52 provincias coinciden con los escaños oficiales. Los porcentajes difieren a lo sumo 0,4 puntos en Lugo y Ourense, porque la noche no incluye el voto del extranjero; en Navarra difiere porque UPN va con el PP.
  - La página de `main`, con el reloj del 29-N a las 22:00 y a las 03:00 del 30-N, se ve sin errores y sin desbordar a 360 px.
- Con los datos actuales del 29-N (`started: false`) el script no cambia nada y sale con `3`.

## 4. Lo que la fuente no tiene: se rellena a mano

- **Avances de participación (14:00 y 18:00).** No están en el JSON. Los publica el Ministerio y los dan al momento RTVE, El Español y las agencias; buscarlos con WebSearch y añadirlos a `participacion.avances` como `{h, p, p23}`. `p23` es la participación a esa hora en 2023; tomarla de la misma noticia, porque el Ministerio da siempre la comparación. Referencia sin confirmar: unos 40,5 % a las 14:00 y alrededor del 53 % a las 18:00.
- **Senado por provincias (`senado.prov`).** El JSON del Senado solo dice qué candidatura va primera en cada circunscripción (`resultsMap[id].ca`), no cuántos senadores saca. Si la tarea del 27-N no encuentra otra fuente, el mapa del Senado dirá que no hay datos.
- **Voto por correo (`modos.correo.votos`).** Lo publica Correos (votos recibidos) en nota de prensa, normalmente el día antes o el mismo 29-N. Referencia: en 2023 recibió 2.471.935 votos de 2.622.808 solicitudes admitidas. `modos.presencial.votos` = votos emitidos en España (`metaData.votes` de la fuente) − votos por correo.
- **Voto desde el extranjero (CERA) y escrutinio general.** No está en la noche electoral. Las juntas electorales lo cuentan desde el miércoles 2-D y lo publican el Ministerio y la Junta Electoral Central; los medios suelen contar qué escaños cambia. El censo CERA del 29-N es de unos 2,7 millones según el INE. Hay que comprobar el 2-D si El Español actualiza su JSON con el escrutinio general; si no, rellenar `modos.extranjero` y los cambios de escaños a mano.

## 5. Riesgos

- Depender de un medio: si El Español cambia las rutas, se cae o tarda, el script sale con `1` o `3` y no toca el archivo. Plan B: la página provincial de El Español o RTVE, a mano.
- La hora de `actualizado` es la de la descarga, no la del dato oficial, porque la fuente no la da.
- El reparto ERC/EH Bildu de la candidatura conjunta al Senado es aproximado.
