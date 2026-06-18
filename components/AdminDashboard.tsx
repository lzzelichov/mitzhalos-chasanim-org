'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { hasAdminUiCookie } from '@/lib/adminClient';

export default function AdminDashboard() {
  const t = useTranslations('AdminHome');
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthed(hasAdminUiCookie());
    setReady(true);
  }, []);

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setAuthed(false);
  }

  if (!ready) return null;

  if (!authed) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="font-serif text-3xl font-bold text-navy">{t('title')}</h1>
        <p className="mt-2 font-sans text-navy/70">{t('notAuthed')}</p>
        <Link href="/admin/login" className="btn-gold mt-6">
          {t('goLogin')}
        </Link>
      </div>
    );
  }

  const cards = [
    { href: '/admin/weddings', icon: '💍', title: t('weddingsTitle'), desc: t('weddingsDesc') },
    { href: '/admin/content', icon: '📝', title: t('contentTitle'), desc: t('contentDesc') },
    { href: '/admin/upload', icon: '🗓️', title: t('datesTitle'), desc: t('datesDesc') },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-navy">{t('title')}</h1>
        <button onClick={logout} className="btn-ghost !px-4 !py-2 text-sm">
          {t('logout')}
        </button>
      </div>
      <p className="mb-6 font-sans text-navy/70">{t('subtitle')}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="card transition-shadow hover:shadow-glow"
          >
            <div className="text-3xl" aria-hidden>
              {c.icon}
            </div>
            <h2 className="mt-2 font-serif text-xl font-bold text-navy">{c.title}</h2>
            <p className="mt-1 font-sans text-sm text-navy/60">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
