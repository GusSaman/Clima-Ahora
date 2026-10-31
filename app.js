"use strict";

/* ==========================================================================
   Clima Ahora — lógica de la aplicación
   --------------------------------------------------------------------------
   API: Open-Meteo (https://open-meteo.com). Es gratuita, no necesita API key
   y no exige registro, así que la app funciona al abrirla.
   - Geocodificación: convierte el nombre de una ciudad en coordenadas.
   - Pronóstico: con las coordenadas devuelve el clima actual y el horario
     de amanecer/atardecer.

   Más abajo, en `fetchJSON()` y `loadPlace()`, hay comentarios detallados
   sobre cómo funciona una petición `fetch` paso a paso.
   ========================================================================== */

const API = {
  geocoding: "https://geocoding-api.open-meteo.com/v1/search",
  forecast: "https://api.open-meteo.com/v1/forecast",
};

/* Ciudad que se muestra la primera vez que se abre la app. */
const DEFAULT_PLACE = {
  name: "Buenos Aires",
  admin1: "Ciudad Autónoma de Buenos Aires",
  country: "Argentina",
  latitude: -34.61315,
  longitude: -58.37723,
};

const STORAGE_KEYS = {
  place: "clima-ahora:place",
  unit: "clima-ahora:unit",
};

/* Traducción de los códigos WMO que devuelve Open-Meteo.
   `group` se usa para elegir la paleta del fondo. */
const WEATHER_CODES = {
  0: { label: "Cielo despejado", group: "clear", icon: "☀️", nightIcon: "🌙" },
  1: { label: "Mayormente despejado", group: "clear", icon: "🌤️", nightIcon: "🌙" },
  2: { label: "Parcialmente nublado", group: "clouds", icon: "⛅", nightIcon: "☁️" },
  3: { label: "Nublado", group: "clouds", icon: "☁️" },
  45: { label: "Niebla", group: "fog", icon: "🌫️" },
  48: { label: "Niebla con escarcha", group: "fog", icon: "🌫️" },
  51: { label: "Llovizna ligera", group: "drizzle", icon: "🌦️" },
  53: { label: "Llovizna moderada", group: "drizzle", icon: "🌦️" },
  55: { label: "Llovizna intensa", group: "drizzle", icon: "🌦️" },
  56: { label: "Llovizna helada", group: "drizzle", icon: "🌧️" },
  57: { label: "Llovizna helada intensa", group: "drizzle", icon: "🌧️" },
  61: { label: "Lluvia ligera", group: "rain", icon: "🌧️" },
  63: { label: "Lluvia moderada", group: "rain", icon: "🌧️" },
  65: { label: "Lluvia intensa", group: "rain", icon: "🌧️" },
  66: { label: "Lluvia helada", group: "rain", icon: "🌧️" },
  67: { label: "Lluvia helada intensa", group: "rain", icon: "🌧️" },
  71: { label: "Nevada ligera", group: "snow", icon: "🌨️" },
  73: { label: "Nevada moderada", group: "snow", icon: "🌨️" },
  75: { label: "Nevada intensa", group: "snow", icon: "❄️" },
  77: { label: "Granos de nieve", group: "snow", icon: "❄️" },
  80: { label: "Chubascos ligeros", group: "rain", icon: "🌦️" },
  81: { label: "Chubascos moderados", group: "rain", icon: "🌧️" },
  82: { label: "Chubascos intensos", group: "rain", icon: "⛈️" },
  85: { label: "Chubascos de nieve", group: "snow", icon: "🌨️" },
  86: { label: "Chubascos de nieve intensos", group: "snow", icon: "❄️" },
  95: { label: "Tormenta", group: "storm", icon: "⛈️" },
  96: { label: "Tormenta con granizo", group: "storm", icon: "⛈️" },
  99: { label: "Tormenta con granizo fuerte", group: "storm", icon: "⛈️" },
};

/* Paletas del fondo. Se combinan con el momento del día (day/night) y el
   estado del cielo para que la interfaz cambie de forma sutil. */
const SKY_PALETTES = {
  "day-clear": {
    from: "#1d78bd",
    via: "#58b2e0",
    to: "#bfe3f4",
    glowA: "rgba(255, 209, 102, 0.55)",
    glowB: "rgba(255, 255, 255, 0.45)",
  },
  "day-clouds": {
    from: "#476b8c",
    via: "#86a8c0",
    to: "#c6d8e3",
    glowA: "rgba(255, 255, 255, 0.28)",
    glowB: "rgba(255, 236, 200, 0.22)",
  },
  "day-rain": {
    from: "#38526b",
    via: "#6d8aa2",
    to: "#b3c6d3",
    glowA: "rgba(150, 190, 220, 0.3)",
    glowB: "rgba(255, 255, 255, 0.2)",
  },
  "day-storm": {
    from: "#222e44",
    via: "#4a5a75",
    to: "#8b9ab0",
    glowA: "rgba(120, 140, 180, 0.3)",
    glowB: "rgba(190, 170, 255, 0.18)",
  },
  "day-snow": {
    from: "#5c7d9b",
    via: "#9cbad2",
    to: "#dbeaf4",
    glowA: "rgba(255, 255, 255, 0.4)",
    glowB: "rgba(200, 230, 255, 0.35)",
  },
  "day-fog": {
    from: "#5d707d",
    via: "#94a5b1",
    to: "#cbd6dd",
    glowA: "rgba(255, 255, 255, 0.22)",
    glowB: "rgba(255, 255, 255, 0.18)",
  },
  "night-clear": {
    from: "#060c1c",
    via: "#0f2144",
    to: "#1d3b6b",
    glowA: "rgba(96, 140, 255, 0.25)",
    glowB: "rgba(255, 209, 102, 0.12)",
  },
  "night-clouds": {
    from: "#0a1322",
    via: "#1a2a3f",
    to: "#2c4055",
    glowA: "rgba(110, 150, 200, 0.16)",
    glowB: "rgba(255, 255, 255, 0.08)",
  },
  "night-rain": {
    from: "#070f1a",
    via: "#142436",
    to: "#233a4d",
    glowA: "rgba(90, 140, 180, 0.16)",
    glowB: "rgba(255, 255, 255, 0.06)",
  },
  "night-storm": {
    from: "#0a0713",
    via: "#1c1630",
    to: "#2f2447",
    glowA: "rgba(150, 120, 255, 0.18)",
    glowB: "rgba(90, 120, 255, 0.12)",
  },
  "night-snow": {
    from: "#0b1626",
    via: "#1d3247",
    to: "#33506a",
    glowA: "rgba(180, 220, 255, 0.18)",
    glowB: "rgba(255, 255, 255, 0.1)",
  },
  "night-fog": {
    from: "#0d141c",
    via: "#232f3a",
    to: "#3b4a55",
    glowA: "rgba(180, 200, 215, 0.12)",
    glowB: "rgba(255, 255, 255, 0.06)",
  },
};

/* --------------------------------------------------------------------------
   Referencias al DOM
   -------------------------------------------------------------------------- */
const el = {
  form: document.getElementById("search-form"),
  input: document.getElementById("city-input"),
  suggestions: document.getElementById("suggestions"),
  status: document.getElementById("status"),
  loader: document.getElementById("loader"),
  weather: document.getElementById("weather"),

  placeName: document.getElementById("place-name"),
  placeMeta: document.getElementById("place-meta"),
  clock: document.getElementById("local-time"),
  zone: document.getElementById("local-zone"),
  icon: document.getElementById("weather-icon"),
  temp: document.getElementById("temp"),
  tempUnit: document.getElementById("temp-unit"),
  condition: document.getElementById("condition"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind"),
  feels: document.getElementById("feels"),
  sunIcon: document.getElementById("sun-icon"),
  sunLabel: document.getElementById("sun-label"),
  sunValue: document.getElementById("sun-value"),
  updated: document.getElementById("updated"),

  skyA: document.getElementById("sky-a"),
  skyB: document.getElementById("sky-b"),

  unitButtons: document.querySelectorAll(".unit__btn"),
  searchBtn: document.querySelector(".search__btn"),
  themeColor: document.querySelector('meta[name="theme-color"]'),
};

/* --------------------------------------------------------------------------
   Estado de la aplicación
   -------------------------------------------------------------------------- */
const state = {
  unit: readUnit(),
  place: readStoredPlace(),
  data: null,
  loading: false,
};

let activeSkyLayer = 0;
let clockTimer = null;
let weatherRequestId = 0;

let citySuggestions = [];
let activeSuggestion = -1;
let debounceTimer = null;
let geocodeRequestId = 0;

/* --------------------------------------------------------------------------
   Petición HTTP con fetch
   -------------------------------------------------------------------------- */

/**
 * Pide una URL y devuelve el JSON ya convertido a objeto de JavaScript.
 *
 * Cómo funciona `fetch`, paso a paso:
 *
 * 1. `fetch(url, opciones)` inicia una petición HTTP y devuelve una Promise.
 *    Al usar `await`, la función se "pausa" hasta que llega la respuesta.
 *    Esto NO bloquea el navegador: la interfaz sigue respondiendo.
 *
 * 2. `fetch` solo rechaza la Promise cuando hay un fallo de red (sin
 *    conexión, CORS, DNS...). Si el servidor responde 404 o 500 la Promise
 *    se resuelve igual, por eso comprobamos `response.ok` (true para
 *    códigos 200-299) y lanzamos un error si algo salió mal.
 *
 * 3. `response.json()` lee el cuerpo de la respuesta como texto y lo
 *    convierte de JSON a objetos/arrays de JavaScript. También devuelve una
 *    Promise, así que se espera con `await`.
 *
 * 4. `AbortController` permite cancelar la petición si tarda demasiado.
 *    `controller.signal` se pasa a fetch y `controller.abort()` la corta.
 *    El error resultante tiene `name === "AbortError"`.
 *
 * 5. El bloque `finally` se ejecuta siempre (éxito o error) y limpia el
 *    temporizador para que no quede pendiente.
 */
async function fetchJSON(url, { timeout = 12000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

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
  }
}

/**
 * Convierte el texto del buscador en una lista de ciudades con coordenadas.
 * Ejemplo: "Madrid" -> [{ name, country, admin1, latitude, longitude }, ...]
 */
async function findCities(query) {
  // URLSearchParams codifica los parámetros (tildes, espacios, etc.) y evita
  // tener que armar la URL a mano.
  const params = new URLSearchParams({
    name: query,
    count: "6",
    language: "es",
    format: "json",
  });

  const data = await fetchJSON(`${API.geocoding}?${params.toString()}`);
  return Array.isArray(data.results) ? data.results : [];
}

/**
 * Consulta el clima actual para un lugar y lo dibuja en pantalla.
 *
 * Aquí se ve la segunda petición fetch: se envían latitud, longitud y la
 * lista de variables que queremos (`current`, `daily`, `timezone`). Open-Meteo
 * devuelve un objeto JSON con `current`, `daily`, `utc_offset_seconds`, etc.
 */
async function loadPlace(place) {
  if (!place) return;

  // Identificador para descartar respuestas viejas si el usuario busca varias
  // ciudades seguidas: solo la última petición puede pintar la pantalla.
  const requestId = ++weatherRequestId;

  setLoading(true);
  setStatus("");

  try {
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
      timezone: "auto", // devuelve horas locales de la ciudad, no UTC
      forecast_days: "2", // 2 días para poder mostrar el próximo amanecer
      wind_speed_unit: "kmh",
    });

    const data = await fetchJSON(`${API.forecast}?${params.toString()}`);

    if (requestId !== weatherRequestId) return;

    state.place = place;
    state.data = data;
    el.input.value = place.name;

    try {
      localStorage.setItem(STORAGE_KEYS.place, JSON.stringify(place));
    } catch {
      /* localStorage puede estar bloqueado (modo privado); no es crítico. */
    }

    render();
  } catch (error) {
    if (requestId !== weatherRequestId) return;

    console.error("[Clima Ahora] Error al obtener el clima:", error);

    setStatus(
      error.name === "AbortError"
        ? "La consulta tardó demasiado. Inténtalo de nuevo."
        : "No pudimos obtener el clima. Revisa tu conexión e inténtalo otra vez.",
      "error",
    );
  } finally {
    if (requestId === weatherRequestId) setLoading(false);
  }
}

/* --------------------------------------------------------------------------
   Render
   -------------------------------------------------------------------------- */

function render() {
  const data = state.data;
  const place = state.place;
  if (!data || !place) return;

  const current = data.current;
  const isDay = current.is_day === 1;
  const info = describeWeather(current.weather_code, isDay);
  const unitLabel = state.unit === "c" ? "°C" : "°F";

  el.placeName.textContent = place.name;
  el.placeMeta.textContent = [place.admin1, place.country]
    .filter(Boolean)
    .join(" · ");

  el.icon.textContent = info.icon;
  el.temp.textContent = formatTemp(current.temperature_2m);
  el.tempUnit.textContent = unitLabel;
  el.condition.textContent = info.label;

  el.humidity.textContent = `${Math.round(current.relative_humidity_2m)}%`;
  el.wind.textContent = formatWind(current.wind_speed_10m);
  el.feels.textContent = `${formatTemp(current.apparent_temperature)}${unitLabel}`;

  const sun = nextSunEvent(data);
  el.sunIcon.textContent = sun.icon;
  el.sunLabel.textContent = sun.type;
  el.sunValue.textContent = formatClock(sun.time);

  el.updated.textContent = `Actualizado a las ${formatClock(current.time)}`;
  el.zone.textContent = "hora local";

  document.title = `${formatTemp(current.temperature_2m)}°${state.unit.toUpperCase()} en ${place.name} · Clima Ahora`;

  el.weather.hidden = false;

  applyTheme(isDay, info.group);
  startClock(data.utc_offset_seconds ?? 0);
}

function describeWeather(code, isDay) {
  const base = WEATHER_CODES[code] ?? {
    label: "Condición no disponible",
    group: "clouds",
    icon: "🌡️",
  };

  return {
    ...base,
    icon: isDay ? base.icon : base.nightIcon ?? base.icon,
  };
}

function formatTemp(celsius) {
  if (!Number.isFinite(celsius)) return "—";
  const value = state.unit === "f" ? (celsius * 9) / 5 + 32 : celsius;
  return String(Math.round(value));
}

function formatWind(kmh) {
  if (!Number.isFinite(kmh)) return "—";
  const value = state.unit === "f" ? kmh * 0.621371 : kmh;
  return `${Math.round(value)} ${state.unit === "f" ? "mph" : "km/h"}`;
}

/* "2026-10-31T14:05" -> "14:05" */
function formatClock(isoLocal) {
  if (typeof isoLocal !== "string") return "--:--";
  const time = isoLocal.split("T")[1];
  return time ? time.slice(0, 5) : "--:--";
}

/**
 * Busca el próximo evento solar (amanecer o atardecer) posterior a la hora
 * actual de la ciudad. Con `forecast_days=2` siempre hay margen suficiente.
 */
function nextSunEvent(data) {
  const now = data.current?.time ?? "";
  const events = [];

  (data.daily?.sunrise ?? []).forEach((time) => {
    events.push({ type: "Amanecer", icon: "🌅", time });
  });
  (data.daily?.sunset ?? []).forEach((time) => {
    events.push({ type: "Atardecer", icon: "🌇", time });
  });

  events.sort((a, b) => a.time.localeCompare(b.time));

  return (
    events.find((event) => event.time > now) ??
    events[events.length - 1] ?? {
      type: "Amanecer",
      icon: "🌅",
      time: now,
    }
  );
}

/* --------------------------------------------------------------------------
   Fondo dinámico
   -------------------------------------------------------------------------- */

function buildGradient(palette) {
  return [
    `radial-gradient(900px 620px at 12% 8%, ${palette.glowA}, transparent 60%)`,
    `radial-gradient(800px 600px at 88% 92%, ${palette.glowB}, transparent 65%)`,
    `linear-gradient(160deg, ${palette.from} 0%, ${palette.via} 55%, ${palette.to} 100%)`,
  ].join(", ");
}

/**
 * Cambia el fondo con un fundido cruzado: se pinta la nueva paleta en la capa
 * oculta y se sube su opacidad mientras la anterior baja a 0.
 */
function applyTheme(isDay, group) {
  const key = `${isDay ? "day" : "night"}-${group}`;
  const palette =
    SKY_PALETTES[key] ??
    SKY_PALETTES[isDay ? "day-clouds" : "night-clouds"];

  const layers = [el.skyA, el.skyB];
  const nextIndex = activeSkyLayer === 0 ? 1 : 0;
  const nextLayer = layers[nextIndex];
  const previousLayer = layers[activeSkyLayer];

  nextLayer.style.backgroundImage = buildGradient(palette);
  nextLayer.style.zIndex = "1";
  previousLayer.style.zIndex = "0";
  nextLayer.style.opacity = "1";
  previousLayer.style.opacity = "0";

  activeSkyLayer = nextIndex;

  document.documentElement.dataset.time = isDay ? "day" : "night";
  document.documentElement.dataset.weather = group;
  el.themeColor?.setAttribute("content", palette.from);
}

/* --------------------------------------------------------------------------
   Reloj local de la ciudad
   -------------------------------------------------------------------------- */

function startClock(utcOffsetSeconds) {
  clearInterval(clockTimer);

  const tick = () => {
    // Desplazamos la hora UTC por el offset de la ciudad y leemos con los
    // getters UTC para obtener directamente su hora local.
    const cityNow = new Date(Date.now() + utcOffsetSeconds * 1000);
    const hours = String(cityNow.getUTCHours()).padStart(2, "0");
    const minutes = String(cityNow.getUTCMinutes()).padStart(2, "0");
    el.clock.textContent = `${hours}:${minutes}`;
  };

  tick();
  clockTimer = setInterval(tick, 15000);
}

/* --------------------------------------------------------------------------
   Estados de la interfaz
   -------------------------------------------------------------------------- */

function setLoading(isLoading) {
  state.loading = isLoading;

  el.form.classList.toggle("is-loading", isLoading);
  el.searchBtn.disabled = isLoading;
  el.weather.classList.toggle("is-refreshing", isLoading && Boolean(state.data));
  el.weather.setAttribute("aria-busy", String(isLoading));

  // El loader grande solo aparece cuando todavía no hay datos que mostrar.
  el.loader.hidden = !(isLoading && !state.data);
}

function setStatus(message, type = "info") {
  el.status.textContent = message;
  el.status.classList.toggle("is-error", type === "error");
}

/* --------------------------------------------------------------------------
   Buscador y sugerencias
   -------------------------------------------------------------------------- */

function updateSuggestions(query) {
  const requestId = ++geocodeRequestId;

  findCities(query)
    .then((results) => {
      if (requestId !== geocodeRequestId) return; // respuesta obsoleta
      renderSuggestions(results.map(toPlace));
    })
    .catch(() => {
      if (requestId === geocodeRequestId) closeSuggestions();
    });
}

function renderSuggestions(places) {
  citySuggestions = places;
  activeSuggestion = -1;
  el.suggestions.innerHTML = "";

  if (!places.length) {
    closeSuggestions();
    return;
  }

  places.forEach((place, index) => {
    const item = document.createElement("li");
    item.className = "suggestion";
    item.id = `suggestion-${index}`;
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", "false");

    const pin = document.createElement("span");
    pin.className = "suggestion__pin";
    pin.textContent = "📍";
    pin.setAttribute("aria-hidden", "true");

    const text = document.createElement("div");
    const name = document.createElement("span");
    name.className = "suggestion__name";
    name.textContent = place.name;

    const meta = document.createElement("span");
    meta.className = "suggestion__meta";
    meta.textContent =
      [place.admin1, place.country].filter(Boolean).join(" · ") || "Ubicación";

    text.append(name, meta);
    item.append(pin, text);

    // Evita que el input pierda el foco antes de procesar el clic.
    item.addEventListener("mousedown", (event) => event.preventDefault());
    item.addEventListener("click", () => choosePlace(place));

    el.suggestions.append(item);
  });

  el.suggestions.hidden = false;
  el.input.setAttribute("aria-expanded", "true");
}

function closeSuggestions() {
  citySuggestions = [];
  activeSuggestion = -1;
  el.suggestions.hidden = true;
  el.suggestions.innerHTML = "";
  el.input.setAttribute("aria-expanded", "false");
  el.input.removeAttribute("aria-activedescendant");
}

function setActiveSuggestion(index) {
  const items = Array.from(el.suggestions.children);
  if (!items.length) return;

  activeSuggestion = (index + items.length) % items.length;

  items.forEach((item, i) => {
    const isActive = i === activeSuggestion;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-selected", String(isActive));
  });

  const activeItem = items[activeSuggestion];
  el.input.setAttribute("aria-activedescendant", activeItem.id);
  activeItem.scrollIntoView({ block: "nearest" });
}

function choosePlace(place) {
  closeSuggestions();
  el.input.value = place.name;
  loadPlace(place);
}

function toPlace(result) {
  return {
    name: result.name,
    admin1: result.admin1 ?? "",
    country: result.country ?? "",
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

/* --------------------------------------------------------------------------
   Eventos
   -------------------------------------------------------------------------- */

el.input.addEventListener("input", () => {
  const query = el.input.value.trim();
  clearTimeout(debounceTimer);

  if (query.length < 2) {
    closeSuggestions();
    return;
  }

  // Debounce: espera 280 ms desde la última tecla para no llamar a la API
  // en cada pulsación.
  debounceTimer = setTimeout(() => updateSuggestions(query), 280);
});

el.input.addEventListener("keydown", (event) => {
  if (el.suggestions.hidden) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    setActiveSuggestion(activeSuggestion + 1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    setActiveSuggestion(activeSuggestion - 1);
  } else if (event.key === "Escape") {
    closeSuggestions();
  } else if (event.key === "Enter" && activeSuggestion >= 0) {
    event.preventDefault();
    choosePlace(citySuggestions[activeSuggestion]);
  }
});

el.input.addEventListener("focus", () => {
  if (citySuggestions.length) {
    el.suggestions.hidden = false;
    el.input.setAttribute("aria-expanded", "true");
  }
});

el.form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = el.input.value.trim();

  if (!query) {
    el.input.focus();
    setStatus("Escribe el nombre de una ciudad para empezar.", "error");
    return;
  }

  if (state.loading) return;

  closeSuggestions();
  setLoading(true);
  setStatus("Buscando ciudad…");

  try {
    const results = await findCities(query);

    if (!results.length) {
      setStatus(
        `No encontramos “${query}”. Revisa la ortografía o prueba con otra ciudad.`,
        "error",
      );
      return;
    }

    const place = toPlace(results[0]);
    el.input.value = place.name;
    await loadPlace(place);
  } catch (error) {
    console.error("[Clima Ahora] Error al buscar la ciudad:", error);
    setStatus(
      "No pudimos buscar la ciudad. Revisa tu conexión e inténtalo de nuevo.",
      "error",
    );
  } finally {
    setLoading(false);
  }
});

el.unitButtons.forEach((button) => {
  button.addEventListener("click", () => setUnit(button.dataset.unit));
});

// Cierra el desplegable al hacer clic fuera del buscador.
document.addEventListener("click", (event) => {
  if (!event.target.closest(".search__field")) closeSuggestions();
});

function setUnit(unit) {
  if (unit !== "c" && unit !== "f") return;
  if (state.unit === unit) return;

  state.unit = unit;

  try {
    localStorage.setItem(STORAGE_KEYS.unit, unit);
  } catch {
    /* Sin persistencia disponible; la app sigue funcionando. */
  }

  syncUnitUI();

  // Reutilizamos los datos ya descargados: no hace falta otra petición.
  if (state.data) render();
}

function syncUnitUI() {
  el.unitButtons.forEach((button) => {
    const isActive = button.dataset.unit === state.unit;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

/* --------------------------------------------------------------------------
   Persistencia
   -------------------------------------------------------------------------- */

function readUnit() {
  try {
    return localStorage.getItem(STORAGE_KEYS.unit) === "f" ? "f" : "c";
  } catch {
    return "c";
  }
}

function readStoredPlace() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.place);
    if (!raw) return null;

    const place = JSON.parse(raw);
    const isValid =
      typeof place?.name === "string" &&
      Number.isFinite(place?.latitude) &&
      Number.isFinite(place?.longitude);

    return isValid ? place : null;
  } catch {
    return null;
  }
}

/* --------------------------------------------------------------------------
   Arranque
   -------------------------------------------------------------------------- */

function init() {
  syncUnitUI();

  const initialPlace = state.place ?? DEFAULT_PLACE;
  if (state.place) el.input.value = state.place.name;

  loadPlace(initialPlace);
}

init();
