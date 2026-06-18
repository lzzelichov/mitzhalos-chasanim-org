import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { supabaseConfigured } from '@/lib/supabase/server';
import SearchClient from '@/components/SearchClient';

export default function SearchPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <Suspense fallback={null}>
      <SearchClient configured={supabaseConfigured} />
    </Suspense>
  );
}
