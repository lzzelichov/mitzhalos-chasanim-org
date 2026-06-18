import { setRequestLocale } from 'next-intl/server';
import { getSiteContent, contentRaw, settingOn } from '@/lib/siteContent';
import { waChat } from '@/lib/whatsapp';
import ContactForm from '@/components/ContactForm';

export const dynamic = 'force-dynamic';

export default async function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const c = await getSiteContent();
  const r = (k: string, f = '') => contentRaw(c, k, locale, f);
  const formOn = settingOn(c, 'enable_contact_form', true);
  const showWa = settingOn(c, 'show_whatsapp', true);

  const phone = r('contact.phone');
  const email = r('contact.email');
  const wanum = r('settings.whatsapp_number');

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-center font-display text-4xl font-bold text-burgundy">{r('contact.title', 'Contact Us')}</h1>

      <div className="card mb-6 space-y-2 text-center font-sans text-charcoal/80">
        {r('contact.address') && <p>{r('contact.address')}</p>}
        {phone && (
          <p>
            📞 <a href={`tel:${phone}`} className="text-burgundy hover:underline">{phone}</a>
          </p>
        )}
        {email && (
          <p>
            ✉️ <a href={`mailto:${email}`} className="text-burgundy hover:underline">{email}</a>
          </p>
        )}
        {showWa && wanum && (
          <p>
            💬{' '}
            <a href={waChat(wanum)} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">
              WhatsApp
            </a>
          </p>
        )}
      </div>

      {formOn && (
        <>
          <h2 className="mb-3 text-center font-display text-2xl font-bold text-burgundy">{r('contact.form_title', 'Send us a message')}</h2>
          <ContactForm
            labels={{
              name: r('contact.name_label', 'Your Name'),
              email: r('contact.email_label', 'Your Email'),
              message: r('contact.message_label', 'Message'),
              submit: r('contact.submit', 'Send'),
              success: r('contact.success', 'Thank you — we will be in touch.'),
            }}
          />
        </>
      )}
    </div>
  );
}
