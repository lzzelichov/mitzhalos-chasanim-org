import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { revalidateTag } from 'next/cache';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { getSupabaseAdmin, SB_TAG } from '@/lib/supabase/server';
import { hebrewFull } from '@/lib/hebcal';
import { sendEmail } from '@/lib/emails/send';
import { donorConfirmationEmail, adminDonationAlertEmail } from '@/lib/emails/templates';

// Stripe needs the Node runtime + the raw request body.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

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
      const currency = 'usd';
      const amount =
        Number(md.amount) || (session.amount_total ? session.amount_total / 100 : 0);
      const weddingId = md.wedding_id || null;
      const sponsorDate = md.sponsor_date || '';
      let dedicatedDateId = md.dedicated_date_id || null;

      // For a wedding sponsorship, ensure a date tile exists, then link it.
      if (weddingId && sponsorDate) {
        const { data: existing } = await sb
          .from('dates')
          .select('id')
          .eq('wedding_id', weddingId)
          .eq('date', sponsorDate)
          .maybeSingle();
        if (existing) {
          dedicatedDateId = existing.id;
        } else {
          const { data: ins } = await sb
            .from('dates')
            .insert({ wedding_id: weddingId, date: sponsorDate, is_published: true })
            .select('id')
            .single();
          dedicatedDateId = ins?.id ?? null;
        }
      }

      await sb.from('donations').insert({
        donor_name: md.donor_name || 'Anonymous',
        amount,
        currency,
        message: null,
        is_anonymous: md.is_anonymous === '1',
        wedding_id: weddingId,
        dedicated_date_id: dedicatedDateId,
        stripe_session_id: session.id,
      });
      revalidateTag(SB_TAG);

      // Email hooks — no-op unless RESEND_API_KEY is set (see lib/emails/send.ts).
      if (process.env.RESEND_API_KEY) {
        try {
          const origin = process.env.NEXT_PUBLIC_SITE_URL || '';
          let chatanName = '';
          let slug = '';
          if (weddingId) {
            const { data: w } = await sb
              .from('weddings')
              .select('chatan_name_en, slug')
              .eq('id', weddingId)
              .maybeSingle();
            chatanName = w?.chatan_name_en ?? '';
            slug = w?.slug ?? '';
          }
          const heb = sponsorDate ? hebrewFull(sponsorDate) : '';
          const weddingUrl = slug ? `${origin}/en/wedding/${slug}` : origin;
          const donorEmail = session.customer_details?.email ?? '';
          if (donorEmail) {
            await sendEmail(
              donorEmail,
              donorConfirmationEmail({
                donorName: md.donor_name || 'Friend',
                amount,
                currency,
                hebrewDate: heb,
                englishDate: sponsorDate,
                chatanName,
                weddingUrl,
              })
            );
          }
          if (process.env.ADMIN_EMAIL) {
            await sendEmail(
              process.env.ADMIN_EMAIL,
              adminDonationAlertEmail({
                chatanName,
                donorName: md.donor_name || 'Anonymous',
                amount,
                currency,
                dateSponsored: `${heb} / ${sponsorDate}`,
                adminUrl: `${origin}/en/admin/weddings`,
              })
            );
          }
          // Mark as emailed (column added in migration_v4; ignore if absent).
          await sb
            .from('donations')
            .update({ email_sent: true })
            .eq('stripe_session_id', session.id)
            .then(
              () => {},
              () => {}
            );
        } catch {
          /* email failures must never break the webhook */
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
