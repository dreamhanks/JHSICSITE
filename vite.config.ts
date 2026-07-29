import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  optimizeDeps: {
    // maplibre-gl ships its own Web Worker (maplibre-gl-worker.mjs).
    // Vite's dep optimiser rewrites the entry but does not emit the
    // worker alongside it, so the worker 404s, the map never fires
    // `load`, and the container stays blank. Excluding it leaves the
    // package's own ESM untouched. Dev-only — the production build
    // does not use the dep optimiser.
    exclude: ['maplibre-gl'],
  },
})
