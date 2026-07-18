// Role-based access guard factory.
//
// Usage:
//   router.get('/dealer/products', authenticate, requireRole('dealer'), handler)
//   router.get('/admin/dealers',   authenticate, requireRole('admin'),  handler)
//
// For the 'dealer' role an extra Supabase check is performed:
//   dealers.status must equal 'approved' — a valid JWT alone is not enough.
//   Returns 403 DEALER_NOT_APPROVED if the dealer is still pending/rejected.
//
// All other roles: simple JWT role-claim comparison.
// Wrong role → 403 FORBIDDEN (per 06_API_Design.md §9).

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';
import { supabase } from '../config/supabase.js';
import { sendError } from './response.js';

export function requireRole(...roles: string[]) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { role, sub } = req.user;

    if (!roles.includes(role)) {
      sendError(res, 'FORBIDDEN', 'You do not have permission to access this resource.', 403);
      return;
    }

    // Dealers need an additional approval check beyond the JWT role claim.
    // A dealer whose application is pending or rejected can still hold a valid
    // JWT (issued on login per 06_API_Design.md §1), but dashboard endpoints
    // must reject them server-side.
    if (role === 'dealer') {
      const { data: dealer, error } = await supabase
        .from('dealers')
        .select('status')
        .eq('id', sub)
        .single();

      if (error || !dealer) {
        sendError(res, 'FORBIDDEN', 'Dealer account not found.', 403);
        return;
      }

      if (dealer.status !== 'approved') {
        sendError(
          res,
          'DEALER_NOT_APPROVED',
          'Your dealer account is pending admin approval.',
          403
        );
        return;
      }
    }

    next();
  };
}
