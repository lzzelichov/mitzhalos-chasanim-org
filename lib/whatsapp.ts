// WhatsApp share templates. {placeholders} are filled by waFill().
export const WHATSAPP_TEMPLATES = {
  DONOR_THANK_YOU:
    'זכיתי לתמוך במצהלות חתנים!\nתמכתי בחתן {name} ביום {hebrew_date}.\nלכבד גם אתם: {url} 🙏',
  DONOR_THANK_YOU_EN:
    "I just supported Mitzhalos Chasanim!\nI sponsored Chatan {name}'s wedding clothing.\nJoin me: {url} 🙏",
  SHARE_GENERAL: 'מצהלות חתנים — לבוש חתן הוא מצווה.\nהצטרפו אלינו: {url} 🙏',
  SHARE_GENERAL_EN: 'Mitzhalos Chasanim — Clothing a Groom is a Mitzvah.\nJoin us: {url} 🙏',
} as const;

export type WhatsAppTemplateKey = keyof typeof WHATSAPP_TEMPLATES;

/** Replace {key} tokens with values. */
export function waFill(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

/** wa.me share URL for a pre-filled message. */
export function waUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/** Click-to-chat URL for a specific number (digits only). */
export function waChat(number: string, text = ''): string {
  const digits = (number || '').replace(/[^\d]/g, '');
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${digits}${q}`;
}
