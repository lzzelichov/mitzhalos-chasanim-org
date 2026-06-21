import { setRequestLocale } from 'next-intl/server';
import { getSiteContent, contentRaw, contentText } from '@/lib/siteContent';
import { getCoupleDateCounts } from '@/lib/data';
import SponsorClient from '@/components/SponsorClient';
import type { SponsorLabels } from '@/components/sponsorTypes';

export const dynamic = 'force-dynamic';

export default async function SponsorPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const [c, dateCounts] = await Promise.all([getSiteContent(), getCoupleDateCounts()]);
  const r = (k: string, f = '') => contentRaw(c, k, locale, f);

  const labels: SponsorLabels = {
    title: r('sponsor.title', 'Sponsor a Couple'),
    calSubtitle: r('sponsor.calendar_subtitle', 'See which chassanim need your help that day'),
    pickDate: r('sponsor.pick_date', 'Pick a date'),
    resultsTitle: r('sponsor.results_title', 'Couples on this date'),
    empty: contentText(c, 'sponsor.empty', locale, 'No couples registered for this date yet. You can still make a general donation:'),
    generalBtn: r('sponsor.general_btn', 'Make a General Donation'),
    generalTitle: locale === 'he' ? 'תרומה כללית' : 'General Donation',
    fullBtn: r('sponsor.full_btn', 'Sponsor Full Package'),
    anyBtn: r('sponsor.any_btn', 'Donate Any Amount'),
    chatanPrefix: r('sponsor.chatan_prefix', locale === 'he' ? 'חתן' : 'Chatan'),
    fatherLabel: r('sponsor.father_label', 'Father'),
    motherLabel: r('sponsor.mother_label', 'Mother'),
    yeshivaLabel: r('sponsor.yeshiva_label', 'Learned at'),
    chassidusLabel: r('sponsor.chassidus_label', 'Chassidus'),
    legendGold: r('sponsor.legend_gold', 'Couples need help'),
    legendBurgundy: r('sponsor.legend_burgundy', 'Fully sponsored'),
    legendGray: r('sponsor.legend_gray', 'No couples'),
    donorName: r('donate.donor_name', 'Your Name'),
    anonymous: r('donate.anonymous', 'Donate anonymously'),
    amount: r('donate.amount', 'Amount'),
    custom: r('donate.custom', 'Custom'),
    proceed: r('donate.proceed', 'Proceed to Payment'),
    minNote: r('donate.min_note', 'Minimum $18'),
    emailOpt: r('donate.email_opt', 'Email (optional)'),
  };

  const orgName = r('brand.name', locale === 'he' ? 'מצהלות חתנים' : 'Mitzhalos Chasanim');

  return (
    <div style={{ backgroundColor: '#0f0f14' }}>
      {/* Elegant dark header — no photo */}
      <header className="px-4 pb-12 pt-20 text-center">
        <h1 className="font-display text-5xl font-bold leading-tight sm:text-6xl" style={{ color: '#f5e6d3' }}>
          {orgName}
        </h1>
        <p className="mt-4 font-display text-xl font-semibold sm:text-2xl" style={{ color: '#c9a84c' }}>
          {labels.title}
        </p>
        <p className="mx-auto mt-3 max-w-xl font-sans" style={{ color: 'rgba(245,230,211,0.7)' }}>
          {labels.calSubtitle}
        </p>
      </header>

      {/* Thin gold divider between the dark header and the calendar */}
      <div className="mx-auto max-w-5xl px-4">
        <hr className="gold-divider" />
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-12 pt-10">
        <SponsorClient dateCounts={dateCounts} labels={labels} locale={locale} />
      </div>
    </div>
  );
}
