import { formatCurrency } from '../currency';

export interface EmailDoc {
  subject: string;
  html: string;
  text?: string;
}

const C = {
  burgundy: '#7a1f3d',
  gold: '#c9a84c',
  cream: '#f5e6d3',
  charcoal: '#2d2013',
};

function shell(heading: string, body: string): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#fdf8f0;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid ${C.gold};border-radius:14px;overflow:hidden">
      <div style="background:${C.burgundy};padding:20px;text-align:center">
        <div style="color:${C.gold};font-size:22px;font-weight:bold">מצהלות חתנים · Mitzhalos Chasanim</div>
      </div>
      <div style="padding:24px;color:${C.charcoal}">
        <h1 style="color:${C.burgundy};font-size:24px;margin:0 0 14px">${heading}</h1>
        ${body}
      </div>
    </div>
  </div>`;
}

/** Sent to a donor after a successful sponsorship. */
export function donorConfirmationEmail(o: {
  donorName: string;
  amount: number;
  coupleName: string;
  hebrewDate: string;
  siteUrl: string;
}): EmailDoc {
  const amount = formatCurrency(o.amount);
  const html = shell(
    'תזכו למצוות! / You’ve Been Blessed!',
    `<p>Thank you, <strong>${o.donorName}</strong>, for clothing a chatan.</p>
     <table style="width:100%;border-collapse:collapse;background:${C.cream};border-radius:10px;overflow:hidden;margin:12px 0">
       <tr><td style="padding:10px 14px;font-weight:bold;color:${C.burgundy}">Amount</td><td style="padding:10px 14px">${amount}</td></tr>
       <tr><td style="padding:10px 14px;font-weight:bold;color:${C.burgundy}">Chatan</td><td style="padding:10px 14px">${o.coupleName}</td></tr>
       <tr><td style="padding:10px 14px;font-weight:bold;color:${C.burgundy}">Wedding</td><td style="padding:10px 14px">${o.hebrewDate}</td></tr>
     </table>
     <p style="text-align:center;color:${C.burgundy};font-weight:bold">לבוש חתן הוא מצווה — Clothing a Groom is a Mitzvah</p>
     <p style="text-align:center"><a href="${o.siteUrl}" style="color:${C.gold}">${o.siteUrl}</a></p>`
  );
  const text = `Thank you, ${o.donorName}!\nAmount: ${amount}\nChatan: ${o.coupleName}\nWedding: ${o.hebrewDate}\n${o.siteUrl}`;
  return { subject: 'תזכו למצוות! / You’ve Been Blessed! 🙏', html, text };
}

/** Sent to the org admin when the contact form is submitted. */
export function contactNotificationEmail(o: {
  name: string;
  email: string;
  message: string;
}): EmailDoc {
  const html = shell(
    'New contact message',
    `<p><strong>From:</strong> ${o.name}${o.email ? ` (${o.email})` : ''}</p>
     <p style="white-space:pre-wrap;background:${C.cream};padding:14px;border-radius:10px">${o.message}</p>`
  );
  const text = `From: ${o.name} ${o.email}\n\n${o.message}`;
  return { subject: `New contact message from ${o.name}`, html, text };
}
