'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import WeddingCard from './WeddingCard';
import { cn, toISODate, clampPercent } from '@/lib/utils';
import type { WeddingCardData } from '@/lib/types';

type Filter = 'all' | 'upcoming' | 'recent' | 'fullyFunded';
type Sort = 'date' | 'funded' | 'newest';

export default function WeddingsClient({ cards }: { cards: WeddingCardData[] }) {
  const t = useTranslations('Weddings');
  const today = toISODate(new Date());

  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('date');

  const pct = (c: WeddingCardData) => clampPercent(c.raisedUsd, c.wedding.goal_usd);

  const shown = useMemo(() => {
    let list = [...cards];
    if (filter === 'upcoming') list = list.filter((c) => c.wedding.wedding_date >= today);
    else if (filter === 'recent')
      list = list.filter((c) => c.wedding.wedding_date < today || c.wedding.status === 'completed');
    else if (filter === 'fullyFunded') list = list.filter((c) => pct(c) >= 100);

    list.sort((a, b) => {
      if (sort === 'funded') return pct(b) - pct(a);
      if (sort === 'newest') return b.wedding.created_at.localeCompare(a.wedding.created_at);
      return a.wedding.wedding_date.localeCompare(b.wedding.wedding_date);
    });
    return list;
  }, [cards, filter, sort, today]); // eslint-disable-line react-hooks/exhaustive-deps

  const filters: Filter[] = ['all', 'upcoming', 'recent', 'fullyFunded'];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-sans text-sm font-semibold text-navy/60">{t('filter')}:</span>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-full px-3 py-1 font-sans text-xs font-semibold transition-colors',
                filter === f
                  ? 'bg-gold-gradient text-navy'
                  : 'border border-navy/15 bg-white/70 text-navy/70 hover:text-navy'
              )}
            >
              {t(f)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-sans text-sm font-semibold text-navy/60">{t('sort')}:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="field !w-auto !py-1.5 text-sm"
          >
            <option value="date">{t('sortDate')}</option>
            <option value="funded">{t('sortFunded')}</option>
            <option value="newest">{t('sortNewest')}</option>
          </select>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="card text-center font-sans text-navy/60">{t('none')}</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c) => (
            <WeddingCard key={c.wedding.id} data={c} />
          ))}
        </div>
      )}
    </div>
  );
}
