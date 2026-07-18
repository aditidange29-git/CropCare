import { Router } from 'express';
import type { Request } from 'express';
import { authenticate, AuthenticatedRequest } from '../../common/auth.middleware.js';
import { asyncHandler } from '../../common/asyncHandler.js';
import { sendSuccess } from '../../common/response.js';
import { chatsService } from './chats.service.js';

const router = Router();

router.post('/', authenticate, asyncHandler(async (req: Request, res) => {
  const { sub: userId } = (req as AuthenticatedRequest).user;
  const { diagnosis_id, dealer_id, channel } = req.body as {
    diagnosis_id: string; dealer_id: string; channel: 'call' | 'whatsapp';
  };
  const result = await chatsService.createChat({ diagnosis_id, dealer_id, channel, userId });
  sendSuccess(res, result, 201);
}));

export default router;
