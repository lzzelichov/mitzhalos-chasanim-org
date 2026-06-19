'use client';

import { localeDate } from '@/lib/hebcal';
import { formatCurrency } from '@/lib/currency';
import ProgressBar from './ProgressBar';
import type { Couple } from '@/lib/types';
import type { SponsorLabels } from './sponsorTypes';

export default function CoupleCard({
  couple,
  labels,
  locale,
  showProgress,
  showAmounts,
  donationsOn,
  onSponsor,
}: {
  couple: Couple;
  labels: SponsorLabels;
  locale: string;
  showProgress: boolean;
  showAmounts: boolean;
  donationsOn: boolean;
  onSponsor: (type: 'full_package' | 'partial') => void;
}) {
  const he = locale === 'he';
  const name = he ? couple.chatan_name_he || couple.chatan_name_en : couple.chatan_name_en;
  const alt = he ? couple.chatan_name_en : couple.chatan_name_he;
  const father = he ? couple.father_name_he || couple.father_name_en : couple.father_name_en || couple.father_name_he;
  const mother = he ? couple.mother_name_he || couple.mother_name_en : couple.mother_name_en || couple.mother_name_he;

  return (
    <div className="card flex flex-col gap-3">
      <div>
        <h3 className="font-display text-2xl font-bold text-burgundy">
          {he ? 'חתן ' : 'Chatan '}
          {name}
          {alt && alt !== name ? <span className="text-charcoal/50"> ({alt})</span> : null}
        </h3>
        <p className="font-sans text-sm text-charcoal/60">{localeDate(couple.wedding_date, locale)}</p>
      </div>

      <div className="grid gap-1 font-sans text-sm text-charcoal/80">
        {father && (
          <p>
            <span className="font-semibold text-burgundy">{labels.fatherLabel}:</span> {father}
          </p>
        )}
        {mother && (
          <p>
            <span className="font-semibold text-burgundy">{labels.motherLabel}:</span> {mother}
          </p>
        )}
        {couple.yeshiva && (
          <p>
            <span className="font-semibold text-burgundy">{labels.yeshivaLabel}:</span> {couple.yeshiva}
          </p>
        )}
        {couple.chassidus && (
          <p>
            <span className="font-semibold text-burgundy">{labels.chassidusLabel}:</span> {couple.chassidus}
          </p>
        )}
      </div>

      {couple.extra_info && (
        <p className="rounded-lg bg-cream/60 p-3 font-sans text-sm italic text-charcoal/80">{couple.extra_info}</p>
      )}

      {showProgress && <ProgressBar raised={couple.total_raised} goal={couple.package_price} showAmounts={showAmounts} />}

      {donationsOn && (
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <button onClick={() => onSponsor('full_package')} className="btn-gold flex-1 !text-xs sm:!text-sm">
            {labels.fullBtn} — {formatCurrency(couple.package_price)}
          </button>
          <button onClick={() => onSponsor('partial')} className="btn-ghost flex-1 !text-xs sm:!text-sm">
            {labels.anyBtn}
          </button>
        </div>
      )}
    </div>
  );
}
