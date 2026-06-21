import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { getSiteContent, contentRaw, contentText, settingOn } from '@/lib/siteContent';
import { getOrgStats, getPublishedNews, getThisWeekCount } from '@/lib/data';
import { localeDate } from '@/lib/hebcal';
import { cn } from '@/lib/utils';
import StatCounter from '@/components/StatCounter';

export const dynamic = 'force-dynamic';

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const c = await getSiteContent();
  const showLive = settingOn(c, 'show_live_counter', false);
  const [stats, news, weekCount] = await Promise.all([
    getOrgStats(),
    getPublishedNews(3),
    showLive ? getThisWeekCount() : Promise.resolve(0),
  ]);
  const showAmounts = settingOn(c, 'show_amounts', true);
  const showChasanim = settingOn(c, 'show_chasanim_stat', true);
  const showPackages = settingOn(c, 'show_packages_stat', true);
  const showRaised = settingOn(c, 'show_raised_stat', true);
  const statCount = [showChasanim, showPackages, showRaised].filter(Boolean).length;
  const statGrid =
    statCount >= 3 ? 'sm:grid-cols-3' : statCount === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-1';
  const r = (k: string, f = '') => contentRaw(c, k, locale, f);
  const t = (k: string, f = '') => contentText(c, k, locale, f);

  const [livePre, livePost] = r('home.live_counter', 'This week: {n} chassanim need clothing support').split('{n}');

  return (
    <>
      {showLive && weekCount > 0 && (
        <div className="fabric-bg py-2 text-center font-sans text-sm font-semibold text-gold">
          {livePre}
          <span className="num-pulse">{weekCount}</span>
          {livePost ?? ''}
        </div>
      )}

      <section className="hero-section flex min-h-[70vh] items-center justify-center overflow-hidden text-center">
        <Image src="/heroes/home.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-20">
          <h1 className="font-display">
            {r('brand.name', locale === 'he' ? 'מצהלות חתנים' : 'Mitzhalos Chasanim')}
          </h1>
          <p className="hero-subtitle mt-4 font-serif">
            {r('home.tagline', locale === 'he' ? 'לבוש חתן הוא מצווה' : 'Clothing a Groom is a Mitzvah')}
          </p>
          {t('home.hero_sub') && <p className="hero-tagline mx-auto mt-3 max-w-xl">{t('home.hero_sub')}</p>}
          <Link href="/sponsor" className="btn-cta mt-8">
            {r('home.cta', 'Sponsor a Couple')}
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        {statCount > 0 && (
          <section className={cn('relative z-10 -mt-10 grid grid-cols-1 gap-4', statGrid)}>
            {showChasanim && <StatCounter end={stats.couplesHelped} label={r('home.stat_couples', 'couples helped')} />}
            {showPackages && <StatCounter end={stats.packagesSponsored} label={r('home.stat_packages', 'packages sponsored')} />}
            {showRaised &&
              (showAmounts ? (
                <StatCounter end={stats.totalRaised} prefix="$" label={r('home.stat_raised', 'raised total')} />
              ) : (
                <div className="card text-center">
                  <p className="font-display text-[2.5rem] font-black leading-none text-burgundy">—</p>
                  <p className="mt-2 font-sans text-[0.85rem] text-[#888]">{r('home.stat_raised', 'raised total')}</p>
                </div>
              ))}
          </section>
        )}

        <div className="fabric-divider mt-12" />

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card">
              <h3 className="font-display text-xl font-bold text-burgundy">{r(`home.box${n}_title`)}</h3>
              <p className="mt-2 font-sans text-sm leading-relaxed text-charcoal/80">{r(`home.box${n}_body`)}</p>
            </div>
          ))}
        </section>

        {news.length > 0 && (
          <section className="mt-16">
            <div className="fabric-divider mb-12" />
            <h2 className="text-center font-display text-3xl font-bold">{r('home.news_title', 'Latest News')}</h2>
            <span className="section-accent" />
            <div className="grid gap-5 md:grid-cols-3">
              {news.map((p) => (
                <Link key={p.id} href={`/news/${p.slug}`} className="card block transition-shadow hover:shadow-glow">
                  <p className="font-sans text-xs text-charcoal/50">
                    {p.published_at ? localeDate(p.published_at.slice(0, 10), locale) : ''}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold text-burgundy">
                    {locale === 'he' ? p.title_he || p.title_en : p.title_en}
                  </h3>
                  <span className="mt-2 inline-block font-sans text-sm font-semibold text-gold">
                    {r('news.read_more', 'Read More')} →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
