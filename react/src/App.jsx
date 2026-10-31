import { useCallback, useEffect, useState } from "react";
import Loader from "./components/Loader.jsx";
import SearchBar from "./components/SearchBar.jsx";
import Sky from "./components/Sky.jsx";
import Topbar from "./components/Topbar.jsx";
import WeatherCard from "./components/WeatherCard.jsx";
import { useCitySearch } from "./hooks/useCitySearch.js";
import { useWeather } from "./hooks/useWeather.js";
import { describeWeather, formatTemp } from "./lib/weather.js";

export default function App() {
  const {
    unit,
    setUnit,
    place,
    weather,
    loading,
    error,
    setError,
    loadPlace,
    searchByQuery,
  } = useWeather();

  const [localError, setLocalError] = useState("");

  const handleSelect = useCallback(
    (nextPlace) => {
      setLocalError("");
      loadPlace(nextPlace);
    },
    [loadPlace],
  );

  const search = useCitySearch({
    initialQuery: place.name,
    onSelect: handleSelect,
  });

  async function handleSubmit(event) {
    event.preventDefault();
    search.close();

    const query = search.query.trim();
    if (!query) {
      setLocalError("Escribe el nombre de una ciudad para empezar.");
      return;
    }

    setLocalError("");
    setError("");

    const found = await searchByQuery(query);
    if (found) search.setQuerySilently(found.name);
  }

  function handleQueryChange(value) {
    search.setQuery(value);
    if (localError) setLocalError("");
  }

  const isDay = weather?.current?.is_day === 1;
  const group = weather
    ? describeWeather(weather.current.weather_code, isDay).group
    : "clear";

  // El título de la pestaña resume el clima actual.
  useEffect(() => {
    if (!weather) {
      document.title = "Clima Ahora";
      return;
    }

    const temp = formatTemp(weather.current.temperature_2m, unit);
    document.title = `${temp}°${unit.toUpperCase()} en ${place.name} · Clima Ahora`;
  }, [weather, place.name, unit]);

  return (
    <>
      <Sky isDay={isDay} group={group} />

      <main className="app">
        <Topbar unit={unit} onUnitChange={setUnit} />

        <SearchBar
          query={search.query}
          onQueryChange={handleQueryChange}
          suggestions={search.suggestions}
          open={search.open}
          activeIndex={search.activeIndex}
          onChoose={search.choose}
          onClose={search.close}
          onReopen={search.reopen}
          onKeyDown={search.handleKeyDown}
          onSubmit={handleSubmit}
          loading={loading}
          error={localError || error}
        />

        {loading && !weather && <Loader />}

        {weather && (
          <WeatherCard
            place={place}
            weather={weather}
            unit={unit}
            loading={loading}
          />
        )}
      </main>
    </>
  );
}
