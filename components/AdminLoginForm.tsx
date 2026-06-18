'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';

export default function AdminLoginForm({ redirectTo = '/admin' }: { redirectTo?: string }) {
  const t = useTranslations('AdminLogin');
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setLoading(true);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push(redirectTo);
      router.refresh();
    } else {
      setError(true);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-2 text-center font-serif text-3xl font-bold text-navy">{t('title')}</h1>
      <p className="mb-6 text-center font-sans text-sm text-navy/60">{t('prompt')}</p>
      <form onSubmit={submit} className="card space-y-4">
        <div>
          <label htmlFor="pw" className="label">
            {t('password')}
          </label>
          <input
            id="pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            autoFocus
          />
        </div>
        {error && <p className="font-sans text-sm text-red-600">{t('wrong')}</p>}
        <button type="submit" disabled={loading} className="btn-gold w-full">
          {t('signIn')}
        </button>
      </form>
      <div className="mt-4 text-center">
        <Link href="/" className="font-sans text-sm text-navy/50 hover:text-navy">
          {t('backHome')}
        </Link>
      </div>
    </div>
  );
}
