import { setRequestLocale } from 'next-intl/server';
import { getSiteContent, contentRaw, contentText } from '@/lib/siteContent';
import SponsorClient from '@/components/SponsorClient';
import type { SponsorLabels } from '@/components/sponsorTypes';

export const dynamic = 'force-dynamic';

export default async function SponsorPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const c = await getSiteContent();
  const r = (k: string, f = '') => contentRaw(c, k, locale, f);

  const labels: SponsorLabels = {
    pickDate: r('sponsor.pick_date', 'Pick a date'),
    resultsTitle: r('sponsor.results_title', 'Couples on this date'),
    empty: contentText(c, 'sponsor.empty', locale, 'No couples registered for this date yet. You can still make a general donation:'),
    generalBtn: r('sponsor.general_btn', 'Make a General Donation'),
    generalTitle: locale === 'he' ? 'תרומה כללית' : 'General Donation',
    fullBtn: r('sponsor.full_btn', 'Sponsor Full Package'),
    anyBtn: r('sponsor.any_btn', 'Donate Any Amount'),
    fatherLabel: locale === 'he' ? 'האב' : 'Father',
    motherLabel: locale === 'he' ? 'האם' : 'Mother',
    yeshivaLabel: r('sponsor.yeshiva_label', 'Learned at'),
    chassidusLabel: r('sponsor.chassidus_label', 'Chassidus'),
    donorName: r('donate.donor_name', 'Your Name'),
    anonymous: r('donate.anonymous', 'Donate anonymously'),
    amount: r('donate.amount', 'Amount'),
    custom: r('donate.custom', 'Custom'),
    proceed: r('donate.proceed', 'Proceed to Payment'),
    minNote: r('donate.min_note', 'Minimum $18'),
    emailOpt: r('donate.email_opt', 'Email (optional)'),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-center font-display text-4xl font-bold text-burgundy">{r('sponsor.title', 'Sponsor a Couple')}</h1>
      {contentText(c, 'sponsor.subtitle', locale) && (
        <p className="mx-auto mt-2 max-w-xl text-center font-sans text-charcoal/70">{contentText(c, 'sponsor.subtitle', locale)}</p>
      )}
      <div className="mt-8">
        <SponsorClient labels={labels} locale={locale} />
      </div>
    </div>
  );
}
