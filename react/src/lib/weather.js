/* ==========================================================================
   Datos estáticos y funciones de formato del clima.
   ========================================================================== */

/* Códigos WMO que devuelve Open-Meteo, traducidos al español.
   `group` define la paleta del fondo. */
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

export function getPalette(isDay, group) {
  const key = `${isDay ? "day" : "night"}-${group}`;
  return SKY_PALETTES[key] ?? SKY_PALETTES[isDay ? "day-clouds" : "night-clouds"];
}

export function buildGradient(palette) {
  return [
    `radial-gradient(900px 620px at 12% 8%, ${palette.glowA}, transparent 60%)`,
    `radial-gradient(800px 600px at 88% 92%, ${palette.glowB}, transparent 65%)`,
    `linear-gradient(160deg, ${palette.from} 0%, ${palette.via} 55%, ${palette.to} 100%)`,
  ].join(", ");
}

export function describeWeather(code, isDay) {
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

export function formatTemp(celsius, unit) {
  if (!Number.isFinite(celsius)) return "—";
  const value = unit === "f" ? (celsius * 9) / 5 + 32 : celsius;
  return String(Math.round(value));
}

export function formatWind(kmh, unit) {
  if (!Number.isFinite(kmh)) return "—";
  const value = unit === "f" ? kmh * 0.621371 : kmh;
  return `${Math.round(value)} ${unit === "f" ? "mph" : "km/h"}`;
}

/* "2026-10-31T14:05" -> "14:05" */
export function formatClock(isoLocal) {
  if (typeof isoLocal !== "string") return "--:--";
  const time = isoLocal.split("T")[1];
  return time ? time.slice(0, 5) : "--:--";
}

/* Hora local de la ciudad a partir del offset UTC que devuelve la API. */
export function formatCityTime(offsetSeconds) {
  const now = new Date(Date.now() + offsetSeconds * 1000);
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/* Próximo amanecer o atardecer posterior a la hora actual de la ciudad. */
export function nextSunEvent(data) {
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
