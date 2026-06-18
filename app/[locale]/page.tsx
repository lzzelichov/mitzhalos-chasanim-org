import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { getSiteContent, contentRaw, contentText, settingOn } from '@/lib/siteContent';
import { getOrgStats, getPublishedNews } from '@/lib/data';
import { formatCurrency } from '@/lib/currency';
import { formatDateLabel } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const HERO = 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1920&q=80';

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const c = await getSiteContent();
  const [stats, news] = await Promise.all([getOrgStats(), getPublishedNews(3)]);
  const showAmounts = settingOn(c, 'show_amounts', true);
  const r = (k: string, f = '') => contentRaw(c, k, locale, f);
  const t = (k: string, f = '') => contentText(c, k, locale, f);

  return (
    <>
      <section className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden text-center text-white">
        <Image src={HERO} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-burgundy/70" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-20">
          <h1 className="font-display text-4xl font-bold drop-shadow sm:text-6xl">
            {r('settings.site_name', 'מצהלות חתנים / Mitzhalos Chasanim')}
          </h1>
          <p className="mt-4 font-serif text-2xl text-gold-soft sm:text-3xl">{r('home.tagline_he', 'לבוש חתן הוא מצווה')}</p>
          <p className="font-sans text-lg text-white/90">{r('home.tagline_en', 'Clothing a Groom is a Mitzvah')}</p>
          {t('home.hero_sub') && <p className="mx-auto mt-3 max-w-xl font-sans text-white/80">{t('home.hero_sub')}</p>}
          <Link href="/sponsor" className="btn-gold mt-8 !px-8 !py-3 text-base">
            {r('home.cta', 'Sponsor a Couple')}
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <section className="relative z-10 -mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat value={String(stats.couplesHelped)} label={r('home.stat_couples', 'couples helped')} />
          <Stat value={String(stats.packagesSponsored)} label={r('home.stat_packages', 'packages sponsored')} />
          <Stat value={showAmounts ? formatCurrency(stats.totalRaised) : '—'} label={r('home.stat_raised', 'raised total')} />
        </section>

        <section className="mt-14 grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card">
              <h3 className="font-display text-xl font-bold text-burgundy">{r(`home.box${n}_title`)}</h3>
              <p className="mt-2 font-sans text-sm leading-relaxed text-charcoal/80">{r(`home.box${n}_body`)}</p>
            </div>
          ))}
        </section>

        {news.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-center font-display text-3xl font-bold text-burgundy">{r('home.news_title', 'Latest News')}</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {news.map((p) => (
                <Link key={p.id} href={`/news/${p.slug}`} className="card block transition-shadow hover:shadow-glow">
                  <p className="font-sans text-xs text-charcoal/50">
                    {p.published_at ? formatDateLabel(p.published_at.slice(0, 10), locale) : ''}
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="card text-center">
      <p className="font-display text-4xl font-bold text-burgundy">{value}</p>
      <p className="font-sans text-sm text-charcoal/60">{label}</p>
    </div>
  );
}
