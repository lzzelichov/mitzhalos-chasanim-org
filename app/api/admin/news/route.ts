import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { adminGuard, errMsg } from '@/lib/adminGuard';
import { SB_TAG } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const BUCKET = 'org-photos';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  const g = adminGuard();
  if ('error' in g) return g.error;
  const { data, error } = await g.sb.from('news_posts').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data ?? [] });
}

export async function POST(req: Request) {
  const g = adminGuard();
  if ('error' in g) return g.error;
  try {
    const fd = await req.formData();
    const id = (fd.get('id') as string) || '';
    const title_en = ((fd.get('title_en') as string) || '').trim();
    if (!title_en) return NextResponse.json({ error: 'English title is required.' }, { status: 400 });

    let slug = slugify((fd.get('slug') as string) || '');
    if (!slug) slug = slugify(title_en) || `post-${Date.now()}`;
    const status = (fd.get('status') as string) === 'published' ? 'published' : 'draft';

    const payload: Record<string, unknown> = {
      slug,
      title_en,
      title_he: (fd.get('title_he') as string) || null,
      content_en: (fd.get('content_en') as string) || null,
      content_he: (fd.get('content_he') as string) || null,
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
    };

    // SITE POLICY: no photos of women — landscapes, men, clothing, synagogues only.
    const photo = fd.get('photo') as File | null;
    if (photo && photo.size > 0) {
      const ext = (photo.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `news/${slug}-${Date.now()}.${ext}`;
      const buf = Buffer.from(await photo.arrayBuffer());
      const { error: upErr } = await g.sb.storage
        .from(BUCKET)
        .upload(path, buf, { contentType: photo.type || 'image/jpeg', upsert: true });
      if (upErr) return NextResponse.json({ error: `Photo upload failed: ${upErr.message}` }, { status: 500 });
      payload.photo_url = g.sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    }

    const { error } = id
      ? await g.sb.from('news_posts').update(payload).eq('id', id)
      : await g.sb.from('news_posts').upsert(payload, { onConflict: 'slug' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidateTag(SB_TAG);
    return NextResponse.json({ ok: true, slug });
  } catch (e) {
    console.error('News save error:', e);
    return NextResponse.json({ error: errMsg(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const g = adminGuard();
  if ('error' in g) return g.error;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });
  const { error } = await g.sb.from('news_posts').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateTag(SB_TAG);
  return NextResponse.json({ ok: true });
}
