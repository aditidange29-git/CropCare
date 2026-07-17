import type { CapacitorConfig } from '@capacitor/cli';

// appId uses reverse-domain style — update if you change the package name.
// webDir points at the Vite build output folder.
const config: CapacitorConfig = {
  appId: 'com.cropcare.app',
  appName: 'CropCare',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // Capacitor Preferences plugin — used instead of localStorage for JWT
    // and language setting storage inside the native WebView.
    // See architecture/07_Architecture.md §4 (Offline Strategy).
  }
};

export default config;
