import { api } from './api';

export interface RecommendationItem {
  product_id: string;
  name: string;
  dealer: {
    id: string;
    shop_name: string;
    phone_number: string;
    whatsapp_number: string | null;
  };
  distance_km: number | null;
  stock_status: 'in_stock' | 'low' | 'out_of_stock';
  rank: number;
}

export async function getRecommendations(diagnosisId: string): Promise<RecommendationItem[]> {
  const data = await api.get<{ products: RecommendationItem[] }>(`/recommendations/${diagnosisId}`);
  return data.products;
}

export async function recordContact(
  diagnosisId: string,
  dealerId: string,
  channel: 'call' | 'whatsapp'
): Promise<{ chat_id: string; deep_link: string }> {
  return api.post('/chats', { diagnosis_id: diagnosisId, dealer_id: dealerId, channel });
}
