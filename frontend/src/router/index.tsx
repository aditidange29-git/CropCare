import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext.tsx';

import SplashPage from '../pages/Splash/index.tsx';
import LanguageSelectPage from '../pages/LanguageSelect/index.tsx';
import LoginPage from '../pages/DemoLogin/index.tsx';
import HomePage from '../pages/Home/index.tsx';
import CameraPage from '../pages/Camera/index.tsx';
import DiagnosisLoadingPage from '../pages/DiagnosisLoading/index.tsx';
import DiagnosisPage from '../pages/Diagnosis/index.tsx';
import RecommendationsPage from '../pages/Recommendations/index.tsx';
import HistoryPage from '../pages/History/index.tsx';
import SettingsPage from '../pages/Settings/index.tsx';
import AiChatPage from '../pages/AiChat/index.tsx';
import DealerDashboardPage from '../pages/DealerDashboard/index.tsx';
import DealerLoginPage from '../pages/DealerLogin/index.tsx';
import DealerSignupPage from '../pages/DealerSignup/index.tsx';
import DealerPendingPage from '../pages/DealerPending/index.tsx';
import AdminConsolePage from '../pages/AdminConsole/index.tsx';
import AdminLoginPage from '../pages/AdminLogin/index.tsx';

function RequireAuth({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f5f5f0' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#1a936f', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/language" replace />;
  return <>{children}</>;
}

export default function AppRouter(): React.JSX.Element {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      {/* Root — smart redirect based on auth state */}
      <Route path="/" element={
        isAuthenticated
          ? role === 'dealer' ? <Navigate to="/dealer/dashboard" replace />
          : role === 'admin' ? <Navigate to="/admin" replace />
          : <Navigate to="/home" replace />
          : <SplashPage />
      } />

      {/* Onboarding (public) */}
      <Route path="/language" element={<LanguageSelectPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Farmer flow (auth required) */}
      <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
      <Route path="/camera" element={<RequireAuth><CameraPage /></RequireAuth>} />
      <Route path="/diagnosis-loading" element={<RequireAuth><DiagnosisLoadingPage /></RequireAuth>} />
      <Route path="/diagnosis/:id" element={<RequireAuth><DiagnosisPage /></RequireAuth>} />
      <Route path="/recommendations/:diagnosisId" element={<RequireAuth><RecommendationsPage /></RequireAuth>} />
      <Route path="/history" element={<RequireAuth><HistoryPage /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
      <Route path="/ai-chat" element={<RequireAuth><AiChatPage /></RequireAuth>} />
      <Route path="/ai-chat/:diagnosisId" element={<RequireAuth><AiChatPage /></RequireAuth>} />

      {/* Dealer auth (public) */}
      <Route path="/dealer/login" element={<DealerLoginPage />} />
      <Route path="/dealer/signup" element={<DealerSignupPage />} />
      <Route path="/dealer/pending" element={<DealerPendingPage />} />

      {/* Dealer (auth required) */}
      <Route path="/dealer/dashboard" element={<RequireAuth><DealerDashboardPage /></RequireAuth>} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<RequireAuth><AdminConsolePage /></RequireAuth>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
