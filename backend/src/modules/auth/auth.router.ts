// Auth router — mounts all authentication endpoints under /api/v1/auth
//
// Design refs:
//   architecture/06_API_Design.md §1 — auth endpoint contracts
//
// Endpoints (all public — no JWT required):
//   POST /farmer/demo-login  — phone-based demo login for farmers
//   POST /dealer/register    — new dealer registration (status: pending)
//   POST /dealer/login       — dealer email+password login
//   POST /admin/login        — admin email+password login
//
// Zod schemas are inlined here instead of imported from cropcare-shared/validation
// to avoid runtime path-aliasing issues in the ESM build.

import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../common/asyncHandler.js';
import { sendSuccess, sendError } from '../../common/response.js';
import { authService } from './auth.service.js';

const router = Router();

// ── Inline Zod schemas ─────────────────────────────────────────────────────

const farmerDemoLoginSchema = z.object({
  name: z.string().min(1, 'name is required'),
  phone_number: z
    .string()
    .min(10, 'phone_number must be at least 10 characters')
    .regex(/^\+?[0-9]{10,15}$/, 'phone_number must be a valid phone number'),
});

const dealerRegisterSchema = z.object({
  shop_name: z.string().min(1, 'shop_name is required'),
  owner_name: z.string().min(1, 'owner_name is required'),
  email: z.string().email('email must be a valid email address'),
  password: z.string().min(8, 'password must be at least 8 characters'),
  phone_number: z
    .string()
    .min(10, 'phone_number must be at least 10 characters')
    .regex(/^\+?[0-9]{10,15}$/, 'phone_number must be a valid phone number'),
  location_lat: z.number({ required_error: 'location_lat is required' }),
  location_lng: z.number({ required_error: 'location_lng is required' }),
  address: z.string().min(1, 'address is required'),
});

const dealerLoginSchema = z.object({
  email: z.string().email('email must be a valid email address'),
  password: z.string().min(1, 'password is required'),
});

const adminLoginSchema = z.object({
  email: z.string().email('email must be a valid email address'),
  password: z.string().min(1, 'password is required'),
});

// ── Routes ─────────────────────────────────────────────────────────────────

// POST /auth/farmer/demo-login
// Finds or creates farmer by phone_number and returns a JWT immediately.
// No OTP or password in the demo phase (architecture/01_PRD.md §6).
router.post(
  '/farmer/demo-login',
  asyncHandler(async (req, res) => {
    const parseResult = farmerDemoLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        parseResult.error.errors.map((e) => e.message).join('; '),
        422
      );
    }

    const { name, phone_number } = parseResult.data;
    const result = await authService.farmerDemoLogin(name, phone_number);
    sendSuccess(res, result, 200);
  })
);

// POST /auth/dealer/register
// Creates a new dealer with status='pending'. No JWT is issued here.
router.post(
  '/dealer/register',
  asyncHandler(async (req, res) => {
    const parseResult = dealerRegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        parseResult.error.errors.map((e) => e.message).join('; '),
        422
      );
    }

    try {
      const dealer = await authService.dealerRegister(parseResult.data);
      sendSuccess(res, { dealer }, 201);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      // Duplicate email is a client error
      if (message.includes('already exists')) {
        return sendError(res, 'EMAIL_TAKEN', message, 409);
      }
      throw err; // re-throw unexpected errors to the global error handler
    }
  })
);

// POST /auth/dealer/login
// Verifies email+password. Returns JWT regardless of status —
// frontend must redirect pending dealers to the approval-wait screen.
router.post(
  '/dealer/login',
  asyncHandler(async (req, res) => {
    const parseResult = dealerLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        parseResult.error.errors.map((e) => e.message).join('; '),
        422
      );
    }

    try {
      const result = await authService.dealerLogin(
        parseResult.data.email,
        parseResult.data.password
      );
      sendSuccess(res, result, 200);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      if (message === 'Invalid email or password') {
        return sendError(res, 'INVALID_CREDENTIALS', message, 401);
      }
      throw err;
    }
  })
);

// POST /auth/admin/login
router.post(
  '/admin/login',
  asyncHandler(async (req, res) => {
    const parseResult = adminLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        parseResult.error.errors.map((e) => e.message).join('; '),
        422
      );
    }

    try {
      const result = await authService.adminLogin(
        parseResult.data.email,
        parseResult.data.password
      );
      sendSuccess(res, result, 200);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      if (message === 'Invalid email or password') {
        return sendError(res, 'INVALID_CREDENTIALS', message, 401);
      }
      throw err;
    }
  })
);

export default router;
