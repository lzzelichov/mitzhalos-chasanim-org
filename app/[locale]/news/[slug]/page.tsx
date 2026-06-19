import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getNewsBySlug } from '@/lib/data';
import { getSiteContent, settingOn } from '@/lib/siteContent';
import { getSiteUrl } from '@/lib/utils';
import { localeDate } from '@/lib/hebcal';
import { waFill, WHATSAPP_TEMPLATES } from '@/lib/whatsapp';
import WhatsAppShare from '@/components/WhatsAppShare';
import CopyLinkButton from '@/components/CopyLinkButton';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const post = await getNewsBySlug(slug);
  if (!post) return { title: 'News' };
  return { title: locale === 'he' ? post.title_he || post.title_en : post.title_en };
}

export default async function NewsPostPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);
  const post = await getNewsBySlug(slug);
  if (!post) notFound();
  const c = await getSiteContent();
  const showWa = settingOn(c, 'show_whatsapp', true);

  const title = locale === 'he' ? post.title_he || post.title_en : post.title_en;
  const content = locale === 'he' ? post.content_he || post.content_en || '' : post.content_en || post.content_he || '';
  const url = `${getSiteUrl()}/${locale}/news/${post.slug}`;
  const wa = waFill(locale === 'he' ? WHATSAPP_TEMPLATES.SHARE_GENERAL : WHATSAPP_TEMPLATES.SHARE_GENERAL_EN, { url });

  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <p className="font-sans text-sm text-charcoal/50">
        {post.published_at ? localeDate(post.published_at.slice(0, 10), locale) : ''}
      </p>
      <h1 className="mt-1 font-display text-4xl font-bold text-burgundy">{title}</h1>
      {post.photo_url && (
        <div className="relative mt-5 aspect-video overflow-hidden rounded-xl border border-gold/30">
          <Image src={post.photo_url} alt="" fill sizes="(max-width:768px) 100vw, 640px" className="object-cover" />
        </div>
      )}
      <div className="story-content mt-6 whitespace-pre-wrap font-sans text-charcoal/85">{content}</div>
      <div className="mt-8 flex flex-wrap gap-3">
        {showWa && <WhatsAppShare text={wa} label={locale === 'he' ? 'שיתוף' : 'Share'} />}
        <CopyLinkButton url={url} label={locale === 'he' ? 'העתק קישור' : 'Copy Link'} copiedLabel={locale === 'he' ? 'הועתק' : 'Copied'} />
      </div>
    </article>
  );
}
