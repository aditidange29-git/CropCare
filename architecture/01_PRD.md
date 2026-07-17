# 01 — Product Requirements Document (PRD)
### CropCare — AI-Powered Crop Disease Detection Mobile App

**Status:** Source of Truth — Draft v1.0
**Owner:** Product
**Read this first.** Every other document in `/architecture` derives its scope from this file. If a technical decision conflicts with something written here, this document wins until it is explicitly updated.

---

## 1. Product Vision

To become the trusted AI companion in every farmer's pocket — one that diagnoses crop diseases in seconds, speaks the farmer's own language, and quietly connects the farm to the right dealer and the right product, without ever feeling like an advertisement.

## 2. Problem Statement

| Stakeholder | Problem |
|---|---|
| Farmer | Cannot quickly or accurately identify crop disease. Relies on delayed or biased advice from local shopkeepers. Language/literacy are barriers to generic AI tools. |
| Dealer | No trusted digital channel to reach farmers with genuinely useful, timely, non-spammy advice. |
| Agro Company | No authentic, disease-linked visibility for products at the farmer's actual point of need. |
| Platform | No lightweight, vernacular-language, AI-first product that solves diagnosis first and monetizes responsibly through dealer commerce second. |

**One-line problem:** There is no trusted, vernacular-language, AI-first channel that takes a farmer from "something is wrong with my crop" to "here's what to do and where to get it" in under two minutes.

## 3. Goals for This Phase (Demo / MVP)

This phase is explicitly a **demo-grade build** meant to prove the core experience end-to-end, using a **$0-cost tech stack** (see `02_TRD.md`) and a **simplified, non-production authentication flow** (see below). Production-hardening (real OTP, payments, scaling infra) is intentionally deferred and called out wherever relevant.

**In scope for this phase:**
- Full farmer journey: language select → capture/upload image → AI diagnosis → treatment advice → recommended products → contact dealer.
- Full dealer journey: signup → (manual/admin) approval → manage product catalog → view leads.
- Full admin journey: approve dealers, manage the Disease Library, manage products-to-disease mapping.
- Android APK built via Capacitor, side-loadable for demo purposes (Play Store submission is a later milestone).

**Out of scope for this phase (explicitly deferred):**
- Real OTP/SMS verification (see Section 6).
- Payments/checkout inside the app.
- Multi-region scaling infrastructure (Redis caching, CDN, queues) — documented in `07_Architecture.md` as future work only.
- In-app chat (contact is via call/WhatsApp deep link only for demo).
- iOS build.

## 4. Target Users

### 4.1 Farmers (Primary)
Rural/semi-urban, variable literacy, budget Android phone, unstable internet, prefers regional language, minimal typing.

### 4.2 Dealers (Supply-side)
Local fertilizer/pesticide shop owners or agro-company reps. Wants leads and a simple dashboard, not a CRM.

### 4.3 Admin (Platform Owner)
Curates the Disease Library (ground truth), approves dealers, monitors platform health.

## 5. User Journeys (summary — full detail in `03_App_Flow.md`)

**Farmer:** Open app → select language → capture/upload crop image → AI diagnosis → treatment suggestions → recommended products (framed as help, not ads) → contact dealer → diagnosis saved to history.

**Dealer:** Sign up → wait for admin approval → manage product catalog → view leads (farmers matched to their products) → respond via call/WhatsApp.

**Admin:** Approve/reject dealers → curate Disease Library entries → manage product-disease mappings → review flagged/low-confidence diagnoses.

## 6. Authentication Requirement for This Phase (Important)

Per product decision: **no OTP/SMS verification in this phase.** Authentication for the demo is simplified to:
- Farmer enters **phone number + name** → account created/logged in immediately, no verification step, backend issues a JWT directly.
- Dealer/Admin: simple **email + password** login (no third-party auth provider required — passwords hashed and stored in Supabase Postgres).

This is explicitly a **placeholder auth strategy**, not a security decision — it exists so the team can build and demo the full product loop without needing a paid SMS provider. `02_TRD.md` and `07_Architecture.md` both document the exact seam where Firebase Auth (or another OTP provider) can be swapped in later without touching business logic, because auth is isolated behind a single backend `AuthService` module (see `07_Architecture.md` §6.6).

## 7. Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | Farmer can select a display language on first launch; preference persists locally. |
| FR-2 | Farmer can capture a photo via camera or upload from gallery. |
| FR-3 | System returns an AI-generated disease diagnosis with a confidence score. |
| FR-4 | System returns treatment suggestions (organic and chemical) sourced from a curated Disease Library, not raw AI text. |
| FR-5 | System returns a ranked list of relevant products from nearby approved dealers, tied to the diagnosed disease. |
| FR-6 | Farmer can contact a dealer via phone call or WhatsApp deep link directly from the recommendation screen. |
| FR-7 | Farmer can view a history of past diagnoses, available offline. |
| FR-8 | Dealer can register, and must be approved by an admin before appearing in recommendations. |
| FR-9 | Dealer can add/edit products and mark stock status. |
| FR-10 | Dealer can view a list of leads (diagnoses their products were matched to). |
| FR-11 | Admin can approve/reject dealers. |
| FR-12 | Admin can create/edit Disease Library entries (name, symptoms, treatment, translations). |
| FR-13 | Admin can view basic platform analytics (diagnoses count, top diseases, dealer activity). |

## 8. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | Entire tech stack must run on free tiers only during this phase (see `02_TRD.md` for exceptions). |
| NFR-2 | App must be usable on a low/mid-range Android device with intermittent connectivity. |
| NFR-3 | Diagnosis round-trip (image upload → result shown) should complete in under ~8 seconds on a typical 4G connection. |
| NFR-4 | UI text must support at least 2 languages at demo stage (English + one regional language), structured to scale to more. |
| NFR-5 | All farmer-facing diagnosis content must originate from the curated Disease Library, not unfiltered AI output (trust requirement). |
| NFR-6 | The app must never feel like it is advertising — product recommendations always follow free diagnostic advice, never replace it. |

## 9. Success Metrics (Demo Phase)

- A user can complete the full farmer journey (scan → diagnosis → recommendation → contact) without errors on a real Android device.
- At least 10–15 seeded Disease Library entries covering 2–3 crops.
- At least 3–5 seeded demo dealers with products mapped to those diseases.
- Positive qualitative feedback from a small pilot group (5–10 real or simulated farmer users).

## 10. Assumptions & Constraints

- No budget for paid APIs, hosting, or SMS services during this phase.
- Single developer / small-team build, beginner-friendly tooling preferred (Kiro-assisted vibe coding).
- Android is the only target platform for this phase.
- Google Play Console's one-time $25 registration fee is the **only** unavoidable cost in the entire roadmap, and only applies at final public store launch — not required for demo/side-loaded testing (flagged explicitly in `02_TRD.md`).

## 11. Document Map

| Doc | Purpose |
|---|---|
| `02_TRD.md` | Exact free-tier tech stack and justification |
| `03_App_Flow.md` | Screen-by-screen and role-by-role flow diagrams |
| `04_UI_UX_Spec.md` | Visual design system, screen specs, components |
| `05_Database.md` | Full schema |
| `06_API_Design.md` | REST API contracts |
| `07_Architecture.md` | System architecture, layers, deployment |
| `08_Implementation_Plan.md` | Milestone-by-milestone build plan referencing all of the above |
