import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { adminGuard, errMsg } from '@/lib/adminGuard';
import { SB_TAG } from '@/lib/supabase/server';
import { hebrewFull } from '@/lib/hebcal';

export const dynamic = 'force-dynamic';

export async function GET() {
  const g = adminGuard();
  if ('error' in g) return g.error;
  const { data, error } = await g.sb.from('couples').select('*').order('wedding_date', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ couples: data ?? [] });
}

export async function POST(req: Request) {
  const g = adminGuard();
  if ('error' in g) return g.error;
  try {
    const b = await req.json();
    const chatan_name_en = (b.chatan_name_en || '').toString().trim();
    const wedding_date = (b.wedding_date || '').toString().trim();
    if (!chatan_name_en || !wedding_date) {
      return NextResponse.json({ error: 'Chatan name (English) and wedding date are required.' }, { status: 400 });
    }
    const payload = {
      chatan_name_he: b.chatan_name_he || null,
      chatan_name_en,
      wedding_date,
      hebrew_date_str: hebrewFull(wedding_date),
      father_name_he: b.father_name_he || null,
      father_name_en: b.father_name_en || null,
      mother_name_he: b.mother_name_he || null,
      mother_name_en: b.mother_name_en || null,
      yeshiva: b.yeshiva || null,
      chassidus: b.chassidus || null,
      extra_info: b.extra_info || null,
      package_price: Number(b.package_price) || 750,
      status: ['active', 'draft', 'completed'].includes(b.status) ? b.status : 'active',
      notes: b.notes || null,
    };
    const id = b.id ? String(b.id) : '';
    const { error } = id
      ? await g.sb.from('couples').update(payload).eq('id', id)
      : await g.sb.from('couples').insert(payload);
    if (error) {
      console.error('Couple save error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    revalidateTag(SB_TAG);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Couple save error:', e);
    return NextResponse.json({ error: errMsg(e) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const g = adminGuard();
  if ('error' in g) return g.error;
  const b = await req.json().catch(() => ({}));
  const id = b.id ? String(b.id) : '';
  const status = String(b.status);
  if (!id || !['active', 'draft', 'completed'].includes(status)) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const { error } = await g.sb.from('couples').update({ status }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateTag(SB_TAG);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const g = adminGuard();
  if ('error' in g) return g.error;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });
  const { error } = await g.sb.from('couples').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateTag(SB_TAG);
  return NextResponse.json({ ok: true });
}
