import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getCoupleById } from '@/lib/data';
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
    .replace(/<[^>]*>/g, '')
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, 100);
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const amount = Math.floor(Number(body.amount));
  const type = body.type === 'full_package' ? 'full_package' : 'partial';
  const donorName = sanitizeName(body.donorName);
  const email = (body.email ?? body.donorEmail ?? '').toString().trim().slice(0, 200);
  const isAnonymous = Boolean(body.isAnonymous);
  const locale = body.locale === 'he' ? 'he' : 'en';
  const coupleId = body.coupleId ? String(body.coupleId) : '';

  if (!amount || amount < 18) return NextResponse.json({ error: 'invalid_amount' }, { status: 400 });

  let chatan = '';
  if (coupleId) {
    const c = await getCoupleById(coupleId);
    if (c) chatan = locale === 'he' ? c.chatan_name_he || c.chatan_name_en : c.chatan_name_en;
  }

  const origin = getSiteUrl(new URL(req.url).origin);
  const params = new URLSearchParams({ name: donorName, amount: String(amount) });
  if (chatan) params.set('chatan', chatan);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: email || undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: amount * 100,
          product_data: {
            name: chatan ? `Wedding Clothing — Chatan ${chatan}` : 'Mitzhalos Chasanim Donation',
          },
        },
      },
    ],
    success_url: `${origin}/${locale}/thank-you?${params.toString()}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/${locale}/sponsor`,
    metadata: {
      couple_id: coupleId,
      donor_name: donorName,
      amount: String(amount),
      type,
      is_anonymous: isAnonymous ? '1' : '0',
      chatan,
      email,
    },
  });

  return NextResponse.json({ url: session.url });
}
