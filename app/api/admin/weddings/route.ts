import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { isAdminAuthed } from '@/lib/auth';
import { getSupabaseAdmin, SB_TAG } from '@/lib/supabase/server';
import { hebrewFull } from '@/lib/hebcal';

const BUCKET = 'wedding-covers';

function guard() {
  if (!isAdminAuthed()) {
    return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) };
  }
  const sb = getSupabaseAdmin();
  if (!sb) {
    return { error: NextResponse.json({ error: 'not_configured' }, { status: 503 }) };
  }
  return { sb };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  const { sb, error } = guard();
  if (error) return error;
  const { data, error: dbErr } = await sb!
    .from('weddings')
    .select('*')
    .order('created_at', { ascending: false });
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  // Attach raised totals (USD) for the share-menu milestone math.
  const { data: dons } = await sb!
    .from('donations')
    .select('wedding_id, amount')
    .not('wedding_id', 'is', null);
  const raised = new Map<string, number>();
  for (const d of dons ?? []) {
    raised.set(d.wedding_id, (raised.get(d.wedding_id) ?? 0) + (Number(d.amount) || 0));
  }
  const weddings = (data ?? []).map((w) => ({
    ...w,
    raisedUsd: raised.get(w.id) ?? 0,
  }));
  return NextResponse.json({ weddings });
}

export async function POST(req: Request) {
  const { sb, error } = guard();
  if (error) return error;

  const fd = await req.formData();
  const id = (fd.get('id') as string) || '';
  const chatan_name_en = (fd.get('chatan_name_en') as string) || '';
  const wedding_date = (fd.get('wedding_date') as string) || '';
  if (!chatan_name_en || !wedding_date) {
    return NextResponse.json({ error: 'missing_required' }, { status: 400 });
  }

  let slug = slugify((fd.get('slug') as string) || '');
  if (!slug) slug = slugify(`${chatan_name_en}-${wedding_date}`);

  const str = (k: string) => (fd.get(k) as string) || null;

  const payload: Record<string, unknown> = {
    slug,
    chatan_name_en,
    chatan_name_he: str('chatan_name_he'),
    kallah_initial: str('kallah_initial'),
    wedding_date,
    hebrew_date_str: hebrewFull(wedding_date),
    venue: str('venue'),
    city: (fd.get('city') as string) || 'Jerusalem',
    story: str('story'),
    goal_usd: Number(fd.get('goal_usd')) || 0,
    status: (fd.get('status') as string) || 'active',
    // Extended profile fields
    chatan_father_name: str('chatan_father_name'),
    chatan_mother_name: str('chatan_mother_name'),
    chatan_born: str('chatan_born'),
    chatan_learns_works: str('chatan_learns_works'),
    chatan_link: str('chatan_link'),
    chatan_bio: str('chatan_bio'),
    kallah_father_name: str('kallah_father_name'),
    kallah_mother_name: str('kallah_mother_name'),
    kallah_born: str('kallah_born'),
    kallah_learns_works: str('kallah_learns_works'),
    kallah_link: str('kallah_link'),
    kallah_bio: str('kallah_bio'),
  };

  // SITE POLICY: No images of women. Jerusalem / venue landscapes only.
  const cover = fd.get('cover') as File | null;
  if (cover && cover.size > 0) {
    const ext = (cover.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${slug}-${Date.now()}.${ext}`;
    const buf = Buffer.from(await cover.arrayBuffer());
    const { error: upErr } = await sb!.storage
      .from(BUCKET)
      .upload(path, buf, { contentType: cover.type || 'image/jpeg', upsert: true });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
    payload.cover_photo_url = sb!.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  const dbErr = id
    ? (await sb!.from('weddings').update(payload).eq('id', id)).error
    : (await sb!.from('weddings').upsert(payload, { onConflict: 'slug' })).error;

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  revalidateTag(SB_TAG);
  return NextResponse.json({ ok: true, slug });
}

export async function DELETE(req: Request) {
  const { sb, error } = guard();
  if (error) return error;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });
  const { error: dbErr } = await sb!.from('weddings').delete().eq('id', id);
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  revalidateTag(SB_TAG);
  return NextResponse.json({ ok: true });
}

// Quick status toggle (Draft <-> Active) without a full form submit.
export async function PATCH(req: Request) {
  const { sb, error } = guard();
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  const id = body.id ? String(body.id) : '';
  const status = String(body.status);
  if (!id || !['draft', 'active', 'completed'].includes(status)) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const { error: dbErr } = await sb!.from('weddings').update({ status }).eq('id', id);
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  revalidateTag(SB_TAG);
  return NextResponse.json({ ok: true });
}
