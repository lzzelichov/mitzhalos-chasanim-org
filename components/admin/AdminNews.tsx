'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/routing';
import { TextField, TextAreaField } from '../AdminFields';
import Spinner from '../Spinner';
import { formatDateLabel } from '@/lib/utils';
import type { NewsPost } from '@/lib/types';

const EMPTY: Record<string, string> = {
  id: '',
  slug: '',
  title_en: '',
  title_he: '',
  content_en: '',
  content_he: '',
  status: 'draft',
};

export default function AdminNews() {
  const values = useRef<Record<string, string>>({ ...EMPTY });
  const fileRef = useRef<File | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [rows, setRows] = useState<NewsPost[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const commit = useCallback((n: string, v: string) => {
    values.current[n] = v;
  }, []);

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/news');
    setRows(r.ok ? ((await r.json()).posts as NewsPost[]) ?? [] : []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function reset() {
    values.current = { ...EMPTY };
    fileRef.current = null;
    setFormKey((k) => k + 1);
  }

  function edit(p: NewsPost) {
    values.current = {
      id: p.id,
      slug: p.slug,
      title_en: p.title_en,
      title_he: p.title_he ?? '',
      content_en: p.content_en ?? '',
      content_he: p.content_he ?? '',
      status: p.status,
    };
    fileRef.current = null;
    setFormKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const v = values.current;
    if (!v.title_en.trim()) {
      setErr('English title is required.');
      return;
    }
    setSaving(true);
    setSaved(false);
    const fd = new FormData();
    Object.keys(EMPTY).forEach((k) => fd.set(k, v[k] ?? ''));
    if (fileRef.current) fd.set('photo', fileRef.current);
    try {
      const res = await fetch('/api/admin/news', { method: 'POST', body: fd });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(d.error || `Save failed (HTTP ${res.status})`);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      reset();
      void load();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'error');
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!window.confirm('Delete this post?')) return;
    const r = await fetch(`/api/admin/news?id=${id}`, { method: 'DELETE' });
    if (r.ok) void load();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/admin" className="font-sans text-sm text-charcoal/60 hover:text-burgundy">
        ← Admin
      </Link>
      <h1 className="mb-6 font-display text-3xl font-bold text-burgundy">News</h1>

      <form key={formKey} onSubmit={save} className="card space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="title_en" label="Title (English) *" defaultValue={values.current.title_en} onCommit={commit} />
          <TextField name="title_he" label="Title (Hebrew)" defaultValue={values.current.title_he} onCommit={commit} dir="rtl" />
        </div>
        <TextAreaField name="content_en" label="Content (English)" defaultValue={values.current.content_en} onCommit={commit} />
        <TextAreaField name="content_he" label="Content (Hebrew)" defaultValue={values.current.content_he} onCommit={commit} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="slug" label="Slug (optional)" defaultValue={values.current.slug} onCommit={commit} placeholder="auto from title" />
          <div>
            <label htmlFor="status" className="label">Status</label>
            <select id="status" defaultValue={values.current.status} onChange={(e) => commit('status', e.target.value)} className="field">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="photo" className="label">Photo (optional — no women)</label>
          <input
            id="photo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              fileRef.current = e.target.files?.[0] ?? null;
            }}
            className="field"
          />
        </div>
        <button type="submit" disabled={saving} className="btn-gold w-full">
          {saving ? 'Saving…' : values.current.id ? 'Update Post' : 'Add Post'}
        </button>
        {err && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm font-medium text-red-700">⚠️ {err}</p>}
        {saved && !err && <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center font-sans text-sm font-semibold text-green-700">✓ Saved!</p>}
      </form>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-2xl font-bold text-burgundy">All posts</h2>
        {rows === null ? (
          <Spinner label="Loading…" />
        ) : rows.length === 0 ? (
          <p className="font-sans text-charcoal/60">No posts yet.</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gold/30 bg-white/85 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-sans font-semibold text-charcoal">
                    {p.title_en}
                    <span className={`ms-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-charcoal/10 text-charcoal/60'}`}>
                      {p.status}
                    </span>
                  </p>
                  <p className="font-sans text-xs text-charcoal/50">
                    /{p.slug} · {formatDateLabel((p.published_at || p.created_at).slice(0, 10), 'en')}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => edit(p)} className="btn-ghost !px-3 !py-1.5 text-xs">Edit</button>
                  <button onClick={() => del(p.id)} className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
