import 'server-only';
import { getSupabaseAnon } from './supabase/server';

export type ContentType = 'text' | 'textarea' | 'email' | 'whatsapp' | 'url' | 'phone' | 'number' | 'toggle';

export interface SiteContentRow {
  key: string;
  section: string;
  label: string;
  type: ContentType;
  value_en: string;
  value_he: string;
  is_visible: boolean;
}

// Tabs in the /admin/content editor (text content only — settings live in /admin/settings).
export const SECTIONS: { id: string; icon: string; label: string }[] = [
  { id: 'homepage', icon: '🏠', label: 'Homepage' },
  { id: 'about', icon: 'ℹ️', label: 'About' },
  { id: 'sponsor', icon: '🤝', label: 'Sponsor' },
  { id: 'news', icon: '📰', label: 'News' },
  { id: 'contact', icon: '📞', label: 'Contact' },
  { id: 'navigation', icon: '🧭', label: 'Navigation' },
  { id: 'footer', icon: '🦶', label: 'Footer' },
  { id: 'donate', icon: '💳', label: 'Donate Flow' },
  { id: 'thankyou', icon: '🎉', label: 'Thank You' },
  { id: 'errors', icon: '⚠️', label: 'Errors' },
];

const T = (
  key: string,
  section: string,
  label: string,
  value_en: string,
  value_he: string,
  type: ContentType = 'text'
): SiteContentRow => ({ key, section, label, type, value_en, value_he, is_visible: true });

const TOGGLE = (key: string, label: string, on = true): SiteContentRow => ({
  key,
  section: 'settings',
  label,
  type: 'toggle',
  value_en: on ? 'true' : 'false',
  value_he: on ? 'true' : 'false',
  is_visible: true,
});

const SETTING = (key: string, label: string, value: string, type: ContentType = 'text'): SiteContentRow => ({
  key,
  section: 'settings',
  label,
  type,
  value_en: value,
  value_he: value,
  is_visible: true,
});

/** Code defaults = source of truth + fallback when the DB is empty/unavailable. */
export const DEFAULT_CONTENT: SiteContentRow[] = [
  // ── Homepage ──
  T('home.tagline', 'homepage', 'Hero Tagline', 'Clothing a Groom is a Mitzvah', 'לבוש חתן הוא מצווה'),
  T('home.hero_sub', 'homepage', 'Hero Subtitle', 'Full wedding clothing packages for poor chassidish couples.', 'חבילות לבוש מלאות לזוגות חסידיים נזקקים.', 'textarea'),
  T('home.cta', 'homepage', 'Hero CTA Button', 'Sponsor a Couple', 'תמכו בחתן'),
  T('mobile.cta', 'homepage', 'Mobile Donate Button', 'Sponsor a Chassan', 'תמכו בחתן'),
  T('home.stat_couples', 'homepage', 'Stat label: couples', 'couples helped', 'חתנים שנעזרו'),
  T('home.stat_packages', 'homepage', 'Stat label: packages', 'packages sponsored', 'חבילות שנתרמו'),
  T('home.stat_raised', 'homepage', 'Stat label: raised', 'raised total', 'נאסף עד כה'),
  T('home.box1_title', 'homepage', 'Box 1 Title', 'What is Mitzhalos Chasanim?', 'מהו מצהלות חתנים?'),
  T('home.box1_body', 'homepage', 'Box 1 Body', 'A Jewish charity that provides complete wedding clothing — shirts, dry goods, and the clothing a young couple needs for the years ahead.', 'ארגון צדקה המספק לבוש חתונה מלא — חולצות, סדקית, וכל הלבוש הדרוש לזוג צעיר לשנים הבאות.', 'textarea'),
  T('home.box2_title', 'homepage', 'Box 2 Title', 'What does a package include?', 'מה כוללת החבילה?'),
  T('home.box2_body', 'homepage', 'Box 2 Body', 'The full standard Jewish wedding shopping — not just for the wedding night, but the complete preparation for married life.', 'כל קניות החתונה הסטנדרטיות — לא רק לליל החתונה, אלא הכנה מלאה לחיי הנישואין.', 'textarea'),
  T('home.box3_title', 'homepage', 'Box 3 Title', 'How to sponsor?', 'איך תורמים?'),
  T('home.box3_body', 'homepage', 'Box 3 Body', 'Pick a meaningful date, see the couples marrying that day, and sponsor a full package or any amount.', 'בחרו תאריך משמעותי, ראו את החתנים המתחתנים באותו יום, ותרמו חבילה מלאה או כל סכום.', 'textarea'),
  T('home.news_title', 'homepage', 'Latest News Heading', 'Latest News', 'חדשות אחרונות'),
  T('home.live_counter', 'homepage', 'Live Counter (use {n} for the number)', 'This week: {n} chassanim need clothing support', 'השבוע: {n} חתנים זקוקים לתמיכה בלבוש'),

  // ── About ──
  T('about.title', 'about', 'Page Title', 'About Us', 'אודותינו'),
  T('about.mission_title', 'about', 'Mission Heading', 'Our Mission', 'המשימה שלנו'),
  T('about.mission_body', 'about', 'Mission Body', 'Mitzhalos Chasanim ensures no chassidish couple begins married life without dignified clothing.', 'מצהלות חתנים דואג שאף זוג חסידי לא יתחיל את חיי הנישואין ללא לבוש מכובד.', 'textarea'),
  T('about.how_title', 'about', 'How It Works Heading', 'How It Works', 'איך זה עובד'),
  T('about.how_body', 'about', 'How It Works Body', 'Donors choose a date meaningful to them and sponsor the real couples marrying that day.', 'התורמים בוחרים תאריך משמעותי ותומכים בחתנים האמיתיים המתחתנים באותו יום.', 'textarea'),
  T('about.who_title', 'about', 'Who We Help Heading', 'Who We Help', 'את מי אנו עוזרים'),
  T('about.who_body', 'about', 'Who We Help Body', 'Poor chassidish chassanim from communities across the spectrum.', 'חתנים חסידיים נזקקים מכל הקהילות.', 'textarea'),
  T('about.ops_title', 'about', 'Operations Heading', 'Our Operations', 'הפעילות שלנו'),
  T('about.ops_body', 'about', 'Operations Body', 'Every dollar is directed to clothing, purchased with care and tzniut.', 'כל דולר מופנה ללבוש, הנרכש בקפידה ובצניעות.', 'textarea'),
  T('about.gallery_title', 'about', 'Gallery Heading', 'Gallery', 'גלריה'),
  T('about.cta_title', 'about', 'CTA Heading', 'Join Us', 'הצטרפו אלינו'),
  T('about.cta_body', 'about', 'CTA Body', 'Be a partner in clothing a chatan.', 'היו שותפים בהלבשת חתן.', 'textarea'),
  T('about.cta_button', 'about', 'CTA Button', 'Sponsor Now', 'תרמו עכשיו'),

  // ── Sponsor ──
  T('sponsor.title', 'sponsor', 'Page Title', 'Sponsor a Couple', 'תמכו בחתן'),
  T('sponsor.subtitle', 'sponsor', 'Page Subtitle', 'Pick a date meaningful to you and sponsor a couple marrying that day.', 'בחרו תאריך משמעותי ותמכו בחתן המתחתן באותו יום.', 'textarea'),
  T('sponsor.pick_date', 'sponsor', 'Step 1 Label', 'Pick a date', 'בחרו תאריך'),
  T('sponsor.results_title', 'sponsor', 'Results Heading', 'Couples on this date', 'חתנים בתאריך זה'),
  T('sponsor.empty', 'sponsor', 'No Couples Message', 'No couples registered for this date yet. You can still make a general donation:', 'אין חתנים רשומים לתאריך זה עדיין. ניתן עדיין לתרום תרומה כללית:', 'textarea'),
  T('sponsor.general_btn', 'sponsor', 'General Donation Button', 'Make a General Donation', 'תרומה כללית'),
  T('sponsor.full_btn', 'sponsor', 'Full Package Button', 'Sponsor Full Package', 'חבילה מלאה'),
  T('sponsor.any_btn', 'sponsor', 'Any Amount Button', 'Donate Any Amount', 'כל סכום'),
  T('sponsor.yeshiva_label', 'sponsor', 'Field: Yeshiva', 'Learned at', 'למד ב'),
  T('sponsor.chassidus_label', 'sponsor', 'Field: Chassidus', 'Chassidus', 'חסידות'),
  T('sponsor.father_label', 'sponsor', 'Field: Father', 'Father', 'האב'),
  T('sponsor.mother_label', 'sponsor', 'Field: Mother', 'Mother', 'האם'),
  T('sponsor.chatan_prefix', 'sponsor', 'Chatan prefix', 'Chatan', 'חתן'),
  T('sponsor.calendar_subtitle', 'sponsor', 'Calendar Subtitle', 'See which chassanim need your help that day', 'ראו אילו חתנים זקוקים לעזרתכם באותו יום'),
  T('sponsor.legend_gold', 'sponsor', 'Legend: Gold', 'Couples need help', 'חתנים זקוקים לעזרה'),
  T('sponsor.legend_burgundy', 'sponsor', 'Legend: Burgundy', 'Fully sponsored', 'מומן במלואו'),
  T('sponsor.legend_gray', 'sponsor', 'Legend: Gray', 'No couples', 'אין חתנים'),

  // ── News ──
  T('news.title', 'news', 'Page Title', 'News', 'חדשות'),
  T('news.empty', 'news', 'Empty State', 'No news posts yet.', 'אין עדיין כתבות.'),
  T('news.read_more', 'news', 'Read More Link', 'Read More', 'קראו עוד'),

  // ── Contact ──
  T('contact.title', 'contact', 'Page Title', 'Contact Us', 'צרו קשר'),
  T('contact.address', 'contact', 'Address', 'Jerusalem, Israel', 'ירושלים, ישראל'),
  T('contact.phone', 'contact', 'Phone', '+1 718 000 0000', '+1 718 000 0000', 'phone'),
  T('contact.email', 'contact', 'Email', 'info@mitzhaloschasanim.org', 'info@mitzhaloschasanim.org', 'email'),
  T('contact.form_title', 'contact', 'Form Heading', 'Send us a message', 'שלחו לנו הודעה'),
  T('contact.name_label', 'contact', 'Form: Name', 'Your Name', 'שמכם'),
  T('contact.email_label', 'contact', 'Form: Email', 'Your Email', 'אימייל'),
  T('contact.message_label', 'contact', 'Form: Message', 'Message', 'הודעה'),
  T('contact.submit', 'contact', 'Form: Submit', 'Send', 'שליחה'),
  T('contact.success', 'contact', 'Form: Success', 'Thank you — we will be in touch.', 'תודה — ניצור קשר בהקדם.'),

  // ── Navigation ──
  T('brand.name', 'navigation', 'Site Name / Brand', 'Mitzhalos Chasanim', 'מצהלות חתנים'),
  T('nav.home', 'navigation', 'Nav: Home', 'Home', 'בית'),
  T('nav.about', 'navigation', 'Nav: About', 'About', 'אודות'),
  T('nav.sponsor', 'navigation', 'Nav: Sponsor', 'Sponsor', 'תרומה'),
  T('nav.news', 'navigation', 'Nav: News', 'News', 'חדשות'),
  T('nav.contact', 'navigation', 'Nav: Contact', 'Contact', 'צרו קשר'),

  // ── Footer ──
  T('footer.tagline', 'footer', 'Footer Tagline', 'Clothing a Groom is a Mitzvah', 'לבוש חתן הוא מצווה'),
  T('footer.rights', 'footer', 'Rights Notice', 'All rights reserved', 'כל הזכויות שמורות'),

  // ── Donate flow ──
  T('donate.donor_name', 'donate', 'Donor Name Label', 'Your Name', 'שמכם'),
  T('donate.anonymous', 'donate', 'Anonymous Label', 'Donate anonymously', 'תרומה אנונימית'),
  T('donate.amount', 'donate', 'Amount Label', 'Amount', 'סכום'),
  T('donate.custom', 'donate', 'Custom Amount', 'Custom', 'אחר'),
  T('donate.proceed', 'donate', 'Proceed Button', 'Proceed to Payment', 'המשך לתשלום'),
  T('donate.min_note', 'donate', 'Minimum Note', 'Minimum $18', 'מינימום 18$'),
  T('donate.email_opt', 'donate', 'Email (optional)', 'Email (optional, for a receipt)', 'אימייל (רשות, לקבלה)'),

  // ── Thank you ──
  T('thankyou.title', 'thankyou', 'Title', 'תזכו למצוות! / May you be blessed!', 'תזכו למצוות!'),
  T('thankyou.subtitle', 'thankyou', 'Subtitle', 'Your gift helps clothe a chatan with dignity.', 'תרומתכם מלבישה חתן בכבוד.', 'textarea'),
  T('thankyou.share', 'thankyou', 'Share Button', 'Share', 'שיתוף'),
  T('thankyou.back', 'thankyou', 'Back Button', 'Back to Home', 'חזרה לדף הבית'),

  // ── Errors ──
  T('errors.load', 'errors', 'Load Error', 'Something went wrong loading this page.', 'אירעה שגיאה בטעינת הדף.'),
  T('errors.payment', 'errors', 'Payment Failed', 'Payment failed, please try again.', 'התשלום נכשל, אנא נסו שנית.'),
  T('errors.not_found', 'errors', 'Not Found', 'Page not found.', 'הדף לא נמצא.'),

  // ── Settings: global toggles (/admin/settings) ──
  TOGGLE('show_donor_names', 'Show donor names publicly'),
  TOGGLE('show_amounts', 'Show fundraising amounts publicly'),
  TOGGLE('show_progress', 'Show progress bars'),
  TOGGLE('show_whatsapp', 'Show WhatsApp share buttons'),
  TOGGLE('enable_contact_form', 'Enable contact form'),
  TOGGLE('enable_donations', 'Enable donations (master kill switch)'),
  TOGGLE('show_live_counter', 'Show live "this week" counter on homepage', false),
  // Hidden sponsorship options (off by default).
  TOGGLE('opt_specific_item', 'Hidden option: sponsor a specific item', false),
  TOGGLE('opt_recurring', 'Hidden option: recurring monthly donation', false),
  TOGGLE('opt_memory', 'Hidden option: dedicate לעילוי נשמת', false),
  TOGGLE('opt_on_behalf', 'Hidden option: sponsor on behalf of someone', false),
  TOGGLE('opt_corporate', 'Hidden option: corporate / group sponsorship', false),

  // ── Settings: config values (/admin/settings) ──
  SETTING('settings.default_price', 'Default package price (USD)', '750', 'number'),
  SETTING('settings.org_email', 'Organization email', 'info@mitzhaloschasanim.org', 'email'),
  SETTING('settings.whatsapp_number', 'WhatsApp number (digits)', '17180000000', 'phone'),
];

const DEFAULT_MAP: Record<string, SiteContentRow> = Object.fromEntries(
  DEFAULT_CONTENT.map((r) => [r.key, r])
);

/**
 * Flat {key: {en, he}} view of every default — the single source of truth that
 * makes the site render correctly even when the site_content table is empty.
 */
export const CONTENT_DEFAULTS: Record<string, { en: string; he: string }> = Object.fromEntries(
  DEFAULT_CONTENT.map((r) => [r.key, { en: r.value_en, he: r.value_he }])
);

export type ContentMap = Record<string, SiteContentRow>;

/** Merged content: DB rows override code defaults; falls back to defaults on error. */
export async function getSiteContent(): Promise<ContentMap> {
  const map: ContentMap = { ...DEFAULT_MAP };
  const sb = getSupabaseAnon();
  if (!sb) return map;
  const { data } = await sb
    .from('site_content')
    .select('key, value_en, value_he, is_visible, section, label, type');
  for (const r of data ?? []) {
    map[r.key] = { ...(map[r.key] ?? ({} as SiteContentRow)), ...(r as Partial<SiteContentRow>) } as SiteContentRow;
  }
  return map;
}

const pickLocale = (row: SiteContentRow | undefined, locale: string): string =>
  (locale === 'he' ? row?.value_he : row?.value_en) || '';

/**
 * Localized string; returns '' when the row is hidden. Empty DB values fall
 * back to the locale's hardcoded DEFAULT (never to the other language), so the
 * page stays single-language even if a cell is blank.
 */
export function contentText(map: ContentMap, key: string, locale: string, fallback = ''): string {
  const r = map[key];
  if (r && r.is_visible === false) return '';
  return pickLocale(r, locale) || pickLocale(DEFAULT_MAP[key], locale) || fallback;
}

/** Localized string ignoring the visibility flag (for nav/labels that always render). */
export function contentRaw(map: ContentMap, key: string, locale: string, fallback = ''): string {
  return pickLocale(map[key], locale) || pickLocale(DEFAULT_MAP[key], locale) || fallback;
}

/** Boolean setting (type 'toggle'); value_en holds 'true' | 'false'. */
export function settingOn(map: ContentMap, key: string, def = true): boolean {
  const r = map[key];
  if (!r) return def;
  return (r.value_en ?? 'true') !== 'false';
}

/** Just the boolean settings, for the client context. */
export function extractSettings(map: ContentMap): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const r of Object.values(map)) {
    if (r.type === 'toggle') out[r.key] = (r.value_en ?? 'true') !== 'false';
  }
  return out;
}
