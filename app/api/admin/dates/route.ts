import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { isAdminAuthed } from '@/lib/auth';
import { getSupabaseAdmin, SB_TAG } from '@/lib/supabase/server';

const BUCKET = 'date-photos';

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

export async function GET() {
  const { sb, error } = guard();
  if (error) return error;
  const { data, error: dbErr } = await sb!
    .from('dates')
    .select('*')
    .order('date', { ascending: true });
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ dates: data });
}

export async function POST(req: Request) {
  const { sb, error } = guard();
  if (error) return error;

  const fd = await req.formData();
  const id = (fd.get('id') as string) || '';
  const date = (fd.get('date') as string) || '';
  const title = (fd.get('title') as string) || null;
  const story = (fd.get('story') as string) || null;
  const is_published = (fd.get('is_published') as string) === 'true';
  const photo = fd.get('photo') as File | null;

  if (!date) return NextResponse.json({ error: 'date_required' }, { status: 400 });

  const payload: Record<string, unknown> = { date, title, story, is_published };

  // SITE POLICY: No images of women. Landscapes and men only.
  if (photo && photo.size > 0) {
    const ext = (photo.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${date}-${Date.now()}.${ext}`;
    const buf = Buffer.from(await photo.arrayBuffer());
    const { error: upErr } = await sb!.storage
      .from(BUCKET)
      .upload(path, buf, { contentType: photo.type || 'image/jpeg', upsert: true });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
    payload.photo_url = sb!.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  let dbErr;
  if (id) {
    dbErr = (await sb!.from('dates').update(payload).eq('id', id)).error;
  } else {
    // Legacy single-couple dates (wedding_id null): update if one exists, else insert.
    const { data: existing } = await sb!
      .from('dates')
      .select('id')
      .is('wedding_id', null)
      .eq('date', date)
      .maybeSingle();
    dbErr = existing
      ? (await sb!.from('dates').update(payload).eq('id', existing.id)).error
      : (await sb!.from('dates').insert({ ...payload, wedding_id: null }).select('id').single())
          .error;
  }

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  revalidateTag(SB_TAG);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { sb, error } = guard();
  if (error) return error;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });
  const { error: dbErr } = await sb!.from('dates').delete().eq('id', id);
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  revalidateTag(SB_TAG);
  return NextResponse.json({ ok: true });
}
