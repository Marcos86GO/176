# 176 · Panorama político español

Web estática sobre el Congreso, el Senado y las elecciones generales del 29 de noviembre de 2026: composición de las cámaras, votaciones clave, media de sondeos, propuestas de cada partido y mapa por provincias.

## Archivos

- `index.html`: la página, sus estilos y la lógica (incluye la estimación provincial).
- `data/mapa.js`: geometría de las provincias y resultados de 2023.
- `data/contenido.js`: partidos, cámaras, leyes, propuestas, glosario y fuentes.
- `data/sondeos.js`: media de sondeos, histórico, últimas encuestas y, tras el 29-N, resultados.
- `data/escrutinio.js`: recuento en directo del 29-N. La pestaña «Resultados» aparece sola el 29 de noviembre a las 12:00 (hora peninsular) y, desde entonces, la página vuelve a leer este archivo cada minuto. Campos: `fase` (`antes`, `recuento` o `final`), `actualizado` (fecha y hora ISO), `participacion` (`avances` con `h`, `p` y `p23`, y `final`), `escrutado` (%), `voto` (% por partido), `escanos` y `prov` (por código de provincia: `e` = % escrutado, `v` = % de voto, `s` = escaños). Además, `historia` (lista de actualizaciones anteriores con `h`, `e` y `voto`, para la gráfica del desvío frente a los sondeos) y `senado` (`escrutado`, `electos` por candidatura, `designados` por las comunidades y `notaDesignados`). `modos` compara cómo se votó: `presencial.votos`, `correo.votos`, `extranjero` (`contado`, `votos`, `censo`, `voto` por partido), `espana.voto` (voto por partido sin el extranjero) y `fuente`. `definitivo: true` cuando el escrutinio general (con el voto del extranjero) ha terminado; hasta entonces la página sigue leyendo el archivo cada minuto.
- `docs/plan-29N.md`: plan completo de la noche electoral (tareas programadas, fuentes, formato de los datos y cómo retomarlo).
- `manifest.webmanifest`, `sw.js` e `icons/`: lo necesario para instalarla como app en el móvil (el service worker pide siempre la versión nueva y guarda una copia para abrirla sin conexión).

Los archivos de datos empiezan por `window.PE=window.PE||{};window.PE.<clave>=`, siguen con un objeto JSON y terminan con `;`. Para actualizar la web basta con cambiar `data/sondeos.js` (y, si hay propuestas nuevas, `data/contenido.js`).

## Publicación

Se sirve con GitHub Pages desde la rama `main`, carpeta raíz. No necesita compilación.

## Probar en local

Abre `index.html` en el navegador, o sirve la carpeta con `python3 -m http.server` y entra en http://localhost:8000.
