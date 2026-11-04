import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // The real budget is 180 KB gzip of first-load JS (docs/09); the one initial
    // chunk is ~520 KB before compression, so warn only past 600 KB raw.
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        codeSplitting: {
          // Everything the first page needs statically ships as one chunk, instead of
          // dozens of sub-kilobyte shared chunks (icons, hooks) each with its own request.
          groups: [{ name: 'app', tags: ['$initial'] }],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Dev-only: forwards /api/* to the Express server so cookies work same-origin
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
