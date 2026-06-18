import 'server-only';
import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isAdminAuthed } from './auth';
import { getSupabaseAdmin } from './supabase/server';

/** Auth + service-role client gate for admin API routes. */
export function adminGuard(): { sb: SupabaseClient } | { error: NextResponse } {
  if (!isAdminAuthed()) return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) };
  const sb = getSupabaseAdmin();
  if (!sb) return { error: NextResponse.json({ error: 'not_configured' }, { status: 503 }) };
  return { sb };
}

/** Safe message from an unknown thrown value. */
export function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
