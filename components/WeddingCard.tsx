'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { hebrewFull } from '@/lib/hebcal';
import { formatDateLabel, clampPercent } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
import { CornerFlourish, FlourishDivider } from './Flourish';
import type { WeddingCardData } from '@/lib/types';

export default function WeddingCard({ data }: { data: WeddingCardData }) {
  const t = useTranslations('Weddings');
  const locale = useLocale();
  const { wedding: w, raisedUsd } = data;

  const goal = w.goal_usd;
  const raised = raisedUsd;
  const percent = clampPercent(raised, goal);

  const name = locale === 'he' ? w.chatan_name_he || w.chatan_name_en : w.chatan_name_en;

  return (
    <Link
      href={`/wedding/${w.slug}`}
      className="invite-card group block p-7 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-gold hover:shadow-lift"
    >
      <CornerFlourish className="absolute left-2.5 top-2.5 w-7 text-gold/70" />
      <CornerFlourish className="absolute bottom-2.5 right-2.5 w-7 rotate-180 text-gold/70" />

      <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-burgundy/60">
        {t('honorLabel')}
      </p>
      <h3 className="mt-1 font-display text-3xl font-bold leading-tight text-burgundy">
        {t('coupleLine', { name })}
        {w.kallah_initial ? ` ${w.kallah_initial}.` : ''}
      </h3>

      <p className="mt-2 font-display text-xl text-charcoal/85">{hebrewFull(w.wedding_date)}</p>
      <p className="font-sans text-xs uppercase tracking-wide text-charcoal/50">
        {formatDateLabel(w.wedding_date, locale)}
      </p>
      {(w.venue || w.city) && (
        <p className="mt-1 font-serif text-sm italic text-charcoal/70">
          {[w.venue, w.city].filter(Boolean).join(' · ')}
        </p>
      )}

      <FlourishDivider className="my-5" />

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-burgundy/10">
        <div className="h-full rounded-full bg-gold-gradient" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-1.5 flex items-baseline justify-between font-sans text-xs text-charcoal/60">
        <span className="font-semibold text-burgundy">{t('funded', { percent })}</span>
        <span>
          {formatCurrency(raised)} / {formatCurrency(goal)}
        </span>
      </div>

      <span className="btn-gold mt-5 w-full !text-xs">{t('support')}</span>
    </Link>
  );
}
