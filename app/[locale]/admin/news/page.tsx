import { setRequestLocale } from 'next-intl/server';
import AdminGate from '@/components/admin/AdminGate';
import AdminNews from '@/components/admin/AdminNews';

export const dynamic = 'force-dynamic';

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <AdminGate title="News">
      <AdminNews />
    </AdminGate>
  );
}
