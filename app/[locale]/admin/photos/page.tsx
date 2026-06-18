import { setRequestLocale } from 'next-intl/server';
import AdminGate from '@/components/admin/AdminGate';
import AdminPhotos from '@/components/admin/AdminPhotos';

export const dynamic = 'force-dynamic';

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <AdminGate title="Photos">
      <AdminPhotos />
    </AdminGate>
  );
}
