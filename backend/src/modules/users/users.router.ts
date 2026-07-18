// Users router — farmer profile endpoints.
//
// Mounted at /api/v1/users in main.ts.
// All routes require a valid farmer JWT (authenticate middleware).
//
// Routes (06_API_Design.md §2):
//   GET  /   → GET /api/v1/users/me  — return full user row
//   PATCH /  → PATCH /api/v1/users/me — partial update of mutable fields

import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../../common/auth.middleware.js';
import { asyncHandler } from '../../common/asyncHandler.js';
import { sendSuccess, sendError } from '../../common/response.js';
import { usersService } from './users.service.js';
import type { Request } from 'express';

const router = Router();

// GET /api/v1/users/me
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res) => {
    const { sub: userId } = (req as AuthenticatedRequest).user;
    const user = await usersService.getMe(userId);
    sendSuccess(res, { user });
  })
);

// PATCH /api/v1/users/me
router.patch(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res) => {
    const { sub: userId } = (req as AuthenticatedRequest).user;
    const { name, preferred_language, location_lat, location_lng } = req.body as {
      name?: string;
      preferred_language?: string;
      location_lat?: number;
      location_lng?: number;
    };

    // Reject completely empty updates early
    const updates = { name, preferred_language, location_lat, location_lng };
    const hasUpdates = Object.values(updates).some((v) => v !== undefined);
    if (!hasUpdates) {
      sendError(res, 'VALIDATION_ERROR', 'No valid fields provided to update.', 400);
      return;
    }

    // Strip undefined keys so Supabase doesn't overwrite columns with null
    const payload = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    ) as typeof updates;

    const user = await usersService.updateMe(userId, payload);
    sendSuccess(res, { user });
  })
);

export default router;
