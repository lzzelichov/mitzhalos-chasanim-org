import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getDateOptions, getWeddingBySlug, getWeddingSponsored } from '@/lib/data';
import { stripeConfigured } from '@/lib/stripe';
import DonateForm from '@/components/DonateForm';
import HeroBackground from '@/components/HeroBackground';

export default async function DonatePage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { date?: string; wedding?: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('Donate');

  const wedding = searchParams.wedding ? await getWeddingBySlug(searchParams.wedding) : null;
  const dateOptions = wedding ? [] : await getDateOptions();
  const sponsored = wedding ? await getWeddingSponsored(wedding.id) : {};
  const chatanName = wedding
    ? locale === 'he'
      ? wedding.chatan_name_he || wedding.chatan_name_en
      : wedding.chatan_name_en
    : undefined;

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <HeroBackground image="donate" className="px-6 py-12 text-center text-white" showChuppa={false}>
        <h1 className="font-display text-4xl font-bold drop-shadow sm:text-5xl">{t('title')}</h1>
        <p className="mx-auto mt-2 max-w-md font-sans text-white/85">{t('subtitle')}</p>
      </HeroBackground>

      <DonateForm
        mode={wedding ? 'wedding' : 'legacy'}
        stripeConfigured={stripeConfigured}
        dateOptions={dateOptions}
        weddingSlug={wedding?.slug}
        weddingId={wedding?.id}
        chatanName={chatanName}
        weddingDateISO={wedding?.wedding_date}
        sponsored={sponsored}
        preselectedDate={searchParams.date ?? null}
      />
    </div>
  );
}
