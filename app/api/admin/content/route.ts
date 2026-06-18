import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { isAdminAuthed } from '@/lib/auth';
import { getSupabaseAdmin, SB_TAG } from '@/lib/supabase/server';
import { DEFAULT_CONTENT, type SiteContentRow } from '@/lib/siteContent';

function guard() {
  if (!isAdminAuthed()) {
    return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) };
  }
  const sb = getSupabaseAdmin();
  if (!sb) return { error: NextResponse.json({ error: 'not_configured' }, { status: 503 }) };
  return { sb };
}

/** Returns the full content set: code defaults overridden by any DB rows. */
export async function GET() {
  const { sb, error } = guard();
  if (error) return error;

  const map = new Map<string, SiteContentRow>(DEFAULT_CONTENT.map((r) => [r.key, { ...r }]));
  const { data } = await sb!.from('site_content').select('*');
  for (const r of (data as Partial<SiteContentRow>[]) ?? []) {
    if (!r.key) continue;
    map.set(r.key, { ...(map.get(r.key) ?? ({} as SiteContentRow)), ...r } as SiteContentRow);
  }
  return NextResponse.json({ rows: Array.from(map.values()) });
}

export async function POST(req: Request) {
  const { sb, error } = guard();
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  const action = body.action ?? 'save';

  let rows: SiteContentRow[] = [];
  if (action === 'reset') {
    rows = body.section
      ? DEFAULT_CONTENT.filter((r) => r.section === body.section)
      : DEFAULT_CONTENT;
  } else {
    rows = Array.isArray(body.rows) ? body.rows : [];
  }
  if (rows.length === 0) return NextResponse.json({ ok: true, count: 0 });

  const payload = rows.map((r) => ({
    key: r.key,
    value_en: r.value_en ?? '',
    value_he: r.value_he ?? '',
    section: r.section ?? 'general',
    label: r.label ?? '',
    type: r.type ?? 'text',
    is_visible: r.is_visible ?? true,
    updated_at: new Date().toISOString(),
  }));

  const { error: dbErr } = await sb!.from('site_content').upsert(payload, { onConflict: 'key' });
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  revalidateTag(SB_TAG);
  return NextResponse.json({ ok: true, count: payload.length });
}
