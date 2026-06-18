'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { hasAdminUiCookie } from '@/lib/adminClient';
import { useSetting } from './SiteContentProvider';
import LanguageToggle from './LanguageToggle';

export default function Navbar({ coupleName }: { coupleName?: string }) {
  const t = useTranslations('Nav');
  const tc = useTranslations('Common');
  const pathname = usePathname();

  const [showAdmin, setShowAdmin] = useState(process.env.NODE_ENV === 'development');
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (hasAdminUiCookie()) setShowAdmin(true);
  }, []);
  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const showSearch = useSetting('show_search');
  const showLang = useSetting('show_language_toggle');

  const title = coupleName?.trim() ? coupleName : tc('siteName');
  const links = [
    { href: '/', label: t('home') },
    { href: '/weddings', label: t('weddings') },
    ...(showSearch ? [{ href: '/search', label: t('search') }] : []),
    ...(showAdmin ? [{ href: '/admin', label: t('admin') }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gold/20 bg-burgundy/95 backdrop-blur supports-[backdrop-filter]:bg-burgundy/85">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-bold text-white sm:text-2xl"
        >
          <span aria-hidden className="text-gold">💍</span>
          <span className="line-clamp-1">{title}</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop links */}
          <div className="hidden items-center gap-4 sm:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'font-sans text-sm font-medium transition-colors',
                  pathname === l.href ? 'text-gold' : 'text-white/80 hover:text-white'
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {showLang && (
            <span className="hidden sm:inline-flex">
              <LanguageToggle />
            </span>
          )}

          <Link href="/donate" className="btn-gold !px-4 !py-2 text-sm">
            {t('donate')}
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-2xl text-white sm:hidden"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      {menuOpen && (
        <div className="fixed inset-0 top-16 z-50 flex flex-col gap-1 bg-burgundy/98 p-6 backdrop-blur sm:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'rounded-lg px-4 py-3 font-display text-2xl transition-colors',
                pathname === l.href ? 'text-gold' : 'text-white/90 hover:bg-white/10'
              )}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-4 flex items-center gap-3">
            {showLang && <LanguageToggle />}
            <Link
              href="/donate"
              onClick={() => setMenuOpen(false)}
              className="btn-gold flex-1 justify-center"
            >
              {t('donate')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
