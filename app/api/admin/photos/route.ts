import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { adminGuard, errMsg } from '@/lib/adminGuard';
import { SB_TAG } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const BUCKET = 'org-photos';

export async function GET() {
  const g = adminGuard();
  if ('error' in g) return g.error;
  const { data, error } = await g.sb.from('org_photos').select('*').order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ photos: data ?? [] });
}

export async function POST(req: Request) {
  const g = adminGuard();
  if ('error' in g) return g.error;
  try {
    const fd = await req.formData();
    const file = fd.get('photo') as File | null;
    const caption = (fd.get('caption') as string) || null;
    if (!file || file.size === 0) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });

    // SITE POLICY: no photos of women — landscapes, men, clothing, synagogues only.
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `gallery/${Date.now()}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await g.sb.storage
      .from(BUCKET)
      .upload(path, buf, { contentType: file.type || 'image/jpeg', upsert: true });
    if (upErr) return NextResponse.json({ error: `Upload failed: ${upErr.message}` }, { status: 500 });

    const url = g.sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    const { error } = await g.sb.from('org_photos').insert({ url, caption, sort_order: Date.now() });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidateTag(SB_TAG);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Photo upload error:', e);
    return NextResponse.json({ error: errMsg(e) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const g = adminGuard();
  if ('error' in g) return g.error;
  const b = await req.json().catch(() => ({}));
  const id = b.id ? String(b.id) : '';
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });
  const patch: Record<string, unknown> = {};
  if (typeof b.caption === 'string') patch.caption = b.caption;
  if (typeof b.sort_order === 'number') patch.sort_order = b.sort_order;
  const { error } = await g.sb.from('org_photos').update(patch).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateTag(SB_TAG);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const g = adminGuard();
  if ('error' in g) return g.error;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });
  const { error } = await g.sb.from('org_photos').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateTag(SB_TAG);
  return NextResponse.json({ ok: true });
}
