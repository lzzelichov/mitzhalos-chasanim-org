'use client';

import { Link, useRouter } from '@/i18n/routing';

const ITEMS: [string, string, string][] = [
  ['couples', '💍 Couples', 'Add, edit, and manage couples'],
  ['donations', '💰 Donations', 'View donations and export CSV'],
  ['news', '📰 News', 'Publish and manage news posts'],
  ['content', '📝 Content CMS', 'Edit every piece of text on the site'],
  ['settings', '⚙️ Settings', 'Global toggles and configuration'],
  ['photos', '🖼️ Photos', 'Manage the About-page gallery'],
];

export default function AdminDashboard() {
  const router = useRouter();
  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.refresh();
    window.location.reload();
  }
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-burgundy">Admin Dashboard</h1>
        <button onClick={logout} className="btn-ghost !px-4 !py-2 text-sm">
          Log out
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map(([href, title, desc]) => (
          <Link key={href} href={`/admin/${href}`} className="card block transition-shadow hover:shadow-glow">
            <h2 className="font-display text-xl font-bold text-burgundy">{title}</h2>
            <p className="mt-1 font-sans text-sm text-charcoal/60">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
