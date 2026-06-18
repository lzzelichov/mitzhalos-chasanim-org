import { setRequestLocale } from 'next-intl/server';
import AdminGate from '@/components/admin/AdminGate';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const dynamic = 'force-dynamic';

export default function AdminPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <AdminGate title="Admin">
      <AdminDashboard />
    </AdminGate>
  );
}
