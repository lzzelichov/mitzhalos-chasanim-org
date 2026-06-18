'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { buildMonth, gregMonthLabel, hebrewMonthLabel, firstWeekday } from '@/lib/hebcal';
import type { SponsorTile } from '@/lib/types';

type View = 'greg' | 'hebrew';

export default function DateGrid({
  year,
  month,
  sponsored,
  weddingSlug,
  defaultView,
  showDonorNames = true,
}: {
  year: number;
  month: number; // 0-based
  sponsored: Record<string, SponsorTile>;
  weddingSlug?: string;
  defaultView?: View;
  showDonorNames?: boolean;
}) {
  const t = useTranslations('Grid');
  const locale = useLocale();
  const intlLocale = locale === 'he' ? 'he-IL' : 'en-US';

  const [view, setView] = useState<View>(defaultView ?? (locale === 'he' ? 'hebrew' : 'greg'));
  const [cur, setCur] = useState({ year, month });

  const days = useMemo(() => buildMonth(cur.year, cur.month), [cur]);
  const lead = useMemo(() => firstWeekday(cur.year, cur.month), [cur]);

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(intlLocale, { weekday: 'short' });
    return Array.from({ length: 7 }, (_, d) => fmt.format(new Date(2023, 0, 1 + d)));
  }, [intlLocale]);

  const shortFmt = useMemo(
    () => new Intl.DateTimeFormat(intlLocale, { month: 'short', day: 'numeric' }),
    [intlLocale]
  );

  function shiftMonth(delta: number) {
    setCur((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function hrefFor(iso: string, filled: boolean): string | null {
    if (weddingSlug) return filled ? null : `/donate?wedding=${weddingSlug}&date=${iso}`;
    return filled ? `/date/${iso}` : `/donate?date=${iso}`;
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header: month navigation + view toggle */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => shiftMonth(-1)} aria-label={t('prev')} className="btn-ghost !px-3 !py-1.5">
            <span className="flip-rtl">‹</span>
          </button>
          <div className="text-center">
            <div className="font-display text-xl font-bold text-burgundy">
              {gregMonthLabel(cur.year, cur.month, locale)}
            </div>
            <div className="font-serif text-sm italic text-gold">
              {hebrewMonthLabel(cur.year, cur.month)}
            </div>
          </div>
          <button onClick={() => shiftMonth(1)} aria-label={t('next')} className="btn-ghost !px-3 !py-1.5">
            <span className="flip-rtl">›</span>
          </button>
        </div>

        <div className="flex items-center gap-1 self-center rounded-full border border-burgundy/15 bg-white/70 p-0.5">
          {(['greg', 'hebrew'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={cn(
                'rounded-full px-3 py-1 font-sans text-xs font-semibold transition-colors',
                view === v ? 'bg-gold-gradient text-burgundy' : 'text-charcoal/60 hover:text-charcoal'
              )}
            >
              {v === 'greg' ? t('gregView') : t('hebrewView')}
            </button>
          ))}
        </div>
      </div>

      {/* Weekday header */}
      <div className="mb-1 grid grid-cols-7 gap-1.5 sm:gap-2">
        {weekdays.map((w, i) => (
          <div key={i} className="text-center font-sans text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">
            {w}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <motion.div
        key={`${cur.year}-${cur.month}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-7 gap-1.5 sm:gap-2"
      >
        {Array.from({ length: lead }).map((_, i) => (
          <div key={`lead-${i}`} aria-hidden />
        ))}

        {days.map((d) => {
          const sp = sponsored[d.iso];
          const filled = Boolean(sp?.filled);
          const href = hrefFor(d.iso, filled);

          const hebPrimary = view === 'hebrew';
          const big = hebPrimary ? d.hebrew.short : String(d.gregDay);
          const small = hebPrimary ? shortFmt.format(new Date(d.iso + 'T00:00:00')) : d.hebrew.short;

          const innerProps = {
            className: cn(
              'tileflip-inner rounded-xl',
              href && 'cursor-pointer'
            ),
          };

          const front = (
            <div
              className={cn(
                'tileflip-face justify-between rounded-xl border p-1.5',
                filled
                  ? 'border-gold bg-burgundy text-gold shadow-glow'
                  : 'border-dashed border-gold/60 bg-cream text-charcoal'
              )}
            >
              {d.holiday && (
                <span
                  className={cn(
                    'absolute inset-x-0 top-0 truncate px-1 py-0.5 text-center text-[8px] font-bold leading-none',
                    d.isYomTov ? 'bg-gold text-burgundy' : 'bg-burgundy/70 text-gold-soft'
                  )}
                >
                  {locale === 'he' ? d.holiday.he : d.holiday.en}
                </span>
              )}
              <div className={cn('flex items-start justify-between', d.holiday && 'mt-3')}>
                <span className={cn('font-display font-bold leading-none', hebPrimary ? 'text-sm' : 'text-xl')}>
                  {big}
                </span>
                {filled ? (
                  <span aria-hidden className="text-[10px] text-gold">✦</span>
                ) : (
                  <span aria-hidden className="text-[9px] opacity-40">🔒</span>
                )}
              </div>
              <div className="space-y-0.5">
                <span className={cn('block truncate font-sans text-[9px] leading-tight', filled ? 'text-gold/80' : 'text-charcoal/45')}>
                  {small}
                </span>
                {filled && showDonorNames && sp?.name && (
                  <span className="block truncate font-sans text-[9px] font-semibold text-gold">{sp.name}</span>
                )}
              </div>
            </div>
          );

          const back = (
            <div
              className={cn(
                'tileflip-face tileflip-back items-center justify-center rounded-xl border p-1 text-center',
                filled ? 'border-gold bg-burgundy-dark text-gold' : 'border-gold bg-gold-gradient text-burgundy'
              )}
            >
              <span aria-hidden className="text-sm">{filled ? '✦' : '💍'}</span>
              <span className="mt-1 font-sans text-[9px] font-semibold leading-tight">
                {filled ? ((showDonorNames && sp?.name) || t('sponsored')) : t('flipSponsor')}
              </span>
            </div>
          );

          return (
            <div key={d.iso} className={cn('tileflip aspect-square rounded-xl', d.isShabbat && 'shabbat-shimmer')}>
              {href ? (
                <Link href={href} {...innerProps}>
                  {front}
                  {back}
                </Link>
              ) : (
                <div {...innerProps}>
                  {front}
                  {back}
                </div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-sans text-[11px] text-charcoal/50">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-burgundy" /> {t('sponsored')}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-dashed border-gold bg-cream" /> {t('available')}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded ring-2 ring-gold" /> {t('shabbat')}
        </span>
      </div>
    </div>
  );
}
