import { api } from './api';

export async function getMe() {
  return api.get('/users/me');
}

export async function updateMe(data: {
  name?: string;
  preferred_language?: string;
  location_lat?: number;
  location_lng?: number;
}) {
  return api.patch('/users/me', data);
}
