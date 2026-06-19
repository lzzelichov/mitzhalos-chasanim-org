'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';

/** Secret shortcut: Ctrl+Shift+A jumps to the admin dashboard. */
export default function AdminShortcut() {
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        router.push('/admin');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);
  return null;
}
