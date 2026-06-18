// Import via deep paths to avoid @hebcal/core's barrel, which pulls in
// @hebcal/noaa (top-level await). That async module breaks client-component
// bundles, so we keep it out entirely — we only need dates + holidays here.
import { HDate } from '@hebcal/hdate';
import { getHolidaysOnDate } from '@hebcal/core/dist/esm/holidays';
import { flags } from '@hebcal/core/dist/esm/event';
import { toISODate } from './utils';

// Israel holiday schedule (the site is Jerusalem-focused).
const IL = true;

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

export interface DayHoliday {
  he: string;
  en: string;
  isYomTov: boolean;
}

export function dayHolidays(date: Date): DayHoliday[] {
  const evs = getHolidaysOnDate(new HDate(date), IL) ?? [];
  return evs.map((ev) => ({
    he: stripNikud(ev.render('he')),
    en: ev.render('en'),
    isYomTov: (ev.getFlags() & flags.CHAG) !== 0,
  }));
}

export function isShabbat(date: Date): boolean {
  return date.getDay() === 6;
}

export interface MonthDay {
  iso: string;
  gregDay: number;
  hebrew: HebrewDateInfo;
  isShabbat: boolean;
  /** A holiday label to show (Yom Tov preferred), or null. */
  holiday: DayHoliday | null;
  isYomTov: boolean;
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
