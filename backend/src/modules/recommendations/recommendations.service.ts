// Recommendation Engine — architecture/07_Architecture.md §5
// score = (0.5 × proximity) + (0.3 × stock) + (0.2 × reliability)
import { supabase } from '../../config/supabase.js';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function rankScore(distKm: number, stock: string): number {
  const prox = 1 / (1 + distKm / 10);
  const stockS = stock === 'in_stock' ? 1.0 : 0.5;
  return 0.5 * prox + 0.3 * stockS + 0.2 * 0.5;
}

export class RecommendationsService {
  async generateAndSave(
    diagnosisId: string,
    diseaseCode: string,
    userLat?: number,
    userLng?: number
  ): Promise<void> {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, stock_status, dealer_id, dealers!inner(id, status, location_lat, location_lng)')
      .contains('applicable_disease_codes', [diseaseCode])
      .neq('stock_status', 'out_of_stock')
      .eq('dealers.status', 'approved');
    if (error || !products || products.length === 0) return;
    const scored = products.map((p: any) => {
      const dealer = p.dealers;
      let distKm = 50;
      if (userLat != null && userLng != null && dealer?.location_lat != null && dealer?.location_lng != null) {
        distKm = haversineKm(userLat, userLng, dealer.location_lat, dealer.location_lng);
      }
      return { product_id: p.id, score: rankScore(distKm, p.stock_status) };
    });
    scored.sort((a, b) => b.score - a.score);
    const rows = scored.slice(0, 10).map((item, i) => ({
      diagnosis_id: diagnosisId,
      product_id: item.product_id,
      rank: i + 1,
      shown_at: new Date().toISOString(),
    }));
    await supabase.from('recommendations').insert(rows);
  }

  async getRecommendationsForDiagnosis(diagnosisId: string, userId: string) {
    const { data: diagnosis, error: diagErr } = await supabase
      .from('diagnoses')
      .select('id, location_lat, location_lng')
      .eq('id', diagnosisId)
      .eq('user_id', userId)
      .single();
    if (diagErr || !diagnosis) {
      throw Object.assign(new Error('Diagnosis not found.'), { statusCode: 404, code: 'NOT_FOUND' });
    }
    const { data: recs, error: recsErr } = await supabase
      .from('recommendations')
      .select('rank, products(id, name, category, stock_status, dealers(id, shop_name, phone_number, whatsapp_number, location_lat, location_lng))')
      .eq('diagnosis_id', diagnosisId)
      .order('rank', { ascending: true });
    if (recsErr) {
      throw Object.assign(new Error('Failed to fetch recommendations.'), { statusCode: 500, code: 'INTERNAL_ERROR' });
    }
    return (recs ?? []).map((r: any) => {
      const dealer = r.products?.dealers;
      let distance_km: number | null = null;
      if (diagnosis.location_lat != null && diagnosis.location_lng != null && dealer?.location_lat != null) {
        distance_km = Math.round(haversineKm(diagnosis.location_lat, diagnosis.location_lng, dealer.location_lat, dealer.location_lng) * 10) / 10;
      }
      return {
        product_id: r.products?.id,
        name: r.products?.name,
        dealer: { id: dealer?.id, shop_name: dealer?.shop_name, phone_number: dealer?.phone_number, whatsapp_number: dealer?.whatsapp_number },
        distance_km,
        stock_status: r.products?.stock_status,
        rank: r.rank,
      };
    });
  }
}

export const recommendationsService = new RecommendationsService();
