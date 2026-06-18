import 'server-only';
import { getSupabaseAnon } from './supabase/server';
import { WHATSAPP_TEMPLATES } from './whatsapp';

export type ContentType = 'text' | 'textarea' | 'richtext' | 'email' | 'whatsapp' | 'url' | 'toggle';

export interface SiteContentRow {
  key: string;
  section: string;
  label: string;
  type: ContentType;
  value_en: string;
  value_he: string;
  is_visible: boolean;
}

// Sidebar sections for the /admin/content editor.
export const SECTIONS: { id: string; icon: string; label: string }[] = [
  { id: 'homepage', icon: '🏠', label: 'Homepage' },
  { id: 'wedding', icon: '💒', label: 'Wedding Pages' },
  { id: 'date_grid', icon: '📅', label: 'Date Grid' },
  { id: 'donate', icon: '💳', label: 'Donate Page' },
  { id: 'thankyou', icon: '🎉', label: 'Thank You Page' },
  { id: 'search', icon: '🔍', label: 'Search Page' },
  { id: 'whatsapp', icon: '📱', label: 'WhatsApp Templates' },
  { id: 'email', icon: '📧', label: 'Email Templates' },
  { id: 'navigation', icon: '🧭', label: 'Navigation' },
  { id: 'footer', icon: '🦶', label: 'Footer' },
  { id: 'errors', icon: '⚠️', label: 'Error Messages' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
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

/** Code defaults = single source of truth + fallback when DB is empty/unavailable. */
export const DEFAULT_CONTENT: SiteContentRow[] = [
  // Homepage
  T('home.tagline', 'homepage', 'Hero Tagline', 'Help Build a Home in Israel', 'עזרו לבנות בית בישראל'),
  T('home.subtitle', 'homepage', 'Hero Subtitle', 'Every date you sponsor brings the chatan closer to the chuppah', 'כל תאריך שתתמכו בו מקרב את החתן לחופה', 'textarea'),
  T('home.featured_title', 'homepage', 'Featured Section Title', 'Weddings', 'חתונות'),
  // Wedding pages
  T('wedding.sponsor_cta', 'wedding', 'Sponsor CTA', 'Sponsor a Date', 'תרמו לתאריך'),
  T('wedding.story_title', 'wedding', 'Story Heading', 'Their Story', 'הסיפור שלהם'),
  T('wedding.meet_couple', 'wedding', 'Meet the Couple Heading', 'Meet the Couple', 'הכירו את הזוג'),
  // Date grid
  T('date_grid.title', 'date_grid', 'Grid Title', 'Choose a Date to Sponsor', 'בחרו תאריך לתמיכה'),
  T('date_grid.subtitle', 'date_grid', 'Grid Subtitle', 'Every date you sponsor is shown to the couple forever', 'כל תאריך שתתמכו בו יוצג לזוג לנצח', 'textarea'),
  // Donate
  T('donate.title', 'donate', 'Page Title', 'Support the Couple', 'תמכו בזוג'),
  T('donate.subtitle', 'donate', 'Page Subtitle', 'Choose an amount and, if you like, dedicate it to a special date.', 'בחרו סכום, ואם תרצו, הקדישו אותו לתאריך מיוחד.', 'textarea'),
  // Thank you
  T('thankyou.title', 'thankyou', 'Title', 'May you be blessed with mitzvot!', 'תזכו למצוות!'),
  T('thankyou.subtitle', 'thankyou', 'Subtitle', 'Your donation helps build a faithful home in Israel', 'תרומתכם תסייע לבנות בית נאמן בישראל', 'textarea'),
  // Search
  T('search.title', 'search', 'Page Title', 'Find a Date', 'מצאו תאריך'),
  T('search.placeholder', 'search', 'Search Placeholder', 'Search by name, date, or city...', 'חפשו לפי שם, תאריך או עיר...'),
  // WhatsApp templates (value_he = Hebrew template, value_en = English/base)
  T('whatsapp.DONOR_THANK_YOU', 'whatsapp', 'Donor Thank You', WHATSAPP_TEMPLATES.DONOR_THANK_YOU_EN, WHATSAPP_TEMPLATES.DONOR_THANK_YOU, 'whatsapp'),
  T('whatsapp.SHARE_WEDDING', 'whatsapp', 'Share Wedding', WHATSAPP_TEMPLATES.SHARE_WEDDING_EN, WHATSAPP_TEMPLATES.SHARE_WEDDING, 'whatsapp'),
  T('whatsapp.MILESTONE_REACHED', 'whatsapp', 'Milestone Reached', WHATSAPP_TEMPLATES.MILESTONE_REACHED, WHATSAPP_TEMPLATES.MILESTONE_REACHED, 'whatsapp'),
  T('whatsapp.WEDDING_REMINDER', 'whatsapp', 'Wedding Reminder', WHATSAPP_TEMPLATES.WEDDING_REMINDER, WHATSAPP_TEMPLATES.WEDDING_REMINDER, 'whatsapp'),
  T('whatsapp.FULLY_FUNDED', 'whatsapp', 'Fully Funded', WHATSAPP_TEMPLATES.FULLY_FUNDED, WHATSAPP_TEMPLATES.FULLY_FUNDED, 'whatsapp'),
  // Email (editable subjects/headings)
  T('email.donor_subject', 'email', 'Donor Email Subject', "You've Been Blessed! 🙏", 'תזכו למצוות! 🙏', 'email'),
  T('email.donor_heading', 'email', 'Donor Email Heading', 'Thank you for your generosity', 'תזכו למצוות!', 'email'),
  // Navigation
  T('nav.home', 'navigation', 'Nav: Home', 'Home', 'בית'),
  T('nav.weddings', 'navigation', 'Nav: Weddings', 'Weddings', 'חתונות'),
  T('nav.search', 'navigation', 'Nav: Search', 'Search', 'חיפוש'),
  T('nav.donate', 'navigation', 'Nav: Donate', 'Donate', 'תרומה'),
  // Footer
  T('footer.tagline', 'footer', 'Footer Tagline (Hebrew)', 'בנין עדי עד', 'בנין עדי עד'),
  T('footer.tagline_en', 'footer', 'Footer Tagline (English)', 'May you build an eternal home', 'May you build an eternal home'),
  T('footer.rights', 'footer', 'Rights Notice', 'All rights reserved', 'כל הזכויות שמורות'),
  // Errors
  T('errors.not_found', 'errors', 'Not Found', 'Page not found', 'הדף לא נמצא'),
  T('errors.load_error', 'errors', 'Load Error', 'Error loading data', 'שגיאה בטעינת הנתונים'),
  T('errors.payment_failed', 'errors', 'Payment Failed', 'Payment failed, please try again', 'התשלום נכשל, אנא נסו שנית'),
  // Settings (global visibility / master switches)
  TOGGLE('show_search', 'Show search page'),
  TOGGLE('show_donor_names', 'Show donor names publicly'),
  TOGGLE('show_total_raised', 'Show total amount raised'),
  TOGGLE('show_goal', 'Show goal amount'),
  TOGGLE('show_hebrew_calendar', 'Show Hebrew calendar'),
  TOGGLE('show_english_calendar', 'Show English calendar'),
  TOGGLE('show_shabbat', 'Show Shabbat highlights'),
  TOGGLE('show_yom_tov', 'Show Yom Tov highlights'),
  TOGGLE('show_whatsapp', 'Show WhatsApp buttons'),
  TOGGLE('show_footer_admin', 'Show footer admin link'),
  TOGGLE('show_language_toggle', 'Show language toggle (EN/HE)'),
  TOGGLE('enable_donations', 'Enable donations (master switch)'),
  TOGGLE('show_fully_funded_badge', 'Show "fully funded" badge'),
];

const DEFAULT_MAP: Record<string, SiteContentRow> = Object.fromEntries(
  DEFAULT_CONTENT.map((r) => [r.key, r])
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

/** Boolean setting (type 'toggle'); value_en holds 'true' | 'false'. */
export function settingOn(map: ContentMap, key: string, def = true): boolean {
  const r = map[key];
  if (!r) return def;
  return (r.value_en ?? 'true') !== 'false';
}

/** Localized string with fallback; returns '' when the row is hidden. */
export function contentText(map: ContentMap, key: string, locale: string, fallback: string): string {
  const r = map[key];
  if (!r) return fallback;
  if (r.is_visible === false) return '';
  return (locale === 'he' ? r.value_he : r.value_en) || fallback;
}

/** Just the boolean settings, for passing to the client context. */
export function extractSettings(map: ContentMap): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const r of Object.values(map)) {
    if (r.type === 'toggle') out[r.key] = (r.value_en ?? 'true') !== 'false';
  }
  return out;
}
