'use client';

import { useEffect, useState } from 'react';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { hasAdminUiCookie } from '@/lib/adminClient';
import { cn } from '@/lib/utils';

interface NavLabels {
  home: string;
  about: string;
  sponsor: string;
  news: string;
  contact: string;
}

export default function Navbar({
  locale,
  siteName,
  nav,
}: {
  locale: string;
  siteName: string;
  nav: NavLabels;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setAdmin(hasAdminUiCookie());
  }, []);

  const links = [
    { href: '/', label: nav.home },
    { href: '/about', label: nav.about },
    { href: '/sponsor', label: nav.sponsor },
    { href: '/news', label: nav.news },
    { href: '/contact', label: nav.contact },
  ];
  const other = locale === 'he' ? 'en' : 'he';

  return (
    <header className="sticky top-0 z-50 border-b border-gold/30 bg-ivory/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="font-display text-lg font-bold leading-tight text-burgundy sm:text-xl">
          {siteName}
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'rounded-full px-3 py-1.5 font-sans text-sm font-medium transition-colors',
                pathname === l.href ? 'bg-burgundy text-gold' : 'text-charcoal hover:text-burgundy'
              )}
            >
              {l.label}
            </Link>
          ))}
          {admin && (
            <Link href="/admin" className="rounded-full px-3 py-1.5 font-sans text-sm text-charcoal/50 hover:text-burgundy">
              Admin
            </Link>
          )}
          <button
            onClick={() => router.replace(pathname, { locale: other })}
            className="ml-1 rounded-full border border-burgundy/30 px-3 py-1.5 font-sans text-sm font-semibold text-burgundy hover:bg-burgundy hover:text-gold"
          >
            {other === 'he' ? 'עברית' : 'EN'}
          </button>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg border border-burgundy/30 px-3 py-1.5 text-burgundy md:hidden"
          aria-label="Menu"
          aria-expanded={open}
        >
          {open ? '✕' : '☰'}
        </button>
      </nav>

      {open && (
        <div className="border-t border-gold/20 bg-ivory px-4 py-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                'block rounded-lg px-3 py-2 font-sans text-sm font-medium',
                pathname === l.href ? 'bg-burgundy text-gold' : 'text-charcoal hover:bg-cream'
              )}
            >
              {l.label}
            </Link>
          ))}
          {admin && (
            <Link href="/admin" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 font-sans text-sm text-charcoal/60">
              Admin
            </Link>
          )}
          <button
            onClick={() => {
              setOpen(false);
              router.replace(pathname, { locale: other });
            }}
            className="mt-1 block w-full rounded-lg px-3 py-2 text-start font-sans text-sm font-semibold text-burgundy"
          >
            {other === 'he' ? 'עברית' : 'English'}
          </button>
        </div>
      )}
    </header>
  );
}
