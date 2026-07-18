import { Router } from 'express';
import type { Request } from 'express';
import { authenticate, AuthenticatedRequest } from '../../common/auth.middleware.js';
import { asyncHandler } from '../../common/asyncHandler.js';
import { sendSuccess } from '../../common/response.js';
import { recommendationsService } from './recommendations.service.js';

const router = Router();

router.get('/:diagnosisId', authenticate, asyncHandler(async (req: Request, res) => {
  const { sub: userId } = (req as AuthenticatedRequest).user;
  const products = await recommendationsService.getRecommendationsForDiagnosis(req.params.diagnosisId, userId);
  sendSuccess(res, { products });
}));

export default router;
