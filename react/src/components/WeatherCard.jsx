import { useEffect, useState } from "react";
import {
  describeWeather,
  formatCityTime,
  formatClock,
  formatTemp,
  formatWind,
  nextSunEvent,
} from "../lib/weather.js";

/* Reloj local de la ciudad, actualizado cada 15 segundos. */
function useCityClock(offsetSeconds) {
  const [time, setTime] = useState(() => formatCityTime(offsetSeconds));

  useEffect(() => {
    setTime(formatCityTime(offsetSeconds));
    const timer = setInterval(
      () => setTime(formatCityTime(offsetSeconds)),
      15000,
    );
    return () => clearInterval(timer);
  }, [offsetSeconds]);

  return time;
}

export default function WeatherCard({ place, weather, unit, loading }) {
  const current = weather.current;
  const isDay = current.is_day === 1;
  const info = describeWeather(current.weather_code, isDay);
  const clock = useCityClock(weather.utc_offset_seconds ?? 0);
  const unitLabel = unit === "c" ? "°C" : "°F";
  const sun = nextSunEvent(weather);

  return (
    <article
      className={`weather${loading ? " is-refreshing" : ""}`}
      aria-busy={loading}
      aria-live="polite"
    >
      <div className="weather__top">
        <div className="weather__place">
          <h1 className="weather__city">{place.name}</h1>
          <p className="weather__meta">
            {[place.admin1, place.country].filter(Boolean).join(" · ")}
          </p>
        </div>

        <div className="weather__time">
          <span className="weather__clock">{clock}</span>
          <span className="weather__zone">hora local</span>
        </div>
      </div>

      <div className="weather__hero">
        <div className="weather__icon" aria-hidden="true">
          {info.icon}
        </div>
        <div className="weather__temp-wrap">
          <p className="weather__temp">
            <span>{formatTemp(current.temperature_2m, unit)}</span>
            <span className="weather__deg">{unitLabel}</span>
          </p>
          <p className="weather__condition">{info.label}</p>
        </div>
      </div>

      <div className="weather__details">
        <div className="detail">
          <span className="detail__icon" aria-hidden="true">
            💧
          </span>
          <div className="detail__text">
            <span className="detail__label">Humedad</span>
            <span className="detail__value">
              {Math.round(current.relative_humidity_2m)}%
            </span>
          </div>
        </div>

        <div className="detail">
          <span className="detail__icon" aria-hidden="true">
            💨
          </span>
          <div className="detail__text">
            <span className="detail__label">Viento</span>
            <span className="detail__value">
              {formatWind(current.wind_speed_10m, unit)}
            </span>
          </div>
        </div>

        <div className="detail">
          <span className="detail__icon" aria-hidden="true">
            🌡️
          </span>
          <div className="detail__text">
            <span className="detail__label">Sensación</span>
            <span className="detail__value">
              {formatTemp(current.apparent_temperature, unit)}
              {unitLabel}
            </span>
          </div>
        </div>

        <div className="detail">
          <span className="detail__icon" aria-hidden="true">
            {sun.icon}
          </span>
          <div className="detail__text">
            <span className="detail__label">{sun.type}</span>
            <span className="detail__value">{formatClock(sun.time)}</span>
          </div>
        </div>
      </div>

      <footer className="weather__foot">
        <span className="weather__updated">
          Actualizado a las {formatClock(current.time)}
        </span>
        <span className="weather__credit">
          Datos de{" "}
          <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
            Open-Meteo
          </a>
        </span>
      </footer>
    </article>
  );
}
