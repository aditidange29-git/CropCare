import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext.tsx';
import AppRouter from './router/index.tsx';

export default function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
