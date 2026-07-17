// cropcare-shared/validation
//
// Zod schemas reused by BOTH frontend (form validation) and backend
// (request body validation). Single source of truth — never duplicate.
//
// Usage:
//   import { demoLoginSchema } from 'cropcare-shared/validation';
//   const result = demoLoginSchema.safeParse(req.body);
//
// See architecture/06_API_Design.md for the API contracts these validate.

import { z } from 'zod';
import { IMAGE_LIMITS } from '../constants/index.ts';

// ── Auth schemas ──────────────────────────────────────────────────────────────

/** POST /auth/farmer/demo-login */
export const demoLoginSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone_number: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format'),
});

export type DemoLoginInput = z.infer<typeof demoLoginSchema>;

/** POST /auth/dealer/register */
export const dealerRegisterSchema = z.object({
  shop_name: z.string().min(1).max(200),
  owner_name: z.string().min(1).max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128),
  phone_number: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),
  location_lat: z.number().min(-90).max(90),
  location_lng: z.number().min(-180).max(180),
  address: z.string().min(1).max(500),
});

export type DealerRegisterInput = z.infer<typeof dealerRegisterSchema>;

/** POST /auth/dealer/login and POST /auth/admin/login */
export const emailLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type EmailLoginInput = z.infer<typeof emailLoginSchema>;

// ── User schemas ──────────────────────────────────────────────────────────────

/** PATCH /users/me */
export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  preferred_language: z.string().length(2).optional(),
  location_lat: z.number().min(-90).max(90).optional(),
  location_lng: z.number().min(-180).max(180).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ── Product schemas ───────────────────────────────────────────────────────────

/** POST /dealer/products */
export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  applicable_disease_codes: z.array(z.string()).min(1, 'At least one disease code required'),
  stock_status: z.enum(['in_stock', 'low', 'out_of_stock']),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

/** PATCH /dealer/products/:id */
export const updateProductSchema = createProductSchema.partial();

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ── Disease library schemas ───────────────────────────────────────────────────

/** POST /admin/disease-library */
export const createDiseaseSchema = z.object({
  disease_code: z
    .string()
    .min(1)
    .regex(/^[a-z0-9_]+$/, 'disease_code must be lowercase letters, numbers, and underscores only'),
  crop_type: z.string().min(1).max(100),
  name_translations: z.record(z.string(), z.string()),
  symptoms: z.record(z.string(), z.array(z.string())).optional(),
  causes: z.string().optional(),
  treatment_protocol: z
    .object({
      organic: z.array(z.string()),
      chemical: z.array(z.string()),
    })
    .optional(),
  reference_images: z.array(z.string().url()).optional(),
});

export type CreateDiseaseInput = z.infer<typeof createDiseaseSchema>;

// ── Contact / chat schemas ────────────────────────────────────────────────────

/** POST /chats */
export const createChatSchema = z.object({
  diagnosis_id: z.string().uuid(),
  dealer_id: z.string().uuid(),
  channel: z.enum(['call', 'whatsapp']),
});

export type CreateChatInput = z.infer<typeof createChatSchema>;

// ── Image validation (client-side pre-check) ──────────────────────────────────
// Backend always re-validates server-side too.
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!IMAGE_LIMITS.ALLOWED_TYPES.includes(file.type as (typeof IMAGE_LIMITS.ALLOWED_TYPES)[number])) {
    return { valid: false, error: 'Only JPEG and PNG images are supported.' };
  }
  if (file.size > IMAGE_LIMITS.MAX_SIZE_BYTES) {
    return { valid: false, error: 'Image must be smaller than 5MB.' };
  }
  return { valid: true };
}
