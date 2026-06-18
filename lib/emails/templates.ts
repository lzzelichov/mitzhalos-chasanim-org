import { formatCurrency, type Currency } from '@/lib/currency';

// Plain-HTML email templates (no email library required). Inline styles only,
// so they render in email clients. Colors: ivory bg, burgundy headings, gold accents.

export interface EmailDoc {
  subject: string;
  html: string;
  text: string;
}

const C = {
  ivory: '#fdf8f0',
  burgundy: '#7a1f3d',
  gold: '#c9a84c',
  charcoal: '#2d2013',
  cream: '#f5e6d3',
};

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:${C.ivory};font-family:Georgia,'Times New Roman',serif;color:${C.charcoal}">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:${C.burgundy};border-radius:14px 14px 0 0;padding:22px;text-align:center">
      <div style="color:${C.gold};font-size:24px;font-weight:bold;letter-spacing:1px">💍 Our Wedding Fund</div>
    </div>
    <div style="background:#ffffff;border:1px solid ${C.gold}33;border-top:0;border-radius:0 0 14px 14px;padding:28px">
      ${bodyHtml}
    </div>
    <p style="text-align:center;color:${C.burgundy};font-size:13px;margin-top:18px">
      <strong style="font-size:16px">בנין עדי עד</strong><br/>May you build an eternal home
    </p>
  </div>
</body></html>`;
}

function button(href: string, label: string): string {
  return `<div style="text-align:center;margin:26px 0">
    <a href="${href}" style="display:inline-block;background:${C.burgundy};color:${C.gold};text-decoration:none;border:1px solid ${C.gold};border-radius:999px;padding:12px 26px;font-weight:bold">${label}</a>
  </div>`;
}

/** EMAIL 1 — donor confirmation (after successful payment). */
export function donorConfirmationEmail(o: {
  donorName: string;
  amount: number;
  currency: Currency;
  hebrewDate: string;
  englishDate: string;
  chatanName: string;
  weddingUrl: string;
}): EmailDoc {
  const amount = formatCurrency(o.amount);
  const html = shell(
    "You've Been Blessed!",
    `<h1 style="text-align:center;color:${C.burgundy};font-size:34px;margin:0">תזכו למצוות!</h1>
     <p style="text-align:center;color:${C.charcoal};font-size:18px;margin:6px 0 20px">Thank you for your generosity</p>
     <table style="width:100%;border-collapse:collapse;background:${C.cream};border-radius:10px;overflow:hidden">
       <tr><td style="padding:10px 14px;color:${C.burgundy};font-weight:bold">Donor</td><td style="padding:10px 14px">${o.donorName}</td></tr>
       <tr><td style="padding:10px 14px;color:${C.burgundy};font-weight:bold">Amount</td><td style="padding:10px 14px">${amount}</td></tr>
       <tr><td style="padding:10px 14px;color:${C.burgundy};font-weight:bold">Wedding</td><td style="padding:10px 14px">Chatan ${o.chatanName}</td></tr>
       <tr><td style="padding:10px 14px;color:${C.burgundy};font-weight:bold">Date sponsored</td><td style="padding:10px 14px">${o.hebrewDate} · ${o.englishDate}</td></tr>
     </table>
     <p style="text-align:center;margin:20px 0 4px">Your name will appear on the wedding date tile forever</p>
     <p style="text-align:center;color:${C.burgundy};font-weight:bold;margin:0">שמכם יופיע על תאריך החתונה לעולם ועד</p>
     ${button(o.weddingUrl, 'View Your Sponsored Date →')}`
  );
  const text = `תזכו למצוות! / Thank you, ${o.donorName}.\nAmount: ${amount}\nWedding: Chatan ${o.chatanName}\nDate: ${o.hebrewDate} / ${o.englishDate}\nView: ${o.weddingUrl}`;
  return { subject: "תזכו למצוות! / You've Been Blessed! 🙏", html, text };
}

/** EMAIL 2 — admin new-donation alert. */
export function adminDonationAlertEmail(o: {
  chatanName: string;
  donorName: string;
  amount: number;
  currency: Currency;
  dateSponsored: string;
  adminUrl: string;
}): EmailDoc {
  const amount = formatCurrency(o.amount);
  const html = shell(
    'New donation',
    `<h2 style="color:${C.burgundy};margin-top:0">New donation for Chatan ${o.chatanName}</h2>
     <p><strong>Donor:</strong> ${o.donorName}<br/>
     <strong>Amount:</strong> ${amount} (${o.currency.toUpperCase()})<br/>
     <strong>Date sponsored:</strong> ${o.dateSponsored}</p>
     ${button(o.adminUrl, 'Open admin panel')}`
  );
  const text = `New donation for Chatan ${o.chatanName}\nDonor: ${o.donorName}\nAmount: ${amount}\nDate: ${o.dateSponsored}\nAdmin: ${o.adminUrl}`;
  return { subject: `תרומה חדשה! New donation for ${o.chatanName}`, html, text };
}

/** EMAIL 3 — wedding-created confirmation (to admin). */
export function weddingCreatedEmail(o: {
  chatanName: string;
  details: Record<string, string>;
  missingFields: string[];
  editUrl: string;
  previewUrl: string;
}): EmailDoc {
  const rows = Object.entries(o.details)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:${C.burgundy};font-weight:bold">${k}</td><td style="padding:6px 12px">${v || '—'}</td></tr>`
    )
    .join('');
  const missing =
    o.missingFields.length === 0
      ? `<p style="color:#1a7a43">✓ All key fields completed.</p>`
      : `<p style="color:#b45309"><strong>Missing fields:</strong></p><ul>${o.missingFields
          .map((f) => `<li>${f}</li>`)
          .join('')}</ul>`;
  const html = shell(
    'New wedding created',
    `<h2 style="color:${C.burgundy};margin-top:0">New wedding created: Chatan ${o.chatanName}</h2>
     <table style="width:100%;border-collapse:collapse;background:${C.cream};border-radius:10px;overflow:hidden">${rows}</table>
     ${missing}
     ${button(o.editUrl, 'Edit wedding')}
     <div style="text-align:center"><a href="${o.previewUrl}" style="color:${C.burgundy}">Preview public page →</a></div>`
  );
  const text = `New wedding: Chatan ${o.chatanName}\nMissing: ${o.missingFields.join(', ') || 'none'}\nEdit: ${o.editUrl}\nPreview: ${o.previewUrl}`;
  return { subject: `חתונה חדשה נוצרה / New wedding created: ${o.chatanName}`, html, text };
}
