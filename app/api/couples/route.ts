import { NextResponse } from 'next/server';
import { getCouplesByDate } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get('date') || '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ couples: [] });
  return NextResponse.json({ couples: await getCouplesByDate(date) });
}
