'use client';

import { useState } from 'react';
import { PRESETS, formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import type { Couple } from '@/lib/types';
import type { SponsorLabels } from './sponsorTypes';

export default function SponsorModal({
  couple,
  type,
  labels,
  locale,
  onClose,
}: {
  couple: Couple | null;
  type: 'full_package' | 'partial';
  labels: SponsorLabels;
  locale: string;
  onClose: () => void;
}) {
  const isFull = type === 'full_package' && !!couple;
  const [preset, setPreset] = useState<number | 'custom' | null>(isFull ? null : 18);
  const [custom, setCustom] = useState('');
  const [donor, setDonor] = useState('');
  const [anon, setAnon] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const amount = isFull
    ? couple!.package_price
    : preset === 'custom'
      ? Math.floor(Number(custom) || 0)
      : preset ?? 0;

  const title = couple
    ? locale === 'he'
      ? `חתן ${couple.chatan_name_he || couple.chatan_name_en}`
      : `Chatan ${couple.chatan_name_en}`
    : labels.generalTitle;

  async function pay() {
    setErr(null);
    if (!anon && !donor.trim()) {
      setErr(locale === 'he' ? 'נא להזין שם' : 'Please enter your name');
      return;
    }
    if (amount < 18) {
      setErr(labels.minNote);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupleId: couple?.id ?? null,
          amount,
          type: isFull ? 'full_package' : 'partial',
          donorName: anon ? '' : donor.trim(),
          isAnonymous: anon,
          email: email.trim(),
          locale,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setErr(data.error || (locale === 'he' ? 'שגיאה, נסו שנית' : 'Something went wrong'));
        setLoading(false);
        return;
      }
      window.location.href = data.url as string;
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-ivory p-6 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-display text-2xl font-bold text-burgundy">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-xl text-charcoal/50 hover:text-burgundy">
            ✕
          </button>
        </div>

        {isFull ? (
          <p className="mb-4 rounded-xl bg-gold/10 px-4 py-3 text-center font-display text-2xl font-bold text-burgundy">
            {labels.fullBtn}: {formatCurrency(amount)}
          </p>
        ) : (
          <div className="mb-4">
            <span className="label">{labels.amount}</span>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.usd.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPreset(p)}
                  className={cn(
                    'rounded-xl border py-2 font-sans font-semibold transition-colors',
                    preset === p ? 'border-gold bg-gold-gradient text-burgundy' : 'border-burgundy/15 bg-white text-charcoal hover:border-gold/60'
                  )}
                >
                  ${p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPreset('custom')}
                className={cn(
                  'rounded-xl border py-2 font-sans font-semibold transition-colors',
                  preset === 'custom' ? 'border-gold bg-gold-gradient text-burgundy' : 'border-burgundy/15 bg-white text-charcoal hover:border-gold/60'
                )}
              >
                {labels.custom}
              </button>
            </div>
            {preset === 'custom' && (
              <input
                type="number"
                min={18}
                inputMode="numeric"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="$"
                className="field mt-2"
                autoFocus
              />
            )}
            <p className="mt-1 font-sans text-xs text-charcoal/50">{labels.minNote}</p>
          </div>
        )}

        <label className="mb-3 flex items-center gap-2 font-sans text-sm text-charcoal/80">
          <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} className="h-4 w-4 accent-gold" />
          {labels.anonymous}
        </label>

        {!anon && (
          <div className="mb-3">
            <label className="label">{labels.donorName}</label>
            <input value={donor} onChange={(e) => setDonor(e.target.value)} className="field" />
          </div>
        )}

        <div className="mb-4">
          <label className="label">{labels.emailOpt}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" placeholder="you@example.com" />
        </div>

        {err && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 font-sans text-sm text-red-700">⚠️ {err}</p>}

        <button onClick={pay} disabled={loading} className="btn-gold w-full">
          {loading ? '…' : `${labels.proceed} — ${formatCurrency(amount)}`}
        </button>
      </div>
    </div>
  );
}
