import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import {
  getWeddingBySlug,
  getWeddingRaised,
  getWeddingSponsored,
  getWeddingVisibility,
  getWeddingDonorCount,
} from '@/lib/data';
import { formatDateLabel, clampPercent } from '@/lib/utils';
import { hebrewFull } from '@/lib/hebcal';
import { waMessage } from '@/lib/whatsapp';
import { visible, type WeddingVis } from '@/lib/weddingVisibilityFields';
import type { Wedding } from '@/lib/types';
import HeroBackground from '@/components/HeroBackground';
import DateGridLazy from '@/components/DateGridLazy';
import ProgressBar from '@/components/ProgressBar';
import WhatsAppShare from '@/components/WhatsAppShare';
import { FlourishDivider, CornerFlourish } from '@/components/Flourish';

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const w = await getWeddingBySlug(slug);
  if (!w) return { title: 'Wedding' };
  const name = locale === 'he' ? w.chatan_name_he || w.chatan_name_en : w.chatan_name_en;
  return { title: `Chatan ${name}` };
}

export default async function WeddingPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('WeddingPage');
  const tw = await getTranslations('Weddings');
  const w = await getWeddingBySlug(slug);

  if (!w) {
    // Wedding not found → back to the listing.
    redirect(`/${locale}/weddings`);
  }

  const [raised, sponsored, vis, donorCount] = await Promise.all([
    getWeddingRaised(w.id),
    getWeddingSponsored(w.id),
    getWeddingVisibility(w.id),
    getWeddingDonorCount(w.id),
  ]);

  const goal = w.goal_usd;
  const raisedDisplay = raised;
  const percent = clampPercent(raisedDisplay, goal);

  const name = locale === 'he' ? w.chatan_name_he || w.chatan_name_en : w.chatan_name_en;
  const wd = new Date(w.wedding_date + 'T00:00:00');
  const weddingUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/${locale}/wedding/${w.slug}`;
  const shareMessage = waMessage(
    'SHARE_WEDDING',
    {
      chatan_name: name,
      hebrew_date: hebrewFull(w.wedding_date),
      english_date: formatDateLabel(w.wedding_date, locale),
      wedding_url: weddingUrl,
    },
    locale
  );

  const chatanHas =
    w.chatan_father_name || w.chatan_mother_name || w.chatan_born || w.chatan_learns_works || w.chatan_link || w.chatan_bio;
  const kallahHas =
    w.kallah_father_name || w.kallah_mother_name || w.kallah_born || w.kallah_learns_works || w.kallah_link || w.kallah_bio;

  return (
    <div className="space-y-12 pb-20 sm:pb-0">
      <Link
        href="/weddings"
        className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-charcoal/70 hover:text-burgundy"
      >
        <span aria-hidden className="flip-rtl">←</span>
        {t('back')}
      </Link>

      {/* Hero */}
      <HeroBackground image={w.cover_photo_url || 'wedding'} className="px-6 py-16 text-center text-white sm:py-20">
        <p className="font-sans text-xs uppercase tracking-[0.3em] text-gold-soft">{tw('honorLabel')}</p>
        <h1 className="mt-2 font-display text-5xl font-bold drop-shadow sm:text-6xl">
          {tw('coupleLine', { name })}
          {w.kallah_initial ? ` ${w.kallah_initial}.` : ''}
        </h1>
        <div className="mx-auto mt-5 max-w-md">
          {visible(vis, 'hebrew_date') && (
            <p className="font-display text-3xl font-semibold text-gold-soft sm:text-4xl">
              {hebrewFull(w.wedding_date)}
            </p>
          )}
          {visible(vis, 'english_date') && (
            <p className="mt-1 font-serif text-lg italic text-white/85">
              {formatDateLabel(w.wedding_date, locale)}
            </p>
          )}
        </div>
        {(w.venue || w.city) && (
          <p className="mt-3 font-sans text-sm text-white/75">
            {[w.venue, w.city].filter(Boolean).join(' · ')}
          </p>
        )}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href={`/donate?wedding=${w.slug}`} className="btn-gold">
            {t('sponsorCta')}
          </Link>
          {visible(vis, 'whatsapp') && <WhatsAppShare message={shareMessage} />}
        </div>
      </HeroBackground>

      {/* Progress */}
      {visible(vis, 'progress') && (
        <div className="space-y-2">
          <ProgressBar raised={raisedDisplay} goal={goal} percent={percent} />
          {donorCount > 0 && (
            <p className="text-center font-sans text-sm text-charcoal/60">
              {t('supporters', { count: donorCount })}
            </p>
          )}
        </div>
      )}

      {/* Story */}
      {w.story && (
        <section className="mx-auto max-w-2xl text-center">
          <FlourishDivider className="mb-6" />
          <h2 className="mb-3 font-display text-3xl font-bold text-burgundy">{t('story')}</h2>
          <div className="story-content whitespace-pre-wrap text-start font-sans text-charcoal/85">
            {w.story}
          </div>
        </section>
      )}

      {/* Meet the Couple */}
      {visible(vis, 'meet_couple') && (chatanHas || kallahHas) && (
        <section>
          <FlourishDivider className="mb-6" />
          <h2 className="text-center font-display text-3xl font-bold text-burgundy">{t('meetCouple')}</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <CoupleColumn heading={tw('coupleLine', { name }).split(' & ')[0]} w={w} side="chatan" t={t} vis={vis} />
            <CoupleColumn
              heading={w.kallah_initial ? `${t('kallahLabel')} ${w.kallah_initial}.` : t('kallahLabel')}
              w={w}
              side="kallah"
              t={t}
              vis={vis}
            />
          </div>
        </section>
      )}

      {/* Date grid */}
      {visible(vis, 'date_grid') && (
        <section>
          <FlourishDivider className="mb-6" />
          <h2 className="mb-1 text-center font-display text-3xl font-bold text-burgundy">{t('sponsorCta')}</h2>
          <p className="mb-6 text-center font-sans text-sm text-charcoal/50">{t('sponsorPrompt')}</p>
          <DateGridLazy
            year={wd.getFullYear()}
            month={wd.getMonth()}
            sponsored={sponsored}
            weddingSlug={w.slug}
            showDonorNames={visible(vis, 'donor_names')}
          />
        </section>
      )}

      {/* Floating support button (mobile) */}
      <Link
        href={`/donate?wedding=${w.slug}`}
        className="btn-gold fixed inset-x-4 bottom-4 z-40 justify-center shadow-lift sm:hidden"
      >
        {t('sponsorCta')}
      </Link>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <p className="flex gap-2 font-sans text-sm text-charcoal/80">
      <span aria-hidden className="text-gold">✦</span>
      <span>
        <span className="font-semibold text-burgundy">{label}:</span> {value}
      </span>
    </p>
  );
}

function CoupleColumn({
  heading,
  w,
  side,
  t,
  vis,
}: {
  heading: string;
  w: Wedding;
  side: 'chatan' | 'kallah';
  t: (k: string) => string;
  vis: WeddingVis;
}) {
  const father = side === 'chatan' ? w.chatan_father_name : w.kallah_father_name;
  const mother = side === 'chatan' ? w.chatan_mother_name : w.kallah_mother_name;
  const born = side === 'chatan' ? w.chatan_born : w.kallah_born;
  const learns = side === 'chatan' ? w.chatan_learns_works : w.kallah_learns_works;
  const link = side === 'chatan' ? w.chatan_link : w.kallah_link;
  const bio = side === 'chatan' ? w.chatan_bio : w.kallah_bio;
  const bioKey = side === 'chatan' ? 'chatan_bio' : 'kallah_bio';

  return (
    <div className="invite-card p-7">
      <CornerFlourish className="absolute left-2.5 top-2.5 w-7 text-gold/70" />
      <CornerFlourish className="absolute bottom-2.5 right-2.5 w-7 rotate-180 text-gold/70" />
      <h3 className="text-center font-display text-2xl font-bold text-burgundy">{heading}</h3>
      <FlourishDivider className="my-4" />
      <div className="space-y-2">
        {visible(vis, 'father_name') && <Detail label={t('father')} value={father} />}
        {visible(vis, 'mother_name') && <Detail label={t('mother')} value={mother} />}
        {visible(vis, 'born') && <Detail label={t('born')} value={born} />}
        {visible(vis, 'learns_works') && <Detail label={t('learnsWorks')} value={learns} />}
        {visible(vis, 'personal_link') && link && (
          <p className="flex gap-2 font-sans text-sm">
            <span aria-hidden className="text-gold">✦</span>
            <a href={link} target="_blank" rel="noopener noreferrer" className="font-semibold text-burgundy underline">
              {t('learnMore')}
            </a>
          </p>
        )}
      </div>
      {visible(vis, bioKey) && bio && (
        <div className="mt-4 whitespace-pre-wrap border-t border-gold/20 pt-4 text-start font-sans text-sm text-charcoal/80">
          {bio}
        </div>
      )}
    </div>
  );
}
