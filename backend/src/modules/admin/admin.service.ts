// Admin service — dealer management, disease library writes, analytics
import { supabase } from '../../config/supabase.js';
import { diseaseLibraryService, DiseaseLibraryCreateInput, DiseaseLibraryUpdateInput } from '../disease-library/disease-library.service.js';

export class AdminService {
  async getDealers(status?: string) {
    let query = supabase.from('dealers')
      .select('id, shop_name, owner_name, email, phone_number, address, status, created_at')
      .order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw Object.assign(new Error('Failed to fetch dealers.'), { statusCode: 500, code: 'INTERNAL_ERROR' });
    return data ?? [];
  }

  async approveDealer(dealerId: string) {
    const { data, error } = await supabase.from('dealers')
      .update({ status: 'approved' }).eq('id', dealerId).select('id, status').single();
    if (error || !data) throw Object.assign(new Error('Dealer not found.'), { statusCode: 404, code: 'NOT_FOUND' });
    return data;
  }

  async rejectDealer(dealerId: string) {
    const { data, error } = await supabase.from('dealers')
      .update({ status: 'suspended' }).eq('id', dealerId).select('id, status').single();
    if (error || !data) throw Object.assign(new Error('Dealer not found.'), { statusCode: 404, code: 'NOT_FOUND' });
    return data;
  }

  async createDisease(input: DiseaseLibraryCreateInput) {
    return diseaseLibraryService.create(input);
  }

  async updateDisease(id: string, input: DiseaseLibraryUpdateInput) {
    return diseaseLibraryService.update(id, input);
  }

  async getAnalyticsOverview() {
    const { count: total_diagnoses } = await supabase
      .from('diagnoses').select('id', { count: 'exact', head: true });

    const { data: diseaseCounts } = await supabase
      .from('diagnoses').select('matched_disease_code')
      .not('matched_disease_code', 'is', null);

    const codeMap: Record<string, number> = {};
    for (const d of (diseaseCounts ?? [])) {
      if (d.matched_disease_code) codeMap[d.matched_disease_code] = (codeMap[d.matched_disease_code] ?? 0) + 1;
    }
    const top_diseases = Object.entries(codeMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([code, count]) => ({ disease_name: code, count }));

    const { data: chatData } = await supabase
      .from('chats').select('dealer_id, dealers(shop_name)');
    const dealerMap: Record<string, { name: string; count: number }> = {};
    for (const c of (chatData ?? [])) {
      const id = c.dealer_id;
      if (!dealerMap[id]) dealerMap[id] = { name: (c as any).dealers?.shop_name ?? id, count: 0 };
      dealerMap[id].count++;
    }
    const dealer_activity = Object.values(dealerMap).sort((a, b) => b.count - a.count).slice(0, 5);

    const { data: users } = await supabase.from('users').select('preferred_language');
    const langMap: Record<string, number> = {};
    for (const u of (users ?? [])) {
      const lang = u.preferred_language ?? 'en';
      langMap[lang] = (langMap[lang] ?? 0) + 1;
    }
    const language_usage_split = Object.entries(langMap).map(([language, count]) => ({ language, count }));

    return { total_diagnoses: total_diagnoses ?? 0, top_diseases, dealer_activity, language_usage_split };
  }
}

export const adminService = new AdminService();
