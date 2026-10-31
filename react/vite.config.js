import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Rutas relativas: el build funciona también al servirlo desde una subcarpeta.
  base: "./",
  plugins: [react()],
});
