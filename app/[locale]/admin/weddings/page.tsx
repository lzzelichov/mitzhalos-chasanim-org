import { setRequestLocale } from 'next-intl/server';
import { supabaseConfigured, supabaseAdminConfigured } from '@/lib/supabase/server';
import AdminWeddingsClient from '@/components/AdminWeddingsLazy';

export const dynamic = 'force-dynamic';

export default function AdminWeddingsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return (
    <AdminWeddingsClient
      supabaseReady={supabaseConfigured}
      adminReady={supabaseAdminConfigured && Boolean(process.env.ADMIN_PASSWORD)}
    />
  );
}
