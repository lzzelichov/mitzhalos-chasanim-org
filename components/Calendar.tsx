'use client';

import { useMemo, useRef, useState } from 'react';
import { buildMonth, firstWeekday, gregMonthLabel, hebrewMonthLabel } from '@/lib/hebcal';
import { toISODate, cn } from '@/lib/utils';
import type { DateCount } from '@/lib/data';
import type { SponsorLabels } from './sponsorTypes';

const DOW_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DOW_HE = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

export default function Calendar({
  dateCounts,
  locale,
  labels,
  selected,
  onSelect,
}: {
  dateCounts: Record<string, DateCount>;
  locale: string;
  labels: SponsorLabels;
  selected: string | null;
  onSelect: (iso: string, hasCouples: boolean) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const touchX = useRef<number | null>(null);

  const days = useMemo(() => buildMonth(ym.y, ym.m), [ym]);
  const lead = useMemo(() => firstWeekday(ym.y, ym.m), [ym]);
  const todayIso = toISODate(today);
  const he = locale === 'he';
  const dow = he ? DOW_HE : DOW_EN;
  const monthLabel = he ? hebrewMonthLabel(ym.y, ym.m) : gregMonthLabel(ym.y, ym.m, locale);

  function shift(delta: number) {
    setYm(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }
  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) shift(dx < 0 ? 1 : -1);
    touchX.current = null;
  }

  return (
    <div className="card" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => shift(-1)} aria-label="Previous month" className="rounded-full px-4 py-1 text-3xl leading-none text-burgundy hover:bg-cream">
          ‹
        </button>
        <h3 className="font-display text-2xl font-bold text-burgundy sm:text-3xl">{monthLabel}</h3>
        <button onClick={() => shift(1)} aria-label="Next month" className="rounded-full px-4 py-1 text-3xl leading-none text-burgundy hover:bg-cream">
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {dow.map((d, i) => (
          <div key={i} className="pb-1 text-center font-sans text-xs font-semibold text-charcoal/50">
            {d}
          </div>
        ))}
        {Array.from({ length: lead }).map((_, i) => (
          <div key={`l${i}`} />
        ))}
        {days.map((day) => {
          const dc = dateCounts[day.iso];
          const count = dc?.count ?? 0;
          const fully = dc?.fully ?? false;
          const has = count > 0;
          const isSel = selected === day.iso;
          const isToday = day.iso === todayIso;
          const holiday = day.holiday ? (he ? day.holiday.he : day.holiday.en) : null;

          const tile = isSel
            ? 'border-burgundy bg-burgundy text-white shadow-lift'
            : has && fully
              ? 'border-burgundy/40 bg-burgundy/5 text-charcoal hover:shadow-lift'
              : has
                ? cn('border-gold/60 bg-gold/10 text-charcoal hover:shadow-lift', count >= 3 && 'shadow-glow')
                : cn('border-burgundy/10 bg-white/60 text-charcoal/40', day.isShabbat && 'bg-gold-soft/20');

          return (
            <button
              key={day.iso}
              type="button"
              onClick={() => onSelect(day.iso, has)}
              className={cn('relative flex min-h-[58px] flex-col items-start rounded-xl border p-1.5 text-start transition-all sm:min-h-[84px] sm:p-2', tile)}
            >
              <span
                className={cn(
                  'font-display text-base font-bold leading-none sm:text-lg',
                  isToday && !isSel && 'flex h-6 w-6 items-center justify-center rounded-full bg-burgundy text-white'
                )}
              >
                {day.gregDay}
              </span>
              {day.isShabbat && (
                <span className={cn('mt-0.5 text-[9px]', isSel ? 'text-white/80' : 'text-gold')}>{he ? 'שבת' : 'Shabbat'}</span>
              )}
              {holiday && (
                <span className={cn('mt-0.5 w-full truncate text-[9px] leading-tight', isSel ? 'text-white/80' : 'text-burgundy/70')}>{holiday}</span>
              )}
              {count > 0 && (
                <span
                  className={cn(
                    'absolute end-1 top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-bold',
                    isSel ? 'bg-white text-burgundy' : count >= 3 ? 'bg-burgundy text-gold' : 'bg-gold text-burgundy'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 font-sans text-xs text-charcoal/60">
        <span><span className="me-1 inline-block h-3 w-3 rounded-full bg-gold align-middle" />{labels.legendGold}</span>
        <span><span className="me-1 inline-block h-3 w-3 rounded-full bg-burgundy align-middle" />{labels.legendBurgundy}</span>
        <span><span className="me-1 inline-block h-3 w-3 rounded-full bg-charcoal/20 align-middle" />{labels.legendGray}</span>
      </div>
    </div>
  );
}
