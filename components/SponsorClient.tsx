'use client';

import { useRef, useState } from 'react';
import { localeDate } from '@/lib/hebcal';
import { useSetting } from './SiteContentProvider';
import Calendar from './Calendar';
import CoupleCard from './CoupleCard';
import SponsorModal from './SponsorModal';
import Spinner from './Spinner';
import type { Couple } from '@/lib/types';
import type { DateCount } from '@/lib/data';
import type { SponsorLabels } from './sponsorTypes';

export default function SponsorClient({
  dateCounts,
  labels,
  locale,
}: {
  dateCounts: Record<string, DateCount>;
  labels: SponsorLabels;
  locale: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [couples, setCouples] = useState<Couple[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ couple: Couple | null; type: 'full_package' | 'partial' } | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const showProgress = useSetting('show_progress', true);
  const showAmounts = useSetting('show_amounts', true);
  const donationsOn = useSetting('enable_donations', true);

  async function select(iso: string, hasCouples: boolean) {
    setSelected(iso);
    setCouples(null);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    if (!hasCouples) {
      setCouples([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/couples?date=${iso}`);
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
      <Calendar dateCounts={dateCounts} locale={locale} labels={labels} selected={selected} onSelect={select} />

      <div ref={resultsRef} className="scroll-mt-20">
        {loading && <Spinner label={locale === 'he' ? 'טוען…' : 'Loading…'} />}

        {selected && !loading && couples !== null && (
          couples.length > 0 ? (
            <div className="fade-in-up">
              <h2 className="mb-1 text-center font-display text-3xl font-bold text-burgundy">{labels.resultsTitle}</h2>
              <p className="mb-5 text-center font-serif text-burgundy/70">{localeDate(selected, locale)}</p>
              <div className="grid gap-5 md:grid-cols-2">
                {couples.map((c, i) => (
                  <div key={c.id} className="fade-in-up" style={{ animationDelay: `${i * 70}ms` }}>
                    <CoupleCard
                      couple={c}
                      labels={labels}
                      locale={locale}
                      showProgress={showProgress}
                      showAmounts={showAmounts}
                      donationsOn={donationsOn}
                      onSponsor={(type) => setModal({ couple: c, type })}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card fade-in-up mx-auto max-w-md text-center">
              <p className="mb-1 font-serif text-burgundy/70">{localeDate(selected, locale)}</p>
              <p className="mb-4 font-sans text-charcoal/70">{labels.empty}</p>
              {donationsOn && (
                <button onClick={() => setModal({ couple: null, type: 'partial' })} className="btn-gold">
                  {labels.generalBtn}
                </button>
              )}
            </div>
          )
        )}
      </div>

      {modal && (
        <SponsorModal couple={modal.couple} type={modal.type} labels={labels} locale={locale} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
