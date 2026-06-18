import { setRequestLocale } from 'next-intl/server';
import { supabaseConfigured, supabaseAdminConfigured } from '@/lib/supabase/server';
import AdminClient from '@/components/AdminUploadLazy';

// Admin must always render dynamically (it depends on request/auth state).
export const dynamic = 'force-dynamic';

export default function AdminUploadPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return (
    <AdminClient
      supabaseReady={supabaseConfigured}
      adminReady={supabaseAdminConfigured && Boolean(process.env.ADMIN_PASSWORD)}
    />
  );
}
