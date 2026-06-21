'use client';

import { useRef, useState } from 'react';
import { localeDate, parseHebrewDateInput, hebrewDateToIso } from '@/lib/hebcal';
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

  const [hebText, setHebText] = useState('');
  const [enDate, setEnDate] = useState('');
  const [searchError, setSearchError] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const hebTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const he = locale === 'he';
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

  // Jump to a found ISO date: select it (highlights + scrolls), calendar follows.
  function runSearchIso(iso: string) {
    setSearchError(false);
    setSearchActive(true);
    select(iso, (dateCounts[iso]?.count ?? 0) > 0);
  }

  function runHebrewSearch(text: string) {
    if (!text.trim()) {
      setSearchError(false);
      return;
    }
    const parsed = parseHebrewDateInput(text);
    const iso = parsed ? hebrewDateToIso(parsed.day, parsed.month, Object.keys(dateCounts)) : null;
    if (!iso) {
      setSearchActive(true);
      setSearchError(true);
      return;
    }
    runSearchIso(iso);
  }

  function onHebInput(v: string) {
    setHebText(v);
    if (hebTimer.current) clearTimeout(hebTimer.current);
    hebTimer.current = setTimeout(() => runHebrewSearch(v), 300);
  }

  function onEnglishDate(v: string) {
    setEnDate(v);
    if (v) runSearchIso(v);
  }

  function clearSearch() {
    if (hebTimer.current) clearTimeout(hebTimer.current);
    setHebText('');
    setEnDate('');
    setSearchError(false);
    setSearchActive(false);
    setSelected(null);
    setCouples(null);
  }

  return (
    <div className="space-y-8">
      {/* Date search — English picker + Hebrew text search */}
      <div className="search-box mx-auto w-full max-w-[600px]">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="order-2 flex-1 sm:order-1">
            <label className="mb-1.5 block font-sans text-xs font-semibold text-charcoal/60">
              📅 {he ? 'תאריך לועזי' : 'English date'}
            </label>
            <input
              type="date"
              value={enDate}
              onChange={(e) => onEnglishDate(e.target.value)}
              aria-label={he ? 'חיפוש לפי תאריך לועזי' : 'Search by English date'}
              className="search-field"
            />
          </div>
          <div className="order-1 flex-1 sm:order-2">
            <label className="mb-1.5 block font-sans text-xs font-semibold text-charcoal/60">
              🔤 {he ? 'תאריך עברי' : 'Hebrew date'}
            </label>
            <input
              type="text"
              dir="rtl"
              value={hebText}
              onChange={(e) => onHebInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') runHebrewSearch(hebText);
              }}
              placeholder="חפש תאריך עברי — כ״ב סיון"
              className="search-field text-right"
            />
          </div>
        </div>
        <div className="mt-3 flex justify-center">
          <button type="button" onClick={() => runHebrewSearch(hebText)} className="search-btn w-full sm:w-auto">
            {he ? 'חפש' : 'Search'}
          </button>
        </div>
        {searchError ? (
          <p className="mt-3 text-center font-sans text-sm text-burgundy">
            {he ? 'לא נמצאו חתנים בתאריך זה' : 'No couples found for this date'}{' '}
            <button type="button" onClick={clearSearch} className="underline hover:text-gold">
              {he ? 'נקה חיפוש' : 'Clear search'}
            </button>
          </p>
        ) : (
          searchActive && (
            <p className="mt-2 text-center">
              <button
                type="button"
                onClick={clearSearch}
                className="font-sans text-xs text-charcoal/50 underline hover:text-gold"
              >
                {he ? 'נקה חיפוש' : 'Clear search'}
              </button>
            </p>
          )
        )}
      </div>

      <Calendar dateCounts={dateCounts} locale={locale} labels={labels} selected={selected} onSelect={select} />

      <div ref={resultsRef} className="scroll-mt-20">
        {loading && <Spinner label={locale === 'he' ? 'טוען…' : 'Loading…'} />}

        {selected && !loading && couples !== null && (
          couples.length > 0 ? (
            <div className="fade-in-up">
              <h2 className="mb-1 text-center font-display text-3xl font-bold" style={{ color: '#f5e6d3' }}>{labels.resultsTitle}</h2>
              <p className="mb-5 text-center font-serif" style={{ color: 'rgba(245,230,211,0.7)' }}>{localeDate(selected, locale)}</p>
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
