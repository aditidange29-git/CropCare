import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStoredUser, getStoredRole, isAuthenticated as checkAuth, logout as doLogout, farmerLogin as apiFarmerLogin } from '../services/authService.ts';

interface AuthUser {
  id: string; name: string; phone_number?: string; is_new_user?: boolean;
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

  // Show a full-screen loader while hydrating from localStorage
  // This prevents the blank flash before auth state is known
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f5f5f0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '96px', height: '96px', borderRadius: '24px', background: 'linear-gradient(135deg, #1a936f 0%, #114b5f 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(26,147,111,0.25)' }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none"><path d="M17 8C8 10 5.9 16.17 3.82 19.34a1 1 0 00.84 1.5 4.68 4.68 0 003.76-2.26" stroke="white" strokeWidth="2" strokeLinecap="round" /><path d="M2 22C4.5 20 6.5 17.5 7.82 14.5" stroke="white" strokeWidth="2" strokeLinecap="round" /><path d="M17 8c2-4 5-6 5-6s-2 5-5 12c-2.5 5.5-7 8-7 8" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#114b5f', margin: '0 0 6px 0' }}>CropCare</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>AI-powered crop disease detection</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user, role,
      isAuthenticated: !!user,
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
