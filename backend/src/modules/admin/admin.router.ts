// Admin router — all routes require admin JWT
import { Router } from 'express';
import type { Request } from 'express';
import { authenticate } from '../../common/auth.middleware.js';
import { requireRole } from '../../common/roles.middleware.js';
import { asyncHandler } from '../../common/asyncHandler.js';
import { sendSuccess } from '../../common/response.js';
import { adminService } from './admin.service.js';

const router = Router();
router.use(authenticate, requireRole('admin'));

router.get('/dealers', asyncHandler(async (req: Request, res) => {
  sendSuccess(res, { dealers: await adminService.getDealers(req.query.status as string | undefined) });
}));
router.patch('/dealers/:id/approve', asyncHandler(async (req: Request, res) => {
  sendSuccess(res, { dealer: await adminService.approveDealer(req.params.id) });
}));
router.patch('/dealers/:id/reject', asyncHandler(async (req: Request, res) => {
  sendSuccess(res, { dealer: await adminService.rejectDealer(req.params.id) });
}));
router.post('/disease-library', asyncHandler(async (req: Request, res) => {
  sendSuccess(res, { disease: await adminService.createDisease(req.body) }, 201);
}));
router.patch('/disease-library/:id', asyncHandler(async (req: Request, res) => {
  sendSuccess(res, { disease: await adminService.updateDisease(req.params.id, req.body) });
}));
router.get('/analytics/overview', asyncHandler(async (_req: Request, res) => {
  sendSuccess(res, await adminService.getAnalyticsOverview());
}));

export default router;
