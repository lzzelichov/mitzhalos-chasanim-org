import { Suspense } from 'react';
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
  );
}
