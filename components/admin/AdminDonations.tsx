'use client';

import { useCallback, useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import Spinner from '../Spinner';
import { formatCurrency } from '@/lib/currency';
import { formatDateLabel } from '@/lib/utils';

interface Row {
  id: string;
  donor_name: string;
  amount: number;
  type: string;
  couple_name: string | null;
  email: string | null;
  created_at: string;
}
interface Summary {
  total: number;
  donors: number;
  thisMonth: number;
  topCouple: string;
  topAmount: number;
}

export default function AdminDonations() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/donations');
    if (r.ok) {
      const d = await r.json();
      setRows(d.rows ?? []);
      setSummary(d.summary ?? null);
    } else {
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function exportCsv() {
    if (!rows) return;
    const header = ['Date', 'Donor', 'Amount', 'Type', 'Couple', 'Email'];
    const lines = rows.map((r) =>
      [
        new Date(r.created_at).toISOString().slice(0, 10),
        r.donor_name,
        r.amount,
        r.type,
        r.couple_name ?? '',
        r.email ?? '',
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [header.join(','), ...lines].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <Link href="/admin" className="font-sans text-sm text-charcoal/60 hover:text-burgundy">
            ← Admin
          </Link>
          <h1 className="font-display text-3xl font-bold text-burgundy">Donations</h1>
        </div>
        <button onClick={exportCsv} className="btn-ghost text-sm">
          Export CSV
        </button>
      </div>

      {summary && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card label="Total raised" value={formatCurrency(summary.total)} />
          <Card label="Donors" value={String(summary.donors)} />
          <Card label="This month" value={formatCurrency(summary.thisMonth)} />
          <Card label="Top couple" value={summary.topCouple || '—'} />
        </div>
      )}

      {rows === null ? (
        <Spinner label="Loading…" />
      ) : rows.length === 0 ? (
        <p className="font-sans text-charcoal/60">No donations yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gold/30 bg-white/85">
          <table className="w-full text-start font-sans text-sm">
            <thead className="bg-cream/60 text-charcoal/70">
              <tr>
                <th className="px-3 py-2 text-start">Date</th>
                <th className="px-3 py-2 text-start">Donor</th>
                <th className="px-3 py-2 text-end">Amount</th>
                <th className="px-3 py-2 text-start">Couple</th>
                <th className="px-3 py-2 text-start">Type</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-gold/15">
                  <td className="px-3 py-2 text-charcoal/60">{formatDateLabel(r.created_at.slice(0, 10), 'en')}</td>
                  <td className="px-3 py-2">{r.donor_name}</td>
                  <td className="px-3 py-2 text-end font-semibold text-burgundy">{formatCurrency(r.amount)}</td>
                  <td className="px-3 py-2">{r.couple_name ?? '—'}</td>
                  <td className="px-3 py-2 text-charcoal/60">{r.type === 'full_package' ? 'Full' : 'Partial'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="card text-center">
      <p className="truncate font-display text-2xl font-bold text-burgundy">{value}</p>
      <p className="font-sans text-xs text-charcoal/60">{label}</p>
    </div>
  );
}
