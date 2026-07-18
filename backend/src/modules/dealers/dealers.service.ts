// Dealers service — public-facing dealer profile read.
//
// Targets the `dealers` and `products` tables (05_Database.md §2.2, §2.6).
// Used by the dealers router mounted at /api/v1/dealers (06_API_Design.md §5).

import { supabase } from '../../config/supabase.js';

export class DealersService {
  /**
   * Returns the public profile for a dealer plus their approved/active products.
   * Sensitive fields (password_hash, email) are explicitly excluded.
   * Only dealers with status = 'approved' are returned; others get 404 to
   * avoid leaking the existence of pending/suspended dealers.
   */
  async getPublicProfile(dealerId: string) {
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select(
        'id, shop_name, owner_name, phone_number, whatsapp_number, address, location_lat, location_lng, status'
      )
      .eq('id', dealerId)
      .eq('status', 'approved')
      .single();

    if (dealerError || !dealer) {
      throw Object.assign(new Error('Dealer not found.'), { statusCode: 404, code: 'NOT_FOUND' });
    }

    // Fetch this dealer's products (all stock statuses — let the frontend filter/badge)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, category, applicable_disease_codes, stock_status, image_url')
      .eq('dealer_id', dealerId)
      .order('name');

    if (productsError) {
      throw Object.assign(new Error('Failed to load dealer products.'), {
        statusCode: 500,
        code: 'INTERNAL_ERROR',
      });
    }

    return {
      id: dealer.id,
      shop_name: dealer.shop_name,
      owner_name: dealer.owner_name,
      phone_number: dealer.phone_number,
      whatsapp_number: dealer.whatsapp_number,
      address: dealer.address,
      location_lat: dealer.location_lat,
      location_lng: dealer.location_lng,
      products: products ?? [],
    };
  }
}

export const dealersService = new DealersService();
