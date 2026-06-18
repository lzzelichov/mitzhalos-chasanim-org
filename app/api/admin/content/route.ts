import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { adminGuard, errMsg } from '@/lib/adminGuard';
import { SB_TAG } from '@/lib/supabase/server';
import { DEFAULT_CONTENT } from '@/lib/siteContent';

export const dynamic = 'force-dynamic';

export async function GET() {
  const g = adminGuard();
  if ('error' in g) return g.error;
  const { data } = await g.sb
    .from('site_content')
    .select('key, value_en, value_he, is_visible, section, label, type');
  const dbMap = Object.fromEntries((data ?? []).map((r) => [r.key, r]));
  const rows = DEFAULT_CONTENT.map((d) => ({ ...d, ...(dbMap[d.key] || {}) }));
  return NextResponse.json({ rows });
}

export async function POST(req: Request) {
  const g = adminGuard();
  if ('error' in g) return g.error;
  try {
    const b = await req.json();
    const rows = Array.isArray(b.rows) ? b.rows : [];
    if (rows.length) {
      const payload = rows.map((r: Record<string, unknown>) => ({
        key: r.key,
        section: r.section,
        label: r.label,
        type: r.type,
        value_en: r.value_en ?? '',
        value_he: r.value_he ?? '',
        is_visible: r.is_visible !== false,
      }));
      const { error } = await g.sb.from('site_content').upsert(payload, { onConflict: 'key' });
      if (error) {
        console.error('Content save error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
    revalidateTag(SB_TAG);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Content save error:', e);
    return NextResponse.json({ error: errMsg(e) }, { status: 500 });
  }
}
