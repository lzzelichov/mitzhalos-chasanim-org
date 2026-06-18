// WhatsApp message templates + helpers.
// Defaults live here; admin can override them via the site_content / whatsapp_templates
// table (see lib/siteContent.ts). Variables: {chatan_name} {hebrew_date}
// {english_date} {wedding_url} {percent} {remaining} {days_left}

export type WaBaseKey =
  | 'DONOR_THANK_YOU'
  | 'SHARE_WEDDING'
  | 'MILESTONE_REACHED'
  | 'WEDDING_REMINDER'
  | 'FULLY_FUNDED';

export type WaTemplateKey = WaBaseKey | 'DONOR_THANK_YOU_EN' | 'SHARE_WEDDING_EN';

export interface WaVars {
  chatan_name?: string;
  hebrew_date?: string;
  english_date?: string;
  wedding_url?: string;
  percent?: string | number;
  remaining?: string;
  days_left?: string | number;
}

export const WHATSAPP_TEMPLATES: Record<WaTemplateKey, string> = {
  DONOR_THANK_YOU:
    'תזכו למצוות! 🙏 תמכתם בחתן {chatan_name} ביום {hebrew_date} / {english_date}.\n' +
    'יהי רצון שיבנו בית נאמן בישראל ושתזכו לשמחות רבות 🕍✨\n' +
    'לצפייה בדף החתונה: {wedding_url}',
  SHARE_WEDDING:
    '🎊 חתונה קרובה! החתן {chatan_name} מתחתן בע״ה ביום {hebrew_date}.\n' +
    'עזרו לבנות בית בישראל — כבדו תאריך בדף הגיוס:\n' +
    '{wedding_url}\n' +
    'יהי רצון שיבנו בית נאמן בישראל 🕍',
  MILESTONE_REACHED:
    '🎉 בשורות טובות! גיוס החתן {chatan_name} הגיע ל-{percent}%!\n' +
    'עוד {remaining} ומגיעים ליעד!\n' +
    'הצטרפו גם אתם: {wedding_url}',
  WEDDING_REMINDER:
    '⏰ תזכורת! חתונת החתן {chatan_name} בע״ה בעוד {days_left} ימים.\n' +
    'עדיין ניתן לכבד תאריך: {wedding_url}\n' +
    'יהי רצון שיבנו בית נאמן בישראל 🕍',
  FULLY_FUNDED:
    '🏆 ברוך ה׳! הגיוס לחתן {chatan_name} הושלם במלואו!\n' +
    'תודה לכל התורמים הנדיבים 🙏\n' +
    '{wedding_url}',
  DONOR_THANK_YOU_EN:
    "May you be blessed! 🙏 You sponsored {chatan_name}'s wedding on {hebrew_date} / {english_date}.\n" +
    'May they build a faithful home in Israel 🕍✨\n' +
    'View the wedding page: {wedding_url}',
  SHARE_WEDDING_EN:
    '🎊 Upcoming Wedding! Chatan {chatan_name} is getting married on {english_date} ({hebrew_date}).\n' +
    'Help build a home in Israel — sponsor a date:\n' +
    '{wedding_url}\n' +
    'May they build a faithful home in Israel 🕍',
};

/** Replace {placeholders} with values (blank for missing). */
export function renderTemplate(tpl: string, vars: WaVars): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k: string) => {
    const v = (vars as Record<string, unknown>)[k];
    return v === undefined || v === null ? '' : String(v);
  });
}

/** Choose the English variant for `en` when one exists, else the Hebrew base. */
export function pickTemplate(
  base: WaBaseKey,
  locale: string,
  overrides?: Partial<Record<string, string>>
): string {
  const enKey = `${base}_EN` as WaTemplateKey;
  const key: WaTemplateKey =
    locale === 'en' && (enKey in WHATSAPP_TEMPLATES) ? enKey : base;
  return overrides?.[key] ?? WHATSAPP_TEMPLATES[key];
}

/** Build a rendered message from a base template key. */
export function waMessage(
  base: WaBaseKey,
  vars: WaVars,
  locale: string,
  overrides?: Partial<Record<string, string>>
): string {
  return renderTemplate(pickTemplate(base, locale, overrides), vars);
}

/** wa.me link — opens the app on mobile and web.whatsapp.com on desktop automatically. */
export function waUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
