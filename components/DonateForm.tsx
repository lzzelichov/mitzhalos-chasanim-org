'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { cn, formatDateLabel } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
import { hebrewFull, buildMonth, firstWeekday, gregMonthLabel, hebrewMonthLabel } from '@/lib/hebcal';
import type { DateOption, SponsorTile } from '@/lib/types';

interface Preset {
  amount: number;
  label?: string;
}
const PRESETS: Preset[] = [
  { amount: 18, label: 'Tikkun Olam' },
  { amount: 36, label: 'Chai' },
  { amount: 54, label: 'Chai+' },
  { amount: 100, label: 'Generous' },
  { amount: 180, label: "Ba'al Chesed" },
];

export default function DonateForm({
  mode = 'legacy',
  stripeConfigured,
  weddingSlug,
  weddingId,
  chatanName,
  weddingDateISO,
  sponsored = {},
  dateOptions = [],
  preselectedDate,
}: {
  mode?: 'legacy' | 'wedding';
  stripeConfigured: boolean;
  weddingSlug?: string;
  weddingId?: string;
  chatanName?: string;
  weddingDateISO?: string;
  sponsored?: Record<string, SponsorTile>;
  dateOptions?: DateOption[];
  preselectedDate?: string | null;
}) {
  const t = useTranslations('Donate');
  const locale = useLocale();
  const L = (en: string, he: string) => (locale === 'he' ? he : en);
  const isWedding = mode === 'wedding';

  const [step, setStep] = useState(1);
  const [preset, setPreset] = useState<number | 'custom' | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [sponsorDate, setSponsorDate] = useState(preselectedDate ?? '');
  const [dedicatedDateId, setDedicatedDateId] = useState(
    dateOptions.find((o) => o.date === preselectedDate)?.id ?? ''
  );
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const amount = preset === 'custom' ? Math.floor(Number(customAmount) || 0) : preset ?? 0;

  const month = useMemo(() => {
    if (!weddingDateISO) return null;
    const d = new Date(weddingDateISO + 'T00:00:00');
    return { days: buildMonth(d.getFullYear(), d.getMonth()), lead: firstWeekday(d.getFullYear(), d.getMonth()), y: d.getFullYear(), m: d.getMonth() };
  }, [weddingDateISO]);

  async function pay() {
    setError(null);
    if (!isAnonymous && !donorName.trim()) return setError(t('nameRequired'));
    if (!amount || amount < 1) return setError(t('amountRequired'));
    if (!stripeConfigured) return setError(t('stripeMissing'));
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          donorName: isAnonymous ? '' : donorName.trim(),
          donorEmail: donorEmail.trim(),
          isAnonymous,
          locale,
          weddingId: isWedding ? weddingId : null,
          weddingSlug: isWedding ? weddingSlug : null,
          sponsorDate: isWedding ? sponsorDate : null,
          dedicatedDateId: !isWedding ? dedicatedDateId || null : null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error === 'stripe_not_configured' ? t('stripeMissing') : t('errorGeneric'));
        setLoading(false);
        return;
      }
      window.location.href = data.url as string;
    } catch {
      setError(t('errorGeneric'));
      setLoading(false);
    }
  }

  const steps = [L('Amount', 'סכום'), L('Date', 'תאריך'), L('Details', 'פרטים'), L('Payment', 'תשלום')];

  return (
    <div className="card space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        {steps.map((s, i) => {
          const n = i + 1;
          const active = step >= n;
          return (
            <div key={s} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold', active ? 'bg-gold-gradient text-burgundy' : 'bg-burgundy/10 text-charcoal/50')}>
                  {n < 4 ? n : '★'}
                </span>
                <span className={cn('mt-1 font-sans text-[10px]', active ? 'text-burgundy' : 'text-charcoal/40')}>{s}</span>
              </div>
              {i < steps.length - 1 && <div className={cn('mx-1 h-px flex-1', step > n ? 'bg-gold' : 'bg-burgundy/15')} />}
            </div>
          );
        })}
      </div>

      {isWedding && chatanName && (
        <p className="rounded-xl bg-gold/10 px-4 py-3 text-center font-sans text-sm font-semibold text-burgundy">
          {t('forWedding', { name: chatanName })}
        </p>
      )}

      {/* STEP 1 — Amount */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PRESETS.map((p) => (
              <button key={p.amount} type="button" onClick={() => setPreset(p.amount)}
                className={cn('flex min-h-[64px] flex-col items-center justify-center rounded-xl border px-3 py-3 text-center font-sans transition-colors',
                  preset === p.amount ? 'border-gold bg-gold-gradient text-burgundy shadow-glow' : 'border-burgundy/15 bg-white text-charcoal hover:border-gold/60')}>
                <span className="text-lg font-bold">${p.amount}</span>
                {p.label && <span className="text-[11px] opacity-80">{p.label}</span>}
              </button>
            ))}
            <button type="button" onClick={() => setPreset('custom')}
              className={cn('flex min-h-[64px] items-center justify-center rounded-xl border px-3 py-3 font-sans font-semibold transition-colors',
                preset === 'custom' ? 'border-gold bg-gold-gradient text-burgundy shadow-glow' : 'border-burgundy/15 bg-white text-charcoal hover:border-gold/60')}>
              {t('custom')}
            </button>
          </div>
          {preset === 'custom' && (
            <input type="number" min={1} inputMode="numeric" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} placeholder={t('customPlaceholder')} className="field" autoFocus />
          )}

          <button type="button" disabled={amount < 1} onClick={() => setStep(2)} className="btn-gold w-full">
            {L('Next →', '← הבא')}
          </button>
        </div>
      )}

      {/* STEP 2 — Date */}
      {step === 2 && (
        <div className="space-y-5">
          {isWedding && month ? (
            <div>
              <p className="mb-2 text-center font-display text-lg font-bold text-burgundy">
                {gregMonthLabel(month.y, month.m, locale)} · <span className="text-gold">{hebrewMonthLabel(month.y, month.m)}</span>
              </p>
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: month.lead }).map((_, i) => <div key={`l${i}`} />)}
                {month.days.map((d) => {
                  const taken = Boolean(sponsored[d.iso]?.filled);
                  const sel = sponsorDate === d.iso;
                  return (
                    <button key={d.iso} type="button" disabled={taken} onClick={() => setSponsorDate(d.iso)}
                      className={cn('aspect-square rounded-lg border p-1 text-center font-sans transition-colors',
                        taken ? 'cursor-not-allowed border-charcoal/10 bg-charcoal/10 text-charcoal/30'
                        : sel ? 'border-gold bg-gold-gradient text-burgundy shadow-glow'
                        : 'border-dashed border-gold/50 bg-cream text-charcoal hover:border-gold')}>
                      <span className="block text-sm font-bold leading-none">{d.gregDay}</span>
                      <span className="block text-[8px] leading-tight opacity-70">{d.hebrew.short}</span>
                    </button>
                  );
                })}
              </div>
              {sponsorDate && <p className="mt-2 text-center font-sans text-xs text-gold">{hebrewFull(sponsorDate)}</p>}
            </div>
          ) : (
            dateOptions.length > 0 && (
              <div>
                <label className="label">{t('dedicate')}</label>
                <select value={dedicatedDateId} onChange={(e) => setDedicatedDateId(e.target.value)} className="field">
                  <option value="">{t('dedicateNone')}</option>
                  {dateOptions.map((o) => (
                    <option key={o.id} value={o.id}>{formatDateLabel(o.date, locale)}{o.title ? ` — ${o.title}` : ''}</option>
                  ))}
                </select>
              </div>
            )
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn-ghost">{L('← Back', 'חזרה →')}</button>
            <button type="button" onClick={() => { if (isWedding) setSponsorDate(''); else setDedicatedDateId(''); setStep(3); }} className="btn-ghost flex-1">
              {L('Skip — no specific date', 'דלגו — ללא תאריך')}
            </button>
            <button type="button" onClick={() => setStep(3)} className="btn-gold flex-1">{L('Next →', '← הבא')}</button>
          </div>
        </div>
      )}

      {/* STEP 3 — Details */}
      {step === 3 && (
        <div className="space-y-4">
          <label className="flex items-center gap-2 font-sans text-sm text-charcoal/80">
            <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="h-4 w-4 accent-gold" />
            {t('anonymous')}
          </label>

          {!isAnonymous && (
            <div>
              <label htmlFor="dn" className="label">{t('donorName')}</label>
              <input id="dn" value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder={t('donorNamePlaceholder')} className="field" />
            </div>
          )}

          <div>
            <label htmlFor="em" className="label">{L('Email (optional, for confirmation)', 'אימייל (רשות, לאישור)')}</label>
            <input id="em" type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} placeholder="you@example.com" className="field" />
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-gold/30 bg-cream/50 p-4 font-sans text-sm">
            <div className="flex justify-between"><span className="text-charcoal/60">{L('Wedding', 'חתונה')}</span><span className="font-semibold text-burgundy">{chatanName ? `Chatan ${chatanName}` : L('General fund', 'קרן כללית')}</span></div>
            {(isWedding ? sponsorDate : dedicatedDateId) && (
              <div className="mt-1 flex justify-between"><span className="text-charcoal/60">{L('Date', 'תאריך')}</span><span className="text-charcoal">{isWedding && sponsorDate ? `${hebrewFull(sponsorDate)} · ${formatDateLabel(sponsorDate, locale)}` : formatDateLabel(dateOptions.find((o) => o.id === dedicatedDateId)?.date ?? '', locale)}</span></div>
            )}
            <div className="mt-1 flex justify-between"><span className="text-charcoal/60">{t('amount')}</span><span className="font-bold text-burgundy">{formatCurrency(amount)}</span></div>
          </div>

          {error && <p className="rounded-xl bg-red-50 px-4 py-3 font-sans text-sm text-red-700">{error}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="btn-ghost">{L('← Back', 'חזרה →')}</button>
            <button type="button" onClick={pay} disabled={loading} className="btn-gold flex-1">
              {loading ? t('processing') : L('Pay Now →', '← שלמו עכשיו')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
