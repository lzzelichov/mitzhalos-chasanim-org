'use client';

import dynamic from 'next/dynamic';
import Spinner from './Spinner';

const Inner = dynamic(() => import('./AdminContentClient'), {
  ssr: false,
  loading: () => <Spinner />,
});

export default function AdminContentLazy(props: {
  sections: { id: string; icon: string; label: string }[];
  supabaseReady: boolean;
  adminReady: boolean;
}) {
  return <Inner {...props} />;
}
