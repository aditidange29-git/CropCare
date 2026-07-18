// Users service — farmer profile read/update.
//
// All queries target the `users` table (05_Database.md §2.1).
// Used by the users router mounted at /api/v1/users (06_API_Design.md §2).

import { supabase } from '../../config/supabase.js';

export class UsersService {
  /**
   * Fetch the full `users` row for the authenticated farmer.
   * Throws if the user is not found (should never happen with a valid JWT,
   * but guards against orphaned tokens after a row deletion).
   */
  async getMe(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw Object.assign(new Error('User not found.'), { statusCode: 404, code: 'NOT_FOUND' });
    }

    return data;
  }

  /**
   * Partial update of mutable farmer profile fields.
   * Only the supplied fields are written; others are left unchanged.
   * Returns the updated row.
   */
  async updateMe(
    userId: string,
    updates: {
      name?: string;
      preferred_language?: string;
      location_lat?: number;
      location_lng?: number;
    }
  ) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('*')
      .single();

    if (error || !data) {
      throw Object.assign(new Error('Failed to update user.'), { statusCode: 500, code: 'UPDATE_FAILED' });
    }

    return data;
  }
}

export const usersService = new UsersService();
