// Supabase client — single shared instance for the entire backend.
//
// Uses the SERVICE ROLE key (not the anon key) because the backend needs
// full read/write access to all tables. This key must never be sent to
// the frontend or committed to git.
//
// See architecture/02_TRD.md §2.4 — Supabase is both the DB and Storage layer.
// See architecture/07_Architecture.md §2.4 for why there is no separate ORM.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables. ' +
    'Copy backend/.env.example to backend/.env and fill in your Supabase credentials.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    // We manage our own JWT auth — tell Supabase client not to interfere.
    autoRefreshToken: false,
    persistSession: false,
  },
});
