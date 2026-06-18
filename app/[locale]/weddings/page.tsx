import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getWeddingCards } from '@/lib/data';
import { supabaseConfigured } from '@/lib/supabase/server';
import HeroBackground from '@/components/HeroBackground';
import WeddingsClient from '@/components/WeddingsClient';
import { WeddingsGridSkeleton } from '@/components/Skeletons';

export default async function WeddingsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('Weddings');

  return (
    <div className="space-y-10">
      <HeroBackground image="weddings" className="px-6 py-14 text-center text-white">
        <h1 className="font-display text-5xl font-bold drop-shadow sm:text-6xl">{t('title')}</h1>
        <p className="mx-auto mt-3 max-w-xl font-sans text-white/85">{t('subtitle')}</p>
      </HeroBackground>

      {!supabaseConfigured ? (
        <p className="card mx-auto max-w-md text-center font-sans text-charcoal/70">
          {t('configMissing')}
        </p>
      ) : (
        <Suspense fallback={<WeddingsGridSkeleton />}>
          <WeddingsList />
        </Suspense>
      )}
    </div>
  );
}

async function WeddingsList() {
  const cards = await getWeddingCards();
  return <WeddingsClient cards={cards} />;
}
