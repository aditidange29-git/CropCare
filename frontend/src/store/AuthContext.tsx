// Central auth state. Wraps the entire app.
// Provides: user, role, isAuthenticated, isLoading, login functions, logout.
// All screens read from this context — no raw localStorage calls in pages.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStoredUser, getStoredRole, isAuthenticated as checkAuth, logout as doLogout, farmerLogin as apiFarmerLogin } from '../services/authService.ts';

interface AuthUser {
  id: string;
  name: string;
  phone_number?: string;
  is_new_user?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  role: 'farmer' | 'dealer' | 'admin' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  farmerLogin: (name: string, phone: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<'farmer' | 'dealer' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(() => {
    const storedUser = getStoredUser();
    const storedRole = getStoredRole();
    setUser(storedUser);
    setRole(storedRole);
    setIsLoading(false);
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const farmerLogin = useCallback(async (name: string, phone: string) => {
    const result = await apiFarmerLogin(name, phone);
    setUser(result.user);
    setRole('farmer');
  }, []);

  const logout = useCallback(() => {
    doLogout();
    setUser(null);
    setRole(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, role,
      isAuthenticated: checkAuth(),
      isLoading,
      farmerLogin, logout, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
