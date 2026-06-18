import { setRequestLocale } from 'next-intl/server';
import AdminDashboard from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';

export default function AdminPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <AdminDashboard />;
}
