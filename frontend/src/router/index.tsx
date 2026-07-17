// CropCare — App Router
//
// Defines all screen routes for the app.
// Read architecture/03_App_Flow.md before adding or changing routes.
//
// Milestone 1 routes (Splash → Language Select → Demo Login → Home shell)
// are stubbed here. Remaining routes are added per milestone.
//
// NOTE: React Router v6 is used with <Routes> / <Route> — not the old
// Switch-based pattern. See architecture/07_Architecture.md §2.1.

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages — stubbed for Milestone 1. Each will be built out per 08_Implementation_Plan.md.
// import SplashPage from '../pages/Splash.tsx';
// import LanguageSelectPage from '../pages/LanguageSelect.tsx';
// import DemoLoginPage from '../pages/DemoLogin.tsx';
// import HomePage from '../pages/Home.tsx';

// Temporary placeholder until screens are built in Milestone 1
function PlaceholderScreen({ name }: { name: string }): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#1a936f',
        color: '#fff',
        fontFamily: 'Roboto, system-ui, sans-serif',
        gap: '12px',
      }}
    >
      <h1 style={{ fontSize: '28px', margin: 0 }}>🌿 CropCare</h1>
      <p style={{ fontSize: '16px', margin: 0, opacity: 0.85 }}>{name} — coming in Milestone 1</p>
    </div>
  );
}

export default function AppRouter(): React.JSX.Element {
  return (
    <Routes>
      {/* Milestone 1 — replace stubs with real screens as built */}
      <Route path="/" element={<PlaceholderScreen name="Splash" />} />
      <Route path="/language" element={<PlaceholderScreen name="Language Select" />} />
      <Route path="/login" element={<PlaceholderScreen name="Demo Login" />} />
      <Route path="/home" element={<PlaceholderScreen name="Home" />} />

      {/* Milestone 2 */}
      <Route path="/camera" element={<PlaceholderScreen name="Camera" />} />
      <Route path="/diagnosis/:id" element={<PlaceholderScreen name="Diagnosis Result" />} />

      {/* Milestone 3 */}
      <Route path="/recommendations/:diagnosisId" element={<PlaceholderScreen name="Recommendations" />} />
      <Route path="/dealer/dashboard" element={<PlaceholderScreen name="Dealer Dashboard" />} />

      {/* Milestone 4 */}
      <Route path="/history" element={<PlaceholderScreen name="History" />} />
      <Route path="/settings" element={<PlaceholderScreen name="Settings" />} />
      <Route path="/admin" element={<PlaceholderScreen name="Admin Console" />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
