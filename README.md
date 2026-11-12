# 176 · Panorama político español

Web estática sobre el Congreso, el Senado y las elecciones generales del 29 de noviembre de 2026: composición de las cámaras, votaciones clave, media de sondeos, propuestas de cada partido y mapa por provincias.

## Archivos

- `index.html`: la página, sus estilos y la lógica (incluye la estimación provincial).
- `data/mapa.js`: geometría de las provincias y resultados de 2023.
- `data/contenido.js`: partidos, cámaras, votaciones (leyes y otras, del Congreso y del Senado), propuestas, glosario y fuentes.
- `data/sondeos.js`: media de sondeos, histórico, últimas encuestas (con la participación que prevé cada una, si la publica) y, tras el 29-N, resultados. La participación estimada que muestra la web es la mediana de `media.participacion.datos`: la última previsión de cada encuestadora que la publica.
- `manifest.webmanifest`, `sw.js` e `icons/`: lo necesario para instalarla como app en el móvil (el service worker pide siempre la versión nueva y guarda una copia para abrirla sin conexión).

Los archivos de datos empiezan por `window.PE=window.PE||{};window.PE.<clave>=`, siguen con un objeto JSON y terminan con `;`. Para actualizar la web basta con cambiar `data/sondeos.js` (y, si hay propuestas nuevas, `data/contenido.js`).

## Publicación

Se sirve con GitHub Pages desde la rama `main`, carpeta raíz. No necesita compilación.

## Probar en local

Abre `index.html` en el navegador, o sirve la carpeta con `python3 -m http.server` y entra en http://localhost:8000.
