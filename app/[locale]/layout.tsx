import type { Metadata } from 'next';
import { Cormorant_Garamond, Playfair_Display, Lato, Noto_Serif_Hebrew } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import { routing, isValidLocale } from '@/i18n/routing';
import { getSiteConfig } from '@/lib/data';
import { getSiteContent, extractSettings } from '@/lib/siteContent';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { SiteContentProvider } from '@/components/SiteContentProvider';
import '../globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});
const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
  display: 'swap',
});
const notoHe = Noto_Serif_Hebrew({
  subsets: ['hebrew'],
  weight: ['400', '600', '700'],
  variable: '--font-noto-he',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Common' });
  const config = await getSiteConfig();
  const title = config.couple_name?.trim() || t('siteName');
  return {
    title: { default: title, template: `%s · ${title}` },
    description: 'A wedding fundraiser where every date unlocks a memory.',
    icons: { icon: '/icon.svg' },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isValidLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();
  const config = await getSiteConfig();
  const settings = extractSettings(await getSiteContent());
  const dir = locale === 'he' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${cormorant.variable} ${playfair.variable} ${lato.variable} ${notoHe.variable}`}
    >
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <SiteContentProvider settings={settings}>
            <Navbar coupleName={config.couple_name} />
            <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </SiteContentProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
