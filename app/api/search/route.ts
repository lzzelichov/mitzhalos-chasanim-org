import { NextResponse } from 'next/server';
import { searchWeddings } from '@/lib/data';

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q') ?? '';
  const results = await searchWeddings(q);
  return NextResponse.json({ results });
}
