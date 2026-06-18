'use client';

import { useState } from 'react';
import { hebrewFull } from '@/lib/hebcal';
import { formatDateLabel } from '@/lib/utils';
import { useSetting } from './SiteContentProvider';
import CoupleCard from './CoupleCard';
import SponsorModal from './SponsorModal';
import Spinner from './Spinner';
import type { Couple } from '@/lib/types';
import type { SponsorLabels } from './sponsorTypes';

export default function SponsorClient({ labels, locale }: { labels: SponsorLabels; locale: string }) {
  const [date, setDate] = useState('');
  const [couples, setCouples] = useState<Couple[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ couple: Couple | null; type: 'full_package' | 'partial' } | null>(null);

  const showProgress = useSetting('show_progress', true);
  const showAmounts = useSetting('show_amounts', true);
  const donationsOn = useSetting('enable_donations', true);

  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);

  async function search(d: string) {
    setDate(d);
    setCouples(null);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/couples?date=${d}`);
      const data = await res.json();
      setCouples((data.couples as Couple[]) ?? []);
    } catch {
      setCouples([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="card mx-auto max-w-md text-center">
        <label htmlFor="sponsor-date" className="label">
          {labels.pickDate}
        </label>
        <input
          id="sponsor-date"
          type="date"
          value={date}
          onChange={(e) => search(e.target.value)}
          className="field text-center"
        />
        {validDate && (
          <p className="mt-3 font-serif text-lg text-burgundy">
            {hebrewFull(date)} · {formatDateLabel(date, locale)}
          </p>
        )}
      </div>

      {loading && <Spinner label={locale === 'he' ? 'טוען…' : 'Loading…'} />}

      {couples !== null && !loading && (
        <>
          {couples.length > 0 ? (
            <div>
              <h2 className="mb-5 text-center font-display text-3xl font-bold text-burgundy">{labels.resultsTitle}</h2>
              <div className="grid gap-5 md:grid-cols-2">
                {couples.map((c) => (
                  <CoupleCard
                    key={c.id}
                    couple={c}
                    labels={labels}
                    locale={locale}
                    showProgress={showProgress}
                    showAmounts={showAmounts}
                    donationsOn={donationsOn}
                    onSponsor={(type) => setModal({ couple: c, type })}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="card mx-auto max-w-md text-center">
              <p className="mb-4 font-sans text-charcoal/70">{labels.empty}</p>
              {donationsOn && (
                <button onClick={() => setModal({ couple: null, type: 'partial' })} className="btn-gold">
                  {labels.generalBtn}
                </button>
              )}
            </div>
          )}
        </>
      )}

      {modal && (
        <SponsorModal
          couple={modal.couple}
          type={modal.type}
          labels={labels}
          locale={locale}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
