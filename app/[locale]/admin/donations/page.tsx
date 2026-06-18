import { setRequestLocale } from 'next-intl/server';
import AdminGate from '@/components/admin/AdminGate';
import AdminDonations from '@/components/admin/AdminDonations';

export const dynamic = 'force-dynamic';

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <AdminGate title="Donations">
      <AdminDonations />
    </AdminGate>
  );
}
