# Clima Ahora

## Datos del clima

La aplicación usa [Open-Meteo](https://open-meteo.com/), una API gratuita que no
requiere registro ni API key:

- **Geocodificación:** `https://geocoding-api.open-meteo.com/v1/search`
  convierte el nombre escrito en coordenadas y devuelve varias coincidencias
  (por eso el buscador muestra sugerencias con país y provincia).
- **Pronóstico:** `https://api.open-meteo.com/v1/forecast` devuelve, para esas
  coordenadas, temperatura, sensación térmica, humedad, viento, código del
  estado del cielo, si es de día o de noche y el amanecer/atardecer.

El código incluye comentarios paso a paso sobre `fetch`, `response.ok`,
`response.json()` y `AbortController`.

## Funcionalidades de la app

- Buscar con **Enter** o con el botón.
- **Sugerencias** mientras se escribe (debounce de 280 ms, navegación con
  flechas, Enter y Escape).
- Temperatura actual, estado del cielo, humedad, viento, sensación térmica y
  próximo amanecer/atardecer.
- **Fondo día/noche** según `is_day` de la ciudad, con paleta distinta para
  despejado, nublado, lluvia, nieve, niebla o tormenta.
- Reloj con la **hora local** de la ciudad.
- Selector **°C/°F** (el viento pasa de km/h a mph) sin repetir la petición.
- Persistencia de la última ciudad y de la unidad en `localStorage`.
- Estados de carga, error y cancelación de peticiones obsoletas.
- Diseño responsive, foco visible, `aria-live` y respeto por
  `prefers-reduced-motion`.

## Notas

- La ciudad inicial es **Buenos Aires**; luego se recuerda la última buscada.
- Si se quiere usar OpenWeatherMap o WeatherAPI, solo hay que reemplazar la
  capa de API y adaptar el mapeo de códigos del cielo.
- El fondo se genera con dos capas y un fundido de opacidad; no usa imágenes.
