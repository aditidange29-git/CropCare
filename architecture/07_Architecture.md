# 07 — System Architecture

**Depends on:** `02_TRD.md`, `05_Database.md`, `06_API_Design.md`
**Purpose:** How the pieces fit together, folder structure, security, and deployment — all on the free-tier stack from `02_TRD.md`.

---

## 1. High-Level Diagram

```
Mobile App (React + Capacitor / Android APK)
  ↕ HTTPS REST/JSON
Backend API (Node.js/Express on Render Free Tier)
  ├── Gemini Vision API (Free Tier) — AI diagnosis
  ├── Supabase Postgres (Free Tier) — all relational data
  ├── Supabase Storage (Free Tier) — crop images
  ├── Demo Auth Service — JWT issued by backend (no third party)
  └── Recommendation Engine — in-process module (no separate service)
```

**Non-negotiable rule:** the mobile app never calls Gemini directly. It always goes through the backend, which holds the only copy of the Gemini API key.

## 2. Layers

### 2.1 Frontend
React + Vite, wrapped by Capacitor for the Android build. Stack-based navigation (not browser-tab thinking). State via React Context/hooks at this phase — no Redux/Zustand needed yet. Tailwind CSS for mobile-native-feeling UI.

### 2.2 Backend
Node.js + Express. Layered pattern: **Controller → Service → Repository**, so business logic (recommendation ranking, disease matching) never mixes with HTTP handling or raw Supabase queries. Deployed on Render's free Web Service tier.

### 2.3 AI Layer
Gemini Vision API call happens only inside a single isolated module (`ai/gemini.client.ts`), never scattered across controllers. Prompt is engineered to return structured JSON constrained to the `disease_library.disease_code` taxonomy. **Gemini identifies; the Disease Library explains** — Gemini's raw text is never shown directly to a farmer; it's stored (`gemini_raw_response`) and cross-referenced against `disease_library` before any user-facing text is generated.

### 2.4 Database & Storage
Supabase (Postgres) for all relational data (`05_Database.md`), Supabase Storage for crop images. The `@supabase/supabase-js` client handles both — one account, no separate ORM.

### 2.5 Authentication (Demo Phase)
A single backend module, `AuthService`, is the **only** place that knows how a user is authenticated. Right now it does: phone+name lookup/create for farmers, email+password (bcrypt) for dealers/admins, and issues a JWT in both cases. Every controller checks the JWT via a shared middleware/guard. **This isolation is deliberate**: when Firebase Auth (real OTP) is introduced later, only `AuthService` changes — routes, JWT format, and all downstream role-checking logic stay identical.

### 2.6 Recommendation Engine
An in-process backend module (not a separate service). See §5 below for the algorithm.

## 3. Folder Structure

```
frontend/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/           # Splash, LanguageSelect, DemoLogin, Home, Camera,
│   │                    # DiagnosisResult, Recommendations, History,
│   │                    # DealerDashboard, AdminConsole, Settings
│   ├── hooks/           # useAuth, useDiagnosis, useOfflineQueue, useLocation
│   ├── services/        # api.ts, diagnosisService.ts, dealerService.ts
│   ├── store/           # React Context / state
│   ├── locales/         # en.json, hi.json, mr.json
│   ├── native/          # Capacitor plugin wrappers
│   ├── utils/           # image compression, validators
│   ├── router/          # stack navigation config
│   └── App.tsx
├── index.html
├── capacitor.config.ts
└── android/             # generated via `npx cap add android`

backend/
├── src/
│   ├── modules/
│   │   ├── auth/        # AuthService — demo phone+name & email+password
│   │   ├── users/
│   │   ├── diagnoses/
│   │   ├── recommendations/
│   │   ├── dealers/
│   │   ├── products/
│   │   ├── disease-library/
│   │   ├── chats/
│   │   └── admin/
│   ├── ai/
│   │   ├── gemini.client.ts
│   │   └── prompt-templates/
│   ├── common/          # guards, middleware, error filters, response envelope
│   ├── config/          # env loader — reads Supabase URL, Gemini key, JWT secret
│   └── main.ts
└── test/

shared/
├── types/       # TypeScript interfaces matching 05_Database.md and 06_API_Design.md
├── constants/   # disease codes, language codes, roles, confidence thresholds
└── validation/  # Zod schemas reused by both frontend and backend

architecture/    # this directory — always kept in sync (see 00_README.md)
```

## 4. Offline Strategy
- Capacitor **Preferences** plugin for language setting and JWT (not `localStorage` — behaves inconsistently in native WebViews).
- History screen reads from a local cache (last N diagnoses) written after every successful `GET /diagnoses`, so it renders even fully offline.
- If a scan is attempted offline, the app queues the request locally (Capacitor Network plugin detects connectivity) and retries automatically when back online.

## 5. Recommendation Engine Algorithm

1. **Detect:** Gemini returns a structured `disease_code` + confidence. If confidence < 0.6 or the code doesn't match any `disease_library` entry, mark `status = 'needs_review'` and surface the low-confidence UI state (`04_UI_UX_Spec.md` §3.7).
2. **Match:** query `products` where `applicable_disease_codes` contains the matched `disease_code`, filtered to `dealers.status = 'approved'` and `stock_status != 'out_of_stock'`.
3. **Rank:** simple weighted score — no ML model at this phase:
   ```
   score = (0.5 × proximity_score) + (0.3 × stock_availability_score) + (0.2 × dealer_reliability_score)
   ```
   `proximity_score` from Haversine distance (no external geospatial service needed at this data volume). `dealer_reliability_score` starts as a static default (0.5 for all dealers) and can evolve later from real `chats` conversion data — documented as future work.
4. **Always show free advice regardless of match:** treatment content is rendered even when step 2 returns zero products.

## 6. Security (Demo Phase)

| Concern | This Phase | Future Work |
|---|---|---|
| Auth | Demo phone+name / email+password (§2.5) | Firebase Phone Auth OTP |
| API key protection | Gemini key lives only in backend env vars, never in the mobile bundle | unchanged at scale |
| Authorization | Backend-enforced RBAC via JWT role claim on every protected route | expand roles as needed |
| Image validation | Type allowlist (jpeg/png), size cap (5MB), server-side re-validation | add plant pre-check if abuse appears |
| Rate limiting | Per-user daily diagnosis cap (protects free-tier Gemini quota) | IP-based limiting on public auth endpoints |
| Transport | HTTPS only (Render/Supabase provide this by default on free tier) | unchanged |

## 7. Deployment (Free-Tier Flow)

```
React Source → vite build → dist/
  ├── Vercel Hobby Tier (web preview, development only)
  └── npx cap sync android → Android Studio → Signed APK → side-loaded (demo)
                                                          → Google Play (future, $25 one-time)

Backend Repo → GitHub push → Render auto-deploy (free Web Service)
Supabase (Postgres + Storage) → consumed by backend
```

Backend and database changes deploy independently of the mobile app. The app only needs a new build when its own code or the API contract changes.

## 8. Related Documents
Stack choices justified in: `02_TRD.md` · Schema referenced above: `05_Database.md` · Endpoints referenced above: `06_API_Design.md` · Build sequencing: `08_Implementation_Plan.md`
