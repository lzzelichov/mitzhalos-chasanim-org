'use client';

import dynamic from 'next/dynamic';
import Spinner from './Spinner';

const Inner = dynamic(() => import('./AdminWeddingsClient'), {
  ssr: false,
  loading: () => <Spinner />,
});

export default function AdminWeddingsLazy(props: { supabaseReady: boolean; adminReady: boolean }) {
  return <Inner {...props} />;
}
