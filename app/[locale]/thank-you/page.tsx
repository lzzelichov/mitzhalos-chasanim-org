import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import HeroBackground from '@/components/HeroBackground';
import ThankYouClient from '@/components/ThankYouClient';

// Reads query params at runtime — render dynamically (no static prerender).
export const dynamic = 'force-dynamic';

export default function ThankYouPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <HeroBackground image="thankyou" className="px-2 py-10">
      <Suspense fallback={null}>
        <ThankYouClient />
      </Suspense>
    </HeroBackground>
  );
}
