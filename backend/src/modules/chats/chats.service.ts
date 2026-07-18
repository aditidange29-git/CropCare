// Chats service — records contact events (call/whatsapp) per 06_API_Design.md §7
import { supabase } from '../../config/supabase.js';

export class ChatsService {
  async createChat(data: { diagnosis_id: string; dealer_id: string; channel: 'call' | 'whatsapp'; userId: string }) {
    const { data: dealer, error: dealerErr } = await supabase
      .from('dealers')
      .select('id, phone_number, whatsapp_number, status')
      .eq('id', data.dealer_id)
      .single();
    if (dealerErr || !dealer) {
      throw Object.assign(new Error('Dealer not found.'), { statusCode: 404, code: 'NOT_FOUND' });
    }
    if (dealer.status !== 'approved') {
      throw Object.assign(new Error('Dealer not approved.'), { statusCode: 403, code: 'DEALER_NOT_APPROVED' });
    }
    const { data: chat, error: chatErr } = await supabase
      .from('chats')
      .insert({ diagnosis_id: data.diagnosis_id, user_id: data.userId, dealer_id: data.dealer_id, channel: data.channel })
      .select('id')
      .single();
    if (chatErr || !chat) {
      throw Object.assign(new Error('Failed to record contact.'), { statusCode: 500, code: 'INTERNAL_ERROR' });
    }
    let deep_link: string;
    if (data.channel === 'whatsapp') {
      const num = (dealer.whatsapp_number ?? dealer.phone_number).replace(/\D/g, '');
      deep_link = `https://wa.me/${num}`;
    } else {
      deep_link = `tel:${dealer.phone_number}`;
    }
    return { chat_id: chat.id, deep_link };
  }
}

export const chatsService = new ChatsService();
