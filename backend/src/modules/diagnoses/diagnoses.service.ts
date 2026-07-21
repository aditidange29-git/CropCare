// Diagnoses service — orchestrates the core scan flow.
//
// Full pipeline per architecture/06_API_Design.md §3 and 07_Architecture.md §5:
//   1. Rate-limit check  (daily cap from config)
//   2. Gemini Vision call  (mock when key is a placeholder)
//   3. Confidence label derivation
//   4. Disease Library lookup
//   5. DB row insert
//   6. Recommendation generation (async, non-blocking)
//   7. Return shaped response
//
// All DB work uses @supabase/supabase-js — no ORM (05_Database.md §3).

import { supabase } from '../../config/supabase.js';
import { analyzeImage, analyzeImageMock } from '../../ai/gemini.client.js';
import { config } from '../../config/env.js';
import { recommendationsService } from '../recommendations/recommendations.service.js';

const CONFIDENCE_THRESHOLD = 0.6;

export class DiagnosesService {
  /**
   * Full diagnosis creation pipeline:
   *   upload already done by caller → AI analysis → DB save → recommendations trigger.
   *
   * @param params.imageUrl   Supabase Storage public URL (uploaded by the router before calling this)
   * @param params.imageBuffer  Raw bytes forwarded to Gemini
   * @param params.mimeType   'image/jpeg' | 'image/png'
   */
  async createDiagnosis(params: {
    userId: string;
    imageBuffer: Buffer;
    mimeType: 'image/jpeg' | 'image/png';
    imageUrl: string;
    locationLat?: number;
    locationLng?: number;
  }) {
    // ── 1. Daily rate-limit check ───────────────────────────────────────────
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count, error: countError } = await supabase
      .from('diagnoses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', params.userId)
      .gte('created_at', todayStart.toISOString());

    if (countError) {
      throw Object.assign(new Error('Could not check rate limit.'), {
        statusCode: 500,
        code: 'INTERNAL_ERROR',
      });
    }

    if ((count ?? 0) >= config.dailyDiagnosisLimitPerUser) {
      throw Object.assign(
        new Error(`Daily diagnosis limit of ${config.dailyDiagnosisLimitPerUser} reached.`),
        { statusCode: 429, code: 'RATE_LIMITED' }
      );
    }

    // ── 2. Call Gemini (or mock when key is a placeholder) ──────────────────
    // Only use real Gemini when key is the standard AIzaSy... format
    const useMock = !config.geminiApiKey.startsWith('AIzaSy');

    const aiResult = useMock
      ? await analyzeImageMock()
      : await analyzeImage(params.imageBuffer, params.mimeType);

    // ── 3. Derive confidence label ──────────────────────────────────────────
    const confidenceLabel = this.getConfidenceLabel(aiResult.confidence_score);

    // ── 4. Look up Disease Library (only when confidence is sufficient) ─────
    let diseaseRow: {
      id: string;
      disease_code: string;
      crop_type: string;
      name_translations: Record<string, string>;
      symptoms: unknown;
      causes: string;
      treatment_protocol: Record<string, string[]>;
    } | null = null;

    const hasConfidentMatch =
      aiResult.confidence_score >= CONFIDENCE_THRESHOLD &&
      aiResult.disease_code !== 'unknown';

    if (hasConfidentMatch) {
      const { data } = await supabase
        .from('disease_library')
        .select('id, disease_code, crop_type, name_translations, symptoms, causes, treatment_protocol')
        .eq('disease_code', aiResult.disease_code)
        .single();

      diseaseRow = data ?? null;
    }

    // ── 5. Save diagnosis row ───────────────────────────────────────────────
    const diagnosisStatus = hasConfidentMatch && diseaseRow
      ? 'auto_confirmed'
      : 'needs_review';

    const { data: savedDiagnosis, error: insertError } = await supabase
      .from('diagnoses')
      .insert({
        user_id: params.userId,
        image_url: params.imageUrl,
        gemini_raw_response: aiResult.raw_response,
        matched_disease_code: hasConfidentMatch && diseaseRow
          ? aiResult.disease_code
          : null,
        confidence_score: aiResult.confidence_score,
        confidence_label: confidenceLabel,
        status: diagnosisStatus,
        location_lat: params.locationLat ?? null,
        location_lng: params.locationLng ?? null,
      })
      .select('*')
      .single();

    if (insertError || !savedDiagnosis) {
      throw Object.assign(new Error('Failed to save diagnosis.'), {
        statusCode: 500,
        code: 'INTERNAL_ERROR',
      });
    }

    // ── 6. Generate recommendations synchronously (so they exist on first load) ──
    if (hasConfidentMatch && diseaseRow) {
      try {
        await Promise.race([
          recommendationsService.generateAndSave(
            savedDiagnosis.id,
            aiResult.disease_code,
            params.locationLat,
            params.locationLng
          ),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
        ]);
      } catch (err) {
        // Non-fatal — diagnosis is still returned even if recommendations fail
        console.error('[DiagnosesService] Recommendation generation failed:', err);
      }
    }

    // ── 7. Shape and return ─────────────────────────────────────────────────
    return this.formatDiagnosisResponse(savedDiagnosis, diseaseRow);
  }

  /**
   * Paginated list of diagnoses for the authenticated farmer.
   * Joins disease_library to provide a human-readable disease name.
   */
  async getDiagnoses(userId: string, page = 1, limit = 20) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('diagnoses')
      .select(
        `id,
         matched_disease_code,
         confidence_label,
         status,
         image_url,
         created_at,
         disease_library!diagnoses_matched_disease_code_fkey(name_translations)`,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw Object.assign(new Error('Failed to fetch diagnoses.'), {
        statusCode: 500,
        code: 'INTERNAL_ERROR',
      });
    }

    const items = (data ?? []).map((row: any) => ({
      id: row.id,
      disease_name:
        row.disease_library?.name_translations?.en ??
        row.matched_disease_code ??
        'Unknown',
      confidence_label: row.confidence_label,
      status: row.status,
      thumbnail_url: row.image_url,
      created_at: row.created_at,
    }));

    return { items, page, total: count ?? 0 };
  }

  /**
   * Full detail for a single diagnosis including recommendations array.
   * Ownership check: the diagnosis must belong to the requesting user.
   */
  async getDiagnosisById(diagnosisId: string, userId: string) {
    const { data: diagnosis, error } = await supabase
      .from('diagnoses')
      .select(
        `*,
         disease_library!diagnoses_matched_disease_code_fkey(
           id, disease_code, crop_type, name_translations,
           symptoms, causes, treatment_protocol
         )`
      )
      .eq('id', diagnosisId)
      .eq('user_id', userId)
      .single();

    if (error || !diagnosis) {
      throw Object.assign(new Error('Diagnosis not found.'), {
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    }

    // Fetch associated recommendations
    const { data: recs } = await supabase
      .from('recommendations')
      .select(
        `rank,
         products(
           id, name, category, stock_status, image_url,
           dealers(id, shop_name, phone_number, whatsapp_number, location_lat, location_lng)
         )`
      )
      .eq('diagnosis_id', diagnosisId)
      .order('rank', { ascending: true });

    const diseaseRow = (diagnosis as any).disease_library ?? null;
    const formatted = this.formatDiagnosisResponse(diagnosis, diseaseRow);

    return {
      ...formatted,
      recommendations: (recs ?? []).map((r: any) => ({
        product_id: r.products?.id,
        name: r.products?.name,
        dealer: {
          id: r.products?.dealers?.id,
          shop_name: r.products?.dealers?.shop_name,
          phone_number: r.products?.dealers?.phone_number,
          whatsapp_number: r.products?.dealers?.whatsapp_number,
        },
        stock_status: r.products?.stock_status,
        rank: r.rank,
      })),
    };
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private getConfidenceLabel(score: number): 'high' | 'medium' | 'low' {
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    return 'low';
  }

  /**
   * Shapes a saved diagnosis row + optional disease library row into the
   * response envelope format defined in 06_API_Design.md §3.
   */
  private formatDiagnosisResponse(
    diagnosis: Record<string, any>,
    diseaseRow: Record<string, any> | null
  ) {
    const nameTranslations: Record<string, string> =
      diseaseRow?.name_translations ?? {};
    const treatmentProtocol: { organic?: string[]; chemical?: string[] } =
      diseaseRow?.treatment_protocol ?? {};

    return {
      diagnosis_id: diagnosis.id,
      disease: {
        code: diagnosis.matched_disease_code ?? 'unknown',
        name: nameTranslations.en ?? diagnosis.matched_disease_code ?? 'Unknown',
        confidence_label: diagnosis.confidence_label,
      },
      explanation:
        diseaseRow
          ? `${nameTranslations.en ?? diagnosis.matched_disease_code}: ${diseaseRow.causes ?? ''}`
          : 'Disease could not be identified with sufficient confidence.',
      treatment: {
        organic: treatmentProtocol.organic ?? [],
        chemical: treatmentProtocol.chemical ?? [],
      },
      status: diagnosis.status,
    };
  }
}

export const diagnosesService = new DiagnosesService();
