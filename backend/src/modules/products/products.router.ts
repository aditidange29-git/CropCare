// Dealer Dashboard routes — /api/v1/dealer/*
import { Router } from 'express';
import type { Request } from 'express';
import { authenticate, AuthenticatedRequest } from '../../common/auth.middleware.js';
import { requireRole } from '../../common/roles.middleware.js';
import { asyncHandler } from '../../common/asyncHandler.js';
import { sendSuccess } from '../../common/response.js';
import { productsService } from './products.service.js';

const router = Router();
router.use(authenticate, requireRole('dealer'));

router.post('/products', asyncHandler(async (req: Request, res) => {
  const { sub: dealerId } = (req as AuthenticatedRequest).user;
  const { name, category, applicable_disease_codes, stock_status } = req.body as {
    name: string; category: string; applicable_disease_codes: string[]; stock_status: string;
  };
  sendSuccess(res, { product: await productsService.create(dealerId, { name, category, applicable_disease_codes, stock_status }) }, 201);
}));

router.patch('/products/:id', asyncHandler(async (req: Request, res) => {
  const { sub: dealerId } = (req as AuthenticatedRequest).user;
  sendSuccess(res, { product: await productsService.update(req.params.id, dealerId, req.body) });
}));

router.delete('/products/:id', asyncHandler(async (req: Request, res) => {
  const { sub: dealerId } = (req as AuthenticatedRequest).user;
  await productsService.deleteProduct(req.params.id, dealerId);
  sendSuccess(res, { deleted: true });
}));

router.get('/products', asyncHandler(async (req: Request, res) => {
  const { sub: dealerId } = (req as AuthenticatedRequest).user;
  const page = parseInt((req.query.page as string) ?? '1', 10);
  const limit = parseInt((req.query.limit as string) ?? '20', 10);
  sendSuccess(res, await productsService.getDealerProducts(dealerId, page, limit));
}));

router.get('/leads', asyncHandler(async (req: Request, res) => {
  const { sub: dealerId } = (req as AuthenticatedRequest).user;
  const page = parseInt((req.query.page as string) ?? '1', 10);
  sendSuccess(res, await productsService.getDealerLeads(dealerId, page));
}));

router.get('/analytics', asyncHandler(async (req: Request, res) => {
  const { sub: dealerId } = (req as AuthenticatedRequest).user;
  sendSuccess(res, await productsService.getDealerAnalytics(dealerId));
}));

export default router;
