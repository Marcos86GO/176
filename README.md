# 176 · Panorama político español

Web estática sobre el Congreso, el Senado y las elecciones generales del 29 de noviembre de 2026: composición de las cámaras, votaciones clave, media de sondeos, propuestas de cada partido y mapa por provincias.

## Archivos

- `index.html`: la página, sus estilos y la lógica (incluye la estimación provincial).
- `data/mapa.js`: geometría de las provincias y resultados de 2023.
- `data/contenido.js`: partidos, cámaras, votaciones (leyes y otras, del Congreso y del Senado), propuestas, glosario y fuentes.
- `data/sondeos.js`: últimas encuestas, media de Demócrata como referencia, histórico y, tras el 29-N, resultados.
  - `lista`: la última encuesta de cada encuestadora de las últimas tres semanas, con el voto (`v`) y los escaños (`e`) de todos los partidos, la muestra (`n`) y, si la publica, la participación (`p`). Compromís-Front Valencià se suma a `FA`. El CIS lleva `cis: true` y las encuestas encargadas por un partido, `partido`.
  - La media que usa la web la calcula `index.html` con `lista`: media ponderada por número de entrevistas, sin el CIS ni las encuestas sin muestra, con un intervalo de confianza del 95 %. Los escaños salen solo de las encuestas con el reparto completo. Si `lista` no tiene al menos tres encuestas completas, la web usa `media` (Demócrata).
  - `senado.lista`: estimaciones de los 209 senadores que se eligen en las urnas (`e` por candidatura: PP, SDP, VOX, ERC, JUNTS, BILDU, PNV, OTROS). La web hace con ellas la misma media ponderada por muestra y le suma `senado.designados`, los senadores que designan los parlamentos autonómicos. Con menos de dos estimaciones con muestra, usa `senado.escanos`.
  - `media`: media de Demócrata, que se muestra como referencia. La participación estimada es la mediana de `media.participacion.datos`: la última previsión de cada encuestadora que la publica.
- `data/escrutinio.js`: recuento en directo del 29-N. La pestaña «En Vivo» aparece sola el 29 de noviembre a las 12:00 (hora peninsular) y, desde entonces, la página vuelve a leer este archivo cada minuto. Campos: `fase` (`antes`, `recuento` o `final`), `actualizado` (fecha y hora ISO), `participacion` (`avances` con `h`, `p` y `p23`, y `final`), `escrutado` (%), `voto` (% por partido), `escanos` y `prov` (por código de provincia: `e` = % escrutado, `v` = % de voto, `s` = escaños). Además, `historia` (lista de actualizaciones anteriores con `h`, `e` y `voto`, para la gráfica del desvío frente a los sondeos) y `senado` (`escrutado`, `electos` por candidatura, `designados` por las comunidades y `notaDesignados`). `modos` compara cómo se votó: `presencial.votos`, `correo.votos`, `extranjero` (`contado`, `votos`, `censo`, `voto` por partido), `espana.voto` (voto por partido sin el extranjero) y `fuente`. `definitivo: true` cuando el escrutinio general (con el voto del extranjero) ha terminado; hasta entonces la página sigue leyendo el archivo cada minuto.
- `data/senado2023.js`: senadores elegidos en 2023 por provincia (`prov`: {código: {PP, SDP, …}}), para marcar en el mapa del Senado de la noche electoral las provincias que cambian.
- `data/sondeos-xvi.js`: encuestas para las siguientes generales, desde la XVI Legislatura (mismo formato que `lista`).
- `docs/plan-29N.md`: plan completo de la noche electoral (tareas programadas, fuentes, formato de los datos y cómo retomarlo).
  - `pieDeUrna` (desde el 29-N a las 20:00): `{ "hora": "20:00", "lista": [ { "i": encuestadora, "m": medio, "tipo": "a pie de urna" o "sondeo del día", "n": entrevistas o null, "v": {partido: %}, "e": {partido: "131-135"}, "p": participación % (opcional), "fu": {t, u}, "nota": opcional, "sen": {candidatura del Senado: senadores elegidos, "116-122"} opcional } ], "nota": opcional }`. La pestaña Intención los muestra arriba con su media simple; la media de antes de la veda no cambia y es con la que Resultados compara el recuento.
- `manifest.webmanifest`, `sw.js` e `icons/`: lo necesario para instalarla como app en el móvil (el service worker pide siempre la versión nueva y guarda una copia para abrirla sin conexión).

Los archivos de datos empiezan por `window.PE=window.PE||{};window.PE.<clave>=`, siguen con un objeto JSON y terminan con `;`. Para actualizar la web basta con cambiar `data/sondeos.js` (y, si hay propuestas nuevas, `data/contenido.js`).

## Veda electoral (24-N a 29-N, 20:00)

El artículo 69.7 de la LOREG prohíbe publicar, difundir o reproducir sondeos los cinco días anteriores a la votación. La web no publica sondeos nuevos esos días: del 24-N a las 0:00 al 29-N a las 20:00 (`meta.veda` en `data/contenido.js`, hora peninsular) mantiene congelados los últimos publicados hasta el 23-N en Intención, el mapa y las fichas de partido, con un aviso arriba. `data/sondeos.js` no se toca durante la veda. La página usa la hora del dispositivo y la del servidor (cabecera `Date`) y se recarga sola al empezar y al acabar la veda.

## Noche electoral y XVI Legislatura

- El 29-N a las 12:00 aparece la pestaña «En Vivo» (luz roja): participación con los avances oficiales y, desde el cierre, el recuento (`data/escrutinio.js`). El 30-N a las 02:00 pasa a llamarse «Resultados», sin luz.
- Con `"etapa": "XVI"` en `meta` (lo pone la tarea del 23-D) la web pasa a la XVI Legislatura: Cámaras nuevas, Mapa con el 29-N, Sondeos (antes Intención) al final con `data/sondeos-xvi.js`, Votaciones con filtro de legislatura (`leg`) y Propuestas con el seguimiento «Fiel a su palabra». Se puede previsualizar con `?etapa=XVI`.
- Todo el plan, los formatos y las tareas programadas están en `docs/plan-29N.md`.

## Publicación

Se sirve con GitHub Pages desde la rama `main`, carpeta raíz. No necesita compilación.

## Probar en local

Abre `index.html` en el navegador, o sirve la carpeta con `python3 -m http.server` y entra en http://localhost:8000.
