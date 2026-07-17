// Central env config loader.
// Import this at the very top of main.ts before anything else.
// All env vars are validated here so the app fails fast with a clear
// error message rather than mysteriously at runtime.
//
// See architecture/07_Architecture.md §3 (config/ folder purpose).

import 'dotenv/config';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}. Check backend/.env`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  supabaseUrl: requireEnv('SUPABASE_URL'),
  supabaseServiceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  geminiApiKey: requireEnv('GEMINI_API_KEY'),
  jwtSecret: requireEnv('JWT_SECRET'),
  dailyDiagnosisLimitPerUser: parseInt(
    process.env.DAILY_DIAGNOSIS_LIMIT_PER_USER ?? '20',
    10
  ),
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
