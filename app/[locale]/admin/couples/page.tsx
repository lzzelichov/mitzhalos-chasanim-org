import { setRequestLocale } from 'next-intl/server';
import AdminGate from '@/components/admin/AdminGate';
import AdminCouples from '@/components/admin/AdminCouples';

export const dynamic = 'force-dynamic';

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <AdminGate title="Couples">
      <AdminCouples />
    </AdminGate>
  );
}
