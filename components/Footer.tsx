'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useSetting } from './SiteContentProvider';

function JerusalemSkyline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 52" className={className} aria-hidden fill="currentColor">
      {/* city wall */}
      <rect x="0" y="38" width="240" height="14" />
      {/* crenellations */}
      {Array.from({ length: 20 }).map((_, i) => (
        <rect key={i} x={4 + i * 12} y="33" width="6" height="5" />
      ))}
      {/* left tower */}
      <rect x="22" y="20" width="18" height="18" />
      <path d="M22 20 L31 10 L40 20 Z" />
      {/* central dome (Dome of the Rock silhouette) */}
      <rect x="104" y="26" width="32" height="12" />
      <path d="M104 26 a16 16 0 0 1 32 0 Z" />
      <rect x="118" y="6" width="4" height="8" />
      <circle cx="120" cy="5" r="3" />
      {/* right minaret */}
      <rect x="196" y="14" width="10" height="24" />
      <path d="M196 14 L201 6 L206 14 Z" />
    </svg>
  );
}

export default function Footer() {
  const t = useTranslations('Footer');
  const tn = useTranslations('Nav');
  const tc = useTranslations('Common');
  const year = String(new Date().getFullYear());
  const showAdminLink = useSetting('show_footer_admin');

  return (
    <footer className="mt-16 bg-burgundy-gradient text-gold-soft">
      <div className="mx-auto max-w-6xl px-4 py-10 text-center">
        <JerusalemSkyline className="mx-auto h-10 w-auto text-gold/80" />
        <p className="mt-3 font-display text-3xl font-bold text-gold" dir="rtl">
          בנין עדי עד
        </p>
        <p className="font-sans text-xs italic text-gold-soft/70">{t('tagline')}</p>

        <div className="gold-divider mx-auto my-5 max-w-xs" />

        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:justify-between">
          <p className="font-sans text-xs text-gold-soft/70">
            {t('rights', { year, name: tc('siteName') })}
          </p>
          {showAdminLink && (
            <Link href="/admin" className="font-sans text-xs text-gold-soft/60 transition-colors hover:text-gold">
              {tn('admin')}
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
