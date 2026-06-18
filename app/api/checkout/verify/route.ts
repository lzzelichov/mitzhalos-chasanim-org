import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSupabaseAnon } from '@/lib/supabase/server';
import { hebrewFull } from '@/lib/hebcal';

// Verify a completed checkout session for the thank-you page (server-trusted data).
export async function GET(req: Request) {
  const stripe = getStripe();
  const sessionId = new URL(req.url).searchParams.get('session_id');
  if (!stripe || !sessionId) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const md = session.metadata ?? {};
    const sponsorDate = md.sponsor_date || '';

    let chatanEn = '';
    let chatanHe = '';
    let slug = '';
    if (md.wedding_id) {
      const sb = getSupabaseAnon();
      if (sb) {
        const { data } = await sb
          .from('weddings')
          .select('slug, chatan_name_en, chatan_name_he')
          .eq('id', md.wedding_id)
          .maybeSingle();
        chatanEn = data?.chatan_name_en ?? '';
        chatanHe = data?.chatan_name_he ?? '';
        slug = data?.slug ?? '';
      }
    }

    return NextResponse.json({
      ok: true,
      paid: session.payment_status === 'paid',
      donorName: md.donor_name || '',
      amount: Number(md.amount) || (session.amount_total ? session.amount_total / 100 : 0),
      currency: md.currency || session.currency || 'usd',
      date: sponsorDate,
      hebrewDate: sponsorDate ? hebrewFull(sponsorDate) : '',
      chatanEn,
      chatanHe,
      wedding: slug,
      email: session.customer_details?.email || '',
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
}
