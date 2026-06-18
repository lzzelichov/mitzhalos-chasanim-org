'use client';

import { useEffect, useState } from 'react';
import { hasAdminUiCookie } from '@/lib/adminClient';

export default function AdminGate({ title, children }: { title: string; children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);

  useEffect(() => {
    setAuthed(hasAdminUiCookie());
    setReady(true);
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setErr(false);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      setAuthed(true);
      setPw('');
    } else {
      setErr(true);
    }
  }

  if (!ready) return null;

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="mb-2 text-center font-display text-3xl font-bold text-burgundy">{title}</h1>
        <p className="mb-6 text-center font-sans text-sm text-charcoal/60">Enter the admin password</p>
        <form onSubmit={login} className="card space-y-4">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            className="field"
            autoFocus
          />
          {err && <p className="font-sans text-sm text-red-600">Wrong password</p>}
          <button type="submit" className="btn-gold w-full">
            Unlock
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
