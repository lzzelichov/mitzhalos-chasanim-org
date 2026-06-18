import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSupabaseAnon } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/utils';

// Basic in-memory rate limit (per server instance): 10 requests / minute / IP.
const RL = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (RL.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (arr.length >= 10) {
    RL.set(ip, arr);
    return true;
  }
  arr.push(now);
  RL.set(ip, arr);
  return false;
}

function sanitizeName(input: unknown): string {
  return (input ?? '')
    .toString()
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, 100);
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const amount = Math.floor(Number(body.amount));
  const currency = 'usd';
  const donorName = sanitizeName(body.donorName);
  const email = (body.donorEmail ?? '').toString().trim().slice(0, 200);
  const isAnonymous = Boolean(body.isAnonymous);
  const locale = body.locale === 'he' ? 'he' : 'en';
  const weddingId = body.weddingId ? String(body.weddingId) : '';
  const weddingSlug = body.weddingSlug ? String(body.weddingSlug) : '';
  const sponsorDate = body.sponsorDate ? String(body.sponsorDate) : '';
  const dedicatedDateId = body.dedicatedDateId ? String(body.dedicatedDateId) : '';

  if (!amount || amount < 1) {
    return NextResponse.json({ error: 'invalid_amount' }, { status: 400 });
  }

  const origin = getSiteUrl(new URL(req.url).origin);
  const sb = getSupabaseAnon();

  let chatan = '';
  let slugForUrl = weddingSlug;
  let dateForUrl = sponsorDate;

  if (weddingId && sb) {
    const { data } = await sb
      .from('weddings')
      .select('slug, chatan_name_en, chatan_name_he')
      .eq('id', weddingId)
      .maybeSingle();
    if (data) {
      chatan = locale === 'he' ? data.chatan_name_he || data.chatan_name_en : data.chatan_name_en;
      slugForUrl = data.slug;
    }
  } else if (dedicatedDateId && sb) {
    const { data } = await sb.from('dates').select('date').eq('id', dedicatedDateId).maybeSingle();
    dateForUrl = data?.date ?? '';
  }

  const successParams = new URLSearchParams({ name: donorName, amount: String(amount), currency });
  if (dateForUrl) successParams.set('date', dateForUrl);
  if (chatan) successParams.set('chatan', chatan);
  if (slugForUrl) successParams.set('wedding', slugForUrl);

  const cancelUrl = weddingSlug
    ? `${origin}/${locale}/wedding/${weddingSlug}`
    : `${origin}/${locale}/donate`;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: email || undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: amount * 100,
          product_data: {
            name: chatan ? `Wedding Sponsorship — Chatan ${chatan}` : 'Wedding Fund Donation',
          },
        },
      },
    ],
    success_url: `${origin}/${locale}/thank-you?${successParams.toString()}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      donor_name: donorName,
      amount: String(amount),
      currency,
      is_anonymous: isAnonymous ? '1' : '0',
      wedding_id: weddingId,
      sponsor_date: sponsorDate,
      dedicated_date_id: dedicatedDateId,
    },
  });

  return NextResponse.json({ url: session.url });
}
