import { setRequestLocale } from 'next-intl/server';
import { supabaseConfigured, supabaseAdminConfigured } from '@/lib/supabase/server';
import { SECTIONS } from '@/lib/siteContent';
import AdminContentLazy from '@/components/AdminContentLazy';

export const dynamic = 'force-dynamic';

export default function AdminContentPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return (
    <AdminContentLazy
      sections={SECTIONS}
      supabaseReady={supabaseConfigured}
      adminReady={supabaseAdminConfigured && Boolean(process.env.ADMIN_PASSWORD)}
    />
  );
}
