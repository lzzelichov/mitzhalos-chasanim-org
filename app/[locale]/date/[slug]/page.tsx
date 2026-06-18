import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getDateBySlug, getDedicationForDate } from '@/lib/data';
import { formatDateLabel } from '@/lib/utils';

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const row = await getDateBySlug(slug);
  return { title: row?.title || formatDateLabel(slug, locale) };
}

export default async function DatePage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('DatePage');
  const row = await getDateBySlug(slug);
  const dedication = row ? await getDedicationForDate(row.id) : null;
  const blessing = dedication?.message ?? null;
  const dateLabel = formatDateLabel(slug, locale);

  return (
    <article className="mx-auto max-w-2xl">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 font-sans text-sm font-medium text-navy/70 hover:text-navy"
      >
        <span aria-hidden className="flip-rtl">
          ←
        </span>
        {t('back')}
      </Link>

      <p className="font-sans text-sm font-semibold uppercase tracking-wide text-gold">
        {dateLabel}
      </p>

      {row ? (
        <>
          <h1 className="mt-1 font-serif text-3xl font-bold text-navy sm:text-4xl">
            {row.title}
          </h1>

          {dedication && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5">
              <span aria-hidden>💛</span>
              <span className="font-sans text-sm font-medium text-navy">
                {t('dedicatedBy', { name: dedication.donor_name })}
              </span>
            </div>
          )}

          {row.photo_url && (
            <div className="relative mt-6 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-navy/10 shadow-glow">
              <Image
                src={row.photo_url}
                alt={row.title ?? dateLabel}
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {row.story && (
            <div className="story-content mt-6 whitespace-pre-wrap font-sans text-charcoal/85">
              {row.story}
            </div>
          )}

          {blessing && (
            <p className="mt-6 border-s-2 border-gold ps-4 font-serif text-lg italic text-navy/75">
              {t('messageFrom', { message: blessing })}
            </p>
          )}
        </>
      ) : (
        <div className="card mt-4 text-center">
          <h1 className="font-serif text-2xl font-bold text-navy">{t('notFilledTitle')}</h1>
          <p className="mx-auto mt-2 max-w-md font-sans text-navy/70">{t('notFilledBody')}</p>
        </div>
      )}

      <div className="mt-10 flex justify-center">
        <Link href={`/donate?date=${slug}`} className="btn-gold">
          <span aria-hidden>💛</span>
          {t('dedicateCta')}
        </Link>
      </div>
    </article>
  );
}
