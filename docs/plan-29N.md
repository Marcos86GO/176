# Plan de la noche electoral del 29-N

La hoja de ruta visual está en https://claude.ai/artifact/FUu5Jq47AM42oipqbK2JGh (privada).

Este documento recoge todo lo necesario para publicar y mantener la pestaña «En Vivo» (después «Resultados») de las elecciones generales del 29 de noviembre de 2026. Sirve para que cualquier sesión de Claude (o una persona) pueda retomar el trabajo aunque se pierda la conversación en la que se preparó.

Última revisión: 13 de noviembre de 2026 (tarde): cambios pedidos por el usuario en la veda, la pestaña «En Vivo» y la XVI Legislatura (apartado 9).

## 1. Qué se publica

- **Pestaña «En Vivo»** (primera de la barra, con una luz roja que parpadea). Aparece sola el 29-N a las 12:00 hora peninsular (`DIRECTO_DESDE = 2026-11-29T11:00:00Z` en `index.html`). Antes de esa hora no se ve, aunque el código ya esté publicado. Si alguien tiene la web abierta desde antes, aparece a las 12:00 sin recargar.
- **El 30-N a las 02:00** (`RESULTADOS_DESDE`, tras la última actualización de la noche) la pestaña pasa a llamarse «Resultados» y pierde la luz. Su contenido se sigue actualizando con las tareas de seguimiento (cada 4 horas el 30-N y el 1-D, y después una vez al día) hasta el escrutinio general con el voto del extranjero.
- La página vuelve a leer `data/escrutinio.js` cada minuto hasta que el resultado sea definitivo (`definitivo: true`).
- **Escaños por provincia con un mínimo escrutado** (`MIN_PROV = 25` en `index.html`): los escaños de una provincia solo se suman al Congreso, a «¿Quién suma 176?» y al desvío cuando esa provincia lleva al menos el 25 % escrutado; hasta entonces salen grises, «por asignar», y se dice cuántos quedan y en cuántas provincias. Con `fase: "final"` se cuentan todos. En el Senado se usa `senado.prov` si existe (mismo umbral por provincia) y, si no, `senado.escrutado` de toda España.
- **Veda** (cambio del 13-N): la ley solo prohíbe publicar sondeos nuevos, así que del 24-N a las 00:00 al 29-N a las 20:00 la pestaña Intención, la estimación del mapa y las fichas de partido siguen visibles con los últimos sondeos publicados hasta el 23-N, sin actualizar y con un aviso arriba. `data/sondeos.js` ya no se vacía ni se restaura (se quitaron `herramientas/veda.py` y `captura.py`). La tarea diaria de sondeos no lo toca esos días.
- Contenido de la pestaña, según la fase:
  - **antes** (12:00–20:00): «Hoy se vota», cuenta atrás al cierre de los colegios, la tarjeta de participación (siempre visible, con los avances de las 14:00 y las 18:00 «pendientes» hasta que lleguen, frente a 2023) y la tarjeta «Esta noche», que explica qué aparecerá desde las 20:00.
  - **recuento** y **final**:
    1. Arriba del todo, dos cifras juntas: participación (la del recuento o, mientras no llegue, el último avance) y % escrutado, con la hora del dato. Aviso cuando hay menos del 40 % escrutado. Al acabar la noche pone «Provisional» y, con el escrutinio general, «Definitivo».
    2. Cámaras con selector Congreso | Senado, como en Cámaras e Intención. El Congreso tiene hemiciclo, voto, escaños y cambio frente al Congreso disuelto. El Senado tiene hemiciclo de 267: 209 elegidos y 58 designados.
    3. «¿Cuánto se separa del pronóstico?»: desvío frente a la última media de sondeos o, con el selector «Sondeos antes de la veda» / «Pie de urna», frente a la media simple de las encuestas a pie de urna (`sondeos.pieDeUrna`, que la página vuelve a leer cada 2 minutos esa noche). Muestra el desvío medio de los partidos con más del 3 %, los escaños en otras manos, la mayor sorpresa, una barra por partido y una gráfica del desvío durante la noche (sale de `historia`).
    4. «¿Quién suma 176?» con el recuento del momento.
    5. «Cómo se ha votado»: votos en persona, por correo y desde el extranjero, y voto por partido de España frente al extranjero cuando se cuente.
    6. Mapa: quién va primero en cada provincia, con el detalle de cada una. Las provincias que cambian el reparto de escaños frente al Congreso actual (2023; FA = Sumar, PP con UPN) salen con borde oscuro y en relieve, con quién gana y quién pierde. Lo mismo en la pestaña Mapa con «Resultado 29-N» en la XVI Legislatura.
- **Con «Senado» seleccionado** todo el bloque cambia de cámara: hemiciclo, comparación con la estimación del Senado o con las encuestas a pie de urna que den Senado (campo `sen` de cada encuesta: senadores elegidos por candidatura, como texto), «¿Quién suma 134?» con los designados y el mapa del Senado por provincias (relieve en las que cambian frente a 2023, con `data/senado2023.js`).
- Orden de las pestañas en `main` desde el 12-N: Cámaras · Intención · Votaciones · Propuestas · Mapa; el 29-N se añade «En Vivo» delante (desde el 30-N, «Resultados»). En la XVI Legislatura: Cámaras · Votaciones · Propuestas · Mapa · Sondeos (apartado 9). La pestaña de sondeos se llama «Intención» (con `aria-label` «Intención de voto») y la antigua «Leyes» es «Votaciones».
- Desde el 12-N la media de sondeos que usa toda la web (también el desvío de Resultados) es propia: media de la última encuesta de cada encuestadora, sin el CIS, ponderada por entrevistas y por fecha (vida media de 3 días), con un intervalo del 95 % que incluye el error común de las encuestas calibrado con 2019 y 2023, calculada en `index.html` a partir de `sondeos.lista`. Su fecha es `MP.hasta` (última encuesta incluida). En el Senado, el «Estim.» de Resultados compara con la media ponderada de `sondeos.senado.lista` más los mismos 58 designados que `escrutinio.senado.designados`.

## 2. Dónde está el código

- Rama: `claude/upbeat-dijkstra-ticmkk` (13-N). Reúne `claude/gallant-wozniak-hxyy0e` (resultados) y `claude/focused-johnson-v5dcfx` (umbral por provincia, «Esta noche», pie de urna) sobre el `main` del 13-N, con la veda que congela en vez de retirar, «En Vivo» / «Resultados» y la XVI Legislatura. Todo va condicionado por fecha o por `meta.etapa`, así que se puede publicar en `main` en cualquier momento; si no se ha hecho antes, la tarea del 23-N a las 23:10 la fusiona.
- Las ramas `claude/gallant-wozniak-hxyy0e`, `claude/focused-johnson-v5dcfx` y `ccr-1be2efa5-ygslxj` (otra versión de la veda con un workflow de GitHub) quedan superadas; no hay que fusionarlas. El ensayo del 26-N sigue guardando su script en `claude/gallant-wozniak-hxyy0e`, y la tarea del 29-N a las 11:15 trae a `main` solo esos archivos nuevos.
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
| `senado` | `escrutado`, `electos` (por candidatura), `designados`, `notaDesignados` y `prov`: `{código de provincia: {e: % escrutado, s: {senadores elegidos}}}` (islas sumadas en su provincia). Con `prov` funcionan el umbral por provincia y el mapa del Senado; sin él, el mapa del Senado dice que aún no hay datos |
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
| Dom 22-N 21:17 | Publicación en `main` de la rama `claude/upbeat-dijkstra-ticmkk`, con pruebas de cada fase; si falla, no publica y avisa | `trig_011sMcDi3GUXSoD1fGSbuMAk` * |
| Lun 23-N 23:10 | Últimos sondeos publicados hasta el 23-N y, si falta, el código en `main` (no retira nada) | `trig_01Rhtpt8Qd1HmY81gmVrHi26` * |
| Jue 26-N 18:10 | Ensayo: fuentes, script y prueba; informe al usuario | `trig_013T2ksYh4XZ7hQFRUiCWW1B` |
| Vie 27-N 11:23 | Senado por provincias: `data/senado2023.js` (senadores de 2023) y `senado.prov` en el script del recuento | `trig_01RofyMgpZwhgEpUNNV7ZaA8` * |
| Dom 29-N 11:15 | Comprobar «En Vivo» en `main` y traer el script del ensayo | `trig_015aio5wSUeh2XLRiMq9Ai4y` * |
| 14:10, 14:20, 14:30, 15:00 | Avance de participación de las 14:00 (si ya está, no hace nada) | `trig_0157yt9vH9Edw7CBAW6nFsb2`, `trig_01DbEPnFRAoEYqB2oLsW41mo`, `trig_01CxXijrNfgwQTVSBXSn69c2`, `trig_01Xa6qaUkZsdjKP96oSMQTwc` * |
| 14:40 | Avance de participación de las 14:00 | `trig_01Q6NLaGJdYHxq5yaPnTJMk9` |
| 18:10, 18:20, 18:30, 19:00 | Avance de participación de las 18:00 (si ya está, no hace nada) | `trig_01RevCoATPgChko5gfHHv7gt`, `trig_015SdPuGXyGCBhgC2oNcur54`, `trig_015fHvh7ygpaKafXF2afKH1k`, `trig_01Y9ZjaJMVstLzGDkEkBGmrG` * |
| 18:40 | Avance de participación de las 18:00 | `trig_011C6FHWK5DuHB87o56oJrHA` |
| 20:05 | Encuestas a pie de urna en `sondeos.pieDeUrna` | `trig_01BwjpWb6kvyiakuxun8JDNt` * |
| 20:25 | Repaso de las encuestas a pie de urna (conversación `session_01PUGr7cCgL8ibd3355u7m8c`) | `trig_01MKDAHvBqSVUPemihk8zU97` |
| 20:15 … 01:00, cada 15 min | Recuento (20 tareas, una por hora indicada) | ver lista abajo |
| Lun 30-N 01:30 | Última de la noche; `fase: "final"` si está al 100 %, sin `definitivo` | `trig_012234UjAPf6dnq5m4imZgWb` |
| 30-N 5:30, 9:30, 13:30, 17:30, 21:30 | Seguimiento cada 4 h | `trig_01K3NVyNUztmEzkCMSsLdoeE` |
| 1-D cada 4 h desde la 01:30 | Seguimiento cada 4 h | `trig_01QtaqoWeeK4R3gDJTxzLvNL` |
| Diaria 10:37, diciembre a febrero | Seguimiento diario hasta el resultado definitivo | `trig_01NDzk881bS7WKrmY7wq6rDp` |

Tareas del recuento: 20:15 `trig_01Ch1GWJRDfpS962nRCV5egV` · 20:30 `trig_01PuVguUxgGrbyrzuUSTfgM2` · 20:45 `trig_01QYDi6F23YYotJRHnQbDRBK` · 21:00 `trig_015WVUxnd6aCkQ59UQQibvUL` · 21:15 `trig_018Eemwg78rtGYDGzoBNt64s` · 21:30 `trig_01RqiDMw7pgGVzT4X9Pwi9m5` · 21:45 `trig_018a1HFkXqdHxKmM9ok8qa7k` · 22:00 `trig_01RvfJ8u9C8ad5RKisjQ7cqq` · 22:15 `trig_01TgrnczU3y1bLss7m2D6X2n` · 22:30 `trig_01XUq54J4ZGzX7wcnaNVwrWi` · 22:45 `trig_01KUgGcyBFL6AdTDwEpronA8` · 23:00 `trig_019ue3ZNh4bfUicR34kujAwy` · 23:15 `trig_01XEGgphEnsWHv2KvxPCWY5U` · 23:30 `trig_014W7nu7mF1LT45oaQrcYX8S` · 23:45 `trig_011wJ1pNibPNEWvrU9P6HPv2` · 00:00 `trig_01YaMtqBfZLq2fwhLny5u5P9` · 00:15 `trig_01G1qMnAZ1ynaYJocoXrqDeh` · 00:30 `trig_013vKaenkJgSyqJsH78yu79Z` · 00:45 `trig_01XzHS1hBFan8jq85KS7rzoQ` · 01:00 `trig_01EdiWVLf7LJ1yqayA4MQrQR`.

\* Tareas creadas el 13-N en la conversación `session_01PUGr7dB9qhHXg6t6FjYqxK`; las demás están en `session_01PUGr7biere6byqxXUQMTp9` salvo que se diga otra cosa.

Pausadas el 13-N (por el cambio de la veda; se pueden borrar): «23-N 23:55: veda en main» `trig_01F2C8RGtZW7ySbBFxWyBVBW`, «23-N 23:45: copias de la web antes de la veda» `trig_017Tz82yiQcoDXu6aZXtjrG7`, «29-N 20:05: fin de la veda (restaurar Intención)» `trig_01TVvoaLDyLFQucUycuTFedc` y «Publicar la pestaña Resultados del 29-N» `trig_017Uh3Ae3uGb6vmQu11qdB5Q`.

Además existe la tarea diaria «Actualización diaria 176», ajena a este plan, que actualiza `data/sondeos.js` a diario y, desde el 29-N, rellena `resultado` en ese archivo para las pestañas Intención y Mapa. Es compatible porque toca otro archivo.

## 6. Qué hace cada tarea

**Comprobar (29-N, 11:15).**
1. `git fetch origin main claude/upbeat-dijkstra-ticmkk claude/gallant-wozniak-hxyy0e`. Si `main` no contiene `claude/upbeat-dijkstra-ticmkk`, fusionarla.
2. Traer a `main` solo los archivos nuevos del ensayo del 26-N (script y notas de fuentes), no el `index.html` antiguo de esa rama.
3. Probar con Playwright:
   - antes de las 12:00 no hay pestaña «En Vivo»;
   - a las 12:01 sí, primera, seleccionada, con la luz roja, y carga `data/escrutinio.js`;
   - la tarjeta de participación se ve con los avances pendientes;
   - Intención se ve, con el aviso de veda;
   - la barra de pestañas cabe a 360 px; el 30-N a las 03:00 la pestaña se llama «Resultados», sin luz;
   - no hay errores de consola.
4. Push a `main` si hubo cambios y comprobar GitHub Pages. Si algo falla y no se arregla antes de las 12:00, no publicar nada roto y avisar.

**Participación (14:10 a 15:00 y 18:10 a 19:00).** Si el avance ya está, no hacer nada. Si no, añadir `{h, p, p23}` a `participacion.avances` y dejar `fase: "antes"`. Commit y push a `main`. Si aún no hay dato, no hacer commit. La página lo enseña en menos de un minuto tras el push (lo que tarde GitHub Pages).

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
2. Si no, en una conversación nueva con este repositorio, leer este documento y recrear las tareas que falten. Se pueden ver con `list_triggers`; los nombres empiezan por «23-N», «29-N», «23-D», «31-D», «176 ·», «Publicar…» o «Preparar…». Las instrucciones de una tarea solo se pueden cambiar desde la conversación en la que se ejecuta; desde otra solo se puede pausar.
3. Las tareas pueden ir a la conversación nueva o crear una sesión nueva en cada ejecución.
4. Las instrucciones de cada tarea son las del apartado 6. El usuario autorizó el push a `main` para todo este plan.

## 8. Riesgos conocidos

- La fuente oficial no es accesible desde el entorno: se depende de medios que republican los datos. El ensayo del 26-N lo confirmará.
- Los datos llegan con hasta 15 minutos de retraso; la web los vuelve a leer cada minuto.
- El escrutinio general y el voto CERA pueden tardar días; las tareas diarias siguen hasta febrero si hace falta.

## 9. Después del 29-N: la XVI Legislatura

Cuando se constituyen las nuevas Cortes (23-D), la web cambia de etapa. El código ya está en `index.html` y se activa con `"etapa": "XVI"` en `meta` de `data/contenido.js`; para verlo antes, `?etapa=XVI` en la dirección.

- **Pestañas**: Cámaras · Votaciones · Propuestas · Mapa · Sondeos. Desaparece la de resultados: el 29-N pasa a Cámaras y al Mapa.
- **Cámaras**: filtro «2023–2026» / «2026–Presente» (en todas las pestañas, la legislatura anterior a la izquierda). La XVI enseña «Así es el Congreso / el Senado» con `contenido.camarasXVI` (`congreso` y `senado`, con `total`, `mayoria`, `esc`, `etiquetas` y `bloques` opcionales, `nota`, `fuente`); si falta, lo saca de `data/escrutinio.js` (escaños del Congreso; elegidos más designados en el Senado). La tabla compara con la XV. La XV queda como estaba («Así quedó…», alianzas y coincidencia de voto, solo con votaciones de la XV); su contexto pasa a `meta.contextoXV`.
- **Mapa**: abre en «Resultado 29-N» (`sondeos.resultado.prov` si existe; si no, `escrutinio.prov` con el recuento terminado) y mantiene «Resultado 2023». Sin estimación con sondeos.
- **Sondeos** (antes «Intención»), última pestaña, con filtro: «2026–Presente» usa `data/sondeos-xvi.js` (mismo formato que `lista` de `data/sondeos.js`; con tres encuestas completas sale la media ponderada, el hemiciclo y la tabla sondeo a sondeo) y «2023–2026» es el archivo de antes del 29-N.
- **Votaciones**: filtro de legislatura. Cada votación lleva `"leg": "XVI"`; sin ese campo cuenta como XV. Abre en la XVI si ya tiene alguna.
- **Propuestas**: filtro de legislatura y la métrica **«Fiel a su palabra»**, con su barra dentro de la vista de cada partido («Ver un partido»): propuestas cumplidas sobre las prometidas en la precampaña y la campaña. Cada propuesta es `["Tema", "texto"]` y, cuando se revisa, un tercer elemento `{e: "cumplida" | "defendida" | "parcial" | "tramite" | "incumplida", f, n, fu}`; sin él, «Pendiente». «Defendida» = el partido votó y actuó conforme a lo prometido aunque no lograra el resultado (cuenta sobre todo para la oposición); «incumplida» = votó o actuó en contra de lo prometido, o lo abandonó. La métrica es (cumplidas + defendidas) / prometidas; en la barra, tramo oscuro cumplidas y claro defendidas. Las promesas de la XVI son las de `propuestas` tal como quedaron el 29-N (la tarea diaria deja de añadir propuestas ese día). Las de la XV (campaña de 2023) irían en `contenido.propuestasXV` con el mismo formato; todavía no están recopiladas.

Tareas (conversación `session_01PUGr7dB9qhHXg6t6FjYqxK`):

| Cuándo | Tarea | Id |
|---|---|---|
| Mié 23-D 15:07 | Cambio de etapa: `meta.etapa`, `camarasXVI`, contexto y elección de las Mesas como primeras votaciones de la XVI | `trig_012T1cx6ckvAdgdQGfJ7jupq` |
| Jue 31-D 11:13 | Grupos parlamentarios en `camarasXVI` | `trig_019rwTxymeNUPop5DNuqU4n8` |
| Lunes 10:47 | Seguimiento semanal: estado de las propuestas, votaciones clave de la semana y encuestas en `data/sondeos-xvi.js` (no hace nada hasta que `meta.etapa` sea XVI) | `trig_015VsPQUm5PLkijUCh1L6HWe` |
