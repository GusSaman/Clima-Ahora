import { useCallback, useEffect, useRef, useState } from "react";
import { findCities, toPlace } from "../lib/api.js";

/**
 * Gestiona el texto del buscador, el debounce de las sugerencias y la
 * navegación con teclado (flechas, Enter, Escape).
 */
export function useCitySearch({ initialQuery = "", onSelect }) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const queryIdRef = useRef(0);
  const controllerRef = useRef(null);
  // Solo consultamos sugerencias cuando el cambio de texto lo hizo la persona
  // que usa la app. Así evitamos buscar al montar (o con StrictMode) y también
  // al elegir una ciudad o rellenar el input tras una búsqueda.
  const shouldSearchRef = useRef(false);

  useEffect(() => {
    controllerRef.current?.abort();

    if (!shouldSearchRef.current) {
      queryIdRef.current += 1;
      return;
    }

    const text = query.trim();

    if (text.length < 2) {
      queryIdRef.current += 1;
      setSuggestions([]);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    const queryId = ++queryIdRef.current;

    // Debounce: 280 ms desde la última tecla.
    const timer = setTimeout(async () => {
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const results = await findCities(text, controller.signal);
        if (queryId !== queryIdRef.current) return;

        setSuggestions(results.map(toPlace));
        setOpen(results.length > 0);
        setActiveIndex(-1);
      } catch (err) {
        if (err.name === "AbortError" || queryId !== queryIdRef.current) return;
        setSuggestions([]);
        setOpen(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const close = useCallback(() => {
    controllerRef.current?.abort();
    queryIdRef.current += 1;
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const updateQuery = useCallback((value) => {
    shouldSearchRef.current = true;
    setQuery(value);
  }, []);

  const reopen = useCallback(() => {
    if (suggestions.length > 0) setOpen(true);
  }, [suggestions.length]);

  const choose = useCallback(
    (place) => {
      if (!place) return;

      controllerRef.current?.abort();
      queryIdRef.current += 1;
      shouldSearchRef.current = false;
      setQuery(place.name);
      setSuggestions([]);
      setOpen(false);
      setActiveIndex(-1);
      onSelect?.(place);
    },
    [onSelect],
  );

  const setQuerySilently = useCallback((value) => {
    controllerRef.current?.abort();
    queryIdRef.current += 1;
    shouldSearchRef.current = false;
    setQuery(value);
  }, []);

  const handleKeyDown = useCallback(
    (event) => {
      if (!open || suggestions.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % suggestions.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex(
          (index) => (index - 1 + suggestions.length) % suggestions.length,
        );
      } else if (event.key === "Escape") {
        close();
      } else if (event.key === "Enter" && activeIndex >= 0) {
        event.preventDefault();
        choose(suggestions[activeIndex]);
      }
    },
    [open, suggestions, activeIndex, close, choose],
  );

  return {
    query,
    setQuery: updateQuery,
    setQuerySilently,
    suggestions,
    open,
    activeIndex,
    choose,
    close,
    reopen,
    handleKeyDown,
  };
}
