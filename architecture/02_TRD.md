# 02 — Technical Requirements Document (TRD)
### CropCare — Free-Tier Tech Stack Specification

**Depends on:** `01_PRD.md`
**Rule for this document:** Every service listed below must have a genuinely usable free tier (no trial period that expires, no forced credit card charge). Where a service has a free tier with limits, the limits are stated explicitly so the team knows when they'd need to upgrade — but upgrading is a future decision, not a requirement to launch this phase.

---

## 1. Stack Summary Table

| Layer | Choice | Free Tier Details | Cost Today |
|---|---|---|---|
| Frontend Framework | React (Vite) | Open source, no cost ever | $0 |
| Mobile Wrapper | Capacitor | Open source, no cost ever | $0 |
| UI Library | Tailwind CSS | Open source | $0 |
| Backend Runtime | Node.js + Express | Open source | $0 |
| Backend Hosting | Render (Free Web Service) | Render free tier: app sleeps after inactivity, wakes on request (~30s cold start) — fine for demo | $0 |
| Database | Supabase (Postgres) | Supabase free: 500MB DB, unlimited API requests on free tier | $0 |
| Image/File Storage | Supabase Storage (bundled) | Supabase Storage free: 1GB | $0 |
| AI Vision | Google Gemini API (Gemini 2.0/2.5 Flash tier) | Google AI Studio free tier: generous daily free request quota for Flash-tier models | $0 (subject to Google's published free-tier limits) |
| Auth (Demo Phase) | Custom — phone+name / email+password stored in Supabase Postgres, JWT issued by backend | No third-party service required | $0 |
| Auth (Future Phase) | Firebase Auth (OTP) — documented as future swap-in, not built now | Firebase Auth free tier covers low-volume OTP usage | $0 now, may incur SMS cost later at scale |
| Push Notifications | Firebase Cloud Messaging (FCM) | Free, no tier limits for standard push | $0 |
| Web Preview/Testing | Vercel (Hobby tier) | Free for personal/non-commercial preview deployments | $0 |
| Android Build Tooling | Android Studio + Capacitor CLI | Free | $0 |
| App Distribution (Demo) | Signed APK, side-loaded / shared via link (e.g., Google Drive) | No store account needed | $0 |
| App Distribution (Public Launch — future milestone only) | Google Play Console | One-time registration fee | **$25 one-time** (only when you choose to publish publicly — not required for this phase) |
| Version Control | GitHub (free public/private repos) | Free | $0 |
| Analytics | Firebase Analytics (free) or PostHog free tier | Free | $0 |

**Bottom line:** Everything needed to design, build, run, and demo this app costs **$0**. The single exception anywhere in this entire roadmap is the one-time $25 Google Play Console fee, and only if/when you decide to publish publicly on the Play Store.

---

## 2. Why Each Choice

### 2.1 Frontend: React + Vite
Vite gives fast local dev builds. Plain React (not Next.js) is correct here — Next.js's server-rendering features are irrelevant once the app is wrapped by Capacitor and running as a static bundle inside a native shell.

### 2.2 Capacitor
Chosen as the bridge from your React web build to a real Android APK. It packages your compiled web assets and gives you plugin access to native device features (camera, filesystem, notifications) via JavaScript APIs, without needing to write Java/Kotlin yourself.

### 2.3 Backend: Node.js + Express
Same language (TypeScript) as the frontend — reduces context-switching. Express is simple to start with while still allowing clean layered structure (Controller → Service → Repository).

### 2.4 Database: Supabase (Postgres)
Chosen because the data is inherently relational (Users↔Diagnoses↔Products↔Dealers↔Diseases), and Supabase's free tier includes a real Postgres database, auto-generated REST access, and free file storage in the same project — one account covers everything.

### 2.5 Storage: Supabase Storage
Keeps everything under one account for simplicity. The Supabase JS client (`@supabase/supabase-js`) handles both DB queries and file uploads — no Prisma or separate ORM needed.

### 2.6 AI: Gemini Vision API
Google's Gemini free tier (via Google AI Studio) supports multimodal (image) input at no cost within published daily limits, and structured JSON output, which is required for the Disease Library validation approach (see `07_Architecture.md` §5).

### 2.7 Authentication (Demo Phase — Explicit Decision)
Per product decision, OTP is **not implemented in this phase**. Instead:
- Farmer flow: submit phone number + name → backend creates/finds a user record → issues a JWT immediately. No SMS is sent, no code is verified.
- Dealer/Admin flow: standard email + password (bcrypt-hashed in Supabase Postgres) → JWT on login.

### 2.8 Hosting: Render (backend) + Vercel (web preview only)
Render's free web service tier is enough to run a Node API for demo/testing traffic. It sleeps after inactivity — acceptable for a demo. Vercel's free Hobby tier is used only to preview the React web build in a browser during development — end users always use the Android APK.

### 2.9 Notifications: Firebase Cloud Messaging
Free with no meaningful limits for standard push notification volume at this project's scale.

---

## 3. Explicit Non-Goals for This Phase

- No paid infrastructure of any kind is provisioned.
- No SMS/OTP provider is integrated.
- No payment gateway is integrated.
- No Prisma or separate ORM — the Supabase JS client is used directly for all DB operations.

## 4. Future Upgrade Path (Not Built Now — For Awareness Only)

| Concern | Free-Tier Limitation | Future Paid Upgrade |
|---|---|---|
| Backend cold starts | Render free tier sleeps after inactivity | Paid "always-on" instance tier |
| Database size | Supabase free tier caps at 500MB | Paid Supabase plan or self-hosted Postgres |
| SMS-based OTP | Not implemented (demo uses no verification) | Firebase Auth phone provider or Twilio/MSG91 |
| Gemini API volume | Free tier daily request quota | Paid Gemini API tier |
| Play Store publishing | N/A | $25 one-time Google Play Console fee |
