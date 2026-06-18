import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { isAdminAuthed } from '@/lib/auth';
import { getSupabaseAdmin, SB_TAG } from '@/lib/supabase/server';

function guard() {
  if (!isAdminAuthed()) {
    return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) };
  }
  const sb = getSupabaseAdmin();
  if (!sb) return { error: NextResponse.json({ error: 'not_configured' }, { status: 503 }) };
  return { sb };
}

export async function GET(req: Request) {
  const { sb, error } = guard();
  if (error) return error;
  const weddingId = new URL(req.url).searchParams.get('weddingId');
  if (!weddingId) return NextResponse.json({ visibility: {} });
  const { data } = await sb!
    .from('wedding_visibility')
    .select('field_name, is_visible')
    .eq('wedding_id', weddingId);
  const visibility: Record<string, boolean> = {};
  for (const r of data ?? []) visibility[r.field_name as string] = r.is_visible as boolean;
  return NextResponse.json({ visibility });
}

export async function POST(req: Request) {
  const { sb, error } = guard();
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  const weddingId = body.weddingId ? String(body.weddingId) : '';
  const visibility = body.visibility as Record<string, boolean> | undefined;
  if (!weddingId || !visibility) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const payload = Object.entries(visibility).map(([field_name, is_visible]) => ({
    wedding_id: weddingId,
    field_name,
    is_visible: Boolean(is_visible),
  }));
  const { error: dbErr } = await sb!
    .from('wedding_visibility')
    .upsert(payload, { onConflict: 'wedding_id,field_name' });
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  revalidateTag(SB_TAG);
  return NextResponse.json({ ok: true });
}
