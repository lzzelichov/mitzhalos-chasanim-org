// Import via deep paths to avoid @hebcal/core's barrel, which pulls in
// @hebcal/noaa (top-level await). That async module breaks client-component
// bundles, so we keep it out entirely — we only need dates + holidays here.
import { HDate } from '@hebcal/hdate';
import { getHolidaysOnDate } from '@hebcal/core/dist/esm/holidays';
import { flags } from '@hebcal/core/dist/esm/event';
import { getSedra } from '@hebcal/core/dist/esm/sedra';
import { renderParshaName } from '@hebcal/core/dist/esm/parshaName';
import { toISODate, formatDateLabel } from './utils';

// Diaspora schedule: separate Shmini Atzeres/Simchas Torah + diaspora parsha.
const IL = false;

/** Only these religious holidays are shown — Israeli civic/state days excluded. */
const RELIGIOUS_HOLIDAYS_ONLY = [
  'Rosh Hashana',
  'Yom Kippur',
  'Sukkot',
  'Shmini Atzeret',
  'Simchat Torah',
  'Chanukah',
  'Tu BiShvat',
  'Purim',
  'Pesach',
  'Lag BaOmer',
  'Shavuot',
  "Tish'a B'Av",
  'Rosh Chodesh',
];
// Substring matches that look like an approved holiday but are minor technical
// observances we don't want cluttering the calendar (e.g. "Yom Kippur Katan",
// "Purim Katan", "Rosh Hashana LaBehemot").
const HOLIDAY_EXCLUDE = ['Katan', 'LaBehemot'];
function isReligiousHoliday(desc: string): boolean {
  if (HOLIDAY_EXCLUDE.some((x) => desc.includes(x))) return false;
  return RELIGIOUS_HOLIDAYS_ONLY.some((h) => desc.includes(h));
}

/** Remove Hebrew niqqud / cantillation marks for cleaner display. */
export function stripNikud(s: string): string {
  return s.replace(/[֑-ׇ]/g, '').trim();
}

export interface HebrewDateInfo {
  short: string; // "ט״ו חשון"           (day + month, gematriya)
  full: string; // "ט״ו חשון תשפ״ה"      (day + month + year)
  monthYear: string; // "חשון תשפ״ה"
  enShort: string; // "15th of Cheshvan"
  enFull: string; // "15th of Cheshvan, 5785"
}

export function hebrewInfo(date: Date): HebrewDateInfo {
  const hd = new HDate(date);
  const full = stripNikud(hd.renderGematriya(true, false)); // no nikud, with year
  const short = stripNikud(hd.renderGematriya(true, true)); // no nikud, no year
  const parts = full.split(' ');
  const monthYear = parts.length >= 3 ? `${parts[1]} ${parts.slice(2).join(' ')}` : full;
  return {
    short,
    full,
    monthYear,
    enShort: hd.render('en', false),
    enFull: hd.render('en'),
  };
}

/** Convenience: the Hebrew "full" date string for a YYYY-MM-DD slug. */
export function hebrewFull(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return hebrewInfo(d).full;
}

/**
 * Single-language date: Hebrew calendar for the 'he' locale, Gregorian for 'en'.
 * Never shows both — used everywhere a date is displayed publicly.
 */
export function localeDate(iso: string, locale: string): string {
  return locale === 'he' ? hebrewFull(iso) : formatDateLabel(iso, locale);
}

export interface DayHoliday {
  he: string;
  en: string;
  isYomTov: boolean;
}

export function dayHolidays(date: Date): DayHoliday[] {
  const evs = getHolidaysOnDate(new HDate(date), IL) ?? [];
  return evs
    .filter((ev) => isReligiousHoliday(ev.getDesc()))
    .map((ev) => ({
      he: stripNikud(ev.render('he')),
      en: ev.render('en'),
      isYomTov: (ev.getFlags() & flags.CHAG) !== 0,
    }));
}

export function isShabbat(date: Date): boolean {
  return date.getDay() === 6;
}

/** Ashkenaz/Yiddish-preferred spellings (plene where the masoretic text is defective). */
const ASHKENAZ_SPELLING: Record<string, string> = {
  בהעלתך: 'בהעלותך',
};

/** Hebrew parsha name for a Shabbat date; null on weekdays or holiday readings.
 *  Returns just the name ("בהעלותך", "שלח לך", "חקת בלק") — the "פ׳" prefix is
 *  added at the display layer. */
export function parshaHe(date: Date): string | null {
  if (date.getDay() !== 6) return null;
  try {
    const hd = new HDate(date);
    const res = getSedra(hd.getFullYear(), IL).lookup(hd);
    if (res.chag) return null;
    // Maqaf (־) separates compound names (שלח־לך, חקת־בלק) — turn it into a space
    // BEFORE stripNikud, which would otherwise delete it along with the nikud.
    let name = renderParshaName(res.parsha, 'he').replace(/־/g, ' ');
    name = stripNikud(name) // remove nikud/te'amim first, so the prefix is bare letters
      .replace(/^פרשת\s+/, '') // then drop the leading "פרשת"
      .replace(/\s+/g, ' ')
      .trim();
    return ASHKENAZ_SPELLING[name] ?? name;
  } catch {
    return null;
  }
}

export interface MonthDay {
  iso: string;
  gregDay: number;
  hebrew: HebrewDateInfo;
  isShabbat: boolean;
  /** A holiday label to show (Yom Tov preferred), or null. */
  holiday: DayHoliday | null;
  isYomTov: boolean;
  /** Hebrew parsha name on Shabbos, else null. */
  parsha: string | null;
}

/** All days of a Gregorian month with their Hebrew/holiday metadata. */
export function buildMonth(year: number, monthIndex0: number): MonthDay[] {
  const days: MonthDay[] = [];
  const cur = new Date(year, monthIndex0, 1);
  while (cur.getMonth() === monthIndex0) {
    const hols = dayHolidays(cur);
    const label = hols.find((h) => h.isYomTov) ?? hols[0] ?? null;
    days.push({
      iso: toISODate(cur),
      gregDay: cur.getDate(),
      hebrew: hebrewInfo(cur),
      isShabbat: isShabbat(cur),
      holiday: label,
      isYomTov: hols.some((h) => h.isYomTov),
      parsha: parshaHe(cur),
    });
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

/** "June 2025" localized. */
export function gregMonthLabel(year: number, monthIndex0: number, locale: string): string {
  const d = new Date(year, monthIndex0, 1);
  try {
    return d.toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return `${year}-${monthIndex0 + 1}`;
  }
}

/** Representative Hebrew month + year, e.g. "סיון תשפ״ה" (from the 15th). */
export function hebrewMonthLabel(year: number, monthIndex0: number): string {
  return hebrewInfo(new Date(year, monthIndex0, 15)).monthYear;
}

/** Day-of-week index where the 1st of the month falls (0 = Sunday). */
export function firstWeekday(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0, 1).getDay();
}

// ── Hebrew-date search parsing ───────────────────────────────────────────────
const GEMATRIA: Record<string, number> = {
  א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9,
  י: 10, כ: 20, ל: 30, מ: 40, נ: 50, ס: 60, ע: 70, פ: 80, צ: 90,
  ק: 100, ר: 200, ש: 300, ת: 400, ך: 20, ם: 40, ן: 50, ף: 80, ץ: 90,
};
/** Sum Hebrew letters as gematriya ("כב"→22, "טו"→15); non-letters ignored. */
export function gematriyaToNum(s: string): number {
  let n = 0;
  for (const ch of s) n += GEMATRIA[ch] ?? 0;
  return n;
}

// Hebrew month name → hebcal month number (Nisan=1 … Adar I=12, Adar II=13).
const HEB_MONTHS: Record<string, number> = {
  ניסן: 1, אייר: 2, איר: 2, סיון: 3, סיוון: 3, תמוז: 4, אב: 5, אלול: 6,
  תשרי: 7, חשון: 8, חשוון: 8, מרחשון: 8, מרחשוון: 8, כסלו: 9, כסליו: 9,
  טבת: 10, שבט: 11, אדר: 12, אדרא: 12, אדרב: 13,
};

/** Parse a free-form Hebrew date ("כ״ב סיון", "כב סיון", "סיון כב", "22 סיון"). */
export function parseHebrewDateInput(input: string): { day: number; month: number } | null {
  if (!input) return null;
  let cleaned = input.replace(/[׳״'"]/g, ''); // strip geresh/gershayim/quotes (they sit inside gematriya)
  cleaned = cleaned.replace(/־/g, ' '); // maqaf → space
  cleaned = stripNikud(cleaned).replace(/\s+/g, ' ').trim();
  if (!cleaned) return null;

  let day: number | null = null;
  let month: number | null = null;
  for (const tok of cleaned.split(' ')) {
    if (month == null && HEB_MONTHS[tok] != null) { month = HEB_MONTHS[tok]; continue; }
    if (day == null && /^\d+$/.test(tok)) { day = parseInt(tok, 10); continue; }
    if (day == null) {
      const g = gematriyaToNum(tok);
      if (g > 0 && g <= 30) day = g;
    }
  }
  // Multi-word month spellings ("מר חשון", "אדר א") — retry on the joined string.
  if (month == null) month = HEB_MONTHS[cleaned.replace(/\s+/g, '')] ?? null;

  if (day == null || month == null || day < 1 || day > 30) return null;
  return { day, month };
}

/** Resolve a Hebrew day+month to a Gregorian ISO date — preferring a date already
 *  on the calendar (e.g. a wedding), else the upcoming occurrence (this Hebrew
 *  year, or next if it already passed). Returns null if the date is invalid. */
export function hebrewDateToIso(day: number, month: number, preferIsos: string[] = []): string | null {
  for (const iso of preferIsos) {
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) continue;
    const hd = new HDate(d);
    if (hd.getDate() === day && hd.getMonth() === month) return iso;
  }
  try {
    const todayMid = new Date();
    todayMid.setHours(0, 0, 0, 0);
    const y0 = new HDate(todayMid).getFullYear();
    let hd = new HDate(day, month, y0);
    if (hd.greg() < todayMid) hd = new HDate(day, month, y0 + 1);
    return toISODate(hd.greg());
  } catch {
    return null;
  }
}
