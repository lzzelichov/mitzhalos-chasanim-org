'use client';

import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const LOCALES: { code: 'en' | 'he'; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'he', label: 'עב' },
];

export default function LanguageToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const current = (params?.locale as string) ?? 'en';
  const [isPending, startTransition] = useTransition();

  function switchTo(locale: 'en' | 'he') {
    if (locale === current) return;
    startTransition(() => {
      // Keep the user on the same page, just swap the locale
      router.replace(pathname, { locale });
    });
  }

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 p-0.5"
      role="group"
      aria-label="Language"
    >
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => switchTo(code)}
          disabled={isPending}
          aria-pressed={current === code}
          className={cn(
            'rounded-full px-2.5 py-1 font-sans text-xs font-semibold transition-colors',
            current === code
              ? 'bg-gold text-navy'
              : 'text-white/80 hover:text-white'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
