'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { formatDateLabel } from '@/lib/utils';
import { hasAdminUiCookie } from '@/lib/adminClient';
import { TextField, TextAreaField } from './AdminFields';
import type { DateRow } from '@/lib/types';

const EMPTY: Record<string, string> = {
  id: '',
  date: '',
  title: '',
  story: '',
  is_published: 'true',
};

export default function AdminClient({
  supabaseReady,
  adminReady,
}: {
  supabaseReady: boolean;
  adminReady: boolean;
}) {
  const t = useTranslations('Admin');
  const locale = useLocale();

  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  const values = useRef<Record<string, string>>({ ...EMPTY });
  const fileRef = useRef<File | null>(null);
  const [formKey, setFormKey] = useState(0);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rows, setRows] = useState<DateRow[]>([]);

  const notReady = useMemo(() => !supabaseReady || !adminReady, [supabaseReady, adminReady]);
  const commit = useCallback((name: string, value: string) => {
    values.current[name] = value;
  }, []);

  const loadRows = useCallback(async () => {
    const res = await fetch('/api/admin/dates');
    if (res.ok) setRows(((await res.json()).dates as DateRow[]) ?? []);
    else if (res.status === 401) setAuthed(false);
  }, []);

  useEffect(() => {
    if (hasAdminUiCookie()) setAuthed(true);
  }, []);
  useEffect(() => {
    if (authed) void loadRows();
  }, [authed, loadRows]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(false);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
      setPassword('');
    } else setAuthError(true);
  }

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setAuthed(false);
    setRows([]);
  }

  function reset() {
    values.current = { ...EMPTY };
    fileRef.current = null;
    setFormKey((k) => k + 1);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const v = values.current;
    if (!v.date) return;
    setSaving(true);
    setSaved(false);
    const fd = new FormData();
    if (v.id) fd.set('id', v.id);
    fd.set('date', v.date);
    fd.set('title', v.title);
    fd.set('story', v.story);
    fd.set('is_published', v.is_published);
    if (fileRef.current) fd.set('photo', fileRef.current);

    const res = await fetch('/api/admin/dates', { method: 'POST', body: fd });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      reset();
      void loadRows();
    }
  }

  function edit(row: DateRow) {
    values.current = {
      id: row.id,
      date: row.date,
      title: row.title ?? '',
      story: row.story ?? '',
      is_published: String(row.is_published),
    };
    fileRef.current = null;
    setFormKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remove(id: string) {
    if (!window.confirm(t('confirmDelete'))) return;
    const res = await fetch(`/api/admin/dates?id=${id}`, { method: 'DELETE' });
    if (res.ok) void loadRows();
  }

  if (notReady) {
    return (
      <div className="mx-auto max-w-md">
        <p className="card text-center font-sans text-charcoal/70">{t('configMissing')}</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm">
        <h1 className="mb-2 text-center font-display text-3xl font-bold text-burgundy">{t('title')}</h1>
        <p className="mb-6 text-center font-sans text-sm text-charcoal/60">{t('passwordPrompt')}</p>
        <form onSubmit={login} className="card space-y-4">
          <div>
            <label htmlFor="pw" className="label">{t('password')}</label>
            <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" autoFocus />
          </div>
          {authError && <p className="font-sans text-sm text-red-600">{t('wrongPassword')}</p>}
          <button type="submit" className="btn-gold w-full">{t('unlock')}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-burgundy">{t('title')}</h1>
        <button onClick={logout} className="btn-ghost !px-4 !py-2 text-sm">{t('logout')}</button>
      </div>

      <form key={formKey} onSubmit={save} className="card space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="date" label={t('pickDate')} type="date" defaultValue={values.current.date} onCommit={commit} />
          <TextField name="title" label={t('fieldTitle')} defaultValue={values.current.title} onCommit={commit} placeholder={t('titlePlaceholder')} />
        </div>

        <TextAreaField name="story" label={t('story')} defaultValue={values.current.story} onCommit={commit} />

        <div>
          <label htmlFor="photo" className="label">{t('photo')}</label>
          {/* SITE POLICY: No images of women. Landscapes and men only. */}
          <input
            id="photo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              fileRef.current = e.target.files?.[0] ?? null;
            }}
            className="field"
          />
          <p className="mt-1 font-sans text-xs text-charcoal/50">{t('photoHint')}</p>
          <p className="mt-1 font-sans text-xs text-red-600/80">{t('photoPolicy')}</p>
        </div>

        <label className="flex items-center gap-2 font-sans text-sm text-charcoal/80">
          <input
            type="checkbox"
            defaultChecked={values.current.is_published === 'true'}
            onChange={(e) => commit('is_published', String(e.target.checked))}
            className="h-4 w-4 accent-gold"
          />
          {t('published')}
        </label>

        <button type="submit" disabled={saving} className="btn-gold w-full">
          {saving ? t('saving') : saved ? t('saved') : t('save')}
        </button>
      </form>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-2xl font-bold text-burgundy">{t('existing')}</h2>
        {rows.length === 0 ? (
          <p className="font-sans text-charcoal/60">{t('none')}</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gold/30 bg-white/85 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-sans font-semibold text-charcoal">
                    {row.title || formatDateLabel(row.date, locale)}
                  </p>
                  <p className="font-sans text-xs text-charcoal/50">
                    {formatDateLabel(row.date, locale)}
                    {!row.is_published && ' • draft'}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => edit(row)} className="btn-ghost !px-3 !py-1.5 text-xs">{t('edit')}</button>
                  <button
                    onClick={() => remove(row.id)}
                    className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                  >
                    {t('delete')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
