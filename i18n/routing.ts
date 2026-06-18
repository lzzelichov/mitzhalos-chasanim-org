import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'he'],
  defaultLocale: 'en',
});

export type Locale = (typeof routing.locales)[number];

export function isValidLocale(locale: string): locale is Locale {
  return (routing.locales as readonly string[]).includes(locale);
}

// Locale-aware navigation helpers (drop-in replacements for next/link & next/navigation)
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
