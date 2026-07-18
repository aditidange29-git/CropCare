// CropCare — App Router
// All 12 screens wired up.
// See architecture/03_App_Flow.md for navigation logic.
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import SplashPage from '../pages/Splash/index.tsx';
import LanguageSelectPage from '../pages/LanguageSelect/index.tsx';
import DemoLoginPage from '../pages/DemoLogin/index.tsx';
import HomePage from '../pages/Home/index.tsx';
import CameraPage from '../pages/Camera/index.tsx';
import DiagnosisLoadingPage from '../pages/DiagnosisLoading/index.tsx';
import DiagnosisPage from '../pages/Diagnosis/index.tsx';
import RecommendationsPage from '../pages/Recommendations/index.tsx';
import HistoryPage from '../pages/History/index.tsx';
import SettingsPage from '../pages/Settings/index.tsx';
import DealerDashboardPage from '../pages/DealerDashboard/index.tsx';
import AdminConsolePage from '../pages/AdminConsole/index.tsx';

export default function AppRouter(): React.JSX.Element {
  return (
    <Routes>
      {/* Onboarding */}
      <Route path="/" element={<SplashPage />} />
      <Route path="/language" element={<LanguageSelectPage />} />
      <Route path="/login" element={<DemoLoginPage />} />

      {/* Farmer main flow */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/camera" element={<CameraPage />} />
      <Route path="/diagnosis-loading" element={<DiagnosisLoadingPage />} />
      <Route path="/diagnosis/:id" element={<DiagnosisPage />} />
      <Route path="/recommendations/:diagnosisId" element={<RecommendationsPage />} />

      {/* Standalone tab routes */}
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/settings" element={<SettingsPage />} />

      {/* Dealer flow */}
      <Route path="/dealer/dashboard" element={<DealerDashboardPage />} />

      {/* Admin console */}
      <Route path="/admin" element={<AdminConsolePage />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
