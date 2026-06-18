import type { Metadata } from 'next';
import { Cormorant_Garamond, Playfair_Display, Lato, Noto_Serif_Hebrew } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing, isValidLocale } from '@/i18n/routing';
import { getSiteContent, contentRaw, extractSettings } from '@/lib/siteContent';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SiteContentProvider } from '@/components/SiteContentProvider';
import '../globals.css';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-cormorant', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const lato = Lato({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-lato', display: 'swap' });
const notoHe = Noto_Serif_Hebrew({ subsets: ['hebrew'], weight: ['400', '600', '700'], variable: '--font-noto-he', display: 'swap' });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const content = await getSiteContent();
  const name = contentRaw(content, 'settings.site_name', locale, 'Mitzhalos Chasanim');
  return {
    title: { default: name, template: `%s · ${name}` },
    description: 'Mitzhalos Chasanim — full wedding clothing packages for poor chassidish couples.',
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
  if (!isValidLocale(locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const content = await getSiteContent();
  const settings = extractSettings(content);
  const dir = locale === 'he' ? 'rtl' : 'ltr';

  const siteName = contentRaw(content, 'settings.site_name', locale, 'Mitzhalos Chasanim');
  const nav = {
    home: contentRaw(content, 'nav.home', locale, 'Home'),
    about: contentRaw(content, 'nav.about', locale, 'About'),
    sponsor: contentRaw(content, 'nav.sponsor', locale, 'Sponsor'),
    news: contentRaw(content, 'nav.news', locale, 'News'),
    contact: contentRaw(content, 'nav.contact', locale, 'Contact'),
  };
  const footer = {
    taglineHe: contentRaw(content, 'footer.tagline_he', locale, 'לבוש חתן הוא מצווה'),
    taglineEn: contentRaw(content, 'footer.tagline_en', locale, 'Clothing a Groom is a Mitzvah'),
    rights: contentRaw(content, 'footer.rights', locale, 'All rights reserved'),
  };

  return (
    <html lang={locale} dir={dir} className={`${cormorant.variable} ${playfair.variable} ${lato.variable} ${notoHe.variable}`}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <SiteContentProvider settings={settings}>
            <Navbar locale={locale} siteName={siteName} nav={nav} />
            <main className="min-h-[55vh]">{children}</main>
            <Footer siteName={siteName} footer={footer} />
          </SiteContentProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
