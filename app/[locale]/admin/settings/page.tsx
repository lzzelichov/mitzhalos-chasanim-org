import { setRequestLocale } from 'next-intl/server';
import AdminGate from '@/components/admin/AdminGate';
import AdminContentEditor from '@/components/admin/AdminContentEditor';

export const dynamic = 'force-dynamic';

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <AdminGate title="Settings">
      <AdminContentEditor mode="settings" />
    </AdminGate>
  );
}
