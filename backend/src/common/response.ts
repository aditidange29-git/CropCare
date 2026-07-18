// Helpers that write the standard response envelope defined in
// architecture/06_API_Design.md:
//
//   Success: { success: true,  data: T,    error: null }
//   Error:   { success: false, data: null, error: { code, message } }

import type { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({ success: true, data, error: null });
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode = 400
): void {
  res.status(statusCode).json({ success: false, data: null, error: { code, message } });
}
