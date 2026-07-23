import { api } from './api';

export interface DiagnosisResult {
  diagnosis_id: string;
  disease: { code: string; name: string; confidence_label: 'high' | 'medium' | 'low' };
  explanation: string;
  treatment: { organic: string[]; chemical: string[] };
  status: 'auto_confirmed' | 'needs_review';
}

export interface DiagnosisListItem {
  id: string;
  disease_name: string;
  confidence_label: 'high' | 'medium' | 'low';
  status: string;
  thumbnail_url: string;
  created_at: string;
}

export async function submitDiagnosis(
  imageFile: File,
  locationLat?: number,
  locationLng?: number
): Promise<DiagnosisResult> {
  const form = new FormData();
  form.append('image', imageFile);
  if (locationLat != null) form.append('location_lat', String(locationLat));
  if (locationLng != null) form.append('location_lng', String(locationLng));
  return api.postForm<DiagnosisResult>('/diagnoses', form);
}

export async function getDiagnoses(
  page = 1,
  limit = 20
): Promise<{ items: DiagnosisListItem[]; page: number; total: number }> {
  return api.get(`/diagnoses?page=${page}&limit=${limit}`);
}

export async function getDiagnosisById(
  id: string
): Promise<DiagnosisResult & { recommendations: any[] }> {
  return api.get(`/diagnoses/${id}`);
}

export async function deleteDiagnosis(id: string): Promise<void> {
  await api.delete(`/diagnoses/${id}`);
}
