import { Link } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { getSiteContent, contentRaw } from '@/lib/siteContent';
import { getPublishedNews } from '@/lib/data';
import { formatDateLabel } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function NewsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const c = await getSiteContent();
  const posts = await getPublishedNews();
  const r = (k: string, f = '') => contentRaw(c, k, locale, f);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 text-center font-display text-4xl font-bold text-burgundy">{r('news.title', 'News')}</h1>
      {posts.length === 0 ? (
        <p className="text-center font-sans text-charcoal/60">{r('news.empty', 'No news posts yet.')}</p>
      ) : (
        <div className="space-y-5">
          {posts.map((p) => (
            <Link key={p.id} href={`/news/${p.slug}`} className="card block transition-shadow hover:shadow-glow">
              <p className="font-sans text-xs text-charcoal/50">
                {p.published_at ? formatDateLabel(p.published_at.slice(0, 10), locale) : ''}
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-burgundy">
                {locale === 'he' ? p.title_he || p.title_en : p.title_en}
              </h2>
              <span className="mt-2 inline-block font-sans text-sm font-semibold text-gold">
                {r('news.read_more', 'Read More')} →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
