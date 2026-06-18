import { NextResponse } from 'next/server';
import { adminGuard } from '@/lib/adminGuard';

export const dynamic = 'force-dynamic';

export async function GET() {
  const g = adminGuard();
  if ('error' in g) return g.error;
  const { data, error } = await g.sb
    .from('donations')
    .select('id, donor_name, is_anonymous, amount, type, status, currency, email, created_at, couple_id, couples(chatan_name_en)')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []).map((d) => {
    const couples = d.couples as { chatan_name_en?: string } | { chatan_name_en?: string }[] | null;
    const couple = Array.isArray(couples) ? couples[0] : couples;
    return {
      id: d.id,
      donor_name: d.is_anonymous ? 'Anonymous' : d.donor_name,
      amount: Number(d.amount) || 0,
      type: d.type,
      couple_name: couple?.chatan_name_en ?? null,
      email: d.email,
      created_at: d.created_at,
    };
  });

  // Summary cards
  const now = new Date();
  let total = 0;
  let thisMonth = 0;
  const byCouple = new Map<string, number>();
  for (const r of rows) {
    total += r.amount;
    const dt = new Date(r.created_at);
    if (dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth()) thisMonth += r.amount;
    if (r.couple_name) byCouple.set(r.couple_name, (byCouple.get(r.couple_name) ?? 0) + r.amount);
  }
  let topCouple = '';
  let topAmount = 0;
  byCouple.forEach((amt, name) => {
    if (amt > topAmount) {
      topCouple = name;
      topAmount = amt;
    }
  });

  return NextResponse.json({
    rows,
    summary: { total, donors: rows.length, thisMonth, topCouple, topAmount },
  });
}
