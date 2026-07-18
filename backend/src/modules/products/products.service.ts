// Products service — dealer product catalog + leads + analytics.
//
// Design refs:
//   architecture/05_Database.md §2.6 (products), §2.5 (diagnoses),
//   §2.7 (recommendations), §2.8 (chats), §2.4 (disease_library)
//   architecture/06_API_Design.md §6 (Dealer Dashboard)

import { supabase } from '../../config/supabase.js';

export class ProductsService {
  // ── Create product ─────────────────────────────────────────────────────────
  async create(
    dealerId: string,
    data: {
      name: string;
      category: string;
      applicable_disease_codes: string[];
      stock_status: string;
    }
  ) {
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        dealer_id: dealerId,
        name: data.name,
        category: data.category,
        applicable_disease_codes: data.applicable_disease_codes,
        stock_status: data.stock_status,
      })
      .select('*')
      .single();

    if (error || !product) {
      throw Object.assign(
        new Error(`Failed to create product: ${error?.message ?? 'unknown error'}`),
        { statusCode: 500, code: 'INTERNAL_ERROR' }
      );
    }

    return product;
  }

  // ── Update product ─────────────────────────────────────────────────────────
  // Scoped to the owning dealer — a dealer cannot update another dealer's product.
  async update(
    productId: string,
    dealerId: string,
    data: Partial<{
      name: string;
      category: string;
      applicable_disease_codes: string[];
      stock_status: string;
    }>
  ) {
    // Verify ownership first
    const { data: existing, error: findError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .eq('dealer_id', dealerId)
      .maybeSingle();

    if (findError || !existing) {
      throw Object.assign(new Error('Product not found or access denied.'), {
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    }

    // Strip undefined values so Supabase doesn't null out untouched columns
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const { data: updated, error: updateError } = await supabase
      .from('products')
      .update(payload)
      .eq('id', productId)
      .eq('dealer_id', dealerId)
      .select('*')
      .single();

    if (updateError || !updated) {
      throw Object.assign(
        new Error(`Failed to update product: ${updateError?.message ?? 'unknown error'}`),
        { statusCode: 500, code: 'INTERNAL_ERROR' }
      );
    }

    return updated;
  }

  // ── Get dealer's own product catalog (paginated) ───────────────────────────
  async getDealerProducts(dealerId: string, page = 1, limit = 20) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw Object.assign(
        new Error(`Failed to fetch products: ${error.message}`),
        { statusCode: 500, code: 'INTERNAL_ERROR' }
      );
    }

    return {
      items: data ?? [],
      page,
      limit,
      total: count ?? 0,
    };
  }

  // ── Get dealer leads (paginated) ───────────────────────────────────────────
  // A "lead" is a diagnosis that was matched to one of this dealer's products
  // via the recommendations table. The "contacted" flag indicates whether the
  // farmer has initiated a chat with this specific dealer for that diagnosis.
  async getDealerLeads(dealerId: string, page = 1, limit = 20) {
    // Step 1: get this dealer's product IDs
    const { data: dealerProducts, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .eq('dealer_id', dealerId);

    if (productsError) {
      throw Object.assign(
        new Error(`Failed to fetch dealer products: ${productsError.message}`),
        { statusCode: 500, code: 'INTERNAL_ERROR' }
      );
    }

    if (!dealerProducts || dealerProducts.length === 0) {
      return { items: [], page, limit, total: 0 };
    }

    const productIds = dealerProducts.map((p) => p.id);
    const productNameMap = Object.fromEntries(
      dealerProducts.map((p) => [p.id, p.name])
    );

    // Step 2: get recommendations that reference those products (paginated)
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: recommendations, error: recsError, count } = await supabase
      .from('recommendations')
      .select('id, diagnosis_id, product_id, shown_at', { count: 'exact' })
      .in('product_id', productIds)
      .order('shown_at', { ascending: false })
      .range(from, to);

    if (recsError) {
      throw Object.assign(
        new Error(`Failed to fetch recommendations: ${recsError.message}`),
        { statusCode: 500, code: 'INTERNAL_ERROR' }
      );
    }

    if (!recommendations || recommendations.length === 0) {
      return { items: [], page, limit, total: count ?? 0 };
    }

    const diagnosisIds = [...new Set(recommendations.map((r) => r.diagnosis_id))];

    // Step 3: fetch diagnoses + disease names in one query
    const { data: diagnoses, error: diagError } = await supabase
      .from('diagnoses')
      .select('id, matched_disease_code, created_at')
      .in('id', diagnosisIds);

    if (diagError) {
      throw Object.assign(
        new Error(`Failed to fetch diagnoses: ${diagError.message}`),
        { statusCode: 500, code: 'INTERNAL_ERROR' }
      );
    }

    const diagMap = Object.fromEntries((diagnoses ?? []).map((d) => [d.id, d]));

    // Collect disease codes to look up names
    const diseaseCodes = [
      ...new Set(
        (diagnoses ?? [])
          .map((d) => d.matched_disease_code)
          .filter(Boolean) as string[]
      ),
    ];

    let diseaseNameMap: Record<string, string> = {};
    if (diseaseCodes.length > 0) {
      const { data: diseases } = await supabase
        .from('disease_library')
        .select('disease_code, name_translations')
        .in('disease_code', diseaseCodes);

      if (diseases) {
        for (const d of diseases) {
          const translations = d.name_translations as Record<string, string>;
          diseaseNameMap[d.disease_code] =
            translations['en'] ?? d.disease_code;
        }
      }
    }

    // Step 4: check which diagnoses have a chat with this dealer
    const { data: chats } = await supabase
      .from('chats')
      .select('diagnosis_id')
      .eq('dealer_id', dealerId)
      .in('diagnosis_id', diagnosisIds);

    const contactedDiagnosisIds = new Set(
      (chats ?? []).map((c) => c.diagnosis_id)
    );

    // Step 5: assemble lead items
    const items = recommendations.map((rec) => {
      const diagnosis = diagMap[rec.diagnosis_id];
      const diseaseCode = diagnosis?.matched_disease_code ?? null;

      return {
        diagnosis_id: rec.diagnosis_id,
        disease_name: diseaseCode ? (diseaseNameMap[diseaseCode] ?? diseaseCode) : null,
        matched_product_name: productNameMap[rec.product_id] ?? null,
        created_at: diagnosis?.created_at ?? rec.shown_at,
        contacted: contactedDiagnosisIds.has(rec.diagnosis_id),
      };
    });

    return { items, page, limit, total: count ?? 0 };
  }

  // ── Get dealer analytics ───────────────────────────────────────────────────
  async getDealerAnalytics(dealerId: string) {
    // 1. Get this dealer's product IDs
    const { data: dealerProducts, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('dealer_id', dealerId);

    if (productsError) {
      throw Object.assign(
        new Error(`Failed to fetch products: ${productsError.message}`),
        { statusCode: 500, code: 'INTERNAL_ERROR' }
      );
    }

    const productIds = (dealerProducts ?? []).map((p) => p.id);

    // 2. Count matched diagnoses (via recommendations)
    let diagnoses_matched = 0;
    let diagnosisIds: string[] = [];

    if (productIds.length > 0) {
      const { data: recs, error: recsError } = await supabase
        .from('recommendations')
        .select('diagnosis_id')
        .in('product_id', productIds);

      if (recsError) {
        throw Object.assign(
          new Error(`Failed to fetch recommendations: ${recsError.message}`),
          { statusCode: 500, code: 'INTERNAL_ERROR' }
        );
      }

      diagnosisIds = [...new Set((recs ?? []).map((r) => r.diagnosis_id))];
      diagnoses_matched = diagnosisIds.length;
    }

    // 3. Count contacts received (chats initiated with this dealer)
    const { count: contacts_received } = await supabase
      .from('chats')
      .select('id', { count: 'exact', head: true })
      .eq('dealer_id', dealerId);

    // 4. Top diseases from matched diagnoses
    let top_diseases: { disease_name: string; count: number }[] = [];

    if (diagnosisIds.length > 0) {
      const { data: diagnoses } = await supabase
        .from('diagnoses')
        .select('matched_disease_code')
        .in('id', diagnosisIds)
        .not('matched_disease_code', 'is', null);

      if (diagnoses && diagnoses.length > 0) {
        // Count occurrences of each disease code
        const codeCounts: Record<string, number> = {};
        for (const d of diagnoses) {
          if (d.matched_disease_code) {
            codeCounts[d.matched_disease_code] =
              (codeCounts[d.matched_disease_code] ?? 0) + 1;
          }
        }

        const topCodes = Object.entries(codeCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([code]) => code);

        if (topCodes.length > 0) {
          const { data: diseases } = await supabase
            .from('disease_library')
            .select('disease_code, name_translations')
            .in('disease_code', topCodes);

          const diseaseNameMap = Object.fromEntries(
            (diseases ?? []).map((d) => {
              const translations = d.name_translations as Record<string, string>;
              return [d.disease_code, translations['en'] ?? d.disease_code];
            })
          );

          top_diseases = topCodes.map((code) => ({
            disease_name: diseaseNameMap[code] ?? code,
            count: codeCounts[code],
          }));
        }
      }
    }

    return {
      diagnoses_matched,
      contacts_received: contacts_received ?? 0,
      top_diseases,
    };
  }
}

export const productsService = new ProductsService();
