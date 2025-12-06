/**
 * Supabase client configuration for Last Price
 * 
 * This module provides the Supabase client instance for database operations.
 * For local development, it uses the local Supabase instance.
 * For production, it connects to the remote Supabase project.
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:55321';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

/**
 * Public Supabase client - for client-side operations with RLS
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

/**
 * Admin Supabase client - bypasses RLS for server-side operations
 * Use this for backend operations that need full database access
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Helper function to get PostgreSQL connection string for direct connections
 * Useful for migrations or tools that need raw Postgres access
 */
export function getPostgresConnectionString(): string {
  return process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:55322/postgres';
}

export default supabaseAdmin;
