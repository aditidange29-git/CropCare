// CropCare — React entry point
//
// Mounts the React app into #root (index.html).
// Capacitor runs this as a static web bundle inside the Android native shell.
//
// Read before modifying navigation structure:
//   architecture/03_App_Flow.md — screen-to-screen flows for all roles
//   architecture/07_Architecture.md §2.1 — React + Vite + Capacitor layer

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
