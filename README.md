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
- `data/escrutinio.js`: recuento en directo del 29-N. La pestaña «Resultados» aparece sola el 29 de noviembre a las 12:00 (hora peninsular) y, desde entonces, la página vuelve a leer este archivo cada minuto. Campos: `fase` (`antes`, `recuento` o `final`), `actualizado` (fecha y hora ISO), `participacion` (`avances` con `h`, `p` y `p23`, y `final`), `escrutado` (%), `voto` (% por partido), `escanos` y `prov` (por código de provincia: `e` = % escrutado, `v` = % de voto, `s` = escaños). Además, `historia` (lista de actualizaciones anteriores con `h`, `e` y `voto`, para la gráfica del desvío frente a los sondeos) y `senado` (`escrutado`, `electos` por candidatura, `designados` por las comunidades y `notaDesignados`). `modos` compara cómo se votó: `presencial.votos`, `correo.votos`, `extranjero` (`contado`, `votos`, `censo`, `voto` por partido), `espana.voto` (voto por partido sin el extranjero) y `fuente`. `definitivo: true` cuando el escrutinio general (con el voto del extranjero) ha terminado; hasta entonces la página sigue leyendo el archivo cada minuto.
- `docs/plan-29N.md`: plan completo de la noche electoral (tareas programadas, fuentes, formato de los datos y cómo retomarlo).
- `manifest.webmanifest`, `sw.js` e `icons/`: lo necesario para instalarla como app en el móvil (el service worker pide siempre la versión nueva y guarda una copia para abrirla sin conexión).

Los archivos de datos empiezan por `window.PE=window.PE||{};window.PE.<clave>=`, siguen con un objeto JSON y terminan con `;`. Para actualizar la web basta con cambiar `data/sondeos.js` (y, si hay propuestas nuevas, `data/contenido.js`).

## Veda electoral (24-N a 29-N, 20:00)

El artículo 69.7 de la LOREG prohíbe publicar, difundir o reproducir sondeos los cinco días anteriores a la votación. La web lo cumple de dos formas:

1. **En la página** (`meta.veda` en `data/contenido.js`: del 24-N a las 0:00 al 29-N a las 20:00, hora peninsular). Desaparece la pestaña Intención (y `#sondeos` lleva a Cámaras), el mapa enseña solo 2023, las fichas de partido no dan escaños estimados y Propuestas se ordena por el Congreso disuelto; arriba sale un aviso con la norma. Cuenta la hora del dispositivo y la del servidor (cabecera `Date`), y la página abierta se recarga sola al empezar y al acabar.
2. **En el repositorio.** `herramientas/veda.py quitar` deja `data/sondeos.js` sin encuestas ni medias (`"veda": true`); la página lo trata como veda aunque la hora ya no lo sea. `herramientas/veda.py restaurar` recupera del historial de git la versión anterior (la última media antes de la veda) y la página, si está abierta, la carga sola. Las versiones antiguas siguen en el historial de git, publicadas antes de la veda.

Plan automático (tareas programadas en la conversación de Claude que preparó la veda):

| Cuándo (hora peninsular) | Qué |
|---|---|
| 23-N, 23:45 | Copia de la web entera y de la pestaña Intención, con los últimos datos, en dos artefactos privados de Claude (`herramientas/captura.py`) |
| 23-N, 23:55 | Push a `main`: el código de la veda y `veda.py quitar` |
| 29-N, 20:05 | Push a `main`: `veda.py restaurar`; vuelve la pestaña Intención con la última media, que la pestaña Resultados usa para el desvío |

La tarea diaria de sondeos no toca `data/sondeos.js` del 24-N al 29-N a las 20:05.

## Publicación

Se sirve con GitHub Pages desde la rama `main`, carpeta raíz. No necesita compilación.

## Probar en local

Abre `index.html` en el navegador, o sirve la carpeta con `python3 -m http.server` y entra en http://localhost:8000.
