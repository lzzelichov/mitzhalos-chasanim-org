'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { formatCurrency } from '@/lib/currency';
import { waFill, WHATSAPP_TEMPLATES } from '@/lib/whatsapp';
import WhatsAppShare from './WhatsAppShare';

interface Labels {
  title: string;
  subtitle: string;
  share: string;
  back: string;
}

export default function ThankYouClient({
  labels,
  locale,
  siteUrl,
}: {
  labels: Labels;
  locale: string;
  siteUrl: string;
}) {
  const params = useSearchParams();
  const [data, setData] = useState({
    name: params.get('name') || '',
    amount: Number(params.get('amount') || 0),
    chatan: params.get('chatan') || '',
  });

  useEffect(() => {
    const sid = params.get('session_id');
    if (!sid) return;
    let on = true;
    (async () => {
      try {
        const r = await fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sid)}`);
        if (!r.ok) return;
        const v = await r.json();
        if (!on || !v.ok) return;
        setData({ name: v.donorName || '', amount: Number(v.amount) || 0, chatan: v.chatan || '' });
      } catch {
        /* keep URL-param values */
      }
    })();
    return () => {
      on = false;
    };
  }, [params]);

  const wa = waFill(locale === 'he' ? WHATSAPP_TEMPLATES.DONOR_THANK_YOU : WHATSAPP_TEMPLATES.DONOR_THANK_YOU_EN, {
    name: data.chatan || '',
    hebrew_date: '',
    url: siteUrl,
  });

  return (
    <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className="text-6xl" aria-hidden>💛</div>
      <h1 className="mt-3 font-display text-4xl font-bold text-burgundy">{labels.title}</h1>
      {labels.subtitle && <p className="mt-2 font-sans text-charcoal/80">{labels.subtitle}</p>}
      {data.amount > 0 && (
        <p className="mt-4 font-display text-2xl font-bold text-burgundy">
          {formatCurrency(data.amount)}
          {data.chatan ? ` · ${locale === 'he' ? 'חתן' : 'Chatan'} ${data.chatan}` : ''}
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <WhatsAppShare text={wa} label={labels.share} />
        <Link href="/" className="btn-ghost">
          {labels.back}
        </Link>
      </div>
    </div>
  );
}
