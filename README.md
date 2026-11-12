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
  - `resultado`: `null` hasta el 29-N. Después, el escrutinio provisional, que se sube cada 15 minutos:
    `{ "hora": "2026-11-29T21:45:00+01:00", "escrutinio": "45,2 %", "escanos": {...}, "voto": {...}, "senado": { "escanos": {...} }, "prov": { "28": { "v": {...}, "s": {...} } }, "fuente": { "t": ..., "u": ... }, "final": false }`.
    `escanos` y `voto` usan las mismas claves que la media (`PP`, `PSOE`, `VOX`, `FA`…); `senado.escanos` incluye los designados y usa las claves de `senado.lista`; `prov` va por código de provincia. Con `final: true` la página deja de buscar actualizaciones. `voto`, `senado` y `prov` son opcionales.
- `manifest.webmanifest`, `sw.js` e `icons/`: lo necesario para instalarla como app en el móvil (el service worker pide siempre la versión nueva y guarda una copia para abrirla sin conexión).

Los archivos de datos empiezan por `window.PE=window.PE||{};window.PE.<clave>=`, siguen con un objeto JSON y terminan con `;`. Para actualizar la web basta con cambiar `data/sondeos.js` (y, si hay propuestas nuevas, `data/contenido.js`).

## Veda electoral (24-N a 29-N, 20:00)

El artículo 69.7 de la LOREG prohíbe publicar, difundir o reproducir sondeos los cinco días anteriores a la votación. La web lo aplica sola con las fechas de `meta.veda` en `data/contenido.js` (del 24-N a las 0:00 al 29-N a las 20:00, hora peninsular, cuando cierran los colegios; si se prefiere esperar al cierre en Canarias, basta con poner `21:00`):

- Desaparece la pestaña Intención (y `#sondeos` lleva a Cámaras), el mapa enseña solo 2023, las fichas de partido no dan escaños estimados y Propuestas se ordena por el Congreso disuelto. Arriba sale un aviso con la norma.
- Usa la hora del dispositivo y la del servidor (cabecera `Date`): basta con que una de las dos caiga en la veda. Al empezar o acabar, la página abierta se recarga sola.
- El modelo se sigue calculando, pero no se muestra.

**Cómo seguir alimentando el modelo durante la veda sin publicarlo:**

1. No subas sondeos nuevos a `data/sondeos.js` entre el 24-N y el 29-N a las 20:00: el repositorio es público y cualquier commit con encuestas sería una publicación.
2. Trabaja en `interno/sondeos.js` (mismo formato que `data/sondeos.js`). La carpeta `interno/` está en `.gitignore`, así que no se sube; lo más cómodo es que sea un clon de un repositorio **privado** (`git clone <repo privado> interno`).
3. Para ver el modelo, sirve la carpeta en local y abre `http://localhost:8000/?interno`: carga `interno/sondeos.js`, ignora la veda y lo indica con un aviso rojo. En la web publicada `?interno` no hace nada (el archivo no existe y la veda sigue). Esta vista no cuenta en la analítica.
4. El 29-N a partir de las 20:00, copia `interno/sondeos.js` a `data/sondeos.js` con el primer `resultado` y súbelo. A partir de ahí, cada actualización de `resultado` (cada 15 minutos) aparece sola: la página busca datos nuevos cada 3 minutos durante dos días y recarga sin perder la pestaña. En Intención, la tarjeta «Cuánto se ha desviado el modelo» compara el resultado con la última media ponderada (escaños, voto, intervalo del 95 % y la misma cuenta para Demócrata y el CIS); en el mapa, cada provincia muestra su desvío en escaños.

## Publicación

Se sirve con GitHub Pages desde la rama `main`, carpeta raíz. No necesita compilación.

## Probar en local

Abre `index.html` en el navegador, o sirve la carpeta con `python3 -m http.server` y entra en http://localhost:8000.
