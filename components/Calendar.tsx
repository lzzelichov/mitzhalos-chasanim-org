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
  const [shake, setShake] = useState<string | null>(null);
  const touchX = useRef<number | null>(null);

  const days = useMemo(() => buildMonth(ym.y, ym.m), [ym]);
  const lead = useMemo(() => firstWeekday(ym.y, ym.m), [ym]);
  const todayIso = toISODate(today);
  const he = locale === 'he';
  const dow = he ? DOW_HE : DOW_EN;
  const coupleWord = he ? 'חתנים' : 'couples';

  function shift(delta: number) {
    setYm(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }
  function click(iso: string, has: boolean) {
    if (!has) {
      setShake(iso);
      setTimeout(() => setShake((s) => (s === iso ? null : s)), 420);
    }
    onSelect(iso, has);
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
    <div className="card border-gold/40 bg-[#fdf8f0]" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Month nav: Hebrew month+year (left) · arrows (center) · Gregorian (right) */}
      <div className="mb-4 flex items-center justify-between gap-2" dir="ltr">
        <p className="min-w-0 flex-1 truncate text-left font-display text-lg font-bold text-burgundy sm:text-2xl">
          {hebrewMonthLabel(ym.y, ym.m)}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => shift(-1)}
            aria-label="Previous month"
            className="rounded-full px-3 py-1 text-2xl leading-none text-burgundy transition-colors hover:bg-cream"
          >
            ‹
          </button>
          <button
            onClick={() => shift(1)}
            aria-label="Next month"
            className="rounded-full px-3 py-1 text-2xl leading-none text-burgundy transition-colors hover:bg-cream"
          >
            ›
          </button>
        </div>
        <p className="min-w-0 flex-1 truncate text-right font-sans text-xs text-charcoal/50 sm:text-sm">
          {gregMonthLabel(ym.y, ym.m, locale)}
        </p>
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

          // Background: selected > fully-sponsored > has-couples > today > Shabbos > normal.
          const bg = isSel
            ? 'bg-burgundy text-white'
            : has && fully
              ? 'bg-[#f0f0f0] text-charcoal'
              : has
                ? 'bg-[#fdf0e0] text-charcoal'
                : isToday
                  ? 'bg-[#faf3e6] text-charcoal' // today: very subtle cream
                  : day.isShabbat
                    ? 'bg-[#fdfaf5] text-charcoal'
                    : 'bg-white text-charcoal';

          // Accent left border: today (burgundy) wins, else has-couples (gold).
          const accent = isSel
            ? 'border-burgundy'
            : isToday
              ? 'border-l-[3px] border-l-burgundy border-y-charcoal/10 border-r-charcoal/10'
              : has && !fully
                ? 'border-l-[3px] border-l-gold border-y-charcoal/10 border-r-charcoal/10'
                : 'border-charcoal/10';

          return (
            <button
              key={day.iso}
              type="button"
              onClick={() => click(day.iso, has)}
              className={cn(
                'relative flex min-h-[60px] flex-col items-center justify-center rounded-xl border p-1 text-center transition-all duration-150 hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-lift sm:min-h-[88px] sm:p-2',
                bg,
                accent,
                shake === day.iso && 'animate-shake'
              )}
            >
              {/* Gregorian number — small, top-start */}
              <span
                className={cn(
                  'absolute start-1.5 top-1 font-sans text-[10px] font-medium leading-none',
                  isSel ? 'text-white/70' : 'text-charcoal/40'
                )}
              >
                {day.gregDay}
              </span>

              {/* Holiday dot — top-end */}
              {holiday && (
                <span
                  className={cn(
                    'absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full',
                    isSel ? 'bg-white' : 'bg-burgundy'
                  )}
                />
              )}

              {/* Hebrew date (gematriya) — large, centered */}
              <span className="mt-1 font-display text-sm font-bold leading-tight sm:text-lg">
                {day.hebrew.short}
              </span>

              {/* Parsha on Shabbos — gold italic (desktop only) */}
              {day.isShabbat && day.parsha && (
                <span
                  className={cn(
                    'mt-0.5 hidden max-w-full truncate text-[10px] italic leading-tight sm:block',
                    isSel ? 'text-white/90' : 'text-gold'
                  )}
                >
                  פ׳ {day.parsha}
                </span>
              )}

              {/* Holiday name — burgundy small (desktop only) */}
              {holiday && (
                <span
                  className={cn(
                    'mt-0.5 hidden max-w-full truncate text-[9px] leading-tight sm:block',
                    isSel ? 'text-white/90' : 'text-burgundy'
                  )}
                >
                  {holiday}
                </span>
              )}

              {/* Couple count — gold pill (burgundy when fully sponsored) */}
              {has && (
                <span
                  className={cn(
                    'mt-1 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
                    isSel
                      ? 'bg-white text-burgundy'
                      : fully
                        ? 'bg-burgundy text-gold'
                        : 'bg-gold text-burgundy'
                  )}
                >
                  {count}
                  <span className="hidden sm:inline">&nbsp;{coupleWord}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 font-sans text-xs text-charcoal/60">
        <span>
          <span className="me-1 inline-block h-3 w-3 rounded-sm bg-gold align-middle" />
          {labels.legendGold}
        </span>
        <span>
          <span className="me-1 inline-block h-3 w-3 rounded-sm bg-burgundy align-middle" />
          {labels.legendBurgundy}
        </span>
        <span>
          <span className="me-1 inline-block h-3 w-3 rounded-sm bg-charcoal/20 align-middle" />
          {labels.legendGray}
        </span>
      </div>
    </div>
  );
}
