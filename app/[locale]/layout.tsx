import type { Metadata } from 'next';
import { Frank_Ruhl_Libre, Raleway, Suez_One } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing, isValidLocale } from '@/i18n/routing';
import { getSiteContent, contentRaw, extractSettings } from '@/lib/siteContent';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileDonateCta from '@/components/MobileDonateCta';
import { SiteContentProvider } from '@/components/SiteContentProvider';
import '../globals.css';

const frankRuhl = Frank_Ruhl_Libre({
  subsets: ['latin', 'hebrew'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-body',
  display: 'swap',
});
const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-heading-en',
  display: 'swap',
});
const suezOne = Suez_One({
  subsets: ['latin', 'hebrew'],
  weight: ['400'],
  variable: '--font-heading-he',
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
  const content = await getSiteContent();
  const name = contentRaw(content, 'brand.name', locale, locale === 'he' ? 'מצהלות חתנים' : 'Mitzhalos Chasanim');
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

  const siteName = contentRaw(content, 'brand.name', locale, locale === 'he' ? 'מצהלות חתנים' : 'Mitzhalos Chasanim');
  const nav = {
    home: contentRaw(content, 'nav.home', locale, 'Home'),
    about: contentRaw(content, 'nav.about', locale, 'About'),
    sponsor: contentRaw(content, 'nav.sponsor', locale, 'Sponsor'),
    news: contentRaw(content, 'nav.news', locale, 'News'),
    contact: contentRaw(content, 'nav.contact', locale, 'Contact'),
  };
  const footer = {
    tagline: contentRaw(content, 'footer.tagline', locale, locale === 'he' ? 'לבוש חתן הוא מצווה' : 'Clothing a Groom is a Mitzvah'),
    rights: contentRaw(content, 'footer.rights', locale, locale === 'he' ? 'כל הזכויות שמורות' : 'All rights reserved'),
  };
  const mobileCta = contentRaw(content, 'mobile.cta', locale, locale === 'he' ? 'תמכו בחתן' : 'Sponsor a Chassan');

  return (
    <html lang={locale} dir={dir} className={`${frankRuhl.variable} ${raleway.variable} ${suezOne.variable}`}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <SiteContentProvider settings={settings}>
            <Navbar locale={locale} siteName={siteName} nav={nav} />
            <main className="min-h-[55vh]">{children}</main>
            <Footer siteName={siteName} footer={footer} />
            <div className="h-20 md:hidden" aria-hidden />
            <MobileDonateCta label={mobileCta} />
          </SiteContentProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
