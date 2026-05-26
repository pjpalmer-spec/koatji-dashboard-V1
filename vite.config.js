import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config. Nothing fancy — React plugin + sane defaults.
// VITE_API_URL is read by src/lib/api.js via import.meta.env.
export default defineConfig({
  plugins: [react()],
  build: {
    // Bump the warning threshold since Chart.js is chunky and we'd rather
    // ship one big bundle than fight with code-splitting for an internal tool.
    chunkSizeWarningLimit: 2000,
  },
});
