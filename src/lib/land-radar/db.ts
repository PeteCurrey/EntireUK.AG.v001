/**
 * Land Radar — Supabase client factory
 *
 * Server-only. Uses service role key for internal Land Radar operations.
 * Never expose this client to client-side code or the public API.
 *
 * The public website /api/submit route uses a SEPARATE, limited client.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SupabaseClient = any;

// Helper to dynamically load @supabase/supabase-js if present
let createClient: (url: string, key: string, options?: unknown) => SupabaseClient = () => {
  throw new Error(
    '[Land Radar] @supabase/supabase-js is not installed. Please install it to connect to Supabase.'
  );
};
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const supabase = require('@supabase/supabase-js');
  createClient = supabase.createClient;
} catch {
  // fallback remains
}

// Prevent accidental client-side use
if (typeof window !== 'undefined') {
  throw new Error(
    'Land Radar db.ts must not be imported in client-side code. ' +
    'Use server actions or route handlers only.'
  );
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  // In development without a Supabase project, warn rather than crash
  console.warn(
    '[Land Radar] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not set. ' +
    'Database operations will fail. Configure .env.local to connect.'
  );
}

/**
 * Service-role client for internal Land Radar operations.
 * Bypasses RLS — only use from trusted server-side code.
 */
export function getLandRadarDb(): SupabaseClient {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new PersistenceError(
      '[Land Radar] Production database not configured. ' +
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in production.'
    );
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Anon client for authenticated user operations.
 * Respects RLS policies.
 */
export function getLandRadarAnonDb(): SupabaseClient {
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new PersistenceError(
      '[Land Radar] Anon database not configured. ' +
      'Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.local'
    );
  }
  return createClient(supabaseUrl, anonKey);
}

export type PersistenceMode = 'supabase' | 'mock';

export class PersistenceError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'PersistenceError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Unauthorized: Active user session with internal acquisition role required') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Resolves the explicit persistence mode for Land Radar.
 * In production, it enforces 'supabase' (failing fast if credentials are not configured).
 * In test or when explicitly set to 'mock', it allows isolated in-memory execution.
 */
export function getPersistenceMode(): PersistenceMode {
  const envMode = process.env.LAND_RADAR_PERSISTENCE_MODE;
  if (envMode === 'mock') return 'mock';
  if (envMode === 'supabase') return 'supabase';

  // Automated test runner default
  if (process.env.NODE_ENV === 'test') {
    return 'mock';
  }

  // Live Supabase when credentials are configured
  if (supabaseUrl && supabaseServiceKey) {
    return 'supabase';
  }

  // During static site generation or npm build when credentials are absent, allow mock mode
  if (process.env.npm_lifecycle_event === 'build' || process.env.NEXT_PHASE === 'phase-production-build') {
    return 'mock';
  }

  // In production runtime without credentials, require Supabase (will fail fast with PersistenceError on operations)
  if (process.env.NODE_ENV === 'production') {
    return 'supabase';
  }

  // Development fallback when credentials are not yet set
  return 'mock';
}

