'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import Spinner from '../Spinner';
import type { OrgPhoto } from '@/lib/types';

export default function AdminPhotos() {
  const [photos, setPhotos] = useState<OrgPhoto[] | null>(null);
  const [caption, setCaption] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/photos');
    setPhotos(r.ok ? ((await r.json()).photos as OrgPhoto[]) ?? [] : []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setErr('Choose a file first.');
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.set('photo', file);
    fd.set('caption', caption);
    try {
      const res = await fetch('/api/admin/photos', { method: 'POST', body: fd });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(d.error || `Upload failed (HTTP ${res.status})`);
        return;
      }
      setCaption('');
      if (fileRef.current) fileRef.current.value = '';
      void load();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'error');
    } finally {
      setUploading(false);
    }
  }

  async function del(id: string) {
    if (!window.confirm('Delete this photo?')) return;
    const r = await fetch(`/api/admin/photos?id=${id}`, { method: 'DELETE' });
    if (r.ok) void load();
  }

  async function saveCaption(id: string, value: string) {
    await fetch('/api/admin/photos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, caption: value }),
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/admin" className="font-sans text-sm text-charcoal/60 hover:text-burgundy">
        ← Admin
      </Link>
      <h1 className="mb-2 font-display text-3xl font-bold text-burgundy">Gallery Photos</h1>
      <p className="mb-6 font-sans text-sm text-red-600/80">⚠️ No photos of women please — landscapes, men, clothing, synagogues only.</p>

      <form onSubmit={upload} className="card mb-8 space-y-3">
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="field" />
        <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption (optional)" className="field" />
        <button type="submit" disabled={uploading} className="btn-gold w-full">
          {uploading ? 'Uploading…' : 'Upload Photo'}
        </button>
        {err && <p className="rounded-lg bg-red-50 px-3 py-2 font-sans text-sm text-red-700">⚠️ {err}</p>}
      </form>

      {photos === null ? (
        <Spinner label="Loading…" />
      ) : photos.length === 0 ? (
        <p className="font-sans text-charcoal/60">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-xl border border-gold/30 bg-white">
              <div className="relative aspect-square">
                <Image src={p.url} alt={p.caption || ''} fill sizes="200px" className="object-cover" />
              </div>
              <div className="p-2">
                <input
                  defaultValue={p.caption ?? ''}
                  onBlur={(e) => saveCaption(p.id, e.target.value)}
                  placeholder="Caption"
                  className="w-full rounded border border-charcoal/15 px-2 py-1 font-sans text-xs"
                />
                <button onClick={() => del(p.id)} className="mt-1 w-full rounded bg-red-50 py-1 font-sans text-xs font-medium text-red-700 hover:bg-red-100">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
