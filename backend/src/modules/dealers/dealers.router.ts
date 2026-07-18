// Dealers router — public dealer profile endpoint.
//
// Mounted at /api/v1/dealers in main.ts.
// No authentication required — public read only (06_API_Design.md §5).
//
// Routes:
//   GET /:id → public dealer profile + their product catalog

import { Router } from 'express';
import { asyncHandler } from '../../common/asyncHandler.js';
import { sendSuccess } from '../../common/response.js';
import { dealersService } from './dealers.service.js';

const router = Router();

// GET /api/v1/dealers/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const dealer = await dealersService.getPublicProfile(req.params.id);
    sendSuccess(res, { dealer });
  })
);

export default router;
