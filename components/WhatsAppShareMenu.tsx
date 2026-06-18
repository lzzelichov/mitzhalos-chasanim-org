'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { waMessage, waUrl, type WaBaseKey } from '@/lib/whatsapp';
import { hebrewFull } from '@/lib/hebcal';
import { formatDateLabel, clampPercent } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
import type { Wedding } from '@/lib/types';

const OPTIONS: { key: WaBaseKey; en: string; he: string }[] = [
  { key: 'SHARE_WEDDING', en: 'Share wedding link', he: 'שיתוף קישור החתונה' },
  { key: 'MILESTONE_REACHED', en: 'Send milestone update', he: 'עדכון אבן דרך' },
  { key: 'WEDDING_REMINDER', en: 'Send reminder', he: 'שליחת תזכורת' },
  { key: 'DONOR_THANK_YOU', en: 'Thank-you message', he: 'הודעת תודה' },
  { key: 'FULLY_FUNDED', en: 'Fully funded', he: 'הושלם הגיוס' },
];

export default function WhatsAppShareMenu({
  wedding,
  raisedUsd = 0,
}: {
  wedding: Wedding;
  raisedUsd?: number;
}) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  if (process.env.NEXT_PUBLIC_WHATSAPP_ENABLED === 'false') return null;

  const name = locale === 'he' ? wedding.chatan_name_he || wedding.chatan_name_en : wedding.chatan_name_en;
  const goal = wedding.goal_usd;
  const raised = raisedUsd;
  const percent = clampPercent(raised, goal);
  const remaining = formatCurrency(Math.max(0, goal - raised));
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const weddingUrl = `${origin}/${locale}/wedding/${wedding.slug}`;
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(wedding.wedding_date + 'T00:00:00').getTime() - Date.now()) / 86400000)
  );

  const vars = {
    chatan_name: name,
    hebrew_date: hebrewFull(wedding.wedding_date),
    english_date: formatDateLabel(wedding.wedding_date, locale),
    wedding_url: weddingUrl,
    percent,
    remaining,
    days_left: daysLeft,
  };

  function send(key: WaBaseKey) {
    window.open(waUrl(waMessage(key, vars, locale)), '_blank', 'noopener,noreferrer');
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-3 py-1.5 text-xs font-medium text-[#1a7a43] hover:bg-[#25D366]/20"
      >
        📱 {locale === 'he' ? 'שיתוף' : 'Share'}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute end-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-gold/30 bg-white shadow-lift">
            {OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => send(o.key)}
                className="block w-full px-3 py-2 text-start font-sans text-xs text-charcoal hover:bg-cream"
              >
                {locale === 'he' ? o.he : o.en}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
