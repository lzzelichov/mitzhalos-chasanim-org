'use client';

import { useState } from 'react';

interface Labels {
  name: string;
  email: string;
  message: string;
  submit: string;
  success: string;
}

export default function ContactForm({ labels }: { labels: Labels }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setState('sending');
    setErr('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        setState('done');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        const d = await res.json().catch(() => ({}));
        setErr(d.error || 'error');
        setState('error');
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'error');
      setState('error');
    }
  }

  if (state === 'done') {
    return <p className="card text-center font-sans font-semibold text-green-700">✓ {labels.success}</p>;
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div>
        <label className="label">{labels.name}</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="field" required />
      </div>
      <div>
        <label className="label">{labels.email}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
      </div>
      <div>
        <label className="label">{labels.message}</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="field min-h-32 resize-y" required />
      </div>
      {state === 'error' && <p className="font-sans text-sm text-red-700">⚠️ {err}</p>}
      <button type="submit" disabled={state === 'sending'} className="btn-gold w-full">
        {state === 'sending' ? '…' : labels.submit}
      </button>
    </form>
  );
}
