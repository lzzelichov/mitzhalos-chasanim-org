'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/routing';
import Spinner from '../Spinner';

interface Row {
  key: string;
  section: string;
  label: string;
  type: string;
  value_en: string;
  value_he: string;
  is_visible: boolean;
}

const SECTION_META: Record<string, string> = {
  homepage: '🏠 Homepage',
  about: 'ℹ️ About',
  sponsor: '🤝 Sponsor',
  news: '📰 News',
  contact: '📞 Contact',
  navigation: '🧭 Navigation',
  footer: '🦶 Footer',
  donate: '💳 Donate Flow',
  thankyou: '🎉 Thank You',
  errors: '⚠️ Errors',
  settings: '⚙️ Settings',
};

export default function AdminContentEditor({ mode }: { mode: 'content' | 'settings' }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const store = useRef<Record<string, Row>>({});

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/admin/content');
      const d = await r.json().catch(() => ({ rows: [] }));
      const rs = (d.rows || []) as Row[];
      store.current = Object.fromEntries(rs.map((x) => [x.key, { ...x }]));
      setRows(rs);
    })();
  }, []);

  function set(key: string, field: keyof Row, val: string | boolean) {
    store.current[key] = { ...store.current[key], [field]: val } as Row;
  }

  async function saveAll() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: Object.values(store.current) }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) setMsg({ ok: true, text: 'Saved!' });
      else setMsg({ ok: false, text: d.error || 'Save failed' });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'error' });
    } finally {
      setSaving(false);
    }
  }

  if (!rows) return <Spinner label="Loading…" />;

  const shown = rows.filter((r) => (mode === 'settings' ? r.section === 'settings' : r.section !== 'settings'));
  const sections = Array.from(new Set(shown.map((r) => r.section)));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <Link href="/admin" className="font-sans text-sm text-charcoal/60 hover:text-burgundy">
            ← Admin
          </Link>
          <h1 className="font-display text-3xl font-bold text-burgundy">
            {mode === 'settings' ? 'Site Settings' : 'Content CMS'}
          </h1>
        </div>
        <button onClick={saveAll} disabled={saving} className="btn-gold">
          {saving ? 'Saving…' : 'Save All'}
        </button>
      </div>

      {msg && (
        <p
          className={`mb-4 rounded-xl border px-4 py-3 font-sans text-sm font-semibold ${
            msg.ok ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {msg.ok ? '✓ ' : '⚠️ '}
          {msg.text}
        </p>
      )}

      <div className="space-y-8">
        {sections.map((sec) => (
          <section key={sec}>
            <h2 className="mb-3 font-display text-xl font-bold text-burgundy">{SECTION_META[sec] || sec}</h2>
            <div className="space-y-4">
              {shown
                .filter((r) => r.section === sec)
                .map((r) => (
                  <div key={r.key} className="card">
                    <p className="mb-2 font-sans text-sm font-semibold text-charcoal/80">{r.label}</p>

                    {r.type === 'toggle' ? (
                      <label className="flex items-center gap-2 font-sans text-sm text-charcoal/80">
                        <input
                          type="checkbox"
                          defaultChecked={r.value_en !== 'false'}
                          onChange={(e) => {
                            set(r.key, 'value_en', e.target.checked ? 'true' : 'false');
                            set(r.key, 'value_he', e.target.checked ? 'true' : 'false');
                          }}
                          className="h-4 w-4 accent-gold"
                        />
                        Enabled
                      </label>
                    ) : mode === 'settings' ? (
                      <input
                        defaultValue={r.value_en}
                        type={r.type === 'number' ? 'number' : 'text'}
                        onBlur={(e) => {
                          set(r.key, 'value_en', e.target.value);
                          set(r.key, 'value_he', e.target.value);
                        }}
                        className="field"
                      />
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {r.type === 'textarea' || r.type === 'whatsapp' ? (
                          <>
                            <textarea defaultValue={r.value_en} onBlur={(e) => set(r.key, 'value_en', e.target.value)} className="field min-h-24" placeholder="English" />
                            <textarea defaultValue={r.value_he} onBlur={(e) => set(r.key, 'value_he', e.target.value)} dir="rtl" className="field min-h-24" placeholder="עברית" />
                          </>
                        ) : (
                          <>
                            <input defaultValue={r.value_en} onBlur={(e) => set(r.key, 'value_en', e.target.value)} className="field" placeholder="English" />
                            <input defaultValue={r.value_he} onBlur={(e) => set(r.key, 'value_he', e.target.value)} dir="rtl" className="field" placeholder="עברית" />
                          </>
                        )}
                        <label className="col-span-full flex items-center gap-2 font-sans text-xs text-charcoal/60">
                          <input
                            type="checkbox"
                            defaultChecked={r.is_visible !== false}
                            onChange={(e) => set(r.key, 'is_visible', e.target.checked)}
                            className="h-3.5 w-3.5 accent-gold"
                          />
                          👁 Visible on the site
                        </label>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
