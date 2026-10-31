import { useEffect, useRef } from "react";
import { buildGradient, getPalette } from "../lib/weather.js";

/**
 * Fondo de pantalla completa. Mantiene dos capas y hace un fundido cruzado
 * cada vez que cambia el momento del día o el estado del cielo.
 */
export default function Sky({ isDay, group }) {
  const layerARef = useRef(null);
  const layerBRef = useRef(null);
  const activeRef = useRef(0);

  useEffect(() => {
    const palette = getPalette(isDay, group);
    const layers = [layerARef.current, layerBRef.current];
    const nextIndex = activeRef.current === 0 ? 1 : 0;
    const nextLayer = layers[nextIndex];
    const previousLayer = layers[activeRef.current];

    if (!nextLayer || !previousLayer) return;

    nextLayer.style.backgroundImage = buildGradient(palette);
    nextLayer.style.zIndex = "1";
    previousLayer.style.zIndex = "0";
    nextLayer.style.opacity = "1";
    previousLayer.style.opacity = "0";

    activeRef.current = nextIndex;

    document.documentElement.dataset.time = isDay ? "day" : "night";
    document.documentElement.dataset.weather = group;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", palette.from);
  }, [isDay, group]);

  return (
    <div className="sky" aria-hidden="true">
      <div className="sky__layer" ref={layerARef} />
      <div className="sky__layer" ref={layerBRef} />
      <div className="sky__stars" />
      <div className="sky__vignette" />
    </div>
  );
}
