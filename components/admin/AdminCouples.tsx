'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/routing';
import { TextField, TextAreaField } from '../AdminFields';
import Spinner from '../Spinner';
import { formatCurrency } from '@/lib/currency';
import { formatDateLabel, clampPercent } from '@/lib/utils';
import { hebrewFull } from '@/lib/hebcal';
import { CHASSIDUS_OPTIONS } from '@/lib/types';
import type { Couple } from '@/lib/types';

const EMPTY: Record<string, string> = {
  id: '',
  chatan_name_he: '',
  chatan_name_en: '',
  wedding_date: '',
  father_name_he: '',
  father_name_en: '',
  mother_name_he: '',
  mother_name_en: '',
  yeshiva: '',
  chassidus: '',
  extra_info: '',
  package_price: '750',
  status: 'active',
  notes: '',
};

export default function AdminCouples() {
  const values = useRef<Record<string, string>>({ ...EMPTY });
  const [formKey, setFormKey] = useState(0);
  const [rows, setRows] = useState<Couple[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const commit = useCallback((n: string, v: string) => {
    values.current[n] = v;
  }, []);

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/couples');
    setRows(r.ok ? ((await r.json()).couples as Couple[]) ?? [] : []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function reset() {
    values.current = { ...EMPTY };
    setFormKey((k) => k + 1);
  }

  function edit(c: Couple) {
    values.current = {
      id: c.id,
      chatan_name_he: c.chatan_name_he ?? '',
      chatan_name_en: c.chatan_name_en,
      wedding_date: c.wedding_date,
      father_name_he: c.father_name_he ?? '',
      father_name_en: c.father_name_en ?? '',
      mother_name_he: c.mother_name_he ?? '',
      mother_name_en: c.mother_name_en ?? '',
      yeshiva: c.yeshiva ?? '',
      chassidus: c.chassidus ?? '',
      extra_info: c.extra_info ?? '',
      package_price: String(c.package_price ?? 750),
      status: c.status,
      notes: c.notes ?? '',
    };
    setFormKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const v = values.current;
    if (!v.chatan_name_en || !v.wedding_date) {
      setErr('Chatan name (English) and wedding date are required.');
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/admin/couples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v),
      });
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

  async function toggle(c: Couple) {
    const status = c.status === 'active' ? 'draft' : 'active';
    const r = await fetch('/api/admin/couples', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: c.id, status }),
    });
    if (r.ok) void load();
  }

  async function del(id: string) {
    if (!window.confirm('Delete this couple?')) return;
    const r = await fetch(`/api/admin/couples?id=${id}`, { method: 'DELETE' });
    if (r.ok) void load();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/admin" className="font-sans text-sm text-charcoal/60 hover:text-burgundy">
        ← Admin
      </Link>
      <h1 className="mb-6 font-display text-3xl font-bold text-burgundy">Couples</h1>

      <form key={formKey} onSubmit={save} className="card space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="chatan_name_en" label="Chatan name (English) *" defaultValue={values.current.chatan_name_en} onCommit={commit} />
          <TextField name="chatan_name_he" label="Chatan name (Hebrew)" defaultValue={values.current.chatan_name_he} onCommit={commit} dir="rtl" />
          <div>
            <label htmlFor="wedding_date" className="label">Wedding date *</label>
            <input
              id="wedding_date"
              type="date"
              defaultValue={values.current.wedding_date}
              onChange={(e) => commit('wedding_date', e.target.value)}
              className="field"
            />
          </div>
          <TextField name="package_price" label="Full package price (USD)" type="number" defaultValue={values.current.package_price} onCommit={commit} />
          <TextField name="father_name_en" label="Father (English)" defaultValue={values.current.father_name_en} onCommit={commit} />
          <TextField name="father_name_he" label="Father (Hebrew)" defaultValue={values.current.father_name_he} onCommit={commit} dir="rtl" />
          <TextField name="mother_name_en" label="Mother (English)" defaultValue={values.current.mother_name_en} onCommit={commit} />
          <TextField name="mother_name_he" label="Mother (Hebrew)" defaultValue={values.current.mother_name_he} onCommit={commit} dir="rtl" />
          <TextField name="yeshiva" label="Yeshiva / Where he learned" defaultValue={values.current.yeshiva} onCommit={commit} />
          <div>
            <label htmlFor="chassidus" className="label">Chassidus</label>
            <input
              id="chassidus"
              list="chassidus-list"
              defaultValue={values.current.chassidus}
              onBlur={(e) => commit('chassidus', e.target.value)}
              className="field"
              placeholder="Choose or type…"
            />
            <datalist id="chassidus-list">
              {CHASSIDUS_OPTIONS.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="status" className="label">Status</label>
            <select id="status" defaultValue={values.current.status} onChange={(e) => commit('status', e.target.value)} className="field">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <TextAreaField name="extra_info" label="Extra info (shown publicly if filled)" defaultValue={values.current.extra_info} onCommit={commit} />
        <TextAreaField name="notes" label="Internal notes (never shown publicly)" defaultValue={values.current.notes} onCommit={commit} />

        <button type="submit" disabled={saving} className="btn-gold w-full">
          {saving ? 'Saving…' : values.current.id ? 'Update Couple' : 'Add Couple'}
        </button>
        {err && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm font-medium text-red-700">⚠️ {err}</p>}
        {saved && !err && <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center font-sans text-sm font-semibold text-green-700">✓ Saved!</p>}
      </form>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-2xl font-bold text-burgundy">Existing couples</h2>
        {rows === null ? (
          <Spinner label="Loading…" />
        ) : rows.length === 0 ? (
          <p className="font-sans text-charcoal/60">No couples yet.</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((c) => {
              const pct = clampPercent(c.total_raised, c.package_price);
              const active = c.status === 'active';
              return (
                <li key={c.id} className="rounded-xl border border-gold/30 bg-white/85 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-sans font-semibold text-charcoal">
                        Chatan {c.chatan_name_en}
                        <span className={`ms-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${active ? 'bg-green-100 text-green-700' : 'bg-charcoal/10 text-charcoal/60'}`}>
                          {c.status}
                        </span>
                      </p>
                      <p className="font-sans text-xs text-charcoal/50">
                        {hebrewFull(c.wedding_date)} · {formatDateLabel(c.wedding_date, 'en')} · {pct}% of {formatCurrency(c.package_price)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button onClick={() => toggle(c)} className="btn-ghost !px-3 !py-1.5 text-xs">
                        {active ? 'Set Draft' : 'Activate'}
                      </button>
                      <button onClick={() => edit(c)} className="btn-ghost !px-3 !py-1.5 text-xs">Edit</button>
                      <button onClick={() => del(c.id)} className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">
                        Delete
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
