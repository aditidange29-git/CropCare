// Wraps an async route handler so any rejected promise is forwarded to
// Express's next(err) error handler instead of causing an unhandled rejection.
//
// Usage:
//   router.get('/path', asyncHandler(async (req, res) => { ... }))

import { Request, Response, NextFunction } from 'express';

export const asyncHandler =
  (fn: Function) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
