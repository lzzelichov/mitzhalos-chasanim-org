'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useTranslations } from 'next-intl';
import WeddingCard from './WeddingCard';
import { WeddingsGridSkeleton } from './Skeletons';
import type { WeddingCardData } from '@/lib/types';

export default function SearchClient({ configured }: { configured: boolean }) {
  const t = useTranslations('Search');
  const params = useSearchParams();

  const [q, setQ] = useState(params.get('q') ?? '');
  const [results, setResults] = useState<WeddingCardData[] | null>(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(
    async (term: string) => {
      if (!configured) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        const data = await res.json();
        setResults((data.results as WeddingCardData[]) ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [configured]
  );

  const debounced = useDebouncedCallback((term: string) => {
    // Keep the URL shareable (?q=...) without a full navigation.
    const usp = new URLSearchParams(window.location.search);
    if (term.trim()) usp.set('q', term.trim());
    else usp.delete('q');
    const qs = usp.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
    void run(term.trim());
  }, 300);

  // Run an initial search if the page loaded with ?q=
  useEffect(() => {
    if (q.trim()) void run(q.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 text-center">
        <h1 className="font-display text-4xl font-bold text-burgundy sm:text-5xl">{t('title')}</h1>
        <p className="mx-auto mt-2 max-w-md font-sans text-charcoal/70">{t('subtitle')}</p>
      </header>

      {!configured ? (
        <p className="card mx-auto max-w-md text-center font-sans text-charcoal/70">{t('configMissing')}</p>
      ) : (
        <>
          <div className="mx-auto max-w-xl">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                debounced(e.target.value);
              }}
              placeholder={t('placeholder')}
              className="field text-center"
              autoFocus
            />
          </div>

          <div className="mt-8">
            {loading ? (
              <WeddingsGridSkeleton />
            ) : results === null ? null : results.length === 0 ? (
              <div className="invite-card mx-auto max-w-md p-10 text-center">
                <div className="mb-3 text-5xl" aria-hidden>🔍</div>
                <h2 className="font-display text-2xl font-bold text-burgundy">{t('noResultsTitle')}</h2>
                <p className="mt-1 font-sans text-charcoal/70">{t('noResultsBody')}</p>
              </div>
            ) : (
              <>
                <p className="mb-4 font-sans text-sm font-medium text-charcoal/60">
                  {t('resultsCount', { count: results.length })}
                </p>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((c) => (
                    <WeddingCard key={c.wedding.id} data={c} />
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
