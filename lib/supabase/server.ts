import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True when public read access is configured. */
export const supabaseConfigured = Boolean(url && anonKey);

/** True when the service-role key is available (needed for admin writes/uploads). */
export const supabaseAdminConfigured = Boolean(url && serviceKey);

/** Cache tag for all public Supabase reads — bust with revalidateTag(SB_TAG). */
export const SB_TAG = 'sb';

// Public reads: cache 60s (perf) + tag so admin/webhook writes can invalidate.
const cachedFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, next: { revalidate: 60, tags: [SB_TAG] } });

// Trusted writes/reads: always fresh.
const freshFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: 'no-store' });

/** Anon, read-only server client (subject to RLS). Null if unconfigured. */
export function getSupabaseAnon(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { fetch: cachedFetch },
  });
}

/**
 * Service-role client — bypasses RLS. Use ONLY in trusted server code
 * (admin API routes, Stripe webhook). Null if the service key is missing.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
    global: { fetch: freshFetch },
  });
}
