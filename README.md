# Clima Ahora

Aplicación del clima con buscador de ciudades, sugerencias en vivo, unidades
°C/°F y un fondo que cambia según la hora y el estado del cielo en la ciudad
consultada.

Incluye **dos versiones de la misma interfaz**:

| Versión | Ubicación | Stack |
| --- | --- | --- |
| Vanilla | raíz del proyecto | HTML + CSS + JavaScript moderno (sin dependencias) |
| React | `react/` | React 19 + Vite |

Ambas usan la misma API gratuita y no necesitan clave.

## Datos del clima

Se usa [Open-Meteo](https://open-meteo.com/), que es gratuita, no pide registro
ni API key:

- **Geocodificación:** `https://geocoding-api.open-meteo.com/v1/search`
  convierte el nombre escrito en coordenadas y devuelve varias coincidencias
  (por eso el buscador muestra sugerencias con país y provincia).
- **Pronóstico:** `https://api.open-meteo.com/v1/forecast` devuelve, para esas
  coordenadas, temperatura, sensación térmica, humedad, viento, código del
  estado del cielo, si es de día o de noche y el amanecer/atardecer.

El código incluye comentarios paso a paso sobre `fetch`, `response.ok`,
`response.json()` y `AbortController` en:

- `app.js` → `fetchJSON()` y `loadPlace()`
- `react/src/lib/api.js` → `fetchJSON()`

## Versión vanilla

Abrir `index.html` en el navegador o servirlo con cualquier servidor estático:

```bash
npx serve .
# o
npx http-server .
```

No requiere instalación ni build. Archivos:

- `index.html` — estructura
- `styles.css` — diseño, fondo dinámico, responsive y accesibilidad
- `app.js` — estado, peticiones, sugerencias, reloj local y render

## Versión React

```bash
cd react
npm install
npm run dev
```

Abrir la URL que muestra Vite (por defecto `http://localhost:5173`).

Para generar la versión de producción:

```bash
cd react
npm run build     # genera react/dist
npm run preview   # sirve el build localmente
```

Estructura:

```
react/src/
├── App.jsx                  # composición y estado de la pantalla
├── main.jsx                 # punto de entrada
├── styles.css               # mismos estilos que la versión vanilla
├── components/
│   ├── SearchBar.jsx        # input, sugerencias, teclado y estados
│   ├── Sky.jsx              # fondo con fundido cruzado día/noche
│   ├── Topbar.jsx           # marca y selector °C/°F
│   ├── WeatherCard.jsx      # tarjeta con temperatura y detalles
│   └── Loader.jsx
├── hooks/
│   ├── useWeather.js        # fetch, cancelación, persistencia y errores
│   └── useCitySearch.js     # debounce, sugerencias y navegación con teclado
└── lib/
    ├── api.js               # Open-Meteo + fetch comentado
    ├── weather.js           # códigos WMO, paletas y formateo
    └── storage.js           # localStorage seguro
```

## Funcionalidades

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
- Si se quiere usar OpenWeatherMap o WeatherAPI, solo hay que reemplazar las
  funciones de `lib/api.js` (React) o `findCities()` / `loadPlace()` (vanilla)
  y adaptar el mapeo de códigos del cielo en `weather.js` / `WEATHER_CODES`.
- El fondo se genera con dos capas y un fundido de opacidad; no usa imágenes.
