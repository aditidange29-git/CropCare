// Disease Library service — read/write access to the `disease_library` table.
//
// This table is the admin-curated ground truth that the AI diagnosis pipeline
// maps disease_code values to (05_Database.md §2.4).
//
// Public reads are used by the frontend for dropdowns and by the diagnosis
// module at runtime. Writes are admin-only and are called from the admin module.

import { supabase } from '../../config/supabase.js';

export type DiseaseLibraryCreateInput = {
  disease_code: string;
  crop_type: string;
  name_translations: object;
  symptoms?: object;
  causes?: string;
  treatment_protocol?: object;
  reference_images?: string[];
};

export type DiseaseLibraryUpdateInput = Partial<DiseaseLibraryCreateInput>;

export class DiseaseLibraryService {
  /**
   * Returns all entries ordered by crop type then disease code.
   * Used by the frontend for disease-picker dropdowns and by the admin panel.
   */
  async getAll() {
    const { data, error } = await supabase
      .from('disease_library')
      .select('*')
      .order('crop_type')
      .order('disease_code');

    if (error) {
      throw Object.assign(new Error('Failed to fetch disease library.'), {
        statusCode: 500,
        code: 'INTERNAL_ERROR',
      });
    }

    return data ?? [];
  }

  /**
   * Fetch a single entry by its stable disease_code key.
   * Used internally by the diagnosis pipeline after Gemini maps an image
   * to a disease_code, and by the admin panel for individual record viewing.
   */
  async getByCode(diseaseCode: string) {
    const { data, error } = await supabase
      .from('disease_library')
      .select('*')
      .eq('disease_code', diseaseCode)
      .single();

    if (error || !data) {
      throw Object.assign(new Error(`Disease with code "${diseaseCode}" not found.`), {
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    }

    return data;
  }

  /**
   * Create a new disease library entry. Admin-only — enforce in the calling router.
   * Returns the newly inserted row.
   */
  async create(input: DiseaseLibraryCreateInput) {
    const { data, error } = await supabase
      .from('disease_library')
      .insert({
        disease_code: input.disease_code,
        crop_type: input.crop_type,
        name_translations: input.name_translations,
        symptoms: input.symptoms ?? null,
        causes: input.causes ?? null,
        treatment_protocol: input.treatment_protocol ?? null,
        reference_images: input.reference_images ?? null,
      })
      .select('*')
      .single();

    if (error || !data) {
      // Supabase surfaces a unique-constraint violation as code '23505'
      if (error?.code === '23505') {
        throw Object.assign(
          new Error(`A disease with code "${input.disease_code}" already exists.`),
          { statusCode: 409, code: 'CONFLICT' }
        );
      }
      throw Object.assign(new Error('Failed to create disease library entry.'), {
        statusCode: 500,
        code: 'INTERNAL_ERROR',
      });
    }

    return data;
  }

  /**
   * Partial update of a disease library entry by its UUID primary key.
   * Also bumps the updated_at timestamp. Admin-only — enforce in the calling router.
   * Returns the updated row.
   */
  async update(id: string, input: DiseaseLibraryUpdateInput) {
    const { data, error } = await supabase
      .from('disease_library')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      throw Object.assign(new Error('Failed to update disease library entry.'), {
        statusCode: 500,
        code: 'INTERNAL_ERROR',
      });
    }

    return data;
  }
}

export const diseaseLibraryService = new DiseaseLibraryService();
