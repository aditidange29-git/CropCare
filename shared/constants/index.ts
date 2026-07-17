// cropcare-shared/constants
//
// Stable, app-wide constants used by both frontend and backend.
// Rule: if a value appears in more than one place, it belongs here.
// See architecture/07_Architecture.md §3 (shared/ folder purpose).

// ── Language codes ────────────────────────────────────────────────────────────
// Must match the `code` values seeded into the `languages` table.
// See architecture/05_Database.md §2.9

export const LANGUAGE_CODES = {
  ENGLISH: 'en',
  HINDI: 'hi',
  MARATHI: 'mr',
} as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[keyof typeof LANGUAGE_CODES];

export const DEFAULT_LANGUAGE: LanguageCode = LANGUAGE_CODES.ENGLISH;

// ── User roles ────────────────────────────────────────────────────────────────
// Values embedded in JWTs — see shared/types JwtPayload.role
export const USER_ROLES = {
  FARMER: 'farmer',
  DEALER: 'dealer',
  ADMIN: 'admin',
} as const;

// ── Diagnosis confidence thresholds ──────────────────────────────────────────
// See architecture/07_Architecture.md §5 (Recommendation Engine step 1)
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,    // >= 0.8 → label: 'high'
  MEDIUM: 0.6,  // >= 0.6 → label: 'medium'
  // < 0.6 → label: 'low', status: 'needs_review'
  NEEDS_REVIEW: 0.6,
} as const;

// ── API ───────────────────────────────────────────────────────────────────────
export const API_BASE_PATH = '/api/v1';

// ── Image upload limits ───────────────────────────────────────────────────────
// See architecture/06_API_Design.md §3 and architecture/07_Architecture.md §6
export const IMAGE_LIMITS = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png'] as const,
} as const;

// ── Dealer status ─────────────────────────────────────────────────────────────
export const DEALER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  SUSPENDED: 'suspended',
} as const;

// ── Stock status ──────────────────────────────────────────────────────────────
export const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  LOW: 'low',
  OUT_OF_STOCK: 'out_of_stock',
} as const;

// ── Contact channels ──────────────────────────────────────────────────────────
export const CONTACT_CHANNELS = {
  CALL: 'call',
  WHATSAPP: 'whatsapp',
} as const;

// ── Analytics event types ─────────────────────────────────────────────────────
export const ANALYTICS_EVENTS = {
  SCAN_STARTED: 'scan_started',
  SCAN_COMPLETED: 'scan_completed',
  SCAN_FAILED: 'scan_failed',
  DEALER_CONTACTED: 'dealer_contacted',
  LANGUAGE_CHANGED: 'language_changed',
  DEALER_REGISTERED: 'dealer_registered',
} as const;

// ── Recommendation engine weights ────────────────────────────────────────────
// See architecture/07_Architecture.md §5 step 3
export const RECOMMENDATION_WEIGHTS = {
  PROXIMITY: 0.5,
  STOCK_AVAILABILITY: 0.3,
  DEALER_RELIABILITY: 0.2,
  DEFAULT_DEALER_RELIABILITY_SCORE: 0.5,
} as const;
