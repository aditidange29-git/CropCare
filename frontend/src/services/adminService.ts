import { api } from './api';

export async function getAdminDealers(status?: string) {
  const q = status ? `?status=${status}` : '';
  return api.get(`/admin/dealers${q}`);
}

export async function approveDealer(id: string) {
  return api.patch(`/admin/dealers/${id}/approve`, {});
}

export async function rejectDealer(id: string) {
  return api.patch(`/admin/dealers/${id}/reject`, {});
}

export async function getAdminAnalytics() {
  return api.get('/admin/analytics/overview');
}

export async function getDiseaseLibrary() {
  return api.get('/disease-library');
}
