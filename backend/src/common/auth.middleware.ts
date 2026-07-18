// JWT authentication middleware.
//
// Reads the Authorization: Bearer <token> header, verifies the token against
// JWT_SECRET, and attaches the decoded payload to req.user.
//
// Missing or invalid token → 401 UNAUTHORIZED (per 06_API_Design.md §9).
// See architecture/07_Architecture.md §2.5 for the auth isolation strategy.

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { sendError } from './response.js';

export interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    role: 'farmer' | 'dealer' | 'admin';
  };
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'UNAUTHORIZED', 'Missing or malformed Authorization header.', 401);
    return;
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const payload = jwt.verify(token, config.jwtSecret) as {
      sub: string;
      role: 'farmer' | 'dealer' | 'admin';
    };

    (req as AuthenticatedRequest).user = {
      sub: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    sendError(res, 'UNAUTHORIZED', 'Invalid or expired token.', 401);
  }
}
