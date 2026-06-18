'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { celebrate } from '@/lib/confetti';
import { formatDateLabel, getSiteUrl } from '@/lib/utils';
import { formatCurrency, isCurrency, type Currency } from '@/lib/currency';
import { hebrewFull } from '@/lib/hebcal';
import { waMessage } from '@/lib/whatsapp';
import WhatsAppShare from './WhatsAppShare';

interface TyData {
  name: string;
  amount: number;
  currency: Currency;
  date: string;
  chatan: string;
  wedding: string;
}

export default function ThankYouClient() {
  const t = useTranslations('ThankYou');
  const locale = useLocale();
  const params = useSearchParams();
  const [copied, setCopied] = useState(false);

  const cp = params.get('currency');
  const [data, setData] = useState<TyData>({
    name: params.get('name') || '',
    amount: Number(params.get('amount') || 0),
    currency: isCurrency(cp) ? cp : 'usd',
    date: params.get('date') || '',
    chatan: params.get('chatan') || '',
    wedding: params.get('wedding') || '',
  });

  // Prefer server-verified session data when we have a session_id.
  useEffect(() => {
    const sid = params.get('session_id');
    if (!sid) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sid)}`);
        if (!res.ok) return;
        const v = await res.json();
        if (!active || !v.ok) return;
        setData({
          name: v.donorName || '',
          amount: Number(v.amount) || 0,
          currency: isCurrency(v.currency) ? v.currency : 'usd',
          date: v.date || '',
          chatan: locale === 'he' ? v.chatanHe || v.chatanEn || '' : v.chatanEn || '',
          wedding: v.wedding || '',
        });
      } catch {
        /* keep URL-param values */
      }
    })();
    return () => {
      active = false;
    };
  }, [params, locale]);

  useEffect(() => {
    void celebrate();
  }, []);

  const { name, amount, date, chatan, wedding } = data;
  const hebDate = date ? hebrewFull(date) : '';
  const origin = getSiteUrl(typeof window !== 'undefined' ? window.location.origin : '');
  const weddingUrl = wedding ? `${origin}/${locale}/wedding/${wedding}` : origin;

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, text: t('shareText'), url: origin });
        return;
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* unavailable */
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center text-white"
    >
      <div className="mb-4 text-6xl" aria-hidden>💛</div>
      <h1 className="font-display text-5xl font-bold drop-shadow sm:text-6xl">
        {name ? t('title', { name }) : t('shareText')}
      </h1>

      {chatan && date ? (
        <p className="mt-4 font-serif text-lg text-gold-soft">
          {t('sponsoredLine', { hebrewDate: hebDate, engDate: formatDateLabel(date, locale), name: chatan })}
        </p>
      ) : (
        <>
          {amount > 0 && (
            <p className="mt-3 font-sans text-lg text-white/90">
              {t('amountLine', { amount: formatCurrency(amount) })}
            </p>
          )}
          {date && (
            <p className="mt-1 font-sans text-white/70">
              {t('dedicatedLine', { date: formatDateLabel(date, locale) })}
            </p>
          )}
        </>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {chatan && (
          <WhatsAppShare
            message={waMessage(
              'DONOR_THANK_YOU',
              {
                chatan_name: chatan,
                hebrew_date: hebDate,
                english_date: formatDateLabel(date, locale),
                wedding_url: weddingUrl,
              },
              locale
            )}
          />
        )}
        <button onClick={share} className="btn-gold">
          <span aria-hidden>🔗</span>
          {copied ? t('shareCopied') : t('share')}
        </button>
        {wedding ? (
          <Link href={`/wedding/${wedding}`} className="btn-ghost !border-white/40 !bg-white/10 !text-white hover:!bg-white/20">
            {t('viewDate')}
          </Link>
        ) : date ? (
          <Link href={`/date/${date}`} className="btn-ghost !border-white/40 !bg-white/10 !text-white hover:!bg-white/20">
            {t('viewDate')}
          </Link>
        ) : null}
        <Link href="/weddings" className="btn-ghost !border-white/40 !bg-white/10 !text-white hover:!bg-white/20">
          {t('backHome')}
        </Link>
      </div>
    </motion.div>
  );
}
