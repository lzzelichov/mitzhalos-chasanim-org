'use client';

import { memo, useEffect, useRef, useState } from 'react';
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
  default_en?: string;
  default_he?: string;
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

type Status = 'idle' | 'saving' | 'saved' | 'failed';

function StatusBadge({ status }: { status: Status }) {
  if (status === 'idle') return null;
  const map = {
    saving: { text: '…', cls: 'text-charcoal/40' },
    saved: { text: '✓ Saved', cls: 'text-green-600' },
    failed: { text: '✗ Failed', cls: 'text-red-600' },
  } as const;
  const m = map[status];
  return <span className={`font-sans text-xs font-semibold ${m.cls}`}>{m.text}</span>;
}

/** One auto-saving row. Saves on toggle/visibility change and on text blur. */
function ContentRowBase({ row }: { row: Row }) {
  const [val, setVal] = useState<Row>(row);
  const lastGood = useRef<Row>(row);
  const [status, setStatus] = useState<Status>('idle');
  const tref = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (tref.current) clearTimeout(tref.current); }, []);

  function flash(s: Status) {
    setStatus(s);
    if (tref.current) clearTimeout(tref.current);
    tref.current = setTimeout(() => setStatus('idle'), s === 'failed' ? 2500 : 1200);
  }

  async function persist(next: Row) {
    setVal(next);
    setStatus('saving');
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: [next] }),
      });
      if (!res.ok) throw new Error();
      lastGood.current = next;
      flash('saved');
    } catch {
      setVal(lastGood.current); // revert to last known-good value
      flash('failed');
    }
  }

  function resetDefault() {
    persist({ ...val, value_en: row.default_en ?? '', value_he: row.default_he ?? '', is_visible: true });
  }

  const isToggle = row.type === 'toggle';
  const isSettingValue = row.section === 'settings' && !isToggle;

  return (
    <div className="card">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-sans text-sm font-semibold text-charcoal/80">{row.label}</p>
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          <button onClick={resetDefault} className="font-sans text-xs text-charcoal/40 underline hover:text-burgundy" title="Reset to default">
            reset
          </button>
        </div>
      </div>

      {isToggle ? (
        <label className="flex items-center gap-2 font-sans text-sm text-charcoal/80">
          <input
            type="checkbox"
            checked={val.value_en !== 'false'}
            onChange={(e) =>
              persist({ ...val, value_en: e.target.checked ? 'true' : 'false', value_he: e.target.checked ? 'true' : 'false' })
            }
            className="h-4 w-4 accent-gold"
          />
          Enabled
        </label>
      ) : isSettingValue ? (
        <input
          value={val.value_en}
          type={row.type === 'number' ? 'number' : 'text'}
          onChange={(e) => setVal({ ...val, value_en: e.target.value, value_he: e.target.value })}
          onBlur={() => persist(val)}
          className="field"
        />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {row.type === 'textarea' || row.type === 'whatsapp' ? (
            <>
              <textarea value={val.value_en} onChange={(e) => setVal({ ...val, value_en: e.target.value })} onBlur={() => persist(val)} className="field min-h-24" placeholder="English" />
              <textarea value={val.value_he} onChange={(e) => setVal({ ...val, value_he: e.target.value })} onBlur={() => persist(val)} dir="rtl" className="field min-h-24" placeholder="עברית" />
            </>
          ) : (
            <>
              <input value={val.value_en} onChange={(e) => setVal({ ...val, value_en: e.target.value })} onBlur={() => persist(val)} className="field" placeholder="English" />
              <input value={val.value_he} onChange={(e) => setVal({ ...val, value_he: e.target.value })} onBlur={() => persist(val)} dir="rtl" className="field" placeholder="עברית" />
            </>
          )}
          <label className="col-span-full flex items-center gap-2 font-sans text-xs text-charcoal/60">
            <input
              type="checkbox"
              checked={val.is_visible !== false}
              onChange={(e) => persist({ ...val, is_visible: e.target.checked })}
              className="h-3.5 w-3.5 accent-gold"
            />
            👁 Visible on the site
          </label>
        </div>
      )}
    </div>
  );
}
const ContentRow = memo(ContentRowBase);

export default function AdminContentEditor({ mode }: { mode: 'content' | 'settings' }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/admin/content');
      const d = await r.json().catch(() => ({ rows: [] }));
      setRows((d.rows || []) as Row[]);
    })();
  }, []);

  if (!rows) return <Spinner label="Loading…" />;

  const q = query.trim().toLowerCase();
  const shown = rows
    .filter((r) => (mode === 'settings' ? r.section === 'settings' : r.section !== 'settings'))
    .filter((r) => !q || `${r.label} ${r.key} ${r.value_en} ${r.value_he}`.toLowerCase().includes(q));
  const sections = Array.from(new Set(shown.map((r) => r.section)));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/admin" className="font-sans text-sm text-charcoal/60 hover:text-burgundy">
        ← Admin
      </Link>
      <h1 className="font-display text-3xl font-bold text-burgundy">
        {mode === 'settings' ? 'Site Settings' : 'Content CMS'}
      </h1>
      <p className="mb-4 font-sans text-sm text-charcoal/50">Changes save automatically.</p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="🔍 Search labels and text…"
        className="field mb-6"
      />

      {sections.length === 0 ? (
        <p className="font-sans text-charcoal/50">No matches.</p>
      ) : (
        <div className="space-y-8">
          {sections.map((sec) => (
            <section key={sec}>
              <h2 className="mb-3 font-display text-xl font-bold text-burgundy">{SECTION_META[sec] || sec}</h2>
              <div className="space-y-4">
                {shown.filter((r) => r.section === sec).map((r) => (
                  <ContentRow key={r.key} row={r} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
