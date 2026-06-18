'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { hasAdminUiCookie } from '@/lib/adminClient';
import type { SiteContentRow } from '@/lib/siteContent';

type Section = { id: string; icon: string; label: string };
type Edit = Partial<Pick<SiteContentRow, 'value_en' | 'value_he' | 'is_visible'>>;

const LONG = new Set(['textarea', 'richtext', 'whatsapp', 'email']);

const RowEditor = memo(function RowEditor({
  row,
  onChange,
}: {
  row: SiteContentRow;
  onChange: (key: string, e: Edit) => void;
}) {
  const [visible, setVisible] = useState(row.is_visible);

  if (row.type === 'toggle') {
    return (
      <div className="flex items-center justify-between rounded-lg border border-gold/20 bg-white px-4 py-3">
        <span className="font-sans text-sm font-medium text-charcoal">{row.label}</span>
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            defaultChecked={(row.value_en ?? 'true') !== 'false'}
            onChange={(e) => onChange(row.key, { value_en: String(e.target.checked), value_he: String(e.target.checked) })}
            className="h-4 w-4 accent-gold"
          />
          <span className="font-sans text-xs text-charcoal/60">{row.key}</span>
        </label>
      </div>
    );
  }

  const long = LONG.has(row.type);
  return (
    <div className={cn('rounded-lg border border-gold/20 bg-white p-4', !visible && 'opacity-60')}>
      <div className="mb-2 flex items-center justify-between">
        <span className={cn('font-sans text-sm font-semibold text-charcoal', !visible && 'line-through')}>
          {row.label}
          {!visible && <span className="ms-2 text-xs text-red-600/80">(hidden)</span>}
        </span>
        <button
          type="button"
          aria-label="toggle visibility"
          onClick={() => {
            const v = !visible;
            setVisible(v);
            onChange(row.key, { is_visible: v });
          }}
          className="text-lg"
        >
          {visible ? '👁️' : '🙈'}
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <span className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-charcoal/40">English</span>
          {long ? (
            <textarea defaultValue={row.value_en} onBlur={(e) => onChange(row.key, { value_en: e.target.value })} className="field min-h-24 resize-y" />
          ) : (
            <input defaultValue={row.value_en} onBlur={(e) => onChange(row.key, { value_en: e.target.value })} className="field" />
          )}
        </div>
        <div>
          <span className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-charcoal/40">עברית</span>
          {long ? (
            <textarea dir="rtl" defaultValue={row.value_he} onBlur={(e) => onChange(row.key, { value_he: e.target.value })} className="field min-h-24 resize-y" />
          ) : (
            <input dir="rtl" defaultValue={row.value_he} onBlur={(e) => onChange(row.key, { value_he: e.target.value })} className="field" />
          )}
        </div>
      </div>
      <p className="mt-1 font-sans text-[10px] text-charcoal/40">{row.key}</p>
    </div>
  );
});

export default function AdminContentClient({
  sections,
  supabaseReady,
  adminReady,
}: {
  sections: Section[];
  supabaseReady: boolean;
  adminReady: boolean;
}) {
  const ta = useTranslations('Admin');
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  const [rows, setRows] = useState<SiteContentRow[]>([]);
  const [active, setActive] = useState(sections[0]?.id ?? 'homepage');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const edits = useRef<Record<string, Edit>>({});

  const notReady = !supabaseReady || !adminReady;

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/content');
    if (res.ok) {
      setRows(((await res.json()).rows as SiteContentRow[]) ?? []);
      edits.current = {};
    } else if (res.status === 401) setAuthed(false);
  }, []);

  useEffect(() => {
    if (hasAdminUiCookie()) setAuthed(true);
  }, []);
  useEffect(() => {
    if (authed) void load();
  }, [authed, load]);

  const onChange = useCallback((key: string, e: Edit) => {
    edits.current[key] = { ...edits.current[key], ...e };
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(false);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) setAuthed(true);
    else setAuthError(true);
  }

  async function saveAll() {
    setSaving(true);
    setSaved(false);
    const merged = rows
      .filter((r) => edits.current[r.key])
      .map((r) => ({ ...r, ...edits.current[r.key] }));
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', rows: merged }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      void load();
    }
  }

  async function reset(section?: string) {
    if (!window.confirm(section ? `Reset "${section}" to defaults?` : 'Load all defaults?')) return;
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset', section }),
    });
    void load();
  }

  if (notReady) {
    return <div className="mx-auto max-w-md"><p className="card text-center font-sans text-charcoal/70">{ta('configMissing')}</p></div>;
  }
  if (!authed) {
    return (
      <div className="mx-auto max-w-sm">
        <h1 className="mb-2 text-center font-display text-3xl font-bold text-burgundy">{ta('title')}</h1>
        <form onSubmit={login} className="card space-y-4">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={ta('password')} className="field" autoFocus />
          {authError && <p className="font-sans text-sm text-red-600">{ta('wrongPassword')}</p>}
          <button type="submit" className="btn-gold w-full">{ta('unlock')}</button>
        </form>
      </div>
    );
  }

  const q = search.trim().toLowerCase();
  const shown = rows.filter((r) =>
    q
      ? r.label.toLowerCase().includes(q) || r.key.toLowerCase().includes(q) || r.value_en.toLowerCase().includes(q) || r.value_he.includes(search.trim())
      : r.section === active
  );

  return (
    <div className="mx-auto max-w-6xl">
      {/* Top bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-bold text-burgundy">Content Editor</h1>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all strings…"
            className="field !w-56 !py-2 text-sm"
          />
          <button onClick={() => reset()} className="btn-ghost !px-3 !py-2 text-xs">Load defaults</button>
          <button onClick={saveAll} disabled={saving} className="btn-gold !px-5 !py-2 text-sm">
            {saving ? ta('saving') : saved ? ta('saved') : 'Save All Changes'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        {/* Sidebar */}
        <nav className="flex flex-row flex-wrap gap-1 md:flex-col">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => { setActive(s.id); setSearch(''); }}
              className={cn(
                'rounded-lg px-3 py-2 text-start font-sans text-sm transition-colors',
                active === s.id && !q ? 'bg-gold-gradient font-semibold text-burgundy' : 'text-charcoal/70 hover:bg-cream'
              )}
            >
              <span className="me-2" aria-hidden>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>

        {/* Rows */}
        <div className="space-y-3">
          {!q && active !== 'settings' && (
            <div className="flex justify-end">
              <button onClick={() => reset(active)} className="font-sans text-xs text-burgundy/70 hover:underline">
                Reset this section
              </button>
            </div>
          )}
          {shown.length === 0 ? (
            <p className="font-sans text-charcoal/60">No strings here.</p>
          ) : (
            shown.map((r) => <RowEditor key={r.key} row={r} onChange={onChange} />)
          )}
        </div>
      </div>
    </div>
  );
}
