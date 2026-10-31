import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_PLACE, fetchForecast, findCities, toPlace } from "../lib/api.js";
import {
  readStoredPlace,
  readUnit,
  writeStoredPlace,
  writeUnit,
} from "../lib/storage.js";

/**
 * Encapsula el estado del clima: lugar actual, datos, carga, errores y unidad.
 * Las peticiones se cancelan con AbortController cuando llega una nueva,
 * para que una respuesta lenta no pise a una búsqueda más reciente.
 */
export function useWeather() {
  const [unit, setUnitState] = useState(readUnit);
  const [place, setPlace] = useState(() => readStoredPlace() ?? DEFAULT_PLACE);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const weatherRequestRef = useRef(0);
  const searchRequestRef = useRef(0);
  const controllerRef = useRef(null);

  const loadPlace = useCallback(async (nextPlace) => {
    if (!nextPlace) return null;

    const requestId = ++weatherRequestRef.current;
    searchRequestRef.current += 1;
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const data = await fetchForecast(nextPlace, controller.signal);
      if (requestId !== weatherRequestRef.current) return null;

      setWeather(data);
      setPlace(nextPlace);
      writeStoredPlace(nextPlace);
      return nextPlace;
    } catch (err) {
      if (err.name === "AbortError" || requestId !== weatherRequestRef.current) {
        return null;
      }

      console.error("[Clima Ahora] Error al obtener el clima:", err);
      setError(
        "No pudimos obtener el clima. Revisa tu conexión e inténtalo otra vez.",
      );
      return null;
    } finally {
      if (requestId === weatherRequestRef.current) setLoading(false);
    }
  }, []);

  // Carga inicial (StrictMode monta/desmonta en desarrollo: el abort evita
  // que la primera petición duplicada termine pintando la pantalla).
  useEffect(() => {
    loadPlace(place);
    return () => controllerRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPlace]);

  /**
   * Busca por texto, elige la primera coincidencia y carga su clima.
   * Devuelve el lugar encontrado (o null) para que la UI actualice el input.
   */
  const searchByQuery = useCallback(
    async (query) => {
      const requestId = ++searchRequestRef.current;

      setLoading(true);
      setError("");

      try {
        const results = await findCities(query);
        if (requestId !== searchRequestRef.current) return null;

        if (!results.length) {
          setError(
            `No encontramos “${query}”. Revisa la ortografía o prueba con otra ciudad.`,
          );
          return null;
        }

        return await loadPlace(toPlace(results[0]));
      } catch (err) {
        if (requestId !== searchRequestRef.current || err.name === "AbortError") {
          return null;
        }

        console.error("[Clima Ahora] Error al buscar la ciudad:", err);
        setError(
          "No pudimos buscar la ciudad. Revisa tu conexión e inténtalo de nuevo.",
        );
        return null;
      } finally {
        if (requestId === searchRequestRef.current) setLoading(false);
      }
    },
    [loadPlace],
  );

  const setUnit = useCallback((nextUnit) => {
    if (nextUnit !== "c" && nextUnit !== "f") return;
    setUnitState(nextUnit);
    writeUnit(nextUnit);
  }, []);

  return {
    unit,
    setUnit,
    place,
    weather,
    loading,
    error,
    setError,
    loadPlace,
    searchByQuery,
  };
}
