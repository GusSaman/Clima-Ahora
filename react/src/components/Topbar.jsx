export default function Topbar({ unit, onUnitChange }) {
  return (
    <header className="topbar">
      <a className="brand" href="./" aria-label="Clima Ahora, inicio">
        <svg className="brand__mark" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6" />
          </g>
        </svg>
        <span className="brand__name">
          Clima<span>Ahora</span>
        </span>
      </a>

      <div className="unit" role="group" aria-label="Unidad de temperatura">
        {["c", "f"].map((value) => (
          <button
            key={value}
            type="button"
            className={`unit__btn${unit === value ? " is-active" : ""}`}
            aria-pressed={unit === value}
            onClick={() => onUnitChange(value)}
          >
            °{value.toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  );
}
