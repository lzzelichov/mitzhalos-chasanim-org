'use client';

import dynamic from 'next/dynamic';
import Spinner from './Spinner';

const Inner = dynamic(() => import('./AdminClient'), {
  ssr: false,
  loading: () => <Spinner />,
});

export default function AdminUploadLazy(props: { supabaseReady: boolean; adminReady: boolean }) {
  return <Inner {...props} />;
}
