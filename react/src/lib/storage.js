/* Persistencia en localStorage con manejo de errores (modo privado, bloqueos). */

const KEYS = {
  place: "clima-ahora:place",
  unit: "clima-ahora:unit",
};

export function readUnit() {
  try {
    return localStorage.getItem(KEYS.unit) === "f" ? "f" : "c";
  } catch {
    return "c";
  }
}

export function writeUnit(unit) {
  try {
    localStorage.setItem(KEYS.unit, unit);
  } catch {
    /* Sin persistencia: la app sigue funcionando. */
  }
}

export function readStoredPlace() {
  try {
    const raw = localStorage.getItem(KEYS.place);
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

export function writeStoredPlace(place) {
  try {
    localStorage.setItem(KEYS.place, JSON.stringify(place));
  } catch {
    /* Sin persistencia: la app sigue funcionando. */
  }
}
