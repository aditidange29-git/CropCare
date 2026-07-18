// Disease Library router — public read of the disease library.
//
// Mounted at /api/v1/disease-library in main.ts.
// Public — no auth required. Used by the frontend for dropdown population
// and by the Recommendation Engine at runtime.
//
// Admin write routes (POST, PATCH) live in modules/admin/admin.router.ts
// and call into diseaseLibraryService directly (06_API_Design.md §8).
//
// Routes:
//   GET / → all disease library entries, ordered by crop_type then disease_code

import { Router } from 'express';
import { asyncHandler } from '../../common/asyncHandler.js';
import { sendSuccess } from '../../common/response.js';
import { diseaseLibraryService } from './disease-library.service.js';

const router = Router();

// GET /api/v1/disease-library
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const diseases = await diseaseLibraryService.getAll();
    sendSuccess(res, { diseases });
  })
);

export default router;
