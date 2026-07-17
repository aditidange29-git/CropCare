# CropCare — AI-Powered Crop Disease Detection

This is a documentation-first boilerplate. **Nothing here is finished code** — it's the folder skeleton and config stubs that match the architecture described in `/architecture`.

## Start Here

1. Read `/architecture/00_README.md` first — it explains the governance rule: **documentation is the source of truth**, and every doc must be read before code is generated or changed.
2. Read `/architecture/01_PRD.md` through `/architecture/08_Implementation_Plan.md` in order.
3. If you're using **Kiro**, point it at this repo and specifically at `/architecture` before asking it to scaffold or generate any feature. Kiro should build its specs from `08_Implementation_Plan.md`, Milestone 1 first.

## Structure

```
cropcare/
├── architecture/   ← source of truth docs, read first
├── frontend/        ← React + Vite + Capacitor (Android target)
├── backend/          ← Node.js + Express API
└── shared/              ← TypeScript types/constants/validation shared by both
```

## Tech Stack (100% free tier — see architecture/02_TRD.md for full detail)

- **Frontend:** React (Vite) + Capacitor (Android APK)
- **Backend:** Node.js + Express, hosted free on Render
- **Database + Storage:** Supabase (Postgres + Storage, free tier)
- **AI:** Google Gemini Vision API (free tier via Google AI Studio)
- **Auth (this phase):** Simplified demo auth — no OTP yet. See `architecture/01_PRD.md §6` and `architecture/07_Architecture.md §2.5` for the upgrade seam to Firebase Auth later.

## Setup

```bash
# Install all workspaces from root
npm install

# Frontend dev server
npm run dev:frontend

# Backend dev server
npm run dev:backend

# Add Android platform (one-time, run from frontend/)
cd frontend && npx cap add android

# Sync after every frontend build
cd frontend && npx cap sync android
```

Copy `.env.example` → `.env` in both `frontend/` and `backend/` and fill in your own free-tier Supabase and Gemini API credentials — **never commit `.env`**.

## Rule for Any Contributor (Human or AI Agent)

Before writing code: check `/architecture`. If what you're about to build isn't described there, document it first, then build it. See `/architecture/00_README.md` for the full governance policy.
