import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getWeddingCards, getGlobalStats } from '@/lib/data';
import { formatCurrency } from '@/lib/currency';
import HeroBackground from '@/components/HeroBackground';
import WeddingCard from '@/components/WeddingCard';

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('Home');
  const tc = await getTranslations('Common');
  const tn = await getTranslations('Nav');
  const tw = await getTranslations('Weddings');

  const [cards, stats] = await Promise.all([getWeddingCards(), getGlobalStats()]);
  const featured = cards.slice(0, 6);

  const raised = stats.raisedUsd;

  return (
    <div className="space-y-12">
      <HeroBackground image="home" className="px-6 py-20 text-center text-white sm:py-28">
        <p className="font-sans text-sm uppercase tracking-[0.3em] text-gold-soft">{tc('siteName')}</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight drop-shadow sm:text-7xl">
          {t('tagline')}
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-sans text-base text-white/90 sm:text-lg">
          {t('subtitle')}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/weddings" className="btn-gold">
            {tn('weddings')}
          </Link>
          <Link
            href="/donate"
            className="btn-ghost !border-white/40 !bg-white/10 !text-white hover:!bg-white/20"
          >
            {tn('donate')}
          </Link>
        </div>
      </HeroBackground>

      {/* Global fundraising stats */}
      {stats.weddings > 0 && (
        <p className="rounded-2xl border border-gold/30 bg-cream/60 px-6 py-4 text-center font-serif text-base italic text-burgundy sm:text-lg">
          {t('statsLine', {
            weddings: stats.weddings,
            raised: formatCurrency(raised),
            donors: stats.donors,
          })}
        </p>
      )}

      <section>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-3xl font-bold text-burgundy sm:text-4xl">{tw('title')}</h2>
          <Link href="/weddings" className="font-sans text-sm font-semibold text-gold hover:underline">
            {tw('all')} →
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="invite-card mx-auto max-w-lg p-10 text-center">
            <div className="mb-3 text-5xl" aria-hidden>💍</div>
            <h3 className="font-display text-3xl font-bold text-burgundy">{t('comingSoon')}</h3>
            <p className="mx-auto mt-2 max-w-sm font-sans text-charcoal/70">{t('comingSoonBody')}</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <WeddingCard key={c.wedding.id} data={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
