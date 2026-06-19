import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { getSiteContent, contentRaw, contentText } from '@/lib/siteContent';
import { getOrgPhotos } from '@/lib/data';
import PhotoGallery from '@/components/PhotoGallery';

export const dynamic = 'force-dynamic';

const ABOUT_IMG = 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1920&q=85';

export default async function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const c = await getSiteContent();
  const photos = await getOrgPhotos();
  const r = (k: string, f = '') => contentRaw(c, k, locale, f);
  const t = (k: string, f = '') => contentText(c, k, locale, f);

  const sections: [string, string][] = [
    ['about.mission_title', 'about.mission_body'],
    ['about.how_title', 'about.how_body'],
    ['about.who_title', 'about.who_body'],
    ['about.ops_title', 'about.ops_body'],
  ];

  return (
    <div>
      <section className="hero-section flex min-h-[40vh] items-center justify-center overflow-hidden text-center">
        <Image src={ABOUT_IMG} alt="" fill priority sizes="100vw" className="object-cover" />
        <h1 className="relative z-10 font-display">{r('about.title', 'About Us')}</h1>
      </section>

      <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">
        {sections.map(([tk, bk]) =>
          t(bk) ? (
            <section key={tk}>
              <h2 className="font-display text-3xl font-bold text-burgundy">{r(tk)}</h2>
              <p className="story-content mt-3 whitespace-pre-wrap font-sans text-charcoal/85">{t(bk)}</p>
            </section>
          ) : null
        )}

        {photos.length > 0 && (
          <section>
            <h2 className="mb-4 font-display text-3xl font-bold text-burgundy">{r('about.gallery_title', 'Gallery')}</h2>
            <PhotoGallery photos={photos} />
          </section>
        )}

        <div className="fabric-divider" />

        <section className="card text-center">
          <h2 className="font-display text-2xl font-bold">{r('about.cta_title', 'Join Us')}</h2>
          <span className="section-accent" />
          {t('about.cta_body') && <p className="mt-2 font-sans text-charcoal/80">{t('about.cta_body')}</p>}
          <Link href="/sponsor" className="btn-gold mt-4">
            {r('about.cta_button', 'Sponsor Now')}
          </Link>
        </section>
      </div>
    </div>
  );
}
