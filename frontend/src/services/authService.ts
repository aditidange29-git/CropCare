import { api, setToken, clearToken } from './api';

export interface FarmerUser {
  id: string;
  name: string;
  phone_number: string;
  preferred_language: string | null;
  is_new_user?: boolean;
}

export interface DealerUser {
  id: string;
  status: string;
}

export async function farmerLogin(name: string, phoneNumber: string): Promise<{ token: string; user: FarmerUser }> {
  const data = await api.post<{ token: string; user: FarmerUser }>('/auth/farmer/demo-login', {
    name,
    phone_number: phoneNumber,
  });
  setToken(data.token);
  localStorage.setItem('cropcare_user', JSON.stringify(data.user));
  localStorage.setItem('cropcare_role', 'farmer');
  return data;
}

export async function dealerLogin(email: string, password: string): Promise<{ token: string; dealer: DealerUser }> {
  const data = await api.post<{ token: string; dealer: DealerUser }>('/auth/dealer/login', { email, password });
  setToken(data.token);
  localStorage.setItem('cropcare_user', JSON.stringify(data.dealer));
  localStorage.setItem('cropcare_role', 'dealer');
  return data;
}

export async function dealerRegister(payload: {
  shop_name: string;
  owner_name: string;
  email: string;
  password: string;
  phone_number: string;
  location_lat: number;
  location_lng: number;
  address: string;
}): Promise<{ dealer: { id: string; status: string } }> {
  return api.post('/auth/dealer/register', payload);
}

export async function adminLogin(email: string, password: string): Promise<void> {
  const data = await api.post<{ token: string }>('/auth/admin/login', { email, password });
  setToken(data.token);
  localStorage.setItem('cropcare_role', 'admin');
}

export function logout(): void {
  clearToken();
  window.location.href = '/';
}

export function getStoredUser(): FarmerUser | null {
  const raw = localStorage.getItem('cropcare_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function getStoredRole(): 'farmer' | 'dealer' | 'admin' | null {
  const role = localStorage.getItem('cropcare_role');
  if (role === 'farmer' || role === 'dealer' || role === 'admin') return role;
  return null;
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('cropcare_token');
}
