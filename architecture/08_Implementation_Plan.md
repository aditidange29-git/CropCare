# 08 — Implementation Plan

**Depends on:** All prior documents (`01`–`07`). This plan is the execution sequence — it does not introduce new decisions, only orders the ones already documented.
**Rule:** Before starting any milestone below, re-read the referenced documents for that milestone. If something needed isn't documented, stop and document it first (per `00_README.md` governance rule).

---

## Milestone 1 — Foundations & Demo Auth
**References:** `02_TRD.md` (stack setup), `05_Database.md` (§2.1–2.3 users/dealers/admins), `06_API_Design.md` §1 (auth endpoints), `07_Architecture.md` §2.5 (AuthService isolation)

**Tasks:**
- Create Supabase project (free tier) → run the SQL from `05_Database.md §4` to create `users`, `dealers`, `admins`, `languages` tables.
- Scaffold `frontend/` (Vite + React + Capacitor) and `backend/` (Express) per the folder structure in `07_Architecture.md` §3.
- Run `npx cap add android` immediately — do not defer native integration.
- Configure Supabase client in backend (`src/config/supabase.ts`) using env vars from `.env`.
- Implement `AuthService` (demo phone+name login, dealer/admin email+password) exactly per `06_API_Design.md` §1.
- Build Splash → Language Select → Demo Login → Home shell screens per `04_UI_UX_Spec.md` §3.1–3.4.

**Deliverable:** Installable Android debug build where a farmer can complete demo login and land on an empty Home screen; backend deployed to Render free tier.

**Best Practices:** Lock the response envelope (`06_API_Design.md` header) from day one. Verify the native Android build works before building more screens. Use Capacitor Preferences (not localStorage) for JWT storage.
**Common Mistakes:** Using `localStorage` instead of Capacitor Preferences (see `07_Architecture.md` §4). Skipping the pending-approval gate for dealers.

---

## Milestone 2 — Core Diagnosis Flow
**References:** `05_Database.md` §2.4–2.5 (disease_library, diagnoses), `06_API_Design.md` §3, `07_Architecture.md` §2.3 & §5 (steps 1–2)

**Tasks:**
- Seed `disease_library` with 10–15 entries across 2–3 crops (real data, not placeholders).
- Build `ai/gemini.client.ts` with the structured-JSON prompt constrained to `disease_code` taxonomy.
- Implement `POST /diagnoses` exactly per `06_API_Design.md` §3.
- Build Camera → Diagnosis Loading → Diagnosis Result screens per `04_UI_UX_Spec.md` §3.5–3.7, including the low-confidence state.

**Deliverable:** Farmer can capture/upload a real image and get a genuine AI diagnosis with localized treatment advice.

**Best Practices:** Test the Gemini prompt against a fixed set of real crop images before trusting it in-app. Always persist `gemini_raw_response`.
**Common Mistakes:** Sending uncompressed images (wastes free-tier Gemini quota and bandwidth). Showing raw Gemini text to the farmer instead of routing through `disease_library`.

---

## Milestone 3 — Dealers & Recommendations
**References:** `05_Database.md` §2.6–2.8, `06_API_Design.md` §4–7, `07_Architecture.md` §5 (full ranking algorithm)

**Tasks:**
- Dealer signup + admin approval flow.
- Product catalog CRUD (`06_API_Design.md` §6).
- Implement the Recommendation Engine ranking exactly as specified in `07_Architecture.md` §5.
- Build Recommendations screen + Contact Dealer deep links per `04_UI_UX_Spec.md` §3.8.

**Deliverable:** Full farmer journey works end-to-end: scan → diagnosis → recommended products → contact dealer. Dealer Dashboard (Catalog + Leads) functional.

**Best Practices:** Seed 3–5 realistic demo dealers with real product data before demoing.
**Common Mistakes:** Building ML-based ranking (explicitly out of scope). Showing products before treatment advice (violates `01_PRD.md` §8 product principle).

---

## Milestone 4 — History, Admin Console, Polish
**References:** `04_UI_UX_Spec.md` §3.9–3.12, `07_Architecture.md` §4 (offline strategy), `06_API_Design.md` §8

**Tasks:**
- History screen with offline caching.
- Admin Console (dealer approval, Disease Library CRUD, analytics overview).
- Settings screen.
- Error/empty/offline states across every screen per `04_UI_UX_Spec.md` §1 principle 4.
- App icon, splash branding, Android back-button behavior audit per screen.

**Deliverable:** Feature-complete demo build.

**Best Practices:** Test explicitly on a real low/mid-range Android device, not just an emulator.
**Common Mistakes:** Leaving back-button behavior to default until this late stage — should have been defined per-screen from Milestone 1 onward.

---

## Milestone 5 — Demo Hardening & Stakeholder Pilot
**References:** `01_PRD.md` §7 (success criteria), `02_TRD.md` §4 (documented free-tier limits)

**Tasks:**
- Recruit a small pilot group (5–10 real or simulated farmer users) and a few demo dealers.
- Fix crash reports and confidence-tuning issues found during pilot.
- Verify the app still functions entirely on $0 infrastructure at pilot scale.
- Prepare a signed build for side-loaded distribution.

**Deliverable:** Demo-ready app validated with real users, entirely on free infrastructure, with a documented list of what's deferred (OTP auth, payments, push notifications, ML ranking) and exactly where each would be added later.

**Best Practices:** Treat pilot feedback as input to `01_PRD.md` updates, not just a bug list.
**Common Mistakes:** Quietly building "just one more feature" outside what's documented — breaks the documentation-first workflow.

---

## How This Plan Stays Synchronized With Code

- Every PR/commit that changes scope, a screen, a table, or an endpoint must update the corresponding doc (`01`–`07`) in the same change, not after.
- Kiro (or any AI coding agent) should be pointed at the `/architecture` directory at the start of every new spec/session and asked to confirm its plan against these documents before generating code.
- If code and docs ever diverge, treat it as a bug — fix by updating whichever is wrong, but never let the divergence persist silently.
