import { useEffect, useRef } from "react";

export default function SearchBar({
  query,
  onQueryChange,
  suggestions,
  open,
  activeIndex,
  onChoose,
  onClose,
  onReopen,
  onKeyDown,
  onSubmit,
  loading,
  error,
}) {
  const fieldRef = useRef(null);

  // Cierra el desplegable al hacer clic fuera del buscador.
  useEffect(() => {
    function handleDocumentClick(event) {
      if (!fieldRef.current?.contains(event.target)) onClose();
    }

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [onClose]);

  return (
    <section className="search" aria-label="Buscador de ciudades">
      <div className="search__field" ref={fieldRef}>
        <form
          id="search-form"
          className={`search__form${loading ? " is-loading" : ""}`}
          role="search"
          autoComplete="off"
          onSubmit={onSubmit}
        >
          <span className="search__icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.6-3.6" />
            </svg>
          </span>

          <label className="sr-only" htmlFor="city-input">
            Nombre de la ciudad
          </label>
          <input
            id="city-input"
            className="search__input"
            name="city"
            type="text"
            placeholder="Busca una ciudad…"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={onKeyDown}
            onFocus={onReopen}
            autoComplete="off"
            autoCapitalize="words"
            spellCheck="false"
            role="combobox"
            aria-expanded={open}
            aria-controls="suggestions"
            aria-autocomplete="list"
            aria-activedescendant={
              open && activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
            }
          />

          <button type="submit" className="search__btn" disabled={loading}>
            <span className="search__btn-label">Buscar</span>
            <span className="spinner" aria-hidden="true" />
          </button>
        </form>

        {open && suggestions.length > 0 && (
          <ul
            id="suggestions"
            className="suggestions"
            role="listbox"
            aria-label="Sugerencias de ciudades"
          >
            {suggestions.map((place, index) => (
              <li
                key={`${place.name}-${place.latitude}-${place.longitude}`}
                id={`suggestion-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={`suggestion${index === activeIndex ? " is-active" : ""}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onChoose(place)}
              >
                <span className="suggestion__pin" aria-hidden="true">
                  📍
                </span>
                <div>
                  <span className="suggestion__name">{place.name}</span>
                  <span className="suggestion__meta">
                    {[place.admin1, place.country].filter(Boolean).join(" · ") ||
                      "Ubicación"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p
        className={`status${error ? " is-error" : ""}`}
        role="status"
        aria-live="polite"
      >
        {error}
      </p>
    </section>
  );
}
