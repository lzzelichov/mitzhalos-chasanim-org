import { Suspense } from 'react';
import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';
import { getSiteContent, contentRaw } from '@/lib/siteContent';
import { getSiteUrl } from '@/lib/utils';
import ThankYouClient from '@/components/ThankYouClient';

export const dynamic = 'force-dynamic';

export default async function ThankYouPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const c = await getSiteContent();
  const r = (k: string, f = '') => contentRaw(c, k, locale, f);

  return (
    <section className="hero-section flex min-h-[80vh] items-center justify-center overflow-hidden text-white">
      <Image src="/heroes/thankyou.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="relative z-10 w-full">
        <Suspense>
          <ThankYouClient
            locale={locale}
            siteUrl={getSiteUrl() || ''}
            labels={{
              title: r('thankyou.title', 'Thank you!'),
              subtitle: r('thankyou.subtitle', ''),
              share: r('thankyou.share', 'Share'),
              back: r('thankyou.back', 'Back to Home'),
            }}
          />
        </Suspense>
      </div>
    </section>
  );
}
