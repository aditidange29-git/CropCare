// CropCare — Root App component
//
// Responsibilities:
//   - Wraps the entire app in providers (AuthContext, etc.)
//   - Renders the router which handles all screen navigation
//
// Screen flows are defined in architecture/03_App_Flow.md.
// Router config lives in src/router/index.tsx.
// Auth context lives in src/store/AuthContext.tsx.
//
// NOTE: This file is intentionally minimal — business logic belongs in
// individual pages and hooks, not here.

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/index.tsx';

function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      {/*
        Future providers go here (AuthContext, LanguageContext, etc.)
        as they are built in Milestone 1. Example:
          <AuthProvider>
            <LanguageProvider>
              <AppRouter />
            </LanguageProvider>
          </AuthProvider>
      */}
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
