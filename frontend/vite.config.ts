import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// CropCare — Vite config
//
// Plain React (not Next.js) — this build is wrapped by Capacitor into a
// static native Android shell. SSR is irrelevant here.
// See architecture/07_Architecture.md §2.1.

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      // @/ → src/ shorthand for clean imports inside frontend
      '@': resolve(__dirname, 'src'),
      // cropcare-shared → shared workspace package
      'cropcare-shared': resolve(__dirname, '../shared'),
    },
  },

  build: {
    // Output to dist/ — Capacitor reads this via webDir in capacitor.config.ts
    outDir: 'dist',
    // Warn if any chunk exceeds 1MB (helps keep Capacitor bundle lean)
    chunkSizeWarningLimit: 1000,
  },

  server: {
    // Local dev server — proxy API calls to backend so CORS isn't an issue
    // during browser-based development (Capacitor handles this natively in APK)
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
