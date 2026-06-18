import 'server-only';
import { Resend } from 'resend';
import type { EmailDoc } from './templates';

const FROM = process.env.EMAIL_FROM || 'Our Wedding Fund <onboarding@resend.dev>';

/**
 * Send an email via Resend. No-ops safely when RESEND_API_KEY isn't set, so the
 * payment/admin flows never break. (SendGrid alt commented at the bottom.)
 */
export async function sendEmail(to: string, doc: EmailDoc): Promise<{ sent: boolean }> {
  if (!to) return { sent: false };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info('Email skipped — no RESEND_API_KEY');
    return { sent: false };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: doc.subject,
      html: doc.html,
    });
    if (error) {
      console.warn('Email send failed:', error.message);
      return { sent: false };
    }
    return { sent: true };
  } catch (e) {
    console.warn('Email send threw:', e instanceof Error ? e.message : String(e));
    return { sent: false };
  }

  // --- SendGrid alternative (swap in + set SENDGRID_API_KEY) ---
  // const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     personalizations: [{ to: [{ email: to }] }],
  //     from: { email: 'noreply@yourdomain.com' },
  //     subject: doc.subject,
  //     content: [{ type: 'text/html', value: doc.html }],
  //   }),
  // });
}

/** Fallback mailto link (plain-text body) for manual sending. */
export function mailtoLink(to: string, subject: string, body: string): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
