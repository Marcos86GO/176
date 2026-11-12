# Plan de la noche electoral del 29-N

Este documento recoge todo lo necesario para publicar y mantener la pestaña «Resultados» de las elecciones generales del 29 de noviembre de 2026. Sirve para que cualquier sesión de Claude (o una persona) pueda retomar el trabajo aunque se pierda la conversación en la que se preparó.

Última revisión: 12 de noviembre de 2026.

## 1. Qué se publica

- **Pestaña «Resultados»** (primera de la barra, con un punto rojo). Aparece sola el 29-N a las 12:00 hora peninsular (`DIRECTO_DESDE = 2026-11-29T11:00:00Z` en `index.html`). Antes de esa hora no se ve, aunque el código ya esté publicado. Si alguien tiene la web abierta desde antes, aparece a las 12:00 sin recargar.
- La página vuelve a leer `data/escrutinio.js` cada minuto hasta que el resultado sea definitivo (`definitivo: true`).
- Contenido de la pestaña, según la fase:
  - **antes** (12:00–20:00): «Hoy se vota», cuenta atrás al cierre de los colegios y avances de participación (14:00 y 18:00) frente a 2023.
  - **recuento** y **final**:
    1. Estado: % escrutado, hora del dato y participación. Aviso cuando hay menos del 40 % escrutado. Al acabar la noche pone «Provisional» y, con el escrutinio general, «Definitivo».
    2. Cámaras con selector Congreso | Senado, como en Cámaras e Intención de voto. El Congreso tiene hemiciclo, voto, escaños y cambio frente al Congreso disuelto. El Senado tiene hemiciclo de 267: 209 elegidos y 58 designados.
    3. «¿Cuánto se separa del pronóstico?»: desvío frente a la última media de sondeos. Muestra el desvío medio de los partidos con más del 3 %, los escaños en otras manos, la mayor sorpresa, una barra por partido y una gráfica del desvío durante la noche (sale de `historia`).
    4. «¿Quién suma 176?» con el recuento del momento.
    5. «Cómo se ha votado»: votos en persona, por correo y desde el extranjero, y voto por partido de España frente al extranjero cuando se cuente.
    6. Mapa: quién va primero en cada provincia, con el detalle de cada una.
- La pestaña «29-N» ya se llama «Intención de voto» en `main` desde el 11-N.

## 2. Dónde está el código

- Rama: `claude/gallant-wozniak-hxyy0e`. Contiene todo lo anterior sobre la versión de `main` del 12-N.
- Archivos: `index.html` (pestaña y lógica), `data/escrutinio.js` (datos de la noche), `sw.js` (no guarda copias por cada `?t=`), `README.md` y este documento.
- Demo privada con datos inventados y simulador de la noche: https://claude.ai/artifact/UpRZoHSKVhHGRnVvZ4KyuF. El simulador no está en el repositorio. Fuera de la demo no hace falta: activa `window.PE_DEMO` y llama a `window.peDirectoSet(datos)`.

## 3. Formato de `data/escrutinio.js`

Primera línea `window.PE=window.PE||{};window.PE.escrutinio=`, después un objeto JSON y al final `;`. Campos:

| Campo | Contenido |
|---|---|
| `fase` | `"antes"`, `"recuento"` o `"final"` |
| `definitivo` | `true` solo cuando el escrutinio general (con el voto del extranjero) ha terminado en las 52 provincias |
| `notaDefinitivo` | frase neutral, p. ej. si el voto del extranjero movió algún escaño |
| `actualizado` | fecha y hora ISO del dato oficial |
| `participacion` | `avances`: lista de `{h:"14:00", p, p23}`; `final`: `{p, p23}` (p23 = misma referencia en 2023) |
| `escrutado` | % de mesas escrutadas del Congreso |
| `voto` | % sobre votos válidos por partido (códigos de la app) |
| `escanos` | escaños del Congreso por partido (suma ≤ 350) |
| `prov` | por código INE de provincia (`"01"`–`"52"`): `{e: % escrutado, v: {% voto}, s: {escaños}}` |
| `historia` | actualizaciones anteriores `{h, e, voto}` (para la gráfica del desvío); se añade el dato anterior en cada actualización |
| `senado` | `escrutado`, `electos` (por candidatura), `designados`, `notaDesignados` |
| `modos` | `presencial.votos`, `correo.votos`, `extranjero` (`contado`, `votos`, `censo`, `voto`), `espana.voto` (voto por partido sin el extranjero), `fuente` |
| `fuente` | `{t, u}` de los datos |

Códigos de partido: PP (incluye UPN), PSOE, VOX, FA (Frente Amplio; heredero de Sumar), PODEMOS, ERC, JUNTS, BILDU, PNV, BNG, CC, ADELANTE, SALF. En el Senado: SDP (candidatura conjunta de PSOE y Frente Amplio) y OTROS.

Senadores designados por las comunidades (octubre de 2026, ya cargados): PP 23, PSOE 19, Vox 5, Junts 3 y uno de ERC, PNV, EH Bildu, BNG, CC, Compromís, Más Madrid y Geroa Bai. En el archivo, PSOE, Compromís y Más Madrid cuentan como SDP (21), y BNG, CC y Geroa Bai como OTROS (3). Fuentes: [Press Digital](https://www.pressdigital.es/articulo/politica/2026-10-10/6047347-pp-parte-23-senadores-asegurados-psoe-19-antes-29-n) y [Diario en Positivo](https://www.diarioenpositivo.com/espana/29n-senado-tiene-casi-60-escanos-asignados-margen-elecciones-23-pp-19-psoe-5-vox/20261026180929095636.html).

Sobre el voto por correo: los sobres se meten en la urna de cada mesa y se cuentan con el voto en persona, así que no hay resultados por partido del voto por correo, solo su número total. El voto de los españoles en el extranjero (CERA) se cuenta aparte en el escrutinio general, que empieza el miércoles 2-D, y sí tiene reparto por partido.

## 4. Fuentes de datos

- La fuente oficial es el Ministerio del Interior, pero el 11-N no era accesible desde el entorno de Claude: interior.gob.es muestra un desafío anti-bots de Cloudflare e infoelectoral.interior.gob.es no conecta.
- RTVE (rtve.es) y El Español (elespanol.com) sí respondían y republican los datos del Ministerio la noche electoral.
- El ensayo del 26-N debe dejar aquí la fuente elegida y el script de conversión (`scripts/escrutinio.py`, solo con la biblioteca estándar de Python). Si no hay script, las tareas rellenan el archivo a mano con la mejor fuente disponible.

## 5. Tareas programadas

Todas se ejecutan en la conversación `session_01PUGr7biere6byqxXUQMTp9` (fijada; no hay que archivarla). Horas peninsulares.

| Cuándo | Tarea | Id |
|---|---|---|
| Jue 26-N 18:10 | Ensayo: fuentes, script y prueba; informe al usuario | `trig_013T2ksYh4XZ7hQFRUiCWW1B` |
| Dom 29-N 11:15 | Publicar: aplicar la rama sobre el último `main`, probar y hacer push | `trig_017Uh3Ae3uGb6vmQu11qdB5Q` |
| 14:40 | Avance de participación de las 14:00 | `trig_01Q6NLaGJdYHxq5yaPnTJMk9` |
| 18:40 | Avance de participación de las 18:00 | `trig_011C6FHWK5DuHB87o56oJrHA` |
| 20:15 … 01:00, cada 15 min | Recuento (20 tareas, una por hora indicada) | ver lista abajo |
| Lun 30-N 01:30 | Última de la noche; `fase: "final"` si está al 100 %, sin `definitivo` | `trig_012234UjAPf6dnq5m4imZgWb` |
| 30-N 5:30, 9:30, 13:30, 17:30, 21:30 | Seguimiento cada 4 h | `trig_01K3NVyNUztmEzkCMSsLdoeE` |
| 1-D cada 4 h desde la 01:30 | Seguimiento cada 4 h | `trig_01QtaqoWeeK4R3gDJTxzLvNL` |
| Diaria 10:37, diciembre a febrero | Seguimiento diario hasta el resultado definitivo | `trig_01NDzk881bS7WKrmY7wq6rDp` |

Tareas del recuento: 20:15 `trig_01Ch1GWJRDfpS962nRCV5egV` · 20:30 `trig_01PuVguUxgGrbyrzuUSTfgM2` · 20:45 `trig_01QYDi6F23YYotJRHnQbDRBK` · 21:00 `trig_015WVUxnd6aCkQ59UQQibvUL` · 21:15 `trig_018Eemwg78rtGYDGzoBNt64s` · 21:30 `trig_01RqiDMw7pgGVzT4X9Pwi9m5` · 21:45 `trig_018a1HFkXqdHxKmM9ok8qa7k` · 22:00 `trig_01RvfJ8u9C8ad5RKisjQ7cqq` · 22:15 `trig_01TgrnczU3y1bLss7m2D6X2n` · 22:30 `trig_01XUq54J4ZGzX7wcnaNVwrWi` · 22:45 `trig_01KUgGcyBFL6AdTDwEpronA8` · 23:00 `trig_019ue3ZNh4bfUicR34kujAwy` · 23:15 `trig_01XEGgphEnsWHv2KvxPCWY5U` · 23:30 `trig_014W7nu7mF1LT45oaQrcYX8S` · 23:45 `trig_011wJ1pNibPNEWvrU9P6HPv2` · 00:00 `trig_01YaMtqBfZLq2fwhLny5u5P9` · 00:15 `trig_01G1qMnAZ1ynaYJocoXrqDeh` · 00:30 `trig_013vKaenkJgSyqJsH78yu79Z` · 00:45 `trig_01XzHS1hBFan8jq85KS7rzoQ` · 01:00 `trig_01EdiWVLf7LJ1yqayA4MQrQR`.

Además existe la tarea diaria «Actualización diaria 176», ajena a este plan, que actualiza `data/sondeos.js` a diario y, desde el 29-N, rellena `resultado` en ese archivo para las pestañas Intención de voto y Mapa. Es compatible porque toca otro archivo.

## 6. Qué hace cada tarea

**Publicar (29-N, 11:15).**
1. `git fetch origin main claude/gallant-wozniak-hxyy0e`.
2. Aplicar los commits de la rama que no están en `main` sobre el último `main` (cherry-pick o rebase), conservando todo lo que se haya cambiado en `main` entretanto.
3. Probar con Playwright:
   - antes de las 12:00 no hay pestaña Resultados;
   - a las 12:01 sí, seleccionada, y carga `data/escrutinio.js`;
   - la pestaña de sondeos se llama «Intención de voto»;
   - la barra de pestañas cabe a 360 px;
   - no hay errores de consola.
4. Push a `main` y comprobar GitHub Pages. Si algo falla y no se arregla antes de las 12:00, no publicar nada roto y avisar.

**Participación (14:40 y 18:40).** Añadir `{h, p, p23}` a `participacion.avances` y dejar `fase: "antes"`. Commit y push a `main`. Si aún no hay dato, no hacer commit.

**Recuento (cada 15 min).**
1. Rellenar `fase`, `actualizado`, `escrutado`, `voto`, `escanos`, `prov`, `participacion.final`, `senado.escrutado` y `senado.electos` (conservando los designados).
2. Añadir el dato anterior a `historia`.
3. Comprobar con node que el archivo carga y que los escaños suman como mucho 350.
4. Commit «Recuento 29-N: X % escrutado (hora)» y push a `main`. Si no hay datos nuevos, no hacer commit. Ser rápido: la siguiente llega en 15 minutos.

**Seguimiento (cada 4 h y luego diario).**
1. Si `definitivo` ya es `true`, desactivar las tres tareas de seguimiento (`update_trigger enabled=false`), avisar y terminar.
2. Si no, actualizar con el escrutinio y, desde el 2-D, con el escrutinio general (voto CERA), incluido `modos`.
3. Cuando el escrutinio general termine en las 52 provincias, poner `fase: "final"`, `escrutado: 100`, `definitivo: true` y `notaDefinitivo`, desactivar las tres tareas de seguimiento y avisar.

## 7. Si se pierde la conversación

1. Si solo se archivó, desarchivarla basta: las tareas vuelven a funcionar.
2. Si no, en una conversación nueva con este repositorio, leer este documento y recrear las tareas que falten. Se pueden ver con `list_triggers`; los nombres empiezan por «29-N», «Publicar…» o «Preparar…».
3. Las tareas pueden ir a la conversación nueva o crear una sesión nueva en cada ejecución.
4. Las instrucciones de cada tarea son las del apartado 6. El usuario autorizó el push a `main` para todo este plan.

## 8. Riesgos conocidos

- La fuente oficial no es accesible desde el entorno: se depende de medios que republican los datos. El ensayo del 26-N lo confirmará.
- Los datos llegan con hasta 15 minutos de retraso; la web los vuelve a leer cada minuto.
- El escrutinio general y el voto CERA pueden tardar días; las tareas diarias siguen hasta febrero si hace falta.
