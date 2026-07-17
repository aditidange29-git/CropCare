// CropCare Backend — Entry Point
//
// Read before modifying:
//   architecture/07_Architecture.md  — layers, folder structure, module boundaries
//   architecture/06_API_Design.md    — every route this server must expose
//   architecture/05_Database.md      — the schema every module reads/writes
//
// Responsibilities:
//   1. Load and validate env config (src/config/env.ts) — must be first
//   2. Initialize Express app
//   3. Apply shared middleware (CORS, JSON body parser, response envelope)
//   4. Mount module routers from src/modules/*
//   5. Apply global error handler from src/common/
//   6. Start listening on config.port

import './config/env.ts'; // load + validate env vars first
import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check (useful for Render's free tier — keeps it from sleeping) ─────
app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', app: 'CropCare API' }, error: null });
});

// ── Module routers ────────────────────────────────────────────────────────────
// Each module will be imported and mounted here as it's built in Milestones 1–4.
// Example (add as you build each module):
//   import authRouter from './modules/auth/auth.router.js';
//   app.use('/api/v1/auth', authRouter);
//
// Per architecture/06_API_Design.md — base path is /api/v1

// ── Global error handler ──────────────────────────────────────────────────────
// Catches any unhandled errors and returns the standard response envelope.
// See architecture/06_API_Design.md for envelope format.
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[CropCare API Error]', err);
  res.status(500).json({
    success: false,
    data: null,
    error: {
      code: 'INTERNAL_ERROR',
      message: config.nodeEnv === 'development' ? err.message : 'An unexpected error occurred',
    },
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`CropCare API running on port ${config.port} [${config.nodeEnv}]`);
});

export default app;
