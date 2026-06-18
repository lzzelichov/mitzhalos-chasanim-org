import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('session_id');
  const stripe = getStripe();
  if (!id || !stripe) return NextResponse.json({ ok: false });
  try {
    const s = await stripe.checkout.sessions.retrieve(id);
    const md = s.metadata ?? {};
    return NextResponse.json({
      ok: true,
      donorName: md.donor_name || '',
      amount: Number(md.amount) || (s.amount_total ? s.amount_total / 100 : 0),
      chatan: md.chatan || '',
      email: s.customer_details?.email || '',
    });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
