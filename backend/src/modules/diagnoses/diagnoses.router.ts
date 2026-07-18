import { Router } from 'express';
import type { Request } from 'express';
import multer from 'multer';
import { authenticate, AuthenticatedRequest } from '../../common/auth.middleware.js';
import { asyncHandler } from '../../common/asyncHandler.js';
import { sendSuccess, sendError } from '../../common/response.js';
import { diagnosesService } from './diagnoses.service.js';
import { supabase } from '../../config/supabase.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('IMAGE_INVALID_TYPE'));
    }
  },
});

router.post('/', authenticate, upload.single('image'), asyncHandler(async (req: Request, res) => {
  const { sub: userId } = (req as AuthenticatedRequest).user;
  if (!req.file) return sendError(res, 'IMAGE_MISSING', 'An image file is required.', 400);
  const mimeType = req.file.mimetype as 'image/jpeg' | 'image/png';
  const ext = mimeType === 'image/jpeg' ? 'jpg' : 'png';
  const fileName = `${userId}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('crop-images')
    .upload(fileName, req.file.buffer, { contentType: mimeType, upsert: false });
  if (uploadError) {
    console.error('[Diagnoses] Storage upload failed:', uploadError.message);
    return sendError(res, 'UPLOAD_FAILED', 'Image upload failed. Ensure crop-images bucket exists.', 500);
  }
  const { data: urlData } = supabase.storage.from('crop-images').getPublicUrl(fileName);
  const imageUrl = urlData.publicUrl;
  const locationLat = req.body.location_lat ? parseFloat(req.body.location_lat) : undefined;
  const locationLng = req.body.location_lng ? parseFloat(req.body.location_lng) : undefined;
  const result = await diagnosesService.createDiagnosis({ userId, imageBuffer: req.file.buffer, mimeType, imageUrl, locationLat, locationLng });
  sendSuccess(res, result, 201);
}));

router.get('/', authenticate, asyncHandler(async (req: Request, res) => {
  const { sub: userId } = (req as AuthenticatedRequest).user;
  const page = parseInt((req.query.page as string) ?? '1', 10);
  const limit = parseInt((req.query.limit as string) ?? '20', 10);
  sendSuccess(res, await diagnosesService.getDiagnoses(userId, page, limit));
}));

router.get('/:id', authenticate, asyncHandler(async (req: Request, res) => {
  const { sub: userId } = (req as AuthenticatedRequest).user;
  sendSuccess(res, await diagnosesService.getDiagnosisById(req.params.id, userId));
}));

export default router;
