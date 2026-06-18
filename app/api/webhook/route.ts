import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { revalidateTag } from 'next/cache';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { getSupabaseAdmin, SB_TAG } from '@/lib/supabase/server';
import { donorConfirmationEmail } from '@/lib/emails/templates';
import { sendEmail } from '@/lib/emails/send';
import { hebrewFull } from '@/lib/hebcal';
import { getSiteUrl } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  const body = await req.text();
  const sig = headers().get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const sb = getSupabaseAdmin();
    if (sb) {
      const md = session.metadata ?? {};
      const amount = Number(md.amount) || (session.amount_total ? session.amount_total / 100 : 0);
      const coupleId = md.couple_id || null;
      const type = md.type === 'full_package' ? 'full_package' : 'partial';
      const email = session.customer_details?.email || md.email || null;

      await sb.from('donations').insert({
        couple_id: coupleId,
        donor_name: md.donor_name || 'Anonymous',
        is_anonymous: md.is_anonymous === '1',
        amount,
        type,
        currency: 'usd',
        status: 'paid',
        email,
        stripe_session_id: session.id,
      });

      // Update the couple's running totals + optionally email the donor.
      if (coupleId) {
        const { data: c } = await sb
          .from('couples')
          .select('total_raised, donor_count, chatan_name_en, wedding_date')
          .eq('id', coupleId)
          .maybeSingle();
        if (c) {
          await sb
            .from('couples')
            .update({
              total_raised: (Number(c.total_raised) || 0) + amount,
              donor_count: (Number(c.donor_count) || 0) + 1,
            })
            .eq('id', coupleId);
        }
        if (process.env.RESEND_API_KEY && email) {
          await sendEmail(
            email,
            donorConfirmationEmail({
              donorName: md.donor_name || 'Friend',
              amount,
              coupleName: c?.chatan_name_en ? `Chatan ${c.chatan_name_en}` : 'a chatan',
              hebrewDate: c?.wedding_date ? hebrewFull(c.wedding_date) : '',
              siteUrl: getSiteUrl(),
            })
          ).catch(() => {});
        }
      }
      revalidateTag(SB_TAG);
    }
  }

  return NextResponse.json({ received: true });
}
