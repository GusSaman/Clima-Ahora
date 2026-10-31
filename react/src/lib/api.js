/* ==========================================================================
   Acceso a la API de Open-Meteo.
   Gratuita y sin API key: geocodificación + pronóstico actual.
   ========================================================================== */

const API = {
  geocoding: "https://geocoding-api.open-meteo.com/v1/search",
  forecast: "https://api.open-meteo.com/v1/forecast",
};

/* Ciudad que se muestra la primera vez que se abre la app. */
export const DEFAULT_PLACE = {
  name: "Buenos Aires",
  admin1: "Ciudad Autónoma de Buenos Aires",
  country: "Argentina",
  latitude: -34.61315,
  longitude: -58.37723,
};

/**
 * Pide una URL y devuelve el JSON convertido a objeto de JavaScript.
 *
 * Cómo funciona `fetch`:
 * 1. `fetch(url)` inicia la petición y devuelve una Promise. Con `await` la
 *    función espera la respuesta sin bloquear la interfaz.
 * 2. Solo se rechaza por fallos de red/CORS. Un 404 o un 500 llegan como
 *    respuesta válida, por eso comprobamos `response.ok` (200-299).
 * 3. `response.json()` lee el cuerpo y lo convierte de JSON a objetos JS.
 * 4. `AbortController` cancela la petición si tarda demasiado o si el
 *    componente se desmonta. El error resultante se llama "AbortError".
 */
export async function fetchJSON(url, { signal, timeout = 12000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const forwardAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", forwardAbort, { once: true });

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`La API respondió con el código HTTP ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", forwardAbort);
  }
}

/** Convierte "Madrid" en una lista de ciudades con coordenadas. */
export async function findCities(query, signal) {
  const params = new URLSearchParams({
    name: query,
    count: "6",
    language: "es",
    format: "json",
  });

  const data = await fetchJSON(`${API.geocoding}?${params.toString()}`, { signal });
  return Array.isArray(data.results) ? data.results : [];
}

/** Obtiene el clima actual y el amanecer/atardecer de un lugar. */
export function fetchForecast(place, signal) {
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "weather_code",
      "wind_speed_10m",
    ].join(","),
    daily: "sunrise,sunset",
    timezone: "auto",
    forecast_days: "2",
    wind_speed_unit: "kmh",
  });

  return fetchJSON(`${API.forecast}?${params.toString()}`, { signal });
}

/** Normaliza un resultado de geocodificación. */
export function toPlace(result) {
  return {
    name: result.name,
    admin1: result.admin1 ?? "",
    country: result.country ?? "",
    latitude: result.latitude,
    longitude: result.longitude,
  };
}
