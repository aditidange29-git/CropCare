// cropcare-shared/types
//
// TypeScript interfaces that mirror architecture/05_Database.md tables and
// architecture/06_API_Design.md response shapes.
// These are used by BOTH frontend and backend — never duplicate them.
//
// Rule: if 05_Database.md changes, update this file first.

// ── Database row types ────────────────────────────────────────────────────────

export interface UserRow {
  id: string;
  name: string;
  phone_number: string;
  preferred_language: string | null;
  location_lat: number | null;
  location_lng: number | null;
  district: string | null;
  state: string | null;
  created_at: string;
}

export interface DealerRow {
  id: string;
  shop_name: string;
  owner_name: string;
  email: string;
  password_hash: string;
  phone_number: string;
  whatsapp_number: string | null;
  location_lat: number;
  location_lng: number;
  address: string;
  status: DealerStatus;
  created_at: string;
}

export type DealerStatus = 'pending' | 'approved' | 'suspended';

export interface AdminRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface DiseaseLibraryRow {
  id: string;
  disease_code: string;
  crop_type: string;
  name_translations: Record<string, string>; // { en: '...', hi: '...', mr: '...' }
  symptoms: Record<string, string[]> | null;  // localized
  causes: string | null;
  treatment_protocol: TreatmentProtocol | null;
  reference_images: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface TreatmentProtocol {
  organic: string[];
  chemical: string[];
}

export interface DiagnosisRow {
  id: string;
  user_id: string;
  image_url: string;
  gemini_raw_response: unknown | null;
  matched_disease_code: string | null;
  confidence_score: number | null;
  confidence_label: ConfidenceLabel | null;
  status: DiagnosisStatus;
  location_lat: number | null;
  location_lng: number | null;
  created_at: string;
}

export type ConfidenceLabel = 'high' | 'medium' | 'low';
export type DiagnosisStatus = 'auto_confirmed' | 'needs_review';

export interface ProductRow {
  id: string;
  dealer_id: string;
  name: string;
  category: string;
  applicable_disease_codes: string[];
  stock_status: StockStatus;
  image_url: string | null;
  created_at: string;
}

export type StockStatus = 'in_stock' | 'low' | 'out_of_stock';

export interface RecommendationRow {
  id: string;
  diagnosis_id: string;
  product_id: string;
  rank: number;
  shown_at: string;
}

export interface ChatRow {
  id: string;
  diagnosis_id: string;
  user_id: string;
  dealer_id: string;
  channel: ContactChannel;
  created_at: string;
}

export type ContactChannel = 'call' | 'whatsapp';

export interface LanguageRow {
  code: string;
  label: string;
  is_active: boolean;
}

export interface AnalyticsEventRow {
  id: string;
  user_id: string | null;
  event_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ── API response/request shapes ───────────────────────────────────────────────
// Mirrors architecture/06_API_Design.md

/** Standard response envelope — every endpoint returns this shape */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
}

/** JWT payload — what's encoded inside the token */
export interface JwtPayload {
  sub: string;        // user/dealer/admin id
  role: UserRole;
  iat?: number;
  exp?: number;
}

export type UserRole = 'farmer' | 'dealer' | 'admin';

/** POST /auth/farmer/demo-login response */
export interface DemoLoginResponse {
  token: string;
  user: Pick<UserRow, 'id' | 'name'> & { is_new_user: boolean };
}

/** POST /diagnoses response */
export interface DiagnosisResponse {
  diagnosis_id: string;
  disease: {
    code: string;
    name: string;
    confidence_label: ConfidenceLabel;
  };
  explanation: string;
  treatment: TreatmentProtocol;
  status: DiagnosisStatus;
}

/** GET /diagnoses/:id/recommendations response item */
export interface RecommendationItem {
  product_id: string;
  name: string;
  dealer: {
    id: string;
    shop_name: string;
    phone_number: string;
    whatsapp_number: string | null;
  };
  distance_km: number;
  stock_status: StockStatus;
  rank: number;
}
