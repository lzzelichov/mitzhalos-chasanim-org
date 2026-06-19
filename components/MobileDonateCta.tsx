'use client';

import { Link, usePathname } from '@/i18n/routing';

export default function MobileDonateCta({ label }: { label: string }) {
  const pathname = usePathname();
  if (pathname === '/sponsor') return null; // already on the sponsor page
  return (
    <Link
      href="/sponsor"
      className="mobile-cta flex items-center justify-center bg-burgundy text-center font-sans font-semibold uppercase tracking-wide text-gold shadow-lift"
    >
      {label}
    </Link>
  );
}
