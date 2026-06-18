import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getSiteContent, contentRaw, settingOn } from '@/lib/siteContent';
import { contactNotificationEmail } from '@/lib/emails/templates';
import { sendEmail } from '@/lib/emails/send';

export async function POST(req: Request) {
  const content = await getSiteContent();
  if (!settingOn(content, 'enable_contact_form', true)) {
    return NextResponse.json({ error: 'disabled' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const name = (body.name ?? '').toString().trim().slice(0, 120);
  const email = (body.email ?? '').toString().trim().slice(0, 200);
  const message = (body.message ?? '').toString().trim().slice(0, 4000);
  if (!name || !message) return NextResponse.json({ error: 'missing_fields' }, { status: 400 });

  try {
    const sb = getSupabaseAdmin();
    if (sb) await sb.from('contacts').insert({ name, email: email || null, message });

    if (process.env.RESEND_API_KEY) {
      const to = contentRaw(content, 'settings.org_email', 'en', '');
      if (to) await sendEmail(to, contactNotificationEmail({ name, email, message })).catch(() => {});
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Contact error:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'error' }, { status: 500 });
  }
}
