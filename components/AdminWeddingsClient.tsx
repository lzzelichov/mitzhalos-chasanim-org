'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { formatDateLabel, getSiteUrl } from '@/lib/utils';
import { hasAdminUiCookie } from '@/lib/adminClient';
import { TextField, TextAreaField } from './AdminFields';
import WhatsAppShareMenu from './WhatsAppShareMenu';
import CopyLinkButton from './CopyLinkButton';
import { WEDDING_VISIBILITY_FIELDS } from '@/lib/weddingVisibilityFields';
import type { Wedding } from '@/lib/types';

type WeddingRow = Wedding & { raisedUsd?: number };

const EMPTY: Record<string, string> = {
  id: '',
  slug: '',
  chatan_name_en: '',
  chatan_name_he: '',
  kallah_initial: '',
  wedding_date: '',
  venue: '',
  city: 'Jerusalem',
  story: '',
  goal_usd: '5000',
  status: 'active',
  chatan_father_name: '',
  chatan_mother_name: '',
  chatan_born: '',
  chatan_learns_works: '',
  chatan_link: '',
  chatan_bio: '',
  kallah_father_name: '',
  kallah_mother_name: '',
  kallah_born: '',
  kallah_learns_works: '',
  kallah_link: '',
  kallah_bio: '',
};

const COMPLETION_FIELDS: (keyof Wedding)[] = [
  'chatan_name_en', 'chatan_name_he', 'kallah_initial', 'venue', 'city', 'story', 'cover_photo_url',
  'chatan_father_name', 'chatan_mother_name', 'chatan_born', 'chatan_learns_works', 'chatan_link', 'chatan_bio',
  'kallah_father_name', 'kallah_mother_name', 'kallah_born', 'kallah_learns_works', 'kallah_link', 'kallah_bio',
];

function completionPct(w: Wedding): number {
  let filled = 0;
  const total = COMPLETION_FIELDS.length + 1;
  for (const f of COMPLETION_FIELDS) if (String(w[f] ?? '').trim()) filled++;
  if (w.goal_usd > 0) filled++;
  return Math.round((filled / total) * 100);
}

export default function AdminWeddingsClient({
  supabaseReady,
  adminReady,
}: {
  supabaseReady: boolean;
  adminReady: boolean;
}) {
  const t = useTranslations('AdminWeddings');
  const ta = useTranslations('Admin');
  const locale = useLocale();

  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // Field values live in a ref → editing never re-renders the form.
  const values = useRef<Record<string, string>>({ ...EMPTY });
  const coverRef = useRef<File | null>(null);
  const [formKey, setFormKey] = useState(0); // bump to remount fields with new defaults

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [rows, setRows] = useState<WeddingRow[]>([]);
  const visRef = useRef<Record<string, boolean>>({});

  const notReady = useMemo(() => !supabaseReady || !adminReady, [supabaseReady, adminReady]);
  const commit = useCallback((name: string, value: string) => {
    values.current[name] = value;
  }, []);

  const loadRows = useCallback(async () => {
    const res = await fetch('/api/admin/weddings');
    if (res.ok) setRows(((await res.json()).weddings as WeddingRow[]) ?? []);
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
    coverRef.current = null;
    visRef.current = {};
    setFormKey((k) => k + 1);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const v = values.current;
    setSaveError(null);
    if (!v.chatan_name_en || !v.wedding_date) {
      setSaveError(locale === 'he' ? 'נא למלא שם חתן ותאריך חתונה.' : 'Please fill in the chatan name and wedding date.');
      return;
    }
    setSaving(true);
    setSaved(false);
    console.log('Save triggered, data:', v);
    const fd = new FormData();
    Object.keys(EMPTY).forEach((k) => fd.set(k, v[k] ?? ''));
    if (coverRef.current) fd.set('cover', coverRef.current);

    try {
      const res = await fetch('/api/admin/weddings', { method: 'POST', body: fd });
      const body = await res.json().catch(() => ({} as { error?: string }));
      console.log('Supabase response:', res.status, body);

      if (!res.ok) {
        // Never fail silently — surface the real reason.
        if (res.status === 401) {
          setAuthed(false);
          setSaveError(locale === 'he' ? 'פג תוקף ההתחברות. התחברו מחדש.' : 'Session expired — please log in again.');
        } else {
          const msg = body?.error || `HTTP ${res.status}`;
          setSaveError((locale === 'he' ? 'השמירה נכשלה: ' : 'Save failed: ') + msg);
        }
        return;
      }

      // Persist per-wedding visibility toggles (edit mode only — needs an id).
      if (v.id) {
        const visAll: Record<string, boolean> = {};
        for (const f of WEDDING_VISIBILITY_FIELDS) visAll[f.key] = visRef.current[f.key] ?? true;
        await fetch('/api/admin/wedding-visibility', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weddingId: v.id, visibility: visAll }),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      reset();
      void loadRows();
    } catch (err) {
      console.error('Save error:', err);
      setSaveError((locale === 'he' ? 'שגיאת רשת: ' : 'Network error: ') + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  }

  async function edit(w: Wedding) {
    values.current = {
      id: w.id,
      slug: w.slug,
      chatan_name_en: w.chatan_name_en ?? '',
      chatan_name_he: w.chatan_name_he ?? '',
      kallah_initial: w.kallah_initial ?? '',
      wedding_date: w.wedding_date,
      venue: w.venue ?? '',
      city: w.city ?? 'Jerusalem',
      story: w.story ?? '',
      goal_usd: String(w.goal_usd ?? ''),
      status: w.status,
      chatan_father_name: w.chatan_father_name ?? '',
      chatan_mother_name: w.chatan_mother_name ?? '',
      chatan_born: w.chatan_born ?? '',
      chatan_learns_works: w.chatan_learns_works ?? '',
      chatan_link: w.chatan_link ?? '',
      chatan_bio: w.chatan_bio ?? '',
      kallah_father_name: w.kallah_father_name ?? '',
      kallah_mother_name: w.kallah_mother_name ?? '',
      kallah_born: w.kallah_born ?? '',
      kallah_learns_works: w.kallah_learns_works ?? '',
      kallah_link: w.kallah_link ?? '',
      kallah_bio: w.kallah_bio ?? '',
    };
    coverRef.current = null;
    try {
      const r = await fetch(`/api/admin/wedding-visibility?weddingId=${w.id}`);
      visRef.current = r.ok ? ((await r.json()).visibility ?? {}) : {};
    } catch {
      visRef.current = {};
    }
    setFormKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function toggleStatus(w: Wedding) {
    const status = w.status === 'active' ? 'draft' : 'active';
    const res = await fetch('/api/admin/weddings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: w.id, status }),
    });
    if (res.ok) void loadRows();
  }

  async function remove(id: string) {
    if (!window.confirm(t('confirmDelete'))) return;
    const res = await fetch(`/api/admin/weddings?id=${id}`, { method: 'DELETE' });
    if (res.ok) void loadRows();
  }

  if (notReady) {
    return (
      <div className="mx-auto max-w-md">
        <p className="card text-center font-sans text-charcoal/70">{ta('configMissing')}</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm">
        <h1 className="mb-2 text-center font-display text-3xl font-bold text-burgundy">{t('title')}</h1>
        <p className="mb-6 text-center font-sans text-sm text-charcoal/60">{ta('passwordPrompt')}</p>
        <form onSubmit={login} className="card space-y-4">
          <div>
            <label htmlFor="pw" className="label">{ta('password')}</label>
            <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" autoFocus />
          </div>
          {authError && <p className="font-sans text-sm text-red-600">{ta('wrongPassword')}</p>}
          <button type="submit" className="btn-gold w-full">{ta('unlock')}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-burgundy">{t('title')}</h1>
        <button onClick={logout} className="btn-ghost !px-4 !py-2 text-sm">{ta('logout')}</button>
      </div>

      {/* key={formKey} remounts all fields (with fresh defaults) on edit/reset only */}
      <form key={formKey} onSubmit={save} className="card space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="chatan_name_en" label={t('chatanEn')} defaultValue={values.current.chatan_name_en} onCommit={commit} />
          <TextField name="chatan_name_he" label={t('chatanHe')} defaultValue={values.current.chatan_name_he} onCommit={commit} dir="rtl" />
          <TextField name="kallah_initial" label={t('kallahInitial')} defaultValue={values.current.kallah_initial} onCommit={commit} maxLength={3} hint={t('kallahHint')} />
          <TextField name="wedding_date" label={t('weddingDate')} type="date" defaultValue={values.current.wedding_date} onCommit={commit} />
          <TextField name="venue" label={t('venue')} defaultValue={values.current.venue} onCommit={commit} />
          <TextField name="city" label={t('city')} defaultValue={values.current.city} onCommit={commit} />
          <TextField name="goal_usd" label={t('goalUsd')} type="number" defaultValue={values.current.goal_usd} onCommit={commit} />
          <TextField name="slug" label={t('slug')} defaultValue={values.current.slug} onCommit={commit} placeholder="cohen-jerusalem" hint={t('slugHint')} />
          <div>
            <label htmlFor="status" className="label">{t('status')}</label>
            <select
              id="status"
              defaultValue={values.current.status}
              onChange={(e) => commit('status', e.target.value)}
              className="field"
            >
              <option value="active">{t('active')}</option>
              <option value="draft">{t('draft')}</option>
              <option value="completed">{t('completed')}</option>
            </select>
          </div>
        </div>

        <div className="gold-divider" />

        <div className="grid gap-6 md:grid-cols-2">
          {(['chatan', 'kallah'] as const).map((side) => (
            <fieldset key={side} className="space-y-3 rounded-xl border border-gold/30 bg-cream/40 p-4">
              <legend className="px-2 font-display text-lg font-bold text-burgundy">
                {side === 'chatan' ? t('chatanSection') : t('kallahSection')}
              </legend>
              <TextField name={`${side}_father_name`} label={t('fatherName')} defaultValue={values.current[`${side}_father_name`]} onCommit={commit} />
              <TextField name={`${side}_mother_name`} label={t('motherName')} defaultValue={values.current[`${side}_mother_name`]} onCommit={commit} />
              <TextField name={`${side}_born`} label={t('born')} defaultValue={values.current[`${side}_born`]} onCommit={commit} />
              <TextField name={`${side}_learns_works`} label={t('learnsWorks')} defaultValue={values.current[`${side}_learns_works`]} onCommit={commit} />
              <TextField name={`${side}_link`} label={t('link')} defaultValue={values.current[`${side}_link`]} onCommit={commit} placeholder="https://" />
              <TextAreaField name={`${side}_bio`} label={t('bio')} defaultValue={values.current[`${side}_bio`]} onCommit={commit} />
            </fieldset>
          ))}
        </div>

        <TextAreaField name="story" label={t('story')} defaultValue={values.current.story} onCommit={commit} />

        <div>
          <label htmlFor="cover" className="label">{t('coverPhoto')}</label>
          {/* SITE POLICY: No images of women. Jerusalem / venue landscapes only. */}
          <input
            id="cover"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              coverRef.current = e.target.files?.[0] ?? null;
            }}
            className="field"
          />
          <p className="mt-1 font-sans text-xs text-red-600/80">{ta('photoPolicy')}</p>
        </div>

        {values.current.id && (
          <fieldset className="space-y-2 rounded-xl border border-burgundy/20 bg-burgundy/5 p-4">
            <legend className="px-2 font-display text-lg font-bold text-burgundy">
              {locale === 'he' ? 'נראות שדות' : 'Field Visibility'}
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {WEDDING_VISIBILITY_FIELDS.map((f) => (
                <label key={f.key} className="flex items-center gap-2 font-sans text-sm text-charcoal/80">
                  <input
                    type="checkbox"
                    defaultChecked={visRef.current[f.key] ?? true}
                    onChange={(e) => {
                      visRef.current[f.key] = e.target.checked;
                    }}
                    className="h-4 w-4 accent-gold"
                  />
                  {locale === 'he' ? f.he : f.en}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <button type="submit" disabled={saving} className="btn-gold w-full">
          {saving ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-burgundy/30 border-t-burgundy" aria-hidden />
              {t('saving')}
            </span>
          ) : (
            t('save')
          )}
        </button>

        {/* Never fail silently — always show the outcome. */}
        {saveError && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm font-medium text-red-700">
            ⚠️ {saveError}
          </p>
        )}
        {saved && !saveError && (
          <p role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center font-sans text-sm font-semibold text-green-700">
            ✓ {t('saved')}
          </p>
        )}
      </form>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-2xl font-bold text-burgundy">{t('existing')}</h2>
        {rows.length === 0 ? (
          <p className="font-sans text-charcoal/60">{t('none')}</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((w) => {
              const pct = completionPct(w);
              const isActive = w.status === 'active';
              return (
                <li key={w.id} className="rounded-xl border border-gold/30 bg-white/85 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-sans font-semibold text-charcoal">
                        {locale === 'he' ? w.chatan_name_he || w.chatan_name_en : w.chatan_name_en}
                        <span className={`ms-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${isActive ? 'bg-green-100 text-green-700' : 'bg-charcoal/10 text-charcoal/60'}`}>
                          {t(w.status)}
                        </span>
                      </p>
                      <p className="font-sans text-xs text-charcoal/50">
                        {formatDateLabel(w.wedding_date, locale)} · /{w.slug} · {t('completion', { pct })}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button onClick={() => toggleStatus(w)} className="btn-ghost !px-3 !py-1.5 text-xs">
                        {isActive ? t('setDraft') : t('setActive')}
                      </button>
                      <Link href={`/wedding/${w.slug}`} target="_blank" className="btn-ghost !px-3 !py-1.5 text-xs">
                        {t('preview')}
                      </Link>
                      <WhatsAppShareMenu wedding={w} raisedUsd={w.raisedUsd} />
                      <CopyLinkButton
                        url={`${getSiteUrl(typeof window !== 'undefined' ? window.location.origin : '')}/${locale}/wedding/${w.slug}`}
                        label={locale === 'he' ? 'העתק קישור' : 'Copy Link'}
                        copiedLabel={locale === 'he' ? 'הועתק' : 'Copied'}
                      />
                      <button onClick={() => edit(w)} className="btn-ghost !px-3 !py-1.5 text-xs">{t('edit')}</button>
                      <button onClick={() => remove(w.id)} className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">
                        {t('delete')}
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-burgundy/10">
                    <div className="h-full rounded-full bg-gold-gradient" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
