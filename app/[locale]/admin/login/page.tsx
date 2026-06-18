import { setRequestLocale } from 'next-intl/server';
import AdminLoginForm from '@/components/AdminLoginForm';

export const dynamic = 'force-dynamic';

export default function AdminLoginPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <AdminLoginForm redirectTo="/admin/weddings" />;
}
