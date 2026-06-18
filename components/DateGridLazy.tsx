'use client';

import dynamic from 'next/dynamic';
import { DateGridSkeleton } from './Skeletons';
import type { SponsorTile } from '@/lib/types';

// Code-split the calendar (incl. @hebcal) and skip SSR; show a skeleton first.
const DateGrid = dynamic(() => import('./DateGrid'), {
  ssr: false,
  loading: () => <DateGridSkeleton />,
});

export default function DateGridLazy(props: {
  year: number;
  month: number;
  sponsored: Record<string, SponsorTile>;
  weddingSlug?: string;
  defaultView?: 'greg' | 'hebrew';
  showDonorNames?: boolean;
}) {
  return <DateGrid {...props} />;
}
